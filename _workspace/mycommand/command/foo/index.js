// This function will be invoked on `mycommand foo ...`.
// Pass-in `options` is already parsed because options.json exists.
function command(options) {
    console.log('options:', options);
    console.log('--------');
    if (options.help) {
        console.log('Help info of sub command foo.');
        console.log();
    }
}

command.desc = 'Sub command foo.';
module.exports = command;