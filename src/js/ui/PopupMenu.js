// Menu.js v3.4.0
/* global Candle:false, ui:false, _doc:false, getEL:false */

//---------------------------------------------------------------------------
// ★PopupManagerクラス ポップアップメニューを管理します
//---------------------------------------------------------------------------
ui.popupmgr =
{
	popup     : null,	/* 表示中のポップアップメニュー */
	
	popups    : {},		/* 管理しているポップアップメニューのオブジェクト一覧 */
	
	movingpop : null,	/* 移動中のポップアップメニュー */
	offset : {px:0, py:0},	/* 移動中ポップアップメニューのページ左上からの位置 */
	
	//---------------------------------------------------------------------------
	// popupmgr.reset()      ポップアップメニューの設定をクリアする
	// popupmgr.setEvents()  ポップアップメニュー(タイトルバー)のイベントを設定する
	//---------------------------------------------------------------------------
	reset : function(){
		/* イベントを割り当てる */
		this.setEvents();
		
		/* Captionを設定する */
		this.translate();
	},
	
	setEvents : function(){
		ui.event.addEvent(_doc, "mousemove", this, this.titlebarmove);
		ui.event.addEvent(_doc, "mouseup",   this, this.titlebarup);
	},

	//---------------------------------------------------------------------------
	// popupmgr.translate()  言語切り替え時にキャプションを変更する
	//---------------------------------------------------------------------------
	translate : function(){
		for(var name in this.popups){ this.popups[name].translate();}
	},

	//---------------------------------------------------------------------------
	// popupmgr.addpopup()   ポップアップメニューを追加する
	//---------------------------------------------------------------------------
	addpopup : function(idname, proto){
		var NewPopup = {}, template = this.popups.template || {};
		for(var name in template){ NewPopup[name] = template[name];}
		for(var name in proto)   { NewPopup[name] = proto[name];}
		this.popups[idname] = NewPopup;
	},

	//---------------------------------------------------------------------------
	// popupmgr.open()  ポップアップメニューを開く
	//---------------------------------------------------------------------------
	open : function(idname, px, py){
		var target = this.popups[idname] || null;
		if(target!==null){
			/* 表示しているウィンドウがある場合は閉じる */
			if(!target.multipopup && !!this.popup){ this.popup.close();}
			
			/* ポップアップメニューを表示する */
			target.show(px, py);
			return true;
		}
		return false;
	},

	//---------------------------------------------------------------------------
	// popupmgr.titlebardown()  タイトルバーをクリックしたときの動作を行う(タイトルバーにbind)
	// popupmgr.titlebarup()    タイトルバーでボタンを離したときの動作を行う(documentにbind)
	// popupmgr.titlebarmove()  タイトルバーからマウスを動かしたときポップアップメニューを動かす(documentにbind)
	//---------------------------------------------------------------------------
	titlebardown : function(e){
		var popel = e.target.parentNode;
		var pos = pzpr.util.getPagePos(e);
		this.movingpop = popel;
		this.offset.px = pos.px - parseInt(popel.style.left);
		this.offset.py = pos.py - parseInt(popel.style.top);
		ui.event.enableMouse = false;
	},
	titlebarup : function(e){
		var popel = this.movingpop;
		if(!!popel){
			this.movingpop = null;
			ui.event.enableMouse = true;
		}
	},
	titlebarmove : function(e){
		var popel = this.movingpop;
		if(!!popel){
			var pos = pzpr.util.getPagePos(e);
			popel.style.left = pos.px - this.offset.px + 'px';
			popel.style.top  = pos.py - this.offset.py + 'px';
			e.preventDefault();
		}
	}
};

