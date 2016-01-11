// jshint ignore:start

// Pre-setting to use puzzle.toDataURL() in node.js environment
global.document  = require('jsdom').jsdom('');
global.window    = document.defaultView;
global.navigator = window.navigator;

var pzpr = require('../dist/pzpr.js'); // jshint ignore:line

var puzzle = new pzpr.Puzzle().open('mashu/3/3');

console.log(puzzle.toDataURL(null,19));

// jshint ignore:end
