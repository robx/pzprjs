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
	PIDlist : function(scriptid){
		var list = [];
		for(var pid in this.info){
			if(this.info[pid].script===scriptid){ list.push(pid);}
		}
		return list;
	},

	toBGimage : function(pid){
		return BGimage(pid);
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
	amibo     :[false, false, 'あみぼー', 'Amibo', 'amibo', {}],
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
	fivecells :[false, false, 'ファイブセルズ', 'FiveCells', 'nawabari', {}],
	fourcells :[false, false, 'フォーセルズ', 'FourCells', 'nawabari', {}],
	goishi    :[false, true,  '碁石ひろい', 'Goishi', '', {}],
	gokigen   :[true,  false, 'ごきげんななめ', 'Gokigen-naname', 'gokigen', {}],
	hakoiri   :[true,  false, 'はこいり○△□', 'Triplets', '', {}],
	hanare    :[false, false, 'はなれ組', 'Hanare-gumi', 'hanare', {}],
	hashikake :[false, true,  '橋をかけろ', 'Bridges', '', { kanpen:'hashi'}],
	heyawake  :[false, true,  'へやわけ', 'Heyawake', 'heyawake', {}],
	heyabon   :[true,  false, 'へやぼん', 'Heya-Bon', 'bonsan', {}],
	hitori    :[false, true,  'ひとりにしてくれ', 'Hitori', '', {}],
	icebarn   :[true,  false, 'アイスバーン', 'Icebarn', 'icebarn', {}],
	icelom    :[false, false, 'アイスローム', 'Icelom', 'icebarn', {}],
	icelom2   :[false, false, 'アイスローム２', 'Icelom2', 'icebarn', {}],
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
	kurotto   :[false, false, 'クロット', 'Kurotto', '', {}],
	kusabi    :[false, false, 'クサビリンク', 'Kusabi', '', {}],
	lightup   :[false, true,  '美術館', 'Akari (Light Up)', '', { pzprurl:'akari', kanpen:'bijutsukan'}],
	lits      :[true,  true,  'ＬＩＴＳ', 'LITS', 'lits', {}],
	lookair   :[false, false, 'るっくえあ', 'Look-Air', '', {}],
	loopsp    :[true,  false, '環状線スペシャル', 'Loop Special', '', {}],
	loute     :[false, false, 'エルート', 'L-route', '', {}],
	mashu     :[false, true,  'ましゅ', 'Masyu (Pearl Puzzle)', '', { kanpen:'masyu'}],
	mejilink  :[false, false, 'メジリンク', 'Mejilink', '', {}],
	minarism  :[true,  false, 'マイナリズム', 'Minarism', '', {}],
	mochikoro :[true,  false, 'モチコロ', 'Mochikoro', 'nurikabe', {}],
	mochinyoro:[true,  false, 'モチにょろ', 'Mochinyoro', 'nurikabe', {}],
	nagenawa  :[false, false, 'なげなわ', 'Nagenawa', 'nagenawa', {}],
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
	ringring  :[false, false, 'リングリング', 'Ring-ring', 'nagenawa', {}],
	ripple    :[false, true,  '波及効果', 'Ripple Effect', 'ripple', { kanpen:'hakyukoka'}],
	roma      :[false, false, 'ろーま', 'Roma', '', {}],
	sashigane :[false, false, 'さしがね', 'Sashigane', 'loute', {}],
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
	wagiri    :[false, false, 'ごきげんななめ・輪切', 'Gokigen-naname:wagiri', 'gokigen', {}],
	wblink    :[false, false, 'シロクロリンク', 'Shirokuro-link', '', {}],
	yajikazu  :[true,  false, 'やじさんかずさん', 'Yajisan-Kazusan', '', {}],
	yajirin   :[false, true,  'ヤジリン', 'Yajilin', '', { pzprurl:'yajilin', kanpen:'yajilin'}],
	yajitatami:[false, false, 'ヤジタタミ', 'Yajitatami', '', {}],
	yosenabe  :[false, false, 'よせなべ', 'Yosenabe', '', {}]
});

