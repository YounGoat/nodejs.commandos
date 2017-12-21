#	commandos
__Command line parser, compatible with DOS style command__

The name *commandos* is combination of *command* and *DOS*. __commandos__ is a light-weighted command line parser which help to connect cli and Node.js application.

##	Table of contents

*	[Get Started](#get-started)
*	[API](#api)
* 	[Examples](#examples)
*	[Why commandos](#why-commandos)
*	[Honorable Dependents](#honorable-dependents)
*	[About](#about)
*	[References](#references)

##	Links

*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/nodejs.commandos)

##	Get Started

```javascript
const commandos = require('commandos');

// -- example 1 --
// Parse the command line of current process with default settings.
const options = commandos.parse();

// -- example 2 --
// Parse command line with default settings.
const cmdline = 'foo -v 1.0 --name JACK';
const options = commandos.parse(cmdline);

// -- example 3 --
// Parse command line with customised settings.
const cmdline = 'foo -v 1.0 --name JACK';
const settings = {
    explicit: true,
    options: [
        '--version -v',
        '--name -n' ]
};
const options = commandos.parse(cmdline, settings);
```
##	API

### commandos.parse()

*   Object __commandos.parse__()
*   Object __commandos.parse__(string | string[] *cmdline*)
*   Object __commandos.parse__(*cmdline*, Array *optionDefinitions*)
*   Object __commandos.parse__(*cmdline*, Object *settings*)

To indicate how __commandos.parse__ actions, parameter *settings* may contain following attributes:

*   __overwrite__ *boolean* DEFAULT `true` OPTIONAL
*   __caseSensitive__ *boolean* DEFAULT `true` OPTIONAL
*   __explicit__ *boolean* DEFAULT `false` OPTIONAL
*   __options__ *Array* OPTIONAL

A standard *definition of an option* (item of __optionDefinitions__) SHOULD be an object or a string. It may be an object made up of following attributes:

*   __name__ *string*  
    Option's formal name which will be attribute name of the returned object.

*   __alias__ *string | string[]* OPTIONAL  

*   __assignable__ *boolean* DEFAULT `true` OPTIONAL  
    If option is __assignable__, part following the dash-prefixed option name in the command line will be regarded as value of the option if the part is not another dash-prefixed option name.  

*   __caseSensitive__ *boolean* DEFAULT INHERIT OPTIONAL  
    If __caseSensitive__ is true, option `version` and `Version` will be regarded as two different options.

*   __multiple__ *boolean* DEFAULT `false` OPTIONAL  
    If option is __multiple__, the parsed value will be an array.

*   __nullable__ *boolean* DEFAULT `true` OPTIONAL  
    When we say some option is NOT __nullable__, we mean it SHOULD NOT appear in the command line without being followed by some value.

*   __overwrite__ *boolean* DEFAULT INHERIT OPTIONAL  
    If __overwrite__ set `false`, the option or its alias SHOULD NOT appear in the command line for more than one time.

*   __required__ *boolean* DEFAULT `false` OPTIONAL  
    If option is __required__, it SHOULE appear in the command line at least once.

ATTENTION：Some of previous attributes are mutexes.  
If option is __multiple__, it SHOULD NOT be a kind of switching value at the same time. That means the option is assignable and NOT nullable, attribute __nullable__, __assignable__ and  __overwrite__ will be ignored.

It can also be a string according to private syntax looks like [column definition in MySQL](https://dev.mysql.com/doc/refman/8.0/en/create-table.html):

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

##  Examples

Read unit test code for examples:

*   [commandos.parse](./test/parse.js)

##  Why *commandos*

There are already many packages help you to parse command line content, in which [minimist](https://www.npmjs.com/package/minimist) and [commander](https://www.npmjs.com/package/commander) are probably most famous. However, sometimes __minimist__ is too slim while __commander__ is too heavy. That is why I wrote __commandos__.

##  Honorable Dependents

##  About

*commandos* = *command* + *DOS*

##  References

If __jinang/parseCommand__ is not to your taste, maybe the following packages is considerable (in alphabetical order):

*   [commander](https://www.npmjs.com/package/commander)
*   [minimist](https://www.npmjs.com/package/minimist)
*   [nomnom](https://www.npmjs.com/package/nomnom)
*   [optimist](https://www.npmjs.com/package/optimist)