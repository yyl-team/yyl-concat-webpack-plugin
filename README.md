# yyl-concat-webpack-plugin

## USAGE
```javascript
const YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin')

const wConfig = {
  plugins: [
    new YylConcatWebpackPlugin({
      fileMap: {
        'dist/assets/js/vendors.js': [
          'src/js/a.js',
          'src/js/b.js'
        ]
      },
      uglify: false,
      fileName: '[name]-[hash:8].[ext]'
    })
  ]
}
```

## hooks
```javascript
let YylConcatWebpackPlugin
try {
  YylConcatWebpackPlugin = require('yyl-concat-webpack-plugin')
} catch (er) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
}

const PLUGIN_NAME = 'your_plugin'
class ExtPlugin {
  apply (compiler) {
    if (YylConcatWebpackPlugin) {
      compiler.hooks.compilation.tap(IPlugin.getName(), (compilation) => {
        IPlugin.getHooks(compilation).beforeConcat.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.beforeConcat(obj, done)', 'obj:', obj)
          done(null, obj.resource)
        })
        IPlugin.getHooks(compilation).afterConcat.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.afterConcat(obj, done)', 'obj:', obj)
          done(null, obj.resource)
        })
      })
    }
  }
}
```

## ts
[./index.d.ts](./index.d.ts)
