//
// パズル固有スクリプト部 ナンバーリンク版 numlin.js v3.4.0
//
pzprv3.createCustoms('numlin', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},
	inputRed : function(){ this.dispRedLine();}
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

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},

Flags:{
	redline : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawPekes();
		this.drawLines();

		this.drawCellSquare();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges');

		var rw = this.bw*0.7-1;
		var rh = this.bh*0.7-1;
		var header = "c_sq_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qnum!==-1){
				if(cell.error===1){ g.fillStyle = this.errbcolor1;}
				else              { g.fillStyle = "white";}

				if(this.vnop(header+cell.id,this.FILL)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					g.fillRect(px-rw, py-rh, rw*2+1, rh*2+1);
				}
			}
			else{ this.vhide(header+cell.id);}
		}
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
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderLine();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeBorderLine();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell(3) ){ return 40201;}
		if( !this.checkLcntCell(4) ){ return 40301;}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkTripleObject(linfo) ){ return 43303;}

		if( !this.checkLinkDiffNumber(linfo) ){ return 30029;}

		if( !this.checkLineOverLetter() ){ return 43103;}
		if( !this.checkDeadendLine() ){ return 43401;}
		if( !this.checkDisconnectLine(linfo) ){ return 43203;}

		if( !this.checkAloneNumber() ){ return 43503;}

		return 0;
	},

	deadEndOK : true,

	checkLinkDiffNumber : function(linfo){
		return this.checkSameObjectInRoom(linfo, function(cell){ return cell.getNum();});
	},
	checkAloneNumber : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()===0 && cell.isNum());});
	},

	checkDeadendLine : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!(cell.lcnt()===1 && cell.noNum())){ continue;}

			if(this.checkOnly){ return false;}
			if(result){ bd.border.seterr(-1);}
			cell.setCellLineError(true);
			result = false;
		}
		return result;
	}
}
});
