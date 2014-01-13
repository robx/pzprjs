
/* concat前のテスト用スクリプト */

(function(){
	var dir = (function getpath(){
		var srcs=document.getElementsByTagName('script');
		for(var i=0;i<srcs.length;i++){
			var result = srcs[i].src.match(/^(.*\/)pzpr\.js$/);
			if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
		}
		return "";
	})();

	var files = [
		"../src/lib/candle.js",
		"pzpr/CoreClass.js",
		"pzpr/Puzzle.js",
		"pzpr/BoardPiece.js",
		"pzpr/Board.js",
		"pzpr/BoardExec.js",
		"pzpr/LineManager.js",
		"pzpr/AreaManager.js",
		"pzpr/Graphic.js",
		"pzpr/MouseInput.js",
		"pzpr/KeyInput.js",
		"pzpr/URL.js",
		"pzpr/Encode.js",
		"pzpr/FileData.js",
		"pzpr/Answer.js",
		"pzpr/Operation.js"
	];
	for(var i=0;i<files.length;i++){
		document.write('<script type="text/javascript" src="'+dir+files[i]+'"></script>');
	}
})();
