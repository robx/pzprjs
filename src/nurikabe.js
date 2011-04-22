//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js v3.4.0
//
pzprv3.custom.nurikabe = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(bd.puzzleid==='nurikabe' && (kc.isZ ^ pp.getVal('dispred'))){ this.dispRed();}
		else if(k.editmode){ this.inputqnum();}
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
	initialize : function(pid){
		this.SuperFunc.initialize.call(this,pid);
		if(pid!=='mochikoro'){ this.checkBlackCell = true;}
	},
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		if(bd.puzzleid==='nurikabe'){
			this.addRedBlockToFlags();
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		if(bd.puzzleid!=='nurikabe'){
			this.bcolor = this.bcolor_GREEN;
			this.setBGCellColorFunc('qsub1');
		}
	},
	paint : function(){
		this.drawBGCells();
		if(bd.puzzleid==='nurikabe'){ this.drawDotCells(false);}
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
	},

	decodeKanpen : function(){
		fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		if(bd.puzzleid==='nurikabe'){
			this.decodeCellQnumAns();
		}
		else{
			this.decodeCellQnum();
			this.decodeCellAns();
		}
	},
	encodeData : function(){
		if(bd.puzzleid==='nurikabe'){
			this.encodeCellQnumAns();
		}
		else{
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	kanpenOpen : function(){
		this.decodeCellQnumAns_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnumAns_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var mochi = (bd.puzzleid==='mochikoro'||bd.puzzleid==='mochinyoro');

		if( (bd.puzzleid!=='nuribou') && !this.check2x2Block( function(c){ return bd.isBlack(c);} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。','There is a 2x2 block of black cells.'); return false;
		}

		if(bd.puzzleid!=='mochikoro'){ var binfo = bd.areas.getBCellInfo();}
		if( (bd.puzzleid==='nuribou') && !this.checkAllArea(binfo, function(w,h,a,n){ return (w==1||h==1);} ) ){
			this.setAlert('「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。','There is a mass of black cells, whose width is more than two.'); return false;
		}

		if( (bd.puzzleid==='nuribou') && !this.checkCorners(binfo) ){
			this.setAlert('同じ面積の黒マスのカタマリが、角を共有しています。','Masses of black cells whose length is the same share a corner.'); return false;
		}

		if( (mochi) && !this.checkOneArea( bd.getdir8WareaInfo() ) ){
			this.setAlert('孤立した白マスのブロックがあります。','White cells are devided.'); return false;
		}

		var winfo = bd.areas.getWCellInfo();
		if( (mochi) && !this.checkAreaRect(winfo) ){
			this.setAlert('四角形でない白マスのブロックがあります。','There is a block of white cells that is not rectangle.'); return false;
		}

		if( (!mochi) && !this.checkNoNumber(winfo) ){
			this.setAlert('数字の入っていないシマがあります。','An area of white cells has no numbers.'); return false;
		}

		if( (bd.puzzleid==='nurikabe') && !this.checkOneArea( binfo ) ){
			this.setAlert('黒マスが分断されています。','Black cells are devided,'); return false;
		}

		if( !this.checkDoubleNumber(winfo) ){
			if(!mochi){ this.setAlert('1つのシマに2つ以上の数字が入っています。','An area of white cells has plural numbers.');}
			else      { this.setAlert('1つのブロックに2つ以上の数字が入っています。','A block has plural numbers.');}
			return false;
		}

		if( !this.checkNumberAndSize(winfo) ){
			if(!mochi){ this.setAlert('数字とシマの面積が違います。','The number is not equal to the number of the size of the area.');}
			else      { this.setAlert('数字とブロックの面積が違います。','A size of tha block and the number written in the block is differrent.');}
			return false;
		}

		if( bd.puzzleid==='mochinyoro' && !this.checkAllArea(binfo, function(w,h,a,n){ return (w*h!=a);} ) ){
			this.setAlert('四角形になっている黒マスのブロックがあります。','There is a block of black cells that is rectangle.'); return false;
		}

		return true;
	},

	checkCorners : function(binfo){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].bx===bd.maxbx-1 || bd.cell[c].by===bd.maxby-1){ continue;}

			var cc1, cc2;
			if     ( bd.isBlack(c) && bd.isBlack(c+bd.qcols+1) ){ cc1 = c; cc2 = c+bd.qcols+1;}
			else if( bd.isBlack(c+1) && bd.isBlack(c+bd.qcols) ){ cc1 = c+1; cc2 = c+bd.qcols;}
			else{ continue;}

			if(binfo.room[binfo.id[cc1]].idlist.length == binfo.room[binfo.id[cc2]].idlist.length){
				if(this.inAutoCheck){ return false;}
				bd.sErC(binfo.room[binfo.id[cc1]].idlist,1);
				bd.sErC(binfo.room[binfo.id[cc2]].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
