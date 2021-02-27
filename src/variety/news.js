//
// NEWS and New NEWS puzzles
//
// Setup: grid divided into rooms.
// Goal: Put two letters (N, E, W, or S) into each room such that
//       1) each N is North of the other letter in its room,
//          each E is East  of the other letter in its room,
//          each W is West  of the other letter in its room, and
//          each S is South of the other letter in its room.
//       2) No letter appears twice in any row or column.
//
// For New NEWS, additionally it must be the case that all squares _without_
// letters are connected.
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["news", "newnews"], {
	//---------------------------------------------------------
	// Mouse input
	MouseEvent: {
		inputModes: {
			edit: ["border", "news", "clear"],
			play: ["news", "clear"]
		},
		mouseinput: function() {
			this.common.mouseinput.call(this);
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputarrow_cell();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputarrow_cell();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		}
	},

	//---------------------------------------------------------
	// Keyboard input
	KeyEvent: {
		enablemake: true,
		enableplay: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			this.key_news(ca);
		},
		key_news: function(ca) {
			if (ca === "1" || ca === "shift+up" || ca === "n") {
				ca = "1";
			} else if (ca === "2" || ca === "shift+right" || ca === "e") {
				ca = "4";
			} else if (ca === "3" || ca === "shift+down" || ca === "s") {
				ca = "2";
			} else if (ca === "4" || ca === "shift+left" || ca === "w") {
				ca = "3";
			} else if (ca === "5" || ca === " ") {
				ca = " ";
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// Board and graphs
	Cell: {
		numberAsObject: true,

		maxnum: 4,
		/* Whether this cell contains a number, including question marks. */
		hasNum: function() {
			var num = this.getNum();
			return num !== -1 && num !== 0;
		},
		isUnshade: function() {
			return this.isnull || !this.hasNum();
		},
		isShade: function() {
			return !this.isnull && this.hasNum();
		}
	},
	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustCellArrow(key, d);
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	"AreaUnshadeGraph@newnews": {
		relation: { "cell.qnum": "node", "cell.anum": "node" },
		enabled: true
	},
	//---------------------------------------------------------
	// Display
	Graphic: {
		gridcolor_type: "DLIGHT",

		errbcolor2: "rgb(255, 224, 192)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawDotCells();
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawCursor();
		},

		getNumberText: function(cell, num) {
			switch (num) {
				case -2:
					return "?";
				case -1:
					return "";
				case 1:
					return "N";
				case 2:
					return "S";
				case 3:
					return "W";
				case 4:
					return "E";
				default:
					return "" + num;
			}
		},

		getBGCellColor: function(cell) {
			if (cell.error === 1) {
				return this.errbcolor1;
			} else if (cell.error === 2) {
				return this.errbcolor2;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URL encoding/decoding
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber10();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// Answer check
	AnsCheck: {
		checklist: [
			// Monotonic
			"checkConnectUnshadeRB@newnews",
			"checkDifferentNumberInLine",
			"checkTooManyLettersInRoom",
			"checkLetters",
			// Non-monotonic
			"checkTooFewLettersInRoom"
		],

		checkTooManyLettersInRoom: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.hasNum();
				},
				function(w, h, a, n) {
					return a <= 2;
				},
				"letterGt2"
			);
		},
		checkLetters: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist;
				clist = clist.filter(function(c) {
					return c.hasNum();
				});
				if (clist.length !== 2) {
					continue;
				}
				var cell1 = clist[0];
				var cell2 = clist[1];
				this.checkCorrectRelationship(cell1, cell2);
				this.checkCorrectRelationship(cell2, cell1);
			}
		},
		/* Checks that `cell` is correctly placed relative to `other`. */
		checkCorrectRelationship: function(cell, other) {
			var cell_num = cell.getNum();
			var relationship_broken = false;
			// Question mark
			if (cell_num === -2) {
				return;
			}
			// North
			if (cell_num === 1 && cell.by >= other.by) {
				this.failcode.add("nIsNotNorth");
				relationship_broken = true;
			}
			// South
			if (cell_num === 2 && cell.by <= other.by) {
				this.failcode.add("sIsNotSouth");
				relationship_broken = true;
			}
			// West
			if (cell_num === 3 && cell.bx >= other.bx) {
				this.failcode.add("wIsNotWest");
				relationship_broken = true;
			}
			// East
			if (cell_num === 4 && cell.bx <= other.bx) {
				this.failcode.add("eIsNotEast");
				relationship_broken = true;
			}
			if (relationship_broken) {
				cell.seterr(1);
				other.seterr(2);
			}
		},
		checkTooFewLettersInRoom: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.hasNum();
				},
				function(w, h, a, n) {
					return a >= 2;
				},
				"letterLt2"
			);
		}
	},

	FailCode: {
		nmDupRow: [
			"(Please translate) A letter appears twice in the same row or column.",
			"A letter appears twice in the same row or column."
		],
		letterGt2: [
			"(Please translate) A room contains too many letters.",
			"A region contains too many letters."
		],
		letterLt2: [
			"(Please translate) A room contains too few letters.",
			"A region contains too few letters."
		],
		nIsNotNorth: [
			"(Please translate) Cell marked N is not north of the other letter in its room.",
			"Cell marked N is not north of the other letter in its room."
		],
		eIsNotEast: [
			"(Please translate) Cell marked E is not east of the other letter in its room.",
			"Cell marked E is not east of the other letter in its room."
		],
		wIsNotWest: [
			"(Please translate) Cell marked W is not west of the other letter in its room.",
			"Cell marked W is not west of the other letter in its room."
		],
		sIsNotSouth: [
			"(Please translate) Cell marked S is not south of the other letter in its room.",
			"Cell marked S is not south of the other letter in its room."
		]
	}
});
