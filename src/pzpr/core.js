// core.js v3.5.2
/* exported pzpr */
/* jshint node:true */

//----------------------------------------------------------------------------
// ★pzprオブジェクト
//---------------------------------------------------------------------------
/* extern */
var pzpr = { /* jshint ignore:line */
	version : '<%= pkg.version %>'
};

if(typeof module==='object'&&typeof exports==='object'){ module.exports = global.pzpr = pzpr;}
else{ this.pzpr = pzpr;}
