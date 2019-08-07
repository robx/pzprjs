// test/filedata_test.js

var assert = require('assert');

var pzpr = require('../../dist/js/pzpr.js');

var testdata = require('../load_testdata.js');

function assert_equal_board(bd1,bd2,iskanpen){
	var pid = bd1.pid;
	var ignore_qsub = (iskanpen && (pid==='fillomino'||pid==='hashikake'||pid==='heyabon'||pid==='kurodoko'||pid==='shikaku'||pid==='tentaisho'));
	bd1.compareData(bd2,function(group, c, a){
		if(ignore_qsub && (a==='qsub'||a==='qcmp')){ return;}
		assert.equal(bd2[group][c][a], bd1[group][c][a], group+'['+c+'].'+a);
	});
}

pzpr.variety.each(function(pid){
	describe(pid+' filedata test', function(){
		describe('File I/O', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			it('pzpr file', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PZPR);

				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2,false);});
			});
			if(!pzpr.variety(pid).exists.pencilbox){ return;}
			it('Kanpen file', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX);

				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2,true);});
			});
			it('Kanpen XML file', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX_XML);

				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2,true);});
			});
		});
	});
});
