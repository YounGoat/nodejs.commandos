#!/usr/bin/env node

const run = require('../../../run');
const noda = require('noda');

let argv = process.argv.slice(2);
run(argv, {
    names : [ 'mycommand' ], // Only for being displayed.
    desc  : 'This is a command set.',
    root  : noda.inResolve('.'),
});