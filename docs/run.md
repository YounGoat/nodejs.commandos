#   commandos.run()

This method help you to construct a command set easily.

Firstly, you should init a package with following files:

```bash
+ bin
  . mycommand.js
+ command
  + foo
    . index.js
    . help.txt
  + bar
    . index.js
    . help.txt
# ...
. package.json
```

Copy following code into main command `bin/mycommand.js`.
```javascript
#!/usr/bin/env node

const run = require('commandos/run');
const noda = require('noda');

let argv = process.argv.slice(2);
run(argv, {
    names : [ 'mycommand' ], // Only for being displayed.
    desc  : 'This is a command set.',
    root  : noda.inResolve('.'),
});
```

Copy following code into sub command `command/foo/index.js` and other sub commands.
```javascript
// This function will be invoked on `mycommand foo ...`.
// Pass-in `argv` is an array whose first item will be name of the sub command.
function command(argv) {
    // ...
}

command.desc = 'This is a sub command.';
module.exports = command;
```
