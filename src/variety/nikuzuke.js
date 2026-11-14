(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nikuzuke"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "line", "clear"],
			play: ["border", "subline", "info-room"]
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart || this.mousemove) {
				this.inputLine();
			}
			if (this.mouseend && this.notInputted()) {
				this.mouseCell = null;
				this.inputqnum();
			}
		},
		autoplay_func: "border"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Board: {
		hasborder: 1,
		hasdots: 1,
		hascross: 1
	},
	Border: {
		isBorder: function() {
			return this.qans > 0;
		},
		isLine: function() {
			return this.ques > 0;
		},
		setLine: function() {
			this.setQues(1);
		},
		removeLine: function(id) {
			this.setQues(0);
		}
	},

	AreaRoomGraph: {
		enabled: true
	},
	Dot: {
		getDot: function() {
			return this.piece.line;
		},
		setDot: function(val) {
			this.piece.setQues(val);
		}
	},

	// TODO BoardExec flip crosses

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawLines();
			this.drawDiagonalLines();
			this.drawQuesNumbers();

			this.drawBorders();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		},
		drawDiagonalLines: function() {
			var g = this.vinc("linex");
			var clist = this.range.crosses;
			g.lineWidth = this.lw;
			g.strokeStyle = "#aaaaaa";
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i],
					px = cross.bx * this.bw,
					py = cross.by * this.bh;

				g.vid = "x_linea_" + cross.id;
				if (cross.ques & 1) {
					g.beginPath();
					g.moveTo(px - this.bw, py - this.bh);
					g.lineTo(px + this.bw, py + this.bh);
					g.stroke();
				} else {
					g.vhide();
				}

				g.vid = "x_lineb_" + cross.id;
				if (cross.ques & 2) {
					g.beginPath();
					g.moveTo(px - this.bw, py + this.bh);
					g.lineTo(px + this.bw, py - this.bh);
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},
		getLineColor: function(border) {
			return border.isLine() ? "#aaaaaa" : null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			var bd = this.board;
			this.genericDecodeNumber4(bd.cross.length, function(c, val) {
				bd.cross[c].ques = Math.max(0, val);
			});
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			var bd = this.board;
			this.genericEncodeNumber4(bd.cross.length, function(c) {
				var num = bd.cross[c].ques;
				return num > 0 ? num : -1;
			});
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeDotFile();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeDotFile();
			this.encodeBorderAns();
		}
	},
	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		// TODO: build a supergraph
		checklist: [
			"checkNoNumber",
			"checkDoubleNumber",
			"checkNumberAndSize",
			// TODO check for line over given border
			// TODO check for X touching the same region
			"checkBorderDeadend+"
		]
	}
});
