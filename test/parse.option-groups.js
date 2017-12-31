'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

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