//
// パズル固有スクリプト部 やじさんかずさん版 yajikazu.js v3.4.0
//
pzprv3.createCustoms('yajikazu', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.notInputted()){ this.inputdirec();}
			}
			else if(this.mouseend && this.notInputted()){
				if(this.prevPos.getc()===this.getcell()){ this.inputqnum();}
			}
		}
	},
	inputRed : function(){ this.dispRed();},
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(this.isSHIFT){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputdirec(ca)){ return;}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	minnum : 0
},

BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

AreaWhiteManager:{
	enabled : true
},

Flags:{
	use      : true,
	redblkrb : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.fontBCellcolor = "rgb(96,96,96)";
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBlackCells();

		this.drawArrowNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeArrowNumber16();
	},
	encodePzpr : function(type){
		this.encodeArrowNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkAdjacentBlackCell() ){ return 10021;}

		var winfo = this.owner.board.getWCellInfo();
		if( !this.checkRBBlackCell(winfo) ){ return 10020;}

		if( !this.checkArrowNumber() ){ return 10028;}

		return 0;
	},

	checkArrowNumber : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum() || cell.getQdir()===0 || cell.isBlack()){ continue;}
			var pos = cell.getaddr(), dir = cell.getQdir();
			var clist = new this.owner.CellList();
			while(1){
				pos.movedir(dir,2);
				var cell2 = pos.getc();
				if(cell2.isnull){ break;}
				clist.add(cell2);
			}

			var cnt = clist.filter(function(cell){ return cell.isBlack();}).length;
			if(cell.getQnum()!==cnt){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
