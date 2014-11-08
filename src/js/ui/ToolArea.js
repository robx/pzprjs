// ToolArea.js v3.4.0
/* global ui:false, createEL:false, createButton:false, getEL:false */

// メニュー描画/取得/html表示系
// toolareaオブジェクト
ui.toolarea = {
	area : null,		// ボタン表示領域の要素を保持する
	isdisp : true,		// 管理パネルを表示しているか

	//---------------------------------------------------------------------------
	// toolarea.reset()  管理領域の初期設定を行う
	//---------------------------------------------------------------------------
	reset : function(){
		this.btnstack = [];
		this.labels   = {};

		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';

		if(!!this.area){ this.area.innerHTML = '';}

		this.createLabels();
		this.createManageArea();
		this.createButtonArea();
		
		this.display();
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
		this.addLabel('dispmove', '動かしたように描画を行う', 'Display as object moving');

		this.addLabel('disptype_bosanowa', '表示形式', 'Display');
		this.addLabel('disptype_bosanowa_1', 'ニコリ紙面形式', 'Original Type');
		this.addLabel('disptype_bosanowa_2', '倉庫番形式',     'Sokoban Type');
		this.addLabel('disptype_bosanowa_3', 'ワリタイ形式',   'Waritai type');

		/* 盤面チェックの設定値 */
		this.addLabel('redline', '線のつながりをチェックする', 'Check countinuous lines');
		this.addLabel('redblk', '黒マスのつながりをチェックする', 'Check countinuous shaded cells');
		this.addLabel('redblkrb', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous shaded cells with its corner');
		this.addLabel('redroad', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');

		/* 背景色入力の設定値 */
		this.addLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');

		/* 文字別正解表示の設定値 */
		var flags = ui.puzzle.flags, pid = ui.puzzle.pid;
		if(flags.autocmp==="number"){
			this.addLabel('autocmp', '正しい数字をグレーにする', 'Grey if the number is correct.');
		}
		else if(flags.autocmp==="kouchoku"){
			this.addLabel('autocmp', '線が2本以上になったら点をグレーにする', 'Grey if the letter links over two segments.');
		}

		if(pid==='hitori'){
			this.addLabel('autoerr', '重複している数字を赤くする', 'Show overlapped number as red.');
		}
		else if(pid==='gokigen'){
			this.addLabel('autoerr', 'ループになっている斜線を赤くする', 'Draw loop line as red.');
		}
		else if(pid==='wagiri'){
			this.addLabel('autoerr', '斜線を輪切りかのどちらかで色分けする', 'Encolor slashes whether it consists in a loop or not.');
		}

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
		var el_div = createEL('div');

		var el_span = createEL('span');
		pzpr.util.unselectable(el_span);

		var el_checkbox = createEL('input');
		el_checkbox.type = 'checkbox';
		el_checkbox.check = '';

		var el_selchild = createEL('div');
		el_selchild.className = 'flag';
		pzpr.util.unselectable(el_selchild);

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
				_div.appendChild(createEL('br'));

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
				_div.appendChild(createEL('br'));

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
		if(pzpr.EDITOR){
			getEL('timerpanel').style.display = 'none';
			getEL('separator2').style.display = 'none';
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.createButtonArea()   ボタン用の初期設定を行う
	//---------------------------------------------------------------------------
	createButtonArea : function(){
		this.area = getEL('btnarea');

		// (Canvas下) ボタンの初期設定
		var btncheck = createButton(); btncheck.id = "btncheck"; btncheck.className = 'btn btn-ok';
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

		ui.event.addMouseUpEvent(btnundo, this, this.buttonup);
		ui.event.addMouseUpEvent(btnredo, this, this.buttonup);

		// 初期値ではどっちも押せない
		getEL('btnundo').style.color = 'silver';
		getEL('btnredo').style.color = 'silver';

		if(!ui.puzzle.flags.disable_subclear){
			var el = createButton(); el.id = "btnclear2";
			this.area.appendChild(el);
			this.addButtons(el, "補助消去", "Erase Auxiliary Marks");
		}

		if(ui.puzzle.flags.irowake || ui.puzzle.flags.irowakeblk){
			var el = createButton(); el.id = "btncolor2";
			this.area.appendChild(el);
			this.addButtons(el, "色分けしなおす", "Change the color of Line");
			el.style.display = 'none';
		}

		if(ui.puzzle.pid==='pipelinkr'){
			var el = createButton(); el.id = 'btncircle';
			pzpr.util.unselectable(el);
			this.addButtons(el, "○", "○");
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
	//---------------------------------------------------------------------------
	display : function(){
		for(var idname in this.labels){ this.setdisplay(idname);}
		this.setdisplay("operation");
		
		for(var i=0,len=this.btnstack.length;i<len;i++){
			var obj = this.btnstack[i];
			if(!obj.el){ continue;}
			obj.el.innerHTML = obj.str[ui.puzzle.getConfig('language')];
		}
		
		var mandisp  = (this.isdisp ? 'block' : 'none');
		getEL('usepanel').style.display = mandisp;
		getEL('checkpanel').style.display = mandisp;
		if(!pzpr.EDITOR){
			getEL('separator2').style.display = mandisp;
		}
		if(ui.puzzle.flags.irowake || ui.puzzle.flags.irowakeblk){
			/* ボタンエリアのボタンは、管理領域が消えている時に表示 */
			getEL('btncolor2').style.display = (this.isdisp ? 'none' : 'inline-block');
		}
		getEL('menuboard').style.paddingBottom = (this.isdisp ? '8pt' : '0pt');
	},
	setdisplay : function(idname){
		var pp = ui.menuarea.items;
		if(!pp){ return;}
		
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
				var val = ui.getConfig(pp.item[idname].parent);
				manage.innerHTML = this.getLabel(idname);
				manage.className = ((pp.item[idname].val===val)?"childsel":"child");
			}
			break;

		case pp.CHECK:
			/* チェックボックスの表記の設定 */
			var check = getEL('ck_'+idname);
			if(!!check){ check.checked = ui.getConfig(idname);}
			/* ラベルの表記の設定 */
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = this.getLabel(idname);}
			break;
		}
		
		if(idname==="operation"){
			var opemgr = ui.puzzle.opemgr;
			getEL('btnundo').style.color = (!opemgr.enableUndo ? 'silver' : '');
			getEL('btnredo').style.color = (!opemgr.enableRedo ? 'silver' : '');
		}
		
		if(idname==='keypopup'){
			var kp = ui.keypopup;
			if(kp.paneltype[1]!==0 || kp.paneltype[3]!==0){
				var f = !!kp.paneltype[ui.getConfig('mode')];
				getEL('ck_keypopup').disabled    = (f?"":"true");
				getEL('cl_keypopup').style.color = (f?"black":"silver");
			}
		}
		
		if(idname==='bgcolor'){
			if(ui.puzzle.flags.bgcolor){
				var mode = ui.getConfig('mode');
				getEL('ck_bgcolor').disabled    = (mode===3?"":"true");
				getEL('cl_bgcolor').style.color = (mode===3?"black":"silver");
			}
		}
		
		if(idname==='disptype_pipelinkr'){
			if(ui.puzzle.pid==='pipelinkr' && !!getEL('btncircle')){
				getEL('btncircle').innerHTML = ((ui.puzzle.getConfig(idname)===1)?"○":"■");
			}
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.getLabel()  管理パネルとチェック型サブメニューに表示する文字列を返す
	// toolarea.setLabel()  管理領域に表記するラベル文字列を設定する
	//---------------------------------------------------------------------------
	getLabel : function(idname){
		var obj  = this.labels[idname];
		return ui.selectStr(obj.str_jp, obj.str_en);
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
		ui.event.addMouseDownEvent(el, this, this.buttonclick);
		pzpr.util.unselectable(el);
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// toolarea.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// toolarea.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	// toolarea.buttonclick()  ボタンが押されたときの動作
	// toolarea.buttonup()  ボタンが放されたときの動作
	//---------------------------------------------------------------------------
	checkclick : function(e){
		var el = e.target;
		var idname = el.id.substr(3);
		ui.setConfig(idname, !!el.checked);
	},
	selectclick : function(e){
		var list = e.target.id.split('_');
		list.shift();
		var child = list.pop(), idname = list.join("_");
		ui.setConfig(idname, child);
	},
	buttonclick : function(e){
		switch(e.target.id){
		case 'btncheck':  ui.menuarea.answercheck(); break;
		case 'btnundo':   ui.puzzle.undotimer.startButtonUndo(); break;
		case 'btnredo':   ui.puzzle.undotimer.startButtonRedo(); break;
		case 'btnclear':  ui.menuarea.ACconfirm();   break;
		case 'btnclear2': ui.menuarea.ASconfirm();   break;
		case 'btncolor2': case 'ck_btn_irowake': ui.puzzle.irowake(); break;
		case 'btncolor': ui.puzzle.board.encolorall(); break; /* 天体ショーのボタン */
		case 'btncircle': this.toggledisp(); break; /* 帰ってきたパイプリンクのボタン */
		}
	},
	buttonup : function(e){
		switch(e.target.id){
		case 'btnundo':   ui.puzzle.undotimer.stopButtonUndo(); break;
		case 'btnredo':   ui.puzzle.undotimer.stopButtonRedo(); break;
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.toggledisp()   アイスと○などの表示切り替え時の処理を行う
	//---------------------------------------------------------------------------
	toggledisp : function(){
		var current = ui.puzzle.getConfig('disptype_pipelinkr');
		ui.puzzle.setConfig('disptype_pipelinkr', (current===1?2:1));
	}
};
