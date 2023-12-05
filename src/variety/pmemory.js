(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["pmemory"], {
	MouseEvent: {
		inputModes: {
			edit: ["border", "shade", "circle-unshade", "clear", "info-line"],
			play: ["line", "peke", "clear", "info-line"]
		},

		inputShade: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.ice() ? 0 : 6;
			}

			var clist = cell.room.clist;
			for (var i = 0; i < clist.length; i++) {
				clist[i].setQues(this.inputData);
			}
			clist.draw();
			this.mouseCell = cell;
		},
		autoplay_func: "line"
	},

	Board: {
		hasborder: 1
	},

	AreaRoomGraph: {
		enabled: true
	},
	LineGraph: {
		enabled: true
	},

	Graphic: {
		bgcellcolor_func: "icebarn",
		icecolor: "rgb(204,204,204)",
		irowake: true,

		paint: function() {
			this.drawBGCells();

			this.drawGrid();
			this.drawPekes();
			this.drawLines();

			this.drawCircles();

			this.drawBorders();

			this.drawChassis();
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decode1Cell(1);

			this.board.roommgr.rebuild();
			var rooms = this.board.roommgr.components;
			this.genericDecodeBinary(rooms.length, function(r, newval) {
				if (newval) {
					rooms[r].clist.each(function(cell) {
						cell.ques = 6;
					});
				}
			});
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encode1Cell(1);

			this.board.roommgr.rebuild();
			var rooms = this.board.roommgr.components;
			this.genericEncodeBinary(rooms.length, function(r) {
				return rooms[r].clist[0].ice();
			});
		}
	},
	FileIO: {
		decodeData: function() {},
		encodeData: function() {}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkCircleEndpoint",
			"checkShadedRegions",
			"checkOneLoop"
		],

		checkCircleEndpoint: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 1 && cell.lcnt !== 1;
			}, "shEndpoint");
		},
		checkShadedRegions: function() {
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var room = rooms[id];
				if (!room.clist[0].ice()) {
					continue;
				}

				if (
					room.clist.some(function(cell) {
						return cell.lcnt > 0;
					})
				) {
					continue;
				}

				this.failcode.add("bkNoLine");
				if (this.checkOnly) {
					break;
				}
				room.clist.seterr(1);
			}
		}
	}
});
