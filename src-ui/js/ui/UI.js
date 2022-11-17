// UI.js v3.4.0
/* eslint-env browser */
/* exported ui, _doc, getEL, createEL */

/* ui.js Locals */
var _doc = document;
function getEL(id) {
	return _doc.getElementById(id);
}
function createEL(tagName) {
	return _doc.createElement(tagName);
}

//---------------------------------------------------------------------------
// ★uiオブジェクト UserInterface側のオブジェクト
//---------------------------------------------------------------------------
/* extern */
window.ui = {
	version: "<%= git.hash %>",

	/* このサイトで使用するパズルのオブジェクト */
	puzzle: null,

	/* どの種類のパズルのメニューを表示しているか */
	currentpid: "",

	/* メンバオブジェクト */
	event: null,
	menuconfig: null,
	urlconfig: null,
	menuarea: null,
	toolarea: null,
	popupmgr: null,
	keypopup: null,
	timer: null,
	network: null,

	enableGetText: false, // FileReader APIの旧仕様でファイルが読めるか
	enableReadText: false, // HTML5 FileReader APIでファイルが読めるか
	reader: null, // FileReaderオブジェクト

	enableSaveImage: false, // 画像保存が可能か
	enableImageType: {}, // 保存可能な画像形式

	enableSaveBlob: false, // saveBlobが使用できるか

	callbackComplete: null,

	//---------------------------------------------------------------------------
	// ui.displayAll()     全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// ui.setdisplay()     個別のメニュー、ボタン、ラベルに対して文字列を設定する
	//---------------------------------------------------------------------------
	displayAll: function() {
		ui.menuarea.display();
		ui.toolarea.display();
		ui.popupmgr.translate();
		ui.misc.displayDesign();
	},
	setdisplay: function(idname) {
		ui.menuarea.setdisplay(idname);
		ui.toolarea.setdisplay(idname);
	},

	//---------------------------------------------------------------------------
	// ui.customAttr()   エレメントのカスタムattributeの値を返す
	//---------------------------------------------------------------------------
	customAttr: function(el, name) {
		var value = "";
		if (el.dataset !== void 0) {
			value = el.dataset[name];
		} else {
			/* IE10, Firefox5, Chrome7, Safari5.1以下のフォールバック */
			var lowername = "data-";
			for (var i = 0; i < name.length; i++) {
				var ch = name[i] || name.charAt(i);
				lowername += ch >= "A" && ch <= "Z" ? "-" + ch.toLowerCase() : ch;
			}
			value = el[lowername] || el.getAttribute(lowername) || "";
		}
		return value;
	},

	//----------------------------------------------------------------------
	// ui.windowWidth()   ウィンドウの幅を返す
	//----------------------------------------------------------------------
	windowWidth: function() {
		return window.innerHeight !== void 0
			? window.innerWidth
			: _doc.body.clientWidth;
	},

	//---------------------------------------------------------------------------
	// ui.adjustcellsize()  resizeイベント時に、pc.cw, pc.chのサイズを(自動)調節する
	// ui.getBoardPadding() Canvasと境界線の周りの間にあるpaddingのサイズを求めます
	//---------------------------------------------------------------------------
	adjustcellsize: function() {
		var puzzle = ui.puzzle,
			pc = puzzle.painter;
		var cols = pc.getCanvasCols() + ui.getBoardPadding() * 2;
		var wwidth = ui.windowWidth() - (ui.urlconfig.embed ? 0 : 6);
		var mwidth; //  margin/borderがあるので、適当に引いておく
		var uiconf = ui.menuconfig;

		var cellsize,
			cellsizeval = uiconf.get("cellsizeval") * pc.cellexpandratio;
		var cr = { base: 1.0, limit: 0.4 },
			ws = { base: 0.8, limit: 0.96 },
			ci = [];
		ci[0] = (wwidth * ws.base) / (cellsizeval * cr.base);
		ci[1] = (wwidth * ws.limit) / (cellsizeval * cr.base);
		ci[2] = (wwidth * ws.limit) / (cellsizeval * cr.limit);

		// 横幅いっぱいに広げたい場合
		if (uiconf.get("fullwidth")) {
			mwidth = wwidth * 0.98;
			cellsize = (mwidth * 0.92) / cols;
		}
		// 縮小が必要ない場合
		else if (!uiconf.get("adjsize") || cols < ci[0]) {
			mwidth = wwidth * ws.base - 4;
			cellsize = cellsizeval * cr.base;
		}
		// ひとまずセルのサイズを変えずにmainの幅を調節する場合
		else if (cols < ci[1]) {
			cellsize = cellsizeval * cr.base;
			mwidth = cellsize * cols;
		}
		// base～limit間でサイズを自動調節する場合
		else if (cols < ci[2]) {
			mwidth = wwidth * ws.limit - 4;
			cellsize = mwidth / cols; // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else {
			cellsize = cellsizeval * cr.limit;
			mwidth = cellsize * cols;
		}

		// mainのサイズ変更
		if (!pc.outputImage) {
			getEL("main").style.width = "" + (mwidth | 0) + "px";
			if (ui.urlconfig.embed) {
				getEL("main").style.border = "none";
			}
		}

		puzzle.setCanvasSizeByCellSize(cellsize, true);
	},
	getBoardPadding: function() {
		var puzzle = ui.puzzle,
			padding = 0;
		switch (puzzle.pid) {
			case "firefly":
			case "hashikake":
			case "wblink":
			case "ichimaga":
			case "ichimagam":
			case "ichimagax":
				padding = 0.3;
				break;

			case "kouchoku":
			case "gokigen":
			case "wagiri":
			case "creek":
				padding = 0.2;
				break;

			case "slither":
			case "cave":
			case "mejilink":
				padding = 0.15;
				break;

			case "kinkonkan":
			case "skyscrapers":
			case "easyasabc":
			case "box":
				padding = 0.05;
				break;

			case "bosanowa":
				padding = ui.menuconfig.get("disptype_bosanowa") !== 2 ? 0.5 : 0.05;
				break;

			default:
				padding = 0.5;
				break;
		}
		if (ui.menuconfig.get("fullwidth")) {
			padding = 0;
		}
		return padding;
	},

	//--------------------------------------------------------------------------------
	// ui.selectStr()  現在の言語に応じた文字列を返す
	//--------------------------------------------------------------------------------
	selectStr: function(strJP, strEN) {
		if (!strEN) {
			return strJP;
		}
		if (!strJP) {
			return strEN;
		}
		return pzpr.lang === "ja" ? strJP : strEN;
	},

	i18n: function(strKey) {
		return this.selectStr(this.langs.ja[strKey], this.langs.en[strKey]);
	},

	//---------------------------------------------------------------------------
	// ui.getCurrentConfigList() 現在のパズルで有効な設定と設定値を返す
	//---------------------------------------------------------------------------
	getCurrentConfigList: function() {
		return ui.menuconfig.getList();
	},

	//----------------------------------------------------------------------
	// ui.initFileReadMethod() ファイルアクセス関連の処理の初期化を行う
	//----------------------------------------------------------------------
	initFileReadMethod: function() {
		// File Reader (あれば)の初期化処理
		if (typeof FileReader !== "undefined") {
			this.reader = new FileReader();
			this.reader.onload = function(e) {
				ui.puzzle.open(e.target.result);
			};
			this.enableReadText = true;
		} else {
			this.reader = null;
			this.enableGetText =
				typeof FileList !== "undefined" &&
				typeof File.prototype.getAsText !== "undefined";
		}
	},

	//----------------------------------------------------------------------
	// ui.initImageSaveMethod() 画像保存関連の処理の初期化を行う
	//----------------------------------------------------------------------
	initImageSaveMethod: function(puzzle) {
		if (
			!!pzpr.Candle.enable.canvas &&
			!!_doc.createElement("canvas").toDataURL
		) {
			this.enableImageType.png = true;

			var canvas = _doc.createElement("canvas");
			canvas.width = canvas.height = 1;
			if (canvas.toDataURL("image/gif").match("image/gif")) {
				this.enableImageType.gif = true;
			}
			if (canvas.toDataURL("image/jpeg").match("image/jpeg")) {
				this.enableImageType.jpeg = true;
			}
			if (canvas.toDataURL("image/webp").match("image/webp")) {
				this.enableImageType.webp = true;
			}
		}
		if (!!pzpr.Candle.enable.svg && !!window.btoa) {
			this.enableImageType.svg = true;
		}
		if (!!this.enableImageType.png || !!this.enableImageType.svg) {
			this.enableSaveImage = true;
		}

		this.enableSaveBlob = !!window.navigator.saveBlob;
	}
};
