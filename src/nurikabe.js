//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js v3.4.0
//
pzprv3.custom.nurikabe = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	},
	inputRed : function(){ if(this.owner.pid==='nurikabe'){ this.dispRed();}}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	numberIsWhite : true,

	getdir8WareaInfo : function(){
		var winfo = new pzprv3.core.AreaInfo();
		for(var fc=0;fc<this.cellmax;fc++){ winfo.id[fc]=(this.isWhite(fc)?0:null);}
		for(var fc=0;fc<this.cellmax;fc++){
			if(winfo.id[fc]!==0){ continue;}
			winfo.max++;
			winfo.room[winfo.max] = {idlist:[]};

			var stack=[fc], id=winfo.max;
			while(stack.length>0){
				var c=stack.pop();
				if(winfo.id[c]!==0){ continue;}
				winfo.id[c] = id;
				winfo.room[id].idlist.push(c);

				var bx=this.cell[c].bx, by=this.cell[c].by;
				var clist = this.cellinside(bx-2, by-2, bx+2, by+2);
				for(var i=0;i<clist.length;i++){
					if(winfo.id[clist[i]]===0){ stack.push(clist[i]);}
				}
			}
		}
		return winfo;
	}
},

AreaManager:{
	initialize : function(owner){
		this.SuperFunc.initialize.call(this, owner);
		if(owner.pid!=='mochikoro'){ this.checkBlackCell = true;}
	},
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		if(this.owner.pid==='nurikabe'){
			this.addRedBlockToFlags();
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		if(this.owner.pid!=='nurikabe'){
			this.bcolor = this.bcolor_GREEN;
			this.setBGCellColorFunc('qsub1');
		}
	},
	paint : function(){
		this.drawBGCells();
		if(this.owner.pid==='nurikabe'){ this.drawDotCells(false);}
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
		if(this.owner.pid==='nurikabe'){
			this.decodeCellQnumAns();
		}
		else{
			this.decodeCellQnum();
			this.decodeCellAns();
		}
	},
	encodeData : function(){
		if(this.owner.pid==='nurikabe'){
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
		var mochi = (this.owner.pid==='mochikoro'||this.owner.pid==='mochinyoro');

		if( (this.owner.pid!=='nuribou') && !this.check2x2Block( function(c){ return bd.isBlack(c);} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。','There is a 2x2 block of black cells.'); return false;
		}

		if(this.owner.pid!=='mochikoro'){ var binfo = bd.areas.getBCellInfo();}
		if( (this.owner.pid==='nuribou') && !this.checkAllArea(binfo, function(w,h,a,n){ return (w==1||h==1);} ) ){
			this.setAlert('「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。','There is a mass of black cells, whose width is more than two.'); return false;
		}

		if( (this.owner.pid==='nuribou') && !this.checkCorners(binfo) ){
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

		if( (this.owner.pid==='nurikabe') && !this.checkOneArea( binfo ) ){
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

		if( this.owner.pid==='mochinyoro' && !this.checkAllArea(binfo, function(w,h,a,n){ return (w*h!=a);} ) ){
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
