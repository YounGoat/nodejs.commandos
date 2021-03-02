'use strict';

const { profileEnd } = require('console');

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	, os = require('os')
	
	/* NPM */
	, colors = require('colors')
	, meant = require('meant')
	, minimatch = require('minimatch')
	
	/* in-package */
	, parse = require('./parse')
	, more = require('./lib/more')
	;

/**
 * Command entrance.
 * @param {string[]}  argv     - command line arguments
 * @param {Object}    options  - basic info about the command set.
 *   
 * @param {string}    options.name
 * @param {string}    options.desc       - command description
 * @param {string}    options.commandDir - command description
 * @param {boolean}  [options.useManon]
 * @param {Function} [options.afterRun]
 * @param {Function} [options.beforeRun]
 * @param {Function} [options.onError]

 * -- deprecated params --
 * @param {string[]}  options.names - command name(s)
 * @param {string}    options.root  - parent directory of basic 'command' directory
 */
async function run(argv, options) {
	let printManual = text => {
		if (options.useManon) {
			text = require('manon').format(text, 'console');
		}
		more(text);
	};

	let commandName = null;
	let commandBaseDir = null;

	if (options.names) {
		commandName = options.names.join(' ');
		commandBaseDir = `${options.root}/command`;
		for (let i = 1; i < options.names.length; i++) {
			commandBaseDir = `${commandBaseDir}/${options.names[i]}/command`;
		}
	}
	else {
		commandName = options.name;
		commandBaseDir = options.commandDir;
	}

	let subCommand = null;
	if (argv.length && !argv[0].startsWith('-')) {
		subCommand = argv.shift();
	}

	/**
	 * subCommand "help" is a virtual one.
	 * Actually, "help foobar" is regarded as "foobar help".
	 */
	if (subCommand == 'help') {
		subCommand = argv[0];
		argv[0] = '--help';
	}

	const allSubCommandNames = fs.readdirSync(commandBaseDir);

	/**
	 * Replace with alais if match.
	 */
	if (subCommand && !allSubCommandNames.includes(subCommand) && options.alias) {
		options.alias.find(couple => {
			let [ pesudo, target ] = couple;
			if (!Array.isArray(pesudo)) {
				pesudo = [ pesudo ];
			}
			if (!Array.isArray(target)) {
				target = [ target ];
			}

			let [ pesudoSubCommand, ...pesudoArgs ] = pesudo;
			let [ targetSubCommand, ...targetArgs ] = target;

			if (minimatch(subCommand, pesudoSubCommand) 
				&& argv.length >= pesudoArgs.length
				&& pesudoArgs.every((s, index) => minimatch(argv[index], s))
				) {
				
				/**
				 * Replace place holders.
				 * 替换占位符。
				 */
				targetArgs = targetArgs.map(arg => {
					return arg.replace(/\$(\d+)/g, (placeholder, num) => {
						return num == 0 ? subCommand : argv[num - 1];
					});
				});
				
				argv = [].concat(targetArgs, argv.slice(pesudoArgs.length));
				subCommand = targetSubCommand;
				return true;
			}
		});
	}

	if (subCommand && !allSubCommandNames.includes(subCommand)) {
		let matching = allSubCommandNames.filter(name => name.startsWith(subCommand));
		if (matching.length == 1) {
			subCommand = matching[0];
		}
		else {
			console.error(`Sub command not found: ${subCommand}`);
			let similiars = meant(subCommand, allSubCommandNames);
			if (similiars.length > 0) {
				console.log(`Did you mean ${similiars.length == 1 ? 'this' : 'one of these'}?`);
				similiars.forEach(name => console.log(`- ${commandName} ${colors.blue(name)}`));
			}
			subCommand = null;			
		}
	}

	if (subCommand) {		
		let subCommandBase = `${commandBaseDir}/${subCommand}`;
		
		if ((argv[0] == 'help' || argv.includes('--help') || argv.includes('-h')) && fs.existsSync(`${subCommandBase}/help.txt`)) {
			printManual(fs.readFileSync(`${commandBaseDir}/${subCommand}/help.txt`, 'utf8'));
		}
		else {
			// Command name.
			let name = subCommand;

			let def = null;
			try {
				def = require(`${subCommandBase}/options`);
			} catch (error) {
				// DO NOTHING.
			}
			if (def) {
				try {
					argv = parse.onlyArgs(argv, def);	
				} catch (error) {
					console.log(error.message);
					process.exit(1);
				}
			}

			if (options.beforeRun) {
				await options.beforeRun({
					name,
					argv,
				});
			}

			let run = require(`${commandBaseDir}/${subCommand}`);
			let error = null;
			let result = null;

			/**
			 * The command function `run()` may be a normal function, 
			 * or someone (e.g. an async function) returns a Promise instance.
			 */
			try {
				result = run(argv);
			} catch (ex) {
				error = ex;
			}
			
			if (result instanceof Promise) {
				result = await result.catch(ex => error = ex);
			}

			if (options.afterRun) {
				await options.afterRun({
					name,
					argv,
					result,
					error,
				});
			}
			else if (error) {
				process.exitCode = 1;
				console.error(error);
			}

			/**
			 * @see https://tldp.org/LDP/abs/html/exitcodes.html 
			 * Exit Codes With Special Meanings
			 */
		}
	}

	// Display existing manual.
	else if (fs.existsSync(`${commandBaseDir}/help.txt`)) {
		printManual(fs.readFileSync(`${commandBaseDir}/help.txt`, 'utf8'));
	}

	// Generate and display manual.
	else {
		let manual = [];
		let L = line => manual.push(line);
		manual.push('');
		manual.push('NAME');
		manual.push(`\t${commandName} - ${options.desc}`);
		manual.push('');
		manual.push('SYNOPSIS');
		manual.push(`\t${commandName} help <sub-command-name>`);
		manual.push('\t# Show help info of specified sub command.');
		manual.push('');
		allSubCommandNames.forEach((name) => {
			name = name.replace(/\.js$/, '');
			try {
				manual.push(`\t${commandName} ${name}`);
				let run = require(`${commandBaseDir}/${name}`);
				if (run.desc) {
					run.desc.split(/[\r\n]+/).forEach(desc => {
						manual.push(`\t# ${desc}`);
					});
				}
				manual.push('');
			} catch (error) {
				// DO NOTHING.
				// Ignore invalid directory/file.
			}
		});

		if (options.alias && options.alias.length > 0) {
			manual.push('');
			manual.push('ALIAS');
			options.alias.forEach(couple => {
				let newname = Array.isArray(couple[0]) ? couple[0].join(' ') : couple[0];
				let oldname = Array.isArray(couple[1]) ? couple[1].join(' ') : couple[1];
				manual.push(`\t* \`${commandName} ${newname}\` = \`${commandName} ${oldname}\``);
			});
			manual.push('');
		}

		printManual(manual.join(os.EOL));
	}
}

module.exports = run;