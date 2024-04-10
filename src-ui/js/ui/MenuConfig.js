// MenuConfig.js v3.4.1

(function() {
	//---------------------------------------------------------------------------
	// ★MenuConfigクラス UI側の設定値を管理する
	//---------------------------------------------------------------------------
	var Config = pzpr.Puzzle.prototype.Config.prototype;

	// メニュー描画/取得/html表示系
	// Menuクラス
	ui.menuconfig = {
		list: null, // MenuConfigの設定内容を保持する
		puzzle: null,

		//---------------------------------------------------------------------------
		// menuconfig.init()  MenuConfigの初期化を行う
		// menuconfig.add()   初期化時に設定を追加する
		//---------------------------------------------------------------------------
		init: function() {
			this.list = {};

			/* 正解自動判定機能 */
			this.add("autocheck_mode", "simple", {
				option: ["off", "simple", "guarded"]
			});

			/* per-solve autocheck status, turned off when complete */
			this.add("autocheck_once", ui.puzzle.playeronly, {
				volatile: true
			});

			this.add("keypopup", false); /* キーポップアップ (数字などのパネル入力) */

			this.add("adjsize", true); /* 自動横幅調節 */
			this.add(
				"cellsizeval",
				ui.windowWidth() <= 960 ? 36 : 48
			); /* セルのサイズ設定用 */
			this.add(
				"fullwidth",
				ui.windowWidth() < 600
			); /* キャンバスを横幅いっぱいに広げる */

			this.add("toolarea", true); /* ツールエリアの表示 */

			this.add("inputmode", "auto", { volatile: true }); /* inputMode */
			this.add("auxeditor_inputmode", "auto", { volatile: true });

			this.add("lrinvert", false, {
				volatile: true
			}); /* マウスの左右ボタンを反転する設定 */

			this.add("language", pzpr.lang, { option: ["en", "ja"] }); /* 言語設定 */

			/* puzzle.configを一括で扱うため登録 */
			this.puzzle = ui.puzzle;
			for (var name in ui.puzzle.config.list) {
				var item = ui.puzzle.config.list[name],
					extoption = { puzzle: true };
				for (var field in item.extoption) {
					extoption[field] = item[field];
				}
				this.add(name, item.defval, extoption);
			}
			this.add("mode", !ui.puzzle.playmode ? "edit" : "play", {
				option: ["edit", "play"],
				puzzle: true
			});
		},
		add: function(name, defvalue, extoption) {
			Config.add.call(this, name, defvalue, extoption);
			if (!!extoption && extoption.puzzle) {
				var item = this.list[name];
				item.volatile = item.puzzle = true;
			}
		},

		//---------------------------------------------------------------------------
		// menuconfig.sync()  URL形式などによって変化する可能性がある設定値を同期する
		//---------------------------------------------------------------------------
		sync: function() {
			var dirty = this.isDirty;
			var idname = [];
			switch (ui.puzzle.pid) {
				case "yajilin":
				case "lixloop":
					idname = "disptype_yajilin";
					break;
				case "bosanowa":
					idname = "disptype_bosanowa";
					break;
				case "interbd":
					idname = "disptype_interbd";
					break;
				case "arukone":
					idname = "dontpassallcell";
					break;
				case "aquarium":
					idname = "aquarium_regions";
					break;
				case "country":
					idname = "country_empty";
					break;
				case "voxas":
					idname = "voxas_tatami";
					break;
				case "tren":
				case "news":
					idname = "tren_new";
					break;
				case "nuriuzu":
					idname = "nuriuzu_connect";
					break;
				case "pentopia":
					idname = "pentopia_transparent";
					break;
				case "koburin":
					idname = ["disptype_yajilin", "koburin_minesweeper"];
					break;
				case "akichi":
					idname = "akichi_maximum";
					break;
				case "magnets":
					idname = "magnets_anti";
					break;
				case "context":
					idname = "context_marks";
					break;
				case "heyapin":
					idname = "heyapin_overlap";
					break;
				case "bdwalk":
					idname = "bdwalk_height";
					break;
			}

			if (typeof idname === "string") {
				idname = [idname];
			}
			for (var i in idname) {
				this.set(idname[i], ui.puzzle.getConfig(idname[i]));
			}

			this.set("variant", ui.puzzle.getConfig("variant"));
			this.set("lrinvert", ui.puzzle.mouse.inversion);
			this.set("autocmp", ui.puzzle.getConfig("autocmp"));
			this.set("autoerr", ui.puzzle.getConfig("autoerr"));

			this.isDirty = dirty;
		},

		//---------------------------------------------------------------------------
		// menuconfig.getCurrentName()  指定されたidを現在使用している名前に変換する
		//---------------------------------------------------------------------------
		getCurrentName: Config.getCurrentName,
		getNormalizedName: Config.getNormalizedName,

		//---------------------------------------------------------------------------
		// menuconfig.get()  各フラグの設定値を返す
		// menuconfig.get()  各フラグの設定値を返す
		// menuconfig.reset() 各フラグの設定値を初期化する
		//---------------------------------------------------------------------------
		get: Config.get,
		set: function(argname, newval) {
			var names = this.getNormalizedName(argname),
				idname = names.name;
			if (!this.list[idname]) {
				return;
			}

			if (idname === "mode" || idname === "inputmode") {
				ui.auxeditor.close();
			}

			if (idname === "mode") {
				ui.puzzle.setMode(newval);
				newval = !ui.puzzle.playmode ? "edit" : "play";
			} else if (idname === "inputmode") {
				ui.puzzle.mouse.setInputMode(newval);
				newval = ui.puzzle.mouse.inputMode;
			} else if (idname === "auxeditor_inputmode") {
				ui.auxeditor.puzzle.mouse.setInputMode(newval);
				newval = ui.auxeditor.puzzle.mouse.inputMode;
			}

			newval = this.setproper(names, newval);

			if (idname === "language") {
				pzpr.lang = newval;
			} else if (this.list[idname].puzzle) {
				ui.puzzle.setConfig(argname, newval);
			}
			if (
				!this.list[idname].volatile ||
				(ui.puzzle.config.list[argname] &&
					!ui.puzzle.config.list[argname].volatile)
			) {
				this.isDirty = true;
			}

			this.configevent(idname, newval);
		},
		reset: Config.reset,

		//---------------------------------------------------------------------------
		// menuconfig.restore()  保存された各種設定値を元に戻す
		// menuconfig.save()     各種設定値を保存する
		//---------------------------------------------------------------------------
		restore: function() {
			/* 設定が保存されている場合は元に戻す */
			ui.puzzle.config.init();
			this.init();
			var json_puzzle = localStorage.getItem("pzprv3_config:puzzle");
			var json_menu = localStorage.getItem("pzprv3_config:ui");
			if (!!json_puzzle) {
				this.setAll(JSON.parse(json_puzzle));
			}
			if (!!json_menu) {
				this.setAll(JSON.parse(json_menu));
			}
			this.isDirty = false;
		},
		isDirty: false,
		save: function() {
			if (!this.isDirty) {
				return;
			}

			try {
				localStorage.setItem(
					"pzprv3_config:puzzle",
					JSON.stringify(ui.puzzle.saveConfig())
				);
				localStorage.setItem("pzprv3_config:ui", JSON.stringify(this.getAll()));
			} catch (ex) {
				console.warn(ex);
			}
			this.isDirty = false;
		},

		//---------------------------------------------------------------------------
		// menuconfig.getList()  現在有効な設定値のリストを返す
		//---------------------------------------------------------------------------
		getList: Config.getList,
		getexec: function(name) {
			if (!this.list[name]) {
				return false;
			}
			if (name === "mode") {
				return !ui.puzzle.playeronly;
			} else if (this.list[name].puzzle) {
				return ui.puzzle.validConfig(name);
			}
			return true;
		},

		//---------------------------------------------------------------------------
		// menuconfig.getAll()  全フラグの設定値を返す
		// menuconfig.setAll()  全フラグの設定値を設定する
		//---------------------------------------------------------------------------
		getAll: Config.getAll,
		setAll: function(setting) {
			for (var key in setting) {
				this.set(key, setting[key]);
			}
			this.list.autocheck_once.val = this.list.autocheck_mode.val !== "off";
		},

		//---------------------------------------------------------------------------
		// menuconfig.setproper()    設定値の型を正しいものに変換して設定変更する
		// menuconfig.valid()        設定値が有効なパズルかどうかを返す
		//---------------------------------------------------------------------------
		setproper: Config.setproper,
		valid: function(idname) {
			if (!this.list[idname]) {
				return false;
			}
			if (idname === "keypopup") {
				return ui.keypopup.paneltype[1] !== 0 || ui.keypopup.paneltype[3] !== 0;
			} else if (idname === "mode") {
				return !ui.puzzle.playeronly;
			} else if (idname === "timer") {
				return ui.puzzle.playeronly;
			} else if (idname === "inputmode") {
				return (
					ui.puzzle.mouse.getInputModeList("play").length > 1 ||
					(!ui.puzzle.playeronly &&
						ui.puzzle.mouse.getInputModeList("edit").length > 1)
				);
			} else if (idname === "autocheck_mode" || idname === "autocheck_once") {
				return ui.puzzle.playeronly && !ui.puzzle.getConfig("variant");
			} else if (this.list[idname].puzzle) {
				return ui.puzzle.validConfig(idname);
			}
			return true;
		},

		//---------------------------------------------------------------------------
		// config.configevent()  設定変更時の動作を記述する (modeはlistener.onModeChangeで変更)
		//---------------------------------------------------------------------------
		configevent: function(idname, newval) {
			if (!ui.menuarea.menuitem) {
				return;
			}
			ui.setdisplay(idname);
			switch (idname) {
				case "keypopup":
					ui.keypopup.display();
					break;

				case "adjsize":
				case "cellsizeval":
				case "fullwidth":
					ui.adjustcellsize();
					break;

				case "autocheck_mode":
					this.list.autocheck_once.val = newval !== "off";
					break;

				case "timer":
					ui.toolarea.display();
					break;
				case "language":
					ui.displayAll();
					break;

				case "lrinvert":
					ui.puzzle.mouse.setInversion(newval);
					break;
			}
		}
	};
})();
