'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    
    /* in-package */
    , parse = require('./parse')
    , run = require('./run')
    , man = require('./man')
    , isLatest = require('./isLatest')
    ;


module.exports = {
    isLatest,
    man,
    parse,
    run,
};