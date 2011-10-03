// Answer.js v3.4.0

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
pzprv3.createCommonClass('AnsCheck',
{
	initialize : function(){
		this.performAsLine = false;
		this.inCheck = false;
		this.inAutoCheck = false;
		this.alstr = { jp:'' ,en:''};
		this.checkresult = true;
	},

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う(checkAns()を呼び出す)
	// ans.checkAns()  答えのチェックを行う(オーバーライド用)
	// ans.check1st()  オートチェック時に初めに判定を行う(オーバーライド用)
	// ans.setAlert()  check()から戻ってきたときに返す、エラー内容を表示するalert文を設定する
	//---------------------------------------------------------------------------
	check : function(){
		this.inCheck = true;
		this.alstr = { jp:'' ,en:''};
		kc.keyreset();
		mv.mousereset();

		this.checkresult = true;
		this.checkAns()
		if(!this.checkresult){
			menu.alertStr(this.alstr.jp, this.alstr.en);
			bd.haserror = true;
			pc.paintAll();
		}
		else{
			menu.alertStr("正解です！","Complete!");
		}

		this.inCheck = false;
		return this.checkresult;
	},
	checkAns : function(){ return true;},	//オーバーライド用
	check1st : function(){ return true;},	//オーバーライド用
	setAlert : function(strJP, strEN){
		this.alstr.jp = strJP;
		this.alstr.en = (!!strEN ? strEN : strJP);
		this.checkresult = false;
	},

	//---------------------------------------------------------------------------
	// ans.autocheck()    答えの自動チェックを行う(alertがでなかったり、エラー表示を行わない)
	// ans.autocheck1st() autocheck前に、軽い正答判定を行う
	//---------------------------------------------------------------------------
	autocheck : function(){
		if(!pp.getVal('autocheck') || this.owner.editmode || this.inCheck){ return;}

		var ret = false;

		this.inCheck = this.inAutoCheck = true;
		bd.disableSetError();

		if(this.autocheck1st()){
			this.checkresult = true;
			this.checkAns();
			if(this.checkresult && this.inCheck){
				mv.mousereset();
				menu.alertStr("正解です！","Complete!");
				ret = true;
				pp.setVal('autocheck',false);
			}
		}
		bd.enableSetError();
		this.inCheck = this.inAutoCheck = false;

		return ret;
	},
	// リンク系は重いので最初に端点を判定する
	autocheck1st : function(){
		if(!this.check1st()){ return false;}
		if((bd.lines.isCenterLine && !bd.areas.lineToArea && !this.checkLcntCell(1)) || (bd.lines.borderAsLine && !this.checkLcntCross(1,0))){ return false;}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkAllCell()   条件func==trueになるマスがあったらエラーを設定する
	// ans.checkNoNumCell() 数字の入っていないセルがあるか判定する
	// ans.checkIceLines()  アイスバーン上で線が曲がっているか判定する
	//---------------------------------------------------------------------------
	checkAllCell : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(func(cell)){
				if(this.inAutoCheck){ return false;}
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
	// ans.checkSideCell()  隣り合った2つのセルが条件func==trueの時、エラーを設定する
	// ans.check2x2Block()  2x2のセルが全て条件func==trueの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkDir4Cell : function(iscount, type){ // 0:違う 1:numより小さい 2:numより大きい
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}
			var num = cell.getNum(), count=cell.countDir4Cell(iscount);
			if((type!==1 && num<count) || (type!==2 && num>count)){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkSideCell : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx<bd.maxbx-1 && func(cell,cell.rt())){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				cell.rt().seterr(1);
				result = false;
			}
			if(cell.by<bd.maxby-1 && func(cell,cell.dn())){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				cell.dn().seterr(1);
				result = false;
			}
		}
		return result;
	},

	check2x2Block : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx<bd.maxbx-1 && cell.by<bd.maxby-1){
				var cnt=0, bx=cell.bx, by=cell.by;
				var clist = bd.cellinside(bx, by, bx+2, by+2);
				for(var i=0;i<clist.length;i++){ if(func(clist[i])){ cnt++;}}
				if(cnt===4){
					if(this.inAutoCheck){ return false;}
					clist.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkOneArea()  白マス/黒マス/線がひとつながりかどうかを判定する
	// ans.checkOneLoop()  交差あり線が一つかどうか判定する
	// ans.checkLcntCell() セルから出ている線の本数について判定する
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkOneArea : function(cinfo){
		if(cinfo.max>1){
			if(this.performAsLine){ bd.border.seterr(2); cinfo.setErrLareaByCell(bd.cell[1],1); }
			if(!this.performAsLine || this.owner.pid=="firefly"){ cinfo.getclist(1).seterr(1);}
			return false;
		}
		return true;
	},

	checkOneLoop : function(){
		var xinfo = bd.lines.getLineInfo();
		if(xinfo.max>1){
			bd.border.seterr(2);
			xinfo.getblist(1).seterr(1);
			return false;
		}
		return true;
	},

	checkLcntCell : function(val){
		var result = true;
		if(bd.lines.ltotal[val]==0){ return true;}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.lcnt()==val){
				if(this.inAutoCheck){ return false;}
				if(!this.performAsLine){ cell.seterr(1);}
				else{ if(result){ bd.border.seterr(2);} cell.setCellLineError(true);}
				result = false;
			}
		}
		return result;
	},

	checkenableLineParts : function(val){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if( (cell.ub().isLine() && cell.noLP(bd.UP)) ||
				(cell.db().isLine() && cell.noLP(bd.DN)) ||
				(cell.lb().isLine() && cell.noLP(bd.LT)) ||
				(cell.rb().isLine() && cell.noLP(bd.RT)) )
			{
				if(this.inAutoCheck){ return false;}
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
			var errclist = this.owner.newInstance('PieceList');
			var clist = bd.cell.filter(function(cell){ return cell.isBlack();});
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
	//
	// ans.checkNumberAndSize()  エリアにある数字と面積が等しいか判定する
	// ans.checkAreaRect()       領域が全て四角形であるかどうか判定する
	// 
	// ans.checkDisconnectLine() 数字などに繋がっていない線の判定を行う
	// ans.checkNoNumber()       部屋に数字が含まれていないかの判定を行う
	// ans.checkDoubleNumber()   部屋に数字が2つ以上含まれていないように判定を行う
	// ans.checkTripleNumber()   部屋に数字が3つ以上含まれていないように判定を行う
	// ans.checkBlackCellCount() 領域内の数字と黒マスの数が等しいか判定する
	// ans.checkBlackCellInArea()部屋にある黒マスの数の判定を行う
	// ans.checkLinesInArea()    領域の中で線が通っているセルの数を判定する
	// ans.checkNoObjectInRoom() エリアに指定されたオブジェクトがないと判定する
	//---------------------------------------------------------------------------
	checkAllArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(cell){ return true;}, evalfunc);},
	checkAllBlock : function(cinfo, func, evalfunc){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var clist = cinfo.getclist(id), d = clist.getRectSize();
			var a = (function(){ var cnt=0; for(var i=0;i<clist.length;i++){ if(func(clist[i])){ cnt++;}} return cnt;})();

			var cell = (bd.areas.roomNumber ? bd.areas.rinfo.getTopOfRoom(id) : clist.getQnumCell());
			var n = (!cell.isnull?cell.getQnum():-1);

			if( !evalfunc(d.cols, d.rows, a, n) ){
				if(this.inAutoCheck){ return false;}
				if(this.performAsLine){ if(result){ bd.border.seterr(2);} cinfo.setErrLareaById(id,1);}
				else{ clist.seterr(this.owner.pid!="tateyoko"?1:4);}
				result = false;
			}
		}
		return result;
	},

	checkNumberAndSize   : function(cinfo){ return this.checkAllArea(cinfo, function(w,h,a,n){ return (n<=0 || n===a);} );},
	checkAreaRect        : function(cinfo){ return this.checkAllArea(cinfo, function(w,h,a,n){ return (w*h===a)}      );},

	checkDisconnectLine  : function(linfo){ return this.checkAllBlock(linfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (n!=-1 || a>0); }  );},

	checkNoNumber        : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a!=0);} );},
	checkDoubleNumber    : function(cinfo){ return this.checkAllBlock(cinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a< 2);} );},
	checkTripleNumber    : function(linfo){ return this.checkAllBlock(linfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a< 3);} );},

	checkBlackCellCount  : function(cinfo)          { return this.checkAllBlock(cinfo, function(cell){ return cell.isBlack();}, function(w,h,a,n){ return (n<0 || n===a);});},
	checkBlackCellInArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(cell){ return cell.isBlack();}, function(w,h,a,n){ return evalfunc(a);}   );},

	checkLinesInArea     : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(cell){ return cell.lcnt()>0;}, evalfunc);},
	checkNoObjectInRoom  : function(cinfo, getvalue){ return this.checkAllBlock(cinfo, function(cell){ return getvalue(cell)!==-1;}, function(w,h,a,n){ return (a!=0);});},

	//---------------------------------------------------------------------------
	// ans.checkSideAreaSize() 境界線をはさんで接する部屋のgetvalで得られるサイズが異なることを判定する
	// ans.checkSideAreaCell() 境界線をはさんでタテヨコに接するセルの判定を行う
	//---------------------------------------------------------------------------
	checkSideAreaSize : function(rinfo, getval){
		var sides = bd.getSideAreaInfo(rinfo);
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
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
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
	// ans.checkSeqBlocksInRoom()   部屋の中限定で、黒マスがひとつながりかどうか判定する
	// ans.checkSameObjectInRoom()  部屋の中のgetvalueの値が1種類であるか判定する
	// ans.checkGatheredObject()    同じgetvalueの値であれば、同じ部屋に存在することを判定する
	// ans.checkDifferentNumberInRoom() 部屋の中に同じ数字が存在しないことを判定する
	// ans.isDifferentNumberInClist()   clistの中に同じ数字が存在しないことを判定だけを行う
	//---------------------------------------------------------------------------
	checkSeqBlocksInRoom : function(){
		var result = true;
		var dataobj = this.owner.newInstance('AreaData');
		for(var r=1;r<=bd.areas.rinfo.max;r++){
			dataobj.isvalid = function(cell){ return (bd.areas.rinfo.getRoomID(cell)===r && cell.isBlack());};
			dataobj.reset();
			if(dataobj.getAreaInfo().max>1){
				if(this.inAutoCheck){ return false;}
				bd.areas.rinfo.getClist(r).seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkSameObjectInRoom : function(rinfo, getvalue){
		var result=true, d=[], val=[];
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(bd.cell[c]);}
		for(var i=1;i<=rinfo.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(rinfo.id[c]===null || val[c]===-1){ continue;}
			if(d[rinfo.id[c]]===-1 && val[c]!==-1){ d[rinfo.id[c]] = val[c];}
			else if(d[rinfo.id[c]]!==val[c]){
				if(this.inAutoCheck){ return false;}

				if(this.performAsLine){ bd.border.seterr(2); rinfo.setErrLareaByCell(bd.cell[c],1);}
				else{ rinfo.getclistbycell(bd.cell[c]).seterr(1);}
				result = false;
			}
		}
		return result;
	},
	checkGatheredObject : function(rinfo, getvalue){
		var d=[], dmax=0, val=[];
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(bd.cell[c]); if(dmax<val[c]){ dmax=val[c];} }
		for(var i=0;i<=dmax;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(val[c]===-1){ continue;}
			if(d[val[c]]===-1){ d[val[c]] = rinfo.id[c];}
			else if(d[val[c]]!==rinfo.id[c]){
				bd.cell.filter((this.owner.pid==="kaero")
					? function(cell){ return (val[c]===cell.getQnum());}
					: function(cell){ return (rinfo.id[c]===rinfo.id[cell.id] || d[val[c]]===rinfo.id[cell.id]);}
				).seterr(1);
				return false;
			}
		}
		return true;
	},

	checkDifferentNumberInRoom : function(rinfo, numfunc){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.getclist(r);
			if(!this.isDifferentNumberInClist(clist, numfunc)){
				if(this.inAutoCheck){ return false;}
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
		var result = true;
		for(var by=1;by<=bd.maxby;by+=2){
			var clist = bd.cellinside(bd.minbx+1,by,bd.maxbx-1,by);
			if(!evalfunc.call(this, clist, numfunc)){
				if(this.inAutoCheck){ return false;}
				result = false;
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			var clist = bd.cellinside(bx,bd.minby+1,bx,bd.maxby-1);
			if(!evalfunc.call(this, clist, numfunc)){
				if(this.inAutoCheck){ return false;}
				result = false;
			}
		}
		return result;
	},
	checkRowsColsPartly : function(evalfunc, termfunc, multierr){
		var result = true;
		for(var by=1;by<=bd.maxby;by+=2){
			for(var bx=1;bx<=bd.maxbx;bx+=2){
				for(var tx=bx;tx<=bd.maxbx;tx+=2){ if(termfunc(bd.getc(tx,by))){ break;}}
				if(tx>bx && !evalfunc.call(this, [bx-2,by,bd.RT], bd.cellinside(bx,by,tx-2,by))){
					if(!multierr || this.inAutoCheck){ return false;}
					result = false;
				}
				bx = tx; /* 次のループはbx=tx+2 */
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			for(var by=1;by<=bd.maxby;by+=2){
				for(var ty=by;ty<=bd.maxby;ty+=2){ if(termfunc(bd.getc(bx,ty))){ break;}}
				if(ty>by && !evalfunc.call(this, [bx,by-2,bd.DN], bd.cellinside(bx,by,bx,ty-2))){
					if(!multierr || this.inAutoCheck){ return false;}
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
		var result=true, mm=(bd.iscross===1?2:0);
		for(var by=mm;by<=bd.maxby-mm;by+=2){
			for(var bx=mm;bx<=bd.maxbx-mm;bx+=2){
				var id = (bx>>1)+(by>>1)*(bd.qcols+1);
				var lcnts = (bd.lines.borderAsLine?bd.lines.lcnt[id]:bd.areas.rinfo.bdcnt[id]);
				if(lcnts==val && (bp===0 || (bp==1&&bd.getx(bx,by).getQnum()===1) || (bp===2&&bd.getx(bx,by).getQnum()!==1) )){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.border.seterr(2);}
					bd.setCrossBorderError(bx,by);
					result = false;
				}
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

			if(this.inAutoCheck){ return false;}
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

			if(this.inAutoCheck){ return false;}
			var cells = xinfo.room[id].cells;
			if(!!cells[0] && cells[0]!==null){ cells[0].seterr(1);}
			if(!!cells[1] && cells[1]!==null){ cells[1].seterr(1);}
			if(result){ bd.border.seterr(2);}
			xinfo.getblist(id).seterr(1);
			result = false;
		}
		return result;
	},

	// 丸の場所で線を切り離して考える
	getErrorFlag_line : function(){
		var xinfo = this.owner.newInstance('AreaBorderInfo');
		for(var id=0;id<bd.bdmax;id++){ xinfo.id[id]=(bd.border[id].isLine()?0:null);}

		var clist = bd.cell.filter(function(cell){ return cell.isNum();});
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var dir4bd = [cell.ub(),cell.db(),cell.lb(),cell.rb()];
			for(var a=0;a<4;a++){
				var firstbd = dir4bd[a];
				if(firstbd.isnull||!xinfo.emptyCell(bd.cell[firstbd])){ continue;}

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
