// Menu.js v3.4.0
(function(){

var k = pzprv3.consts;
var _doc = document;
function getEL(id){ return _doc.getElementById(id);}

//---------------------------------------------------------------------------
// ★PopupManagerクラス ポップアップメニューを管理します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('PopupManager',
{
	initialize : function(){
		this.offset = new pzprv3.core.Point(0, 0);	// ポップアップウィンドウの左上からの位置

		this.reset();
	},
	
	puzzle    : null,
	popup     : null, /* 表示中のポップアップメニュー */
	popups    : {},   /* 管理しているポップアップメニュー */
	movingpop : null, /* 移動中のポップアップメニュー */
	
	//---------------------------------------------------------------------------
	// popupmgr.init()       ポップアップメニューの設定を初期化する
	// popupmgr.reset()      ポップアップメニューの設定をクリアする
	// popupmgr.setEvents()  ポップアップメニュー(タイトルバー)のイベントを設定する
	//---------------------------------------------------------------------------
	init : function(){
		var puzzle = this.puzzle = pzprv3.ui.targetpuzzle;
		this.popups = {
			newboard  : (new pzprv3.core.Popup_Newboard(puzzle)),	/* 盤面の新規作成 */
			urlinput  : (new pzprv3.core.Popup_URLInput(puzzle)),	/* URL入力 */
			urloutput : (new pzprv3.core.Popup_URLOutput(puzzle)),	/* URL出力 */
			fileopen  : (new pzprv3.core.Popup_FileOpen(puzzle)),	/* ファイル入力 */
			database  : (new pzprv3.core.Popup_DataBase(puzzle)),	/* データベースを開く */
			adjust    : (new pzprv3.core.Popup_Adjust(puzzle)),		/* 盤面の調整 */
			turnflip  : (new pzprv3.core.Popup_TurnFlip(puzzle)),	/* 反転・回転 */
			dispsize  : (new pzprv3.core.Popup_DispSize(puzzle)),	/* 表示サイズ */
			credit    : (new pzprv3.core.Popup_Credit(puzzle)),		/* credit */
			debug     : (new pzprv3.core.Popup_Debug(puzzle))		/* poptest */
		};
	},
	
	reset : function(){
		this.puzzle = pzprv3.ui.targetpuzzle;
		this.popup  = null;
		this.popups = {};
		getEL('popup_parent').innerHTML = '';
	},
	
	setEvents : function(){
		for(var name in this.popups){ this.popups[name].setEvent();}
		this.puzzle.addMouseMoveEvent(_doc, this, this.titlebarmove);
		this.puzzle.addMouseUpEvent  (_doc, this, this.titlebarup);
	},

	//---------------------------------------------------------------------------
	// popupmgr.open()  ポップアップメニューを開く
	//---------------------------------------------------------------------------
	open : function(e, idname){
		if(idname==='poptest'){
			this.popups.debug.show(e);
			return true;
		}

		var target = null;
		switch(idname){
			case 'newboard':  target = this.popups.newboard; break;
			case 'urlinput':  target = this.popups.urlinput; break;
			case 'urloutput': target = this.popups.urloutput; break;
			case 'fileopen':  target = this.popups.fileopen; break;
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
			this.popup = target;
			this.popup.show(e);
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
		var popel = (e.target||e.srcElement).parentNode;
		var puzzle = this.puzzle;
		this.movingpop = popel;
		this.offset.px = puzzle.mouse.pageX(e) - parseInt(popel.style.left);
		this.offset.py = puzzle.mouse.pageY(e) - parseInt(popel.style.top);
		puzzle.mouse.enableMouse = false;
	},
	titlebarup : function(e){
		var popel = this.movingpop;
		if(!!popel){
			this.movingpop = null;
			this.puzzle.mouse.enableMouse = true;
		}
	},
	titlebarmove : function(e){
		var popel = this.movingpop;
		if(!!popel){
			popel.style.left = this.puzzle.mouse.pageX(e) - this.offset.px + 'px';
			popel.style.top  = this.puzzle.mouse.pageY(e) - this.offset.py + 'px';
			pzprv3.preventDefault(e);
		}
	}
});

//---------------------------------------------------------------------------
// ★PopupMenuクラス ポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('PopupMenu',
{
	initialize : function(puzzle){
		this.puzzle    = puzzle;
		this.popparent = getEL("popup_parent");
		this.reset();
	},
	reset : function(){
		this.pop       = null;
		this.titlebar  = null;
		this.form      = null;
	},

	puzzle   : null,
	formname : '',

	makeElement : function(){
		this.pop = _doc.createElement('div');
		this.pop.className = 'popup';
		this.popparent.appendChild(this.pop);
		
		var bar = _doc.createElement('div');
		bar.className = 'titlebar';
		pzprv3.unselectable(bar);
		this.pop.appendChild(bar);
		this.titlebar = bar;
		
		this.form = _doc.createElement('form');
		this.form.name = this.formname;
		this.pop.appendChild(this.form);
	},
	makeForm : function(){
	},

	setEvent :function(){
		if(!!this.titlebar){
			var mgr = pzprv3.ui.popupmgr;
			this.puzzle.addMouseDownEvent(this.titlebar, mgr, mgr.titlebardown);
		}
	},

	show : function(e){
		if(!this.pop){
			this.makeElement();
			this.makeForm();
			this.setEvent();
		}
		this.pop.style.left = this.puzzle.mouse.pageX(e) - 8 + 'px';
		this.pop.style.top  = this.puzzle.mouse.pageY(e) - 8 + 'px';
		this.pop.style.display = 'inline';
	},
	hide : function(){
		this.pop.style.display = "none";
		
		this.puzzle.key.enableKey = true;
		this.puzzle.mouse.enableMouse = true;
		
		pzprv3.ui.movingpop = null;
		pzprv3.ui.popup = null;
	},

	settitle : function(str_jp, str_en){
		this.titlebar.appendChild(_doc.createTextNode(pzprv3.ui.selectStr(str_jp, str_en)));
	},

	addText : function(str_jp, str_en){
		var el = _doc.createElement('span');
		el.appendChild(_doc.createTextNode(pzprv3.ui.selectStr(str_jp, str_en)));
		this.form.appendChild(el);
	},
	addBR : function(){
		this.form.appendChild(_doc.createElement('br'));
	},
	addInput : function(type, attr){
		var el = _doc.createElement('input');
		el.type = type;
		for(var att in attr){ el[att]=attr[att];}
		this.form.appendChild(el);
	},
	addTextArea : function(attr){
		var el = _doc.createElement('textarea');
		for(var att in attr){ el[att]=attr[att];}
		this.form.appendChild(el);
	},
	addElement : function(el){
		this.form.appendChild(el);
	},

	addExecButton : function(str_jp, str_en, func, attr){
		el = _doc.createElement('input');
		el.type = 'button';
		el.value = pzprv3.ui.selectStr(str_jp, str_en);
		if(!!attr){ for(var att in attr){ el[att]=attr[att];}}
		el.onclick = func;
		this.form.appendChild(el);
	},
	addCancelButton : function(){
		var popup = this;
		this.addExecButton("キャンセル", "Cancel", function(){ popup.hide();})
	}
});

//---------------------------------------------------------------------------
// ★Popup_NewBoardクラス 新規盤面作成のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_Newboard:PopupMenu',
{
	formname : 'newboard',
	
	//---------------------------------------------------------------------------
	// makeForm()          新規盤面作成のポップアップメニューを作成する
	// makeForm_tawa_lap() たわむれんがの形状入力用部
	//---------------------------------------------------------------------------
	makeForm : function(){
		var puzzle = this.puzzle, bd = puzzle.board, pid = puzzle.pid;
		this.settitle("盤面の新規作成", "Createing New Board");
		
		this.addText("盤面を新規作成します。", "Create New Board.");
		this.addBR();
		
		/* タテヨコのサイズ指定部分 */
		var col = bd.qcols, row = bd.qrows;
		if(pid==='tawa' && bd.lap===3){ col++;}
		
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
			this.makeForm_tawa_lap();
		}
		
		/* 新規作成 or Cancel */
		var popup = this;
		this.addExecButton("新規作成", "Create", function(){ popup.execute();});
		this.addCancelButton();
	},
	makeForm_tawa_lap : function(form){
		var table = new pzprv3.core.TableElement();
		table.init({id:'NB_lap', border:'0', cellPadding:'0', cellSpacing:'2'},{marginTop:'4pt', marginBottom:'4pt'});
		table.initRow({},{paddingBottom:'2px'});
		
		/* cw=32, margin=2, width&height=cw+(margin*2)=36 */
		pzprv3.ui.modifyCSS({'#NB_lap div':{display:'block', position:'relative', width:'36px', height:'36px'}});
		pzprv3.ui.modifyCSS({'#NB_lap img':{position:'absolute', margin:'2px'}});
		
		var clicklap = function(e){
			e = (e||window.event);
			var _div = (e.target||e.srcElement).parentNode;
			var idx = _div.id.charAt(2);
			for(var i=0;i<=3;i++){ pzprv3.getEL("nb"+i).style.backgroundColor = '';}
			_div.style.backgroundColor = 'red';
		};
		
		var idx = [0,2,3,1][this.puzzle.board.lap];
		for(var i=0;i<=3;i++){
			var _img = _doc.createElement('img');
			_img.src = "src/img/tawa_nb.gif";
			_img.style.left = "-"+(i*32)+"px";
			_img.style.clip = "rect(0px,"+((i+1)*32)+"px,"+32+"px,"+(i*32)+"px)";
			_img.onclick = clicklap;
			
			var _div = _doc.createElement('div');
			_div.id = "nb"+i;
			_div.style.backgroundColor = (i==idx?'red':'');
			_div.appendChild(_img);
			
			table.addCell(_div);
		}
		
		this.addElement(table.getElement());
	},
	
	show : function(e){
		pzprv3.core.PopupMenu.prototype.show.call(this,e);
		this.puzzle.key.enableKey = false;
	},
	//---------------------------------------------------------------------------
	// execute() 新規盤面を作成するボタンを押したときの処理を行う
	//---------------------------------------------------------------------------
	execute : function(){
		var puzzle = this.puzzle, pid = puzzle.pid;
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
			var slap=null;
			for(var i=0;i<=3;i++){
				if(pzprv3.getEL("nb"+i).style.backgroundColor==='red'){ slap=[0,3,1,2][i]; break;}
			}
			if(!isNaN(slap) && !(col==1 && (slap==0||slap==3))){
				if(slap===3){ col--; url=[col,row];}
				url.push(slap);
			}
			else{ url=[];}
		}
		
		this.hide();
		if(url.length>0){
			puzzle.importBoardData({id:pid, qdata:url.join('/')});
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLInputクラス URL入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_URLInput:PopupMenu',
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
		
		var pzl = pzprv3.parseURLType(this.form.ta.value);
		if(!!pzl.id){ this.puzzle.importBoardData(pzl);}
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLOutputクラス URL出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_URLOutput:PopupMenu',
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
		
		var pid = this.puzzle.pid, exists = pzprv3.PZLINFO.info[pid].exists;
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
		var enc = this.puzzle.enc;
		switch((e.target||e.srcElement).name){
			case "pzprv3":     this.form.ta.value = enc.pzloutput(k.PZPRV3);  break;
			case "pzprapplet": this.form.ta.value = enc.pzloutput(k.PZPRAPP); break;
			case "kanpen":     this.form.ta.value = enc.pzloutput(k.KANPEN);  break;
			case "pzprv3edit": this.form.ta.value = enc.pzloutput(k.PZPRV3E); break;
			case "heyaapp":    this.form.ta.value = enc.pzloutput(k.HEYAAPP); break;
		}
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
pzprv3.createCoreClass('Popup_FileOpen:PopupMenu',
{
	formname : 'fileform',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("ファイルを開く", "Open file");
		
		this.form.action = 'fileio.cgi';
		this.form.method = 'post';
		this.form.target = "fileiopanel";
		this.form.enctype = 'multipart/form-data';
		this.form.onsubmit = function(e){ pzprv3.preventDefault(e||window.event); return false;};
		
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
		if(!!pzprv3.ui.reader || pzprv3.ui.enableGetText){
			var fitem = fileEL.files[0];
			if(!fitem){ return;}
			
			if(!!pzprv3.ui.reader){ pzprv3.ui.reader.readAsText(fitem);}
			else                  { pzprv3.ui.fileonload(fitem.getAsText(''));}
		}
		else{
			if(!fileEL.value){ return;}
			this.form.action = pzprv3.ui.fileio;
			this.form.submit();
		}
		this.form.reset();
	}
});

//---------------------------------------------------------------------------
// ★Popup_Adjustクラス 盤面の調整のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_Adjust:PopupMenu',
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
		this.puzzle.board.execadjust((e.target||e.srcElement).name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_TurnFlipクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_TurnFlip:PopupMenu',
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
		
		this.addCancelButton();
	},
	
	//------------------------------------------------------------------------------
	// adjust() 盤面の調整を行う
	//------------------------------------------------------------------------------
	adjust : function(e){
		this.puzzle.board.execadjust((e.target||e.srcElement).name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_DispSizeクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_DispSize:PopupMenu',
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
	
	show : function(e){
		pzprv3.core.PopupMenu.prototype.show.call(this,e);
		
		this.form.cs.value = this.puzzle.painter.cellsize;
		this.puzzle.key.enableKey = false;
	},
	
	//------------------------------------------------------------------------------
	// changesize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	changesize : function(e){
		var pc = this.puzzle.painter;
		var csize = parseInt(this.form.cs.value);
		if(csize>0){ pc.cellsize = (csize|0);}
		
		this.hide();
		pc.forceRedraw();	// Canvasを更新する
	}
});

