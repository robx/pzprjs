//
// パズル固有スクリプト部 タイルペイント版 tilepaint.js v3.4.1
//
pzpr.classmgr.makeCustom(['tilepaint'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputtile();}
		}
		else if(this.owner.editmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputborder();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputBGcolor1();}
			}
			
			if(this.mouseend && this.notInputted()){ this.input51();}
		}
	},

	inputBGcolor1 : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.is51cell()){ return;}
		if(this.inputData===null){ this.inputData=(cell.qsub===0)?3:0;}
		cell.setQsub(this.inputData);
		this.mouseCell = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.inputnumber51(ca,
			{2 : (this.owner.board.qcols-(this.cursor.bx>>1)-1),
			 4 : (this.owner.board.qrows-(this.cursor.by>>1)-1)});
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qnum: 0,
	qnum2: 0,

	disInputHatena : true,

	numberRemainsUnshaded : true,

	minnum : 0,

	// 一部qsubで消したくないものがあるため上書き
	subclear : function(){
		if(this.qsub===1){
			this.addOpe('qsub', 1, 0);
			this.qsub = 0;
		}
		this.error = 0;
	},

	set51cell : function(){
		this.setQues(51);
		this.setQnum(0);
		this.setQnum2(0);
		this.clrShade();
		this.setQsub(0);
		this.set51aroundborder();
	},
	remove51cell : function(){
		this.setQues(0);
		this.setQnum(0);
		this.setQnum2(0);
		this.clrShade();
		this.setQsub(0);
	},

	set51aroundborder : function(){
		var list = this.getdir4cblist();
		for(var i=0;i<list.length;i++){
			var cell2=list[i][0], border=list[i][1];
			if(!border.isnull){
				border.setQues((this.is51cell()^cell2.is51cell())?1:0);
			}
		}
	}
},
EXCell:{
	ques: 51,
	qnum: 0,
	qnum2: 0,

	minnum : 0
},
Board:{
	hasborder : 1,
	hasexcell : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustQues51_1(key,d);
	},
	adjustBoardData2 : function(key,d){
		this.adjustQues51_2(key,d);
	}
},

AreaRoomManager:{
	enabled : true,
	isvalid : function(cell){ return (!cell.is51cell());}
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",
	bcolor_type : "GREEN",
	bbcolor : "rgb(127, 127, 127)",

	bgcellcolor_func : "qsub3",

	paint : function(){
		this.drawBGCells();
		this.drawBGEXcells();
		this.drawQues51();

		this.drawGrid();

		this.drawShadedCells();

		this.drawBorders();
		this.drawBoxBorders(true);

		this.drawChassis_ex1(true);

		this.drawNumbersOn51();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeTilePaint();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeTilePaint();
	},

	decodeTilePaint : function(){
		// 盤面内数字のデコード
		var id=0, a=0, bstr = this.outbstr, bd = this.owner.board;
		bd.disableInfo();
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[id];

			if(ca>='g' && ca<='z'){ id+=(parseInt(ca,36)-16);}
			else{
				cell.set51cell();
				if     (ca==='-'){
					cell.qnum2 = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
					cell.qnum  = parseInt(bstr.substr(i+2,2),16);
					i+=3;
				}
				else if(ca==='+'){
					cell.qnum2 = parseInt(bstr.substr(i+1,2),16);
					cell.qnum  = (bstr.charAt(i+3)!=="." ? parseInt(bstr.charAt(i+3),16) : -1);
					i+=3;
				}
				else if(ca==='='){
					cell.qnum2 = parseInt(bstr.substr(i+1,2),16);
					cell.qnum  = parseInt(bstr.substr(i+3,2),16);
					i+=4;
				}
				else{
					cell.qnum2 = (bstr.charAt(i)  !=="." ? parseInt(bstr.charAt(i),16) : -1);
					cell.qnum  = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
					i+=1;
				}
			}

			id++;
			if(id>=bd.cellmax){ a=i+1; break;}
		}
		bd.enableInfo();

		// 盤面外数字のデコード
		id=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell = bd.excell[id];
			if     (ca==='.'){ excell.qnum2 = -1;}
			else if(ca==='-'){ excell.qnum2 = parseInt(bstr.substr(i+1,1),16); i+=2;}
			else             { excell.qnum2 = parseInt(ca,16);}
			id++;
			if(id>=bd.qcols){ a=i+1; break;}
		}
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell = bd.excell[id];
			if     (ca==='.'){ excell.qnum = -1;}
			else if(ca==='-'){ excell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { excell.qnum = parseInt(ca,16);}
			id++;
			if(id>=bd.qcols+bd.qrows){ a=i+1; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeTilePaint : function(type){
		var cm="", bd = this.owner.board;

		// 盤面内側の数字部分のエンコード
		var count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", cell=bd.cell[c];

			if(cell.ques===51){
				pstr+=cell.qnum2.toString(16);
				pstr+=cell.qnum.toString(16);

				if     (cell.qnum>=16 && cell.qnum2>=16){ pstr = ("="+pstr);}
				else if(cell.qnum>=16){ pstr = ("-"+pstr);}
				else if(cell.qnum2>=16){ pstr = ("+"+pstr);}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+15).toString(36);}

		// 盤面外側の数字部分のエンコード
		for(var c=0;c<bd.qcols;c++){
			var num = bd.excell[c].qnum2;
			if     (num<  0){ cm += ".";}
			else if(num< 16){ cm += num.toString(16);}
			else if(num<256){ cm += ("-"+num.toString(16));}
		}
		for(var c=bd.qcols;c<bd.qcols+bd.qrows;c++){
			var num = bd.excell[c].qnum;
			if     (num<  0){ cm += ".";}
			else if(num< 16){ cm += num.toString(16);}
			else if(num<256){ cm += ("-"+num.toString(16));}
		}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum51();
		this.decodeCell( function(cell,ca){
			if     (ca==="#"){ cell.qans = 1;}
			else if(ca==="+"){ cell.qsub = 1;}
			else if(ca==="-"){ cell.qsub = 3;}
		});
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum51();
		this.encodeCell( function(cell){
			if     (cell.qans===1){ return "# ";}
			else if(cell.qsub===1){ return "+ ";}
			else if(cell.qsub===3){ return "- ";}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSameColorTile",
		"checkRowsColsShadeCell"
	],

	checkRowsColsShadeCell : function(){
		this.checkRowsColsPartly(this.isShadeCount, function(cell){ return cell.is51cell();}, "asShadeNe");
	},
	isShadeCount : function(clist, info){
		var number = info.key51num;
		var count = clist.filter(function(cell){ return cell.isShade();}).length;
		var result = (number<0 || count===number);
		if(!result){
			info.keycell.seterr(1);
			clist.seterr(1);
		}
		return result;
	}
},

FailCode:{
	asShadeNe : ["数字の下か右にある黒マスの数が間違っています。","The number of shaded cells underward or rightward is not correct."]
}
});
