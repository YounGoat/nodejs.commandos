'use strict';

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

    , splitIntoNames = (name, prefixedWithDash) => {
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

function throwParseError(error, catcher) {
    if (typeof error == 'string') {
        error = new Error(error);
    }
    if (catcher) {
        catcher(error);
    } else {
        throw error;
    }
}

function parseColumn(desc, catcher) {
    let column = {
        name: null,
        alias: [],
        assignable: undefined,
        caseSensitive: undefined,
        multiple: undefined,
        nullable: undefined,
        overwrite: undefined,
    };

    if (typeof desc == 'string') {
        let inParentheses = [];

        desc = desc.replace(/\s*\([^)]+\)/g, (content) => {
            let index = inParentheses.length;
            content = content.trim();
            inParentheses.push(content.substring(1, content.length - 1));
            return `#${index}`;
        });

        let parts = desc.split(/\s+/g);

        if (1) {
            column.alias = splitIntoNames(parts[0]);
            column.name = column.alias.shift();
        }

        let decos = parts.slice(1).map(deco => deco.toLowerCase());
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
                case 'nullalbe':
                case 'assignable':
                case 'multiple':
                case 'overwrite':
                case 'caseSensitive':
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

    column.assignable = ifUndefined(column.assignable, true);
    column.nullable = ifUndefined(column.nullable, true);

    return column;
}

function parseOptions(raw, def) {
    // 从原始选项数据中提取指定位置的值。
    let consumeOption = (index, novalue) => {
        let option = raw.options.splice(index, 1)[0];
        let value = option.value;
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

    for (let I = 0; I < def.options.length; I++) {
        const column = def.options[I];

        let caseSensitive = ifUndefined(column.caseSensitive, def.caseSensitive);
        let overwrite = ifUndefined(column.overwrite, def.overwrite);

        // *names* includes formal name and alias.
        const names = [column.name].concat(column.alias);
        const names_lc = caseSensitive ? null : names.map(name => name.toLowerCase());
        const names_notation = names.map(name => (name.length > 1 ? '--' : '-') + name).join(', ');

        let found = false;
        let value = column.multiple ? [] : null;
        for (let i = 0; i < raw.options.length; i++) {
            let option = raw.options[i];
            let matched = caseSensitive ? names.includes(option.name) : names_lc.includes(option.name.toLowerCase());
            if (matched) {
                if (column.multiple) {
                    let v = consumeOption(i);
                    if (typeof v == 'boolean') {
                        throw new Error(`option need to be value: ${names_notation}`);
                    }
                    value.push(v);
                    i--;
                } else {
                    if (found && !overwrite) {
                        throw new Error(`option not allowed to be duplicated: ${names_notation}`);
                    }
                    value = consumeOption(i, !column.assignable);
                    i--;
                }
                found = true;
            }
        }

        if (found) {
            parsedOptions[column.name] = value;
        }

        if (found && !column.nullable && typeof value == 'boolean') {
            throw new Error(`option need to be valued: ${names_notation}`);
        }

        if (!found && column.required) {
            throw new Error(`option required: ${names_notation}`);
        }

        if (!found && column.default) {
            parsedOptions[column.name] = column.default;
        }

        if (found && column.parser) {
            parsedOptions[column.name] = column.parser(parsedOptions[column.name]);
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

    parsedOptions.$ = raw.$.filter(v => v != null);

    return parsedOptions;
}

function parseRaw(args, def) {
    let raw = {
        options: [],
        $: []
    };
    args.forEach(arg => {
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
    });

    return raw;
}

/**
 * @param  {string|string[]} cmd
 * @param  {Object} def
 */
function parseCommand(cmd, def) {

    // ---------------------------
    // Argument Validation

    let argv = null;

    if (typeof arguments[0] == 'string') {
        argv = split(arguments[0], /\s+/, ['"', "'"], '\\');
        def = arguments[1];
    } else if (arguments[0] instanceof Array) {
        argv = arguments[0].slice(0);
        def = arguments[1];
    } else {
        argv = process.argv.slice(1);
        def = arguments[0];
    }

    if (def instanceof Array) {
        def = {
            options: def
        }
    }
    def = Object.assign({
        overwrite: true,
        caseSensitive: true,
        explicit: false,
        catcher: null,
        groups: null,
        options: [],
    }, def);

    let [name, ...args] = argv;

    // ---------------------------
    // Main Process

    let throws = (fn) => {
        try {
            return fn();
        } catch (ex) {
            if (def.catcher) def.catcher(ex);
            else throw ex;    
        }
    };

    let raw = throws(() => parseRaw(args, def));
    let parsedOptions = null;
    if (def.groups && def.groups.length) {
        let reasons = [];
        let maxMatching = 0;
        for (let i = 0; i < def.groups.length; i++) {
            let rawcopy = safeClone(raw);
            let parsed = null;
            let matching = 0;
            def.options = throws(() => def.groups[i].map(parseColumn));
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
            if (def.catcher) def.catcher(error);
            else throw error;
        }
    }
    else {
        def.options = throws(() => def.options.map(parseColumn));
        parsedOptions = throws(() => parseOptions(raw, def));
    }
    
    return parsedOptions;
}

module.exports = parseCommand;