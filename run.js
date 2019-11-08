'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	
	/* NPM */
	, meant = require('meant')
	
	/* in-package */
	, parse = require('./parse')
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

	const names = fs.readdirSync(commandBaseDir);		
	if (subcommand) {
		let subcommandBase = `${commandBaseDir}/${subcommand}`;
		if (!names.includes(subcommand)) {
			console.error(`Sub command not found: ${subcommand}`);

			let similiars = meant(subcommand, names);
			switch (similiars.length) {
				case 0: 
					// DO NOTHING.
					break;

				case 1:
					console.log('Did you mean this?');
					console.log(`    ${similiars[0]}`);
					break;

				default:
					console.log('Did you mean one of these?');
					similiars.forEach(name => console.log(`    ${name}`));
			}
		}
		else if (argv[0] == 'help' && fs.existsSync(`${subcommandBase}/help.txt`)) {
			console.log(fs.readFileSync(`${commandBaseDir}/${subcommand}/help.txt`, 'utf8'));
		}
		else {
			let def = null;
			try {
				def = require(`${subcommandBase}/options`);
			} catch (error) {
				// DO NOTHING.
			}
			if (def) {
				argv.unshift(subcommand);
				try {
					argv = parse(argv, def);	
				} catch (error) {
					console.log(error.message);
					process.exit(1);
				}
			}
			require(`${commandBaseDir}/${subcommand}`)(argv);
		}
	}
	else {
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