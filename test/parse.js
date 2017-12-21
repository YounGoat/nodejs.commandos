'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

describe('parse, simple usage', () => {
    it('basic usage', () => {
        let cmdtext = 'foo -v 1.0 --male';
        let cmd = parseCommand(cmdtext);
        assert.equal(cmd.v, '1.0');
        assert.strictEqual(cmd.male, true);
    });

    it('parse short options', () => {
        let cmdtext = 'foo -ab';
        let cmd = parseCommand(cmdtext);
        assert.strictEqual(cmd.a, true);
        assert.strictEqual(cmd.b, true);
    });

    it('rename options', () => {
        let cmdtext = 'foo -v 1.0';
        let cmd = parseCommand(cmdtext, [ '--version -v' ]);
        assert.equal(cmd.version, '1.0');
    });

    it('options overwrited', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 --version 3.0';
        let cmd;
        
        cmd = parseCommand(cmdtext);
        assert.equal(cmd.v, '2.0');

        cmd = parseCommand(cmdtext, [ '-v --version' ]);
        assert.equal(cmd.v, '3.0');
    });
});

describe('parse, global settings', () => {
    it('case-insenstive', () => {
        let cmdtext = 'foo --Version 1.0';
        let options = [ '--version' ];
        let settings = { caseSensitive: false, options };
        let cmd = parseCommand(cmdtext, settings);
        assert.equal(cmd.version, '1.0');
    });


    it('explicit enabled', () => {
        let cmdtext = 'foo -v 1.0';
        let settings = { explicit: true };
        assert.throws(() => parseCommand(cmdtext, settings));
    });

    it('overwrite disabled', () => {
        let cmdtext = 'foo --version 1.0 -v 2.0';
        let options = [ '--version -v' ];
        let settings = { overwrite: false, options };
        assert.throws(() => parseCommand(cmdtext, settings));
    });
});

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
        assert.equal(cmd.v.length, 3);
    });

    it('multiple enabled, nullable := false implicated', () => {
        let cmdtext = 'foo -v -v 2.0 -v 3.0';
        let options = [ 
            { 
                name: 'v',
                multiple: true,
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
        let settings = { overwrite: true, options };
        assert.throws(() => parseCommand(cmdtext, settings));
    });
});