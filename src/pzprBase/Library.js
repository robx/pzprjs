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
	_elx = _ElementManager._cache    = {}
;

	// ee.clean()  内部用の変数を初期化する
	_ElementManager.clean = function(){ _elx = null; _elx = {};};

	_win.ee = _ElementManager;
	var _iOS = (navigator.userAgent.indexOf('like Mac OS X') > -1);

})();
