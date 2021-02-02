import path from 'path'
import util from 'yyl-util'
import fs from 'fs'
import Concat from 'concat-with-sourcemaps'
import { createHash } from 'crypto'
import * as Terser from 'terser'
import chalk from 'chalk'
import { Compilation, Compiler } from 'webpack'
import { LANG } from './lang'
import { getHooks } from './hooks'

const PLUGIN_NAME = 'yylConcat'

const printError = function (err: Error) {
  throw new Error(`yyl-concat-webpack-plugin error:', ${err.message}`)
}

export interface ModuleAssets {
  [key: string]: string
}

export interface FileInfo {
  src: string
  dist: string
  source: Buffer
}

interface YylConcatWebpackPluginOption {
  /** 文件映射 {[dist: string] : string[]} */
  fileMap: { [target: string]: string[] }
  /** 生成的文件名, 默认为 [name]-[hash:8].[ext] */
  filename?: string
  /** 是否压缩, 默认 false */
  minify?: boolean
  /** 当设置 basePath后， fileMap 会进行一次 path.resolve 处理 */
  basePath?: string
  /** 日志输出的文件路径相对地址: 默认为 process.cwd() */
  logBasePath?: string
  /** 压缩是否支持 ie8 */
  ie8?: boolean
}

export default class YylConcatWebpackPlugin {
  static getHooks(compilation: Compilation) {
    return getHooks(compilation)
  }

  static getName() {
    return PLUGIN_NAME
  }

  option: Required<YylConcatWebpackPluginOption> = {
    fileMap: {},
    filename: '[name]-[hash:8].[ext]',
    basePath: process.cwd(),
    minify: false,
    ie8: false,
    logBasePath: process.cwd()
  }

  constructor(option?: YylConcatWebpackPluginOption) {
    if (option?.minify !== undefined) {
      this.option.minify = option.minify
    }

    if (option?.basePath) {
      this.option.basePath = option.basePath
      if (!option.logBasePath) {
        this.option.logBasePath = option.basePath
      }
    }

    if (option?.fileMap) {
      const iFileMap: YylConcatWebpackPluginOption['fileMap'] = {}
      Object.keys(option.fileMap).forEach((key) => {
        iFileMap[path.resolve(this.option.basePath, key)] = option.fileMap[key].map((iPath) =>
          path.resolve(this.option.basePath, iPath)
        )
      })
      this.option.fileMap = iFileMap
    }

    if (option?.ie8 !== undefined) {
      this.option.ie8 = option.ie8
    }

    if (option?.logBasePath) {
      this.option.logBasePath = option.logBasePath
    }
  }

  getFileType(str: string) {
    const iStr = str.replace(/\?.*/, '')
    const split = str.split('.')
    let ext = split[split.length - 1]
    if (ext === 'map' && split.length > 2) {
      ext = `${split[split.length - 2]}.${split[split.length - 1]}`
    }

    return ext
  }

  getFileName(name: string, cnt: Buffer) {
    const { filename } = this.option
    const REG_HASH = /\[hash:(\d+)\]/g
    const REG_NAME = /\[name\]/g
    const REG_EXT = /\[ext\]/g

    const dirname = path.dirname(name)
    const basename = path.basename(name)
    const ext = path.extname(basename).replace(/^\./, '')
    const iName = basename.slice(0, basename.length - (ext.length > 0 ? ext.length + 1 : 0))

    let hash = ''
    if (filename.match(REG_HASH)) {
      let hashLen = 0
      filename.replace(REG_HASH, (str, $1) => {
        hashLen = +$1
        hash = createHash('md5').update(cnt.toString()).digest('hex').slice(0, hashLen)
        return str
      })
    }
    const r = filename.replace(REG_HASH, hash).replace(REG_NAME, iName).replace(REG_EXT, ext)

    return util.path.join(dirname, r)
  }

