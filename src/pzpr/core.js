// core.js v3.5.2
/* exported pzpr */
/* jshint node:true */

//----------------------------------------------------------------------------
// ★pzprオブジェクト
//---------------------------------------------------------------------------
/* extern */
var pzpr = { /* jshint ignore:line */
	version : '<%= pkg.version %>',

	//---------------------------------------------------------------
	// パズルを生成する
	//---------------------------------------------------------------
	createPuzzle : function(canvas, option){
		return new pzpr.Puzzle(canvas, option);
	}
};

if(typeof module==='object'&&typeof exports==='object'){
	global.Candle = module.exports;
	module.exports = global.pzpr = pzpr;
}
else{ this.pzpr = pzpr;}
