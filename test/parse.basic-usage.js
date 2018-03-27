'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

describe('parse, basic usage', () => {
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