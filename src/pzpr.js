
/* concat前のテスト用スクリプト */

/* jshint node: true, evil: true */

var scriptcount = scriptcount || 0;

(function(){
	var component = [
		"lib/candle",
		"pzpr/core",
		"pzpr/event",
		"pzpr/classmgr",
		"pzpr/env",
		"pzpr/variety",
		"pzpr/parser",
		"pzpr/metadata",
		"pzpr/util",
		"puzzle/Puzzle",
		"puzzle/Config",
		"puzzle/Address",
		"puzzle/Piece",
		"puzzle/PieceList",
		"puzzle/Board",
		"puzzle/BoardExec",
		"puzzle/GraphBase",
		"puzzle/LineManager",
		"puzzle/AreaManager",
		"puzzle/Graphic",
		"puzzle/MouseInput",
		"puzzle/KeyInput",
		"puzzle/Encode",
		"puzzle/FileData",
		"puzzle/Answer",
		"puzzle/Operation",
		"variety-common/Graphic",
		"variety-common/KeyInput",
		"variety-common/MouseInput",
		"variety-common/Answer",
		"variety-common/BoardExec",
		"variety-common/Encode",
		"variety-common/FileData"
	];

	if(typeof exports==='undefined'){
		var dir = (function getpath(){
			var srcs=document.getElementsByTagName('script');
			for(var i=0;i<srcs.length;i++){
				var result = srcs[i].src.match(/^(.*\/)pzpr\.js$/);
				if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
			}
			return "";
		})();
		
		for(var i=0; i<component.length; i++){
			if(component[i].match(/^ui/)){ continue;}
			scriptcount++;
			var file = dir+component[i]+".js";
			document.write('<script type="text/javascript" src="'+file+'" onload="scriptcount--;"></script>');
		}
	}
	else{
		var dir = "src/";
		exports.files = component.map(function(mod){ return dir+mod+".js";});
	}
})();
