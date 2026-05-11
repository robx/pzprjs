(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["longest"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: [],
			play: ["border", "subline"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputQsubLine();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				}
			}
		}
	},

	Border: {
		enableLineNG: true,

		isLineNG: function() {
			return this.ques === 1;
		},

		rebuildRooms: function() {
			var room1 = this.sidecell[0].room,
				room2 = this.sidecell[1].room;
			if (room1) {
				this.board.roommgr.setExtraData(room1);
			}
			if (room2 && room1 !== room2) {
				this.board.roommgr.setExtraData(room2);
			}
		},

		posthook: {
			ques: function() {
				this.rebuildRooms();
			},
			qans: function() {
				this.rebuildRooms();
			}
		}
	},
	Board: {
		cols: 5,
		rows: 5,

		hasborder: 2
	},
	AreaRoomGraph: {
		enabled: true,
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.closed = true;

			var rect = component.clist.getRectSize();

			var long = 0;
			component.longest = new Set();

			var current = new this.klass.BorderList();

			for (var dir = 0; dir <= 1; dir++) {
				var mina = dir ? rect.x1 : rect.y1,
					minb = dir ? rect.y1 : rect.x1,
					maxa = dir ? rect.x2 : rect.y2,
					maxb = dir ? rect.y2 : rect.x2;

				for (var a = mina - 1; a <= maxa + 1; a += 2) {
					for (var b = minb; b <= maxb + 2; b += 2) {
						var border = dir ? this.board.getb(a, b) : this.board.getb(b, a);
						var relevant =
							!border.isnull &&
							(border.sidecell[0].room === component ||
								border.sidecell[1].room === component);

						if (border.isBorder() && relevant) {
							current.add(border);
						} else if (current.length > 0) {
							if (current.length > long) {
								component.longest.clear();
								long = current.length;
							}
							if (current.length === long) {
								current.each(function(c) {
									component.longest.add(c);
								});
							}

							current = new this.klass.BorderList();
						}

						if (relevant && component.closed) {
							if (!border.isBorder() && !border.inside) {
								component.closed = false;
							} else if (border.isBorder() && border.inside) {
								for (var i = 0; i < 2; i++) {
									var cross = border.sidecross[i];
									if (
										cross.lcnt === 1 &&
										cross.bx !== this.board.minbx &&
										cross.by !== this.board.minby &&
										cross.bx !== this.board.maxbx &&
										cross.by !== this.board.maxby
									) {
										component.closed = false;
									}
								}
							}
						}
					}
				}
			}
		}
	},

	Graphic: {
		gridcolor_type: "LIGHT",
		margin: 0.5,
		errcolor1: "rgb(255, 80, 80)",
		errcolor2: "rgb(192, 0, 0)",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid(false);

			this.addlw = 0;
			this.drawQansBorders();
			this.addlw = 2;
			this.drawQuesBorders();

			this.drawLines();

			this.drawBaseMarks();

			this.drawBorderQsubs();
		},
		getBorderColor_ques: function(border) {
			if (border.isLineNG()) {
				return border.error === 1 ? this.errcolor2 : "black";
			}

			return null;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeOuterBorder();
		},
		encodePzpr: function(type) {
			this.encodeOuterBorder();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeBorder(function(border, ca) {
				if (ca === "2") {
					border.ques = 0;
					border.qans = 1;
				} else if (ca === "-1") {
					border.ques = 0;
					border.qsub = 1;
				} else if (ca === "1") {
					border.ques = 1;
				} else {
					border.ques = 0;
				}
			});
		},
		encodeData: function() {
			this.encodeBorder(function(border) {
				if (border.qans === 1) {
					return "2 ";
				} else if (border.ques === 1) {
					return "1 ";
				} else if (border.qsub === 1) {
					return "-1 ";
				} else {
					return "0 ";
				}
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkLongestIsAnswer",
			"checkLongestUnused+",
			"checkOutsideBorder+",
			"checkBorderDeadend"
		],

		checkLongestIsAnswer: function() {
			var result = true;
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var current = true;
				if (!room.closed) {
					continue;
				}

				var longest = Array.from(room.longest);
				for (var i = 0; i < longest.length; i++) {
					if (longest[i].qans === 1) {
						current = false;
						longest[i].seterr(1);
					}
					if (!current && this.checkOnly) {
						break;
					}
				}

				if (!current) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
			if (!result) {
				this.failcode.add("bdNotGiven");
				this.board.border.setnoerr();
			}
		},

		checkLongestUnused: function() {
			var result = true,
				borders = this.board.border;
			for (var id = 0; id < borders.length; id++) {
				var border = borders[id];
				if (!border.ques) {
					continue;
				}
				var room1 = border.sidecell[0].room,
					room2 = border.sidecell[1].room;
				if (room1 && (!room1.closed || room1.longest.has(border))) {
					continue;
				}
				if (
					room2 &&
					room1 !== room2 &&
					(!room2.closed || room2.longest.has(border))
				) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				border.seterr(1);
			}
			if (!result) {
				this.failcode.add("bdGivenUnused");
				borders.setnoerr();
			}
		},

		checkOutsideBorder: function() {
			var borders = this.board.border;
			for (var id = 0; id < borders.length; id++) {
				var border = borders[id];
				if (border.inside || border.isBorder()) {
					continue;
				}

				this.failcode.add("bkNotClosed");
				if (this.checkOnly) {
					break;
				}
				new this.klass.CellList(border.sidecell).seterr(1);
			}
		},

		checkBorderDeadend: function() {
			var result = true,
				bd = this.board;
			var crosses = bd.crossinside(
				bd.minbx + 2,
				bd.minby + 2,
				bd.maxbx - 2,
				bd.maxby - 2
			);
			for (var c = 0; c < crosses.length; c++) {
				var cross = crosses[c];
				if (cross.lcnt !== 1) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				cross.setCrossBorderError();
			}
			if (!result) {
				this.failcode.add("bdDeadEnd");
				bd.border.setnoerr();
			}
		}
	}
});
