// test/config_test.js

var assert = require('assert');

var pzpr = require('../../dist/js/pzpr.js');

describe('Config test', function(){
	var puzzle = new pzpr.Puzzle();
	puzzle.open('bonsan/3/3');
	it('Check: Genre independent setting', function(){
		assert.equal(puzzle.getConfig('autocmp'), true);
		assert.equal(puzzle.getConfig('autocmp@bonsan'), true);
		assert.equal(puzzle.getConfig('autocmp@heyabon'), true);
		assert.deepEqual(puzzle.config.list.autocmp.variety, {});

		puzzle.setConfig('autocmp', false);
		assert.equal(puzzle.getConfig('autocmp'), false);
		assert.equal(puzzle.getConfig('autocmp@bonsan'), false);
		assert.equal(puzzle.getConfig('autocmp@heyabon'), true);
		assert.deepEqual(puzzle.config.list.autocmp.variety, {bonsan:false});
		assert.ok(puzzle.saveConfig()["autocmp"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@bonsan"]===false);
		assert.ok(puzzle.saveConfig()["autocmp@heyabon"]===void 0);

		puzzle.resetConfig('autocmp');
		assert.equal(puzzle.getConfig('autocmp'), true);
		assert.equal(puzzle.getConfig('autocmp@bonsan'), true);
		assert.equal(puzzle.getConfig('autocmp@heyabon'), true);
		assert.deepEqual(puzzle.config.list.autocmp.variety, {bonsan:true});
		assert.ok(puzzle.saveConfig()["autocmp"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@bonsan"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@heyabon"]===void 0);

		puzzle.setConfig('autocmp@heyabon', false);
		assert.equal(puzzle.getConfig('autocmp'), true);
		assert.equal(puzzle.getConfig('autocmp@bonsan'), true);
		assert.equal(puzzle.getConfig('autocmp@heyabon'), false);
		assert.deepEqual(puzzle.config.list.autocmp.variety, {bonsan:true,heyabon:false});
		assert.ok(puzzle.saveConfig()["autocmp"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@bonsan"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@heyabon"]===false);

		puzzle.setConfig('autocmp', false);
		assert.deepEqual(puzzle.config.list.autocmp.variety, {bonsan:false,heyabon:false});
		puzzle.resetConfig('autocmp');
		assert.equal(puzzle.getConfig('autocmp'), true);
		assert.equal(puzzle.getConfig('autocmp@bonsan'), true);
		assert.equal(puzzle.getConfig('autocmp@heyabon'), true);
		assert.deepEqual(puzzle.config.list.autocmp.variety, {bonsan:true});
		assert.ok(puzzle.saveConfig()["autocmp"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@bonsan"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@heyabon"]===void 0);

		puzzle.restoreConfig({"autocmp@heyabon":false});
		assert.equal(puzzle.getConfig('autocmp'), true);
		assert.equal(puzzle.getConfig('autocmp@bonsan'), true);
		assert.equal(puzzle.getConfig('autocmp@heyabon'), false);
		assert.deepEqual(puzzle.config.list.autocmp.variety, {heyabon:false});
		assert.ok(puzzle.saveConfig()["autocmp"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@bonsan"]===void 0);
		assert.ok(puzzle.saveConfig()["autocmp@heyabon"]===false);
	});

	it('Check: Invalid value', function(){
		puzzle.setConfig('disptype_bosanowa', 4);
		assert.equal(puzzle.getConfig('disptype_bosanowa'), 1);
	});
});
