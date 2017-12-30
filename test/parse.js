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
        assert.equal(cmd.$.length, 0);
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

describe('parse, short options', () => {
    it('combined short options', () => {
        let cmdtext = 'foo -ab';
        let cmd = parseCommand(cmdtext);
        assert.strictEqual(cmd.a, true);
        assert.strictEqual(cmd.b, true);
    });

    it('combined short options and following value', () => {
        let cmdtext = 'foo -ab bravo';
        let cmd = parseCommand(cmdtext);
        assert.strictEqual(cmd.a, true);
        assert.equal(cmd.b, 'bravo');
    });
});

describe('parse, --name=value pattern', () => {
    it('long name', () => {
        let cmdtext = 'foo -v 1.0 --gender=male';
        let cmd = parseCommand(cmdtext);
        assert.equal(cmd.gender, 'male');
    });

    it('short name', () => {
        let cmdtext = 'foo -mv=1.0';
        let cmd = parseCommand(cmdtext);
        assert.strictEqual(cmd.m, true);
        assert.equal(cmd.v, '1.0');
    });

    it('--=value SHOULD throw exception', () => {
        let cmdtext = 'foo --=male';
        assert.throws(ex => parseCommand(cmdtext));
    });

    it('--no-<option> SHOULD NOT be assigned', () => {
        let cmdtext = 'foo --no-gender=male';
        assert.throws(ex => parseCommand(cmdtext));
    });

    it('ignore invalid argument', () => {
        let cmdtext = 'foo --=male --gender=male';
        let cmd = parseCommand(cmdtext, { ignoreInvalidArgument: true });
        assert.equal(cmd.gender, 'male');
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
        let cmdtext = 'foo';
        let options = [
            {
                name: 'version',
                default: '1.0'
            }
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.version, '1.0');
    });
});

describe('parse, option setting language', () => {
    it('assignable disabled', () => {
        let cmdtext = 'foo --version 1.0';
        let options = [ '--version NOT ASSIGNABLE' ];
        let cmd = parseCommand(cmdtext, options);
        assert.strictEqual(cmd.version, true);
        assert.equal(cmd.$.length, 1);
    });

    it('case-insenstive', () => {
        let cmdtext = 'foo --Version 1.0';
        let options = [ '--version NOT CASE_SENSITIVE' ];
        let settings = { caseSensitive: true, options };
        let cmd = parseCommand(cmdtext, settings);
        assert.equal(cmd.version, '1.0');
    });

    it('multiple enabled', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ '-v MULTIPLE', '-n MULTIPLE' ];
        let cmd = parseCommand(cmdtext, options);
        
        assert(cmd.v instanceof Array);
        assert.equal(cmd.v.length, 3);

        assert(!cmd.hasOwnProperty('n'));
    });

    it('multiple enabled, MUST NOT nullable enabled explicitly', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ '-v MULTIPLE NULL' ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('multiple enabled, MUST NOT assignable disabled explicitly', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ '-v MULTIPLE NOT ASSIGNABLE' ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('multiple enabled, MUST NOT overwrite enabled explicitly', () => {
        let cmdtext = 'foo -v 1.0 -v 2.0 -v 3.0';
        let options = [ '-v MULTIPLE OVERWRITE' ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('nullable disabled', () => {
        let cmdtext = 'foo -v';
        let options = [ '-v NOT NULL' ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('overwrite disabled', () => {
        let cmdtext = 'foo --version 1.0 -v 2.0';
        let options = [ '--version -v NOT OVERWRITE' ];
        let settings = { overwrite: true, options };
        assert.throws(() => parseCommand(cmdtext, settings));
    });

    it('required enabled', () => {
        let cmdtext = 'foo';
        let options = [ '--version REQUIRED' ];
        let settings = { overwrite: true, options };
        assert.throws(() => parseCommand(cmdtext, settings));
    });
});

describe('parse, option groups', () => {
    it('matched', () => {
        let cmdtext = 'foo -v 1.0';
        let groups = [
            [ '--help -h' ],
            [ '--version -v REQUIRED' ],
        ];
        let cmd = parseCommand(cmdtext, { groups });
        assert.strictEqual(cmd.version, '1.0');
    });

    it('not matched', () => {
        let cmdtext = 'foo';
        let groups = [
            [ '--help -h REQUIRED' ],
            [ '--version REQUIRED' ],
        ];
        try {
            let cmd = parseCommand(cmdtext, { groups });
            assert.fail('expected exception not throwed');
        } catch (ex) {
            assert(ex.reasons);
        }
    });
});