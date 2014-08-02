#!js
var cjsBundler = require('../lib/wheaty-cjs-bundler/bundler.js');
module.exports = cjsBundler("src/main.js", ["lib"]);
