#	commandos
__命令字符串分析工具__

其他语言 / [英语](./README.md)

包名 *commandos* 的灵感来自于经典策略游戏 *Commandos: Behind Enemy Lines*，但在此处，其真实意义是单词 *command* 和 *DOS* 的合体。__commandos__ 是一个轻量级的命令行分析工具，令你可以更加轻松地使用 Node.js 开发 CLI 应用程序。

##	目录

*	[快速开始](#快速开始)
*	[API](#api)
* 	[示例](#示例)
*	[起源](#起源)
*	[关于](#关于)
*	[参考](#参考)

##	链接

*	[更新日志](./CHANGELOG.md)
*	[项目主页](https://github.com/YounGoat/nodejs.commandos)

##	快速开始

```javascript
const commandos = require('commandos');

// -- example 1 --
// Parse the command line of current process with default settings.
const cmd = commandos.parse();

// -- example 2 --
// Parse command line with default settings.
const cmdline = 'foo -v 1.0 --name JACK';
const cmd = commandos.parse(cmdline);
// RETURN { v, name, $: [] };

// -- example 3 --
// Parse command line with customised settings.
const cmdline = 'foo -v 1.0 --name JACK';
const options = [
    '--version -v',
    '--name -n' ];
const cmd = commandos.parse(cmdline, options);
// RETURN { version, name, $: [] }
```

如果需要更强大的设置，请阅读 [API: commandos.parse()](#commandosparse) 一节。

### 返回对象

如无意外，`commandos.parse()` 将返回一个 JSON 对象：
*   它的属性或与命令行 `cmdline` 中的选项（`-` 或 `--` 前导）同名，或由 `settings.options` 决定（见下例）；
*   此外，返回对象中还包括一个数组类型、名为 `$` 的属性，它将包括命令行 `cmdline` 中所有不属于任何选项的片断（通常附加在命令行的最后）。

```javascript
const cmdline = 'foo -v 1.0 --name JACK bar quz';
const options = [
    '--version -v',
    '--name -n' ];
const settings = { options };
const cmd = commandos.parse(cmdline, settings);
// RETURN { version, name, $: ['bar', 'quz'] }
```

### 例外

以下情形将导致 `commandos.parse()` 出现例外：

*   参数 *cmdline* 中包含 *settings.options* 中未声明的选项，与此同时参数 *settings.explicit* 设为 `true`；
*   参数 *cmdline* 中出现非法选项。例如，`--no-foo=bar` 即为非法选项，因为开关量是不可以赋值的；
*   参数 *cmdline* 中包含的选项与 *settings* 及 *settings.options* 中声明的选项特征相冲突。

出现异常时，如果通过 *settings.catcher* 指定了异常捕获函数，则该函数将被调用，而相应异常（`Error` 实例）将作为唯一的参数。否则，该异常将被直接抛出：

```javascript
let catcher = (ex) => { 
    console.warn(ex.message);
};
// The exception will be catched and passed into *catcher*.
commandos.parse('foo --no-foo=bar', { catcher });
```

### 选项组

假如 *cmdline* 可能存在多种不同形式，我们当然可以通过多次运行 `commandos.parse()` 以正确获取命令行携带的参数。不过，通过参数 *settings.groups* 声明选项组是一个更优雅的方式。

```javascript
// Option groups.
const settings = {
    explicit: true,
    groups: [
        [ '--version -v' ],
        [ '--name -n', '--gender -g' ]
    ]
};
commandos.parse('foo -v 1.0', settings);
// RETURN { version, $ }

commandos.parse('foo -n JACK -g male', settings);
// RETURN { name, gender, $ }
```

注意：如果 *settings.explicit* 未明确赋值为 `true`，最好在选项组中的选项声明中合理使用 `'REQUIRED'` 关键字。下面是一个反模式：

```javascript
// -- ANTI PATTERN --
// Option groups.
const settings = {
    explicit: false,
    groups: [
        [ '--version -v' ],
        [ '--name -n', '--gender -g' ]
    ]
};
commandos.parse('foo -n JACK -g male', settings);
// RETURN { $ }
// The first option group matched, becuase it does NOT require any options.
```

##	API

### commandos.parse()

*   Object __commandos.parse__()
*   Object __commandos.parse__(string | string[] *cmdline*)
*   Object __commandos.parse__(*cmdline*, Array *optionDefinitions*)
*   Object __commandos.parse__(*cmdline*, Object *settings*)

参数 *settings* 通过以下属性设定 __commandos.parse__ 的行为模式：

*   __overwrite__ *boolean* DEFAULT `true` OPTIONAL
*   __caseSensitive__ *boolean* DEFAULT `true` OPTIONAL
*   __explicit__ *boolean* DEFAULT `false` OPTIONAL
*   __ignoreInvalidArgument__ *boolean* DEFAULT `false` OPTIONAL
*   __options__ *Array* OPTIONAL
*   __groups__ *Array* OPTIONAL

一个标准的 *选项定义*（数组 *optionDefinitions* 或 *settings.options* 的元素）可以是一个对象或字符串。当它是一个对象时，可以包含以下属性：

*   __name__ *string*  
    选项的正式名称，将作为相应选项在 `commandos.parse()` 函数返回对象中相应的属性名。

*   __alias__ *string | string[]* OPTIONAL  
    选项在 *cmdline* 中可能使用的别名。

*   __assignable__ *boolean* DEFAULT `true` OPTIONAL  
    若选项被声明为 __assignable__，*cmdline* 中紧随选项名之后的片断将视为该选项的值。

*   __caseSensitive__ *boolean* DEFAULT INHERIT OPTIONAL  
    若选项被声明为 __caseSensitive__，则 `version` 和 `Version` 将被视为不同选项。

*   __multiple__ *boolean* DEFAULT `false` OPTIONAL  
    若选项被声明为 __multiple__，将选项的解析值将是一个数组。

*   __nullable__ *boolean* DEFAULT `true` OPTIONAL  
    若选项的 __nullable__ 属性非真，则该选项__不应当__在 *cmdline* 中单独出现，若出现则必须附带选项值.

*   __overwrite__ *boolean* DEFAULT INHERIT OPTIONAL  
    若选项的 __overwrite__ 属性非真，该选项（包括其别）__不应当__在 *cmdline* 中出现多次。

*   __required__ *boolean* DEFAULT `false` OPTIONAL  
    若选项被声明为 __required__，该选项__应当__在 *cmdline* 中至少出现一次。

__注意：以上属性之间可能是互斥的。__    
例如，如果选项声明为 __multiple__，则它__不应当__同时是一个开关量。也就是说，该选项是可赋值的且不能为空，因此选项声明中的 __nullable__ / __assignable__ / __overwrite__ 属性将被忽略。

选项声明也可以是一个字符串，遵从类似 [column definition in MySQL](https://dev.mysql.com/doc/refman/8.0/en/create-table.html) 的私有语法：

```javascript
// * The option is named "version", or "v" in short. The first name is formal.
// * The option SHOULD be appended with some value.
// * The option SHOULD exist.
// * The name is case-insensitive, that means "Version" and "V" are also 
//   acceptable.
'--version -v NOT NULL REQUIRED NOT CASE_SENSITIVE'

// * The first word is regarded as formal name of the option.
// * Alias "v" and "edition" are also acceptable.
'version alias(v, edition)'
```

##  示例

阅读测试用例代码以获取更多示例：

*   [commandos.parse](./test/parse.js)

##  起源

在众多使用 Node.js 编写的命令行解析工具中，[minimist](https://www.npmjs.com/package/minimist) 和 [commander](https://www.npmjs.com/package/commander) 较为知名。但是，有时候 __minimist__ 功能太过单薄，而 __commander__ 又太重，这就是我为什么设计 __commandos__ 的原因。

##  关于

*commandos* = *command* + *DOS*

##  参考

如果 __commandos__ 不合你的胃口, 有很多类似功能的包可供选择（按字母顺序排列）：

*   [commander](https://www.npmjs.com/package/commander)
*   [getopts](https://www.npmjs.com/package/getopts)
*   [minimist](https://www.npmjs.com/package/minimist)
*   [nomnom](https://www.npmjs.com/package/nomnom)
*   [optimist](https://www.npmjs.com/package/optimist)
*   [yargs](https://www.npmjs.com/package/yargs)