  apply(compiler: Compiler) {
    const { output, context } = compiler.options
    const { fileMap, minify, logBasePath, ie8 } = this.option

    if (!fileMap || !Object.keys(fileMap).length) {
      return
    }

    const moduleAssets: ModuleAssets = {}

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.moduleAsset.tap(PLUGIN_NAME, (module: any, file) => {
        if (module.userRequest) {
          moduleAssets[file] = path.join(path.dirname(file), path.basename(module.userRequest))
        }
      })
    })

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, done) => {
      const logger = compilation.getLogger(PLUGIN_NAME)

      logger.group(PLUGIN_NAME)
      // + init assetMap
      const assetMap: ModuleAssets = {}
      compilation.chunks.forEach((chunk) => {
        chunk.files.forEach((fName) => {
          if (/hot-update/.test(fName)) {
            return
          }
          if (chunk.name) {
            const key = `${util.path.join(path.dirname(fName), chunk.name)}.${this.getFileType(
              fName
            )}`
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
      stats.assets.forEach((asset: any) => {
        const name = moduleAssets[asset.name]
        if (name) {
          assetMap[util.path.join(name)] = asset.name
        }
      })
      // - init assetMap

      // + concat
      const iHooks = getHooks(compilation)

      const formatSource = async function (cnt: Buffer, ext: string): Promise<string> {
        if (!minify) {
          return cnt.toString()
        }
        if (ext === '.js') {
          try {
            const result = await Terser.minify(cnt.toString(), {
              ie8
            })
            return result.code || ''
          } catch (er) {
            logger.error(LANG.UGLIFY_ERROR, er)
          }
          return cnt.toString()
        } else {
          return cnt.toString()
        }
      }
      // fileMap 格式化
      const rMap: YylConcatWebpackPluginOption['fileMap'] = {}
      Object.keys(fileMap).forEach((key) => {
        if (context) {
          rMap[path.resolve(context, key)] = fileMap[key].map((iPath) =>
            path.resolve(context, iPath)
          )
        } else if (this.option.basePath) {
          rMap[path.resolve(this.option.basePath, key)] = fileMap[key].map((iPath) =>
            path.resolve(this.option.basePath, iPath)
          )
        }
      })

      const rMapKeys = Object.keys(rMap)

      if (rMapKeys.length) {
        logger.info(`${LANG.MINIFY_INFO}: ${minify || 'false'}`)
        logger.info(`${LANG.IE8_INFO}: ${ie8 || 'false'}`)
        logger.info(`${LANG.BUILD_CONCAT}:`)
      } else {
        logger.info(LANG.NO_CONCAT)
      }
      await util.forEach(rMapKeys, async (targetPath) => {
        const assetName = util.path.relative(output.path || '', targetPath)
        const iConcat = new Concat(true, targetPath, '\n')
        const srcs: string[] = []
        await util.forEach(rMap[targetPath], async (srcPath) => {
          const assetKey = util.path.relative(output.path || '', srcPath)

          if (path.extname(assetKey) === '.js') {
            iConcat.add(null, `;/* ${path.basename(assetKey)} */`)
          } else {
            iConcat.add(null, `/* ${path.basename(assetKey)} */`)
          }

          let fileInfo: FileInfo = {
            src: '',
            dist: targetPath,
            source: Buffer.from('')
          }

          if (assetMap[assetKey]) {
            fileInfo.src = path.resolve(output.path || '', assetMap[assetKey])
            fileInfo.source = Buffer.from(
              compilation.assets[assetMap[assetKey]].source().toString(),
              'utf-8'
            )
          } else if (fs.existsSync(srcPath)) {
            fileInfo.src = srcPath
            fileInfo.source = fs.readFileSync(srcPath)
          } else {
            logger.warn(`${LANG.PATH_NOT_EXITS}: ${srcPath}`)
            return
          }

          // + hooks.beforeConcat
          fileInfo = await iHooks.beforeConcat.promise(fileInfo)
          // - hooks.beforeConcat
          iConcat.add(fileInfo.src, await formatSource(fileInfo.source, path.extname(fileInfo.src)))
          srcs.push(fileInfo.src)
        })
        const finalName = this.getFileName(assetName, iConcat.content)

        // + hooks.afterConcat
        let afterOption = {
          dist: targetPath,
          srcs: rMap[targetPath],
          source: iConcat.content
        }

        afterOption = await iHooks.afterConcat.promise(afterOption)
        // - hooks.afterConcat

        // 添加 watch
        afterOption.srcs.forEach((srcPath) => {
          compilation.fileDependencies.add(srcPath)
        })

        logger.info(
          `${chalk.cyan(finalName)} <- [${srcs
            .map((iPath) => chalk.green(path.relative(logBasePath, iPath)))
            .join(', ')}]`
        )
        compilation.assets[finalName] = {
          source() {
            return afterOption.source
          },
          size() {
            return afterOption.source.length
          }
        } as any

        compilation.hooks.moduleAsset.call(
          {
            userRequest: assetName
          } as any,
          finalName
        )
      })
      // - concat
      logger.groupEnd()
      done()
    })
  }
}

module.exports = YylConcatWebpackPlugin
