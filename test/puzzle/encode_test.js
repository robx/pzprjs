// test/encode_test.js

var assert = require('assert');

var pzpr = require('../../dist/js/pzpr.js');

var testdata = require('../load_testdata.js');

function assert_equal_board(bd1,bd2){
	bd1.compareData(bd2,function(group, c, a){
		assert.equal(bd2[group][c][a], bd1[group][c][a], group+'['+c+'].'+a);
	});
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
				var bd = puzzle.board, bd2 = bd.freezecopy();
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
				assert.equal(pzpr.parser(kanpen_url).pid, pid);

				var bd = puzzle.board, bd2 = bd.freezecopy();
				puzzle.open(kanpen_url, function(){ assert_equal_board(bd,bd2);});
			});
			if(pid!=='heyawake'){ return;}
			it('Heyawake-Applet URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var heywakeapp_url = puzzle.getURL(pzpr.parser.URL_HEYAAPP);
				assert.equal(pzpr.parser(heywakeapp_url).pid, pid);

				var bd = puzzle.board, bd2 = bd.freezecopy();
				puzzle.open(heywakeapp_url, function(){ assert_equal_board(bd,bd2);});
			});
		})(pid);});
	});
});
describe('Decoding routine', function(){ (function(){
	it('Large room number', function(){
		var puzzle = new pzpr.Puzzle();
		puzzle.open('factors/3/3');

		puzzle.board.getc(1,1).setQnum(16000);
		puzzle.open(puzzle.getURL());
		assert.equal(puzzle.board.getc(1,1).qnum, 16000);

		puzzle.board.getc(1,1).setQnum(372880);
		puzzle.open(puzzle.getURL());
		assert.equal(puzzle.board.getc(1,1).qnum, 372880);
	});
})();});
