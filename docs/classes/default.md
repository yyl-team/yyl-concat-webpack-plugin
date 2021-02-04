[yyl-concat-webpack-plugin](../README.md) / [Exports](../modules.md) / default

# Class: default

## Hierarchy

* *YylWebpackPluginBase*

  ↳ **default**

## Table of contents

### Constructors

- [constructor](default.md#constructor)

### Properties

- [alias](default.md#alias)
- [assetMap](default.md#assetmap)
- [context](default.md#context)
- [filename](default.md#filename)
- [name](default.md#name)
- [option](default.md#option)

### Methods

- [addDependencies](default.md#adddependencies)
- [apply](default.md#apply)
- [getFileName](default.md#getfilename)
- [getFileType](default.md#getfiletype)
- [initCompilation](default.md#initcompilation)
- [updateAssets](default.md#updateassets)
- [getHooks](default.md#gethooks)
- [getName](default.md#getname)

## Constructors

### constructor

\+ **new default**(`option?`: *YylConcatWebpackPluginOption*): [*default*](default.md)

#### Parameters:

Name | Type |
------ | ------ |
`option?` | *YylConcatWebpackPluginOption* |

**Returns:** [*default*](default.md)

Defined in: [src/index.ts:55](https://github.com/jackness1208/yyl-concat-webpack-plugin/blob/86793b7/src/index.ts#L55)

## Properties

### alias

• **alias**: Alias

resolve.alias 绝对路径

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:57

___

### assetMap

• **assetMap**: ModuleAssets

assetsMap

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:59

___

### context

• **context**: *string*

相对路径

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:51

___

### filename

• **filename**: *string*

输出文件格式

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:55

___

### name

• **name**: *string*

组件名称

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:53

___

### option

• **option**: *Required*<*YylConcatWebpackPluginOption*\>

配置

Defined in: [src/index.ts:48](https://github.com/jackness1208/yyl-concat-webpack-plugin/blob/86793b7/src/index.ts#L48)

## Methods

### addDependencies

▸ **addDependencies**(`op`: AddDependenciesOption): *void*

添加监听文件

#### Parameters:

Name | Type |
------ | ------ |
`op` | AddDependenciesOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:72

___

### apply

▸ **apply**(`compiler`: *Compiler*): *Promise*<*void*\>

#### Parameters:

Name | Type |
------ | ------ |
`compiler` | *Compiler* |

**Returns:** *Promise*<*void*\>

Defined in: [src/index.ts:92](https://github.com/jackness1208/yyl-concat-webpack-plugin/blob/86793b7/src/index.ts#L92)

___

### getFileName

▸ **getFileName**(`name`: *string*, `cnt`: *Buffer*, `fname?`: *string*): *string*

获取文件名称

#### Parameters:

Name | Type |
------ | ------ |
`name` | *string* |
`cnt` | *Buffer* |
`fname?` | *string* |

**Returns:** *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:64

___

### getFileType

▸ **getFileType**(`str`: *string*): *string*

获取文件类型

#### Parameters:

Name | Type |
------ | ------ |
`str` | *string* |

**Returns:** *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:62

___

### initCompilation

▸ **initCompilation**(`compiler`: *Compiler*): *Promise*<InitEmitHooksResult\>

初始化 compilation

#### Parameters:

Name | Type |
------ | ------ |
`compiler` | *Compiler* |

**Returns:** *Promise*<InitEmitHooksResult\>

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:66

___

### updateAssets

▸ **updateAssets**(`op`: UpdateAssetsOption): *void*

更新 assets

#### Parameters:

Name | Type |
------ | ------ |
`op` | UpdateAssetsOption |

**Returns:** *void*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:70

___

### getHooks

▸ `Static`**getHooks**(`compilation`: *Compilation*): *any*

hooks 用 获取组件hooks

#### Parameters:

Name | Type |
------ | ------ |
`compilation` | *Compilation* |

**Returns:** *any*

Defined in: [src/index.ts:38](https://github.com/jackness1208/yyl-concat-webpack-plugin/blob/86793b7/src/index.ts#L38)

___

### getName

▸ `Static`**getName**(): *string*

hooks 用 获取组件名字

**Returns:** *string*

Defined in: [src/index.ts:43](https://github.com/jackness1208/yyl-concat-webpack-plugin/blob/86793b7/src/index.ts#L43)
