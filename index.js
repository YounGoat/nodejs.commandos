'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    
    /* in-package */
    , parse = require('./parse')
    , run = require('./run')
    , man = require('./man')
    ;


module.exports = {
    man,
    parse,
    run,
};