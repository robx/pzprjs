// test/answer_test.js

var assert = require('assert');

var pzpr = require('../../dist/pzpr.js');

var testdata = require('../load_testdata.js');

pzpr.variety.each(function(pid){
	describe(pid+' answer test', function(){
		describe('Answer check', function(){
			var puzzle = new pzpr.Puzzle();
			puzzle.setConfig('forceallcell',true);
			testdata[pid].failcheck.forEach(function(testcase){
				it('Check: '+testcase[0], function(){
					puzzle.open(testcase[1]);
					assert.equal(puzzle.check(true)[0], testcase[0]);
				});
			});
		});
	});
});
