// MenuExec.js v3.4.0

//---------------------------------------------------------------------------
// ★MenuExecクラス ポップアップウィンドウ内でボタンが押された時の処理内容を記述する
//---------------------------------------------------------------------------

// Menuクラス実行部
pzprv3.createCommonClass('MenuExec',
{
	initialize : function(owner){
		this.owner = owner;

		this.displaymanage = true;

		this.reader;	// FileReaderオブジェクト
	},

	fileio : (document.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi"),
	enableReadText : false,

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
		this.owner.editmode = (num==1);
		this.owner.playmode = (num==3);

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

		this.owner.importBoardData({id:this.owner.pid, qdata:qdata});
	},

	//------------------------------------------------------------------------------
	// menu.ex.urlinput()   URLを入力する
	// menu.ex.urloutput()  URLを出力する
	// menu.ex.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(menu.pop){
			menu.popclose();

			var pzl = pzprv3.parseURLType(document.urlinput.ta.value);
			if(!!pzl.id){ this.owner.importBoardData(pzl);}
		}
	},
	urloutput : function(e){
		if(menu.pop){
			var _doc = document;
			switch(ee.getSrcElement(e).name){
				case "pzprv3":     _doc.urloutput.ta.value = enc.pzloutput(pzprv3.PZPRV3);  break;
				case "pzprapplet": _doc.urloutput.ta.value = enc.pzloutput(pzprv3.PZPRAPP); break;
				case "kanpen":     _doc.urloutput.ta.value = enc.pzloutput(pzprv3.KANPEN);  break;
				case "pzprv3edit": _doc.urloutput.ta.value = enc.pzloutput(pzprv3.PZPRV3E); break;
				case "heyaapp":    _doc.urloutput.ta.value = enc.pzloutput(pzprv3.HEYAAPP); break;
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

		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.owner.pid);
		this.owner.importBoardData({id:pid, fstr:fstr});

		document.fileform.reset();
		timer.reset();
	},

	filesave : function(ftype){
		var fname = prompt("保存するファイル名を入力して下さい。", this.owner.pid+".txt");
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
		var url = './p.html?'+this.owner.pid+(pzprv3.PLAYER?"_play":"");
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
	imagesave : function(isDL,cellsize){
		var canvas_sv = this.owner.canvas;
		try{
			this.owner.canvas = ee('divques_sub').el;
			var pc2 = new this.owner.classes.Graphic(this.owner);

			// 設定値・変数をcanvas用のものに変更
			pc2.suspendAll();
			pc2.outputImage = true;
			pc2.fillTextEmulate = false;
			pc2.bdmargin = pc.bdmargin_image;
			pc2.setcellsize = function(){
				if(!cellsize){ cellsize = pc.cw;}
				pc2.cw = cellsize;
				pc2.ch = cellsize*(pc.ch/pc.cw);
			};

			// canvas要素の設定を適用して、再描画
			pc2.resize_canvas();
			pc2.unsuspend();

			// canvasの描画内容をDataURLとして取得する
			var url = pc2.currentContext.canvas.toDataURL();

			if(isDL){ this.submitimage(url);}
			else    { this.openimage(url);}
		}
		catch(e){
			menu.alertStr('画像の出力に失敗しました..','Fail to Output the Image..');
		}
		this.owner.canvas = canvas_sv;
	},

	submitimage : function(url){
		var _doc = document;
		_doc.fileform2.filename.value  = this.owner.pid+'.png';
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
			pc.forceRedraw();	// Canvasを更新する
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

		pc.forceRedraw();	// canvasの左上座標等を更新して再描画
	},
	dispmanstr : function(){
		if(!this.displaymanage){ ee('ms_manarea').el.innerHTML = menu.selectStr("管理領域を表示","Show management area");}
		else                   { ee('ms_manarea').el.innerHTML = menu.selectStr("管理領域を隠す","Hide management area");}
	},

	//------------------------------------------------------------------------------
	// menu.ex.popupadjust()  "盤面の調整""回転・反転"でボタンが押された時に実行条件をチェック
	//------------------------------------------------------------------------------
	popupadjust : function(e){
		if(menu.pop){
			bd.execadjust(ee.getSrcElement(e).name);
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
