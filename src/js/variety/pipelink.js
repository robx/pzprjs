//
// パズル固有スクリプト部 パイプリンク・帰ってきたパイプリンク版 pipelink.js v3.4.1
//
pzpr.classmgr.makeCustom(['pipelink','pipelinkr'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputQues([0,11,12,13,14,15,16,17,-2]);}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputLineParts(ca);
	},
	key_inputLineParts : function(ca){
		if(this.puzzle.playmode){ return false;}
		var cell = this.cursor.getc();

		if     (ca==='q'){ cell.setQues(11);}
		else if(ca==='w'){ cell.setQues(12);}
		else if(ca==='e'){ cell.setQues(13);}
		else if(ca==='r'){ cell.setQues(0);}
		else if(ca===' '){ cell.setQues(0);}
		else if(ca==='a'){ cell.setQues(14);}
		else if(ca==='s'){ cell.setQues(15);}
		else if(ca==='d'){ cell.setQues(16);}
		else if(ca==='f'){ cell.setQues(17);}
		else if(ca==='-'){ cell.setQues(cell.ques!==-2?-2:0);}
		else if(this.pid==='pipelinkr' && ca==='1'){ cell.setQues(6);}
		else{ return false;}

		cell.drawaround();
		return true;
	}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	enableLineNG : true,
	enableLineCombined : true
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){
			var tques={};
			switch(key){
				case this.FLIPY: tques={14:17,15:16,16:15,17:14}; break;
				case this.FLIPX: tques={14:15,15:14,16:17,17:16}; break;
				case this.TURNR: tques={12:13,13:12,14:17,15:14,16:15,17:16}; break;
				case this.TURNL: tques={12:13,13:12,14:15,15:16,16:17,17:14}; break;
			}
			var clist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], val = tques[cell.ques];
				if(!!val){ cell.setQues(val);}
			}
		}
	}
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

