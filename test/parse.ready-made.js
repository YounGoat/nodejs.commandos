'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

describe('parse with ready-made options', () => {
    it('basic usage', () => {
        let options = { version: '1.0', $: [1,2] };
        
        // The second argument is necessary to avoid ambiguity.
        let cmd = parseCommand(options, {});

        assert.equal(cmd.version, '1.0');
        assert.deepEqual([1,2], cmd.$)
    });

    it('when $ is scalar', () => {
        let options = { $: '1.0' };

        // The second argument is necessary to avoid ambiguity.
        let cmd = parseCommand(options, {});

        assert.deepEqual(['1.0'], cmd.$);
    });

    it('rename options', () => {
        let options = { v: '1.0' };
        let def = {
            options: [ '--version -v' ],
        };
        let cmd = parseCommand(options, def);
        assert.equal(cmd.version, '1.0');
    });

    it('validate options', () => {
        let options = { v: '1.0' };
        let def = {
            options: [ '--version REQUIRED ' ],
        };
        assert.throws(() => parseCommand(options, def));
    });
});