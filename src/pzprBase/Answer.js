// Answer.js v3.4.0

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
pzprv3.createCommonClass('AnsCheck',
{
	initialize :  function(owner){
		this.owner = owner;

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
			if(func(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},
	checkNoNumCell : function(){
		return this.checkAllCell( function(c){ return bd.noNum(c);} );
	},
	checkIceLines : function(){
		return this.checkAllCell( function(c){
			return (bd.lines.lcntCell(c)===2 && bd.QuC(c)===6 && !bd.isLineStraight(c));
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
			if(!bd.isValidNum(c)){ continue;}
			var num = bd.getNum(c), count=bd.countDir4Cell(c,iscount);
			if((type!==1 && num<count) || (type!==2 && num>count)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},

	checkSideCell : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].bx<bd.maxbx-1 && func(c,bd.rt(c))){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,bd.rt(c)],1);
				result = false;
			}
			if(bd.cell[c].by<bd.maxby-1 && func(c,bd.dn(c))){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,bd.dn(c)],1);
				result = false;
			}
		}
		return result;
	},

	check2x2Block : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].bx<bd.maxbx-1 && bd.cell[c].by<bd.maxby-1){
				var cnt=0, bx=bd.cell[c].bx, by=bd.cell[c].by;
				var clist = bd.cellinside(bx, by, bx+2, by+2);
				for(var i=0;i<clist.length;i++){ if(func(clist[i])){ cnt++;}}
				if(cnt===4){
					if(this.inAutoCheck){ return false;}
					bd.sErC(clist,1);
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
			if(this.performAsLine){ bd.sErBAll(2); bd.setErrLareaByCell(cinfo,1,1); }
			if(!this.performAsLine || this.owner.pid=="firefly"){ bd.sErC(cinfo.room[1].idlist,1);}
			return false;
		}
		return true;
	},

	checkOneLoop : function(){
		var xinfo = bd.lines.getLineInfo();
		if(xinfo.max>1){
			bd.sErBAll(2);
			bd.sErB(xinfo.room[1].idlist,1);
			return false;
		}
		return true;
	},

	checkLcntCell : function(val){
		var result = true;
		if(bd.lines.ltotal[val]==0){ return true;}
		for(var c=0;c<bd.cellmax;c++){
			if(bd.lines.lcnt[c]==val){
				if(this.inAutoCheck){ return false;}
				if(!this.performAsLine){ bd.sErC([c],1);}
				else{ if(result){ bd.sErBAll(2);} bd.setCellLineError(c,true);}
				result = false;
			}
		}
		return result;
	},

	checkenableLineParts : function(val){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if( (bd.isLine(bd.ub(c)) && bd.noLP(c,bd.UP)) ||
				(bd.isLine(bd.db(c)) && bd.noLP(c,bd.DN)) ||
				(bd.isLine(bd.lb(c)) && bd.noLP(c,bd.LT)) ||
				(bd.isLine(bd.rb(c)) && bd.noLP(c,bd.RT)) )
			{
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
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
			var errclist = [];
			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isBlack(c)){ continue;}

				var clist=bd.getdir4clist(c), fid=null;
				for(var i=0;i<clist.length;i++){
					var cc=clist[i][0];
					if(fid===null){ fid=winfo.id[cc];}
					else if(fid!==winfo.id[cc]){ errclist.push(c); break;}
				}
			}
			bd.sErC(errclist,1);
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
	checkAllArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(c){ return true;}, evalfunc);},
	checkAllBlock : function(cinfo, func, evalfunc){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var clist = cinfo.room[id].idlist;
			var d = bd.getSizeOfClist(clist,func);
			var a = (function(){ var cnt=0; for(var i=0;i<clist.length;i++){ if(func(clist[i])){ cnt++;}} return cnt;})();

			var cc = (bd.areas.roomNumber ? bd.areas.rinfo.getTopOfRoomByCell(clist[0]) : bd.getQnumCellOfClist(clist));
			var n = (cc!==null?bd.QnC(cc):-1);

			if( !evalfunc(d.cols, d.rows, a, n) ){
				if(this.inAutoCheck){ return false;}
				if(this.performAsLine){ if(result){ bd.sErBAll(2);} bd.setErrLareaById(cinfo,id,1);}
				else{ bd.sErC(clist,(this.owner.pid!="tateyoko"?1:4));}
				result = false;
			}
		}
		return result;
	},

	checkNumberAndSize   : function(cinfo){ return this.checkAllArea(cinfo, function(w,h,a,n){ return (n<=0 || n===a);} );},
	checkAreaRect        : function(cinfo){ return this.checkAllArea(cinfo, function(w,h,a,n){ return (w*h===a)}      );},

	checkDisconnectLine  : function(linfo){ return this.checkAllBlock(linfo, function(c){ return bd.isNum(c);}, function(w,h,a,n){ return (n!=-1 || a>0); }  );},

	checkNoNumber        : function(cinfo){ return this.checkAllBlock(cinfo, function(c){ return bd.isNum(c);}, function(w,h,a,n){ return (a!=0);} );},
	checkDoubleNumber    : function(cinfo){ return this.checkAllBlock(cinfo, function(c){ return bd.isNum(c);}, function(w,h,a,n){ return (a< 2);} );},
	checkTripleNumber    : function(linfo){ return this.checkAllBlock(linfo, function(c){ return bd.isNum(c);}, function(w,h,a,n){ return (a< 3);} );},

	checkBlackCellCount  : function(cinfo)          { return this.checkAllBlock(cinfo, function(c){ return bd.isBlack(c);}, function(w,h,a,n){ return (n<0 || n===a);});},
	checkBlackCellInArea : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(c){ return bd.isBlack(c);}, function(w,h,a,n){ return evalfunc(a);}   );},

	checkLinesInArea     : function(cinfo, evalfunc){ return this.checkAllBlock(cinfo, function(c){ return bd.lines.lcnt[c]>0;}, evalfunc);},
	checkNoObjectInRoom  : function(cinfo, getvalue){ return this.checkAllBlock(cinfo, function(c){ return getvalue(c)!==-1;}, function(w,h,a,n){ return (a!=0);});},

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
					bd.sErC(rinfo.room[r].idlist,1);
					bd.sErC(rinfo.room[s].idlist,1);
					return false;
				}
			}
		}
		return true;
	},

	checkSideAreaCell : function(rinfo, func, flag){
		for(var id=0;id<bd.bdmax;id++){
			if(!bd.isBorder(id)){ continue;}
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cc1!==null && cc2!==null && func(cc1, cc2)){
				if(!flag){ bd.sErC([cc1,cc2],1);}
				else{
					 bd.sErC(bd.areas.rinfo[bd.areas.rinfo.id[cc1]].clist,1);
					 bd.sErC(bd.areas.rinfo[bd.areas.rinfo.id[cc2]].clist,1);
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
		var dataobj = new pzprv3.core.AreaData(this.owner);
		for(var id=1;id<=bd.areas.rinfo.max;id++){
			dataobj.isvalid = function(c){ return (bd.areas.rinfo.id[c]===id && bd.isBlack(c));};
			dataobj.reset();
			if(dataobj.getAreaInfo().max>1){
				if(this.inAutoCheck){ return false;}
				bd.sErC(bd.areas.rinfo[id].clist,1);
				result = false;
			}
		}
		return result;
	},

	checkSameObjectInRoom : function(rinfo, getvalue){
		var result=true, d=[], val=[];
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(c);}
		for(var i=1;i<=rinfo.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(rinfo.id[c]===null || val[c]===-1){ continue;}
			if(d[rinfo.id[c]]===-1 && val[c]!==-1){ d[rinfo.id[c]] = val[c];}
			else if(d[rinfo.id[c]]!==val[c]){
				if(this.inAutoCheck){ return false;}

				if(this.performAsLine){ bd.sErBAll(2); bd.setErrLareaByCell(rinfo,c,1);}
				else{ bd.sErC(rinfo.room[rinfo.id[c]].idlist,1);}
				if(this.owner.pid=="kaero"){
					for(var cc=0;cc<bd.cellmax;cc++){
						if(rinfo.id[c]===rinfo.id[cc] && this.getBeforeCell(cc)!==null && rinfo.id[c]!==rinfo.id[this.getBeforeCell(cc)])
							{ bd.sErC([this.getBeforeCell(cc)],4);}
					}
				}
				result = false;
			}
		}
		return result;
	},
	checkGatheredObject : function(rinfo, getvalue){
		var d=[], dmax=0, val=[];
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(c); if(dmax<val[c]){ dmax=val[c];} }
		for(var i=0;i<=dmax;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(val[c]===-1){ continue;}
			if(d[val[c]]===-1){ d[val[c]] = rinfo.id[c];}
			else if(d[val[c]]!==rinfo.id[c]){
				var clist = [];
				for(var cc=0;cc<bd.cellmax;cc++){
					if(this.owner.pid=="kaero"){ if(val[c]===bd.QnC(cc)){ clist.push(cc);}}
					else{ if(rinfo.id[c]===rinfo.id[cc] || d[val[c]]===rinfo.id[cc]){ clist.push(cc);} }
				}
				bd.sErC(clist,1);
				return false;
			}
		}
		return true;
	},

	checkDifferentNumberInRoom : function(rinfo, numfunc){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(!this.isDifferentNumberInClist(rinfo.room[id].idlist, numfunc)){
				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
		}
		return result;
	},
	isDifferentNumberInClist : function(clist, numfunc){
		var result = true, d = [], num = [];
		var max = bd.nummaxfunc(clist[0]), bottom = bd.numminfunc(clist[0]);
		for(var n=bottom;n<=max;n++){ d[n]=0;}
		for(var i=0;i<clist.length;i++){ num[clist[i]] = numfunc(clist[i]);}

		for(var i=0;i<clist.length;i++){ if(num[clist[i]]>=bottom){ d[num[clist[i]]]++;} }
		for(var i=0;i<clist.length;i++){
			if(num[clist[i]]>=bottom && d[num[clist[i]]]>=2){ bd.sErC([clist[i]],1); result = false;}
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
				for(var tx=bx;tx<=bd.maxbx;tx+=2){ if(termfunc(bd.cnum(tx,by))){ break;}}
				if(!evalfunc.call(this, [bx-2,by,bd.RT], bd.cellinside(bx,by,tx-2,by))){
					if(!multierr || this.inAutoCheck){ return false;}
					result = false;
				}
				bx = tx; /* 次のループはbx=tx+2 */
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			for(var by=1;by<=bd.maxby;by+=2){
				for(var ty=by;ty<=bd.maxby;ty+=2){ if(termfunc(bd.cnum(bx,ty))){ break;}}
				if(!evalfunc.call(this, [bx,by-2,bd.DN], bd.cellinside(bx,by,bx,ty-2))){
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
				if(lcnts==val && (bp==0 || (bp==1&&bd.QnX(bd.xnum(bx,by))==1) || (bp==2&&bd.QnX(bd.xnum(bx,by))!=1) )){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
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
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].error!==val){ continue;}

			if(this.inAutoCheck){ return false;}
			bd.sErC(rinfo.room[id].idlist,1);
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
			bd.sErC(xinfo.room[id].cells,1);
			if(result){ bd.sErBAll(2);}
			bd.sErB(xinfo.room[id].idlist,1);
			result = false;
		}
		return result;
	},

	// 丸の場所で線を切り離して考える
	getErrorFlag_line : function(){
		var xinfo = new pzprv3.core.AreaInfo();
		for(var id=0;id<bd.bdmax;id++){ xinfo.id[id]=(bd.isLine(id)?0:null);}

		for(var c=0;c<bd.cellmax;c++){
			if(bd.noNum(c)){ continue;}

			var bx=bd.cell[c].bx, by=bd.cell[c].by;
			var dir4id = [bd.bnum(bx,by-1),bd.bnum(bx,by+1),bd.bnum(bx-1,by),bd.bnum(bx+1,by)];
			for(var a=0;a<4;a++){
				var firstid = dir4id[a];
				if(firstid==null||xinfo.id[firstid]!==0){ continue;}

				// dir1 スタート地点で線が出発した方向 dir2 到達地点から見た、到達した線の方向
				xinfo.max++;
				xinfo.room[xinfo.max] = {idlist:[],error:0,cells:[c,null],ccnt:0,length:[],dir1:(a+1),dir2:0};

				this.searchErrorFlag_line(xinfo,xinfo.max);
				if(xinfo.room[xinfo.max].idlist.length===0){ continue;}

				this.isErrorFlag_line(xinfo);
			}
		}
		return xinfo;
	},
	searchErrorFlag_line : function(xinfo,areaid){
		var room=xinfo.room[areaid], dir=room.dir1;
		var pos = bd.cell[room.cells[0]].getaddr();
		while(1){
			pos.move(dir);
			if(pos.oncell()){
				var cc = pos.cellid();
				if(cc===null || bd.isNum(cc)){ break;}
				else if(bd.lines.iscrossing(cc) && bd.lines.lcntCell(cc)>=3){ }
				else if(dir!==1 && bd.isLine(bd.db(cc))){ if(dir!==2){ room.ccnt++;} dir=2;}
				else if(dir!==2 && bd.isLine(bd.ub(cc))){ if(dir!==1){ room.ccnt++;} dir=1;}
				else if(dir!==3 && bd.isLine(bd.rb(cc))){ if(dir!==4){ room.ccnt++;} dir=4;}
				else if(dir!==4 && bd.isLine(bd.lb(cc))){ if(dir!==3){ room.ccnt++;} dir=3;}
			}
			else{
				var id = pos.borderid();
				if(id===null||xinfo.id[id]!==0){ break;}

				xinfo.id[id] = areaid;
				room.idlist.push(id);
				if(isNaN(room.length[room.ccnt])){ room.length[room.ccnt]=0;}else{ room.length[room.ccnt]++;}
			}
		}
		room.cells[1]=pos.cellid();
		room.dir2=[0,2,1,4,3][dir];
	},
	isErrorFlag_line : function(xinfo){ }
});
