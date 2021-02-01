/* eslint-disable no-console */
const IPlugin = require('../../../')
const util = require('yyl-util')

const PLUGIN_NAME = 'check_plugin'
class ExtPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(IPlugin.getName(), (compilation) => {
      IPlugin.getHooks(compilation).beforeConcat.tapAsync(PLUGIN_NAME, async (obj, done) => {
        await util.waitFor(10)
        console.log('hooks.beforeCopy(obj, done)', 'obj:', obj)
        done(null, obj)
      })

      IPlugin.getHooks(compilation).afterConcat.tapAsync(PLUGIN_NAME, async (obj, done) => {
        await util.waitFor(10)
        console.log('hooks.afterCopy(obj, done)', 'obj:', obj)
        done(null, obj)
      })
    })
  }
}

module.exports = ExtPlugin
