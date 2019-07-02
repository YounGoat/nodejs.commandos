// This function will be invoked on `mycommand foo ...`.
// Pass-in `argv` is an array whose first item will be name of the sub command.
function command(argv) {
    if (argv[0] == 'help') {
        console.log('Help info of sub command foo.');
        console.log();
    }
}

command.desc = 'Sub command foo.';
module.exports = command;