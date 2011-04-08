(function(){

var PZLINFO = {
	extend : function(obj){ for(var i in obj){ this[i] = obj[i];}},
	info   : {}
};
var register = function(pzprid, scriptid, strja, stren, alias){
	PZLINFO.info[pzprid] = {
		pzprid  : pzprid,	/* パズルID */
		script  : (!!scriptid ? scriptid : pzprid),	/* スクリプトファイル(クラス) */
		ja      : strja,		/* 日本語パズル名 */
		en      : stren,		/* 英語パズル名 */
		alias   : {}
	};
	if(alias!==(void 0)){
		/* pzprurl : ぱずぷれID(URL出力用) */
		/* kanpen  : カンペンID            */
		/* kanpen2 : カンペンID(入力のみ)  */
		PZLINFO.info[pzprid].alias  = alias;
	}
};

register('aho',        '',           'アホになり切れ',           'Aho-ni-Narikire');
register('ayeheya',    '',           '∀人∃ＨＥＹＡ',           'ekawayeh');
register('bag',        '',           'バッグ',                   'BAG (Corral)');
register('barns',      '',           'バーンズ',                 'Barns');
register('bdblock',    '',           'ボーダーブロック',         'Border Block');
register('bonsan',     'bonsan',     'ぼんさん',                 'Bonsan');
register('bosanowa',   '',           'ボサノワ',                 'Bosanowa');
register('box',        '',           'ボックス',                 'Box');
register('cbblock',    '',           'コンビブロック',           'Combi Block');
register('chocona',    '',           'チョコナ',                 'Chocona');
register('cojun',      '',           'コージュン',               'Cojun');
register('country',    '',           'カントリーロード',         'Country Road');
register('creek',      '',           'クリーク',                 'Creek');
register('factors',    '',           '因子の部屋',               'Rooms of Factors');
register('fillmat',    '',           'フィルマット',             'Fillmat');
register('fillomino',  '',           'フィルオミノ',             'Fillomino', { kanpen2:'fillomino01'});
register('firefly',    '',           'ホタルビーム',             'Hotaru Beam (Glow of Fireflies)');
register('fivecells',  '',           'ファイブセルズ',           'FiveCells');
register('fourcells',  '',           'フォーセルズ',             'FourCells');
register('goishi',     '',           '碁石ひろい',               'Goishi');
register('gokigen',    '',           'ごきげんななめ',           'Gokigen-naname');
register('hakoiri',    '',           'はこいり○△□',           'Triplets');
register('hashikake',  '',           '橋をかけろ',               'Bridges', { kanpen:'hashi'});
register('heyawake',   '',           'へやわけ',                 'Heyawake');
register('heyabon',    'bonsan',     'へやぼん',                 'Heya-Bon');
register('hitori',     '',           'ひとりにしてくれ',         'Hitori');
register('icebarn',    '',           'アイスバーン',             'Icebarn');
register('icelom',     'icelom',     'アイスローム',             'Icelom');
register('icelom2',    'icelom',     'アイスローム２',           'Icelom2');
register('ichimaga',   'ichimaga',   'イチマガ',                 'Ichimaga');
register('ichimagam',  'ichimaga',   '磁石イチマガ',             'Crossing Ichimaga');
register('ichimagax',  'ichimaga',   '一回曲がって交差もするの', 'Magnetic Ichimaga');
register('kaero',      '',           'お家に帰ろう',             'Return Home');
register('kakuro',     '',           'カックロ',                 'Kakuro');
register('kakuru',     '',           'カックル',                 'Kakuru');
register('kinkonkan',  '',           'キンコンカン',             'Kin-Kon-Kan');
register('kouchoku',   '',           '交差は直角に限る',         'Kouchoku');
register('kramma',     'kramma',     '快刀乱麻',                 'KaitoRamma');
register('kramman',    'kramma',     '新・快刀乱麻',             'New KaitoRamma');
register('kurochute',  '',           'クロシュート',             'Kurochute');
register('kurodoko',   '',           '黒どこ(黒マスはどこだ)',   'Kurodoko');
register('kusabi',     '',           'クサビリンク',             'Kusabi');
register('lightup',    '',           '美術館',                   'Akari (Light Up)', { pzprurl:'akari', kanpen:'bijutsukan'});
register('lits',       '',           'ＬＩＴＳ',                 'LITS');
register('loopsp',     '',           '環状線スペシャル',         'Loop Special');
register('loute',      '',           'エルート',                 'L-route');
register('mashu',      '',           'ましゅ',                   'Masyu (Pearl Puzzle)', { kanpen:'masyu'});
register('mejilink',   '',           'メジリンク',               'Mejilink');
register('minarism',   '',           'マイナリズム',             'Minarism');
register('mochikoro',  '',           'モチコロ',                 'Mochikoro');
register('mochinyoro', '',           'モチにょろ',               'Mochinyoro');
register('nagenawa',   '',           'なげなわ',                 'Nagenawa');
register('nanro',      '',           'ナンロー',                 'Nanro');
register('nawabari',   '',           'なわばり',                 'Territory');
register('norinori',   '',           'のりのり',                 'Norinori');
register('numlin',     '',           'ナンバーリンク',           'Numberlink', { kanpen:'numberlink'});
register('nuribou',    '',           'ぬりぼう',                 'Nuribou');
register('nurikabe',   '',           'ぬりかべ',                 'Nurikabe');
register('paintarea',  '',           'ペイントエリア',           'Paintarea');
register('pipelink',   'pipelink',   'パイプリンク',             'Pipelink');
register('pipelinkr',  'pipelink',   '帰ってきたパイプリンク',   'Pipelink Returns');
register('reflect',    '',           'リフレクトリンク',         'Reflect Link');
register('renban',     '',           '連番窓口',                 'Renban-Madoguchi');
register('ripple',     '',           '波及効果',                 'Ripple Effect', { kanpen:'hakyukoka'});
register('roma',       '',           'ろーま',                   'Roma');
register('shakashaka', '',           'シャカシャカ',             'ShakaShaka');
register('shikaku',    '',           '四角に切れ',               'Shikaku');
register('shimaguni',  '',           '島国',                     'Islands');
register('shugaku',    '',           '修学旅行の夜',             'School Trip');
register('shwolf',     '',           'ヤギとオオカミ',           'Sheeps and Wolves');
register('slalom',     '',           'スラローム',               'Slalom');
register('slither',    '',           'スリザーリンク',           'Slitherlink', { kanpen:'slitherlink'});
register('snakes',     '',           'へびいちご',               'Hebi-Ichigo');
register('sudoku',     '',           '数独',                     'Sudoku');
register('sukoro',     '',           '数コロ',                   'Sukoro');
register('sukororoom', '',           '数コロ部屋',               'Sukoro-room');
register('tasquare',   '',           'たすくえあ',               'Tasquare');
register('tatamibari', '',           'タタミバリ',               'Tatamibari');
register('tateyoko',   '',           'タテボーヨコボー',         'Tatebo-Yokobo');
register('tawa',       '',           'たわむれんが',             'Tawamurenga');
register('tentaisho',  '',           '天体ショー',               'Tentaisho');
register('tilepaint',  '',           'タイルペイント',           'Tilepaint');
register('toichika',   '',           '遠い誓い',                 'Toichika');
register('triplace',   '',           'トリプレイス',             'Tri-place');
register('usotatami',  '',           'ウソタタミ',               'Uso-tatami');
register('view',       '',           'ヴィウ',                   'View');
register('wagiri',     '',           'ごきげんななめ・輪切',     'Gokigen-naname:wagiri');
register('wblink',     '',           'シロクロリンク',           'Shirokuro-link');
register('yajikazu',   '',           'やじさんかずさん',         'Yajisan-Kazusan');
register('yajirin',    '',           'ヤジリン',                 'Yajilin', { pzprurl:'yajilin', kanpen:'yajilin'});

/* 関数 */
PZLINFO.extend({
	exists : function(name){ return !!this.toPID(name);},
	toPID : function(name){
		if(!!this.info[name].ja){ return name;}
		for(var pid in this.info){
			if(!this.info[pid].alias){ continue;}
			for(var type in this.info[pid].alias){
				if(this.info[pid].alias[type]===name){ return pid;}
			}
		}
		return '';
	},
	toScript : function(pid){
		return (!!this.info[pid] ? this.info[pid].script : '');
	},
	toURLID : function(pid){
		return (!!this.info[pid].alias.pzprurl ? this.info[pid].alias.pzprurl : pid);
	},
	toKanpen : function(pid){
		return (!!this.info[pid].alias.kanpen ? !!this.info[pid].alias.kanpen : pid);
	},
});

/* extern */
window.PZLINFO = PZLINFO;

})();
