//
// パズル固有スクリプト部 ナンロー版 nanro.js v3.4.0
//
pzprv3.custom.nanro = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputborder();}
		else if(this.mouseend && this.notInputted()){
			this.mouseCell=null;
			this.inputqnum();
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.dragnumber_nanro();}
			else if(this.mousemove && this.btn.Right){ this.inputDot_nanro();}
		}
		else if(this.mouseend && this.notInputted()){
			this.mouseCell=null;
			this.inputqnum();
		}
	},

	dragnumber_nanro : function(){
		var cc = this.cellid();
		if(cc===null||cc===this.mouseCell){ return;}
		if(this.mouseCell===null){
			this.inputData = bd.getNum(cc);
			if     (this.inputData===-2){ this.inputData=null;}
			else if(this.inputData===-1){
				if     (bd.QsC(cc)===1){ this.inputData=-2;}
				else if(bd.QsC(cc)===2){ this.inputData=-3;}
			}
			this.mouseCell = cc;
		}
		else if(bd.QnC(cc)===-1){
			bd.setNum(cc,this.inputData);
			this.mouseCell = cc;
			pc.paintCell(cc);
		}
	},
	inputDot_nanro : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell || bd.isNum(cc)){ return;}
		if(this.inputData===null){ this.inputData = (bd.QsC(cc)===2?0:2);}
		if     (this.inputData==2){ bd.sAnC(cc,-1); bd.sQsC(cc,2);}
		else if(this.inputData==0){ bd.sAnC(cc,-1); bd.sQsC(cc,0);}
		this.mouseCell = cc;
		pc.paintCell(cc);
	}
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
		if(this.owner.playmode){
			var cc=tc.getTCC();
			if     (ca==='q'||ca==='a'||ca==='z')          { ca='s1';}
			else if(ca==='w'||ca==='s'||ca==='x')          { ca='s2';}
			else if(ca==='e'||ca==='d'||ca==='c'||ca==='-'){ ca=' '; }
			else if(ca==='1' && bd.AnC(cc)===1)            { ca='s1';}
			else if(ca==='2' && bd.AnC(cc)===2)            { ca='s2';}
		}
		this.key_inputqnum(ca);
	},

	enablemake_p : true,
	enableplay_p : true,
	generate : function(mode,type){
		if(mode==3){
			this.tdcolor = pc.mbcolor;
			this.inputcol('num','knumq','q','○');
			this.inputcol('num','knumw','w','×');
			this.tdcolor = "black";
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('empty','','','');
			this.insertrow();
		}
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.insertrow();
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.insertrow();
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		((mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','','',''));
		((mode==1)?this.inputcol('num','knumc',' ','') :this.inputcol('empty','','',''));
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	numberWithMB : true,

	nummaxfunc : function(cc){
		return this.areas.rinfo.getCntOfRoomByCell(cc);
	}
},

AreaManager:{
	hasroom    : true,
	linkNumber : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawMBs();
		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		fio.decodeAreaRoom();
		fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		fio.encodeAreaRoom();
		fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.check2x2Block(function(c){ return bd.isNum(c);}) ){
			this.setAlert('数字が2x2のかたまりになっています。','There is a 2x2 block of numbers.'); return false;
		}

		if( !this.checkSideAreaCell(rinfo, function(c1,c2){ return bd.sameNumber(c1,c2);}, false) ){
			this.setAlert('同じ数字が境界線を挟んで隣り合っています。','Adjacent blocks have the same number.'); return false;
		}

		var rinfo = this.getErrorFlag_cell();
		if( !this.checkErrorFlag_cell(rinfo, 4) ){
			this.setAlert('複数種類の数字が入っているブロックがあります。','A block has two or more kinds of numbers.'); return false;
		}

		if( !this.checkErrorFlag_cell(rinfo, 1) ){
			this.setAlert('入っている数字の数が数字より多いです。','A number is bigger than the size of block.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getNumberInfo() ) ){
			this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
		}

		if( !this.checkErrorFlag_cell(rinfo, 2) ){
			this.setAlert('入っている数字の数が数字より少ないです。','A number is smaller than the size of block.'); return false;
		}

		if( !this.checkErrorFlag_cell(rinfo, 3) ){
			this.setAlert('数字が含まれていないブロックがあります。','A block has no number.'); return false;
		}

		return true;
	},

	getErrorFlag_cell : function(){
		var rinfo = bd.areas.getRoomInfo();
		for(var id=1,max=rinfo.max;id<=max;id++){
			var room = rinfo.room[id];
			room.error  =  0;		// 後でエラー表示するエラーのフラグ
			room.number = -1;		// そのエリアに入っている数字
			var nums = [];			// キーの数字が入っている数
			var numcnt = 0;			// エリアに入っている数字の種類数
			var emptycell = 0;		// 数字が入っていないセルの数
			var filled = 0;			// エリアに入っている数字
			for(var i=0;i<room.idlist.length;i++){
				var c = room.idlist[i];
				var num = bd.getNum(c);
				if(num==-1){ emptycell++;}
				else if(isNaN(nums[num])){ numcnt++; filled=num; nums[num]=1;}
				else{ nums[num]++;}
			}
			if(numcnt>1)                               { room.error=4;}
			else if(numcnt==0)                         { room.error=3;}
			else if(numcnt==1 && filled < nums[filled]){ room.error=1; room.number=filled;}
			else if(numcnt==1 && filled > nums[filled]){ room.error=2; room.number=filled;}
			else                                       { room.error=-1;room.number=filled;}
		}
		return rinfo;
	}
}
};
