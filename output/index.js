/*!
 * yyl-concat-webpack-plugin cjs 1.0.10
 * (c) 2020 - 2021 
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var util = require('yyl-util');
var fs = require('fs');
var Concat = require('concat-with-sourcemaps');
var Terser = require('terser');
var chalk = require('chalk');
var yylWebpackPluginBase = require('yyl-webpack-plugin-base');
var tapable = require('tapable');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var Concat__default = /*#__PURE__*/_interopDefaultLegacy(Concat);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const LANG = {
    UGLIFY_ERROR: '代码压缩出错',
    BUILD_CONCAT: '合并信息',
    NO_CONCAT: '无合并信息',
    IE8_INFO: '兼容IE-8',
    MINIFY_INFO: '是否压缩',
    PATH_NOT_EXITS: '文件不存在'
};

const iWeakMap = new WeakMap();
function createHooks() {
    return {
        beforeConcat: new tapable.AsyncSeriesWaterfallHook(['pluginArgs']),
        afterConcat: new tapable.AsyncSeriesWaterfallHook(['pluginArgs'])
    };
}
function getHooks(compilation) {
    let hooks = iWeakMap.get(compilation);
    if (hooks === undefined) {
        hooks = createHooks();
        iWeakMap.set(compilation, hooks);
    }
    return hooks;
}

