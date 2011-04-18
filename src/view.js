//
// パズル固有スクリプト部 ヴィウ版 view.js v3.4.0
//
pzprv3.custom.view = {
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
		this.key_view(ca);
	},
	key_view : function(ca){
		if(k.playmode){
			var cc=tc.getTCC();
			if     (ca==='q'||ca==='a'||ca==='z')          { ca='s1';}
			else if(ca==='w'||ca==='s'||ca==='x')          { ca='s2';}
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
		if(mode==3){
			this.tdcolor = (pzprv3.getPuzzleClass('Graphic')).prototype.mbcolor;
			this.inputcol('num','knumq','q','○');
			this.inputcol('num','knumw','w','×');
			this.tdcolor = "black";
			this.inputcol('empty','','','');
			this.inputcol('empty','','','');
			this.insertrow();
		}
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.insertrow();
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum_',' ',' ');
		((mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','','',''));
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	numzero : true,

	numberWithMB : true,

	nummaxfunc : function(cc){
		return Math.min(this.qcols+this.qrows-2, this.maxnum);
	},

	// 正答判定用
	getViewClist : function(c){
		var sx=this.cell[c].bx, sy=this.cell[c].by, clist=[];
		for(var dir=1;dir<=4;dir++){
			var cc, bx=sx, by=sy;
			while(1){
				switch(dir){ case 1: by-=2; break; case 2: by+=2; break; case 3: bx-=2; break; case 4: bx+=2; break;}
				cc = this.cnum(bx,by);
				if(cc!==null && this.noNum(cc) && this.cell[cc].qsub!==1){ clist.push(cc);}
				else{ break;}
			}
		}
		return clist;
	}
},

AreaManager:{
	linkNumber : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.errbcolor2 = "rgb(255, 255, 127)";
		this.setBGCellColorFunc('error2');
	},
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
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
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

		if( !this.checkCellNumber() ){
			this.setAlert('数字と、他のマスにたどり着くまでのマスの数の合計が一致していません。','Sum of four-way gaps to another number is not equal to the number.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getNumberInfo() ) ){
			this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QsC(c)===1);}) ){
			this.setAlert('数字の入っていないマスがあります。','There is a cell that is not filled in number.'); return false;
		}

		return true;
	},

	checkCellNumber : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(!bd.isValidNum(c)){ continue;}

			var clist = bd.getViewClist(c);
			if(bd.getNum(c)!==clist.length){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				bd.sErC(clist,2);
				result = false;
			}
		}
		return result;
	}
}
};
