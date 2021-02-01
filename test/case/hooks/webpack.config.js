'use strict'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const extOs = require('yyl-os')
const IPlugin = require('../../../')
const ExtPlugin = require('./ext-plugin')

console.log(IPlugin)

// + plugin options
const iPluginOption = {
  fileMap: {
    './dist/js/ab.js': ['./src/js/a.js', './src/js/b.js'],
    './dist/js/ac.js': ['./src/js/a.js', './src/js/c.js'],
    './dist/js/abindex.js': ['./src/js/a.js', './src/js/b.js', './dist/js/index.js'],
    './dist/css/ab.css': ['./src/css/a.css', './src/css/b.css'],
    './dist/css/abindex.css': ['./src/css/a.css', './src/css/b.css', './dist/css/index.css']
  },
  minify: true,
  logBasePath: __dirname,
  basePath: __dirname
}
// - plugin options

const wConfig = {
  mode: 'development',
  context: __dirname,
  entry: {
    main: ['./src/entry/index/index.js']
  },
  output: {
    path: path.join(__dirname, './dist/js'),
    filename: '[name]-[chunkhash:8].js',
    chunkFilename: 'async_component/[name]-[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {}
  },
  devtool: 'source-map',
  plugins: [
    new IPlugin(iPluginOption),
    new HtmlWebpackPlugin({
      template: './src/entry/index/index.html',
      filename: '../html/index.html',
      chunks: 'all'
    }),
    new ExtPlugin()
  ],
  devServer: {
    contentBase: './dist',
    compress: true,
    port: 5000,
    writeToDisk: true,
    async after() {
      await extOs.openBrowser('http://127.0.0.1:5000/html/')
    }
  }
}

module.exports = wConfig
