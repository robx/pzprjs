//
// パズル固有スクリプト部 トリプレイス版 triplace.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['triplace'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes:{edit:['cell51','clear','number'],play:['border','subline','bgcolor','bgcolor1','bgcolor2','clear']},
	mouseinput_clear : function(){
		this.input51_fixed();
	},
	mouseinput_number : function(){
		if(this.mousestart){ this.inputqnum_cell51();}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(!this.puzzle.key.isZ){
					if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
					else{ this.inputQsubLine();}
				}
				else{ this.inputBGcolor();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputBGcolor();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.input51();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.inputnumber51(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	disInputHatena : true,

	getmaxnum : function(){
		var bd=this.board, target = this.puzzle.cursor.detectTarget(this);
		return (target===this.RT ? (bd.cols-(this.bx>>1)-1) : (bd.rows-(this.by>>1)-1));
	},
	minnum : 0,

	set51cell : function(){
		this.setQues(51);
		this.setQnum(-1);
		this.setQnum2(-1);
		this.set51aroundborder();
	},
	remove51cell : function(){
		this.setQues(0);
		this.setQnum(-1);
		this.setQnum2(-1);
		this.set51aroundborder();
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
	disInputHatena : true,
	ques : 51,
	getmaxnum : function(){
		var bd = this.board;
		return (this.by===-1 ? bd.rows : bd.cols);
	},
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

AreaRoomGraph:{
	enabled : true,
	isnodevalid : function(cell){ return !cell.is51cell();},

	// オーバーライド
	setExtraData : function(component){
		component.clist = new this.klass.CellList(component.getnodeobjs());

		var d = component.clist.getRectSize();
		component.is1x3 = (((d.x1===d.x2)||(d.y1===d.y2)) && d.cnt===3);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub2",

	paint : function(){
		this.drawBGCells();
		this.drawBGEXcells();
		this.drawQues51();

		this.drawGrid();
		this.drawQansBorders();
		this.drawQuesBorders();

		this.drawBorderQsubs();

		this.drawChassis_ex1(false);

		this.drawQuesNumbersOn51();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeTriplace();
	},
	encodePzpr : function(type){
		this.encodeTriplace();
	},

	decodeTriplace : function(){
		// 盤面内数字のデコード
		var id=0, a=0, bstr = this.outbstr, bd = this.board;
		bd.disableInfo();
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[id];

			if(ca>='g' && ca<='z'){ id+=(parseInt(ca,36)-16);}
			else{
				cell.set51cell();
				if     (ca==='_'){}
				else if(ca==='%'){ cell.qnum2 = parseInt(bstr.charAt(i+1),36); i++;}
				else if(ca==='$'){ cell.qnum  = parseInt(bstr.charAt(i+1),36); i++;}
				else if(ca==='-'){
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
			if(!bd.cell[id]){ a=i+1; break;}
		}
		bd.enableInfo();

		// 盤面外数字のデコード
		id=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell = bd.excell[id];
			if     (ca==='.'){ excell.qnum2 = -1;}
			else if(ca==='-'){ excell.qnum2 = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { excell.qnum2 = parseInt(ca,16);}
			id++;
			if(id>=bd.cols){ a=i+1; break;}
		}
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell = bd.excell[id];
			if     (ca==='.'){ excell.qnum = -1;}
			else if(ca==='-'){ excell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { excell.qnum = parseInt(ca,16);}
			id++;
			if(id>=bd.cols+bd.rows){ a=i+1; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeTriplace : function(type){
		var cm="", bd=this.board;

		// 盤面内側の数字部分のエンコード
		var count=0;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", cell=bd.cell[c];

			if(cell.ques===51){
				if(cell.qnum===-1 && cell.qnum2===-1){ pstr="_";}
				else if(cell.qnum2===-1 && cell.qnum <35){ pstr="$"+cell.qnum.toString(36);}
				else if(cell.qnum ===-1 && cell.qnum2<35){ pstr="%"+cell.qnum2.toString(36);}
				else{
					pstr+=cell.qnum2.toString(16);
					pstr+=cell.qnum.toString(16);

					if     (cell.qnum >=16 && cell.qnum2>=16){ pstr = ("="+pstr);}
					else if(cell.qnum >=16){ pstr = ("-"+pstr);}
					else if(cell.qnum2>=16){ pstr = ("+"+pstr);}
				}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+15).toString(36);}

		// 盤面外側の数字部分のエンコード
		for(var c=0;c<bd.cols;c++){
			var num = bd.excell[c].qnum2;
			if     (num<  0){ cm += ".";}
			else if(num< 16){ cm += num.toString(16);}
			else if(num<256){ cm += ("-"+num.toString(16));}
		}
		for(var c=bd.cols;c<bd.cols+bd.rows;c++){
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
		this.decodeCellQnum51();
		this.decodeBorderAns();
		this.decodeCell( function(cell,ca){
			if     (ca==="+"){ cell.qsub = 1;}
			else if(ca==="-"){ cell.qsub = 2;}
		});
	},
	encodeData : function(){
		this.encodeCellQnum51();
		this.encodeBorderAns();
		this.encodeCell( function(cell){
			if     (cell.qsub===1){ return "+ ";}
			else if(cell.qsub===2){ return "- ";}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkOverThreeCells",
		"checkRowsColsTileCount",
		"checkLessThreeCells"
	],

	checkOverThreeCells : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (a>=3);}, "bkSizeLt3");
	},
	checkLessThreeCells : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (a<=3);}, "bkSizeGt3");
	},

	checkRowsColsTileCount : function(){
		this.checkRowsColsPartly(this.isTileCount, function(cell){ return cell.is51cell();}, "asLblockNe");
	},
	isTileCount : function(clist, info){
		var number = info.key51num, count = 0;
		for(var i=0;i<clist.length;i++){
			var tile = clist[i].room;
			if(tile.is1x3 && !tile.counted){ count++; tile.counted = true;}
		}
		var result = (number<0 || count===number);
		if(!result){
			info.keycell.seterr(1);
			clist.seterr(1);
		}
		for(var i=0;i<clist.length;i++){
			clist[i].room.counted = false;
		}
		return result;
	}
},

FailCode:{
	bkSizeLt3 : ["サイズが3マスより小さいブロックがあります。","The size of block is smaller than three."],
	bkSizeGt3 : ["サイズが3マスより大きいブロックがあります。","The size of block is larger than three."],
	asLblockNe : ["数字の下か右にあるまっすぐのブロックの数が間違っています。","The number of straight blocks underward or rightward is not correct."]
}
}));
