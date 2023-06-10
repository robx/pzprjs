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
		JSON.parse(localStorage.getItem("pzprv3_config:ui") || "{}").language ||
		pzpr.lang;

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

			var setting = JSON.parse(
				localStorage.getItem("pzprv3_config:ui") || "{}"
			);
			setting.language = lang;
			localStorage.setItem("pzprv3_config:ui", JSON.stringify(setting));
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
