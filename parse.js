'use strict';

const { verify } = require('crypto');

const MODULE_REQUIRE = 1
    /* built-in */
    , util = require('util')

    /* NPM */

    /* in-package */
    , absorb = require('jinang/absorb')
    , papply = require('jinang/papply')
    , safeClone = require('jinang/safeClone')
    , split = require('jinang/split')

    /* in-file */
    
    , ifUndefined = function () {
        let ret;
        for (let i = 0; i < arguments.length && util.isUndefined(ret); i++) {
            ret = arguments[i];
        }
        return ret;
    }

    // 验证并解析字符串，从中提取选项名。
    , splitIntoNames = (/*string*/ name, /*boolean*/ prefixedWithDash) => {
        let names = [];
        name.trim().split(/[\s,]+/).forEach(part => {
            if (part.startsWith('--')) {
                names.push(part.substr(2));
            } else if (part.startsWith('-')) {
                absorb(names, part.substr(1).split(''));
            } else if (!prefixedWithDash) {
                names.push(part);
            }
        });
        return names;
    };

/**
 * Parse definition string.
 * 解析参数定义字符串。
 * @param {string} desc 
 * @return {Object}  See @tag COLUMN
 */
function parseColumn(desc) {
    // @tag COLUMN
    let column = {
        name            : null,
        alias           : [],
        assignable      : undefined,
        caseSensitive   : undefined,
        multiple        : undefined,
        nullable        : undefined,
        overwrite       : undefined,
        nonOption       : undefined,
        enum            : undefined,
    };

    if (typeof desc == 'string') {
        /**
         * Please google "non-option argument".
         * 请自行百度 "non-option argument" 获取相关资料。
         */
        desc = desc.replace(/(^|\s)\[(.+)\](\s|$)/, (content) => {
            let nonOption = RegExp.$2.trim();
            if (!/^([^:]+)(:(.*))?$/.test(nonOption)) {
                throw new Error(`invalid nonOption definition: ${nonOption}`);
            }
            let positions = RegExp.$1.trim().split(/[,\s]+/);
            let valueDef = RegExp.$3.trim();
            
            /**
             * Create if-match-position function.
             * 生成位置匹配函数。
             */

            positions = positions.map(position => {
                let fn;
                if (position == '*') {
                    return fn = () => true;
                }
                if (/^\d+$/.test(position)) {
                    position = parseInt(position);
                    return fn = (index) => index == position;
                }
                if (/^(>|>=|<|<=|=)(\d+)$/.test(position)) {
                    position = parseInt(RegExp.$2);
                    switch (RegExp.$1) {
                        case '>'  : return fn = (index) => index >  position;
                        case '>=' : return fn = (index) => index >= position;
                        case '<'  : return fn = (index) => index <  position;
                        case '<=' : return fn = (index) => index <= position;
                        case '='  : return fn = (index) => index == position;
                    }
                }
                throw new Error(`invalid nonOption definition: ${nonOption}`);
            });
            // 最终的位置匹配函数。
            let indexValidator = (index) => {
                let valid = true;
                for (let i = 0; valid && i < positions.length; i++) {
                    valid = valid && positions[i](index);
                }
                return valid;
            };

            /**
             * Create if-match-value function.
             * 生成值匹配函数。
             * 
             * 描述值匹配的方法有以下几种：
             *   =* foobar
             *   # Equal to "foobar" (case insensitive).
             *   
             *   = foobar
             *   # Equal to "foobar" (case sensitive).
             * 
             *   ~* <REGULAR_EXPRESSION> 
             *   # Match regular expression (case insensitive).
             * 
             *   ~ <REGULAR_EXPRESSION> 
             *   # Match regular expression (case sensitive).
             */

            let valueValidator = null;
            if (valueDef == '') {
                valueValidator = () => true;
            }
            else if (/^=\*(.+)$/.test(valueDef)) {
                let v = RegExp.$1.trim().toLowerCase();
                valueValidator = (value) => v == value.toLowerCase();
            }
            else if (/^=(.+)$/.test(valueDef)) {
                let v = RegExp.$1.trim();
                valueValidator = (value) => v == value;
            }
            else if (/^~\*(.+)$/.test(valueDef)) {
                let re = new RegExp(RegExp.$1.trim(), 'i');
                valueValidator = (value) => re.test(value);
            }
            else if (/^~(.+)$/.test(valueDef)) {
                let re = new RegExp(RegExp.$1.trim());
                valueValidator = (value) => re.test(value);
            }
            else {
                throw new Error(`invalid nonOption definition: ${nonOption}`);
            }

            // 生成完整的非选项参数匹配函数。            
            column.nonOption = (value, index) => indexValidator(index) && valueValidator(value);

            // 位置替补定义语句已完成其使命。
            // 注意须用一个空格替换，以免将可能的前后片断粘连在一起。
            return ' ';
        });

        /**
         * Replace "( content )" with #0, #1, ...
         * And save content(s) in an array in turns.
         * 用占位符号 #0、#1、…… 取代括号中的内容（连同括号本身）。
         * 括号中的内容将依次保存在数组 `inParenthesses` 中。
         */
        let inParentheses = [];
        desc = desc.replace(/\s*\([^)]+\)/g, (content) => {
            let index = inParentheses.length;
            content = content.trim();
            inParentheses.push(content.substring(1, content.length - 1));
            return `#${index}`;
        });

        // ---------------------------
        // Start to parse `desc` word for word.
        // 开始逐字解析。

        let parts = desc.split(/\s+/g);

        let decos = [];
        parts.forEach((part, index) => {
            // 首词无论是否前缀 - 或 --，均视为选项名。
            let dashed = (index > 0);
            let names = splitIntoNames(part, dashed);

            if (index == 0) {
                column.name = names.shift();
                column.alias = names;
            }
            else if (names.length) {
                column.alias = column.alias.concat(names);
            }
            else {
                decos.push(part.toLowerCase());
            }
        });

        let notdeco = false;
        decos.forEach((deco) => {
            // NOT is keyword to decorate the following decorator.
            if (deco == 'not') {
                notdeco = true;
                return;
            }

            let alias = splitIntoNames(deco, true);
            if (alias.length) {
                column.alias.push.apply(column.alias, alias);
                return;
            }

            let argsText = null;
            if (/^(.+)#(\d)+$/.test(deco)) {
                deco = RegExp.$1;
                argsText = inParentheses[parseInt(RegExp.$2)];
            }

            switch (deco) {
                case 'required':
                case 'nullable':
                case 'assignable':
                case 'multiple':
                case 'overwrite':
                case 'objected':
                case 'caseSensitive': // actually, "caseSensitive" will not really occur because deco has been lowercased before.
                    column[deco] = !notdeco;
                    break;

                case 'null':
                    column.nullable = !notdeco;
                    break;

                case 'case-sensitive':
                case 'case_sensitive':
                case 'casesensitive':
                    column.caseSensitive = !notdeco;
                    break;

                case 'case-insensitive':
                case 'case_insensitive':
                case 'caseinsensitive':
                    column.caseSensitive = notdeco;
                    break;

                case 'alias':
                    absorb(column.alias, argsText.split(',').map(name => name.trim()));
                    break;

                case 'default':
                    column.default = JSON.parse(argsText);
                    break;

                case 'enum':
                    column.enum = argsText.split(/\s*,\s*/);
                    break; 

                case 'comment':
                    column.comment = argsText;
                    break;

                default:
                    break;
            }

            // Reset the NOT decorator.
            notdeco = false;
        });
    } else {
        column = Object.assign(column, desc);

        if (typeof column.alias == 'string') {
            column.alias = splitIntoNames(column.alias);
        } else if (!column.alias) {
            column.alias = [];
        }

        let names = splitIntoNames(column.name);
        column.name = names.shift();
        column.alias = names.concat(column.alias);
    }

    column.multiple = ifUndefined(column.multiple, false);
    if (column.multiple &&
        (column.nullable === true || column.assignable === false || column.overwrite === true)) {
        throw new Error(`option MULTIPLE should also be ASSIGNABLE, NOT NULLABLE and NOT overwrite: ${column.name}`);
    }

    if (typeof column.nonOption != 'undefined') {
        if (typeof column.nonOption == 'number') {
            let pos = column.nonOption;
            column.nonOption = (index, value) => index === pos;
        }
        else if (column.nonOption == 'string') {
            let text = column.nonOption;
            column.nonOption = (index, value) => value == text;
        }
        else if (column.nonOption instanceof RegExp) {
            let re = column.nonOption;
            column.nonOption = (index, value) => re.text(value);
        }
        else if (typeof column.nonOption != 'function') {
            throw new Error(`invalid option's nonOption property: $column.nonOption`);
        }
    }

    column.assignable = ifUndefined(column.assignable, true);    
    column.nullable = column.enum ? false : ifUndefined(column.nullable, true);

    if (column.name.endsWith('-*')) {
        column.name = column.name.slice(0, -2);
        column.objected = true;
    }

    return column;
}

