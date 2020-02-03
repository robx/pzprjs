// Menu.js v3.4.0
/* global _doc:readonly, getEL:readonly */

//---------------------------------------------------------------------------
// ★PopupManagerクラス ポップアップメニューを管理します
//---------------------------------------------------------------------------
ui.popupmgr = {
	popup: null /* 表示中のポップアップメニュー */,

	popups: {} /* 管理しているポップアップメニューのオブジェクト一覧 */,

	movingpop: null /* 移動中のポップアップメニュー */,
	offset: {
		px: 0,
		py: 0
	} /* 移動中ポップアップメニューのページ左上からの位置 */,

	//---------------------------------------------------------------------------
	// popupmgr.reset()      ポップアップメニューの設定をクリアする
	// popupmgr.setEvents()  ポップアップメニュー(タイトルバー)のイベントを設定する
	//---------------------------------------------------------------------------
	reset: function() {
		/* イベントを割り当てる */
		this.setEvents();

		/* Captionを設定する */
		this.translate();
	},

	setEvents: function() {
		ui.event.addEvent(_doc, "mousemove", this, this.titlebarmove);
		ui.event.addEvent(_doc, "mouseup", this, this.titlebarup);
	},

	//---------------------------------------------------------------------------
	// popupmgr.translate()  言語切り替え時にキャプションを変更する
	//---------------------------------------------------------------------------
	translate: function() {
		for (var name in this.popups) {
			this.popups[name].translate();
		}
	},

	//---------------------------------------------------------------------------
	// popupmgr.addpopup()   ポップアップメニューを追加する
	//---------------------------------------------------------------------------
	addpopup: function(idname, proto) {
		var NewPopup = {},
			template = this.popups.template || {};
		for (var name in template) {
			NewPopup[name] = template[name];
		}
		for (name in proto) {
			NewPopup[name] = proto[name];
		}
		this.popups[idname] = NewPopup;
	},

	//---------------------------------------------------------------------------
	// popupmgr.open()  ポップアップメニューを開く
	//---------------------------------------------------------------------------
	open: function(idname, px, py) {
		var target = this.popups[idname] || null;
		if (target !== null) {
			/* 表示しているウィンドウがある場合は閉じる */
			if (!target.multipopup && !!this.popup) {
				this.popup.close();
			}

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
	titlebardown: function(e) {
		var popel = e.target.parentNode;
		var pos = pzpr.util.getPagePos(e);
		this.movingpop = popel;
		this.offset.px = pos.px - parseInt(popel.style.left, 10);
		this.offset.py = pos.py - parseInt(popel.style.top, 10);
		ui.event.enableMouse = false;
		e.preventDefault();
		e.stopPropagation();
	},
	titlebarup: function(e) {
		var popel = this.movingpop;
		if (!!popel) {
			this.movingpop = null;
			ui.event.enableMouse = true;
		}
	},
	titlebarmove: function(e) {
		var popel = this.movingpop;
		if (!!popel) {
			var pos = pzpr.util.getPagePos(e);
			popel.style.left = pos.px - this.offset.px + "px";
			popel.style.top = pos.py - this.offset.py + "px";
			e.preventDefault();
		}
	}
};

//---------------------------------------------------------------------------
// ★PopupMenuクラス ポップアップメニューを作成表示するベースのオブジェクトです
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("template", {
	formname: "",
	multipopup: false,
	pid: "",

	init: function() {
		// 初回1回のみ呼び出される
		this.form = document[this.formname];
		this.pop = this.form.parentNode;
		this.titlebar = this.pop.querySelector(".titlebar") || null;
		if (!!this.titlebar) {
			pzpr.util.unselectable(this.titlebar);
			pzpr.util.addEvent(
				this.titlebar,
				"mousedown",
				ui.popupmgr,
				ui.popupmgr.titlebardown
			);
		}
		pzpr.util.addEvent(this.form, "submit", this, function(e) {
			e.preventDefault();
		});

		this.walkCaption(this.pop);
		this.translate();

		this.walkEvent(this.pop);
	},
	reset: function() {
		// パズルの種類が変わったら呼び出される
	},

	translate: function() {
		if (!this.captions) {
			return;
		}
		for (var i = 0; i < this.captions.length; i++) {
			var obj = this.captions[i];
			var text = ui.selectStr(obj.str_jp, obj.str_en);
			if (!!obj.textnode) {
				obj.textnode.data = text;
			} else if (!!obj.button) {
				obj.button.value = text;
			}
		}
	},

	walkCaption: function(parent) {
		var popup = this;
		this.captions = [];
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 3 && el.data.match(/^__(.+)__(.+)__$/)) {
				popup.captions.push({
					textnode: el,
					str_jp: RegExp.$1,
					str_en: RegExp.$2
				});
			}
		});
	},
	walkEvent: function(parent) {
		var popup = this;
		function eventfactory(role) {
			return function(e) {
				popup[role](e);
				if (e.type !== "click") {
					e.preventDefault();
					e.stopPropagation();
				}
			};
		}
		ui.misc.walker(parent, function(el) {
			if (el.nodeType !== 1) {
				return;
			}
			var role = ui.customAttr(el, "buttonExec");
			if (!!role) {
				pzpr.util.addEvent(
					el,
					!pzpr.env.API.touchevent ? "click" : "mousedown",
					popup,
					eventfactory(role)
				);
			}
			role = ui.customAttr(el, "changeExec");
			if (!!role) {
				pzpr.util.addEvent(el, "change", popup, eventfactory(role));
			}
		});
	},

	show: function(px, py) {
		// 表示するたびに呼び出される
		if (!this.pop) {
			this.init();
		}
		if (this.pid !== ui.puzzle.pid) {
			this.pid = ui.puzzle.pid;
			this.reset();
		}

		this.pop.style.left = px + "px";
		this.pop.style.top = py + "px";
		this.pop.style.display = "inline";
		if (!this.multipopup) {
			ui.popupmgr.popup = this;
		}
	},
	close: function() {
		this.pop.style.display = "none";
		if (!this.multipopup) {
			ui.popupmgr.popup = null;
		}

		ui.puzzle.key.enableKey = true;
		ui.puzzle.mouse.enableMouse = true;
	}
});

