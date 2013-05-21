// ToolArea.js v3.4.0
(function(){

/* uiオブジェクト生成待ち */
if(!window.ui){ setTimeout(setTimeout(arguments.callee),15); return;}

// メニュー描画/取得/html表示系
// toolareaオブジェクト
/* extern */
ui.toolarea = {

	isdisp : true,		// 表示しているか

	//---------------------------------------------------------------------------
	// toolarea.init()   管理領域の初期設定を行う
	// toolarea.reset()  管理領域用の設定を消去する
	//---------------------------------------------------------------------------
	init : function(){
		this.createLabels();
		this.createManageArea();
		this.createButtonArea();
	},

	reset : function(){
		this.btnstack = [];
		this.labels   = {};

		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';

		if(!!this.area){ this.area.innerHTML = '';}
	},

	//---------------------------------------------------------------------------
	// toolarea.createLabels()  管理領域に存在するデータを設定する
	//---------------------------------------------------------------------------
	createLabels : function(){
		/* mode */
		this.addLabel('mode','モード', 'mode');
		this.addLabel('mode_1', '問題作成モード', 'Edit mode'  );
		this.addLabel('mode_3', '回答モード',     'Answer mode');

		/* 操作方法の設定値 */
		this.addLabel('use', '操作方法', 'Input Type');
		this.addLabel('use_1', '左右ボタン','LR Button');
		this.addLabel('use_2', '1ボタン',   'One Button');

		this.addLabel('use_tri', '三角形の入力方法', 'Input Triangle Type');
		this.addLabel('use_tri_1', 'クリックした位置', 'Corner-side');
		this.addLabel('use_tri_2', '引っ張り入力', 'Pull-to-Input');
		this.addLabel('use_tri_3', '1ボタン', 'One Button');

		/* 盤面表示形式の設定値 */
		this.addLabel('disptype_bosanowa', '表示形式', 'Display');
		this.addLabel('disptype_bosanowa_1', 'ニコリ紙面形式', 'Original Type');
		this.addLabel('disptype_bosanowa_2', '倉庫番形式',     'Sokoban Type');
		this.addLabel('disptype_bosanowa_3', 'ワリタイ形式',   'Waritai type');

		/* 盤面チェックの設定値 */
		this.addLabel('redline', '線のつながりをチェックする', 'Check countinuous lines');
		this.addLabel('redblk', '黒マスのつながりをチェックする', 'Check countinuous black cells');
		this.addLabel('redblkrb', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous black cells with its corner');
		this.addLabel('redroad', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');

		/* 背景色入力の設定値 */
		this.addLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');

		/* 文字別正解表示の設定値 */
		var pid = ui.puzzle.pid;
		if(pid==='hashikake'||pid==='kurotto'){
			this.addLabel('circolor', '正しい数字をグレーにする', 'Grey if the number is correct.');
		}
		else if(pid==='kouchoku'){
			this.addLabel('circolor', '線が2本以上になったら点をグレーにする', 'Grey if the letter links over two segments.');
		}

		this.addLabel('plred', '重複している数字を赤くする', 'Show overlapped number as red.');

		this.addLabel('colorslash', '斜線を輪切りかのどちらかで色分けする(重いと思います)', 'Encolor slashes whether it consists in a loop or not.(Too busy)');

		/* 正当判定方法の設定値 */
		this.addLabel('enbnonum', '全ての数字が入っていない状態での正答判定を許可する', 'Allow answer check with empty cell in the board.');

		/* kouchoku: 線の引き方の設定値 */
		this.addLabel('enline', '点の間のみ線を引けるようにする', 'Able to draw line only between the points.');
		this.addLabel('lattice', '点を通過する線を引けないようにする', 'Disable drawing segment passing over a lattice point.');

		/* 問題形式の設定値 */
		this.addLabel('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');

		this.addLabel('snakebd', 'へびの周りに境界線を表示する', 'Draw border around a snake.');

		/* EDITOR時の設定値 */
		this.addLabel('bdpadding', 'URL生成時に周り1マス何もない部分をつける', 'Add Padding around the Board in outputting URL.');

		this.addLabel('discolor', '星クリックによる色分けを無効化する', 'Disable Coloring up by clicking star');

		this.addLabel('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');

		this.addLabel('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');

		this.addLabel('irowake', '線の色分けをする', 'Color each lines');
		this.addLabel('irowakeblk', '黒マスの色分けをする', 'Color each blocks');
	},

	//---------------------------------------------------------------------------
	// toolarea.createManageArea()  管理領域を初期化する
	//---------------------------------------------------------------------------
	createManageArea : function(){
		// ElementTemplate : 管理領域
		var el_div = pzprv3.createEL('div');

		var el_span = pzprv3.createEL('span');
		pzprv3.unselectable(el_span);

		var el_checkbox = pzprv3.createEL('input');
		el_checkbox.type = 'checkbox';
		el_checkbox.check = '';

		var el_selchild = pzprv3.createEL('div');
		el_selchild.className = 'flag';
		pzprv3.unselectable(el_selchild);

		// usearea & checkarea
		var pp = ui.menuarea.items;
		for(var idname in this.labels){
			if(!this.getLabel(idname)){ continue;}
			var _div = el_div.cloneNode(false);
			_div.id = 'div_'+idname;

			switch(pp.type(idname)){
			case pp.SELECT:
				var span = el_span.cloneNode(false);
				span.id = 'cl_'+idname;
				_div.appendChild(span);
				_div.appendChild(document.createTextNode(" | "));
				for(var i=0;i<pp.item[idname].children.length;i++){
					var num = pp.item[idname].children[i];
					var sel = el_selchild.cloneNode(false);
					sel.id = ['up',idname,num].join("_");
					ui.event.addEvent(sel, "click", this, this.selectclick);
					_div.appendChild(sel);
					_div.appendChild(document.createTextNode(' '));
				}
				_div.appendChild(document.createElement('br'));

				getEL('usepanel').appendChild(_div);
				break;

			case pp.CHECK:
				var box = el_checkbox.cloneNode(false);
				box.id = 'ck_'+idname;
				ui.event.addEvent(box, "click", this, this.checkclick);
				_div.appendChild(box);
				_div.appendChild(document.createTextNode(" "));
				var span = el_span.cloneNode(false);
				span.id = 'cl_'+idname;
				_div.appendChild(span);
				_div.appendChild(document.createElement('br'));

				getEL('checkpanel').appendChild(_div);
				break;
			}
		}

		// 色分けチェックボックス用の処理
		if(!!this.labels.irowake || !!this.labels.irowakeblk){
			// 横にくっつけたいボタンを追加
			var el = createButton();
			el.id = "ck_btn_irowake";
			this.addButtons(el, "色分けしなおす", "Change the color of Line");
			var node = getEL('cl_irowake');
			node.parentNode.insertBefore(el, node.nextSibling);
		}

		// 管理領域の表示/非表示設定
		if(pzprv3.EDITOR){
			getEL('timerpanel').style.display = 'none';
			getEL('separator2').style.display = 'none';
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.createButtonArea()   ボタン用の初期設定を行う
	//---------------------------------------------------------------------------
	createButtonArea : function(){
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

		this.addButtons(btncheck, "チェック", "Check");
		this.addButtons(btnundo,  "戻", "<-");
		this.addButtons(btnredo,  "進", "->");
		this.addButtons(btnclear, "回答消去", "Erase Answer");

		// 初期値ではどっちも押せない
		getEL('btnundo').disabled = true;
		getEL('btnredo').disabled = true;

		if(!ui.puzzle.flags.disable_subclear){
			var el = createButton(); el.id = "btnclear2";
			this.area.appendChild(el);
			this.addButtons(el, "補助消去", "Erase Auxiliary Marks");
		}

		if(!!ui.puzzle.flags.irowake || !!ui.puzzle.flags.irowakeblk){
			var el = createButton(); el.id = "btncolor2";
			this.area.appendChild(el);
			this.addButtons(el, "色分けしなおす", "Change the color of Line");
			el.style.display = 'none';
		}

		if(ui.puzzle.pid==='pipelinkr'){
			var el = createButton(); el.id = 'btncircle';
			pzprv3.unselectable(el);
			ui.event.addEvent(el, "click", this, this.toggledisp);
			this.area.appendChild(el);
		}

		if(ui.puzzle.pid==='tentaisho'){
			var el = createButton(); el.id = 'btncolor';
			this.area.appendChild(el);
			this.addButtons(el, "色をつける","Color up");
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.display()    全てのラベルに対して文字列を設定する
	// toolarea.setdisplay() 管理パネルに表示する文字列を個別に設定する
	// toolarea.enb_undo()   html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	display : function(){
		for(var idname in this.labels){ this.setdisplay(idname);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			var obj = this.btnstack[i];
			if(!obj.el){ continue;}
			obj.el.value = obj.str[ui.menu.getMenuConfig('language')];
		}
		this.enb_undo();
		
		var mandisp  = (this.isdisp ? 'block' : 'none');
		getEL('usepanel').style.display = mandisp;
		getEL('checkpanel').style.display = mandisp;
		if(!pzprv3.EDITOR){
			getEL('separator2').style.display = mandisp;
		}
		if(ui.puzzle.flags.irowake || ui.puzzle.flags.irowakeblk){
			/* ボタンエリアのボタンは、管理領域が消えている時に表示 */
			getEL('btncolor2').style.display = (this.isdisp ? 'none' : 'inline');
		}
		getEL('menuboard').style.paddingBottom = (this.isdisp ? '8pt' : '0pt');
		
		if(pzprv3.browser.IE6){
			getEL('separator2').style.margin = '0pt';
		}
	},
	setdisplay : function(idname){
		var pp = ui.menuarea.items;
		if(!pp || !pp.item[idname]){ return;}
		
		switch(pp.type(idname)){
		case pp.SELECT:
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = this.getLabel(idname);}
			
			/* 子要素の設定も行う */
			for(var i=0,len=pp.item[idname].children.length;i<len;i++){
				this.setdisplay(""+idname+"_"+pp.item[idname].children[i]);
			}
			break;

		case pp.CHILD:
			var manage = getEL('up_'+idname);
			if(!!manage){
				var val = ui.menu.getConfigVal(pp.item[idname].parent);
				manage.innerHTML = this.getLabel(idname);
				manage.className = ((pp.item[idname].val == val)?"childsel":"child");
			}
			break;

		case pp.CHECK:
			/* チェックボックスの表記の設定 */
			var check = getEL('ck_'+idname);
			if(!!check){ check.checked = ui.menu.getConfigVal(idname);}
			/* ラベルの表記の設定 */
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = this.getLabel(idname);}
			break;
		}
		
		if(idname==='keypopup'){
			var kp = ui.keypopup;
			if(kp.paneltype[1]!==0 || kp.paneltype[3]!==0){
				var f = !!kp.paneltype[ui.puzzle.get('mode')];
				getEL('ck_keypopup').disabled    = (f?"":"true");
				getEL('cl_keypopup').style.color = (f?"black":"silver");
			}
		}
		
		if(idname==='bgcolor'){
			if(ui.puzzle.flags.bgcolor){
				var mode = ui.puzzle.get('mode');
				getEL('ck_bgcolor').disabled    = (mode==3?"":"true");
				getEL('cl_bgcolor').style.color = (mode==3?"black":"silver");
			}
		}
		
		if(ui.puzzle.pid==='pipelinkr'){
			getEL('btncircle').value = ((ui.puzzle.get(idname)==1)?"○":"■");
		}
	},

	enb_undo : function(){
		var opemgr = ui.puzzle.opemgr;
		getEL('btnundo').disabled = (!opemgr.enableUndo ? 'disabled' : '');
		getEL('btnredo').disabled = (!opemgr.enableRedo ? 'disabled' : '');
	},

	//---------------------------------------------------------------------------
	// toolarea.getLabel()  管理パネルとチェック型サブメニューに表示する文字列を返す
	// toolarea.setLabel()  管理領域に表記するラベル文字列を設定する
	//---------------------------------------------------------------------------
	getLabel : function(idname){
		var obj  = this.labels[idname];
		return ui.menu.selectStr(obj.str_jp, obj.str_en);
	},
	addLabel : function(idname, strJP, strEN){
		if(!!ui.menuarea.items.item[idname]){
			this.labels[idname] = {str_jp:strJP, str_en:strEN};
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.addButtons() ボタンの情報を変数に登録する
	//---------------------------------------------------------------------------
	addButtons : function(el, strJP, strEN){
		ui.event.addEvent(el, "click", this, this.buttonclick);
		pzprv3.unselectable(el);
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// toolarea.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// toolarea.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	// toolarea.buttonclick()  ボタンがクリックされたときの動作
	//---------------------------------------------------------------------------
	checkclick : function(e){
		var el = (e.target||e.srcElement);
		var idname = el.id.substr(3);
		ui.menu.setConfigVal(idname, !!el.checked);
	},
	selectclick : function(e){
		var list = (e.target||e.srcElement).id.split('_');
		list.shift();
		var child = list.pop(), idname = list.join("_");
		ui.menu.setConfigVal(idname, child);
	},
	buttonclick : function(e){
		var id = (e.target||e.srcElement).id;
		switch(id){
		case 'btncheck':  ui.menu.answercheck(); break;
		case 'btnundo':   ui.puzzle.undo(); ui.menu.enb_undo(); break;
		case 'btnredo':   ui.puzzle.redo(); ui.menu.enb_undo(); break;
		case 'btnclear':  ui.menu.ACconfirm(); break;
		case 'btnclear2': ui.menu.ASconfirm(); break;
		case 'btncolor2': case 'ck_btn_irowake': ui.puzzle.irowake(); break;
		case 'btncolor': ui.puzzle.board.encolorall(); break; /* 天体ショーのボタン */
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.toggledisp()   アイスと○などの表示切り替え時の処理を行う
	//---------------------------------------------------------------------------
	toggledisp : function(){
		var current = ui.puzzle.get('disptype_pipelinkr');
		ui.puzzle.set('disptype_pipelinkr', (current==1?2:1));
	}
};

var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createButton(){
	var button = pzprv3.createEL('input');
	button.type = 'button';
	return button;
}

})();
