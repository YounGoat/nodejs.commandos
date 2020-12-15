#   commandos.run()

This method help you to construct a command set easily.

Firstly, you should init a package with following files:

```bash
+ bin
  . mycommand.js
+ command
  + foo
    . index.js
    . options.js
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

let args = process.argv.slice(2);
run(args, {
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

// The string will be used when command set help info is displayed.
command.desc = 'This is a sub command.';
module.exports = command;
```

If there is `options.js` or `options.json` existing in the subcommand directory, it will be required and used as the second argument passed to `commandos.parse()`. In such case, the subcommand function SHOULD receive an argument named `options` instead of `argv`:
```javascript
function command(options) {
    // `options` passed in will be an object containing already-parsed options instead of raw argv.
}
command.desc = 'This is a sub command.';
module.exports = command;
```

##  More Options

Now we understand the way to drive a command set via:
* __commandos.run__( string[] *args*, object *options* )

And we have introduced some properties of *options*. ALl available properties acceptable in *options* including:

* __name__ string  
  Top command name.

* __desc__ string  
  Desciption of the top command.

*	__commandDir__ string  
  Where sub commands located.

*	__beforeRun__( { string *name*, object *argv* } )  
  Here *name* is the matching sub command name.  
  The function will be invoked before sub command runs.

*	__afterRun__( { string *name*, object *argv*, *result*, *error* })  
  Here *name* is the matching sub command name.  
  The function will be invoked after sub command ends.
  
*	__alias__ [ *pesudo*, *target* ][]  
  Alias of existing sub commands.  
  
  
  
##  Command Alias 

To define command alias, set `options.alias` in `commandos.run(args, options)`.

Command alais is a 2-dimension array. Each item of *alias* is also an array with 2 items: The first represents an alias (*pesudo*), and the second represents the real command (*target*). Both *pesudo* and *target* may be a string or a string array. 

E.g.
```javascript
{ 
  alias: [
    [ /*pesudo*/ "about", /*target*/ [ "show", "about" ] ],
    [ /*pesudo*/ "manual", /*target*/[ "show", "help" ] ],
    [ /*pesudo*/ [ "who", "am", "i" ], /*taget*/ [ "show", "about" ]],
  ],
}
```

You may use place holders in pesudo command name or arguments. E.g.
```javascript
{ 
  alias: [
    [ /*pesudo*/ "get*", /*target*/ [ "do", "$0" ] ],
  ],
}
```
When command line `<TOP_COMAND> getItem` occurs, in this case, `<TOP_COMMAND> do getItem` will actually be executed.

ATTENTION: `$0` represents the first argument following top command name.
 