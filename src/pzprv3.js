
(function(){
	var dir="", srcs=document.getElementsByTagName('script');
	for(var i=0;i<srcs.length;i++){
		var result = srcs[i].src.match(/^(.*\/)pzprv3\.js$/);
		if(result){
			if(result[1].match(/\/$/)){ dir = result[1];}
			else{ dir = result[1]+'/';}
			break;
		}
	}

	var files = [
		"../../candle/source/candle.core.js",
		"../../candle/source/candle.base.js",
		"../../candle/source/candle.svg.js",
		"../../candle/source/candle.canvas.js",
		"../../candle/source/candle.sl.js",
		"../../candle/source/candle.vml.js",

		"pzprBase/CoreClass.js",
		"pzprBase/Puzzle.js",
		"pzprBase/BoardPiece.js",
		"pzprBase/Board.js",
		"pzprBase/BoardExec.js",
		"pzprBase/LineManager.js",
		"pzprBase/AreaManager.js",
		"pzprBase/Graphic.js",
		"pzprBase/MouseInput.js",
		"pzprBase/KeyInput.js",
		"pzprBase/URL.js",
		"pzprBase/Encode.js",
		"pzprBase/FileData.js",
		"pzprBase/Answer.js",
		"pzprBase/Operation.js"
	];
	for(var i=0;i<files.length;i++){
		document.writeln('<script type="text/javascript" src="'+dir+files[i]+'"></script>');
	}
})();
