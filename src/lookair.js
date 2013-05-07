//
// パズル固有スクリプト部 るっくえあ版 lookair.js v3.4.0
//
pzprv3.createCustoms('lookair', {
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

	countDir5Cell : function(func){
		var cnt=0, cell;
		cell=this;      if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.up(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.dn(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.lt(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.rt(); if(!cell.isnull && func(cell)){ cnt++;}
		return cnt;
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
	setColors : function(){
		this.bcolor = this.bcolor_GREEN;
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBlackCells();

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
	checkAns : function(){

		/* 自動チェック時は最初にチェックする */
		if( this.inAutoCheck && !this.checkDir5BlackCell() ){ return 10025;}

		var binfo = this.owner.board.getBCellInfo();
		if( !this.checkAreaSquare(binfo) ){ return 10016;}

		if( !this.checkLookair(binfo) ){ return 19001;}

			/* チェック時は最後にチェックする */
		if( !this.inAutoCheck && !this.checkDir5BlackCell() ){ return 10025;}

		return 0;
	},

	checkDir5BlackCell : function(){
		var result = true;
		var iscount = function(cell){ return cell.isBlack();};
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(!cell.isValidNum()){ continue;}
			if(cell.getNum()!==cell.countDir5Cell(iscount)){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},
	
	checkLookair : function(cinfo){
		var result = true;
		var bd = this.owner.board;
		function subcheck(base,bx,by){
			var cell = bd.getc(bx,by);
			if(cell.isnull){ return 1;}
			else if(!cell.isBlack()){ return 0;}
			
			var target = cinfo.getclistbycell(cell);
			if(base.length === target.length){
				if(this.inAutoCheck){ return 2;}
				base.seterr(1);
				target.seterr(1);
				result = false;
			}
			return 1;
		}

		for(var r=1;r<=cinfo.max;r++){
			var base = cinfo.getclist(r), d = base.getRectSize();
			/* 相互に見る必要は無いので、上と左だけ確認する */
			for(var bx=d.x1; bx<=d.x2; bx+=2){
				for(var by=d.y1-2; by>=this.owner.board.minby; by-=2){
					var ret = subcheck(base,bx,by);
					if(ret===1){ break;}else if(ret===2){ return false;}
				}
			}

			for(var by=d.y1; by<=d.y2; by+=2){
				for(var bx=d.x1-2; bx>=this.owner.board.minbx; bx-=2){
					var ret = subcheck(base,bx,by);
					if(ret===1){ break;}else if(ret===2){ return false;}
				}
			}
		}
		return result;
	}
}
});
