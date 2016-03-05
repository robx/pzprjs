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
	
	var Gecko = (UA.indexOf('Gecko')>-1 && UA.indexOf('KHTML')===-1);
	var Gecko7orOlder = (Gecko && UA.match(/rv\:(\d+\.\d+)/) && +RegExp.$1<8.0); /* Firefox8.0よりも前 */
	
	var ios     = (UA.indexOf('like Mac OS X') > -1);
	var android = (UA.indexOf('Android') > -1);
	var os = {
		iOS    : (ios),
		Android: (android),
		mobile : (ios || android)
	};
	
	var storage = (function(){
		var val = 0x00;
		try{ if(!!window.sessionStorage){ val |= 0x10;}}catch(e){}
		try{ if(!!window.localStorage)  { val |= 0x08;}}catch(e){}
		try{ if(!!window.indexedDB)     { val |= 0x04;}}catch(e){}
		try{ if(!!window.openDatabase){ // Opera10.50対策
			var dbtmp = openDatabase('pzprv3_manage', '1.0', 'manager', 1024*1024*5);	// Chrome3対策
			if(!!dbtmp){ val |= 0x02;}
		}}catch(e){}
		
		// Firefox 8.0より前はローカルだとデータベース系は使えない
		if(Gecko7orOlder && !location.hostname){ val = 0;}
		
		return {
			session : !!(val & 0x10),
			localST : !!(val & 0x08),
			WebIDB  : !!(val & 0x04),
			WebSQL  : !!(val & 0x02)
		};
	})();
	
	var api = {
		touchevent      : isbrowser && ((!!window.ontouchstart) || (!!document.createTouch)),
		pointerevent    : isbrowser && (!!navigator.pointerEnabled),
		mspointerevent  : isbrowser && (!!navigator.msPointerEnabled),
		anchor_download : isbrowser && (document.createElement("a").download!==(void 0))
	};
	
	return {
		bz      : bz,
		OS      : os,
		storage : storage,
		API     : api,
		browser : isbrowser,
		node    : pzpr.Candle.env.node
	};
})();

pzpr.lang = (function(){
	var userlang = (pzpr.env.node ? process.env.LANG : (navigator.browserLanguage || navigator.language || navigator.userLanguage));
	return ((!userlang||userlang.substr(0,2)==='ja')?'ja':'en');
})();
