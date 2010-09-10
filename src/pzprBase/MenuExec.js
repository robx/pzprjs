// MenuExec.js v3.3.2

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
				this.fileonload(e.target.result.replace(/\//g, "[[slash]]"));
			});
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		k.editmode = (num==1);
		k.playmode = (num==3);
		kc.prev = null;
		ans.errDisp=true;
		bd.errclear();
		if(kp.haspanel[1] || kp.haspanel[3]){ pp.funcs.keypopup();}
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
				col = (parseInt(_doc.newboard.col.value))|0;
				row = (parseInt(_doc.newboard.row.value))|0;
			}
			else{
				if     (_doc.newboard.size[0].checked){ col=row= 9;}
				else if(_doc.newboard.size[1].checked){ col=row=16;}
				else if(_doc.newboard.size[2].checked){ col=row=25;}
				else if(_doc.newboard.size[3].checked){ col=row= 4;}
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
			enc.parseURI(_doc.urlinput.ta.value);
			enc.pzlinput();

			tm.reset();
			menu.popclose();
		}
	},
	urloutput : function(e){
		if(menu.pop){
			switch(ee.getSrcElement(e).name){
				case "pzprv3":     _doc.urloutput.ta.value = enc.pzloutput(enc.PZPRV3);  break;
				case "pzprapplet": _doc.urloutput.ta.value = enc.pzloutput(enc.PAPRAPP); break;
				case "kanpen":     _doc.urloutput.ta.value = enc.pzloutput(enc.KANPEN);  break;
				case "pzprv3edit": _doc.urloutput.ta.value = enc.pzloutput(enc.PZPRV3E); break;
				case "heyaapp":    _doc.urloutput.ta.value = enc.pzloutput(enc.HEYAAPP); break;
			}
		}
	},
	openurl : function(e){
		if(menu.pop){
			if(_doc.urloutput.ta.value!==''){
				var win = window.open(_doc.urloutput.ta.value, '', '');
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
		var fileEL = _doc.fileform.filebox;

		if(!!this.reader || this.enableGetText){
			var fitem = fileEL.files[0];
			if(!fitem){ return;}

			if(!!this.reader){ this.reader.readAsText(fitem);}
			else             { this.fileonload(fitem.getAsText(''));}
		}
		else{
			if(!fileEL.value){ return;}
			_doc.fileform.action = (_doc.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi");
			_doc.fileform.submit();
		}

		_doc.fileform.reset();
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

		_doc.fileform.reset();
		tm.reset();
	},

	filesave : function(ftype){
		var fname = prompt("保存するファイル名を入力して下さい。", k.puzzleid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		_doc.fileform2.filename.value = fname;

		if     (navigator.platform.indexOf("Win")!==-1){ _doc.fileform2.platform.value = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ _doc.fileform2.platform.value = "Mac";}
		else                                           { _doc.fileform2.platform.value = "Others";}

		_doc.fileform2.ques.value   = fio.fileencode(ftype);
		_doc.fileform2.urlstr.value = fio.history;
		_doc.fileform2.operation.value = 'save';

		_doc.fileform2.action = (_doc.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi");
		_doc.fileform2.submit();
	},

	//------------------------------------------------------------------------------
	// menu.ex.imagesave() 画像を保存する
	//------------------------------------------------------------------------------
	imagesave : function(isDL){
		// 現在の設定を保存する
		var temp_flag   = pc.fillTextPrecisely;
		var temp_margin = k.bdmargin;
		var temp_cursor = pp.getVal('cursor');

		try{
			// 設定値・変数をcanvas用のものに変更
			pc.fillTextPrecisely = true;
			k.bdmargin = k.bdmargin_image;
			pp.setValOnly('cursor', false);
			g = ee('divques_sub').el.getContext("2d");

			// canvas要素の設定を適用して、再描画
			base.resize_canvas();

			// canvasの描画内容をDataURLとして取得する
			var url = g.canvas.toDataURL();

			if(isDL){
				_doc.fileform2.filename.value  = k.puzzleid+'.gif';
				_doc.fileform2.urlstr.value    = url.replace('data:image/png;base64,', '');
				_doc.fileform2.operation.value = 'imagesave';
				_doc.fileform2.submit();
			}
			else{
				window.open(url, '', '');
			}
		}
		catch(e){
			menu.alertStr('画像の出力に失敗しました..','Fail to Output the Image..');
		}

		// 設定値・変数を元に戻す
		pc.fillTextPrecisely = temp_flag;
		k.bdmargin = temp_margin;
		pp.setValOnly('cursor', temp_cursor);
		g = ee('divques').unselectable().el.getContext("2d");

		// その他の設定を元に戻して、再描画
		base.resize_canvas();
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(menu.pop){
			var csize = parseInt(_doc.dispsize.cs.value);
			if(csize>0){ k.cellsize = (csize|0);}

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
		var idlist = ['usepanel','checkpanel'];
		var seplist = k.EDITOR ? [] : ['separator2'];

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
		if(!this.displaymanage){ ee('ms_manarea').el.innerHTML = menu.selectStr("管理領域を表示","Show management area");}
		else                   { ee('ms_manarea').el.innerHTML = menu.selectStr("管理領域を隠す","Hide management area");}
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
			if (name.match(/(expand|reduce)/)){ this.expandreduce(this.boardtype[name][1],d);}
			else if(name.match(/(turn|flip)/)){ this.turnflip    (this.boardtype[name][1],d);}

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
		base.disableInfo();
		this.adjustBoardData(key,d);

		if(key & this.EXPAND){
			if     (key===this.EXPANDUP||key===this.EXPANDDN){ k.qrows++;}
			else if(key===this.EXPANDLT||key===this.EXPANDRT){ k.qcols++;}

							{ this.expandGroup(k.CELL,   key);}
			if(!!k.iscross) { this.expandGroup(k.CROSS,  key);}
			if(!!k.isborder){ this.expandGroup(k.BORDER, key);}
			if(!!k.isexcell){ this.expandGroup(k.EXCELL, key);}
		}
		else if(key & this.REDUCE){
							{ this.reduceGroup(k.CELL,   key);}
			if(!!k.iscross) { this.reduceGroup(k.CROSS,  key);}
			if(!!k.isborder){ this.reduceGroup(k.BORDER, key);}
			if(!!k.isexcell){ this.reduceGroup(k.EXCELL, key);}

			if     (key===this.REDUCEUP||key===this.REDUCEDN){ k.qrows--;}
			else if(key===this.REDUCELT||key===this.REDUCERT){ k.qcols--;}
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		base.enableInfo();
	},
	expandGroup : function(type,key){
		var margin = bd.initGroup(type, k.qcols, k.qrows);
		var group = bd.getGroup(type);
		for(var i=group.length-1;i>=0;i--){
			if(!!this.insex[type][this.distObj(type,i,key)]){
				group[i] = bd.newObject(type);
				group[i].allclear(i,false);
				margin--;
			}
			else if(margin>0){ group[i] = group[i-margin];}
		}

		if(type===k.BORDER){ this.expandborder(key);}
	},
	reduceGroup : function(type,key){
		if(type===k.BORDER){ this.reduceborder(key);}

		var margin=0, group = bd.getGroup(type), isrec=(!um.undoExec && !um.redoExec);
		if(isrec){ um.forceRecord = true;}
		for(var i=0;i<group.length;i++){
			if(!!this.insex[type][this.distObj(type,i,key)]){
				group[i].allclear(i,isrec);
				margin++;
			}
			else if(margin>0){ group[i-margin] = group[i];}
		}
		for(var i=0;i<margin;i++){ group.pop();}
		if(isrec){ um.forceRecord = false;}
	},

	//------------------------------------------------------------------------------
	// menu.ex.turnflip()      回転・反転処理を実行する
	// menu.ex.turnflipGroup() turnflip()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	turnflip : function(key,d){
		base.disableInfo();
		this.adjustBoardData(key,d);

		if(key & this.TURN){
			var tmp = k.qcols; k.qcols = k.qrows; k.qrows = tmp;
			bd.setposAll();
			d = {x1:0, y1:0, x2:2*k.qcols, y2:2*k.qrows};
		}

						  { this.turnflipGroup(k.CELL,   key, d);}
		if(!!k.iscross)   { this.turnflipGroup(k.CROSS,  key, d);}
		if(!!k.isborder)  { this.turnflipGroup(k.BORDER, key, d);}
		if(k.isexcell===2){ this.turnflipGroup(k.EXCELL, key, d);}
		else if(k.isexcell===1 && (key & this.FLIP)){
			var d2 = {x1:d.x1, y1:d.y1, x2:d.x2, y2:d.y2};
			if     (key===this.FLIPY){ d2.x1 = d2.x2 = -1;}
			else if(key===this.FLIPX){ d2.y1 = d2.y2 = -1;}
			this.turnflipGroup(k.EXCELL, key, d2);
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		base.enableInfo();
	},
	turnflipGroup : function(type,key,d){
		var ch=[], idlist=bd.objectinside(type,d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<idlist.length;i++){ ch[idlist[i]]=false;}

		var group = bd.getGroup(type);
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		for(var source=0;source<group.length;source++){
			if(ch[source]!==false){ continue;}

			var tmp = group[source], target = source;
			while(ch[target]===false){
				ch[target]=true;
				// nextになるものがtargetに移動してくる、、という考えかた。
				// ここでは移動前のIDを取得しています
				switch(key){
					case this.FLIPY: next = bd.idnum(type, group[target].bx, yy-group[target].by); break;
					case this.FLIPX: next = bd.idnum(type, xx-group[target].bx, group[target].by); break;
					case this.TURNR: next = bd.idnum(type, group[target].by, xx-group[target].bx, k.qrows, k.qcols); break;
					case this.TURNL: next = bd.idnum(type, yy-group[target].by, group[target].bx, k.qrows, k.qcols); break;
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
	// menu.ex.distObj()      上下左右いずれかの外枠との距離を求める
	//---------------------------------------------------------------------------
	distObj : function(type,id,key){
		var obj = bd.getObject(type, id);
		if(!obj){ return -1;}

		key &= 0x0F;
		if     (key===k.UP){ return obj.by;}
		else if(key===k.DN){ return 2*k.qrows-obj.by;}
		else if(key===k.LT){ return obj.bx;}
		else if(key===k.RT){ return 2*k.qcols-obj.bx;}
		return -1;
	},

	//---------------------------------------------------------------------------
	// menu.ex.expandborder() 盤面の拡大時、境界線を伸ばす
	// menu.ex.reduceborder() 盤面の縮小時、線を移動する
	// menu.ex.copyBorder()   (expand/reduceBorder用) 指定したデータをコピーする
	// menu.ex.innerBorder()  (expand/reduceBorder用) ひとつ内側に入ったborderのidを返す
	// menu.ex.outerBorder()  (expand/reduceBorder用) ひとつ外側に行ったborderのidを返す
	//---------------------------------------------------------------------------
	expandborder : function(key){
		// borderAsLineじゃないUndo時は、後でオブジェクトを代入するので下の処理はパス
		if(k.isborderAsLine || !um.undoExec){
			// 直前のexpandGroupで、bx,byプロパティが不定なままなので設定する
			bd.setposBorders();

			var dist = (k.isborderAsLine?2:1);
			for(var id=0;id<bd.bdmax;id++){
				if(this.distObj(k.BORDER,id,key)!==dist){ continue;}

				var source = (k.isborderAsLine ? this.outerBorder(id,key) : this.innerBorder(id,key));
				this.copyBorder(id,source);
				if(k.isborderAsLine){ bd.border[source].allclear(source,false);}
			}
		}
	},
	reduceborder : function(key){
		if(k.isborderAsLine){
			for(var id=0;id<bd.bdmax;id++){
				if(this.distObj(k.BORDER,id,key)!==0){ continue;}

				var source = this.innerBorder(id,key);
				this.copyBorder(id,source);
			}
		}
	},

	copyBorder : function(id1,id2){
		bd.border[id1].ques  = bd.border[id2].ques;
		bd.border[id1].qans  = bd.border[id2].qans;
		if(k.isborderAsLine){
			bd.border[id1].line  = bd.border[id2].line;
			bd.border[id1].qsub  = bd.border[id2].qsub;
			bd.border[id1].color = bd.border[id2].color;
		}
	},
	innerBorder : function(id,key){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===k.UP){ return bd.bnum(bx, by+2);}
		else if(key===k.DN){ return bd.bnum(bx, by-2);}
		else if(key===k.LT){ return bd.bnum(bx+2, by);}
		else if(key===k.RT){ return bd.bnum(bx-2, by);}
		return null;
	},
	outerBorder : function(id,key){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===k.UP){ return bd.bnum(bx, by-2);}
		else if(key===k.DN){ return bd.bnum(bx, by+2);}
		else if(key===k.LT){ return bd.bnum(bx-2, by);}
		else if(key===k.RT){ return bd.bnum(bx+2, by);}
		return null;
	},

	//------------------------------------------------------------------------------
	// menu.ex.adjustBoardData()  回転・反転開始前に各セルの調節を行う(共通処理)
	// menu.ex.adjustBoardData2() 回転・反転終了後に各セルの調節を行う(共通処理)
	// 
	// menu.ex.adjustSpecial()    回転・反転・盤面調節開始前に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustSpecial2()   回転・反転・盤面調節終了後に各セルの調節を行う(各パズルのオーバーライド用)
	// 
	// menu.ex.adjustQues51_1()   [＼]セルの調整(adjustSpecial関数に代入する用)
	// menu.ex.adjustQues51_2()   [＼]セルの調整(adjustSpecial2関数に代入する用)
	//------------------------------------------------------------------------------
	adjustBoardData : function(key,d){
		this.adjustSpecial.call(this,key,d);

		if(key & this.TURNFLIP){
			var tques={};
			switch(key){
				case this.FLIPY: tques={2:5,3:4,4:3,5:2,14:17,15:16,16:15,17:14}; break;
				case this.FLIPX: tques={2:3,3:2,4:5,5:4,14:15,15:14,16:17,17:16}; break;
				case this.TURNR: tques={2:5,3:2,4:3,5:4,12:13,13:12,14:17,15:14,16:15,17:16,21:22,22:21}; break;
				case this.TURNL: tques={2:3,3:4,4:5,5:2,12:13,13:12,14:15,15:16,16:17,17:14,21:22,22:21}; break;
			}

			var tdir={};
			switch(key){
				case this.FLIPY: tdir={1:2,2:1}; break;			// 上下反転
				case this.FLIPX: tdir={3:4,4:3}; break;			// 左右反転
				case this.TURNR: tdir={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case this.TURNL: tdir={1:3,2:4,3:2,4:1}; break;	// 左90°回転
			}

			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val=tques[bd.QuC(c)]; if(!!val){ bd.sQuC(c,val);}
				if(k.isexcell!==1){
					var val=tdir[bd.DiC(c)]; if(!!val){ bd.sDiC(c,val);}
				}
			}
		}

		if((key & this.REDUCE) && k.roomNumber){
			this.qnums = [];
			for(var i=0;i<bd.cell.length;i++){
				if(!!this.insex[k.CELL][this.distObj(k.CELL,i,key)] && bd.cell[i].qnum!==-1){
					this.qnums.push({ areaid:area.getRoomID(i), val:bd.cell[i].qnum});
				}
			}
		}
	},
	adjustBoardData2 : function(key,d){
		if((key & this.REDUCE) && k.roomNumber){
			area.resetArea();
			for(var i=0;i<this.qnums.length;i++){
				var c = area.getTopOfRoom(this.qnums[i].areaid);
				bd.cell[c].qnum = this.qnums[i].val;
			}
		}

		this.adjustSpecial2.call(this,key,d);
	},
	adjustSpecial  : function(key,d){ },
	adjustSpecial2 : function(key,d){ },

	adjustQues51_1 : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		for(var by=by1;by<=d.y2;by+=2){
			this.qnumw[by] = [bd.QnE(bd.exnum(-1,by))];
			for(var bx=bx1;bx<=d.x2;bx+=2){
				var cc = bd.cnum(bx,by);
				if(cc!==null && bd.QuC(cc)===51){ this.qnumw[by].push(bd.QnC(cc));}
			}
		}
		for(var bx=bx1;bx<=d.x2;bx+=2){
			this.qnumh[bx] = [bd.DiE(bd.exnum(bx,-1))];
			for(var by=by1;by<=d.y2;by+=2){
				var cc = bd.cnum(bx,by);
				if(cc!==null && bd.QuC(cc)===51){ this.qnumh[bx].push(bd.DiC(cc));}
			}
		}
	},
	adjustQues51_2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1), idx;

		switch(key){
		case this.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumh[bx] = this.qnumh[bx].reverse();
				bd.sDiE(bd.exnum(bx,-1), this.qnumh[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sDiC(cc, this.qnumh[bx][idx]); idx++;}
				}
			}
			break;

		case this.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumw[by] = this.qnumw[by].reverse();
				bd.sQnE(bd.exnum(-1,by), this.qnumw[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sQnC(cc, this.qnumw[by][idx]); idx++;}
				}
			}
			break;

		case this.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumh[by] = this.qnumh[by].reverse();
				bd.sQnE(bd.exnum(-1,by), this.qnumh[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sQnC(cc, this.qnumh[by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1;
				bd.sDiE(bd.exnum(bx,-1), this.qnumw[xx-bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sDiC(cc, this.qnumw[xx-bx][idx]); idx++;}
				}
			}
			break;

		case this.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1;
				bd.sQnE(bd.exnum(-1,by), this.qnumh[yy-by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sQnC(cc, this.qnumh[yy-by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumw[bx] = this.qnumw[bx].reverse();
				bd.sDiE(bd.exnum(bx,-1), this.qnumw[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sDiC(cc, this.qnumw[bx][idx]); idx++;}
				}
			}
			break;
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ex.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(menu.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			um.newOperation(true);

			bd.ansclear();
			base.resetInfo(false);
			pc.paintAll();
		}
	},
	ASconfirm : function(){
		if(menu.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
			um.newOperation(true);

			bd.subclear();
			pc.paintAll();
		}
	}
};