//---------------------------------------------------------------------------
// ★PopupMenuクラス ポップアップメニューを作成表示するベースのオブジェクトです
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('template',
{
	formname : '',
	multipopup : false,

	reset : function(){
		this.pop       = null;
		this.titlebar  = null;
		this.form      = null;
		this.captions  = [];
	},

	translate : function(){
		if(!this.captions){ return;}
		for(var i=0;i<this.captions.length;i++){
			var obj  = this.captions[i];
			var text = ui.selectStr(obj.str_jp, obj.str_en);
			if   (!!obj.textnode){ obj.textnode.data = text;}
			else if(!!obj.button){ obj.button.value  = text;}
		}
	},

	searchForm : function(){
		this.form = document[this.formname];
		this.pop = this.form.parentNode;
		this.walkElement(this.pop);
		this.translate();
		
		pzpr.util.unselectable(this.titlebar);
	},
	walkElement : function(parent){
		var popup = this;
		ui.misc.walker(parent, function(el){
			if(el.nodeType===1 && el.className==='titlebar'){ popup.titlebar=el;}
			else if(el.nodeType===3 && el.data.match(/^__(.+)__(.+)__$/)){
				popup.captions.push({textnode:el, str_jp:RegExp.$1, str_en:RegExp.$2});
			}
		});
	},

	setEvent : function(){
		this.walkEvent(this.pop);
		this.setFormEvent();
		
		pzpr.util.addEvent(this.form, "submit", this, function(e){ e.preventDefault();});
		if(!!this.titlebar){
			var mgr = ui.popupmgr;
			pzpr.util.addEvent(this.titlebar, "mousedown", mgr, mgr.titlebardown);
		}
	},
	walkEvent : function(parent){
		var popup = this;
		ui.misc.walker(parent, function(el){
			if(el.nodeType!==1){ return;}
			var role = ui.customAttr(el,"buttonExec");
			if(!!role){
				pzpr.util.addEvent(el, (!pzpr.env.API.touchevent ? "click" : "mousedown"), popup, popup[role]);
			}
			role = ui.customAttr(el,"changeExec");
			if(!!role){
				pzpr.util.addEvent(el, "change", popup, popup[role]);
			}
		});
	},
	setFormEvent : function(){
	},

	show : function(px,py){
		if(!this.pop){
			this.reset();
			this.searchForm();
			this.setEvent();
		}
		this.pop.style.left = px + 'px';
		this.pop.style.top  = py + 'px';
		this.pop.style.display = 'inline';
		if(!this.multipopup){
			ui.popupmgr.popup = this;
		}
	},
	close : function(){
		this.pop.style.display = "none";
		if(!this.multipopup){
			ui.popupmgr.popup = null;
		}
		
		ui.puzzle.key.enableKey = true;
		ui.puzzle.mouse.enableMouse = true;
	}
});

