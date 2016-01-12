
global.document  = require('jsdom').jsdom('');
global.window    = document.defaultView;
global.navigator = window.navigator;

module.exports = require('./dist/pzpr.js');

