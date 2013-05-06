//
// パズル固有スクリプト部 四角に切れ・アホになり切れ版 shikaku.js v3.4.0
//
pzprv3.createCustoms('shikaku', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputborderans();}
				else if(this.btn.Right){ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1
},

AreaRoomManager:{
	enabled : true
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
					g.fillCircle((cell.bx*this.bw), (cell.by*this.bh), rsize2);
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
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnum_kanpen();
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
		var pid = this.owner.pid;

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){ return 30004;}

		if( !this.checkDoubleNumber(rinfo) ){ return 30012;}

		if(pid==='shikaku'){
			if(!this.checkAreaRect(rinfo) ){ return 20011;}
		}
		else if(pid==='aho'){
			if( !this.checkAhoSquare(rinfo) ){ return 39301;}
			if( !this.checkLshapeArea(rinfo) ){ return 39311;}
		}

		if( !this.checkNumberAndSize(rinfo) ){ return 30021;}

		if( !this.checkLcntCross(1,0) ){ return 32101;}

		return 0;
	},

	checkAhoSquare : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0 || (n%3)===0 || w*h===a);});
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

			var clist2 = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2).filter(function(cell){ return (rinfo.getRoomID(cell)!==areaid);});
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
});

pzprv3.addFailCode({
	39301 : ["大きさが3の倍数ではないのに四角形ではない領域があります。","An area whose size is not multiples of three is not rectangle."],
	39311 : ["大きさが3の倍数である領域がL字型になっていません。","An area whose size is multiples of three is not L-shape."]
});
