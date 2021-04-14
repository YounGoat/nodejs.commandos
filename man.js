/**
 * @author Youngoat@163.com
 * @create 2021-03-26
 */

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, manon = require('manon')
	
	/* in-package */
	, more = require('./lib/more')
	;

module.exports = function(helptext) {
	let text = manon.format(helptext, 'console');
	more(text);
};

