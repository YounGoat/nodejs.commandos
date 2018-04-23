'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

describe('parse, option objected', () => {
    it('basic usage', () => {
        let cmdtext = 'foo --meta-name Charley --meta-gender --co-name Delta --co-gender male';
        let options = [
            '--meta OBJECTED',
            '--co OBJECTED',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(Object.keys(cmd.meta).length, 2);
        assert.equal(Object.keys(cmd.co).length, 2);
        assert.strictEqual(cmd.meta.gender, true);        
    });

    it('only one occurance', () => {
        let cmdtext = 'foo --meta-name Charley';
        let options = [
            '--meta OBJECTED',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(Object.keys(cmd.meta).length, 1);
    });

    it('not null', () => {
        let cmdtext = 'foo --meta-name Charley --meta-gender';
        let options = [
            '--meta OBJECTED NOT NULL',
        ];
        assert.throws(() => parseCommand(cmdtext, options));
    });

    it('not assignable', () => {
        let cmdtext = 'foo --bool-name --bool-gender male';
        let options = [
            '--bool OBJECTED NOT ASSIGNABLE',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.strictEqual(cmd.bool.gender, true);
    });

    it('wildcard -* in name', () => {
        let cmdtext = 'foo --meta-name Charley --meta-gender male';
        let options = [
            '--meta-*',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(Object.keys(cmd.meta).length, 2);
    }); 
});