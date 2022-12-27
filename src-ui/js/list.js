(function() {
	/* variables */
	var v3index = {
		doclang: pzpr.lang,
		captions: [],
		phtml: "p.html",
		ruleshtml: "rules.html",
		extend: function(obj) {
			for (var n in obj) {
				this[n] = obj[n];
			}
		}
	};

	var _doc = document;
	var self = v3index;

	self.doclang =
		JSON.parse(localStorage["pzprv3_config:ui"] || "{}").language || pzpr.lang;

	if (location.search === "?en" || location.search === "?ja") {
		self.doclang = location.search.substr(1, 2);
	}
	if (location.hostname === "puzz.link" || location.pathname === "/list") {
		// puzz.link serves p.html at puzz.link/p
		self.phtml = "p";
	}
	if (location.pathname === "/list") {
		self.ruleshtml = "rules";
	}
	function customAttr(el, name) {
		var value = "";
		if (el.dataset !== void 0) {
			value = el.dataset[name];
		} else {
			/* IE10, Firefox5, Chrome7, Safari5.1以下のフォールバック */
			var lowername = "data-";
			for (var i = 0; i < name.length; i++) {
				var ch = name[i] || name.charAt(i);
				lowername += ch >= "A" && ch <= "Z" ? "-" + ch.toLowerCase() : ch;
			}
			value = el[lowername] || el.getAttribute(lowername) || "";
		}
		return value;
	}

	v3index.extend({
		/* onload function */
		onload_func: function() {
			self.setTranslation();
			self.setBlockVisibility();
			self.translate();
		},

		setBlockVisibility: function() {
			Array.prototype.slice
				.call(_doc.querySelectorAll(".lists ul"))
				.forEach(function(el) {
					var count = 0;
					Array.prototype.slice
						.call(el.querySelectorAll("li"))
						.forEach(function(el) {
							if (el.style.display !== "none") {
								count++;
							}
						});
					el.parentNode.style.display = count > 0 ? "" : "none";
				});
		},
		/* Language display functions */
		setlang: function(lang) {
			self.doclang = lang;
			self.translate();

			var setting = JSON.parse(localStorage["pzprv3_config:ui"] || "{}");
			setting.language = lang;
			localStorage["pzprv3_config:ui"] = JSON.stringify(setting);
		},
		setTranslation: function() {
			Array.prototype.slice
				.call(_doc.querySelectorAll(".lists li"))
				.forEach(function(el) {
					var pinfo = pzpr.variety(customAttr(el, "pid"));
					var pid = pinfo.pid;
					if (!pinfo.valid) {
						el.style.display = "none";
						return;
					}

					var editor = document.createElement("a");
					editor.href = v3index.phtml + "?" + pid;
					el.appendChild(editor);
					var rules = document.createElement("a");
					rules.className = "rules";
					rules.href = v3index.ruleshtml + "?" + pid;
					rules.textContent = "?";
					el.appendChild(rules);
					self.captions.push({
						anode: editor,
						str_jp: pinfo.ja,
						str_en: pinfo.en
					});
				});
		},
		translate: function() {
			/* キャプションの設定 */
			for (var i = 0; i < this.captions.length; i++) {
				var obj = this.captions[i];
				if (!!obj.anode) {
					var text = self.doclang === "ja" ? obj.str_jp : obj.str_en;
					obj.anode.innerHTML = text.replace(/(\(.+\))/g, "<small>$1</small>");
				}
			}
			Array.prototype.slice
				.call(_doc.body.querySelectorAll('[lang="ja"]'))
				.forEach(function(el) {
					el.style.display = self.doclang === "ja" ? "" : "none";
				});
			Array.prototype.slice
				.call(_doc.body.querySelectorAll('[lang="en"]'))
				.forEach(function(el) {
					el.style.display = self.doclang === "en" ? "" : "none";
				});
		}
	});

	/* addEventListener */
	window.addEventListener("load", self.onload_func, false);

	/* extern */
	window.v3index = v3index;
})();

