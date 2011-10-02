//
// パズル固有スクリプト部 四角に切れ・アホになり切れ版 shikaku.js v3.4.0
//
pzprv3.custom.shikaku = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	}
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
	isborder : 1
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

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
		var g = this.vinc('cell_circle', 'auto');

		var rsize2 = this.cw*this.circleratio[1];
		var header = "c_cir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qnum!==-1){
				g.fillStyle = (cell.error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+cell.id,this.FILL)){
					g.fillCircle(cell.px, cell.py, rsize2);
				}
			}
			else{ this.vhide([header+cell.id]);}
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

		if( (this.owner.pid==='shikaku') && !this.checkAreaRect(rinfo) ){
			this.setAlert('四角形ではない領域があります。','An area is not rectangle.'); return false;
		}

		if( (this.owner.pid==='aho') && !this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0 || (n%3)==0 || w*h==a);} ) ){
			this.setAlert('大きさが3の倍数ではないのに四角形ではない領域があります。','An area whose size is not multiples of three is not rectangle.'); return false;
		}

		if( (this.owner.pid==='aho') && !this.checkLshapeArea(rinfo) ){
			this.setAlert('大きさが3の倍数である領域がL字型になっていません。','An area whose size is multiples of three is not L-shape.'); return false;
		}

		if( !this.checkNumberAndSize(rinfo) ){
			this.setAlert('数字と領域の大きさが違います。','The size of the area is not equal to the number.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	},

	checkLshapeArea : function(rinfo){
		var result = true;
		for(var areaid=1;areaid<=rinfo.max;areaid++){
			var clist = rinfo.getclist(areaid);
			var cell = clist.getQnumCell();
			if(cell.isnull){ continue;}

			var n = cell.getQnum();
			if(n<0 || (n%3)!==0){ continue;}
			var d = clist.getRectSize();

			var clist2 = bd.cellinside(d.x1,d.y1,d.x2,d.y2).filter(function(cell){ return (rinfo.getRoomID(cell)!==areaid);});
			var d2 = clist2.getRectSize();

			if( clist2.length===0 || (d2.cols*d2.rows!=d2.cnt) || (d.x1!==d2.x1 && d.x2!==d2.x2) || (d.y1!==d2.y1 && d.y2!==d2.y2) ){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
};