Flags:{
	redline : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",
	linecolor_type : "LIGHT",

	circleratio : [0.42, 0.37],

	minYdeg : 0.42,

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		if(this.pid==='pipelinkr'){
			this.drawCircles();
			this.drawBorders();
		}

		this.drawHatenas();

		this.drawLines();

		this.drawPekes();

		this.drawLineParts();

		this.drawChassis();

		this.drawTarget();
	},

	getBGCellColor : function(cell){
		if     (cell.error===1)                                                  { return this.errbcolor1;}
		else if(cell.ques===6 && this.puzzle.getConfig('disptype_pipelinkr')===2){ return this.icecolor;}
		return null;
	},
	getBorderColor : function(border){
		if(this.puzzle.getConfig('disptype_pipelinkr')===2){
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull && !cell2.isnull && (cell1.ice()^cell2.ice())){
				return this.quescolor;
			}
		}
		return null;
	},

	getCircleStrokeColor : function(cell){
		if((this.puzzle.getConfig('disptype_pipelinkr')===1) && cell.ques===6){
			return this.quescolor;
		}
		return null;
	},
	circlefillcolor_func : "null",

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawLineParts();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodePipelink();

		var puzzle = this.puzzle;
		if(puzzle.pid==='pipelink'){ this.checkPuzzleid();}
		if(puzzle.pid==='pipelinkr'){ puzzle.setConfig('disptype_pipelinkr', (!this.checkpflag('i')?1:2));}
	},
	encodePzpr : function(type){
		var puzzle = this.puzzle;
		this.outpflag = ((puzzle.pid==='pipelinkr' && puzzle.getConfig('disptype_pipelinkr')===2)?"i":null);
		this.encodePipelink(type);
	},

	decodePipelink : function(){
		var c=0, bstr = this.outbstr, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (ca==='.'){ bd.cell[c].ques = -2;}
			else if(ca>='0' && ca<='9'){
				for(var n=0,max=parseInt(ca,10)+1;n<max;n++){
					if(c<bd.cellmax){ bd.cell[c].ques = 6; c++;}
				}
				c--;
			}
			else if(ca>='a' && ca<='g'){ bd.cell[c].ques = parseInt(ca,36)+1;}
			else if(ca>='h' && ca<='z'){ c += (parseInt(ca,36)-17);}

			c++;
			if(c>=bd.cellmax){ break;}
		}

		this.outbstr = bstr.substr(i);
	},
	encodePipelink : function(type){
		var parser = pzpr.parser;
		var count, cm="", bd = this.board;

		count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", qu=bd.cell[c].ques;

			if     (qu===-2){ pstr = ".";}
			else if(qu=== 6){
				if(type===parser.URL_PZPRV3){
					for(var n=1;n<10;n++){
						if((c+n)>=bd.cellmax || bd.cell[c+n].ques!==6){ break;}
					}
					pstr=(n-1).toString(10); c=(c+n-1);
				}
				else if(type===parser.URL_PZPRAPP){ pstr="0";}
			}
			else if(qu>=11 && qu<=17){ pstr = (qu-1).toString(36);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===19){ cm+=((16+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(16+count).toString(36);}

		this.outbstr += cm;
	},

	checkPuzzleid : function(){
		var puzzle=this.puzzle, bd=puzzle.board;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ puzzle.changepid('pipelinkr'); break;}
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		var disptype = this.readLine();
		this.decodeCell( function(cell,ca){
			if     (ca==="o"){ cell.ques = 6; }
			else if(ca==="-"){ cell.ques = -2;}
			else if(ca!=="."){ cell.ques = parseInt(ca,36)+1;}
		});
		this.decodeBorderLine();

		var puzzle = this.puzzle;
		if(puzzle.pid==='pipelink'){ puzzle.enc.checkPuzzleid();}
		if(puzzle.pid==='pipelinkr'){ puzzle.setConfig('disptype_pipelinkr', (disptype==="circle"?1:2));}
	},
	encodeData : function(){
		var puzzle = this.puzzle;
		if     (puzzle.pid==='pipelink') { this.datastr += 'pipe\n';}
		else if(puzzle.pid==='pipelinkr'){ this.datastr += (puzzle.getConfig('disptype_pipelinkr')===1?"circle\n":"ice\n");}
		this.encodeCell( function(cell){
			if     (cell.ques===6) { return "o ";}
			else if(cell.ques===-2){ return "- ";}
			else if(cell.ques>=11 && cell.ques<=17){ return ""+(cell.ques-1).toString(36)+" ";}
			else                  { return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkenableLineParts",

		"checkCrossOutOfMark@pipelinkr",
		"checkIceLines@pipelinkr",

		"checkBranchLine",
		"checkOneLoop",
		"checkNotCrossOnMark",
		"checkNoLine",
		"checkDeadendLine+"
	],

	checkCrossOutOfMark : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===4 && cell.ques!==6 && cell.ques!==11);}, "lnCrossExIce");
	}
},
"CheckInfo@pipelinkr":{
	text : function(lang){
		var puzzle = this.puzzle, texts = [];
		var langcode = ((lang || puzzle.getConfig('language'))==="ja"?0:1);
		var isdispice = (puzzle.getConfig('disptype_pipelinkr')===2);
		if(this.length===0){ return puzzle.faillist.complete[langcode];}
		for(var i=0;i<this.length;i++){
			var code = this[i];
			if(!isdispice){
				if     (code==="lnCrossExIce"){ code = "lnCrossExCir";}
				else if(code==="lnCurveOnIce"){ code = "lnCurveOnCir";}
			}
			texts.push(puzzle.faillist[code][langcode]);
		}
		return texts.join("\n");
	}
},
FailCode:{
	lnCrossExCir : ["○の部分以外で線が交差しています。","There is a crossing line out of circles."],
	lnCurveOnCir : ["○の部分で線が曲がっています。","A line curves on circles."]
}
});
