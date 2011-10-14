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

	// define and map _ElementManager.ElementExt class
	_ELx = _ElementManager.ElementExt = function(el){
		this.el     = el;
		this.parent = el.parentNode;
		this.pdisp  = 'none';
	},

	// Utility functions
	_extend = function(obj, ads){
		for(var name in ads){ obj[name] = ads[name];}
	}
;

	_win.ee = _ElementManager;
	var _iOS = (navigator.userAgent.indexOf('like Mac OS X') > -1);

// implementation of _ElementManage class
_extend( _ElementManager, {

	//----------------------------------------------------------------------
	// ee.clean()  内部用の変数を初期化する
	//----------------------------------------------------------------------
	clean : function(){
		_elx = null;
		_elx = {};
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
