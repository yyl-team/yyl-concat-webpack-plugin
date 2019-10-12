declare class YylConcatWebpackPlugin {
  constructor(op: YylConcatWebpackPluginOptions)
}
interface YylConcatWebpackPluginOptions {
  fileMap: { [target: string]: string[]},
  alias: { [key: string]: string}
}
export = YylConcatWebpackPlugin