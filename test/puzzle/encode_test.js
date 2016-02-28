// test/encode_test.js
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
	describe(pid+' encode test', function(){
		describe('URL', function(){ (function(pid){
			var puzzle = new pzpr.Puzzle();
			it('open PID', function(){
				assert.doesNotThrow(()=>puzzle.open(pid));
			});
			it('pzpr URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var urlstr = puzzle.getURL();
				var expurl = 'http://pzv.jp/p.html?'+pzpr.variety(pid).urlid+'/'+testdata[pid].url;
				assert.equal(urlstr, expurl);
			});
			it('pzpr invalid URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var urlstr = puzzle.getURL();
				assert.doesNotThrow(function(){
					puzzle.open(urlstr+urlstr, function(){
						if(pid!=='icebarn'&&pid!=='icelom'&&pid!=='icelom2'&&pid!=='mejilink'&&pid!=='yajitatami'){
							assert_equal_board(bd,bd2);
						}
					});
					assert.equal(puzzle.ready, true);
				});
			});
			if(!pzpr.variety(pid).exists.kanpen){ return;}
			it('kanpen URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var kanpen_url = puzzle.getURL(pzpr.parser.URL_KANPEN);
				assert.equal(pzpr.parser.parse(kanpen_url).pid, pid);

				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				puzzle.open(kanpen_url, function(){ assert_equal_board(bd,bd2);});
			});
			if(pid!=='heyawake'){ return;}
			it('Heyawake-Applet URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var heywakeapp_url = puzzle.getURL(pzpr.parser.URL_HEYAAPP);
				assert.equal(pzpr.parser.parse(heywakeapp_url).pid, pid);

				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				puzzle.open(heywakeapp_url, function(){ assert_equal_board(bd,bd2);});
			});
		})(pid);});
	});
});
