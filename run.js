'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	
	/* NPM */
	
	/* in-package */
	;

/**
 * Command entrance.
 * @param  {string[]}  argv          - command line arguments
 * @param  {Object}    options    
 * @param  {string[]}  options.names - command name(s)
 * @param  {string}    options.desc  - command description
 * @param  {string}    options.root  - parent directory of basic 'command' directory
 */
function run(argv, options) {
	let commandName = options.names.join(' ');

	let commandBaseDir = `${options.root}/command`;
	for (let i = 1; i < options.names.length; i++) {
		commandBaseDir = `${commandBaseDir}/${options.names[i]}/command`;
	}

	let subcommand = null;
	if (argv.length && !argv[0].startsWith('-')) {
		subcommand = argv.shift();
	}

	// Subcommand "help" is a virtual one.
	if (subcommand == 'help') {
		subcommand = argv[0];
		argv[0] = 'help';
	}

	if (subcommand) {
		if (!fs.existsSync(`${commandBaseDir}/${subcommand}`)) {
			console.error(`sub command not found: ${subcommand}`);
		}
		else if (fs.existsSync(`${commandBaseDir}/${subcommand}/help.txt`)) {
			console.log(fs.readFileSync(`${commandBaseDir}/${subcommand}/help.txt`, 'utf8'));
		}
		else {
			require(`${commandBaseDir}/${subcommand}`)(argv);
		}
	}
	else {
		let names = fs.readdirSync(commandBaseDir);
		console.log();
		console.log('NAME');
		console.log(`\t${commandName} - ${options.desc}`);
		console.log();
		console.log('SYNOPSIS');
		console.log(`\t${commandName} help <sub-command-name>`);
		console.log('\tShow help info of specified sub command.');
		console.log();
		names.forEach((name) => {
			name = name.replace(/\.js$/, '');
			try {
				console.log(`\t${commandName} ${name}`);
				let run = require(`${commandBaseDir}/${name}`);
				if (run.desc) {
					console.log(`\t${run.desc}`);
				}
				console.log();
			} catch (error) {
				// DO NOTHING.
				// Ignore invalid directory/file.
			}
		});

		if (options.alias && options.alias.length > 0) {
			console.log();
			console.log('ALIAS');
			options.alias.forEach(couple => {
				let newname = Array.isArray(couple[0]) ? couple[0].join(' ') : couple[0];
				let oldname = Array.isArray(couple[1]) ? couple[1].join(' ') : couple[1];

				console.log(`\t${commandName} ${newname} = ${commandName} ${oldname}`);
			});
			console.log();
		}
	}
}

module.exports = run;