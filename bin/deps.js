#!/usr/bin/env node
var deps = require('../lib');

var script = process.argv[2];
var group = process.argv[3];

var code = deps(script, group);
process.exit(code);
