/**
 * @author Youngoat@163.com
 * @create 2021-01-19
 */

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, os = require('os')
	, spawn = require('child_process').spawn	
	
	/* NPM */
	
	/* in-package */
	;

function more(text) {
	let proc = spawn('more', [ '-R' ], { stdio: [ null, 'inherit', 'inherit' ] });
	proc.stdin.write(text);
	proc.stdin.end(null);
}

module.exports = more;