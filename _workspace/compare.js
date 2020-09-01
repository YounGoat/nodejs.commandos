#!/usr/bin/env node

/**
 * ./compare.js --name YounGoat --gender Male -- i -am --ching
 */

const minimist = require('minimist');
const commandos = require('commandos');

let options1 = minimist(process.argv.slice(2), { '--': true });
console.log();
console.log('-- PARSED BY minimist() --');
console.log(JSON.stringify(options1, null, 4));

let options2 = commandos.parse();
console.log();
console.log('-- PARSED BY commandos.parse() --');
console.log(JSON.stringify(options2, null, 4));

console.log();