//---------------------------------------------------------------------------
// ★Popup_NewBoardクラス 新規盤面作成のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("newboard", {
	formname: "newboard",

	reset: function() {
		ui.misc.displayByPid(this.pop);
		if (this.pid !== "tawa") {
			return;
		}
		for (var i = 0; i <= 3; i++) {
			var _div = getEL("nb_shape_" + i),
				_img = _div.children[0];
			_img.src =
				"data:image/gif;base64,R0lGODdhgAAgAKEBAAAAAP//AP//////ACwAAAAAgAAgAAAC/pSPqcvtD6OctNqLs968+98A4kiWJvmcquisrtm+MpAAwY0Hdn7vPN1aAGstXs+oQw6FyqZxKfDlpDhqLyXMhpw/ZfHJndbCVW9QATWkEdYk+Pntvn/j+dQc0hK39jKcLxcoxkZ29JeHpsfUZ0gHeMeoUyfo54i4h7lI2TjI0PaJp1boZumpeLCGOvoZB7kpyTbzIiTrglY7o4Yrc8l2irYamjiciar2G4VM7Lus6fpcdVZ8PLxmrTyd3AwcydprvK19HZ6aPf5YCX31TW3ezuwOcQ7vGXyIPA+e/w6ORZ5ir9S/gfu0ZRt4UFU3YfHiFSyoaxeMWxJLUKx4IiLGZIn96HX8iNBjQ5EG8Zkk+dDfyJAgS7Lkxy9lOJTYXMK0ibOlTJ0n2eEs97OnUJ40X668SfRo0ZU7SS51erOp0XxSkSaFGtTo1a0bUcSo9bVr2I0gypo9izat2rVs27p9Czfu2QIAOw==";
			_img.style.clip =
				"rect(0px," + (i + 1) * 32 + "px," + 32 + "px," + i * 32 + "px)";
		}
	},
	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);
		ui.puzzle.key.enableKey = false;

		switch (ui.puzzle.pid) {
			case "sudoku":
				this.setsize_sudoku();
				break;
			case "tawa":
				this.setsize_tawa();
				break;
			default:
				this.setsize();
				break;
		}
	},

	//---------------------------------------------------------------------------
	// setsize()   盤面のサイズをセットする
	// getsize()   盤面のサイズを取得する
	//---------------------------------------------------------------------------
	setsize: function() {
		var bd = ui.puzzle.board;
		this.form.col.value = "" + bd.cols;
		this.form.row.value = "" + bd.rows;
	},
	getsize: function() {
		var col = this.form.col.value | 0;
		var row = this.form.row.value | 0;
		return !!col && !!row ? { col: col, row: row } : null;
	},

	//---------------------------------------------------------------------------
	// setsize_sudoku()   盤面のサイズをセットする (数独向け)
	// getsize_sudoku()   盤面のサイズを取得する (数独向け)
	//---------------------------------------------------------------------------
	setsize_sudoku: function() {
		for (var i = 0; i < 4; i++) {
			getEL("nb_size_sudoku_" + i).checked = "";
		}
		switch (ui.puzzle.board.cols) {
			case 16:
				getEL("nb_size_sudoku_2").checked = true;
				break;
			case 25:
				getEL("nb_size_sudoku_3").checked = true;
				break;
			case 4:
				getEL("nb_size_sudoku_0").checked = true;
				break;
			case 6:
				getEL("nb_size_sudoku_4").checked = true;
				break;
			default:
				getEL("nb_size_sudoku_1").checked = true;
				break;
		}
	},
	getsize_sudoku: function() {
		var col, row;
		if (getEL("nb_size_sudoku_2").checked) {
			col = row = 16;
		} else if (getEL("nb_size_sudoku_3").checked) {
			col = row = 25;
		} else if (getEL("nb_size_sudoku_0").checked) {
			col = row = 4;
		} else if (getEL("nb_size_sudoku_4").checked) {
			col = row = 6;
		} else {
			col = row = 9;
		}
		return { col: col, row: row };
	},

	//---------------------------------------------------------------------------
	// setsize_tawa()   盤面のサイズをセットする (たわむれんが向け)
	// getsize_tawa()   盤面のサイズを取得する (たわむれんが向け)
	//---------------------------------------------------------------------------
	setsize_tawa: function() {
		/* タテヨコのサイズ指定部分 */
		var bd = ui.puzzle.board,
			col = bd.cols,
			row = bd.rows,
			shape = bd.shape;

		if (shape === 3) {
			col++;
		}
		this.form.col.value = "" + col;
		this.form.row.value = "" + row;

		/* たわむレンガの形状指定ルーチン */
		this.setshape(shape);
	},
	getsize_tawa: function() {
		var col = this.form.col.value | 0;
		var row = this.form.row.value | 0;
		if (!col || !row) {
			return null;
		}

		var shape = this.getshape();
		if (!isNaN(shape) && !(col === 1 && (shape === 0 || shape === 3))) {
			if (shape === 3) {
				col--;
			}
		} else {
			return null;
		}

		return { col: col, row: row, shape: shape };
	},

	//---------------------------------------------------------------------------
	// setshape()   たわむれんの形状から形状指定ボタンの初期値をセットする
	// getshape()   たわむれんがのどの形状が指定されか取得する
	// clickshape() たわむれんがの形状指定ボタンを押した時の処理を行う
	// setshapeidx() たわむれんがの形状指定ボタンに背景色を設定する
	// getshapeidx() たわむれんがの形状指定ボタン背景色からインデックスを取得する
	//---------------------------------------------------------------------------
	setshape: function(shape) {
		this.setshapeidx([0, 2, 3, 1][shape]);
	},
	getshape: function() {
		var idx = this.getshapeidx();
		return idx !== null ? [0, 3, 1, 2][idx] : null;
	},
	clickshape: function(e) {
		this.setshapeidx(+e.target.parentNode.id.charAt(9));
	},

	setshapeidx: function(idx) {
		for (var i = 0; i <= 3; i++) {
			getEL("nb_shape_" + i).style.backgroundColor = i === idx ? "red" : "";
		}
	},
	getshapeidx: function() {
		for (var i = 0; i <= 3; i++) {
			if (getEL("nb_shape_" + i).style.backgroundColor === "red") {
				return i;
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// execute() 新規盤面を作成するボタンを押したときの処理を行う
	//---------------------------------------------------------------------------
	execute: function() {
		var pid = ui.puzzle.pid;
		var obj;
		switch (pid) {
			case "sudoku":
				obj = this.getsize_sudoku();
				break;
			case "tawa":
				obj = this.getsize_tawa();
				break;
			default:
				obj = this.getsize();
				break;
		}

		this.close();
		if (!!obj) {
			var url = pid + "/" + obj.col + "/" + obj.row;
			if (pid === "tawa") {
				url += "/" + obj.shape;
			}
			ui.puzzle.open(url);
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLInputクラス URL入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("urlinput", {
	formname: "urlinput",

	//------------------------------------------------------------------------------
	// urlinput() URLを入力する
	//------------------------------------------------------------------------------
	urlinput: function() {
		this.close();
		ui.puzzle.open(this.form.ta.value.replace(/\n/g, ""));
	}
});

//---------------------------------------------------------------------------
// ★Popup_URLOutputクラス URL出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("urloutput", {
	formname: "urloutput",

	init: function() {
		ui.popupmgr.popups.template.init.call(this);
		this.urlanchor = getEL("urlanchor");
	},

	reset: function(px, py) {
		var form = this.form,
			pid = ui.puzzle.pid,
			exists = pzpr.variety(pid).exists,
			parser = pzpr.parser;
		var url = ui.puzzle.getURL(parser.URL_PZPRV3);
		this.urlanchor.href = this.urlanchor.textContent = url;
		form.kanpen.style.display = form.kanpen.nextSibling.style.display = exists.kanpen
			? ""
			: "none";
		form.heyaapp.style.display = form.heyaapp.nextSibling.style.display =
			pid === "heyawake" ? "" : "none";
	},

	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);
		this.reset(px, py);
	},

	//------------------------------------------------------------------------------
	// urloutput() URLを出力する
	// openurl()   「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urloutput: function(e) {
		var url = "",
			parser = pzpr.parser;
		switch (e.target.name) {
			case "kanpen":
				url = ui.puzzle.getURL(parser.URL_KANPEN);
				break;
			case "pzprv3e":
				url = ui.puzzle
					.getURL(parser.URL_PZPRV3)
					.replace(/\?(\w+)/, "?$1_edit");
				break;
			case "heyaapp":
				url = ui.puzzle.getURL(parser.URL_HEYAAPP);
				break;
		}
		this.urlanchor.href = this.urlanchor.textContent = url;
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileOpenクラス ファイル入力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("fileopen", {
	formname: "fileform",

	init: function() {
		ui.popupmgr.popups.template.init.call(this);
	},

	//------------------------------------------------------------------------------
	// fileopen()  ファイルを開く
	//------------------------------------------------------------------------------
	fileopen: function(e) {
		var fileEL = this.form.filebox;
		if (!!ui.reader || ui.enableGetText) {
			var fitem = fileEL.files[0];
			if (!fitem) {
				return;
			}

			if (!!ui.reader) {
				ui.reader.readAsText(fitem);
			} else {
				ui.puzzle.open(fitem.getAsText(""));
			}
		}
		this.form.reset();
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_FileSaveクラス ファイル出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("filesave", {
	formname: "filesave",
	anchor: null,
	init: function() {
		ui.popupmgr.popups.template.init.call(this);

		this.anchor =
			!ui.enableSaveBlob && pzpr.env.API.anchor_download
				? getEL("saveanchor")
				: null;
	},
	reset: function() {
		/* ファイル形式選択オプション */
		var ispencilbox = pzpr.variety(ui.puzzle.pid).exists.pencilbox;
		this.form.filetype.options[1].disabled = !ispencilbox;
		this.form.filetype.options[2].disabled = !ispencilbox;
		var parser = pzpr.parser;
		this.form.ta.value = ui.puzzle.getFileData(parser.FILE_PZPR, {});
		this.form.ta2.value = this.form.ta.value.replace(/\n/g, "/");
	},
	/* オーバーライド */
	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);
		this.reset();

		this.form.filename.value = ui.puzzle.pid + ".txt";
		this.changefilename();

		ui.puzzle.key.enableKey = false;
	},
	close: function() {
		if (!!this.filesaveurl) {
			URL.revokeObjectURL(this.filesaveurl);
		}

		ui.popupmgr.popups.template.close.call(this);
	},
	changefilename: function() {
		var filetype = this.form.filetype.value;
		var filename = this.form.filename.value
			.replace(".xml", "")
			.replace(".txt", "");
		var ext = filetype !== "filesave4" ? ".txt" : ".xml";
		var pinfo = pzpr.variety(filename);
		if (pinfo.pid === ui.puzzle.pid) {
			if (filetype === "filesave" || filetype === "filesave3") {
				filename = pinfo.urlid;
			} else {
				filename = pinfo.kanpenid;
			}
		}
		this.form.filename.value = filename + ext;
	},

	//------------------------------------------------------------------------------
	// filesave()  ファイルを保存する
	//------------------------------------------------------------------------------
	filesaveurl: null,
	filesave: function() {
		var form = this.form;
		var filename = form.filename.value;
		var prohibit = ["\\", "/", ":", "*", "?", '"', "<", ">", "|"];
		for (var i = 0; i < prohibit.length; i++) {
			if (filename.indexOf(prohibit[i]) !== -1) {
				ui.notify.alert("ファイル名として使用できない文字が含まれています。");
				return;
			}
		}

		var parser = pzpr.parser,
			filetype = parser.FILE_PZPR,
			option = {};
		switch (form.filetype.value) {
			case "filesave2":
				filetype = parser.FILE_PBOX;
				break;
			case "filesave4":
				filetype = parser.FILE_PBOX_XML;
				break;
			case "filesave3":
				filetype = parser.FILE_PZPR;
				option.history = true;
				break;
		}

		var blob = null,
			filedata = null;
		if (ui.enableSaveBlob || !!this.anchor) {
			blob = new Blob([ui.puzzle.getFileData(filetype, option)], {
				type: "text/plain"
			});
		} else {
			filedata = ui.puzzle.getFileData(filetype, option);
		}

		if (ui.enableSaveBlob) {
			navigator.saveBlob(blob, filename);
			this.close();
		} else if (!!this.anchor) {
			if (!!this.filesaveurl) {
				URL.revokeObjectURL(this.filesaveurl);
			}
			this.filesaveurl = URL.createObjectURL(blob);
			this.anchor.href = this.filesaveurl;
			this.anchor.download = filename;
			this.anchor.click();
		} else {
			form.ques.value = filedata;
			form.operation.value =
				form.filetype.value !== "filesave4" ? "save" : "savexml";
			form.submit();
			this.close();
		}

		ui.puzzle.saved();
	}
});

//---------------------------------------------------------------------------
// ★Popup_ImageSaveクラス 画像出力のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("imagesave", {
	formname: "imagesave",
	anchor: null,
	showsize: null,
	init: function() {
		ui.popupmgr.popups.template.init.call(this);

		this.anchor =
			!ui.enableSaveBlob && pzpr.env.API.anchor_download
				? getEL("saveanchor")
				: null;
		this.showsize = getEL("showsize");

		/* ファイル形式選択オプション */
		var filetype = this.form.filetype,
			options = filetype.options;
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (!ui.enableImageType[option.value]) {
				filetype.removeChild(option);
				i--;
			}
		}
	},

	/* オーバーライド */
	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);

		ui.puzzle.key.enableKey = false;
		ui.puzzle.mouse.enableMouse = false;

		this.form.filename.value = pzpr.variety(ui.puzzle.pid).urlid + ".png";
		this.form.cellsize.value = ui.menuconfig.get("cellsizeval");

		this.changefilename();
		this.estimatesize();
	},
	close: function() {
		if (!!this.saveimageurl) {
			URL.revokeObjectURL(this.saveimageurl);
		}

		ui.puzzle.setCanvasSize();
		ui.popupmgr.popups.template.close.call(this);
	},

	changefilename: function() {
		var filename = this.form.filename.value.replace(/\.\w{3,4}$/, ".");
		this.form.filename.value = filename + this.form.filetype.value;
	},
	estimatesize: function() {
		var cellsize = +this.form.cellsize.value;
		var width = (+cellsize * ui.puzzle.painter.getCanvasCols()) | 0;
		var height = (+cellsize * ui.puzzle.painter.getCanvasRows()) | 0;
		this.showsize.replaceChild(
			_doc.createTextNode(width + " x " + height),
			this.showsize.firstChild
		);
	},

	//------------------------------------------------------------------------------
	// saveimage()    画像をダウンロードする
	// submitimage() "画像をダウンロード"の処理ルーチン
	// saveimage()   "画像をダウンロード"の処理ルーチン (IE10用)
	//------------------------------------------------------------------------------
	saveimageurl: null,
	saveimage: function() {
		/* ファイル名チェックルーチン */
		var form = this.form;
		var filename = form.filename.value;
		var prohibit = ["\\", "/", ":", "*", "?", '"', "<", ">", "|"];
		for (var i = 0; i < prohibit.length; i++) {
			if (filename.indexOf(prohibit[i]) !== -1) {
				ui.notify.alert("ファイル名として使用できない文字が含まれています。");
				return;
			}
		}

		/* 画像出力ルーチン */
		var option = { cellsize: +this.form.cellsize.value };
		if (this.form.transparent.checked) {
			option.bgcolor = "";
		}
		var type = form.filetype.value;

		try {
			if (ui.enableSaveBlob || !!this.anchor) {
				ui.puzzle.toBlob(
					function(blob) {
						/* 出力された画像の保存ルーチン */
						if (ui.enableSaveBlob) {
							navigator.saveBlob(blob, filename);
							this.close();
						} else {
							if (!!this.filesaveurl) {
								URL.revokeObjectURL(this.filesaveurl);
							}
							this.filesaveurl = URL.createObjectURL(blob);
							this.anchor.href = this.filesaveurl;
							this.anchor.download = filename;
							this.anchor.click();
							this.close();
						}
					}.bind(this),
					type,
					1.0,
					option
				);
			} else {
				/* 出力された画像の保存ルーチン */
				form.urlstr.value = ui.puzzle
					.toDataURL(type, 1.0, option)
					.replace(/data:.*;base64,/, "");
				form.submit();
				this.close();
			}
		} catch (e) {
			ui.notify.alert("画像の出力に失敗しました", "Fail to Output the Image");
		}
	},

	//------------------------------------------------------------------------------
	// openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	openimage: function() {
		/* 画像出力ルーチン */
		var option = { cellsize: +this.form.cellsize.value };
		if (this.form.transparent.checked) {
			option.bgcolor = "";
		}
		var type = this.form.filetype.value;
		var IEkei = navigator.userAgent.match(/(Trident|Edge)\//);

		var dataurl = "";
		try {
			if (!IEkei || type !== "svg") {
				dataurl = ui.puzzle.toDataURL(type, 1.0, option);
			} else {
				dataurl = ui.puzzle.toBuffer("svg", option);
			}
		} catch (e) {
			ui.notify.alert("画像の出力に失敗しました", "Fail to Output the Image");
		}
		if (!dataurl) {
			/* No Data URL */ return;
		}

		/* 出力された画像を開くルーチン */
		function writeContent(blob) {
			var filename = this.form.filename.value;
			var cdoc = window.open("", "", "").document;
			cdoc.open();
			cdoc.writeln('<!DOCTYPE html>\n<HTML LANG="ja">\n<HEAD>');
			cdoc.writeln('<META CHARSET="utf-8">');
			cdoc.writeln("<TITLE>ぱずぷれv3</TITLE>\n</HEAD><BODY>");
			if (!!blob) {
				cdoc.writeln('<img src="', dataurl, '"><br>\n');
				cdoc.writeln(
					'<a href="',
					cdoc.defaultView.URL.createObjectURL(blob),
					'" download="',
					filename,
					'">Download ',
					filename,
					"</a>"
				);
			} else if (!IEkei || type !== "svg") {
				cdoc.writeln('<img src="', dataurl, '">');
			} else {
				cdoc.writeln(dataurl.replace(/^<\?.+?\?>/, ""));
			}
			cdoc.writeln("</BODY>\n</HTML>");
			cdoc.close();
		}
		if (pzpr.env.API.anchor_download) {
			// ChromeでDataURLが直接開けない対策
			ui.puzzle.toBlob(writeContent.bind(this), type, 1.0, option);
		} else {
			writeContent(null);
		}
	}
});

