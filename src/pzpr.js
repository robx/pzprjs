
/* concat前のテスト用スクリプト */

(function(){
	if(!document.body){ setTimeout(arguments.callee,10); return;}

	var dir="", srcs=document.getElementsByTagName('script');
	for(var i=0;i<srcs.length;i++){
		var result = srcs[i].src.match(/^(.*\/)pzpr\.js$/);
		if(result){
			if(result[1].match(/\/$/)){ dir = result[1];}
			else{ dir = result[1]+'/';}
			break;
		}
	}
	if(!dir){ setTimeout(arguments.callee,10); return;}

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
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = dir+files[i];
		document.body.appendChild(_script);
	}
})();
