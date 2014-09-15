//
// パズル固有スクリプト部 パイプリンク・帰ってきたパイプリンク版 pipelink.js v3.4.1
//
pzpr.classmgr.makeCustom(['pipelink','pipelinkr'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputQues([0,11,12,13,14,15,16,17,-2]);}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputLineParts(ca);
	},
	key_inputLineParts : function(ca){
		if(this.owner.playmode){ return false;}
		var cell = this.cursor.getc();

		if     (ca=='q'){ cell.setQues(11);}
		else if(ca=='w'){ cell.setQues(12);}
		else if(ca=='e'){ cell.setQues(13);}
		else if(ca=='r'){ cell.setQues(0);}
		else if(ca==' '){ cell.setQues(0);}
		else if(ca=='a'){ cell.setQues(14);}
		else if(ca=='s'){ cell.setQues(15);}
		else if(ca=='d'){ cell.setQues(16);}
		else if(ca=='f'){ cell.setQues(17);}
		else if(ca=='-'){ cell.setQues(cell.getQues()!==-2?-2:0);}
		else if(this.owner.pid==='pipelinkr' && ca=='1'){ cell.setQues(6);}
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
			var clist = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], val = tques[cell.getQues()];
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

		if(this.owner.pid==='pipelinkr'){
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
		if     (cell.error===1)                                                { return this.errbcolor1;}
		else if(cell.ques===6 && this.owner.getConfig('disptype_pipelinkr')==2){ return this.icecolor;}
		return null;
	},
	getBorderColor : function(border){
		if(this.owner.getConfig('disptype_pipelinkr')==2){
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull && !cell2.isnull && (cell1.ice()^cell2.ice())){
				return this.quescolor;
			}
		}
		return null;
	},

	getCircleStrokeColor : function(cell){
		if((this.owner.getConfig('disptype_pipelinkr')==1) && cell.ques===6){
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

		this.checkPuzzleid();
		var puzzle = this.owner;
		if(puzzle.pid==='pipelinkr'){ puzzle.setConfig('disptype_pipelinkr', (!this.checkpflag('i')?1:2));}
	},
	encodePzpr : function(type){
		var puzzle = this.owner;
		this.outpflag = ((puzzle.pid==='pipelinkr' && puzzle.getConfig('disptype_pipelinkr')==2)?"i":null);
		this.encodePipelink(type);
	},

	decodePipelink : function(){
		var c=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (ca=='.'){ bd.cell[c].ques = -2;}
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
		var count, pass, cm="", bd = this.owner.board;

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
		var o=this.owner, bd=o.board;
		if(o.pid==='pipelink'){
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ o.pid='pipelinkr'; break;}
			}
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		var disptype = this.readLine();
		this.decodeCell( function(obj,ca){
			if     (ca==="o"){ obj.ques = 6; }
			else if(ca==="-"){ obj.ques = -2;}
			else if(ca!=="."){ obj.ques = parseInt(ca,36)+1;}
		});
		this.decodeBorderLine();

		var puzzle = this.owner;
		puzzle.enc.checkPuzzleid();
		if(puzzle.pid==='pipelinkr'){ puzzle.setConfig('disptype_pipelinkr', (disptype=="circle"?1:2));}
	},
	encodeData : function(){
		var puzzle = this.owner;
		if     (puzzle.pid==='pipelink') { this.datastr += 'pipe\n';}
		else if(puzzle.pid==='pipelinkr'){ this.datastr += (puzzle.getConfig('disptype_pipelinkr')==1?"circle\n":"ice\n");}
		this.encodeCell( function(obj){
			if     (obj.ques==6) { return "o ";}
			else if(obj.ques==-2){ return "- ";}
			else if(obj.ques>=11 && obj.ques<=17){ return ""+(obj.ques-1).toString(36)+" ";}
			else                 { return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkenableLineParts(1) ){ return 'ceAddLine';}

		if( !this.checkLineCount(3) ){ return 'lnBranch';}

		if(this.owner.pid==='pipelinkr'){
			var isdispice = (this.owner.getConfig('disptype_pipelinkr')==2);
			if( !this.checkCrossOutOfMark() ){ return (isdispice ? 'lnCrossExIce' : 'lnCrossExCir');}
			if( !this.checkIceLines() ){ return (isdispice ? 'lnCurveOnIce' : 'lnCurveOnCir');}
		}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		if( !this.checkCrossLineOnCross() ){ return 'lnNotCrossMk';}

		if( !this.checkLineCount(0) ){ return 'ceEmpty';}

		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		return null;
	},

	checkCrossOutOfMark : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===4 && cell.ques!==6 && cell.ques!==11);});
	},
	checkCrossLineOnCross : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt!==4 && cell.ques===11);});
	}
},

FailCode:{
	ceEmpty : ["線が引かれていないマスがあります。","there is an empty cell."],
	lnCrossExCir : ["○の部分以外で線が交差しています。","there is a crossing line out of circles."],
	lnCurveOnCir : ["○の部分で線が曲がっています。","A line curves on circles."]
}
});
