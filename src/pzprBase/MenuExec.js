// MenuExec.js v3.2.0p5

//---------------------------------------------------------------------------
// ★MenuExecクラス ポップアップウィンドウ内でボタンが押された時の処理内容を記述する
//---------------------------------------------------------------------------

// Menuクラス実行部
MenuExec = function(){
	this.displaymanage = true;
	this.qnumw;	// Ques==51の回転･反転用
	this.qnumh;	// Ques==51の回転･反転用
};
MenuExec.prototype = {
	//------------------------------------------------------------------------------
	// menu.ex.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		k.mode=num;
		kc.prev = -1;
		ans.errDisp=true;
		bd.errclear();
		if(kp.ctl[1].enable || kp.ctl[3].enable){ pp.funcs.keypopup();}
		tc.setAlign();
		pc.paintAll();
	},

	//------------------------------------------------------------------------------
	// menu.ex.newboard()  新規盤面を作成する
	// menu.ex.newboard2() サイズ(col×row)の新規盤面を作成する(実行部)
	// menu.ex.bdcnt()     borderの数を返す(newboard2()から呼ばれる)
	//------------------------------------------------------------------------------
	newboard : function(e){
		if(menu.pop){
			var col,row;
			if(k.puzzleid!="sudoku"){
				col = mf(parseInt(document.newboard.col.value));
				row = mf(parseInt(document.newboard.row.value));
			}
			else{
				if     (document.newboard.size[0].checked){ col=row= 9;}
				else if(document.newboard.size[1].checked){ col=row=16;}
				else if(document.newboard.size[2].checked){ col=row=25;}
				else if(document.newboard.size[3].checked){ col=row= 4;}
			}

			if(col>0 && row>0){ this.newboard2(col,row);}
			menu.popclose();
			base.resize_canvas();				// Canvasを更新する
		}
	},
	newboard2 : function(col,row){
		// 既存のサイズより小さいならdeleteする
		for(var n=k.qcols*k.qrows-1;n>=col*row;n--){
			if(bd.cell[n].numobj) { bd.cell[n].numobj.remove();}
			if(bd.cell[n].numobj2){ bd.cell[n].numobj2.remove();}
			delete bd.cell[n]; bd.cell.pop(); bd.cells.pop();
		}
		if(k.iscross){ for(var n=(k.qcols+1)*(k.qrows+1)-1;n>=(col+1)*(row+1);n--){
			if(bd.cross[n].numobj){ bd.cross[n].numobj.remove();}
			delete bd.cross[n]; bd.cross.pop(); bd.crosses.pop();
		}}
		if(k.isborder){ for(var n=this.bdcnt(k.qcols,k.qrows)-1;n>=this.bdcnt(col,row);n--){
			if(bd.border[n].numobj){ bd.border[n].numobj.remove();}
			delete bd.border[n]; bd.border.pop(); bd.borders.pop();
		}}
		if(k.isextendcell==1){ for(var n=k.qcols+k.qrows;n>=col+row+1;n--){
			if(bd.excell[n].numobj) { bd.excell[n].numobj.remove();}
			if(bd.excell[n].numobj2){ bd.excell[n].numobj2.remove();}
			delete bd.excell[n]; bd.excell.pop();
		}}
		else if(k.isextendcell==2){ for(var n=2*k.qcols+2*k.qrows+3;n>=2*col+2*row+4;n--){
			if(bd.excell[n].numobj) { bd.excell[n].numobj.remove();}
			if(bd.excell[n].numobj2){ bd.excell[n].numobj2.remove();}
			delete bd.excell[n]; bd.excell.pop();
		}}

		// 既存のサイズより大きいならnewを行う
		for(var i=k.qcols*k.qrows;i<col*row;i++){ bd.cell.push(new Cell()); bd.cells.push(i);}
		if(k.iscross){ for(var i=(k.qcols+1)*(k.qrows+1);i<(col+1)*(row+1);i++)         { bd.cross.push(new Cross());   bd.crosses.push(i);} }
		if(k.isborder){ for(var i=this.bdcnt(k.qcols,k.qrows);i<this.bdcnt(col,row);i++){ bd.border.push(new Border()); bd.borders.push(i);} }
		if(k.isextendcell==1){ for(var i=k.qcols+k.qrows+1;i<col+row+1;i++)        { bd.excell.push(new Cell());} }
		if(k.isextendcell==2){ for(var i=2*k.qcols+2*k.qrows+4;i<2*col+2*row+4;i++){ bd.excell.push(new Cell());} }

		// サイズの変更
		if(k.puzzleid=="icebarn"){
			if(bd.arrowin<k.qcols+bd.bdinside){ if(bd.arrowin>col+bd.bdinside){ bd.arrowin=col+bd.bdinside-1;} }
			else{ if(bd.arrowin>col+row+bd.bdinside){ bd.arrowin=col+row+bd.bdinside-1;} }
			if(bd.arrowout<k.qcols+bd.bdinside){ if(bd.arrowout>col+bd.bdinside){ bd.arrowout=col+bd.bdinside-1;} }
			else{ if(bd.arrowout>col+row+bd.bdinside){ bd.arrowout=col+row+bd.bdinside-1;} }
			if(bd.arrowin==bd.arrowout){ bd.arrowin--;}
		}
		if(k.puzzleid=="slalom"){
			bd.startid = 0;
			bd.hinfo.init();
		}
		tc.maxx += (col-k.qcols)*2;
		tc.maxy += (row-k.qrows)*2;
		k.qcols = col; k.qrows = row;

		// cellinit() = allclear()+setpos()を呼び出す
		for(var i=0;i<bd.cell.length;i++){ bd.cell[i].allclear(i);}
		if(k.iscross){ for(var i=0;i<bd.cross.length;i++){ bd.cross[i].allclear(i);} }
		if(k.isborder){ for(var i=0;i<bd.border.length;i++){ bd.border[i].allclear(i);} }
		if(k.isextendcell!=0){ for(var i=0;i<bd.excell.length;i++){ bd.excell[i].allclear();} }

		um.allerase();
		bd.setposAll();

		room.resetRarea();

		ans.reset();
	},
	bdcnt : function(col,row){ return (col-1)*row+col*(row-1)+(k.isoutsideborder==0?0:2*(col+row));},

	//------------------------------------------------------------------------------
	// menu.ex.urlinput()   URLを入力する
	// menu.ex.urloutput()  URLを出力する
	// menu.ex.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(menu.pop){
			var type = enc.get_search(document.urlinput.ta.value);
			if(enc.uri.cols && enc.uri.rows){ this.newboard2(enc.uri.cols, enc.uri.rows);}
			enc.pzlinput(type);
			room.resetRarea();

			tm.reset();
			menu.popclose();
		}
	},
	urloutput : function(e){
		if(menu.pop){
			switch(getSrcElement(e).name){
				case "pzprv3":     enc.pzlexport(0); break;
				case "pzprapplet": enc.pzlexport(1); break;
				case "kanpen":     enc.pzlexport(2); break;
				case "pzprv3edit": enc.pzlexport(3); break;
				case "heyaapp":    enc.pzlexport(4); break;
			}
		}
	},
	openurl : function(e){
		if(menu.pop){
			if(document.urloutput.ta.value!=''){ var win = window.open(document.urloutput.ta.value, '', '');}
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.fileopen()  ファイルを開く
	// menu.ex.filesave()  ファイルを保存する
	// menu.ex.filesave2() pencilboxo形式のファイルを保存する
	//------------------------------------------------------------------------------
	fileopen : function(e){
		if(menu.pop){ menu.popclose();}
		if(document.fileform.filebox.value){
			document.fileform.submit();
			document.fileform.filebox.value = "";
			tm.reset();
		}
	},
	filesave  : function(e){ fio.filesave(1);},
	filesave2 : function(e){ fio.filesave(2);},

	//------------------------------------------------------------------------------
	// menu.ex.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(menu.pop){
			var csize = parseInt(document.dispsize.cs.value);

			if(csize>0){
				k.def_psize = mf(csize*(k.def_psize/k.def_csize));
				if(k.def_psize==0){ k.def_psize=1;}
				k.def_csize = mf(csize);
			}
			menu.popclose();
			base.resize_canvas();	// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispman()    管理領域を隠す/表示するが押された時に動作する
	// menu.ex.dispmanstr() 管理領域を隠す/表示するにどの文字列を表示するか
	//------------------------------------------------------------------------------
	dispman : function(e){
		var idlist = ['expression','usepanel','checkpanel'];
		var sparatorlist = (k.callmode=="pmake")?['separator1']:['separator1','separator2'];

		if(this.displaymanage){
			for(var i=0;i<idlist.length;i++){ $("#"+idlist[i]).hide(800, base.resize_canvas.bind(base));}
			for(var i=0;i<sparatorlist.length;i++){ $("#"+sparatorlist[i]).hide();}
			if(k.irowake!=0 && menu.getVal('irowake')){ $("#btncolor2").show();}
			$("#menuboard").css('padding-bottom','0pt');
		}
		else{
			for(var i=0;i<idlist.length;i++){ $("#"+idlist[i]).show(800, base.resize_canvas.bind(base));}
			for(var i=0;i<sparatorlist.length;i++){ $("#"+sparatorlist[i]).show();}
			if(k.irowake!=0 && menu.getVal('irowake')){ $("#btncolor2").hide();}
			$("#menuboard").css('padding-bottom','8pt');
		}
		this.displaymanage = !this.displaymanage;
		this.dispmanstr();
	},
	dispmanstr : function(){
		if(!this.displaymanage){ $("#ms_manarea").html(lang.isJP()?"管理領域を表示":"Show management area");}
		else                   { $("#ms_manarea").html(lang.isJP()?"管理領域を隠す":"Hide management area");}
	},

	//------------------------------------------------------------------------------
	// menu.ex.popupadjust()  "盤面の調整"でボタンが押された時に振り分けて動作を行う
	// menu.ex.expandup() menu.ex.expanddn() menu.ex.expandlt() menu.ex.expandrt()
	// menu.ex.expand()       盤面の拡大を実行する
	// menu.ex.expandborder() 盤面の拡大時、線を新しく登録する
	// menu.ex.reduceup() menu.ex.reducedn() menu.ex.reducelt() menu.ex.reducert()
	// menu.ex.reduce()       盤面の縮小を実行する
	// menu.ex.reduceborder() 盤面の拡大時、線を消去したことを登録する
	//---------------------------------------------------------------------------
	popupadjust : function(e){
		if(menu.pop){
			um.newOperation(true);

			if(getSrcElement(e).name.indexOf("expand")!=-1){ um.addOpe('board', getSrcElement(e).name, 0, 0, 1);}

			var f=true;
			switch(getSrcElement(e).name){
				case "expandup": this.expandup(); break;
				case "expanddn": this.expanddn(); break;
				case "expandlt": this.expandlt(); break;
				case "expandrt": this.expandrt(); break;
				case "reduceup": um.undoonly = 1; f=this.reduceup(); um.undoonly = 0; break;
				case "reducedn": um.undoonly = 1; f=this.reducedn(); um.undoonly = 0; break;
				case "reducelt": um.undoonly = 1; f=this.reducelt(); um.undoonly = 0; break;
				case "reducert": um.undoonly = 1; f=this.reducert(); um.undoonly = 0; break;
			}

			if(f&&getSrcElement(e).name.indexOf("reduce")!=-1){ um.addOpe('board', getSrcElement(e).name, 0, 0, 1);}

			room.resetRarea();
			tc.Adjust();
			base.resize_canvas();				// Canvasを更新する
		}
	},
	expandup : function(){ this.expand(k.qcols, 'r', 'up' ); },
	expanddn : function(){ this.expand(k.qcols, 'r', 'dn' ); },
	expandlt : function(){ this.expand(k.qrows, 'c', 'lt' ); },
	expandrt : function(){ this.expand(k.qrows, 'c', 'rt' ); },
	expand : function(number, rc, key){
		this.adjustSpecial(5,key);
		this.adjustGeneral(5,'',0,0,k.qcols-1,k.qrows-1);

		if(rc=='c'){ k.qcols++; tc.maxx+=2;}else if(rc=='r'){ k.qrows++; tc.maxy+=2;}

		var tf = ((key=='up'||key=='lt')?1:-1);
		var func;
		if     (rc=='r'){ func = function(cx,cy){ var ty=(k.qrows-1)/2; return (ty+tf*(cy-ty)==0);};}
		else if(rc=='c'){ func = function(cx,cy){ var tx=(k.qcols-1)/2; return (tx+tf*(cx-tx)==0);};}

		var margin = number; var ncount = bd.cell.length;
		for(var i=0;i<margin;i++){ bd.cell.push(new Cell()); bd.cells.push(ncount+i);} 
		for(var i=0;i<bd.cell.length;i++){ bd.setposCell(i);}
		for(var i=bd.cell.length-1;i>=0;i--){
			if(i-margin<0 || func(bd.cell[i].cx, bd.cell[i].cy)){
				bd.cell[i] = new Cell(); bd.cell[i].cellinit(i); margin--;
			}
			else if(margin>0){ bd.cell[i] = bd.cell[i-margin];}
			if(margin==0){ break;}
		}
		if(k.iscross){
			var func2, oc = k.isoutsidecross?0:1;
			if     (rc=='r'){ func2 = function(cx,cy){ var ty=k.qrows/2; return (ty+tf*(cy-ty)==oc);};}
			else if(rc=='c'){ func2 = function(cx,cy){ var tx=k.qcols/2; return (tx+tf*(cx-tx)==oc);};}

			margin = number+1; ncount = bd.cross.length;
			for(var i=0;i<margin;i++){ bd.cross.push(new Cross()); bd.crosses.push(ncount+i);} 
			for(var i=0;i<bd.cross.length;i++){ bd.setposCross(i);}
			for(var i=bd.cross.length-1;i>=0;i--){
				if(i-margin<0 || func2(bd.cross[i].cx, bd.cross[i].cy)){
					bd.cross[i] = new Cross(); bd.cross[i].cellinit(i); margin--;
				}
				else if(margin>0){ bd.cross[i] = bd.cross[i-margin];}
				if(margin==0){ break;}
			}
		}
		if(k.isborder){
			var func2;
			if     (rc=='r'){ func2 = function(cx,cy){ var h=k.qrows+tf*(cy-k.qrows); return (h==1||h==2);};}
			else if(rc=='c'){ func2 = function(cx,cy){ var w=k.qcols+tf*(cx-k.qcols); return (w==1||w==2);};}

			bd.bdinside = (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);
			margin = 2*number-1+(k.isoutsideborder==0?0:2); ncount = bd.border.length;
			for(var i=0;i<margin;i++){ bd.border.push(new Border()); bd.borders.push(ncount+i);} 
			for(var i=0;i<bd.border.length;i++){ bd.setposBorder(i);}
			for(var i=bd.border.length-1;i>=0;i--){
				if(i-margin<0 || func2(bd.border[i].cx, bd.border[i].cy)){
					bd.border[i] = new Border(); bd.border[i].cellinit(i); margin--;
				}
				else if(margin>0){ bd.border[i] = bd.border[i-margin];}
				if(margin==0){ break;}
			}
		}
		if(k.isextendcell!=0){
			margin = k.isextendcell; ncount = bd.excell.length;
			for(var i=0;i<margin;i++){ bd.excell.push(new Cell());}
			for(var i=0;i<bd.excell.length;i++){ bd.setposEXcell(i);}
			for(var i=bd.excell.length-1;i>=0;i--){
				if(i-margin<0 || func(bd.excell[i].cx, bd.excell[i].cy)){
					bd.excell[i] = new Cell(); bd.excell[i].allclear(); bd.excell[i].qnum=-1; margin--;
				}
				else if(margin>0){ bd.excell[i] = bd.excell[i-margin];}
				if(margin==0){ break;}
			}
		}

		bd.setposAll();

		// 拡大時、境界線は代入しておく
		if(k.isborder && um.isenableRecord()){ this.expandborder(key);}
		this.adjustSpecial2(5,key);
		ans.resetLcount();
	},
	expandborder : function(key){
		if(k.puzzleid=='icebarn'||k.puzzleid=='minarism'){ return;}
		for(var i=0;i<bd.border.length;i++){
			var source = -1;
			if(k.isborderAsLine==0){
				if     (key=='up' && bd.border[i].cy==1          ){ source = bd.bnum(bd.border[i].cx, 3          );}
				else if(key=='dn' && bd.border[i].cy==2*k.qrows-1){ source = bd.bnum(bd.border[i].cx, 2*k.qrows-3);}
				else if(key=='lt' && bd.border[i].cx==1          ){ source = bd.bnum(3,           bd.border[i].cy);}
				else if(key=='rt' && bd.border[i].cx==2*k.qcols-1){ source = bd.bnum(2*k.qcols-3, bd.border[i].cy);}

				if(source!=-1){
					bd.sQuB(i, bd.QuB(source));
					bd.sQaB(i, bd.QaB(source));
				}
			}
			else{
				if     (key=='up' && bd.border[i].cy==2          ){ source = bd.bnum(bd.border[i].cx, 0        );}
				else if(key=='dn' && bd.border[i].cy==2*k.qrows-2){ source = bd.bnum(bd.border[i].cx, 2*k.qrows);}
				else if(key=='lt' && bd.border[i].cx==2          ){ source = bd.bnum(0,         bd.border[i].cy);}
				else if(key=='rt' && bd.border[i].cx==2*k.qcols-2){ source = bd.bnum(2*k.qcols, bd.border[i].cy);}

				if(source!=-1){
					bd.sQuB(i, bd.QuB(source)); bd.sQuB(source,  0);
					bd.sQaB(i, bd.QaB(source)); bd.sQaB(source, -1);
					bd.sQsB(i, bd.QsB(source)); bd.sQsB(source,  0);
				}
			}
		}
	},

	reduceup : function(){ return this.reduce(k.qcols, 'r', 'up'); },
	reducedn : function(){ return this.reduce(k.qcols, 'r', 'dn'); },
	reducelt : function(){ return this.reduce(k.qrows, 'c', 'lt'); },
	reducert : function(){ return this.reduce(k.qrows, 'c', 'rt'); },
	reduce : function(number, rc, key){
		if((rc=='c'&&k.qcols==1)||(rc=='r'&&k.qrows==1)){ return false;}

		this.adjustSpecial(6,key);
		this.adjustGeneral(6,'',0,0,k.qcols-1,k.qrows-1);

		if(k.isborder && um.isenableRecord()){ this.reduceborder(key);}

		var tf = ((key=='up'||key=='lt')?1:-1);
		var func;
		if     (rc=='r'){ func = function(cx,cy){ var ty=(k.qrows-1)/2; return (ty+tf*(cy-ty)==0);};}
		else if(rc=='c'){ func = function(cx,cy){ var tx=(k.qcols-1)/2; return (tx+tf*(cx-tx)==0);};}
		var margin = 0;
		var qnums = new Array();

		for(var i=0;i<bd.cell.length;i++){
			if(func(bd.cell[i].cx, bd.cell[i].cy, 0)){
				if(bd.cell[i].numobj) { bd.cell[i].numobj.hide();}
				if(bd.cell[i].numobj2){ bd.cell[i].numobj2.hide();}
				if(!bd.isNullCell(i)){ um.addOpe('cell', 'cell', i, bd.cell[i], 0);}
				if(k.isOneNumber){
					if(bd.QnC(i)!=-1){ qnums.push({ areaid:room.getRoomID(i), val:bd.QnC(i)});}
					room.cell[i] = -1;
				}
				margin++;
			}
			else if(margin>0){ bd.cell[i-margin] = bd.cell[i];}
		}
		for(var i=0;i<number;i++){ bd.cell.pop(); bd.cells.pop();}

		if(k.iscross){
			var func2, oc = k.isoutsidecross?0:1;
			if     (rc=='r'){ func2 = function(cx,cy){ var ty=k.qrows/2; return (ty+tf*(cy-ty)==oc);};}
			else if(rc=='c'){ func2 = function(cx,cy){ var tx=k.qcols/2; return (tx+tf*(cx-tx)==oc);};}
			margin = 0;
			for(var i=0;i<bd.cross.length;i++){
				if(func2(bd.cross[i].cx, bd.cross[i].cy)){
					if(bd.cross[i].numobj){ bd.cross[i].numobj.hide();}
					if(!bd.isNullCross(i)){ um.addOpe('cross', 'cross', i, bd.cross[i], 0);}
					margin++;
				}
				else if(margin>0){ bd.cross[i-margin] = bd.cross[i];}
			}
			for(var i=0;i<number+1;i++){ bd.cross.pop(); bd.crosses.pop();}
		}
		if(k.isborder){
			var func2;
			if     (rc=='r'){ func2 = function(cx,cy){ var h=k.qrows+tf*(cy-k.qrows); return (h==1||h==2);};}
			else if(rc=='c'){ func2 = function(cx,cy){ var w=k.qcols+tf*(cx-k.qcols); return (w==1||w==2);};}
			bd.bdinside = (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);
			margin = 0;
			for(var i=0;i<bd.border.length;i++){
				if(func2(bd.border[i].cx, bd.border[i].cy)){
					if(bd.border[i].numobj){ bd.border[i].numobj.hide();}
					if(!bd.isNullBorder(i)){ um.addOpe('border', 'border', i, bd.border[i], 0);}
					margin++;
				}
				else if(margin>0){ bd.border[i-margin] = bd.border[i];}
			}
			for(var i=0;i<2*number-1+(k.isoutsideborder==0?0:2);i++){ bd.border.pop(); bd.borders.pop();}
		}
		if(k.isextendcell!=0){
			margin = 0;
			for(var i=0;i<bd.excell.length;i++){
				if(func(bd.excell[i].cx, bd.excell[i].cy)){
					if(bd.excell[i].numobj) { bd.excell[i].numobj.hide();}
					if(bd.excell[i].numobj2){ bd.excell[i].numobj2.hide();}
					if(!bd.isNullCell(i)){ um.addOpe('excell', 'excell', i, bd.excell[i], 0);}
					margin++;
				}
				else if(margin>0){ bd.excell[i-margin] = bd.excell[i];}
			}
			for(var i=0;i<k.isextendcell;i++){ bd.excell.pop();}
		}

		if(rc=='c'){ k.qcols--; tc.maxx-=2;}else if(rc=='r'){ k.qrows--; tc.maxy-=2;}

		bd.setposAll();
		if(k.isOneNumber){
			room.resetRarea();
			for(var i=0;i<qnums.length;i++){ bd.sQnC(room.getTopOfRoom(qnums[i].areaid), qnums[i].val);}
		}
		this.adjustSpecial2(6,key);
		ans.resetLcount();
		return true;
	},
	reduceborder : function(key){
		for(var i=0;i<bd.border.length;i++){
			var source = -1;
			if(k.isborderAsLine==1){
				if     (key=='up' && bd.border[i].cy==0        ){ source = bd.bnum(bd.border[i].cx, 2          );}
				else if(key=='dn' && bd.border[i].cy==2*k.qrows){ source = bd.bnum(bd.border[i].cx, 2*k.qrows-2);}
				else if(key=='lt' && bd.border[i].cx==0        ){ source = bd.bnum(2,           bd.border[i].cy);}
				else if(key=='rt' && bd.border[i].cx==2*k.qcols){ source = bd.bnum(2*k.qcols-2, bd.border[i].cy);}

				if(source!=-1){
					bd.sQuB(i, bd.QuB(source)); bd.sQuB(source,  0);
					bd.sQaB(i, bd.QaB(source)); bd.sQaB(source, -1);
					bd.sQsB(i, bd.QsB(source)); bd.sQsB(source, -1);
				}
			}
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.popupflip()   "回転・反転"でボタンが押された時の動作を指定する
	// menu.ex.flipy()       上下反転を実行する
	// menu.ex.flipx()       左右反転を実行する
	// menu.ex.turnr()       右90°回転を実行する
	// menu.ex.turnl()       左90°回転を実行する
	// menu.ex.turn2()       turnr(),turnl()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	popupflip : function(e){
		if(menu.pop){
			um.newOperation(true);

			switch(getSrcElement(e).name){
				case "turnl": this.turnl(0,0,k.qcols-1,k.qrows-1); break;
				case "turnr": this.turnr(0,0,k.qcols-1,k.qrows-1); break;
				case "flipy": this.flipy(0,0,k.qcols-1,k.qrows-1); break;
				case "flipx": this.flipx(0,0,k.qcols-1,k.qrows-1); break;
			}

			um.addOpe('board', getSrcElement(e).name, 0, 0, 1);

			tc.Adjust();
			room.resetRarea();
			base.resize_canvas();				// Canvasを更新する
		}
	},
	// 回転・反転(上下反転)
	flipy : function(rx1,ry1,rx2,ry2){
		this.adjustSpecial(1,'');
		this.adjustGeneral(1,'',rx1,ry1,rx2,ry2);

		for(var cy=ry1;cy<(ry2+ry1)/2;cy++){
			for(var cx=rx1;cx<=rx2;cx++){
				var c = bd.cell[bd.cnum(cx,cy)];
				bd.cell[bd.cnum(cx,cy)] = bd.cell[bd.cnum(cx,(ry1+ry2)-cy)];
				bd.cell[bd.cnum(cx,(ry1+ry2)-cy)] = c;
			}
		}
		if(k.iscross){
			for(var cy=ry1;cy<(ry2+ry1+1)/2;cy++){
				for(var cx=rx1;cx<=rx2+1;cx++){
					var c = bd.cross[bd.xnum(cx,cy)];
					bd.cross[bd.xnum(cx,cy)] = bd.cross[bd.xnum(cx,(ry1+ry2+1)-cy)];
					bd.cross[bd.xnum(cx,(ry1+ry2+1)-cy)] = c;
				}
			}
		}
		if(k.isborder){
			for(var cy=ry1*2;cy<(ry2+ry1)*2/2+1;cy++){
				for(var cx=rx1*2;cx<=(rx2+1)*2;cx++){
					if(bd.bnum(cx,cy)==-1){ continue;}
					var c = bd.border[bd.bnum(cx,cy)];
					bd.border[bd.bnum(cx,cy)] = bd.border[bd.bnum(cx,(ry1+ry2+1)*2-cy)];
					bd.border[bd.bnum(cx,(ry1+ry2+1)*2-cy)] = c;
				}
			}
		}
		if(k.isextendcell==1){
			for(var cy=ry1;cy<(ry2+ry1)/2;cy++){
				var c = bd.excell[bd.exnum(-1,cy)];
				bd.excell[bd.exnum(-1,cy)] = bd.excell[bd.exnum(-1,(ry1+ry2)-cy)];
				bd.excell[bd.exnum(-1,(ry1+ry2)-cy)] = c;
			}
		}
		else if(k.isextendcell==2){
			for(var cy=ry1-1;cy<(ry2+ry1)/2;cy++){
				for(var cx=rx1-1;cx<=rx2+1;cx++){
					if(bd.exnum(cx,cy)==-1){ continue;}
					var c = bd.excell[bd.exnum(cx,cy)];
					bd.excell[bd.exnum(cx,cy)] = bd.excell[bd.exnum(cx,(ry1+ry2)-cy)];
					bd.excell[bd.exnum(cx,(ry1+ry2)-cy)] = c;
				}
			}
		}

		bd.setposAll();
		this.adjustSpecial2(1,'');
		ans.resetLcount();
	},
	// 回転・反転(左右反転)
	flipx : function(rx1,ry1,rx2,ry2){
		this.adjustSpecial(2,'');
		this.adjustGeneral(2,'',rx1,ry1,rx2,ry2);

		for(var cx=rx1;cx<(rx2+rx1)/2;cx++){
			for(var cy=ry1;cy<=ry2;cy++){
				var c = bd.cell[bd.cnum(cx,cy)];
				bd.cell[bd.cnum(cx,cy)] = bd.cell[bd.cnum((rx1+rx2)-cx,cy)];
				bd.cell[bd.cnum((rx1+rx2)-cx,cy)] = c;
			}
		}
		if(k.iscross){
			for(var cx=rx1;cx<(rx2+rx1+1)/2;cx++){
				for(var cy=ry1;cy<=ry2+1;cy++){
					var c = bd.cross[bd.xnum(cx,cy)];
					bd.cross[bd.xnum(cx,cy)] = bd.cross[bd.xnum((rx1+rx2+1)-cx,cy)];
					bd.cross[bd.xnum((rx1+rx2+1)-cx,cy)] = c;
				}
			}
		}
		if(k.isborder){
			for(var cx=rx1*2;cx<(rx2+rx1)*2/2+1;cx++){
				for(var cy=ry1*2;cy<=(ry2+1)*2;cy++){
					if(bd.bnum(cx,cy)==-1){ continue;}
					var c = bd.border[bd.bnum(cx,cy)];
					bd.border[bd.bnum(cx,cy)] = bd.border[bd.bnum((rx1+rx2+1)*2-cx,cy)];
					bd.border[bd.bnum((rx1+rx2+1)*2-cx,cy)] = c;
				}
			}
		}
		if(k.isextendcell==1){
			for(var cx=rx1;cx<(rx2+rx1)/2;cx++){
				var c = bd.excell[bd.exnum(cx,-1)];
				bd.excell[bd.exnum(cx,-1)] = bd.excell[bd.exnum((rx1+rx2)-cx,-1)];
				bd.excell[bd.exnum((rx1+rx2)-cx,-1)] = c;
			}
		}
		else if(k.isextendcell==2){
			for(var cx=rx1-1;cx<(rx2+rx1)/2;cx++){
				for(var cy=ry1-1;cy<=ry2+1;cy++){
					if(bd.exnum(cx,cy)==-1){ continue;}
					var c = bd.excell[bd.exnum(cx,cy)];
					bd.excell[bd.exnum(cx,cy)] = bd.excell[bd.exnum((rx1+rx2)-cx,cy)];
					bd.excell[bd.exnum((rx1+rx2)-cx,cy)] = c;
				}
			}
		}

		bd.setposAll();
		this.adjustSpecial2(2,'');
		ans.resetLcount();
	},
	// 回転・反転(右90°回転)
	turnr : function(rx1,ry1,rx2,ry2){ this.turn2(rx1,ry1,rx2,ry2,1); },
	// 回転・反転(左90°回転)
	turnl : function(rx1,ry1,rx2,ry2){ this.turn2(rx1,ry1,rx2,ry2,2); },
	turn2 : function(rx1,ry1,rx2,ry2,f){
		this.adjustSpecial(f+2,'');
		this.adjustGeneral(f+2,'',rx1,ry1,rx2,ry2);

		var tmp = k.qcols; k.qcols = k.qrows; k.qrows = tmp;
		tmp = tc.maxx; tc.maxx = tc.maxy; tc.maxy = tmp;

		bd.setposAll();

		var cnt = k.qcols*k.qrows;
		var ch = new Array(); for(var i=0;i<cnt;i++){ ch[i]=1;}
		while(cnt>0){
			var tmp, source, prev, target, nex;
			for(source=0;source<k.qcols*k.qrows;source++){ if(ch[source]==1){ break;}}
			tmp = bd.cell[source]; target = source;
			while(true){
//				alert(""+(bd.cell[target].cy)+" "+(bd.cell[target].cx));
				if(f==1){ nex = bd.cnum2(bd.cell[target].cy, (ry2+ry1)-bd.cell[target].cx, k.qrows, k.qcols);}
				else{ nex = bd.cnum2((rx2+rx1)-bd.cell[target].cy, bd.cell[target].cx, k.qrows, k.qcols);}
				if(nex==source){ break;}
				bd.cell[target] = bd.cell[nex]; ch[target]=0; cnt--; target = nex;
			}
			bd.cell[target] = tmp; ch[target]=0; cnt--; 
		}
		if(k.iscross){
			cnt = (k.qcols+1)*(k.qrows+1);
			ch = new Array(); for(var i=0;i<cnt;i++){ ch[i]=1;}
			while(cnt>0){
				var tmp, source, prev, target, nex;
				for(source=0;source<(k.qcols+1)*(k.qrows+1);source++){ if(ch[source]==1){ break;}}
				tmp = bd.cross[source]; target = source;
				while(true){
					nex = bd.xnum2(bd.cross[target].cy, (ry2+ry1+1)-bd.cross[target].cx, k.qrows, k.qcols);
					if(f==1){ nex = bd.xnum2(bd.cross[target].cy, (ry2+ry1+1)-bd.cross[target].cx, k.qrows, k.qcols);}
					else{ nex = bd.xnum2((rx2+rx1+1)-bd.cross[target].cy, bd.cross[target].cx, k.qrows, k.qcols);}
					if(nex==source){ break;}
					bd.cross[target] = bd.cross[nex]; ch[target]=0; cnt--; target = nex;
				}
				bd.cross[target] = tmp; ch[target]=0; cnt--; 
			}
		}
		if(k.isborder){
			cnt = bd.bdinside+(k.isoutsideborder==0?0:2*(k.qcols+k.qrows));
			ch = new Array(); for(var i=0;i<cnt;i++){ ch[i]=1;}
			while(cnt>0){
				var tmp, source, prev, target, nex;
				for(source=0;source<bd.bdinside+(k.isoutsideborder==0?0:2*(k.qcols+k.qrows));source++){ if(ch[source]==1){ break;}}
				tmp = bd.border[source]; target = source;
				while(true){
					nex = bd.bnum2(bd.border[target].cy, (ry2+ry1+1)*2-bd.border[target].cx, k.qrows, k.qcols);
					if(f==1){ nex = bd.bnum2(bd.border[target].cy, (ry2+ry1+1)*2-bd.border[target].cx, k.qrows, k.qcols);}
					else{ nex = bd.bnum2((rx2+rx1+1)*2-bd.border[target].cy, bd.border[target].cx, k.qrows, k.qcols);}
					if(nex==source){ break;}
					bd.border[target] = bd.border[nex]; ch[target]=0; cnt--; target = nex;
				}
				bd.border[target] = tmp; ch[target]=0; cnt--;
			}
		}
		if(k.isextendcell==2){
			cnt = 2*(k.qcols+k.qrows)+4;
			ch = new Array(); for(var i=0;i<cnt;i++){ ch[i]=1;}
			while(cnt>0){
				var tmp, source, prev, target, nex;
				for(source=0;source<2*(k.qcols+k.qrows)+4;source++){ if(ch[source]==1){ break;}}
				tmp = bd.excell[source]; target = source;
				while(true){
					if(f==1){ nex = bd.exnum2(bd.excell[target].cy, (ry2+ry1)-bd.excell[target].cx, k.qrows, k.qcols);}
					else{ nex = bd.exnum2((rx2+rx1)-bd.excell[target].cy, bd.excell[target].cx, k.qrows, k.qcols);}
					if(nex==source){ break;}
					bd.excell[target] = bd.excell[nex]; ch[target]=0; cnt--; target = nex;
				}
				bd.excell[target] = tmp; ch[target]=0; cnt--; 
			}
		}

		bd.setposAll();
		this.adjustSpecial2(f+2,'');
		ans.resetLcount();
	},

	//------------------------------------------------------------------------------
	// menu.ex.adjustGeneral()  回転・反転時に各セルの調節を行う(共通処理)
	// menu.ex.adjustSpecial()  回転・反転・盤面調節開始前に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustSpecial2() 回転・反転・盤面調節終了後に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustQues51_1() [＼]セルの調整(adjustSpecial関数に代入する用)
	// menu.ex.adjustQues51_2() [＼]セルの調整(adjustSpecial2関数に代入する用)
	//------------------------------------------------------------------------------

	adjustGeneral : function(type,key,rx1,ry1,rx2,ry2){
		um.disableRecord();
		for(var cy=ry1;cy<=ry2;cy++){
			for(var cx=rx1;cx<=rx2;cx++){
				var c = bd.cnum(cx,cy);

				switch(type){
				case 1: // 上下反転
					if(true){
						var val = ({2:5,3:4,4:3,5:2,104:107,105:106,106:105,107:104})[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!=1){
						var val = ({1:2,2:1})[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 2: // 左右反転
					if(true){
						var val = ({2:3,3:2,4:5,5:4,104:105,105:104,106:107,107:106})[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!=1){
						var val = ({3:4,4:3})[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 3: // 右90°反転
					if(true){
						var val = {2:5,3:2,4:3,5:4,21:22,22:21,102:103,103:102,104:107,105:104,106:105,107:106}[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!=1){
						var val = {1:4,2:3,3:1,4:2}[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 4: // 左90°反転
					if(true){
						var val = {2:3,3:4,4:5,5:2,21:22,22:21,102:103,103:102,104:105,105:106,106:107,107:104}[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!=1){
						var val = {1:3,2:4,3:2,4:1}[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 5: // 盤面拡大
					break;
				case 6: // 盤面縮小
					break;
				}
			}
		}
		um.enableRecord();
	},
	adjustQues51_1 : function(type,key){
		this.qnumw = new Array();
		this.qnumh = new Array();

		for(var cy=0;cy<=k.qrows-1;cy++){
			this.qnumw[cy] = [bd.QnE(bd.exnum(-1,cy))];
			for(var cx=0;cx<=k.qcols-1;cx++){
				if(bd.QuC(bd.cnum(cx,cy))==51){ this.qnumw[cy].push(bd.QnC(bd.cnum(cx,cy)));}
			}
		}
		for(var cx=0;cx<=k.qcols-1;cx++){
			this.qnumh[cx] = [bd.DiE(bd.exnum(cx,-1))];
			for(var cy=0;cy<=k.qrows-1;cy++){
				if(bd.QuC(bd.cnum(cx,cy))==51){ this.qnumh[cx].push(bd.DiC(bd.cnum(cx,cy)));}
			}
		}
	},
	adjustQues51_2 : function(type,key){
		um.disableRecord();
		var idx;
		switch(type){
		case 1: // 上下反転
			for(var cx=0;cx<=k.qcols-1;cx++){
				idx = 1; this.qnumh[cx] = this.qnumh[cx].reverse();
				bd.sDiE(bd.exnum(cx,-1), this.qnumh[cx][0]);
				for(var cy=0;cy<=k.qrows-1;cy++){
					if(bd.QuC(bd.cnum(cx,cy))==51){ bd.sDiC(bd.cnum(cx,cy), this.qnumh[cx][idx]); idx++;}
				}
			}
			break;
		case 2: // 左右反転
			for(var cy=0;cy<=k.qrows-1;cy++){
				idx = 1; this.qnumw[cy] = this.qnumw[cy].reverse();
				bd.sQnE(bd.exnum(-1,cy), this.qnumw[cy][0]);
				for(var cx=0;cx<=k.qcols-1;cx++){
					if(bd.QuC(bd.cnum(cx,cy))==51){ bd.sQnC(bd.cnum(cx,cy), this.qnumw[cy][idx]); idx++;}
				}
			}
			break;
		case 3: // 右90°反転
			for(var cy=0;cy<=k.qrows-1;cy++){
				idx = 1; this.qnumh[cy] = this.qnumh[cy].reverse();
				bd.sQnE(bd.exnum(-1,cy), this.qnumh[cy][0]);
				for(var cx=0;cx<=k.qcols-1;cx++){
					if(bd.QuC(bd.cnum(cx,cy))==51){ bd.sQnC(bd.cnum(cx,cy), this.qnumh[cy][idx]); idx++;}
				}
			}
			for(var cx=0;cx<=k.qcols-1;cx++){
				idx = 1;
				bd.sDiE(bd.exnum(cx,-1), this.qnumw[k.qcols-1-cx][0]);
				for(var cy=0;cy<=k.qrows-1;cy++){
					if(bd.QuC(bd.cnum(cx,cy))==51){ bd.sDiC(bd.cnum(cx,cy), this.qnumw[k.qcols-1-cx][idx]); idx++;}
				}
			}
			break;
		case 4: // 左90°反転
			for(var cy=0;cy<=k.qrows-1;cy++){
				idx = 1;
				bd.sQnE(bd.exnum(-1,cy), this.qnumh[k.qrows-1-cy][0]);
				for(var cx=0;cx<=k.qcols-1;cx++){
					if(bd.QuC(bd.cnum(cx,cy))==51){ bd.sQnC(bd.cnum(cx,cy), this.qnumh[k.qrows-1-cy][idx]); idx++;}
				}
			}
			for(var cx=0;cx<=k.qcols-1;cx++){
				idx = 1; this.qnumw[cx] = this.qnumw[cx].reverse();
				bd.sDiE(bd.exnum(cx,-1), this.qnumw[cx][0]);
				for(var cy=0;cy<=k.qrows-1;cy++){
					if(bd.QuC(bd.cnum(cx,cy))==51){ bd.sDiC(bd.cnum(cx,cy), this.qnumw[cx][idx]); idx++;}
				}
			}
			break;
		}
		um.enableRecord();
	},
	adjustSpecial  : function(type,key){ },
	adjustSpecial2 : function(type,key){ },

	//------------------------------------------------------------------------------
	// menu.ex.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ex.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(confirm(lang.isJP()?"回答を消去しますか？":"Do you want to erase the Answer?")){
			um.newOperation(true);
			for(var i=0;i<bd.cell.length;i++){
				if(bd.QaC(i)!=0){ um.addOpe('cell','qans',i,bd.QaC(i),0);}
				if(bd.QsC(i)!=0){ um.addOpe('cell','qsub',i,bd.QsC(i),0);}
			}
			if(k.isborder){
				var val = (k.puzzleid!="bosanowa"?0:-1);
				for(var i=0;i<bd.border.length;i++){
					if(bd.QaB(i)!=0){ um.addOpe('border','qans',i,bd.QaB(i),0);}
					if(bd.QsB(i)!=val){ um.addOpe('border','qsub',i,bd.QsB(i),val);}
					if(bd.LiB(i)!=0){ um.addOpe('border','line',i,bd.LiB(i),0);}
				}
			}
			if(!g.vml){ pc.flushCanvasAll();}
			bd.ansclear();
		}
	},
	ASconfirm : function(){
		if(confirm(lang.isJP()?"補助記号を消去しますか？":"Do you want to erase the auxiliary marks?")){
			um.newOperation(true);
			for(var i=0;i<bd.cell.length;i++){
				if(bd.QsC(i)!=0){ um.addOpe('cell','qsub',i,bd.QsC(i),0);}
			}
			if(k.isborder){
				var val = (k.puzzleid!="bosanowa"?0:-1);
				for(var i=0;i<bd.border.length;i++){
					if(bd.QsB(i)!=val){ um.addOpe('border','qsub',i,bd.QsB(i),val);}
				}
			}
			if(!g.vml){ pc.flushCanvasAll();}
			bd.subclear();
		}
	}
};
