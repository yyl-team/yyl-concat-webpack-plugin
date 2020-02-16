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
  fileMap: { [target: string]: string[] }
  fileName?: string
  uglify?: boolean
  basePath?: string
}
export = YylConcatWebpackPlugin