#   commandos Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

##  [0.10.2] - 2022-05-13

*   Fix `verifyArgument()`.  
    更正 `verifyArgument()` 方法针对数组类型的参数合法性检查未能执行的问题。

##  [0.10.0] - 2021-04-27

*   Member function `.isLatest()` added.  
    新增 `.isLatest()` 方法。

##  [0.9.0] - 2021-04-14
*   Member function `.man()` added.  
    新增 `.man()` 方法。

##  [0.8.0] - 2021-03-08

*   Support nesting command-sets.  
    支持多层命令嵌套。 

##  [0.7.4] - 2021-03-04

*   在 darwin / linux 操作系统平台，用 `more` 命令取代 `less` 执行帮助手册输出。  
    On darwin / linux os, replace "more" with "less" on outputing manual page.

##  [0.7.3] - 2021-03-04

*   Upgrade "manon" dependency to v0.1.0.

##  [0.6.1] - Jan 18th, 2021

*   Fix bug in `commandos.run()` where real argv length is less than what defined by `alias`.  
    之前，当 `commandos.run()` 实际的命令参数个数少于别名中定义的参数个数时，会抛出异常。

##  [0.6.0] - Dec 15th, 2020

*   Support place holder in alias.
*   Read help info about top command from '<ROOT>/help.txt'.

##  [0.5.2] - Sep 13th, 2020

*   Make `commandos.run()` more powerful.

##  [0.5.1] - Nov 8th, 2019

*   Display 'Did you mean ...' when sub command not found in `commandos.run()`.

##  [0.5.0] - Jul 25th, 2019

*   Fixed the bug in `commandos.run()`.

##  [0.4.0] - Jul 2nd, 2019

*   `commandos.run()` added.

##  [0.3.1] - Sep 11th, 2018

*   Fixed the bug that default value missed if it is a falsy value. E.g.
    If there is an ODL line `--number DEFAULT(0)`, the returned command options has not a property named 'number' and valued 0 if such option not passed through.

##  [0.3.0] - Apr 23rd, 2018

*   Objected options supported.

##  [0.2.1] - Mar 27th, 2018

*   Fixed the bug on `commandos.parse(Object)` which leads to ambiguity about what it is? Options or definitions?
*   `commandos.parse.onlyArgs()` added.

##  [0.2.0] - Mar 23nd, 2018

*   Ready-made *options* object accepted, see [Ready-Made Object Passed In](./README.md#ready-made-object-passed-in).

##	[0.1.6] - Feb 23th, 2018

*	Fixed the bug that, in ODL, option alias is forcely turn to lowercase.

##	[0.1.5] - Jan 15, 2018

###	Fixed

*	Fixed the bug that keyword `NULLABLE` in ODL not recogonized.
*	Fixed the bug in __commandos.parse__ that non-option arguments taken by named options are not excluded from the `$` array.

##	[0.1.4] - Jan 3, 2018

###	New

Allow taking non-option argument(s) as option value by setting __nonOption__ property in option definition.

##	[0.1.3] - Jan 2, 2018

###	Fixed

Fixed the bug taht Error *None of the option groups matched*  throwed if no named options found even if there is at least one option group requiring no named options.

##	[0.1.2] - Dec 30, 2017

###	New

Global setting `ignoreInvalidArgument` added.

##	[0.1.1] - Dec 30, 2017

###	Fixed

CLI sub-expression like `--=value` will be parsed to `{ '-': 'value' }` before. However, it is really ambiguous. Since this version, an exception will be thrownm in such cases.

##	[0.1.0] - Dec 30, 2017

##  [0.0.3] - Dec 23, 2017

*   Fixed: `ReferenceError: extractProperty is not defined`

##  [0.0.2] - Dec 22, 2017

*   Assignment form like `--name=value` is supported.
*   Paradoxical attributes in option definition will make exception throwed when `commandos.parse()` invoked.

##	[0.0.1] - 2017-12-21

Released.

---
This CHANGELOG.md follows [*Keep a CHANGELOG*](http://keepachangelog.com/).