//---------------------------------------------------------------------------
// ★Popup_Creditクラス Creditやバージョン情報を表示します
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_Credit:PopupMenu',
{
	formname : 'credit',
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("credit", "credit");
		
		this.addText("ぱずぷれv3 "+pzprv3.version, "PUZ-PRE v3 "+pzprv3.version);
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
pzprv3.createCoreClass('TableElement',
{
	table : null,
	tbody : null,
	trow  : null,

	init : function(attr, style){
		this.table = _doc.createElement('table');
		if(!!attr) { for(var att in attr){ this.table[att]=attr[att];}}
		if(!!style){ for(var name in style){ this.table.style[name]=style[name];}}
		
		this.tbody = _doc.createElement('tbody');
		this.table.appendChild(this.tbody);
	},
	
	initRow : function(attr, style){
		this.trow = _doc.createElement('tr');
		if(!!attr) { for(var att in attr){ this.trow[att]=attr[att];}}
		if(!!style){ for(var name in style){ this.trow.style[name]=style[name];}}
		
		this.tbody.appendChild(this.trow);
	},
	
	addCell : function(el){
		var tcell = _doc.createElement('td');
		tcell.appendChild(el);
		this.trow.appendChild(tcell);
	},
	
	getElement : function(){
		return this.table;
	}
});

})();
