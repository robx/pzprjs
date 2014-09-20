// core.js v3.4.1

//----------------------------------------------------------------------------
// ★pzprオブジェクト
//---------------------------------------------------------------------------
/* extern */
window.pzpr = {
	version : '<%= pkg.version %>',

	EDITOR : false,	// エディタモード
	PLAYER : true,	// playerモード

	puzzles : [],	// createPuzzle()で生成したパズルを保存する

	//---------------------------------------------------------------
	// パズルを生成する
	//---------------------------------------------------------------
	createPuzzle : function(canvas, option){
		var canvasNotElement;
		try{ canvasNotElement = !(canvas instanceof HTMLElement);}
		/* IE8以下だとHTMLElementが定義されておらずエラーになる */
		catch(e){ canvasNotElement = !(canvas && canvas.style);}
		if(arguments.length===1 && canvasNotElement){ option=canvas; canvas=(void 0);}
		if(pzpr.env.browser.Presto){ option.graphic='canvas';}
		
		var puzzle = new pzpr.Puzzle(canvas, option);
		this.puzzles.push(puzzle);
		return puzzle;
	},
	deletePuzzle : function(puzzle){
		for(var i=0,len=this.puzzles.length;i<len;i++){
			if(this.puzzles[i]===puzzle){ this.puzzles[i]=null;}
		}
	}
};
