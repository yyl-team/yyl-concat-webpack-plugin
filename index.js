const path = require('path')
const util = require('yyl-util')
const Concat = require('concat-with-sourcemaps')
const fs = require('fs')
const createHash = require('crypto').createHash
const UglifyJS = require('uglify-es')
const { SyncHook } = require('tapable')

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
    this.createHooks()
  }
  formatSource (cnt, op) {
    const { uglify } = this

    const r = this.hooks.beforeRun.call(op.from, op.to, cnt)
    console.log('hook.call result', r)
    if (!uglify) {
      return cnt
    }
    const ext = path.extname(op.from)
    if (ext === '.js') {
      const result = UglifyJS.minify(cnt)
      if (result.error) {
        printError(result.error)
      } else {
        return Promise.resolve(result.code)
      }
    } else {
      return Promise.resolve(cnt)
    }
  }
  createHooks() {
    this.hooks = {
      beforeRun: new SyncHook(['args'])
    }
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

            if (assetMap[assetKey]) {
              iConcat.add(
                assetMap[assetKey],
                await this.formatSource(
                  compilation.assets[assetMap[assetKey]].source(),
                  {
                    from: srcPath,
                    to: targetPath
                  }
                )
              )
            } else if (fs.existsSync(srcPath)) {
              iConcat.add(
                srcPath,
                await this.formatSource(
                  fs.readFileSync(srcPath).toString(),
                  {
                    from: srcPath,
                    to: targetPath
                  }
                )
              )
            } else {
              printError(`path not exists: ${srcPath}`)
            }
          })
          const finalName = this.getFileName(assetName, iConcat.content)

          compilation.assets[finalName] = {
            source() {
              return iConcat.content
            },
            size() {
              return iConcat.content.length
            }
          }
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