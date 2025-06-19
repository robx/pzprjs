// KeyPopup.js v3.4.0
/* global createEL:readonly, getEL:readonly */

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
ui.keypopup = {
	/* メンバ変数 */
	paneltype: { 1: 0, 3: 0 } /* パネルのタイプ */,
	element: null /* キーポップアップのエレメント */,

	tdcolor: "black" /* 文字の色 */,
	imgCR: [1, 1] /* img表示用画像の横×縦のサイズ */,

	imgs: [] /* resize用 */,

	basepanel: null,
	clearflag: false,

	/* どの文字配置を作成するかのテーブル */
	type: {
		slither: [3, 0],
		swslither: [5339, 0],
		nawabari: [4, 0],
		fourcells: [4, 0],
		fivecells: [4, 0],
		fillmat: [4, 0],
		paintarea: [4, 0],
		lightup: [4, 0],
		shakashaka: [4, 0],
		gokigen: [4, 0],
		wagiri: [4, 0],
		shugaku: [4, 0],
		creek: [4, 0],
		ichimaga: [4, 0],
		ichimagam: [4, 0],
		ichimagax: [4, 0],
		sukoro: [4, 4],
		sukororoom: [4, 4],
		lookair: [5, 0],
		hebi: [5, 5],
		tawa: [6, 0],
		hashikake: [8, 0],
		tapa: [80, 0],
		tapaloop: [80, 0],
		amibo: [10, 0],
		cave: [10, 0],
		bdblock: [10, 0],
		country: [10, 0],
		usotatami: [10, 0],
		heyawake: [10, 0],
		ayeheya: [10, 0],
		kurodoko: [10, 0],
		nagenawa: [10, 0],
		numlin: [10, 0],
		nurikabe: [10, 0],
		nuribou: [10, 0],
		norinuri: [10, 0],
		mochikoro: [10, 0],
		mochinyoro: [10, 0],
		shikaku: [10, 0],
		aho: [10, 0],
		shimaguni: [10, 0],
		chocona: [10, 0],
		yajitatami: [10, 0],
		tasquare: [10, 0],
		kurotto: [10, 0],
		bonsan: [10, 0],
		heyabon: [10, 0],
		rectslider: [10, 0],
		satogaeri: [10, 0],
		yosenabe: [10, 0],
		herugolf: [10, 0],
		firefly: [10, 0],
		tateyoko: [10, 0],
		factors: [10, 10],
		fillomino: [10, 10],
		symmarea: [10, 10],
		renban: [10, 10],
		ripple: [10, 10],
		cojun: [10, 10],
		makaro: [10, 10],
		sudoku: [10, 10],
		nanro: [10, 10],
		view: [10, 10],
		kakuru: [10, 10],
		kazunori: [10, 10],
		skyscrapers: [10, 10],
		kropki: [0, 10],
		tilepaint: [51, 0],
		triplace: [51, 0],
		kakuro: [51, 10],
		usoone: [4, 0],

		slalom: [101, 0],
		reflect: [102, 0],
		pipelink: [111, 0],
		pipelinkr: [111, 0],
		loopsp: [111, 0],
		tatamibari: [112, 0],
		hakoiri: [113, 113],
		kusabi: [114, 0],
		aqre: [10, 0],
		doppelblock: [10, 115],
		japanesesums: [10, 115],
		interbd: [116, 0],
		toichika2: [10, 10],
		crossstitch: [10, 0],
		ovotovata: [10, 0],
		lohkous: [10, 0],
		chainedb: [10, 0],
		canal: [10, 0],
		cbanana: [10, 0],
		bdwalk: [117, 0],
		voxas: [118, 0],
		oneroom: [10, 0],
		tontti: [10, 0],
		lapaz: [10, 0],
		tren: [10, 0],
		pentominous: [119, 119],
		hinge: [10, 0],
		tajmahal: [8, 0],
		railpool: [10, 0],
		coral: [10, 0],
		ququ: [10, 0],
		disloop: [10, 0],
		lither: [3, 0],
		snakepit: [120, 10],
		squarejam: [10, 0],
		context: [4, 0],
		numrope: [10, 10],
		yajisoko: [10, 0],
		roundtrip: [10, 0],
		cts: [121, 0],
		vslither: [4, 0],
		tslither: [4, 0],
		kaidan: [4, 0],
		anglers: [122, 0],
		heyablock: [10, 0],
		koburin: [4, 0],
		mirrorbk: [10, 0],
		takoyaki: [4, 0],
		lightshadow: [10, 0],
		familyphoto: [10, 0],
		icelom: [10, 0],
		icelom2: [10, 0],
		icewalk: [10, 0],
		ladders: [10, 0],
		akichi: [10, 0],
		slashpack: [10, 0],
		remlen: [10, 0],
		cocktail: [10, 0],
		news: [123, 123],
		dbchoco: [10, 0],
		nurimisaki: [10, 0],
		nonogram: [10, 0],
		box: [10, 0],
		aquarium: [10, 0],
		snake: [10, 0],
		tents: [10, 0],
		armyants: [10, 0],
		araf: [10, 0],
		bosanowa: [10, 10],
		meander: [10, 10],
		juosan: [10, 0],
		walllogic: [10, 0],
		mines: [80, 0],
		pencils: [10, 0],
		minarism: [10, 10],
		trainstations: [124, 0],
		turnrun: [124, 0],
		wafusuma: [10, 0],
		kuroclone: [10, 0],
		martini: [10, 0],
		simplegako: [10, 10],
		tontonbeya: [113, 113],
		magnets: [125, 0],
		fracdiv: [51, 0],
		battleship: [126, 0],
		heyapin: [10, 0],
		detour: [10, 0],
		maxi: [10, 0],
		tetrochain: [10, 0],
		brownies: [127, 0],
		sashikazune: [10, 0],
		patchwork: [10, 0],
		waterwalk: [10, 0],
		haisu: [10, 0],
		wittgen: [4, 0],
		aquapelago: [10, 0],
		retroships: [129, 0],
		compass: [10, 0],
		mukkonn: [10, 0],
		tachibk: [10, 0],
		alter: [113, 113],
		mannequin: [10, 0],
		tetrominous: [128, 128],
		lineofsight: [10, 0],
		mrtile: [10, 0],
		subomino: [10, 0],
		lixloop: [130, 0],
		teri: [10, 0],
		portal: [10, 0],
		kuromenbun: [10, 0],
		turnaround: [3, 0],
		bosnianroad: [80, 0],
		sananko: [10, 113],
		zabajaba: [80, 0],
		batten: [10, 0],
		firewalk: [10, 0],
		snakeegg: [10, 0],
		timebomb: [10, 0],
		smullyan: [10, 0],
		meidjuluk: [10, 0],
		island: [10, 0],
		archipelago: [10, 0],
		yajirushi2: [4, 0],
		nibunnogo: [4, 0],
		mintonette: [10, 0],
		balloon: [10, 0],
		tilecity: [10, 0],
		orbital: [124, 0],
		outofsight: [132, 0],
		nuritwin: [10, 0],
		arrowflow: [10, 0],
		tjunction: [4, 0],
		retsurin: [10, 0],
		forestwalk: [10, 0],
		onsen: [10, 0],
		wataridori: [10, 0],
		kurarin: [133, 0]
	},

	//---------------------------------------------------------------------------
	// kp.display()     キーポップアップを表示する
	//---------------------------------------------------------------------------
	display: function() {
		var mode = ui.puzzle.editmode ? 1 : 3;
		if (
			this.element &&
			!!this.paneltype[mode] &&
			ui.menuconfig.get("keypopup")
		) {
			this.element.style.display = "block";

			getEL("panelbase1").style.display = mode === 1 ? "block" : "none";
			getEL("panelbase3").style.display = mode === 3 ? "block" : "none";
		} else if (!!this.element) {
			this.element.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// kp.create()      キーポップアップを生成して初期化する
	// kp.createtable() キーポップアップのポップアップを作成する
	//---------------------------------------------------------------------------
	create: function() {
		if (!!this.element) {
			getEL("panelbase1").innerHTML = "";
			getEL("panelbase3").innerHTML = "";
		}

		this.imgs = []; // resize用

		var type = this.type[ui.puzzle.pid];
		if (!type) {
			type = [0, 0];
		}

		/* Change maximum number for Fillomino variant */
		if (
			ui.puzzle.playeronly &&
			ui.puzzle.pid === "fillomino" &&
			ui.puzzle.getConfig("fillomino_tri")
		) {
			type = [3, 3];
		}

		this.paneltype = { 1: !ui.puzzle.playeronly ? type[0] : 0, 3: type[1] };
		if (!this.paneltype[1] && !this.paneltype[3]) {
			return;
		}

		if (!this.element) {
			var rect = pzpr.util.getRect(getEL("divques"));
			this.element = getEL("keypopup");
			this.element.style.left = rect.left + 48 + "px";
			this.element.style.top = rect.top + 48 + "px";
			pzpr.util.unselectable(this.element);
		}

		if (this.paneltype[1] !== 0) {
			this.createtable(1);
		}
		if (this.paneltype[3] !== 0) {
			this.createtable(3);
		}

		this.resizepanel();

		var bar = getEL("barkeypopup");
		ui.event.addEvent(bar, "mousedown", ui.popupmgr, ui.popupmgr.titlebardown);
		ui.event.addEvent(bar, "dblclick", ui.menuconfig, function() {
			this.set("keypopup", false);
		});
	},
	createtable: function(mode, type) {
		this.basepanel = getEL("panelbase" + mode);
		this.basepanel.innerHTML = "";

		this.tdcolor = mode === 3 ? ui.puzzle.painter.fontAnscolor : "black";

		this.generate(mode);
	},

	//---------------------------------------------------------------------------
	// kp.generate()    キーポップアップのテーブルを作成する
	// kp.gentable4()   キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable10()  キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable51()  キーポップアップの[＼],0～9を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate: function(mode) {
		var type = this.paneltype[mode];
		if (type === 4) {
			this.gentable4(mode);
		} else if (type === 10) {
			this.gentable10(mode);
		} else if (type === 51) {
			this.gentable51(mode);
		} else if (type === 3) {
			this.gentable3(mode);
		} else if (type === 5) {
			this.gentable5(mode);
		} else if (type === 6) {
			this.gentable6(mode);
		} else if (type === 8) {
			this.gentable8(mode);
		} else if (type === 80) {
			this.gentable80(mode);
		} else if (type === 101) {
			this.generate_slalom(mode);
		} else if (type === 102) {
			this.generate_reflect(mode);
		} else if (type === 111) {
			this.generate_pipelink(mode);
		} else if (type === 112) {
			this.generate_tatamibari(mode);
		} else if (type === 113) {
			this.generate_hakoiri(mode);
		} else if (type === 114) {
			this.generate_kusabi(mode);
		} else if (type === 115) {
			this.generate_doppelblock();
		} else if (type === 116) {
			this.generate_interbd();
		} else if (type === 117) {
			this.generate_bdwalk();
		} else if (type === 118) {
			this.generate_voxas();
		} else if (type === 119) {
			this.generate_pentominous(mode);
		} else if (type === 120) {
			this.generate_snakepit(mode);
		} else if (type === 121) {
			this.generate_cts(mode);
		} else if (type === 122) {
			this.generate_anglers(mode);
		} else if (type === 123) {
			this.generate_news(mode);
		} else if (type === 124) {
			this.generate_trainstations(mode);
		} else if (type === 125) {
			this.generate_magnets(mode);
		} else if (type === 126) {
			this.generate_battleship(mode);
		} else if (type === 127) {
			this.generate_brownies(mode);
		} else if (type === 128) {
			this.generate_tetrominous(mode);
		} else if (type === 129) {
			this.generate_retroships(mode);
		} else if (type === 130) {
			this.generate_lix(mode);
		} else if (type === 131) {
			this.generate_infinity(mode);
		} else if (type === 132) {
			this.generate_outofsight(mode);
		} else if (type === 133) {
			this.generate_kurarin(mode);
		} else if (type === 5339) {
			this.generate_swslither();
		}
	},
	gentable4: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = ["1", "2", "3", "4"];
		if (mode === 3 && (pid === "sukoro" || pid === "sukororoom")) {
			var mbcolor = ui.puzzle.painter.mbcolor;
			itemlist.push(
				["q", { text: "○", color: mbcolor }],
				["w", { text: "×", color: mbcolor }],
				" ",
				null
			);
		} else {
			var cap = "?";
			if (ui.puzzle.painter.hideHatena) {
				switch (pid) {
					case "lightup":
					case "shakashaka":
					case "tjunction":
						cap = "■";
						break;
					case "gokigen":
					case "wagiri":
					case "shugaku":
					case "creek":
						cap = "○";
						break;
				}
			}
			itemlist.push("0", null, " ", ["-", cap]);
		}
		this.generate_main(itemlist, 4);
	},
	gentable10: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = [];
		if (mode === 3 && ui.puzzle.klass.Cell.prototype.numberWithMB) {
			var mbcolor = ui.puzzle.painter.mbcolor;
			itemlist.push(
				["q", { text: "○", color: mbcolor }],
				["w", { text: "×", color: mbcolor }],
				" ",
				null
			);
		}

		var separateEmptyHatena =
			pid === "kakuru" ||
			pid === "tateyoko" ||
			pid === "crossstitch" ||
			pid === "numrope" ||
			pid === "sananko" ||
			pid === "yajisoko";

		if (mode === 1 && separateEmptyHatena) {
			itemlist.push(["q1", pid === "yajisoko" ? "□" : "■"]);
			if (pid === "crossstitch") {
				itemlist.push(["w2", "○"]);
			}
			itemlist.push(["-", "?"]);
		}

		itemlist.push("0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
		if (mode === 3 && pid === "toichika2") {
			itemlist.push(["-", { text: "・", color: "rgb(255, 96, 191)" }]);
		}
		itemlist.push(
			mode === 1 || !ui.puzzle.klass.Cell.prototype.numberWithMB ? " " : null
		);

		var cap = null;
		if (mode === 3 || separateEmptyHatena) {
			/* Do nothing */
		} else if (pid === "tasquare") {
			cap = "□";
		} else if (
			pid === "rectslider" ||
			pid === "aquapelago" ||
			pid === "mrtile"
		) {
			cap = "■";
		} else if (pid === "patchwork") {
			cap = {
				text: "■",
				color: "rgb(204,204,204)"
			};
		} else if (
			pid === "kurotto" ||
			pid === "bonsan" ||
			pid === "satogaeri" ||
			pid === "heyabon" ||
			pid === "yosenabe" ||
			pid === "herugolf" ||
			pid === "kazunori" ||
			pid === "nurimisaki" ||
			pid === "amibo" ||
			pid === "firefly" ||
			pid === "shikaku" ||
			pid === "aho" ||
			pid === "bosanowa" ||
			pid === "portal" ||
			pid === "minarism" ||
			pid === "mintonette" ||
			pid === "onsen" ||
			pid === "wataridori"
		) {
			cap = "○";
		} else if (!ui.puzzle.painter.hideHatena) {
			cap = "?";
		}
		if (cap !== null) {
			itemlist.push(["-", cap]);
		}
		if (pid === "familyphoto") {
			itemlist.push(["q", "●"]);
		}
		if (
			pid === "icelom" ||
			pid === "icelom2" ||
			pid === "icewalk" ||
			pid === "waterwalk" ||
			pid === "firewalk" ||
			pid === "forestwalk" ||
			pid === "dbchoco" ||
			pid === "balloon"
		) {
			itemlist.push([
				"q",
				{
					text: "■",
					color:
						pid === "dbchoco" || pid === "balloon"
							? "rgb(204,204,204)"
							: pid === "firewalk"
							? "rgb(255,192,192)"
							: pid === "forestwalk"
							? "rgb(195,253,186)"
							: "rgb(192,224,255)"
				}
			]);
		}
		this.generate_main(itemlist, 4);
	},
	gentable51: function(mode) {
		this.generate_main(
			[
				["q", { image: 0 }],
				" ",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0"
			],
			4
		);
	},

	//---------------------------------------------------------------------------
	// kp.gentable3()  キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable5()  キーポップアップの0～5を入力できるテーブルを作成する
	// kp.gentable6()  キーポップアップの0～6を入力できるテーブルを作成する
	// kp.gentable8()  キーポップアップの0～8を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	gentable3: function(mode) {
		var itemlist = ["1", "2", "3", "0", " "];
		if (mode === 1) {
			itemlist.push(["-", "?"]);
		}
		this.generate_main(itemlist, 3);
	},
	gentable5: function(mode) {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				null,
				"0",
				" ",
				[
					"-",
					{
						text: mode === 1 ? "?" : "・",
						color: mode === 3 ? "rgb(255, 96, 191)" : ""
					}
				]
			],
			3
		);
	},
	gentable6: function(mode) {
		this.generate_main(["1", "2", "3", "4", "5", "6", "0", " ", ["-", "?"]], 3);
	},
	gentable8: function(mode) {
		this.generate_main(
			["1", "2", "3", "4", "5", "6", "7", "8", " ", ["-", "○"]],
			4
		);
	},
	gentable80: function(mode) {
		this.generate_main(
			["1", "2", "3", "4", "5", "6", "7", "8", "0", " ", ["-", "?"]],
			4
		);
	},

	//---------------------------------------------------------------------------
	// kp.generate_slalom()     スラローム用のテーブルを作成する
	// kp.generate_reflect()    リフレクトリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_slalom: function(mode) {
		this.imgCR = [4, 1];
		this.generate_main(
			[
				["q", { image: 0 }],
				["s", { image: 1 }],
				["w", { image: 2 }],
				["e", { image: 3 }],
				["r", " "],
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				"-",
				" "
			],
			5
		);
	},
	generate_reflect: function(mode) {
		this.imgCR = [4, 1];
		this.generate_main(
			[
				["q", { image: 0 }],
				["w", { image: 1 }],
				["e", { image: 2 }],
				["r", { image: 3 }],
				["t", "╋"],
				["y", " "],
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				"-"
			],
			6
		);
	},

	//---------------------------------------------------------------------------
	// kp.generate_pipelink()   パイプリンク、帰ってきたパイプリンク、環状線スペシャル用のテーブルを作成する
	// kp.generate_tatamibari() タタミバリ用のテーブルを作成する
	// kp.generate_hakoiri()    はこいり○△□用のテーブルを作成する
	// kp.generate_kusabi()     クサビリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_pipelink: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = [];
		itemlist.push(
			["q", "╋"],
			["w", "┃"],
			["e", "━"],
			["r", " "],
			pid !== "loopsp" ? ["-", "?"] : null,
			["a", "┗"],
			["s", "┛"],
			["d", "┓"],
			["f", "┏"]
		);
		if (pid === "pipelink") {
			itemlist.push(null);
		} else if (pid === "pipelinkr") {
			itemlist.push(["1", "○"]);
		} else if (pid === "loopsp") {
			itemlist.push(["-", "○"]);
		}

		if (pid === "loopsp") {
			itemlist.push("1", "2", "3", "4", "5", "6", "7", "8", "9", "0");
		}
		this.generate_main(itemlist, 5);
	},
	generate_tatamibari: function(mode) {
		this.generate_main(
			[
				["q", "╋"],
				["w", "┃"],
				["e", "━"],
				["r", " "],
				["-", "?"]
			],
			3
		);
	},
	generate_hakoiri: function(mode) {
		var pid = ui.puzzle.pid,
			itemlist = [];

		if (pid === "sananko") {
			var mbcolor = ui.puzzle.painter.mbcolor;
			itemlist.push("1", "2", "3");
			itemlist.push(
				["q", { text: "○", color: mbcolor }],
				["w", { text: "×", color: mbcolor }]
			);
		} else {
			itemlist.push(["1", "○"], ["2", "△"], ["3", "□"]);
			if (pid !== "tontonbeya") {
				itemlist.push([
					"4",
					{
						text: mode === 1 ? "?" : "・",
						color: mode === 3 ? "rgb(255, 96, 191)" : ""
					}
				]);
			}
		}
		itemlist.push(" ");
		this.generate_main(itemlist, 3);
	},
	generate_kusabi: function(mode) {
		this.generate_main(
			[["1", "同"], ["2", "短"], ["3", "長"], ["-", "○"], " "],
			3
		);
	},
	generate_doppelblock: function() {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				["q", "⋅"],
				["w", "■"],
				" "
			],
			5
		);
	},
	generate_interbd: function() {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"0",
				["-", { text: "?", color: "gray" }],
				["q", { text: "●", color: "red" }],
				["w", { text: "◆", color: "blue" }],
				["e", { text: "▲", color: "green" }],
				["r", { text: "■", color: "#c000c0" }],
				["t", { text: "⬟", color: "#ff8000" }],
				["y", { text: "⬣", color: "#00c0c0" }],
				" "
			],
			4
		);
	},
	generate_bdwalk: function() {
		this.generate_main(
			[
				["-", { text: "■", color: "gray" }],
				["u", { text: "▲" }],
				["d", { text: "▼" }],
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				" "
			],
			4
		);
	},
	generate_voxas: function() {
		this.generate_main(
			[
				["2", { text: "●" }],
				["3", { text: "●", color: "gray" }],
				["4", { text: "○" }],
				["1", { text: "━" }],
				" "
			],
			3
		);
	},
	generate_pentominous: function(mode) {
		var items = "filnptuvwxyz".split("").map(function(c) {
			return [c, { text: c.toUpperCase() }];
		});
		if (mode === 1) {
			items.push(["-", "?"], ["q", "■"]);
		}
		items.push(" ");

		this.generate_main(items, 5);
	},
	generate_tetrominous: function(mode) {
		var items = "ilost".split("").map(function(c) {
			return [c, { text: c.toUpperCase() }];
		});
		if (mode === 1) {
			items.push(["-", "?"], ["q", "■"]);
		}
		items.push(" ");

		this.generate_main(items, 4);
	},
	generate_snakepit: function() {
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				" ",
				["-", "?"],
				["q", { text: "○" }],
				["w", { text: "■", color: "gray" }]
			],
			4
		);
	},
	generate_cts: function() {
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				["-", "?"],
				["w", "*"],
				" "
			],
			5
		);
	},
	generate_anglers: function() {
		this.imgCR = [2, 1];
		this.generate_main(
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"0",
				["-", "?"],
				["q", { image: 0 }],
				["w", { image: 1 }],
				" "
			],
			5
		);
	},
	generate_news: function(mode) {
		var mbcolor = ui.puzzle.painter.mbcolor;
		this.generate_main(
			[
				mode === 3 ? ["z", { text: "○", color: mbcolor }] : " ",
				["n", "N"],
				" ",
				["w", "W"],
				["x", mode === 3 ? { text: "⋅", color: mbcolor } : "×"],
				["e", "E"],
				" ",
				["s", "S"],
				" "
			],
			3
		);
	},

	generate_trainstations: function(mode) {
		var orbital = ui.puzzle.pid === "orbital";
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				" ",
				["-", orbital ? "●" : "?"],
				["q", orbital ? "○" : "╋"]
			],
			4
		);
	},

	generate_magnets: function(mode) {
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				" ",
				["q", { text: "■", color: "gray" }],
				["1", "╋"],
				["2", "━"]
			],
			4
		);
	},

	generate_battleship: function(mode) {
		this.imgCR = [10, 1];
		this.generate_main(
			[
				["7", { image: 6 }],
				["8", { image: 7 }],
				["1", { image: 4 }],
				"1",
				"2",
				"3",
				["9", { image: 8 }],
				["a", { image: 9 }],
				["2", { image: 5 }],
				"4",
				"5",
				"6",
				["3", { image: 2 }],
				["5", { image: 0 }],
				["4", { image: 3 }],
				"7",
				"8",
				"9",
				["6", { image: 1 }],
				["0", { text: "~", color: "blue" }],
				["-", "?"],
				" ",
				"0"
			],
			6
		);
	},

	generate_retroships: function(mode) {
		this.imgCR = [10, 1];
		this.generate_main(
			[
				["7", { image: 6 }],
				["8", { image: 7 }],
				["1", { image: 4 }],
				" ",
				["9", { image: 8 }],
				["a", { image: 9 }],
				["2", { image: 5 }],
				" ",
				["3", { image: 2 }],
				["5", { image: 0 }],
				["4", { image: 3 }],
				" ",
				["6", { image: 1 }],
				["0", { text: "~", color: "blue" }],
				["-", "?"],
				" "
			],
			4
		);
	},

	generate_brownies: function(mode) {
		this.generate_main(
			[
				"0",
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				" ",
				["q", "○"],
				["w", "■"]
			],
			4
		);
	},

	generate_lix: function(mode) {
		this.generate_main(
			[["l", "L"], ["i", "I"], ["x", "X"], ["-", "?"], " "],
			3
		);
	},

	generate_swslither: function() {
		this.generate_main(
			[["5", "🐑"], ["6", "🐺"], null, "1", "2", "3", "0", " ", ["-", "?"]],
			3
		);
	},

	generate_kurarin: function() {
		this.generate_main(
			[
				["1", { text: "●" }],
				["2", { text: "●", color: "gray" }],
				["3", { text: "○" }],
				" "
			],
			3
		);
	},

	generate_outofsight: function() {
		this.generate_main(
			[
				["a", { text: "A", color: "red" }],
				["b", { text: "B", color: "blue" }],
				["c", { text: "C", color: "green" }],
				["d", { text: "D", color: "#c000c0" }],
				["e", { text: "E", color: "#ff8000" }],
				["f", { text: "F", color: "#00c0c0" }],
				["-", { text: "?", color: "gray" }],
				" "
			],
			3
		);
	},

	generate_main: function(list, split) {
		for (var i = 0; i < list.length; i++) {
			this.inputcol(list[i]);
			if ((i + 1) % split === 0) {
				this.insertrow();
			}
		}
		if (i % split !== 0) {
			this.insertrow();
		}
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol: function(item) {
		var type = "num",
			ca,
			disp,
			color = this.tdcolor;
		if (!item) {
			type = "empty";
		} else {
			if (typeof item === "string") {
				ca = disp = item;
			} else if (typeof item[1] === "string") {
				ca = item[0];
				disp = item[1];
			} else if (!!item[1].text) {
				ca = item[0];
				disp = item[1].text;
				color = item[1].color;
			} else if (item[1].image !== void 0) {
				ca = item[0];
				disp = item[1].image;
				type = "image";
			}
		}

		var _div = null,
			_child = null;
		if (type !== "empty") {
			_div = createEL("div");
			_div.className = "kpcell kpcellvalid";
			_div.onclick = function(e) {
				e.preventDefault();
			};
			ui.event.addEvent(_div, "mousedown", ui.puzzle, function(e) {
				this.key.keyevent(ca, 0);
				e.preventDefault();
				e.stopPropagation();
			});
			pzpr.util.unselectable(_div);
		} else {
			_div = createEL("div");
			_div.className = "kpcell kpcellempty";
			pzpr.util.unselectable(_div);
		}

		if (type === "num") {
			_child = createEL("span");
			_child.className = "kpnum";
			_child.style.color = color;
			_child.innerHTML = disp;
			pzpr.util.unselectable(_child);
		} else if (type === "image") {
			_child = createEL("img");
			_child.className = "kpimg";
			var pid = ui.puzzle.pid;
			if (pid === "retroships") {
				pid = "battleship";
			}

			_child.src =
				"data:image/gif;base64," +
				this.dataurl[!!this.dataurl[pid] ? pid : "shitappa"];
			pzpr.util.unselectable(_child);
			var x = disp % this.imgCR[0],
				y = (disp - x) / this.imgCR[1];
			this.imgs.push({ el: _child, x: x, y: y });
		}

		if (this.clearflag) {
			_div.style.clear = "both";
			this.clearflag = false;
		}
		if (!!_child) {
			_div.appendChild(_child);
		}
		this.basepanel.appendChild(_div);
	},
	insertrow: function() {
		this.clearflag = true;
	},

	//---------------------------------------------------------------------------
	// kp.resizepanel() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resizepanel: function() {
		var cellsize = Math.min(ui.puzzle.painter.cw, 120);
		if (cellsize < 20) {
			cellsize = 20;
		}

		var dsize = (cellsize * 0.9) | 0,
			tsize = (cellsize * 0.7) | 0;
		for (var i = 0, len = this.imgs.length; i < len; i++) {
			var obj = this.imgs[i],
				img = obj.el;
			img.style.width = "" + dsize * this.imgCR[0] + "px";
			img.style.height = "" + dsize * this.imgCR[1] + "px";
			img.style.clip =
				"rect(" +
				(dsize * obj.y + 1) +
				"px," +
				dsize * (obj.x + 1) +
				"px," +
				dsize * (obj.y + 1) +
				"px," +
				(dsize * obj.x + 1) +
				"px)";
			img.style.top = "-" + obj.y * dsize + "px";
			img.style.left = "-" + obj.x * dsize + "px";
		}

		ui.misc.modifyCSS({
			"div.kpcell": {
				width: "" + dsize + "px",
				height: "" + dsize + "px",
				lineHeight: "" + dsize + "px"
			},
			"span.kpnum": { fontSize: "" + tsize + "px" }
		});
	},

	dataurl: {
		slalom:
			"R0lGODlhAAFAAMIEAAICAmBgYJ+fn///////AP//AP//AP//ACH5BAEKAAQALAAAAAAAAUAAAAP+OLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM90bd94ru+24AdAH68BKBqHNqNyyWw6n9DSD2oMCHhMZI3K7XqLI0Hgq7TmstoZec0GhMTt8jW5TKvj+OhnnFfOaWh2MH2EdR0ChUtmd0qCMYmJHXxOQFZ/P5OUjEeOL5CFHJmKfxFTmp2oIZ+EG6JVpBVwTQGptR2rfRquAIsbiLO2wRi4eRm7tB+yS7DCzQ7EeBi/yyO7zCiBziTQcRfTfiWuyCzZ2iLcbReu1yDrLeXmIOhsFt9F7CGu74bx5/NkFkSNO2EPAL4R8Prd+vclFpODbxKWkKhQA8OGFAS2EAX+UR6/ih4ueqFQsGPEMiCDieySUZGLkilrreTSEpwLjjFTzaRCweULewNz2tmpR4JPTyhTUBQ6geiTCUBjiFKxlGkEp06gUoMxVelHqxawNpmAE4Y9kxyqevw4dkFbt+XeQhBbtezPrSfUfpDLN67fr8/oNpLQ1SxeE3pDZuv7Ve4Ax4EFgyF8uMVZr4MxZ368+O9mzoCJSJ5cqjILeyAZb3bMuupo0hAucw3tTDUnBa0bu36tNemLwmCRvHbT1Lflo8GHDO9JG0XU5MJ5kzWdwm7e5tBFjyaJXAVMzbCzX5Ve3OaK5+CJizdKnrLx9GgXfl4fWbJD6iQ0rkgMfXmvBX0pfEcVdvT5x113+SF43Xz0MWBgTeYliF+DgLTH3IShMBEUhTc8eCCGxjQRH4fkWAjhe744MSKJ+5l4YoQhisjiDh4GRMmKBRmx4lq3zQiafa08YQlUu+goA3/J1agOFUH44CQQXOyoCoHrKelNkXj08giV4lkpTSJaHslldl5Kg2UXYW4SHotlapAjk1Iu2KOPVplCyZB05pmDk0Lo6eefgAYq6KCEFmrooSwkAAA7",
		anglers:
			"R0lGODdhgABAAPQAAP///wICAp+fn4CAgLCwsMDAwD8/PwAAABAQEFBQUKCgoO/v7yAgIDAwMJCQkN/f329vb39/fx8fH8/Pzy8vL6+vr7+/vw8PD2BgYF9fX0BAQE9PT4+PjwAAAAAAAAAAACwAAAAAgABAAAAF/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGoOBpHLJbDqfUOexGK1ar80pEcvtSrVCr9gLDo/P1plgQCgUyim0HDozHO74hGIBH83/TDFrDHiFdw0OD3CAjAExEIaReAN8Wo2Aj3gSBnaSd5RTl3+ZnyMTERSSDBVHonMxFnknAhKRoFuuaLCyKBEXhhiVZrlju3grvoUNwkDEZzK1d6wqE7+aE8POXTKQdxktqZrMPdpiMhXiLRnKSOXb0HjY6oXBP+7vMRu84IUC9vdY1BSy8CLcHXk8AAass49FtYY6FF6hESvei4oHyUmsUqPTAQbjVHjUoHEjHRoP2O+5wHjA3w6TUWx08/Zi3aGEMJ/cMNjSRUqLEXN+sRFNmgt9pYIKDXTj4aQWAiDaWJoFBzp6DguFpEGVqVVDy1YYdImj65IdTp+mSHYgglKzPB7wTGoCo4G3XX0gVTYAoQi7eKn+iKoKQxsATsOWNZskCFtPYDVInizZLwvGjYXMhMz5AMEXmB0REWCzs6TPLkJPsQCBk2mgqTH3ATDQgu3btrfGkd1Haw7VvY/95r1I+GLGs30fhxv8TuClyY3fAF7c+XDkzQ88Fzo7gne315nPxol9/Evi5sPnTb89J/v38OPLn0+/vv37+PPr3z8+BAA7",
		battleship:
			"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",
		reflect:
			"R0lGODlhAAFAAIABAAAAAP///yH5BAEKAAEALAAAAAAAAUAAAAL+jI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6bgD8H/A9AMSi8YhMKpdJCPMJjSKdQiCOGJFqt9Mh96vNYq22ogSMflLT7OPZTJ4ZJ+362GGv0+dxmHufh7YW+EXR1cdy+EbINcgoVdGEqCJp+BjmdRlloTSJ0smpCeUoWmlp6hmyhFHKRNoKFwqaCuLKCqvIgJt7OkvLoZaxy4c3fHcx+ruRLGz8WrrMrCxrq+GciQu8OR25HZ2N3dqByS3m/S0eLuqxVf7si76ufvnR6K7bXp9eDK2ff4+gUK1+/DSpEggwCEJ/9OYFEiEIYMSDDQsyGpHmXkb+jBUbGOQ4URmbEh3xXSTRZlpKkict2jGhh1ZMlg8dbqQ50tPLE4Tegfm0s0+eFDVd3oQ5NE5RnkE9NkWaFEhPSjOdriQ6lUdLrDmN2qOaNcejFlethuQatsxYskdN/mS7Vm3cRGcXtAU7V4Y8F3UV9EWb9wVBvgvdkiO8V/BgxIcNn2P8EXJJycG8rtILi3JgzfDsNlacecWuGp/9QqIxDO8+OY89S8M8mmls0q9dV0N9DWVu2rcd84KdGmTwG5XNosJtrArD4cQvW1YuN/nA5NCj/7G8g3qseLuvHDf9m7d2bdqrN79u/JjY8uq7sZeK3jF89ubNvZ/fHnx+7/Q96z9nrtV2bpHRn4A2SUfgfgEpyF+BiziolH8HMNgghP8hqJQTCW3IYYcefghiiCKOSGKJJp6IYooqrlhOAQA7",
		shitappa:
			"R0lGODlhQABAAIABAAAAAP//ACH5BAEKAAEALAAAAABAAEAAAAL6jI+py+0Po5y02ouz3rz7DwHiSJbmiaZnqLbuW7LwTMdPjdcyCUb8veo5fkOUsEFEjgK2YyLJ+DWdBuiCOHVaFcmscPtcIrwg8Fh8Rn/VUXbVvIG/RW13R860z+k9PJys4ad3AIghyFc0aHEI4IMnwQj5uEMpqWjZCIToeFmZmDlRyAmqtIlJWhG5OMnVyRrWeeUaW2c66nkhKmvbykuhC4u6K7xKm+ebRlyMHIwb+Kh6F12qbCg3La2InY28za3s/T3sXGYV7pF1jt41y7yOpv5hEy/PQ18f9Ek1fF8OnAPwxY6ABP8VPMgIYcF9DBs6fAgxosSJFBMUAAA7"
	}
};
