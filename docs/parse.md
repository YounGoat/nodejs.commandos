#   commandos.parse() and commandos.parse.*

##  Table of Contents

* [Get Started](#get-started)
	* [Generally Returned](#generally-returned)
	* [Exceptions](#exceptions)
	* [Options Group](#options-group)
	* [Objected Option](#objected-option)
	* [Ready-Made Object Passed In](#ready-made-object-passed-in)
* [API](#api)
	* [commandos.parse()](#commandosparse)
	* [commandos.parse.onlyArgs()](#commandosparseonlyargs)
* [Go Advanced](#go-advanced)
	* [ODL, Option Definition Language](#odl-option-definition-language)
	* [Take Non-option Argument As Option Value](#take-non-option-argument-as-option-value)
* [Examples](#examples)
* [Why *commandos*](#why-commandos)
* [Honorable Dependents](#honorable-dependents)
* [About](#about)
* [References](#references)
* [Links](#links)

##	Get Started

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

See [API: commandos.parse()](#commandosparse) for more powerful settings you may needed.

### Generally Returned

Normally, `commandos.parse()` will return an object with properties of the same names as either the dash (`-` or `--`) prefixed option names in `cmdline`, or the names defined in `settings.options` (see the example below). Besides, the returned object will always has a array-typed property named `$` containing other pieces in `cmdline` but not belonging to any options.

```javascript
const cmdline = 'foo -v 1.0 --name JACK bar quz';
const options = [
    '--version -v',
    '--name -n' ];
const settings = { options };
const cmd = commandos.parse(cmdline, settings);
// RETURN { version, name, $: ['bar', 'quz'] }
```

### Exceptions

In following cases, `commandos.parse()` will meet an exception:

*   If *cmdline* contains option not declared in *settings.options* while *settings.explicit* set `true` at the same time.
*   If incomprehensible pieces found in *cmdline*. E.g, `--no-foo=bar` is incomprehensible because a switching option should not be assigned with any literal value.
*   If *cmdline* contains option violating the definition in *settings* and *settings.options*.

If *settings.catcher* exists, it will be invoked with the exception (an `Error` instance) as the only argument. Otherwise, the exception will be thrown directly:

```javascript
let catcher = (ex) => { 
    console.warn(ex.message);
};
// The exception will be catched and passed into *catcher*.
commandos.parse('foo --no-foo=bar', { catcher });
```

### Options Group

If the *cmdline* may be in multiple forms, we can run `commandos.parse()` more than one time to find out the options it carrying. However, using *settings.groups* is a more graceful way to achieve the same purpose.

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

ATTENTIONS: If *settings.explicit* is not set `true`, you'd better declare options with keyword `'REQUIRED'` to achieve expected result. The following is an anti-pattern example:

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

### Objected Option

```javascript
const options = [ '--meta-*' ];
commandos.parse('foo --meta-name Charley --meta-gender male', options);
// RETURN { meta: { name, gender } }
```

### Ready-Made Object Passed In

`commandos.parse()` may accept a ready-made *options* object, validate it and make it up with accompanied *settings*. E.g.
```javascript
const options = { v: '1.0', name: 'JACK' };
const settings = {
    explicit: true,
    options: [
        '--version -v',
        '--name -n' ]
};
commandos.parse(options, settings);
// RETURN { version, name }
```

##	API

### commandos.parse()

*   Object __commandos.parse__()
*   Object __commandos.parse__(string | string[] *cmdline*)
*   Object __commandos.parse__(Object *options*)
*   Object __commandos.parse__(*cmdline* | *options*, Array *optionDefinitions*)
*   Object __commandos.parse__(*cmdline* | *options*, Object *settings*)

To indicate how __commandos.parse__ actions, parameter *settings* may contain following attributes:

*   __overwrite__ *boolean* DEFAULT `true` OPTIONAL
*   __caseSensitive__ *boolean* DEFAULT `true` OPTIONAL
*   __explicit__ *boolean* DEFAULT `false` OPTIONAL
*   __ignoreInvalidArgument__ *boolean* DEFAULT `false` OPTIONAL
*   __options__ *Array* OPTIONAL
*   __groups__ *Array* OPTIONAL

A standard *definition of an option* (item of array *optionDefinitions* or *settings.options*) SHOULD be an object or a string. It may be an object made up of following attributes:

*   __name__ *string*  
    Option's formal name which will be attribute name of the returned object.

*   __alias__ *string | string[]* OPTIONAL  
    Alias of option may be used in *cmdline*.

*   __assignable__ *boolean* DEFAULT `true` OPTIONAL  
    If option is __assignable__, part following the dash-prefixed option name in *cmdline* will be regarded as value of the option if the part is not another dash-prefixed option name.  

*   __caseSensitive__ *boolean* DEFAULT INHERIT OPTIONAL  
    If __caseSensitive__ is true, option `version` and `Version` will be regarded as two different options.

*   __multiple__ *boolean* DEFAULT `false` OPTIONAL  
    If option is __multiple__, the parsed value will be an array.

*   __nonOption__ *number | string | RegExp | Function* OPTIONAL  
    If named option not found, the matching non-option argument(s) will be taken as the value of the option. See [Take Non-option Argument As Option Value](#take-non-option-argument-as-option-value) for details.

*   __nullable__ *boolean* DEFAULT `true` OPTIONAL  
    When we say some option is NOT __nullable__, we mean it SHOULD NOT appear in the command line without being followed by some value.

*   __overwrite__ *boolean* DEFAULT INHERIT OPTIONAL  
    If __overwrite__ set `false`, the option or its alias SHOULD NOT appear in the command line for more than one time.

*   __required__ *boolean* DEFAULT `false` OPTIONAL  
    If option is __required__, it SHOULE appear in the command line at least once.

__ATTENTION：Some of previous attributes are mutexes.__  
If option is __multiple__, it SHOULD NOT be a kind of switching value at the same time. That means the option is assignable and NOT nullable, attribute __nullable__, __assignable__ and  __overwrite__ will be ignored.

It can also be a string according to private syntax looks like [column definition in MySQL](https://dev.mysql.com/doc/refman/8.0/en/create-table.html). For convenience, it is hereinafter referred to as [__ODL__(Option Definition Language)](#odl-option-definition-language).

### commandos.parse.onlyArgs()

Same as `commandos.parse()` but first part of *cmdline* will be regarded as option or non-option value instead of name of command.

##  Go Advanced

### ODL, Option Definition Language

ODL is a tiny language used to define option. It is an easy alternative for option define object. E.g.

```javascript
// * The option is named "version", or "v" in short. The first name is formal.
// * The option SHOULD be appended with some value.
// * The option SHOULD exist.
// * The name is case-insensitive, that means "Version" and "V" are also 
//   acceptable.
'--version -v NOT NULL REQUIRED NOT CASE_SENSITIVE'

// * If named option not offered, the first non-argument will be used as value of option "action".
'--action [0:~* (start|stop|restart)]'

// * The first word is regarded as formal name of the option.
// * Alias "v" and "edition" are also acceptable.
'version ALIAS(v, edition)'

// * Set default value.
'--number DEFAULT(99)'

// * Set avaiable values.
'--gender ENUM(male, female)'
```

Keywords in ODL is __case-insensitive__:
*   []
*   ALIAS
*   ASSIGNABLE
*   CASE_SENSITIVE
*   CASE_INSENSITIVE
*   COMMENT
*   DEFAULT
*   MULTIPLE
*   NOT
*   NULL
*   NULLALBE
*   OVERWRITE
*   REQUIRED

### Take Non-option Argument As Option Value

To make command line more flexiable, __commandos.parse__ allows, by setting __nonOption__ in *definition of an option*, to take non-option argument(s) as option value while named option not found. Property __nonOption__ is overloaded with following types:
*   __nonOption__ *number*
*   __nonOption__ *string*
*   __nonOption__ *RegExp*
*   __nonOption__ *Function*(value, index)

In ODL, delimiters `[]` is used to define the nonOption property:
```javascript
// * Fixed position of non-option argument.
// * Fixed value.
'--help [0:=* help] NOT ASSIGNABLE'

// * Any position.
// * Use regular expression (case-insensitive) to validate the arguments.
'--action [*:~* (start|stop|restart)]'

// * Position range.
'--name [>1]'
```

##  Examples

Read unit test code for examples:

*   [commandos.parse: basic usage](../test/parse.basic-usage.js)
*   [commandos.parse: global settings](../test/parse.global-settings.js)
*   [commandos.parse: option settings](../test/parse.option-settings.js)
*   [commandos.parse: take non-option argument as option value](../test/parse.option-nonoption.js)
*   [commandos.parse: option groups](../test/parse.option-groups.js)