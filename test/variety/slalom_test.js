// test/general.js
// jshint node:true, browser:false, esnext:true
/* global describe:false, it:false */

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:slalom',function(){
	it('Check gate number', function(){
		puzzle.open('slalom/4/7');
		puzzle.mouse.inputPath(1,1, 1,5);
		
		puzzle.cursor.init(3,3);
		puzzle.key.inputKeys('q','down','q','down','q','down','q','down','q');
		puzzle.cursor.init(7,1);
		puzzle.key.inputKeys('q','down','q','down','q','down','q','down','q','down','q','down','q');
		
		puzzle.board.getc(3,11).setQnum(2);
		puzzle.board.getc(7,11).setQnum(2);
		
		puzzle.board.getc(3,13).setQues(21);
		puzzle.board.getc(5,3).setQues(22);
		puzzle.board.getc(5,7).setQues(22);
		puzzle.board.getc(5,11).setQues(22);
		
		assert.equal(-1,puzzle.board.getc(3,13).gate.number);
		assert.equal( 2,puzzle.board.getc(5,11).gate.number);
	});
	it('Check gate number - dual and single', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 0,2 - 0,2 /. i . # ');
		
		assert.equal(-1,puzzle.board.getc(3,13).gate.number);
		assert.equal( 2,puzzle.board.getc(5,11).gate.number);
	});
	it('Check gate number - single and single', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 0,2 - # /. i . # ');
		
		assert.equal(-1,puzzle.board.getc(3,13).gate.number);
		assert.equal(-1,puzzle.board.getc(5,11).gate.number);
	});
	it('Check gate number - arrow number', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 2,2 - 3,3 /. i . # ');
		
		assert.equal( 2,puzzle.board.getc(3,13).gate.number);
		assert.equal( 3,puzzle.board.getc(5,11).gate.number);
	});
	it('Check gate number - collapsed arrow number', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 2,2 - 3,2 /. i . # ');
		
		assert.equal(-1,puzzle.board.getc(3,13).gate.number);
		assert.equal(-1,puzzle.board.getc(5,11).gate.number);
	});
	it('Check gate number - prural single number', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 0,2 - 0,3 /. i . # ');
		
		assert.equal( 2,puzzle.board.getc(3,13).gate.number);
		assert.equal( 3,puzzle.board.getc(5,11).gate.number);
	});
});
