// test/pzpr/parser_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('changeProperPid:URL',function(){
	it('Check bonsan', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?bonsan/5/5/000000003h2i0j1g1n0g';
		var pzl = pzpr.parser(url);
		assert.equal('bonsan', pzl.pid);

		puzzle.open(url);
		assert.equal('bonsan', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?bonsan/c/5/5/3h2i0j1g1n0g', puzzle.getURL());
	});
	it('Check heyabon', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?bonsan/5/5/co360rr0g1h0g.j121g3h1h.g.g';
		var pzl = pzpr.parser(url);
		assert.equal('heyabon', pzl.pid);

		puzzle.open(url);
		assert.equal('heyabon', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?heyabon/5/5/co360rr0g1h0g.j121g3h1h.g.g', puzzle.getURL());
	});

	it('Check icelom', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?icelom/a/6/6/9e50an10i3zl2g1i/15/4';
		var pzl = pzpr.parser(url);
		assert.equal('icelom', pzl.pid);

		pzl = pzpr.parser('icelom/5/5');
		assert.equal('icelom', pzl.pid);

		puzzle.open(url);
		assert.equal('icelom', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?icelom/a/6/6/9e50an10i3zl2g1i/15/4', puzzle.getURL());
	});
	it('Check icelom2', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?icelom/6/6/1at0bl80h3p4g5j2g1p6h/0/9';
		var pzl = pzpr.parser(url);
		assert.equal('icelom2', pzl.pid);

		pzl = pzpr.parser('icelom/5/5/1');
		assert.equal('icelom2', pzl.pid);

		puzzle.open(url);
		assert.equal('icelom2', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?icelom2/6/6/1at0bl80h3p4g5j2g1p6h/0/9', puzzle.getURL());
	});

	it('Check kramma', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?kramma/5/5/g9ock3ba9i';
		var pzl = pzpr.parser(url);
		assert.equal('kramma', pzl.pid);

		puzzle.open(url);
		assert.equal('kramma', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?kramma/c/5/5/9ock3ba9i', puzzle.getURL());
	});
	it('Check kramman', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?kramma/5/5/32223i3f2fb99i';
		var pzl = pzpr.parser(url);
		assert.equal('kramman', pzl.pid);

		puzzle.open(url);
		assert.equal('kramman', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?kramman/5/5/32223i3f2fb99i', puzzle.getURL());
	});

	it('Check pipelink', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?pipelink/5/5/mamejan';
		var pzl = pzpr.parser(url);
		assert.equal('pipelink', pzl.pid);

		puzzle.open(url);
		assert.equal('pipelink', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?pipelink/5/5/mamejan', puzzle.getURL());
	});
	it('Check pipelinkr', function(){
		var url = 'http://indi.s58.xrea.com/pipelink/sa/q.html?/5/5/ma0j000j0fm';
		var pzl = pzpr.parser(url);
		assert.equal('pipelinkr', pzl.pid);

		puzzle.open(url);
		assert.equal('pipelinkr', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?pipelinkr/5/5/ma0j2j0fm', puzzle.getURL());
	});

	it('Check ichimaga', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?ichimaga/5/5/gdiedgdbic';
		var pzl = pzpr.parser(url);
		assert.equal('ichimaga', pzl.pid);

		puzzle.open(url);
		assert.equal('ichimaga', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?ichimaga/5/5/gdiedgdbic', puzzle.getURL());
	});
	it('Check ichimagam', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?ichimaga/m/5/5/7cgegbegbgcc';
		var pzl = pzpr.parser(url);
		assert.equal('ichimagam', pzl.pid);

		puzzle.open(url);
		assert.equal('ichimagam', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?ichimagam/5/5/7cgegbegbgcc', puzzle.getURL());
	});
	it('Check ichimagax', function(){
		var url = 'http://indi.s58.xrea.com/pzpr/v3/p.html?ichimaga/x/5/5/g8bgedgbeg8b';
		var pzl = pzpr.parser(url);
		assert.equal('ichimagax', pzl.pid);

		puzzle.open(url);
		assert.equal('ichimagax', puzzle.pid);
		assert.equal('http://pzv.jp/p.html?ichimagax/5/5/g8bgedgbeg8b', puzzle.getURL());
	});
});
describe('changeProperPid:File',function(){
	it('Check bonsan', function(){
		var filedata = 'pzprv3/bonsan/5/5/3 . . 2 . /. . 0 . . /. . 1 . 1 /. . . . . /. . . 0 . /2 1 0 0 0 /2 0 1 0 1 /2 0 0 0 2 /1 0 1 0 2 /0 0 0 1 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 0 0 0 1 /1 0 1 0 0 /0 0 0 0 0 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('bonsan', pzl.pid);

		puzzle.open(filedata);
		assert.equal('bonsan', puzzle.pid);
		assert.equal(filedata, puzzle.getFileData());
	});
	it('Check heyabon', function(){
		var filedata = 'pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('heyabon', pzl.pid);

		puzzle.open(filedata);
		assert.equal('heyabon', puzzle.pid);
		assert.equal(filedata.replace('bonsan','heyabon'), puzzle.getFileData());
	});

	it('Check icelom', function(){
		var filedata = 'pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 1 0 /0 0 1 1 0 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 0 1 1 1 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 1 0 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('icelom', pzl.pid);

		puzzle.open(filedata);
		assert.equal('icelom', puzzle.pid);
		assert.equal(filedata, puzzle.getFileData());
	});
	it('Check icelom2', function(){
		var filedata = 'pzprv3/icelom/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 1 0 1 1 0 /0 0 0 0 0 0 0 /0 0 1 1 0 0 0 /0 0 0 1 1 0 0 /0 0 0 1 1 0 0 /0 1 1 0 1 1 0 /1 0 0 0 0 0 /1 1 1 1 0 1 /1 1 1 1 0 1 /1 0 1 0 0 1 /1 0 0 0 1 1 /1 0 1 0 0 1 /0 0 0 1 0 0 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('icelom2', pzl.pid);

		puzzle.open(filedata);
		assert.equal('icelom2', puzzle.pid);
		assert.equal(filedata.replace('icelom','icelom2'), puzzle.getFileData());
	});

	it('Check kramma', function(){
		var filedata = 'pzprv3/kramma/5/5/1 . . 2 2 /. 1 1 . 2 /. 2 . 1 . /1 . 2 1 . /1 1 . . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 -1 /-1 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /1 1 1 1 1 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('kramma', pzl.pid);

		puzzle.open(filedata);
		assert.equal('kramma', puzzle.pid);
		assert.equal(filedata, puzzle.getFileData());
	});
	it('Check kramman', function(){
		var filedata = 'pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 1 0 1 /1 1 -1 0 /1 1 1 0 /1 -1 1 0 /0 0 1 0 /0 0 0 0 1 /1 1 1 -1 0 /0 -1 1 1 1 /0 1 1 1 1 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('kramman', pzl.pid);

		puzzle.open(filedata);
		assert.equal('kramman', puzzle.pid);
		assert.equal(filedata.replace('kramma','kramman'), puzzle.getFileData());
	});

	it('Check pipelink', function(){
		var filedata = 'pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 -1 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 0 /1 1 0 1 /1 1 1 0 1 /-1 1 1 1 1 /1 1 1 0 1 /1 0 1 1 1 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('pipelink', pzl.pid);

		puzzle.open(filedata);
		assert.equal('pipelink', puzzle.pid);
		assert.equal(filedata.replace('circle','pipe'), puzzle.getFileData());
	});
	it('Check pipelinkr', function(){
		var filedata = 'pzprv3/pipelink/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /1 0 1 1 /1 1 1 1 /1 1 1 1 /0 1 1 0 /1 1 0 1 /1 1 1 0 1 /0 1 1 0 0 /1 1 1 0 1 /1 0 1 1 1 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('pipelinkr', pzl.pid);

		puzzle.open(filedata);
		assert.equal('pipelinkr', puzzle.pid);
		assert.equal(filedata.replace('pipelink','pipelinkr'), puzzle.getFileData());
	});

	it('Check ichimaga', function(){
		var filedata = 'pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 0 0 /0 1 1 1 /1 1 0 1 /1 1 0 0 /0 0 0 1 /1 1 1 0 0 /1 0 1 0 1 /1 0 0 1 1 /0 0 0 1 1 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('ichimaga', pzl.pid);

		puzzle.open(filedata);
		assert.equal('ichimaga', puzzle.pid);
		assert.equal(filedata, puzzle.getFileData());
	});
	it('Check ichimagam', function(){
		var filedata = 'pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /0 -1 1 1 /0 0 0 0 /1 0 0 1 /1 1 1 1 0 /0 1 0 1 0 /1 1 1 1 1 /1 1 0 1 1 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('ichimagam', pzl.pid);

		puzzle.open(filedata);
		assert.equal('ichimagam', puzzle.pid);
		assert.equal(filedata.replace('ichimaga','ichimagam'), puzzle.getFileData());
	});
	it('Check ichimagax', function(){
		var filedata = 'pzprv3/ichimaga/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . . /. 3 . 1 . /1 1 0 0 /0 1 1 0 /1 1 1 1 /0 1 1 0 /1 1 0 0 /1 1 1 1 0 /1 0 1 0 0 /1 0 1 0 0 /1 1 1 1 0 /'.replace(/\//g,'\n');
		var pzl = pzpr.parser(filedata);
		assert.equal('ichimagax', pzl.pid);

		puzzle.open(filedata);
		assert.equal('ichimagax', puzzle.pid);
		assert.equal(filedata.replace('ichimaga','ichimagax'), puzzle.getFileData());
	});
});
describe('avoidEraseLastChar',function(){
	it('Encode url with dot last charactor', function(){
		var pzl = pzpr.parser('http://pzv.jp/p.html?shakashaka/5/5/zj./');
		assert.equal(pzl.body, 'zj.');
		assert.equal(pzl.generate(), 'http://pzv.jp/p.html?shakashaka/5/5/zj./');

		puzzle.open('shakashaka/5/5');

		puzzle.board.getc(9,9).setQnum(-2);
		assert.equal(puzzle.getURL(), 'http://pzv.jp/p.html?shakashaka/5/5/zj./');

		puzzle.board.getc(9,9).setQnum(-1);
		assert.equal(puzzle.getURL(), 'http://pzv.jp/p.html?shakashaka/5/5/zk');

		puzzle.open('http://pzv.jp/p.html?shakashaka/5/5/zj./', function(){ assert.equal(puzzle.board.getc(9,9).qnum, -2);});
	});
});
