// env.js v3.4.0
// jshint node:true

//---------------------------------------------------------------------------
// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
//---------------------------------------------------------------------------
/* jshint ignore:start */
try{ if(typeof localStorage != "object" && typeof globalStorage == "object"){
	localStorage = globalStorage[location.host];
}}catch(e){}
/* jshint ignore:end */

if(!Array.prototype.forEach){
	Array.prototype.forEach = function(func){
		for(var i=0;i<this.length;i++){ func(this[i]);}
	};
}
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0;i<this.length;i++){ if(this[i]===obj){ return i;}}
		return -1;
	};
}
if(!Array.prototype.some){
	Array.prototype.some = function(cond){
		for(var i=0;i<this.length;i++){ if(cond(this[i])){ return true;}}
		return false;
	};
}

/* jshint ignore:start */
if(typeof navigator==='undefined' || navigator.noUI){
	if(typeof require!=='undefined'){
		DOMParser = function(){ this.parseFromString = function(str,mimetype){
			return require('jsdom').jsdom(str,{parsingMode:'xml'});
		}};
	}
	else{ // jsdom
		DOMParser = function(){ this.parseFromString = function(str,mimetype){
			var doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'puzzle', null);
			doc.innerHTML = str;
			return doc;
		}};
	}
	XMLSerializer = function(){ this.serializeToString = function(xmldoc){
		return xmldoc.documentElement.outerHTML;
	}};
}
/* jshint ignore:end */

/**************/
/* 環境の取得 */
/**************/
pzpr.env = (function(){
	var isbrowser = (typeof module==='undefined' || typeof exports==='undefined');
	var UA  = (isbrowser ? navigator.userAgent : '');
	
	var IEversion = (UA.match(/MSIE (\d+)/) ? +RegExp.$1 : 0);
	var bz = {
		legacyIE: (IEversion>0 && IEversion<=8),
		IE9     : (IEversion===9),
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
