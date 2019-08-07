// test/render.js
// jshint node:true, browser:false, esnext:true
/* global describe:false, it:false */

var pzpr = require('../../dist/js/pzpr.js');

var testdata = require('../load_testdata.js');

pzpr.variety.each(function(pid){
	describe(pid+' render test', function(){
		it('render svg', function(){
			var puzzle = new pzpr.Puzzle();
			puzzle.open(pid+'/'+testdata[pid].url, () => {
				puzzle.toBuffer('svg', 0, 30);
			});
		});
	});
});

