// Variety.js v3.4.1
/* global Set:false */

(function() {
	var _info = {},
		_list = [];
	function toPID(name) {
		if (!!_info[name]) {
			return name;
		}
		for (var pid in _info) {
			if (!_info[pid].alias) {
				continue;
			}
			for (var type in _info[pid].alias) {
				if (_info[pid].alias[type] === name) {
					return pid;
				}
			}
		}
		return "";
	}

	var variety = (pzpr.variety = pzpr.genre = function(pid) {
		return _info[toPID(pid)] || { valid: false };
	});
	variety.extend = function(obj) {
		for (var n in obj) {
			this[n] = obj[n];
		}
	};
	variety.extend({
		info: _info,
		toPID: toPID,
		exists: function(name) {
			return variety(name).valid;
		},
		each: function(func) {
			for (var pid in _info) {
				func(pid);
			}
		},
		getList: function() {
			return _list.slice();
		}
	});
	delete variety.extend;

	/*
	 * To avoid fragmentation, I'm disabling all old genres for the time being,
	 * to try to avoid having 3 websites to choose from (puzz.link, pzv.jp and this one).
	 *
	 * To remove the inhibitor, delete all references to `inhibited` and `allowedGenres`.
	 *
	 * -X_Sheep
	 */
	var inhibited = false;
	if (pzpr.env.browser) {
		inhibited =
			window.location.protocol !== "file:" &&
			window.location.host.indexOf("localhost") === -1;
	} else if (pzpr.env.node) {
		inhibited = process.env.VERCEL;
	}
	var allowedGenres = new Set([
		"dotchi",
		"crossstitch",
		"ovotovata",
		"lohkous",
		"chainedb",
		"canal",
		"cbanana",
		"oneroom",
		"bdwalk",
		"voxas",
		"tontti",
		"rassi",
		"parquet",
		"lapaz",
		"tren",
		"pentominous",
		"hinge",
		"tajmahal",
		"statuepark",
		"statuepark-aux",
		"railpool",
		"coral"
	]);

	(function(Genre, obj) {
		for (var pzprid in obj) {
			if (inhibited && !allowedGenres.has(pzprid)) {
				continue;
			}
			_info[pzprid] = new Genre(pzprid, obj[pzprid]);
			try {
				Object.freeze(_info[pzprid]);
				Object.freeze(_info[pzprid].exists);
				Object.freeze(_info[pzprid].alias);
			} catch (e) {}
		}
	})(
		// eslint-disable-next-line no-unexpected-multiline
		function Genre(pzprid, datalist) {
			this.valid = true;
			this.pid = pzprid; /* パズルID */
			this.script = !!datalist[4]
				? datalist[4]
				: pzprid; /* スクリプトファイル(クラス) */
			this.ja = datalist[2]; /* 日本語パズル名 */
			this.en = datalist[3]; /* 英語パズル名 */
			this.exists = {
				pzprapp: !!datalist[0],
				kanpen: !!datalist[1],
				pencilbox: !!datalist[1]
			};
			this.exists.pencilbox =
				this.exists.pencilbox &&
				pzprid !== "nanro" &&
				pzprid !== "ayeheya" &&
				pzprid !== "kurochute";
			/* pzprurl : ぱずぷれID(URL出力用) */
			/* kanpen  : カンペンID            */
			/* kanpen2 : カンペンID(入力のみ)  */
			this.alias = !!datalist[5] ? datalist[5] : {};
			this.urlid = this.alias.pzprurl || pzprid;
			this.kanpenid = !!datalist[1] ? this.alias.kanpen || pzprid : "";
			_list.push(pzprid);
		},
		{
			aho: [0, 0, "アホになり切れ", "Aho-ni-Narikire", "shikaku"],
			amibo: [0, 0, "あみぼー", "Amibo", "amibo"],
			angleloop: [0, 0, "鋭直鈍ループ", "Angle Loop", "kouchoku"],
			aqre: [0, 0, "Aqre", "Aqre", "aqre"],
			aquarium: [0, 0, "アクアプレース", "Aquarium", "aquarium"],
			araf: [0, 0, "相ダ部屋", "Araf", "araf"],
			armyants: [0, 0, "ぐんたいあり", "Army Ants", "kaero"],
			arukone: [0, 0, "アルコネ", "Arukone", "numlin"],
			ayeheya: [0, 1, "∀人∃ＨＥＹＡ", "ekawayeh", "heyawake"],
			balance: [0, 0, "Balance Loop", "Balance Loop"],
			cave: [1, 0, "バッグ", "Cave", "kurodoko", { alias: "bag" }],
			cbanana: [0, 0, "チョコバナナ", "Choco Banana"],
			crossstitch: [0, 0, "Crossstitch", "Crossstitch"],
			barns: [1, 0, "バーンズ", "Barns"],
			bdblock: [1, 0, "ボーダーブロック", "Border Block"],
			bdwalk: [0, 0, "ビルウォーク", "Building Walk", "haisu"],
			bonsan: [1, 0, "ぼんさん", "Bonsan", "bonsan"],
			bosanowa: [1, 0, "ボサノワ", "Bosanowa", "", { alias: "bossanova" }],
			box: [0, 0, "ボックス", "Box"],
			skyscrapers: [
				0,
				0,
				"ビルディングパズル",
				"Skyscrapers",
				"",
				{ alias: "building", alias2: "skyscraper" }
			],
			canal: [0, 0, "Canal View", "Canal View", "nurikabe"],
			castle: [0, 0, "Castle Wall", "Castle Wall"],
			cbblock: [0, 0, "コンビブロック", "Combi Block"],
			chainedb: [0, 0, "チェンブロ", "Chained Block"],
			chocona: [0, 0, "チョコナ", "Chocona", "shimaguni"],
			cojun: [0, 0, "コージュン", "Cojun", "ripple"],
			compass: [0, 0, "Compass", "Compass", "compass"],
			coral: [0, 0, "Coral", "Coral", "nonogram"],
			country: [1, 0, "カントリーロード", "Country Road"],
			creek: [1, 0, "クリーク", "Creek"],
			curvedata: [0, 0, "カーブデータ", "Curve Data"],
			"curvedata-aux": [0, 0, "図形の編集", "Edit shape"],
			dbchoco: [0, 0, "ダブルチョコ", "Double Choco", "cbblock"],
			detour: [0, 0, "Detour", "Detour", "country"],
			doppelblock: [0, 0, "Doppelblock", "Doppelblock", "doppelblock"],
			dosufuwa: [0, 0, "ドッスンフワリ", "Dosun-Fuwari"],
			dotchi: [0, 0, "ドッチループ", "Dotchi-Loop", "country"],
			doubleback: [0, 0, "Double Back", "Double Back", "country"],
			easyasabc: [0, 0, "ABCプレース", "Easy as ABC"],
			factors: [0, 0, "因子の部屋", "Rooms of Factors"],
			fillmat: [1, 0, "フィルマット", "Fillmat", "fillmat"],
			fillomino: [
				0,
				1,
				"フィルオミノ",
				"Fillomino",
				"",
				{ kanpen2: "fillomino01" }
			],
			firefly: [1, 0, "ホタルビーム", "Hotaru Beam"],
			fivecells: [0, 0, "ファイブセルズ", "FiveCells", "nawabari"],
			fourcells: [0, 0, "フォーセルズ", "FourCells", "nawabari"],
			geradeweg: [0, 0, "グラーデヴェグ", "Geradeweg"],
			goishi: [0, 1, "碁石ひろい", "Goishi"],
			gokigen: [1, 0, "ごきげんななめ", "Slant", "gokigen"],
			haisu: [0, 0, "Haisu", "Haisu"],
			hakoiri: [1, 0, "はこいり○△□", "Hakoiri-masashi"],
			hanare: [0, 0, "はなれ組", "Hanare-gumi", "hanare"],
			hashikake: [
				0,
				1,
				"橋をかけろ",
				"Hashiwokakero",
				"",
				{ pzprurl: "hashi", kanpen: "hashi", alias: "bridges" }
			],
			hebi: [1, 0, "へびいちご", "Hebi-Ichigo", "", { old: "snakes" }],
			herugolf: [0, 0, "ヘルゴルフ", "Herugolf"],
			heteromino: [0, 0, "ヘテロミノ", "Heteromino", "nawabari"],
			heyabon: [1, 0, "へやぼん", "Heya-Bon", "bonsan"],
			heyawake: [
				0,
				1,
				"へやわけ",
				"Heyawake",
				"heyawake",
				{ alias: "heyawacky" }
			],
			hinge: [0, 0, "ちょうつがい", "Hinge", "shimaguni"],
			hitori: [0, 1, "ひとりにしてくれ", "Hitori"],
			icebarn: [1, 0, "アイスバーン", "Icebarn", "icebarn"],
			icelom: [0, 0, "アイスローム", "Icelom", "icebarn"],
			icelom2: [0, 0, "アイスローム２", "Icelom 2", "icebarn"],
			ichimaga: [0, 0, "イチマガ", "Ichimaga", "ichimaga"],
			ichimagam: [0, 0, "磁石イチマガ", "Magnetic Ichimaga", "ichimaga"],
			ichimagax: [
				0,
				0,
				"一回曲がって交差もするの",
				"Crossing Ichimaga",
				"ichimaga"
			],
			interbd: [0, 0, "International Borders", "International Borders"],
			juosan: [0, 0, "縦横さん", "Juosan"],
			kaero: [1, 0, "お家に帰ろう", "Return Home"],
			kakuro: [0, 1, "カックロ", "Kakuro"],
			kakuru: [0, 0, "カックル", "Kakuru"],
			kazunori: [0, 0, "かずのりのへや", "Kazunori Room"],
			kinkonkan: [1, 0, "キンコンカン", "Kin-Kon-Kan"],
			kouchoku: [0, 0, "交差は直角に限る", "Kouchoku"],
			kramma: [0, 0, "快刀乱麻", "KaitoRamma", "kramma"],
			kramman: [0, 0, "新・快刀乱麻", "New KaitoRamma", "kramma"],
			kropki: [0, 0, "Kropki", "Kropki", "minarism"],
			kurochute: [0, 1, "クロシュート", "Kurochute"],
			kurodoko: [0, 1, "黒どこ(黒マスはどこだ)", "Kurodoko"],
			kurotto: [0, 0, "クロット", "Kurotto"],
			kusabi: [0, 0, "クサビリンク", "Kusabi"],
			lapaz: [0, 0, "La Paz", "La Paz"],
			lightup: [
				0,
				1,
				"美術館",
				"Akari",
				"",
				{ pzprurl: "akari", kanpen: "bijutsukan" }
			],
			lits: [1, 1, "ＬＩＴＳ", "LITS", "lits"],
			lohkous: [0, 0, "Lohkous", "Lohkous"],
			lookair: [0, 0, "るっくえあ", "Look-Air"],
			loopsp: [1, 0, "環状線スペシャル", "Loop Special", "pipelink"],
			loute: [0, 0, "エルート", "L-route"],
			makaro: [0, 0, "マカロ", "Makaro"],
			mashu: [0, 1, "ましゅ", "Masyu", "", { kanpen: "masyu", alias: "pearl" }],
			maxi: [0, 0, "Maxi Loop", "Maxi Loop", "country"],
			meander: [0, 0, "にょろにょろナンバー", "Meandering Numbers", "ripple"],
			mejilink: [0, 0, "メジリンク", "Mejilink"],
			minarism: [1, 0, "マイナリズム", "Minarism"],
			mines: [0, 0, "マインスイーパ", "Minesweeper", "kurotto"],
			midloop: [0, 0, "ミッドループ", "Mid-loop"],
			mochikoro: [1, 0, "モチコロ", "Mochikoro", "nurikabe"],
			mochinyoro: [1, 0, "モチにょろ", "Mochinyoro", "nurikabe"],
			moonsun: [0, 0, "月か太陽", "Moon or Sun", "country"],
			nagare: [0, 0, "流れるループ", "Nagareru-Loop"],
			nagenawa: [0, 0, "なげなわ", "Nagenawa", "nagenawa"],
			nanro: [0, 1, "ナンロー", "Nanro"],
			nawabari: [1, 0, "なわばり", "Territory", "nawabari"],
			nikoji: [0, 0, "NIKOJI", "NIKOJI", "cbblock"],
			nondango: [0, 0, "ノンダンゴ", "Nondango"],
			nonogram: [0, 0, "ののぐらむ", "Nonogram"],
			norinori: [0, 1, "のりのり", "Norinori", "lits"],
			numlin: [
				0,
				1,
				"ナンバーリンク",
				"Numberlink",
				"",
				{ kanpen: "numberlink" }
			],
			nuribou: [1, 0, "ぬりぼう", "Nuribou", "nurikabe"],
			nurikabe: [0, 1, "ぬりかべ", "Nurikabe", "nurikabe"],
			nurimaze: [0, 0, "ぬりめいず", "Nuri-Maze", "nurimaze"],
			nurimisaki: [0, 0, "ぬりみさき", "Nurimisaki", "kurodoko"],
			ovotovata: [0, 0, "Ovotovata", "Ovotovata", "country"],
			oneroom: [0, 0, "ワンルームワンドア", "One Room One Door", "heyawake"],
			onsen: [0, 0, "温泉めぐり", "Onsen-meguri", "country"],
			paintarea: [1, 0, "ペイントエリア", "Paintarea"],
			parquet: [0, 0, "Parquet", "Parquet"],
			pencils: [0, 0, "ペンシルズ", "Pencils"],
			pentominous: [0, 0, "Pentominous", "Pentominous", "fillomino"],
			pipelink: [1, 0, "パイプリンク", "Pipelink", "pipelink"],
			pipelinkr: [
				1,
				0,
				"帰ってきたパイプリンク",
				"Pipelink Returns",
				"pipelink"
			],
			putteria: [0, 0, "プッテリア", "Putteria", "hanare"],
			railpool: [0, 0, "Rail Pool", "Rail Pool"],
			rassi: [0, 0, "Rassi Silai", "Rassi Silai", "country"],
			rectslider: [0, 0, "四角スライダー", "Rectangle-Slider", "bonsan"],
			reflect: [1, 0, "リフレクトリンク", "Reflect Link"],
			renban: [0, 0, "連番窓口", "Renban-Madoguchi"],
			ringring: [0, 0, "リングリング", "Ring-ring", "nagenawa"],
			ripple: [
				0,
				1,
				"波及効果",
				"Ripple Effect",
				"ripple",
				{ kanpen: "hakyukoka" }
			],
			roma: [0, 0, "ろーま", "Roma", "", { alias: "rome" }],
			sashigane: [0, 0, "さしがね", "Sashigane", "loute"],
			satogaeri: [
				0,
				1,
				"さとがえり",
				"Satogaeri",
				"bonsan",
				{ alias: "sato", kanpen: "satogaeri" }
			],
			scrin: [0, 0, "スクリン", "Scrin"],
			shakashaka: [0, 1, "シャカシャカ", "Shakashaka"],
			shikaku: [0, 1, "四角に切れ", "Shikaku", "shikaku"],
			shimaguni: [1, 0, "島国", "Islands", "shimaguni"],
			shugaku: [1, 0, "修学旅行の夜", "School Trip"],
			shwolf: [0, 0, "ヤギとオオカミ", "Goats and Wolves", "kramma"],
			simpleloop: [0, 0, "Simple Loop", "Simple Loop", "country"],
			slalom: [1, 1, "スラローム", "Slalom", "", { alias: "suraromu" }],
			slither: [
				0,
				1,
				"スリザーリンク",
				"Slitherlink",
				"",
				{ kanpen: "slitherlink" }
			],
			snake: [0, 0, "Snake", "Snake"],
			starbattle: [0, 0, "スターバトル", "Star Battle"],
			statuepark: [0, 0, "Statue Park", "Statue Park"],
			"statuepark-aux": [0, 0, "図形の編集", "Edit shape"],
			stostone: [0, 0, "ストストーン", "Stostone", "shimaguni"],
			sudoku: [0, 1, "数独", "Sudoku"],
			sukoro: [1, 0, "数コロ", "Sukoro", "sukoro"],
			sukororoom: [0, 0, "数コロ部屋", "Sukoro-room", "sukoro"],
			symmarea: [0, 0, "シンメトリーエリア", "Symmetry Area", "fillomino"],
			tajmahal: [0, 0, "タージ・マハル", "Taj Mahal", "kouchoku"],
			tapa: [0, 0, "Tapa", "Tapa"],
			tapaloop: [0, 0, "Tapa-Like Loop", "Tapa-Like Loop"],
			tasquare: [0, 0, "たすくえあ", "Tasquare"],
			tatamibari: [1, 0, "タタミバリ", "Tatamibari"],
			tateyoko: [1, 0, "タテボーヨコボー", "Tatebo-Yokobo"],
			tawa: [0, 0, "たわむれんが", "Tawamurenga"],
			tentaisho: [0, 0, "天体ショー", "Tentaisho"],
			tents: [0, 0, "Tents", "Tents", "tents"],
			tilepaint: [1, 0, "タイルペイント", "Tilepaint"],
			toichika: [0, 0, "遠い誓い", "Toichika"],
			toichika2: [0, 0, "遠い誓い２", "Toichika 2", "toichika"],
			tontti: [0, 0, "Tonttiraja", "Tonttiraja"],
			tren: [0, 0, "パーキング", "Tren"],
			triplace: [0, 0, "トリプレイス", "Tri-place"],
			usotatami: [0, 0, "ウソタタミ", "Uso-tatami", "fillmat"],
			usoone: [0, 0, "ウソワン", "Uso-one"],
			view: [1, 0, "ヴィウ", "View", "sukoro"],
			voxas: [0, 0, "Voxas", "Voxas"],
			wagiri: [0, 0, "ごきげんななめ・輪切", "Wagiri", "gokigen"],
			walllogic: [0, 0, "ウォールロジック", "Wall Logic"],
			wblink: [0, 0, "シロクロリンク", "Shirokuro-link"],
			yajikazu: [1, 0, "やじさんかずさん", "Yajisan-Kazusan"],
			yajilin: [
				0,
				1,
				"ヤジリン",
				"Yajilin",
				"",
				{ pzprurl: "yajilin", kanpen: "yajilin", alias: "yajirin" }
			],
			"yajilin-regions": [
				0,
				0,
				"ヘヤジリン",
				"Regional Yajilin",
				"yajilin",
				{ alias: "yajirin-regions" }
			],
			yajitatami: [0, 0, "ヤジタタミ", "Yajitatami"],
			yinyang: [0, 0, "しろまるくろまる", "Yin-Yang"],
			yosenabe: [0, 0, "よせなべ", "Yosenabe"]
		}
	);
})();
