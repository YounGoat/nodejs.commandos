'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

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
