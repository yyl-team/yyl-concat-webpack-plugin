declare class YylConcatWebpackPlugin {
  constructor(op: YylConcatWebpackPluginOptions)
}
interface YylConcatWebpackPluginOptions {
  fileMap: { [target: string]: string[]},
  fileName: string,
  uglify: boolean
}
export = YylConcatWebpackPlugin