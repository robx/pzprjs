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
	},

	toFBGcolor : function(pid){
		return FBGcolor(pid);
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
	aho       :[false, false, 'アホになり切れ', 'Aho-ni-Narikire', 'shikaku', {}],
	ayeheya   :[false, true,  '∀人∃ＨＥＹＡ', 'ekawayeh', 'heyawake', {}],
	bag       :[true,  false, 'バッグ', 'BAG (Corral)', '', {}],
	barns     :[true,  false, 'バーンズ', 'Barns', '', {}],
	bdblock   :[true,  false, 'ボーダーブロック', 'Border Block', '', {}],
	bonsan    :[true,  false, 'ぼんさん', 'Bonsan', 'bonsan', {}],
	bosanowa  :[true,  false, 'ボサノワ', 'Bosanowa', '', {}],
	box       :[false, false, 'ボックス', 'Box', '', {}],
	cbblock   :[false, false, 'コンビブロック', 'Combi Block', '', {}],
	chocona   :[false, false, 'チョコナ', 'Chocona', 'shimaguni', {}],
	cojun     :[false, false, 'コージュン', 'Cojun', 'ripple', {}],
	country   :[true,  false, 'カントリーロード', 'Country Road', '', {}],
	creek     :[true,  false, 'クリーク', 'Creek', '', {}],
	factors   :[false, false, '因子の部屋', 'Rooms of Factors', '', {}],
	fillmat   :[true,  false, 'フィルマット', 'Fillmat', 'fillmat', {}],
	fillomino :[false, true,  'フィルオミノ', 'Fillomino', '', { kanpen2:'fillomino01'}],
	firefly   :[true,  false, 'ホタルビーム', 'Hotaru Beam (Glow of Fireflies)', '', {}],
	fivecells :[false, false, 'ファイブセルズ', 'FiveCells', '', {}],
	fourcells :[false, false, 'フォーセルズ', 'FourCells', 'nawabari', {}],
	goishi    :[false, true,  '碁石ひろい', 'Goishi', '', {}],
	gokigen   :[true,  false, 'ごきげんななめ', 'Gokigen-naname', '', {}],
	hakoiri   :[true,  false, 'はこいり○△□', 'Triplets', '', {}],
	hashikake :[false, true,  '橋をかけろ', 'Bridges', '', { kanpen:'hashi'}],
	heyawake  :[false, true,  'へやわけ', 'Heyawake', 'heyawake', {}],
	heyabon   :[true,  false, 'へやぼん', 'Heya-Bon', 'bonsan', {}],
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
	lits      :[true,  true,  'ＬＩＴＳ', 'LITS', 'lits', {}],
	loopsp    :[true,  false, '環状線スペシャル', 'Loop Special', '', {}],
	loute     :[false, false, 'エルート', 'L-route', '', {}],
	mashu     :[false, true,  'ましゅ', 'Masyu (Pearl Puzzle)', '', { kanpen:'masyu'}],
	mejilink  :[false, false, 'メジリンク', 'Mejilink', '', {}],
	minarism  :[true,  false, 'マイナリズム', 'Minarism', '', {}],
	mochikoro :[true,  false, 'モチコロ', 'Mochikoro', 'nurikabe', {}],
	mochinyoro:[true,  false, 'モチにょろ', 'Mochinyoro', 'nurikabe', {}],
	nagenawa  :[false, false, 'なげなわ', 'Nagenawa', '', {}],
	nanro     :[false, true,  'ナンロー', 'Nanro', '', {}],
	nawabari  :[true,  false, 'なわばり', 'Territory', 'nawabari', {}],
	norinori  :[false, true,  'のりのり', 'Norinori', 'lits', {}],
	numlin    :[false, true,  'ナンバーリンク', 'Numberlink', '', { kanpen:'numberlink'}],
	nuribou   :[true,  false, 'ぬりぼう', 'Nuribou', 'nurikabe', {}],
	nurikabe  :[false, true,  'ぬりかべ', 'Nurikabe', 'nurikabe', {}],
	paintarea :[true,  false, 'ペイントエリア', 'Paintarea', '', {}],
	pipelink  :[true,  false, 'パイプリンク', 'Pipelink', 'pipelink', {}],
	pipelinkr :[true,  false, '帰ってきたパイプリンク', 'Pipelink Returns', 'pipelink', {}],
	reflect   :[true,  false, 'リフレクトリンク', 'Reflect Link', '', {}],
	renban    :[false, false, '連番窓口', 'Renban-Madoguchi', '', {}],
	ripple    :[false, true,  '波及効果', 'Ripple Effect', 'ripple', { kanpen:'hakyukoka'}],
	roma      :[false, false, 'ろーま', 'Roma', '', {}],
	shakashaka:[false, true,  'シャカシャカ', 'ShakaShaka', '', {}],
	shikaku   :[false, true,  '四角に切れ', 'Shikaku', 'shikaku', {}],
	shimaguni :[true,  false, '島国', 'Islands', 'shimaguni', {}],
	shugaku   :[true,  false, '修学旅行の夜', 'School Trip', '', {}],
	shwolf    :[false, false, 'ヤギとオオカミ', 'Sheeps and Wolves', 'kramma', {}],
	slalom    :[true,  true,  'スラローム', 'Slalom', '', {}],
	slither   :[false, true,  'スリザーリンク', 'Slitherlink', '', { kanpen:'slitherlink'}],
	snakes    :[true,  false, 'へびいちご', 'Hebi-Ichigo', '', {}],
	sudoku    :[false, true,  '数独', 'Sudoku', '', {}],
	sukoro    :[true,  false, '数コロ', 'Sukoro', 'sukoro', {}],
	sukororoom:[false, false, '数コロ部屋', 'Sukoro-room', 'sukoro', {}],
	tasquare  :[false, false, 'たすくえあ', 'Tasquare', '', {}],
	tatamibari:[true,  false, 'タタミバリ', 'Tatamibari', '', {}],
	tateyoko  :[true,  false, 'タテボーヨコボー', 'Tatebo-Yokobo', '', {}],
	tawa      :[false, false, 'たわむれんが', 'Tawamurenga', '', {}],
	tentaisho :[false, true,  '天体ショー', 'Tentaisho', '', {}],
	tilepaint :[true,  false, 'タイルペイント', 'Tilepaint', '', {}],
	toichika  :[false, false, '遠い誓い', 'Toichika', '', {}],
	triplace  :[false, false, 'トリプレイス', 'Tri-place', '', {}],
	usotatami :[false, false, 'ウソタタミ', 'Uso-tatami', 'fillmat', {}],
	view      :[true,  false, 'ヴィウ', 'View', 'sukoro', {}],
	wagiri    :[false, false, 'ごきげんななめ・輪切', 'Gokigen-naname:wagiri', '', {}],
	wblink    :[false, false, 'シロクロリンク', 'Shirokuro-link', '', {}],
	yajikazu  :[true,  false, 'やじさんかずさん', 'Yajisan-Kazusan', '', {}],
	yajirin   :[false, true,  'ヤジリン', 'Yajilin', '', { pzprurl:'yajilin', kanpen:'yajilin'}]
});

