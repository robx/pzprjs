//
// パズル固有スクリプト部 ヤジリン版 yajirin.js v3.4.0
// 
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('yajirin', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputdirec();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputcell();}
		}
		else if(this.mouseend && this.notInputted()){ this.inputcell();}
	},
	inputRed : function(){ this.dispRedLine();}
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
	minnum : 0,

	numberIsWhite : true,

	// 線を引かせたくないので上書き
	noLP : function(dir){ return (this.isBlack() || this.isNum());}
},
Border:{
	enableLineNG : true
},
Board:{
	isborder : 1,

	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

LineManager:{
	isCenterLine : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	setColors : function(){
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
	pzlimport : function(type){
		this.decodeArrowNumber16();
	},
	pzlexport : function(type){
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

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			this.setAlert('交差している線があります。','There is a crossing line.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()>0 && cell.isBlack());}) ){
			this.setAlert('黒マスの上に線が引かれています。','Theer is a line on the black cell.'); return false;
		}

		if( !this.checkSideCell(function(cell1,cell2){ return (cell1.isBlack() && cell2.isBlack());}) ){
			this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( !this.checkArrowNumber() ){
			this.setAlert('矢印の方向にある黒マスの数が正しくありません。','The number of black cells are not correct.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()===0 && !cell.isBlack() && cell.noNum());}) ){
			this.setAlert('黒マスも線も引かれていないマスがあります。','Theer is an empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkLcntCell(1);},

	checkArrowNumber : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum() || cell.getQdir()===0 || cell.isBlack()){ continue;}
			var pos = cell.getaddr(), dir = cell.getQdir(), cnt=0;
			var clist = this.owner.newInstance('CellList');
			while(1){
				pos.movedir(dir,2);
				var cell2 = pos.getc();
				if(cell2.isnull){ break;}
				clist.add(cell2);
			}

			var cnt = clist.filter(function(cell){ return cell.isBlack();}).length;
			if(cell.getQnum()!==cnt){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});

})();
