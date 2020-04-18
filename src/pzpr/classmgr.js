// classmgr.js v3.6.0

import variety from './variety.js';

//---------------------------------------------------------------
// クラス設定用関数など
//---------------------------------------------------------------
var common = {}; // CoreClass保存用
var custom = { "": {} }; // パズル別クラス保存用

//----------------------------------------------------------------------------
// ★pzpr.classmgrオブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
var classmgr = {
	//---------------------------------------------------------------
	// 共通クラス・パズル別クラスに継承させる親クラスを生成する
	//---------------------------------------------------------------
	makeCommon: function(commonbase) {
		this.createCommon(commonbase);
	},
	createCommon: function(commonbase) {
		for (var key in commonbase) {
			var names = this.searchName(key),
				NewClass = common[names.real];
			if (!NewClass) {
				NewClass = this.createClass(common[names.base]);
				NewClass.prototype.common = NewClass.prototype;
				NewClass.prototype.pid = "";
			}
			this.extendPrototype(NewClass.prototype, commonbase[key]);
			common[names.real] = custom[""][names.real] = NewClass;
		}
	},

	//---------------------------------------------------------------
	// includeCustomFileでファイルを読み込んだ後の処理
	//---------------------------------------------------------------
	makeCustom: function(pidlist, custombase) {
		for (var i = 0; i < pidlist.length; i++) {
			var pid = pidlist[i];
			custom[pid] = this.createCustom(pid, custombase);
		}
	},
	getExtension: function(pid, custombase) {
		var extension = {};
		for (var hashkey in custombase) {
			var proto = custombase[hashkey],
				name = hashkey,
				pidcond = [],
				isexist = false;
			var name = !hashkey.match("#")
				? hashkey
				: hashkey.substr(0, hashkey.indexOf("#"));
			if (name.match("@")) {
				pidcond = name.substr(name.indexOf("@") + 1).split(/,/);
				name = name.substr(0, name.indexOf("@"));
				for (var n = 0; n < pidcond.length; n++) {
					if (pidcond[n] === pid) {
						isexist = true;
						break;
					}
				}
				if (!isexist) {
					continue;
				}
			}
			if (!extension[name]) {
				extension[name] = {};
			}
			for (var key in proto) {
				extension[name][key] = proto[key];
			}
		}
		return extension;
	},
	createCustom: function(pid, custombase) {
		var local_custom = {};
		var extension = this.getExtension(pid, custombase);

		// 追加プロパティが指定されているクラスを作成する
		for (var key in extension) {
			var names = this.searchName(key),
				NewClass = local_custom[names.real];
			if (!NewClass) {
				NewClass = this.createClass(
					local_custom[names.base] || common[names.base]
				);
				NewClass.prototype.pid = pid;
			}
			this.extendPrototype(NewClass.prototype, extension[key]);
			local_custom[names.real] = NewClass;
		}

		// 指定がなかった残りの共通クラスを作成(コピー)する
		for (var classname in common) {
			if (!local_custom[classname]) {
				local_custom[classname] = this.createClass(common[classname]);
				local_custom[classname].prototype.pid = pid;
			}
		}

		return local_custom;
	},

	//---------------------------------------------------------------
	// createCommon, createCustomから呼び出される共通処理
	//---------------------------------------------------------------
	searchName: function(key) {
		key = key.replace(/\s+/g, "");
		var colon = key.indexOf(":"),
			basename = "",
			realname = key;
		if (colon >= 0) {
			basename = key.substr(colon + 1);
			realname = key.substr(0, colon);
		}
		return { base: basename || realname, real: realname };
	},
	createClass: function(BaseClass) {
		function NewClass() {}
		if (!!BaseClass) {
			this.extendPrototype(NewClass.prototype, BaseClass.prototype);
		}
		return NewClass;
	},
	extendPrototype: function(NewProto, proto) {
		proto = proto || {};
		for (var name in proto) {
			if (
				proto[name] !== null &&
				typeof proto[name] === "object" &&
				proto[name].constructor === Object
			) {
				if (!NewProto[name]) {
					NewProto[name] = {};
				}
				this.extendPrototype(NewProto[name], proto[name]);
			} else {
				NewProto[name] = proto[name];
			}
		}
	},

	//---------------------------------------------------------------
	// 単体ファイルの読み込み
	// idを取得して、ファイルを読み込み
	//---------------------------------------------------------------
	includeCustomFile: function(pid) {
		var module = variety(pid).module;
		this.makeCustom(module[0], module[1]);
	},
	includedFile: {},

	//---------------------------------------------------------------------------
	// 新しくパズルのファイルを開く時の処理
	//---------------------------------------------------------------------------
	setPuzzleClass: function(puzzle, newpid, callback) {
		if (!variety(newpid).valid) {
			puzzle.emit("fail-open");
			throw "Invalid Puzzle Variety Selected";
		}

		/* 今のパズルと別idの時 */
		if (puzzle.pid !== newpid) {
			if (!custom[newpid]) {
				this.includeCustomFile(newpid);
				if (!custom[newpid]) {
					/* Customファイルが読み込みできるまで待つ */
					setTimeout(function() {
						classmgr.setPuzzleClass(puzzle, newpid, callback);
					}, 10);
					return;
				}
			}

			/* 各クラスをpzpr.customから設定する */
			this.setClasses(puzzle, newpid);
		}

		callback();
	},

	//---------------------------------------------------------------
	// パズル種類別のクラスをパズルのクラス一覧に設定する
	//      共通クラス        (pzpr.common)
	//   -> パズル種類別クラス (pzpr.custom)
	//   -> パズルが保持するクラス (initialize()の呼び出しやthis.puzzle等がつく)
	// と、ちょっとずつ変わっている状態になります
	//---------------------------------------------------------------
	setClasses: function(puzzle, pid) {
		/* 現在のクラスを消去する */
		puzzle.klass = {};

		var local_custom = custom[pid];
		for (var classname in local_custom) {
			var PuzzleClass = (puzzle.klass[classname] = function() {
				var args = Array.prototype.slice.apply(arguments);
				if (!!this.initialize) {
					this.initialize.apply(this, args);
				}
			});
			var CustomProto = local_custom[classname].prototype;
			for (var name in CustomProto) {
				PuzzleClass.prototype[name] = CustomProto[name];
			}
		}

		this.setPrototypeRef(puzzle, "puzzle", puzzle);
		this.setPrototypeRef(puzzle, "klass", puzzle.klass);

		puzzle.pid = pid;
		puzzle.info = variety(pid);
	},

	//---------------------------------------------------------------------------
	// パズルオブジェクト下に存在するクラスのprototypeへ一括でプロパティを付加する
	//---------------------------------------------------------------------------
	setPrototypeRef: function(puzzle, name, ref) {
		for (var klassname in puzzle.klass) {
			puzzle.klass[klassname].prototype[name] = ref;
		}
	}
};

export {common, custom, classmgr};
