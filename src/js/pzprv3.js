
/* concat前のテスト用スクリプト */

/* jshint node: true */

(function(){
	var component = [
		"lib/candle",
		"pzpr/core",
		"pzpr/event",
		"pzpr/classmgr",
		"pzpr/env",
		"pzpr/variety",
		"pzpr/parser",
		"pzpr/util",
		"puzzle/Puzzle",
		"puzzle/Config",
		"puzzle/Address",
		"puzzle/Piece",
		"puzzle/PieceList",
		"puzzle/Board",
		"puzzle/BoardExec",
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
		"variety-common/FileData",
		"ui/Boot",
		"ui/UI",
		"ui/Event",
		"ui/Listener",
		"ui/MenuConfig",
		"ui/Misc",
		"ui/MenuArea",
		"ui/PopupMenu",
		"ui/ToolArea",
		"ui/KeyPopup",
		"ui/DataBase",
		"ui/Timer",
		"ui/Debug"
	];

	var isbrowser = true;
	try{ isbrowser = !exports;}
	catch(e){}
	
	if(isbrowser){
		var dir = (function getpath(){
			var srcs=document.getElementsByTagName('script');
			for(var i=0;i<srcs.length;i++){
				var result = srcs[i].src.match(/^(.*\/)pzprv3\.js$/);
				if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
			}
			return "";
		})();
		
		for(var i=0; i<component.length; i++){
			var file = dir+component[i]+".js";
			document.write('<script type="text/javascript" src="'+file+'"></script>');
		}
	}
	else{
		component.unshift("common/intro");
		component.push   ("common/outro");

		var dir = "src/js/";
		exports.files = component.map(function(mod){ return dir+mod+".js";});
	}
})();