var FBGcolor = function(pid){
	var col = "black";
	switch(pid){
	case 'slither': case 'lightup': case 'shakashaka':
	case 'mejilink': case 'cbblock': case 'shugaku':     col="rgb(32, 32, 32)"; break;
	case 'fillomino': case 'factors': case 'mochikoro':
	case 'lits': case 'tasquare': case 'tawa':           col="rgb(64, 64, 64)"; break;
	case 'kakuro': case 'tilepaint': case 'triplace':
	case 'box': case 'minarism': case 'kurodoko':        col="rgb(96, 96, 96)"; break;
	case 'kouchoku': case 'mochinyoro': case 'wblink':   col="rgb(127, 127, 127)"; break;
	case 'sukoro': case 'sukororoom': case 'view':       col="rgb(160, 160, 160)"; break;

	case 'chocona':                                      col="rgb(127, 0, 0)"; break;
	case 'bag': case 'paintarea':                        col="rgb(160, 0, 0)"; break;
	case 'country':                                      col="rgb(191, 0, 0)"; break;
	case 'kramma': case 'kramman': case 'shwolf':        col="rgb(255, 0, 0)"; break;

	case 'goishi': case 'kusabi':  case 'kurochute':     col="rgb(224, 160, 0)"; break;
	case 'bonsan': case 'heyabon': case 'kaero':         col="rgb(127, 96, 64)"; break;
	case 'hakoiri': case 'roma': case 'toichika':        col="rgb(127, 160, 96)"; break;
	case 'shikaku': case 'aho':  case 'loute':           col="rgb(127, 191, 0)"; break;
	case 'fillmat': case 'tatamibari': case 'usotatami': col="rgb(96, 224, 0)"; break;
	case 'kinkonkan':                                    col="rgb(160, 191, 0)"; break;
	case 'sudoku': case 'hitori': case 'hashikake':      col="rgb(191, 191, 0)"; break;

	case 'gokigen': case 'wagiri': case 'nagenawa':      col="rgb(0, 127, 0)"; break;
	case 'ichimaga': case 'ichimagax': case 'ichimagam': col="rgb(0, 160, 0)"; break;
	case 'heyawake': case 'ayeheya':                     col="rgb(0, 191, 0)"; break;
	case 'yajirin': case 'yajikazu': case 'firefly':     col="rgb(0, 224, 0)"; break;
	case 'pipelink': case 'pipelinkr': case 'loopsp':    col="rgb(0, 255, 0)"; break;
	case 'fourcells': case 'fivecells':                  col="rgb(64, 255, 64)"; break;
	case 'tateyoko': case 'kakuru':                      col="rgb(96, 255, 96)"; break;

	case 'bdblock': case 'reflect':                      col="rgb(0, 127, 96)"; break;
	case 'norinori': case 'shimaguni':                   col="rgb(0, 127, 127)"; break;

	case 'icebarn': case 'icelom': case 'icelom2':       col="rgb(0, 0, 127)"; break;
	case 'tentaisho':                                    col="rgb(0, 0, 160)"; break;
	case 'barns':                                        col="rgb(0, 0, 191)"; break;
	case 'creek': case 'nanro':                          col="rgb(0, 0, 255)"; break;
	case 'ripple': case 'cojun': case 'renban':          col="rgb(32, 32, 255)"; break;
	case 'nawabari':                                     col="rgb(64, 64, 255)"; break;
	case 'slalom':                                       col="rgb(96, 96, 255)"; break;

	case 'snakes': case 'numlin':                        col="rgb(255, 0, 191)"; break;
	case 'mashu': case 'bosanowa':                       col="rgb(255, 64, 191)"; break;
	case 'nurikabe': case 'nuribou':                     col="rgb(255, 127, 224)"; break;
	}
	return col;
};

/* extern */
window.PZLINFO = PZLINFO;

})();
