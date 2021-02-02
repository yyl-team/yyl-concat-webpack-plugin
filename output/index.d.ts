import { Compilation, Compiler } from 'webpack';
import { AssetsInfo, YylWebpackPluginBaseOption, YylWebpackPluginBase } from 'yyl-webpack-plugin-base';
export declare type FileInfo = Required<AssetsInfo>;
interface YylConcatWebpackPluginOption extends Pick<YylWebpackPluginBaseOption, 'context' | 'filename'> {
    /** 文件映射 {[dist: string] : string[]} */
    fileMap: {
        [target: string]: string[];
    };
    /** 是否压缩, 默认 false */
    minify?: boolean;
    /** 日志输出的文件路径相对地址: 默认为 process.cwd() */
    logContext?: string;
    /** 压缩是否支持 ie8 */
    ie8?: boolean;
}
export default class YylConcatWebpackPlugin extends YylWebpackPluginBase {
    /** hooks 用 获取组件hooks */
    static getHooks(compilation: Compilation): any;
    /** hooks 用 获取组件名字 */
    static getName(): string;
    /** 配置 */
    option: Required<YylConcatWebpackPluginOption>;
    constructor(option?: YylConcatWebpackPluginOption);
    apply(compiler: Compiler): Promise<void>;
}
export {};
