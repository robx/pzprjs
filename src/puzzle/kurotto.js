//
// パズル固有スクリプト部 クロット版 kurotto.js v3.4.0
//
pzpr.createCustoms('kurotto', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberIsWhite : true,

	nummaxfunc : function(){
		var max=this.owner.board.qcols*this.owner.board.qrows-1;
		return (max<=255?max:255);
	},
	minnum : 0,

	checkComplete : function(cinfo){
		if(!this.isValidNum()){ return true;}
		
		var cnt = 0, idlist = [], clist = this.getdir4clist();
		for(var i=0;i<clist.length;i++){
			var r = cinfo.getRoomID(clist[i][0]);
			if(r!==null){
				for(var j=0;j<idlist.length;j++){
					if(idlist[j]===r){ r=null; break;}
				}
				if(r!==null){
					cnt += cinfo.room[r].clist.length
					idlist.push(r);
				}
			}
		}
		return (this.qnum===cnt);
	}
},

AreaBlackManager:{
	enabled : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_DLIGHT;
		this.bcolor    = "silver";
		this.setBGCellColorFunc('qsub1');

		this.fontsizeratio = 0.85;
		this.circleratio = [0.47, 0.42];
	},
	paint : function(){
		this.drawDotCells(false);
		this.drawGrid();
		this.drawBlackCells();

		this.drawCircles_kurotto();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	// 背景色をつけるため
	drawCircles_kurotto : function(){
		var saved_cells = this.range.cells;
		this.check_binfo = null;
		if(this.getConfig('circolor')){
			/* 一時的に盤面全体を対象に切り替える */
			this.range.cells = this.owner.board.cell;
			this.check_binfo = this.owner.board.getBCellInfo();
		}
		
		/* 本体を呼ぶ */
		this.drawCircles();
		
		this.range.cells = saved_cells;
	},
	getCircleStrokeColor : function(cell){
		if(cell.isNum()){
			var cmpcell = (this.getConfig('circolor') && cell.checkComplete(this.check_binfo));
			if     (cmpcell)       { return this.bcolor;      }
			else if(cell.error===1){ return this.errbcolor1;  }
			else                   { return this.circledcolor;}
		}
		return null;
	},
	getCircleFillColor : function(cell){
		if(cell.isNum()){ return this.cellcolor;}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
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

		if( !this.checkCellNumber_kurotto() ){ return 'nmSumSizeNe';}

		return null;
	},

	checkCellNumber_kurotto : function(){
		var result = true;
		var cinfo = this.owner.board.getBCellInfo();
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(!cell.checkComplete(cinfo)){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	nmSumSizeNe : ["隣り合う黒マスの個数の合計が数字と違います。","The number is not equal to sum of adjacent masses of black cells."]
}
});
