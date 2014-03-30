
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
		"ui/Debug",
		"puzzle/amibo",
		"puzzle/bag",
		"puzzle/barns",
		"puzzle/bdblock",
		"puzzle/bonsan",
		"puzzle/bosanowa",
		"puzzle/box",
		"puzzle/cbblock",
		"puzzle/country",
		"puzzle/creek",
		"puzzle/factors",
		"puzzle/fillmat",
		"puzzle/fillomino",
		"puzzle/firefly",
		"puzzle/goishi",
		"puzzle/gokigen",
		"puzzle/hakoiri",
		"puzzle/hanare",
		"puzzle/hashikake",
		"puzzle/heyawake",
		"puzzle/hitori",
		"puzzle/icebarn",
		"puzzle/ichimaga",
		"puzzle/kaero",
		"puzzle/kakuro",
		"puzzle/kakuru",
		"puzzle/kinkonkan",
		"puzzle/kouchoku",
		"puzzle/kramma",
		"puzzle/kurochute",
		"puzzle/kurodoko",
		"puzzle/kurotto",
		"puzzle/kusabi",
		"puzzle/lightup",
		"puzzle/lits",
		"puzzle/lookair",
		"puzzle/loopsp",
		"puzzle/loute",
		"puzzle/mashu",
		"puzzle/mejilink",
		"puzzle/minarism",
		"puzzle/nagenawa",
		"puzzle/nanro",
		"puzzle/nawabari",
		"puzzle/numlin",
		"puzzle/nurikabe",
		"puzzle/paintarea",
		"puzzle/pipelink",
		"puzzle/reflect",
		"puzzle/renban",
		"puzzle/ripple",
		"puzzle/roma",
		"puzzle/shakashaka",
		"puzzle/shikaku",
		"puzzle/shimaguni",
		"puzzle/shugaku",
		"puzzle/slalom",
		"puzzle/slither",
		"puzzle/snakes",
		"puzzle/sudoku",
		"puzzle/sukoro",
		"puzzle/tasquare",
		"puzzle/tatamibari",
		"puzzle/tateyoko",
		"puzzle/tawa",
		"puzzle/tentaisho",
		"puzzle/tilepaint",
		"puzzle/toichika",
		"puzzle/triplace",
		"puzzle/wblink",
		"puzzle/yajikazu",
		"puzzle/yajirin",
		"puzzle/yajitatami",
		"puzzle/yosenabe"
	];

	var isbrowser = true;
	try{ isbrowser = !exports;}
	catch(e){}
	
	if(isbrowser){
		var dir = (function getpath(){
			var srcs=document.getElementsByTagName('script');
			for(var i=0;i<srcs.length;i++){
				var result = srcs[i].src.match(/^(.*\/)pzprv3\-all\.js$/);
				if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
			}
			return "";
		})();
		
		for(var i=0;i<files.length;i++){
			document.write('<script type="text/javascript" src="'+dir+files[i]+'"></script>');
		}
	}
	else{ exports.component = files;}
})();