//---------------------------------------------------------------------------
// ★Popup_Adjustクラス 盤面の調整のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("adjust", {
	formname: "adjust",

	adjust: function(e) {
		ui.puzzle.board.operate(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_TurnFlipクラス 回転・反転のポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("turnflip", {
	formname: "turnflip",

	reset: function() {
		this.form.turnl.disabled = ui.puzzle.pid === "tawa";
		this.form.turnr.disabled = ui.puzzle.pid === "tawa";
	},

	adjust: function(e) {
		ui.puzzle.board.operate(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★Popup_Metadataクラス メタデータの設定・表示を行うメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("metadata", {
	formname: "metadata",

	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);

		var form = this.form;
		var puzzle = ui.puzzle,
			bd = puzzle.board,
			meta = puzzle.metadata;
		getEL("metadata_variety").innerHTML =
			pzpr.variety(puzzle.pid)[pzpr.lang] + "&nbsp;" + bd.cols + "×" + bd.rows;
		form.author.value = meta.author;
		form.source.value = meta.source;
		form.hard.value = meta.hard;
		form.comment.value = meta.comment;
	},

	save: function() {
		var form = this.form;
		var puzzle = ui.puzzle,
			meta = puzzle.metadata;
		meta.author = form.author.value;
		meta.source = form.source.value;
		meta.hard = form.hard.value;
		meta.comment = form.comment.value;
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_DispSizeクラス サイズの変更を行うポップアップメニューを作成したり表示します
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("dispsize", {
	formname: "dispsize",

	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);

		this.form.cellsize.value = ui.menuconfig.get("cellsizeval");
		ui.puzzle.key.enableKey = false;
	},

	//------------------------------------------------------------------------------
	// changesize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	changesize: function(e) {
		var csize = this.form.cellsize.value | 0;
		if (csize > 0) {
			ui.menuconfig.set("cellsizeval", csize);
		}
		this.close();
	}
});

//---------------------------------------------------------------------------
// ★Popup_About
//---------------------------------------------------------------------------
ui.popupmgr.addpopup("about", {
	formname: "about"
});
