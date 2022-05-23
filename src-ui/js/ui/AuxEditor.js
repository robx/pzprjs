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
	}
});

ui.auxeditor = {
	current: null,
	cb: null,

	open: function(sender, args, cb) {
		if (ui.auxeditor.current === args.key) {
			return;
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
