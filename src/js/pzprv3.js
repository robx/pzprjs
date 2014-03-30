
/* concat前のテスト用スクリプト */

(function(){
	var files = [
		"lib/candle",
		"pzpr/CoreClass",
		"pzpr/Puzzle",
		"pzpr/BoardPiece",
		"pzpr/Board",
		"pzpr/BoardExec",
		"pzpr/LineManager",
		"pzpr/AreaManager",
		"pzpr/Graphic",
		"pzpr/MouseInput",
		"pzpr/KeyInput",
		"pzpr/URL",
		"pzpr/Encode",
		"pzpr/FileData",
		"pzpr/Answer",
		"pzpr/Operation",
		"puzzle-common/Graphic",
		"puzzle-common/KeyInput",
		"puzzle-common/MouseInput",
		"puzzle-common/Answer",
		"puzzle-common/BoardExec",
		"puzzle-common/Encode",
		"puzzle-common/FileData",
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
		var dir = (function getpath(){
			var srcs=document.getElementsByTagName('script');
			for(var i=0;i<srcs.length;i++){
				var result = srcs[i].src.match(/^(.*\/)pzprv3\.js$/);
				if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
			}
			return "";
		})();
		
		for(var i=0;i<files.length;i++){
			document.write('<script type="text/javascript" src="'+dir+files[i]+'.js"></script>');
		}
	}
	else{ exports.component = files;}
})();
