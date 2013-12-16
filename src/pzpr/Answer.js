// Answer.js v3.4.0
(function(){

var k = pzpr.consts;

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
pzpr.createPuzzleClass('AnsCheck',
{
	initialize : function(){
		this.inCheck = false;
		this.checkOnly = false;
	},

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う
	// ans.checkAns()  答えのチェックを行い、エラーコードを返す(0はNo Error) (オーバーライド用)
	// ans.check1st()  オートチェック時に初めに判定を行う(オーバーライド用)
	//---------------------------------------------------------------------------
	check : function(activemode){
		var failcode = 0, o = this.owner, bd = o.board;
		this.inCheck = true;
		
		if(activemode){
			this.checkOnly = false;
			failcode = this.checkAns();
			if(failcode!==0){
				bd.haserror = true;
				o.redraw();
			}
			else{
				failcode = 'complete';
			}
		}
		else{
			bd.disableSetError();
			this.checkOnly = true;
			failcode = (this.autocheck1st() || this.checkAns());
			bd.enableSetError();
		}
		
		this.inCheck = false;
		return failcode;
	},
	checkAns : function(){ return 0;},	//オーバーライド用
	check1st : function(){ return 0;},	//オーバーライド用

	//---------------------------------------------------------------------------
	// ans.autocheck1st() autocheck前に、軽い正答判定を行う
	//---------------------------------------------------------------------------
	// リンク系は重いので最初に端点を判定する
	autocheck1st : function(){
		var bd = this.owner.board;
		if(bd.lines.enabled && !bd.linfo.enabled){
			if(bd.lines.isCenterLine || bd.lines.borderAsLine){
				if(!this.checkLineCount(1)){ return 'lnDeadEnd';}
			}
		}
		return this.check1st();
	},

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
			return (cell.lcnt()===2 && cell.ice() && !cell.isLineStraight());
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
	// ans.checkAdjacentBlackCell()  黒マスが隣接している時、エラーを設定する
	//---------------------------------------------------------------------------
	checkSideCell : function(func){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx<bd.maxbx-1 && func(cell,cell.rt())){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				cell.rt().seterr(1);
				result = false;
			}
			if(cell.by<bd.maxby-1 && func(cell,cell.dn())){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				cell.dn().seterr(1);
				result = false;
			}
		}
		return result;
	},
	checkAdjacentBlackCell : function(){
		return this.checkSideCell(function(cell1,cell2){ return (cell1.isBlack() && cell2.isBlack());});
	},

	//---------------------------------------------------------------------------
	// ans.check2x2Block()      2x2のセルが全て条件func==trueの時、エラーを設定する
	// ans.check2x2BlackCell()  2x2のセルが黒マスの時、エラーを設定する
	//---------------------------------------------------------------------------
	check2x2Block : function(func){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx<bd.maxbx-1 && cell.by<bd.maxby-1){
				var cnt=0, bx=cell.bx, by=cell.by;
				var clist = bd.cellinside(bx, by, bx+2, by+2).filter(function(cell){ return func(cell);});
				if(clist.length===4){
					if(this.checkOnly){ return false;}
					clist.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},
	check2x2BlackCell : function(){
		return this.check2x2Block( function(cell){ return cell.isBlack();} );
	},

	//---------------------------------------------------------------------------
	// ans.checkOneArea()  白マス/黒マス/線がひとつながりかどうかを判定する
	// ans.checkOneLine()  線がひとつながりかどうかを判定する
	// ans.checkOneLoop()  交差あり線が一つかどうか判定する
	// ans.checkLineCount() セルから出ている線の本数について判定する
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkOneArea : function(cinfo){
		var bd = this.owner.board;
		if(cinfo.max>1){
			cinfo.room[1].clist.seterr(1);
			return false;
		}
		return true;
	},
	checkOneLine : function(cinfo){
		var bd = this.owner.board;
		if(cinfo.max>1){
			bd.border.seterr(-1);
			cinfo.setErrLareaByCell(bd.cell[1],1);
			return false;
		}
		return true;
	},

	checkOneLoop : function(){
		var bd = this.owner.board, xinfo = bd.getLineInfo();
		if(xinfo.max>1){
			bd.border.seterr(-1);
			xinfo.room[1].blist.seterr(1);
			return false;
		}
		return true;
	},

	checkLineCount : function(val){
		var result = true, bd = this.owner.board;
		if(bd.lines.ltotal[val]==0){ return true;}
		if(bd.lines.isCenterLine){
			for(var c=0;c<bd.cellmax;c++){
				var cell = bd.cell[c];
				if(cell.lcnt()==val){
					if(this.checkOnly){ return false;}
					if(result){ bd.border.seterr(-1);}
					cell.setCellLineError(true);
					result = false;
				}
			}
		}
		else if(bd.lines.borderAsLine){
			for(var by=bd.minby;by<=bd.maxby;by+=2){ for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
				var id = (bx>>1)+(by>>1)*(bd.qcols+1);
				var lcnts = bd.lines.lcnt[id];
				if(lcnts==val){
					if(this.checkOnly){ return false;}
					if(result){ bd.border.seterr(-1);}
					(new this.owner.Address(bx,by)).setCrossBorderError();
					result = false;
				}
			}}
		}
		return result;
	},

	checkenableLineParts : function(val){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if( (cell.ub().isLine() && cell.noLP(k.UP)) ||
				(cell.db().isLine() && cell.noLP(k.DN)) ||
				(cell.lb().isLine() && cell.noLP(k.LT)) ||
				(cell.rb().isLine() && cell.noLP(k.RT)) )
			{
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkRBBlackCell() 連黒分断禁のパズルで白マスが分断されているかチェックする
	//---------------------------------------------------------------------------
	checkRBBlackCell : function(winfo){
		if(winfo.max>1){
			var errclist = new this.owner.CellList();
			var clist = this.owner.board.cell.filter(function(cell){ return cell.isBlack();});
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
	//---------------------------------------------------------------------------
	checkAllArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(cell){ return true;}, evalfunc);},
	checkAllBlock : function(cinfo, func, evalfunc){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var clist = cinfo.room[id].clist, d = clist.getRectSize();
			var a = clist.filter(function(cell){ return func(cell);}).length;

			var bd = this.owner.board;
			var cell = (bd.rooms.hastop ? bd.rooms.getTopOfRoom(id) : clist.getQnumCell());
			var n = (!cell.isnull?cell.getQnum():-1);

			if( !evalfunc(d.cols, d.rows, a, n) ){
				if(this.checkOnly){ return false;}
				clist.seterr(this.owner.pid!="tateyoko"?1:4);
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
	checkNoNumber        : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a!=0);} );},
	checkDoubleNumber    : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a< 2);} );},

	//---------------------------------------------------------------------------
	// ans.checkBlackCellCount() 領域内の数字と黒マスの数が等しいか判定する
	// ans.checkNoBlackCellInArea()  部屋に黒マスがあるか判定する
	//---------------------------------------------------------------------------
	checkBlackCellCount    : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isBlack();}, function(w,h,a,n){ return (n<0 || n===a);});},
	checkNoBlackCellInArea : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isBlack();}, function(w,h,a,n){ return (a>0);}         );},

	//---------------------------------------------------------------------------
	// ans.checkLinesInArea()  領域の中で線が通っているセルの数を判定する
	//---------------------------------------------------------------------------
	checkLinesInArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(cell){ return cell.lcnt()>0;}, evalfunc);},

	//---------------------------------------------------------------------------
	// ans.checkNoMovedObjectInRoom() 領域に移動後のオブジェクトがないと判定する
	//---------------------------------------------------------------------------
	checkNoMovedObjectInRoom : function(cinfo, getvalue){ return this.checkAllBlock(cinfo, function(cell){ return cell.base.qnum!==-1;}, function(w,h,a,n){ return (a!=0);});},

	//---------------------------------------------------------------------------
	// ans.checkDisconnectLine() 数字などに繋がっていない線の判定を行う
	// ans.checkDoubleObject()   数字が線で2つ以上繋がっていないように判定を行う
	// ans.checkTripleObject()   数字が線で3つ以上繋がっていないように判定を行う
	// ans.checkConnectObjectCount() 上記関数の共通処理
	//---------------------------------------------------------------------------
	checkDisconnectLine : function(linfo){ return this.checkConnectObjectCount(linfo, function(a){ return(a>0)});},
	checkDoubleObject   : function(linfo){ return this.checkConnectObjectCount(linfo, function(a){ return(a<2);});},
	checkTripleObject   : function(linfo){ return this.checkConnectObjectCount(linfo, function(a){ return(a<3);});},
	checkConnectObjectCount : function(linfo, evalfunc){
		var result = true;
		for(var id=1;id<=linfo.max;id++){
			var count = linfo.room[id].clist.filter(function(cell){ return cell.isNum(cell);}).length;
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
				var s=sides[r][i], a1=getval(rinfo.room[r]), a2=getval(rinfo.room[s]);
				if(a1>0 && a2>0 && a1==a2){
					rinfo.room[r].clist.seterr(1);
					rinfo.room[s].clist.seterr(1);
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
					rinfo.getclistbycell(cell1).seterr(1);
					rinfo.getclistbycell(cell2).seterr(1);
				}
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkSameObjectInRoom()  部屋の中のgetvalueの値が1種類であるか判定する
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

				rinfo.getclistbycell(bd.cell[c]).seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkDifferentNumberInRoom : function(rinfo, numfunc){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.room[r].clist;
			if(!this.isDifferentNumberInClist(clist, numfunc)){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	},
	isDifferentNumberInClist : function(clist, numfunc){
		var result = true, d = [], num = [];
		var max = clist[0].nummaxfunc(), bottom = clist[0].numminfunc();
		for(var n=bottom;n<=max;n++){ d[n]=0;}
		for(var i=0;i<clist.length;i++){ num[clist[i].id] = numfunc(clist[i]);}

		for(var i=0;i<clist.length;i++){ if(num[clist[i].id]>=bottom){ d[num[clist[i].id]]++;} }
		for(var i=0;i<clist.length;i++){
			if(num[clist[i].id]>=bottom && d[num[clist[i].id]]>=2){ clist[i].seterr(1); result = false;}
		}
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
		var result = true, bd = this.owner.board;
		for(var by=1;by<=bd.maxby;by+=2){
			for(var bx=1;bx<=bd.maxbx;bx+=2){
				for(var tx=bx;tx<=bd.maxbx;tx+=2){ if(termfunc(bd.getc(tx,by))){ break;}}
				if(tx>bx && !evalfunc.call(this, [bx-2,by,k.RT], bd.cellinside(bx,by,tx-2,by))){
					if(!multierr || this.checkOnly){ return false;}
					result = false;
				}
				bx = tx; /* 次のループはbx=tx+2 */
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			for(var by=1;by<=bd.maxby;by+=2){
				for(var ty=by;ty<=bd.maxby;ty+=2){ if(termfunc(bd.getc(bx,ty))){ break;}}
				if(ty>by && !evalfunc.call(this, [bx,by-2,k.DN], bd.cellinside(bx,by,bx,ty-2))){
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
	checkBorderCount : function(val, bp){
		var result=true, bd=this.owner.board, mm=(bd.iscross===1?2:0);
		for(var by=mm;by<=bd.maxby-mm;by+=2){
			for(var bx=mm;bx<=bd.maxbx-mm;bx+=2){
				var id = (bx>>1)+(by>>1)*(bd.qcols+1);
				var lcnts = bd.rooms.crosscnt[id];
				if(lcnts==val && (bp===0 || (bp==1&&bd.getx(bx,by).getQnum()===1) || (bp===2&&bd.getx(bx,by).getQnum()!==1) )){
					if(this.checkOnly){ return false;}
					if(result){ bd.border.seterr(-1);}
					(new this.owner.Address(bx,by)).setCrossBorderError();
					result = false;
				}
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
			if(cell.lcnt()>=2 && cell.isNum()){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setCellLineError(true);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkErrorFlag_cell()  RoomInfoに付加されたエラー情報を調べます
	//---------------------------------------------------------------------------
	checkErrorFlag_cell : function(rinfo, val){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			if(rinfo.room[r].error!==val){ continue;}

			if(this.checkOnly){ return false;}
			rinfo.room[r].clist.seterr(1);
			result = false;
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkErrorFlag_line()  LineInfoに付加されたエラー情報を調べます
	// ans.getErrorFlag_line()    丸などで区切られた線を探索してエラー情報を付加します
	// ans.serachErrorFlag_line() 丸などで区切られた線を探索します
	// ans.isErrorFlag_line()     探索結果からエラー情報を付加します
	//---------------------------------------------------------------------------
	checkErrorFlag_line : function(xinfo, val){
		var result = true;
		for(var id=1;id<=xinfo.max;id++){
			if(xinfo.room[id].error!==val){ continue;}

			if(this.checkOnly){ return false;}
			var cells = xinfo.room[id].cells;
			if(!!cells[0] && cells[0]!==null){ cells[0].seterr(1);}
			if(!!cells[1] && cells[1]!==null){ cells[1].seterr(1);}
			if(result){ this.owner.board.border.seterr(-1);}
			xinfo.room[id].blist.seterr(1);
			result = false;
		}
		return result;
	},

	// 丸の場所で線を切り離して考える
	getErrorFlag_line : function(){
		var bd = this.owner.board, xinfo = new this.owner.LineInfo();
		for(var id=0;id<bd.bdmax;id++){ xinfo.id[id]=(bd.border[id].isLine()?0:null);}

		var clist = bd.cell.filter(function(cell){ return cell.isNum();});
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var dir4bd = [cell.ub(),cell.db(),cell.lb(),cell.rb()];
			for(var a=0;a<4;a++){
				var firstbd = dir4bd[a];
				if(firstbd.isnull){ continue;}

				// dir1 スタート地点で線が出発した方向 dir2 到達地点から見た、到達した線の方向
				xinfo.max++;
				xinfo.room[xinfo.max] = {blist:(new this.owner.BorderList()),error:0,
										 cells:[cell,null],ccnt:0,length:[],dir1:(a+1),dir2:0};

				this.searchErrorFlag_line(xinfo,xinfo.max);
				if(xinfo.room[xinfo.max].blist.length===0){ continue;}

				this.isErrorFlag_line(xinfo);
			}
		}
		return xinfo;
	},
	searchErrorFlag_line : function(xinfo,areaid){
		var room = xinfo.room[areaid], dir=room.dir1;
		var pos = room.cells[0].getaddr();
		while(1){
			pos.movedir(dir,1);
			if(pos.oncell()){
				var cell = pos.getc();
				if(cell.isnull || cell.isNum()){ break;}
				else if(cell.iscrossing() && cell.lcnt()>=3){ }
				else if(dir!==1 && cell.db().isLine()){ if(dir!==2){ room.ccnt++;} dir=2;}
				else if(dir!==2 && cell.ub().isLine()){ if(dir!==1){ room.ccnt++;} dir=1;}
				else if(dir!==3 && cell.rb().isLine()){ if(dir!==4){ room.ccnt++;} dir=4;}
				else if(dir!==4 && cell.lb().isLine()){ if(dir!==3){ room.ccnt++;} dir=3;}
			}
			else{
				var border = pos.getb();
				if(border.isnull||xinfo.getRoomID(border)!==0){ break;}

				xinfo.setRoomID(border,areaid);
				if(isNaN(room.length[room.ccnt])){ room.length[room.ccnt]=0;}else{ room.length[room.ccnt]++;}
			}
		}
		room.cells[1]=pos.getc();
		room.dir2=[0,2,1,4,3][dir];
	},
	isErrorFlag_line : function(xinfo){ }
});

//---------------------------------------------------------------------------
// ★FailCodeクラス 答えの文字列を扱う
//---------------------------------------------------------------------------
// FailCodeクラス
pzpr.createPuzzleClass('FailCode',
{
	getStr : function(code){
		if(!code){ code='complete';}
		var lang = (this.owner.get('language')==='ja' ? 0 : 1);
		return this[code][lang];
	},

	complete : ["正解です！","Complete!"],

	/* ** 黒マス ** */
	bc2x2       : ["2x2の黒マスのかたまりがあります。","There is a 2x2 block of black cells."],
	bcNotSquare : ["正方形でない黒マスのカタマリがあります。","A mass of black cells is not regular rectangle."],
	bcAdjacent  : ["黒マスがタテヨコに連続しています。","Black cells are adjacent."],
	bcDivide    : ["黒マスが分断されています。","Black cells are devided,"],
	wcDivide    : ["白マスが分断されています。","White cells are devided."],
	wcDivideRB  : ["白マスが分断されています。","White cells are devided."], /* 連黒分断禁 */

	/* ** 領域＋数字 ** */
	bkNoNum  : ["数字のないブロックがあります。","A block has no number."],
	bkNumGe2 : ["1つのブロックに2つ以上の数字が入っています。","A block has plural numbers."],
	bkDupNum : ["同じブロックに同じ数字が入っています。","There are same numbers in a block."],
	bkPlNum  : ["複数種類の数字が入っているブロックがあります。","A block has two or more kinds of numbers."],
	bkSepNum : ["同じ数字が異なるブロックに入っています。","One kind of numbers is included in dirrerent blocks."],
	
	bkSizeNe : ["数字とブロックの大きさが違います。","The size of the block is not equal to the number."],
	bkSizeLt : ["ブロックの大きさより数字のほうが大きいです。","A number is bigger than the size of block."],
	bkSizeGt : ["ブロックの大きさよりも数字が小さいです。","A number is smaller than the size of block."],
	
	bkBcellNe  : ["部屋の数字と黒マスの数が一致していません。","The number of Black cells in the room and The number written in the room is different."],
	bkBcDivide : ["1つの部屋に入る黒マスが2つ以上に分裂しています。","Black cells are devided in one room."],
	bkNoBcell  : ["黒マスがない部屋があります。","A room has no black cell."],
	bkMixed    : ["白マスと黒マスの混在したタイルがあります。","A tile includes both black and white cells."],
	
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
	lnOnBcell : ["黒マスの上に線が引かれています。","There is a line on the black cell."],

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
	
	anBcellNe : ["矢印の方向にある黒マスの数が正しくありません。","The number of black cells are not correct."],

	/* ** 数字系 ** */
	nmSameNum : ["同じ数字がタテヨコに連続しています。","Same numbers are adjacent."],
	nmAround : ["同じ数字がタテヨコナナメに隣接しています。","Same numbers are adjacent."],
	nmDupRow : ["同じ列に同じ数字が入っています。","There are same numbers in a row."],
	nmDivide : ["タテヨコにつながっていない数字があります。","Numbers are devided."],

	invalid : ["不明なエラーです","Invalid Error"]
});

})();
