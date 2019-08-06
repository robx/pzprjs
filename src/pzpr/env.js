// env.js v3.4.0

/**************/
/* 環境の取得 */
/**************/
pzpr.env = (function(){
	var isbrowser = pzpr.Candle.env.browser;
	var UA  = (isbrowser ? navigator.userAgent : '');

	var ios     = (UA.indexOf('like Mac OS X') > -1);
	var android = (UA.indexOf('Android') > -1);
	var os = {
		iOS    : (ios),
		Android: (android),
		mobile : (ios || android)
	};

	var FireFoxVersion = (function(){
		if(UA.match(/Firefox\/(\w+(\.\w+)?)/)){
			var ver = RegExp.$1;
			if(UA.match(/rv\:(\d+(\.\d+)?)/)){
				if(RegExp.$1+0.0<=2.1){ return RegExp.$1+0.0;}
			}
			return ver;
		}
		return null;
	})();
	var ChromeVersion = (function(){
		if(UA.match(/Safari\/([\w\.]+)/) && UA.match(/Chrome\/(\w+(\.\w+)?)/)){
			return RegExp.$1;
		}
		return null;
	})();
	var SafariVersion = (function(){
		if(ChromeVersion===null && UA.match(/Safari\/([\w\.]+)/) && UA.match(/Version\/(\w+(\.\w+)?)/)){
			return RegExp.$1;
		}
		return null;
	})();
	var bz = {
		AndroidBrowser: (os.Android && SafariVersion),
		Presto: (typeof window==='object' && !!window.opera)
	};

	var api = {
		touchevent      : isbrowser && ((!!window.ontouchstart) || (!!document.createTouch)),
		pointerevent    : isbrowser && (!!window.PointerEvent),
		mspointerevent  : isbrowser && (!!window.MSPointerEvent),
		maxWidth        : isbrowser && ((ChromeVersion||1000) >= 18) && ((SafariVersion||1000) >= 6),
		svgTextLength   : !isbrowser || ((FireFoxVersion||1000) >= 25),
		anchor_download : isbrowser && (document.createElement("a").download!==(void 0))
	};

	return {
		bz      : bz,
		OS      : os,
		API     : api,
		browser : isbrowser,
		node    : pzpr.Candle.env.node
	};
})();

pzpr.lang = (function(){
	var userlang = (pzpr.env.node ? process.env.LANG : (navigator.browserLanguage || navigator.language || navigator.userLanguage));
	return ((!userlang||userlang.substr(0,2)==='ja')?'ja':'en');
})();
