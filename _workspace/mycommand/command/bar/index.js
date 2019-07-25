// This function will be invoked on `mycommand bar ...`.
// Pass-in `argv` is an array whose first item will be name of the sub command.
function command(argv) {
    // ...
    console.log('argv:', argv);
    console.log('--------');
}

command.desc = 'Sub command bar.';
module.exports = command;