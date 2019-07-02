// This function will be invoked on `mycommand foo ...`.
// Pass-in `argv` is an array whose first item will be name of the sub command.
function command(argv) {
    // ...
}

command.desc = 'Sub command bar.';
module.exports = command;