// core.js v3.5.2
/* exported pzpr */
/* jshint node:true */

//----------------------------------------------------------------------------
// ★pzprオブジェクト
//---------------------------------------------------------------------------
/* extern */
var pzpr = { // jshint ignore:line
	version : '<%= pkg.version %>'
};

if(typeof module==='object' && module.exports){ module.exports = pzpr;}
else{ this.pzpr = pzpr;}
