// BoardExecCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
BoardExec:{
	//------------------------------------------------------------------------------
	// bd.exec.adjustBoardData()    回転・反転開始前に各セルの調節を行う(共通処理)
	// bd.exec.adjustBoardData2()   回転・反転終了後に各セルの調節を行う(共通処理)
	//   から呼び出される共通関数
	//------------------------------------------------------------------------------

	//------------------------------------------------------------------------------
	// bd.exec.adjustNumberArrow()  回転・反転開始前の矢印つき数字の調整
	// bd.exec.adjustCellArrow()    回転・反転開始前の矢印セルの調整
	// bd.exec.adjustBorderArrow()  回転・反転開始前の境界線にある矢印セル等の調整
	//------------------------------------------------------------------------------
	adjustNumberArrow : function(key,d){
		if(key & this.TURNFLIP){
			this.adjustCellQdirArrow(key,d);
		}
	},
	adjustCellArrow : function(key,d){
		if(key & this.TURNFLIP){
			if(this.klass.Cell.prototype.numberAsObject){
				this.adjustCellQnumArrow(key,d);
			}
			else{
				this.adjustCellQdirArrow(key,d);
			}
		}
	},
	adjustCellQdirArrow : function(key,d){
		var trans = this.getTranslateDir(key);
		var clist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var val=trans[cell.qdir]; if(!!val){ cell.setQdir(val);}
		}
	},
	adjustCellQnumArrow : function(key,d){
		var trans = this.getTranslateDir(key);
		var clist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var val = trans[cell.qnum]; if(!!val){ cell.setQnum(val);}
			var val = trans[cell.anum]; if(!!val){ cell.setAnum(val);}
		}
	},

	adjustBorderArrow : function(key,d){
		if(key & this.TURNFLIP){
			var trans = this.getTranslateDir(key);
			var blist = this.board.borderinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<blist.length;i++){
				var border=blist[i], val;
				val=trans[border.qdir]; if(!!val){ border.setQdir(val);}
			}
		}
	},
	getTranslateDir : function(key){
		var trans = {};
		switch(key){
			case this.FLIPY: trans={1:2,2:1}; break;			// 上下反転
			case this.FLIPX: trans={3:4,4:3}; break;			// 左右反転
			case this.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
			case this.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
		}
		return trans;
	},

	//------------------------------------------------------------------------------
	// bd.exec.adjustQues51_1()     回転・反転開始前の[＼]セルの調整
	// bd.exec.adjustQues51_2()     回転・反転終了後の[＼]セルの調整
	//------------------------------------------------------------------------------
	adjustQues51_1 : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		var bd = this.board;
		for(var by=by1;by<=d.y2;by+=2){
			this.qnumw[by] = [bd.getex(-1,by).qnum];
			for(var bx=bx1;bx<=d.x2;bx+=2){
				var cell = bd.getc(bx,by);
				if(cell.is51cell()){ this.qnumw[by].push(cell.qnum);}
			}
		}
		for(var bx=bx1;bx<=d.x2;bx+=2){
			this.qnumh[bx] = [bd.getex(bx,-1).qnum2];
			for(var by=by1;by<=d.y2;by+=2){
				var cell = bd.getc(bx,by);
				if(cell.is51cell()){ this.qnumh[bx].push(cell.qnum2);}
			}
		}
	},
	adjustQues51_2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1), idx;

		var bd = this.board;
		bd.disableInfo();
		switch(key){
		case this.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumh[bx] = this.qnumh[bx].reverse();
				bd.getex(bx,-1).setQnum2(this.qnumh[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum2(this.qnumh[bx][idx]); idx++;}
				}
			}
			break;

		case this.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumw[by] = this.qnumw[by].reverse();
				bd.getex(-1,by).setQnum(this.qnumw[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumw[by][idx]); idx++;}
				}
			}
			break;

		case this.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumh[by] = this.qnumh[by].reverse();
				bd.getex(-1,by).setQnum(this.qnumh[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumh[by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1;
				bd.getex(bx,-1).setQnum2(this.qnumw[xx-bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum2(this.qnumw[xx-bx][idx]); idx++;}
				}
			}
			break;

		case this.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1;
				bd.getex(-1,by).setQnum(this.qnumh[yy-by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumh[yy-by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumw[bx] = this.qnumw[bx].reverse();
				bd.getex(bx,-1).setQnum2(this.qnumw[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum2(this.qnumw[bx][idx]); idx++;}
				}
			}
			break;
		}
		bd.enableInfo();
	},

	//------------------------------------------------------------------------------
	// bd.exec.getAfterPos()  回転・反転開始前のIN/OUTなどの位置の調整
	//------------------------------------------------------------------------------
	getAfterPos : function(key,d,piece){
		var puzzle=this.puzzle, bd=puzzle.board;
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=piece.bx, by1=piece.by, bx2, by2;
		switch(key){
			case this.FLIPY: bx2 = bx1; by2 = yy-by1; break;
			case this.FLIPX: bx2 = xx-bx1; by2 = by1; break;
			case this.TURNR: bx2 = yy-by1; by2 = bx1; break;
			case this.TURNL: bx2 = by1; by2 = xx-bx1; break;
			case this.EXPANDUP: bx2 = bx1; by2 = by1+(by1===bd.minby?0:2); break;
			case this.EXPANDDN: bx2 = bx1; by2 = by1+(by1===bd.maxby?2:0); break;
			case this.EXPANDLT: bx2 = bx1+(bx1===bd.minbx?0:2); by2 = by1; break;
			case this.EXPANDRT: bx2 = bx1+(bx1===bd.maxbx?2:0); by2 = by1; break;
			case this.REDUCEUP: bx2 = bx1; by2 = by1-(by1<=bd.minby+2?0:2); break;
			case this.REDUCEDN: bx2 = bx1; by2 = by1-(by1>=bd.maxby-2?2:0); break;
			case this.REDUCELT: bx2 = bx1-(bx1<=bd.minbx+2?0:2); by2 = by1; break;
			case this.REDUCERT: bx2 = bx1-(bx1>=bd.maxbx-2?2:0); by2 = by1; break;
			default: bx2 = bx1; by2 = by1; break;
		}

		return { pos:new puzzle.klass.Address(bx2,by2), isdel:this.isdel(key,piece) };
	}
}
});
