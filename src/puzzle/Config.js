// Config.js v3.4.1

import variety from '../pzpr/variety.js';
import { env } from '../pzpr/env.js';
import Puzzle from './Puzzle.js';

	//---------------------------------------------------------------------------
	// ★Configクラス 設定値の値などを保持する
	//---------------------------------------------------------------------------
	var Config = (Puzzle.prototype.Config = function(puzzle) {
		this.puzzle = puzzle;
		this.init();
	});
	Config.prototype = {
		list: null /* 設定値 */,

		//---------------------------------------------------------------------------
		// config.init()        各設定値を初期化する
		// config.add()         初期化時に設定を追加する
		//---------------------------------------------------------------------------
		init: function() {
			this.list = {};

			/* 盤面表示設定 */
			this.add("font", 1, {
				option: [1, 2]
			}); /* 文字の描画 1:ゴシック 2:明朝 */
			this.add("cursor", true); /* カーソルの表示 */
			this.add("trialmarker", true); /* show trial marker */
			this.add("irowake", false, { variety: true }); /* 線の色分け */
			this.add("irowakeblk", false, { variety: true }); /* 黒マスの色分け */

			this.add("dispmove", true); /* 線で動かすパズルで実際に動いたように描画 */
			this.add("disptype_yajilin", 1, {
				option: [1, 2]
			}); /* yajilin: 表示形式 */
			this.add("disptype_bosanowa", 1, {
				option: [1, 2, 3]
			}); /* bosanowa: 表示形式 */
			this.add("snakebd", false); /* hebi: へびの境界線を表示する */
			this.add("dispqnumbg", false); /* yinyang: 問題のまるに背景色をつける */
			this.add("undefcell", true); /* shugaku: 未確定マスはグレー表示にする */

			this.add("squarecell", true); /* セルは正方形にする */

			/* 入力方法設定 */
			this.add("use", !env.API.touchevent ? 1 : 2, {
				option: [1, 2]
			}); /* 黒マスの入力方法 */
			this.add("use_tri", 1, {
				option: [1, 2, 3]
			}); /* shakashaka: 三角形の入力方法 */
			this.add(
				"support_tri",
				true
			); /* shakashaka: 三角形の入力補助 (for 2つ以上の壁に接したCell) */

			this.add("bgcolor", false); /* slither 背景色入力 */
			this.add(
				"singlenum",
				!env.API.touchevent
			); /* hanare: 部屋に回答数字を一つだけ入力 */
			this.add("enline", true); /* kouchoku: 線は点の間のみ引ける */
			this.add("lattice", true); /* kouchoku: 格子点チェック */

			/* 回答お助け機能 */
			this.add("autocmp", true, {
				variety: true
			}); /* 数字 or kouchokuの正解の点をグレーにする */
			this.add("autoerr", false, {
				variety: true
			}); /* hitori:ひとくれの重複した数字を表示, gokigen,wagiri:斜線の色分け */

			/* 正解判定 */
			this.add("multierr", false); /* エラー判定で複数エラーを出力する */
			this.add(
				"forceallcell",
				false
			); /* fillomino: すべての数字が入っている時のみ正解とする */

			/* puzzle variant rules; must defaut to false */
			this.add("dontpassallcell", false, {
				variant: true,
				volatile: true
			}); /* arukone: don't require passing all cells */
			this.add("aquarium_regions", false, {
				variant: true,
				volatile: true
			}); /* aquarium: Rule variation for disconnected cells in one region */
			this.add("country_empty", false, { variant: true, volatile: true });
			/* generic variant */
			this.add("variant", false, { variant: true, volatile: true });
			this.add("variantid", "", { volatile: true });

			/* EDITORのみ */
			this.add("discolor", false); /* tentaisho: 色分け無効化 */
			/* その他の特殊項目(保存なし) */
			this.add("uramashu", false, { volatile: true }); /* 裏ましゅにする */
		},
		add: function(name, defvalue, extoption) {
			if (!extoption) {
				extoption = {};
			}
			var item = {
				val: defvalue,
				defval: defvalue,
				volatile: !!extoption.volatile,
				extoption: extoption // stored for the benefit of ui.MenuConfig
			};
			if (!!extoption.option) {
				item.option = extoption.option;
			}
			if (!!extoption.variety) {
				item.variety = {};
			}
			if (!!extoption.variant) {
				item.variant = true;
			}
			this.list[name] = item;
		},

		//---------------------------------------------------------------------------
		// config.getCurrentName() 以前のconfig名から現在使用している名称を取得する
		// config.getNormalizedName() Config名が@付きだった場合varietyのpidを返す
		//---------------------------------------------------------------------------
		getCurrentName: function(name) {
			switch (name) {
				case "color_qanscolor":
					name = "color_shadecolor";
					break;
				case "autocmp_area":
					if (this.getexec("autocmp")) {
						name = "autocmp";
					}
					break;
				case "autocmp_border":
					if (this.getexec("autocmp")) {
						name = "autocmp";
					}
					break;
			}
			return name;
		},
		getNormalizedName: function(argname) {
			var info = { name: argname };
			if (argname.match(/\@/)) {
				var splitted = argname.split(/\@/);
				info.name = splitted[0];
				var pid = variety.toPID(splitted[1]);
				if (!!pid) {
					info.pid = pid;
				}
			}
			info.name = this.getCurrentName(info.name);
			return info;
		},

		//---------------------------------------------------------------------------
		// config.get()  各フラグの設定値を返す
		// config.set()  各フラグの設定値を設定する
		// config.reset()各フラグの設定値を初期値に戻す
		//---------------------------------------------------------------------------
		get: function(argname) {
			var names = this.getNormalizedName(argname),
				name = names.name;
			var item = this.list[name];
			if (!item) {
				return null;
			}
			if (!!item.variety) {
				var pid = names.pid !== void 0 ? names.pid : this.puzzle.pid;
				if (item.variety[pid] !== void 0) {
					return item.variety[pid];
				}
			}
			return item.val;
		},
		set: function(argname, newval) {
			var names = this.getNormalizedName(argname),
				name = names.name;
			if (!this.list[name]) {
				return;
			}
			newval = this.setproper(names, newval);
			this.configevent(name, newval);
			this.puzzle.emit("config", name, newval);
		},
		reset: function(argname) {
			var names = this.getNormalizedName(argname);
			var item = this.list[names.name];
			if (!item) {
				return;
			}
			if (!!item.variety && !names.pid) {
				item.variety = {};
				this.set(names.name, item.defval);
			} else {
				this.set(argname, item.defval);
			}
		},

		//---------------------------------------------------------------------------
		// config.getList()  現在有効な設定値のリストを返す
		//---------------------------------------------------------------------------
		getList: function() {
			var conf = {};
			for (var idname in this.list) {
				if (this.getexec(idname)) {
					conf[idname] = this.get(idname);
				}
			}
			return conf;
		},

		getvariant: function(name) {
			var item = this.list[name];
			if (!item) {
				return null;
			}
			return item.variant;
		},
		getVariants: function() {
			var conf = {};
			for (var key in this.list) {
				var item = this.list[key];
				if (!item.variant) {
					continue;
				}
				if (this.getexec(key)) {
					conf[key] = this.get(key);
				}
			}
			return conf;
		},

		//---------------------------------------------------------------------------
		// config.getAll()  全フラグの設定値を返す
		// config.setAll()  全フラグの設定値を設定する
		//---------------------------------------------------------------------------
		getAll: function() {
			var object = {};
			for (var key in this.list) {
				var item = this.list[key];
				if (item.volatile) {
					continue;
				}
				if (item.val !== item.defval) {
					object[key] = item.val;
				}
				if (!item.variety) {
					continue;
				}
				for (var pid in item.variety) {
					if (item.variety[pid] !== item.defval) {
						object[key + "@" + pid] = item.variety[pid];
					}
				}
			}
			return object;
		},
		setAll: function(settings) {
			this.init();
			for (var key in settings) {
				this.set(key, settings[key]);
			}
		},

		//---------------------------------------------------------------------------
		// config.setproper()    設定値の型を正しいものに変換して設定変更する
		//---------------------------------------------------------------------------
		setproper: function(names, newval) {
			var name = names.name;
			var item = this.list[name];
			switch (typeof item.defval) {
				case "boolean":
					newval = !!newval;
					break;
				case "number":
					newval = +newval;
					break;
				case "string":
					newval = "" + newval;
					break;
			}
			if (!item.option || item.option.indexOf(newval) >= 0) {
				if (!!item.variety) {
					var pid = names.pid !== void 0 ? names.pid : this.puzzle.pid;
					if (!!pid) {
						item.variety[pid] = newval;
					}
				} else {
					item.val = newval;
				}
			}
			return newval;
		},

		//---------------------------------------------------------------------------
		// config.getexec()  設定値を現在のパズルで有効かどうか返す
		//---------------------------------------------------------------------------
		getexec: function(name) {
			var puzzle = this.puzzle,
				pid = puzzle.pid,
				EDITOR = !puzzle.playeronly,
				exec = false;
			switch (name) {
				case "use":
					exec = puzzle.mouse.use;
					break;
				case "use_tri":
					exec = pid === "shakashaka";
					break;
				case "support_tri":
					exec = pid === "shakashaka";
					break;
				case "dispmove":
					exec = puzzle.board.linegraph.moveline;
					break;
				case "disptype_bosanowa":
					exec = pid === "bosanowa";
					break;
				case "disptype_yajilin":
					exec = pid === "yajilin";
					break;
				case "bgcolor":
					exec = pid === "slither";
					break;
				case "irowake":
					exec = puzzle.painter.irowake;
					break;
				case "irowakeblk":
					exec = puzzle.painter.irowakeblk;
					break;
				case "snakebd":
					exec = pid === "hebi";
					break;
				case "dispqnumbg":
					exec = pid === "yinyang";
					break;
				case "undefcell":
					exec = pid === "shugaku";
					break;
				case "autocmp":
					exec = !!puzzle.painter.autocmp;
					break;
				case "autoerr":
					exec = pid === "hitori" || pid === "gokigen" || pid === "wagiri";
					break;
				case "singlenum":
					exec = pid === "hanare";
					break;
				case "enline":
				case "lattice":
					exec = pid === "kouchoku" || pid === "angleloop";
					break;
				case "discolor":
					exec = EDITOR && pid === "tentaisho";
					break;
				case "uramashu":
					exec = pid === "mashu";
					break;
				case "forceallcell":
					exec = pid === "fillomino";
					break;
				case "dontpassallcell":
					exec = pid === "arukone";
					break;
				case "aquarium_regions":
					exec = pid === "aquarium";
					break;
				case "country_empty":
					exec = pid === "country";
					break;
				default:
					exec = !!this.list[name];
			}
			return exec;
		},

		//---------------------------------------------------------------------------
		// config.configevent()  設定変更時の動作を記述する
		//---------------------------------------------------------------------------
		configevent: function(name, newval) {
			var puzzle = this.puzzle;
			if (!puzzle.klass || !this.getexec(name)) {
				return;
			}
			switch (name) {
				case "irowake":
				case "irowakeblk":
				case "dispmove":
				case "cursor":
				case "trialmarker":
				case "undefcell":
				case "autocmp":
				case "autoerr":
				case "aquarium_regions":
				case "snakebd":
				case "disptype_yajilin":
				case "dispqnumbg":
					puzzle.redraw();
					break;

				case "font":
					puzzle.painter.initFont();
					puzzle.redraw();
					break;

				case "multierr":
					puzzle.checker.resetCache();
					break;

				case "disptype_bosanowa":
					puzzle.setCanvasSizeByCellSize(); /* セルのサイズを変えないために、この関数を引数なしで呼び出す */
					break;

				case "uramashu":
					puzzle.board.revCircleConfig(newval);
					puzzle.redraw();
					break;
			}
		}
	};
