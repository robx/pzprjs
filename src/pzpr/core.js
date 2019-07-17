// core.js v3.5.2

//----------------------------------------------------------------------------
// ★pzprオブジェクト
//---------------------------------------------------------------------------
/* extern */
var pzpr = {
	version : '<%= pkg.version %>'
};

if(typeof module==='object' && module.exports){ module.exports = pzpr;}
else{ this.pzpr = pzpr;}
