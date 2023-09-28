// Graphic.js v3.4.1

(function() {
	var CENTER = 1,
		BOTTOMLEFT = 2,
		BOTTOMRIGHT = 3,
		TOPRIGHT = 4,
		TOPLEFT = 5,
		UP = 6,
		DN = 7,
		LT = 8,
		RT = 9;

	//---------------------------------------------------------------------------
	// ★Graphicクラス Canvasに描画する
	//---------------------------------------------------------------------------
	// パズル共通 Canvas/DOM制御部
	// Graphicクラスの定義
	pzpr.classmgr.makeCommon({
		//---------------------------------------------------------
		Graphic: {
			initialize: function() {
				this.gridcolor =
					this.gridcolor_list[this.gridcolor_type] || this.gridcolor;

				var pc = this;
				[
					["getQuesCellColor", this.fgcellcolor_func],
					["getBGCellColor", this.bgcellcolor_func],
					["getBorderColor", this.bordercolor_func],
					["getQuesNumberColor", this.numbercolor_func],
					["getCircleFillColor", this.circlefillcolor_func],
					["getCircleStrokeColor", this.circlestrokecolor_func]
				].forEach(function(item) {
					if (pc[item[0]] !== pzpr.common.Graphic.prototype[item[0]]) {
						return;
					} // パズル個別の関数が定義されている場合はそのまま使用
					pc[item[0]] = pc[item[0] + "_" + item[1]] || pc[item[0]];
				});

				this.resetRange();

				this.initFont();
			},

			context: null,
			subcontext: null,

			fgcellcolor_func: "ques", // getQuesCellColor()の種類
			bgcellcolor_func: "error1", // getBGCellColor()の種類
			bordercolor_func: "ques", // getBorderColor()の種類
			numbercolor_func: "mixed", // getQuesNumberColor()の種類

			circlefillcolor_func: "qnum", // getCircleFillColor()の種類
			circlestrokecolor_func: "qnum", // getCircleStrokeColor()の種類

			// 標準の色設定
			quescolor: "black",
			qanscolor: "rgb(0, 160, 0)",
			qcmpcolor: "silver",
			qcmpbgcolor: "rgb(224, 224, 255)",
			trialcolor: "rgb(160, 160, 160)",
			subcolor: "rgb(127, 127, 255)",
			subshadecolor: "rgb(220, 220, 255)",

			// 黒マスの色
			shadecolor: "black",
			errcolor1: "rgb(192, 0, 0)",
			errcolor2: "rgb(32, 32, 255)",
			fontShadecolor: "rgb(224, 224, 224)",

			// 白マス確定マスの背景色
			enablebcolor: false,
			bcolor: "rgb(160, 255, 160)",
			errbcolor1: "rgb(255, 160, 160)",
			errbcolor2: "rgb(64, 255, 64)",

			qsubcolor1: "rgb(160,255,160)",
			qsubcolor2: "rgb(255,255,127)",
			qsubcolor3: "rgb(192,192,192)", // 絵が出るパズルの背景入力

			icecolor: "rgb(192, 224, 255)",
			erricecolor: "rgb(224,  96, 160)",

			// セルの丸数字内部の背景色
			circlebasecolor: "white",

			// セルの○×の色(補助記号)
			mbcolor: "rgb(0, 160, 0)",

			// 線・×の色
			linecolor: "rgb(0, 160, 0)", // 色分けなしの場合
			errlinecolor: "rgb(255, 0, 0)",
			noerrcolor: "rgb(160, 160, 160)", // エラー表示時, エラーでない線/境界線の描画色
			linetrialcolor: "rgb(160, 160, 160)",

			movelinecolor: "silver",
			movetrialcolor: "rgb(255, 160, 0)",

			pekecolor: "rgb(0, 127, 0)",

			// 境界線と黒マスを分ける色(BoxBorder)
			bbcolor: "rgb(160, 160, 160)",

			// 入力ターゲットの色
			targetColorEdit: "rgb(255, 64,  64)",
			targetColorPlay: "rgb(64,  64, 255)",
			targetColorTrial: "rgb(255,  64, 255)",
			ttcolor: "rgb(127,255,127)", // ques=51の入力ターゲット(TargetTriangle)
			ttshadecolor: "rgb(0,127,0)",

			movecolor: "red",

			// 盤面のCellを分ける色
			gridcolor: "black",
			gridcolor_type: "",
			gridcolor_list: {
				// 色々なパズルで定義してた固定色
				DARK: "rgb( 48,  48,  48)" /* LITSでの指定 */,
				LIGHT: "rgb(127, 127, 127)" /* ほとんどはこの色を指定している */,
				DLIGHT: "rgb(160, 160, 160)" /* 領域分割系で使ってることが多い */,
				SLIGHT: "rgb(191, 191, 191)" /* 部屋＋線を引くパズル           */,
				THIN: "rgb(224, 224, 224)" /* 問題入力時のみGrid表示のパズル */
			},

			// 盤面(枠の中)の背景色
			bgcolor: "white",

			// その他サイズ指定
			textoption: null,
			fontsizeratio: 0.8, // Fontサイズのcellsizeとの比率
			fontwidth: [0.5, 0.4, 0.33], // 2文字以上のTextの横幅 (2文字〜の文字単位横幅を指定する)
			fontfamily: "",
			isSupportMaxWidth: true, // maxWidthサポートブラウザ
			crosssize: 0.4,
			circleratio: [0.4, 0.35],

			// 枠外の一辺のmargin(セル数換算)
			margin: 0.15,
			bankratio: 0.5,

			// canvasの大きさを保持する
			canvasWidth: null,
			canvasHeight: null,

			// canvas内での盤面の左上座標
			x0: 0,
			y0: 0,

			// 描画単位(デフォルト値)
			cw: 36, // セルの横幅
			ch: 36, // セルの縦幅
			bw: 18, // セルの横幅/2
			bh: 18, // セルの縦幅/2

			devicePixelRatio: 1,
			gw: 1, // grid width
			lw: 1, // LineWidth 境界線・Lineの太さ
			lwmin: 3,
			lm: 1, // LineMargin
			lwratio: 10, // onresize_processでlwの値の算出に用いる
			addlw: 0, // エラー時に線の太さを広げる

			// getNewColorの設定
			lastHdeg: 0,
			lastYdeg: 0,
			minYdeg: 0.18,
			maxYdeg: 0.7,

			// その他の描画設定
			range: null, // 描画領域を保持するオブジェクト

			useBuffer: false, // Buffer描画を行うか
			outputImage: false, // 画像保存中
			showBank: true,

			// resize関数が呼ばれたが、初期化されていない等でresizeしていないことを示すフラグ
			pendingResize: false,

			// 初期化前、およびsuspend呼び出し中を示すフラグ
			suspended: true,
			suspendedAll: true,

			// Cellのqnumが-2のときに？を表示しないパズルごとの設定
			hideHatena: false,

			// 正解条件を満たしたオブジェクトを描画するかどうかの設定
			autocmp: "",

			// 色分け設定
			irowake: false,
			irowakeblk: false,

			//---------------------------------------------------------------------------
			// pc.initCanvas()       このオブジェクトで使用するキャンバスを設定する
			//---------------------------------------------------------------------------
			initCanvas: function() {
				var puzzle = this.puzzle;
				var g = (this.context = !!puzzle.canvas
					? puzzle.canvas.getContext("2d")
					: null);
				if (g.use.canvas) {
					this.subcontext = !!puzzle.subcanvas
						? puzzle.subcanvas.getContext("2d")
						: null;
					this.useBuffer = !!this.subcontext;
				}

				if (this.canvasWidth === null || this.canvasHeight === null) {
					var rect = pzpr.util.getRect(puzzle.canvas);
					this.resizeCanvas(rect.width, rect.height);
				}

				this.pendingResize = true;
				this.resize_canvas_main();
				puzzle.emit("canvasReady");

				this.unsuspend();
			},

			//---------------------------------------------------------------------------
			// pc.initFont()  数字を記入するためのフォントを設定する
			//---------------------------------------------------------------------------
			initFont: function() {
				var isgothic = this.puzzle.getConfig("font") === 1;
				if (this.puzzle.pzpr.env.OS.Android) {
					this.fontfamily = isgothic
						? "Helvetica, Verdana, Arial, "
						: '"Times New Roman", ';
				} else {
					this.fontfamily = "";
				}
				this.fontfamily += isgothic ? "sans-serif" : "serif";
			},

			//---------------------------------------------------------------------------
			// pc.resizeCanvas()    キャンバスのサイズを設定する
			//                      (指定なしの場合は、前のキャンバスのサイズを用いる)
			// pc.resizeCanvasByCellSize() セルのサイズを指定してキャンバスのサイズを変える
			//                             (指定なしの場合は、前のセルのサイズを用いる)
			//---------------------------------------------------------------------------
			cellexpandratio: 1.0,

			resizeCanvas: function(cwid, chgt) {
				var insuspend = this.suspended;
				this.suspendAll();

				this.canvasWidth = cwid || this.canvasWidth;
				this.canvasHeight = chgt || this.canvasHeight;

				this.pendingResize = true;
				if (!insuspend) {
					this.unsuspend();
				}
			},
			resizeCanvasByCellSize: function(cellsize, absolute) {
				var insuspend = this.suspended;
				this.suspendAll();

				if (cellsize) {
					this.cw = cellsize * (absolute ? 1 : this.cellexpandratio);
					this.ch = cellsize * (absolute ? 1 : this.cellexpandratio);
				}
				this.canvasWidth = this.cw * this.getCanvasCols();
				this.canvasHeight = this.ch * this.getCanvasRows();

				this.pendingResize = true;
				if (!insuspend) {
					this.unsuspend();
				}
			},

			//---------------------------------------------------------------------------
			// pc.resize_canvas_main() ウィンドウのLoad/Resize時の処理。
			//                         Canvas/表示するマス目の大きさを設定する。
			// pc.setParameter()       cw, ch等の変数を大きさに応じて再設定する
			// pc.setOffset()          盤面のサイズや大きさを再設定する
			// pc.setPagePos()         盤面のページ内座標を設定する
			// pc.clearObject()        contextのclearなどを呼び出す関数
			//---------------------------------------------------------------------------
			resize_canvas_main: function() {
				if (!this.pendingResize) {
					return;
				}
				this.pendingResize = false;

				// セルのサイズなどを取得・設定
				this.setParameter();

				// Canvasのサイズ、オフセット位置の変更
				this.setOffset();

				// Listener呼び出し
				this.puzzle.emit("resize");

				// contextのclear等を呼び出す
				this.clearObject();
			},

			setParameter: function() {
				var cwid = this.canvasWidth,
					chgt = this.canvasHeight;
				var cols = this.getCanvasCols(),
					rows = this.getCanvasRows();
				var cw = (cwid / cols) | 0,
					ch = (chgt / rows) | 0;

				this.devicePixelRatio = this.puzzle.pzpr.env.browser
					? window.devicePixelRatio || 1
					: 1;

				if (this.puzzle.getConfig("squarecell")) {
					this.cw = this.ch = Math.min(cw, ch);
				} else {
					this.cw = cw;
					this.ch = ch;
				}

				this.bw = this.cw / 2;
				this.bh = this.ch / 2;

				var gwmax = 1,
					gwratio = 40;
				var gw = Math.min(this.cw / gwratio, gwmax);
				var pxSize = 1 / this.devicePixelRatio;
				var gwdev = Math.max(1, Math.round(gw / pxSize));
				this.gw = gwdev * pxSize;

				var lw = Math.max(this.cw / this.lwratio, this.lwmin);
				var lwdev = Math.max(1, Math.round(lw / pxSize));
				this.lw = lwdev * pxSize;
				this.lm = this.lw / 2;
			},
			setOffset: function() {
				var g = this.context,
					g2 = this.subcontext;
				var cwid = this.canvasWidth,
					chgt = this.canvasHeight;

				// canvas要素のサイズを変更する
				g.changeSize(cwid | 0, chgt | 0);
				if (!!g2) {
					g2.changeSize(cwid | 0, chgt | 0);
				}

				// 盤面のセルID:0が描画される左上の位置の設定 (Canvas左上からのオフセット)
				var x0 = (this.x0 =
					(((cwid - this.cw * this.getBoardCols()) / 2 +
						this.cw * this.getOffsetCols()) |
						0) +
					0.5);
				var y0 = (this.y0 =
					(((chgt - this.ch * this.getBoardRows()) / 2 +
						this.ch * this.getOffsetRows()) |
						0) +
					0.5);

				// CanvasのOffset位置変更 (SVGの時、小数点以下の端数調整を行う)
				if (!g.use.canvas) {
					var rect = pzpr.util.getRect(g.canvas);
					g.translate(x0 - (rect.left % 1), y0 - (rect.top % 1));
				} else {
					g.translate(x0, y0);
					if (!!g2) {
						g2.translate(x0, y0);
					}
				}
			},
			clearObject: function() {
				this.context.clear();
			},

			//---------------------------------------------------------------------------
			// pc.getCanvasCols()  Canvasの横幅としてセル何個分が必要か返す
			// pc.getCanvasRows()  Canvasの縦幅としてセル何個分が必要か返す
			// pc.getBoardCols()   マージンを除いた盤面の横幅としてセル何個分が必要か返す
			// pc.getBoardRows()   マージンを除いた盤面の縦幅としてセル何個分が必要か返す
			// pc.getOffsetCols()  有効範囲が(0,0)-(C,R)からずれているパズルで、左右の中心位置を調整する
			// pc.getOffsetRows()  有効範囲が(0,0)-(C,R)からずれているパズルで、上下の中心位置を調整する
			//---------------------------------------------------------------------------
			getCanvasCols: function() {
				return this.getBoardCols() + 2 * this.margin;
			},
			getCanvasRows: function() {
				var rows = this.getBoardRows() + 2 * this.margin;
				if (this.board.bank && this.showBank) {
					rows += this.board.bank.height * this.bankratio + 1 / 16;
				}
				return rows;
			},

			getBoardCols: function() {
				var bd = this.board;
				return (bd.maxbx - bd.minbx) / 2;
			},
			getBoardRows: function() {
				var bd = this.board;
				return (bd.maxby - bd.minby) / 2;
			},

			getOffsetCols: function() {
				/* 右にずらしたい分プラス、左にずらしたい分マイナス */
				return (0 - this.board.minbx) / 2;
			},
			getOffsetRows: function() {
				/* 下にずらしたい分プラス、上にずらしたい分マイナス */
				var rows = (0 - this.board.minby) / 2;
				if (this.board.bank && this.showBank) {
					rows -= (this.board.bank.height * this.bankratio) / 2;
				}
				return rows;
			},

			//---------------------------------------------------------------------------
			// pc.suspend()     描画処理を一時停止する
			// pc.suspendAll()  全盤面の描画処理を一時停止する
			// pc.unsuspend()   描画処理を再開する
			//---------------------------------------------------------------------------
			suspend: function() {
				this.suspended = true;
			},
			suspendAll: function() {
				this.suspendedAll = true;
				this.suspended = true;
			},
			unsuspend: function() {
				if (!this.context) {
					return;
				}

				this.resize_canvas_main();

				if (this.suspendedAll) {
					var bd = this.board;
					this.range.bank = true;
					this.setRange(bd.minbx - 2, bd.minby - 2, bd.maxbx + 2, bd.maxby + 2);
					this.suspendedAll = false;
				}
				if (this.suspended) {
					this.suspended = false;
					this.prepaint();
				}
			},

			//---------------------------------------------------------------------------
			// pc.prepaint()    paint関数を呼び出す
			// pc.paint()       座標(x1,y1)-(x2,y2)を再描画する。各パズルのファイルでオーバーライドされる。
			//
			// pc.setRange()       rangeオブジェクトを設定する
			// pc.setRangeObject() 描画対象となるオブジェクトを取得する
			// pc.resetRange()     rangeオブジェクトを初期化する
			//---------------------------------------------------------------------------
			prepaint: function() {
				if (this.suspended || !this.context) {
					return;
				}

				this.isSupportMaxWidth =
					(this.context.use.svg && pzpr.env.API.svgTextLength) ||
					(this.context.use.canvas && pzpr.env.API.maxWidth);

				var bd = this.board,
					bm = 2 * this.margin,
					x1 = this.range.x1,
					y1 = this.range.y1,
					x2 = this.range.x2,
					y2 = this.range.y2,
					bank =
						this.showBank &&
						(this.range.bank || this.range.bankPieces.length > 0);
				if (
					!bank &&
					(x1 > x2 ||
						y1 > y2 ||
						x1 >= bd.maxbx + bm ||
						y1 >= bd.maxby + bm ||
						x2 <= bd.minbx - bm ||
						y2 <= bd.minby - (bm + (this.pid === "starbattle" ? 2 : 0)))
				) {
					/* 入力が範囲外ならば何もしない */
				} else if (!this.useBuffer) {
					this.setRangeObject(x1, y1, x2, y2);
					this.flushCanvas();
					this.paintMain();
				} else {
					var g = this.context,
						g2 = this.subcontext;
					this.context = g2;
					this.setRangeObject(x1 - 1, y1 - 1, x2 + 1, y2 + 1);
					this.flushCanvas();
					this.paintMain();
					this.context = g;
					this.copyBufferData(g, g2, x1, y1, x2, y2);
				}

				this.resetRange();
			},
			paintMain: function() {
				this.paint();
				this.paintPost();
			},
			paint: function() {}, //オーバーライド用
			paintPost: function() {},

			setRange: function(x1, y1, x2, y2) {
				if (this.range.x1 > x1) {
					this.range.x1 = x1;
				}
				if (this.range.y1 > y1) {
					this.range.y1 = y1;
				}
				if (this.range.x2 < x2) {
					this.range.x2 = x2;
				}
				if (this.range.y2 < y2) {
					this.range.y2 = y2;
				}
			},
			setRangeObject: function(x1, y1, x2, y2) {
				var bd = this.board;
				this.range.cells = bd.cellinside(x1, y1, x2, y2);
				this.range.crosses = bd.crossinside(x1, y1, x2, y2);
				this.range.borders = bd.borderinside(x1, y1, x2, y2);
				this.range.excells = bd.excellinside(x1, y1, x2, y2);
			},
			resetRange: function() {
				var puzzle = this.puzzle,
					bd = puzzle.board,
					classes = puzzle.klass;
				this.range = {
					x1: bd.maxbx + 1,
					y1: bd.maxby + 1,
					x2: bd.minbx - 1,
					y2: bd.minby - 1,
					cells: new classes.CellList(),
					crosses: new classes.CrossList(),
					borders: new classes.BorderList(),
					excells: new classes.ExCellList(),
					bank: false,
					bankPieces: []
				};
			},

			//---------------------------------------------------------------------------
			// pc.copyBufferData()    Bufferに描画したデータを盤面へコピーする
			//---------------------------------------------------------------------------
			copyBufferData: function(g, g2, x1, y1, x2, y2) {
				// source側はtaranslateのぶん足されていないので、加算しておきます
				var sx1 = this.x0 + x1 * this.bw - 1,
					sy1 = this.y0 + y1 * this.bh - 1,
					sx2 = this.x0 + x2 * this.bw + 2,
					sy2 = this.y0 + y2 * this.bh + 2;
				if (sx1 < 0) {
					sx1 = 0;
				}
				if (sx2 > g2.child.width) {
					sx2 = g2.child.width;
				}
				if (sy1 < 0) {
					sy1 = 0;
				}
				if (sy2 > g2.child.height) {
					sy2 = g2.child.height;
				}
				g.drawImage(
					g2.child,
					sx1,
					sy1,
					sx2 - sx1,
					sy2 - sy1,
					sx1 - this.x0,
					sy1 - this.y0,
					sx2 - sx1,
					sy2 - sy1
				);
			},

			//---------------------------------------------------------------------------
			// pc.paintRange()  座標(x1,y1)-(x2,y2)を再描画する
			// pc.paintAll()    全体を再描画する
			//---------------------------------------------------------------------------
			paintRange: function(x1, y1, x2, y2) {
				this.setRange(x1, y1, x2, y2);
				this.prepaint();
			},
			paintAll: function() {
				if (this.suspended) {
					this.suspendedAll = true;
				}
				var bd = this.board;
				this.range.bank = true;
				this.paintRange(bd.minbx - 2, bd.minby - 2, bd.maxbx + 2, bd.maxby + 2);
			},

			//---------------------------------------------------------------------------
			// pc.getNewLineColor() 新しい色を返す
			//---------------------------------------------------------------------------
			labToRgbStr: function(LCoord, aCoord, bCoord) {
				var delta = 6 / 29,
					Xn = 95.0489,
					Yn = 100,
					Zn = 108.884;

				var fInv = function(value) {
					if (value > delta) {
						return Math.pow(value, 3);
					} else {
						return 3 * Math.pow(delta, 2) * (value - 4 / 29);
					}
				};

				var Ladj = (LCoord + 16) / 116,
					X = Xn * fInv(Ladj + aCoord / 500),
					Y = Yn * fInv(Ladj),
					Z = Zn * fInv(Ladj - bCoord / 500);

				var r = 2.041369 * X - 0.5649464 * Y - 0.3446944 * Z,
					g = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z,
					b = 0.0134474 * X - 0.1183897 * Y + 1.0154096 * Z;

				r = Math.max(Math.min(r * 2.55, 255), 0) | 0;
				g = Math.max(Math.min(g * 2.55, 255), 0) | 0;
				b = Math.max(Math.min(b * 2.55, 255), 0) | 0;
				return "rgb(" + r + "," + g + "," + b + ")";
			},
			getNewLineColor: function() {
				var lFloor = 60,
					maxL = lFloor + this.puzzle.painter.maxYdeg * (100 - lFloor),
					minL = lFloor + this.puzzle.painter.minYdeg * (100 - lFloor),
					LCoord = Math.random() * (maxL - minL) + minL;

				if (typeof this.currentColorTheta === "undefined") {
					this.currentColorTheta = Math.random() * 360;
				} else {
					this.currentColorTheta += 137.28;
				}

				var maxabRadius = 127,
					minabRadius = 75,
					abRadius = Math.random() * (maxabRadius - minabRadius) + minabRadius,
					aCoord =
						Math.sin((this.currentColorTheta * Math.PI) / 180) * abRadius,
					bCoord =
						Math.cos((this.currentColorTheta * Math.PI) / 180) * abRadius;

				return this.labToRgbStr(LCoord, aCoord, bCoord);
			},
			//---------------------------------------------------------------------------
			// pc.repaintBlocks()  色分け時にブロックを再描画する
			// pc.repaintLines()   ひとつながりの線を再描画する
			// pc.repaintParts()   repaintLine()関数で、さらに上から描画しなおしたい処理を書く
			//                     canvas描画時のみ呼ばれます(他は描画しなおす必要なし)
			//---------------------------------------------------------------------------
			repaintBlocks: function(clist) {
				clist.draw();
			},
			repaintLines: function(blist) {
				this.range.borders = blist;
				this.drawLines();

				if (this.context.use.canvas) {
					this.repaintParts(blist);
				}
			},
			repaintParts: function(blist) {}, // オーバーライド用

			//---------------------------------------------------------------------------
			// pc.flushCanvas()    指定された領域を白で塗りつぶす
			//---------------------------------------------------------------------------
			flushCanvas: function() {
				var g = this.vinc("background", "crispEdges", true);
				var bw = this.bw,
					bh = this.bh,
					fm = this.margin > 0.15 ? this.margin : 0;
				var bd = this.board;
				var minbx = bd.minbx - fm;
				var minby = bd.minby - fm;
				var bwidth = bd.maxbx + fm - minbx;
				var bheight = bd.maxby + fm - minby;

				g.vid = "BG";
				g.fillStyle = this.bgcolor;
				// TODO test if piecebank is flushed
				g.fillRect(
					minbx * bw - 0.5,
					minby * bh - 0.5,
					bwidth * bw + 1,
					bheight * bh + 1
				);
			},

			//---------------------------------------------------------------------------
			// pc.vinc()  レイヤーを返す
			//---------------------------------------------------------------------------
			vinc: function(layerid, rendering, freeze) {
				var g = this.context,
					option = { freeze: !!freeze };
				option.rendering = rendering;
				g.setLayer(layerid, option);
				return g;
			},

			//---------------------------------------------------------------------------
			// pc.disptext()  数字を記入するための共通関数
			//---------------------------------------------------------------------------
			CENTER: CENTER,
			BOTTOMLEFT: BOTTOMLEFT,
			BOTTOMRIGHT: BOTTOMRIGHT,
			TOPRIGHT: TOPRIGHT,
			TOPLEFT: TOPLEFT,
			UP: UP,
			DN: DN,
			RT: RT,
			LT: LT,

			disptext: function(text, px, py, option) {
				option = option || {};
				var g = this.context;

				var realsize = (this.cw * (option.ratio || this.fontsizeratio)) | 0;
				var maxLength = void 0;
				var widtharray = option.width || this.fontwidth;
				var widthratiopos =
					text.length <= widtharray.length + 1
						? text.length - 2
						: widtharray.length - 1;
				var widthratio =
					widthratiopos >= 0 ? widtharray[widthratiopos] * text.length : null;
				if (this.isSupportMaxWidth) {
					// maxLengthサポートブラウザ
					maxLength = !!widthratio ? realsize * widthratio : void 0;
				} else {
					// maxLength非サポートブラウザ
					if (!!widthratio) {
						realsize = ((realsize * widthratio * 1.5) / text.length) | 0;
					}
				}

				var style = option.style ? option.style + " " : "";
				g.font = style + realsize + "px " + this.fontfamily;

				var hoffset = this.bw * (option.hoffset || 0.9);
				var voffset = this.bh * (option.voffset || 0.82);
				var position = option.position || CENTER;
				switch (position) {
					case CENTER:
					case UP:
					case DN:
						g.textAlign = "center";
						break;
					case BOTTOMLEFT:
					case TOPLEFT:
					case LT:
						g.textAlign = "left";
						px -= hoffset;
						break;
					case BOTTOMRIGHT:
					case TOPRIGHT:
					case RT:
						g.textAlign = "right";
						px += hoffset;
						break;
				}
				switch (position) {
					case CENTER:
					case LT:
					case RT:
						g.textBaseline = "middle";
						break;
					case TOPRIGHT:
					case TOPLEFT:
					case UP:
						g.textBaseline = "candle-top";
						py -= voffset;
						break;
					case BOTTOMRIGHT:
					case BOTTOMLEFT:
					case DN:
						g.textBaseline = "alphabetic";
						py += voffset;
						break;
				}

				g.fillText(text, px, py, maxLength);
			}
		},

		//---------------------------------------------------------
		// ImageTile: Container for a tileset of images.
		//---------------------------------------------------------
		ImageTile: {
			cols: 1,
			rows: 1,
			width: 0,
			height: 0,

			initialize: function() {
				var puzzle = this.puzzle;
				if (typeof Image !== "undefined") {
					this.image_canvas = this.image_svg = new Image();
					this.image_canvas.onload = function() {
						puzzle.painter.paintAll();
					};
				} else {
					this.image_canvas = !!puzzle.pzpr.Candle.Canvas
						? new puzzle.pzpr.Candle.Canvas.Image()
						: {};
					this.image_svg = {};
				}
				this.image_canvas.src = this.image_svg.src = this.imgsrc_dataurl;
				this.image_canvas.height = this.image_svg.height = this.height;
				this.image_canvas.width = this.image_svg.width = this.width;

				this.cwidth = this.image_canvas.width / this.cols;
				this.cheight = this.image_canvas.height / this.rows;
				this.loaded = true;
			},

			//---------------------------------------------------------
			// imgTile.putImage: Draw one image from the tileset.
			//---------------------------------------------------------
			putImage: function(ctx, key, n, dx, dy, dw, dh) {
				var img = ctx.use.canvas ? this.image_canvas : this.image_svg;
				var sw = this.cwidth,
					sh = this.cheight;
				var sx = sw * (n % this.cols),
					sy = sh * ((n / this.cols) | 0);
				if (dw === void 0) {
					dw = sw;
					dh = sh;
				}

				ctx.vid = key;
				ctx.drawImage(n !== null ? img : null, sx, sy, sw, sh, dx, dy, dw, dh);
			}
		}
	});
})();
