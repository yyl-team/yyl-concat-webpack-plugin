/*!
 * yyl-concat-webpack-plugin cjs 1.0.1
 * (c) 2020 - 2021 
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var util = require('yyl-util');
var fs = require('fs');
var Concat = require('concat-with-sourcemaps');
var crypto = require('crypto');
var Terser = require('terser');
var chalk = require('chalk');
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
class YylConcatWebpackPlugin {
    constructor(option) {
        this.option = {
            fileMap: {},
            filename: '[name]-[hash:8].[ext]',
            basePath: process.cwd(),
            minify: false,
            ie8: false,
            logBasePath: process.cwd()
        };
        if ((option === null || option === void 0 ? void 0 : option.minify) !== undefined) {
            this.option.minify = option.minify;
        }
        if (option === null || option === void 0 ? void 0 : option.basePath) {
            this.option.basePath = option.basePath;
            if (!option.logBasePath) {
                this.option.logBasePath = option.basePath;
            }
        }
        if (option === null || option === void 0 ? void 0 : option.fileMap) {
            const iFileMap = {};
            Object.keys(option.fileMap).forEach((key) => {
                iFileMap[path__default['default'].resolve(this.option.basePath, key)] = option.fileMap[key].map((iPath) => path__default['default'].resolve(this.option.basePath, iPath));
            });
            this.option.fileMap = iFileMap;
        }
        if ((option === null || option === void 0 ? void 0 : option.ie8) !== undefined) {
            this.option.ie8 = option.ie8;
        }
        if (option === null || option === void 0 ? void 0 : option.logBasePath) {
            this.option.logBasePath = option.logBasePath;
        }
    }
    static getHooks(compilation) {
        return getHooks(compilation);
    }
    static getName() {
        return PLUGIN_NAME;
    }
    getFileType(str) {
        str.replace(/\?.*/, '');
        const split = str.split('.');
        let ext = split[split.length - 1];
        if (ext === 'map' && split.length > 2) {
            ext = `${split[split.length - 2]}.${split[split.length - 1]}`;
        }
        return ext;
    }
    getFileName(name, cnt) {
        const { filename } = this.option;
        const REG_HASH = /\[hash:(\d+)\]/g;
        const REG_NAME = /\[name\]/g;
        const REG_EXT = /\[ext\]/g;
        const dirname = path__default['default'].dirname(name);
        const basename = path__default['default'].basename(name);
        const ext = path__default['default'].extname(basename).replace(/^\./, '');
        const iName = basename.slice(0, basename.length - (ext.length > 0 ? ext.length + 1 : 0));
        let hash = '';
        if (filename.match(REG_HASH)) {
            let hashLen = 0;
            filename.replace(REG_HASH, (str, $1) => {
                hashLen = +$1;
                hash = crypto.createHash('md5').update(cnt.toString()).digest('hex').slice(0, hashLen);
                return str;
            });
        }
        const r = filename.replace(REG_HASH, hash).replace(REG_NAME, iName).replace(REG_EXT, ext);
        return util__default['default'].path.join(dirname, r);
    }
    apply(compiler) {
        const { output, context } = compiler.options;
        const { fileMap, minify, logBasePath, ie8 } = this.option;
        if (!fileMap || !Object.keys(fileMap).length) {
            return;
        }
        const moduleAssets = {};
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.moduleAsset.tap(PLUGIN_NAME, (module, file) => {
                if (module.userRequest) {
                    moduleAssets[file] = path__default['default'].join(path__default['default'].dirname(file), path__default['default'].basename(module.userRequest));
                }
            });
        });
        compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, done) => __awaiter(this, void 0, void 0, function* () {
            const logger = compilation.getLogger(PLUGIN_NAME);
            logger.group(PLUGIN_NAME);
            // + init assetMap
            const assetMap = {};
            compilation.chunks.forEach((chunk) => {
                chunk.files.forEach((fName) => {
                    if (/hot-update/.test(fName)) {
                        return;
                    }
                    if (chunk.name) {
                        const key = `${util__default['default'].path.join(path__default['default'].dirname(fName), chunk.name)}.${this.getFileType(fName)}`;
                        assetMap[key] = fName;
                    }
                    else {
                        assetMap[fName] = fName;
                    }
                });
            });
            const stats = compilation.getStats().toJson({
                all: false,
                assets: true,
                cachedAssets: true
            });
            stats.assets.forEach((asset) => {
                const name = moduleAssets[asset.name];
                if (name) {
                    assetMap[util__default['default'].path.join(name)] = asset.name;
                }
            });
            // - init assetMap
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
                else if (this.option.basePath) {
                    rMap[path__default['default'].resolve(this.option.basePath, key)] = fileMap[key].map((iPath) => path__default['default'].resolve(this.option.basePath, iPath));
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
                    if (assetMap[assetKey]) {
                        fileInfo.src = path__default['default'].resolve(output.path || '', assetMap[assetKey]);
                        fileInfo.source = Buffer.from(compilation.assets[assetMap[assetKey]].source().toString(), 'utf-8');
                    }
                    else if (fs__default['default'].existsSync(srcPath)) {
                        fileInfo.src = srcPath;
                        fileInfo.source = fs__default['default'].readFileSync(srcPath);
                    }
                    else {
                        logger.warn(`${LANG.PATH_NOT_EXITS}: ${srcPath}`);
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
                afterOption.srcs.forEach((srcPath) => {
                    compilation.fileDependencies.add(srcPath);
                });
                logger.info(`${chalk__default['default'].cyan(finalName)} <- [${srcs
                    .map((iPath) => chalk__default['default'].green(path__default['default'].relative(logBasePath, iPath)))
                    .join(', ')}]`);
                compilation.assets[finalName] = {
                    source() {
                        return afterOption.source;
                    },
                    size() {
                        return afterOption.source.length;
                    }
                };
                compilation.hooks.moduleAsset.call({
                    userRequest: assetName
                }, finalName);
            }));
            // - concat
            logger.groupEnd();
            done();
        }));
    }
}
module.exports = YylConcatWebpackPlugin;

exports.default = YylConcatWebpackPlugin;
