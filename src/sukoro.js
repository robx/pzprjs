//
// パズル固有スクリプト部 数コロ・ヴィウ・数コロ部屋版 sukoro.js v3.4.0
//
pzprv3.custom.sukoro = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(bd.puzzleid==='sukoro' || bd.puzzleid==='view'){
			this.inputqnum();
		}
		else if(bd.puzzleid==='sukororoom'){
			if(k.editmode){ this.inputborder();}
			if(k.playmode){ this.inputqnum();}
		}
	},
	mouseup : function(){
		if(bd.puzzleid==='sukororoom' && this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(bd.puzzleid==='sukororoom' && k.editmode && this.btn.Left){ this.inputborder();}
	}
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
	},

	enablemake_p : true,
	enableplay_p : true,
	generate : function(mode,type){
		var mbcolor = (pzprv3.getPuzzleClass('Graphic')).prototype.mbcolor;
		if(bd.puzzleid==='sukoro'||bd.puzzleid==='sukororoom'){
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
				this.tdcolor = mbcolor;
				this.inputcol('num','knumq','q','○');
				this.inputcol('num','knumw','w','×');
				this.tdcolor = "black";
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','','','');
				this.insertrow();
			}
		}
		else if(bd.puzzleid=='view'){
			if(mode==3){
				this.tdcolor = mbcolor;
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
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	numberWithMB : true,

	initialize : function(pid){
		this.SuperFunc.initialize.call(this,pid);

		if(pid==='view' || pid==='sukororoom'){
			this.qcols = 8;
			this.qrows = 8;
		}
		if(pid==='view'){
			this.minnum = 0;
		}
		if(pid==='sukororoom'){
			this.isborder = 1;
		}
	},

	nummaxfunc : function(cc){
		return (this.puzzleid==='view' ? Math.min(this.qcols+this.qrows-2, this.maxnum) : 4);
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
	initialize : function(pid){
		this.SuperFunc.initialize.call(this,pid);
		if(pid==='sukororoom'){ this.hasroom = true;}
	},
	linkNumber : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		if(bd.puzzleid==='view'){
			this.errbcolor2 = "rgb(255, 255, 127)";
			this.setBGCellColorFunc('error2');
		}
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		if(bd.puzzleid==='sukororoom'){ this.drawBorders();}

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
		var pid = bd.puzzleid;
		if(pid==='sukoro'||pid==='sukororoom'){
			if(pid==='sukororoom'){ this.decodeBorder();}
			this.decodeNumber10();
		}
		else if(pid==='view'){
			this.decodeNumber16();
		}
	},
	pzlexport : function(type){
		var pid = bd.puzzleid;
		if(pid==='sukoro'||pid==='sukororoom'){
			if(bd.puzzleid==='sukororoom'){ this.encodeBorder();}
			this.encodeNumber10();
		}
		else if(pid==='view'){
			this.encodeNumber16();
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		if(bd.puzzleid==='sukororoom'){ this.decodeBorderQues();}
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		if(bd.puzzleid==='sukororoom'){ this.encodeBorderQues();}
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( (bd.puzzleid!=='sukororoom') && !this.checkSideCell(function(c1,c2){ return bd.sameNumber(c1,c2);}) ){
			this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
		}

		if(bd.puzzleid==='sukororoom'){ var rinfo = bd.areas.getRoomInfo();}
		if( (bd.puzzleid==='sukororoom') && !this.checkDifferentNumberInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
		}

		if( (bd.puzzleid==='sukororoom') && !this.checkSameObjectInRoom(rinfo, function(c){ return (bd.isNumberObj(c)?1:2);}) ){
			this.setAlert('数字のあるなしが混在した部屋があります。','A room includes both numbered and non-numbered cells.'); return false;
		}

		if( (bd.puzzleid!=='view') && !this.checkDir4Cell(function(c){ return bd.isNumberObj(c);},0) ){
			this.setAlert('数字と、その数字の上下左右に入る数字の数が一致していません。','The number of numbers placed in four adjacent cells is not equal to the number.'); return false;
		}

		if( (bd.puzzleid==='view') && !this.checkViewNumber() ){
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

	checkViewNumber : function(){
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