/**
 * Parse raw arguments, which generated by `parseRaw()`, according to arguments definition (one group only).
 * 根据一组参数定义对原始参数进行校验。
 * @param {Object} raw 
 * @param {Object} def 
 */
function parseOptions(raw, def) {
    // raw := { options, $, -- } 

    /**
     * Distill argument object from `raw.options`.
     * 提取原始参数。
     */
    let consumeOption = (index, novalue) => {
        let option = raw.options.splice(index, 1)[0];

        let value = option.value;

        /**
         * If `value` is a number, it is actually a placeholder. 
         * 原始选项值通常是字符串，只有当代表占位符时，才是一个数字。
         * E.g. #0 or #1
         */
        if (typeof value == 'number') {
            if (novalue) {
                value = true;
            } else {
                let index = value;
                value = raw.$[index];
                raw.$[index] = null;
            }
        }
        return value;
    };

    let parsedOptions = {};
    let names_notation_cache = {};
    for (let I = 0; I < def.options.length; I++) {
        const column = def.options[I];

        let caseSensitive = ifUndefined(column.caseSensitive, def.caseSensitive);
        let overwrite = ifUndefined(column.overwrite, def.overwrite);

        /**
         * `names` includes formal name and alias.
         * `names` 包括参数的正式名称和别名。
         */ 
        const names = [column.name].concat(column.alias);
        const names_lc = caseSensitive ? null : names.map(name => name.toLowerCase());

        const names_matching = (names, name) => {
            let matched = false;
            for (let i = 0; i < names.length && !matched; i++) {
                if (column.objected) {
                    let prefix = names[i];
                    if (name.startsWith(prefix) && name[prefix.length] == '-') {
                        matched = name.slice(prefix.length + 1);
                    }
                }
                else {
                    matched = (name == names[i]);
                }
            }
            return matched;
        };

        // names_notation 变量仅用于在遭遇异常时，生成错误信息。
        const names_notation = names.map(name => 
            (name.length > 1 ? '--' : '-') + name + (column.objected ? '-*' : '')).join(', ');
        names_notation_cache[column.name] = names_notation;

        let found = false;
        
        let value = null;
        if (column.multiple) value = [];
        if (column.objected) value = {};

        for (let i = 0; i < raw.options.length; i++) {
            let option = raw.options[i];
            let matched = caseSensitive ? names_matching(names, option.name) : names_matching(names_lc, option.name.toLowerCase());
            if (matched) {
                if (column.objected) {
                    let v = consumeOption(i, !column.assignable);
                    if (!column.nullable && typeof v == 'boolean') {
                        throw new Error(`option need to be valued: ${names_notation}`);
                    }
                    value[matched] = v;
                }
                else if (column.multiple) {
                    let v = consumeOption(i);
                    if (typeof v == 'boolean') {
                        throw new Error(`option need to be valued: ${names_notation}`);
                    }
                    value.push(v);
                }
                else {
                    if (found && !overwrite) {
                        throw new Error(`option not allowed to be duplicated: ${names_notation}`);
                    }
                    value = consumeOption(i, !column.assignable);
                }
                i--;
                found = true;
            }
        }

        if (found) {            
            parsedOptions[column.name] = value;
        }
    }

    if (raw.options.length) {
        if (def.explicit) {
            let names_notation = raw.options.map(option => (option.name.length > 1 ? '--' : '-') + option.name);
            throw new Error(`unknown options: ${names_notation}`);
        } else {
            while (raw.options.length) {
                let option = raw.options[0];
                parsedOptions[option.name] = consumeOption(0);
            }
        }
    }

    // 余项指没有归属于任何显式选项的命令行参数。
    // 在依据选项定义的 nonOption 属性消费余项之前，需要先删除已被其他选项显式占用的余项。
    raw.$ = raw.$.filter(v => v !== null);

    for (let I = 0; I < def.options.length; I++) {
        const column = def.options[I];
        const names_notation = names_notation_cache[column.name];
        let found = parsedOptions.hasOwnProperty(column.name);
        let value = parsedOptions[column.name];

        // 消费余项。
        if (!found && column.nonOption) {
            value = column.multiple ? [] : null;
            let matchedIndexes = [];
            for (let i = 0, $i; i < raw.$.length; i++) {
                $i = raw.$[i];
                if ($i === null) continue;
                if (column.nonOption($i, i)) {
                    // 将匹配项中余项数组中剥离。
                    raw.$[i] = null;

                    found = true;

                    // 如果选项支持重复项，则继续尝试匹配，否则终止。
                    if (column.multiple) {
                        value.push($i);
                    }
                    else {
                        value = column.assignable ? $i : true;
                        break;
                    }
                }
            }
            if (found) {
                parsedOptions[column.name] = value;
            }
        }

        if (found) {
            let reason = verifyArgument(column, value);
            if (reason) {
                throw new Error(`option invalid: ${names_notation}, ${reason}`);
            }
        }

        if (!found && column.required) {
            throw new Error(`option required: ${names_notation}`);
        }

        if (!found && column.hasOwnProperty('default')) {
            parsedOptions[column.name] = column.default;
        }

        if (found && column.parser) {
            parsedOptions[column.name] = column.parser(parsedOptions[column.name]);
        }
    }

    // 注意：因为选项可能依据 nonOption 属性又消费了一轮余项，因此这里有必要再筛选一次。
    parsedOptions.$ = raw.$.filter(v => v !== null);

    /**
     * Keep arguments after double-dash without any changes.
     * 保留非参余项。
     */
    parsedOptions['--'] = raw['--'];

    return parsedOptions;
}

