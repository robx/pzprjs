// util.js v3.4.0

(function(){

var api = pzpr.env.API,
	eventMouseDown = "mousedown",
	eventMouseMove = "mousemove",
	eventMouseUp   = "mouseup";

if(api.pointerevent){
	eventMouseDown = "pointerdown";
	eventMouseMove = "pointermove";
	eventMouseUp   = "pointerup";
}
else if(api.mspointerevent){
	eventMouseDown = "MSPointerDown";
	eventMouseMove = "MSPointerMove";
	eventMouseUp   = "MSPointerUp";
}
else if(api.touchevent){
	eventMouseDown = "touchstart";
	eventMouseMove = "touchmove";
	eventMouseUp   = "touchend";
}

//----------------------------------------------------------------------
// EventやDOM関連のツール的関数群
//----------------------------------------------------------------------
pzpr.util = {
	//---------------------------------------------------------------
	// pzpr.jsが読み込まれているスクリプトのパスを取得する
	getpath : function(filename){
		filename = filename || "pzpr(v3)?.js";
		var srcs=document.getElementsByTagName('script');
		for(var i=0;i<srcs.length;i++){
			var result = srcs[i].src.match(new RegExp("^(.*\\/)"+filename+"$"));
			if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
		}
		return "";
	},

	//---------------------------------------------------------------
	// 現在の時間を取得
	currentTime : function(){ return (new Date()).getTime();},

	//---------------------------------------------------------------
	// Elementの生成関連
	//---------------------------------------------------------------
	unselectable : function(el){
		el.style.MozUserSelect    = 'none';
		el.style.KhtmlUserSelect  = 'none';
		el.style.webkitUserSelect = 'none';
		el.style.msUserSelect     = 'none';
		el.style.userSelect       = 'none';
		el.unselectable = "on";
		return this;
	},

	//----------------------------------------------------------------------
	// pzpr.util.addEvent()          addEventListener(など)を呼び出す
	// pzpr.util.eventWrapper()      イベント発生時のイベントWrapper関数を作成する
	//----------------------------------------------------------------------
	addEvent : function(el, type, self, callback, capt){
		if     (type==="mousedown"){ type = eventMouseDown;}
		else if(type==="mousemove"){ type = eventMouseMove;}
		else if(type==="mouseup")  { type = eventMouseUp;}
		
		function executer(e){ callback.call(self, pzpr.util.eventWrapper(e));}
		if(!!el.addEventListener){ el.addEventListener(type, executer, !!capt);}
		else                     { el.attachEvent('on'+type, executer);}
		return executer;
	},
	eventWrapper : function(e){
		e = e || window.event;
		if(!e.target){ e.target = e.srcElement;}
		if(!e.stopPropagation){ e.stopPropagation = function(){ this.cancelBubble = true;};}
		if(!e.preventDefault) { e.preventDefault  = function(){ this.returnValue = false;};}
		return e;
	},

	//---------------------------------------------------------------------------
	// pzpr.util.getMouseButton() 左/中/右ボタンが押されているかチェックする
	//---------------------------------------------------------------------------
	getMouseButton : function(e){
		var left=false, mid=false, right=false;
		if(e.touches!==void 0){
			/* touchイベントだった場合 */
			left  = (e.touches.length===1);
			right = (e.touches.length>1);
		}
		else if(!pzpr.env.browser.legacyIE){
			left  = (!!e.which ? e.which===1 : e.button===0);
			mid   = (!!e.which ? e.which===2 : e.button===1);
			right = (!!e.which ? e.which===3 : e.button===2);
		}
		else{
			left  = (e.button===1);
			mid   = (e.button===4);
			right = (e.button===2);
		}

		return {Left:left, Middle:mid, Right:right};
	},

	//----------------------------------------------------------------------
	// pzpr.util.getPagePos() イベントが起こったページ上の座標を返す
	// pzpr.util.pageX()      イベントが起こったページ上のX座標を返す
	// pzpr.util.pageY()      イベントが起こったページ上のY座標を返す
	//----------------------------------------------------------------------
	getPagePos : function(e){
		return {px:this.pageX(e), py:this.pageY(e)};
	},
	pageX : function(e){
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageX;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageX)){ return e.pageX;}
		else if(!isNaN(e.clientX)){ return e.clientX + document.documentElement.scrollLeft;} /* IE8以下向け */
		return 0;
	},
	pageY : function(e){
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageY;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageY)){ return e.pageY;}
		else if(!isNaN(e.clientY)){ return e.clientY + document.documentElement.scrollTop;} /* IE8以下向け */
		return 0;
	},

	//--------------------------------------------------------------------------------
	// pzpr.util.getRect()   エレメントの四辺の座標を返す
	//--------------------------------------------------------------------------------
	getRect : function(el){
		var rect = el.getBoundingClientRect(), scrollLeft, scrollTop;
		if(window.scrollX!==void 0){
			scrollLeft = window.scrollX;
			scrollTop  = window.scrollY;
		}
		else{
			/* IE11以下向け */
			var _html = document.documentElement;
			scrollLeft = _html.scrollLeft;
			scrollTop  = _html.scrollTop;
		}
		var left   = rect.left   + scrollLeft;
		var top    = rect.top    + scrollTop;
		var right  = rect.right  + scrollLeft;
		var bottom = rect.bottom + scrollTop;
		return { top:top, bottom:bottom, left:left, right:right, height:(bottom-top), width:(right-left)};
	},

	//---------------------------------------------------------------------------
	// pzpr.util.checkpid()  メニューなどが表示対象のパズルかどうか返す
	//---------------------------------------------------------------------------
	checkpid : function(str,pid){
		var matches = str.match(/!?[a-z0-9]+/g), isdisp = true;
		if(!!matches){
			isdisp = false;
			for(var i=0;i<matches.length;i++){
				if(matches[i].charAt(0)!=="!"){ if(matches[i]===pid){ isdisp = true;}}
				else                          { isdisp = (matches[i].substr(1)!==pid);}
			}
		}
		return isdisp;
	}
};

})();
