# yyl-concat-webpack-plugin

## USAGE

### plugin

```javascript
const YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin')

const wConfig = {
  plugins: [
    new YylConcatWebpackPlugin({
      fileMap: {
        'dist/assets/js/vendors.js': ['src/js/a.js', 'src/js/b.js']
      },
      uglify: false,
      logBasePath: process.cwd(),
      fileName: '[name]-[hash:8].[ext]'
    })
  ]
}
```

### hooks

#### example

```javascript
let YylCopyWebpackPlugin
try {
  YylCopyWebpackPlugin = require('yyl-copy-webpack-plugin')
} catch (er) {
  if (!(er instanceof Error) || er.code !== 'MODULE_NOT_FOUND') {
    printError(er)
  }
}
class YourPlugin {
  render(src, source) {
    return source
  }
  apply(compiler) {
    if (YylCopyWebpackPlugin) {
      compiler.hooks.compilation.tap(YylCopyWebpackPlugin.getName(), (compilation) => {
        // + beforeCopy
        YylCopyWebpackPlugin.getHooks(compilation).beforeCopy.tapAsync(PLUGIN_NAME, (obj, done) => {
          obj.source = this.render({
            src: obj.src,
            source: obj.source
          })
          done(null, obj)
        })
        // - beforeCopy

        //+ afterCopy
        YylCopyWebpackPlugin.getHooks(compilation).afterCopy.tapAsync(PLUGIN_NAME, (obj, done) => {
          obj.source = this.render({
            src: obj.src,
            source: obj.source
          })
          done(null, obj)
        })
        //- afterCopy
      })
    }
  }
}
```

## hooks

```javascript
let YylConcatWebpackPlugin
try {
  YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
}

const PLUGIN_NAME = 'your_plugin'
class ExtPlugin {
  apply(compiler) {
    const IPlugin = YylConcatWebpackPlugin
    if (IPlugin) {
      compiler.hooks.compilation.tap(IPlugin.getName(), (compilation) => {
        IPlugin.getHooks(compilation).beforeConcat.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.beforeConcat(obj, done)', 'obj:', obj)
          done(null, obj)
        })
        IPlugin.getHooks(compilation).afterConcat.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.afterConcat(obj, done)', 'obj:', obj)
          done(null, obj)
        })
      })
    }
  }
}
```

## ts

```typescript
import { Compilation, Compiler } from 'webpack'
import {
  AssetsInfo,
  YylWebpackPluginBaseOption,
  YylWebpackPluginBase
} from 'yyl-webpack-plugin-base'
export declare type FileInfo = Required<AssetsInfo>
interface YylConcatWebpackPluginOption
  extends Pick<YylWebpackPluginBaseOption, 'context' | 'filename'> {
  /** 文件映射 {[dist: string] : string[]} */
  fileMap: {
    [target: string]: string[]
  }
  /** 是否压缩, 默认 false */
  minify?: boolean
  /** 日志输出的文件路径相对地址: 默认为 process.cwd() */
  logContext?: string
  /** 压缩是否支持 ie8 */
  ie8?: boolean
}
export default class YylConcatWebpackPlugin extends YylWebpackPluginBase {
  /** hooks 用 获取组件hooks */
  static getHooks(compilation: Compilation): any
  /** hooks 用 获取组件名字 */
  static getName(): string
  /** 配置 */
  option: Required<YylConcatWebpackPluginOption>
  constructor(option?: YylConcatWebpackPluginOption)
  apply(compiler: Compiler): Promise<void>
}
export {}
```
