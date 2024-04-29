// MouseInput.js v3.5.2

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
pzpr.classmgr.makeCommon({
	//---------------------------------------------------------
	MouseEvent: {
		initialize: function() {
			this.cursor = this.puzzle.cursor;

			this.enableMouse = true; // マウス入力は有効か

			this.mouseCell = null; // 入力されたセル等のID
			this.firstCell = null; // mousedownされた時のセルのID(連黒分断禁用)

			this.inputPoint = new this.klass.RawAddress(); // 入力イベントが発生したborder座標 ※端数あり
			this.firstPoint = new this.klass.RawAddress(); // mousedownされた時のborder座標 ※端数あり
			this.prevPos = new this.klass.Address(); // 前回のマウス入力イベントのborder座標

			this.btn = ""; // 押されているボタン
			this.inputData = null; // 入力中のデータ番号(実装依存)
			this.firstState = null;

			this.bordermode = false; // 境界線を入力中かどうか

			this.mousestart = false; // mousedown/touchstartイベントかどうか
			this.mousemove = false; // mousemove/touchmoveイベントかどうか
			this.mouseend = false; // mouseup/touchendイベントかどうか

			this.inputMode = "auto";
			this.savedInputMode = { edit: "auto", play: "auto" };

			this.mousereset();
		},

		RBShadeCell: false, // 連黒分断禁のパズル

		use: false, // 黒マスの入力方法選択
		bgcolor: false, // 背景色の入力を可能にする

		inputMode: "auto", // 現在のinputMode
		savedInputMode: {}, // モード変更時の保存値
		inputModes: { edit: [], play: [] }, // 現在のパズル種類にてauto以外で有効なinputModeの配列

		inversion: false, // マウスのボタンを左右反転する

		//---------------------------------------------------------------------------
		// mv.mousereset() マウス入力に関する情報を初期化する
		// mv.modechange() モード変更時に設定を初期化する
		//---------------------------------------------------------------------------
		mousereset: function() {
			var cell0 = this.mouseCell;

			this.mouseCell = this.firstCell = this.board.emptycell; // 下の行へ続く

			this.firstPoint.reset();
			this.prevPos.reset();

			this.btn = "";
			this.inputData = null;

			this.bordermode = false;

			this.mousestart = false;
			this.mousemove = false;
			this.mouseend = false;

			var pc = this;
			[
				["mouseinputAutoEdit", this.autoedit_func],
				["mouseinputAutoPlay", this.autoplay_func]
			].forEach(function(item) {
				if (pc[item[0]] !== pzpr.common.MouseEvent.prototype[item[0]]) {
					return;
				} // パズル個別の関数が定義されている場合はそのまま使用
				pc[item[0]] = pc[item[0] + "_" + item[1]] || pc[item[0]];
			});

			if (this.puzzle.execConfig("dispmove") && !!cell0 && !cell0.isnull) {
				cell0.draw();
			}
		},
		modechange: function() {
			this.mousereset();
			this.inputMode = this.savedInputMode[
				this.puzzle.editmode ? "edit" : "play"
			];
		},

		//---------------------------------------------------------------------------
		// mv.e_mousedown() Canvas上でマウスのボタンを押した際のイベント共通処理
		// mv.e_mouseup()   Canvas上でマウスのボタンを放した際のイベント共通処理
		// mv.e_mousemove() Canvas上でマウスを動かした際のイベント共通処理
		// mv.e_mousecancel() Canvas上でマウス操作がキャンセルされた場合のイベント共通処理
		//---------------------------------------------------------------------------
		//イベントハンドラから呼び出される
		// この3つのマウスイベントはCanvasから呼び出される(mvをbindしている)
		e_mousedown: function(e) {
			if (!this.enableMouse) {
				return true;
			}

			this.setMouseButton(e); /* どのボタンが押されたか取得 (mousedown時のみ) */
			if (!this.btn) {
				this.mousereset();
				return;
			}
			var addrtarget = this.getBoardAddress(e);
			this.moveTo(addrtarget.bx, addrtarget.by);

			e.stopPropagation();
			e.preventDefault();
		},
		e_mouseup: function(e) {
			if (!this.enableMouse || !this.btn) {
				return true;
			}

			this.inputEnd();

			e.stopPropagation();
			e.preventDefault();
		},
		e_mousemove: function(e) {
			if (!this.enableMouse || !this.btn) {
				return true;
			}

			if (
				e.touches !== void 0 ||
				e.which === void 0 ||
				e.which !== 0 ||
				(e.type.match(/pointermove/i) && e.buttons > 0)
			) {
				var addrtarget = this.getBoardAddress(e);
				this.lineTo(addrtarget.bx, addrtarget.by);
			} else {
				this.mousereset();
			}

			e.stopPropagation();
			e.preventDefault();
		},
		e_mousecancel: function(e) {
			this.mousereset();
		},

		//---------------------------------------------------------------------------
		// mv.setMouseButton()  イベントが起こったボタンを設定する
		// mv.getBoardAddress() イベントが起こったcanvas内の座標を取得する
		//---------------------------------------------------------------------------
		setMouseButton: function(e) {
			this.btn = pzpr.util.getMouseButton(e);

			// SHIFTキー/Commandキーを押している時は左右ボタン反転
			var kc = this.puzzle.key;
			kc.checkmodifiers(e);
			if (
				(kc.isSHIFT || kc.isMETA) !== this.inversion ||
				(this.inputMode &&
					this.inputMode.indexOf("-") === this.inputMode.length - 1)
			) {
				if (this.btn === "left") {
					this.btn = "right";
				} else if (this.btn === "right") {
					this.btn = "left";
				}
			}
		},
		getBoardAddress: function(e) {
			var puzzle = this.puzzle,
				pc = puzzle.painter;
			var pix = { px: NaN, py: NaN };
			var g = pc.context;
			if (!g) {
				return pix;
			}
			if (
				!pzpr.env.API.touchevent ||
				pzpr.env.API.pointerevent ||
				pzpr.env.OS.iOS
			) {
				if (!isNaN(e.offsetX)) {
					pix = { px: e.offsetX, py: e.offsetY };
				} else {
					pix = { px: e.layerX, py: e.layerY };
				} // Firefox 39以前, iOSはこちら
			} else {
				var pagePos = pzpr.util.getPagePos(e),
					rect = pzpr.util.getRect(pc.context.child);
				pix = { px: pagePos.px - rect.left, py: pagePos.py - rect.top };
			}
			return { bx: (pix.px - pc.x0) / pc.bw, by: (pix.py - pc.y0) / pc.bh };
		},

		//---------------------------------------------------------------------------
		// mv.moveTo()   Canvas上にマウスの位置を設定する
		// mv.lineTo()   Canvas上でマウスを動かす
		// mv.inputEnd() Canvas上のマウス入力処理を終了する
		// mv.inputPath() Canvas上でひとつながりになる線を入力する
		//---------------------------------------------------------------------------
		moveTo: function(bx, by) {
			this.inputPoint.init(bx, by);
			this.mouseevent(0);
		},
		lineTo: function(bx, by) {
			/* 前回の位置からの差分を順番に入力していきます */
			var dx = bx - this.inputPoint.bx,
				dy = by - this.inputPoint.by;
			var distance =
				(((dx >= 0 ? dx : -dx) + (dy >= 0 ? dy : -dy)) * 2 + 0.9) |
				0; /* 0.5くらいずつ動かす */
			var mx = dx / distance,
				my = dy / distance;
			for (var i = 0; i < distance - 1; i++) {
				this.inputPoint.move(mx, my);
				this.mouseevent(1);
			}
			this.inputPoint.init(bx, by);
			this.mouseevent(1);
		},
		inputEnd: function() {
			this.mouseevent(2);
			this.mousereset();
		},
		inputPath: function() {
			var args = Array.prototype.slice.call(arguments);
			this.mousereset();
			this.btn = typeof args[0] === "string" ? args.shift() : "left";
			this.moveTo(args[0], args[1]);
			for (var i = 2; i < args.length - 1; i += 2) {
				/* 奇数個の最後の一つは切り捨て */
				this.lineTo(args[i], args[i + 1]);
			}
			this.inputEnd();
		},

		//---------------------------------------------------------------------------
		// mv.mouseevent() マウスイベント処理
		//---------------------------------------------------------------------------
		mouseevent: function(step) {
			this.cancelEvent = false;
			this.mousestart = step === 0;
			this.mousemove = step === 1;
			this.mouseend = step === 2;
			var puzzle = this.puzzle;

			puzzle.emit("mouse");
			if (!this.cancelEvent && (this.btn === "left" || this.btn === "right")) {
				if (this.mousestart) {
					puzzle.opemgr.newOperation();
					puzzle.errclear();
					puzzle.opemgr.updateStarts();
				} else {
					puzzle.opemgr.newChain();
				}

				this.mouseinput();
			}
		},

		//---------------------------------------------------------------------------
		// mv.mouseinput()       マウスイベント共通処理。
		// mv.mouseinput_number()数字入力処理
		// mv.mouseinput_clear() セル内容の消去処理
		// mv.mouseinput_auto()  マウスイベント処理。各パズルのファイルでオーバーライドされる。
		// mv.mouseinput_other() inputMode指定時のマウスイベント処理。各パズルのファイルでオーバーライドされる。
		//---------------------------------------------------------------------------
		mouseinput: function() {
			var mode = this.inputMode;
			if (this.puzzle.key.isZ && this.inputMode.indexOf(/info\-/) === -1) {
				var hasUblk = this.inputModes.play.indexOf("info-ublk") >= 0;

				if (this.inputModes.play.indexOf("info-line") >= 0) {
					mode = "info-line";
				} else if (this.inputModes.play.indexOf("info-blk") >= 0) {
					var cell = this.getcell();
					if (hasUblk && cell.isUnshade()) {
						mode = "info-ublk";
					} else {
						mode = "info-blk";
					}
				} else if (hasUblk) {
					mode = "info-ublk";
				} else if (this.inputModes.play.indexOf("info-room") >= 0) {
					mode = "info-room";
				}
			}
			switch (mode) {
				case "auto":
					this.mouseinput_auto();
					break; /* 各パズルのルーチンへ */
				case "number":
				case "number-":
					this.mouseinput_number();
					break;
				case "clear":
					this.mouseinput_clear();
					break;
				case "cell51":
					this.input51_fixed();
					break;
				case "circle-unshade":
					this.inputFixedNumber(1);
					break;
				case "circle-shade":
					this.inputFixedNumber(2);
					break;
				case "undef":
					this.inputFixedNumber(-2);
					break;
				case "ice":
					this.inputIcebarn();
					break;
				case "numexist":
					this.inputFixedNumber(-2);
					break;
				case "numblank":
					this.inputFixedNumber(-3);
					break;
				case "bgcolor":
					this.inputBGcolor();
					break;
				case "subcircle":
				case "bgcolor1":
					this.inputFixedQsub(1);
					break;
				case "subcross":
				case "bgcolor2":
					this.inputFixedQsub(2);
					break;
				case "completion":
					if (this.mousestart) {
						this.inputqcmp();
					}
					break;
				case "objblank":
					this.inputDot();
					break;
				case "direc":
					this.inputdirec();
					break;
				case "arrow":
					this.inputarrow_cell();
					break;
				case "crossdot":
					if (this.mousestart) {
						this.inputcrossMark();
					}
					break;
				case "border":
					this.inputborder();
					break;
				case "subline":
					this.inputQsubLine();
					break;
				case "shade":
				case "unshade":
					this.inputShade();
					break;
				case "line":
					this.inputLine();
					break;
				case "peke":
					this.inputpeke();
					break;
				case "bar":
					this.inputTateyoko();
					break;
				case "empty":
					this.inputempty();
					break;
				case "info-line":
					if (this.mousestart) {
						this.dispInfoLine();
					}
					break;
				case "info-blk":
					if (this.mousestart) {
						this.dispInfoBlk();
					}
					break;
				case "info-ublk":
					if (this.mousestart) {
						this.dispInfoUblk();
					}
					break;
				case "info-room":
					if (this.mousestart) {
						this.dispInfoRoom();
					}
					break;
				default:
					this.mouseinput_other();
					break; /* 各パズルのルーチンへ */
			}
		},
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum();
			}
		},
		mouseinput_clear: function() {
			this.inputclean_cell();
		},
		//オーバーライド用
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				this.mouseinputAutoPlay();
			} else if (this.puzzle.editmode) {
				this.mouseinputAutoEdit();
			}
		},
		mouseinputAutoEdit: function() {},
		mouseinputAutoPlay: function() {},
		autoedit_func: "", // mouseinputAutoEdit
		autoplay_func: "", // mouseinputAutoPlay

		mouseinput_other: function() {},

		//---------------------------------------------------------------------------
		// mv.notInputted()   盤面への入力が行われたかどうか判定する
		//---------------------------------------------------------------------------
		notInputted: function() {
			return !this.puzzle.opemgr.changeflag;
		},

		//---------------------------------------------------------------------------
		// mv.setInputMode()     入力されるinputModeを固定する (falsyな値でresetする)
		// mv.getInputModeList() 有効なinputModeを配列にして返す (通常はauto)
		//---------------------------------------------------------------------------
		setInputMode: function(mode) {
			mode = mode || "auto";
			if (
				this.getInputModeList().indexOf(mode === "number-" ? "number" : mode) >=
				0
			) {
				this.inputMode = mode;
				this.savedInputMode[this.puzzle.editmode ? "edit" : "play"] = mode;
				this.puzzle.redraw();
			} else {
				throw Error("Invalid input mode :" + mode);
			}
		},
		getInputModeList: function(type) {
			if (this.puzzle.instancetype === "viewer") {
				return [];
			}
			type = !!type ? type : this.puzzle.editmode ? "edit" : "play";
			var list = ["auto"];
			list = list.concat(this.inputModes[type]);
			if (list.indexOf("number") >= 0) {
				list.splice(list.indexOf("number") + 1, 0, "number-");
			}
			return list;
		},

		//---------------------------------------------------------------------------
		// mv.setInversion()     マウスの左右反転設定を行う
		//---------------------------------------------------------------------------
		setInversion: function(input) {
			this.inversion = !!input;
		},

		//---------------------------------------------------------------------------
		// mv.getcell()    入力された位置がどのセルに該当するかを返す
		// mv.getcell_excell()  入力された位置がどのセル/EXCELLに該当するかを返す
		// mv.getcross()   入力された位置がどの交差点に該当するかを返す
		// mv.getborder()  入力された位置がどの境界線・Lineに該当するかを返す(クリック用)
		// mv.getpos()    入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
		//                外枠の左上が(0,0)で右下は(bd.cols*2,bd.rows*2)。rcは0～0.5のパラメータ。
		// mv.isBorderMode() 境界線入力モードかどうか判定する
		//---------------------------------------------------------------------------
		getcell: function() {
			return this.getpos(0).getc();
		},
		getcell_excell: function() {
			var pos = this.getpos(0),
				excell = pos.getex();
			return !excell.isnull ? excell : pos.getc();
		},
		getcross: function() {
			return this.getpos(0.5).getx();
		},
		getbank: function() {
			var bank = this.board.bank;
			var r = this.puzzle.painter.bankratio;
			var bx = this.inputPoint.bx / (r * 2);
			var by = (this.inputPoint.by - (this.board.maxby + 1)) / (r * 2);

			if (bx < 0 || by < 0) {
				return null;
			}

			var len = bank.pieces.length;
			var allowAdd =
				this.puzzle.editmode &&
				(typeof this.allowAdd === "function"
					? bank.allowAdd()
					: !!bank.allowAdd);
			for (var p = 0; p < len + (allowAdd ? 1 : 0); p++) {
				var piece = p < len ? bank.pieces[p] : bank.addButton;
				if (
					piece.index !== null &&
					bx >= piece.x - 0.25 &&
					by >= piece.y - 0.25 &&
					bx < piece.x + piece.w + 0.75 &&
					by < piece.y + piece.h + 0.75
				) {
					return piece;
				}
			}
			return null;
		},

		getpos: function(spc) {
			var addr = this.inputPoint,
				m1 = 2 * spc,
				m2 = 2 * (1 - spc),
				minaxis = Math.min(this.board.minbx, this.board.minby);

			// Add a constant to ensure all intermediate values aren't negative
			var extra = 4 + (minaxis >= 0 ? 0 : -minaxis & ~1);

			var bx = addr.bx + extra,
				by = addr.by + extra,
				dx = bx % 2,
				dy = by % 2;
			bx = (bx & ~1) + +(dx >= m1) + +(dx >= m2) - extra;
			by = (by & ~1) + +(dy >= m1) + +(dy >= m2) - extra;
			return new this.klass.Address(bx, by);
		},

		getcrossorcell: function(spc) {
			var adj = this.inputPoint.clone();
			adj.bx += 1;
			var addr = this.getDiagonalAddress(adj, spc, false);
			if (addr) {
				addr.bx -= 1;
				return addr;
			}
			return this.getpos(0.25);
		},

		getborder: function(spc) {
			var addr = this.getDiagonalAddress(this.inputPoint, spc, true);
			return addr ? addr.getb() : this.board.emptyborder;
		},

		getDiagonalAddress: function(addr, spc, isBorder) {
			var bx = (addr.bx & ~1) + 1,
				by = (addr.by & ~1) + 1;
			var dx = addr.bx + 1 - bx,
				dy = addr.by + 1 - by;

			// 真ん中のあたりはどこにも該当しないようにする
			var bd = this.board;
			if (isBorder && bd.linegraph.isLineCross) {
				if (!bd.borderAsLine) {
					var m1 = 2 * spc,
						m2 = 2 * (1 - spc);
					if ((dx < m1 || m2 < dx) && (dy < m1 || m2 < dy)) {
						return null;
					}
				} else {
					var m1 = 2 * (0.5 - spc),
						m2 = 2 * (0.5 + spc);
					if (m1 < dx && dx < m2 && m1 < dy && dy < m2) {
						return null;
					}
				}
			}

			if (dx < 2 - dy) {
				//左上
				if (dx > dy) {
					return new this.klass.Address(bx, by - 1);
				} //左上＆右上 -> 上
				else {
					return new this.klass.Address(bx - 1, by);
				} //左上＆左下 -> 左
			} else {
				//右下
				if (dx > dy) {
					return new this.klass.Address(bx + 1, by);
				} //右下＆右上 -> 右
				else {
					return new this.klass.Address(bx, by + 1);
				} //右下＆左下 -> 下
			}
			// unreachable
		},

		isBorderMode: function() {
			if (this.mousestart) {
				this.bordermode = !this.getpos(0.25).oncell();
			}
			return this.bordermode;
		},

		//---------------------------------------------------------------------------
		// mv.setcursor() TargetCursorの場所を移動する
		// mv.setcursorsnum() TargetCursorの補助記号に対する場所を移動する
		//---------------------------------------------------------------------------
		setcursor: function(pos) {
			var pos0 = this.cursor.getaddr();
			this.cursor.setaddr(pos);
			pos0.draw();
			pos.draw();
		},
		setcursorsnum: function(pos) {
			var pos0 = this.cursor.getaddr();
			this.cursor.setaddr(pos);
			var target;
			var bx = this.inputPoint.bx,
				by = this.inputPoint.by;

			if (this.cursor.disableAnum) {
				bx = bx % 2 | 0;
				by = by % 2 | 0;
				target = [5, 4, 2, 3][by * 2 + bx];
			} else {
				bx = (((bx + 12) % 2) * 1.5) | 0;
				by = (((by + 12) % 2) * 1.5) | 0;
				if (this.pid !== "factors") {
					target = [5, 0, 4, 0, 0, 0, 2, 0, 3][by * 3 + bx];
				} else {
					target = [0, 0, 4, 0, 0, 0, 2, 0, 3][by * 3 + bx];
				}
			}
			if (this.cursor.targetdir !== target) {
				this.cursor.targetdir = target;
			}
			pos0.draw();
			pos.draw();
		}
	}
});
