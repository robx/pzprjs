//
// パズル固有スクリプト部 環状線スペシャル版 loopsp.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('loopsp', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputLoopsp();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
		}
	},
	inputRed : function(){ this.dispRedLine();},

	inputLoopsp : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getTCC()){
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
			else if(qn<cell.maxnum){ cell.setQnum(qn+1);}
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
		var cell = this.cursor.getTCC();

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
	},

	enablemake_p : true,
	generate : function(mode,type){
		this.inputcol('num','knumq','q','╋');
		this.inputcol('num','knumw','w','┃');
		this.inputcol('num','knume','e','━');
		this.inputcol('num','knumr','r',' ');
		this.inputcol('num','knum.','-','○');
		this.insertrow();
		this.inputcol('num','knuma','a','┗');
		this.inputcol('num','knums','s','┛');
		this.inputcol('num','knumd','d','┓');
		this.inputcol('num','knumf','f','┏');
		this.inputcol('empty','','','');
		this.insertrow();
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.insertrow();
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	enableLineNG : true,
	enableLineCombined : true
},
Board:{
	isborder : 1,

	adjustBoardData : function(key,d){
		if(key & k.TURNFLIP){
			var tques={};
			switch(key){
				case k.FLIPY: tques={14:17,15:16,16:15,17:14}; break;
				case k.FLIPX: tques={14:15,15:14,16:17,17:16}; break;
				case k.TURNR: tques={12:13,13:12,14:17,15:14,16:15,17:16}; break;
				case k.TURNL: tques={12:13,13:12,14:15,15:16,16:17,17:14}; break;
			}
			var clist = this.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var val=tques[cell.getQues()]; if(!!val){ cell.setQues(val);}
			}
		}
	}
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

Properties:{
	flag_redline : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.fontsizeratio = 0.85;
		this.circleratio = [0.38, 0.30];

		this.minYdeg = 0.36;
		this.maxYdeg = 0.74;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawLines();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawPekes();

		this.drawLineParts();

		this.drawChassis();

		this.drawTarget();
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawCirclesAtNumber();
		this.drawNumbers();
		this.drawLineParts();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeLoopsp();
	},
	pzlexport : function(type){
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

		if( !this.checkenableLineParts(1) ){
			this.setAlert('最初から引かれている線があるマスに線が足されています。','Lines are added to the cell that the mark lie in by the question.'); return false;
		}

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()===4 && cell.isNum());}) ){
			this.setAlert('○の部分で線が交差しています。','The lines are crossed on the number.'); return false;
		}

		if( !this.checkLoopNumber() ){
			this.setAlert('異なる数字を含んだループがあります。','A loop has plural kinds of number.'); return false;
		}
		if( !this.checkNumberLoop() ){
			this.setAlert('同じ数字が異なるループに含まれています。','A kind of numbers are in differernt loops.'); return false;
		}
		if( !this.checkNumberInLoop() ){
			this.setAlert('○を含んでいないループがあります。','A loop has no numbers.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()!==4 && cell.getQues()===11);}) ){
			this.setAlert('┼のマスから線が4本出ていません。','A cross-joint cell doesn\'t have four-way lines.'); return false;
		}

		if( !this.checkLcntCell(0) ){
			this.setAlert('線が引かれていないマスがあります。','There is an empty cell.'); return false;
		}
		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
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
			var blist = linfo.getblist(r);
			if(func(blist.cellinside())){ continue;}

			if(this.inAutoCheck){ return false;}
			if(result){ bd.border.seterr(-1);}
			blist.seterr(1);
			result = false;
		}
		return result;
	}
}
});

})();