//---------------------------------------------------------------------------
// ★Popup_NewBoardクラス 新規盤面作成のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('newboard',
{
	formname : 'newboard',
	
	setFormEvent : function(){
		var puzzle = ui.puzzle, bd = puzzle.board, pid = puzzle.pid;
		
		/* タテヨコのサイズ指定部分 */
		getEL("nb_size").style.display        = ((pid!=='sudoku') ? "" : "none");
		getEL("nb_size_sudoku").style.display = ((pid==='sudoku') ? "" : "none");
		
		var col = bd.qcols, row = bd.qrows;
		if(pid==='tawa' && bd.shape===3){ col++;}
		
		if(pid!=='sudoku'){
			this.form.col.value=''+col;
			this.form.row.value=''+row;
			
			getEL("nb_cols").style.display      = ((pid!=='tawa') ? "" : "none");
			getEL("nb_rows").style.display      = ((pid!=='tawa') ? "" : "none");
			getEL("nb_cols_tawa").style.display = ((pid==='tawa') ? "" : "none");
			getEL("nb_rows_tawa").style.display = ((pid==='tawa') ? "" : "none");
		}
		else{
			for(var i=0;i<4;i++){ getEL("nb_size_sudoku_"+i).checked = '';}
			if     (col===16){ getEL("nb_size_sudoku_2").checked = true;}
			else if(col===25){ getEL("nb_size_sudoku_3").checked = true;}
			else if(col=== 4){ getEL("nb_size_sudoku_0").checked = true;}
			else if(col=== 6){ getEL("nb_size_sudoku_4").checked = true;}
			else             { getEL("nb_size_sudoku_1").checked = true;}
		}
		
		/* たわむレンガの形状指定ルーチン */
		getEL("nb_shape_tawa").style.display = ((pid==='tawa') ? "" : "none");
		if(pid==='tawa'){ this.setFormEvent_tawa();}
	},
	setFormEvent_tawa : function(){
		for(var i=0;i<=3;i++){
			var _div = getEL("nb_shape_"+i), _img = _div.children[0];
			_img.src = "data:image/gif;base64,R0lGODdhgAAgAKEBAAAAAP//AP//////ACwAAAAAgAAgAAAC/pSPqcvtD6OctNqLs968+98A4kiWJvmcquisrtm+MpAAwY0Hdn7vPN1aAGstXs+oQw6FyqZxKfDlpDhqLyXMhpw/ZfHJndbCVW9QATWkEdYk+Pntvn/j+dQc0hK39jKcLxcoxkZ29JeHpsfUZ0gHeMeoUyfo54i4h7lI2TjI0PaJp1boZumpeLCGOvoZB7kpyTbzIiTrglY7o4Yrc8l2irYamjiciar2G4VM7Lus6fpcdVZ8PLxmrTyd3AwcydprvK19HZ6aPf5YCX31TW3ezuwOcQ7vGXyIPA+e/w6ORZ5ir9S/gfu0ZRt4UFU3YfHiFSyoaxeMWxJLUKx4IiLGZIn96HX8iNBjQ5EG8Zkk+dDfyJAgS7Lkxy9lOJTYXMK0ibOlTJ0n2eEs97OnUJ40X668SfRo0ZU7SS51erOp0XxSkSaFGtTo1a0bUcSo9bVr2I0gypo9izat2rVs27p9Czfu2QIAOw==";
			_img.style.clip = "rect(0px,"+((i+1)*32)+"px,"+32+"px,"+(i*32)+"px)";
		}
		this.setbgcolor([0,2,3,1][ui.puzzle.board.shape]);
	},
	setbgcolor : function(idx){
		for(var i=0;i<=3;i++){
			getEL("nb_shape_"+i).style.backgroundColor = (i===idx?'red':'');
		}
	},
	clickshape : function(e){
		this.setbgcolor(+e.target.parentNode.id.charAt(9));
	},
	
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		ui.puzzle.key.enableKey = false;
	},
	//---------------------------------------------------------------------------
	// execute() 新規盤面を作成するボタンを押したときの処理を行う
	//---------------------------------------------------------------------------
	execute : function(){
		var pid = ui.puzzle.pid;
		var col, row, url=[], NB=this.form;
		
		if(pid!=='sudoku'){
			col = (parseInt(NB.col.value))|0;
			row = (parseInt(NB.row.value))|0;
		}
		else{
			if     (getEL("nb_size_sudoku_2").checked){ col=row=16;}
			else if(getEL("nb_size_sudoku_3").checked){ col=row=25;}
			else if(getEL("nb_size_sudoku_0").checked){ col=row= 4;}
			else if(getEL("nb_size_sudoku_4").checked){ col=row= 6;}
			else                                      { col=row= 9;}
		}
		if(!!col && !!row){ url = [col, row];}
		
		if(url.length>0 && pid==='tawa'){
			var selected=null;
			for(var i=0;i<=3;i++){
				if(getEL("nb_shape_"+i).style.backgroundColor==='red'){ selected=[0,3,1,2][i]; break;}
			}
			if(!isNaN(selected) && !(col===1 && (selected===0||selected===3))){
				if(selected===3){ col--; url=[col,row];}
				url.push(selected);
			}
			else{ url=[];}
		}
		
		this.close();
		if(url.length>0){
			ui.puzzle.open(pid+"/"+url.join('/'));
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLInputクラス URL入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('urlinput',
{
	formname : 'urlinput',
	
	//------------------------------------------------------------------------------
	// urlinput() URLを入力する
	//------------------------------------------------------------------------------
	urlinput : function(){
		this.close();
		ui.puzzle.open(this.form.ta.value.replace(/\n/g,""));
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLOutputクラス URL出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('urloutput',
{
	formname : 'urloutput',
	
	setFormEvent : function(){
		var form = this.form, pid = ui.puzzle.pid, exists = pzpr.variety.info[pid].exists;
		// form.pzprapp.style.display = form.pzprapp.nextSibling.style.display = (exists.pzprapp ? "" : "none");
		form.kanpen.style.display  = form.kanpen.nextSibling.style.display  = (exists.kanpen ? "" : "none");
		form.heyaapp.style.display = form.heyaapp.nextSibling.style.display = ((pid==="heyawake") ? "" : "none");
	},
	
	//------------------------------------------------------------------------------
	// urloutput() URLを出力する
	// openurl()   「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urloutput : function(e){
		var url = '', parser = pzpr.parser;
		switch(e.target.name){
			case "pzprv3":     url = ui.puzzle.getURL(parser.URL_PZPRV3);  break;
			// case "pzprapp": url = ui.puzzle.getURL(parser.URL_PZPRAPP); break;
			case "kanpen":     url = ui.puzzle.getURL(parser.URL_KANPEN);  break;
			case "pzprv3e":    url = ui.puzzle.getURL(parser.URL_PZPRV3E); break;
			case "heyaapp":    url = ui.puzzle.getURL(parser.URL_HEYAAPP); break;
		}
		this.form.ta.value = url;
	},
	openurl : function(e){
		if(this.form.ta.value!==''){
			window.open(this.form.ta.value, '', '');
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileOpenクラス ファイル入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('fileopen',
{
	formname : 'fileform',
	
	setFormEvent : function(){
		this.form.action = ui.fileio;
	},
	
	//------------------------------------------------------------------------------
	// fileopen()  ファイルを開く
	//------------------------------------------------------------------------------
	fileopen : function(e){
		var fileEL = this.form.filebox;
		if(!!ui.reader || ui.enableGetText){
			var fitem = fileEL.files[0];
			if(!fitem){ return;}
			
			if(!!ui.reader){ ui.reader.readAsText(fitem);}
			else           { ui.puzzle.open(fitem.getAsText(''));}
		}
		else{
			if(!fileEL.value){ return;}
			this.form.action = ui.fileio;
			this.form.submit();
		}
		this.form.reset();
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileSaveクラス ファイル出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('filesave',
{
	formname : 'filesave',
	anchor : null,
	setFormEvent : function(){
		this.anchor = ((!ui.enableSaveBlob && pzpr.env.API.anchor_download) ? getEL("saveanchor") : null);
		
		this.form.action = ui.fileio;
		
		/* ファイル形式選択オプション */
		var ispencilbox = pzpr.variety.info[ui.puzzle.pid].exists.pencilbox;
		this.form.filetype.options[1].disabled = !ispencilbox;
		
		this.form.filename.value = ui.puzzle.pid+".txt";
	},
	/* オーバーライド */
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		
		ui.puzzle.key.enableKey = false;
	},
	close : function(){
		if(!!this.filesaveurl){ URL.revokeObjectURL(this.filesaveurl);}
		
		ui.popupmgr.popups.template.close.call(this);
	},
	
	//------------------------------------------------------------------------------
	// filesave()  ファイルを保存する
	//------------------------------------------------------------------------------
	filesaveurl : null,
	filesave : function(){
		var form = this.form;
		var filename = form.filename.value;
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){
			if(filename.indexOf(prohibit[i])!==-1){ ui.notify.alert('ファイル名として使用できない文字が含まれています。'); return;}
		}

		var parser = pzpr.parser, filetype = parser.FILE_PZPR;
		switch(form.filetype.value){
			case 'filesave2': filetype = parser.FILE_PBOX; break;
			case 'filesave3': filetype = parser.FILE_PZPH; break;
		}

		var blob = null, filedata = null;
		if(ui.enableSaveBlob || !!this.anchor){
			blob = new Blob([ui.puzzle.getFileData(filetype)], {type:'text/plain'});
		}
		else{
			filedata = ui.puzzle.getFileData(filetype);
		}

		if(ui.enableSaveBlob){
			navigator.saveBlob(blob, filename);
			this.close();
		}
		else if(!!this.anchor){
			if(!!this.filesaveurl){ URL.revokeObjectURL(this.filesaveurl);}
			this.filesaveurl = URL.createObjectURL(blob);
			this.anchor.href = this.filesaveurl;
			this.anchor.download = filename;
			this.anchor.click();
		}
		else{
			form.ques.value = filedata;
			form.submit();
			this.close();
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_ImageSaveクラス 画像出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('imagesave',
{
	formname : 'imagesave',
	anchor : null,
	showsize : null,
	setFormEvent : function(){
		this.anchor = ((!ui.enableSaveBlob && pzpr.env.API.anchor_download) ? getEL("saveanchor") : null);
		this.showsize = getEL("showsize");
		
		this.form.action = ui.fileio;
		
		/* ファイル形式選択オプション */
		var filetype = this.form.filetype, options = filetype.options;
		for(var i=0;i<options.length;i++){
			var option = options[i];
			if(option.value==="svg" && !ui.enableSaveSVG)  { filetype.removeChild(option);}
			if(option.value==="png" && !ui.enableSaveImage){ filetype.removeChild(option);}
		}
		
		this.form.filename.value = ui.puzzle.pid+".png";
		this.form.cellsize.value = ui.menuconfig.get('cellsizeval');
		
		this.changefilename();
		this.estimatesize();
	},
	
	/* オーバーライド */
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		
		ui.puzzle.key.enableKey = false;
		ui.puzzle.mouse.enableMouse = false;
	},
	close : function(){
		if(!!this.saveimageurl){ URL.revokeObjectURL(this.saveimageurl);}
		
		ui.puzzle.setCanvasSize();
		ui.popupmgr.popups.template.close.call(this);
	},
	
	changefilename : function(){
		var filename = this.form.filename.value.replace('.png','.').replace('.svg','.');
		this.form.filename.value = filename + (this.form.filetype.value!=='svg'?'png':'svg');
	},
	estimatesize : function(){
		var cellsize = +this.form.cellsize.value;
		var width  = (+cellsize * ui.puzzle.painter.getCanvasCols())|0;
		var height = (+cellsize * ui.puzzle.painter.getCanvasRows())|0;
		this.showsize.replaceChild(_doc.createTextNode(width+" x "+height), this.showsize.firstChild);
	},
	
	//------------------------------------------------------------------------------
	// saveimage()    画像をダウンロードする
	// submitimage() "画像をダウンロード"の処理ルーチン
	// saveimage()   "画像をダウンロード"の処理ルーチン (IE10用)
 	//------------------------------------------------------------------------------
	saveimageurl : null,
	saveimage : function(){
		/* ファイル名チェックルーチン */
		var form = this.form;
		var filename = form.filename.value;
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){
			if(filename.indexOf(prohibit[i])!==-1){ ui.notify.alert('ファイル名として使用できない文字が含まれています。'); return;}
		}

		/* 画像出力ルーチン */
		var cellsize = +form.cellsize.value;
		var type = (form.filetype.value!=='svg'?'png':'svg');

		var blob = null, filedata = null;
		try{
			if(ui.enableSaveBlob || !!this.anchor){
				blob = ui.puzzle.toBlob(type,cellsize);
			}
			else{
				filedata = ui.puzzle.toDataURL(type,cellsize).replace(/data:.*;base64,/, '');
			}
		}
		catch(e){
			ui.notify.alert('画像の出力に失敗しました','Fail to Output the Image');
		}

		/* 出力された画像の保存ルーチン */
		if(ui.enableSaveBlob){
			navigator.saveBlob(blob, filename);
			this.close();
		}
		else if(!!this.anchor){
			if(!!this.filesaveurl){ URL.revokeObjectURL(this.filesaveurl);}
			this.filesaveurl = URL.createObjectURL(blob);
			this.anchor.href = this.filesaveurl;
			this.anchor.download = filename;
			this.anchor.click();
		}
		else{
			form.urlstr.value = filedata;
			form.submit();
			this.close();
		}
	},
	
 	//------------------------------------------------------------------------------
	// openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	openimage : function(){
		/* 画像出力ルーチン */
		var cellsize = +this.form.cellsize.value;
		var type = (this.form.filetype.value!=='svg'?'png':'svg');
		
		var dataurl = "";
		try{
			dataurl = ui.puzzle.toDataURL(type,cellsize);
		}
		catch(e){
			ui.notify.alert('画像の出力に失敗しました','Fail to Output the Image');
		}
		
		/* 出力された画像を開くルーチン */
		if(!dataurl){ /* dataurlが存在しない */}
		else if(!pzpr.env.browser.IE9){
			window.open(dataurl, '', '');
		}
		else{
			// IE9だとアドレスバーの長さが2KBだったり、
			// そもそもDataURL入れても何も起こらなかったりする対策
			var cdoc = window.open('', '', '').document;
			cdoc.open();
			cdoc.writeln("<!DOCTYPE html>\n<HTML LANG=\"ja\">\n<HEAD>");
			cdoc.writeln("<META CHARSET=\"utf-8\">");
			cdoc.writeln("<TITLE>ぱずぷれv3<\/TITLE>\n<\/HEAD>");
			cdoc.writeln("<BODY><img src=\"", dataurl, "\"><\/BODY>\n<\/HTML>");
			cdoc.close();
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_Adjustクラス 盤面の調整のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('adjust',
{
	formname : 'adjust',
	
	adjust : function(e){
		ui.puzzle.board.exec.execadjust(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_TurnFlipクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('turnflip',
{
	formname : 'turnflip',
	
	setFormEvent : function(){
		this.form.turnl.disabled = (ui.puzzle.pid==='tawa');
		this.form.turnr.disabled = (ui.puzzle.pid==='tawa');
	},
	
	adjust : function(e){
		ui.puzzle.board.exec.execadjust(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_Colorsクラス 色の選択を行うメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('colors',
{
	formname : 'colors',
	
	setFormEvent : function(){
		this.refresh();
	},

	//------------------------------------------------------------------------------
	// refresh()    フォームに表示される色を再設定する
	//------------------------------------------------------------------------------
	refresh : function(name){
		ui.misc.walker(this.form, function(el){
			if(el.nodeName==="INPUT" && el.getAttribute("type")==="color"){
				var target = ui.customAttr(el,"colorTarget");
				if(!!target && (!name || name===target)){
					el.value = Candle.parse(ui.puzzle.painter[target]);
				}
			}
		});
	},
	
	//------------------------------------------------------------------------------
	// setcolor()   色を設定する
	// clearcolor() 色の設定をクリアする
	//------------------------------------------------------------------------------
	setcolor : function(e){
		var name = ui.customAttr(e.target,"colorTarget");
		ui.puzzle.setConfig("color_"+name, e.target.value);
	},
	clearcolor : function(e){
		var name = ui.customAttr(e.target,"colorTarget");
		ui.puzzle.setConfig("color_"+name, "");
		this.refresh(name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_DispSizeクラス サイズの変更を行うポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('dispsize',
{
	formname : 'dispsize',
	
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		
		this.form.cellsize.value = ui.menuconfig.get('cellsizeval');
		ui.puzzle.key.enableKey = false;
	},
	
	//------------------------------------------------------------------------------
	// changesize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	changesize : function(e){
		var csize = parseInt(this.form.cellsize.value);
		if(csize>0){ ui.menuconfig.set('cellsizeval', (csize|0));}
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_Creditクラス Creditやバージョン情報を表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('credit',
{
	formname : 'credit'
});
