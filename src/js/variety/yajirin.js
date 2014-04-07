//
// パズル固有スクリプト部 ヤジリン版 yajirin.js v3.4.1
// 
(function(){

var k = pzpr.consts;

pzpr.classmgr.makeCustom('yajirin', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputcell();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputdirec();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
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
	minnum : 0,

	numberIsWhite : true,

	// 線を引かせたくないので上書き
	noLP : function(dir){ return (this.isBlack() || this.isNum());}
},
Border:{
	enableLineNG : true
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

LineManager:{
	isCenterLine : true
},

Flags:{
	use     : true,
	redline : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
		this.dotcolor = "rgb(255, 96, 191)";
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawBlackCells();

		this.drawArrowNumbers();

		this.drawLines();
		this.drawPekes();

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
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellDirecQnum_kanpen(true);
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellDirecQnum_kanpen(true);
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCellAns();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCellAns();
		this.encodeBorderLine();
	},

	kanpenOpen : function(array){
		this.decodeCellDirecQnum_kanpen(false);
		this.decodeBorderLine();
	},
	kanpenSave : function(){
		this.encodeCellDirecQnum_kanpen(false);
		this.encodeBorderLine();
	},

	decodeCellDirecQnum_kanpen : function(isurl){
		var dirs = [k.UP, k.LT, k.DN, k.RT];
		this.decodeCell( function(obj,ca){
			if     (ca==="#" && !isurl){ obj.qans = 1;}
			else if(ca==="+" && !isurl){ obj.qsub = 1;}
			else if(ca!=="."){
				var num = parseInt(ca);
				obj.qdir = dirs[(num & 0x30) >> 4];
				obj.qnum = (num & 0x0F);
			}
		});
	},
	encodeCellDirecQnum_kanpen : function(isurl){
		var dirs = [k.UP, k.LT, k.DN, k.RT];
		this.encodeCell( function(obj){
			var num = ((obj.qnum>=0&&obj.qnum<16) ? obj.qnum : -1), dir;
			if(num!==-1 && obj.qdir!==k.NDIR){
				for(dir=0;dir<4;dir++){ if(dirs[dir]===obj.qdir){ break;}}
				return (""+((dir<<4)+(num&0x0F))+" ");
			}
			else if(!isurl){
				if     (obj.qans===1){ return "# ";}
				else if(obj.qsub===1){ return "+ ";}
			}
			return ". ";
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLineCount(3) ){ return 'lnBranch';}
		if( !this.checkLineCount(4) ){ return 'lnCross';}

		if( !this.checkLineOnBlackCell() ){ return 'lnOnBcell';}

		if( !this.checkAdjacentBlackCell() ){ return 'bcAdjacent';}

		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		if( !this.checkArrowNumber() ){ return 'anBcellNe';}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		if( !this.checkBlankCell() ){ return 'ceEmpty';}

		return null;
	},

	checkLineOnBlackCell : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()>0 && cell.isBlack());});
	},
	checkBlankCell : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()===0 && !cell.isBlack() && cell.noNum());});
	},

	checkArrowNumber : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum() || cell.getQdir()===0 || cell.isBlack()){ continue;}
			var pos = cell.getaddr(), dir = cell.getQdir(), cnt=0;
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
},

FailCode:{
	ceEmpty : ["黒マスも線も引かれていないマスがあります。","There is an empty cell."]
}
});

})();
