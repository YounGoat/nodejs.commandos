#   commandos Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

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
