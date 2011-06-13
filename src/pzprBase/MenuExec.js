// MenuExec.js v3.4.0

//---------------------------------------------------------------------------
// ★MenuExecクラス ポップアップウィンドウ内でボタンが押された時の処理内容を記述する
//---------------------------------------------------------------------------

// Menuクラス実行部
pzprv3.createCommonClass('MenuExec',
{
	initialize : function(){
		this.displaymanage = true;
		this.qnumw;	// Ques==51の回転･反転用
		this.qnumh;	// Ques==51の回転･反転用
		this.qnums;	// reduceでisOneNumber時の後処理用

		this.reader;	// FileReaderオブジェクト

		// expand/reduce処理用
		this.insex = {};
		this.insex[bd.CELL]   = {1:true};
		this.insex[bd.CROSS]  = (bd.iscross===1 ? {2:true} : {0:true});
		this.insex[bd.BORDER] = {1:true, 2:true};
		this.insex[bd.EXCELL] = {1:true};
	},

	fileio : (document.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi"),
	enableReadText : false,

	// 定数
	EXPAND : 0x10,
	REDUCE : 0x20,
	TURN   : 0x40,
	FLIP   : 0x80,
	TURNFLIP: 0xC0, // (this.TURN|this.FLIP),

	EXPANDUP: 0x11, // (this.EXPAND|bd.UP),
	EXPANDDN: 0x12, // (this.EXPAND|bd.DN),
	EXPANDLT: 0x13, // (this.EXPAND|bd.LT),
	EXPANDRT: 0x14, // (this.EXPAND|bd.RT),

	REDUCEUP: 0x21, // (this.REDUCE|bd.UP),
	REDUCEDN: 0x22, // (this.REDUCE|bd.DN),
	REDUCELT: 0x23, // (this.REDUCE|bd.LT),
	REDUCERT: 0x24, // (this.REDUCE|bd.RT),

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
		if(kc.haspanel[1] || kc.haspanel[3]){ pp.funcs.keypopup();}

		bd.haserror=true;
		pc.paintAll();
	},

	//------------------------------------------------------------------------------
	// menu.ex.newboard()       新規盤面を作成する
	// menu.ex.newboard_open()  新規盤面を作成する
	//------------------------------------------------------------------------------
	newboard : function(e){
		if(menu.pop){
			var col = (parseInt(document.newboard.col.value))|0;
			var row = (parseInt(document.newboard.row.value))|0;
			if(!!col && !!row){ this.newboard_open(col+'/'+row);}
		}
	},
	newboard_open : function(qdata){
		menu.popclose();

		pzprv3.base.importBoardData({id:bd.puzzleid, qdata:qdata});
	},

	//------------------------------------------------------------------------------
	// menu.ex.urlinput()   URLを入力する
	// menu.ex.urloutput()  URLを出力する
	// menu.ex.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(menu.pop){
			menu.popclose();

			var pzl = enc.parseURL(document.urlinput.ta.value);
			if(!!pzl.id){ pzprv3.base.importBoardData(pzl);}
		}
	},
	urloutput : function(e){
		if(menu.pop){
			var _doc = document;
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
		var _doc = document, fileEL = _doc.fileform.filebox;

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
		var farray = data.split(/[\t\r\n\/]+/), fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"/");
		}

		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : bd.puzzleid);
		pzprv3.base.importBoardData({id:pid, fstr:fstr});

		document.fileform.reset();
		pzprv3.timer.reset();
	},

	filesave : function(ftype){
		var fname = prompt("保存するファイル名を入力して下さい。", bd.puzzleid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		var _doc = document;
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
	// menu.ex.duplicate() 盤面の複製を行う => 受取はCoreClass.jsのimportFileData()
	//------------------------------------------------------------------------------
	duplicate : function(){
		var str = fio.fileencode(fio.PZPH);
		var url = './p.html?'+bd.puzzleid+(pzprv3.PLAYER?"_play":"");
		if(!ee.br.Opera){
			var old = sessionStorage['filedata'];
			sessionStorage['filedata'] = (str+fio.history);
			window.open(url,'');
			if(!!old){ sessionStorage['filedata'] = old;}
			else     { delete sessionStorage['filedata'];}
		}
		else{
			localStorage['pzprv3_filedata'] = (str+fio.history);
			window.open(url,'');
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.imagesave()   画像を保存する
	// menu.ex.submitimage() "画像をダウンロード"の処理ルーチン
	// menu.ex.openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	imagesave : function(isDL){
		try{
			var pc2 = new (pzprv3.getPuzzleClass('Graphic'))();

			// 設定値・変数をcanvas用のものに変更
			pc2.outputImage = true;
			pc2.fillTextEmulate = false;
			pc2.bdmargin = pc.bdmargin_image;
			pc2.currentContext = ee('divques_sub').el.getContext("2d");

			// canvas要素の設定を適用して、再描画
			pc2.resize_canvas();

			// canvasの描画内容をDataURLとして取得する
			var url = pc2.currentContext.canvas.toDataURL();

			if(isDL){ this.submitimage(url);}
			else    { this.openimage(url);}
		}
		catch(e){
			menu.alertStr('画像の出力に失敗しました..','Fail to Output the Image..');
		}
	},

	submitimage : function(url){
		var _doc = document;
		_doc.fileform2.filename.value  = bd.puzzleid+'.png';
		_doc.fileform2.urlstr.value    = url.replace('data:image/png;base64,', '');
		_doc.fileform2.operation.value = 'imagesave';

		_doc.fileform2.action = this.fileio
		_doc.fileform2.submit();
	},
	openimage : function(url){
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
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(menu.pop){
			var csize = parseInt(document.dispsize.cs.value);
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
			for(var i=0;i<idlist.length;i++)         { ee(idlist[i])  .el.style.display = 'none';}
			for(var i=0;i<seplist.length;i++)        { ee(seplist[i]) .el.style.display = 'none';}
			if(pc.irowake!=0 && pp.getVal('irowake')){ ee('btncolor2').el.style.display = 'inline';}
			ee('menuboard').el.style.paddingBottom = '0pt';
		}
		else{
			for(var i=0;i<idlist.length;i++)         { ee(idlist[i])  .el.style.display = 'block';}
			for(var i=0;i<seplist.length;i++)        { ee(seplist[i]) .el.style.display = 'block';}
			if(pc.irowake!=0 && pp.getVal('irowake')){ ee("btncolor2").el.style.display = 'none';}
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
	// menu.ex.popupadjust()  "盤面の調整""回転・反転"でボタンが押された時に実行条件をチェック
	// menu.ex.execadjust()   盤面の調整、回転、反転で対応する関数へジャンプする
	//------------------------------------------------------------------------------
	popupadjust : function(e){
		if(menu.pop){
			var name = ee.getSrcElement(e).name;
			if(name.indexOf("reduce")===0){
				if(name==="reduceup"||name==="reducedn"){
					if(bd.qrows<=1){ return;}
				}
				else if(name==="reducelt"||name==="reducert"){
					if(bd.qcols<=1 && (bd.puzzleid!=="tawa" || bd.lap!==3)){ return;}
				}
			}

			this.execadjust(name);
		}
	},
	execadjust : function(name){
		um.newOperation(true);

		// undo/redo時はexpandreduce・turnflipを直接呼びます
		var d = {x1:0, y1:0, x2:2*bd.qcols, y2:2*bd.qrows}; // 範囲が必要なのturnflipだけかも..
		if (name.match(/(expand|reduce)/)){ this.expandreduce(this.boardtype[name][1],d);}
		else if(name.match(/(turn|flip)/)){ this.turnflip    (this.boardtype[name][1],d);}

		bd.setminmax();
		bd.resetInfo();
		pc.resize_canvas();	// Canvasを更新する
	},

	//------------------------------------------------------------------------------
	// menu.ex.expandreduce() 盤面の拡大・縮小を実行する
	// menu.ex.expandGroup()  オブジェクトの追加を行う
	// menu.ex.reduceGroup()  オブジェクトの消去を行う
	// menu.ex.isdel()        消去されるオブジェクトかどうか判定する
	//------------------------------------------------------------------------------
	expandreduce : function(key,d){
		bd.disableInfo();
		this.adjustBoardData(key,d);
		if(bd.areas.roomNumber && (key & this.REDUCE)){ this.reduceRoomNumber(key,d);}

		if(key & this.EXPAND){
			if     (key===this.EXPANDUP||key===this.EXPANDDN){ bd.qrows++;}
			else if(key===this.EXPANDLT||key===this.EXPANDRT){ bd.qcols++;}

							 { this.expandGroup(bd.CELL,   key);}
			if(!!bd.iscross) { this.expandGroup(bd.CROSS,  key);}
			if(!!bd.isborder){ this.expandGroup(bd.BORDER, key);}
			if(!!bd.isexcell){ this.expandGroup(bd.EXCELL, key);}
		}
		else if(key & this.REDUCE){
							 { this.reduceGroup(bd.CELL,   key);}
			if(!!bd.iscross) { this.reduceGroup(bd.CROSS,  key);}
			if(!!bd.isborder){ this.reduceGroup(bd.BORDER, key);}
			if(!!bd.isexcell){ this.reduceGroup(bd.EXCELL, key);}

			if     (key===this.REDUCEUP||key===this.REDUCEDN){ bd.qrows--;}
			else if(key===this.REDUCELT||key===this.REDUCERT){ bd.qcols--;}
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		bd.enableInfo();

		// 処理後にOperationManagerに登録する必要あり
		if(!um.undoExec && !um.redoExec){
			var key2 = key;
			for(var name in this.boardtype){ if(key===this.boardtype[name][1]){ key2=this.boardtype[name][0]; break;}}
			um.addOpe(bd.BOARD, 'adjust', 0, key2, key);
		}
	},
	expandGroup : function(type,key){
		var margin = bd.initGroup(type, bd.qcols, bd.qrows);
		var group = bd.getGroup(type);
		for(var i=group.length-1;i>=0;i--){
			if(this.isdel(type,i,key)){
				group[i] = bd.newObject(type);
				group[i].allclear(i,false);
				margin--;
			}
			else if(margin>0){ group[i] = group[i-margin];}
		}

		if(type===bd.BORDER){ this.expandborder(key);}
	},
	reduceGroup : function(type,key){
		if(type===bd.BORDER){ this.reduceborder(key);}

		var margin=0, group = bd.getGroup(type), isrec=(!um.undoExec && !um.redoExec);
		if(isrec){ um.forceRecord = true;}
		for(var i=0;i<group.length;i++){
			if(this.isdel(type,i,key)){
				group[i].allclear(i,isrec);
				margin++;
			}
			else if(margin>0){ group[i-margin] = group[i];}
		}
		for(var i=0;i<margin;i++){ group.pop();}
		if(isrec){ um.forceRecord = false;}
	},
	isdel : function(type,id,key){
		return !!this.insex[type][this.distObj(type,id,key)];
	},

	//------------------------------------------------------------------------------
	// menu.ex.turnflip()      回転・反転処理を実行する
	// menu.ex.turnflipGroup() turnflip()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	turnflip : function(key,d){
		bd.disableInfo();
		this.adjustBoardData(key,d);

		if(key & this.TURN){
			var tmp = bd.qcols; bd.qcols = bd.qrows; bd.qrows = tmp;
			bd.setposAll();
			d = {x1:0, y1:0, x2:2*bd.qcols, y2:2*bd.qrows};
		}

						   { this.turnflipGroup(bd.CELL,   key, d);}
		if(!!bd.iscross)   { this.turnflipGroup(bd.CROSS,  key, d);}
		if(!!bd.isborder)  { this.turnflipGroup(bd.BORDER, key, d);}
		if(bd.isexcell===2){ this.turnflipGroup(bd.EXCELL, key, d);}
		else if(bd.isexcell===1 && (key & this.FLIP)){
			var d2 = {x1:d.x1, y1:d.y1, x2:d.x2, y2:d.y2};
			if     (key===this.FLIPY){ d2.x1 = d2.x2 = -1;}
			else if(key===this.FLIPX){ d2.y1 = d2.y2 = -1;}
			this.turnflipGroup(bd.EXCELL, key, d2);
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		bd.enableInfo();

		// 処理後にOperationManagerに登録する必要あり
		if(!um.undoExec && !um.redoExec){
			var key2 = key;
			for(var name in this.boardtype){ if(key===this.boardtype[name][1]){ key2=this.boardtype[name][0]; break;}}
			um.addOpe(bd.BOARD, 'turnflip', d, key2, key);
		}
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
					case this.TURNR: next = bd.idnum(type, group[target].by, xx-group[target].bx, bd.qrows, bd.qcols); break;
					case this.TURNL: next = bd.idnum(type, yy-group[target].by, group[target].bx, bd.qrows, bd.qcols); break;
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
		if     (key===bd.UP){ return obj.by;}
		else if(key===bd.DN){ return 2*bd.qrows-obj.by;}
		else if(key===bd.LT){ return obj.bx;}
		else if(key===bd.RT){ return 2*bd.qcols-obj.bx;}
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
		if(bd.lines.borderAsLine || !um.undoExec){
			// 直前のexpandGroupで、bx,byプロパティが不定なままなので設定する
			bd.setposBorders();

			var dist = (bd.lines.borderAsLine?2:1);
			for(var id=0;id<bd.bdmax;id++){
				if(this.distObj(bd.BORDER,id,key)!==dist){ continue;}

				var source = (bd.lines.borderAsLine ? this.outerBorder(id,key) : this.innerBorder(id,key));
				this.copyBorder(id,source);
				if(bd.lines.borderAsLine){ bd.border[source].allclear(source,false);}
			}
		}
	},
	reduceborder : function(key){
		if(bd.lines.borderAsLine){
			for(var id=0;id<bd.bdmax;id++){
				if(this.distObj(bd.BORDER,id,key)!==0){ continue;}

				var source = this.innerBorder(id,key);
				this.copyBorder(id,source);
			}
		}
	},

	copyBorder : function(id1,id2){
		bd.border[id1].ques  = bd.border[id2].ques;
		bd.border[id1].qans  = bd.border[id2].qans;
		if(bd.lines.borderAsLine){
			bd.border[id1].line  = bd.border[id2].line;
			bd.border[id1].qsub  = bd.border[id2].qsub;
			bd.border[id1].color = bd.border[id2].color;
		}
	},
	innerBorder : function(id,key){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===bd.UP){ return bd.bnum(bx, by+2);}
		else if(key===bd.DN){ return bd.bnum(bx, by-2);}
		else if(key===bd.LT){ return bd.bnum(bx+2, by);}
		else if(key===bd.RT){ return bd.bnum(bx-2, by);}
		return null;
	},
	outerBorder : function(id,key){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===bd.UP){ return bd.bnum(bx, by-2);}
		else if(key===bd.DN){ return bd.bnum(bx, by+2);}
		else if(key===bd.LT){ return bd.bnum(bx-2, by);}
		else if(key===bd.RT){ return bd.bnum(bx+2, by);}
		return null;
	},

	//---------------------------------------------------------------------------
	// menu.ex.reduceRoomNumber()   盤面縮小時に数字つき部屋の処理を行う
	//---------------------------------------------------------------------------
	reduceRoomNumber : function(key,d){
		var qnums = [];
		for(var c=0;c<bd.cell.length;c++){
			if(!!this.insex[bd.CELL][this.distObj(bd.CELL,c,key)]){
				if(bd.cell[c].qnum!==-1){
					qnums.push({areaid:bd.areas.rinfo.getRoomID(c), id:c, val:bd.cell[c].qnum});
					bd.cell[c].qnum=-1;
				}
				bd.areas.rinfo.removeCell(c);
			}
		}
		for(var i=0;i<qnums.length;i++){
			var areaid = qnums[i].areaid;
			var top = bd.areas.rinfo.calcTopOfRoom(areaid);
			if(top===null){
				if(!um.undoExec && !um.redoExec){
					um.forceRecord = true;
					um.addOpe(bd.CELL, bd.QNUM, qnums[i].id, qnums[i].val, -1);
					um.forceRecord = false;
				}
			}
			else{
				bd.cell[top].qnum = qnums[i].val;
			}
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.adjustBoardData()    回転・反転開始前に各セルの調節を行う(共通処理)
	// menu.ex.adjustBoardData2()   回転・反転終了後に各セルの調節を行う(共通処理)
	// 
	// menu.ex.adjustNumberArrow()  回転・反転開始前の矢印つき数字の調整
	// menu.ex.adjustCellArrow()    回転・反転開始前の矢印セルの調整
	// 
	// menu.ex.adjustQues51_1()     回転・反転開始前の[＼]セルの調整
	// menu.ex.adjustQues51_2()     回転・反転終了後の[＼]セルの調整
	// 
	// menu.ex.adjustBoardObject()  回転・反転開始前のIN/OUTなどの位置の調整
	//------------------------------------------------------------------------------
	adjustBoardData  : function(key,d){ },
	adjustBoardData2 : function(key,d){ },

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

	getAfterPos : function(key,d,group,id){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);

		var obj=bd.getObject(group,id), bx1=obj.bx, by1=obj.by, bx2, by2;
		switch(key){
			case this.FLIPY: bx2 = bx1; by2 = yy-by1; break;
			case this.FLIPX: bx2 = xx-bx1; by2 = by1; break;
			case this.TURNR: bx2 = yy-by1; by2 = bx1; break;
			case this.TURNL: bx2 = by1; by2 = xx-bx1; break;
			case this.EXPANDUP: bx2 = bx1; by2 = by1+(by1===bd.minby?0:2); break;
			case this.EXPANDDN: bx2 = bx1; by2 = by1+(by1===bd.maxby?2:0); break;
			case this.EXPANDLT: bx2 = bx1+(bx1===bd.minbx?0:2); by2 = by1; break;
			case this.EXPANDRT: bx2 = bx1+(bx1===bd.maxbx?2:0); by2 = by1; break;
			case this.REDUCEUP: bx2 = bx1; by2 = by1-(by1<=bd.minby+2?0:2); break;
			case this.REDUCEDN: bx2 = bx1; by2 = by1-(by1>=bd.maxby-2?2:0); break;
			case this.REDUCELT: bx2 = bx1-(bx1<=bd.minbx+2?0:2); by2 = by1; break;
			case this.REDUCERT: bx2 = bx1-(bx1>=bd.maxbx-2?2:0); by2 = by1; break;
			default: bx2 = bx1; by2 = by1; break;
		}
		return {bx1:bx1, by1:by1, bx2:bx2, by2:by2, isdel:this.isdel(group,id,key)};
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
