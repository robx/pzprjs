//
// パズル固有スクリプト部 数コロ版 sukoro.js v3.4.0
//
pzprv3.custom.sukoro = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.isAnsNumber     = true;
		this.NumberWithMB    = true;
		this.linkNumber      = true;

		this.floatbgcolor = "rgb(64, 64, 64)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){ this.inputqnum();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		this.key_sukoro(ca);
	},
	key_sukoro : function(ca){
		if(k.playmode){
			var cc=tc.getTCC();
			if     (ca==='q'||ca==='a'||ca==='z')          { ca=(bd.QsC(cc)===1?'1':'s1');}
			else if(ca==='w'||ca==='s'||ca==='x')          { ca=(bd.QsC(cc)===2?'2':'s2');}
			else if(ca==='e'||ca==='d'||ca==='c'||ca==='-'){ ca=' '; }
			else if(ca==='1' && bd.AnC(cc)===1)            { ca='s1';}
			else if(ca==='2' && bd.AnC(cc)===2)            { ca='s2';}
		}
		this.key_inputqnum(ca);
	}
},

KeyPopup:{
	enablemake : true,
	enableplay : true,
	generate : function(mode,type){
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.insertrow();
		if(mode==1){
			this.inputcol('num','knum.','-','?');
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('empty','','','');
			this.inputcol('empty','','','');
			this.insertrow();
		}
		else{
			this.tdcolor = pc.mbcolor;
			this.inputcol('num','knumq','q','○');
			this.inputcol('num','knumw','w','×');
			this.tdcolor = "black";
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('empty','','','');
			this.insertrow();
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	maxnum : 4
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawMBs();
		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSideCell(function(c1,c2){ return bd.sameNumber(c1,c2);}) ){
			this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
		}

		if( !this.checkDir4Cell(function(c){ return bd.areas.isBlock(c);},0) ){
			this.setAlert('数字と、その数字の上下左右に入る数字の数が一致していません。','The number of numbers placed in four adjacent cells is not equal to the number.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getNumberInfo() ) ){
			this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QsC(c)===1);}) ){
			this.setAlert('数字の入っていないマスがあります。','There is a cell that is not filled in number.'); return false;
		}

		return true;
	}
}
};
