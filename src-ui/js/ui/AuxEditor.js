/* jshint devel:true */
/* global getEL:readonly */

ui.popupmgr.addpopup("auxeditor", {
	formname: "auxeditor",

	close: function() {
		if (ui.auxeditor.cb && ui.auxeditor.puzzle) {
			ui.auxeditor.cb(ui.auxeditor.puzzle);
			ui.auxeditor.cb = null;
		}
		ui.auxeditor.current = null;

		ui.popupmgr.popups.template.close.apply(this);
	},

	delete: function() {
		if (!ui.auxeditor.puzzle.opemgr.enableUndo) {
			ui.auxeditor.puzzle.board.ansclear();
			this.close();
		} else {
			var thiz = this;
			ui.notify.confirm(ui.i18n("auxdelete.confirm"), function() {
				ui.auxeditor.puzzle.board.ansclear();
				thiz.close();
			});
		}
	},

	init: function() {
		ui.popupmgr.popups.template.init.call(this);

		function btnfactory(role) {
			return function(e) {
				ui.toolarea[role](e);
				if (e.type !== "click") {
					e.preventDefault();
					e.stopPropagation();
				}
			};
		}
		function addbtnevent(el, type, role) {
			pzpr.util.addEvent(el, type, ui.toolarea, btnfactory(role));
		}

		ui.misc.walker(this.form, function(el) {
			if (el.nodeType === 1) {
				if (el.className === "config") {
					ui.toolarea.items[ui.customAttr(el, "config")] = { el: el };
				} else if (el.className.match(/child/)) {
					var parent = el.parentNode.parentNode,
						idname = ui.customAttr(parent, "config");
					var item = ui.toolarea.items[idname];
					if (!item.children) {
						item.children = [];
					}
					item.children.push(el);

					addbtnevent(el, "mousedown", "toolclick");
				}
			}
		});
	},

	adjust_aux: function(e) {
		ui.auxeditor.puzzle.board.operate(e.target.name);
	}
});

ui.auxeditor = {
	current: null,
	cb: null,

	close: function(abort) {
		if (ui.popupmgr.popups.auxeditor.pop) {
			if (abort) {
				this.cb = null;
			}
			ui.popupmgr.popups.auxeditor.close();
		}
	},

	open: function(sender, args, cb) {
		if (!args || args.abort) {
			ui.auxeditor.close(args && args.abort);
			return;
		}

		if (ui.auxeditor.current === args.key) {
			return;
		}

		if (ui.popupmgr.popups.applypreset.pop) {
			ui.popupmgr.popups.applypreset.close();
		}

		var cellsize = ui.puzzle.painter.cw;
		if (cellsize > 32) {
			cellsize = Math.floor(cellsize * 0.75);
		}

		var rect = pzpr.util.getRect(getEL("divques"));
		ui.popupmgr.open("auxeditor", 4, rect.top);

		if (!ui.auxeditor.puzzle) {
			var element = document.getElementById("divauxeditor");
			ui.auxeditor.puzzle = new pzpr.Puzzle(element, {
				type: "player",
				cellsize: cellsize
			});
		}
		var pz = ui.auxeditor.puzzle;

		pz.open(args.pid + "/" + args.url, function() {
			ui.popupmgr.popups.auxeditor.titlebar.innerText = ui.selectStr(
				pz.info.ja,
				pz.info.en
			);
			ui.auxeditor.puzzle.setCanvasSizeByCellSize(cellsize);

			var bounds = pzpr.util.getRect(getEL("popauxeditor"));
			ui.popupmgr.open(
				"auxeditor",
				Math.max(4, rect.left - bounds.width),
				bounds.top
			);
		});

		ui.auxeditor.current = args.key;
		ui.auxeditor.cb = cb;
		ui.menuconfig.set("auxeditor_inputmode", "auto");
	}
};

ui.popupmgr.addpopup("applypreset", {
	formname: "applypreset",

	show: function(px, py) {
		ui.popupmgr.popups.template.show.call(this, px, py);
		ui.puzzle.key.enableKey = false;
	},

	reset: function() {
		this.loadpresets();
	},

	translate: function() {
		ui.popupmgr.popups.template.translate.call(this);
		if (ui.puzzle.klass.Bank.prototype.enabled) {
			this.loadpresets();
		}
	},

	apply: function() {
		if (this.form.preset.value === "") {
			this.close();
			return;
		}
		var i = +this.form.preset.value;
		var preset = ui.puzzle.board.bank.presets[i];
		var field = this.form["preset_" + i];
		var param = field ? field.value : undefined;

		ui.puzzle.board.bank.applyPreset(preset, param);
		this.close();
	},

	loadpresets: function() {
		var root = getEL("ap_preset");
		root.replaceChildren();

		var presets = ui.puzzle.board.bank.presets;
		for (var i = 0; i < presets.length; i++) {
			if (!presets[i].name || presets[i].createOnly) {
				continue;
			}

			var div = document.createElement("div");
			var label = document.createElement("label");
			var input = document.createElement("input");

			input.name = "preset";
			input.value = i;
			input.type = "radio";

			label.textContent = (ui.i18n(presets[i].name) || presets[i].name) + " ";
			label.prepend(input);

			div.replaceChildren(label);
			if (presets[i].field) {
				var field = document.createElement("input");
				var props = presets[i].field;
				for (var prop in props) {
					field[prop] = props[prop];
				}
				field.name = "preset_" + i;

				field.oninput = function(ev) {
					// div > label > input
					ev.target.parentNode.firstChild.firstChild.checked = true;
				};

				div.appendChild(field);
			}

			root.appendChild(div);
		}
	}
});
