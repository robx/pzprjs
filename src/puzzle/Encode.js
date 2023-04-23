// Encode.js v3.4.1

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
pzpr.classmgr.makeCommon({
	//---------------------------------------------------------
	Encode: {
		pflag: "",
		outpflag: "",
		outvariant: null,
		outcols: null,
		outrows: null,
		outbstr: "",
		fio: null,

		//---------------------------------------------------------------------------
		// enc.checkpflag()   pflagに指定した文字列が含まれているか調べる
		//---------------------------------------------------------------------------
		// ぱずぷれApplet->v3でURLの仕様が変わったパズル:
		//     creek, gokigen, lits (Applet+c===v3, Applet===v3+d)
		// 何回かURL形式を変更したパズル:
		//     icebarn (v3, Applet+c, Applet), slalom (v3+p, v3+d, v3/Applet)
		// v3になって以降pidを分離したパズルのうち元パズルのURL形式を変更して短くしたパズル:
		//     bonsan, kramma (cを付加)
		// URL形式は同じで表示形式の情報をもたせているパズル:
		//     bosanowa, pipelink, yajilin
		checkpflag: function(ca) {
			return this.pflag.indexOf(ca) >= 0;
		},

		//---------------------------------------------------------------------------
		// enc.decodeURL()   parseURL()を行い、各種各パズルのdecode関数を呼び出す
		// enc.encodeURL()   各種各パズルのencode関数を呼び出し、URLを出力する
		//
		// enc.decodePzpr()  各パズルのURL入力用(オーバーライド用)
		// enc.encodePzpr()  各パズルのURL出力用(オーバーライド用)
		//---------------------------------------------------------------------------
		decodeURL: function(url) {
			var pzl = pzpr.parser.parseURL(url),
				puzzle = this.puzzle,
				bd = puzzle.board;

			if (pzl.variant !== null) {
				puzzle.setConfig("variant", true);
				puzzle.setConfig("variantid", pzl.variant);
			}
			if (pzl.type === pzl.URL_PZPRFILE) {
				new puzzle.klass.FileIO().filedecode(pzl.body);
				return;
			}

			bd.initBoardSize(pzl.cols, pzl.rows);

			if (!!pzl.body) {
				this.pflag = pzl.pflag;
				this.outbstr = pzl.body;
				switch (pzl.type) {
					case pzl.URL_PZPRV3:
					case pzl.URL_KANPENP:
						this.decodePzpr(pzl.URL_PZPRV3);
						break;
					case pzl.URL_PZPRAPP:
						this.decodePzpr(pzl.URL_PZPRAPP);
						break;
					case pzl.URL_KANPEN:
						this.fio = new puzzle.klass.FileIO();
						this.fio.dataarray = this.outbstr.replace(/_/g, " ").split("/");
						this.decodeKanpen();
						this.fio = null;
						break;
					case pzl.URL_HEYAAPP:
						this.decodeHeyaApp();
						break;
				}
			}

			bd.rebuildInfo();
		},
		encodeURL: function(type, mode) {
			var puzzle = this.puzzle,
				pid = puzzle.pid,
				bd = puzzle.board;
			var pzl = new pzpr.parser.URLData("", mode);

			type =
				type || pzl.URL_PZPRV3; /* type===pzl.URL_AUTO(0)もまとめて変換する */
			if (type === pzl.URL_KANPEN && pid === "lits") {
				type = pzl.URL_KANPENP;
			}

			this.outpflag = null;
			var variant = puzzle.getConfig("variant");
			this.outvariant = variant ? puzzle.getConfig("variantid") : null;
			this.outcols = bd.cols;
			this.outrows = bd.rows;
			this.outbstr = "";

			switch (type) {
				case pzl.URL_PZPRV3:
					this.encodePzpr(pzl.URL_PZPRV3);
					break;

				case pzl.URL_PZPRFILE:
					var lines = this.puzzle.getFileData(pzl.FILE_PZPRV3).split("\n");
					lines = lines.map(encodeURIComponent);
					this.outbstr = lines.join("/");
					break;

				case pzl.URL_PZPRAPP:
					throw Error("no implementation");

				case pzl.URL_KANPENP:
					if (!puzzle.info.exists.kanpen) {
						throw Error("no implementation");
					}
					this.encodePzpr(pzl.URL_PZPRAPP);
					this.outpflag = this.outpflag || "";
					break;

				case pzl.URL_KANPEN:
					this.fio = new puzzle.klass.FileIO();
					this.encodeKanpen();
					this.outbstr = this.fio.datastr
						.replace(/\r?\n/g, "/")
						.replace(/ /g, "_");
					this.fio = null;
					break;

				case pzl.URL_HEYAAPP:
					this.encodeHeyaApp();
					break;

				default:
					throw Error("invalid URL Type");
			}

			pzl.pid = pid;
			pzl.type = type;
			pzl.pflag = this.outpflag;
			pzl.variant = this.outvariant;
			pzl.cols = this.outcols;
			pzl.rows = this.outrows;
			pzl.body = this.outbstr;

			return pzl.generate();
		},

		// オーバーライド用
		decodePzpr: function(type) {
			throw Error("no implementation");
		},
		encodePzpr: function(type) {
			throw Error("no implementation");
		},
		decodeKanpen: function() {
			throw Error("no implementation");
		},
		encodeKanpen: function() {
			throw Error("no implementation");
		},
		decodeHeyaApp: function() {
			throw Error("no implementation");
		},
		encodeHeyaApp: function() {
			throw Error("no implementation");
		}
	}
});
