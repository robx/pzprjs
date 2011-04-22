//
// パズル固有スクリプト部 タイルペイント版 tilepaint.js v3.4.0
//
pzprv3.custom.tilepaint = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			if     (this.btn.Left) { this.inputborder();}
			else if(this.btn.Right){ this.inputBGcolor1();}
		}
		else if(k.playmode){ this.inputtile();}
	},
	mouseup : function(){
		if(k.editmode && this.notInputted()){ this.input51();}
	},
	mousemove : function(){
		if(k.editmode){
			if     (this.btn.Left) { this.inputborder();}
			else if(this.btn.Right){ this.inputBGcolor1();}
		}
		else if(k.playmode){ this.inputtile();}
	},

	inputBGcolor1 : function(){
		var cc = this.cellid();
		if(cc===null || cc==this.mouseCell || bd.QuC(cc)==51){ return;}
		if(this.inputData===null){ this.inputData=(bd.QsC(cc)==0)?3:0;}
		bd.sQsC(cc, this.inputData);
		this.mouseCell = cc; 
		pc.paintCell(cc);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.inputnumber51(ca,{2:(bd.qcols-(tc.pos.x>>1)-1), 4:(bd.qrows-(tc.pos.y>>1)-1)});
	},

	enablemake_p : true,
	paneltype    : 51
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qnum: 0,
	qdir: 0,

	// 一部qsubで消したくないものがあるため上書き
	subclear : function(id){
		if(this.qsub===1){
			um.addOpe(bd.CELL, bd.QSUB, id, 1, 0);
			this.qsub = 0;
		}
		this.error = 0;
	}
},
EXCell:{
	qnum: 0,
	qdir: 0
},
Board:{
	isborder : 1,
	isexcell : 1,

	numzero        : true,
	disInputHatena : true,

	numberIsWhite : true,

	set51cell : function(c){
		this.sQuC(c,51); this.sQnC(c, 0); this.sDiC(c, 0); this.setWhite(c); this.sQsC(c, 0);
		this.set51aroundborder(c);
	},
	remove51cell : function(c){
		this.sQuC(c, 0); this.sQnC(c, 0); this.sDiC(c, 0); this.setWhite(c); this.sQsC(c, 0);
	},
	set51aroundborder : function(c){
		var id, cc;
		id=this.ub(c),cc=this.up(c); if(id!==null){ this.sQuB(id, ((cc!==null && this.QuC(cc)!==51)?1:0));}
		id=this.db(c),cc=this.dn(c); if(id!==null){ this.sQuB(id, ((cc!==null && this.QuC(cc)!==51)?1:0));}
		id=this.lb(c),cc=this.lt(c); if(id!==null){ this.sQuB(id, ((cc!==null && this.QuC(cc)!==51)?1:0));}
		id=this.rb(c),cc=this.rt(c); if(id!==null){ this.sQuB(id, ((cc!==null && this.QuC(cc)!==51)?1:0));}
	}
},

