// test/filedata_test.js
// jshint node:true, browser:false, esnext:true
/* global describe:false, it:false */

var assert = require('assert');

var pzpr = require('../../dist/pzpr.js');

var testdata = require('../load_testdata.js');

var props = ['ques', 'qdir', 'qnum', 'qnum2', 'qchar', 'qans', 'anum', 'line', 'qsub', 'qcmp'];
function bd_freezecopy(bd1){
	var bd2 = {cell:[],cross:[],border:[],excell:[]};
	for(var group in bd2){
		for(var c=0;c<bd1[group].length;c++){
			bd2[group][c] = {};
			for(var a of props){ bd2[group][c][a] = bd1[group][c][a];}
		}
	}
	return bd2;
}
function assert_equal_board(bd1,bd2){
	for(var group in bd2){
		for(var c=0;c<bd1[group].length;c++){
			for(var a of props){ assert.equal(bd2[group][c][a], bd1[group][c][a], group+'['+c+'].'+a);}
		}
	}
}

pzpr.variety.each(function(pid){
	describe(pid+' filedata test', function(){
		describe('File I/O', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			it('pzpr file', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PZPR);

				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2);});
			});
			if(!pzpr.variety(pid).exists.pencilbox){ return;}
			var ignore_qsub = (pid==='fillomino'||pid==='hashikake'||pid==='heyabon'||pid==='kurodoko'||pid==='shikaku'||pid==='tentaisho');
			it('Kanpen file', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX);

				var props_sv = props;
				if(ignore_qsub){ props = ['ques', 'qdir', 'qnum', 'qnum2', 'qchar', 'qans', 'anum', 'line', 'qcmp'];}
				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2);});
				props = props_sv;
			});
			it('Kanpen XML file', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX_XML);

				var props_sv = props;
				if(ignore_qsub){ props = ['ques', 'qdir', 'qnum', 'qnum2', 'qchar', 'qans', 'anum', 'line', 'qcmp'];}
				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2);});
				props = props_sv;
			});
		});
	});
});
