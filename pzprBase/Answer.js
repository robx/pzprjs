// Answer.js v3.4.0
(function(){

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
pzprv3.createPuzzleClass('AnsCheck',
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
		var failcode = 0;
		this.inCheck = true;
		
		if(activemode){
			this.checkOnly = false;
			failcode = this.checkAns();
		}
		else{
			this.checkOnly = true;
			failcode = (this.autocheck1st() || this.checkAns());
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
			if(bd.lines.isCenterLine && !this.checkLcntCell(1)){ return 40101;}
			if(bd.lines.borderAsLine && !this.checkLcntCross(1,0)){ return 40101;}
		}
		
		var failcode = this.check1st();
		if(failcode!==0){ return failcode;}
		return 0;
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
	// ans.checkLcntCell() セルから出ている線の本数について判定する
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkOneArea : function(cinfo){
		var bd = this.owner.board;
		if(cinfo.max>1){
			cinfo.getclist(1).seterr(1);
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
			xinfo.getblist(1).seterr(1);
			return false;
		}
		return true;
	},

	checkLcntCell : function(val){
		var result = true, bd = this.owner.board;
		if(bd.lines.ltotal[val]==0){ return true;}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.lcnt()==val){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setCellLineError(true);
				result = false;
			}
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
			var errclist = this.owner.newInstance('CellList');
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
			var clist = cinfo.getclist(id), d = clist.getRectSize();
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
			var count = linfo.getclist(id).filter(function(cell){ return cell.isNum(cell);}).length;
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
		var sides = this.owner.board.getSideAreaInfo(rinfo);
		for(var r=1;r<=rinfo.max-1;r++){
			for(var i=0;i<sides[r].length;i++){
				var s=sides[r][i], a1=getval(rinfo,r), a2=getval(rinfo,s);
				if(a1>0 && a2>0 && a1==a2){
					rinfo.getclist(r).seterr(1);
					rinfo.getclist(s).seterr(1);
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
			var clist = rinfo.getclist(r);
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
	// ans.checkLcntCross()  ある交点との周り四方向の境界線の数を判定する(bp==1:黒点が打たれている場合)
	//---------------------------------------------------------------------------
	checkLcntCross : function(val, bp){
		var result=true, bd=this.owner.board, mm=(bd.iscross===1?2:0);
		for(var by=mm;by<=bd.maxby-mm;by+=2){
			for(var bx=mm;bx<=bd.maxbx-mm;bx+=2){
				var id = (bx>>1)+(by>>1)*(bd.qcols+1);
				var lcnts = (bd.lines.borderAsLine?bd.lines.lcnt[id]:bd.rooms.crosscnt[id]);
				if(lcnts==val && (bp===0 || (bp==1&&bd.getx(bx,by).getQnum()===1) || (bp===2&&bd.getx(bx,by).getQnum()!==1) )){
					if(this.checkOnly){ return false;}
					if(result){ bd.border.seterr(-1);}
					bd.setCrossBorderError(bx,by);
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
			rinfo.getclist(r).seterr(1);
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
			xinfo.getblist(id).seterr(1);
			result = false;
		}
		return result;
	},

	// 丸の場所で線を切り離して考える
	getErrorFlag_line : function(){
		var bd = this.owner.board, xinfo = this.owner.newInstance('LineInfo');
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
				xinfo.room[xinfo.max] = {idlist:[],error:0,cells:[cell,null],ccnt:0,length:[],dir1:(a+1),dir2:0};

				this.searchErrorFlag_line(xinfo,xinfo.max);
				if(xinfo.getblist(xinfo.max).length===0){ continue;}

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

pzprv3.addFailCode({
	0     : ["正解です！","Complete!"],

	10001 : ["2x2の黒マスのかたまりがあります。","There is a 2x2 block of black cells."],
	10002 : ["2x2の白マスのかたまりがあります。","There is a 2x2 block of white cells."],
	10003 : ["数字が2x2のかたまりになっています。","There is a 2x2 block of numbers."],

	10030 : ["１マスだけの黒マスのカタマリがあります。","There is a single black cell."],
	10031 : ["２マスより大きい黒マスのカタマリがあります。","The size of a mass of black cells is over two."],
	10004 : ["「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。","there is a mass of black cells, whose width is more than two."],
	10032 : ["「幅１マス、長さ１～４マス」ではないタタミがあります。","The width of Tatami is over 1 or the length is over 4."],
	10033 : ["長さが１マスのタタミがあります。","The length of the tatami is one."],
	
	10005 : ["黒マスが分断されています。","Black cells are devided,"],
	10006 : ["通路が分断されています。","Aisle is divided."],
	10007 : ["白マスが分断されています。","White cells are devided."],
	10020 : ["白マスが分断されています。","White cells are devided."], /* 連黒分断禁 */
	10008 : ["孤立した白マスのブロックがあります。","White cells are devided."],
	10009 : ["タテヨコにつながっていない数字があります。","Numbers are devided."],
	10010 : ["タテヨコにつながっていない記号があります。","Marks are devided."],
	
	10015 : ["同じ面積の黒マスのカタマリが、角を共有しています。","Masses of black cells whose length is the same share a corner."],
	10016 : ["正方形でない黒マスのカタマリがあります。","A mass of black cells is not regular rectangle."],
	10018 : ["数字のまわりにある黒マスの数が間違っています。","The number of black cells around a number on crossing is big."],
	10019 : ["数字のまわりにある黒マスの数が間違っています。","The number of black cells around a number on crossing is small."],
	10021 : ["黒マスがタテヨコに連続しています。","Black cells are adjacent."],
	10022 : ["数字とそれに接する黒マスの大きさの合計が一致しません。","Sum of the adjacent masses of black cells is not equal to the number."],
	10023 : ["数字のない□に黒マスが接していません。","No black cells are adjacent to square mark without numbers."],
	10024 : ["数字の周りに入っている黒マスの数が違います。","The number of black cells around a number is not correct."],
	
	10027 : ["数字の上下左右にある黒マスの数が間違っています。","The number is not equal to the number of black cells in four adjacent cells."],
	10039 : ["数字のまわりにある照明の数が間違っています。","The number is not equal to the number of Akari around it."],
	10025 : ["数字およびその上下左右にある黒マスの数が間違っています。","the number is not equal to the number of black cells in the cell and four adjacent cells."],
	10026 : ["隣り合う黒マスの個数の合計が数字と違います。","The number is not equal to sum of adjacent masses of black cells."],
	10040 : ["数字のまわりにある黒い三角形の数が間違っています。","The number of triangles in four adjacent cells is bigger than it."],
	10041 : ["数字のまわりにある黒い三角形の数が間違っています。","The number of triangles in four adjacent cells is smaller than it."],
	10042 : ["柱のまわりにある枕の数が間違っています。", "The number of pillows around the number is wrong."],
	10043 : ["柱のまわりにある枕の数が間違っています。", "The number of pillows around the number is wrong."],
	
	10028 : ["矢印の方向にある黒マスの数が正しくありません。","The number of black cells are not correct."],
	10029 : ["数字の下か右にある黒マスの数が間違っています。","The number of black cells underward or rightward is not correct."],
	10034 : ["数字の下か右にあるまっすぐのブロックの数が間違っています。","The number of straight blocks underward or rightward is not correct."],
	10036 : ["数字の下か右にある数字の合計が間違っています。","The sum of the cells is not correct."],
	10035 : ["同じ数字が同じ列に入っています。","Same number is in the same row."],
	10037 : ["同じ列に同じ数字が入っています。","There are same numbers in a row."],
	10038 : ["同じ列に同じ数字が入っています。","There are same numbers in a row."],

	19101 : ["線が三角形を通過していません。","A line doesn't goes through a triangle."],
	19111 : ["三角形の数字とそこから延びる線の長さが一致していません。","A number on triangle is not equal to sum of the length of lines from it."],
	19121 : ["三角形の数字とそこから延びる線の長さが一致していません。","A number on triangle is not equal to sum of the length of lines from it."],

	19001 : ["同じ大きさの黒マスのカタマリの間に他の黒マスのカタマリがありません。","A mass of black cells can looks other same size mass of black cells."],

	10017 : ["ブロックが四角形になっています。","A block is rectangle."],
	10012 : ["四角形でない白マスのブロックがあります。","There is a block of white cells that is not rectangle."],
	10013 : ["四角形になっている黒マスのブロックがあります。","There is a block of black cells that is rectangle."],
	10011 : ["黒マスのカタマリが正方形か長方形ではありません。","A mass of black cells is not rectangle."],
	20010 : ["四角形ではない部屋があります。","There is a room whose shape is not square."],
	20011 : ["四角形ではない領域があります。","An area is not rectangle."],
	20012 : ["タタミの形が長方形ではありません。","A tatami is not rectangle."],
	20013 : ["曲がっている線があります。","A line has curve."],

	29101 : ["輪の内側に入っていない数字があります。","There is an outside number."],
	29111 : ["数字と輪の内側になる4方向のマスの合計が違います。","the number and the sum of the inside cells of four direction is different."],

	30001 : ["幅が１マスではないタタミがあります。","The width of the tatami is not one."],
	30039 : ["ブロックが幅1のL字型になっていません。","A block is not L-shape or whose width is not one."],
	
	10014 : ["数字の入っていないシマがあります。","An area of white cells has no numbers."],
	30002 : ["数字のないブロックがあります。","A block has no number."],
	30003 : ["数字の入っていない部屋があります。","A room has no numbers."],
	30004 : ["数字の入っていない領域があります。","An area has no numbers."],
	31007 : ["数字が含まれていないブロックがあります。","A block has no number."],
	30005 : ["数字の入っていないタタミがあります。","A tatami has no numbers."],
	30006 : ["記号の入っていないタタミがあります。","A tatami has no marks."],
	30007 : ["白丸も黒丸も含まれない領域があります。","An area has no marks."],
	30008 : ["ヤギもオオカミもいない領域があります。","An area has neither sheeps nor wolves."],
	30025 : ["○のない部屋があります。","A room has no circle."],
	31012 : ["斜線の引かれていない部屋があります。", "A room has no mirrors."],
	31017 : ["国に矢印が入っていません。","A country has no arrow."],
	
	30009 : ["1つのシマに2つ以上の数字が入っています。","An area of white cells has plural numbers."],
	30010 : ["1つのブロックに2つ以上の数字が入っています。","A block has plural numbers."],
	30011 : ["1つの部屋に2つ以上の数字が入っています。","A room has plural numbers."],
	30012 : ["1つの領域に2つ以上の数字が入っています。","An area has plural numbers."],
	30013 : ["1つのタタミに2つ以上の数字が入っています。","A tatami has plural numbers."],
	30014 : ["1つのタタミに2つ以上の記号が入っています。","A tatami has plural marks."],
	30018 : ["1つの棒に2つ以上の数字が入っています。","A line passes plural numbers."],
	31011 : ["斜線が複数引かれた部屋があります。", "A room has plural mirrors."],
	31015 : ["1つの領域に2つ以上の同じ矢印が入っています。","An area has plural same arrows."],
	31016 : ["1つの国に2つ以上の矢印が入っています。","A country has plural arrows."],

	30031 : ["１つのブロックに異なるアルファベットが入っています。","A block has plural kinds of letters."],
	31004 : ["複数種類の数字が入っているブロックがあります。","A block has two or more kinds of numbers."],
	
	30015 : ["アルファベットが繋がっています。","There are connected letters."],
	30016 : ["○が繋がっています。","There are connected circles."],
	30017 : ["具材が繋がっています。","There are connected fillings."],
	
	30019 : ["数字とシマの面積が違います。","The number is not equal to the number of the size of the area."],
	30020 : ["数字とブロックの大きさが違います。","The size of the block is not equal to the number."],
	30022 : ["数字とブロックの大きさが違います。","The size of the block is not equal to the number."],
	30021 : ["数字と領域の大きさが違います。","The size of the area is not equal to the number."],
	31008 : ["数字と部屋の大きさが違います。","The size of the room is not equal to the number."],
	30024 : ["数字と棒の長さが違います。","The number is different from the length of line."],
	30023 : ["数字とタタミの大きさが違います。","The size of tatami and the number written in Tatami is different."],
	30034 : ["数字とタタミの大きさが同じです。","The size of tatami and the number is the same."],
	
	30026 : ["白丸と黒丸が両方含まれる領域があります。","An area has both white and black circles."],
	30027 : ["ヤギとオオカミが両方いる領域があります。","An area has both sheeps and wolves."],
	30028 : ["１つのブロックに異なる数字が入っています。","A block has dirrerent numbers."],
	30029 : ["異なる数字がつながっています。","Different numbers are connected."],
	30030 : ["白マスと黒マスの混在したタイルがあります。","A tile includes both black and white cells."],
	31003 : ["数字のあるなしが混在した部屋があります。","A room includes both numbered and non-numbered cells."],
	
	30032 : ["1つの部屋に入る黒マスが2つ以上に分裂しています。","Black cells are devided in one room."],
	30033 : ["1つの海域に入る国が2つ以上に分裂しています。","Countries in one marine area are devided to plural ones."],
	
	31001 : ["サイズが3マスより小さいブロックがあります。","The size of block is smaller than three."],
	30035 : ["サイズが4マスより小さいブロックがあります。","The size of block is smaller than four."],
	30036 : ["サイズが5マスより小さいブロックがあります。","The size of block is smaller than five."],
	31002 : ["サイズが3マスより大きいブロックがあります。","The size of block is larger than three."],
	30037 : ["サイズが4マスより大きいブロックがあります。","The size of block is larger than four."],
	30038 : ["サイズが5マスより大きいブロックがあります。","The size of block is larger than five."],
	31009 : ["大きさが５ではない蛇がいます。","The size of a snake is not five."],
	31005 : ["ブロックの大きさより数字のほうが大きいです。","A number is bigger than the size of block."],
	31006 : ["ブロックの大きさよりも数字が小さいです。","A number is smaller than the size of block."],

	30041 : ["黒マスがない部屋があります。","A room has no black cell."],
	30042 : ["黒マスのカタマリがない海域があります。","A marine area has no black cells."],
	30051 : ["１マスしか黒マスがない部屋があります。","A room has only one black cell."],
	30061 : ["２マス以上の黒マスがある部屋が存在します。","A room has three or mode black cells."],
	30071 : ["黒マスのカタマリが４マス未満の部屋があります。","A room has three or less black cells."],
	30081 : ["５マス以上の黒マスがある部屋が存在します。", "A room has five or more black cells."],
	30091 : ["部屋の数字と黒マスの数が一致していません。","the number of Black cells in the room and The number written in the room is different."],
	30092 : ["数字のある領域と、領域の中にある黒マスの数が違います。","the number of Black cells in the area and the number written in the area is different."],
	30093 : ["海域内の数字と国のマス数が一致していません。","the number of black cells is not equals to the number."],
	31013 : ["1つのハコに4つ以上の記号が入っています。","A box has four or more marks."],
	31014 : ["1つのハコに2つ以下の記号しか入っていません。","A box has tow or less marks."],

	30301 : ["数字のある国と線が通過するマスの数が違います。","the number of the cells that is passed any line in the country and the number written in the country is diffrerent."],
	30311 : ["線の通っていない国があります。","there is a country that is not passed any line."],
	30321 : ["すべてのアイスバーンを通っていません。", "A icebarn is not gone through."],
	30331 : ["数字のある部屋と線が通過するマスの数が違います。","the number of the cells that is passed any line in the room and the number written in the room is diffrerent."],
	30341 : ["数字のある部屋と線が通過するマスの数が違います。","the number of the cells that is passed any line in the room and the number written in the room is diffrerent."],
	
	30401 : ["同じアルファベットが異なるブロックに入っています。","Same kinds of letters are placed different blocks."],
	30402 : ["同じ数字が異なるブロックに入っています。","One kind of numbers is included in dirrerent blocks."],
	30411 : ["アルファベットのないブロックがあります。","A block has no letters."],
	30421 : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	30422 : ["同じブロックに同じ数字が入っています。","There are same numbers in a block."],
	30423 : ["1つのハコに同じ記号が複数入っています。","A box has same plural marks."],
	31010 : ["同じ数字が入っています。","A Snake has same plural marks."],
	
	30501 : ["○が点対称に配置されていません。", "Position of circles is not point symmetric."],
	30511 : ["部屋の中の○が点対称に配置されていません。", "Position of circles in the room is not point symmetric."],
	
	/* 隣接するブロックにある隣接するセルのチェック */
	30101 : ["異なる海域にある国どうしが辺を共有しています。","Countries in other marine area share the side over border line."],
	30111 : ["同じ数字が境界線を挟んで隣り合っています。","Adjacent blocks have the same number."],
	30121 : ["線が通らないマスが、太線をはさんでタテヨコにとなりあっています。","the cells that is not passed any line are adjacent over border line."],
	
	/* 隣接するブロックのチェック */
	30201 : ["同じ数字のブロックが辺を共有しています。","Adjacent blocks have the same number."],
	30211 : ["隣り合う海域にある国の大きさが同じです。","the size of countries that there are in adjacent marine areas are the same."],
	30221 : ["隣り合うタタミの大きさが同じです。","the same size Tatami are adjacent."],
	30231 : ["別々の蛇が接しています。","Other snakes are adjacent."],

	/* 盤面切り分け系 */
	32101 : ["途中で途切れている線があります。","there is a dead-end line."],
	32201 : ["分岐している線があります。","there is a branch line."],
	32301 : ["十字の交差点があります。","There is a crossing border line."],
	32401 : ["数字の周りにある境界線の本数が違います。","The number is not equal to the number of border lines around it."],
	32501 : ["黒点以外のところで線が分岐しています。","Lines are branched out of the black point."],
	32511 : ["黒点以外のところで線が交差しています。","Lines are crossed out of the black point."],
	32521 : ["黒点以外のところで線が曲がっています。","A line curves out of the black points."],
	32601 : ["黒点上で線が交差しています。","There is a crossing line on the black point."],
	32611 : ["黒点から線が３本以上出ていません。","A black point has two or less lines."],
	32621 : ["黒点上を線が通過していません。","A black point has no line."],
	32701 : ["外枠につながっていない線があります。","A line doesn't connect to the chassis."],

	33101 : ["正方形でないタタミがあります。","A tatami is not regular rectangle."],
	33111 : ["横長ではないタタミがあります。","A tatami is not horizontally long rectangle."],
	33121 : ["縦長ではないタタミがあります。","A tatami is not vertically long rectangle."],
	33201 : ["矢印の方向にあるタタミの数が正しくありません。","The number of tatamis are not correct."],

	39001 : ["線が１つの国を２回以上通っています。","A line passes a country twice or more."],
	39101 : ["タイルと周囲の線が引かれない点線の長さが異なります。","the size of the tile is not equal to the total of length of lines that is remained dotted around the tile."],
	39401 : ["ブロックが1つの点線からなる領域で構成されています。","A block has one area framed by dotted line."],
	39411 : ["同じ形のブロックが接しています。","The blocks that has the same shape are adjacent."],
	39421 : ["ブロックが3つ以上の点線からなる領域で構成されています。","A block has three or more areas framed by dotted line."],
	39501 : ["矢印がブロックの端にありません。","An arrow is not at the edge of the block."],
	39511 : ["矢印の先にブロックの角がありません。","An arrow doesn't indicate the corner of a block."],
	39521 : ["白丸がブロックの角にありません。","A circle is out of the corner."],

	/* 線を引く系 */
	40101 : ["途中で途切れている線があります。","there is a dead-end line."],
	40111 : ["途中で途切れている線があります。","there is a dead-end segment."],
	40201 : ["分岐している線があります。","there is a branch line."],
	40211 : ["分岐している線があります。","there is a branched segment."],
	40301 : ["線が交差しています。","there is a crossing line."],
	40401 : ["十字以外の場所で線が交差しています。","there is a crossing line out of cross mark."],
	40411 : ["十字の場所で線が交差していません。","there isn't a crossing line on a cross mark."],
	40421 : ["┼のマスから線が4本出ていません。","A cross-joint cell doesn't have four-way lines."],
	40501 : ["氷の部分以外で線が交差しています。","A Line is crossed outside of ice."],
	40502 : ["○の部分以外で線が交差しています。","there is a crossing line out of circles."],
	40601 : ["氷の部分で線が曲がっています。","A Line curve on ice."],
	40602 : ["○の部分で線が曲がっています。","A line curves on circles."],

	41101 : ["輪っかが一つではありません。","there are plural loops."],
	41102 : ["線がひとつながりではありません。","Lines are not countinuous."],
	41111 : ["輪っかが一つではありません。","there are plural loops."],

	42101 : ["線が引かれていません。","there is no line on the board."],
	42111 : ["線が存在していません。","there is no segment."],

	43101 : ["アルファベットの上を線が通過しています。","A line goes through a letter."],
	43102 : ["○の上を線が通過しています。","A line goes through a circle."],
	43103 : ["数字の上を線が通過しています。","A line goes through a number."],
	43104 : ["具材の上を線が通過しています。","A line goes through a filling."],
	43201 : ["アルファベットにつながっていない線があります。","A line doesn't connect any letter."],
	43202 : ["○につながっていない線があります。","A line doesn't connect any circle."],
	43203 : ["数字につながっていない線があります。","A line doesn't connect any number."],
	43204 : ["具材につながっていない線があります。","A line doesn't connect any filling."],
	43302 : ["3つ以上の○が繋がっています。","Three or more objects are connected."],
	43303 : ["3つ以上の数字がつながっています。","Three or more numbers are connected."],
	43401 : ["線が途中で途切れています。", "There is a dead-end line."],
	43502 : ["どこにもつながっていない○があります。","A circle is not connected another object."],
	43503 : ["どこにもつながっていない数字があります。","A number is not connected another number."],
	43505 : ["○から線が出ていません。","A circle doesn't start any line."],
	43511 : ["白丸に線がつながっていません。","No bar connects to a white circle."],
	43601 : ["線が全体で一つながりになっていません。", "All lines and numbers are not connected each other."],
	43611 : ["棒が１つに繋がっていません。","Bars are devided."],

	49101 : ["数字の周りにある線の本数が違います。","the number is not equal to the number of lines around it."],
	49201 : ["線が上を通っていない丸があります。","Lines don't pass some pearls."],
	49211 : ["白丸の上で線が曲がっています。","Lines curve on white pearl."],
	49221 : ["白丸の隣で線が曲がっていません。","Lines go straight next to white pearl on each side."],
	49231 : ["黒丸の上で線が直進しています。","Lines go straight on black pearl."],
	49241 : ["黒丸の隣で線が曲がっています。","Lines curve next to black pearl."],
	49301 : ["線が２回以上通過している旗門があります。","A line goes through a gate twice or more."],
	49311 : ["○から線が２本出ていません。","A line goes through a gate twice or more."],
	49321 : ["旗門を通過する順番が間違っています。","the order of passing the gate is wrong."],
	49331 : ["線が通過していない旗門があります。","there is a gate that the line is not passing."],
	49341 : ["○の部分で線が交差しています。","the lines are crossed on the number."],
	49401 : ["スタート位置を特定できませんでした。","the system can't detect start position."],
	49411 : ["INに線が通っていません。","the line doesn't go through the 'IN' arrow."],
	49421 : ["途中で途切れている線があります。","there is a dead-end line."],
	49431 : ["盤面の外に出てしまった線があります","A line is not reached out the 'OUT' arrow."],
	49441 : ["矢印を逆に通っています。","A line goes through an arrow reverse."],
	49451 : ["数字の通過順が間違っています。","A line goes through an arrow reverse."],
	49461 : ["線が通っていない矢印があります。","A line doesn't go through some arrows."],
	49471 : ["通過していない数字があります。","the line doesn't pass all of the number."],
	49501 : ["長方形か正方形でない輪っかがあります。","there is a non-rectangle loop."],
	49601 : ["異なる数字を含んだループがあります。","A loop has plural kinds of number."],
	49611 : ["同じ数字が異なるループに含まれています。","A kind of numbers are in differernt loops."],
	49621 : ["○を含んでいないループがあります。","A loop has no numbers."],
	49701 : ["線が丸のないところから出ています。","A segment comes from out of circle."],
	49711 : ["線が丸を通過しています。","A segment passes over a circle."],
	49721 : ["線が同一直線上で重なっています。","Plural segments are overlapped."],
	49731 : ["異なる文字が直接繋がっています。","Different Letters are connected directly."],
	49741 : ["線が直角に交差していません。","Segments don't intersect at a right angle."],
	49751 : ["線が2本出ていない丸があります。","A circle doesn't have two segments."],
	49761 : ["同じ文字がひとつながりになっていません。","Same Letters are not consequent."],
	49801 : ["数字につながる橋の数が違います。","The number of connecting bridges to a number is not correct."],
	49811 : ["数字につながる橋の数が違います。","The number of connecting bridges to a number is not correct."],
	49901 : ["ホタルから線が出ていません。", "There is a lonely firefly."],
	49911 : ["黒点同士が線で繋がっています。","Black points are connected each other."],
	49921 : ["白丸の、黒点でない部分どうしがくっついています。","Fireflies are connected without a line starting from black point."],
	49931 : ["線の曲がった回数が数字と違っています。","The number of curves is different from a firefly's number."],
	48001 : ["白丸同士が繋がっています。","Two white circles are connected."],
	48011 : ["黒丸同士が繋がっています。","Two black circles are connected."],
	48101 : ["○から出る線の本数が正しくありません。", "The number is not equal to the number of lines out of the circle."],
	48111 : ["同じ数字同士が線で繋がっています。", "Same numbers are connected each other."],
	48121 : ["線が2回以上曲がっています。", "The number of curves is twice or more."],
	48201 : ["丸がコの字型に繋がっていません。","The shape of a line is not correct."],
	48211 : ["繋がる丸が正しくありません。","The type of connected circle is wrong."],
	48221 : ["線が2回以上曲がっています。","A line turns twice or more."],
	48231 : ["線が2回曲がっていません。","A line turns only once or lower."],
	48241 : ["線の長さが同じではありません。","The length of lines is differnet."],
	48251 : ["線の長短の指示に反してます。","The length of lines is not suit for the label of object."],
	48301 : ["白丸に線が2本以上つながっています。","Prural lines connect to a white circle."],
	48311 : ["棒で輪っかができています。","There is a looped bars."],
	48321 : ["同じ長さの棒と交差していません。","A bar doesn't cross the bar whose length is the same."],

	/* 単体セルチェック */
	50101 : ["黒マスの上に線が引かれています。","theer is a line on the black cell."],
	50102 : ["黒マスの上に線が引かれています。","there is a line on the black cell."],
	50111 : ["黒マスも線も引かれていないマスがあります。","theer is an empty cell."],
	50121 : ["最初から引かれている線があるマスに線が足されています。","Lines are added to the cell that the mark lie in by the question."],
	50131 : ["斜線がないマスがあります。","There is an empty cell."],
	50141 : ["何も入っていないマスがあります。","There is an empty cell."],
	50151 : ["線が引かれていないマスがあります。","there is an empty cell."],
	
	50161 : ["すべてのマスに数字が入っていません。","There is an empty cell."],
	50171 : ["数字の入っていないマスがあります。","There is an empty cell."],
	50181 : ["数字の入っていないマスがあります。","There is a cell that is not filled in number."],
	50191 : ["何も入っていないマスがあります。","There is an empty cell."],
	50201 : ["数字の入っていないマスがあります。","There is an empty cell."],
	50211 : ["布団でも黒マスでもないマスがあります。", "There is an empty cell."],

	50301 : ["通過していない白マスがあります。","the line doesn't pass all of the white cell."],
	50311 : ["白マスの上に線が引かれていません。","there is no line on the white cell."],

	50401 : ["数字と線の長さが違います。","The length of a line is wrong."],
	50411 : ["○から線が出ていません。","A circle doesn't start any line."],
	50421 : ["白丸から出る棒の長さが長いです。","The length of the bar is long."],
	50431 : ["白丸から出る棒の長さが短いです。","The length of the bar is short."],

	50501 : ["矢印の方向に境界線がありません。","There is no border in front of the arrowed number."],
	50511 : ["矢印の方向にある数字が正しくありません。","The number in the direction of the arrow is not correct."],

	/* 数字系 */
	60101 : ["同じ数字がタテヨコに連続しています。","Same numbers are adjacent."],
	60201 : ["同じ数字がタテヨコナナメに隣接しています。","Same numbers are adjacent."],
	60211 : ["同じ記号がタテヨコナナメに隣接しています。","Same marks are adjacent."],
	
	69101 : ["丸付き数字とその両側の数字の差が一致していません。", "The Difference between two Adjacent cells is not equal to the number on circle."],
	69111 : ["不等号と数字が矛盾しています。", "A inequality sign is not correct."],
	69201 : ["数字と、その数字の上下左右に入る数字の数が一致していません。","The number of numbers placed in four adjacent cells is not equal to the number."],
	69211 : ["数字と、他のマスにたどり着くまでのマスの数の合計が一致していません。","Sum of four-way gaps to another number is not equal to the number."],
	69301 : ["初めから出ている数字の周りに同じ数字が入っています。","There are same numbers around the pre-numbered cell."],
	69311 : ["初めから出ている数字の周りに入る数の合計が正しくありません。","A sum of numbers around the pre-numbered cell is incorrect."],
	69401 : ["数字とその隣の数字の差の合計が合っていません。", "Sum of the differences between the number and adjacent numbers is not equal to the number."],
	69501 : ["数字よりもその間隔が短いところがあります。","The gap of the same kind of number is smaller than the number."],
	69511 : ["同じ部屋で上に小さい数字が乗っています。","There is an small number on big number in a room."],
	69601 : ["ブロックの数字と数字の積が同じではありません。","A number of room is not equal to the product of these numbers."],
	69701 : ["入っている数字の数が数字より多いです。","A number is bigger than the size of block."],
	69711 : ["入っている数字の数が数字より少ないです。","A number is smaller than the size of block."],
	69801 : ["部屋に入る数字が正しくありません。","The numbers in the room are wrong."],
	69811 : ["数字の差がその間にある線の長さと等しくありません。","The differnece between two numbers is not equal to the length of the line between them."],
	69901 : ["２つの数字の差とその間隔が正しくありません。","The distance of the paired numbers is not equal to the diff of them."],

	/* ボックス */
	90001 : ["数字と黒マスになった数字の合計が正しくありません。","A number is not equal to the sum of the number of black cells."],
	/* たわむれんが */
	90011 : ["黒マスが横に3マス以上続いています。","three or more black cells continue horizonally."],
	90021 : ["黒マスの下に黒マスがありません。","there are no black cells under a black cell."],
	/* LITS */
	90031 : ["同じ形のテトロミノが接しています。","Some Tetrominos that are the same shape are Adjacent."],
	/* へやわけ・∀人∃ＨＥＹＡ */
	90101 : ["白マスが3部屋連続で続いています。","White cells are continued for three consecutive room."],
	90111 : ["部屋の中の黒マスが点対称に配置されていません。","Position of black cells in the room is not point symmetric."],
	/* ひとりにしてくれ */
	90201 : ["同じ列に同じ数字が入っています。","there are same numbers in a row."],
	/* 黒マスはどこだ */
	90301 : ["数字と黒マスにぶつかるまでの4方向のマスの合計が違います。","the number and the sum of the coutinuous white cells of four direction is different."],
	/* クロシュート */
	90401 : ["数字の数だけ離れたマスのうち、1マスだけ黒マスになっていません。","the number of black cells at aparted cell by the number is not one."],
	/* ごきげんななめ */
	90501 : ["斜線で輪っかができています。", "There is a loop consisted in some slashes."],
	90511 : ["数字に繋がる線の数が間違っています。", "A number is not equal to count of lines that is connected to it."],
	90521 : ["'切'が含まれた線が輪っかになっています。", "There is a loop that consists '切'."],
	90531 : ["'輪'が含まれた線が輪っかになっていません。", "There is not a loop that consists '輪'."],
	/* タテボーヨコボー */
	90601 : ["黒マスに繋がる線の数が正しくありません。","The number of lines connected to a black cell is wrong."],
	90611 : ["黒マスに繋がる線の数が正しくありません。","The number of lines connected to a black cell is wrong."],
	/* よせなべ */
	90701 : ["鍋の外に数字が書いてあります。","There is a number out of a crock."],
	90711 : ["鍋に数字が２つ以上書いてあります。","There is a number out of a crock."],
	90721 : ["具材の合計値が正しくありません。","Sum of filling is not equal to a crock."],
	90731 : ["具材のない鍋があります。","A crock has no circle."],
	90741 : ["鍋に入っていない具材があります。","A filling isn't in a crock."],
	/* 美術館 */
	90801 : ["照明に別の照明の光が当たっています。","Akari is shined from another Akari."],
	90811 : ["照明に照らされていないセルがあります。","A cell is not shined."],
	/* シャカシャカ */
	90901 : ["白マスが長方形(正方形)ではありません。","A mass of white cells is not rectangle."],
	/* 碁石拾い */
	91001 : ["拾われていない碁石があります。","There is remaining Goishi."],
	/* へびいちご */
	91101 : ["蛇の視線の先に別の蛇がいます。","A snake can see another snake."],
	/* キンコンカン */
	91201 : ["光が同じ文字の場所へ到達しません。", "Beam from a light doesn't reach one's pair."],
	91211 : ["光の反射回数が正しくありません。", "The count of refrection is wrong."],
	/* 修学旅行の夜 */
	91301 : ["北枕になっている布団があります。", "There is a 'Kita-makura' futon."],
	91311 : ["布団が2マスになっていません。", "There is a half-size futon."],
	91321 : ["通路に接していない布団があります。", "There is a futon separated to aisle."],
	/* ろーま */
	91401 : ["ゴールにたどり着かないセルがあります。","A cell cannot reach a goal."],
	/* 遠い誓い */
	91501 : ["辺を共有する国にペアとなる矢印が入っています。","There are paired arrows in adjacent countries."],
	91511 : ["矢印の先にペアとなる矢印がいません。","There is not paired arrow in the direction of an arrow."],

	99999 : ["",""]
});

})();
