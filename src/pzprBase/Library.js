// Library.js v3.3.3

//---------------------------------------------------------------------------
// ★ElementManagerクラス Element関係の処理
//    ee() 指定したidのElementExtを取得する
//---------------------------------------------------------------------------
(function(){

// definition
var
	// local scope
	_doc = document,
	_win = this,

	/* ここからクラス定義です */

	// define and map _ElementManager class
	_ElementManager = function(id){
		if(typeof id === 'string'){
			if(!_elx[id]){
				var el = _doc.getElementById(id);
				if(!el){ return null;}
				_elx[id] = new _ELx(el);
			}
			return _elx[id];
		}

		var el = id;
		if(!!el.id){
			if(!_elx[el.id]){ _elx[el.id] = new _ELx(el);}
			return _elx[el.id];
		}

		return ((!!el) ? new _ELx(el) : null);
	},
	_elx = _ElementManager._cache    = {},
	_elp = _ElementManager._template = [],
	_elpcnt = _ElementManager._tempcnt = 0,
	_elf = _ElementManager._funcs    = [],

	// define and map _ElementManager.ElementExt class
	_ELx = _ElementManager.ElementExt = function(el){
		this.el     = el;
		this.parent = el.parentNode;
		this.pdisp  = 'none';
	},
	_ELp = _ElementManager.ElementTemplate = function(parent, tag, attr, style, func){
		this.parent  = parent;
		this.tagName = tag;
		this.attr    = attr;
		this.style   = style;
		this.func    = func;
	},

	// Utility functions
	_extend = function(obj, ads){
		for(var name in ads){ obj[name] = ads[name];}
	},
	_toArray = function(args){
		if(!args){ return [];}
		var array = [];
		for(var i=0,len=args.length;i<len;i++){ array[i]=args[i];}
		return array;
	}
;

	_ElementManager.br = {
		IE    : (!!(window.attachEvent && !window.opera)),
		Opera : (!!window.opera),
		WebKit: (navigator.userAgent.indexOf('AppleWebKit/') > -1),
		Gecko : (navigator.userAgent.indexOf('Gecko')>-1 && navigator.userAgent.indexOf('KHTML') == -1),

		IE6 : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==6),
		IE7 : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==7),
		IE8 : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==8),
		IE9 : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==9)
	};
	_ElementManager.os = { iPhoneOS : (navigator.userAgent.indexOf('like Mac OS X') > -1)};
	_ElementManager.mobile = (navigator.userAgent.indexOf('like Mac OS X') > -1 || navigator.userAgent.indexOf('Android') > -1);

	_win.ee = _ElementManager;

