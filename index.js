const path = require('path')
const util = require('yyl-util')
const Concat = require('concat-with-sourcemaps')
const fs = require('fs')
const createHash = require('crypto').createHash
const UglifyJS = require('uglify-es')

const { getHooks } = require('./lib/hooks')


const PLUGIN_NAME = 'yylConcat'

const printError = function(msg) {
  throw `yyl-concat-webpack-plugin error: ${msg}`
}

class YylConcatWebpackPlugin {
  constructor(op) {
    this.option = Object.assign({
      fileMap: {},
      fileName: '[name]-[hash:8].[ext]',
      uglify: false
    }, op)
  }
  static getName() {
    return PLUGIN_NAME
  }
  static getHooks(compilation) {
    return getHooks(compilation)
  }
  getFileType(str) {
    str = str.replace(/\?.*/, '')
    const split = str.split('.')
    let ext = split[split.length - 1]
    if (ext === 'map' && split.length > 2) {
      ext = `${split[split.length - 2]}.${split[split.length - 1]}`
    }
    return ext
  }
  getFileName(name, cnt) {
    const { fileName } = this.option

    const REG_HASH = /\[hash:(\d+)\]/g
    const REG_NAME = /\[name\]/g
    const REG_EXT = /\[ext\]/g

    const dirname = path.dirname(name)
    const basename = path.basename(name)
    const ext = path.extname(basename).replace(/^\./, '')
    const iName = basename.slice(0, basename.length - (ext.length > 0 ? ext.length + 1 : 0))

    let hash = ''
    if (fileName.match(REG_HASH)) {
      let hashLen = 0
      fileName.replace(REG_HASH, (str, $1) => {
        hashLen = +$1
        hash = createHash('md5').update(cnt.toString()).digest('hex').slice(0, hashLen)
      })
    }
    const r = fileName
      .replace(REG_HASH, hash)
      .replace(REG_NAME, iName)
      .replace(REG_EXT, ext)

    return util.path.join(dirname, r)
  }
  apply(compiler) {
    const { output, context } = compiler.options
    const { fileMap, uglify } = this.option

    const moduleAssets = {}


    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.moduleAsset.tap(PLUGIN_NAME, (module, file) => {
        if (module.userRequest) {
          moduleAssets[file] = path.join(path.dirname(file), path.basename(module.userRequest))
        }
      })
    })

    compiler.hooks.emit.tapAsync(
      PLUGIN_NAME,
      async (compilation, done) => {
        // + init assetMap
        const assetMap = {}
        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((fName) => {
            if (chunk.name) {
              const key = `${util.path.join(path.dirname(fName), chunk.name)}.${this.getFileType(fName)}`
              assetMap[key] = fName
            } else {
              assetMap[fName] = fName
            }
          })
        })

        const stats = compilation.getStats().toJson({
          all: false,
          assets: true,
          cachedAssets: true
        })
        stats.assets.forEach((asset) => {
          const name = moduleAssets[asset.name]
          if (name) {
            assetMap[util.path.join(name)] = asset.name
          }
        })
        // - init assetMap

        // + concat
        const iHooks = getHooks(compilation)

        const formatSource = function (cnt, ext) {
          if (!uglify) {
            return cnt
          }
          if (ext === '.js') {
            const result = UglifyJS.minify(cnt.toString())
            if (result.error) {
              printError(result.error)
            } else {
              return result.code
            }
          } else {
            return cnt
          }
        }
        // fileMap 格式化
        const rMap = {}
        Object.keys(fileMap).forEach((key) => {
          rMap[path.resolve(context, key)] = fileMap[key].map((iPath) => {
            return path.resolve(context, iPath)
          })
        })


        await util.forEach(Object.keys(rMap), async (targetPath) => {
          const assetName = util.path.relative(output.path, targetPath)
          const iConcat = new Concat(true, targetPath, '\n')
          await util.forEach(rMap[targetPath], async (srcPath) => {
            const assetKey = util.path.relative(output.path, srcPath)

            if (path.extname(assetKey) == '.js') {
              iConcat.add(null, `;/* ${path.basename(assetKey)} */`)
            } else {
              iConcat.add(null, `/* ${path.basename(assetKey)} */`)
            }

            let fileInfo = {
              src: '',
              target: targetPath,
              source: ''
            }

            if (assetMap[assetKey]) {
              fileInfo.src = path.resolve(output.path, assetMap[assetKey])
              fileInfo.source = Buffer.from(compilation.assets[assetMap[assetKey]].source(), 'utf-8')
            } else if (fs.existsSync(srcPath)) {
              fileInfo.src = srcPath
              fileInfo.source = fs.readFileSync(srcPath)
            } else {
              return printError(`path not exists: ${srcPath}`)
            }

            // + hooks.beforeConcat
            fileInfo = await iHooks.beforeConcat.promise(
              fileInfo
            )
            // - hooks.beforeConcat
            iConcat.add(
              fileInfo.src,
              formatSource(fileInfo.source, path.extname(fileInfo.src))
            )
          })
          const finalName = this.getFileName(assetName, iConcat.content)


          // + hooks.afterConcat
          let afterOption = {
            dist: targetPath,
            srcs: rMap[targetPath],
            source: iConcat.content
          }

          afterOption = await iHooks.afterConcat.promise(afterOption)

          compilation.assets[finalName] = {
            source() {
              return afterOption.source
            },
            size() {
              return afterOption.source.length
            }
          }
          // - hooks.afterConcat

          compilation.hooks.moduleAsset.call({
            userRequest: util.path.join(output.path, assetName)
          }, util.path.join(output.path, finalName))
        })
        // - concat
        done()
      }
    )
  }
}

module.exports = YylConcatWebpackPlugin