const PLUGIN_NAME = 'yylConcat';
class YylConcatWebpackPlugin extends yylWebpackPluginBase.YylWebpackPluginBase {
    constructor(option) {
        super(Object.assign(Object.assign({}, option), { name: PLUGIN_NAME }));
        /** 配置 */
        this.option = {
            fileMap: {},
            filename: '[name]-[hash:8].[ext]',
            context: process.cwd(),
            minify: false,
            ie8: false,
            logContext: process.cwd()
        };
        if ((option === null || option === void 0 ? void 0 : option.minify) !== undefined) {
            this.option.minify = option.minify;
        }
        if (option === null || option === void 0 ? void 0 : option.context) {
            if (!option.logContext) {
                this.option.logContext = option.context;
            }
        }
        if (option === null || option === void 0 ? void 0 : option.fileMap) {
            const iFileMap = {};
            Object.keys(option.fileMap).forEach((key) => {
                iFileMap[path__default['default'].resolve(this.option.context, key)] = option.fileMap[key].map((iPath) => path__default['default'].resolve(this.option.context, iPath));
            });
            this.option.fileMap = iFileMap;
        }
        if ((option === null || option === void 0 ? void 0 : option.ie8) !== undefined) {
            this.option.ie8 = option.ie8;
        }
        if (option === null || option === void 0 ? void 0 : option.logContext) {
            this.option.logContext = option.logContext;
        }
    }
    /** hooks 用 获取组件hooks */
    static getHooks(compilation) {
        return getHooks(compilation);
    }
    /** hooks 用 获取组件名字 */
    static getName() {
        return PLUGIN_NAME;
    }
    apply(compiler) {
        return __awaiter(this, void 0, void 0, function* () {
            const { output, context } = compiler.options;
            const { fileMap, minify, logContext, ie8 } = this.option;
            if (!fileMap || !Object.keys(fileMap).length) {
                return;
            }
            this.initCompilation({
                compiler,
                onProcessAssets: (compilation) => __awaiter(this, void 0, void 0, function* () {
                    const logger = compilation.getLogger(PLUGIN_NAME);
                    logger.group(PLUGIN_NAME);
                    // + concat
                    const iHooks = getHooks(compilation);
                    const formatSource = function (cnt, ext) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (!minify) {
                                return cnt.toString();
                            }
                            if (ext === '.js') {
                                try {
                                    const result = yield Terser.minify(cnt.toString(), {
                                        ie8
                                    });
                                    return result.code || '';
                                }
                                catch (er) {
                                    logger.error(LANG.UGLIFY_ERROR, er);
                                }
                                return cnt.toString();
                            }
                            else {
                                return cnt.toString();
                            }
                        });
                    };
                    // fileMap 格式化
                    const rMap = {};
                    Object.keys(fileMap).forEach((key) => {
                        if (context) {
                            rMap[path__default['default'].resolve(context, key)] = fileMap[key].map((iPath) => path__default['default'].resolve(context, iPath));
                        }
                        else if (this.option.context) {
                            rMap[path__default['default'].resolve(this.option.context, key)] = fileMap[key].map((iPath) => path__default['default'].resolve(this.option.context, iPath));
                        }
                    });
                    const rMapKeys = Object.keys(rMap);
                    if (rMapKeys.length) {
                        logger.info(`${LANG.MINIFY_INFO}: ${minify || 'false'}`);
                        logger.info(`${LANG.IE8_INFO}: ${ie8 || 'false'}`);
                        logger.info(`${LANG.BUILD_CONCAT}:`);
                    }
                    else {
                        logger.info(LANG.NO_CONCAT);
                    }
                    yield util__default['default'].forEach(rMapKeys, (targetPath) => __awaiter(this, void 0, void 0, function* () {
                        const assetName = util__default['default'].path.relative(output.path || '', targetPath);
                        const iConcat = new Concat__default['default'](true, targetPath, '\n');
                        const srcs = [];
                        yield util__default['default'].forEach(rMap[targetPath], (srcPath) => __awaiter(this, void 0, void 0, function* () {
                            const assetKey = util__default['default'].path.relative(output.path || '', srcPath);
                            if (path__default['default'].extname(assetKey) === '.js') {
                                iConcat.add(null, `;/* ${path__default['default'].basename(assetKey)} */`);
                            }
                            else {
                                iConcat.add(null, `/* ${path__default['default'].basename(assetKey)} */`);
                            }
                            let fileInfo = {
                                src: '',
                                dist: targetPath,
                                source: Buffer.from('')
                            };
                            if (this.assetMap[assetKey]) {
                                fileInfo.src = path__default['default'].resolve(output.path || '', this.assetMap[assetKey]);
                                fileInfo.source = Buffer.from(compilation.assets[this.assetMap[assetKey]].source().toString(), 'utf-8');
                            }
                            else if (fs__default['default'].existsSync(srcPath)) {
                                fileInfo.src = srcPath;
                                fileInfo.source = fs__default['default'].readFileSync(srcPath);
                            }
                            else {
                                const finalName = this.getFileName(assetName, Buffer.from(''));
                                const srcs = rMap[targetPath];
                                logger.warn(`${chalk__default['default'].cyan(finalName)} ${chalk__default['default'].yellow('<x')} [${srcs
                                    .map((iPath) => chalk__default['default'].green(path__default['default'].relative(logContext, iPath)))
                                    .join(', ')}]`);
                                logger.warn(`-> ${LANG.PATH_NOT_EXITS}: ${srcPath}`);
                                return;
                            }
                            // + hooks.beforeConcat
                            fileInfo = yield iHooks.beforeConcat.promise(fileInfo);
                            // - hooks.beforeConcat
                            iConcat.add(fileInfo.src, yield formatSource(fileInfo.source, path__default['default'].extname(fileInfo.src)));
                            srcs.push(fileInfo.src);
                        }));
                        const finalName = this.getFileName(assetName, iConcat.content);
                        // + hooks.afterConcat
                        let afterOption = {
                            dist: targetPath,
                            srcs: rMap[targetPath],
                            source: iConcat.content
                        };
                        afterOption = yield iHooks.afterConcat.promise(afterOption);
                        // - hooks.afterConcat
                        // 添加 watch
                        this.addDependencies({
                            compilation,
                            srcs: afterOption.srcs
                        });
                        logger.info(`${chalk__default['default'].cyan(finalName)} <- [${srcs
                            .map((iPath) => chalk__default['default'].green(path__default['default'].relative(logContext, iPath)))
                            .join(', ')}]`);
                        this.updateAssets({
                            compilation,
                            assetsInfo: {
                                src: assetName,
                                dist: finalName,
                                source: afterOption.source
                            }
                        });
                    }));
                    // - concat
                    logger.groupEnd();
                })
            });
        });
    }
}
module.exports = YylConcatWebpackPlugin;

exports.default = YylConcatWebpackPlugin;
