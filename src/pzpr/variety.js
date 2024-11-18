// Variety.js v3.4.1

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

	(function(Genre, obj) {
		for (var pzprid in obj) {
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
			akichi: [0, 0, "Akichiwake", "Akichiwake", "heyawake"],
			alter: [0, 0, "オルタネーション", "Alternation", "hakoiri"],
			amibo: [0, 0, "あみぼー", "Amibo", "amibo"],
			angleloop: [0, 0, "鋭直鈍ループ", "Angle Loop", "kouchoku"],
			anglers: [0, 0, "フィッシング", "Anglers"],
			antmill: [0, 0, "Ant Mill", "Ant Mill", "scrin"],
			archipelago: [0, 0, "アーキペラゴ", "Archipelago", "chainedb"],
			aqre: [0, 0, "Aqre", "Aqre", "aqre"],
			aquapelago: [0, 0, "Aquapelago", "Aquapelago"],
			aquarium: [0, 0, "アクアプレース", "Aquarium", "aquarium"],
			araf: [0, 0, "相ダ部屋", "Araf", "araf"],
			armyants: [0, 0, "ぐんたいあり", "Army Ants", "kaero"],
			arukone: [0, 0, "アルコネ", "Arukone", "numlin"],
			ayeheya: [0, 1, "∀人∃ＨＥＹＡ", "Ayeheya", "heyawake"],
			balance: [0, 0, "Balance Loop", "Balance Loop"],
			barns: [1, 0, "バーンズ", "Barns"],
			batten: [0, 0, "Battenberg Painting", "Battenberg Painting"],
			battleship: [0, 0, "Battleship", "Battleship", "statuepark"],
			bdblock: [1, 0, "ボーダーブロック", "Border Block"],
			bdwalk: [0, 0, "ビルウォーク", "Building Walk", "haisu"],
			bonsan: [1, 0, "ぼんさん", "Bonsan", "bonsan"],
			bosanowa: [1, 0, "ボサノワ", "Bosanowa", "", { alias: "bossanova" }],
			bosnianroad: [0, 0, "Bosnian Road", "Bosnian Road"],
			box: [0, 0, "ボックス", "Box"],
			brownies: [0, 0, "ブラウニー", "Brownies", "yosenabe"],
			cave: [1, 0, "バッグ", "Cave", "kurodoko", { alias: "bag" }],
			cbanana: [0, 0, "チョコバナナ", "Choco Banana"],
			circlesquare: [0, 0, "Circles and Squares", "Circles and Squares"],
			context: [0, 0, "Context", "Context"],
			crossstitch: [0, 0, "Crossstitch", "Crossstitch"],
			cts: [0, 0, "Cross the Streams", "Cross the Streams", "nonogram"],
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
			cocktail: [0, 0, "カクテルランプ", "Cocktail Lamp", "shimaguni"],
			coffeemilk: [0, 0, "コーヒー牛乳", "Coffee Milk", "wblink"],
			cojun: [0, 0, "コージュン", "Cojun", "ripple"],
			compass: [0, 0, "Compass", "Compass", "compass"],
			coral: [0, 0, "Coral", "Coral", "nonogram"],
			country: [1, 0, "カントリーロード", "Country Road"],
			creek: [1, 0, "クリーク", "Creek"],
			curvedata: [0, 0, "カーブデータ", "Curve Data"],
			"curvedata-aux": [0, 0, "図形の編集", "Edit shape"],
			curving: [0, 0, "カービングロード", "Curving Road"],
			dbchoco: [0, 0, "ダブルチョコ", "Double Choco", "cbblock"],
			detour: [0, 0, "Detour", "Detour", "country"],
			disloop: [0, 0, "Disorderly Loop", "Disorderly Loop", "tapaloop"],
			dominion: [0, 0, "ドミニオン", "Dominion"],
			doppelblock: [0, 0, "Doppelblock", "Doppelblock", "doppelblock"],
			dosufuwa: [0, 0, "ドッスンフワリ", "Dosun-Fuwari"],
			dotchi: [0, 0, "ドッチループ", "Dotchi-Loop", "country"],
			doubleback: [0, 0, "Double Back", "Double Back", "country"],
			easyasabc: [0, 0, "ABCプレース", "Easy as ABC"],
			evolmino: [0, 0, "シンカミノ", "Evolmino"],
			factors: [0, 0, "因子の部屋", "Rooms of Factors"],
			fakearrow: [0, 0, "フェイクアロー", "Fake Arrow", "nagare"],
			familyphoto: [0, 0, "家族写真", "Family Photo"],
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
			firewalk: [1, 0, "Fire Walk", "Fire Walk", "icewalk"],
			fivecells: [0, 0, "ファイブセルズ", "FiveCells", "nawabari"],
			fourcells: [0, 0, "フォーセルズ", "FourCells", "nawabari"],
			fracdiv: [0, 0, "分数分割", "Fractional Division"],
			geradeweg: [0, 0, "グラーデヴェグ", "Geradeweg"],
			goishi: [0, 1, "碁石ひろい", "Goishi"],
			gokigen: [1, 0, "ごきげんななめ", "Slant", "gokigen"],
			guidearrow: [0, 0, "ガイドアロー", "Guide Arrow"],
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
			heyablock: [0, 0, "へやブロ", "Heyablock", "shimaguni"],
			heyabon: [1, 0, "へやぼん", "Heya-Bon", "bonsan"],
			heyapin: [0, 0, "へやピン", "Heyapin"],
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
			icewalk: [0, 0, "アイスウォーク", "Ice Walk"],
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
			invlitso: [0, 0, "Inverse LITSO", "Inverse LITSO", "lits"],
			juosan: [0, 0, "縦横さん", "Juosan"],
			kaero: [1, 0, "お家に帰ろう", "Return Home"],
			kaidan: [0, 0, "かいだんしばり", "Stairwell"],
			kaisu: [0, 0, "Kaisu", "Kaisu", "haisu"],
			kakuro: [0, 1, "カックロ", "Kakuro"],
			kakuru: [0, 0, "カックル", "Kakuru"],
			kazunori: [0, 0, "かずのりのへや", "Kazunori Room"],
			kinkonkan: [1, 0, "キンコンカン", "Kin-Kon-Kan"],
			kissing: [
				0,
				0,
				"Kissing Polyominoes",
				"Kissing Polyominoes",
				"statuepark"
			],
			koburin: [0, 0, "コブリン", "Koburin", "yajilin"],
			kouchoku: [0, 0, "交差は直角に限る", "Kouchoku"],
			kramma: [0, 0, "快刀乱麻", "KaitoRamma", "kramma"],
			kramman: [0, 0, "新・快刀乱麻", "New KaitoRamma", "kramma"],
			kropki: [0, 0, "Kropki", "Kropki", "minarism"],
			kurochute: [0, 1, "クロシュート", "Kurochute"],
			kuroclone: [0, 0, "クロクローン", "Kuroclone"],
			kurodoko: [0, 1, "黒どこ(黒マスはどこだ)", "Kurodoko"],
			kuromenbun: [0, 0, "クロメンブン", "Kuromenbun"],
			kurotto: [0, 0, "クロット", "Kurotto"],
			kusabi: [0, 0, "クサビリンク", "Kusabi"],
			ladders: [0, 0, "はしごをかけろ", "Ladders"],
			lapaz: [0, 0, "La Paz", "La Paz"],
			lightshadow: [0, 0, "Light and Shadow", "Light and Shadow"],
			lightup: [
				0,
				1,
				"美術館",
				"Akari",
				"",
				{ pzprurl: "akari", kanpen: "bijutsukan" }
			],
			lineofsight: [0, 0, "サイトライン", "Line of Sight"],
			lither: [0, 0, "Litherslink", "Litherslink"],
			lits: [1, 1, "ＬＩＴＳ", "LITS", "lits"],
			lixloop: [0, 0, "LIX Loop", "LIX Loop", "yajilin"],
			lohkous: [0, 0, "Lohkous", "Lohkous"],
			lollipops: [0, 0, "ペロペロキャンディ", "Lollipops"],
			lookair: [0, 0, "るっくえあ", "Look-Air"],
			loopsp: [1, 0, "環状線スペシャル", "Loop Special", "pipelink"],
			loute: [0, 0, "エルート", "L-route"],
			magnets: [0, 0, "Magnets", "Magnets"],
			makaro: [0, 0, "マカロ", "Makaro"],
			mannequin: [0, 0, "マネキンゲート", "Mannequin Gate"],
			martini: [0, 0, "マティーニ", "Martini", "shimaguni"],
			mashu: [0, 1, "ましゅ", "Masyu", "", { kanpen: "masyu", alias: "pearl" }],
			maxi: [0, 0, "Maxi Loop", "Maxi Loop", "country"],
			meander: [0, 0, "にょろにょろナンバー", "Meandering Numbers", "ripple"],
			meidjuluk: [0, 0, "Meidjuluk", "Meidjuluk", "snakeegg"],
			mejilink: [0, 0, "メジリンク", "Mejilink"],
			minarism: [1, 0, "マイナリズム", "Minarism"],
			mines: [0, 0, "マインスイーパ", "Minesweeper", "kurotto"],
			midloop: [0, 0, "ミッドループ", "Mid-loop"],
			mirrorbk: [0, 0, "ミラーブロック", "Mirror Block", "cbblock"],
			mochikoro: [1, 0, "モチコロ", "Mochikoro", "nurikabe"],
			mochinyoro: [1, 0, "モチにょろ", "Mochinyoro", "nurikabe"],
			moonsun: [0, 0, "月か太陽", "Moon or Sun", "country"],
			mrtile: [0, 0, "ミラーリングタイル", "Mirroring Tile", "chainedb"],
			mukkonn: [0, 0, "Mukkonn Enn", "Mukkonn Enn", "compass"],
			myopia: [0, 0, "Myopia", "Myopia"],
			nagare: [0, 0, "流れるループ", "Nagareru-Loop"],
			nagenawa: [0, 0, "なげなわ", "Nagenawa", "nagenawa"],
			nanameguri: [0, 0, "ななめぐり", "Nanameguri"],
			nanro: [0, 1, "ナンロー", "Nanro"],
			nawabari: [1, 0, "なわばり", "Nawabari", "nawabari"],
			news: [0, 0, "NEWS", "NEWS", "toichika"],
			nikoji: [0, 0, "NIKOJI", "NIKOJI", "cbblock"],
			nondango: [0, 0, "ノンダンゴ", "Nondango"],
			nonogram: [0, 0, "ののぐらむ", "Nonogram"],
			norinori: [0, 1, "のりのり", "Norinori", "lits"],
			norinuri: [0, 0, "海苔ぬり", "Norinuri", "nurikabe"],
			nothing: [0, 0, "オールｏｒナッシング", "All or Nothing", "country"],
			nothree: [0, 0, "ノースリー", "No Three"],
			numlin: [
				0,
				1,
				"ナンバーリンク",
				"Numberlink",
				"",
				{ kanpen: "numberlink" }
			],
			numrope: [0, 0, "ナンバーロープ", "Number Rope", "kakuru"],
			nuribou: [1, 0, "ぬりぼう", "Nuribou", "nurikabe"],
			nurikabe: [0, 1, "ぬりかべ", "Nurikabe", "nurikabe"],
			nurimaze: [0, 0, "ぬりめいず", "Nuri-Maze", "nurimaze"],
			nurimisaki: [0, 0, "ぬりみさき", "Nurimisaki", "kurodoko"],
			nuriuzu: [0, 0, "ぬりうず", "Nuri-uzu", "tentaisho"],
			ovotovata: [0, 0, "Ovotovata", "Ovotovata", "country"],
			oneroom: [0, 0, "ワンルームワンドア", "One Room One Door", "heyawake"],
			onsen: [0, 0, "温泉めぐり", "Onsen-meguri", "country"],
			oyakodori: [0, 0, "おやこどり", "Oyakodori", "kaero"],
			paintarea: [1, 0, "ペイントエリア", "Paintarea"],
			parquet: [0, 0, "Parquet", "Parquet"],
			patchwork: [0, 0, "パッチワーク", "Patchwork"],
			pencils: [0, 0, "ペンシルズ", "Pencils"],
			pentatouch: [0, 0, "Penta Touch", "Penta Touch", "statuepark"],
			pentominous: [0, 0, "Pentominous", "Pentominous", "fillomino"],
			pentopia: [0, 0, "Pentopia", "Pentopia", "statuepark"],
			pipelink: [1, 0, "パイプリンク", "Pipelink", "pipelink"],
			pipelinkr: [
				1,
				0,
				"帰ってきたパイプリンク",
				"Pipelink Returns",
				"pipelink"
			],
			pmemory: [0, 0, "Persistence of Memory", "Persistence of Memory"],
			portal: [0, 0, "Portal Loop", "Portal Loop"],
			putteria: [0, 0, "プッテリア", "Putteria", "hanare"],
			ququ: [0, 0, "区区", "Ququ"],
			railpool: [0, 0, "Rail Pool", "Rail Pool"],
			rassi: [0, 0, "Rassi Silai", "Rassi Silai", "country"],
			rectslider: [0, 0, "四角スライダー", "Rectangle-Slider", "bonsan"],
			reflect: [1, 0, "リフレクトリンク", "Reflect Link"],
			"regional-poly": [
				0,
				0,
				"Regional Polyominoes",
				"Regional Polyominoes",
				"statuepark"
			],
			remlen: [0, 0, "Remembered Length", "Remembered Length", "country"],
			renban: [0, 0, "連番窓口", "Renban-Madoguchi"],
			retroships: [
				0,
				0,
				"Retrograde Battleships",
				"Retrograde Battleships",
				"statuepark"
			],
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
			roundtrip: [0, 0, "Round Trip", "Round Trip"],
			sananko: [0, 0, "サンアンコー", "San-Anko", "kakuru"],
			sashigane: [0, 0, "さしがね", "Sashigane", "loute"],
			sashikazune: [0, 0, "さしカズね", "Sashikazune", "loute"],
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
			simplegako: [0, 0, "シンプルガコ", "Simple Gako"],
			simpleloop: [0, 0, "Simple Loop", "Simple Loop", "country"],
			slalom: [1, 1, "スラローム", "Slalom", "", { alias: "suraromu" }],
			slashpack: [0, 0, "Slash Pack", "Slash Pack"],
			slither: [
				0,
				1,
				"スリザーリンク",
				"Slitherlink",
				"",
				{ kanpen: "slitherlink" }
			],
			smullyan: [0, 0, "Smullyanic Dynasty", "Smullyanic Dynasty", "context"],
			snake: [0, 0, "Snake", "Snake"],
			snakeegg: [0, 0, "Snake Egg", "Snake Egg"],
			snakepit: [0, 0, "Snake Pit", "Snake Pit", "fillomino"],
			starbattle: [0, 0, "スターバトル", "Star Battle"],
			squarejam: [0, 0, "Square Jam", "Square Jam"],
			statuepark: [0, 0, "Statue Park", "Statue Park"],
			"statuepark-aux": [0, 0, "図形の編集", "Edit shape"],
			stostone: [0, 0, "ストストーン", "Stostone", "shimaguni"],
			subomino: [0, 0, "Subomino", "Subomino", "nawabari"],
			sudoku: [0, 1, "数独", "Sudoku"],
			sukoro: [1, 0, "数コロ", "Sukoro", "sukoro"],
			sukororoom: [0, 0, "数コロ部屋", "Sukoro-room", "sukoro"],
			swslither: [
				0,
				0,
				"Sheep Wolf Slitherlink",
				"Sheep Wolf Slitherlink",
				"slither"
			],
			symmarea: [0, 0, "シンメトリーエリア", "Symmetry Area", "fillomino"],
			tachibk: [0, 0, "たちあわせブロック", "Tachiawase Block"],
			tajmahal: [0, 0, "タージ・マハル", "Taj Mahal", "kouchoku"],
			takoyaki: [0, 0, "たこ焼き", "Takoyaki", "kaidan"],
			tapa: [0, 0, "Tapa", "Tapa"],
			tapaloop: [0, 0, "Tapa-Like Loop", "Tapa-Like Loop"],
			tasquare: [0, 0, "たすくえあ", "Tasquare"],
			tatamibari: [1, 0, "タタミバリ", "Tatamibari"],
			tateyoko: [1, 0, "タテボーヨコボー", "Tatebo-Yokobo"],
			tawa: [0, 0, "たわむれんが", "Tawamurenga"],
			tentaisho: [0, 0, "天体ショー", "Tentaisho"],
			tents: [0, 0, "Tents", "Tents", "tents"],
			teri: [0, 0, "テリトリー", "Territory", "kurodoko"],
			tetrochain: [0, 0, "テトロチェーン", "Tetrochain"],
			tetrominous: [0, 0, "Tetrominous", "Tetrominous", "fillomino"],
			tilepaint: [1, 0, "タイルペイント", "Tilepaint"],
			toichika: [0, 0, "遠い誓い", "Toichika"],
			toichika2: [0, 0, "遠い誓い２", "Toichika 2", "toichika"],
			tontonbeya: [0, 0, "とんとんべや", "Tontonbeya", "hakoiri"],
			tontti: [0, 0, "Tonttiraja", "Tonttiraja"],
			trainstations: [0, 0, "Train Stations", "Train Stations"],
			tren: [0, 0, "パーキング", "Tren"],
			triplace: [0, 0, "トリプレイス", "Tri-place"],
			tslither: [0, 0, "Touch Slitherlink", "Touch Slitherlink", "vslither"],
			turnaround: [0, 0, "ターンアラウンド", "Turnaround"],
			twinarea: [0, 0, "ツインエリア", "Twin Area", "hanare"],
			usotatami: [0, 0, "ウソタタミ", "Uso-tatami", "fillmat"],
			usoone: [0, 0, "ウソワン", "Uso-one"],
			view: [1, 0, "ヴィウ", "View", "sukoro"],
			voxas: [0, 0, "Voxas", "Voxas"],
			vslither: [0, 0, "Vertex Slitherlink", "Vertex Slitherlink"],
			wafusuma: [0, 0, "和フスマ", "Wafusuma", "fillomino"],
			wagiri: [0, 0, "ごきげんななめ・輪切", "Wagiri", "gokigen"],
			walllogic: [0, 0, "ウォールロジック", "Wall Logic"],
			waterwalk: [0, 0, "ウォーターウォーク", "Water Walk", "icewalk"],
			wblink: [0, 0, "シロクロリンク", "Shirokuro-link"],
			wittgen: [0, 0, "Wittgenstein Briquet", "Wittgenstein Briquet", "kaidan"],
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
			yajirushi2: [0, 0, "見つめあう矢印２", "Yajirushi 2", "toichika"],
			yajisoko: [0, 0, "やじさん倉庫番", "Yajisan-Sokoban", "yosenabe"],
			yajitatami: [0, 0, "ヤジタタミ", "Yajitatami"],
			yinyang: [0, 0, "しろまるくろまる", "Yin-Yang"],
			yosenabe: [0, 0, "よせなべ", "Yosenabe"],
			zabajaba: [0, 0, "Zabajaba", "Zabajaba", "kaidan"]
		}
	);
})();
