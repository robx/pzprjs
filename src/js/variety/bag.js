//
// パズル固有スクリプト部 バッグ版 bag.js v3.4.1
//
pzpr.classmgr.makeCustom(['bag'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		var puzzle = this.puzzle;
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
	maxnum : function(){
		return Math.min(255, this.board.qcols+this.board.qrows-1);
	},
	minnum : 2,

	inside : false /* 正答判定用 */
},

Board:{
	hasborder : 2,
	borderAsLine : true,

	searchInsideArea : function(){
		this.cell[0].inside = (this.cross[0].lcnt!==0);
		for(var by=1;by<this.maxby;by+=2){
			if(by>1){ this.getc(1,by).inside = !!(this.getc(1,by-2).inside ^ this.getb(1,by-1).isLine());}
			for(var bx=3;bx<this.maxbx;bx+=2){
				this.getc(bx,by).inside = !!(this.getc(bx-2,by).inside ^ this.getb(bx-1,by).isLine());
			}
		}
	}
},

LineGraph:{
	enabled : true,
	pointgroup : 'cross'
},

Flags:{
	bgcolor : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bgcellcolor_func : "qsub2",

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
	checklist : [
		"checkBranchLine",
		"checkCrossLine",

		"checkOneLoop",

		"checkDeadendLine+",

		"checkOutsideNumber",
		"checkViewOfNumber"
	],

	checkOutsideNumber : function(){
		this.board.searchInsideArea();	/* cell.insideを設定する */
		this.checkAllCell(function(cell){ return (!cell.inside && cell.isNum());}, "nmOutside");
	},
	checkViewOfNumber : function(icheck){
		var bd = this.board;
		for(var cc=0;cc<bd.cellmax;cc++){
			var cell=bd.cell[cc];
			if(!cell.isValidNum()){ continue;}

			var clist = new this.klass.CellList(), adc = cell.adjacent, target;
			clist.add(cell);
			target=adc.left;   while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.left;  }
			target=adc.right;  while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.right; }
			target=adc.top;    while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.top;   }
			target=adc.bottom; while(!target.isnull && target.inside){ clist.add(target); target=target.adjacent.bottom;}

			if(cell.qnum===clist.length){ continue;}
			
			this.failcode.add("nmSumViewNe");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},

FailCode:{
	nmOutside   : ["輪の内側に入っていない数字があります。","There is an outside number."],
	nmSumViewNe : ["数字と輪の内側になる4方向のマスの合計が違います。","The number and the sum of the inside cells of four direction is different."]
}
});
