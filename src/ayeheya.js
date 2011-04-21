//
// パズル固有スクリプト部 ∀人∃ＨＥＹＡ版 ayeheya.js v3.4.0
//
pzprv3.custom.ayeheya = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
		else if(k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

KeyPopup:{
	paneltype  : 10,
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	numzero : true,

	nummaxfunc : function(cc){
		var id = this.areas.rinfo.id[cc];
		var d = this.getSizeOfClist(this.areas.rinfo[id].clist);
		var m=d.cols, n=d.rows; if(m>n){ var t=m;m=n;n=t;}
		if     (m===1){ return ((n+1)>>1);}
		else if(m===2){ return n;}
		else if(m===3){
			if     (n%4===0){ return (n  )/4*5  ;}
			else if(n%4===1){ return (n-1)/4*5+2;}
			else if(n%4===2){ return (n-2)/4*5+3;}
			else            { return (n+1)/4*5  ;}
		}
		else{
			if(((Math.log(m+1)/Math.log(2))%1===0)&&(m===n)){ return (m*n+m+n)/3;}
			else if((m&1)&&(n&1)){ return (((m*n+m+n-1)/3)|0);}
			else{ return (((m*n+m+n-2)/3)|0);}
		}
	}
},

AreaManager:{
	hasroom        : true,
	roomNumber     : true,
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addRedBlockRBToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.bbcolor = "rgb(160, 255, 191)";
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(false);

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	},

	decodeKanpen : function(){
		fio.decodeSquareRoom();
	},
	encodeKanpen : function(){
		fio.encodeSquareRoom();
	},

	decodeHeyaApp : function(){
		var c=0, rdata=[];
		while(c<bd.cellmax){ rdata[c]=null; c++;}

		var i=0, inp=this.outbstr.split("/");
		for(var c=0;c<bd.cellmax;c++){
			if(rdata[c]!==null){ continue;}

			if(inp[i].match(/(\d+in)?(\d+)x(\d+)$/)){
				if(RegExp.$1.length>0){ bd.cell[c].qnum = parseInt(RegExp.$1);}
				var x1 = bd.cell[c].bx, x2 = x1 + 2*parseInt(RegExp.$2) - 2;
				var y1 = bd.cell[c].by, y2 = y1 + 2*parseInt(RegExp.$3) - 2;
				fio.setRdataRect(rdata, i, {x1:x1, x2:x2, y1:y1, y2:y2});
			}
			i++;
		}
		fio.rdata2Border(true, rdata);
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAns();
	},

	kanpenOpen : function(){
		this.decodeSquareRoom();
		this.decodeCellAns();
	},
	kanpenSave : function(){
		this.encodeSquareRoom();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
			this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getWCellInfo() ) ){
			this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkFractal(rinfo) ){
			this.setAlert('部屋の中の黒マスが点対称に配置されていません。', 'Position of black cells in the room is not point symmetric.'); return false;
		}

		if( !this.checkBlackCellCount(rinfo) ){
			this.setAlert('部屋の数字と黒マスの数が一致していません。','The number of Black cells in the room and The number written in the room is different.'); return false;
		}

		if( !this.checkRowsColsPartly(this.isBorderCount, function(c){ return bd.isBlack(c);}, false) ){
			this.setAlert('白マスが3部屋連続で続いています。','White cells are continued for three consecutive room.'); return false;
		}

		if( !this.checkAreaRect(rinfo) ){
			this.setAlert('四角形ではない部屋があります。','There is a room whose shape is not square.'); return false;
		}

		return true;
	},

	checkFractal : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var d = bd.getSizeOfClist(rinfo.room[r].idlist);
			var sx=d.x1+d.x2, sy=d.y1+d.y2;
			for(var i=0;i<rinfo.room[r].idlist.length;i++){
				var c=rinfo.room[r].idlist[i];
				if(bd.isBlack(c) ^ bd.isBlack(bd.cnum(sx-bd.cell[c].bx, sy-bd.cell[c].by))){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[r].idlist,1);
					result = false;
				}
			}
		}
		return result;
	},

	isBorderCount : function(keycellpos, clist){
		var d = bd.getSizeOfClist(clist), count = 0, bx, by;
		if(d.x1===d.x2){
			bx = d.x1;
			for(by=d.y1+1;by<=d.y2-1;by+=2){
				if(bd.isBorder(bd.bnum(bx,by))){ count++;}
			}
		}
		else if(d.y1===d.y2){
			by = d.y1;
			for(bx=d.x1+1;bx<=d.x2-1;bx+=2){
				if(bd.isBorder(bd.bnum(bx,by))){ count++;}
			}
		}

		if(count>=2){ bd.sErC(clist,1); return false;}
		return true;
	}
}
};
