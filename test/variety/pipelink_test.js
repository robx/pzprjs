// test/variety/pipelink_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:pipelink',function(){
	it('Check line under question marks is connected', function(){
		puzzle.open('pipelink/3/2');

		puzzle.setMode('edit');
		puzzle.cursor.moveTo(1,1);
		puzzle.key.inputKeys('f','right','e');
		puzzle.cursor.moveTo(3,3);
		puzzle.key.inputKeys('e','right','s');

		assert.equal(puzzle.board.getc(1,1).lcnt, 1);
		assert.equal(puzzle.board.getc(3,1).lcnt, 1);

		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,1, 1,3, 3,3);
		puzzle.mouse.inputPath(3,1, 5,1, 5,3);

		assert.equal(puzzle.board.linegraph.components.length, 1);
		assert.equal(puzzle.check().complete, true);
	});

	it('Check horizontal T is split', function(){
		puzzle.open('pipelink/3/2');
		puzzle.setMode('play');
		var lg = puzzle.board.linegraph;

		puzzle.mouse.inputPath(1,1, 3,1, 3,3);
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 3);

		puzzle.mouse.inputPath(3,1, 5,1);
		assert.equal(lg.components.length, 2);
		assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 5);
	});

	it('Check vertical T is split', function(){
		puzzle.open('pipelink/2/3');
		puzzle.setMode('play');
		var lg = puzzle.board.linegraph;

		puzzle.mouse.inputPath(1,1, 1,3, 3,3);
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 3);

		puzzle.mouse.inputPath(1,3, 1,5);
		assert.equal(lg.components.length, 2);
		assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 5);
	});

	var runPUTest = function(ox, oy, dx, dy, dir, shape){
		puzzle.open('pipelink/3/3');
		puzzle.setMode('play');
		var lg = puzzle.board.linegraph;

		// 1,1 3,1 5,1 5,3 3,3
		switch(dir){
		case 'horiz':
			puzzle.mouse.inputPath(ox,oy, ox+dx,oy, ox+2*dx,oy, ox+2*dx,oy+dy, ox+dx,oy+dy);
			break;
		case 'vert':
			puzzle.mouse.inputPath(ox,oy, ox,oy+dy, ox,oy+2*dy, ox+dx,oy+2*dy, ox+dx,oy+dy);
			break;
		}
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 5);
		switch(shape){
		case 'U':
			// 3,3 1,3
			switch(dir){
			case 'horiz': puzzle.mouse.inputPath(ox+dx,oy+dy, ox,oy+dy); break;
			case 'vert':  puzzle.mouse.inputPath(ox+dx,oy+dy, ox+dx,oy); break;
			}
			assert.equal(lg.components.length, 1);
			assert.equal(lg.components[0].nodes.length, 6);
			// 3,3 3,1
			switch(dir){
			case 'horiz': puzzle.mouse.inputPath(ox+dx,oy+dy, ox+dx,oy); break;
			case 'vert':  puzzle.mouse.inputPath(ox+dx,oy+dy, ox,oy+dy); break;
			}
			assert.equal(lg.components.length, 2);
			assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 8);
			break;
		case 'P':
			// 3,3 3,1
			switch(dir){
			case 'horiz': puzzle.mouse.inputPath(ox+dx,oy+dy, ox+dx,oy); break;
			case 'vert':  puzzle.mouse.inputPath(ox+dx,oy+dy, ox,oy+dy); break;
			}
			assert.equal(lg.components.length, 1);
			assert.equal(lg.components[0].nodes.length, 6);
			// 3,3 1,3
			switch(dir){
			case 'horiz': puzzle.mouse.inputPath(ox+dx,oy+dy, ox,oy+dy); break;
			case 'vert':  puzzle.mouse.inputPath(ox+dx,oy+dy, ox+dx,oy); break;
			}
			assert.equal(lg.components.length, 2);
			assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 8);
			break;
		}
	};
	var orientations = [
		{ox: 1, oy: 1, dx: 2, dy: 2},
		{ox: 5, oy: 1, dx:-2, dy: 2},
		{ox: 1, oy: 5, dx: 2, dy:-2},
		{ox: 5, oy: 5, dx:-2, dy:-2}
	];
	it('Check components are split up, U horizontal', function(){
		orientations.forEach(o => {
			runPUTest(o.ox, o.oy, o.dx, o.dy, 'horiz', 'U');
		});
	});
	it('Check components are split up, U vertical', function(){
		orientations.forEach(o => {
			runPUTest(o.ox, o.oy, o.dx, o.dy, 'vert', 'U');
		});
	});
	it('Check components are split up, P horizontal', function(){
		orientations.forEach(o => {
			runPUTest(o.ox, o.oy, o.dx, o.dy, 'horiz', 'P');
		});
	});
	it('Check components are split up, P vertical', function(){
		orientations.forEach(o => {
			runPUTest(o.ox, o.oy, o.dx, o.dy, 'vert', 'P');
		});
	});

	it('Check we can attach to split components', function(){
		puzzle.open('pipelink/2/3');
		puzzle.setMode('play');
		var lg = puzzle.board.linegraph;

		puzzle.mouse.inputPath(1,1, 1,3, 3,3);
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 3);

		puzzle.mouse.inputPath(1,3, 1,5);
		assert.equal(lg.components.length, 2);
		assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 5);

		puzzle.mouse.inputPath(3,3, 3,5);
		assert.equal(lg.components.length, 2);
		assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 6);
	});

	it('Check undo works through splitting', function(){
		puzzle.open('pipelink/2/3');
		puzzle.setMode('play');
		var lg = puzzle.board.linegraph;

		puzzle.mouse.inputPath(1,1, 1,3, 3,3);
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 3);

		puzzle.mouse.inputPath(1,3, 1,5);
		assert.equal(lg.components.length, 2);
		assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 5);

		puzzle.undo();
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 3);

		puzzle.mouse.inputPath(1,3, 1,5);
		assert.equal(lg.components.length, 2);
		assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 5);

		puzzle.mouse.inputPath(1,3, 3,3);
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 3);

		puzzle.mouse.inputPath(3,5, 3,3, 1,3);
		assert.equal(lg.components.length, 2);
		assert.equal(lg.components[0].nodes.length+lg.components[1].nodes.length, 6);

		puzzle.mouse.inputPath(3,5, 1,5);
		assert.equal(lg.components.length, 1);
		assert.equal(lg.components[0].nodes.length, 6);
	});
});
