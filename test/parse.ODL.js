'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

describe('ODL, option definition language', () => {
    it('formal name and alias', () => {
        let cmdtext = 'foo -C 1.0'; 
        let options = [ '--version -C' ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.version, '1.0');
    });

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