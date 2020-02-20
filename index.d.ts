import { AsyncSeriesWaterfallHook } from 'tapable'

interface Hooks {
  /** 执行合并操作前 */
  beforeConcat: AsyncSeriesWaterfallHook<{
    src: string,
    dist: string,
    source: Buffer
  }>
  /** 执行合并操作后 */
  afterConcat: AsyncSeriesWaterfallHook<{
    srcs: string[],
    dist: string,
    source: Buffer
  }>
}

declare class YylConcatWebpackPlugin {
  constructor(op: YylConcatWebpackPluginOption)
  /** 获取钩子 */
  static getHooks(compilation: any): Hooks
  /** 获取组件名称 */
  static getName(): string
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
}
export = YylConcatWebpackPlugin