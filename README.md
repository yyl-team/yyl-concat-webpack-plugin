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

## ts
[./index.d.ts](./index.d.ts)
