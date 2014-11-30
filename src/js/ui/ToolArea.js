// ToolArea.js v3.4.0
/* global ui:false, createEL:false, getEL:false */

// メニュー描画/取得/html表示系
// toolareaオブジェクト
ui.toolarea = {
	isdisp : true,		// 管理パネルを表示しているか

	//---------------------------------------------------------------------------
	// toolarea.reset()  管理領域の初期設定を行う
	//---------------------------------------------------------------------------
	reset : function(){
		this.captions = [];
		this.labels   = {};

		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';

		this.createLabels();
		this.createManageArea();
		this.createButtonArea();
		
		this.display();
	},

	//---------------------------------------------------------------------------
	// toolarea.createLabels()  管理領域に存在するデータを設定する
	//---------------------------------------------------------------------------
	createLabels : function(){
		var puzzle = ui.puzzle, flags = puzzle.flags, pid = puzzle.pid;

		/* mode */
		if(pzpr.EDITOR){
			this.addLabel('mode','モード', 'mode');
			this.addLabel('mode_1', '問題作成モード', 'Edit mode'  );
			this.addLabel('mode_3', '回答モード',     'Answer mode');
		}

		/* 操作方法の設定値 */
		if(puzzle.validConfig("use")){
			this.addLabel('use', '操作方法', 'Input Type');
			this.addLabel('use_1', '左右ボタン','LR Button');
			this.addLabel('use_2', '1ボタン',   'One Button');
		}
		if(puzzle.validConfig("use_tri")){
			this.addLabel('use_tri', '三角形の入力方法', 'Input Triangle Type');
			this.addLabel('use_tri_1', 'クリックした位置', 'Corner-side');
			this.addLabel('use_tri_2', '引っ張り入力', 'Pull-to-Input');
			this.addLabel('use_tri_3', '1ボタン', 'One Button');
		}

		if(puzzle.validConfig("disptype_bosanowa")){
			this.addLabel('disptype_bosanowa', '表示形式', 'Display');
			this.addLabel('disptype_bosanowa_1', 'ニコリ紙面形式', 'Original Type');
			this.addLabel('disptype_bosanowa_2', '倉庫番形式',     'Sokoban Type');
			this.addLabel('disptype_bosanowa_3', 'ワリタイ形式',   'Waritai type');
		}

		/* 盤面表示形式の設定値 */
		if(puzzle.validConfig("dispmove")){
			this.addLabel('dispmove', '動かしたように描画を行う', 'Display as object moving');
		}

		/* 盤面チェックの設定値 */
		if(puzzle.validConfig("redline")){
			this.addLabel('redline', '線のつながりをチェックする', 'Check countinuous lines');
		}
		else if(puzzle.validConfig("redblk")){
			this.addLabel('redblk', '黒マスのつながりをチェックする', 'Check countinuous shaded cells');
		}
		else if(puzzle.validConfig("redblkrb")){
			this.addLabel('redblkrb', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous shaded cells with its corner');
		}
		else if(puzzle.validConfig("redroad")){
			this.addLabel('redroad', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');
		}

		/* 背景色入力の設定値 */
		if(puzzle.validConfig("bgcolor")){
			this.addLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');
		}

		/* 文字別正解表示の設定値 */
		if(puzzle.validConfig("autocmp")){
			if(flags.autocmp==="number"){
				this.addLabel('autocmp', '正しい数字をグレーにする', 'Grey if the number is correct.');
			}
			else if(flags.autocmp==="kouchoku"){
				this.addLabel('autocmp', '線が2本以上になったら点をグレーにする', 'Grey if the letter links over two segments.');
			}
		}

		if(puzzle.validConfig("autoerr")){
			if(pid==='hitori'){
				this.addLabel('autoerr', '重複している数字を赤くする', 'Show overlapped number as red.');
			}
			else if(pid==='gokigen'){
				this.addLabel('autoerr', 'ループになっている斜線を赤くする', 'Draw loop line as red.');
			}
			else if(pid==='wagiri'){
				this.addLabel('autoerr', '斜線を輪切りかのどちらかで色分けする', 'Encolor slashes whether it consists in a loop or not.');
			}
		}

		/* 正当判定方法の設定値 */
		if(puzzle.validConfig("enbnonum")){
			this.addLabel('enbnonum', '全ての数字が入っていない状態での正答判定を許可する', 'Allow answer check with empty cell in the board.');
		}

		/* kouchoku: 線の引き方の設定値 */
		if(puzzle.validConfig("kouchoku")){
			this.addLabel('enline', '点の間のみ線を引けるようにする', 'Able to draw line only between the points.');
			this.addLabel('lattice', '点を通過する線を引けないようにする', 'Disable drawing segment passing over a lattice point.');
		}

		/* 問題形式の設定値 */
		if(pid==='mashu'){
			this.addLabel('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');
		}

		if(puzzle.validConfig("snakebd")){
			this.addLabel('snakebd', 'へびの周りに境界線を表示する', 'Draw border around a snake.');
		}

		/* EDITOR時の設定値 */
		if(puzzle.validConfig("goishi")){
			this.addLabel('bdpadding', 'URL生成時に周り1マス何もない部分をつける', 'Add Padding around the Board in outputting URL.');
		}

		if(puzzle.validConfig("discolor")){
			this.addLabel('discolor', '星クリックによる色分けを無効化する', 'Disable Coloring up by clicking star');
		}

		if(puzzle.validConfig("lrcheck")){
			this.addLabel('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');
		}

		if(ui.keypopup.paneltype[1]!==0 || ui.keypopup.paneltype[3]!==0){
			this.addLabel('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');
		}

		if(puzzle.validConfig("irowake")){
			this.addLabel('irowake', '線の色分けをする', 'Color each lines');
		}
		if(puzzle.validConfig("irowakeblk")){
			this.addLabel('irowakeblk', '黒マスの色分けをする', 'Color each blocks');
		}
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
			var el = createEL('button');
			el.type = "button";
			el.className = "btn";
			
			ui.event.addEvent(el, "mousedown", this, function(){ ui.puzzle.irowake();});
			pzpr.util.unselectable(el);
			var textnode = document.createTextNode("");
			el.appendChild(textnode);
			this.captions.push({textnode:textnode, str_jp:"色分けしなおす", str_en:"Change the color of Line"});
			
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
		var buttonarea = getEL('btnarea');
		buttonarea.style.display = "";
		pzpr.util.unselectable(buttonarea);
		this.walkElement(buttonarea);

		// 初期値ではどっちも押せない
		getEL('btnundo').style.color = 'silver';
		getEL('btnredo').style.color = 'silver';

		getEL('btnclear2').style.display  = (!ui.puzzle.flags.disable_subclear ? "" : "none");
		getEL('btnirowake').style.display = ((ui.puzzle.flags.irowake || ui.puzzle.flags.irowakeblk) ? "" : "none");
		getEL('btncircle').style.display  = (ui.puzzle.pid==='pipelinkr' ? "" : "none");
		getEL('btncolor').style.display   = (ui.puzzle.pid==='tentaisho' ? "" : "none");
	},
	walkElement : function(parent){
		var toolarea = this;
		ui.misc.walker(parent, function(el){
			if(el.nodeType===1){
				var role = (el.dataset!==void 0 ? el.dataset.buttonExec : el['data-button-exec']);
				if(!!role){
					ui.event.addEvent(el, "mousedown", toolarea, toolarea[role]);
				}
				role = (el.dataset!==void 0 ? el.dataset.buttonupExec : el['data-buttonup-exec']);
				if(!!role){
					ui.event.addEvent(el, "mouseup", toolarea, toolarea[role]);
				}
			}
			else if(el.nodeType===3){
				if(el.data.match(/^__(.+)__(.+)__$/)){
					toolarea.captions.push({textnode:el, str_jp:RegExp.$1, str_en:RegExp.$2});
				}
			}
		});
	},

	//---------------------------------------------------------------------------
	// toolarea.display()    全てのラベルに対して文字列を設定する
	// toolarea.setdisplay() 管理パネルに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display : function(){
		for(var idname in this.labels){ this.setdisplay(idname);}
		this.setdisplay("operation");
		
		for(var i=0;i<this.captions.length;i++){
			var obj  = this.captions[i];
			var text = ui.selectStr(obj.str_jp, obj.str_en);
			if   (!!obj.textnode){ obj.textnode.data = text;}
			else if(!!obj.button){ obj.button.value  = text;}
		}
		
		var mandisp  = (this.isdisp ? 'block' : 'none');
		getEL('usepanel').style.display = mandisp;
		getEL('checkpanel').style.display = mandisp;
		if(!pzpr.EDITOR){
			getEL('separator2').style.display = mandisp;
		}
		if(ui.puzzle.flags.irowake || ui.puzzle.flags.irowakeblk){
			/* ボタンエリアのボタンは、管理領域が消えている時に表示 */
			getEL('btnirowake').style.display = (this.isdisp ? 'none' : 'inline');
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
	// toolarea.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// toolarea.selectclick()  選択型サブメニュー項目がクリックされたときの動作
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

	//---------------------------------------------------------------------------
	// Canvas下にあるボタンが押された/放された時の動作
	//---------------------------------------------------------------------------
	answercheck : function(){ ui.menuarea.answercheck();},
	undo     : function(){ ui.puzzle.undotimer.startButtonUndo();},
	undostop : function(){ ui.puzzle.undotimer.stopButtonUndo();},
	redo     : function(){ ui.puzzle.undotimer.startButtonRedo();},
	redostop : function(){ ui.puzzle.undotimer.stopButtonRedo();},
	ansclear : function(){ ui.menuarea.ACconfirm();},
	subclear : function(){ ui.menuarea.ASconfirm();},
	irowake  : function(){ ui.puzzle.irowake();},
	encolorall : function(){ ui.puzzle.board.encolorall();}, /* 天体ショーのボタン */

	//---------------------------------------------------------------------------
	// toolarea.toggledisp()   帰ってきたパイプリンクでアイスと○などの表示切り替え時の処理を行う
	//---------------------------------------------------------------------------
	toggledisp : function(){
		var current = ui.puzzle.getConfig('disptype_pipelinkr');
		ui.puzzle.setConfig('disptype_pipelinkr', (current===1?2:1));
	}
};
