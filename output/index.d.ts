/// <reference types="node" />
import { Compilation, Compiler } from 'webpack';
export interface ModuleAssets {
    [key: string]: string;
}
export interface FileInfo {
    src: string;
    dist: string;
    source: Buffer;
}
interface YylConcatWebpackPluginOption {
    /** 文件映射 {[dist: string] : string[]} */
    fileMap: {
        [target: string]: string[];
    };
    /** 生成的文件名, 默认为 [name]-[hash:8].[ext] */
    filename?: string;
    /** 是否压缩, 默认 false */
    minify?: boolean;
    /** 当设置 basePath后， fileMap 会进行一次 path.resolve 处理 */
    basePath?: string;
    /** 日志输出的文件路径相对地址: 默认为 process.cwd() */
    logBasePath?: string;
    /** 压缩是否支持 ie8 */
    ie8: boolean;
}
export default class YylConcatWebpackPlugin {
    static getHooks(compilation: Compilation): any;
    static getName(): string;
    option: Required<YylConcatWebpackPluginOption>;
    constructor(option?: YylConcatWebpackPluginOption);
    getFileType(str: string): string;
    getFileName(name: string, cnt: Buffer): string;
    apply(compiler: Compiler): void;
}
export {};
