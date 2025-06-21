// Misc.js v3.4.1
/* global _doc:readonly */

//---------------------------------------------------------------------------
// ★Miscクラス html表示系 (Menu, Button以外)の制御を行う
//---------------------------------------------------------------------------
ui.misc = {
	//---------------------------------------------------------------------------
	// misc.displayDesign()  背景画像とかtitle・背景画像・html表示の設定
	// misc.bgimage()        背景画像を返す
	//---------------------------------------------------------------------------
	displayDesign: function() {
		var pid = ui.puzzle.pid;
		var pinfo = pzpr.variety(pid);
		var title = ui.selectStr(pinfo.ja, pinfo.en);
		title += ui.puzzle.playeronly ? " player" : " " + ui.i18n("editor");

		_doc.title = title;
		var titleEL = _doc.getElementById("title2");
		titleEL.innerHTML = title;

		if (ui.urlconfig.embed) {
			_doc.body.style.background = "white";
		} else {
			_doc.body.style.backgroundImage = "url(" + this.bgimage(pid) + ")";
		}
	},
	bgimage: function(pid) {
		return toBGimage(pid);
	},

	//--------------------------------------------------------------------------------
	// misc.modifyCSS()   スタイルシートの中身を変更する
	//--------------------------------------------------------------------------------
	modifyCSS: function(input) {
		var sheet = _doc.styleSheets[0];
		var rules = sheet.cssRules;
		if (rules === null) {
		} // Chromeでローカルファイルを開くとおかしくなるので、とりあえず何もしないようにします
		else if (!this.modifyCSS_sub(rules, input)) {
			var sel = "";
			for (sel in input) {
				break;
			}
			sheet.insertRule("" + sel + " {}", rules.length);
			rules = sheet.cssRules;
			this.modifyCSS_sub(rules, input);
		}
	},
	modifyCSS_sub: function(rules, input) {
		var modified = false;
		for (var i = 0, len = rules.length; i < len; i++) {
			var rule = rules[i];
			if (!rule.selectorText) {
				continue;
			}
			var pps = input[rule.selectorText];
			if (!!pps) {
				for (var p in pps) {
					if (!!pps[p]) {
						rule.style[p] = pps[p];
					}
				}
				modified = true;
			}
		}
		return modified;
	},

	//--------------------------------------------------------------------------------
	// misc.walker()        DOMツリーをたどる
	// misc.displayByPid()  要素のdata-pid, autocmp-typeカスタム属性によって表示するしないを切り替える
	//--------------------------------------------------------------------------------
	walker: function(parent, func) {
		var els = [parent.firstChild];
		while (els.length > 0) {
			var el = els.pop();
			func(el);
			if (!!el.nextSibling) {
				els.push(el.nextSibling);
			}
			if (el.nodeType === 1 && el.childNodes.length > 0) {
				els.push(el.firstChild);
			}
		}
	},
	displayByPid: function(parent) {
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1) {
				var disppid = ui.customAttr(el, "dispPid");
				if (!!disppid) {
					el.style.display = pzpr.util.checkpid(disppid, ui.puzzle.pid)
						? ""
						: "none";
				}
				var autocmp = ui.customAttr(el, "autocmpType");
				if (!!autocmp) {
					el.style.display =
						ui.puzzle.painter.autocmp === autocmp ? "" : "none";
				}
			}
		});
	}
};