AreaManager:{
	hasroom : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustQues51_1(key,d);
	},
	adjustBoardData2 : function(key,d){
		this.adjustQues51_2(key,d);
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.bbcolor = "rgb(127, 127, 127)";
		this.setBGCellColorFunc('qsub3');
	},
	paint : function(){
		this.drawBGCells();
		this.drawBGEXcells();
		this.drawQues51();

		this.drawGrid();
		this.drawBorders();

		this.drawBlackCells();
		this.drawBoxBorders(true);

		this.drawChassis_ex1(true);

		this.drawNumbersOn51();

		this.drawTarget();
	},
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeTilePaint();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeTilePaint();
	},

	decodeTilePaint : function(){
		// 盤面内数字のデコード
		var cell=0, a=0, bstr = this.outbstr;
		bd.disableInfo();
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[cell];

			if(ca>='g' && ca<='z'){ cell+=(parseInt(ca,36)-16);}
			else{
				bd.set51cell(cell);
				if     (ca==='-'){
					obj.qdir = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
					obj.qnum = parseInt(bstr.substr(i+2,2),16);
					i+=3;
				}
				else if(ca==='+'){
					obj.qdir = parseInt(bstr.substr(i+1,2),16);
					obj.qnum = (bstr.charAt(i+3)!=="." ? parseInt(bstr.charAt(i+3),16) : -1);
					i+=3;
				}
				else if(ca==='='){
					obj.qdir = parseInt(bstr.substr(i+1,2),16);
					obj.qnum = parseInt(bstr.substr(i+3,2),16);
					i+=4;
				}
				else{
					obj.qdir = (bstr.charAt(i)  !=="." ? parseInt(bstr.charAt(i),16) : -1);
					obj.qnum = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
					i+=1;
				}
			}

			cell++;
			if(cell>=bd.cellmax){ a=i+1; break;}
		}
		bd.enableInfo();

		// 盤面外数字のデコード
		cell=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (ca==='.'){ bd.excell[cell].qdir = -1;}
			else if(ca==='-'){ bd.excell[cell].qdir = parseInt(bstr.substr(i+1,1),16); i+=2;}
			else             { bd.excell[cell].qdir = parseInt(ca,16);}
			cell++;
			if(cell>=bd.qcols){ a=i+1; break;}
		}
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (ca==='.'){ bd.excell[cell].qnum = -1;}
			else if(ca==='-'){ bd.excell[cell].qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { bd.excell[cell].qnum = parseInt(ca,16);}
			cell++;
			if(cell>=bd.qcols+bd.qrows){ a=i+1; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeTilePaint : function(type){
		var cm="";

		// 盤面内側の数字部分のエンコード
		var count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", obj=bd.cell[c];

			if(obj.ques===51){
				pstr+=obj.qdir.toString(16);
				pstr+=obj.qnum.toString(16);

				if     (obj.qnum>=16 && obj.qdir>=16){ pstr = ("="+pstr);}
				else if(obj.qnum>=16){ pstr = ("-"+pstr);}
				else if(obj.qdir>=16){ pstr = ("+"+pstr);}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+15).toString(36);}

		// 盤面外側の数字部分のエンコード
		for(var c=0;c<bd.qcols;c++){
			var num = bd.excell[c].qdir;
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
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 3;}
		});
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum51();
		this.encodeCell( function(obj){
			if     (obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else if(obj.qsub===3){ return "- ";}
			else                 { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSameObjectInRoom(bd.areas.getRoomInfo(), function(c){ return (bd.isBlack(c)?1:2);}) ){
			this.setAlert('白マスと黒マスの混在したタイルがあります。','A tile includes both black and white cells.'); return false;
		}

		if( !this.checkRowsColsPartly(this.isBCellCount, function(cc){ return (bd.QuC(cc)==51);}, false) ){
			this.setAlert('数字の下か右にある黒マスの数が間違っています。','The number of black cells underward or rightward is not correct.'); return false;
		}

		return true;
	},

	isBCellCount : function(keycellpos, clist){
		var number, bx=keycellpos[0], by=keycellpos[1], dir=keycellpos[2];
		if     (dir===bd.RT){ number = (bx===-1 ? bd.QnE(bd.exnum(-1,by)) : bd.QnC(bd.cnum(bx,by)));}
		else if(dir===bd.DN){ number = (by===-1 ? bd.DiE(bd.exnum(bx,-1)) : bd.DiC(bd.cnum(bx,by)));}

		var count = 0;
		for(var i=0;i<clist.length;i++){
			if(bd.isBlack(clist[i])){ count++;}
		}
		if(number>=0 && count!=number){
			var isex = (keycellpos[0]===-1 || keycellpos[1]===-1);
			if(isex){ bd.sErE(bd.exnum(keycellpos[0],keycellpos[1]),1);}
			else    { bd.sErC(bd.cnum (keycellpos[0],keycellpos[1]),1);}
			bd.sErC(clist,1);
			return false;
		}
		return true;
	}
}
};
