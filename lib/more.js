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
	let command, args = [];
	switch (os.platform()) {
		case 'darwin':
			command = 'less';
			args = [ '-R' ];
			break;

		case 'linux':
			command = 'less';
			args = [ '-R' ];
			break;

		case 'win32':
			command = 'more';
			break;
	}
	if (command) {
		let proc = spawn(command, args, { stdio: [ null, 'inherit', 'inherit' ] });
		proc.stdin.write(text);
		proc.stdin.end(null);
	}
	else {
		process.stdout.write(text);
	}
}

module.exports = more;