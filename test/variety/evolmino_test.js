// test/variety/evolmino_test.js

var assert = require("assert");
var pzpr = require("../../");
var puzzle = new pzpr.Puzzle();

describe("Variety:evolmino", function() {
	// check evolution algorithm
	it("Check evolution #1", function() {
		puzzle.open(
			"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 0 /0 0 /0 0 /2 0 0 /2 0 0 /0 . . /. . . /0 0 . /"
		);
		assert.equal(puzzle.check(false).complete, true);
	});
	it("Check evolution #2", function() {
		puzzle.open(
			"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 0 /0 0 /0 0 /2 0 0 /2 0 0 /0 . . /. . . /0 0 0 /"
		);
		assert.equal(puzzle.check(false)[0], "bsNotEvol");
	});
	it("Check evolution #3", function() {
		puzzle.open(
			"pzprv3/evolmino/5/3/. . . /. . . /. . . /. . . /. . . /0 0 /0 0 /0 0 /0 0 /0 0 /2 0 0 /2 0 0 /0 0 0 /0 0 0 /0 0 0 /. . . /0 . . /0 . . /0 0 . /"
		);
		assert.equal(puzzle.check(false)[0], "bsNotEvol");
	});

	// check invalid arrow
	it("Check invalid arrow: branching out", function() {
		puzzle.open(
			"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 0 /1 0 /0 0 /0 2 0 /0 2 0 /. . . /. . . /. . . /"
		);
		assert.equal(puzzle.check(false)[0], "arInvalid");
	});
	it("Check invalid arrow: branching in", function() {
		puzzle.open(
			"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 0 /2 0 /0 0 /0 2 0 /0 2 0 /. . . /. . . /. . . /"
		);
		assert.equal(puzzle.check(false)[0], "arInvalid");
	});
	it("Check invalid arrow: crossing", function() {
		puzzle.open(
			"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 0 /2 2 /0 0 /0 2 0 /0 2 0 /. . . /. . . /. . . /"
		);
		assert.equal(puzzle.check(false)[0], "arInvalid");
	});
	it("Check invalid arrow: loop", function() {
		puzzle.open("pzprv3/evolmino/2/2/. . /. . /2 /1 /1 2 /. . /. . /");
		assert.equal(puzzle.check(false)[0], "arInvalid");
	});
	it("Check invalid arrow: backward qdir #1", function() {
		puzzle.open(
			"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 0 /0 0 /0 0 /0 1 0 /0 2 0 /. . . /. . . /. . . /"
		);
		assert.equal(puzzle.check(false)[0], "arInvalid");
	});
	it("Check invalid arrow: backward qdir #2", function() {
		puzzle.open(
			"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 0 /0 0 /0 0 /0 2 0 /0 1 0 /. . . /. . . /. . . /"
		);
		assert.equal(puzzle.check(false)[0], "arInvalid");
	});
});
