// MenuArea.js v3.4.0
(function(){

/* uiオブジェクト生成待ち */
if(!window.ui){ setTimeout(setTimeout(arguments.callee),15); return;}

// メニュー描画/取得/html表示系
/* extern */
ui.menuarea = {
	dispfloat  : [],			// 現在表示しているフロートメニューウィンドウ(オブジェクト)
	floatpanel : [],			// (2段目含む)フロートメニューオブジェクトのリスト
	area : null,				// ボタン表示領域の要素を保持する
	
	//---------------------------------------------------------------------------
	// menuarea.init()   メニュー、サブメニュー、フロートメニューの初期設定を行う
	// menuarea.reset()  設定を消去する
	//---------------------------------------------------------------------------
	init : function(){
		this.items = new MenuList();
		this.items.reset();
		
		this.createArea();
		this.createAllFloat();
	},

	reset : function(){
		this.dispfloat  = [];
		this.floatpanel = [];

		this.floatmenuclose(0);

		getEL('float_parent').innerHTML = '';
		getEL('menupanel') .innerHTML = '';
	},

	//---------------------------------------------------------------------------
	// menu.display()    全てのメニューに対して文字列を設定する
	// menu.setdisplay() サブメニューに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display : function(){
		for(var i in this.items.item){ this.setdisplay(i);}
	},
	setdisplay : function(idname){
		var pp = this.items;
		if(!pp || !pp.item[idname]){ return;}
		
		switch(pp.type(idname)){
		case pp.MENU:
			var pmenu = getEL('ms_'+idname);
			if(!!pmenu){ pmenu.innerHTML = "["+pp.getMenuStr(idname)+"]";}
			break;

		case pp.SMENU: case pp.LABEL: case pp.SPARENT: case pp.SPARENT2:
			var smenu = getEL('ms_'+idname);
			if(!!smenu){ smenu.innerHTML = pp.getMenuStr(idname);}
			break;

		case pp.SELECT:
			var smenu = getEL('ms_'+idname);
			if(!!smenu){ smenu.innerHTML = "&nbsp;"+pp.getMenuStr(idname);}	// メニュー上の表記の設定
			
			/* 子要素の設定も行う */
			for(var i=0,len=pp.item[idname].children.length;i<len;i++){
				this.setdisplay(""+idname+"_"+pp.item[idname].children[i]);
			}
			break;

		case pp.CHILD:
			var val = ui.menu.getConfigVal(pp.item[idname].parent);
			var issel = (pp.item[idname].val == val);	/* 選択されているかどうか */
			var smenu = getEL('ms_'+idname);
			if(!!smenu){
				smenu.innerHTML = (issel?"+":"&nbsp;")+pp.getMenuStr(idname);
			}
			break;

		case pp.CHECK:
			var flag = ui.menu.getConfigVal(idname);
			var smenu = getEL('ms_'+idname);
			if(!!smenu){ smenu.innerHTML = (flag?"+":"&nbsp;")+pp.getMenuStr(idname);}
			break;
		}

		if(idname==='manarea'){
			var str;
			if(!ui.toolarea.isdisp){ str = ui.menu.selectStr("管理領域を表示","Show management area");}
			else                   { str = ui.menu.selectStr("管理領域を隠す","Hide management area");}
			getEL('ms_manarea').innerHTML = str;
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.enb_undo()     html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	enb_undo : function(){
		var opemgr = ui.puzzle.opemgr;
		getEL('ms_h_oldest').className = (opemgr.enableUndo ? 'smenu' : 'smenunull');
		getEL('ms_h_undo').className   = (opemgr.enableUndo ? 'smenu' : 'smenunull');
		getEL('ms_h_redo').className   = (opemgr.enableRedo ? 'smenu' : 'smenunull');
		getEL('ms_h_latest').className = (opemgr.enableRedo ? 'smenu' : 'smenunull');
	},

	//---------------------------------------------------------------------------
	// menuarea.createArea()          メニューの初期設定を行う
	// menuarea.createArea_setting()  各パズルの設定を追加する
	//---------------------------------------------------------------------------
	createArea : function(){
		var pp = this.items;
		var am = function(){ pp.addMenu.apply(pp,arguments);},
			at = function(){ pp.addSParent.apply(pp,arguments);},
			an = function(){ pp.addSParent2.apply(pp,arguments);},
			as = function(){ pp.addSmenu.apply(pp,arguments);},
			au = function(){ pp.addSelect.apply(pp,arguments);},
			ac = function(){ pp.addCheck.apply(pp,arguments);},
			aa = function(){ pp.addCaption.apply(pp,arguments);},
			ai = function(){ pp.addChild.apply(pp,arguments);},
			ap = function(){ pp.addSeparator.apply(pp,arguments);}
		var pid = ui.puzzle.pid;

		// *ファイル ==========================================================
		am('file', "ファイル", "File");

		as('newboard', 'file', '新規作成','New Board');
		as('urlinput', 'file', 'URL入力', 'Import from URL');
		as('urloutput','file', 'URL出力', 'Export URL');
		ap('sep_file', 'file');
		as('fileopen', 'file', 'ファイルを開く','Open the file');
		at('filesavep', 'file', 'ファイル保存 ->',  'Save the file as ... ->');
		if(pzpr.env.storage.localST){
			as('database',  'file', '一時保存/戻す', 'Temporary Stack');
		}
		if(ui.menu.enableSaveImage){
			ap('sep_image', 'file');
			at('imagesavep', 'file', '画像を保存 ->', 'Save as image file');
		}

		// *ファイル - ファイル保存 -------------------------------------------
		as('filesave',  'filesavep', 'ぱずぷれv3形式',  'Puz-Pre v3 format');
		//as('filesave3',  'filesavep', 'ぱずぷれv3(履歴つき)',  'Puz-Pre v3 with history');
		if(pzpr.url.info[pid].exists.pencilbox){
			as('filesave2', 'filesavep', 'pencilbox形式', 'Pencilbox format');
		}

		// *ファイル - 画像を保存 -------------------------------------------
		if(ui.menu.enableSaveImage){
			as('imagedl',   'imagesavep', '画像をダウンロード', 'Download the image');
			as('imagesave', 'imagesavep', '別ウィンドウで開く', 'Open another window');
		}

		// *編集 ==============================================================
		am('edit', "編集", "Edit");

		an('hist', 'edit', '履歴', 'History');
		an('board','edit', '盤面', 'Board');
		ap('sep_edit1', 'edit');

		as('adjust', 'edit', '盤面の調整', 'Adjust the Board');
		as('turn',   'edit', '反転・回転', 'Filp/Turn the Board');
		if(pzpr.env.storage.session){
			ap('sep_edit2',  'edit');
			as('duplicate', 'edit', '盤面の複製', 'Duplicate the Board');
		}

		// *編集 - 履歴 -----------------------------------------------------
		aa('cap_hist', 'hist', '履歴','Display mode');
		as('h_oldest', 'hist', '最初にジャンプ', 'Jump to oldest');
		as('h_undo',   'hist', '元に戻す/Undo', 'Undo');
		as('h_redo',   'hist', 'やり直し/Redo', 'Redo');
		as('h_latest', 'hist', '最後にジャンプ', 'Jump to latest');

		// *編集 - 盤面 -----------------------------------------------------
		aa('cap_board','board', '盤面','Display mode');
		as('check',    'board', 'チェック', 'Check the Answer');
		as('ansclear', 'board', '回答消去', 'Erase answer');
		if(!ui.puzzle.flags.disable_subclear){
			as('subclear', 'board', '補助記号消去', 'Erase auxiliary marks');
		}

		// *表示 ==============================================================
		am('disp', "表示", "Display");

		pp.addSelect('cellsize','disp', '表示サイズ','Cell Size');
		ap('sep_disp1',  'disp');

		if(ui.puzzle.flags.irowake){
			ac('irowake','disp', '線の色分け','Color coding');
		}
		if(ui.puzzle.flags.irowakeblk){
			ac('irowakeblk','disp', '黒マスの色分け','Color coding');
		}
		ac('cursor','disp','カーソルの表示','Display cursor');
		pp.addCheck('adjsize', 'disp', '自動横幅調節', 'Auto Size Adjust');
		ap('sep_disp2', 'disp');
		as('repaint', 'disp', '盤面の再描画', 'Repaint whole board');
		as('manarea', 'disp', '管理領域を隠す', 'Hide Management Area');

		// *表示 - 表示サイズ -------------------------------------------------
		as('dispsize', 'cellsize','数値指定','Cell Size');
		aa('cap_dispmode','cellsize','表示倍率','Display mode');
		ai('cellsize_0', 'cellsize', 'サイズ 極小', 'Ex Small');
		ai('cellsize_1', 'cellsize', 'サイズ 小',   'Small');
		ai('cellsize_2', 'cellsize', 'サイズ 標準', 'Normal');
		ai('cellsize_3', 'cellsize', 'サイズ 大',   'Large');
		ai('cellsize_4', 'cellsize', 'サイズ 特大', 'Ex Large');

		// *設定 ==============================================================
		this.createArea_setting(pp);		// コンフィグ関連のメニュー追加

		// *その他 ============================================================
		am('other', "その他", "Others");

		as('credit',   'other', 'ぱずぷれv3について', 'About PUZ-PRE v3');
		as('jumpexp',  'other', '操作説明',           'How to Input');
		ap('sep_other','other');
		an('link',     'other', 'リンク', 'Link');
		an('debug',    'other', 'デバッグ', 'Debug');

		// *その他 - リンク ---------------------------------------------------
		as('jumpv3',  'link', 'ぱずぷれv3のページへ', 'Jump to PUZ-PRE v3 page');
		as('jumptop', 'link', '連続発破保管庫TOPへ',  'Jump to indi.s58.xrea.com');
		as('jumpblog','link', 'はっぱ日記(blog)へ',   'Jump to my blog');

		// *その他 - デバッグ -------------------------------------------------
		as('poptest', 'debug', 'pop_testを表示', 'Show pop_test window');
	},
	createArea_setting : function(pp){
		var flags = ui.puzzle.flags, pid = ui.puzzle.pid;

		pp.addMenu('setting', "設定", "Setting");

		if(pzpr.EDITOR){
			pp.addSelect('mode','setting', 'モード', 'mode');
			pp.addChild('mode_1', 'mode', '問題作成モード', 'Edit mode'  );
			pp.addChild('mode_3', 'mode', '回答モード',     'Answer mode');
		}

		/* 操作方法の設定値 */
		if(flags.use){
			pp.addSelect('use','setting','操作方法', 'Input Type');
			pp.addChild('use_1','use','左右ボタン','LR Button');
			pp.addChild('use_2','use','1ボタン',   'One Button');
		}
		if(pid==='shakashaka'){
			pp.addSelect('use_tri','setting','操作方法', 'Input Type');
			pp.addChild('use_tri_1', 'use_tri', 'クリックした位置', 'Corner-side');
			pp.addChild('use_tri_2', 'use_tri', '引っ張り入力', 'Pull-to-Input');
			pp.addChild('use_tri_3', 'use_tri', '1ボタン', 'One Button');
		}

		/* 盤面チェックの設定値 */
		if(flags.redline){
			pp.addCheck('redline','setting','繋がりチェック','Continuous Check');
		}
		else if(flags.redblk){
			pp.addCheck('redblk','setting','繋がりチェック','Continuous Check');
		}
		else if(flags.redblkrb){
			pp.addCheck('redblkrb','setting','繋がりチェック','Continuous Check');
		}
		else if(pid==='roma'){
			pp.addCheck('redroad','setting','通り道のチェック', 'Check Road');
		}

		/* 背景色入力の設定値 */
		if(flags.bgcolor){
			pp.addCheck('bgcolor','setting', '背景色入力', 'Background-color');
		}

		/* 文字別正解表示の設定値 */
		if(pid==='hashikake'||pid==='kurotto'){
			pp.addCheck('circolor','setting','数字をグレーにする','Set Grey Color');
		}
		else if(pid==='kouchoku'){
			pp.addCheck('circolor','setting','点をグレーにする','Set Grey Color');
		}

		if(pid==='hitori'){
			pp.addCheck('plred','setting', '重複した数字を表示', 'Show overlapped number');
		}

		if(pid==='wagiri'){
			pp.addCheck('colorslash','setting', '斜線の色分け', 'Slash with color');
		}

		/* 正当判定方法の設定値 */
		if(pid==='fillomino'){
			pp.addCheck('enbnonum','setting','未入力で正答判定','Allow Empty cell');
		}

		/* 線の引き方の設定値 */
		if(pid==='kouchoku'){
			pp.addCheck('enline','setting','線は点の間','Line between points');
			pp.addCheck('lattice','setting','格子点チェック','Check lattice point');
		}

		/* 問題形式の設定値 */
		if(pid==='mashu'){
			pp.addCheck('uramashu','setting', '裏ましゅ', 'Ura-Mashu');
		}

		/* 盤面表示形式の設定値 */
		if(pid==='pipelinkr'){
			pp.addSelect('disptype_pipelinkr','setting','表示形式','Display');
			pp.addChild('disptype_pipelinkr_1', 'disptype_pipelinkr', '○', 'Circle');
			pp.addChild('disptype_pipelinkr_2', 'disptype_pipelinkr', '■', 'Icebarn');
		}
		if(pid==='bosanowa'){
			pp.addSelect('disptype_bosanowa','setting','表示形式','Display');
			pp.addChild('disptype_bosanowa_1', 'disptype_bosanowa', 'ニコリ紙面形式', 'Original Type');
			pp.addChild('disptype_bosanowa_2', 'disptype_bosanowa', '倉庫番形式',     'Sokoban Type');
			pp.addChild('disptype_bosanowa_3', 'disptype_bosanowa', 'ワリタイ形式',   'Waritai type');
		}

		if(pid==='snakes'){
			pp.addCheck('snakebd','setting','へび境界線有効','Enable snake border');
		}

		/* EDITOR時の設定値 */
		if(pzpr.EDITOR && pid==='goishi'){
			pp.addCheck('bdpadding','setting', '空隙つきURL', 'URL with Padding');
		}
		if(pzpr.EDITOR && pid==='tentaisho'){
			pp.addCheck('discolor','setting','色分け無効化','Disable color');
		}

		/* 共通設定値 */
		pp.addCheck('autocheck','setting', '正答自動判定', 'Auto Answer Check');

		pp.addCheck('lrcheck',  'setting', 'マウス左右反転', 'Mouse button inversion');

		if(ui.keypopup.paneltype[1]!==0 || ui.keypopup.paneltype[3]!==0){
			pp.addCheck('keypopup', 'setting', 'パネル入力', 'Panel inputting');
		}

		pp.addSelect('language', 'setting', '言語', 'Language');
		pp.addChild('language_ja', 'language', '日本語',  '日本語');
		pp.addChild('language_en', 'language', 'English', 'English');
	},

	//---------------------------------------------------------------------------
	// menuarea.createAllFloat() 登録されたサブメニューから全てのフロートメニューを作成する
	//---------------------------------------------------------------------------
	createAllFloat : function(){
		var pp = this.items;

		// ElementTemplate : メニュー領域
		var el_menu = createEL('li');
		el_menu.className = 'menu';

		// ElementTemplate : フロートメニュー
		var el_float = createEL('menu');
		el_float.className = 'floatmenu';

		// ElementTemplate : フロートメニュー(中身)
		var el_smenu = createEL('li');
		el_smenu.className = 'smenu';
		var el_sparent  = el_smenu.cloneNode(false);

		var el_sparent2 = el_smenu.cloneNode(false);
		el_sparent2.style.fontWeight = '900';
		el_sparent2.style.fontSize = '0.9em';
		var el_select = el_sparent2.cloneNode(false);

		var el_check  = el_smenu.cloneNode(false);
		el_check.style.paddingLeft = '6pt';
		el_check.style.fontSize = '0.9em';
		var el_child = el_check.cloneNode(false);

		var el_separate = createEL('li');
		el_separate.className = 'smenusep';
		el_separate.innerHTML = '&nbsp;';

		var el_label = createEL('li');
		el_label.className = 'smenulabel';

		for(var id in pp.item){
			var temp=null, smenuid = 'ms_'+id, sfunc=false, cfunc=false;
			switch(pp.type(id)){
				case pp.MENU:     temp = el_menu;     break;
				case pp.SEPARATE: temp = el_separate; break;
				case pp.LABEL:    temp = el_label;    break;
				case pp.SELECT:   temp = el_select;   sfunc = true; break;
				case pp.SPARENT:  temp = el_sparent;  sfunc = true; break;
				case pp.SPARENT2: temp = el_sparent2; sfunc = true; break;
				case pp.SMENU:    temp = el_smenu;    sfunc = cfunc = true; break;
				case pp.CHECK:    temp = el_check;    sfunc = cfunc = true; break;
				case pp.CHILD:    temp = el_child;    sfunc = cfunc = true; break;
				default: continue; break;
			}

			var smenu = temp.cloneNode(temp===el_separate?true:false);
			smenu.id = smenuid;
			if(pp.type(id)===pp.MENU){
				getEL('menupanel').appendChild(smenu);
				ui.event.addEvent(smenu, "mouseover", this, this.menuhover);
				ui.event.addEvent(smenu, "mouseout",  this, this.menuout);
				continue;
			}
			else if(sfunc){
				ui.event.addEvent(smenu, "mouseover", this, this.submenuhover);
				ui.event.addEvent(smenu, "mouseout",  this, this.submenuout);
				if(cfunc){ ui.event.addEvent(smenu, "click", this, this.submenuclick);}
			}

			var parentid = pp.item[id].parent;
			if(!this.floatpanel[parentid]){
				var panel = el_float.cloneNode(false);
				panel.id = 'float_'+parentid;
				getEL('float_parent').appendChild(panel);
				ui.event.addEvent(panel, "mouseout", this, this.floatmenuout);
				this.floatpanel[parentid] = panel;
			}
			this.floatpanel[parentid].appendChild(smenu);
		}

		// 'setting'だけはセパレータを後から挿入する
		var el = getEL('float_setting'), fw = el.firstChild.style.fontWeight
		for(var i=1,len=el.childNodes.length;i<len;i++){
			var node = el.childNodes[i];
			if(fw!=node.style.fontWeight){
				var smenu = el_separate.cloneNode(true);
				node.parentNode.insertBefore(smenu, node);
				i++; len++; // 追加したので1たしておく
			}
			fw=node.style.fontWeight;
		}

		// その他の調整
		if(pzpr.PLAYER){
			getEL('ms_newboard') .className = 'smenunull';
			getEL('ms_urloutput').className = 'smenunull';
			getEL('ms_adjust')   .className = 'smenunull';
		}
		getEL('ms_jumpv3')  .style.fontSize = '0.9em'; getEL('ms_jumpv3')  .style.paddingLeft = '8pt';
		getEL('ms_jumptop') .style.fontSize = '0.9em'; getEL('ms_jumptop') .style.paddingLeft = '8pt';
		getEL('ms_jumpblog').style.fontSize = '0.9em'; getEL('ms_jumpblog').style.paddingLeft = '8pt';

		if(this.enableSaveImage && !!ui.puzzle.ImageTile){
			if(pzpr.env.browser.Gecko && !location.hostname){
				getEL('ms_imagesavep').className = 'smenunull';
			}
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.submenuclick(e) 通常/選択型/チェック型サブメニューがクリックされたときの動作を実行する
	//---------------------------------------------------------------------------
	submenuclick : function(e){
		var el = (e.target||e.srcElement);
		if(!!el && el.className==="smenu"){
			this.floatmenuclose(0);

			var idname = el.id.substr(3), val, pp = this.items, menutype = pp.type(idname);
			if(menutype===pp.SMENU){
				if(!this.submenuexec(idname)){
					var pos = pzpr.util.getPagePos(e);
					ui.popupmgr.open(idname, pos.px-8, pos.py-8);
				}
			}
			else if(menutype===pp.CHILD || menutype===pp.CHECK){
				if(menutype===pp.CHILD){
					val    = pp.item[idname].val;
					idname = pp.item[idname].parent;
				}
				else if(menutype===pp.CHECK){
					val = !ui.menu.getConfigVal(idname);
				}
				ui.menu.setConfigVal(idname, val);
			}
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.submenuexec()     メニューがクリックされた時の動作を呼び出す
	//---------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	submenuexec : function(idname, val){
		if(!ui.puzzle.ready){ return true;}
		
		var result = true, k = pzpr.consts;
		switch(idname){
		case 'filesave'  : ui.menu.filesave(k.FILE_PZPR); break;
//		case 'filesave3' : ui.menu.filesave(k.FILE_PZPH); break;
		case 'filesave2' : if(!!ui.puzzle.fio.kanpenSave){ ui.menu.filesave(k.FILE_PBOX);} break;
		case 'imagedl'   : ui.menu.imagesave(true,null); break;
		case 'imagesave' : ui.menu.imagesave(false,null); break;
		
		case 'h_oldest'  : ui.puzzle.undoall(); break;
		case 'h_undo'    : ui.puzzle.undo();    break;
		case 'h_redo'    : ui.puzzle.redo();    break;
		case 'h_latest'  : ui.puzzle.redoall(); break;
		case 'check'     : ui.menu.answercheck(); break;
		case 'ansclear'  : ui.menu.ACconfirm(); break;
		case 'subclear'  : ui.menu.ASconfirm(); break;
		case 'duplicate' : ui.menu.duplicate(); break;
		
		case 'manarea'   : ui.toolarea.isdisp = !ui.toolarea.isdisp; ui.menu.displayAll(); ui.puzzle.adjustCanvasSize(); break;
		case 'repaint'   : ui.puzzle.redraw(); break;
		
		case 'jumpexp'   : window.open('./faq.html?'+ui.puzzle.pid+(pzpr.EDITOR?"_edit":""), ''); break;
		case 'jumpv3'    : window.open('./', '', ''); break;
		case 'jumptop'   : window.open('../../', '', ''); break;
		case 'jumpblog'  : window.open('http://d.hatena.ne.jp/sunanekoroom/', '', ''); break;
		
		default:
			result = false;
			break;
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// menuarea.menuhover(e) メニューにマウスが乗ったときの表示設定を行う
	// menuarea.menuout(e)   メニューからマウスが外れた時の表示設定を行う
	//---------------------------------------------------------------------------
	menuhover : function(e){
		this.floatmenuopen(e, 0);
	},
	menuout   : function(e){
		if(!this.insideOfMenu(e)){
			this.floatmenuclose(0);
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.submenuhover(e) サブメニューにマウスが乗ったときの表示設定を行う
	// menuarea.submenuout(e)   サブメニューからマウスが外れたときの表示設定を行う
	//---------------------------------------------------------------------------
	submenuhover : function(e){
		if(this.items.haschild((e.target||e.srcElement).id.substr(3))){
			if((e.target||e.srcElement).className==='smenu'){
				this.floatmenuopen(e, this.dispfloat.length);
			}
		}
	},
	submenuout   : function(e){
		if(this.items.haschild((e.target||e.srcElement).id.substr(3))){
			this.floatmenuout(e);
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.floatmenuopen()  マウスがメニュー項目上に来た時にフロートメニューを表示する
	// menuarea.floatmenuclose() フロートメニューをcloseする
	// menuarea.floatmenuout(e)  マウスがフロートメニューを離れた時にフロートメニューをcloseする
	// menuarea.insideOf()       イベントeがエレメントの範囲内で起こったか？
	// menuarea.insideOfMenu()   マウスがメニュー領域の中にいるか判定する
	//---------------------------------------------------------------------------
	floatmenuopen : function(e, depth){
		this.floatmenuclose(depth);

		if(depth>0 && !this.dispfloat[depth-1]){ return;}

		var rect = pzpr.util.getRect(e.target||e.srcElement);
		var idname = (e.target||e.srcElement).id.substr(3);
		var _float = this.floatpanel[idname];
		if(depth==0){
			_float.style.left = rect.left   + 1 + 'px';
			_float.style.top  = rect.bottom + 1 + 'px';
		}
		else{
			if(!pzpr.env.browser.IE6){
				_float.style.left = rect.right - 3 + 'px';
				_float.style.top  = rect.top   - 3 + 'px';
			}
			else{
				_float.style.left = pzpr.util.pageX(e)  + 'px';
				_float.style.top  = rect.top - 3 + 'px';
			}
		}
		_float.style.zIndex   = 101+depth;
		_float.style.display  = 'block';

		this.dispfloat.push(_float);
	},
	// マウスが離れたときにフロートメニューをクローズする
	// フロート->メニュー側に外れた時は、関数終了直後にfloatmenuopen()が呼ばれる
	floatmenuclose : function(depth){
		for(var i=this.dispfloat.length-1;i>=depth;i--){
			if(i!==0){
				var parentsmenuid = "ms_" + this.dispfloat[i].id.substr(6);
				getEL(parentsmenuid).className = 'smenu';
			}
			this.dispfloat[i].style.display = 'none';
			this.dispfloat.pop();
		}
	},

	floatmenuout : function(e){
		for(var i=this.dispfloat.length-1;i>=0;i--){
			if(this.insideOf(this.dispfloat[i],e)){
				this.floatmenuclose(i+1);
				return;
			}
		}
		// ここに来るのはすべて消える場合
		this.floatmenuclose(0);
	},

	insideOf : function(el, e){
		var pos = pzpr.util.getPagePos(e);
		var rect = pzpr.util.getRect(el);
		return (pos.px>=rect.left && pos.px<=rect.right && pos.py>=rect.top && pos.py<=rect.bottom);
	},
	insideOfMenu : function(e){
		var pos = pzpr.util.getPagePos(e);
		var rect_f = pzpr.util.getRect(getEL('ms_file')), rect_o = pzpr.util.getRect(getEL('ms_other'));
		return (pos.px>= rect_f.bottom || (pos.px>=rect_f.left && pos.py<=rect_o.right && pos.py>=rect_f.top));
	}
};

// MenuListクラス
var MenuList = function(){};
MenuList.prototype =
{
	item : {},	// サブメニュー項目の情報

	// 定数
	MENU     : 6,
	SPARENT  : 7,
	SPARENT2 : 8,
	SMENU    : 0,
	SELECT   : 1,
	CHECK    : 2,
	LABEL    : 3,
	CHILD    : 4,
	SEPARATE : 5,

	//---------------------------------------------------------------------------
	// pp.reset()      再読み込みを行うときに初期化を行う
	//---------------------------------------------------------------------------
	reset : function(){
		this.item = {};
	},

	//---------------------------------------------------------------------------
	// pp.addMenu()      メニュー最上位の情報を登録する
	// pp.addSParent()   フロートメニューを開くサブメニュー項目を登録する
	// pp.addSParent2()  フロートメニューを開くサブメニュー項目を登録する
	// pp.addSmenu()     Popupメニューを開くサブメニュー項目を登録する
	// pp.addCaption()   Captionとして使用するサブメニュー項目を登録する
	// pp.addSeparator() セパレータとして使用するサブメニュー項目を登録する
	// pp.addCheck()     選択型サブメニュー項目に表示する文字列を設定する
	// pp.addSelect()    チェック型サブメニュー項目に表示する文字列を設定する
	// pp.addChild()     チェック型サブメニュー項目の子要素を設定する
	//---------------------------------------------------------------------------
	addMenu : function(idname, strJP, strEN){
		this.addFlags(idname, '', this.MENU, null, strJP, strEN);
	},
	addSParent : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SPARENT, null, strJP, strEN);
	},
	addSParent2 : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SPARENT2, null, strJP, strEN);
	},

	addSmenu : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SMENU, null, strJP, strEN);
	},

	addCaption : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.LABEL, null, strJP, strEN);
	},
	addSeparator : function(idname, parent){
		this.addFlags(idname, parent, this.SEPARATE, null, '', '');
	},

	addCheck : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.CHECK, null, strJP, strEN);
	},
	addSelect : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SELECT, null, strJP, strEN);
		if(!!ui.menu.menuconfig[idname]){
			this.item[idname].children = ui.menu.menuconfig[idname].option;
		}
		else if(!!ui.puzzle.config.list[idname]){
			this.item[idname].children = ui.puzzle.config.list[idname].option;
		}
	},
	addChild : function(idname, parent, strJP, strEN){
		var list = idname.split("_"), val = list.pop();
		this.addFlags(idname, parent, this.CHILD, val, strJP, strEN);
	},

	//---------------------------------------------------------------------------
	// pp.addFlags()  上記関数の内部共通処理
	//---------------------------------------------------------------------------
	addFlags : function(idname, parent, type, first, strJP, strEN){
		this.item[idname] = {
			id     : idname,
			type   : type,
			val    : first,
			parent : parent,
			str : {
				ja : { menu:strJP, label:''},
				en : { menu:strEN, label:''}
			}
		};
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 選択型/チェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	// pp.haschild()   サブメニューがあるかどうか調べる
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.item[idname].str[ui.puzzle.get('language')].menu; },
	type       : function(idname){ return (this.item[idname]?this.item[idname].type:null);},
	haschild   : function(idname){
		var flag = this.item[idname];
		if(!flag){ return false;}
		var type = flag.type;
		return (type===this.SELECT || type===this.SPARENT || type===this.SPARENT2);
	}
};

var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createEL(tagName){ return _doc.createElement(tagName);}

})();
