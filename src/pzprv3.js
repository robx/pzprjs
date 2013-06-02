
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

		"pzprv3/CoreClass.js",
		"pzprv3/Puzzle.js",
		"pzprv3/BoardPiece.js",
		"pzprv3/Board.js",
		"pzprv3/BoardExec.js",
		"pzprv3/LineManager.js",
		"pzprv3/AreaManager.js",
		"pzprv3/Graphic.js",
		"pzprv3/MouseInput.js",
		"pzprv3/KeyInput.js",
		"pzprv3/URL.js",
		"pzprv3/Encode.js",
		"pzprv3/FileData.js",
		"pzprv3/Answer.js",
		"pzprv3/Operation.js"
	];
	for(var i=0;i<files.length;i++){
		document.writeln('<script type="text/javascript" src="'+dir+files[i]+'"></script>');
	}
})();
