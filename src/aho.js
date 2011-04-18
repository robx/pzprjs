//
// パズル固有スクリプト部 アホになり切れ版 aho.js v3.4.0
//
pzprv3.custom.aho = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.isInputHatena   = true;

		this.floatbgcolor = "rgb(127, 191, 0)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			this.inputqnum();
		}
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
KeyEvent:{
	enablemake : true
},

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

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0 || (n%3)==0 || w*h==a);} ) ){
			this.setAlert('大きさが3の倍数ではないのに四角形ではない領域があります。','An area whose size is not multiples of three is not rectangle.'); return false;
		}

		if( !this.checkAhoArea(rinfo) ){
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

	checkAhoArea : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			var cc = bd.areas.getQnumCellOfClist(rinfo.room[id].idlist);
			if(cc===null){ continue;}

			var n = bd.QnC(cc);
			if(n<0 || (n%3)!==0){ continue;}

			var d = bd.getSizeOfClist(rinfo.room[id].idlist);
			var clist = [];
			for(var bx=d.x1;bx<=d.x2;bx+=2){
				for(var by=d.y1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(rinfo.id[cc]!=id){ clist.push(cc);}
				}
			}
			var dl = bd.getSizeOfClist(clist);
			if( clist.length==0 || (dl.cols*dl.rows!=dl.cnt) || (d.x1!==dl.x1 && d.x2!==dl.x2) || (d.y1!==dl.y1 && d.y2!==dl.y2) ){
				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