var BGimage = function(pid){
	var header;
	var data = {
	/* カラーパレットが2色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
	aho       :['ICAgKCgoC','I4Qdp3vJDxwMtNorV85sQ6RwWhhiZPNF57Q+3udgcjWmLVMAADs='],
	amibo     :['P/AwP///y','HoRjqQvI36AKtNrrolx5Hz+BXjeKX4KlVWmSmyt1BQA7'],
	ayeheya   :['P/ow////y','F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs='],
	bag       :['P+vg///wC','JYRjl4DbmlqYtNr3mFs67g+FYiZd5uSlYjdyJNim56mytv3CeQEAOw=='],
	barns     :['MDAwID//y','JQyCqZa369hTDtg7cYxT+r51zUVyWSMiYbqKJZl65tOCqDHjZQEAOw=='],
	bdblock   :['Dn/pP///y','IoyPqQHb+lJE81RzmdsMeI994EKWJsVJKQqtlouFovydSgEAOw=='],
	bonsan    :['P//wMD/wC','JoSPicGqcWCSgBpbJWa81zlR4hNizomeHMh+1wZ2MtssrTmmmVQAADs='],
	box       :['ICAgKCgoC','IgyOCaadxpyKEkHqKH5tLxmEondg5MeBU2WyKziGakfPRwEAOw=='],
	cbblock   :['P/QQf///y','H4wDp3vJj+BzUlEIst784rp4lSiRH9igKdNpk2qYRwEAOw=='],
	chocona   :['P/AwP///y','IIyPGcDtD1BUM1WpVr6HG69R2yiWFnmamNqh0Ntk8iwXADs='],
	cojun     :['MD//////y','I4wfgMvKD+Jrcp6IrcF18ux9DiWOSNldaJqspgu28AZndVYAADs='],
	country   :['P/Gif///y','IISPGZFtDKB7SDZL78RYna6BjhhO1WdG3siubWZC5FkAADs='],
	creek     :['AD//8H+/y','JIQfGces2tyD8RkrU16XboBVExd1YTmSjXWa5NlirTsjU/k1BQA7'],
	factors   :['AD//////y','IISPqcsWHxp4iKq4cGXayd5dWwN+SXigqHeBawpJ8pwUADs='],
	fillmat   :['P//wLP/gS','JoSDAam2yh6SM9pbE4UaT3d0HrWRmDOiXMZ+oLfG5cjIMAnOIlsAADs='],
	fillomino :['ODg4P///y','I4QPgcvKn4KU0DhbE7qP3wl608FtDVRq3bkuYZillYxmLlQAADs='],
	firefly   :['ID/gP//wC','JISDpqvRzNySME2EMaAHzuddXEiWlVVSYxRl7riCsqeaG2orBQA7'],
	fivecells :['MD/wP///y','IwyOmWbqDaCLCgY7T5NT8vV02fdpYpVRSAmqZ4S145rS7FMAADs='],
	fourcells :['MD/wP///y','JoSPELeZrdxjoUJbmTYQ3T1xoEdh1gh+jhqtaZlxGOqK0nvL5o4VADs='],
	goishi    :['P/zwf///y','JoSPiRHK2UA0cU5JVz5V79stFzUq5oly5eOBG8a9sAu/4QetZXoUADs='],
	gokigen   :['OD/g////y','HYQPgafbvlKUMD42r9HbZg9W4oh9IdmZaLpSLZcUADs='],
	hakoiri   :['MD//////y','KISPicEa+UyUYE5KLcSVY81FVyc1JYMq6oKm6zgu2zur8Eoesd6aSgEAOw=='],
	hanare    :['AD//////y','FYSPqcvtDyMMdNLqLm46WC+F4kgmBQA7'],
	hashikake :['P///8DAwC','JoQflse829qLMlhLVYQuw8s5F+JtpTJSIKm2UgaAGBxrdI3TU1MAADs='],
	heyawake  :['P//wMD/wC','LYyPacDtH9p5LgJ7IYt4V559Clh9Idad0kJ57caimmex7nqNUN2lti8JvSaAAgA7'],
	heyabon   :['MD/wP///y','F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs='],
	hitori    :['P//QP///y','H4SPFhvpwNpDcVJ2lz11Q+x1HgduonVOZ/qwjpvASAEAOw=='],
	icebarn   :['EH9/////y','F4SPqcvt3wJEcpp6g95cW/yAjmiV5nkWADs='],
	icelom    :['EH9/////y','GYSPqcvdAYOblMl1UU7b9PN9XkWSkVimaQEAOw=='],
	icelom2   :['H///////y','G4SPqcvNEQxsMVX71MWue7SBWjZyywSg38o2BQA7'],
	ichimaga  :['ODg4P///y','IIyPGcDtfZ4EUdmLzWRxQ+1kovh0HgVO42qhy+nCHBsUADs='],
	ichimagam :['ODg4P///y','F4yPGcDtD6NTtFojs3639w1m3kiW5lUAADs='],
	ichimagax :['ODg4P///y','HkSOicDtDyNUtNHKltzcXXsloNKVm2aEqHqYbsQuBQA7'],
	kaero     :['P/A/////y','KIyPecDtbUB4dE5JIbtSxa1VISaC5sOlmXo6LImOnCt77BxjuPhlbgEAOw=='],
	kakuro    :['ICAgP///y','F4SPqcut4V5McJ5qAbZ79vg5YTNmZlYAADs='],
	kakuru    :['MD/wP///y','HYSPqcut4QA8c1Vq2ZWu7vxpERYmXmeKz6oaJVUAADs='],
	kinkonkan :['P//gP///y','JoSDAanmrKBbsDaL7ctoUuwdjBhSWxdyHod+bObCZyetiVuOo1MAADs='],
	kouchoku  :['ODg4P///y','IIwDp3vJbxxccqraMKK6xX4BYDh+0SRSTLparevBsVwVADs='],
	kramma    :['ID/gMD/wC','IISPGJFt6xqMitEzL8hv+Q+G4idZGkehkeqwpdbBj7wVADs='],
	kramman   :['ID/gMD/wC','GYSPqcvtj4IMb85mbcy8+7xxGOho0ImmaQEAOw=='],
	kurochute :['PDw8ODg4C','IYSPFpGty9yBUD5qb9QVrER1GTaSUvWdadqILCKW2UzTBQA7'],
	kurodoko  :['ICAgMDAwC','H4SPiRHqDaAzMk66Lraa1g6GIhNCn1Kd2aGubUKKSAEAOw=='],
	kurotto   :['MDAwODg4C','KYxvoKuIzNKSD8gWMM2T12t5h+ZAncOZaoiu6LZFYtyRmGyHuPqmUF8AADs='],
	kusabi    :['MD/wP///y','I4SPqZvh/06QaxoLMMK80uuBYvaRY3eWW6mxqjuuJwQx9r0UADs='],
	lightup   :['MD//////y','IIRvgcvKDxycNAY5r6a6I99t2xdijVeN1bqYHJvA0VMAADs='],
	lits      :['ICAgKCgoC','IYQRqXmNq9yBUT7alr1wU2Z9gfeRWFiip6RNKfs6otkdBQA7'],
	lookair   :['AD//6D//y','GoSPqcsa/5qBUdIgwc07+w92jciQi+lQYFYAADs='],
	loopsp    :['P+AgP/Pgy','KYwPeLtpzoCcVDb1Mg7QQb55T9VVGrOBaPqhHomY6iyG2EfCa7dep1EAADs='],
	loute     :['IH/gf///y','IYyPaaDB+lJE89TVrssZ+Ph5zUiWG8ShqpSyK9V9Vmg2BQA7'],
	mashu     :['P/AwP///y','JoR/kRntvYxCFExb6b0ZS/Y4kdeRXLaVViqFJ1vCndw+oziP+QcUADs='],
	mejilink  :['NDQ0P///y','JoxheZrI4VhUE9iLc5ztQc8tz9ZBpPiN4Kq2hwZbpcTS7lk1zlYAADs='],
	minarism  :['AD//4H+/y','HYyPqcutAKN8DNBlU75oa/6FoOF141EG0po67vsWADs='],
	mochikoro :['AAAAICAgC','IYwDqXmNq9yBUT7alr1wU2Z9gPeRWFiip6RNKfs6otkdBQA7'],
	mochinyoro:['MDAwKCgoC','FoSPqct9AaOctNqLs4au+29s4kiWUwEAOw=='],
	nagenawa  :['ACAgACeoC','JYSPacHdCgKUiiaL8NFrO7eF3RiJJWml5geS2QRX8TWxDITnegEAOw=='],
	nanro     :['MD//+H//y','IIQfGcet2+KLUlFnL8rs+Q+G4khOWKJtaAqYqavBlwwUADs='],
	nawabari  :['MD//////y','IwRihsnK2xI88dnqJM68zhl9G6V5wYmmagc24vZisavWKYsVADs='],
	norinori  :['P/d1MDAwC','I4QfGcet2+KLUlFn8USvJ+Z5YLgZogZdZqYCpfpeMTVXX1MAADs='],
	numlin    :['MDAwP///y','JYyBaJG6Cx6UhzIbacuszaphYkhKG+SVD7eOJpZ2yXepdGuDRgEAOw=='],
	nuribou   :['KCgoICAgC','JYQRGYfKug58TlYzbaJbR3w1HTiKn8mdGamGK+ql6Uu7dlnjYQEAOw=='],
	nurikabe  :['P+hof/R0S','FoSPqcvtD1eY1NHa7rSaX49F4kiWTAEAOw=='],
	paintarea :['P//wMD/wC','JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs='],
	pipelink  :['ID/gM//gy','Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7'],
	pipelinkr :['ID//8D//y','Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7'],
	reflect   :['MDAwP///y','HoyPqcvtCMAzMb5aWw5YbfpxVtKJEoONWrhO7gsnBQA7'],
	renban    :['ID/gP//wC','JoRjeZrI4FhUM9h7F4yzPfh1mkRp2MmF6iOCLIVaZvrWpF16bnwVADs='],
	ringring  :['KCgoMDAwC','JwRiqae4bYKctDr3Isw63dp1VsgcYCmeWDmirLpx6/p81n1xJL04BQA7'],
	ripple    :['AD//////y','IIyBYJG6jRg8sNqLs97RyvZMnxNGo3liKce2XkuBVVAAADs='],
	roma      :['P/wwf///y','IoSPqXvBGtxrcZpYJ85sc+hJYLiE2Ggm5oas7OWeQMzSWwEAOw=='],
	sashigane :['IH/gf///y','HYyPqcsBrcBrskp4LjZz+79p2NQxZRkhaOp4IhgUADs='],
	shakashaka:['AAAAICAgC','IoSPqRe7AR2CVAKKHd5q++l9VxgaJMecTXJqoltZ4ypfSwEAOw=='],
	shikaku   :['ICAgMDAwC','HoSPGcm43YKctMoIcVab9/N8QPiRjoVe4riyq7kFBQA7'],
	shimaguni :['P//wMD/wC','G4yPqavgDx2KFMwKL5as+w+GBqVtJXZWqcgeBQA7'],
	shugaku   :['AAAQAAAgC','JoRvoauIzNyBSyYaXp37Nv55GTiKGnWWQESmbguLrISp6ezUFlAAADs='],
	shwolf    :['ID/gMD/wC','IQyOiQas6RqcytlXsY569RaE4vhx5Zedx5WulKuamNwFBQA7'],
	slalom    :['ID//////y','IIwPecsJDIOLcNJlr3FP76yBF+d9SkmipydSbbWOsVEAADs='],
	slither   :['AAAAP///y','F4yPqcutAF5MULqLs978Vjohnxh2ZlYAADs='],
	snakes    :['ID/gMD/wC','FISPqcvtD1WYtM6Is96825pcHVQAADs='],
	sudoku    :['P//wP///y','HoRvgcvKDxxccp5qY0bY9hiE4khCn7ldabJq6/l8BQA7'],
	sukoro    :['MDAwODg4C','JYyPoMin39KDMUwa76p2crd9HGaQF0hpQHeqrOe671p6KEOKSAEAOw=='],
	tasquare  :['ICAgGBgYC','IYxvoKuIzNyBSyYKbMDZcv15HPaMzWR2l1mmFcrCYzsfBQA7'],
	tatamibari:['LP/gf///y','HYSPqaHA2x6SM9pETzbbwY9dFTiG5lmmzcq2rlIAADs='],
	tateyoko  :['P/AwP///y','H4RjqQvI3+BzJ9hLqUx6R8+BXreRkoZhofiJJvROSgEAOw=='],
	tawa      :['MDAwODg4C','GIR/gcud3hRccj57Mai6+8lZIeiNkOlwBQA7'],
	tentaisho :['IWL/X23/y','KASCYcum+5qDUx6mYtPZ3u19VZhooVWeBzJK5WNCr7jNsfOyXq6mQAEAOw=='],
	tilepaint :['KCgoICAgC','JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs='],
	toichika  :['ID/gP///y','IoSPqRvsGlqSJlp6adXAwreE4nhwooeYWWlW6ZpObfeRYQEAOw=='],
	triplace  :['MD/wP///y','JgyOCXas6dxrKNiLb51xv0593lJhI6ig0jlCZQabEzuHZH0v8V4AADs='],
	usotatami :['MD/wP//wC','KIQTppqcvc6BMKIKsIuZN10hjDdZnkguKNeV2ri+pQquKi2l9nulQAEAOw=='],
	wagiri    :['P/rw////y','IIQPEci42dgzs1Ua77na7ShBoNR1YpilKmqtrOd+MVUAADs='],
	yajikazu  :['P/B/f///y','HoSPEMm5DZ8JtNoKmcyTo+1loBh25YVSX3mMnMsyBQA7'],
	yajirin   :['MD/wP///y','HISDicas2tpL0c1Qs968nwuGl0eWHqihmVqxRgEAOw=='],
	yajitatami:['MD/wP//wC','J4wPeRvpj9SbwLhG4WV8aZkpWBVWFkh1HHSSZTuGY7ypXYnSE/y2BQA7'],
	yosenabe  :['ODg/////y','JIwDd6nGjdqD0VFZr5qg+4ltGgiKJkWO4bJ8nVhCT8yeq20dBQA7'],

	/* カラーパレットが3-4色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
	bosanowa  :['P/AwP/hw////////y','LowtAst5l1gTL6Q4r968e5VR0CUBToVJ55NOlQWqIhsvGv3l+j22/FgyzYAlRwEAOw=='],
	sukororoom:['NDQ0ODg4PDw8P///y','NIwfgqebBqJpS8X7nL0g18B1FNJgHukkwsqu6ZiioISYmzljN51LewfhZHBBICw2aSmXggIAOw=='],
	view      :['MD/wP//wP///////y','LoQtEst5l1gTDykZXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw=='],
	wblink    :['NDQ0ODg4Pj4+P///y','LoQdIct5l1gLDykpXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw==']
	}[pid];

	/* 無い場合はimage.gifを返します */
	if(!data){ data=['MD/wPD/8C','KYQTpogKnFxbMDpa7W18yjhp1yGO1OidW5mSKFuaTyy585t0ctZ+EFAAADs='];}

	if(data[0].length<=10){ header='R0lGODdhEAAQAIAAA';}
	else                  { header='R0lGODdhEAAQAKEAA';}

	return "data:image/gif;base64,"+header+data[0]+'wAAAAAEAAQAAAC'+data[1];
};

/* extern */
if(!window.pzprv3){ window.pzprv3={};}
window.pzprv3.PZLINFO = PZLINFO;

})();
