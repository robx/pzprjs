//
// パズル固有スクリプト部 バッグ版 bag.js v3.4.1
//
pzpr.classmgr.makeCustom('bag', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		var puzzle = this.owner;
		if(puzzle.playmode){
			var inputbg = false;
			if     (this.mousestart){ inputbg = (!!puzzle.getConfig('bgcolor') && this.inputBGcolor0());}
			else if(this.mousemove) { inputbg = (!!puzzle.getConfig('bgcolor') && this.inputData>=10);}
			else{ return;}

			if(!inputbg){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputBGcolor(true);}
			}
			else{ this.inputBGcolor(false);}
		}
		else if(puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	inputBGcolor0 : function(){
		return this.getpos(0.25).oncell();
	},
	inputBGcolor : function(isnormal){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){
			if(isnormal || this.btn.Left){
				if     (cell.qsub===0){ this.inputData=11;}
				else if(cell.qsub===1){ this.inputData=12;}
				else                  { this.inputData=10;}
			}
			else{
				if     (cell.qsub===0){ this.inputData=12;}
				else if(cell.qsub===1){ this.inputData=10;}
				else                  { this.inputData=11;}
			}
		}
		cell.setQsub(this.inputData-10);
		cell.draw();

		this.mouseCell = cell;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return Math.min(this.maxnum, this.owner.board.qcols+this.owner.board.qrows-1);
	},
	minnum : 2,

	inside : false /* 正答判定用 */
},

Board:{
	hasborder : 2,

	searchInsideArea : function(){
		this.cell[0].inside = (this.getx(0,0).lcnt()!==0);
		for(var by=1;by<this.maxby;by+=2){
			if(by>1){ this.getc(1,by).inside = !!(this.getc(1,by-2).inside ^ this.getb(1,by-1).isLine());}
			for(var bx=3;bx<this.maxbx;bx+=2){
				this.getc(bx,by).inside = !!(this.getc(bx-2,by).inside ^ this.getb(bx-1,by).isLine());
			}
		}
	}
},

LineManager:{
	borderAsLine : true
},

Flags:{
	bgcolor : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBGCellColorFunc('qsub2');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid(false);
		this.drawLines();

		this.drawNumbers();

		this.drawTarget();
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
		this.decodeCellQsub();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQsub();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLineCount(3) ){ return 'lnBranch';}
		if( !this.checkLineCount(4) ){ return 'lnCross';}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		if( !this.checkOutsideNumber() ){ return 'nmOutside';}
		if( !this.checkCellNumber() ){ return 'nmSumViewNe';}

		return null;
	},

	checkOutsideNumber : function(){
		this.owner.board.searchInsideArea();	/* cell.insideを設定する */
		return this.checkAllCell(function(cell){ return (!cell.inside && cell.isNum());});
	},
	checkCellNumber : function(icheck){
		var result = true, bd = this.owner.board;
		for(var cc=0;cc<bd.cellmax;cc++){
			var cell=bd.cell[cc];
			if(!cell.isValidNum()){ continue;}

			var clist = new this.owner.CellList(), adc = cell.adjacent, target;
			clist.add(cell);
			target=adc.left;   while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.left;  }
			target=adc.right;  while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.right; }
			target=adc.top;    while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.top;   }
			target=adc.bottom; while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.bottom;}

			if(cell.getQnum()!==clist.length){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	nmOutside   : ["輪の内側に入っていない数字があります。","There is an outside number."],
	nmSumViewNe : ["数字と輪の内側になる4方向のマスの合計が違います。","The number and the sum of the inside cells of four direction is different."]
}
});
