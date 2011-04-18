//
// パズル固有スクリプト部 モチコロ版 mochikoro.js v3.4.0
//
pzprv3.custom.mochikoro = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.inputqnum();}
		else if(k.playmode){ this.inputcell();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputcell();}
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
	numberIsWhite : true,

	getdir8WareaInfo : function(){
		var winfo = new pzprv3.core.AreaInfo();
		for(var c=0;c<this.cellmax;c++){ winfo.id[c]=(this.isWhite(c)?0:null);}
		for(var c=0;c<this.cellmax;c++){
			if(winfo.id[c]!==0){ continue;}
			winfo.max++;
			winfo.room[winfo.max] = {idlist:[]};
			this.sk0(winfo, c, winfo.max);
		}
		return winfo;
	},
	sk0 : function(winfo, id, areaid){
		if(winfo.id[id]!==0){ return;}
		winfo.id[id] = areaid;
		winfo.room[areaid].idlist.push(id);

		var bx=this.cell[id].bx, by=this.cell[id].by;
		var clist = this.cellinside(bx-2, by-2, bx+2, by+2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(c!==id && winfo.id[c]===0){ this.sk0(winfo, c, areaid);}
		}
	}
},

AreaManager:{
	checkWhiteCell : true
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
		this.bcolor = this.bcolor_GREEN;
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
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
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.check2x2Block( function(c){ return bd.isBlack(c);} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。','There is a block of 2x2 black cells.'); return false;
		}

		if( !this.checkOneArea( bd.getdir8WareaInfo() ) ){
			this.setAlert('孤立した白マスのブロックがあります。','White cells are devided.'); return false;
		}

		var winfo = bd.areas.getWCellInfo();
		if( !this.checkAreaRect(winfo) ){
			this.setAlert('四角形でない白マスのブロックがあります。','There is a block of white cells that is not rectangle.'); return false;
		}

		if( !this.checkDoubleNumber(winfo) ){
			this.setAlert('1つのブロックに2つ以上の数字が入っています。','A block has plural numbers.'); return false;
		}

		if( !this.checkNumberAndSize(winfo) ){
			this.setAlert('数字とブロックの面積が違います。','A size of tha block and the number written in the block is differrent.'); return false;
		}

		return true;
	}
}
};