function verifyArgument(column, value) {
    let reason = null;
        
    // Multiple argument.
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length && !reason; i++) {
            reason = verifyArgument(column, value[i]);
        }
        return reason;
    }

    // Objected argument.
    if (util.isObject(value)) {
        for (let name in value) {
            reason = verifyArgument(column, value[name]);
            if (reason) break;
        }
        return reason;
    }

    // Normal argument.
    if (!column.nullable && typeof value == 'boolean') {
        return `should be valued`;
    }

    if (column.enum && !column.enum.includes(value)) {
        return `should equal to ${column.enum.join('|')}`;
    }

    return reason;
}

/**
 * Parse command arguments one by one.
 * This method will not check if the argument(s) is valid or acceptable.
 * 逐一处理命令行参数。
 * 这个环节不会检查参数的合法性。
 * 
 * @param {Array} args 
 * @param {Object} def   - definition about arguments
 * @return { options: [ { name, value }, ... ], $: [ ... ], __: null | [ ... ] }
 */
/* private */ function parseRaw(args, def) {
    let raw = {
        /**
         * 原始的参数对象数组，每个参数对象包括 name 和 value 属性。
         * 
         * 如果命令行局部形如 --gender=male，那么就会生成一个对象:
         *   { name: 'gender', value: 'male' }
         * 
         * 如果命令行局部形如 --gender male，那么就会生成一个对象:
         *   { name: 'gender', value: 3 }
         * 这个数字代表一个索引，真正的参数值应到 $ 数组中检索。
         */
        options: [],

        /**
         * 以 - 或 -- 开头的参数片断以外的所有片断。 
         */
        $: [],

        /**
         * 双横线（double dash）之后的原始参数字符串数组。
         * 保留原始状态，不作解析。
         * 如果其值是 null，代表命令行中不存在独立的双横线。
         * 如果其值是 []（空数组），代表命令行以双横线结尾。
         */
        '--': null,
    };

    let parseArg = arg => {
        if (raw['--']) {
            raw['--'].push(arg);
            return;
        }

        if (arg == '--') {
            raw['--'] = [];
            return;
        }

        /**
         * An command line argument may be in form of:
         * 命令行参数可以是以下形式之一：
         *   -n            
         *   # argument in short style
         *   # 短格式
         *   
         *   --name        
         *   # argument in long style
         *   # 长格式
         * 
         *   --no-verbose     
         *   # means verbose == false
         *   # 取反。这种形式同时暗示 verbose 是一个无值的开关参数。
         * 
         *   --name=Ching  
         *   --name Ching
         *   # manes name == "Ching"
         */
        if (/^(-{1,2})(no-)?([^=]*)(=(.+))?$/i.test(arg)) {
            let dash = RegExp.$1;
            let no = RegExp.$2;
            let name = RegExp.$3;
            let value = RegExp.$4 ? RegExp.$5 : true;

            if (name.length == 0) {
                throw new Error(`incomprehensible option: ${arg}`);
            }
            else if (no) {
                if (dash.length == 1 || value !== true) {
                    throw new Error(`incomprehensible option: ${arg}`);
                }
                value = false;
                raw.options.push({
                    name,
                    value
                });
            } else if (dash.length == 1) {
                let names = name.split('');
                let lastname = names.pop();
                names.forEach(shortname => raw.options.push({
                    name: shortname,
                    value: true
                }));
                raw.options.push({
                    name: lastname,
                    value
                });
            } else {
                raw.options.push({
                    name,
                    value
                });
            }
        } else {
            raw.$.push(arg);

            // 如果上一个选项非 --no-* 形式选项，则标记其对应的值的序号。
            let last = raw.options[raw.options.length - 1];
            if (last && last.value === true) {
                last.value = raw.$.length - 1;
            }
        }
    };

    args.forEach(arg => {
        try {
            parseArg(arg);
        } catch (ex) {
            if (!def.ignoreInvalidArgument) throw ex;
        }
    });

    return raw;
}

