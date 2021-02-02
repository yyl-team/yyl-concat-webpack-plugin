'use strict'
const path = require('path')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const extOs = require('yyl-os')
const IPlugin = require('../../../output')
const ExtPlugin = require('./ext-plugin')
const baseWConfig = require('./webpack.config')

const wConfig = {
  plugins: [new ExtPlugin()]
}

module.exports = merge(baseWConfig, wConfig)
