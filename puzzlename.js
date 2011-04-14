(function(){

var PZLINFO = {
	info   : {},

	register : function(obj){
		for(var pzprid in obj){
			PZLINFO.info[pzprid] = new PZLDATA(pzprid,obj[pzprid]);
		}
	},
	exists : function(name){
		return !!this.toPID(name);
	},
	toPID : function(name){
		if(!!this.info[name] && !!this.info[name].ja){ return name;}
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
	}
};

var PZLDATA = function(){
	this.init.apply(this,arguments);
};
PZLDATA.prototype = {
	init : function(pzprid, datalist){
		this.pzprid = pzprid;		/* パズルID */
		this.script = (!!datalist[4] ? datalist[4] : this.pzprid);	/* スクリプトファイル(クラス) */
		this.ja     = datalist[2];	/* 日本語パズル名 */
		this.en     = datalist[3];	/* 英語パズル名 */
		this.exists = {
			pzprapp : !!datalist[0],
			kanpen  : !!datalist[1]
		};
		/* pzprurl : ぱずぷれID(URL出力用) */
		/* kanpen  : カンペンID            */
		/* kanpen2 : カンペンID(入力のみ)  */
		this.alias  = (datalist[5]!==(void 0) ? datalist[5] : {});
	}
};

PZLINFO.register({
	aho       :[false, false, 'アホになり切れ', 'Aho-ni-Narikire', '', {}],
	ayeheya   :[false, true,  '∀人∃ＨＥＹＡ', 'ekawayeh', '', {}],
	bag       :[true,  false, 'バッグ', 'BAG (Corral)', '', {}],
	barns     :[true,  false, 'バーンズ', 'Barns', '', {}],
	bdblock   :[true,  false, 'ボーダーブロック', 'Border Block', '', {}],
	bonsan    :[true,  false, 'ぼんさん', 'Bonsan', 'bonsan', {}],
	bosanowa  :[true,  false, 'ボサノワ', 'Bosanowa', '', {}],
	box       :[false, false, 'ボックス', 'Box', '', {}],
	cbblock   :[false, false, 'コンビブロック', 'Combi Block', '', {}],
	chocona   :[false, false, 'チョコナ', 'Chocona', '', {}],
	cojun     :[false, false, 'コージュン', 'Cojun', '', {}],
	country   :[true,  false, 'カントリーロード', 'Country Road', '', {}],
	creek     :[true,  false, 'クリーク', 'Creek', '', {}],
	factors   :[false, false, '因子の部屋', 'Rooms of Factors', '', {}],
	fillmat   :[true,  false, 'フィルマット', 'Fillmat', '', {}],
	fillomino :[false, true,  'フィルオミノ', 'Fillomino', '', { kanpen2:'fillomino01'}],
	firefly   :[true,  false, 'ホタルビーム', 'Hotaru Beam (Glow of Fireflies)', '', {}],
	fivecells :[false, false, 'ファイブセルズ', 'FiveCells', '', {}],
	fourcells :[false, false, 'フォーセルズ', 'FourCells', '', {}],
	goishi    :[false, true,  '碁石ひろい', 'Goishi', '', {}],
	gokigen   :[true,  false, 'ごきげんななめ', 'Gokigen-naname', '', {}],
	hakoiri   :[true,  false,  'はこいり○△□', 'Triplets', '', {}],
	hashikake :[false, true,  '橋をかけろ', 'Bridges', '', { kanpen:'hashi'}],
	heyawake  :[false, true,  'へやわけ', 'Heyawake', '', {}],
	heyabon   :[true,  false,  'へやぼん', 'Heya-Bon', 'bonsan', {}],
	hitori    :[false, true,  'ひとりにしてくれ', 'Hitori', '', {}],
	icebarn   :[true,  false, 'アイスバーン', 'Icebarn', '', {}],
	icelom    :[false, false, 'アイスローム', 'Icelom', 'icelom', {}],
	icelom2   :[false, false, 'アイスローム２', 'Icelom2', 'icelom', {}],
	ichimaga  :[false, false, 'イチマガ', 'Ichimaga', 'ichimaga', {}],
	ichimagam :[false, false, '磁石イチマガ', 'Magnetic Ichimaga', 'ichimaga', {}],
	ichimagax :[false, false, '一回曲がって交差もするの', 'Crossing Ichimaga', 'ichimaga', {}],
	kaero     :[true,  false, 'お家に帰ろう', 'Return Home', '', {}],
	kakuro    :[false, true,  'カックロ', 'Kakuro', '', {}],
	kakuru    :[false, false, 'カックル', 'Kakuru', '', {}],
	kinkonkan :[true,  false, 'キンコンカン', 'Kin-Kon-Kan', '', {}],
	kouchoku  :[false, false, '交差は直角に限る', 'Kouchoku', '', {}],
	kramma    :[false, false, '快刀乱麻', 'KaitoRamma', 'kramma', {}],
	kramman   :[false, false, '新・快刀乱麻', 'New KaitoRamma', 'kramma', {}],
	kurochute :[false, true,  'クロシュート', 'Kurochute', '', {}],
	kurodoko  :[false, true,  '黒どこ(黒マスはどこだ)', 'Kurodoko', '', {}],
	kusabi    :[false, false, 'クサビリンク', 'Kusabi', '', {}],
	lightup   :[false, true,  '美術館', 'Akari (Light Up)', '', { pzprurl:'akari', kanpen:'bijutsukan'}],
	lits      :[true,  true,  'ＬＩＴＳ', 'LITS', '', {}],
	loopsp    :[true,  false, '環状線スペシャル', 'Loop Special', '', {}],
	loute     :[false, false, 'エルート', 'L-route', '', {}],
	mashu     :[false, true,  'ましゅ', 'Masyu (Pearl Puzzle)', '', { kanpen:'masyu'}],
	mejilink  :[false, false, 'メジリンク', 'Mejilink', '', {}],
	minarism  :[true,  false, 'マイナリズム', 'Minarism', '', {}],
	mochikoro :[true,  false, 'モチコロ', 'Mochikoro', '', {}],
	mochinyoro:[true,  false, 'モチにょろ', 'Mochinyoro', '', {}],
	nagenawa  :[false, false, 'なげなわ', 'Nagenawa', '', {}],
	nanro     :[false, true,  'ナンロー', 'Nanro', '', {}],
	nawabari  :[true,  false, 'なわばり', 'Territory', '', {}],
	norinori  :[false, true,  'のりのり', 'Norinori', '', {}],
	numlin    :[false, true,  'ナンバーリンク', 'Numberlink', '', { kanpen:'numberlink'}],
	nuribou   :[true,  false, 'ぬりぼう', 'Nuribou', '', {}],
	nurikabe  :[false, true,  'ぬりかべ', 'Nurikabe', '', {}],
	paintarea :[true,  false, 'ペイントエリア', 'Paintarea', '', {}],
	pipelink  :[true,  false, 'パイプリンク', 'Pipelink', 'pipelink', {}],
	pipelinkr :[true,  false, '帰ってきたパイプリンク', 'Pipelink Returns', 'pipelink', {}],
	reflect   :[true,  false, 'リフレクトリンク', 'Reflect Link', '', {}],
	renban    :[false, false, '連番窓口', 'Renban-Madoguchi', '', {}],
	ripple    :[false, true,  '波及効果', 'Ripple Effect', '', { kanpen:'hakyukoka'}],
	roma      :[false, false, 'ろーま', 'Roma', '', {}],
	shakashaka:[false, true,  'シャカシャカ', 'ShakaShaka', '', {}],
	shikaku   :[false, true,  '四角に切れ', 'Shikaku', '', {}],
	shimaguni :[true,  false, '島国', 'Islands', '', {}],
	shugaku   :[true,  false, '修学旅行の夜', 'School Trip', '', {}],
	shwolf    :[false, false, 'ヤギとオオカミ', 'Sheeps and Wolves', '', {}],
	slalom    :[true,  true,  'スラローム', 'Slalom', '', {}],
	slither   :[false, true,  'スリザーリンク', 'Slitherlink', '', { kanpen:'slitherlink'}],
	snakes    :[true,  false, 'へびいちご', 'Hebi-Ichigo', '', {}],
	sudoku    :[false, true,  '数独', 'Sudoku', '', {}],
	sukoro    :[true,  false, '数コロ', 'Sukoro', '', {}],
	sukororoom:[false, false, '数コロ部屋', 'Sukoro-room', '', {}],
	tasquare  :[false, false, 'たすくえあ', 'Tasquare', '', {}],
	tatamibari:[true,  false, 'タタミバリ', 'Tatamibari', '', {}],
	tateyoko  :[true,  false, 'タテボーヨコボー', 'Tatebo-Yokobo', '', {}],
	tawa      :[false, false, 'たわむれんが', 'Tawamurenga', '', {}],
	tentaisho :[false, true,  '天体ショー', 'Tentaisho', '', {}],
	tilepaint :[true,  false, 'タイルペイント', 'Tilepaint', '', {}],
	toichika  :[false, false, '遠い誓い', 'Toichika', '', {}],
	triplace  :[false, false, 'トリプレイス', 'Tri-place', '', {}],
	usotatami :[false, false, 'ウソタタミ', 'Uso-tatami', '', {}],
	view      :[true,  false, 'ヴィウ', 'View', '', {}],
	wagiri    :[false, false, 'ごきげんななめ・輪切', 'Gokigen-naname:wagiri', '', {}],
	wblink    :[false, false, 'シロクロリンク', 'Shirokuro-link', '', {}],
	yajikazu  :[true,  false, 'やじさんかずさん', 'Yajisan-Kazusan', '', {}],
	yajirin   :[false, true,  'ヤジリン', 'Yajilin', '', { pzprurl:'yajilin', kanpen:'yajilin'}]
});

/* extern */
window.PZLINFO = PZLINFO;

})();
