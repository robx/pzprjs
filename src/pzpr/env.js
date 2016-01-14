// env.js v3.4.0
// jshint node:true

//---------------------------------------------------------------------------
// node.js環境向けの対策
//---------------------------------------------------------------------------
/* jshint ignore:start */
var document  = this.document;
var window    = this.window;
var navigator = this.navigator;

if(typeof window==='undefined' || typeof document==='undefined'){
	if(typeof require!=='undefined'){
		document  = require('jsdom').jsdom('');
		window    = document.defaultView;
		navigator = window.navigator;
	}
}
var DOMParser = this.DOMParser || ((typeof require!=='undefined') ?
	function(){ this.parseFromString = function(str,mimetype){
		return require('jsdom').jsdom(str,{parsingMode:'xml'});
	}}
:  // jsdom
	function(){ this.parseFromString = function(str,mimetype){
		var doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'puzzle', null);
		doc.innerHTML = str;
		return doc;
	}}
);
var XMLSerializer = this.XMLSerializer || function(){ this.serializeToString = function(xmldoc){
		return xmldoc.documentElement.outerHTML;
	}};
/* jshint ignore:end */

/**************/
/* 環境の取得 */
/**************/
pzpr.env = (function(){
	var isbrowser = !(typeof module==='object' && module.exports);
	var UA  = (isbrowser ? navigator.userAgent : '');
	
	var bz = {
		Presto: isbrowser && (!!window.opera)
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
		browser : bz,
		OS      : os,
		storage : storage,
		API     : api,
		node    : !isbrowser
	};
})();

pzpr.lang = (function(){
	var userlang = (pzpr.env.node ? process.env.LANG : (navigator.browserLanguage || navigator.language || navigator.userLanguage));
	return ((!userlang||userlang.substr(0,2)==='ja')?'ja':'en');
})();
