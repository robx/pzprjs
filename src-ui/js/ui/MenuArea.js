// MenuArea.js v3.4.0
/* global getEL:readonly, _doc:readonly */

// メニュー描画/取得/html表示系
ui.menuarea = {
	captions: [], // 言語指定を切り替えた際のキャプションを保持する
	menuitem: null, // メニューの設定切り替え用エレメント等を保持する
	nohover: false, // :hover擬似クラスを使用しないでhover表示する

	//---------------------------------------------------------------------------
	// menuarea.reset()  メニュー、サブメニュー、フロートメニューの初期設定を行う
	//---------------------------------------------------------------------------
	reset: function() {
		this.createMenu();

		this.display();
	},

	//---------------------------------------------------------------------------
	// menuarea.createMenu()  メニューの初期設定を行う
	//---------------------------------------------------------------------------
	createMenu: function() {
		if (this.menuitem === null) {
			this.modifySelector();

			this.menuitem = {};
			this.walkElement(getEL("menupanel"));
		}
		ui.misc.displayByPid(getEL("menupanel"));
		this.stopHovering();
	},

	//---------------------------------------------------------------------------
	// menuarea.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement: function(parent) {
		var menuarea = this;
		function menufactory(role) {
			return function(e) {
				menuarea[role](e);
				if (menuarea.nohover) {
					e.preventDefault();
					e.stopPropagation();
				}
			};
		}
		function addmenuevent(el, type, role) {
			var func = typeof role === "function" ? role : menufactory(role);
			pzpr.util.addEvent(el, type, menuarea, func);
		}
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1 && el.nodeName === "LI") {
				var setevent = false;
				var idname = ui.customAttr(el, "config");
				if (!!idname) {
					menuarea.menuitem[idname] = { el: el };
					if (el.className === "check") {
						addmenuevent(el, "mousedown", "checkclick");
						setevent = true;
					}
				}
				var value = ui.customAttr(el, "value");
				if (!!value) {
					var parent = el.parentNode.parentNode;
					idname = ui.customAttr(parent, "config");
					var item = menuarea.menuitem[idname];
					if (!item.children) {
						item.children = [];
					}
					item.children.push(el);

					addmenuevent(el, "mousedown", "childclick");
					setevent = true;
				}

				var role = ui.customAttr(el, "menuExec");
				if (!!role) {
					addmenuevent(el, "mousedown", role);
					setevent = true;
				}
				role = ui.customAttr(el, "pressExec");
				if (!!role) {
					var roles = role.split(/,/);
					addmenuevent(el, "mousedown", roles[0]);
					if (!!role[1]) {
						addmenuevent(el, "mouseup", roles[1]);
						addmenuevent(el, "mouseleave", roles[1]);
						addmenuevent(el, "touchcancel", roles[1]);
					}
					setevent = true;
				}
				role = ui.customAttr(el, "popup");
				if (!!role) {
					addmenuevent(el, "mousedown", "disppopup");
					setevent = true;
				}

				if (el.className === "link") {
					addmenuevent(el, "mousedown", "updatelink");
					setevent = true; // bypass setting event below
				}

				if (!setevent) {
					if (!menuarea.nohover || !el.querySelector("menu")) {
						addmenuevent(el, "mousedown", function(e) {
							e.preventDefault();
						});
					} else {
						addmenuevent(el, "mousedown", function(e) {
							menuarea.showHovering(e, el);
							e.preventDefault();
							e.stopPropagation();
						});
					}
				}

				var link = ui.customAttr(el, "pidlink");
				if (!!link) {
					el.firstChild.setAttribute("href", link + ui.puzzle.pid);
				}
			} else if (el.nodeType === 1 && el.nodeName === "MENU") {
				var label = el.getAttribute("label");
				if (!!label && label.match(/^__(.+)__$/)) {
					menuarea.captions.push({
						menu: el,
						str_key: RegExp.$1
					});
					if (menuarea.nohover) {
						addmenuevent(el, "mousedown", function(e) {
							e.stopPropagation();
						});
					}
				}
			} else if (el.nodeType === 3) {
				if (el.data.match(/^__(.+)__$/)) {
					menuarea.captions.push({
						textnode: el,
						str_key: RegExp.$1
					});
				}
			}
		});
	},

	//--------------------------------------------------------------------------------
	// menuarea.modifySelector()  MenuAreaに関するCSSセレクタテキストを変更する (Android向け)
	//--------------------------------------------------------------------------------
	modifySelector: function() {
		/* Android 4.0, iOS5.1以上向け処理です */
		if (!pzpr.env.OS.mobile || !getEL("menupanel").classList) {
			return;
		}
		var sheet = _doc.styleSheets[0];
		var rules = sheet.cssRules || sheet.rules;
		if (rules === null) {
		} // Chromeでローカルファイルを開くとおかしくなるので、とりあえず何もしないようにします

		for (var i = 0, len = rules.length; i < len; i++) {
			var rule = rules[i];
			if (!rule.selectorText) {
				continue;
			}
			if (rule.selectorText.match(/\#menupanel.+\:hover.*/)) {
				sheet.insertRule(rule.cssText.replace(":hover", ".hovering"), i);
				sheet.deleteRule(i + 1);
			}
		}
		this.nohover = true;
	},

	//--------------------------------------------------------------------------------
	// menuarea.showHovering()  MenuAreaのポップアップを表示する (Android向け)
	// menuarea.stopHovering()  MenuAreaのポップアップを消去する (Android向け)
	//--------------------------------------------------------------------------------
	showHovering: function(e, el0) {
		if (!this.nohover) {
			return;
		}
		el0.classList.toggle("hovering");
		ui.misc.walker(getEL("menupanel"), function(el) {
			if (el.nodeType === 1 && !!el.classList && !el.contains(el0)) {
				el.classList.remove("hovering");
			}
		});
	},
	stopHovering: function() {
		if (!this.nohover) {
			return;
		}
		ui.misc.walker(getEL("menupanel"), function(el) {
			if (el.nodeType === 1 && !!el.classList) {
				el.classList.remove("hovering");
			}
		});
	},

	//---------------------------------------------------------------------------
	// menuarea.display()    全てのメニューに対して文字列を設定する
	// menuarea.setdisplay() サブメニューに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display: function() {
		getEL("menupanel").style.display = "";

		getEL("menu_imagesave").className = ui.enableSaveImage ? "" : "disabled";

		var EDITOR = !ui.puzzle.playeronly;
		getEL("menu_edit").style.display = EDITOR ? "" : "none";
		getEL("menu_newboard").style.display = EDITOR ? "" : "none";
		getEL("menu_urloutput").style.display = EDITOR ? "" : "none";
		getEL("menu_adjust").style.display = EDITOR ? "" : "none";
		getEL("menu_turnflip").style.display = EDITOR ? "" : "none";

		for (var idname in this.menuitem) {
			this.setdisplay(idname);
		}
		this.setdisplay("operation");
		this.setdisplay("trialmode");
		this.setdisplay("toolarea");

		/* キャプションの設定 */
		for (var i = 0; i < this.captions.length; i++) {
			var obj = this.captions[i];
			if (!!obj.textnode) {
				obj.textnode.data = ui.i18n(obj.str_key);
			} else if (!!obj.menu) {
				obj.menu.setAttribute("label", ui.i18n(obj.str_key));
			}
		}
	},
	setdisplay: function(idname) {
		if (idname === "trialmode") {
			var trial = ui.puzzle.board.trialstage > 0;
			getEL("menu_adjust").className = trial ? "disabled" : "";
			getEL("menu_turnflip").className = trial ? "disabled" : "";
		}

		if (idname === "toolarea") {
			var str;
			if (!ui.menuconfig.get("toolarea")) {
				str = ui.i18n("toolarea.show");
			} else {
				str = ui.i18n("toolarea.hide");
			}
			getEL("menu_toolarea").textContent = str;
		} else if (this.menuitem === null || !this.menuitem[idname]) {
			/* DO NOTHING */
		} else if (ui.menuconfig.valid(idname)) {
			var menuitem = this.menuitem[idname];
			menuitem.el.style.display = "";

			/* セレクタ部の設定を行う */
			if (!!menuitem.children) {
				var children = menuitem.children;
				var validval =
					idname === "inputmode" ? ui.puzzle.mouse.getInputModeList() : null;
				for (var i = 0; i < children.length; i++) {
					var child = children[i],
						value = ui.customAttr(child, "value"),
						selected = value === "" + ui.menuconfig.get(idname);
					child.className = selected ? "checked" : "";
					child.style.display =
						validval === null || validval.indexOf(value) >= 0 ? "" : "none";
				}
			} else if (!!menuitem.el) {
				/* Check部の表記の変更 */
				var cname = ui.menuconfig.get(idname) ? "checked" : "check";
				var disabled = null;
				if (ui.puzzle.config.getvariant(idname)) {
					disabled = !ui.puzzle.editmode;
				}
				if (disabled === true) {
					cname += " disabled";
				}

				menuitem.el.className = cname;
			}
		} else if (!!this.menuitem[idname]) {
			this.menuitem[idname].el.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.checkclick()   メニューから設定値の入力があった時、設定を変更する
	// menuarea.childclick()   メニューから設定値の入力があった時、設定を変更する
	//---------------------------------------------------------------------------
	checkclick: function(e) {
		var el = e.target;
		if (el.nodeName === "SPAN") {
			el = el.parentNode;
		}
		if (el.className.match(/disabled/)) {
			return;
		}

		var idname = ui.customAttr(el, "config");
		ui.menuconfig.set(idname, !ui.menuconfig.get(idname));
	},
	childclick: function(e) {
		var el = e.target;
		if (el.nodeName === "SPAN") {
			el = el.parentNode;
		}

		var parent = el.parentNode.parentNode;
		ui.menuconfig.set(
			ui.customAttr(parent, "config"),
			ui.customAttr(el, "value")
		);
	},

	//---------------------------------------------------------------------------
	// メニューがクリックされた時の動作を呼び出す
	//---------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	undo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startUndo();
	},
	undostop: function() {
		ui.undotimer.stopUndo();
	},
	undoall: function() {
		ui.auxeditor.close(true);
		ui.puzzle.undoall();
	},
	redo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startRedo();
	},
	redostop: function() {
		ui.undotimer.stopRedo();
	},
	redoall: function() {
		ui.auxeditor.close(true);
		ui.puzzle.redoall();
	},
	enterTrial: function() {
		if (ui.puzzle.board.trialstage === 0) {
			ui.puzzle.enterTrial();
		}
	},
	enterFurtherTrial: function() {
		ui.puzzle.enterTrial();
	},
	acceptTrial: function() {
		ui.auxeditor.close(true);
		ui.puzzle.acceptTrial();
	},
	rejectTrial: function() {
		ui.auxeditor.close(true);
		ui.puzzle.rejectTrial();
	},
	rejectCurrentTrial: function() {
		ui.auxeditor.close(true);
		ui.puzzle.rejectCurrentTrial();
	},
	toolarea: function() {
		ui.menuconfig.set("toolarea", !ui.menuconfig.get("toolarea"));
		ui.displayAll();
	},
	disppopup: function(e) {
		var el = e.target;
		if (el.nodeName === "SPAN") {
			el = el.parentNode;
		}
		if (el.className !== "disabled") {
			var idname = ui.customAttr(el, "popup");
			if (!pzpr.env.OS.mobile) {
				var pos = pzpr.util.getPagePos(e);
				ui.popupmgr.open(idname, pos.px - 8, pos.py - 8);
			} else {
				var rect = pzpr.util.getRect(getEL("menupanel"));
				ui.popupmgr.open(idname, 8, rect.bottom + 8);
			}
			this.stopHovering();
		}
	},
	updatelink: function(e) {
		var el = e.target;
		var linktype = ui.customAttr(el.parentNode, "linktype");
		switch (linktype) {
			case "duplicate":
				var url = ui.puzzle.getURL(
					pzpr.parser.URL_PZPRFILE,
					ui.puzzle.playeronly ? "player" : "editor"
				);
				el.setAttribute("href", url);
				break;
		}
	},

	//------------------------------------------------------------------------------
	// menuarea.answercheck()「正答判定」ボタンを押したときの処理
	// menuarea.answerclear()  「解答消去」ボタンを押したときの処理
	// menuarea.submarkclear()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	answercheck: function() {
		var check = ui.puzzle.check(true);
		if (check.complete) {
			ui.timer.stop();
			if (ui.callbackComplete) {
				ui.callbackComplete(ui.puzzle, check);
			}
		}
		var str = "",
			texts = check.text.split(/\n/);
		for (var i = 0; i < texts.length; i++) {
			str += '<div style="margin-bottom:6pt;">' + texts[i] + "</div>";
		}
		this.stopHovering();
		ui.notify.alert(str);
	},
	answerclear: function() {
		this.stopHovering();
		ui.notify.confirm(ui.i18n("ansclear.confirm"), function() {
			ui.puzzle.ansclear();
		});
	},
	submarkclear: function() {
		this.stopHovering();
		ui.notify.confirm(ui.i18n("subclear.confirm"), function() {
			ui.puzzle.subclear();
		});
	}
};
