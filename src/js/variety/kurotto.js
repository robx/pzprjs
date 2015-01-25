//
// パズル固有スクリプト部 クロット版 kurotto.js v3.4.1
//
pzpr.classmgr.makeCustom(['kurotto'], {
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
	numberRemainsUnshaded : true,

	maxnum : function(){
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
					cnt += cinfo.area[r].clist.length;
					idlist.push(r);
				}
			}
		}
		return (this.qnum===cnt);
	}
},

AreaShadeManager:{
	enabled : true
},

Flags:{
	use : true,
	autocmp : "number"
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "DLIGHT",

	bgcellcolor_func : "qsub1",

	globalfontsizeratio : 0.85,
	circleratio : [0.45, 0.40],

	// オーバーライド
	setRange : function(x1,y1,x2,y2){
 		var puzzle = this.owner, bd = puzzle.board;
		if(puzzle.execConfig('autocmp')){
			x1 = bd.minbx-2;
			y1 = bd.minby-2;
			x2 = bd.maxbx+2;
			y2 = bd.maxby+2;
		}
		
		this.common.setRange.call(this,x1,y1,x2,y2);
	},

	paint : function(){
		var puzzle = this.owner, bd = puzzle.board;
		this.check_binfo = (puzzle.execConfig('autocmp') ? bd.getShadeInfo() : null);
		
		this.drawDotCells(false);
		this.drawGrid();
		this.drawShadedCells();

		this.drawCircles();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	getCircleFillColor : function(cell){
		if(cell.isValidNum()){
			var cmpcell = (!!this.check_binfo && cell.checkComplete(this.check_binfo));
			return (cmpcell ? this.qcmpcolor : this.circledcolor);
		}
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
	checklist : [
		"checkCellNumber_kurotto"
	],

	checkCellNumber_kurotto : function(){
		var bd = this.owner.board, cinfo = bd.getShadeInfo();
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.checkComplete(cinfo)){ continue;}
			
			this.failcode.add("nmSumSizeNe");
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	}
},

FailCode:{
	nmSumSizeNe : ["隣り合う黒マスの個数の合計が数字と違います。","The number is not equal to sum of adjacent masses of shaded cells."]
}
});
