//
// パズル固有スクリプト部 ぬりぼう版 nuribou.js v3.4.0
//
pzprv3.custom.nuribou = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.BlackCell       = true;
		this.NumberIsWhite   = true;
		this.checkBlackCell  = true;
		this.checkWhiteCell  = true;

		this.floatbgcolor = "rgb(96, 96, 96)";
	}
},

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

		var binfo = bd.areas.getBCellInfo();
		if( !this.checkAllArea(binfo, function(w,h,a,n){ return (w==1||h==1);} ) ){
			this.setAlert('「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。','There is a mass of black cells, whose width is more than two.'); return false;
		}

		if( !this.checkCorners(binfo) ){
			this.setAlert('同じ面積の黒マスのカタマリが、角を共有しています。','Masses of black cells whose length is the same share a corner.'); return false;
		}

		var winfo = bd.areas.getWCellInfo();
		if( !this.checkNoNumber(winfo) ){
			this.setAlert('数字の入っていないシマがあります。','An area of white cells has no numbers.'); return false;
		}

		if( !this.checkDoubleNumber(winfo) ){
			this.setAlert('1つのシマに2つ以上の数字が入っています。','An area of white cells has plural numbers.'); return false;
		}

		if( !this.checkNumberAndSize(winfo) ){
			this.setAlert('数字とシマの面積が違います。','The number is not equal to the number of the size of the area.'); return false;
		}

		return true;
	},

	checkCorners : function(binfo){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].bx===bd.maxbx-1 || bd.cell[c].by===bd.maxby-1){ continue;}

			var cc1, cc2;
			if     ( bd.isBlack(c) && bd.isBlack(c+k.qcols+1) ){ cc1 = c; cc2 = c+k.qcols+1;}
			else if( bd.isBlack(c+1) && bd.isBlack(c+k.qcols) ){ cc1 = c+1; cc2 = c+k.qcols;}
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
