import { AsyncSeriesWaterfallHook } from 'tapable'
import { Compilation } from 'webpack'
const iWeakMap = new WeakMap()

export function createHooks() {
  return {
    beforeConcat: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterConcat: new AsyncSeriesWaterfallHook(['pluginArgs'])
  }
}

export function getHooks(compilation: Compilation) {
  let hooks = iWeakMap.get(compilation)
  if (hooks === undefined) {
    hooks = createHooks()
    iWeakMap.set(compilation, hooks)
  }
  return hooks
}
