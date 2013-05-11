// ButtonArea.js v3.4.0
(function(){

/* uiオブジェクト生成待ち */
if(!window.ui){ setTimeout(setTimeout(arguments.callee),15); return;}

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
/* extern */
ui.buttonarea = {
	btnstack : [],			// ボタンの情報(idnameと文字列のリスト)
	area : null,

	//---------------------------------------------------------------------------
	// buttonarea.init()   ボタン用の初期設定を行う
	// buttonarea.reset()  ボタン用の設定を消去する
	//---------------------------------------------------------------------------
	init : function(){
		this.area = pzprv3.getEL('btnarea');

		// (Canvas下) ボタンの初期設定
		var btncheck = createButton(); btncheck.id = "btncheck";
		var btnundo  = createButton(); btnundo.id  = "btnundo";
		var btnredo  = createButton(); btnredo.id  = "btnredo";
		var btnclear = createButton(); btnclear.id = "btnclear";

		this.area.appendChild(btncheck);
		this.area.appendChild(document.createTextNode(' '));
		this.area.appendChild(btnundo);
		this.area.appendChild(btnredo);
		this.area.appendChild(document.createTextNode(' '));
		this.area.appendChild(btnclear);

		this.addButtons(btncheck, function(){ ui.menu.answercheck();}, "チェック", "Check");
		this.addButtons(btnundo,  function(){ ui.puzzle.undo(); ui.menu.enb_btn();}, "戻", "<-");
		this.addButtons(btnredo,  function(){ ui.puzzle.redo(); ui.menu.enb_btn();}, "進", "->");
		this.addButtons(btnclear, function(){ ui.menu.ACconfirm();}, "回答消去", "Erase Answer");

		// 初期値ではどっちも押せない
		getEL('btnundo').disabled = true;
		getEL('btnredo').disabled = true;

		if(!ui.puzzle.flags.disable_subclear){
			var el = createButton(); el.id = "btnclear2";
			this.area.appendChild(el);
			this.addButtons(el, function(){ self.ASconfirm();}, "補助消去", "Erase Auxiliary Marks");
		}

		if(!!ui.puzzle.flags.irowake){
			var el = createButton(); el.id = "btncolor2";
			this.area.appendChild(el);
			this.addButtons(el, function(){ ui.puzzle.irowake();}, "色分けしなおす", "Change the color of Line");
			el.style.display = 'none';
		}

		if(ui.puzzle.pid==='pipelinkr'){
			var el = createButton(); el.id = 'btncircle';
			pzprv3.unselectable(el);
			el.onclick = function(){ self.toggledisp();};
			this.area.appendChild(el);
		}

		if(ui.puzzle.pid==='tentaisho'){
			var el = createButton(); el.id = 'btncolor';
			this.area.appendChild(el);
			this.addButtons(el, function(){ puzzle.board.encolorall();}, "色をつける","Color up");
		}
	},

	reset : function(){
		if(!!this.area){ this.area.innerHTML = '';}

		this.btnstack = [];
	},

	//---------------------------------------------------------------------------
	// buttonarea.addButtons() ボタンの情報を変数に登録する
	// buttonarea.display()    言語切り替え時などにキャプションを変更する
	//---------------------------------------------------------------------------
	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		pzprv3.unselectable(el);
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},
	display : function(){
		this.enb_undo();
		
		for(var i=0,len=this.btnstack.length;i<len;i++){
			var obj = this.btnstack[i];
			if(!obj.el){ continue;}
			obj.el.value = obj.str[ui.menu.getMenuConfig('language')];
		}
		if(ui.puzzle.pid==='pipelinkr'){
			getEL('btncircle').value = ((ui.puzzle.getConfig(idname)==1)?"○":"■");
		}
	},

	//---------------------------------------------------------------------------
	// buttonarea.toggledisp()   アイスと○などの表示切り替え時の処理を行う
	// buttonarea.enb_undo()     html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	toggledisp : function(){
		var current = ui.puzzle.getConfig('disptype_pipelinkr');
		ui.puzzle.setConfig('disptype_pipelinkr', (current==1?2:1));
	},
	enb_undo : function(){
		var opemgr = ui.puzzle.opemgr;
		getEL('btnundo').disabled = (!opemgr.enableUndo ? 'disabled' : '');
		getEL('btnredo').disabled = (!opemgr.enableRedo ? 'disabled' : '');
	}
};

var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createButton(){
	button = pzprv3.createEL('input');
	button.type = 'button';
	return button;
}

})();
