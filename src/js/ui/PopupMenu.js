// Menu.js v3.4.0

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
		/* 一旦全てのpopupを削除する */
		for(var name in this.popups){
			var popup = this.popups[name];
			if(!popup.disable_remove){ popup.remove();}
		}
		
		/* デバッグ用を作っておかないとTextAreaがなくてエラーするため、オブジェクトを作成する */
		if(!this.popups.debug.pop){
			this.popups.debug.show(0,0);
			this.popups.debug.hide();
		}
		
		/* キーポップアップも個々で作成する */
		ui.keypopup.create();
		
		/* イベントを割り当てる */
		this.setEvents();
		
		this.translate();
	},
	
	setEvents : function(){
		for(var name in this.popups){ this.popups[name].setEvent();}
		ui.event.addMouseMoveEvent(_doc, this, this.titlebarmove);
		ui.event.addMouseUpEvent  (_doc, this, this.titlebarup);
	},

	//---------------------------------------------------------------------------
	// popupmgr.addpopup()   ポップアップメニューを追加する
	//---------------------------------------------------------------------------
	addpopup : function(idname, proto){
		var NewPopup = {}, template = this.popups.template;
		if(!template){ template = {};}
		for(var name in template){ NewPopup[name] = template[name];}
		for(var name in proto)   { NewPopup[name] = proto[name];}
		this.popups[idname] = NewPopup;
	},

	//---------------------------------------------------------------------------
	// popupmgr.open()  ポップアップメニューを開く
	//---------------------------------------------------------------------------
	open : function(idname, px, py){
		if(idname==='poptest'){
			this.popups.debug.show(px, py);
			return true;
		}

		var target = null;
		switch(idname){
			case 'newboard':  target = this.popups.newboard; break;
			case 'urlinput':  target = this.popups.urlinput; break;
			case 'urloutput': target = this.popups.urloutput; break;
			case 'fileopen':  target = this.popups.fileopen; break;
			case 'filesave':  target = this.popups.filesave; break;
			case 'imagesave': target = this.popups.imagesave; break;
			case 'database':  target = this.popups.database; break;
			case 'adjust':    target = this.popups.adjust; break;
			case 'turn':      target = this.popups.turnflip; break;
			case 'credit':    target = this.popups.credit; break;
			case 'dispsize':  target = this.popups.dispsize; break;
		}
		if(target!==null){
			/* 表示しているウィンドウがある場合は閉じる */
			if(this.popup){ this.popup.hide();}
			
			/* ポップアップメニューを表示する */
			target.show(px, py);
			return true;
		}
		return false;
	},

	//---------------------------------------------------------------------------
	// popupmgr.translate()  言語切り替え時にキャプションを変更する
	//---------------------------------------------------------------------------
	translate : function(){
		for(var name in this.popups){ this.popups[name].translate();}
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
			pzpr.util.preventDefault(e);
		}
	}
};

