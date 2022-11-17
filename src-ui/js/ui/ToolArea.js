// ToolArea.js v3.4.0
/* global getEL:readonly */

// メニュー描画/取得/html表示系
// toolareaオブジェクト
ui.toolarea = {
	items: null, // ツールパネルのエレメント等を保持する
	captions: [], // 言語指定を切り替えた際のキャプションを保持する

	//---------------------------------------------------------------------------
	// toolarea.reset()  ツールパネル・ボタン領域の初期設定を行う
	//---------------------------------------------------------------------------
	reset: function() {
		if (this.items === null) {
			this.items = {};
			this.walkElement(getEL("usepanel"));
			this.walkElement(getEL("checkpanel"));
			this.walkElement(getEL("variantpanel"));
			this.walkElement(getEL("btnarea"));
		}
		ui.misc.displayByPid(getEL("checkpanel"));
		ui.misc.displayByPid(getEL("btnarea"));

		this.display();
	},

	//---------------------------------------------------------------------------
	// toolarea.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement: function(parent) {
		var toolarea = this;
		function btnfactory(role) {
			return function(e) {
				toolarea[role](e);
				if (e.type !== "click") {
					e.stopPropagation();
				}
			};
		}
		function addbtnevent(el, type, role) {
			pzpr.util.addEvent(el, type, toolarea, btnfactory(role));
		}
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1) {
				/* ツールパネル領域 */
				var parent, idname;
				if (el.className === "config") {
					toolarea.items[ui.customAttr(el, "config")] = { el: el };
				} else if (el.className.match(/child/)) {
					(parent = el.parentNode.parentNode),
						(idname = ui.customAttr(parent, "config"));
					var item = toolarea.items[idname];
					if (!item.children) {
						item.children = [];
					}
					item.children.push(el);

					addbtnevent(el, "mousedown", "toolclick");
				} else if (el.nodeName === "INPUT" && el.type === "checkbox") {
					(parent = el.parentNode), (idname = ui.customAttr(parent, "config"));
					if (!idname) {
						(parent = parent.parentNode),
							(idname = ui.customAttr(parent, "config"));
					}
					if (!idname) {
						return;
					}
					toolarea.items[idname].checkbox = el;

					addbtnevent(el, "click", "toolclick");
				}

				/* ボタン領域 */
				var role = ui.customAttr(el, "buttonExec");
				if (!!role) {
					addbtnevent(
						el,
						!pzpr.env.API.touchevent ? "click" : "mousedown",
						role
					);
				}
				role = ui.customAttr(el, "pressExec");
				if (!!role) {
					var roles = role.split(/,/);
					addbtnevent(el, "mousedown", roles[0]);
					if (!!role[1]) {
						addbtnevent(el, "mouseup", roles[1]);
						addbtnevent(el, "mouseleave", roles[1]);
						addbtnevent(el, "touchcancel", roles[1]);
					}
				}
			} else if (el.nodeType === 3) {
				if (el.data.match(/^__(.+)__$/)) {
					var str_key = RegExp.$1;
					toolarea.captions.push({
						textnode: el,
						str_key: str_key
					});
					parent = el.parentNode;
					if (parent.className.match(/child/)) {
						toolarea.captions.push({
							datanode: parent,
							str_key: str_key
						});
					}
				}
			}
		});
	},

	//---------------------------------------------------------------------------
	// toolarea.display()    全てのラベルに対して文字列を設定する
	// toolarea.displayVariantPanel() display the variant panel
	// toolarea.setdisplay() 管理パネルに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display: function() {
		/* ツールパネル領域 */
		/* -------------- */
		var mandisp = ui.menuconfig.get("toolarea") ? "block" : "none";
		getEL("usepanel").style.display = mandisp;
		getEL("checkpanel").style.display = mandisp;

		/* 経過時間の表示/非表示設定 */
		getEL("separator2").style.display =
			ui.puzzle.playeronly && ui.menuconfig.get("toolarea") ? "" : "none";
		getEL("timerpanel").style.display = ui.puzzle.playeronly ? "block" : "none";
		this.displayVariantPanel();

		for (var idname in this.items) {
			this.setdisplay(idname);
		}

		/* ボタン領域 */
		/* --------- */
		getEL("btnarea").style.display = "";
		pzpr.util.unselectable(getEL("btnarea"));

		this.setdisplay("operation");
		getEL("btnclear2").style.display = !ui.puzzle.board.disable_subclear
			? ""
			: "none";
		getEL("btncolor").style.display =
			ui.puzzle.pid === "tentaisho" ? "" : "none";
		getEL("btnflush").style.display =
			ui.puzzle.board.hasflush && !ui.puzzle.playeronly ? "" : "none";
		getEL("btnpresets").style.display =
			ui.puzzle.board.bank &&
			ui.puzzle.board.bank.presets.length &&
			!ui.puzzle.playeronly
				? ""
				: "none";
		/* ボタンエリアの色分けボタンは、ツールパネル領域が消えている時に表示 */
		getEL("btnirowake").style.display =
			ui.puzzle.painter.irowake && !ui.menuconfig.get("toolarea") ? "" : "none";
		getEL("btnirowakeblk").style.display =
			ui.puzzle.painter.irowakeblk && !ui.menuconfig.get("toolarea")
				? ""
				: "none";
		this.setdisplay("trialmode");
		this.setdisplay("network");

		/* 共通：キャプションの設定 */
		/* --------------------- */
		for (var i = 0; i < this.captions.length; i++) {
			var obj = this.captions[i];
			if (!!obj.textnode) {
				obj.textnode.data = ui.i18n(obj.str_key);
			}
			if (!!obj.datanode) {
				obj.datanode.setAttribute("data-text", ui.i18n(obj.str_key));
			}
		}
	},
	displayVariantPanel: function() {
		// display if the type has variants, and we're in edit mode or some
		// variants are enabled
		var shouldDisplay = (function() {
			if (!ui.menuconfig.get("toolarea")) {
				return false;
			}
			var variants = ui.puzzle.config.getVariants();
			if (Object.keys(variants).length <= 0) {
				return false;
			}
			if (!ui.puzzle.playeronly) {
				return true;
			}
			for (var key in variants) {
				if (variants[key]) {
					return true;
				}
			}
		})();
		var vardisp = shouldDisplay ? "block" : "none";
		getEL("separator1").style.display = vardisp;
		getEL("variantpanel").style.display = vardisp;
		if (ui.puzzle.playeronly) {
			getEL("variantpanel").classList.add("playeronly");
		}
	},
	setdisplay: function(idname) {
		if (idname === "variant") {
			var str;
			if (ui.menuconfig.get("variant")) {
				str = ui.i18n("check.variant");
			} else {
				str = ui.i18n("check");
			}
			getEL("btncheck").textContent = str;
		}

		var trial = ui.puzzle.board.trialstage > 0;
		var net = ui.network.mode !== "";

		if (idname === "operation") {
			var opemgr = ui.puzzle.opemgr;
			getEL("btnundo").disabled = !opemgr.enableUndo;
			getEL("btnredo").disabled = !opemgr.enableRedo;
			getEL("btntriale").disabled = opemgr.atStartOfTrial();
		} else if (idname === "trialmode") {
			getEL("btnclear").disabled = trial;
			getEL("btntrial").disabled = trial;
			getEL("btntrialarea").style.display = trial && !net ? "block" : "none";
		} else if (idname === "network") {
			getEL("btnundo").style.display = net ? "none" : "inline";
			getEL("btnredo").style.display = net ? "none" : "inline";
			getEL("btntrial").style.display = net ? "none" : "inline";
			getEL("btntrialarea").style.display = trial && !net ? "block" : "none";
		} else if (this.items === null || !this.items[idname]) {
			/* DO NOTHING */
		} else if (ui.menuconfig.valid(idname)) {
			var toolitem = this.items[idname];
			toolitem.el.style.display = "";

			if (idname === "mode") {
				this.displayVariantPanel();
			}

			var disabled = null;
			/* 子要素の設定を行う */
			if (!!toolitem.children) {
				var children = toolitem.children;
				var validval =
					idname === "inputmode"
						? ui.puzzle.mouse.getInputModeList()
						: idname === "auxeditor_inputmode"
						? ui.auxeditor.puzzle.mouse.getInputModeList()
						: null;
				for (var i = 0; i < children.length; i++) {
					var child = children[i],
						value = ui.customAttr(child, "value"),
						selected = value === "" + ui.menuconfig.get(idname);
					child.className = selected ? "child childsel" : "child";
					child.style.display =
						validval === null || validval.indexOf(value) >= 0 ? "" : "none";
				}

				if (idname === "inputmode") {
					disabled = validval.length === 1;
				}
				if (disabled !== null) {
					toolitem.el.className = !disabled ? "" : "disabled";
				}
			} else if (!!toolitem.checkbox) {
				/* チェックボックスの表記の設定 */
				var check = toolitem.checkbox;
				if (!!check) {
					check.checked = ui.menuconfig.get(idname);
				}

				if (idname === "keypopup") {
					disabled = !ui.keypopup.paneltype[ui.puzzle.editmode ? 1 : 3];
				}
				if (idname === "bgcolor") {
					disabled = ui.puzzle.editmode;
				}
				if (ui.puzzle.config.getvariant(idname)) {
					disabled = !ui.puzzle.editmode;
				}
				if (disabled !== null) {
					toolitem.checkbox.disabled = !disabled ? "" : "true";
				}
			}
		} else if (!!this.items[idname]) {
			this.items[idname].el.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.toolclick()   ツールパネルの入力があった時、設定を変更する
	//---------------------------------------------------------------------------
	toolclick: function(e) {
		var el = e.target,
			parent = el.parentNode;
		var idname =
				ui.customAttr(parent, "config") ||
				ui.customAttr(parent.parentNode, "config"),
			value;
		if (!!this.items[idname].checkbox) {
			value = !!el.checked;
		} else {
			value = ui.customAttr(el, "value");
		}
		ui.menuconfig.set(idname, value);
	},

	//---------------------------------------------------------------------------
	// Canvas下にあるボタンが押された/放された時の動作
	//---------------------------------------------------------------------------
	answercheck: function() {
		ui.menuarea.answercheck();
	},
	undo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startUndo();
	},
	undostop: function() {
		ui.undotimer.stopUndo();
	},
	redo: function() {
		ui.auxeditor.close(true);
		ui.undotimer.startRedo();
	},
	redostop: function() {
		ui.undotimer.stopRedo();
	},
	ansclear: function() {
		ui.menuarea.answerclear();
	},
	subclear: function() {
		ui.menuarea.submarkclear();
	},
	irowake: function() {
		ui.puzzle.irowake();
	},
	encolorall: function() {
		ui.puzzle.board.encolorall();
	} /* 天体ショーのボタン */,
	dropblocks: function() {
		ui.puzzle.board.operate("drop");
	},
	resetblocks: function() {
		ui.puzzle.board.operate("resetpos");
	},
	flushexcell: function() {
		ui.puzzle.board.flushexcell();
	},
	applypreset: function(e) {
		ui.auxeditor.close();

		ui.popupmgr.open("applypreset", 0, 0);
		var rect = pzpr.util.getRect(getEL("btnarea"));
		var bounds = pzpr.util.getRect(getEL("popapplypreset"));
		ui.popupmgr.open(
			"applypreset",
			rect.left + (rect.width - bounds.width) / 2,
			Math.max(16, rect.top - bounds.height - 16)
		);
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
		ui.puzzle.acceptTrial();
	},
	rejectTrial: function() {
		ui.puzzle.rejectCurrentTrial();
	}
};
