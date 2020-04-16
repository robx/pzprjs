//
// Tapa-Like Loop / tapaloop.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tapaloop"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: [],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			}
			else if (this.puzzle.editmode && this.mousestart) {
				this.setcursor(this.getcell());
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
		KeyEvent: {
			enablemake: true,

			keyinput: function(ca) {
				this.key_inputqnum_tapaloop(ca);
			},
			key_inputqnum_tapaloop: function(ca) {
				var cell = this.cursor.getc(),
					nums = cell.qnums,
					val = [];

				if (("0" <= ca && ca <= "8") || ca === "-") {
					var num = ca !== "-" ? +ca : -2;
					if (this.prev === cell && nums.length <= 3) {
						for (var i = 0; i < nums.length; i++) {
							val.push(nums[i]);
						}
					}
					val.push(num);
					if (val.length > 1) {
						var sum = 0;
						for (var i = 0; i < val.length; i++) {
							sum += val[i] >= 0 ? val[i] : 1;
						}
						if (sum > 8) {
							val = [num];
						} else {
							for (var i = 0; i < val.length; i++) {
								if (val[i] === 0) {
									val = [num];
									break;
								}
							}
						}
					}
				} else if (ca === "BS") {
					if (nums.length > 1) {
						for (var i = 0; i < nums.length - 1; i++) {
							val.push(nums[i]);
						}
					}
				} else if (ca === " ") {
					val = [];
				} else {
					return;
				}

				cell.qnums = val;

				this.prev = cell;
				cell.draw();
			}
		},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		qnums: [],
		noLP: function(dir) {
			return (this.qnums.length === 0 ? false : true);
		}
	},
	Border: {
		enableLineNG: true
	},
	Board: {
		hasborder: 1
	},
	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		gridcolor_type: "SLIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawTapaNumbers();

			this.drawPekes();
			this.drawLines();

			this.drawChassis();

			this.drawTarget();
		},

			drawTapaNumbers: function() {
				var g = this.vinc("cell_tapanum", "auto");
				var bw = this.bw,
					bh = this.bh;
				var opts = [
					{ option: {}, pos: [{ x: 0, y: 0 }] },
					{
						option: { ratio: 0.56 },
						pos: [
							{ x: -0.4, y: -0.4 },
							{ x: 0.4, y: 0.4 }
						]
					},
					{
						option: { ratio: 0.48 },
						pos: [
							{ x: -0.5, y: -0.4 },
							{ x: 0.5, y: -0.4 },
							{ x: 0, y: 0.4 }
						]
					},
					{
						option: { ratio: 0.4 },
						pos: [
							{ x: 0, y: -0.5 },
							{ x: -0.55, y: 0 },
							{ x: 0.55, y: 0 },
							{ x: 0, y: 0.5 }
						]
					}
				];

				var clist = this.range.cells;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						bx = cell.bx,
						by = cell.by;
					var nums = cell.qnums,
						n = nums.length;

					g.fillStyle = this.getQuesNumberColor(cell);
					for (var k = 0; k < 4; k++) {
						g.vid = "cell_text_" + cell.id + "_" + k;
						if (k < n && nums[k] !== -1) {
							var opt = opts[n - 1],
								px = (bx + opt.pos[k].x) * bw,
								py = (by + opt.pos[k].y) * bh;
							var text = nums[k] >= 0 ? "" + nums[k] : "?";
							this.disptext(text, px, py, opt.option);
						} else {
							g.vhide();
						}
					}
				}
			}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
		},
		encodePzpr: function(type) {
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
		},
		encodeData: function() {
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
		]
	},

	FailCode: {
	}
});
