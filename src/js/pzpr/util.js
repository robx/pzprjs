// util.js v3.4.0

//----------------------------------------------------------------------
// EventやDOM関連のツール的関数群
//----------------------------------------------------------------------
pzpr.util = {
	//---------------------------------------------------------------
	// pzpr.jsが読み込まれているスクリプトのパスを取得する
	getpath : function(filename){
		filename = filename || "pzprv3.js";
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
	// 言語環境をチェックして日本語かどうか判定する
	getUserLang : function(){
		var userlang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
		return ((userlang.substr(0,2)==='ja')?'ja':'en');
	},

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
	// pzpr.util.addMouseDownEvent() マウスを押したときのイベントを設定する
	// pzpr.util.addMouseMoveEvent() マウスを動かしたときのイベントを設定する
	// pzpr.util.addMouseUpEvent()   マウスボタンを離したときのイベントを設定する
	//----------------------------------------------------------------------
	addEvent : function(el, event, self, callback, capt){
		var func = function(e){
			e = e || window.event;
			if(!e.target){ e.target = e.srcElement;}
			callback.call(self, e);
		};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
	},
	addMouseDownEvent : function(el, self, func){
		if(pzpr.env.API.pointerevent){
			this.addEvent(el, "pointerdown", self, func);
		}
		else if(pzpr.env.API.mspointerevent){
			this.addEvent(el, "MSPointerDown", self, func);
		}
		else if(pzpr.env.API.touchevent){
			this.addEvent(el, "touchstart", self, func);
		}
		else{
			this.addEvent(el, "mousedown", self, func);
		}
	},
	addMouseMoveEvent : function(el, self, func){
		if(pzpr.env.API.pointerevent){
			this.addEvent(el, "pointermove", self, func);
		}
		else if(pzpr.env.API.mspointerevent){
			this.addEvent(el, "MSPointerMove", self, func);
		}
		else if(pzpr.env.API.touchevent){
			this.addEvent(el, "touchmove",  self, func);
		}
		else{
			this.addEvent(el, "mousemove", self, func);
		}
	},
	addMouseUpEvent : function(el, self, func){
		if(pzpr.env.API.pointerevent){
			this.addEvent(el, "pointerup", self, func);
		}
		else if(pzpr.env.API.mspointerevent){
			this.addEvent(el, "MSPointerUp", self, func);
		}
		else if(pzpr.env.API.touchevent){
			this.addEvent(el, "touchend", self, func);
		}
		else{
			this.addEvent(el, "mouseup", self, func);
		}
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
		else{
			if(!pzpr.env.browser.IE8){
				left  = (!!e.which ? e.which===1 : e.button===0);
				mid   = (!!e.which ? e.which===2 : e.button===1);
				right = (!!e.which ? e.which===3 : e.button===2);
			}
			else{
				left  = (e.button===1);
				mid   = (e.button===4);
				right = (e.button===2);
			}
		}

		return {Left:left, Middle:mid, Right:right};
	},

	//----------------------------------------------------------------------
	// pzpr.util.getPagePos() イベントが起こったページ上の座標を返す
	// pzpr.util.pageX()      イベントが起こったページ上のX座標を返す
	// pzpr.util.pageY()      イベントが起こったページ上のY座標を返す
	//----------------------------------------------------------------------
	getPagePos : function(e){
		return {px:this.pageX(e), py:this.pageY(e)}
	},
	pageX : function(e){
		function scrollLeft(){ return (document.documentElement.scrollLeft || document.body.scrollLeft);}
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageX;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageX)){ return e.pageX;}
		else if(!isNaN(e.clientX)){ return e.clientX + scrollLeft();}
		return 0;
	},
	pageY : function(e){
		function scrollTop(){ return (document.documentElement.scrollTop  || document.body.scrollTop );}
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageY;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageY)){ return e.pageY;}
		else if(!isNaN(e.clientY)){ return e.clientY + scrollTop();}
		return 0;
	},

	//--------------------------------------------------------------------------------
	// pzpr.util.getRect()   エレメントの四辺の座標を返す
	//--------------------------------------------------------------------------------
	getRect : function(el){
		this.getRect = ((!!document.createElement('div').getBoundingClientRect) ?
			function(el){
				var rect = el.getBoundingClientRect(), _html, _body, scrollLeft, scrollTop;
				if(!window.scrollX==void 0){
					scrollLeft = window.scrollX;
					scrollTop  = window.scrollY;
				}
				else{
					_html = document.documentElement; _body = document.body;
					scrollLeft = (_body.scrollLeft || _html.scrollLeft) - _html.clientLeft;
					scrollTop  = (_body.scrollTop  || _html.scrollTop ) - _html.clientTop;
				}
				var left   = rect.left   + scrollLeft;
				var top    = rect.top    + scrollTop;
				var right  = rect.right  + scrollLeft;
				var bottom = rect.bottom + scrollTop;
				return { top:top, bottom:bottom, left:left, right:right};
			}
		:
			function(el){
				var left = 0, top = 0, el2 = el;
				while(!!el2){
					left += +(!isNaN(el2.offsetLeft) ? el2.offsetLeft : el2.clientLeft);
					top  += +(!isNaN(el2.offsetTop)  ? el2.offsetTop  : el2.clientTop );
					el2 = el2.offsetParent;
				}
				var right  = left + (el.offsetWidth  || el.clientWidth);
				var bottom = top  + (el.offsetHeight || el.clientHeight);
				return { top:top, bottom:bottom, left:left, right:right};
			}
		);
		return this.getRect(el);
	},

	//----------------------------------------------------------------------
	// Eventオブジェクト関連
	// 
	// stopPropagation() イベントの起こったエレメントより上にイベントを
	//                   伝播させないようにする
	// preventDefault()  イベントの起こったエレメントで、デフォルトの
	//                   イベントが起こらないようにする
	//----------------------------------------------------------------------
	stopPropagation : function(e){
		if(!!e.stopPropagation){ e.stopPropagation();}
		else{ e.cancelBubble = true;}
	},
	preventDefault : function(e){
		if(!!e.preventDefault){ e.preventDefault();}
		else{ e.returnValue = false;}
	}
};
