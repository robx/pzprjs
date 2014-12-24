// AnswerCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
AnsCheck:{
	//---------------------------------------------------------------------------
	// ans.checkAllCell()   条件func==trueになるマスがあったらエラーを設定する
	// ans.checkNoNumCell() 数字の入っていないセルがあるか判定する
	// ans.checkIceLines()  アイスバーン上で線が曲がっているか判定する
	//---------------------------------------------------------------------------
	checkAllCell : function(func){
		var result = true;
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(func(cell)){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},
	checkNoNumCell : function(){
		return this.checkAllCell( function(cell){ return cell.noNum();} );
	},
	checkIceLines : function(){
		return this.checkAllCell( function(cell){
			return (cell.lcnt===2 && cell.ice() && !cell.isLineStraight());
		});
	},

	//---------------------------------------------------------------------------
	// ans.checkDir4Cell()  セルの周囲4マスの条件がfunc==trueの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkDir4Cell : function(iscount, type){ // 0:違う 1:numより小さい 2:numより大きい
		var result = true;
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(!cell.isValidNum()){ continue;}
			var num = cell.getNum(), count=cell.countDir4Cell(iscount);
			if((type!==1 && num<count) || (type!==2 && num>count)){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkSideCell()  隣り合った2つのセルが条件func==trueの時、エラーを設定する
	// ans.checkAdjacentShadeCell()  黒マスが隣接している時、エラーを設定する
	// ans.checkAdjacentDiffNumber() 同じ数字が隣接している時、エラーを設定する
	//---------------------------------------------------------------------------
	checkSideCell : function(func){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], cell2 = cell.adjacent.right;
			if(cell.bx<bd.maxbx-1 && func(cell,cell2)){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				cell2.seterr(1);
				result = false;
			}
			cell2 = cell.adjacent.bottom;
			if(cell.by<bd.maxby-1 && func(cell,cell2)){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				cell2.seterr(1);
				result = false;
			}
		}
		return result;
	},
	checkAdjacentShadeCell : function(){
		return this.checkSideCell(function(cell1,cell2){ return (cell1.isShade() && cell2.isShade());});
	},
	checkAdjacentDiffNumber : function(){
		return this.checkSideCell(function(cell1,cell2){ return cell1.sameNumber(cell2);});
	},

	//---------------------------------------------------------------------------
	// ans.check2x2Block()      2x2のセルが全て条件func==trueの時、エラーを設定する
	// ans.check2x2ShadeCell()  2x2のセルが黒マスの時、エラーを設定する
	//---------------------------------------------------------------------------
	check2x2Block : function(func){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx<bd.maxbx-1 && cell.by<bd.maxby-1){
				var bx=cell.bx, by=cell.by;
				var clist = bd.cellinside(bx, by, bx+2, by+2).filter(func);
				if(clist.length===4){
					if(this.checkOnly){ return false;}
					clist.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},
	check2x2ShadeCell : function(){
		return this.check2x2Block( function(cell){ return cell.isShade();} );
	},

	//---------------------------------------------------------------------------
	// ans.checkSameColorTile() 白マスと黒マスが混ざったタイルがないかどうかチェックする
	//---------------------------------------------------------------------------
	checkSameColorTile : function(){
		var rinfo = this.owner.board.getRoomInfo();
		return this.checkSameObjectInRoom(rinfo, function(cell){ return (cell.isShade()?1:2);});
	},

	//---------------------------------------------------------------------------
	// ans.checkOneArea()  白マス/黒マス/線がひとつながりかどうかを判定する
	// ans.checkOneLoop()  交差あり線が一つかどうか判定する
	// ans.checkLineCount() セルから出ている線の本数について判定する
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkOneArea : function(cinfo){
		if(cinfo.max>1){
			cinfo.area[1].clist.seterr(1);
			return false;
		}
		return true;
	},

	checkOneLoop : function(){
		var bd = this.owner.board, xinfo = bd.getLineInfo();
		if(xinfo.max>1){
			bd.border.seterr(-1);
			xinfo.path[1].blist.seterr(1);
			return false;
		}
		return true;
	},

	checkCrossLine   : function(){ return this.checkLineCount(4);},
	checkBranchLine  : function(){ return this.checkLineCount(3);},
	checkDeadendLine : function(){ return this.checkLineCount(1);},
	checkNoLine      : function(){ return this.checkLineCount(0);},
	checkLineCount : function(val){
		var result = true, bd = this.owner.board;
		if(bd.lines.ltotal[val]===0){ return true;}
		if(bd.lines.isCenterLine){
			for(var c=0;c<bd.cellmax;c++){
				var cell = bd.cell[c];
				if(cell.lcnt===val){
					if(this.checkOnly){ return false;}
					if(result){ bd.border.seterr(-1);}
					cell.setCellLineError(true);
					result = false;
				}
			}
		}
		else if(bd.lines.borderAsLine){
			for(var c=0;c<bd.crossmax;c++){
				var cross = bd.cross[c];
				if(cross.lcnt===val){
					if(this.checkOnly){ return false;}
					if(result){ bd.border.seterr(-1);}
					cross.setCrossBorderError();
					result = false;
				}
			}
		}
		return result;
	},

	checkenableLineParts : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], adb = cell.adjborder;
			if( (adb.top.isLine()    && cell.noLP(cell.UP)) ||
				(adb.bottom.isLine() && cell.noLP(cell.DN)) ||
				(adb.left.isLine()   && cell.noLP(cell.LT)) ||
				(adb.right.isLine()  && cell.noLP(cell.RT)) )
			{
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkRBShadeCell() 連黒分断禁のパズルで白マスが分断されているかチェックする
	//---------------------------------------------------------------------------
	checkRBShadeCell : function(winfo){
		if(winfo.max>1){
			var errclist = new this.owner.CellList();
			var clist = this.owner.board.cell.filter(function(cell){ return cell.isShade();});
			for(var i=0;i<clist.length;i++){
				var cell=clist[i], list=cell.getdir4clist(), fid=null;
				for(var n=0;n<list.length;n++){
					var cell2=list[n][0];
					if(fid===null){ fid=winfo.getRoomID(cell2);}
					else if(fid!==winfo.getRoomID(cell2)){ errclist.add(cell); break;}
				}
			}
			errclist.seterr(1);
			return false;
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkAllArea()    すべてのエリアがevalfuncを満たすかどうか判定する
	// ans.checkAllBlock()   すべてのfuncを満たすマスで構成されるエリアが
	//                       evalfuncを満たすかどうか判定する
	// ans.checkAllArea2()   すべてのエリアがareaを引数に取るevalfuncを満たすかどうか判定する
	//---------------------------------------------------------------------------
	checkAllArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, null, evalfunc);},
	checkAllBlock : function(cinfo, func, evalfunc){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var area = cinfo.area[id], clist = area.clist;
			var top = (!!area.top ? area.top : clist.getQnumCell());
			var d = clist.getRectSize();
			var a = (!!func ? clist.filter(func) : clist).length;
			var n = (!top.isnull ? top.qnum : -1);

			if( !evalfunc(d.cols, d.rows, a, n) ){
				if(this.checkOnly){ return false;}
				clist.seterr(this.owner.pid!=="tateyoko"?1:4);
				result = false;
			}
		}
		return result;
	},
	checkAllArea2 : function(cinfo, evalfunc){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var area = cinfo.area[id];
			if( !!area && !evalfunc(area) ){
				if(this.checkOnly){ return false;}
				area.clist.seterr(1);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkNumberAndSize()  エリアにある数字と面積が等しいか判定する
	// ans.checkAreaRect()       領域が全て四角形であるかどうか判定する
	// ans.checkAreaSquare()     領域が全て正方形であるかどうか判定する
	//---------------------------------------------------------------------------
	checkNumberAndSize   : function(cinfo){ return this.checkAllArea(cinfo, function(w,h,a,n){ return (n<=0 || n===a);} );},
	checkAreaRect        : function(cinfo){ return this.checkAllArea(cinfo, function(w,h,a,n){ return (w*h===a);});},
	checkAreaSquare      : function(cinfo){ return this.checkAllArea(cinfo, function(w,h,a,n){ return (w*h===a && w===h);});},

	//---------------------------------------------------------------------------
	// ans.checkNoNumber()       部屋に数字が含まれていないかの判定を行う
	// ans.checkDoubleNumber()   部屋に数字が2つ以上含まれていないように判定を行う
	//---------------------------------------------------------------------------
	checkNoNumber        : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a!==0);} );},
	checkDoubleNumber    : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a<  2);} );},

	//---------------------------------------------------------------------------
	// ans.checkShadeCellCount() 領域内の数字と黒マスの数が等しいか判定する
	// ans.checkNoShadeCellInArea()  部屋に黒マスがあるか判定する
	//---------------------------------------------------------------------------
	checkShadeCellCount    : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isShade();}, function(w,h,a,n){ return (n<0 || n===a);});},
	checkNoShadeCellInArea : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isShade();}, function(w,h,a,n){ return (a>0);}         );},

	//---------------------------------------------------------------------------
	// ans.checkLinesInArea()  領域の中で線が通っているセルの数を判定する
	//---------------------------------------------------------------------------
	checkLinesInArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(cell){ return cell.lcnt>0;}, evalfunc);},

	//---------------------------------------------------------------------------
	// ans.checkNoMovedObjectInRoom() 領域に移動後のオブジェクトがないと判定する
	//---------------------------------------------------------------------------
	checkNoMovedObjectInRoom : function(cinfo, getvalue){ return this.checkAllBlock(cinfo, function(cell){ return cell.base.qnum!==-1;}, function(w,h,a,n){ return (a!==0);});},

	//---------------------------------------------------------------------------
	// ans.checkDisconnectLine() 数字などに繋がっていない線の判定を行う
	// ans.checkDoubleObject()   数字が線で2つ以上繋がっていないように判定を行う
	// ans.checkTripleObject()   数字が線で3つ以上繋がっていないように判定を行う
	// ans.checkConnectObjectCount() 上記関数の共通処理
	//---------------------------------------------------------------------------
	checkDisconnectLine : function(linfo){ return this.checkConnectObjectCount(linfo, function(a){ return(a>0);});},
	checkDoubleObject   : function(linfo){ return this.checkConnectObjectCount(linfo, function(a){ return(a<2);});},
	checkTripleObject   : function(linfo){ return this.checkConnectObjectCount(linfo, function(a){ return(a<3);});},
	checkConnectObjectCount : function(linfo, evalfunc){
		var result = true;
		for(var id=1;id<=linfo.max;id++){
			var count = linfo.area[id].clist.filter(function(cell){ return cell.isNum();}).length;
			if( !evalfunc(count) ){
				if(this.checkOnly){ return false;}
				if(result){ this.owner.board.border.seterr(-1);}
				linfo.setErrLareaById(id,1);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkSideAreaSize() 境界線をはさんで接する部屋のgetvalで得られるサイズが異なることを判定する
	// ans.checkSideAreaCell() 境界線をはさんでタテヨコに接するセルの判定を行う
	//---------------------------------------------------------------------------
	checkSideAreaSize : function(rinfo, getval){
		var sides = rinfo.getSideAreaInfo();
		for(var r=1;r<=rinfo.max-1;r++){
			for(var i=0;i<sides[r].length;i++){
				var s=sides[r][i], a1=getval(rinfo.area[r]), a2=getval(rinfo.area[s]);
				if(a1>0 && a2>0 && a1===a2){
					rinfo.area[r].clist.seterr(1);
					rinfo.area[s].clist.seterr(1);
					return false;
				}
			}
		}
		return true;
	},

	checkSideAreaCell : function(rinfo, func, flag){
		for(var id=0;id<this.owner.board.bdmax;id++){
			var border = this.owner.board.border[id];
			if(!border.isBorder()){ continue;}
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull && !cell2.isnull && func(cell1, cell2)){
				if(!flag){ cell1.seterr(1); cell2.seterr(1);}
				else{
					rinfo.getRoomByCell(cell1).clist.seterr(1);
					rinfo.getRoomByCell(cell2).clist.seterr(1);
				}
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkSameObjectInRoom()  部屋の中のgetvalueの値が1種類であるか判定する
	// ans.checkDiffNumberInRoom()  部屋の中に同じ数字が存在しないことを判定する
	// ans.checkDifferentNumberInRoom() 部屋の中に同じ数字が存在しないことを判定する
	// ans.isDifferentNumberInClist()   clistの中に同じ数字が存在しないことを判定だけを行う
	//---------------------------------------------------------------------------
	checkSameObjectInRoom : function(rinfo, getvalue){
		var result=true, d=[], val=[], bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(bd.cell[c]);}
		for(var i=1;i<=rinfo.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(rinfo.id[c]===null || val[c]===-1){ continue;}
			if(d[rinfo.id[c]]===-1 && val[c]!==-1){ d[rinfo.id[c]] = val[c];}
			else if(d[rinfo.id[c]]!==val[c]){
				if(this.checkOnly){ return false;}

				rinfo.getRoomByCell(bd.cell[c]).clist.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkDiffNumberInRoom : function(rinfo){
		return this.checkDifferentNumberInRoom(rinfo, function(cell){ return cell.getNum();});
	},
	checkDifferentNumberInRoom : function(rinfo, numfunc){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist;
			if(!this.isDifferentNumberInClist(clist, numfunc)){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	},
	isDifferentNumberInClist : function(clist, numfunc){
		if(clist.length<=0){ return true;}
		var result = true, d = [], num = [];
		var max = clist[0].getmaxnum(), bottom = clist[0].getminnum();
		for(var n=bottom;n<=max;n++){ d[n]=0;}
		for(var i=0;i<clist.length;i++){ num[clist[i].id] = numfunc(clist[i]);}

		for(var i=0;i<clist.length;i++){ if(num[clist[i].id]>=bottom){ d[num[clist[i].id]]++;} }
		var clist2 = clist.filter(function(cell){ return (num[cell.id]>=bottom && d[num[cell.id]]>=2);});
		if(clist2.length>0){ clist2.seterr(1); result = false;}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkRowsCols()            タテ列・ヨコ列の数字の判定を行う
	// ans.checkRowsColsPartly()      黒マスや[＼]等で分かれるタテ列・ヨコ列の数字の判定を行う
	//---------------------------------------------------------------------------
	/* ともにevalfuncはAnswerクラスの関数限定 */
	checkRowsCols : function(evalfunc, numfunc){
		var result = true, bd = this.owner.board;
		for(var by=1;by<=bd.maxby;by+=2){
			var clist = bd.cellinside(bd.minbx+1,by,bd.maxbx-1,by);
			if(!evalfunc.call(this, clist, numfunc)){
				if(this.checkOnly){ return false;}
				result = false;
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			var clist = bd.cellinside(bx,bd.minby+1,bx,bd.maxby-1);
			if(!evalfunc.call(this, clist, numfunc)){
				if(this.checkOnly){ return false;}
				result = false;
			}
		}
		return result;
	},
	checkRowsColsPartly : function(evalfunc, termfunc, multierr){
		var result = true, bd = this.owner.board, cell = bd.cell[0];
		for(var by=1;by<=bd.maxby;by+=2){
			for(var bx=1;bx<=bd.maxbx;bx+=2){
				for(var tx=bx;tx<=bd.maxbx;tx+=2){ if(termfunc(bd.getc(tx,by))){ break;}}
				if(tx>bx && !evalfunc.call(this, [bx-2,by,cell.RT], bd.cellinside(bx,by,tx-2,by))){
					if(!multierr || this.checkOnly){ return false;}
					result = false;
				}
				bx = tx; /* 次のループはbx=tx+2 */
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			for(var by=1;by<=bd.maxby;by+=2){
				for(var ty=by;ty<=bd.maxby;ty+=2){ if(termfunc(bd.getc(bx,ty))){ break;}}
				if(ty>by && !evalfunc.call(this, [bx,by-2,cell.DN], bd.cellinside(bx,by,bx,ty-2))){
					if(!multierr || this.checkOnly){ return false;}
					result = false;
				}
				by = ty; /* 次のループはbx=ty+2 */
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkBorderCount()  ある交点との周り四方向の境界線の数を判定する(bp==1:黒点が打たれている場合)
	//---------------------------------------------------------------------------
	checkBorderCross   : function(){ return this.checkBorderCount(4,0);},
	checkBorderDeadend : function(){ return this.checkBorderCount(1,0);},
	checkBorderCount : function(val, bp){
		var result=true, bd=this.owner.board;
		var crosses=(bd.hascross===2 ? bd.cross : bd.crossinside(bd.minbx+2,bd.minby+2,bd.maxbx-2,bd.maxby-2));
		for(var c=0;c<crosses.length;c++){
			var cross = crosses[c];
			if(cross.lcnt===val && (bp===0 || (bp===1 && cross.qnum===1) || (bp===2 && cross.qnum!==1) )){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cross.setCrossBorderError();
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkLineOverLetter()  線が数字などを通過しているか判定する
	//---------------------------------------------------------------------------
	checkLineOverLetter : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.lcnt>=2 && cell.isNum()){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setCellLineError(true);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkAllPath()   すべての線がpathを引数に取るevalfunc==falseになるかどうか判定する
	//---------------------------------------------------------------------------
	checkAllPath : function(xinfo, evalfunc){
		var result = true;
		for(var id=1;id<=xinfo.max;id++){
			var path = xinfo.path[id];
			if(!path || !evalfunc(path)){ continue;}

			if(this.checkOnly){ return false;}
			var cells = path.cells;
			if(!!cells[0] && cells[0]!==null){ cells[0].seterr(1);}
			if(!!cells[1] && cells[1]!==null){ cells[1].seterr(1);}
			if(result){ this.owner.board.border.seterr(-1);}
			path.blist.seterr(1);
			result = false;
		}
		return result;
	}
},

//---------------------------------------------------------------------------
// ★FailCodeクラス 答えの文字列を扱う
//---------------------------------------------------------------------------
FailCode:{
	/* ** 黒マス ** */
	cs2x2       : ["2x2の黒マスのかたまりがあります。","There is a 2x2 block of shaded cells."],
	csNotSquare : ["正方形でない黒マスのカタマリがあります。","A mass of shaded cells is not regular rectangle."],
	csAdjacent  : ["黒マスがタテヨコに連続しています。","Shaded cells are adjacent."],
	csDivide    : ["黒マスが分断されています。","Shaded cells are devided,"],
	cuDivide    : ["白マスが分断されています。","Unshaded cells are devided."],
	cuDivideRB  : ["白マスが分断されています。","Unshaded cells are devided."], /* 連黒分断禁 */

	/* ** 領域＋数字 ** */
	bkNoNum  : ["数字のないブロックがあります。","A block has no number."],
	bkNumGe2 : ["1つのブロックに2つ以上の数字が入っています。","A block has plural numbers."],
	bkDupNum : ["同じブロックに同じ数字が入っています。","There are same numbers in a block."],
	bkPlNum  : ["複数種類の数字が入っているブロックがあります。","A block has two or more kinds of numbers."],
	bkSepNum : ["同じ数字が異なるブロックに入っています。","One kind of numbers is included in dirrerent blocks."],
	
	bkSizeNe : ["数字とブロックの大きさが違います。","The size of the block is not equal to the number."],
	bkSizeLt : ["ブロックの大きさより数字のほうが大きいです。","A number is bigger than the size of block."],
	bkSizeGt : ["ブロックの大きさよりも数字が小さいです。","A number is smaller than the size of block."],
	
	bkShadeNe     : ["部屋の数字と黒マスの数が一致していません。","The number of shaded cells in the room and The number written in the room is different."],
	bkShadeDivide : ["1つの部屋に入る黒マスが2つ以上に分裂しています。","Shaded cells are devided in one room."],
	bkNoShade     : ["黒マスがない部屋があります。","A room has no shaded cell."],
	bkMixed       : ["白マスと黒マスの混在したタイルがあります。","A tile includes both shaded and unshaded cells."],
	
	bkWidthGt1 : ["幅が１マスではないタタミがあります。","The width of the tatami is not one."],
	
	/* ** 領域＋線を引く ** */
	brNoLine : ["線が引かれていません。","There is no line on the board."],
	bkNoLine : ["線の通っていない国があります。","There is a country that is not passed any line."],
	
	/* ** 盤面切り分け系 ** */
	bkNotRect : ["四角形ではない部屋があります。","There is a room whose shape is not square."],
	bdDeadEnd : ["途中で途切れている線があります。","There is a dead-end line."],
	bdCross   : ["十字の交差点があります。","There is a crossing border line."],
	nmBorderNe : ["数字の周りにある境界線の本数が違います。","The number is not equal to the number of border lines around it."],

	/* ** 線を引く系 ** */
	lnDeadEnd : ["途中で途切れている線があります。","There is a dead-end line."],
	lnBranch  : ["分岐している線があります。","There is a branch line."],
	lnCross   : ["線が交差しています。","There is a crossing line."],
	lnCrossExMk  : ["十字以外の場所で線が交差しています。","There is a crossing line out of cross mark."],
	lnNotCrossMk : ["十字の場所で線が交差していません。","A cross-joint cell doesn't have four-way lines."],
	lnCrossExIce : ["氷の部分以外で線が交差しています。","A Line is crossed outside of ice."],
	lnCurveOnIce : ["氷の部分で線が曲がっています。","A Line curve on ice."],
	lnPlLoop : ["輪っかが一つではありません。","There are plural loops."],
	lnOnShade : ["黒マスの上に線が引かれています。","There is a line on the shaded cell."],

	/* ** 線でつなぐ系 ** */
	lcDeadEnd : ["線が途中で途切れています。", "There is a dead-end line."],
	lcDivided : ["線が全体で一つながりになっていません。", "All lines and numbers are not connected each other."],
	lcTripleNum : ["3つ以上の数字がつながっています。","Three or more numbers are connected."],
	lcIsolate : ["数字につながっていない線があります。","A line doesn't connect any number."],
	lcOnNum   : ["数字の上を線が通過しています。","A line goes through a number."],
	nmIsolate : ["どこにもつながっていない数字があります。","A number is not connected another number."],
	nmConnected : ["アルファベットが繋がっています。","There are connected letters."],
	
	/* ** 線で動かす系 ** */
	laIsolate : ["アルファベットにつながっていない線があります。","A line doesn't connect any letter."],
	laOnNum : ["アルファベットの上を線が通過しています。","A line goes through a letter."],
	laCurve : ["曲がっている線があります。","A line has curve."],
	laLenNe : ["数字と線の長さが違います。","The length of a line is wrong."],

	/* ** 単体セルチェック ** */
	ceEmpty : ["何も入っていないマスがあります。","There is an empty cell."],
	ceAddLine : ["最初から引かれている線があるマスに線が足されています。","Lines are added to the cell that the mark lie in by the question."],
	
	anShadeNe : ["矢印の方向にある黒マスの数が正しくありません。","The number of shaded cells are not correct."],

	/* ** 数字系 ** */
	nmSameNum : ["同じ数字がタテヨコに連続しています。","Same numbers are adjacent."],
	nmAround : ["同じ数字がタテヨコナナメに隣接しています。","Same numbers are adjacent."],
	nmDupRow : ["同じ列に同じ数字が入っています。","There are same numbers in a row."],
	nmDivide : ["タテヨコにつながっていない数字があります。","Numbers are devided."]
}
});