// implementation of _ElementManage class
_extend( _ElementManager, {

	//----------------------------------------------------------------------
	// ee.clean()  内部用の変数を初期化する
	//----------------------------------------------------------------------
	clean : function(){
		_elx = null;
		_elx = {};
		_elpcnt  = 0;
		_elp = null;
		_elp = [];
	},

	//----------------------------------------------------------------------
	// ee.addTemplate()  指定した内容のElementTemplateを作成してIDを返す
	// ee.createEL()     ElementTemplateからエレメントを作成して返す
	//----------------------------------------------------------------------
	addTemplate : function(parent, tag, attr_i, style_i, func_i){
		if(!tag){ return;}

		if(!parent){ parent = null;}
		else if(typeof parent == 'string'){ parent = ee(parent).el;}

		var attr  = {};
		var style = (style_i || {});
		var func  = (func_i  || {});

		if(!!attr_i){
			for(var name in attr_i){
				if(name==='unselectable' && attr_i[name]==='on'){
					style['userSelect'] = style['MozUserSelect'] = style['KhtmlUserSelect'] = 'none';
					attr['unselectable'] = 'on';
				}
				else{ attr[name] = attr_i[name];}
			}
		}

		_elp[_elpcnt++] = new _ELp(parent, tag, attr, style, func_i);
		return (_elpcnt-1);
	},
	createEL : function(tid, id){
		if(!_elp[tid]){ return null;}

		var temp = _elp[tid];
		var el = _doc.createElement(temp.tagName);

		if(!!id){ el.id = id;}
		for(var name in temp.attr) { el[name]       = temp.attr[name]; }
		for(var name in temp.style){ el.style[name] = temp.style[name];}
		for(var name in temp.func) { this.addEvent(el, name, temp.func[name], true); }

		if(!!temp.parent){ temp.parent.appendChild(el);} // 後ろじゃないとIEでエラーになる。。
		return el;
	},

	//----------------------------------------------------------------------
	// ee.getSrcElement() イベントが起こったエレメントを返す
	// ee.pageX()         イベントが起こったページ上のX座標を返す
	// ee.pageY()         イベントが起こったページ上のY座標を返す
	// ee.scrollLeft()    ウィンドウのXスクロール量を返す
	// ee.scrollTop()     ウィンドウのYスクロール量を返す
	// ee.windowWidth()   ウィンドウの幅を返す
	// ee.windowHeight()  ウィンドウの高さを返す
	//----------------------------------------------------------------------
	getSrcElement : function(e){
		return e.target || e.srcElement;
	},
	pageX : function(e){
		_ElementManager.pageX = ((!k.mobile) ?
			function(e){ return ((e.pageX!==void 0) ? e.pageX : e.clientX + this.scrollLeft());}
		:
			function(e){
				if(!!e.touches){
					var len=e.touches.length, pos=0;
					if(len>0){
						for(var i=0;i<len;i++){ pos += e.touches[i].pageX;}
						return pos/len;
					}
				}
				else if(!isNaN(e.pageX)){ return e.pageX;}
				else if(!isNaN(e.clientX)){ return e.clientX + this.scrollLeft();}
				return 0;
			}
		);
		return _ElementManager.pageX(e);
	},
	pageY : function(e){
		_ElementManager.pageY = ((!k.mobile) ?
			function(e){ return ((e.pageY!==void 0) ? e.pageY : e.clientY + this.scrollTop());}
		:
			function(e){
				if(!!e.touches){
					var len=e.touches.length, pos=0;
					if(len>0){
						for(var i=0;i<len;i++){ pos += e.touches[i].pageY;}
						return pos/len;
					}
				}
				else if(!isNaN(e.pageY)){ return e.pageY;}
				else if(!isNaN(e.clientY)){ return e.clientY + this.scrollTop();}
				return 0;
			}
		);
		return _ElementManager.pageY(e);
	},
	scrollLeft : function(){ return (_doc.documentElement.scrollLeft || _doc.body.scrollLeft);},
	scrollTop  : function(){ return (_doc.documentElement.scrollTop  || _doc.body.scrollTop );},

	windowWidth : function(){
		_ElementManager.windowWidth = ((!k.mobile) ?
			function(){ return ((_win.innerHeight!==void 0) ? _win.innerWidth : _doc.body.clientWidth);}
		:
			function(){ return 980;}
		);
		return _ElementManager.windowWidth();
	},
	windowHeight : function(){
		_ElementManager.windowHeight = ((!k.mobile) ?
			function(){ return ((_win.innerHeight!==void 0) ? _win.innerHeight : _doc.body.clientHeight);}
		:
			function(){ return (980*(_win.innerHeight/_win.innerWidth))|0;}
		);
		return _ElementManager.windowHeight();
	},

	//----------------------------------------------------------------------
	// ee.binder()   thisをbindする
	// ee.ebinder()  thisとイベントをbindする
	//----------------------------------------------------------------------
	binder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift();
		return function(){
			return __method.apply(obj, (args.length>0?args[0]:[]).concat(_toArray(arguments)));
		}
	},
	ebinder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift(), rest = (args.length>0?args[0]:[]);
		return function(e){
			return __method.apply(obj, [e||_win.event].concat(args.length>0?args[0]:[]).concat(_toArray(arguments)));
		}
	},

	//----------------------------------------------------------------------
	// ee.addEvent()        addEventListener(など)を呼び出す
	// ee.removeAllEvents() removeEventListener(など)を呼び出す
	// ee.stopPropagation() イベントの起こったエレメントより上にイベントを
	//                      伝播させないようにする
	// ee.preventDefault()  イベントの起こったエレメントで、デフォルトの
	//                      イベントが起こらないようにする
	//----------------------------------------------------------------------
	addEvent : function(el, event, func, capt){
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
		_elf.push({el:el, event:event, func:func, capt:!!capt});
	},
	removeAllEvents : function(){
		var islt = !!_doc.removeEventListener;
		for(var i=0,len=_elf.length;i<len;i++){
			var e=_elf[i];
			if(islt){ e.el.removeEventListener(e.event, e.func, e.capt);}
			else    { e.el.detachEvent('on'+e.event, e.func);}
		}
		_elf=[];
	},

	stopPropagation : function(e){
		if(!!e.stopPropagation){ e.stopPropagation();}
		else{ e.cancelBubble = true;}
	},
	preventDefault : function(e){
		if(!!e.preventDefault){ e.preventDefault();}
		else{ e.returnValue = false;}
	}
});

