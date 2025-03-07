//
// curving.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["curving"], {
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["circle-unshade", "info-blk", "clear"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		autoplay_func: "cellpeke",
		mouseinputAutoEdit: function() {
			this.inputFixedNumber(1);
		},
		inputFixedNumber: function(num) {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			this.initFirstCell(cell);
			if (this.inputData === 1) {
				var cell0 = this.firstCell;
				if ((cell.bx ^ cell.by ^ cell0.bx ^ cell0.by) & 2) {
					return;
				}
			}
			this.common.inputFixedNumber.call(this, num);
		}
	},
	KeyEvent: {
		enablemake: true
	},
	Cell: {
		maxnum: 1,
		disInputHatena: true,
		numberAsObject: true,
		numberRemainsUnshaded: true
	},
	Board: {
		hasborder: 1,
		addExtraInfo: function() {
			this.horzStripes = this.addInfoList(this.klass.HorzStripeGraph);
			this.vertStripes = this.addInfoList(this.klass.VertStripeGraph);
		}
	},

	AreaUnshadeGraph: {
		enabled: true
	},
	"StripeGraph:AreaUnshadeGraph": {
		relation: { "cell.qnum": "node", "cell.qans": "node" },
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.circles = component.clist.filter(function(cell) {
				return cell.qnum === 1;
			});
		}
	},
	"HorzStripeGraph:StripeGraph": {
		enabled: true,
		getComponentRefs: function(obj) {
			return obj.horzStripe;
		},
		setComponentRefs: function(obj, component) {
			obj.horzStripe = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.horzNodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.horzNodes = [];
		},

		isedgevalidbynodeobj: function(cell1, cell2) {
			return cell1.by === cell2.by;
		}
	},
	"VertStripeGraph:StripeGraph": {
		enabled: true,
		getComponentRefs: function(obj) {
			return obj.vertStripe;
		},
		setComponentRefs: function(obj, component) {
			obj.vertStripe = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.vertNodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.vertNodes = [];
		},

		isedgevalidbynodeobj: function(cell1, cell2) {
			return cell1.bx === cell2.bx;
		}
	},

	Graphic: {
		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();
			this.drawDotCells();

			this.drawCircles();

			this.drawChassis();
			this.drawPekes();
			this.drawTarget();
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeBinary("qnum", 1);
		},
		encodePzpr: function(type) {
			this.encodeBinary("qnum", 1);
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
			this.encodeBorderLineIfPresent();
		}
	},

	AnsCheck: {
		checklist: [
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkZeroTurns",
			"checkOneTurn",
			"doneShadingDecided"
		],

		checkZeroTurns: function() {
			var bd = this.board;
			var stripes = bd.horzStripes.components.concat(bd.vertStripes.components);
			for (var s = 0; s < stripes.length; s++) {
				var stripe = stripes[s];
				if (stripe.circles.length < 2) {
					continue;
				}

				this.failcode.add("curvingNoTurns");
				if (this.checkOnly) {
					return;
				}

				var rect = stripe.circles.getRectSize();
				var path = bd.cellinside(rect.x1, rect.y1, rect.x2, rect.y2);
				path.seterr(1);
			}
		},

		checkOneTurn: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.isShade() || cell.qnum === 1) {
					continue;
				}

				var horz = cell.horzStripe;
				var vert = cell.vertStripe;
				if (horz.circles.length !== 1 || vert.circles.length !== 1) {
					continue;
				}

				this.failcode.add("curvingOneTurn");
				if (this.checkOnly) {
					return;
				}

				var circles = new this.klass.CellList([
					horz.circles[0],
					vert.circles[0]
				]);

				// Erroneous solutions can have a lot of these paths.
				// Highlighting at most one per circle reduces
				// both visual clutter and time complexity.
				var someAlreadyFlagged = circles.some(function(circle) {
					return circle.error === 1;
				});
				if (someAlreadyFlagged) {
					continue;
				}

				for (var dir = 0; dir < 2; dir++) {
					var clist = new this.klass.CellList([cell]);
					clist.add(circles[dir]);
					var rect = clist.getRectSize();
					var path = bd.cellinside(rect.x1, rect.y1, rect.x2, rect.y2);
					path.seterr(1);
				}
			}
		}
	}
});
