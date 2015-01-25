//
// パズル固有スクリプト部 るっくえあ版 lookair.js v3.4.1
//
pzpr.classmgr.makeCustom(['lookair'], {
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
	maxnum : 5,
	minnum : 0,

	countDir5ShadedCell : function(){
		var cnt=0, adc=this.adjacent;
		var cells = [this, adc.top, adc.bottom, adc.left, adc.right];
		for(var i=0;i<5;i++){
			if(!cells[i].isnull && cells[i].isShade()){ cnt++;}
		}
		return cnt;
	}
},

AreaShadeManager:{
	enabled : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bgcellcolor_func : "qsub1",

	bcolor_type : "GREEN",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawShadedCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encodeNumber10();
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
		"checkSquareShade",
		"checkLookair",
		"checkDir5ShadeCell+"
	],

	checkDir5ShadeCell : function(){
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(!cell.isValidNum() || cell.getNum()===cell.countDir5ShadedCell()){ continue;}
			
			this.failcode.add("nmShade5Ne");
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	},
	
	checkSquareShade : function(){
		this.checkAllArea(this.getShadeInfo(), function(w,h,a,n){ return (w*h===a && w===h);}, "csNotSquare");
	},
	checkLookair : function(){
		var binfo = this.getShadeInfo();
		var bd = this.owner.board;
		function subcheck(base,bx,by){
			var cell = bd.getc(bx,by);
			if(cell.isnull){ return 1;}	/* break with no error (end of board) */
			else if(!cell.isShade()){ return 0;}	/* continue loop */
			
			var target = binfo.getRoomByCell(cell).clist;
			if(base.length === target.length){
				this.failcode.add("lookairBC");
				if(this.checkOnly){ return 2;}	/* return with error */
				base.seterr(1);
				target.seterr(1);
			}
			return 1;	/* break with no error (reach another shaded block) */
		}

		allloop:
		for(var r=1;r<=binfo.max;r++){
			var base = binfo.area[r].clist, d = base.getRectSize();
			/* 相互に見る必要は無いので、上と左だけ確認する */
			for(var bx=d.x1; bx<=d.x2; bx+=2){
				for(var by=d.y1-2; by>=this.owner.board.minby; by-=2){
					var ret = subcheck.call(this,base,bx,by);
					if(ret===1){ break;}else if(ret===2){ break allloop;}
				}
			}

			for(var by=d.y1; by<=d.y2; by+=2){
				for(var bx=d.x1-2; bx>=this.owner.board.minbx; bx-=2){
					var ret = subcheck.call(this,base,bx,by);
					if(ret===1){ break;}else if(ret===2){ break allloop;}
				}
			}
		}
	}
},

FailCode:{
	nmShade5Ne : ["数字およびその上下左右にある黒マスの数が間違っています。","the number is not equal to the number of shaded cells in the cell and four adjacent cells."],
	lookairBC : ["同じ大きさの黒マスのカタマリの間に他の黒マスのカタマリがありません。","A mass of shaded cells can looks other same size mass of shaded cells."]
}
});
