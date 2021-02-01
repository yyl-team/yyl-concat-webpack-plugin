import { AsyncSeriesWaterfallHook } from 'tapable';
import { Compilation } from 'webpack';
export declare function createHooks(): {
    beforeConcat: AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>;
    afterConcat: AsyncSeriesWaterfallHook<unknown, import("tapable").UnsetAdditionalOptions>;
};
export declare function getHooks(compilation: Compilation): any;