//---------------------------------------------------------------------------
// ★PopupMenuクラス ポップアップメニューを作成表示するベースのオブジェクトです
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('template',
{
	reset : function(){
		this.popparent = getEL("popup_parent");
		this.pop       = null;
		this.titlebar  = null;
		this.form      = null;
		this.captions  = [];
	},
	remove : function(){
		if(!!this.pop){
			this.popparent.removeChild(this.pop);
			this.reset();
		}
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
	createTextNode : function(str_jp, str_en){
		var textnode = _doc.createTextNode(ui.selectStr(str_jp, str_en));
		this.captions.push({textnode:textnode, str_jp:str_jp, str_en:str_en});
		return textnode;
	},

	formname : '',
	disable_remove : false,

	makeElement : function(){
		this.reset();
		
		this.pop = createEL('div');
		this.pop.className = 'popup';
		this.popparent.appendChild(this.pop);
		
		var bar = createEL('div');
		bar.className = 'titlebar';
		pzpr.util.unselectable(bar);
		this.pop.appendChild(bar);
		this.titlebar = bar;
		
		this.form = createEL('form');
		this.form.name = this.formname;
		this.pop.appendChild(this.form);
	},
	makeForm : function(){
	},

	setEvent :function(){
		if(!!this.titlebar){
			var mgr = ui.popupmgr;
			ui.event.addMouseDownEvent(this.titlebar, mgr, mgr.titlebardown);
		}
	},

	show : function(px,py){
		if(!this.pop){
			this.makeElement();
			this.makeForm();
			this.setEvent();
		}
		this.pop.style.left = px + 'px';
		this.pop.style.top  = py + 'px';
		this.pop.style.display = 'inline';
		ui.popupmgr.popup = this;
	},
	hide : function(){
		this.pop.style.display = "none";
		ui.popupmgr.popup = null;
		
		ui.puzzle.key.enableKey = true;
		ui.puzzle.mouse.enableMouse = true;
	},

	settitle : function(str_jp, str_en){
		this.titlebar.appendChild(this.createTextNode(str_jp, str_en));
	},

	addText : function(str_jp, str_en){
		var el = createEL('span');
		el.appendChild(this.createTextNode(str_jp, str_en));
		this.form.appendChild(el);
	},
	addBR : function(){
		this.form.appendChild(createEL('br'));
	},
	addInput : function(type, attr){
		var el = createEL('input');
		try{ el.type = type;}
		catch(e){ el.type = "text"; /* IE8まででエラーをくらうので修正 */}
		for(var att in attr){ el[att]=attr[att];}
		this.form.appendChild(el);
	},
	addTextArea : function(attr){
		var el = createEL('textarea');
		for(var att in attr){ el[att]=attr[att];}
		this.form.appendChild(el);
	},
	addSelect : function(attr, options){
		var sel = createEL('select');
		if(!!attr){ for(var att in attr){ sel[att]=attr[att];}}
		this.form.appendChild(sel);
		for(var i=0;i<options.length;i++){
			var op = createEL('option');
			op.value = options[i].name;
			op.appendChild(this.createTextNode(options[i].str_jp, options[i].str_en));
			sel.appendChild(op);
		}
	},
	addElement : function(el){
		this.form.appendChild(el);
	},

	addExecButton : function(str_jp, str_en, func, attr){
		var el = createEL('input');
		el.type = 'button';
		el.value = ui.selectStr(str_jp, str_en);
		if(!!attr){ for(var att in attr){ el[att]=attr[att];}}
		el.onclick = func;
		this.form.appendChild(el);
		this.captions.push({button:el, str_jp:str_jp, str_en:str_en});
	},
	addCancelButton : function(){
		var popup = this;
		this.addExecButton("キャンセル", "Cancel", function(){ popup.hide();})
	}
});

//---------------------------------------------------------------------------
// ★Popup_NewBoardクラス 新規盤面作成のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('newboard',
{
	formname : 'newboard',
	
	//---------------------------------------------------------------------------
	// makeForm()            新規盤面作成のポップアップメニューを作成する
	// makeForm_tawa_shape() たわむれんがの形状入力用部
	//---------------------------------------------------------------------------
	makeForm : function(){
		var puzzle = ui.puzzle, bd = puzzle.board, pid = puzzle.pid;
		this.settitle("盤面の新規作成", "Createing New Board");
		
		this.addText("盤面を新規作成します。", "Create New Board.");
		this.addBR();
		
		/* タテヨコのサイズ指定部分 */
		var col = bd.qcols, row = bd.qrows;
		if(pid==='tawa' && bd.shape===3){ col++;}
		
		if(pid!=='sudoku'){
			var attr = {name:'col', value:''+col, size:'4', maxlength:'3', min:'1', max:'999'};
			if(pid!=='tawa'){
				this.addText("よこ", "Cols");
				this.addInput('number', attr);
			}
			else{
				this.addInput('number', attr);
				this.addText("横幅 (黄色の数)", "Width (Yellows)");
			}
			this.addBR();
			
			attr.name='row'; attr.value=''+row;
			if(pid!=='tawa'){
				this.addText("たて", "Rows");
				this.addInput('number', attr);
			}
			else{
				this.addInput('number', attr);
				this.addText("高さ", "Height");
			}
			this.addBR();
		}
		else{
			var sizelist = [4,9,16,25], idx=1;
			if    (col!==row){ idx=1;}
			else if(col===16){ idx=2;}
			else if(col===25){ idx=3;}
			else if(col=== 4){ idx=0;}
			
			for(var i=0;i<4;i++){
				var size = sizelist[i], text = ""+size+"x"+size;
				this.addInput('radio', {name:'size', value:''+size, checked:((idx===i)?'checked':'')});
				this.addText(text, text);
				this.addBR();
			}
		}
		
		/* たわむレンガの形状指定ルーチン */
		if(pid==='tawa'){
			this.makeForm_tawa_shape();
		}
		
		/* 新規作成 or Cancel */
		var popup = this;
		this.addExecButton("新規作成", "Create", function(){ popup.execute();});
		this.addCancelButton();
	},
	makeForm_tawa_shape : function(form){
		var table = new ui.TableElement();
		table.init({id:'tawa_shape', border:'0', cellPadding:'0', cellSpacing:'2'},{marginTop:'4pt', marginBottom:'4pt'});
		table.initRow({},{paddingBottom:'2px'});
		
		var clickshape = function(e){
			var _div = e.target.parentNode;
			var idx = _div.id.charAt(2);
			for(var i=0;i<=3;i++){ getEL("nb"+i).style.backgroundColor = '';}
			_div.style.backgroundColor = 'red';
		};
		
		var idx = [0,2,3,1][ui.puzzle.board.shape];
		for(var i=0;i<=3;i++){
			var _img = createEL('img');
			_img.src = (!pzpr.env.API.dataURL ? "./img/tawa_nb.gif" : "data:image/gif;base64,R0lGODdhgAAgAKEBAAAAAP//AP//////ACwAAAAAgAAgAAAC/pSPqcvtD6OctNqLs968+98A4kiWJvmcquisrtm+MpAAwY0Hdn7vPN1aAGstXs+oQw6FyqZxKfDlpDhqLyXMhpw/ZfHJndbCVW9QATWkEdYk+Pntvn/j+dQc0hK39jKcLxcoxkZ29JeHpsfUZ0gHeMeoUyfo54i4h7lI2TjI0PaJp1boZumpeLCGOvoZB7kpyTbzIiTrglY7o4Yrc8l2irYamjiciar2G4VM7Lus6fpcdVZ8PLxmrTyd3AwcydprvK19HZ6aPf5YCX31TW3ezuwOcQ7vGXyIPA+e/w6ORZ5ir9S/gfu0ZRt4UFU3YfHiFSyoaxeMWxJLUKx4IiLGZIn96HX8iNBjQ5EG8Zkk+dDfyJAgS7Lkxy9lOJTYXMK0ibOlTJ0n2eEs97OnUJ40X668SfRo0ZU7SS51erOp0XxSkSaFGtTo1a0bUcSo9bVr2I0gypo9izat2rVs27p9Czfu2QIAOw==");
			_img.style.width  = "128px";
			_img.style.height = "32px";
			_img.style.top  = "0px";
			_img.style.left = "-"+(i*32)+"px";
			_img.style.clip = "rect(0px,"+((i+1)*32)+"px,"+32+"px,"+(i*32)+"px)";
			ui.event.addEvent(_img, 'click', this, clickshape);
			
			var _div = createEL('div');
			_div.id = "nb"+i;
			_div.style.backgroundColor = (i==idx?'red':'');
			_div.appendChild(_img);
			
			table.addCell(_div);
		}
		
		this.addElement(table.getElement());
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
			if     (NB.size[2].checked){ col=row=16;}
			else if(NB.size[3].checked){ col=row=25;}
			else if(NB.size[0].checked){ col=row= 4;}
			else                       { col=row= 9;}
		}
		if(!!col && !!row){ url = [col, row];}
		
		if(url.length>0 && pid==='tawa'){
			var selected=null;
			for(var i=0;i<=3;i++){
				if(getEL("nb"+i).style.backgroundColor==='red'){ selected=[0,3,1,2][i]; break;}
			}
			if(!isNaN(selected) && !(col==1 && (selected==0||selected==3))){
				if(selected===3){ col--; url=[col,row];}
				url.push(selected);
			}
			else{ url=[];}
		}
		
		this.hide();
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
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("URL入力", "Import from URL");
		
		this.addText("URLから問題を読み込みます。", "Import a question from URL.");
		this.addBR();
		
		this.addTextArea({name:"ta", cols:'48', rows:'8', wrap:'hard'});
		this.addBR();
		
		var popup = this;
		this.addExecButton("読み込む", "Import", function(){ popup.urlinput();});
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// urlinput() URLを入力する
	//------------------------------------------------------------------------------
	urlinput : function(){
		this.hide();
		
		ui.puzzle.open(this.form.ta.value.replace(/\n/g,""));
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLOutputクラス URL出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('urloutput',
{
	formname : 'urloutput',
	
	//------------------------------------------------------------------------------
	// makeForm() URL出力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		var popup = this;
		var outputurl = function(e){ popup.urloutput(e||window.event);};
		var openurl   = function(e){ popup.openurl();};
		
		this.settitle("URL出力", "Export URL");
		
		var pid = ui.puzzle.pid, exists = pzpr.variety.info[pid].exists;
			{ this.addExecButton("ぱずぷれv3のURLを出力する", "Output PUZ-PRE v3 URL", outputurl, {name:'pzprv3'}); this.addBR();}
		if(exists.pzprapp)
			{ this.addExecButton("ぱずぷれ(アプレット)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", outputurl, {name:'pzprapplet'}); this.addBR();}
		if(exists.kanpen)
			{ this.addExecButton("カンペンのURLを出力する", "Output Kanpen URL", outputurl, {name:'kanpen'}); this.addBR();}
		if(pid==="heyawake")
			{ this.addExecButton("へやわけアプレットのURLを出力する", "Output Heyawake-Applet URL", outputurl, {name:'heyaapp'}); this.addBR();}
			{ this.addExecButton("ぱずぷれv3の再編集用URLを出力する", "Output PUZ-PRE v3 Re-Edit URL", outputurl, {name:'pzprv3edit'}); this.addBR();}
		this.addBR();
		
		this.addTextArea({name:"ta", cols:'48', rows:'8', wrap:'hard', value:'', readonly:'readonly'});
		this.addBR();
		
		this.addExecButton("このURLを開く", "Open this URL on another window/tab", openurl);
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// urloutput() URLを出力する
	// openurl()   「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urloutput : function(e){
		var enc = ui.puzzle.enc, url = '', parser = pzpr.parser;
		switch(e.target.name){
			case "pzprv3":     url = ui.puzzle.getURL(parser.URL_PZPRV3);  break;
			case "pzprapplet": url = ui.puzzle.getURL(parser.URL_PZPRAPP); break;
			case "kanpen":     url = ui.puzzle.getURL(parser.URL_KANPEN);  break;
			case "pzprv3edit": url = ui.puzzle.getURL(parser.URL_PZPRV3E); break;
			case "heyaapp":    url = ui.puzzle.getURL(parser.URL_HEYAAPP); break;
		}
		this.form.ta.value = url;
	},
	openurl : function(e){
		if(this.form.ta.value!==''){
			var win = window.open(this.form.ta.value, '', '');
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileOpenクラス ファイル入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('fileopen',
{
	formname : 'fileform',
	
	//------------------------------------------------------------------------------
	// makeForm() ファイル入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("ファイルを開く", "Open file");
		
		this.form.action = 'fileio.cgi';
		this.form.method = 'post';
		this.form.target = "fileiopanel";
		this.form.enctype = 'multipart/form-data';
		this.form.onsubmit = function(e){ pzpr.util.preventDefault(e||window.event); return false;};
		
		this.addText("ファイル選択", "Choose file");
		this.addBR();
		
		this.addInput('file', {name:"filebox", id:"filebox"});
		this.addInput('hidden', {name:"pencilbox", value:"0"});
		this.addInput('hidden', {name:"operation", value:"open"});
		this.addBR();
		
		var popup = this;
		this.form.filebox.onchange = function(e){ popup.fileopen(e||window.event);};
		
		this.addCancelButton();
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
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileSaveクラス ファイル出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('filesave',
{
	formname : 'filesave',
	
	//------------------------------------------------------------------------------
	// makeForm() ファイル出力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	anchor : null,
	makeForm : function(){
		this.settitle("ファイルを保存する", "Open file");
		
		this.form.action = ui.fileio;
		this.form.method = 'post';
		this.form.target = "fileiopanel";
		this.form.onsubmit = function(e){ pzpr.util.preventDefault(e||window.event); return false;};
		
		var platform = "";
		if     (navigator.platform.indexOf("Win")!==-1){ platform = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ platform = "Mac";}
		else                                           { platform = "Others";}
		
		this.addInput('hidden', {name:"operation", value:"save"});
		this.addInput('hidden', {name:"ques", value:""});
		this.addInput('hidden', {name:"urlstr", value:""});
		this.addInput('hidden', {name:"platform", value:platform});
		
		/* ファイル形式選択オプション */
		var typeitem = [];
		typeitem.push({name:'filesave',  str_jp:"ぱずぷれv3形式",        str_en:"Puz-Pre v3 format"});
/*		typeitem.push({name:'filesave3', str_jp:"ぱずぷれv3(履歴つき)",  str_en:"Puz-Pre v3 with history"}); */
		if(pzpr.variety.info[ui.puzzle.pid].exists.pencilbox){
			typeitem.push({name:'filesave2', str_jp:"pencilbox形式", str_en:"Pencilbox format"});
		}
		this.addSelect({name:'filetype'}, typeitem);
		this.addBR();
		
		this.addInput('text', {name:"filename",value:ui.puzzle.pid+".txt"});
		this.addBR();
		
		if(!ui.enableSaveBlob && pzpr.env.API.anchor_download){
			this.anchor = createEL('a');
			this.anchor.appendChild(this.createTextNode("",""));
			this.anchor.style.display = 'none';
			this.addElement(this.anchor);
		}
		this.addBR();
		
		var popup = this;
		this.addExecButton("保存", "Save", function(){ popup.filesave();});
		
		this.addCancelButton();
	},
	/* オーバーライド */
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		
		ui.puzzle.key.enableKey = false;
	},
	hide : function(){
		if(!!this.filesaveurl){ URL.revokeObjectURL(this.filesaveurl);}
		if(!!this.anchor){ this.anchor.style.display = 'none';}
		
		ui.popupmgr.popups.template.hide.call(this);
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
			if(filename.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;}
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
			this.hide();
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
			this.hide();
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_ImageSaveクラス 画像出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('imagesave',
{
	formname : 'imagesave',
	
	//------------------------------------------------------------------------------
	// makeForm() 画像出力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	anchor : null,
	showsize : null,
	makeForm : function(){
		var popup = this;
		
		this.settitle("画像を保存する", "Open file");
		
		this.form.action = ui.fileio;
		this.form.method = 'post';
		this.form.target = "fileiopanel";
		this.form.onsubmit = function(e){ pzpr.util.preventDefault(e||window.event); return false;};
		
		this.addInput('hidden', {name:"operation", value:"imagesave"});
		this.addInput('hidden', {name:"urlstr", value:""});
		
		/* ファイル形式選択オプション */
		this.addText("ファイル形式 ", "File format ");
		var typeitem = [];
		if(ui.enableSaveImage){
			typeitem.push({name:'png', str_jp:"PNG形式 (png)", str_en:"PNG Format (png)"});
		}
		if(ui.enableSaveSVG){
			typeitem.push({name:'svg', str_jp:"ベクター画像(SVG)", str_en:"Vector Image (SVG)"});
		}
		this.addSelect({name:'filetype'}, typeitem);
		this.addBR();
		this.form.filetype.onchange = function(){ popup.changefilename();};
		
		this.addText("ファイル名 ", "Filename ");
		this.addInput('text', {name:"filename",value:ui.puzzle.pid+".png"});
		this.addBR();
		
		this.addText("画像のサイズ ", "Image Size ");
		this.addInput('number', {name:"cs", value:""+ui.menuconfig.get('cellsizeval'), size:'4', maxlength:'3', min:'8', max:'999'});
		this.addText(' ', ' ');
		this.showsize = createEL('span');
		this.showsize.appendChild(createEL('span'));
		this.addElement(this.showsize);
		this.addBR();
		this.form.cs.onchange = function(){ popup.estimatesize();};
		
		if(!ui.enableSaveBlob && pzpr.env.API.anchor_download){
			this.anchor = createEL('a');
			this.anchor.appendChild(this.createTextNode("",""));
			this.anchor.style.display = 'none';
			this.addElement(this.anchor);
		}
		this.addBR();
		
		this.addExecButton("ダウンロード", "Download", function(){ popup.saveimage();});
		this.addExecButton("別ウィンドウで開く", "Open another window", function(){ popup.openimage();});
		
		this.addCancelButton();
		
		popup.changefilename();
		popup.estimatesize();
	},
	
	/* オーバーライド */
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		
		ui.puzzle.key.enableKey = false;
		ui.puzzle.mouse.enableMouse = false;
	},
	hide : function(){
		if(!!this.saveimageurl){ URL.revokeObjectURL(this.saveimageurl);}
		
		ui.puzzle.setCanvasSize();
		ui.popupmgr.popups.template.hide.call(this);
	},
	
	changefilename : function(){
		var filename = this.form.filename.value.replace('.png','.').replace('.svg','.');
		this.form.filename.value = filename + (this.form.filetype.value!=='svg'?'png':'svg');
	},
	estimatesize : function(){
		var cellsize = +this.form.cs.value;
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
			if(filename.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;}
		}

		/* 画像出力ルーチン */
		var cellsize = +form.cs.value;
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
			ui.alertStr('画像の出力に失敗しました','Fail to Output the Image');
		}

		/* 出力された画像の保存ルーチン */
		if(ui.enableSaveBlob){
			navigator.saveBlob(blob, filename);
			this.hide();
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
			this.hide();
		}
	},
	
 	//------------------------------------------------------------------------------
	// openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	openimage : function(){
		/* 画像出力ルーチン */
		var cellsize = +this.form.cs.value;
		var type = (this.form.filetype.value!=='svg'?'png':'svg');
		
		var dataurl = "";
		try{
			dataurl = ui.puzzle.toDataURL(type,cellsize);
		}
		catch(e){
			ui.alertStr('画像の出力に失敗しました','Fail to Output the Image');
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
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("盤面の調整", "Board Dimension Resizer");
		
		this.addText("盤面の調整を行います。", "Adjust the board.");
		this.addBR();
		
		var popup = this, adjust = function(e){ popup.adjust(e||window.event);};
		
		this.addText("拡大", "Expand");
		this.addExecButton("上", "Top", adjust, {name:'expandup'});
		this.addExecButton("下", "Bottom", adjust, {name:'expanddn'});
		this.addText(" ", " ");
		this.addExecButton("左", "Left", adjust, {name:'expandlt'});
		this.addExecButton("右", "right", adjust, {name:'expandrt'});
		this.addBR();
		
		this.addText("縮小", "Reduce");
		this.addExecButton("上", "Top", adjust, {name:'reduceup'});
		this.addExecButton("下", "Bottom", adjust, {name:'reducedn'});
		this.addText(" ", " ");
		this.addExecButton("左", "Left", adjust, {name:'reducelt'});
		this.addExecButton("右", "right", adjust, {name:'reducert'});
		this.addBR();
		
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// adjust() 盤面の調整を行う
	//------------------------------------------------------------------------------
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
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("反転・回転", "Flip/Turn the board");
		
		this.addText("盤面の回転・反転を行います。","Flip/Turn the board.");
		this.addBR();
		
		var popup = this, adjust = function(e){ popup.adjust(e||window.event);};
		
		this.addExecButton("左90°回転", "Turn left by 90 degree", adjust, {name:'turnl'});
		this.addExecButton("右90°回転", "Turn right by 90 degree", adjust, {name:'turnr'});
		this.addBR();
		this.addExecButton("上下反転", "Flip upside down", adjust, {name:'flipy'});
		this.addExecButton("左右反転", "Flip leftside right", adjust, {name:'flipx'});
		this.addBR();
		this.addBR();
		
		if(ui.puzzle.pid==='tawa'){
			this.form.turnl.disabled = true;
			this.form.turnr.disabled = true;
		}
		
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// adjust() 盤面の調整を行う
	//------------------------------------------------------------------------------
	adjust : function(e){
		ui.puzzle.board.exec.execadjust(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_DispSizeクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('dispsize',
{
	formname : 'dispsize',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("表示サイズの変更", "Change size");
		
		this.addText("表示サイズを変更します。", "Change the display size.");
		this.addBR();
		
		this.addText("表示サイズ", "Display size");
		this.addInput('number', {name:'cs', value:'', size:'4', maxlength:'3', min:'8', max:'999'});
		this.addBR();
		
		var popup = this;
		this.addExecButton("変更する", "Change", function(){ popup.changesize();});
		this.addCancelButton();
	},
	
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		
		this.form.cs.value = ui.menuconfig.get('cellsizeval');
		ui.puzzle.key.enableKey = false;
	},
	
	//------------------------------------------------------------------------------
	// changesize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	changesize : function(e){
		var csize = parseInt(this.form.cs.value);
		if(csize>0){
			ui.menuconfig.set('cellsizeval', (csize|0));
			ui.event.adjustcellsize();
		}
		this.hide();
	}
});

//---------------------------------------------------------------------------
// ★Popup_Creditクラス Creditやバージョン情報を表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('credit',
{
	formname : 'credit',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("credit", "credit");
		
		this.addText("ぱずぷれv3 v"+pzpr.version, "PUZ-PRE v3 v"+pzpr.version);
		this.addBR();
		this.addBR();
		
		this.addText("ぱずぷれv3は はっぱ/連続発破が作成しています。", "PUZ-PRE v3 id made by happa.");
		this.addBR();
		
		var popup = this;
		this.addExecButton("閉じる", "Close", function(){ popup.hide();});
	}
});

//---------------------------------------------------------------------------
// ★TableElementクラス テーブル作成用のクラスです
//---------------------------------------------------------------------------
ui.TableElement = function(){};
ui.TableElement.prototype =
{
	table : null,
	tbody : null,
	trow  : null,

	init : function(attr, style){
		this.table = createEL('table');
		if(!!attr) { for(var att in attr){ this.table[att]=attr[att];}}
		if(!!style){ for(var name in style){ this.table.style[name]=style[name];}}
		
		this.tbody = createEL('tbody');
		this.table.appendChild(this.tbody);
	},
	
	initRow : function(attr, style){
		this.trow = createEL('tr');
		if(!!attr) { for(var att in attr){ this.trow[att]=attr[att];}}
		if(!!style){ for(var name in style){ this.trow.style[name]=style[name];}}
		
		this.tbody.appendChild(this.trow);
	},
	
	addCell : function(el){
		var tcell = createEL('td');
		tcell.appendChild(el);
		this.trow.appendChild(tcell);
	},
	
	getElement : function(){
		return this.table;
	}
};
