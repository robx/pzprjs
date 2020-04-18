// Variety.js v3.4.1

import mod_amibo from "../variety/amibo.js";
import mod_aquarium from "../variety/aquarium.js";
import mod_araf from "../variety/araf.js";
import mod_balance from "../variety/balance.js";
import mod_barns from "../variety/barns.js";
import mod_bdblock from "../variety/bdblock.js";
import mod_bonsan from "../variety/bonsan.js";
import mod_bosanowa from "../variety/bosanowa.js";
import mod_box from "../variety/box.js";
import mod_castle from "../variety/castle.js";
import mod_cbblock from "../variety/cbblock.js";
import mod_compass from "../variety/compass.js";
import mod_country from "../variety/country.js";
import mod_creek from "../variety/creek.js";
import mod_curvedata from "../variety/curvedata.js";
import mod_doppelblock from "../variety/doppelblock.js";
import mod_dosufuwa from "../variety/dosufuwa.js";
import mod_easyasabc from "../variety/easyasabc.js";
import mod_factors from "../variety/factors.js";
import mod_fillmat from "../variety/fillmat.js";
import mod_fillomino from "../variety/fillomino.js";
import mod_firefly from "../variety/firefly.js";
import mod_geradeweg from "../variety/geradeweg.js";
import mod_goishi from "../variety/goishi.js";
import mod_gokigen from "../variety/gokigen.js";
import mod_hakoiri from "../variety/hakoiri.js";
import mod_hanare from "../variety/hanare.js";
import mod_hashikake from "../variety/hashikake.js";
import mod_hebi from "../variety/hebi.js";
import mod_herugolf from "../variety/herugolf.js";
import mod_heyawake from "../variety/heyawake.js";
import mod_hitori from "../variety/hitori.js";
import mod_icebarn from "../variety/icebarn.js";
import mod_ichimaga from "../variety/ichimaga.js";
import mod_juosan from "../variety/juosan.js";
import mod_kaero from "../variety/kaero.js";
import mod_kakuro from "../variety/kakuro.js";
import mod_kakuru from "../variety/kakuru.js";
import mod_kazunori from "../variety/kazunori.js";
import mod_kinkonkan from "../variety/kinkonkan.js";
import mod_kouchoku from "../variety/kouchoku.js";
import mod_kramma from "../variety/kramma.js";
import mod_kurochute from "../variety/kurochute.js";
import mod_kurodoko from "../variety/kurodoko.js";
import mod_kurotto from "../variety/kurotto.js";
import mod_kusabi from "../variety/kusabi.js";
import mod_lightup from "../variety/lightup.js";
import mod_lits from "../variety/lits.js";
import mod_lookair from "../variety/lookair.js";
import mod_loute from "../variety/loute.js";
import mod_makaro from "../variety/makaro.js";
import mod_mashu from "../variety/mashu.js";
import mod_mejilink from "../variety/mejilink.js";
import mod_midloop from "../variety/midloop.js";
import mod_minarism from "../variety/minarism.js";
import mod_nagare from "../variety/nagare.js";
import mod_nagenawa from "../variety/nagenawa.js";
import mod_nanro from "../variety/nanro.js";
import mod_nawabari from "../variety/nawabari.js";
import mod_nondango from "../variety/nondango.js";
import mod_numlin from "../variety/numlin.js";
import mod_nurikabe from "../variety/nurikabe.js";
import mod_nurimaze from "../variety/nurimaze.js";
import mod_paintarea from "../variety/paintarea.js";
import mod_pencils from "../variety/pencils.js";
import mod_pipelink from "../variety/pipelink.js";
import mod_reflect from "../variety/reflect.js";
import mod_renban from "../variety/renban.js";
import mod_ripple from "../variety/ripple.js";
import mod_roma from "../variety/roma.js";
import mod_scrin from "../variety/scrin.js";
import mod_shakashaka from "../variety/shakashaka.js";
import mod_shikaku from "../variety/shikaku.js";
import mod_shimaguni from "../variety/shimaguni.js";
import mod_shugaku from "../variety/shugaku.js";
import mod_skyscrapers from "../variety/skyscrapers.js";
import mod_slalom from "../variety/slalom.js";
import mod_slither from "../variety/slither.js";
import mod_starbattle from "../variety/starbattle.js";
import mod_sudoku from "../variety/sudoku.js";
import mod_sukoro from "../variety/sukoro.js";
import mod_tapa from "../variety/tapa.js";
import mod_tasquare from "../variety/tasquare.js";
import mod_tatamibari from "../variety/tatamibari.js";
import mod_tateyoko from "../variety/tateyoko.js";
import mod_tawa from "../variety/tawa.js";
import mod_tentaisho from "../variety/tentaisho.js";
import mod_tilepaint from "../variety/tilepaint.js";
import mod_toichika from "../variety/toichika.js";
import mod_triplace from "../variety/triplace.js";
import mod_usoone from "../variety/usoone.js";
import mod_walllogic from "../variety/walllogic.js";
import mod_wblink from "../variety/wblink.js";
import mod_yajikazu from "../variety/yajikazu.js";
import mod_yajilin from "../variety/yajilin.js";
import mod_yajitatami from "../variety/yajitatami.js";
import mod_yinyang from "../variety/yinyang.js";
import mod_yosenabe from "../variety/yosenabe.js";

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

	var variety = function(pid) {
		return _info[toPID(pid)] || { valid: false };
	};
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
			this.module = datalist[4];
			// this.script = !!datalist[4]
				// ? datalist[4]
				// : pzprid; /* スクリプトファイル(クラス) */
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
		// Entries are:
		// 	 id: [?, ?, "name jp", "name en", module, aliases]
		{
			aho: [0, 0, "アホになり切れ", "Aho-ni-Narikire", mod_shikaku],
			amibo: [0, 0, "あみぼー", "Amibo", mod_amibo],
			angleloop: [0, 0, "鋭直鈍ループ", "Angle Loop", mod_kouchoku],
			aquarium: [0, 0, "アクアプレース", "Aquarium", mod_aquarium],
			araf: [0, 0, "相ダ部屋", "Araf", mod_araf],
			armyants: [0, 0, "ぐんたいあり", "Army Ants", mod_kaero],
			arukone: [0, 0, "アルコネ", "Arukone", mod_numlin],
			ayeheya: [0, 1, "∀人∃ＨＥＹＡ", "ekawayeh", mod_heyawake],
			balance: [0, 0, "Balance Loop", "Balance Loop", mod_balance],
			cave: [
				1,
				0,
				"バッグ",
				"Cave",
				mod_kurodoko,
				{ alias: "bag", alias2: "corral", alias3: "correl" }
			],
			barns: [1, 0, "バーンズ", "Barns", mod_barns],
			bdblock: [1, 0, "ボーダーブロック", "Border Block", mod_bdblock],
			bonsan: [1, 0, "ぼんさん", "Bonsan", "bonsan", mod_bonsan],
			bosanowa: [1, 0, "ボサノワ", "Bosanowa", mod_bosanowa, { alias: "bossanova" }],
			box: [0, 0, "ボックス", "Box", mod_box],
			skyscrapers: [
				0,
				0,
				"ビルディングパズル",
				"Skyscrapers",
				mod_skyscrapers,
				{ alias: "building", alias2: "skyscraper" }
			],
			castle: [0, 0, "Castle Wall", "Castle Wall", mod_castle],
			cbblock: [0, 0, "コンビブロック", "Combi Block", mod_cbblock],
			chocona: [0, 0, "チョコナ", "Chocona", mod_shimaguni],
			cojun: [0, 0, "コージュン", "Cojun", mod_ripple],
			compass: [0, 0, "Compass", "Compass", mod_compass],
			country: [1, 0, "カントリーロード", "Country Road", mod_country],
			creek: [1, 0, "クリーク", "Creek", mod_creek],
			curvedata: [0, 0, "カーブデータ", "Curve Data", mod_curvedata],
			"curvedata-aux": [0, 0, "図形の編集", "Edit shape", mod_curvedata],
			dbchoco: [0, 0, "ダブルチョコ", "Double Choco", mod_cbblock],
			doppelblock: [0, 0, "Doppelblock", "Doppelblock", mod_doppelblock],
			dosufuwa: [0, 0, "ドッスンフワリ", "Dosun-Fuwari", mod_dosufuwa],
			doubleback: [0, 0, "引き返す", "Double Back", mod_country],
			easyasabc: [0, 0, "ABCプレース", "Easy as ABC", mod_easyasabc],
			factors: [0, 0, "因子の部屋", "Rooms of Factors", mod_factors],
			fillmat: [1, 0, "フィルマット", "Fillmat", mod_fillmat],
			fillomino: [
				0,
				1,
				"フィルオミノ",
				"Fillomino",
				mod_fillomino,
				{ kanpen2: "fillomino01" }
			],
			firefly: [1, 0, "ホタルビーム", "Hotaru Beam", mod_firefly],
			fivecells: [0, 0, "ファイブセルズ", "FiveCells", mod_nawabari],
			fourcells: [0, 0, "フォーセルズ", "FourCells", mod_nawabari],
			geradeweg: [0, 0, "グラーデヴェグ", "Geradeweg", mod_geradeweg],
			goishi: [0, 1, "碁石ひろい", "Goishi", mod_goishi],
			gokigen: [1, 0, "ごきげんななめ", "Slant", mod_gokigen],
			hakoiri: [1, 0, "はこいり○△□", "Hokoiri-masashi", mod_hakoiri],
			hanare: [0, 0, "はなれ組", "Hanare-gumi", mod_hanare],
			hashikake: [
				0,
				1,
				"橋をかけろ",
				"Hashiwokakero",
				mod_hashikake,
				{ pzprurl: "hashi", kanpen: "hashi", alias: "bridges" }
			],
			hebi: [1, 0, "へびいちご", "Hebi-Ichigo", mod_hebi, { old: "snakes" }],
			herugolf: [0, 0, "ヘルゴルフ", "Herugolf", mod_herugolf],
			heteromino: [0, 0, "ヘテロミノ", "Heteromino", mod_nawabari],
			heyabon: [1, 0, "へやぼん", "Heya-Bon", mod_bonsan],
			heyawake: [
				0,
				1,
				"へやわけ",
				"Heyawake",
				mod_heyawake,
				{ alias: "heyawacky" }
			],
			hitori: [0, 1, "ひとりにしてくれ", "Hitori", mod_hitori],
			icebarn: [1, 0, "アイスバーン", "Icebarn", mod_icebarn],
			icelom: [0, 0, "アイスローム", "Icelom", mod_icebarn],
			icelom2: [0, 0, "アイスローム２", "Icelom2", mod_icebarn],
			ichimaga: [0, 0, "イチマガ", "Ichimaga", mod_ichimaga],
			ichimagam: [0, 0, "磁石イチマガ", "Magnetic Ichimaga", mod_ichimaga],
			ichimagax: [
				0,
				0,
				"一回曲がって交差もするの",
				"Crossing Ichimaga",
				mod_ichimaga
			],
			juosan: [0, 0, "縦横さん", "Juosan", mod_juosan],
			kaero: [1, 0, "お家に帰ろう", "Return Home", mod_kaero],
			kakuro: [0, 1, "カックロ", "Kakuro", mod_kakuro],
			kakuru: [0, 0, "カックル", "Kakuru", mod_kakuru],
			kazunori: [0, 0, "かずのりのへや", "Kazunori Room", mod_kazunori],
			kinkonkan: [1, 0, "キンコンカン", "Kin-Kon-Kan", mod_kinkonkan],
			kouchoku: [0, 0, "交差は直角に限る", "Kouchoku", mod_kouchoku],
			kramma: [0, 0, "快刀乱麻", "KaitoRamma", mod_kramma],
			kramman: [0, 0, "新・快刀乱麻", "New KaitoRamma", mod_kramma],
			kropki: [0, 0, "Kropki", "Kropki", mod_minarism],
			kurochute: [0, 1, "クロシュート", "Kurochute", mod_kurochute],
			kurodoko: [0, 1, "黒どこ(黒マスはどこだ)", "Kurodoko", mod_kurodoko],
			kurotto: [0, 0, "クロット", "Kurotto", mod_kurotto],
			kusabi: [0, 0, "クサビリンク", "Kusabi", mod_kusabi],
			lightup: [
				0,
				1,
				"美術館",
				"Akari",
				mod_lightup,
				{ pzprurl: "akari", kanpen: "bijutsukan" }
			],
			lits: [1, 1, "ＬＩＴＳ", "LITS", mod_lits],
			lookair: [0, 0, "るっくえあ", "Look-Air", mod_lookair],
			loopsp: [1, 0, "環状線スペシャル", "Loop Special", mod_pipelink],
			loute: [0, 0, "エルート", "L-route", mod_loute],
			makaro: [0, 0, "マカロ", "Makaro", mod_makaro],
			mashu: [0, 1, "ましゅ", "Masyu", mod_mashu, { kanpen: "masyu", alias: "pearl" }],
			maxi: [0, 0, "Maxi Loop", "Maxi Loop", mod_country],
			meander: [0, 0, "にょろにょろナンバー", "Meandering Numbers", mod_ripple],
			mejilink: [0, 0, "メジリンク", "Mejilink", mod_mejilink],
			minarism: [1, 0, "マイナリズム", "Minarism", mod_minarism],
			midloop: [0, 0, "ミッドループ", "Mid-loop", mod_midloop],
			mochikoro: [1, 0, "モチコロ", "Mochikoro", mod_nurikabe],
			mochinyoro: [1, 0, "モチにょろ", "Mochinyoro", mod_nurikabe],
			moonsun: [0, 0, "月か太陽", "Moon or Sun", mod_country],
			nagare: [0, 0, "流れるループ", "Nagareru-Loop", mod_nagare],
			nagenawa: [0, 0, "なげなわ", "Nagenawa", mod_nagenawa],
			nanro: [0, 1, "ナンロー", "Nanro", mod_nanro],
			nawabari: [1, 0, "なわばり", "Territory", mod_nawabari],
			nondango: [0, 0, "ノンダンゴ", "Nondango", mod_nondango],
			norinori: [0, 1, "のりのり", "Norinori", mod_lits],
			numlin: [
				0,
				1,
				"ナンバーリンク",
				"Numberlink",
				mod_numlin,
				{ kanpen: "numberlink" }
			],
			nuribou: [1, 0, "ぬりぼう", "Nuribou", mod_nurikabe],
			nurikabe: [0, 1, "ぬりかべ", "Nurikabe", mod_nurikabe],
			nurimaze: [0, 0, "ぬりめいず", "Nuri-Maze", mod_nurimaze],
			nurimisaki: [0, 0, "ぬりみさき", "Nurimisaki", mod_kurodoko],
			onsen: [0, 0, "温泉めぐり", "Onsen-meguri", mod_country],
			paintarea: [1, 0, "ペイントエリア", "Paintarea", mod_paintarea],
			pencils: [0, 0, "ペンシルズ", "Pencils", mod_pencils],
			pipelink: [1, 0, "パイプリンク", "Pipelink", mod_pipelink],
			pipelinkr: [
				1,
				0,
				"帰ってきたパイプリンク",
				"Pipelink Returns",
				mod_pipelink
			],
			rectslider: [0, 0, "四角スライダー", "Rectangle-Slider", mod_bonsan],
			reflect: [1, 0, "リフレクトリンク", "Reflect Link", mod_reflect],
			renban: [0, 0, "連番窓口", "Renban-Madoguchi", mod_renban],
			ringring: [0, 0, "リングリング", "Ring-ring", mod_nagenawa],
			ripple: [
				0,
				1,
				"波及効果",
				"Ripple Effect",
				mod_ripple,
				{ kanpen: "hakyukoka" }
			],
			roma: [0, 0, "ろーま", "Roma", mod_roma, { alias: "rome" }],
			sashigane: [0, 0, "さしがね", "Sashigane", mod_loute],
			satogaeri: [
				0,
				1,
				"さとがえり",
				"Satogaeri",
				mod_bonsan,
				{ alias: "sato", kanpen: "satogaeri" }
			],
			scrin: [0, 0, "スクリン", "Scrin", mod_scrin],
			shakashaka: [0, 1, "シャカシャカ", "Shakashaka", mod_shakashaka],
			shikaku: [0, 1, "四角に切れ", "Shikaku", mod_shikaku],
			shimaguni: [1, 0, "島国", "Islands", mod_shimaguni],
			shugaku: [1, 0, "修学旅行の夜", "School Trip", mod_shugaku],
			shwolf: [0, 0, "ヤギとオオカミ", "Goats and Wolves", mod_kramma],
			simpleloop: [0, 0, "Simple Loop", "Simple Loop", mod_country],
			slalom: [1, 1, "スラローム", "Slalom", mod_slalom, { alias: "suraromu" }],
			slither: [
				0,
				1,
				"スリザーリンク",
				"Slitherlink",
				mod_slither,
				{ kanpen: "slitherlink" }
			],
			starbattle: [0, 0, "スターバトル", "Star Battle", mod_starbattle],
			stostone: [0, 0, "ストストーン", "Stostone", mod_shimaguni],
			sudoku: [0, 1, "数独", "Sudoku", mod_sudoku],
			sukoro: [1, 0, "数コロ", "Sukoro", mod_sukoro],
			sukororoom: [0, 0, "数コロ部屋", "Sukoro-room", mod_sukoro],
			tapa: [0, 0, "Tapa", "Tapa", mod_tapa],
			tasquare: [0, 0, "たすくえあ", "Tasquare", mod_tasquare],
			tatamibari: [1, 0, "タタミバリ", "Tatamibari", mod_tatamibari],
			tateyoko: [1, 0, "タテボーヨコボー", "Tatebo-Yokobo", mod_tateyoko],
			tawa: [0, 0, "たわむれんが", "Tawamurenga", mod_tawa],
			tentaisho: [0, 0, "天体ショー", "Tentaisho", mod_tentaisho],
			tilepaint: [1, 0, "タイルペイント", "Tilepaint", mod_tilepaint],
			toichika: [0, 0, "遠い誓い", "Toichika", mod_toichika],
			triplace: [0, 0, "トリプレイス", "Tri-place", mod_triplace],
			usotatami: [0, 0, "ウソタタミ", "Uso-tatami", mod_fillmat],
			usoone: [0, 0, "ウソワン", "Uso-one", mod_usoone],
			view: [1, 0, "ヴィウ", "View", mod_sukoro],
			wagiri: [0, 0, "ごきげんななめ・輪切", "Wagiri", mod_gokigen],
			walllogic: [0, 0, "ウォールロジック", "Wall Logic", mod_walllogic],
			wblink: [0, 0, "シロクロリンク", "Shirokuro-link", mod_wblink],
			yajikazu: [1, 0, "やじさんかずさん", "Yajisan-Kazusan", mod_yajikazu],
			yajilin: [
				0,
				1,
				"ヤジリン",
				"Yajilin",
				mod_yajilin,
				{ pzprurl: "yajilin", kanpen: "yajilin", alias: "yajirin" }
			],
			"yajilin-regions": [
				0,
				0,
				"ヤジリン",
				"Regional Yajilin",
				mod_yajilin,
				{ alias: "yajirin-regions" }
			],
			yajitatami: [0, 0, "ヤジタタミ", "Yajitatami", mod_yajitatami],
			yinyang: [0, 0, "しろまるくろまる", "Yin-Yang", mod_yinyang],
			yosenabe: [0, 0, "よせなべ", "Yosenabe", mod_yosenabe]
		}
	);

export default variety;
