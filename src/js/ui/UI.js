// UI.js v3.4.0
/* global ui:false, File:false */
/* exported ui, _doc, getEL, createEL, createButton */

/* ui.js Locals */
var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createEL(tagName){ return _doc.createElement(tagName);}
function createButton(){
	var button = createEL('input');
	button.type = 'button';
	return button;
}

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
	undotimer : null,
	
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

	//----------------------------------------------------------------------
	// ui.windowWidth()   ウィンドウの幅を返す
	//----------------------------------------------------------------------
	windowWidth : function(){
		return ((window.innerHeight!==void 0) ? window.innerWidth : _doc.body.clientWidth);
	},

	//--------------------------------------------------------------------------------
	// ui.selectStr()  現在の言語に応じた文字列を返す
	// ui.alertStr()   現在の言語に応じたダイアログを表示する
	// ui.confirmStr() 現在の言語に応じた選択ダイアログを表示し、結果を返す
	//--------------------------------------------------------------------------------
	selectStr : function(strJP, strEN){
		return (ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	alertStr : function(strJP, strEN){
		window.alert(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	confirmStr : function(strJP, strEN){
		return window.confirm(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	promptStr : function(strJP, strEN, initialStr){
		return window.prompt(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN, initialStr);
	},

	//---------------------------------------------------------------------------
	// ui.setConfig()   値設定の共通処理
	// ui.getConfig()   値設定の共通処理
	// ui.getConfigType() 設定値の型を返す共通処理
	//---------------------------------------------------------------------------
	setConfig : function(idname, newval){
		if(!!ui.puzzle.config.list[idname]){
			ui.puzzle.setConfig(idname, newval);
		}
		else if(!!ui.menuconfig.list[idname]){
			ui.menuconfig.set(idname, newval);
		}
		else if(idname==='uramashu'){
			ui.puzzle.board.uramashu = newval;
			ui.listener.onConfigSet(ui.puzzle, idname, newval);
		}
		else if(idname==='mode'){
			ui.puzzle.modechange(newval);
		}
	},
	getConfig : function(idname){
		if(!!ui.puzzle.config.list[idname]){
			return ui.puzzle.getConfig(idname);
		}
		else if(!!ui.menuconfig.list[idname]){
			return ui.menuconfig.get(idname);
		}
		else if(idname==='uramashu'){
			return ui.puzzle.board.uramashu;
		}
		else if(idname==='mode'){
			return ui.puzzle.playmode ? 3 : 1;
		}
	},
	getConfigType : function(idname){
		if(!!ui.puzzle.config.list[idname]){
			return ui.puzzle.config.gettype(idname);
		}
		else if(!!ui.menuconfig.list[idname]){
			return ui.menuconfig.gettype(idname);
		}
		else if(idname==='uramashu'){
			return "boolean";
		}
		else if(idname==='mode'){
			return "number";
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
		if(typeof FileReader != 'undefined'){
			this.reader = new FileReader();
			this.reader.onload = function(e){ ui.puzzle.open(e.target.result);};
			this.enableReadText = true;
		}
		else{
			this.reader = null;
			this.enableGetText = (typeof FileList != 'undefined' && typeof File.prototype.getAsText != 'undefined');
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
