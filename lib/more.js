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
	let proc = spawn('more', { stdio: [ null, 'inherit', 'inherit' ] });
	proc.stdin.write(text);
	proc.stdin.end(os.platform() == 'darwin' ? os.EOL : null);
}

module.exports = more;