/**
 * Parse command line or command arguments.
 * 解析命令行或命令行参数。
 * @param  {Object|string|string[]} cmd
 * @param  {Object} def
 * @param  {boolean} onlyArgs - PRIVATE
 */
function parseCommand(cmd, def, onlyArgs) {
    // ---------------------------
    // Argument Validation

    // Because `onlyArgs` is a private argument which may only be passed in by
    // `parseCommand.onlyArgs()`. It always occupies the third position in the 
    // argument list.
    // `onlyArgs` 是私有参数，因此无须考虑其位置的变化。

    let argv = null, readyMadeOptions = null;

    if (typeof arguments[0] == 'string') {
        argv = split(arguments[0], 
            /* splitter */ /\s+/, 
            /* string delimiters */ ['"', "'"], 
            /* escaper in delimiters */ '\\'
            );
        def = arguments[1];
    } 
    
    // If arguments look like (Array), the only array will be regarded as 
    // command line args.
    else if (arguments[0] instanceof Array) {
        argv = arguments[0].slice(0);
        def = arguments[1];
    } 

    // If the first argument is an object, it will be regarded as made-ready 
    // command line args ONLY IF the second argument exists and is *def*.
    else if (typeof arguments[0] == 'object' 
        && (typeof arguments[1] == 'object' || arguments[1] instanceof Array)) 
    {
        let cmd = arguments[0];
        def = arguments[1];

        readyMadeOptions = { 
            options: [],
            $: [],
            '--': null,
        };
        for (let name in cmd) {
            if (name == '$' || name == '--') {
                readyMadeOptions[name] = Array.isArray(cmd[name]) ? cmd[name] : [ cmd[name] ];
            }
            else {
                readyMadeOptions.options.push({ name, value: cmd[name] });
            }
        }
    }

    // If only one argument passed in, ...
    else {
        argv = process.argv.slice(1);
        def = arguments[0];
        onlyArgs = false;
    }

    if (def instanceof Array) {
        def = { options: def };
    }
    def = Object.assign({
        overwrite: true,
        caseSensitive: true,
        catcher: null,
        explicit: false,
        groups: null,
        options: [],
    }, def);

    let args = null;
    if (argv) args = onlyArgs ? argv : argv.slice(1);
    // @replaced 兼容 parseCommand.onlyArgs() 方法中的调用。
    // let [name, ...args] = argv;

    // ---------------------------
    // Main Process

    let parsedOptions = null;        
    try {
        let raw = readyMadeOptions || parseRaw(args, def);
        // @replaced
        // let raw = parseRaw(args, def);

        // If there are more than one groups, find the most matching one.
        // 如果参数定义中支持多个群组，则选择匹配程度最高的群组。
        if (def.groups && def.groups.length) {
            let reasons = [];
            let maxMatching = -1;
            for (let i = 0; i < def.groups.length; i++) {
                let rawcopy = safeClone(raw);
                let parsed = null;
                let matching = 0;
                def.options = def.groups[i].map(parseColumn);
                try {
                    parsed = parseOptions(rawcopy, def);

                    // 取匹配度最高的选项组。
                    def.options.forEach(option => {
                        if (parsed.hasOwnProperty(option.name)) matching++;
                    });
                    if (matching > maxMatching) {
                        maxMatching = matching;
                        parsedOptions = parsed;
                    }
                } catch (ex) {
                    reasons.push(ex);
                }
            }

            if (!parsedOptions) {
                let error = new Error('None of the option groups matched');
                error.reasons = reasons;
                throw error;
            }
        }
        else {
            def.options = def.options.map(parseColumn);
            parsedOptions = parseOptions(raw, def);
        }       
    } catch(ex) {
        if (def.catcher) def.catcher(ex);
        else throw ex;    
    }

    return parsedOptions;
}

/**
 * Same as parseCommand() but the command name itself is absent in `args`.
 * 此方法与 parseCommand() 方法的区别是输入的命令行参数被认为仅包含命令参数，即不包含命令名本身，
 * E.g.
 *   parseCommand('foo --name ching --age 18', def);
 *   parseCommand.onlyArgs('--name ching --age 18', def);
 */
parseCommand.onlyArgs = function(args, def) {
    return parseCommand(args, def, true);
};

module.exports = parseCommand;