function toBGimage(pid) {
	var imgs = [
		"akichi",
		"alter",
		"angleloop",
		"aquapelago",
		"aquarium",
		"araf",
		"archipelago",
		"balance",
		"balloon",
		"batten",
		"battleship",
		"bdwalk",
		"bosnianroad",
		"brownies",
		"castle",
		"cbanana",
		"chainedb",
		"circlesquare",
		"cocktail",
		"coffeemilk",
		"compass",
		"coral",
		"cts",
		"curvedata",
		"curving",
		"dbchoco",
		"detour",
		"dominion",
		"doppelblock",
		"dotchi",
		"dotchi2",
		"doubleback",
		"easyasabc",
		"evolmino",
		"fakearrow",
		"firewalk",
		"forestwalk",
		"geradeweg",
		"heteromino",
		"heyapin",
		"icewalk",
		"invlitso",
		"island",
		"kaidan",
		"kaisu",
		"kissing",
		"kropki",
		"kurarin",
		"kuroclone",
		"kuromenbun",
		"ladders",
		"lixloop",
		"lollipops",
		"magnets",
		"mannequin",
		"martini",
		"maxi",
		"midloop",
		"mintonette",
		"mirrorbk",
		"moonsun",
		"mrtile",
		"mukkonn",
		"nanameguri",
		"nibunnogo",
		"nondango",
		"nonogram",
		"norinuri",
		"nothing",
		"nurimisaki",
		"nuritwin",
		"nuriuzu",
		"oneroom",
		"orbital",
		"ovotovata",
		"oyakodori",
		"patchwork",
		"pencils",
		"pentatouch",
		"pentopia",
		"pmemory",
		"portal",
		"ququ",
		"rassi",
		"recoil",
		"regional-poly",
		"remlen",
		"retroships",
		"retsurin",
		"roundtrip",
		"sananko",
		"sashikazune",
		"satogaeri",
		"scrin",
		"simplegako",
		"simpleloop",
		"skyscrapers",
		"slashpack",
		"smullyan",
		"snake",
		"snakeegg",
		"squarejam",
		"starbattle",
		"statuepark",
		"subomino",
		"swslither",
		"symmarea",
		"tachibk",
		"tajmahal",
		"takoyaki",
		"tapaloop",
		"tents",
		"teri",
		"tetrochain",
		"tetrominous",
		"tilecity",
		"timebomb",
		"tjunction",
		"tontonbeya",
		"trainstations",
		"tslither",
		"turnaround",
		"voxas",
		"vslither",
		"wafusuma",
		"walllogic",
		"wataridori",
		"waterwalk",
		"wittgen",
		"yinyang",
		"zabajaba"
	];
	if (imgs.indexOf(pid) >= 0) {
		return "img/" + pid + ".png";
	}
	var header;
	var data = {
		/* カラーパレットが2色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
		aho: ["ICAgKCgoC", "I4Qdp3vJDxwMtNorV85sQ6RwWhhiZPNF57Q+3udgcjWmLVMAADs="],
		amibo: ["P/AwP///y", "HoRjqQvI36AKtNrrolx5Hz+BXjeKX4KlVWmSmyt1BQA7"],
		ayeheya: ["P/ow////y", "F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs="],
		cave: [
			"P+vg///wC",
			"JYRjl4DbmlqYtNr3mFs67g+FYiZd5uSlYjdyJNim56mytv3CeQEAOw=="
		],
		barns: [
			"MDAwID//y",
			"JQyCqZa369hTDtg7cYxT+r51zUVyWSMiYbqKJZl65tOCqDHjZQEAOw=="
		],
		bdblock: [
			"Dn/pP///y",
			"IoyPqQHb+lJE81RzmdsMeI994EKWJsVJKQqtlouFovydSgEAOw=="
		],
		bonsan: [
			"P//wMD/wC",
			"JoSPicGqcWCSgBpbJWa81zlR4hNizomeHMh+1wZ2MtssrTmmmVQAADs="
		],
		box: ["ICAgKCgoC", "IgyOCaadxpyKEkHqKH5tLxmEondg5MeBU2WyKziGakfPRwEAOw=="],
		cbblock: ["P/QQf///y", "H4wDp3vJj+BzUlEIst784rp4lSiRH9igKdNpk2qYRwEAOw=="],
		chocona: ["P/AwP///y", "IIyPGcDtD1BUM1WpVr6HG69R2yiWFnmamNqh0Ntk8iwXADs="],
		cojun: [
			"MD//////y",
			"I4wfgMvKD+Jrcp6IrcF18ux9DiWOSNldaJqspgu28AZndVYAADs="
		],
		country: ["P/Gif///y", "IISPGZFtDKB7SDZL78RYna6BjhhO1WdG3siubWZC5FkAADs="],
		creek: [
			"AD//8H+/y",
			"JIQfGces2tyD8RkrU16XboBVExd1YTmSjXWa5NlirTsjU/k1BQA7"
		],
		factors: ["AD//////y", "IISPqcsWHxp4iKq4cGXayd5dWwN+SXigqHeBawpJ8pwUADs="],
		fillmat: [
			"P//wLP/gS",
			"JoSDAam2yh6SM9pbE4UaT3d0HrWRmDOiXMZ+oLfG5cjIMAnOIlsAADs="
		],
		fillomino: [
			"ODg4P///y",
			"I4QPgcvKn4KU0DhbE7qP3wl608FtDVRq3bkuYZillYxmLlQAADs="
		],
		firefly: [
			"ID/gP//wC",
			"JISDpqvRzNySME2EMaAHzuddXEiWlVVSYxRl7riCsqeaG2orBQA7"
		],
		fivecells: [
			"MD/wP///y",
			"IwyOmWbqDaCLCgY7T5NT8vV02fdpYpVRSAmqZ4S145rS7FMAADs="
		],
		fourcells: [
			"MD/wP///y",
			"JoSPELeZrdxjoUJbmTYQ3T1xoEdh1gh+jhqtaZlxGOqK0nvL5o4VADs="
		],
		goishi: [
			"P/zwf///y",
			"JoSPiRHK2UA0cU5JVz5V79stFzUq5oly5eOBG8a9sAu/4QetZXoUADs="
		],
		gokigen: ["OD/g////y", "HYQPgafbvlKUMD42r9HbZg9W4oh9IdmZaLpSLZcUADs="],
		hakoiri: [
			"MD//////y",
			"KISPicEa+UyUYE5KLcSVY81FVyc1JYMq6oKm6zgu2zur8Eoesd6aSgEAOw=="
		],
		hanare: ["AD//////y", "FYSPqcvtDyMMdNLqLm46WC+F4kgmBQA7"],
		hashikake: [
			"P///8DAwC",
			"JoQflse829qLMlhLVYQuw8s5F+JtpTJSIKm2UgaAGBxrdI3TU1MAADs="
		],
		hebi: ["ID/gMD/wC", "FISPqcvtD1WYtM6Is96825pcHVQAADs="],
		herugolf: [
			"MD//+H//y",
			"I4SPiRHqwJ6KcrV6KIbXdqNlITeNo3Q+zMo67Ou+ayx/G1IAADs="
		],
		heyabon: [
			"P//wMD/wC",
			"LYyPacDtH9p5LgJ7IYt4V559Clh9Idad0kJ57caimmex7nqNUN2lti8JvSaAAgA7"
		],
		heyawake: ["MD/wP///y", "F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs="],
		hitori: ["P//QP///y", "H4SPFhvpwNpDcVJ2lz11Q+x1HgduonVOZ/qwjpvASAEAOw=="],
		icebarn: ["EH9/////y", "F4SPqcvt3wJEcpp6g95cW/yAjmiV5nkWADs="],
		icelom: ["EH9/////y", "GYSPqcvdAYOblMl1UU7b9PN9XkWSkVimaQEAOw=="],
		icelom2: ["H///////y", "G4SPqcvNEQxsMVX71MWue7SBWjZyywSg38o2BQA7"],
		ichimaga: ["ODg4P///y", "IIyPGcDtfZ4EUdmLzWRxQ+1kovh0HgVO42qhy+nCHBsUADs="],
		ichimagam: ["ODg4P///y", "F4yPGcDtD6NTtFojs3639w1m3kiW5lUAADs="],
		ichimagax: ["ODg4P///y", "HkSOicDtDyNUtNHKltzcXXsloNKVm2aEqHqYbsQuBQA7"],
		juosan: ["Pjzu9/bqC", "H4SPEMm43R5MUoWLZZ1mcz+BIDRGHHU6ToYdJfOiZwEAOw=="],
		kaero: [
			"P/A/////y",
			"KIyPecDtbUB4dE5JIbtSxa1VISaC5sOlmXo6LImOnCt77BxjuPhlbgEAOw=="
		],
		kazunori: [
			"KD/wND/4C",
			"IwyOqaaN7BqMKdiL86xU9vVx4bEtFklBRglcj4a1T0qe9AgUADs="
		],
		kakuro: ["ICAgP///y", "F4SPqcut4V5McJ5qAbZ79vg5YTNmZlYAADs="],
		kakuru: ["MD/wP///y", "HYSPqcut4QA8c1Vq2ZWu7vxpERYmXmeKz6oaJVUAADs="],
		kinkonkan: [
			"P//gP///y",
			"JoSDAanmrKBbsDaL7ctoUuwdjBhSWxdyHod+bObCZyetiVuOo1MAADs="
		],
		kouchoku: ["ODg4P///y", "IIwDp3vJbxxccqraMKK6xX4BYDh+0SRSTLparevBsVwVADs="],
		kramma: ["ID/gMD/wC", "IISPGJFt6xqMitEzL8hv+Q+G4idZGkehkeqwpdbBj7wVADs="],
		kramman: ["ID/gMD/wC", "GYSPqcvtj4IMb85mbcy8+7xxGOho0ImmaQEAOw=="],
		kurochute: [
			"PDw8ODg4C",
			"IYSPFpGty9yBUD5qb9QVrER1GTaSUvWdadqILCKW2UzTBQA7"
		],
		kurodoko: ["ICAgMDAwC", "H4SPiRHqDaAzMk66Lraa1g6GIhNCn1Kd2aGubUKKSAEAOw=="],
		kurotto: [
			"MDAwODg4C",
			"KYxvoKuIzNKSD8gWMM2T12t5h+ZAncOZaoiu6LZFYtyRmGyHuPqmUF8AADs="
		],
		kusabi: [
			"MD/wP///y",
			"I4SPqZvh/06QaxoLMMK80uuBYvaRY3eWW6mxqjuuJwQx9r0UADs="
		],
		lightup: ["MD//////y", "IIRvgcvKDxycNAY5r6a6I99t2xdijVeN1bqYHJvA0VMAADs="],
		lits: ["ICAgKCgoC", "IYQRqXmNq9yBUT7alr1wU2Z9gfeRWFiip6RNKfs6otkdBQA7"],
		lookair: ["AD//6D//y", "GoSPqcsa/5qBUdIgwc07+w92jciQi+lQYFYAADs="],
		loopsp: [
			"P+AgP/Pgy",
			"KYwPeLtpzoCcVDb1Mg7QQb55T9VVGrOBaPqhHomY6iyG2EfCa7dep1EAADs="
		],
		loute: ["IH/gf///y", "IYyPaaDB+lJE89TVrssZ+Ph5zUiWG8ShqpSyK9V9Vmg2BQA7"],
		makaro: [
			"NnZ2e3t7S",
			"I0xgmYDqytpzUa6K7cl1wuh9lnZ93siEompwoOhSHTuz26kUADs="
		],
		mashu: [
			"P/AwP///y",
			"JoR/kRntvYxCFExb6b0ZS/Y4kdeRXLaVViqFJ1vCndw+oziP+QcUADs="
		],
		mejilink: [
			"NDQ0P///y",
			"JoxheZrI4VhUE9iLc5ztQc8tz9ZBpPiN4Kq2hwZbpcTS7lk1zlYAADs="
		],
		minarism: ["AD//4H+/y", "HYyPqcutAKN8DNBlU75oa/6FoOF141EG0po67vsWADs="],
		mochikoro: [
			"AAAAICAgC",
			"IYwDqXmNq9yBUT7alr1wU2Z9gPeRWFiip6RNKfs6otkdBQA7"
		],
		mochinyoro: ["MDAwKCgoC", "FoSPqct9AaOctNqLs4au+29s4kiWUwEAOw=="],
		nagare: ["N/Z/+7r/y", "H4SPEJtt7FqItFo678t3ceWF4iGWIWim6sqirbtubQEAOw=="],
		nagenawa: [
			"ACAgACeoC",
			"JYSPacHdCgKUiiaL8NFrO7eF3RiJJWml5geS2QRX8TWxDITnegEAOw=="
		],
		nanro: ["MD//+H//y", "IIQfGcet2+KLUlFnL8rs+Q+G4khOWKJtaAqYqavBlwwUADs="],
		nawabari: [
			"MD//////y",
			"IwRihsnK2xI88dnqJM68zhl9G6V5wYmmagc24vZisavWKYsVADs="
		],
		norinori: [
			"P/d1MDAwC",
			"I4QfGcet2+KLUlFn8USvJ+Z5YLgZogZdZqYCpfpeMTVXX1MAADs="
		],
		numlin: [
			"MDAwP///y",
			"JYyBaJG6Cx6UhzIbacuszaphYkhKG+SVD7eOJpZ2yXepdGuDRgEAOw=="
		],
		nuribou: [
			"KCgoICAgC",
			"JYQRGYfKug58TlYzbaJbR3w1HTiKn8mdGamGK+ql6Uu7dlnjYQEAOw=="
		],
		nurikabe: ["P+hof/R0S", "FoSPqcvtD1eY1NHa7rSaX49F4kiWTAEAOw=="],
		nurimaze: [
			"MD/wP/0/y",
			"I4Qfp4u8aYKcs0WnINBYc+dRlIVtZHeCiMh6JfO9MSitbTwbBQA7"
		],
		paintarea: [
			"P//wMD/wC",
			"JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs="
		],
		pipelink: [
			"ID/gM//gy",
			"Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7"
		],
		pipelinkr: [
			"ID//8D//y",
			"Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7"
		],
		rectslider: [
			"MDAwODg4C",
			"IIxvoKuIzNyBa1Jqb5RB8359mseRkumMG6gCGSSGpSwVADs="
		],
		reflect: ["MDAwP///y", "HoyPqcvtCMAzMb5aWw5YbfpxVtKJEoONWrhO7gsnBQA7"],
		renban: [
			"ID/gP//wC",
			"JoRjeZrI4FhUM9h7F4yzPfh1mkRp2MmF6iOCLIVaZvrWpF16bnwVADs="
		],
		ringring: [
			"KCgoMDAwC",
			"JwRiqae4bYKctDr3Isw63dp1VsgcYCmeWDmirLpx6/p81n1xJL04BQA7"
		],
		ripple: ["AD//////y", "IIyBYJG6jRg8sNqLs97RyvZMnxNGo3liKce2XkuBVVAAADs="],
		roma: ["P/wwf///y", "IoSPqXvBGtxrcZpYJ85sc+hJYLiE2Ggm5oas7OWeQMzSWwEAOw=="],
		sashigane: ["IH/gf///y", "HYyPqcsBrcBrskp4LjZz+79p2NQxZRkhaOp4IhgUADs="],
		shakashaka: [
			"AAAAICAgC",
			"IoSPqRe7AR2CVAKKHd5q++l9VxgaJMecTXJqoltZ4ypfSwEAOw=="
		],
		shikaku: ["ICAgMDAwC", "HoSPGcm43YKctMoIcVab9/N8QPiRjoVe4riyq7kFBQA7"],
		shimaguni: ["P//wMD/wC", "G4yPqavgDx2KFMwKL5as+w+GBqVtJXZWqcgeBQA7"],
		shugaku: [
			"AAAQAAAgC",
			"JoRvoauIzNyBSyYaXp37Nv55GTiKGnWWQESmbguLrISp6ezUFlAAADs="
		],
		shwolf: ["ID/gMD/wC", "IQyOiQas6RqcytlXsY569RaE4vhx5Zedx5WulKuamNwFBQA7"],
		slalom: ["ID//////y", "IIwPecsJDIOLcNJlr3FP76yBF+d9SkmipydSbbWOsVEAADs="],
		slither: ["AAAAP///y", "F4yPqcutAF5MULqLs978Vjohnxh2ZlYAADs="],
		sudoku: ["P//wP///y", "HoRvgcvKDxxccp5qY0bY9hiE4khCn7ldabJq6/l8BQA7"],
		sukoro: [
			"MDAwODg4C",
			"JYyPoMin39KDMUwa76p2crd9HGaQF0hpQHeqrOe671p6KEOKSAEAOw=="
		],
		tapa: ["P+hof/R0S", "IISPqRAdm9yDR9LqrjY2ZvYhXSd+JNZs2gmxi6vAqlEAADs="],
		tasquare: ["ICAgGBgYC", "IYxvoKuIzNyBSyYKbMDZcv15HPaMzWR2l1mmFcrCYzsfBQA7"],
		tatamibari: ["LP/gf///y", "HYSPqaHA2x6SM9pETzbbwY9dFTiG5lmmzcq2rlIAADs="],
		tateyoko: ["P/AwP///y", "H4RjqQvI3+BzJ9hLqUx6R8+BXreRkoZhofiJJvROSgEAOw=="],
		tawa: ["MDAwODg4C", "GIR/gcud3hRccj57Mai6+8lZIeiNkOlwBQA7"],
		tentaisho: [
			"IWL/X23/y",
			"KASCYcum+5qDUx6mYtPZ3u19VZhooVWeBzJK5WNCr7jNsfOyXq6mQAEAOw=="
		],
		tilepaint: [
			"KCgoICAgC",
			"JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs="
		],
		toichika: [
			"ID/gP///y",
			"IoSPqRvsGlqSJlp6adXAwreE4nhwooeYWWlW6ZpObfeRYQEAOw=="
		],
		triplace: [
			"MD/wP///y",
			"JgyOCXas6dxrKNiLb51xv0593lJhI6ig0jlCZQabEzuHZH0v8V4AADs="
		],
		usotatami: [
			"MD/wP//wC",
			"KIQTppqcvc6BMKIKsIuZN10hjDdZnkguKNeV2ri+pQquKi2l9nulQAEAOw=="
		],
		wagiri: ["P/rw////y", "IIQPEci42dgzs1Ua77na7ShBoNR1YpilKmqtrOd+MVUAADs="],
		yajikazu: ["P/B/f///y", "HoSPEMm5DZ8JtNoKmcyTo+1loBh25YVSX3mMnMsyBQA7"],
		yajilin: ["MD/wP///y", "HISDicas2tpL0c1Qs968nwuGl0eWHqihmVqxRgEAOw=="],
		yajitatami: [
			"MD/wP//wC",
			"J4wPeRvpj9SbwLhG4WV8aZkpWBVWFkh1HHSSZTuGY7ypXYnSE/y2BQA7"
		],
		yosenabe: [
			"ODg/////y",
			"JIwDd6nGjdqD0VFZr5qg+4ltGgiKJkWO4bJ8nVhCT8yeq20dBQA7"
		],

		/* カラーパレットが3-4色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
		bosanowa: [
			"P/AwP/hw////////y",
			"LowtAst5l1gTL6Q4r968e5VR0CUBToVJ55NOlQWqIhsvGv3l+j22/FgyzYAlRwEAOw=="
		],
		dosufuwa: [
			"JmZmbKysszMzP///y",
			"KUyAYMuW3lhCMJ6plMXZXu59TyiSpIAKZmqoXoq2L6y6EV3PeLifbFAAADs="
		],
		sukororoom: [
			"NDQ0ODg4PDw8P///y",
			"NIwfgqebBqJpS8X7nL0g18B1FNJgHukkwsqu6ZiioISYmzljN51LewfhZHBBICw2aSmXggIAOw=="
		],
		view: [
			"MD/wP//wP///////y",
			"LoQtEst5l1gTDykZXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw=="
		],
		wblink: [
			"NDQ0ODg4Pj4+P///y",
			"LoQdIct5l1gLDykpXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw=="
		]
	}[pid];

	/* 無い場合はimage.gifを返します */
	if (!data) {
		data = [
			"MD/wPD/8C",
			"KYQTpogKnFxbMDpa7W18yjhp1yGO1OidW5mSKFuaTyy585t0ctZ+EFAAADs="
		];
	}

	if (data[0].length <= 10) {
		header = "R0lGODdhEAAQAIAAA";
	} else {
		header = "R0lGODdhEAAQAKEAA";
	}

	return (
		"data:image/gif;base64," + header + data[0] + "wAAAAAEAAQAAAC" + data[1]
	);
}
