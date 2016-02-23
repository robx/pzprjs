// test/load_testdata.js
// jshint node:true, browser:false, esnext:true

var pzpr = require('../dist/pzpr.js');

// Load test data
var testdata = {};
global.ui = {debug:{addDebugData: function(pid,data){
	testdata[pid] = data;
	testdata[pid].fullfile = data.failcheck[data.failcheck.length-1][1];
}}};
pzpr.variety.each(function(pid){
	require('./script/test_'+pid+'.js');
});

module.exports = testdata;
