//
// パズル固有スクリプト部 クロット版 kurotto.js v3.4.0
//
pzprv3.createCustoms('kurotto', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	},
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 0
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
			var roomid = cinfo.getRoomID(clist[i][0]);
			if(roomid!==null){
				for(var j=0;j<idlist.length;j++){
					if(idlist[j]===roomid){ roomid=null; break;}
				}
				if(roomid!==null){
					cnt += cinfo.getclist(roomid).length
					idlist.push(roomid);
				}
			}
		}
		return (this.qnum===cnt);
	}
},

AreaBlackManager:{
	enabled : true
},

Properties:{
	flag_use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.bcolor    = "silver";
		this.setBGCellColorFunc('qsub1');

		this.fontsizeratio = 0.85;
	},
	paint : function(){
		this.drawDotCells(false);
		this.drawGrid();
		this.drawBlackCells();

		this.drawCirclesAtNumber_kurotto();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	// 背景色をつけるため
	drawCirclesAtNumber_kurotto : function(c){
		var g = this.vinc('cell_circle', 'auto');
		var axcolor = this.owner.getConfig('circolor');

		g.lineWidth = this.cw*0.05;
		var rsize   = this.cw*0.44;

		var header = "c_cir_", clist, binfo;
		if(!axcolor){
			clist = this.range.cells;
			binfo = null;
		}
		else{
			clist = this.owner.board.cell;
			binfo = this.owner.board.getBCellInfo();
		}
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id, error = cell.error;
			var px = cell.bx*this.bw, py = cell.by*this.bh;

			if(cell.qnum!==-1){
				g.strokeStyle = this.cellcolor;

				var cmpcell = ((axcolor && cell.qnum>=0) ? cell.checkComplete(binfo) : true);
				if (axcolor && cmpcell){ g.fillStyle = this.bcolor;      }
				else if(cell.error===1){ g.fillStyle = this.errbcolor1;  }
				else                   { g.fillStyle = this.circledcolor;}

				if(this.vnop(header+c,this.FILL_STROKE)){
					g.shapeCircle(px, py, rsize);
				}
			}
			else{ this.vhide(header+id);}
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

		if( !this.checkCellNumber_kurotto() ){
			this.setAlert('隣り合う黒マスの個数の合計が数字と違います。','The number is not equal to sum of adjacent masses of black cells.'); return false;
		}

		return true;
	},

	checkCellNumber_kurotto : function(){
		var result = true;
		var cinfo = this.owner.board.getBCellInfo();
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(cell.isValidNum() && !cell.checkComplete(cinfo)){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
