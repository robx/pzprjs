
	var userlang = pzpr.env.node
		? process.env.LANG
		: navigator.browserLanguage || navigator.language || navigator.userLanguage;
module.exports = !userlang || userlang.substr(0, 2) === "ja" ? "ja" : "en";