/*********************/
/* Database function */
/*********************/
(function() {
	var v3index = window.v3index;

	var pstate = {
		lunch: [
			"nurikabe",
			"tilepaint",
			"norinori",
			"nurimaze",
			"heyawake",
			"hitori",
			"slither",
			"mashu",
			"yajilin",
			"slalom",
			"numlin",
			"hashikake",
			"herugolf",
			"shikaku",
			"tentaisho",
			"kakuro",
			"sudoku",
			"fillomino",
			"symmarea",
			"ripple",
			"akari",
			"shakashaka"
		],
		testa: ["nagare", "dosufuwa", "usoone", "moonsun"],
		trial: ["stostone", "armyants"],
		lunch2: ["box", "lits", "kurodoko", "goishi"],
		lunch3: ["minarism", "factors"],
		nigun: [
			"creek",
			"mochikoro",
			"tasquare",
			"kurotto",
			"shimaguni",
			"yajikazu",
			"cave",
			"country",
			"reflect",
			"icebarn",
			"firefly",
			"kaero",
			"yosenabe",
			"bdblock",
			"fivecells",
			"sashigane",
			"tatamibari",
			"sukoro",
			"gokigen",
			"tateyoko",
			"kinkonkan",
			"hebi",
			"makaro",
			"juosan"
		],
		omopa: [
			"nuribou",
			"tawa",
			"lookair",
			"paintarea",
			"chocona",
			"kurochute",
			"mejilink",
			"pipelink",
			"loopsp",
			"nagenawa",
			"kouchoku",
			"ringring",
			"pipelinkr",
			"barns",
			"icelom",
			"icelom2",
			"wblink",
			"kusabi",
			"ichimaga",
			"ichimagam",
			"ichimagax",
			"amibo",
			"bonsan",
			"heyabon",
			"rectslider",
			"nawabari",
			"triplace",
			"fourcells",
			"kramma",
			"kramman",
			"shwolf",
			"loute",
			"fillmat",
			"usotatami",
			"yajitatami",
			"kakuru",
			"view",
			"bosanowa",
			"nanro",
			"cojun",
			"renban",
			"sukororoom",
			"hanare",
			"kazunori",
			"wagiri",
			"shugaku",
			"hakoiri",
			"roma",
			"toichika",
			"cbblock",
			"nondango",
			"onsen"
		],
		orig: ["mochinyoro", "ayeheya", "aho"],
		genre: [
			"tapa",
			"arukone",
			"yinyang",
			"skyscrapers",
			"kropki",
			"starbattle",
			"easyasabc",
			"walllogic"
		],
		add: [
			"angleloop",
			"doubleback",
			"nurimisaki",
			"meander",
			"satogaeri",
			"scrin",
			"heteromino",
			"yajilin-regions",
			"dbchoco",
			"geradeweg",
			"pencils",
			"curvedata",
			"aquarium",
			"compass",
			"castle",
			"araf",
			"maxi",
			"midloop",
			"balance",
			"simpleloop",
			"doppelblock",
			"tents",
			"detour",
			"snake",
			"nonogram",
			"coral",
			"putteria",
			"haisu",
			"nikoji",
			"mines",
			"interbd",
			"toichika2",
			"aqre",
			"tapaloop",
			"dotchi",
			"ovotovata",
			"crossstitch",
			"chainedb",
			"canal",
			"railpool"
		]
	};
	var tabstate = {
		lunch: "lunch",
		lunch2: "lunch",
		lunch3: "nigun",
		testa: "nigun",
		nigun: "nigun",
		trial: "omopa",
		omopa: "omopa",
		orig: "extra",
		genre: "extra",
		add: "add"
	};

	var genres = {};
	for (var state in pstate) {
		pstate[state].forEach(function(pid) {
			genres[pzpr.variety.toPID(pid)] = { state: state, tab: tabstate[state] };
		});
	}

	v3index.extend({ variety: genres });
})();
