#   commandos Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

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
