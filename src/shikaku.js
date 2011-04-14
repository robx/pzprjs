//
// パズル固有スクリプト部 四角に切れ版 shikaku.js v3.4.0
//
pzprv3.custom.shikaku = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.isInputHatena   = true;

		this.ispzprv3ONLY    = true;
		this.isKanpenExist   = true;

		this.floatbgcolor = "rgb(127, 191, 0)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyPopup:{
	paneltype  : 10,
	enablemake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.fontcolor = this.fontErrcolor = "white";
		this.setBorderColorFunc('qans');

		this.circledcolor = "black";
		this.fontsizeratio = 0.85;
		this.circleratio = [0, 0.40];
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawCirclesAtNumber_shikaku();
		this.drawNumbers();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	drawCirclesAtNumber_shikaku : function(){
		this.vinc('cell_circle', 'auto');

		var rsize2 = this.cw*this.circleratio[1];
		var header = "c_cir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qnum!=-1){
				g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+c,this.FILL)){
					g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
				}
			}
			else{ this.vhide([header+c]);}
		}
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
		this.decodeCellQnum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderAns();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeAnsSquareRoom();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeAnsSquareRoom();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('数字の入っていない領域があります。','An area has no numbers.'); return false;
		}

		if( !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つの領域に2つ以上の数字が入っています。','An area has plural numbers.'); return false;
		}

		if( !this.checkAreaRect(rinfo) ){
			this.setAlert('四角形ではない領域があります。','An area is not rectangle.'); return false;
		}

		if( !this.checkNumberAndSize(rinfo) ){
			this.setAlert('数字と領域の大きさが違います。','The size of the area is not equal to the number.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	},
}
};
