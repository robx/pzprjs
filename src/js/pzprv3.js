
/* concat前のテスト用スクリプト */

(function(){
	var files = [
		"lib/candle",
		"pzpr/core",
		"pzpr/classmgr",
		"pzpr/env",
		"pzpr/variety",
		"pzpr/parser",
		"pzpr/util",
		"puzzle/Puzzle",
		"puzzle/BoardPiece",
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
		"ui/Menu",
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
		for(var i=0;i<files.length;i++){
			document.write('<script type="text/javascript" src="./js/'+files[i]+'.js"></script>');
		}
	}
	else{ exports.component = files;}
})();
