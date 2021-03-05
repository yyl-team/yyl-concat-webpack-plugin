import path from 'path'
import util from 'yyl-util'
import fs from 'fs'
import Concat from 'concat-with-sourcemaps'
import * as Terser from 'terser'
import chalk from 'chalk'
import { Compilation, Compiler } from 'webpack'
import {
  AssetsInfo,
  YylWebpackPluginBaseOption,
  YylWebpackPluginBase
} from 'yyl-webpack-plugin-base'
import { LANG } from './lang'
import { getHooks } from './hooks'

const PLUGIN_NAME = 'yylConcat'

export type FileInfo = Required<AssetsInfo>
interface YylConcatWebpackPluginOption
  extends Pick<YylWebpackPluginBaseOption, 'context' | 'filename'> {
  /** 文件映射 {[dist: string] : string[]} */
  fileMap: { [target: string]: string[] }
  /** 是否压缩, 默认 false */
  minify?: boolean
  /** 日志输出的文件路径相对地址: 默认为 process.cwd() */
  logContext?: string
  /** 压缩是否支持 ie8 */
  ie8?: boolean
}

export default class YylConcatWebpackPlugin extends YylWebpackPluginBase {
  /** hooks 用 获取组件hooks */
  static getHooks(compilation: Compilation) {
    return getHooks(compilation)
  }

  /** hooks 用 获取组件名字 */
  static getName() {
    return PLUGIN_NAME
  }

  /** 配置 */
  option: Required<YylConcatWebpackPluginOption> = {
    fileMap: {},
    filename: '[name]-[hash:8].[ext]',
    context: process.cwd(),
    minify: false,
    ie8: false,
    logContext: process.cwd()
  }

  constructor(option?: YylConcatWebpackPluginOption) {
    super({
      ...option,
      name: PLUGIN_NAME
    })

    if (option?.minify !== undefined) {
      this.option.minify = option.minify
    }

    if (option?.context) {
      if (!option.logContext) {
        this.option.logContext = option.context
      }
    }

    if (option?.fileMap) {
      const iFileMap: YylConcatWebpackPluginOption['fileMap'] = {}
      Object.keys(option.fileMap).forEach((key) => {
        iFileMap[path.resolve(this.option.context, key)] = option.fileMap[key].map((iPath) =>
          path.resolve(this.option.context, iPath)
        )
      })
      this.option.fileMap = iFileMap
    }

    if (option?.ie8 !== undefined) {
      this.option.ie8 = option.ie8
    }

    if (option?.logContext) {
      this.option.logContext = option.logContext
    }
  }

  async apply(compiler: Compiler) {
    const { output, context } = compiler.options
    const { fileMap, minify, logContext, ie8 } = this.option

    if (!fileMap || !Object.keys(fileMap).length) {
      return
    }

    const { compilation, done } = await this.initCompilation(compiler)
    const logger = compilation.getLogger(PLUGIN_NAME)
    logger.group(PLUGIN_NAME)

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
        rMap[path.resolve(context, key)] = fileMap[key].map((iPath) => path.resolve(context, iPath))
      } else if (this.option.context) {
        rMap[path.resolve(this.option.context, key)] = fileMap[key].map((iPath) =>
          path.resolve(this.option.context, iPath)
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

        if (this.assetMap[assetKey]) {
          fileInfo.src = path.resolve(output.path || '', this.assetMap[assetKey])
          fileInfo.source = Buffer.from(
            compilation.assets[this.assetMap[assetKey]].source().toString(),
            'utf-8'
          )
        } else if (fs.existsSync(srcPath)) {
          fileInfo.src = srcPath
          fileInfo.source = fs.readFileSync(srcPath)
        } else {
          const finalName = this.getFileName(assetName, Buffer.from(''))
          const srcs = rMap[targetPath]
          logger.warn(
            `${chalk.cyan(finalName)} ${chalk.yellow('<x')} [${srcs
              .map((iPath) => chalk.green(path.relative(logContext, iPath)))
              .join(', ')}]`
          )
          logger.warn(`-> ${LANG.PATH_NOT_EXITS}: ${srcPath}`)
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
      this.addDependencies({
        compilation,
        srcs: afterOption.srcs
      })

      logger.info(
        `${chalk.cyan(finalName)} <- [${srcs
          .map((iPath) => chalk.green(path.relative(logContext, iPath)))
          .join(', ')}]`
      )
      this.updateAssets({
        compilation,
        assetsInfo: {
          src: assetName,
          dist: finalName,
          source: afterOption.source
        }
      })
    })

    // - concat
    logger.groupEnd()
    done()
  }
}

module.exports = YylConcatWebpackPlugin
