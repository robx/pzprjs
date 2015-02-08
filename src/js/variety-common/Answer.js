// AnswerCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
AnsCheck:{
	//--------------------------------------------------------------------------------
	// ans.getLineInfo()  線情報を返す
	// ans.getRoomInfo()  部屋情報を返す
	// ans.getLareaInfo() 線つながり情報を返す
	// ans.getShadeInfo()    黒マスの領域情報を返す
	// ans.getUnshadeInfo()  白マスの領域情報を返す
	// ans.getNumberInfo()   数字の領域/繋がり情報を返す
	// ans.getLineShapeInfo() 丸などで区切られた線を探索し情報を付加して返す
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		return (this._info.line = this._info.line || this.owner.board.getLineInfo());
	},
	getRoomInfo : function(){
		return (this._info.room = this._info.room || this.owner.board.getRoomInfo());
	},
	getLareaInfo : function(){
		return (this._info.linfo = this._info.linfo || this.owner.board.getLareaInfo());
	},
	getShadeInfo : function(){
		return (this._info.bcell = this._info.bcell || this.owner.board.getShadeInfo());
	},
	getUnshadeInfo : function(){
		return (this._info.wcell = this._info.wcell || this.owner.board.getUnshadeInfo());
	},
	getNumberInfo : function(){
		return (this._info.num = this._info.num || this.owner.board.getNumberInfo());
	},
	getLineShapeInfo : function(){
		return (this._info.lshape = this._info.lshape || this.owner.board.getLineShapeInfo());
	},

	//---------------------------------------------------------------------------
	// ans.checkAllCell()   条件func==trueになるマスがあったらエラーを設定する
	// ans.checkNoNumCell() 数字の入っていないセルがあるか判定する
	// ans.checkIceLines()  アイスバーン上で線が曲がっているか判定する
	// ans.checkNotCrossOnMark()  十字のマーク上で線が交差していることを判定する
	// ans.checkLineOnShadeCell() 黒マス上に線がないことを判定する
	// ans.checkNoLineObject()    線が出ていない数字や○がないかどうか判定する
	// ans.checkLineOverLetter()  線が数字などを通過しているか判定する
	//---------------------------------------------------------------------------
	checkAllCell : function(func, code){
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(!func(cell)){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	},
	checkNoNumCell : function(){
		this.checkAllCell( function(cell){ return (cell.ques===0 && cell.noNum());}, "ceNoNum" );
	},
	checkIceLines : function(){
		this.checkAllCell( function(cell){ return (cell.ice() && cell.isLineCurve());}, "lnCurveOnIce");
	},
	checkNotCrossOnMark : function(){
		this.checkAllCell( function(cell){ return (cell.lcnt!==4 && cell.ques===11);}, "lnNotCrossMk");
	},
	checkLineOnShadeCell : function(){
		this.checkAllCell( function(cell){ return ((cell.ques===1 || cell.qans===1) && cell.lcnt>0);}, "lnOnShade");
	},
	checkNoLineObject : function(){
		this.checkAllCell( function(cell){ return (cell.lcnt===0 && cell.isNum());}, "nmNoLine");
	},
	checkLineOverLetter : function(){
		this.checkAllCell( function(cell){ return (cell.lcnt>=2 && cell.isNum());}, (this.owner.board.linfo.moveline ? "laOnNum" : "lcOnNum"));
	},

	//---------------------------------------------------------------------------
	// ans.checkDir4Cell()  セルの周囲4マスの条件がfunc==trueの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkDir4Cell : function(iscount, type, code){ // type = 0:違う 1:numより小さい 2:numより大きい
		for(var c=0;c<this.owner.board.cellmax;c++){
			var cell = this.owner.board.cell[c];
			if(!cell.isValidNum()){ continue;}
			var num = cell.getNum(), count=cell.countDir4Cell(iscount);
			if((type===0 && num===count) || (type===1 && num<=count) || (type===2 && num>=count)){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkSideCell()  隣り合った2つのセルが条件func==trueの時、エラーを設定する
	// ans.checkAdjacentShadeCell()  黒マスが隣接している時、エラーを設定する
	// ans.checkAdjacentDiffNumber() 同じ数字が隣接している時、エラーを設定する
	//---------------------------------------------------------------------------
	checkSideCell : function(func, code){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], cell2 = cell.adjacent.right;
			if(cell.bx<bd.maxbx-1 && func(cell,cell2)){
				result = false;
				if(this.checkOnly){ break;}
				cell.seterr(1);
				cell2.seterr(1);
			}
			cell2 = cell.adjacent.bottom;
			if(cell.by<bd.maxby-1 && func(cell,cell2)){
				result = false;
				if(this.checkOnly){ break;}
				cell.seterr(1);
				cell2.seterr(1);
			}
		}
		if(!result){ this.failcode.add(code);}
	},
	checkAdjacentShadeCell : function(){
		this.checkSideCell(function(cell1,cell2){ return (cell1.isShade() && cell2.isShade());}, "csAdjacent");
	},
	checkAdjacentDiffNumber : function(){
		this.checkSideCell(function(cell1,cell2){ return cell1.sameNumber(cell2);}, "nmAdjacent");
	},

	//---------------------------------------------------------------------------
	// ans.check2x2Block()      2x2のセルが全て条件func==trueの時、エラーを設定する
	// ans.check2x2ShadeCell()  2x2のセルが黒マスの時、エラーを設定する
	//---------------------------------------------------------------------------
	check2x2Block : function(func, code){
		var bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx>=bd.maxbx-1 || cell.by>=bd.maxby-1){ continue;}
			
			var bx=cell.bx, by=cell.by;
			var clist = bd.cellinside(bx, by, bx+2, by+2).filter(func);
			if(clist.length<4){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},
	check2x2ShadeCell : function(){
		this.check2x2Block( function(cell){ return cell.isShade();}, "cs2x2" );
	},

	//---------------------------------------------------------------------------
	// ans.checkSameColorTile() 白マスと黒マスが混ざったタイルがないかどうかチェックする
	//---------------------------------------------------------------------------
	checkSameColorTile : function(){
		this.checkSameObjectInRoom(this.getRoomInfo(), function(cell){ return (cell.isShade()?1:2);}, "bkMixed");
	},

	//---------------------------------------------------------------------------
	// ans.checkConnectShade()    黒マスがひとつながりかどうかを判定する
	// ans.checkConnectUnshade()  白マスがひとつながりかどうかを判定する
	// ans.checkConnectNumber()   数字がひとつながりかどうかを判定する
	// ans.checkOneArea()  白マス/黒マス/線がひとつながりかどうかを判定する
	// ans.checkConnectUnshadeRB() 連黒分断禁のパズルで白マスが分断されているかチェックする
	//---------------------------------------------------------------------------
	checkConnectShade   : function(){ this.checkOneArea(this.getShadeInfo(),   "csDivide");},
	checkConnectUnshade : function(){ this.checkOneArea(this.getUnshadeInfo(), "cuDivide");},
	checkConnectNumber  : function(){ this.checkOneArea(this.getNumberInfo(),  "nmDivide");},
	checkOneArea : function(cinfo, code){
		if(cinfo.max>1){
			this.failcode.add(code);
			cinfo.area[1].clist.seterr(1);
		}
	},

	checkConnectUnshadeRB : function(){
		var winfo = this.getUnshadeInfo();
		if(winfo.max>1){
			this.failcode.add("cuDivideRB");
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
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkOneLoop()  盤面に引かれている線が一つに繋がっていることを判定する
	//---------------------------------------------------------------------------
	checkOneLoop : function(){
		var xinfo = this.getLineInfo();
		if(xinfo.max>1){
			this.failcode.add("lnPlLoop");
			this.owner.board.border.setnoerr();
			xinfo.path[1].blist.seterr(1);
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkLineExist()  盤面に少なくとも一本は線が引かれていることを判定する
	//---------------------------------------------------------------------------
	checkLineExist : function(){
		var bd = this.owner.board;
		for(var i=0;i<bd.bdmax;i++){ if(bd.border[i].isLine()){ return;} }
		this.failcode.add("brNoLine");
	},

	//---------------------------------------------------------------------------
	// ans.checkLineCount() セルから出ている線の本数について判定する
	//---------------------------------------------------------------------------
	checkCrossLine   : function(){ this.checkLineCount(4, "lnCross");},
	checkBranchLine  : function(){ this.checkLineCount(3, "lnBranch");},
	checkDeadendLine : function(){ this.checkLineCount(1, "lnDeadEnd");},
	checkNoLine      : function(){ this.checkLineCount(0, "ceNoLine");},
	checkLineCount : function(val, code){
		var result = true, bd = this.owner.board;
		if(bd.lines.ltotal[val]===0){ return;}
		
		if(!bd.lines.borderAsLine){
			this.checkAllCell(function(cell){ return cell.lcnt===val;}, code);
		}
		else{
			var boardcross = bd.cross;
			for(var c=0;c<boardcross.length;c++){
				if(boardcross[c].lcnt!==val){ continue;}
				
				result = false;
				if(this.checkOnly){ break;}
				boardcross[c].setCrossBorderError();
			}
			if(!result){
				this.failcode.add(code);
				bd.border.setnoerr();
			}
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkConnectLineCount() ○などがないセルから出ている線の本数について判定する
	//---------------------------------------------------------------------------
	checkCrossConnectLine   : function(){ this.checkConnectLineCount(4, "lnCross");},
	checkBranchConnectLine  : function(){ this.checkConnectLineCount(3, "lnBranch");},
	checkDeadendConnectLine : function(){ this.checkConnectLineCount(1, "lnDeadEnd");},
	checkConnectLineCount : function(val, code){
		if(this.owner.board.lines.ltotal[val]===0){ return;}
		
		this.checkAllCell(function(cell){ return (cell.noNum() && cell.lcnt===val);}, code);
	},

	//---------------------------------------------------------------------------
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkenableLineParts : function(){
		var bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], adb = cell.adjborder;
			if( (!adb.top.isLine()    || !cell.noLP(cell.UP)) &&
				(!adb.bottom.isLine() || !cell.noLP(cell.DN)) &&
				(!adb.left.isLine()   || !cell.noLP(cell.LT)) &&
				(!adb.right.isLine()  || !cell.noLP(cell.RT)) )
			{ continue;}
		
			this.failcode.add("ceAddLine");
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkAllArea()    すべてのエリアがevalfuncを満たすかどうか判定する
	// ans.checkAllBlock()   すべてのfuncを満たすマスで構成されるエリアが
	//                       evalfuncを満たすかどうか判定する
	// ans.checkAllArea2()   すべてのエリアがareaを引数に取るevalfuncを満たすかどうか判定する
	//---------------------------------------------------------------------------
	checkAllArea : function(cinfo, evalfunc, code){ this.checkAllBlock(cinfo, null, evalfunc, code);},
	checkAllBlock : function(cinfo, filterfunc, evalfunc, code){
		for(var id=1;id<=cinfo.max;id++){
			var area = cinfo.area[id], clist = area.clist;
			var top = (!!area.top ? area.top : clist.getQnumCell());
			var d = clist.getRectSize();
			var a = (!!filterfunc ? clist.filter(filterfunc) : clist).length;
			var n = (!top.isnull ? top.qnum : -1);
			if( evalfunc(d.cols, d.rows, a, n) ){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			clist.seterr(this.owner.pid!=="tateyoko"?1:4);
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkNumberAndSize()  部屋にある数字と面積が等しいか判定する
	// ans.checkRoomRect()       領域が全て四角形であるかどうか判定する
	//---------------------------------------------------------------------------
	checkNumberAndSize   : function(){ this.checkAllArea(this.getRoomInfo(), function(w,h,a,n){ return (n<=0 || n===a);}, "bkSizeNe" );},
	checkRoomRect        : function(){ this.checkAllArea(this.getRoomInfo(), function(w,h,a,n){ return (w*h===a);},       "bkNotRect");},

	//---------------------------------------------------------------------------
	// ans.checkNoNumber()       部屋に数字が含まれていないかの判定を行う
	// ans.checkDoubleNumber()   部屋に数字が2つ以上含まれていないように判定を行う
	//---------------------------------------------------------------------------
	checkNoNumber     : function(){ this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a!==0);}, "bkNoNum");},
	checkDoubleNumber : function(){ this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a<  2);}, "bkNumGe2");},

	//---------------------------------------------------------------------------
	// ans.checkShadeCellCount() 領域内の数字と黒マスの数が等しいか判定する
	// ans.checkNoShadeCellInArea()  部屋に黒マスがあるか判定する
	//---------------------------------------------------------------------------
	checkShadeCellCount    : function(){ this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isShade();}, function(w,h,a,n){ return (n<0 || n===a);}, "bkShadeNe");},
	checkNoShadeCellInArea : function(){ this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isShade();}, function(w,h,a,n){ return (a>0);},          "bkNoShade");},

	//---------------------------------------------------------------------------
	// ans.checkLinesInArea()  領域の中で線が通っているセルの数を判定する
	//---------------------------------------------------------------------------
	checkLinesInArea : function(cinfo, evalfunc, code){ this.checkAllBlock(cinfo, function(cell){ return cell.lcnt>0;}, evalfunc, code);},

	//---------------------------------------------------------------------------
	// ans.checkNoMovedObjectInRoom() 領域に移動後のオブジェクトがないと判定する
	//---------------------------------------------------------------------------
	checkNoMovedObjectInRoom : function(cinfo, getvalue){ this.checkAllBlock(cinfo, function(cell){ return cell.base.qnum!==-1;}, function(w,h,a,n){ return (a!==0);}, "bkNoNum");},

	//---------------------------------------------------------------------------
	// ans.checkDisconnectLine() 数字などに繋がっていない線の判定を行う
	// ans.checkConnectObject()  数字が線で2つ以上繋がっていないように判定を行う
	// ans.checkTripleObject()   数字が線で3つ以上繋がっていないように判定を行う
	// ans.checkConnectObjectCount() 上記関数の共通処理
	//---------------------------------------------------------------------------
	checkDisconnectLine : function(){ this.checkConnectObjectCount(function(a){ return(a>0);}, (this.owner.board.linfo.moveline ? "laIsolate" : "lcIsolate"));},
	checkConnectObject  : function(){ this.checkConnectObjectCount(function(a){ return(a<2);}, "nmConnected");},
	checkTripleObject   : function(){ this.checkConnectObjectCount(function(a){ return(a<3);}, "lcTripleNum");},
	checkConnectObjectCount : function(evalfunc, code){
		var result = true, linfo = this.getLareaInfo();
		for(var id=1;id<=linfo.max;id++){
			if( evalfunc( linfo.area[id].clist.filter(function(cell){ return cell.isNum();}).length ) ){ continue;}
			
			result = false;
			if(this.checkOnly){ break;}
			linfo.setErrLareaById(id,1);
		}
		if(!result){
			this.failcode.add(code);
			this.owner.board.border.setnoerr();
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkSideAreaSize() 境界線をはさんで接する部屋のgetvalで得られるサイズが異なることを判定する
	// ans.checkSideAreaCell() 境界線をはさんでタテヨコに接するセルの判定を行う
	//---------------------------------------------------------------------------
	checkSideAreaSize : function(rinfo, getval, code){
		var sides = rinfo.getSideAreaInfo();
		allloop:
		for(var r=1;r<=rinfo.max-1;r++){
			for(var i=0;i<sides[r].length;i++){
				var s=sides[r][i], a1=getval(rinfo.area[r]), a2=getval(rinfo.area[s]);
				if(a1<=0 || a2<=0 || a1!==a2){ continue;}
				
				this.failcode.add(code);
				if(this.checkOnly){ break allloop;}
				rinfo.area[r].clist.seterr(1);
				rinfo.area[s].clist.seterr(1);
			}
		}
	},

	checkSideAreaCell : function(rinfo, func, flag, code){
		for(var id=0;id<this.owner.board.bdmax;id++){
			var border = this.owner.board.border[id];
			if(!border.isBorder()){ continue;}
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(cell1.isnull || cell2.isnull || !func(cell1, cell2)){ continue;}

			this.failcode.add(code);
			if(this.checkOnly){ break;}
			if(!flag){ cell1.seterr(1); cell2.seterr(1);}
			else{
				rinfo.getRoomByCell(cell1).clist.seterr(1);
				rinfo.getRoomByCell(cell2).clist.seterr(1);
			}
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkSameObjectInRoom()      部屋の中のgetvalueの値が1種類であるか判定する
	// ans.checkDifferentNumberInRoom() 部屋の中に同じ数字が存在しないことを判定する
	// ans.isDifferentNumberInClist()   clistの中に同じ数字が存在しないことを判定だけを行う
	//---------------------------------------------------------------------------
	checkSameObjectInRoom : function(rinfo, getvalue, code){
		var d=[], val=[], bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(bd.cell[c]);}
		for(var i=1;i<=rinfo.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(rinfo.id[c]===null || val[c]===-1){ continue;}
			if(d[rinfo.id[c]]===-1 && val[c]!==-1){ d[rinfo.id[c]] = val[c];}
			else if(d[rinfo.id[c]]!==val[c]){
				this.failcode.add(code);
				if(this.checkOnly){ break;}
				rinfo.getRoomByCell(bd.cell[c]).clist.seterr(1);
			}
		}
	},

	checkDifferentNumberInRoom : function(){
		this.checkDifferentNumberInRoom_main(this.getRoomInfo(), this.isDifferentNumberInClist);
	},
	checkDifferentNumberInRoom_main : function(rinfo, evalfunc){
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist;
			if( evalfunc.call(this, clist) ){ continue;}
			
			this.failcode.add("bkDupNum");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},

	isDifferentNumberInClist    : function(clist){ return this.isIndividualObject(clist, function(cell){ return cell.getNum();}); },
	isDifferentAnsNumberInClist : function(clist){ return this.isIndividualObject(clist, function(cell){ return cell.anum;}); },
	isIndividualObject : function(clist, numfunc){
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
	// ans.checkRowsCols()              タテ列・ヨコ列の数字の判定を行う
	// ans.checkDifferentNumberInLine() タテ列・ヨコ列に同じ数字が入っていないことを判定する
	//---------------------------------------------------------------------------
	/* ともにevalfuncはAnswerクラスの関数限定 */
	checkRowsCols : function(evalfunc, code){
		if(!this.checkErrorCols(evalfunc) || !this.checkErrorRows(evalfunc)){
			this.failcode.add(code);
		}
	},
	/* 横方向サーチ */
	checkErrorCols : function(evalfunc){
		var result = true, bd = this.owner.board;
		for(var by=1;by<=bd.maxby;by+=2){
			var clist = bd.cellinside(bd.minbx+1,by,bd.maxbx-1,by);
			if( evalfunc.call(this, clist) ){ continue;}
			
			result = false;
			if(this.checkOnly){ break;}
		}
		return result;
	},
	/* 縦方向サーチ */
	checkErrorRows : function(evalfunc){
		var result = true, bd = this.owner.board;
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			var clist = bd.cellinside(bx,bd.minby+1,bx,bd.maxby-1);
			if( evalfunc.call(this, clist) ){ continue;}
			
			result = false;
			if(this.checkOnly){ break;}
		}
		return result;
	},
	//---------------------------------------------------------------------------
	// ans.checkRowsColsPartly()      黒マスや[＼]等で分かれるタテ列・ヨコ列の数字の判定を行う
	// ans.checkRowsColsFor51cell()   [＼]で分かれるタテ列・ヨコ列の数字の判定を行う
	//---------------------------------------------------------------------------
	checkRowsColsPartly : function(evalfunc, termfunc, code){
		if(!this.checkErrorColsPartly(evalfunc, termfunc) || !this.checkErrorRowsPartly(evalfunc, termfunc)){
			this.failcode.add(code);
		}
	},
	/* 横方向サーチ */
	checkErrorColsPartly : function(evalfunc, termfunc){
		var result = true, bd = this.owner.board, info = {keycell:null, key51num:-1, isvert:false};
		allloop: for(var by=1;by<=bd.maxby;by+=2){
			for(var bx=1;bx<=bd.maxbx;bx+=2){
				for(var tx=bx;tx<=bd.maxbx;tx+=2){ if(termfunc(bd.getc(tx,by))){ break;}}
				info.keycell = bd.getobj(bx-2,by);
				info.key51num = info.keycell.qnum;
				if(tx>bx && !evalfunc.call(this, bd.cellinside(bx,by,tx-2,by), info)){
					result = false;
					if(this.checkOnly){ break allloop;}
				}
				bx = tx; /* 次のループはbx=tx+2 */
			}
		}
		return result;
	},
	/* 縦方向サーチ */
	checkErrorRowsPartly : function(evalfunc, termfunc){
		var result = true, bd = this.owner.board, info = {keycell:null, key51num:-1, isvert:true};
		allloop: for(var bx=1;bx<=bd.maxbx;bx+=2){
			for(var by=1;by<=bd.maxby;by+=2){
				for(var ty=by;ty<=bd.maxby;ty+=2){ if(termfunc(bd.getc(bx,ty))){ break;}}
				info.keycell = bd.getobj(bx,by-2);
				info.key51num = info.keycell.qnum2;
				if(ty>by && !evalfunc.call(this, bd.cellinside(bx,by,bx,ty-2), info)){
					result = false;
					if(this.checkOnly){ break allloop;}
				}
				by = ty; /* 次のループはbx=ty+2 */
			}
		}
		return result;
	},
	checkRowsColsFor51cell : function(evalfunc, code){
		this.checkRowsColsPartly(evalfunc, function(cell){ return cell.is51cell();}, code);
	},

	//---------------------------------------------------------------------------
	// ans.checkBorderCount()  ある交点との周り四方向の境界線の数を判定する(bp==1:黒点が打たれている場合)
	//---------------------------------------------------------------------------
	checkBorderCross   : function(){ this.checkBorderCount(4,0, "bdCross");},
	checkBorderDeadend : function(){ this.checkBorderCount(1,0, "bdDeadEnd");},
	checkBorderCount : function(val, bp, code){
		var result=true, bd=this.owner.board;
		var crosses=(bd.hascross===2 ? bd.cross : bd.crossinside(bd.minbx+2,bd.minby+2,bd.maxbx-2,bd.maxby-2));
		for(var c=0;c<crosses.length;c++){
			var cross = crosses[c];
			if(cross.lcnt!==val || ((bp===1 && cross.qnum!==1) || (bp===2 && cross.qnum===1) )){ continue;}
			
			result = false;
			if(this.checkOnly){ break;}
			cross.setCrossBorderError();
		}
		if(!result){
			this.failcode.add(code);
			bd.border.setnoerr();
		}
	},

	//---------------------------------------------------------------------------
	// ans.checkLineShape()  すべての丸などで区切られた線が、pathを引数に取るevalfunc==falseになるかどうか判定する
	// ans.checkLineShapeDeadend()  オブジェクトを結ぶ線が途中で途切れていることを判定する
	//---------------------------------------------------------------------------
	checkLineShape : function(evalfunc, code){
		var result = true;
		var xinfo = this.getLineShapeInfo();
		for(var id=1;id<=xinfo.max;id++){
			var path = xinfo.path[id];
			if(!path || !evalfunc(path)){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			var cells = path.cells;
			if(!!cells[0] && cells[0]!==null){ cells[0].seterr(1);}
			if(!!cells[1] && cells[1]!==null){ cells[1].seterr(1);}
			path.blist.seterr(1);
		}
		if(!result){
			this.failcode.add(code);
			this.owner.board.border.setnoerr();
		}
	},
	checkLineShapeDeadend : function(){
		this.checkLineShape(function(path){ return path.cells[1].isnull;}, "lcDeadEnd");
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
	
	bkShadeNe     : ["部屋の数字と黒マスの数が一致していません。","The number of shaded cells in the room and The number written in the room is different."],
	bkShadeDivide : ["1つの部屋に入る黒マスが2つ以上に分裂しています。","Shaded cells are devided in one room."],
	bkNoShade     : ["黒マスがない部屋があります。","A room has no shaded cell."],
	bkMixed       : ["白マスと黒マスの混在したタイルがあります。","A tile includes both shaded and unshaded cells."],
	
	bkWidthGt1 : ["幅が１マスではないタタミがあります。","The width of the tatami is not one."],
	
	/* ** 領域＋線を引く ** */
	brNoLine : ["線が引かれていません。","There is no line on the board."],
	
	/* ** 盤面切り分け系 ** */
	bkNotRect : ["四角形ではない部屋があります。","There is a room whose shape is not square."],
	bdDeadEnd : ["途中で途切れている線があります。","There is a dead-end line."],
	bdCross   : ["十字の交差点があります。","There is a crossing border line."],

	/* ** 線を引く系 ** */
	lnDeadEnd : ["途中で途切れている線があります。","There is a dead-end line."],
	lnBranch  : ["分岐している線があります。","There is a branch line."],
	lnCross   : ["線が交差しています。","There is a crossing line."],
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
	nmNoLine  : ["どこにもつながっていない数字があります。","A number is not connected another number."],
	nmConnected : ["アルファベットが繋がっています。","There are connected letters."],
	
	/* ** 線で動かす系 ** */
	laIsolate : ["アルファベットにつながっていない線があります。","A line doesn't connect any letter."],
	laOnNum : ["アルファベットの上を線が通過しています。","A line goes through a letter."],
	laCurve : ["曲がっている線があります。","A line has curve."],
	laLenNe : ["数字と線の長さが違います。","The length of a line is wrong."],

	/* ** 単体セルチェック ** */
	ceNoNum   : ["数字の入っていないマスがあります。","There is an empty cell."],
	ceNoLine  : ["線が引かれていないマスがあります。","There is an empty cell."],
	ceAddLine : ["最初から引かれている線があるマスに線が足されています。","Lines are added to the cell that the mark lie in by the question."],
	
	anShadeNe : ["矢印の方向にある黒マスの数が正しくありません。","The number of shaded cells are not correct."],

	/* ** 数字系 ** */
	nmAdjacent  : ["同じ数字がタテヨコに連続しています。","Same numbers are adjacent."],
	nmDupRow : ["同じ列に同じ数字が入っています。","There are same numbers in a row."],
	nmDivide : ["タテヨコにつながっていない数字があります。","Numbers are devided."]
}
});
