// Answer.js v3.2.0

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

AreaInfo = function(){
	this.max = 0;
	this.check = new Array();
	this.room  = new Array();
};

// 回答チェッククラス
// AnsCheckクラス
AnsCheck = function(){
	this.performAsLine = false;
	this.errDisp = false;
	this.setError = true;
	this.inAutoCheck = false;
	this.alstr = { jp:'' ,en:''};
	this.lcnts = { cell:new Array(), total:new Array()};
	this.reset();
};
AnsCheck.prototype = {
	//---------------------------------------------------------------------------
	// ans.reset()        lcnts等の変数の初期化を行う
	//---------------------------------------------------------------------------
	reset : function(){
		var self = this;
		if(k.isCenterLine){
			if(bd.border){ for(var c=0;c<bd.cell.length;c++){ self.lcnts.cell[c]=0;} };
			for(var i=1;i<=4;i++){ self.lcnts.cell[i]=0;}
			this.lcnts.total[0] = k.qcols*k.qrows;
		}
		else{
			if(bd.border){ for(var c=0;c<(k.qcols+1)*(k.qrows+1);c++){ self.lcnts.cell[c]=0;} };
			for(var i=1;i<=4;i++){ self.lcnts.cell[i]=0;}
			this.lcnts.total[0] = (k.qcols+1)*(k.qrows+1);
		}
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

		if(!this.checkAns()){
			alert((lang.isJP()||!this.alstr.en)?this.alstr.jp:this.alstr.en);
			this.errDisp = true;
			pc.paintAll();
			this.inCheck = false;
			return false;
		}

		alert(lang.isJP()?"正解です！":"Complete!");
		this.inCheck = false;
		return true;
	},
	checkAns : function(){},	//オーバーライド用
	//check1st : function(){},	//オーバーライド用
	setAlert : function(strJP, strEN){ this.alstr.jp = strJP; this.alstr.en = strEN;},

	//---------------------------------------------------------------------------
	// ans.autocheck()    答えの自動チェックを行う(alertがでなかったり、エラー表示を行わない)
	// ans.autocheck1st() autocheck前に、軽い正答判定を行う
	//
	// ans.disableSetError()  盤面のオブジェクトにエラーフラグを設定できないようにする
	// ans.enableSetError()   盤面のオブジェクトにエラーフラグを設定できるようにする
	// ans.isenableSetError() 盤面のオブジェクトにエラーフラグを設定できるかどうかを返す
	//---------------------------------------------------------------------------
	autocheck : function(){
		if(!k.autocheck || k.mode!=3 || this.inCheck){ return;}

		var ret = false;

		this.inCheck = true;
		this.disableSetError();

		if(this.autocheck1st() && this.checkAns() && this.inCheck){
			mv.mousereset();
			alert(lang.isJP()?"正解です！":"Complete!");
			ret = true;
			menu.setVal('autocheck',false);
		}
		this.enableSetError();
		this.inCheck = false;

		return ret;
	},
	// リンク系は重いので最初に端点を判定する
	autocheck1st : function(){
		if(this.check1st){ return this.check1st();}
		else if( (k.isCenterLine && !ans.checkLcntCell(1)) || (k.isborderAsLine && !ans.checkLcntCross(1,0)) ){ return false;}
		return true;
	},

	disableSetError  : function(){ this.setError = false;},
	enableSetError   : function(){ this.setError = true; },
	isenableSetError : function(){ return this.setError; },

	//---------------------------------------------------------------------------
	// ans.checkdir4Cell()     上下左右4方向で条件func==trueになるマスの数をカウントする
	// ans.setErrLareaByCell() ひとつながりになった線が存在するマスにエラーを設定する
	// ans.setErrLareaById()   ひとつながりになった線が存在するマスにエラーを設定する
	//---------------------------------------------------------------------------
	checkdir4Cell : function(cc, func){
		if(cc<0 || cc>=bd.cell.length){ return 0;}
		var cnt = 0;
		if(bd.up(cc)!=-1 && func(bd.up(cc))){ cnt++;}
		if(bd.dn(cc)!=-1 && func(bd.dn(cc))){ cnt++;}
		if(bd.lt(cc)!=-1 && func(bd.lt(cc))){ cnt++;}
		if(bd.rt(cc)!=-1 && func(bd.rt(cc))){ cnt++;}
		return cnt;
	},

	setErrLareaByCell : function(area, c, val){ this.setErrLareaById(area, area.check[c], val); },
	setErrLareaById : function(area, areaid, val){
		var blist = new Array();
		for(var id=0;id<bd.border.length;id++){
			if(bd.LiB(id)!=1){ continue;}
			var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			if(cc1!=-1 && cc2!=-1 && area.check[cc1]==areaid && area.check[cc1]==area.check[cc2]){ blist.push(id);}
		}
		bd.sErB(blist,val);

		var clist = new Array();
		for(var c=0;c<bd.cell.length;c++){ if(area.check[c]==areaid && bd.QnC(c)!=-1){ clist.push(c);} }
		bd.sErC(clist,4);
	},

	//---------------------------------------------------------------------------
	// ans.checkAllCell()   条件func==trueになるマスがあったらエラーを設定する
	// ans.linkBWarea()     白マス/黒マス/線がひとつながりかどうかを判定する
	// ans.check2x2Block()  2x2のセルが全て条件func==trueの時、エラーを設定する
	// ans.checkSideCell()  隣り合った2つのセルが条件func==trueの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkAllCell : function(func){
		for(var c=0;c<bd.cell.length;c++){
			if(func(c)){ bd.sErC([c],1); return false;}
		}
		return true;
	},
	linkBWarea : function(area){
		if(area.max>1){
			if(this.performAsLine){ bd.sErB(bd.borders,2); this.setErrLareaByCell(area,1,1); }
			if(!this.performAsLine || k.puzzleid=="firefly"){ bd.sErC(area.room[1],1);}
			return false;
		}
		return true;
	},
	check2x2Block : function(func){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.cell[c].cx<k.qcols-1 && bd.cell[c].cy<k.qrows-1){
				if( func(c) && func(c+1) && func(c+k.qcols) && func(c+k.qcols+1) ){
					bd.sErC([c,c+1,c+k.qcols,c+k.qcols+1],1);
					return false;
				}
			}
		}
		return true;
	},
	checkSideCell : function(func){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.cell[c].cx<k.qcols-1 && func(c,c+1)){
				bd.sErC([c,c+1],1); return false;
			}
			if(bd.cell[c].cy<k.qrows-1 && func(c,c+k.qcols)){
				bd.sErC([c,c+k.qcols],1); return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.isAreaRect()     すべてのfuncを満たすマスで構成されるエリアが四角形であるかどうか判定する
	// ans.checkAllArea()   すべてのfuncを満たすマスで構成されるエリアがサイズ条件func2を満たすかどうか判定する
	// ans.getSizeOfArea()  指定されたareaの上下左右の端と、その中で条件funcを満たすセルの大きさを返す
	// ans.getSizeOfClist() 指定されたCellのリストの上下左右の端と、その中で条件funcを満たすセルの大きさを返す
	//---------------------------------------------------------------------------
	isAreaRect : function(area, func){ return this.checkAllArea(area, func, function(w,h,a){ return (w*h==a)}); },
	checkAllArea : function(area, func, func2){
		for(var id=1;id<=area.max;id++){
			var d = this.getSizeOfArea(area,id,func);
			if(!func2(d.x2-d.x1+1, d.y2-d.y1+1, d.cnt)){
				bd.sErC(area.room[id],1);
				return false;
			}
		}
		return true;
	},
	getSizeOfArea : function(area, id, func){
		return this.getSizeOfClist(area.room[id], func);
	},
	getSizeOfClist : function(clist, func){
		var d = { x1:k.qcols, x2:-1, y1:k.qrows, y2:-1, cnt:0 };
		for(var i=0;i<clist.length;i++){
			if(d.x1>bd.cell[clist[i]].cx){ d.x1=bd.cell[clist[i]].cx;}
			if(d.x2<bd.cell[clist[i]].cx){ d.x2=bd.cell[clist[i]].cx;}
			if(d.y1>bd.cell[clist[i]].cy){ d.y1=bd.cell[clist[i]].cy;}
			if(d.y2<bd.cell[clist[i]].cy){ d.y2=bd.cell[clist[i]].cy;}
			if(func(clist[i])){ d.cnt++;}
		}
		return d;
	},

	//---------------------------------------------------------------------------
	// ans.checkQnumCross()  crossが条件func==falseの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkQnumCross : function(func){	//func(cr,bcnt){} -> エラーならfalseを返す関数にする
		for(var c=0;c<bd.cross.length;c++){
			if(bd.QnX(c)<0){ continue;}
			if(!func(bd.QnX(c), bd.bcntCross(bd.cross[c].cx, bd.cross[c].cy))){
				bd.sErX([c],1);
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.isLoopLine()    交差あり線がループになっているかどうかを判定する
	// ans.isConnectLine() 交差あり線がひとつながりになっているかどうかを判定する
	// ans.LineList()      交差あり線のひとつながりの線のリストを返す
	// ans.checkOneLoop()  交差あり線が一つかどうか判定する
	//---------------------------------------------------------------------------
	isLoopLine : function(startid){ return this.isConnectLine(startid, startid, -1); },
	isConnectLine : function(startid, terminal, startback){
		var forward = -1;
		var backward = startback;
		var here = startid;
		if(startid==-1){ return false;}
		while(k.qcols*k.qrows*3){
			forward = bd.forwardLine(here, backward);
			backward = here; here = forward;
			if(forward==terminal || forward==startid || forward==-1){ break;}
		}

		if(forward==terminal){ return true;}
		return false;
	},

	LineList : function(startid){
		if(startid==-1||startid==null){ return [];}
		var lists = [startid];
		var forward,backward, here;
		if(bd.backLine(startid)!=-1){
			here = startid;
			backward = bd.nextLine(startid);
			while(k.qcols*k.qrows*3){
				forward = bd.forwardLine(here, backward);
				backward = here; here = forward;
				if(forward==startid || forward==-1){ break;}
				lists.push(forward);
			}
		}
		if(forward!=startid && bd.nextLine(startid)!=-1){
			here = startid;
			backward = bd.backLine(startid);
			while(k.qcols*k.qrows*3){
				forward = bd.forwardLine(here, backward);
				backward = here; here = forward;
				if(forward==startid || forward==-1){ break;}
				lists.push(forward);
			}
		}
		return lists;
	},
	checkOneLoop : function(){
		var xarea = this.searchXarea();
		if(xarea.max>1){
			bd.sErB(bd.borders,2);
			bd.sErB(xarea.room[1],1);
			return false;
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.setLcnts()      線が引かれたり消されてたりした時に、変数lcntsの内容を変更する
	// ans.lcntCell()      セルに存在する線の本数を返す
	// ans.checkLcntCell() セルから出ている線の本数について判定する
	//---------------------------------------------------------------------------
	setLcnts : function(id, val){
		var cc1, cc2;
		if(k.isCenterLine){ cc1 = bd.cc1(id),      cc2 = bd.cc2(id);}
		else              { cc1 = bd.crosscc1(id), cc2 = bd.crosscc2(id);}

		if(val>0){
			if(cc1!=-1){ this.lcnts.total[this.lcnts.cell[cc1]]--; this.lcnts.cell[cc1]++; this.lcnts.total[this.lcnts.cell[cc1]]++;}
			if(cc2!=-1){ this.lcnts.total[this.lcnts.cell[cc2]]--; this.lcnts.cell[cc2]++; this.lcnts.total[this.lcnts.cell[cc2]]++;}
		}
		else{
			if(cc1!=-1){ this.lcnts.total[this.lcnts.cell[cc1]]--; this.lcnts.cell[cc1]--; this.lcnts.total[this.lcnts.cell[cc1]]++;}
			if(cc2!=-1){ this.lcnts.total[this.lcnts.cell[cc2]]--; this.lcnts.cell[cc2]--; this.lcnts.total[this.lcnts.cell[cc2]]++;}
		}
	},

	lcntCell : function(cc){ return col.lcntCell(cc);},
	checkLcntCell : function(val){
		if(this.lcnts.total[val]==0){ return true;}
		for(var c=0;c<bd.cell.length;c++){
			if(this.lcnts.cell[c]==val){
				if(!this.performAsLine){ bd.sErC([c],1);}
				else{ bd.sErB(bd.borders,2); this.setCellLineError(c,true);}
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkdir4Border()  セルの周り四方向に惹かれている境界線の本数を判定する
	// ans.checkdir4Border1() セルの周り四方向に惹かれている境界線の本数を返す
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkdir4Border : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.QnC(c)>=0 && this.checkdir4Border1(c)!=bd.QnC(c)){ bd.sErC([c],1); return false;}
		}
		return true;
	},
	checkdir4Border1 : function(cc){
		if(cc<0 || cc>=bd.cell.length){ return 0;}
		var func = function(id){ return (id!=-1&&((bd.QuB(id)==1)||(bd.QaB(id)==1)));};
		var cnt = 0;
		var cx = bd.cell[cc].cx; var cy = bd.cell[cc].cy;
		if( (k.isoutsideborder==0 && cy==0        ) || func(bd.bnum(cx*2+1,cy*2  )) ){ cnt++;}
		if( (k.isoutsideborder==0 && cy==k.qrows-1) || func(bd.bnum(cx*2+1,cy*2+2)) ){ cnt++;}
		if( (k.isoutsideborder==0 && cx==0        ) || func(bd.bnum(cx*2  ,cy*2+1)) ){ cnt++;}
		if( (k.isoutsideborder==0 && cx==k.qcols-1) || func(bd.bnum(cx*2+2,cy*2+1)) ){ cnt++;}
		return cnt;
	},

	checkenableLineParts : function(val){
		var func = function(i){
			return ((bd.ub(i)!=-1 && bd.LiB(bd.ub(i))==1 && bd.isnoLPup(i)) ||
					(bd.db(i)!=-1 && bd.LiB(bd.db(i))==1 && bd.isnoLPdown(i)) ||
					(bd.lb(i)!=-1 && bd.LiB(bd.lb(i))==1 && bd.isnoLPleft(i)) ||
					(bd.rb(i)!=-1 && bd.LiB(bd.rb(i))==1 && bd.isnoLPright(i)) ); };
		for(var i=0;i<bd.cell.length;i++){ if(func(i)){ bd.sErC([i],1); return false;} }
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.isLineStraight()   セルの上で線が直進しているか判定する
	// ans.setCellLineError() セルと周りの線にエラーフラグを設定する
	//---------------------------------------------------------------------------
	isLineStraight : function(cc){
		if     (this.lcntCell(cc)==3 || this.lcntCell(cc)==4){ return true;}
		else if(this.lcntCell(cc)==0 || this.lcntCell(cc)==1){ return false;}

		if     (bd.LiB(bd.ub(cc))==1 && bd.LiB(bd.db(cc))==1){ return true;}
		else if(bd.LiB(bd.lb(cc))==1 && bd.LiB(bd.rb(cc))==1){ return true;}

		return false;
	},

	setCellLineError : function(cc, flag){
		if(flag){ bd.sErC([cc],1);}
		bd.sErB([bd.ub(cc),bd.db(cc),bd.lb(cc),bd.rb(cc)], 1);
	},

	//---------------------------------------------------------------------------
	// ans.checkOneNumber()      部屋の中のfunc==trueを満たすCellの数がeval()==trueかどうかを調べる
	//                           部屋のfunc==trueになるセルの数の判定、部屋にある数字と黒マスの数の比較、
	//                           白マスの面積と入っている数字の比較などに用いられる
	// ans.checkBlackCellCount() 領域内の数字と黒マスの数が等しいか判定する
	// ans.checkDisconnectLine() 数字などに繋がっていない線の判定を行う
	// ans.checkNumberAndSize()  エリアにある数字と面積が等しいか判定する
	// ans.checkQnumsInArea()    部屋にある数字の数の判定を行う
	// ans.checkBlackCellInArea()部屋にある黒マスの数の判定を行う
	// ans,checkNoObjectInRoom() エリアに指定されたオブジェクトがないと判定する
	//
	// ans.getQnumCellInArea()   部屋の中で一番左上にある数字を返す
	// ans.getTopOfRoom()        部屋のTOPのCellのIDを返す
	// ans.getCntOfRoom()        部屋の面積を返す
	// ans.getCellsOfRoom()      部屋の中でfunc==trueとなるセルの数を返す
	//---------------------------------------------------------------------------
	checkOneNumber : function(area, eval, func){
		for(var id=1;id<=area.max;id++){
			if(eval( bd.QnC(this.getQnumCellInArea(area,id)), this.getCellsOfRoom(area, id, func) )){
				if(this.performAsLine){ bd.sErB(bd.borders,2); this.setErrLareaById(area,id,1);}
				else{ bd.sErC(area.room[id],(k.puzzleid!="tateyoko"?1:4));}
				return false;
			}
		}
		return true;
	},
	checkBlackCellCount  : function(area)          { return this.checkOneNumber(area, function(top,cnt){ return (top>=0 && top!=cnt);}, function(c){ return bd.QaC(c)== 1;} );},
	checkDisconnectLine  : function(area)          { return this.checkOneNumber(area, function(top,cnt){ return (top==-1 && cnt==0); }, function(c){ return bd.QnC(c)!=-1;} );},
	checkNumberAndSize   : function(area)          { return this.checkOneNumber(area, function(top,cnt){ return (top> 0 && top!=cnt);}, f_true); },
	checkQnumsInArea     : function(area, func)    { return this.checkOneNumber(area, function(top,cnt){ return func(cnt);},            function(c){ return bd.QnC(c)!=-1;} );},
	checkBlackCellInArea : function(area, func)    { return this.checkOneNumber(area, function(top,cnt){ return func(cnt);},            function(c){ return bd.QaC(c)== 1;} );},
	checkNoObjectInRoom  : function(area, getvalue){ return this.checkOneNumber(area, function(top,cnt){ return (cnt==0); },            function(c){ return getvalue(c)!=-1;} );},

	getQnumCellInArea : function(area, areaid){
		if(k.isOneNumber){ return this.getTopOfRoom(area,areaid); }
		for(var i=0;i<area.room[areaid].length;i++){ if(bd.QnC(area.room[areaid][i])!=-1){ return area.room[areaid][i];} }
		return -1;
	},
	getTopOfRoom : function(area, areaid){
		var cc=-1;
		var ccx=k.qcols;
		for(var i=0;i<area.room[areaid].length;i++){
			var c = area.room[areaid][i];
			if(bd.cell[c].cx < ccx){ cc=c; ccx=bd.cell[c].cx; }
		}
		return cc;
	},
	getCntOfRoom : function(area, areaid){
		return area.room[areaid].length;
	},
	getCellsOfRoom : function(area, areaid, func){
		var cnt=0;
		for(var i=0;i<area.room[areaid].length;i++){ if(func(area.room[areaid][i])){ cnt++;} }
		return cnt;
	},

	//---------------------------------------------------------------------------
	// ans.checkSideAreaCell()     境界線をはさんでタテヨコに接するセルの判定を行う
	// ans.checkSeqBlocksInRoom()  部屋の中限定で、黒マスがひとつながりかどうか判定する
	// ans.checkSameObjectInRoom() 部屋の中にgetvalueで複数種類の値が得られることを判定する
	// ans.checkObjectRoom()       getvalueで同じ値が得られるセルが、複数の部屋の分散しているか判定する
	//---------------------------------------------------------------------------
	checkSideAreaCell : function(area, func, flag){
		for(var id=0;id<bd.border.length;id++){
			if(bd.QuB(id)!=1&&bd.QaB(id)!=1){ continue;}
			var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			if(cc1!=-1 && cc2!=-1 && func(area, cc1, cc2)){
				if(!flag){ bd.sErC([cc1,cc2],1);}
				else{ bd.sErC(area.room[area.check[cc1]],1); bd.sErC(area.room[area.check[cc2]],1); }
				return false;
			}
		}
		return true;
	},

	checkSeqBlocksInRoom : function(rarea){
		for(var id=1;id<=rarea.max;id++){
			var area = new AreaInfo();
			var func = function(id){ return (id!=-1 && bd.QaC(id)==1); };
			for(var c=0;c<bd.cell.length;c++){ area.check.push(((rarea.check[c]==id && bd.QaC(c)==1)?0:-1));}
			for(var c=0;c<k.qcols*k.qrows;c++){ if(area.check[c]==0){ area.max++; area.room[area.max]=new Array(); this.sc0(func, area, c, area.max);} }
			if(area.max>1){
				bd.sErC(rarea.room[id],1);
				return false;
			}
		}
		return true;
	},

	checkSameObjectInRoom : function(area, getvalue){
		var d = new Array();
		for(var i=1;i<=area.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cell.length;c++){
			if(area.check[c]==-1 || getvalue(c)==-1){ continue;}
			if(d[area.check[c]]==-1 && getvalue(c)!=-1){ d[area.check[c]] = getvalue(c);}
			else if(d[area.check[c]]!=getvalue(c)){
				if(this.performAsLine){ bd.sErB(bd.borders,2); this.setErrLareaByCell(area,c,1);}
				else{ bd.sErC(area.room[area.check[c]],1);}
				if(k.puzzleid=="kaero"){
					for(var cc=0;cc<bd.cell.length;cc++){
						if(area.check[c]==area.check[cc] && this.getBeforeCell(cc)!=-1 && area.check[c]!=area.check[this.getBeforeCell(cc)]){
							bd.sErC([this.getBeforeCell(cc)],4);
						}
					}
				}
				return false;
			}
		}
		return true;
	},
	checkObjectRoom : function(area, getvalue){
		var d = new Array();
		var dmax = 0;
		for(var c=0;c<bd.cell.length;c++){ if(dmax<getvalue(c)){ dmax=getvalue(c);} }
		for(var i=0;i<=dmax;i++){ d[i]=-1;}
		for(var c=0;c<bd.cell.length;c++){
			if(getvalue(c)==-1){ continue;}
			if(d[getvalue(c)]==-1){ d[getvalue(c)] = area.check[c];}
			else if(d[getvalue(c)]!=area.check[c]){
				var clist = new Array();
				for(var cc=0;cc<bd.cell.length;cc++){
					if(k.puzzleid=="kaero"){ if(getvalue(c)==bd.QnC(cc)){ clist.push(cc);}}
					else{ if(area.check[c]==area.check[cc] || d[getvalue(c)]==area.check[cc]){ clist.push(cc);} }
				}
				bd.sErC(clist,1);
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkLcntCross()      ある交点との周り四方向の境界線の数を判定する(bp==1:黒点が打たれている場合)
	// ans.setCrossBorderError() ある交点とその周り四方向にエラーフラグを設定する
	//---------------------------------------------------------------------------
	checkLcntCross : function(val, bp){
		for(var i=0;i<(k.qcols+1)*(k.qrows+1);i++){
			var cx = i%(k.qcols+1), cy = mf(i/(k.qcols+1));
			if(k.isoutsidecross==0 && k.isborderAsLine==0 && (cx==0||cy==0||cx==k.qcols||cy==k.qrows)){ continue;}
			var lcnts = this.lcnts.cell[i] + ((k.isoutsideborder==0&&(cx==0||cy==0||cx==k.qcols||cy==k.qrows))?2:0);
			if(lcnts==val && (bp==0 || (bp==1&&bd.QnX(bd.xnum(cx, cy))==1) || (bp==2&&bd.QnX(bd.xnum(cx, cy))!=1) )){
				bd.sErB(bd.borders,2);
				this.setCrossBorderError(cx,cy);
				return false;
			}
		}
		return true;
	},
	setCrossBorderError : function(cx,cy){
		if(k.iscross){ bd.sErX([bd.xnum(cx, cy)], 1);}
		bd.sErB([bd.bnum(cx*2,cy*2-1),bd.bnum(cx*2,cy*2+1),bd.bnum(cx*2-1,cy*2),bd.bnum(cx*2+1,cy*2)], 1);
	},

	//---------------------------------------------------------------------------
	// ans.searchWarea()   盤面の白マスのエリア情報をAreaInfo(cell)オブジェクトで取得する
	// ans.searchBarea()   盤面の黒マスのエリア情報をAreaInfo(cell)オブジェクトで取得する
	// ans.searchBWarea()  searchWarea, searchBareaから呼ばれる関数
	// ans.sc0()           searchBWareaから呼ばれる再帰呼び出し用関数
	//
	// ans.searchRarea()   盤面の境界線で区切られた部屋情報をAreaInfo(cell)オブジェクトで取得する
	// ans.searchLarea()   盤面上に引かれている線でつながったエリア情報をAreaInfo(cell)オブジェクトで取得する
	// ans.searchRLrea()   searchRarea, searchLareaから呼ばれる関数
	// ans.sr0()           searchRLareaから呼ばれる再起呼び出し用関数
	//---------------------------------------------------------------------------
	searchWarea : function(){
		return this.searchBWarea(function(id){ return (id!=-1 && bd.QaC(id)!=1); });
	},
	searchBarea : function(){
		return this.searchBWarea(function(id){ return (id!=-1 && bd.QaC(id)==1); });
	},
	searchBWarea : function(func){
		var area = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){ area.check[c]=(func(c)?0:-1);}
		for(var c=0;c<bd.cell.length;c++){ if(area.check[c]==0){ area.max++; area.room[area.max]=new Array(); this.sc0(func, area, c, area.max);} }
		return area;
	},
	sc0 : function(func, area, i, areaid){
		if(area.check[i]!=0){ return;}
		area.check[i] = areaid;
		area.room[areaid].push(i);
		if( func(bd.up(i)) ){ this.sc0(func, area, bd.up(i), areaid);}
		if( func(bd.dn(i)) ){ this.sc0(func, area, bd.dn(i), areaid);}
		if( func(bd.lt(i)) ){ this.sc0(func, area, bd.lt(i), areaid);}
		if( func(bd.rt(i)) ){ this.sc0(func, area, bd.rt(i), areaid);}
		return;
	},

	searchRarea : function(){
		return this.searchRLarea(function(id){ return (id!=-1 && bd.QuB(id)==0 && bd.QaB(id)==0); }, false);
	},
	searchLarea : function(){
		return this.searchRLarea(function(id){ return (id!=-1 && bd.LiB(id)>0); }, true);
	},
	searchRLarea : function(func, flag){
		var area = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){ area.check[c]=((!flag||this.lcnts.cell[c]>0)?0:-1);}
		for(var c=0;c<bd.cell.length;c++){ if(area.check[c]==0){ area.max++; area.room[area.max]=new Array(); this.sr0(func, area, c, area.max);} }
		return area;
	},
	sr0 : function(func, area, i, areaid){
		if(area.check[i]!=0){ return;}
		area.check[i] = areaid;
		area.room[areaid].push(i);
		if( func(bd.ub(i)) ){ this.sr0(func, area, bd.up(i), areaid);}
		if( func(bd.db(i)) ){ this.sr0(func, area, bd.dn(i), areaid);}
		if( func(bd.lb(i)) ){ this.sr0(func, area, bd.lt(i), areaid);}
		if( func(bd.rb(i)) ){ this.sr0(func, area, bd.rt(i), areaid);}
		return;
	},

	//---------------------------------------------------------------------------
	// ans.searchXarea()   交差あり線のつながり情報をAreaInfo(border)オブジェクトで取得する
	// ans.setLineArea()   1つのつながった線にエリア情報をセットする
	//---------------------------------------------------------------------------
	searchXarea : function(){
		var area = new AreaInfo();
		for(var id=0;id<bd.border.length;id++){ area.check[id]=((k.isborderAsLine==0?bd.LiB(id)==1:bd.QaB(id)==1)?0:-1); }
		for(var id=0;id<bd.border.length;id++){ if(area.check[id]==0){ this.setLineArea(area, this.LineList(id), area.max);} }
		return area;
	},
	setLineArea : function(area, idlist, areaid){
		area.max++;
		area.room[area.max] = idlist;
		for(var i=0;i<idlist.length;i++){if(idlist[i]>=0 && bd.border.length>idlist[i]){ area.check[idlist[i]] = area.max;} }
	}
};
