import { AsyncSeriesWaterfallHook } from 'tapable'

interface Hooks {
  beforeConcat: AsyncSeriesWaterfallHook<{
    src: string,
    dist: string,
    source: Buffer
  }>
  afterConcat: AsyncSeriesWaterfallHook<{
    srcs: string[],
    dist: string,
    source: Buffer
  }>
}

declare class YylConcatWebpackPlugin {
  constructor(op: YylConcatWebpackPluginOptions)
  static getHooks(compilation: any): Hooks
}



interface YylConcatWebpackPluginOptions {
  fileMap: { [target: string]: string[]},
  fileName: string,
  uglify: boolean
}
export = YylConcatWebpackPlugin