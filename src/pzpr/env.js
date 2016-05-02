// env.js v3.4.0
// jshint node:true

/**************/
/* 環境の取得 */
/**************/
pzpr.env = (function(){
	var isbrowser = pzpr.Candle.env.browser;
	var UA  = (isbrowser ? navigator.userAgent : '');
	
	var bz = {
		Presto: (typeof window==='object' && !!window.opera)
	};
	
	var ios     = (UA.indexOf('like Mac OS X') > -1);
	var android = (UA.indexOf('Android') > -1);
	var os = {
		iOS    : (ios),
		Android: (android),
		mobile : (ios || android)
	};
	
	var api = {
		touchevent      : isbrowser && ((!!window.ontouchstart) || (!!document.createTouch)),
		pointerevent    : isbrowser && (!!navigator.pointerEnabled),
		mspointerevent  : isbrowser && (!!navigator.msPointerEnabled),
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
