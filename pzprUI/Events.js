// Events.js v3.4.0
(function(){

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★Eventsクラス イベント設定の管理を行う
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
pzprv3.createCoreClass('Events',
{
	initialize : function(puzzle){
		this.puzzle = puzzle;
		
		this.enableMouse = true;	// マウス入力は有効か
		this.enableKey = true;		// キー入力は有効か
		
		this.currentpos = {px:0,py:0};
		
		this.mouseoffset = {px:0,py:0};
		if(pzprv3.browser.IE6||pzprv3.browser.IE7||pzprv3.browser.IE8){ this.mouseoffset = {px:2,py:2};}
		else if(pzprv3.browser.WebKit){ this.mouseoffset = {px:1,py:1};}
		
		this.resizetimer = null;	// resizeタイマー
	},
	evlist : [],

	//----------------------------------------------------------------------
	// event.addEvent()          addEventListener(など)を呼び出す
	// event.addMouseDownEvent() マウスを押したときのイベントを設定する
	// event.addMouseMoveEvent() マウスを動かしたときのイベントを設定する
	// event.addMouseUpEvent()   マウスボタンを離したときのイベントを設定する
	// event.removeAllEvents()   removeEventListener(など)を呼び出す
	//----------------------------------------------------------------------
	addEvent : function(el, event, self, callback, capt){
		var func = function(e){ callback.call(self, (e||window.event));};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
		this.evlist.push({el:el, event:event, func:func, capt:!!capt});
	},

	addMouseDownEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerDown", self, func);
		}
		else{
			this.addEvent(el, "mousedown", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchstart", self, func);
			}
		}
	},
	addMouseMoveEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerMove", self, func);
		}
		else{
			this.addEvent(el, "mousemove", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchmove",  self, func);
			}
		}
	},
	addMouseUpEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerUp", self, func);
		}
		else{
			this.addEvent(el, "mouseup", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchend", self, func);
			}
		}
	},

	removeAllEvents : function(){
		var islt = !!document.removeEventListener;
		for(var i=0,len=this.evlist.length;i<len;i++){
			var e=this.evlist[i];
			if(islt){ e.el.removeEventListener(e.event, e.func, e.capt);}
			else    { e.el.detachEvent('on'+e.event, e.func);}
		}
		this.evlist=[];
	},

	//---------------------------------------------------------------------------
	// event.setEvents() ぱずぷれv3で使用するイベントを設定する
	//---------------------------------------------------------------------------
	setEvents : function(){
		this.setMouseEvents();
		this.setKeyEvents();
		
		this.setWindowEvents();
		
		// ポップアップメニューにイベントを割り当てる
		pzprv3.ui.popupmgr.setEvents();
	},

	//---------------------------------------------------------------------------
	// event.setMouseEvents() マウス入力に関するイベントを設定する
	//---------------------------------------------------------------------------
	setMouseEvents : function(){
		// マウス入力イベントの設定
		var mv = this.puzzle.mouse;
		var elements = [pzprv3.getEL('divques')];
		if(this.puzzle.painter.fillTextEmulate){ elements.push(pzprv3.getEL('numobj_parent'));}
		for(var i=0;i<elements.length;i++){
			var el = elements[i];
			this.addMouseDownEvent(el, this, this.e_mousedown);
			this.addMouseMoveEvent(el, this, this.e_mousemove);
			this.addMouseUpEvent  (el, this, this.e_mouseup);
			el.oncontextmenu = function(){ return false;};
		}
		if(this.puzzle.pid==='kouchoku'){
			var canvas = pzprv3.getEL('divques');
			this.addEvent(canvas, "mouseout", this, this.e_mouseout);
		}
		mv.mousereset();
	},

	//---------------------------------------------------------------------------
	// event.e_mousedown() Canvas上でマウスのボタンを押した際のイベント共通処理
	// event.e_mouseup()   Canvas上でマウスのボタンを放した際のイベント共通処理
	// event.e_mousemove() Canvas上でマウスを動かした際のイベント共通処理
	// event.e_mouseout()  マウスカーソルがウィンドウから離れた際のイベント共通処理
	//---------------------------------------------------------------------------
	//イベントハンドラから呼び出される
	// この3つのマウスイベントはCanvasから呼び出される(mvをbindしている)
	e_mousedown : function(e){
		if(!this.enableMouse){ return true;}
		
		var mv = this.puzzle.mouse;
		mv.btn = this.getMouseButton(e);
		if(mv.btn.Left || mv.btn.Right){
			this.setposition(e);
			mv.mouseevent(this.currentpos.px, this.currentpos.py, 0);	// 各パズルのルーチンへ
		}
		else if(this.btn.Middle){ //中ボタン
			mv.modeflip();
			mv.mousereset();
		}
		this.stopPropagation(e);
		this.preventDefault(e);
		return false;
	},
	e_mouseup   : function(e){
		if(!this.enableMouse){ return true;}
		
		var mv = this.puzzle.mouse;
		if(mv.btn.Left || mv.btn.Right){
			mv.mouseevent(this.currentpos.px, this.currentpos.py, 2);	// 各パズルのルーチンへ
			mv.mousereset();
		}
		this.stopPropagation(e);
		this.preventDefault(e);
		return false;
	},
	e_mousemove : function(e){
		// ポップアップメニュー移動中は当該処理が最優先
		if(!this.enableMouse){ return true;}
		
		var mv = this.puzzle.mouse;
		if(mv.btn.Left || mv.btn.Right){
			this.setposition(e);
			mv.mouseevent(this.currentpos.px, this.currentpos.py, 1);	// 各パズルのルーチンへ
		}
		this.stopPropagation(e);
		this.preventDefault(e);
		return false;
	},
	e_mouseout : function(e) {
		if(this.puzzle.pid!=='kouchoku'){
			this.mouseevent(this.currentpos.px, this.currentpos.py, 3);
		}
		else{
			// 子要素に入ってもmouseoutイベントが起きてしまうので、サイズを確認する
			var pos = this.getPagePos(e), rect=pzprv3.getRect(pzprv3.getEL('divques'));
			var mv = this.puzzle.mouse;
			if(pos.px<=rect.left || pos.px>=rect.right || pos.py<=rect.top || pos.py>=rect.bottom){
				if(this.inputData===1){
					var cross1=mv.targetPoint[0], cross2=mv.targetPoint[1];
					mv.targetPoint = [null, null];
					if(cross1!==null){ cross1.draw();}
					if(cross2!==null){ cross2.draw();}
				}
				mv.mousereset();
			}
		}
	},

	//---------------------------------------------------------------------------
	// mv.setposition()   イベントが起こった座標を代入
	//---------------------------------------------------------------------------
	setposition : function(e){
		var pc = this.puzzle.painter, pagePos = this.getPagePos(e);
		this.currentpos.px = (pagePos.px - pc.pageX - this.mouseoffset.px);
		this.currentpos.py = (pagePos.py - pc.pageY - this.mouseoffset.py);
	},

	//---------------------------------------------------------------------------
	// event.getMouseButton() 左/中/右ボタンが押されているかチェックする
	//---------------------------------------------------------------------------
	getMouseButton : function(e){
		var left=false, mid=false, right=false;
		if(e.touches!==void 0){
			/* touchイベントだった場合 */
			left  = (e.touches.length===1);
			right = (e.touches.length>1);
		}
		else{
			if(pzprv3.browser.IE6 || pzprv3.browser.IE7 || pzprv3.browser.IE8){
				left  = (e.button===1);
				mid   = (e.button===4);
				right = (e.button===2);
			}
			else{
				left  = (!!e.which ? e.which===1 : e.button===0);
				mid   = (!!e.which ? e.which===2 : e.button===1);
				right = (!!e.which ? e.which===3 : e.button===2);
			}
		}

		// SHIFTキー/Commandキーを押している時は左右ボタン反転
		var o = this.puzzle;
		this.checkmodifiers(e);
		if(((o.key.isSHIFT || o.key.isMETA)^o.getConfig('lrcheck'))&&(left!==right))
			{ left=!left; right=!right;}

		return {Left:left, Middle:mid, Right:right};
	},

	//----------------------------------------------------------------------
	// event.getPagePos() イベントが起こったページ上の座標を返す
	// event.pageX()      イベントが起こったページ上のX座標を返す
	// event.pageY()      イベントが起こったページ上のY座標を返す
	//----------------------------------------------------------------------
	getPagePos : function(e){
		var pos = new pzprv3.core.Point(0, 0);
		pos.px = this.pageX(e);
		pos.py = this.pageY(e);
		return pos;
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

	//---------------------------------------------------------------------------
	// event.setKeyEvents() キーボード入力に関するイベントを設定する
	//---------------------------------------------------------------------------
	setKeyEvents : function(){
		// キー入力イベントの設定
		this.addEvent(document, 'keydown',  this, this.e_keydown);
		this.addEvent(document, 'keyup',    this, this.e_keyup);
		this.addEvent(document, 'keypress', this, this.e_keypress);
		// Silverlightのキー入力イベント設定
		var g = this.puzzle.painter.currentContext;
		if(g.use.sl){
			var receiver = this, sender = g.content.findName(g.canvasid);
			sender.AddEventListener("KeyDown", function(s,a){ receiver.e_SLkeydown(s,a);});
			sender.AddEventListener("KeyUp",   function(s,a){ receiver.e_SLkeyup(s,a);});
		}
		
		var kc = this.puzzle.key;
		kc.keyreset();
		kc.create();
	},

	//---------------------------------------------------------------------------
	// event.e_keydown()  キーを押した際のイベント共通処理
	// event.e_keyup()    キーを離した際のイベント共通処理
	// event.e_keypress() キー入力した際のイベント共通処理(-キー用)
	//---------------------------------------------------------------------------
	// この3つのキーイベントはwindowから呼び出される(kcをbindしている)
	e_keydown : function(e){
		if(!this.enableKey){ return;}
		
		var c = this.getchar(e);
		if(c){
			/* 各パズルのルーチンへ */
			var sts = this.puzzle.key.keydown(c);
			if(!sts){ this.preventDefault(e);}
		}
	},
	e_keyup : function(e){
		if(!this.enableKey){ return;}
		
		var c = this.getchar(e);
		if(c){ this.puzzle.key.keyup(c);}	/* 各パズルのルーチンへ */
	},
	e_keypress : function(e){
		if(!this.enableKey){ return;}
		
		var c = this.getcharp(e);
		if(c){
			/* 各パズルのルーチンへ */
			var sts = this.puzzle.key.keydown(c);
			if(!sts){ this.preventDefault(e);}
		}
	},

	//---------------------------------------------------------------------------
	// event.e_SLkeydown() Silverlightオブジェクトにフォーカスがある時、キーを押した際のイベント共通処理
	// event.e_SLkeyup()   Silverlightオブジェクトにフォーカスがある時、キーを離した際のイベント共通処理
	//---------------------------------------------------------------------------
	e_SLkeydown : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:function(){} };
		return this.e_keydown(emulate);
	},
	e_SLkeyup : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:function(){} };
		return this.e_keyup(emulate);
	},

	//---------------------------------------------------------------------------
	// event.getchar()  入力されたキーを表す文字列を返す
	// event.getcharp() 入力されたキーを表す文字列を返す(keypressの時)
	//---------------------------------------------------------------------------
	// 48～57は0～9キー、65～90はa～z、96～105はテンキー、112～123はF1～F12キー
	getchar : function(e){
		this.checkmodifiers(e);

		var kc = this.puzzle.key;
		if     (e.keyCode==38){ return kc.KEYUP;}
		else if(e.keyCode==40){ return kc.KEYDN;}
		else if(e.keyCode==37){ return kc.KEYLT;}
		else if(e.keyCode==39){ return kc.KEYRT;}

		var keycode = (!!e.keyCode ? e.keyCode: e.charCode);
		if     ( 48<=keycode && keycode<= 57){ return (keycode-48).toString(36);}
		else if( 65<=keycode && keycode<= 90){ return (keycode-55).toString(36);} //アルファベット
		else if( 96<=keycode && keycode<=105){ return (keycode-96).toString(36);} //テンキー対応
		else if(112<=keycode && keycode<=123){ return 'F'+(keycode - 111).toString(10);}
		else if(keycode==32 || keycode==46)  { return ' ';} // 32はスペースキー 46はdelキー
		else if(keycode==8)                  { return 'BS';}

		else if(e.shiftKey){ return 'shift';}

		return '';
	},
	// (keypressのみ)45は-(マイナス)
	getcharp : function(e){
		this.checkmodifiers(e);

		if((!!e.keyCode ? e.keyCode: e.charCode)==45){ return '-';}
		return '';
	},

	//---------------------------------------------------------------------------
	// event.checkmodifiers()  Shift, Ctrl, Alt, Metaキーをチェックする
	//---------------------------------------------------------------------------
	checkmodifiers : function(e){
		var kc = this.puzzle.key;
		if(kc.isSHIFT ^ e.shiftKey){ kc.isSHIFT = e.shiftKey; if(!kc.isSHIFT){ kc.ca='';}}
		if(kc.isCTRL  ^ e.ctrlKey) { kc.isCTRL  = e.ctrlKey;  kc.ca='';}
		if(kc.isMETA  ^ e.metaKey) { kc.isMETA  = e.metaKey;  kc.ca='';}
		if(kc.isALT   ^ e.altKey)  { kc.isALT   = e.altKey;   kc.ca='';}

		if(!(kc.isCTRL || kc.isMETA)){ pzprv3.undotimer.stop();}
	},

	//---------------------------------------------------------------------------
	// event.setWindowEvents()  マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setWindowEvents : function(){
		// File API＋Drag&Drop APIの設定
		if(!!pzprv3.ui.reader){
			var DDhandler = function(e){
				pzprv3.ui.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			};
			this.addEvent(window, 'dragover', this, function(e){ e.preventDefault();}, true);
			this.addEvent(window, 'drop', this, DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		this.addEvent(document, 'blur', this, this.onblur_func);

		// onresizeイベントを割り当てる
		var evname = (!pzprv3.OS.iOS ? 'resize' : 'orientationchange');
		this.addEvent(window, evname, this, this.onresize_func);
	},

	//---------------------------------------------------------------------------
	// event.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// event.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		var self = this;
		this.resizetimer = setTimeout(function(){ self.puzzle.painter.forceRedraw();},250);
	},
	onblur_func : function(){
		this.puzzle.key.keyreset();
		this.puzzle.mouse.mousereset();
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
});

})();
