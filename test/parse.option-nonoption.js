'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , parseCommand = noda.inRequire('parse')
    ;

describe('parse, nonoption -> option', () => {
    it('fixed position, number', () => {
        let cmdtext = 'foo bar baz qux';
        let options = [
            '--help -h [0] NOT ASSIGNABLE',
            '--action [1]',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.strictEqual(cmd.help, true);
        assert.equal(cmd.action, 'baz');
    });

    it('accompanied by MULTIPLE', () => {
        let cmdtext = 'foo bar baz qux';
        let options = [
            '--help -h [0] NOT ASSIGNABLE',
            '--name [*] MULTIPLE',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.strictEqual(cmd.help, true);
        assert.equal(cmd.name.length, 2);
    });

    it('position range', () => {
        let cmdtext = 'foo A B C D E F';
        let options = [
            '-a [0]',
            '-b [>=1]',
            '-c [<3]',
            '-d [<3]',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.a, 'A');
        assert.equal(cmd.b, 'B');
        assert.equal(cmd.c, 'C');
        assert.equal(cmd.d, undefined);
    });

    it('mixed with named options', () => {
        let cmdtext = 'foo -a A B -d=D E -f F G';
        let options = [
            '-b [*]',
            '-e [*]',
            '-g [*]',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.b, 'B');
        assert.equal(cmd.e, 'E');
        assert.equal(cmd.g, 'G');
    });

    it('fixed value, := (equal)', () => {
        let cmdtext = 'foo bar baz start qux';
        let options = [
            '--action [*:=start]',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.action, 'start');
    });

    it('fixed value, :=* (case-insensitively equal)', () => {
        let cmdtext = 'foo bar baz START qux';
        let options = [
            '--action [*:=*start]',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.action, 'START');
    });

    it('fixed value, :~ (match)', () => {
        let cmdtext = 'foo bar baz start qux';
        let options = [
            '--action [*:~^s]',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.action, 'start');
    });

    it('fixed value, :~* (case-insensitively match)', () => {
        let cmdtext = 'foo bar baz START qux';
        let options = [
            '--action [*:~*^s]',
        ];
        let cmd = parseCommand(cmdtext, options);
        assert.equal(cmd.action, 'START');
    });
});