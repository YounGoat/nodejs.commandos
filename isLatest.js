/**
 * @author Youngoat@163.com
 * @create 2021-04-22
 */

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	, os = require('os')
	, path = require('path')
	
	/* NPM */
	, AsyncDir = require('qir/AsyncDir') 
	, htp = require('htp')
	, noda = require('noda')
	, semver = require('semver')
	
	/* in-package */
	;

/**
 * @param {string} [options.endpoint=http://registry.npmjs.com/]
 * @param {number} [options.expires=86400]
 */
async function isLatest(options) {
	options = Object.assign({ 
		'endpoint' : 'http://registry.npmjs.com/',
		'expires'  : 86400,
	}, options);

	let mainPackage = null;
	FIND_CURRENT_VERSION: {
		let pathname = require.main.filename;
		while(!mainPackage) {
			let parent = path.dirname(pathname);
			if (parent == pathname) break;

			pathname = parent;
			let filename = path.join(pathname, 'package.json');
			if (await new Promise(resolve => { fs.exists(filename, resolve) })) {
				let { name, version } = require(filename);
				mainPackage = { name, version };
			}
		}
	}

	if (!mainPackage) {
		throw 'Current entrypoint js does not belong to any package.';
	}

	let dir = new AsyncDir(path.join(os.homedir(), '.commandos', 'latest'));
	
	let retry = false;
	let info = await dir.stat(mainPackage.name);
	if (!info) {
		retry = true;
	}
	else if (Date.now() - info.mtimeMs > 1000 * options.expires) {
		retry = true;
	}
	
	if (retry) {
		let urlname = options.endpoint + mainPackage.name;
		let res = await htp.get(urlname).catch(ex => null);
		if (res && res.statusCode == 200) {
			let { body } = res;
			let distTags = body['dist-tags'];
			let latestVersion = distTags && distTags['latest'];
			console.log('latestVersion', latestVersion);
			await dir.writeFile(mainPackage.name, latestVersion);
		}
	}

	let latestVersion = await dir.readFile(mainPackage.name, 'utf8');
	return semver.eq(mainPackage.version, latestVersion);
}

module.exports = isLatest;