// implementation of _ElementManager.ElementExt class
_ElementManager.ElementExt.prototype = {
	//----------------------------------------------------------------------
	// ee.getRect()   エレメントの四辺の座標を返す
	// ee.getWidth()  エレメントの幅を返す
	// ee.getHeight() エレメントの高さを返す
	//----------------------------------------------------------------------
	getRect : function(){
		this.getRect = ((!!document.createElement('div').getBoundingClientRect) ?
			function(){
				var rect = this.el.getBoundingClientRect(), _html, _body, scrollLeft, scrollTop;
				if(!_win.scrollX==void 0){
					scrollLeft = _win.scrollX;
					scrollTop  = _win.scrollY;
				}
				else{
					_html = _doc.documentElement; _body = _doc.body;
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
			function(){
				var left = 0, top = 0, el = this.el;
				while(!!el){
					left += +(!isNaN(el.offsetLeft) ? el.offsetLeft : el.clientLeft);
					top  += +(!isNaN(el.offsetTop)  ? el.offsetTop  : el.clientTop );
					el = el.offsetParent;
				}
				var right  = left + (this.el.offsetWidth  || this.el.clientWidth);
				var bottom = top  + (this.el.offsetHeight || this.el.clientHeight);
				return { top:top, bottom:bottom, left:left, right:right};
			}
		);
		return this.getRect();
	},
	getWidth  : function(){ return this.el.offsetWidth  || this.el.clientWidth; },
	getHeight : function(){ return this.el.offsetHeight || this.el.clientHeight;},

	//----------------------------------------------------------------------
	// ee.unselectable()         エレメントを選択できなくする
	// ee.replaceChildrenClass() 子要素のクラスを変更する
	// ee.remove()               エレメントを削除する
	// ee.removeNextAll()        同じ親要素を持ち、自分より後ろにあるエレメントを削除する
	//----------------------------------------------------------------------
	unselectable : function(){
		this.el.style.MozUserSelect   = 'none';
		this.el.style.KhtmlUserSelect = 'none';
		this.el.style.userSelect      = 'none';
		this.el.unselectable = "on";
		return this;
	},

	replaceChildrenClass : function(before, after){
		var el = this.el.firstChild;
		while(!!el){
			if(el.className===before){ el.className = after;}
			el = el.nextSibling;
		}
	},

	remove : function(){
		this.parent.removeChild(this.el);
		return this;
	},
	removeNextAll : function(targetbase){
		var el = this.el.lastChild;
		while(!!el){
			if(el===targetbase){ break;}
			if(!!el){ this.el.removeChild(el);}else{ break;}

			el = this.el.lastChild;
		}
		return this;
	},

	//----------------------------------------------------------------------
	// ee.appendHTML() 指定したHTMLを持つspanエレメントを子要素の末尾に追加する
	// ee.appendBR()   <BR>を子要素の末尾に追加する
	// ee.appendEL()   指定したエレメントを子要素の末尾に追加する
	// ee.appendTo()   自分を指定した親要素の末尾に追加する
	// ee.insertBefore() エレメントを自分の前に追加する
	// ee.insertAfter()  エレメントを自分の後ろに追加する
	//----------------------------------------------------------------------
	appendHTML : function(html){
		var sel = _doc.createElement('span');
		sel.innerHTML = html;
		this.el.appendChild(sel);
		return this;
	},
	appendBR : function(){
		this.el.appendChild(_doc.createElement('br'));
		return this;
	},
	appendEL : function(el){
		this.el.appendChild(el);
		return this;
	},

	appendTo : function(elx){
		elx.el.appendChild(this.el);
		this.parent = elx.el;
		return this;
	},

	insertBefore : function(baseel){
		this.parent = baseel.parentNode;
		this.parent.insertBefore(this.el,baseel);
		return this;
	},
	insertAfter : function(baseel){
		this.parent = baseel.parentNode;
		this.parent.insertBefore(this.el,baseel.nextSibling);
		return this;
	}
};

})();
