const { AsyncSeriesWaterfallHook } = require('tapable')

const iWeakMap = new WeakMap()

function createHooks() {
  return {
    beforeConcat: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterConcat: new AsyncSeriesWaterfallHook(['pluginArgs'])
  }
}

function getHooks(compilation) {
  let hooks = iWeakMap.get(compilation)
  if (hooks === undefined) {
    hooks = createHooks()
    iWeakMap.set(compilation, hooks)
  }
  return hooks
}


module.exports = {
  getHooks,
  createHooks
}