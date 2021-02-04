yyl-concat-webpack-plugin / [Exports](modules.md)

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

[文档](./docs/modules.md)
