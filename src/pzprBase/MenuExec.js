// MenuExec.js v3.3.0

//---------------------------------------------------------------------------
// ★MenuExecクラス ポップアップウィンドウ内でボタンが押された時の処理内容を記述する
//---------------------------------------------------------------------------

// Menuクラス実行部
MenuExec = function(){
	this.displaymanage = true;
	this.qnumw;	// Ques==51の回転･反転用
	this.qnumh;	// Ques==51の回転･反転用
	this.qnums;	// reduceでisOneNumber時の後処理用

	this.reader;	// FileReaderオブジェクト
	this.enableReadText = false;

	// expand/reduce処理用
	this.insex = {};
	this.insex[k.CELL]   = {1:true};
	this.insex[k.CROSS]  = (k.iscross===1 ? {2:true} : {0:true});
	this.insex[k.BORDER] = {1:true, 2:true};
	this.insex[k.EXCELL] = {1:true};

	// 定数
	this.EXPAND = 0x10;
	this.REDUCE = 0x20;
	this.TURN   = 0x40;
	this.FLIP   = 0x80;
	this.TURNFLIP = this.TURN|this.FLIP;

	this.EXPANDUP = this.EXPAND|k.UP;
	this.EXPANDDN = this.EXPAND|k.DN;
	this.EXPANDLT = this.EXPAND|k.LT;
	this.EXPANDRT = this.EXPAND|k.RT;

	this.REDUCEUP = this.REDUCE|k.UP;
	this.REDUCEDN = this.REDUCE|k.DN;
	this.REDUCELT = this.REDUCE|k.LT;
	this.REDUCERT = this.REDUCE|k.RT;

	this.TURNL = this.TURN|1;
	this.TURNR = this.TURN|2;

	this.FLIPX = this.FLIP|1;
	this.FLIPY = this.FLIP|2;

	this.boardtype = {
		expandup: [this.REDUCEUP, this.EXPANDUP],
		expanddn: [this.REDUCEDN, this.EXPANDDN],
		expandlt: [this.REDUCELT, this.EXPANDLT],
		expandrt: [this.REDUCERT, this.EXPANDRT],
		reduceup: [this.EXPANDUP, this.REDUCEUP],
		reducedn: [this.EXPANDDN, this.REDUCEDN],
		reducelt: [this.EXPANDLT, this.REDUCELT],
		reducert: [this.EXPANDRT, this.REDUCERT],

		turnl: [this.TURNR, this.TURNL],
		turnr: [this.TURNL, this.TURNR],
		flipy: [this.FLIPY, this.FLIPY],
		flipx: [this.FLIPX, this.FLIPX]
	};
};
MenuExec.prototype = {
	//------------------------------------------------------------------------------
	// menu.ex.init() オブジェクトの初期化処理
	//------------------------------------------------------------------------------
	init : function(){
		if(typeof FileReader == 'undefined'){
			this.reader = null;

			if(typeof FileList != 'undefined' &&
			   typeof File.prototype.getAsText != 'undefined')
			{
				this.enableGetText = true;
			}
		}
		else{
			this.reader = new FileReader();
			this.reader.onload = ee.ebinder(this, function(e){
				this.fileonload(ee.getSrcElement(e).result);
			});
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		k.editmode = (num==1);
		k.playmode = (num==3);
		kc.prev = -1;
		ans.errDisp=true;
		bd.errclear();
		if(kp.ctl[1].enable || kp.ctl[3].enable){ pp.funcs.keypopup();}
		tc.setAlign();
		pc.paintAll();
	},

	//------------------------------------------------------------------------------
	// menu.ex.newboard()  新規盤面を作成する
	//------------------------------------------------------------------------------
	newboard : function(e){
		if(menu.pop){
			var col,row;
			if(k.puzzleid!=="sudoku"){
				col = mf(parseInt(document.newboard.col.value));
				row = mf(parseInt(document.newboard.row.value));
			}
			else{
				if     (document.newboard.size[0].checked){ col=row= 9;}
				else if(document.newboard.size[1].checked){ col=row=16;}
				else if(document.newboard.size[2].checked){ col=row=25;}
				else if(document.newboard.size[3].checked){ col=row= 4;}
			}

			if(col>0 && row>0){ bd.initBoardSize(col,row);}
			menu.popclose();

			base.resetInfo(true);
			base.resize_canvas();				// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.urlinput()   URLを入力する
	// menu.ex.urloutput()  URLを出力する
	// menu.ex.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(menu.pop){
			enc.parseURI(document.urlinput.ta.value);
			enc.pzlinput();

			tm.reset();
			menu.popclose();
		}
	},
	urloutput : function(e){
		if(menu.pop){
			switch(ee.getSrcElement(e).name){
				case "pzprv3":     document.urloutput.ta.value = enc.pzloutput(enc.PZPRV3);  break;
				case "pzprapplet": document.urloutput.ta.value = enc.pzloutput(enc.PAPRAPP); break;
				case "kanpen":     document.urloutput.ta.value = enc.pzloutput(enc.KANPEN);  break;
				case "pzprv3edit": document.urloutput.ta.value = enc.pzloutput(enc.PZPRV3E); break;
				case "heyaapp":    document.urloutput.ta.value = enc.pzloutput(enc.HEYAAPP); break;
			}
		}
	},
	openurl : function(e){
		if(menu.pop){
			if(document.urloutput.ta.value!==''){
				var win = window.open(document.urloutput.ta.value, '', '');
			}
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.fileopen()   ファイルを開く
	// menu.ex.fileonload() File API用ファイルを開いたイベントの処理
	// menu.ex.filesave()   ファイルを保存する
	//------------------------------------------------------------------------------
	fileopen : function(e){
		if(menu.pop){ menu.popclose();}
		var fileEL = document.fileform.filebox;

		if(!!this.reader || this.enableGetText){
			var fitem = fileEL.files[0];
			if(!fitem){ return;}

			if(!!this.reader){ this.reader.readAsText(fitem);}
			else             { this.fileonload(fitem.getAsText(''));}
		}
		else{
			if(!fileEL.value){ return;}
			document.fileform.submit();
		}

		document.fileform.reset();
		tm.reset();
	},
	fileonload : function(data){
		var farray = data.split(/[\t\r\n]+/);
		var fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"/");
		}

		fio.filedecode(fstr);

		document.fileform.reset();
		tm.reset();
	},

	filesave : function(ftype){
		var fname = prompt("保存するファイル名を入力して下さい。", k.puzzleid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		document.fileform2.filename.value = fname;

		if     (navigator.platform.indexOf("Win")!==-1){ document.fileform2.platform.value = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ document.fileform2.platform.value = "Mac";}
		else                                           { document.fileform2.platform.value = "Others";}

		document.fileform2.ques.value   = fio.fileencode(ftype);
		document.fileform2.urlstr.value = fio.urlstr;
		document.fileform2.operation.value = 'save';

		document.fileform2.submit();
	},

	//------------------------------------------------------------------------------
	// menu.ex.imagesave() 画像を保存する
	//------------------------------------------------------------------------------
	imagesave : function(isDL){
		// 現在の設定を保存する
		var temp_flag   = pc.fillTextPrecisely;
		var temp_margin = k.bdmargin;
		var temp_cursor = pp.getVal('cursor');

		// 設定値・変数をcanvas用のものに変更
		pc.fillTextPrecisely = true;
		k.bdmargin = k.bdmargin_image;
		pp.setVal('cursor', false, false);
		g = ee('divques_sub').el.getContext("2d");

		// canvas要素の設定を適用して、再描画
		base.resize_canvas();

		// canvasの描画内容をDataURLとして取得する
		var url = g.canvas.toDataURL();

		if(isDL){
			document.fileform2.filename.value  = k.puzzleid+'.gif';
			document.fileform2.urlstr.value    = url.replace('data:image/png;base64,', '');
			document.fileform2.operation.value = 'imagesave';
			document.fileform2.submit();
		}
		else{
			window.open(url, '', '');
		}

		// 設定値・変数を元に戻す
		pc.fillTextPrecisely = temp_flag;
		k.bdmargin = temp_margin;
		pp.setVal('cursor', temp_cursor, false);
		base.initCanvas();

		// その他の設定を元に戻して、再描画
		base.resize_canvas();
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(menu.pop){
			var csize = parseInt(document.dispsize.cs.value);
			if(csize>0){ k.cellsize = mf(csize);}

			menu.popclose();
			base.resize_canvas();	// Canvasを更新する
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.irowakeRemake() 「色分けしなおす」ボタンを押した時に色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		line.newIrowake();
		if(pp.getVal('irowake')){ pc.paintAll();}
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispman()    管理領域を隠す/表示するが押された時に動作する
	// menu.ex.dispmanstr() 管理領域を隠す/表示するにどの文字列を表示するか
	//------------------------------------------------------------------------------
	dispman : function(e){
		var idlist = ['expression','usepanel','checkpanel'];
		var seplist = k.EDITOR ? ['separator1'] : ['separator1','separator2'];

		if(this.displaymanage){
			for(var i=0;i<idlist.length;i++)        { ee(idlist[i])  .el.style.display = 'none';}
			for(var i=0;i<seplist.length;i++)       { ee(seplist[i]) .el.style.display = 'none';}
			if(k.irowake!=0 && pp.getVal('irowake')){ ee('btncolor2').el.style.display = 'inline';}
			ee('menuboard').el.style.paddingBottom = '0pt';
		}
		else{
			for(var i=0;i<idlist.length;i++)        { ee(idlist[i])  .el.style.display = 'block';}
			for(var i=0;i<seplist.length;i++)       { ee(seplist[i]) .el.style.display = 'block';}
			if(k.irowake!=0 && pp.getVal('irowake')){ ee("btncolor2").el.style.display = 'none';}
			ee('menuboard').el.style.paddingBottom = '8pt';
		}
		this.displaymanage = !this.displaymanage;
		this.dispmanstr();

		base.resize_canvas();	// canvasの左上座標等を更新して再描画
	},
	dispmanstr : function(){
		if(!this.displaymanage){ ee('ms_manarea').el.innerHTML = menu.isLangJP()?"管理領域を表示":"Show management area";}
		else                   { ee('ms_manarea').el.innerHTML = menu.isLangJP()?"管理領域を隠す":"Hide management area";}
	},

	//------------------------------------------------------------------------------
	// menu.ex.popupadjust()  "盤面の調整""回転・反転"でボタンが押された時に
	//                        対応する関数へジャンプする
	//------------------------------------------------------------------------------
	popupadjust : function(e){
		if(menu.pop){
			um.newOperation(true);

			var name = ee.getSrcElement(e).name;
			if(name.indexOf("reduce")===0){
				if(name==="reduceup"||name==="reducedn"){
					if(k.qrows<=1){ return;}
				}
				else if(name==="reducelt"||name==="reducert"){
					if(k.qcols<=1 && (k.puzzleid!=="tawa" || bd.lap!==3)){ return;}
				}
			}

			var d = {x1:0, y1:0, x2:2*k.qcols, y2:2*k.qrows};
			um.disableInfo();
			if (name.match(/(expand|reduce)/)){ this.expandreduce(this.boardtype[name][1],d);}
			else if(name.match(/(turn|flip)/)){ this.turnflip    (this.boardtype[name][1],d);}
			um.enableInfo();

			// reduceはここ必須
			um.addOpe(k.BOARD, name, 0, this.boardtype[name][0], this.boardtype[name][1]);

			bd.setminmax();
			if(!um.undoExec){ base.resetInfo(false);}
			base.resize_canvas();				// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.expandreduce() 盤面の拡大・縮小を実行する
	// menu.ex.expandGroup()  オブジェクトの追加を行う
	// menu.ex.reduceGroup()  オブジェクトの消去を行う
	//------------------------------------------------------------------------------
	expandreduce : function(key,d){
		this.adjustSpecial(key,d);
		this.adjustGeneral(key,d);
		if((key & this.REDUCE) && k.roomNumber){ this.adjustForRoomNumber(key);}

		if(key & this.EXPAND){
			if     (key===this.EXPANDUP||key===this.EXPANDDN){ k.qrows++;}
			else if(key===this.EXPANDLT||key===this.EXPANDRT){ k.qcols++;}

							{ this.expandGroup(k.CELL,   bd.cell,   key);}
			if(!!k.iscross) { this.expandGroup(k.CROSS,  bd.cross,  key);}
			if(!!k.isborder){ this.expandGroup(k.BORDER, bd.border, key);}
			if(!!k.isexcell){ this.expandGroup(k.EXCELL, bd.excell, key);}
		}
		else if(key & this.REDUCE){
							{ this.reduceGroup(k.CELL,   bd.cell,   key);}
			if(!!k.iscross) { this.reduceGroup(k.CROSS,  bd.cross,  key);}
			if(!!k.isborder){ this.reduceGroup(k.BORDER, bd.border, key);}
			if(!!k.isexcell){ this.reduceGroup(k.EXCELL, bd.excell, key);}

			if     (key===this.REDUCEUP||key===this.REDUCEDN){ k.qrows--;}
			else if(key===this.REDUCELT||key===this.REDUCERT){ k.qcols--;}
		}

		bd.setposAll();

		if((key & this.REDUCE) && k.roomNumber){ this.adjustForRoomNumber2(key);}
		this.adjustSpecial2(key,d);
	},
	expandGroup : function(type,group,key){
		var margin = group.length;
		bd.initGroup(type, group, k.qcols, k.qrows);
		margin = group.length-margin;

		this.setposObj(type);
		for(var i=group.length-1;i>=0;i--){
			if(!!this.insex[type][this.distObj(key,type,i)]){
				group[i] = bd.getnewObj(type,i);
				margin--;
			}
			else if(margin>0){ group[i] = group[i-margin];}
		}

		if(type===k.BORDER){ this.expandborder(key);}
	},
	reduceGroup : function(type,group,key){
		if(type===k.BORDER){ this.reduceborder(key);}

		var margin=0;
		for(var i=0;i<group.length;i++){
			if(!!this.insex[type][this.distObj(key,type,i)]){
				if(!bd.isNullObj(type,i)){ um.addObj(type,i);}
				margin++;
			}
			else if(margin>0){ group[i-margin] = group[i];}
		}
		for(var i=0;i<margin;i++){ group.pop();}
	},

	adjustForRoomNumber : function(key){
		this.qnums = [];
		for(var i=0;i<bd.cell.length;i++){
			if(!!this.insex[k.CELL][this.distObj(key,k.CELL,i)] && bd.cell[i].qnum!==-1){
				this.qnums.push({ areaid:area.getRoomID(i), val:bd.cell[i].qnum});
			}
		}
	},
	adjustForRoomNumber2 : function(key){
		area.resetArea();
		for(var i=0;i<this.qnums.length;i++){
			bd.sQnC(area.getTopOfRoom(this.qnums[i].areaid), this.qnums[i].val);
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.turnflip()      回転・反転処理を実行する
	// menu.ex.turnflipGroup() turnflip()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	turnflip : function(key,d){
		this.adjustSpecial(key,d);
		this.adjustGeneral(key,d);

		if(key & this.TURN){
			var tmp = k.qcols; k.qcols = k.qrows; k.qrows = tmp;
			bd.setposAll();
			d = {x1:0, y1:0, x2:2*k.qcols, y2:2*k.qrows};
		}

						{ this.turnflipGroup(k.CELL,   bd.cell,   key, d);}
		if(!!k.iscross) { this.turnflipGroup(k.CROSS,  bd.cross,  key, d);}
		if(!!k.isborder){ this.turnflipGroup(k.BORDER, bd.border, key, d);}
		if(!!k.isexcell){
			if(k.isexcell===1 && (key & this.FLIP)){ var d2;
				if     (key===this.FLIPY){ d2 = {x1:-1, y1:0, x2:-1, y2:2*k.qrows};}
				else if(key===this.FLIPX){ d2 = {x1:0, y1:-1, x2:2*k.qcols, y2:-1};}
				this.turnflipGroup(k.EXCELL, bd.excell, key, d2);
			}
			else if(k.isexcell===2){ this.turnflipGroup(k.EXCELL, bd.excell, key, d);}
		}

		bd.setposAll();
		this.adjustSpecial2(key,d);
	},
	turnflipGroup : function(type,group,key,d){
		var getnext, idlist=[];
		switch(type){
			case k.CELL:   getnext=((key & this.FLIP) ? bd.cnum : bd.cnum2); idlist=bd.cellinside  (d.x1,d.y1,d.x2,d.y2); break;
			case k.CROSS:  getnext=((key & this.FLIP) ? bd.xnum : bd.xnum2); idlist=bd.crossinside (d.x1,d.y1,d.x2,d.y2); break;
			case k.BORDER: getnext=((key & this.FLIP) ? bd.bnum : bd.bnum2); idlist=bd.borderinside(d.x1,d.y1,d.x2,d.y2); break;
			case k.EXCELL: getnext=((key & this.FLIP) ?bd.exnum :bd.exnum2); idlist=bd.excellinside(d.x1,d.y1,d.x2,d.y2); break;
		}

		var ch=[];
		for(var i=0;i<idlist.length;i++){ ch[idlist[i]]=false;}

		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		for(var source=0;source<group.length;source++){
			if(ch[source]!==false){ continue;}

			var tmp = group[source], target = source;
			while(ch[target]===false){
				ch[target]=true;
				// nextになるものがtargetに移動してくる、、という考えかた。
				// ここでは移動前のIDを取得しています
				switch(key){
					case this.FLIPY: next = getnext.call(bd, group[target].bx, yy-group[target].by); break;
					case this.FLIPX: next = getnext.call(bd, xx-group[target].bx, group[target].by); break;
					case this.TURNR: next = getnext.call(bd, group[target].by, xx-group[target].bx, k.qrows, k.qcols); break;
					case this.TURNL: next = getnext.call(bd, yy-group[target].by, group[target].bx, k.qrows, k.qcols); break;
				}

				if(ch[next]===false){
					group[target] = group[next];
					target = next;
				}
				else{
					group[target] = tmp;
					break;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.expandborder() 盤面の拡大時、境界線を伸ばす
	// menu.ex.reduceborder() 盤面の縮小時、線を移動する
	//---------------------------------------------------------------------------
	expandborder : function(key){
		if(!k.isborderAsLine){
			if(um.undoExec){ return;} // Undo時は、後でオブジェクトを代入するので下の処理はパス

			bd.setposBorders();
			for(var i=0;i<bd.bdmax;i++){
				if(this.distObj(key,k.BORDER,i)!==1){ continue;}

				var source = this.innerBorder(key,i);
				bd.border[i].ques  = bd.border[source].ques;
				bd.border[i].qans  = bd.border[source].qans;
			}
		}
		else{
			// m==0||m==1で直接移動できそうだけど、expandGroup()と別に
			// 関数作る必要があるのでここで無理やり移動させる
			bd.setposBorders();
			for(var i=0;i<bd.bdmax;i++){
				if(this.distObj(key,k.BORDER,i)!==2){ continue;}

				var source = this.outerBorder(key,i);
				this.copyData(i,source);
				bd.border[source].allclear(source);
			}
		}
	},
	reduceborder : function(key){
		if(k.isborderAsLine){
			// borderAsLine時の無理やりがなんとかかんとか
			for(var i=0;i<bd.bdmax;i++){
				if(this.distObj(key,k.BORDER,i)!==0){ continue;}

				var source = this.innerBorder(key,i);
				this.copyData(i,source);
			}
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.copyData()     指定したデータをコピーする
	// menu.ex.innerBorder()  (expand/reduceBorder用) ひとつ内側に入ったborderのidを返す
	// menu.ex.outerBorder()  (expand/reduceBorder用) ひとつ外側に行ったborderのidを返す
	// menu.ex.setposObj()    指定されたタイプのsetpos関数を呼び出す
	// menu.ex.distObj()      上下左右いずれかの外枠との距離を求める
	//---------------------------------------------------------------------------
	copyData : function(id1,id2){
		bd.border[id1].qans  = bd.border[id2].qans;
		bd.border[id1].qsub  = bd.border[id2].qsub;
		bd.border[id1].ques  = bd.border[id2].ques;
		bd.border[id1].color = bd.border[id2].color;
	},
	innerBorder : function(key,id){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===k.UP){ return bd.bnum(bx, by+2);}
		else if(key===k.DN){ return bd.bnum(bx, by-2);}
		else if(key===k.LT){ return bd.bnum(bx+2, by);}
		else if(key===k.RT){ return bd.bnum(bx-2, by);}
		return -1;
	},
	outerBorder : function(key,id){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===k.UP){ return bd.bnum(bx, by-2);}
		else if(key===k.DN){ return bd.bnum(bx, by+2);}
		else if(key===k.LT){ return bd.bnum(bx-2, by);}
		else if(key===k.RT){ return bd.bnum(bx+2, by);}
		return -1;
	},

	setposObj : function(type){
		if     (type===k.CELL)  { bd.setposCells();}
		else if(type===k.CROSS) { bd.setposCrosses();}
		else if(type===k.BORDER){ bd.setposBorders();}
		else if(type===k.EXCELL){ bd.setposEXcells();}
	},
	distObj : function(key,type,id){
		var obj;
		if     (type===k.CELL)  { obj = bd.cell[id];}
		else if(type===k.CROSS) { obj = bd.cross[id];}
		else if(type===k.BORDER){ obj = bd.border[id];}
		else if(type===k.EXCELL){ obj = bd.excell[id];}
		else{ return -1;}

		key &= 0x0F;
		if     (key===k.UP){ return obj.by;}
		else if(key===k.DN){ return 2*k.qrows-obj.by;}
		else if(key===k.LT){ return obj.bx;}
		else if(key===k.RT){ return 2*k.qcols-obj.bx;}
		return -1;
	},

	//------------------------------------------------------------------------------
	// menu.ex.adjustGeneral()  回転・反転時に各セルの調節を行う(共通処理)
	// menu.ex.adjustSpecial()  回転・反転・盤面調節開始前に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustSpecial2() 回転・反転・盤面調節終了後に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustQues51_1() [＼]セルの調整(adjustSpecial関数に代入する用)
	// menu.ex.adjustQues51_2() [＼]セルの調整(adjustSpecial2関数に代入する用)
	//------------------------------------------------------------------------------
	adjustGeneral : function(key,d){
		um.disableRecord();
		for(var by=(d.y1|1);by<=d.y2;by+=2){
			for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
				var c = bd.cnum(bx,by);

				switch(key){
				case this.FLIPY: // 上下反転
					if(true){
						var val = ({2:5,3:4,4:3,5:2,104:107,105:106,106:105,107:104})[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isexcell!==1){
						var val = ({1:2,2:1})[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case this.FLIPX: // 左右反転
					if(true){
						var val = ({2:3,3:2,4:5,5:4,104:105,105:104,106:107,107:106})[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isexcell!==1){
						var val = ({3:4,4:3})[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case this.TURNR: // 右90°反転
					if(true){
						var val = {2:5,3:2,4:3,5:4,21:22,22:21,102:103,103:102,104:107,105:104,106:105,107:106}[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isexcell!==1){
						var val = {1:4,2:3,3:1,4:2}[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case this.TURNL: // 左90°反転
					if(true){
						var val = {2:3,3:4,4:5,5:2,21:22,22:21,102:103,103:102,104:105,105:106,106:107,107:104}[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isexcell!==1){
						var val = {1:3,2:4,3:2,4:1}[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				}
			}
		}
		um.enableRecord();
	},
	adjustQues51_1 : function(key,d){
		this.qnumw = [];
		this.qnumh = [];

		for(var by=(d.y1|1);by<=d.y2;by+=2){
			this.qnumw[by] = [bd.QnE(bd.exnum(-1,by))];
			for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
				if(bd.QuC(bd.cnum(bx,by))===51){ this.qnumw[by].push(bd.QnC(bd.cnum(bx,by)));}
			}
		}
		for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
			this.qnumh[bx] = [bd.DiE(bd.exnum(bx,-1))];
			for(var by=(d.y1|1);by<=d.y2;by+=2){
				if(bd.QuC(bd.cnum(bx,by))===51){ this.qnumh[bx].push(bd.DiC(bd.cnum(bx,by)));}
			}
		}
	},
	adjustQues51_2 : function(key,d){
		um.disableRecord();
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), idx;
		switch(key){
		case 1: // 上下反転
			for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
				idx = 1; this.qnumh[bx] = this.qnumh[bx].reverse();
				bd.sDiE(bd.exnum(bx,-1), this.qnumh[bx][0]);
				for(var by=(d.y1|1);by<=d.y2;by+=2){
					if(bd.QuC(bd.cnum(bx,by))===51){ bd.sDiC(bd.cnum(bx,by), this.qnumh[bx][idx]); idx++;}
				}
			}
			break;
		case 2: // 左右反転
			for(var by=(d.y1|1);by<=d.y2;by+=2){
				idx = 1; this.qnumw[by] = this.qnumw[by].reverse();
				bd.sQnE(bd.exnum(-1,by), this.qnumw[by][0]);
				for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
					if(bd.QuC(bd.cnum(bx,by))===51){ bd.sQnC(bd.cnum(bx,by), this.qnumw[by][idx]); idx++;}
				}
			}
			break;
		case 3: // 右90°反転
			for(var by=(d.y1|1);by<=d.y2;by+=2){
				idx = 1; this.qnumh[by] = this.qnumh[by].reverse();
				bd.sQnE(bd.exnum(-1,by), this.qnumh[by][0]);
				for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
					if(bd.QuC(bd.cnum(bx,by))===51){ bd.sQnC(bd.cnum(bx,by), this.qnumh[by][idx]); idx++;}
				}
			}
			for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
				idx = 1;
				bd.sDiE(bd.exnum(bx,-1), this.qnumw[xx-bx][0]);
				for(var by=(d.y1|1);by<=d.y2;by+=2){
					if(bd.QuC(bd.cnum(bx,by))===51){ bd.sDiC(bd.cnum(bx,by), this.qnumw[xx-bx][idx]); idx++;}
				}
			}
			break;
		case 4: // 左90°反転
			for(var by=(d.y1|1);by<=d.y2;by+=2){
				idx = 1;
				bd.sQnE(bd.exnum(-1,by), this.qnumh[yy-by][0]);
				for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
					if(bd.QuC(bd.cnum(bx,by))===51){ bd.sQnC(bd.cnum(bx,by), this.qnumh[yy-by][idx]); idx++;}
				}
			}
			for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
				idx = 1; this.qnumw[bx] = this.qnumw[bx].reverse();
				bd.sDiE(bd.exnum(bx,-1), this.qnumw[bx][0]);
				for(var by=(d.y1|1);by<=d.y2;by+=2){
					if(bd.QuC(bd.cnum(bx,by))===51){ bd.sDiC(bd.cnum(bx,by), this.qnumw[bx][idx]); idx++;}
				}
			}
			break;
		}
		um.enableRecord();
	},
	adjustSpecial  : function(key,d){ },
	adjustSpecial2 : function(key,d){ },

	//------------------------------------------------------------------------------
	// menu.ex.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ex.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(confirm(menu.isLangJP()?"回答を消去しますか？":"Do you want to erase the Answer?")){
			um.newOperation(true);
			{
				for(var i=0;i<bd.cellmax;i++){
					if(bd.cell[i].qans!==bd.defcell.qans){ um.addOpe(k.CELL,k.QANS,i,bd.cell[i].qans,bd.defcell.qans);}
					if(bd.cell[i].qsub!==bd.defcell.qsub){ um.addOpe(k.CELL,k.QSUB,i,bd.cell[i].qsub,bd.defcell.qsub);}
				}
			}
			if(!!k.isborder){
				for(var i=0;i<bd.bdmax;i++){
					if(bd.border[i].qans!==bd.defborder.qans){ um.addOpe(k.BORDER,k.QANS,i,bd.border[i].qans,bd.defborder.qans);}
					if(bd.border[i].line!==bd.defborder.line){ um.addOpe(k.BORDER,k.LINE,i,bd.border[i].line,bd.defborder.line);}
					if(bd.border[i].qsub!==bd.defborder.qsub){ um.addOpe(k.BORDER,k.QSUB,i,bd.border[i].qsub,bd.defborder.qsub);}
				}
			}

			bd.ansclear();
			base.resetInfo(false);
			pc.paintAll();
		}
	},
	ASconfirm : function(){
		if(confirm(menu.isLangJP()?"補助記号を消去しますか？":"Do you want to erase the auxiliary marks?")){
			um.newOperation(true);
			{
				for(var i=0;i<bd.cellmax;i++){
					if(bd.cell[i].qsub!==bd.defcell.qsub){ um.addOpe(k.CELL,k.QSUB,i,bd.cell[i].qsub,bd.defcell.qsub);}
				}
			}
			if(!!k.isborder){
				for(var i=0;i<bd.bdmax;i++){
					if(bd.border[i].qsub!==bd.defborder.qsub){ um.addOpe(k.BORDER,k.QSUB,i,bd.border[i].qsub,bd.defborder.qsub);}
				}
			}

			bd.subclear();
			pc.paintAll();
		}
	}
};
