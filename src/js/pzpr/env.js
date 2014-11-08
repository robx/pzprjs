// env.js v3.4.0

//---------------------------------------------------------------------------
// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
//---------------------------------------------------------------------------
try{ if(typeof localStorage != "object" && typeof globalStorage == "object"){
	localStorage = globalStorage[location.host];
}}catch(e){}

if(!Array.prototype.forEach){
	Array.prototype.forEach = function(func){
		for(var i=0;i<this.length;i++){ func(this[i]);}
	}
}
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0;i<this.length;i++){ if(this[i]===obj){ return i;}}
		return -1;
	}
}
if(!Array.prototype.some){
	Array.prototype.some = function(cond){
		for(var i=0;i<this.length;i++){ if(cond(this[i])){ return true;}}
		return false;
	}
}

/**************/
/* 環境の取得 */
/**************/
pzpr.env = (function(){
	var UA  = navigator.userAgent;
	
	var IEversion = (UA.match(/MSIE (\d+)/) ? parseInt(RegExp.$1) : 0);
	var bz = {
		legacyIE: (IEversion>0 && IEversion<=8),
		IE9     : (IEversion===9),
		Presto: (!!window.opera)
	};
	var Gecko = (UA.indexOf('Gecko')>-1 && UA.indexOf('KHTML')===-1);
	var Gecko7orOlder = (Gecko && UA.match(/rv\:(\d+\.\d+)/) && parseFloat(RegExp.$1)< 8.0); /* Firefox8.0よりも前 */
	
	var ios     = (UA.indexOf('like Mac OS X') > -1);
	var android = (UA.indexOf('Android') > -1);
	var os = {
		iOS    : (ios),
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
		touchevent      : ((!!window.ontouchstart) || (!!document.createTouch)),
		pointerevent    : (!!navigator.pointerEnabled),
		mspointerevent  : (!!navigator.msPointerEnabled),
		anchor_download : (document.createElement("a").download!==(void 0))
	};
	
	return {
		browser : bz,
		OS      : os,
		storage : storage,
		API     : api
	};
})();
