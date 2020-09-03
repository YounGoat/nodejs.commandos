'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

describe('parse, option settings', () => {
    it('assignable disabled', () => {
        let cmdtext = 'foo --version 1.0';
        let options = [ 
            { 
                name: 'version',
                assignable: false,
            }
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.strictEqual(cmd.version, true);
        assert.equal(cmd.$.length, 1);
    });

    it('case-insenstive', () => {
        let cmdtext = 'foo --Version 1.0';
        let options = [ 
            { 
                name: 'version',
                caseSensitive: false,
            }
        ];
        let settings = { caseSensitive: true, options };
        let cmd = parseCommand(cmdtext, settings);
        assert.equal(cmd.version, '1.0');
    });

    it('multiple enabled', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ 
            { 
                name: 'v',
                multiple: true,
            }
        ];
        let cmd = parseCommand(cmdtext, options);
        assert(cmd.v instanceof Array);
        assert.equal(cmd.v.length, 3);
    });

    it('multiple enabled, MUST NOT nullable enabled explicitly', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ 
            { 
                name: 'v',
                multiple: true,
                nullable: true,
            }
        ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('multiple enabled, MUST NOT assignable disabled explicitly', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ 
            { 
                name: 'v',
                multiple: true,
                assignable: false,
            }
        ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('multiple enabled, MUST NOT overwrite enabled explicitly', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ 
            { 
                name: 'v',
                multiple: true,
                overwrite: true,
            }
        ];
        assert.throws(() => parseCommand(cmdtext, options));
    });
    

    it('nullable disabled', () => {
        let cmdtext = 'foo -v';
        let options = [ 
            { 
                name: 'v',
                nullable: false,
            }
        ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('overwrite disabled', () => {
        let cmdtext = 'foo --version 1.0 -v 2.0';
        let options = [ 
            { 
                name: 'version',
                alias: 'v',
                overwrite: false,
            }
        ];
        let settings = { overwrite: true, options };
        assert.throws(() => parseCommand(cmdtext, settings));
    });

    it('required enabled', () => {
        let cmdtext = 'foo';
        let options = [ 
            { 
                name: 'version',
                required: true,
            }
        ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('required disabled', () => {
        let cmdtext = 'foo';
        let options = [ 
            { 
                name: 'version',
                alias: 'v',
                required: false,
            }
        ];
        parseCommand(cmdtext, options);
    });

    it('default value', () => {
        let cmdtext = 'foo --name';
        let options = [
            { name: 'version', default: '1.0' },
            { name: 'name', default: undefined },
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.version, '1.0');
        assert.equal(cmd.name, true);
    });

    it('enum', () => {
        let cmdtext = 'foo --gender man';
        let options = [ 
            { 
                name: 'gender',
                enum: [ 'male', 'female' ],
            }
        ];
        assert.throws(() => parseCommand(cmdtext, options));
    });
});