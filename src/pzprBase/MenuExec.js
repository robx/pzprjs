// MenuExec.js v3.4.0

//---------------------------------------------------------------------------
// ★MenuExecクラス ポップアップウィンドウ内でボタンが押された時の処理内容を記述する
//---------------------------------------------------------------------------

// Menuクラス実行部
pzprv3.createCommonClass('MenuExec', '',
{
	initialize : function(){
		this.displaymanage = true;
		this.qnumw;	// Ques==51の回転･反転用
		this.qnumh;	// Ques==51の回転･反転用
		this.qnums;	// reduceでisOneNumber時の後処理用

		this.reader;	// FileReaderオブジェクト

		// expand/reduce処理用
		this.insex = {};
		this.insex[k.CELL]   = {1:true};
		this.insex[k.CROSS]  = (k.iscross===1 ? {2:true} : {0:true});
		this.insex[k.BORDER] = {1:true, 2:true};
		this.insex[k.EXCELL] = {1:true};
	},

	fileio : (_doc.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi"),
	enableReadText : false,

	// 定数
	EXPAND : 0x10,
	REDUCE : 0x20,
	TURN   : 0x40,
	FLIP   : 0x80,
	TURNFLIP: 0xC0, // (this.TURN|this.FLIP),

	EXPANDUP: 0x11, // (this.EXPAND|k.UP),
	EXPANDDN: 0x12, // (this.EXPAND|k.DN),
	EXPANDLT: 0x13, // (this.EXPAND|k.LT),
	EXPANDRT: 0x14, // (this.EXPAND|k.RT),

	REDUCEUP: 0x21, // (this.REDUCE|k.UP),
	REDUCEDN: 0x22, // (this.REDUCE|k.DN),
	REDUCELT: 0x23, // (this.REDUCE|k.LT),
	REDUCERT: 0x24, // (this.REDUCE|k.RT),

	TURNL: 0x41, // (this.TURN|1),
	TURNR: 0x42, // (this.TURN|2),

	FLIPX: 0x81, // (this.FLIP|1),
	FLIPY: 0x82, // (this.FLIP|2),

	boardtype : {
		expandup: [0x21, 0x11],
		expanddn: [0x22, 0x12],
		expandlt: [0x23, 0x13],
		expandrt: [0x24, 0x14],
		reduceup: [0x11, 0x21],
		reducedn: [0x12, 0x22],
		reducelt: [0x13, 0x23],
		reducert: [0x14, 0x24],
		turnl: [0x42, 0x41], turnr: [0x41, 0x42],
		flipy: [0x82, 0x82], flipx: [0x81, 0x81]
	},

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

		kc.keyreset();
		bd.errclear();
		tc.adjust_modechange();
		if(kp.haspanel[1] || kp.haspanel[3]){ pp.funcs.keypopup();}

		ans.errDisp=true;
		pc.paintAll();
	},

	//------------------------------------------------------------------------------
	// menu.ex.newboard()       新規盤面を作成する
	// menu.ex.newboard_open()  新規盤面を作成する
	//------------------------------------------------------------------------------
	newboard : function(e){
		if(menu.pop){
			var col = (parseInt(_doc.newboard.col.value))|0;
			var row = (parseInt(_doc.newboard.row.value))|0;
			if(!!col && !!row){ this.newboard_open('/'+col+'/'+row);}
		}
	},
	newboard_open : function(url){
		menu.popclose();

		base.dec.parseURI('?'+k.puzzleid+url);
		base.importBoardData(base.dec.id);
	},

	//------------------------------------------------------------------------------
	// menu.ex.urlinput()   URLを入力する
	// menu.ex.urloutput()  URLを出力する
	// menu.ex.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(menu.pop){
			menu.popclose();

			base.dec.parseURI(_doc.urlinput.ta.value);
			if(!!base.dec.id){
				base.importBoardData(base.dec.id);
			}
		}
	},
	urloutput : function(e){
		if(menu.pop){
			switch(ee.getSrcElement(e).name){
				case "pzprv3":     _doc.urloutput.ta.value = enc.pzloutput(enc.PZPRV3);  break;
				case "pzprapplet": _doc.urloutput.ta.value = enc.pzloutput(enc.PZPRAPP); break;
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
			_doc.fileform.action = this.fileio
			_doc.fileform.submit();
		}

		_doc.fileform.reset();
	},
	fileonload : function(data){
		var farray = data.split(/[\t\r\n]+/);
		var fstr = "", fheader = ['',''];
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

		_doc.fileform2.action = this.fileio
		_doc.fileform2.submit();
	},

	//------------------------------------------------------------------------------
	// menu.ex.imagesave() 画像を保存する
	//------------------------------------------------------------------------------
	imagesave : function(isDL){
		// 現在の設定を保存する
		var temp_flag   = pc.fillTextEmulate;
		var temp_margin = k.bdmargin;
		var temp_cursor = pp.getVal('cursor');

		try{
			// 設定値・変数をcanvas用のものに変更
			pc.outputImage = true;
			pc.fillTextEmulate = false;
			k.bdmargin = k.bdmargin_image;
			pp.setValOnly('cursor', false);
			g = ee('divques_sub').el.getContext("2d");

			// canvas要素の設定を適用して、再描画
			pc.resize_canvas();

			// canvasの描画内容をDataURLとして取得する
			var url = g.canvas.toDataURL();

			if(isDL){
				_doc.fileform2.filename.value  = k.puzzleid+'.png';
				_doc.fileform2.urlstr.value    = url.replace('data:image/png;base64,', '');
				_doc.fileform2.operation.value = 'imagesave';

				_doc.fileform2.action = this.fileio
				_doc.fileform2.submit();
			}
			else{
				if(!ee.br.IE9){
					window.open(url, '', '');
				}
				else{
					// IE9だとアドレスバーの長さが2KBだったり、
					// そもそもDataURL入れても何も起こらなかったりする対策
					var cdoc = window.open('', '', '').document;
					cdoc.open();
					cdoc.writeln("<!DOCTYPE html>\n<HTML LANG=\"ja\">\n<HEAD>");
					cdoc.writeln("<META CHARSET=\"utf-8\">");
					cdoc.writeln("<TITLE>ぱずぷれv3<\/TITLE>\n<\/HEAD>");
					cdoc.writeln("<BODY><img src=\"", url, "\"><\/BODY>\n<\/HTML>");
					cdoc.close();
				}
			}
		}
		catch(e){
			menu.alertStr('画像の出力に失敗しました..','Fail to Output the Image..');
		}

		// 設定値・変数を元に戻す
		pc.outputImage = false;
		pc.fillTextEmulate = temp_flag;
		k.bdmargin = temp_margin;
		pp.setValOnly('cursor', temp_cursor);
		g = ee('divques').unselectable().el.getContext("2d");

		// その他の設定を元に戻して、再描画
		pc.resize_canvas();
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(menu.pop){
			var csize = parseInt(_doc.dispsize.cs.value);
			if(csize>0){ pc.cellsize = (csize|0);}

			menu.popclose();
			pc.resize_canvas();	// Canvasを更新する
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.irowakeRemake() 「色分けしなおす」ボタンを押した時に色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		bd.lines.newIrowake();
		if(pp.getVal('irowake')){ pc.paintAll();}
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispman()    管理領域を隠す/表示するが押された時に動作する
	// menu.ex.dispmanstr() 管理領域を隠す/表示するにどの文字列を表示するか
	//------------------------------------------------------------------------------
	dispman : function(e){
		var idlist = ['usepanel','checkpanel'];
		var seplist = pzprv3.EDITOR ? [] : ['separator2'];

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

		pc.resize_canvas();	// canvasの左上座標等を更新して再描画
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
			if(!um.undoExec){ bd.resetInfo();}
			pc.resize_canvas();				// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.expandreduce() 盤面の拡大・縮小を実行する
	// menu.ex.expandGroup()  オブジェクトの追加を行う
	// menu.ex.reduceGroup()  オブジェクトの消去を行う
	//------------------------------------------------------------------------------
	expandreduce : function(key,d){
		bd.disableInfo();
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
		bd.enableInfo();
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
		bd.disableInfo();
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
		bd.enableInfo();
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
	// menu.ex.adjustBoardData()    回転・反転開始前に各セルの調節を行う(共通処理)
	// menu.ex.adjustBoardData2()   回転・反転終了後に各セルの調節を行う(共通処理)
	// 
	// menu.ex.adjustRoomNumber()   回転・反転開始前に数字つき部屋の処理を行う
	// menu.ex.adjustRoomNumber2()  回転・反転終了後に数字つき部屋の処理を行う
	// 
	// menu.ex.adjustNumberArrow()  回転・反転開始前の矢印つき数字の調整
	// menu.ex.adjustCellArrow()    回転・反転開始前の矢印セルの調整
	// 
	// menu.ex.adjustQues51_1()     回転・反転開始前の[＼]セルの調整
	// menu.ex.adjustQues51_2()     回転・反転終了後の[＼]セルの調整
	// 
	// menu.ex.adjustBoardObject()  回転・反転開始前のIN/OUTなどの位置の調整
	//------------------------------------------------------------------------------
	adjustBoardData : function(key,d){
		if(k.roomNumber){ this.adjustRoomNumber(key,d);}
	},
	adjustBoardData2 : function(key,d){
		if(k.roomNumber){ this.adjustRoomNumber2(key,d);}
	},

	adjustRoomNumber : function(key,d){
		if(key & this.REDUCE){
			this.qnums = [];
			for(var i=0;i<bd.cell.length;i++){
				if(!!this.insex[k.CELL][this.distObj(k.CELL,i,key)] && bd.cell[i].qnum!==-1){
					this.qnums.push({areaid:bd.areas.getRoomID(i), val:bd.cell[i].qnum});
				}
			}
		}
	},
	adjustRoomNumber2 : function(key,d){
		if(key & this.REDUCE){
			bd.areas.resetArea();
			for(var i=0;i<this.qnums.length;i++){
				var c = bd.areas.getTopOfRoom(this.qnums[i].areaid);
				bd.cell[c].qnum = this.qnums[i].val;
			}
		}
	},

	adjustNumberArrow : function(key,d){
		if(key & this.TURNFLIP){
			var tdir={};
			switch(key){
				case this.FLIPY: tdir={1:2,2:1}; break;				// 上下反転
				case this.FLIPX: tdir={3:4,4:3}; break;				// 左右反転
				case this.TURNR: tdir={1:4,2:3,3:1,4:2}; break;		// 右90°回転
				case this.TURNL: tdir={1:3,2:4,3:2,4:1}; break;		// 左90°回転
			}
			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val=tdir[bd.DiC(c)]; if(!!val){ bd.sDiC(c,val);}
			}
		}
	},
	adjustCellArrow : function(key,d){
		if(key & this.TURNFLIP){
			var trans = {};
			switch(key){
				case this.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case this.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case this.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case this.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val = trans[bd.QnC(c)]; if(!!val){ bd.sQnC(c,val);}
				var val = trans[bd.AnC(c)]; if(!!val){ bd.sAnC(c,val);}
			}
		}
	},
	adjustBorderArrow : function(key,d){
		if(key & this.TURNFLIP){
			var trans = {};
			switch(key){
				case this.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case this.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case this.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case this.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var idlist = bd.borderinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i], val;
				val=trans[bd.DiB(id)]; if(!!val){ bd.sDiB(id,val);}
			}
		}
	},

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

	adjustBoardObject : function(key,d,group,id){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);

		var obj=bd.getObject(group,id), bx=obj.bx, by=obj.by, newid;
		switch(key){
			case this.FLIPY: newid = bd.idnum(group, bx,yy-by); break;
			case this.FLIPX: newid = bd.idnum(group, xx-bx,by); break;
			case this.TURNR: newid = bd.idnum(group, yy-by,bx,k.qrows,k.qcols); break;
			case this.TURNL: newid = bd.idnum(group, by,xx-bx,k.qrows,k.qcols); break;
			case this.EXPANDUP: newid = bd.idnum(group, bx,by+(by===bd.minby?0:2), k.qcols,k.qrows+1); break;
			case this.EXPANDDN: newid = bd.idnum(group, bx,by+(by===bd.maxby?2:0), k.qcols,k.qrows+1); break;
			case this.EXPANDLT: newid = bd.idnum(group, bx+(bx===bd.minbx?0:2),by ,k.qcols+1,k.qrows); break;
			case this.EXPANDRT: newid = bd.idnum(group, bx+(bx===bd.maxbx?2:0),by ,k.qcols+1,k.qrows); break;
			case this.REDUCEUP: newid = bd.idnum(group, bx,by-(by<=bd.minby+2?0:2), k.qcols,k.qrows-1); break;
			case this.REDUCEDN: newid = bd.idnum(group, bx,by-(by>=bd.maxby-2?2:0), k.qcols,k.qrows-1); break;
			case this.REDUCELT: newid = bd.idnum(group, bx-(bx<=bd.minbx+2?0:2),by, k.qcols-1,k.qrows); break;
			case this.REDUCERT: newid = bd.idnum(group, bx-(bx>=bd.maxbx-2?2:0),by, k.qcols-1,k.qrows); break;
			default: newid = id; break;
		}
		return newid;
	},

	//------------------------------------------------------------------------------
	// menu.ex.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ex.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(menu.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			um.newOperation(true);

			bd.ansclear();
			bd.resetInfo();
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
});
