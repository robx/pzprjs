//
// パズル固有スクリプト部 環状線スペシャル版 loopsp.js v3.4.1
//
pzpr.classmgr.makeCustom(['loopsp'], {
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
			if(this.mousestart){ this.inputLoopsp();}
		}
	},
	inputRed : function(){ this.dispRedLine();},

	inputLoopsp : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputcell_loopsp(cell);
		}
		this.mouseCell = cell;
	},
	inputcell_loopsp : function(cell){
		var qu = cell.getQues(), qn = cell.getQnum();
		if(this.btn.Left){
			if(qn===-1){
				if     (qu==0)         { cell.setQues(11);}
				else if(qu>=11&&qu<=16){ cell.setQues(qu+1);}
				else if(qu==17)        { cell.setQues(0); cell.setQnum(-2);}
			}
			else if(qn==-2){ cell.setQnum(1);}
			else if(qn<cell.getmaxnum()){ cell.setQnum(qn+1);}
			else{ cell.setQues(0); cell.setQnum(-1);}
		}
		else if(this.btn.Right){
			if(qn===-1){
				if     (qu==0)         { cell.setQues(0); cell.setQnum(-2);}
				else if(qu==11)        { cell.setQues(0); cell.setQnum(-1);}
				else if(qu>=12&&qu<=17){ cell.setQues(qu-1);}
			}
			else if(qn==-2){ cell.setQues(17); cell.setQnum(-1);}
			else if(qn>1) { cell.setQnum(qn-1);}
			else{ cell.setQues(0); cell.setQnum(-2);}
		}
		cell.draw();
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
		var cell = this.cursor.getc();

		if     (ca=='q'){ cell.setQues(11); cell.setQnum(-1);}
		else if(ca=='w'){ cell.setQues(12); cell.setQnum(-1);}
		else if(ca=='e'){ cell.setQues(13); cell.setQnum(-1);}
		else if(ca=='r'){ cell.setQues(0);  cell.setQnum(-1);}
		else if(ca==' '){ cell.setQues(0);  cell.setQnum(-1);}
		else if(ca=='a'){ cell.setQues(14); cell.setQnum(-1);}
		else if(ca=='s'){ cell.setQues(15); cell.setQnum(-1);}
		else if(ca=='d'){ cell.setQues(16); cell.setQnum(-1);}
		else if(ca=='f'){ cell.setQues(17); cell.setQnum(-1);}
		else if((ca>='0' && ca<='9') || ca=='-'){
			if(this.key_inputqnum_main(cell,ca)){ cell.setQues(0);}
		}
		else{ return;}

		this.prev = cell;
		cell.draw();
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
	irowake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",
	linecolor_type : "LIGHT",

	globalfontsizeratio : 0.85,
	circleratio : [0.40, 0.35],

	minYdeg : 0.36,
	maxYdeg : 0.74,

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawLines();

		this.drawCircles();
		this.drawNumbers();

		this.drawPekes();

		this.drawLineParts();

		this.drawChassis();

		this.drawTarget();
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawCircles();
		this.drawNumbers();
		this.drawLineParts();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeLoopsp();
	},
	encodePzpr : function(type){
		this.encodeLoopsp();
	},

	decodeLoopsp : function(){
		var c=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj = bd.cell[c];

			if     (ca ==='.'){ obj.qnum = -2;}
			else if(ca ==='-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca >= '0' && ca <= '9'){ obj.qnum = parseInt(ca,16);}
			else if(ca >= 'a' && ca <= 'f'){ obj.qnum = parseInt(ca,16);}
			else if(ca >= 'g' && ca <= 'm'){ obj.ques = parseInt(ca,36)-5;}
			else if(ca >= 'n' && ca <= 'z'){ c += (parseInt(ca,36)-23);}

			c++;
			if(c>=bd.cellmax){ break;}
		}

		this.outbstr = bstr.substr(i+1);
	},
	encodeLoopsp : function(){
		var cm="", pstr="", count=0, bd=this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var qn=bd.cell[c].qnum, qu=bd.cell[c].ques;
			if     (qn===-2)       { pstr = ".";}
			else if(qn>= 0&&qn< 16){ pstr =     qn.toString(16);}
			else if(qn>=16&&qn<256){ pstr = "-"+qn.toString(16);}
			else if(qu>=11&&qu<=17){ pstr = (qu+5).toString(36);}
			else{ pstr = ""; count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===13){ cm+=((22+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(22+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="o"){ obj.ques = 6;}
			else if(ca==="-"){ obj.ques =-2;}
			else if(ca>="a" && ca<="g"){ obj.ques = parseInt(ca,36)+1;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.ques===6) { return "o ";}
			else if(obj.ques>=11 && obj.ques<=17) { return ""+(obj.ques-1).toString(36)+" ";}
			else if(obj.ques===-2){ return "- ";}
			else if(obj.qnum!==-1){ return obj.qnum.toString()+" ";}
			else                  { return ". ";}
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

		if( !this.checkCrossOnNumber() ){ return 'lnCrossOnNum';}

		if( !this.checkLoopNumber() ){ return 'lpPlNum';}
		if( !this.checkNumberLoop() ){ return 'lpSepNum';}
		if( !this.checkNumberInLoop() ){ return 'lpNoNum';}

		if( !this.checkCrossLineOnCross() ){ return 'lnNotCrossMk';}

		if( !this.checkLineCount(0) ){ return 'ceEmpty';}
		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		return null;
	},

	checkCrossOnNumber : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===4 && cell.isNum());});
	},

	checkLoopNumber : function(){
		return this.checkAllLoops(function(cells){
			var sublist = cells.filter(function(cell){ return cell.isValidNum();});
			var number = null;
			for(var n=0;n<sublist.length;n++){
				if(number===null){ number = sublist[n].getNum();}
				else if(number!==sublist[n].getNum()){
					sublist.seterr(1);
					return false;
				}
			}
			return true;
		});
	},
	checkNumberLoop : function(){
		var bd = this.owner.board;
		return this.checkAllLoops(function(cells){
			var sublist = cells.filter(function(cell){ return cell.isValidNum();});
			if(sublist.length===0){ return true;}
			var number = sublist[0].getNum();

			for(var c=0;c<bd.cellmax;c++){
				var cell = bd.cell[c], included=false;
				if(cell.getNum()===number && !sublist.include(cell)){
					sublist.seterr(1);
					return false;
				}
			}
			return true;
		});
	},
	checkNumberInLoop : function(){
		return this.checkAllLoops(function(cells){
			return (cells.filter(function(cell){ return cell.isNum();}).length > 0);
		});
	},
	checkAllLoops : function(func){
		var result = true, bd = this.owner.board;
		var linfo = bd.getLineInfo();
		for(var r=1;r<=linfo.max;r++){
			var blist = linfo.path[r].blist;
			if(func(blist.cellinside())){ continue;}

			if(this.checkOnly){ return false;}
			if(result){ bd.border.seterr(-1);}
			blist.seterr(1);
			result = false;
		}
		return result;
	},
	checkCrossLineOnCross : function(){
		return this.checkAllCell(function(cell){ return (cell.ques===11 && cell.lcnt!==4);});
	}
},

FailCode:{
	ceEmpty : ["線が引かれていないマスがあります。","there is an empty cell."],
	lnCrossOnNum : ["○の部分で線が交差しています。","the lines are crossed on the number."],
	lpPlNum  : ["異なる数字を含んだループがあります。","A loop has plural kinds of number."],
	lpSepNum : ["同じ数字が異なるループに含まれています。","A kind of numbers are in differernt loops."],
	lpNoNum  : ["○を含んでいないループがあります。","A loop has no numbers."]
}
});
