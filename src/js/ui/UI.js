// UI.js v3.4.0
/* global ui:false, File:false */
/* exported ui, _doc, getEL, createEL */

/* ui.js Locals */
var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createEL(tagName){ return _doc.createElement(tagName);}

//---------------------------------------------------------------------------
// ★uiオブジェクト UserInterface側のオブジェクト
//---------------------------------------------------------------------------
/* extern */
window.ui = {
	/* このサイトで使用するパズルのオブジェクト */
	puzzle    : null,
	
	/* どの種類のパズルのメニューを表示しているか */
	currentpid : '',
	
	/* メンバオブジェクト */
	event     : null,
	menuconfig: null,
	menuarea  : null,
	toolarea  : null,
	popupmgr  : null,
	keypopup  : null,
	timer     : null,
	
	debugmode : false,
	
	enableGetText   : false,	// FileReader APIの旧仕様でファイルが読めるか
	enableReadText  : false,	// HTML5 FileReader APIでファイルが読めるか
	reader : null,				// FileReaderオブジェクト
	
	enableSaveImage : false,	// 画像保存(png形式)が可能か
	enableSaveSVG   : false,	// 画像保存(SVG形式)が可能か
	
	enableSaveBlob  : false,	// saveBlobが使用できるか
	fileio : 'fileio.cgi',		// fileio.cgiのファイル名

	//---------------------------------------------------------------------------
	// ui.displayAll()     全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// ui.setdisplay()     個別のメニュー、ボタン、ラベルに対して文字列を設定する
	//---------------------------------------------------------------------------
	displayAll : function(){
		ui.menuarea.display();
		ui.toolarea.display();
		ui.popupmgr.translate();
		ui.misc.displayDesign();
	},
	setdisplay : function(idname){
		ui.menuarea.setdisplay(idname);
		ui.toolarea.setdisplay(idname);
	},

	//---------------------------------------------------------------------------
	// ui.customAttr()   エレメントのカスタムattributeの値を返す
	//---------------------------------------------------------------------------
	customAttr : function(el, name){
		var value = "";
		if(el.dataset!==void 0){ value = el.dataset[name];}
		/* IE10, Firefox5, Chrome7, Safari5.1以下のフォールバック */
		else{
			var lowername = "data-";
			for(var i=0;i<name.length;i++){
				var ch = name[i] || name.charAt(i);
				lowername += ((ch>="A" && ch<="Z") ? ("-" + ch.toLowerCase()) : ch);
			}
			value = el[lowername] || el.getAttribute(lowername) || "";
		}
		return value;
	},

	//----------------------------------------------------------------------
	// ui.windowWidth()   ウィンドウの幅を返す
	//----------------------------------------------------------------------
	windowWidth : function(){
		return ((window.innerHeight!==void 0) ? window.innerWidth : _doc.body.clientWidth);
	},

	//--------------------------------------------------------------------------------
	// ui.selectStr()  現在の言語に応じた文字列を返す
	//--------------------------------------------------------------------------------
	selectStr : function(strJP, strEN){
		if(!strEN){ return strJP;}
		return (ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},

	//---------------------------------------------------------------------------
	// ui.setConfig()   値設定の共通処理
	// ui.getConfig()   値設定の共通処理
	// ui.validConfig() 設定が有効なパズルかどうかを返す共通処理
	//---------------------------------------------------------------------------
	setConfig : function(idname, newval){
		if(!!ui.puzzle.config.list[idname]){
			ui.puzzle.setConfig(idname, newval);
		}
		else if(!!ui.menuconfig.list[idname]){
			ui.menuconfig.set(idname, newval);
		}
	},
	getConfig : function(idname){
		if(!!ui.puzzle.config.list[idname]){
			return ui.puzzle.getConfig(idname);
		}
		else if(!!ui.menuconfig.list[idname]){
			return ui.menuconfig.get(idname);
		}
	},
	validConfig : function(idname){
		if(!!ui.puzzle.config.list[idname]){
			return ui.puzzle.validConfig(idname);
		}
		else if(!!ui.menuconfig.list[idname]){
			return ui.menuconfig.valid(idname);
		}
	},

	//---------------------------------------------------------------------------
	// ui.restoreConfig()  保存された各種設定値を元に戻す
	// ui.saveConfig()     各種設定値を保存する
	//---------------------------------------------------------------------------
	restoreConfig : function(){
		/* 設定が保存されている場合は元に戻す */
		if(pzpr.env.storage.localST && !!window.JSON){
			var json_puzzle = localStorage['pzprv3_config:puzzle'];
			var json_menu   = localStorage['pzprv3_config:ui'];
			if(!!json_puzzle){ ui.puzzle.restoreConfig(json_puzzle);}
			if(!!json_menu)  { ui.menuconfig.setAll(json_menu);}
		}
	},
	saveConfig : function(){
		if(pzpr.env.storage.localST && !!window.JSON){
			localStorage['pzprv3_config:puzzle'] = ui.puzzle.saveConfig();
			localStorage['pzprv3_config:ui']     = ui.menuconfig.getAll();
		}
	},

	//----------------------------------------------------------------------
	// ui.initFileReadMethod() ファイルアクセス関連の処理の初期化を行う
	//----------------------------------------------------------------------
	initFileReadMethod : function(){
		// File Reader (あれば)の初期化処理
		if(typeof FileReader !== 'undefined'){
			this.reader = new FileReader();
			this.reader.onload = function(e){ ui.puzzle.open(e.target.result);};
			this.enableReadText = true;
		}
		else{
			this.reader = null;
			this.enableGetText = (typeof FileList !== 'undefined' && typeof File.prototype.getAsText !== 'undefined');
		}
	},

	//----------------------------------------------------------------------
	// ui.initImageSaveMethod() 画像保存関連の処理の初期化を行う
	//----------------------------------------------------------------------
	initImageSaveMethod : function(puzzle){
		if(!!puzzle.imgcanvas[0] && !!_doc.createElement('canvas').toDataURL){
			this.enableSaveImage = true;
		}
		if(!!puzzle.imgcanvas[1] && !!window.btoa){
			this.enableSaveSVG = true;
		}
		
		this.enableSaveBlob = (!!window.navigator.saveBlob);
		this.fileio = (_doc.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi");
	}
};
