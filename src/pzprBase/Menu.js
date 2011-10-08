// Menu.js v3.4.0

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
pzprv3.createCommonClass('Menu',
{
	initialize : function(){
		this.dispfloat  = [];			// 現在表示しているフロートメニューウィンドウ(オブジェクト)
		this.floatpanel = [];			// (2段目含む)フロートメニューオブジェクトのリスト
		this.pop        = "";			// 現在表示しているポップアップウィンドウ(オブジェクト)

		this.movingpop  = "";			// 移動中のポップアップメニュー
		this.offset = new pzprv3.core.Point(0, 0);	// ポップアップウィンドウの左上からの位置

		this.btnstack   = [];			// ボタンの情報(idnameと文字列のリスト)
		this.labelstack = [];			// span等の文字列の情報(idnameと文字列のリスト)

		var pid = this.owner.pid, pinfo = pzprv3.PZLINFO.info[pid];
		this.ispencilbox = (pinfo.exists.kanpen && (pid!=="nanro" && pid!=="ayeheya" && pid!=="kurochute"));

		this.displaymanage = true;

		this.reader;	// FileReaderオブジェクト

		// ElementTemplate : メニュー領域
		var menu_funcs = {mouseover : ee.ebinder(this, this.menuhover), mouseout  : ee.ebinder(this, this.menuout)};
		this.EL_MENU  = ee.addTemplate('menupanel','li', {className:'menu'}, null, menu_funcs);

		// ElementTemplate : フロートメニュー
		var float_funcs = {mouseout:ee.ebinder(this, this.floatmenuout)};
		this.EL_FLOAT = ee.addTemplate('float_parent','menu', {className:'floatmenu'}, {backgroundColor:pzprv3.PZLINFO.toFBGcolor(pid)}, float_funcs);

		// ElementTemplate : フロートメニュー(中身)
		this.EL_SMENU    = ee.addTemplate('','li', {className:'smenu'}, null, null);
		this.EL_SPARENT  = this.EL_SMENU;
		this.EL_SPARENT2 = ee.addTemplate('','li', {className:'smenu'}, {fontWeight :'900', fontSize:'0.9em'}, null);
		this.EL_SELECT   = this.EL_SPARENT2;
		this.EL_CHECK    = ee.addTemplate('','li', {className:'smenu'}, {paddingLeft:'6pt', fontSize:'0.9em'}, null);
		this.EL_CHILD    = this.EL_CHECK;
		this.EL_SEPARATE = ee.addTemplate('','li', {className:'smenusep', innerHTML:'&nbsp;'}, null, null);
		this.EL_LABEL    = ee.addTemplate('','li', {className:'smenulabel'}, null, null);

		// ElementTemplate : 管理領域
		this.EL_DIVPACK  = ee.addTemplate('','div',  null, null, null);
		this.EL_SPAN     = ee.addTemplate('','span', {unselectable:'on'}, null, null);
		this.EL_CHECKBOX = ee.addTemplate('','input',{type:'checkbox', check:''}, null, {click:ee.ebinder(this, this.checkclick)});
		this.EL_SELCHILD = ee.addTemplate('','div',  {className:'flag',unselectable:'on'}, null, {click:ee.ebinder(this, this.selectclick)});

		// ElementTemplate : ボタン
		this.EL_BUTTON = ee.addTemplate('','input', {type:'button'}, null, null);
		this.EL_UBUTTON = ee.addTemplate('btnarea','input', {type:'button'}, null, null);
	},

	language : 'ja',

	disable_subclear : false, // "補助消去"ボタンを作らない
	enableSaveImage  : false, // 画像保存が有効か

	fileio : (document.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi"),
	enableReadText : false,

	//---------------------------------------------------------------------------
	// menu.menuinit()   メニュー、サブメニュー、フロートメニュー、ボタン、
	//                   管理領域、ポップアップメニューの初期設定を行う
	// menu.menureset()  メニュー用の設定を消去する
	//---------------------------------------------------------------------------
	menuinit : function(){
		if(typeof FileReader == 'undefined'){
			this.reader = null;

			if(typeof FileList != 'undefined' &&
			   typeof File.prototype.getAsText != 'undefined')
			{
				this.enableGetText = true;
			}
		}
		else{
			this.reader = new FileReader();
			this.reader.onload = ee.ebinder(this, function(e){
				this.fileonload(e.target.result.replace(/\//g, "[[slash]]"));
			});
		}

		if(!!ee("divques_sub").el.getContext){
			this.enableSaveImage = true;
		}

		if(ee.br.IE6){
			this.modifyCSS('menu.floatmenu li.smenusep', {lineHeight :'2pt', display:'inline'});
		}

		this.menuarea();
		this.managearea();
		this.poparea();

		this.displayAll();

		this.displayDesign();	// デザイン変更関連関数の呼び出し
		this.checkUserLang();	// 言語のチェック
	},

	menureset : function(){
		this.dispfloat  = [];
		this.floatpanel = [];
		this.pop        = "";
		this.btnstack   = [];
		this.labelstack = [];
		this.managestack = [];

		this.popclose();
		this.floatmenuclose(0);

		ee('float_parent').el.innerHTML = '';

		ee('btnarea').el.innerHTML = '';

		ee('urlbuttonarea').el.innerHTML = '';

		ee('menupanel') .el.innerHTML = '';
		ee('usepanel')  .el.innerHTML = '';
		ee('checkpanel').el.innerHTML = '';

		pp.reset();
	},

	//---------------------------------------------------------------------------
	// menu.addButtons() ボタンの情報を変数に登録する
	// menu.addLabels()  ラベルの情報を変数に登録する
	//---------------------------------------------------------------------------
	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		ee(el).unselectable();
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},
	addLabels  : function(el, strJP, strEN){
		this.labelstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// menu.displayAll() 全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// menu.setdisplay() 管理パネルとサブメニューに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	displayAll : function(){
		for(var i in pp.flags){ this.setdisplay(i);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			if(!this.btnstack[i].el){ continue;}
			this.btnstack[i].el.value = this.btnstack[i].str[this.language];
		}
		for(var i=0,len=this.labelstack.length;i<len;i++){
			if(!this.labelstack[i].el){ continue;}
			this.labelstack[i].el.innerHTML = this.labelstack[i].str[this.language];
		}
		this.owner.undo.enb_btn();
	},
	setdisplay : function(idname){
		switch(pp.type(idname)){
		case pp.MENU:
			var pmenu = ee('ms_'+idname);
			if(!!pmenu){ pmenu.el.innerHTML = "["+pp.getMenuStr(idname)+"]";}
			break;

		case pp.SMENU: case pp.LABEL: case pp.SPARENT: case pp.SPARENT2:
			var smenu = ee('ms_'+idname);
			if(!!smenu){ smenu.el.innerHTML = pp.getMenuStr(idname);}
			break;

		case pp.SELECT:
			var smenu = ee('ms_'+idname), label = ee('cl_'+idname);
			if(!!smenu){ smenu.el.innerHTML = "&nbsp;"+pp.getMenuStr(idname);}	// メニュー上の表記の設定
			if(!!label){ label.el.innerHTML = pp.getLabel(idname);}			// 管理領域上の表記の設定
			for(var i=0,len=pp.flags[idname].child.length;i<len;i++){ this.setdisplay(""+idname+"_"+pp.flags[idname].child[i]);}
			break;

		case pp.CHILD:
			var smenu = ee('ms_'+idname), manage = ee('up_'+idname);
			var issel = (pp.getVal(idname) == pp.getVal(pp.flags[idname].parent));
			var cap = pp.getMenuStr(idname);
			if(!!smenu){ smenu.el.innerHTML = (issel?"+":"&nbsp;")+cap;}	// メニューの項目
			if(!!manage){													// 管理領域の項目
				manage.el.innerHTML = cap;
				manage.el.className = (issel?"childsel":"child");
			}
			break;

		case pp.CHECK:
			var smenu = ee('ms_'+idname), check = ee('ck_'+idname), label = ee('cl_'+idname);
			var flag = pp.getVal(idname);
			if(!!smenu){ smenu.el.innerHTML = (flag?"+":"&nbsp;")+pp.getMenuStr(idname);}	// メニュー
			if(!!check){ check.el.checked   = flag;}					// 管理領域(チェックボックス)
			if(!!label){ label.el.innerHTML = pp.getLabel(idname);}		// 管理領域(ラベル)
			break;
		}
	},

	//---------------------------------------------------------------------------
	// menu.displayDesign()  背景画像とかtitle・背景画像・html表示の設定
	// menu.displayTitle()   タイトルに文字列を設定する
	// menu.getPuzzleName()  現在開いているパズルの名前を返す
	//---------------------------------------------------------------------------
	displayDesign : function(){
		this.displayTitle();
		document.body.style.backgroundImage = "url(./bg/"+this.owner.pid+".gif)";
		if(ee.br.IE6){
			ee('title2').el.style.marginTop = "24px";
			ee('separator2').el.style.margin = '0pt';
		}
	},
	displayTitle : function(){
		var title;
		if(pzprv3.EDITOR){ title = ""+this.getPuzzleName()+this.selectStr(" エディタ - ぱずぷれv3"," editor - PUZ-PRE v3");}
		else			 { title = ""+this.getPuzzleName()+this.selectStr(" player - ぱずぷれv3"  ," player - PUZ-PRE v3");}

		document.title = title;
		ee('title2').el.innerHTML = title;
	},
	getPuzzleName : function(){
		var pinfo = pzprv3.PZLINFO.info[this.owner.pid];
		return this.selectStr(pinfo.ja, pinfo.en);
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.menuarea()   メニューの初期設定を行う
	// menu.menufix()    各パズルの設定を追加する
	//---------------------------------------------------------------------------
	menuarea : function(){
		var am = ee.binder(pp, pp.addMenu),
			at = ee.binder(pp, pp.addSParent),
			an = ee.binder(pp, pp.addSParent2),
			as = ee.binder(pp, pp.addSmenu),
			au = ee.binder(pp, pp.addSelect),
			ac = ee.binder(pp, pp.addCheck),
			aa = ee.binder(pp, pp.addCaption),
			ai = ee.binder(pp, pp.addChild),
			ap = ee.binder(pp, pp.addSeparator),
			af = ee.binder(pp, pp.addFlagOnly),
			sl = ee.binder(pp, pp.setLabel);

		// *ファイル ==========================================================
		am('file', "ファイル", "File");

		as('newboard', 'file', '新規作成','New Board');
		as('urlinput', 'file', 'URL入力', 'Import from URL');
		as('urloutput','file', 'URL出力', 'Export URL');
		ap('sep_file', 'file');
		as('fileopen', 'file', 'ファイルを開く','Open the file');
		at('filesavep', 'file', 'ファイル保存 ->',  'Save the file as ... ->');
		if(ee.storage.localST){
			as('database',  'file', '一時保存/戻す', 'Temporary Stack');
		}
		if(this.enableSaveImage){
			ap('sep_image', 'file');
			at('imagesavep', 'file', '画像を保存 ->', 'Save as image file');
		}

		// *ファイル - ファイル保存 -------------------------------------------
		as('filesave',  'filesavep', 'ぱずぷれv3形式',  'Puz-Pre v3 format');
		//as('filesave3',  'filesavep', 'ぱずぷれv3(履歴つき)',  'Puz-Pre v3 with history');
		if(this.ispencilbox){
			as('filesave2', 'filesavep', 'pencilbox形式', 'Pencilbox format');
		}

		// *ファイル - 画像を保存 -------------------------------------------
		if(this.enableSaveImage){
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
		if(ee.storage.session){
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
		if(!this.disable_subclear){
			as('subclear', 'board', '補助記号消去', 'Erase auxiliary marks');
		}

		// *表示 ==============================================================
		am('disp', "表示", "Display");

		as('dispsize', 'disp','サイズ指定','Cell Size');
		ap('sep_disp0',  'disp');

		au('size','disp',2,[0,1,2,3,4], '表示サイズ','Cell Size');
		au('text','disp',(!ee.mobile?0:2),[0,1,2,3], 'テキストのサイズ','Text Size');
		ap('sep_disp1',  'disp');

		if(!!pc.irowake){
			ac('irowake','disp',(pc.irowake==2?true:false),'線の色分け','Color coding');
			sl('irowake', '線の色分けをする', 'Color each lines');
		}
		ac('cursor','disp',true,'カーソルの表示','Display cursor');
		ac('adjsize', 'disp', true, '自動横幅調節', 'Auto Size Adjust');
		ap('sep_disp2', 'disp');
		as('repaint', 'disp', '盤面の再描画', 'Repaint whole board');
		as('manarea', 'disp', '管理領域を隠す', 'Hide Management Area');

		// *表示 - 表示サイズ -------------------------------------------------
		aa('cap_dispmode','size','表示モード','Display mode');
		ai('size_0', 'size', 'サイズ 極小', 'Ex Small');
		ai('size_1', 'size', 'サイズ 小',   'Small');
		ai('size_2', 'size', 'サイズ 標準', 'Normal');
		ai('size_3', 'size', 'サイズ 大',   'Large');
		ai('size_4', 'size', 'サイズ 特大', 'Ex Large');

		// *表示 - テキストのサイズ -------------------------------------------
		aa('cap_textmode','text','テキストのサイズ','Text Size');
		ai('text_0', 'text', '通常',         'Normal');
		ai('text_1', 'text', '大きい',       'Big');
		ai('text_2', 'text', 'かなり大きい', 'Ex Big');
		ai('text_3', 'text', 'とても大きい', 'Ex Big 2');
		this.textsize(pp.getVal('text'));

		// *設定 ==============================================================
		am('setting', "設定", "Setting");

		if(pzprv3.EDITOR){
			au('mode','setting',(this.owner.editmode?1:3),[1,3],'モード', 'mode');
			sl('mode','モード', 'mode');
		}
		else{
			af('mode', 3);
		}

		this.menufix();		// 各パズルごとのメニュー追加

		ac('autocheck','setting', this.owner.playmode, '正答自動判定', 'Auto Answer Check');
		ac('lrcheck',  'setting', false, 'マウス左右反転', 'Mouse button inversion');
		sl('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');
		if(this.owner.key.haspanel[1] || this.owner.key.haspanel[3]){
			ac('keypopup', 'setting', false, 'パネル入力', 'Panel inputting');
			sl('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');
		}
		au('language', 'setting', 'ja', ['ja','en'], '言語', 'Language');

		// *設定 - モード -----------------------------------------------------
		ai('mode_1', 'mode', '問題作成モード', 'Edit mode'  );
		ai('mode_3', 'mode', '回答モード',     'Answer mode');

		// *設定 - 言語 -------------------------------------------------------
		ai('language_ja', 'language', '日本語',  '日本語');
		ai('language_en', 'language', 'English', 'English');

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

		this.createAllFloat();
	},
	menufix : function(){},

	//---------------------------------------------------------------------------
	// menu.addUseToFlags()       「操作方法」サブメニュー登録用共通関数
	// menu.addRedLineToFlags()   「線のつながりをチェック」サブメニュー登録用共通関数
	// menu.addRedBlockToFlags()  「黒マスのつながりをチェック」サブメニュー登録用共通関数
	// menu.addRedBlockRBToFlags()「ナナメ黒マスのつながりをチェック」サブメニュー登録用共通関数
	//---------------------------------------------------------------------------
	addUseToFlags : function(){
		pp.addSelect('use','setting',(!ee.mobile?1:2),[1,2], '操作方法', 'Input Type');
		pp.setLabel ('use', '操作方法', 'Input Type');

		pp.addChild('use_1','use','左右ボタン','LR Button');
		pp.addChild('use_2','use','1ボタン',   'One Button');
	},
	addRedLineToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', '線のつながりをチェックする', 'Check countinuous lines');
	},
	addRedBlockToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', '黒マスのつながりをチェックする', 'Check countinuous black cells');
	},
	addRedBlockRBToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous black cells with its corner');
	},

	//---------------------------------------------------------------------------
	// menu.createAllFloat() 登録されたサブメニューから全てのフロートメニューを作成する
	//---------------------------------------------------------------------------
	createAllFloat : function(){
		for(var i=0;i<pp.flaglist.length;i++){
			var id = pp.flaglist[i];
			if(!pp.flags[id]){ continue;}

			var eltype=null, smenuid = 'ms_'+id, sfunc=false, cfunc=false;
			switch(pp.type(id)){
				case pp.MENU:     ee.createEL(this.EL_MENU, smenuid); continue; break;
				case pp.SEPARATE: eltype = this.EL_SEPARATE; break;
				case pp.LABEL:    eltype = this.EL_LABEL;    break;
				case pp.SELECT:   eltype = this.EL_SELECT;   sfunc = true; break;
				case pp.SPARENT:  eltype = this.EL_SPARENT;  sfunc = true; break;
				case pp.SPARENT2: eltype = this.EL_SPARENT2; sfunc = true; break;
				case pp.SMENU:    eltype = this.EL_SMENU;    sfunc = cfunc = true; break;
				case pp.CHECK:    eltype = this.EL_CHECK;    sfunc = cfunc = true; break;
				case pp.CHILD:    eltype = this.EL_CHILD;    sfunc = cfunc = true; break;
				default: continue; break;
			}

			var smenu = ee.createEL(eltype, smenuid);
			if(sfunc){
				ee.addEvent(smenu, "mouseover", ee.ebinder(this, this.submenuhover));
				ee.addEvent(smenu, "mouseout",  ee.ebinder(this, this.submenuout));
				if(cfunc){ ee.addEvent(smenu, "click", ee.ebinder(this, this.submenuclick));}
			}

			var parentid = pp.flags[id].parent;
			if(!this.floatpanel[parentid]){
				this.floatpanel[parentid] = ee.createEL(this.EL_FLOAT, 'float_'+parentid);
			}
			this.floatpanel[parentid].appendChild(smenu);
		}

		// 'setting'だけはセパレータを後から挿入する
		var el = ee('float_setting').el, fw = el.firstChild.style.fontWeight
		for(var i=1,len=el.childNodes.length;i<len;i++){
			var node = el.childNodes[i];
			if(fw!=node.style.fontWeight){
				var smenu = ee.createEL(this.EL_SEPARATE,'');
				ee(smenu).insertBefore(node);
				i++; len++; // 追加したので1たしておく
			}
			fw=node.style.fontWeight;
		}

		// その他の調整
		if(pzprv3.PLAYER){
			ee('ms_newboard') .el.className = 'smenunull';
			ee('ms_urloutput').el.className = 'smenunull';
			ee('ms_adjust')   .el.className = 'smenunull';
		}
		ee('ms_jumpv3')  .el.style.fontSize = '0.9em'; ee('ms_jumpv3')  .el.style.paddingLeft = '8pt';
		ee('ms_jumptop') .el.style.fontSize = '0.9em'; ee('ms_jumptop') .el.style.paddingLeft = '8pt';
		ee('ms_jumpblog').el.style.fontSize = '0.9em'; ee('ms_jumpblog').el.style.paddingLeft = '8pt';
	},

	//---------------------------------------------------------------------------
	// menu.menuhover(e) メニューにマウスが乗ったときの表示設定を行う
	// menu.menuout(e)   メニューからマウスが外れた時の表示設定を行う
	//---------------------------------------------------------------------------
	menuhover : function(e){
		if(!!this.movingpop){ return true;}

		this.floatmenuopen(e, 0);
	},
	menuout   : function(e){
		if(!this.insideOfMenu(e)){
			this.floatmenuclose(0);
		}
	},

	//---------------------------------------------------------------------------
	// menu.submenuhover(e) サブメニューにマウスが乗ったときの表示設定を行う
	// menu.submenuout(e)   サブメニューからマウスが外れたときの表示設定を行う
	//---------------------------------------------------------------------------
	submenuhover : function(e){
		if(pp.haschild(ee.getSrcElement(e).id.substr(3))){
			if(ee.getSrcElement(e).className==='smenu'){
				this.floatmenuopen(e, this.dispfloat.length);
			}
		}
	},
	submenuout   : function(e){
		if(pp.haschild(ee.getSrcElement(e).id.substr(3))){
			this.floatmenuout(e);
		}
	},

	//---------------------------------------------------------------------------
	// menu.submenuclick(e) 通常/選択型/チェック型サブメニューがクリックされたときの動作を実行する
	//---------------------------------------------------------------------------
	submenuclick : function(e){
		var el = ee.getSrcElement(e);
		if(!!el && el.className==="smenu"){
			this.floatmenuclose(0);

			var idname = el.id.substr(3);
			switch(pp.type(idname)){
				case pp.SMENU: this.popopen(e, idname); break;
				case pp.CHILD: pp.setVal(pp.flags[idname].parent, pp.getVal(idname)); break;
				case pp.CHECK: pp.setVal(idname, !pp.getVal(idname)); break;
			}
		}
	},

	//---------------------------------------------------------------------------
	// menu.floatmenuopen()  マウスがメニュー項目上に来た時にフロートメニューを表示する
	// menu.floatmenuclose() フロートメニューをcloseする
	// menu.floatmenuout(e)  マウスがフロートメニューを離れた時にフロートメニューをcloseする
	// menu.insideOf()       イベントeがエレメントの範囲内で起こったか？
	// menu.insideOfMenu()   マウスがメニュー領域の中にいるか判定する
	//---------------------------------------------------------------------------
	floatmenuopen : function(e, depth){
		this.floatmenuclose(depth);

		if(depth>0 && !this.dispfloat[depth-1]){ return;}

		var rect = ee(ee.getSrcElement(e).id).getRect();
		var idname = ee.getSrcElement(e).id.substr(3);
		var _float = this.floatpanel[idname];
		if(depth==0){
			_float.style.left = rect.left   + 1 + 'px';
			_float.style.top  = rect.bottom + 1 + 'px';
		}
		else{
			if(!ee.br.IE6){
				_float.style.left = rect.right - 3 + 'px';
				_float.style.top  = rect.top   - 3 + 'px';
			}
			else{
				_float.style.left = ee.pageX(e)  + 'px';
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
				ee(parentsmenuid).el.className = 'smenu';
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
		var ex = ee.pageX(e);
		var ey = ee.pageY(e);
		var rect = ee(el.id).getRect();
		return (ex>=rect.left && ex<=rect.right && ey>=rect.top && ey<=rect.bottom);
	},
	insideOfMenu : function(e){
		var ex = ee.pageX(e);
		var ey = ee.pageY(e);
		var rect_f = ee('ms_file').getRect(), rect_o = ee('ms_other').getRect();
		return (ey>= rect_f.bottom || (ex>=rect_f.left && ex<=rect_o.right && ey>=rect_f.top));
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.managearea()   管理領域の初期化を行う(内容はサブメニューのものを参照)
	// menu.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// menu.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	//---------------------------------------------------------------------------
	managearea : function(){
		// usearea & checkarea
		for(var n=0;n<pp.flaglist.length;n++){
			var idname = pp.flaglist[n];
			if(!pp.flags[idname] || !pp.getLabel(idname)){ continue;}
			var _div = ee(ee.createEL(this.EL_DIVPACK,'div_'+idname));
			//_div.el.innerHTML = "";

			switch(pp.type(idname)){
			case pp.SELECT:
				_div.appendEL(ee.createEL(this.EL_SPAN, 'cl_'+idname));
				_div.appendHTML("&nbsp;|&nbsp;");
				for(var i=0;i<pp.flags[idname].child.length;i++){
					var num = pp.flags[idname].child[i];
					_div.appendEL(ee.createEL(this.EL_SELCHILD, ['up',idname,num].join("_")));
					_div.appendHTML('&nbsp;');
				}
				_div.appendBR();

				ee('usepanel').appendEL(_div.el);
				break;

			case pp.CHECK:
				_div.appendEL(ee.createEL(this.EL_CHECKBOX, 'ck_'+idname));
				_div.appendHTML("&nbsp;");
				_div.appendEL(ee.createEL(this.EL_SPAN, 'cl_'+idname));
				_div.appendBR();

				ee('checkpanel').appendEL(_div.el);
				break;
			}
		}

		// 色分けチェックボックス用の処理
		if(pc.irowake){
			// 横にくっつけたいボタンを追加
			var el = ee.createEL(this.EL_BUTTON, 'ck_btn_irowake');
			this.addButtons(el, ee.binder(this, this.irowakeRemake), "色分けしなおす", "Change the color of Line");
			ee('ck_btn_irowake').insertAfter(ee('cl_irowake').el);

			// 色分けのやつを一番下に持ってくる
			var el = ee('checkpanel').el.removeChild(ee('div_irowake').el);
			ee('checkpanel').el.appendChild(el);
		}

		// 管理領域の表示/非表示設定
		if(pzprv3.EDITOR){
			ee('timerpanel').el.style.display = 'none';
			ee('separator2').el.style.display = 'none';
		}
		if(!!ee('ck_keypopup')){ this.funcs.keypopup.call(this);}

		// (Canvas下) ボタンの初期設定
		ee.createEL(this.EL_UBUTTON, 'btncheck');
		ee('btnarea').appendHTML('&nbsp;');
		ee.createEL(this.EL_UBUTTON, 'btnundo');
		ee.createEL(this.EL_UBUTTON, 'btnredo');
		ee('btnarea').appendHTML('&nbsp;');
		ee.createEL(this.EL_UBUTTON, 'btnclear');

		this.addButtons(ee("btncheck").el,  ee.binder(ans, ans.check),             "チェック", "Check");
		this.addButtons(ee("btnundo").el,   ee.binder(this.owner.undo, this.owner.undo.undo, [1]), "戻", "<-");
		this.addButtons(ee("btnredo").el,   ee.binder(this.owner.undo, this.owner.undo.redo, [1]), "進", "->");
		this.addButtons(ee("btnclear").el,  ee.binder(this, this.ACconfirm), "回答消去", "Erase Answer");

		// 初期値ではどっちも押せない
		ee('btnundo').el.disabled = true;
		ee('btnredo').el.disabled = true;

		if(!this.disable_subclear){
			ee.createEL(this.EL_UBUTTON, 'btnclear2');
			this.addButtons(ee("btnclear2").el, ee.binder(this, this.ASconfirm), "補助消去", "Erase Auxiliary Marks");
		}

		if(pc.irowake!=0){
			var el = ee.createEL(this.EL_UBUTTON, 'btncolor2');
			this.addButtons(el, ee.binder(this, this.irowakeRemake), "色分けしなおす", "Change the color of Line");
			el.style.display = 'none';
		}
	},

	checkclick : function(e){
		var el = ee.getSrcElement(e);
		var idname = el.id.substr(3);
		pp.setVal(idname, !!el.checked);
	},
	selectclick : function(e){
		var list = ee.getSrcElement(e).id.split('_');
		pp.setVal(list[1], list[2]);
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.poparea()       ポップアップメニューの初期設定を行う
	//---------------------------------------------------------------------------
	poparea : function(){
		var _doc = document;

		//=====================================================================
		//// 各タイトルバーの動作設定
		var pop = ee('popup_parent').el.firstChild;
		while(!!pop){
			var _el = pop.firstChild;
			while(!!_el){
				if(_el.className==='titlebar'){
					this.titlebarfunc(_el);
					break;
				}
				_el = _el.nextSibling;
			}
			pop = pop.nextSibling;
		}
		this.titlebarfunc(ee('credit3_1').el);

		if(!ee.mobile){
			ee.addEvent(_doc, "mousemove", ee.ebinder(this, this.titlebarmove));
			ee.addEvent(_doc, "mouseup",   ee.ebinder(this, this.titlebarup));
		}
		else{
			ee.addEvent(_doc, "touchmove", ee.ebinder(this, this.titlebarmove));
			ee.addEvent(_doc, "touchend",  ee.ebinder(this, this.titlebarup));
		}

		//=====================================================================
		//// formボタンの動作設定・その他のCaption設定
		var btn = ee.binder(this, this.addButtons);
		var lab = ee.binder(this, this.addLabels);
		var close = ee.ebinder(this, this.popclose);
		var func = null;

		// 盤面の新規作成 -----------------------------------------------------
		func = ee.ebinder(this, this.newboard);
		lab(ee('bar1_1').el,      "盤面の新規作成",         "Createing New Board");
		lab(ee('pop1_1_cap0').el, "盤面を新規作成します。", "Create New Board.");
		if(this.owner.pid!=='sudoku' && this.owner.pid!=='tawa'){
			lab(ee('pop1_1_cap1').el, "よこ",                   "Cols");
			lab(ee('pop1_1_cap2').el, "たて",                   "Rows");
		}
		btn(_doc.newboard.newboard, func,  "新規作成",   "Create");
		btn(_doc.newboard.cancel,   close, "キャンセル", "Cancel");

		// URL入力 ------------------------------------------------------------
		func = ee.ebinder(this, this.urlinput);
		lab(ee('bar1_2').el,      "URL入力",                     "Import from URL");
		lab(ee('pop1_2_cap0').el, "URLから問題を読み込みます。", "Import a question from URL.");
		btn(_doc.urlinput.urlinput, func,  "読み込む",   "Import");
		btn(_doc.urlinput.cancel,   close, "キャンセル", "Cancel");

		// URL出力 ------------------------------------------------------------
		func = ee.ebinder(this, this.urloutput);
		lab(ee('bar1_3').el, "URL出力", "Export URL");
		var self=this, btt = function(name, strJP, strEN, eval){
			if(eval===false){ return;}
			var el = ee.createEL(self.EL_BUTTON,''); el.name = name;
			ee('urlbuttonarea').appendEL(el).appendBR();
			btn(el, func, strJP, strEN);
		};
		var pinfo = pzprv3.PZLINFO.info[this.owner.pid];
		btt('pzprv3',     "ぱずぷれv3のURLを出力する",           "Output PUZ-PRE v3 URL",          true);
		btt('pzprapplet', "ぱずぷれ(アプレット)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", pinfo.exists.pzprapp);
		btt('kanpen',     "カンペンのURLを出力する",             "Output Kanpen URL",              pinfo.exists.kanpen);
		btt('heyaapp',    "へやわけアプレットのURLを出力する",   "Output Heyawake-Applet URL",     (this.owner.pid==="heyawake"));
		btt('pzprv3edit', "ぱずぷれv3の再編集用URLを出力する",   "Output PUZ-PRE v3 Re-Edit URL",  true);
		ee("urlbuttonarea").appendBR();
		func = ee.ebinder(this, this.openurl);
		btn(_doc.urloutput.openurl, func,  "このURLを開く", "Open this URL on another window/tab");
		btn(_doc.urloutput.close,   close, "閉じる", "Close");

		// ファイル入力 -------------------------------------------------------
		func = ee.ebinder(this, this.fileopen);
		lab(ee('bar1_4').el,      "ファイルを開く", "Open file");
		lab(ee('pop1_4_cap0').el, "ファイル選択",   "Choose file");
		_doc.fileform.filebox.onchange = func;
		btn(_doc.fileform.close,    close, "閉じる",     "Close");

		// データベースを開く -------------------------------------------------
		func = ee.ebinder(pzprv3.dbm, pzprv3.dbm.clickHandler);
		lab(ee('bar1_8').el, "一時保存/戻す", "Temporary Stack");
		_doc.database.sorts   .onchange = func;
		_doc.database.datalist.onchange = func;
		_doc.database.tableup .onclick  = func;
		_doc.database.tabledn .onclick  = func;
		btn(_doc.database.open,     func,  "データを読み込む",   "Load");
		btn(_doc.database.save,     func,  "盤面を保存",         "Save");
		lab(ee('pop1_8_com').el, "コメント:", "Comment:");
		btn(_doc.database.comedit,  func,  "コメントを編集する", "Edit Comment");
		btn(_doc.database.difedit,  func,  "難易度を設定する",   "Set difficulty");
		btn(_doc.database.del,      func,  "削除",               "Delete");
		btn(_doc.database.close,    close, "閉じる",             "Close");

		// 盤面の調整 ---------------------------------------------------------
		func = ee.ebinder(this, this.popupadjust);
		lab(ee('bar2_1').el,      "盤面の調整",             "Board Dimension Resizer");
		lab(ee('pop2_1_cap0').el, "盤面の調整を行います。", "Adjust the board.");
		lab(ee('pop2_1_cap1').el, "拡大",  "Expand");
		btn(_doc.adjust.expandup,   func,  "上",     "Top");
		btn(_doc.adjust.expanddn,   func,  "下",     "Bottom");
		btn(_doc.adjust.expandlt,   func,  "左",     "Left");
		btn(_doc.adjust.expandrt,   func,  "右",     "Right");
		lab(ee('pop2_1_cap2').el, "縮小", "Reduce");
		btn(_doc.adjust.reduceup,   func,  "上",     "Top");
		btn(_doc.adjust.reducedn,   func,  "下",     "Bottom");
		btn(_doc.adjust.reducelt,   func,  "左",     "Left");
		btn(_doc.adjust.reducert,   func,  "右",     "Right");
		btn(_doc.adjust.close,      close, "閉じる", "Close");

		// 反転・回転 ---------------------------------------------------------
		lab(ee('bar2_2').el,      "反転・回転",                  "Flip/Turn the board");
		lab(ee('pop2_2_cap0').el, "盤面の回転・反転を行います。","Flip/Turn the board.");
		btn(_doc.flip.turnl,  func,  "左90°回転", "Turn left by 90 degree");
		btn(_doc.flip.turnr,  func,  "右90°回転", "Turn right by 90 degree");
		btn(_doc.flip.flipy,  func,  "上下反転",   "Flip upside down");
		btn(_doc.flip.flipx,  func,  "左右反転",   "Flip leftside right");
		btn(_doc.flip.close,  close, "閉じる",     "Close");

		// credit -------------------------------------------------------------
		lab(ee('bar3_1').el,   "credit", "credit");
		lab(ee('credit3_1').el,"ぱずぷれv3 "+pzprv3.version+"<br>\n<br>\nぱずぷれv3は はっぱ/連続発破が作成しています。<br>\n",
							   "PUZ-PRE v3 "+pzprv3.version+"<br>\n<br>\nPUZ-PRE v3 id made by happa.<br>\n");
		btn(_doc.credit.close,  close, "閉じる", "OK");

		// 表示サイズ ---------------------------------------------------------
		func = ee.ebinder(this, this.dispsize);
		lab(ee('bar4_1').el,      "表示サイズの変更",         "Change size");
		lab(ee('pop4_1_cap0').el, "表示サイズを変更します。", "Change the display size.");
		lab(ee('pop4_1_cap1').el, "表示サイズ",               "Display size");
		btn(_doc.dispsize.dispsize, func,  "変更する",   "Change");
		btn(_doc.dispsize.cancel,   close, "キャンセル", "Cancel");

		// poptest ------------------------------------------------------------
		this.owner.debug.poptest_func();

		if(ee("pop1_8").el.style.display=='inline'){ this.pop = ee("pop1_8");}
	},

	//---------------------------------------------------------------------------
	// menu.popopen()  ポップアップメニューを開く
	// menu.popclose() ポップアップメニューを閉じる
	//---------------------------------------------------------------------------
	popopen : function(e, idname){
		// 表示しているウィンドウがある場合は閉じる
		this.popclose();

		// この中でmenu.popも設定されます。
		if(this.funcs[idname]){ this.funcs[idname].call(this);}

		// ポップアップメニューを表示する
		if(this.pop){
			var _pop = this.pop.el;
			if(!ee.mobile){
				_pop.style.left = ee.pageX(e) - 8 + 'px';
				_pop.style.top  = ee.pageY(e) - 8 + 'px';
			}
			else{
				_pop.style.left = e.pageX - 8 + 'px';
				_pop.style.top  = e.pageY - 8 + 'px';
			}
			_pop.style.display = 'inline';
		}
	},
	popclose : function(){
		if(this.pop){
			if(this.pop.el.id=='pop1_8'){
				pzprv3.dbm.closeDialog();
			}

			this.pop.el.style.display = "none";
			this.pop = '';
			this.movingpop = "";
			this.owner.key.enableKey = true;
		}
	},

	//---------------------------------------------------------------------------
	// menu.titlebarfunc()  下の4つのイベントをイベントハンドラにくっつける
	// menu.titlebardown()  タイトルバーをクリックしたときの動作を行う(タイトルバーにbind)
	// menu.titlebarup()    タイトルバーでボタンを離したときの動作を行う(documentにbind)
	// menu.titlebarmove()  タイトルバーからマウスを動かしたときポップアップメニューを動かす(documentにbind)
	//---------------------------------------------------------------------------
	titlebarfunc : function(bar){
		if(!ee.mobile){
			ee.addEvent(bar, "mousedown", ee.ebinder(this, this.titlebardown));
		}
		else{
			ee.addEvent(bar, "touchstart", ee.ebinder(this, this.titlebardown));
		}
		ee(bar).unselectable().el;
	},

	titlebardown : function(e){
		var pop = ee.getSrcElement(e).parentNode;
		this.movingpop = pop;
		this.offset.px = ee.pageX(e) - parseInt(pop.style.left);
		this.offset.py = ee.pageY(e) - parseInt(pop.style.top);
	},
	titlebarup : function(e){
		var pop = this.movingpop;
		if(!!pop){
			this.movingpop = "";
		}
	},
	titlebarmove : function(e){
		var pop = this.movingpop;
		if(!!pop){
			pop.style.left = ee.pageX(e) - this.offset.px + 'px';
			pop.style.top  = ee.pageY(e) - this.offset.py + 'px';
			ee.preventDefault(e);
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.textsize()  テキストのサイズを設定する
	// menu.modifyCSS() スタイルシートの中身を変更する
	//--------------------------------------------------------------------------------
	textsize : function(num){
		this.modifyCSS({'.outofboard':{
			fontSize:['1.0em','1.5em','2.0em','3.0em'][num],
			lineHeight:['1.2','1.1','1.1','1.1'][num]
		} });
	},
	modifyCSS : function(input){
		var sheet = document.styleSheets[0];
		var rules = (!!sheet.cssRules ? sheet.cssRules : sheet.rules);
		if(!rules){ return;} /* Chrome6の挙動がおかしいのでエラー回避用 */
		for(var i=0,len=rules.length;i<len;i++){
			var rule = rules[i];
			if(!rule.selectorText){ continue;}
			var pps = input[rule.selectorText.toLowerCase()]
			if(!!pps){
				var pps = input[rule.selectorText.toLowerCase()];
				for(var p in pps){ rule.style[p]=pps[p];}
			}
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.checkUserLang() 言語環境をチェックして日本語でない場合英語表示にする
	// menu.setLang()    言語を設定する
	// menu.selectStr()  現在の言語に応じた文字列を返す
	// menu.alertStr()   現在の言語に応じたダイアログを表示する
	// menu.confirmStr() 現在の言語に応じた選択ダイアログを表示し、結果を返す
	//--------------------------------------------------------------------------------
	checkUserLang : function(){
		var userlang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
		if(userlang.substr(0,2)!=='ja'){ pp.setVal('language','en');}
	},
	setLang : function(ln){
		this.language = ln;
		this.displayTitle();

		this.displayAll();
		this.dispmanstr();

		pc.forceRedraw();
	},
	selectStr  : function(strJP, strEN){ return (this.language==='ja' ? strJP : strEN);},
	alertStr   : function(strJP, strEN){ alert(this.language==='ja' ? strJP : strEN);},
	confirmStr : function(strJP, strEN){ return confirm(this.language==='ja' ? strJP : strEN);},

//--------------------------------------------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	funcs : {
		urlinput  : function(){ this.pop = ee("pop1_2");},
		urloutput : function(){ this.pop = ee("pop1_3"); document.urloutput.ta.value = "";},
		fileopen  : function(){ this.pop = ee("pop1_4");},
		filesave  : function(){ this.filesave(this.owner.fio.PZPR);},
//		filesave3 : function(){ this.filesave(this.owner.fio.PZPH);},
		filesave2 : function(){ if(!!this.owner.fio.kanpenSave){ this.filesave(this.owner.fio.PBOX);}},
		imagedl   : function(){ this.imagesave(true,null);},
		imagesave : function(){ this.imagesave(false,null);},
		database  : function(){ this.pop = ee("pop1_8"); pzprv3.dbm.openDialog();},

		h_oldest  : function(){ this.owner.undo.undoall();},
		h_undo    : function(){ this.owner.undo.undo(1);},
		h_redo    : function(){ this.owner.undo.redo(1);},
		h_latest  : function(){ this.owner.undo.redoall();},
		check     : function(){ ans.check();},
		ansclear  : function(){ this.ACconfirm();},
		subclear  : function(){ this.ASconfirm();},
		adjust    : function(){ this.pop = ee("pop2_1");},
		turn      : function(){ this.pop = ee("pop2_2");},
		duplicate : function(){ this.duplicate();},

		credit    : function(){ this.pop = ee("pop3_1");},
		jumpexp   : function(){ window.open('./faq.html?'+this.owner.pid+(pzprv3.EDITOR?"_edit":""), '');},
		jumpv3    : function(){ window.open('./', '', '');},
		jumptop   : function(){ window.open('../../', '', '');},
		jumpblog  : function(){ window.open('http://d.hatena.ne.jp/sunanekoroom/', '', '');},
		irowake   : function(){ pc.paintAll();},
		cursor    : function(){ pc.paintAll();},
		manarea   : function(){ this.dispman();},
		poptest   : function(){ this.owner.debug.disppoptest();},

		mode      : function(num){ this.modechange(num);},
		text      : function(num){ this.textsize(num); pc.forceRedraw();},
		size      : function(num){ pc.forceRedraw();},
		repaint   : function(num){ pc.forceRedraw();},
		adjsize   : function(num){ pc.forceRedraw();},
		language  : function(str){ this.setLang(str);},

		newboard : function(){
			this.pop = ee("pop1_1");
			if(this.owner.pid!="sudoku"){
				document.newboard.col.value = bd.qcols;
				document.newboard.row.value = bd.qrows;
			}
			this.owner.key.enableKey = false;
		},
		dispsize : function(){
			this.pop = ee("pop4_1");
			document.dispsize.cs.value = pc.cellsize;
			this.owner.key.enableKey = false;
		},
		keypopup : function(){
			var f = this.owner.key.haspanel[pp.flags['mode'].val];
			ee('ck_keypopup').el.disabled    = (f?"":"true");
			ee('cl_keypopup').el.style.color = (f?"black":"silver");

			this.owner.key.display();
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//------------------------------------------------------------------------------
	// menu.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		this.owner.editmode = (num==1);
		this.owner.playmode = (num==3);

		this.owner.key.keyreset();
		bd.errclear();
		this.owner.cursor.adjust_modechange();
		if(this.owner.key.haspanel[1] || this.owner.key.haspanel[3]){ this.funcs.keypopup.call(this);}

		bd.haserror=true;
		pc.paintAll();
	},

	//------------------------------------------------------------------------------
	// menu.newboard()       新規盤面を作成する
	// menu.newboard_open()  新規盤面を作成する
	//------------------------------------------------------------------------------
	newboard : function(e){
		if(this.pop){
			var col = (parseInt(document.newboard.col.value))|0;
			var row = (parseInt(document.newboard.row.value))|0;
			if(!!col && !!row){ this.newboard_open(col+'/'+row);}
		}
	},
	newboard_open : function(qdata){
		this.popclose();

		this.owner.importBoardData({id:this.owner.pid, qdata:qdata});
	},

	//------------------------------------------------------------------------------
	// menu.urlinput()   URLを入力する
	// menu.urloutput()  URLを出力する
	// menu.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(this.pop){
			this.popclose();

			var pzl = pzprv3.parseURLType(document.urlinput.ta.value);
			if(!!pzl.id){ this.owner.importBoardData(pzl);}
		}
	},
	urloutput : function(e){
		if(this.pop){
			var _doc = document;
			switch(ee.getSrcElement(e).name){
				case "pzprv3":     _doc.urloutput.ta.value = this.owner.enc.pzloutput(pzprv3.PZPRV3);  break;
				case "pzprapplet": _doc.urloutput.ta.value = this.owner.enc.pzloutput(pzprv3.PZPRAPP); break;
				case "kanpen":     _doc.urloutput.ta.value = this.owner.enc.pzloutput(pzprv3.KANPEN);  break;
				case "pzprv3edit": _doc.urloutput.ta.value = this.owner.enc.pzloutput(pzprv3.PZPRV3E); break;
				case "heyaapp":    _doc.urloutput.ta.value = this.owner.enc.pzloutput(pzprv3.HEYAAPP); break;
			}
		}
	},
	openurl : function(e){
		if(this.pop){
			if(document.urloutput.ta.value!==''){
				var win = window.open(document.urloutput.ta.value, '', '');
			}
		}
	},

	//------------------------------------------------------------------------------
	// menu.fileopen()   ファイルを開く
	// menu.fileonload() File API用ファイルを開いたイベントの処理
	// menu.filesave()   ファイルを保存する
	//------------------------------------------------------------------------------
	fileopen : function(e){
		if(this.pop){ this.popclose();}
		var _doc = document, fileEL = _doc.fileform.filebox;

		if(!!this.reader || this.enableGetText){
			var fitem = fileEL.files[0];
			if(!fitem){ return;}

			if(!!this.reader){ this.reader.readAsText(fitem);}
			else             { this.fileonload(fitem.getAsText(''));}
		}
		else{
			if(!fileEL.value){ return;}
			_doc.fileform.action = this.fileio
			_doc.fileform.submit();
		}

		_doc.fileform.reset();
	},
	fileonload : function(data){
		var farray = data.split(/[\t\r\n\/]+/), fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"/");
		}

		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.owner.pid);
		this.owner.importBoardData({id:pid, fstr:fstr});

		document.fileform.reset();
		this.owner.timer.reset();
	},

	filesave : function(ftype){
		var fname = prompt("保存するファイル名を入力して下さい。", this.owner.pid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		var _doc = document;
		_doc.fileform2.filename.value = fname;

		if     (navigator.platform.indexOf("Win")!==-1){ _doc.fileform2.platform.value = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ _doc.fileform2.platform.value = "Mac";}
		else                                           { _doc.fileform2.platform.value = "Others";}

		_doc.fileform2.ques.value   = this.owner.fio.fileencode(ftype);
		_doc.fileform2.urlstr.value = this.owner.fio.history;
		_doc.fileform2.operation.value = 'save';

		_doc.fileform2.action = this.fileio
		_doc.fileform2.submit();
	},

	//------------------------------------------------------------------------------
	// menu.duplicate() 盤面の複製を行う => 受取はCoreClass.jsのimportFileData()
	//------------------------------------------------------------------------------
	duplicate : function(){
		var str = this.owner.fio.fileencode(this.owner.fio.PZPH);
		var url = './p.html?'+this.owner.pid+(pzprv3.PLAYER?"_play":"");
		if(!ee.br.Opera){
			var old = sessionStorage['filedata'];
			sessionStorage['filedata'] = (str+this.owner.fio.history);
			window.open(url,'');
			if(!!old){ sessionStorage['filedata'] = old;}
			else     { delete sessionStorage['filedata'];}
		}
		else{
			localStorage['pzprv3_filedata'] = (str+this.owner.fio.history);
			window.open(url,'');
		}
	},

	//------------------------------------------------------------------------------
	// menu.imagesave()   画像を保存する
	// menu.submitimage() "画像をダウンロード"の処理ルーチン
	// menu.openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	imagesave : function(isDL,cellsize){
		var canvas_sv = this.owner.canvas;
		try{
			this.owner.canvas = ee('divques_sub').el;
			var pc2 = this.owner.newInstance('Graphic');

			// 設定値・変数をcanvas用のものに変更
			pc2.suspendAll();
			pc2.outputImage = true;
			pc2.fillTextEmulate = false;
			pc2.bdmargin = pc.bdmargin_image;
			pc2.setcellsize = function(){
				if(!cellsize){ cellsize = pc.cw;}
				pc2.cw = cellsize;
				pc2.ch = cellsize*(pc.ch/pc.cw);
			};

			// canvas要素の設定を適用して、再描画
			pc2.resize_canvas();
			pc2.unsuspend();

			// canvasの描画内容をDataURLとして取得する
			var url = pc2.currentContext.canvas.toDataURL();

			if(isDL){ this.submitimage(url);}
			else    { this.openimage(url);}
		}
		catch(e){
			this.alertStr('画像の出力に失敗しました..','Fail to Output the Image..');
		}
		this.owner.canvas = canvas_sv;
	},

	submitimage : function(url){
		var _doc = document;
		_doc.fileform2.filename.value  = this.owner.pid+'.png';
		_doc.fileform2.urlstr.value    = url.replace('data:image/png;base64,', '');
		_doc.fileform2.operation.value = 'imagesave';

		_doc.fileform2.action = this.fileio
		_doc.fileform2.submit();
	},
	openimage : function(url){
		if(!ee.br.IE9){
			window.open(url, '', '');
		}
		else{
			// IE9だとアドレスバーの長さが2KBだったり、
			// そもそもDataURL入れても何も起こらなかったりする対策
			var cdoc = window.open('', '', '').document;
			cdoc.open();
			cdoc.writeln("<!DOCTYPE html>\n<HTML LANG=\"ja\">\n<HEAD>");
			cdoc.writeln("<META CHARSET=\"utf-8\">");
			cdoc.writeln("<TITLE>ぱずぷれv3<\/TITLE>\n<\/HEAD>");
			cdoc.writeln("<BODY><img src=\"", url, "\"><\/BODY>\n<\/HTML>");
			cdoc.close();
		}
	},

	//------------------------------------------------------------------------------
	// menu.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(this.pop){
			var csize = parseInt(document.dispsize.cs.value);
			if(csize>0){ pc.cellsize = (csize|0);}

			this.popclose();
			pc.forceRedraw();	// Canvasを更新する
		}
	},

	//---------------------------------------------------------------------------
	// menu.irowakeRemake() 「色分けしなおす」ボタンを押した時に色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		bd.lines.newIrowake();
		if(pp.getVal('irowake')){ pc.paintAll();}
	},

	//------------------------------------------------------------------------------
	// menu.dispman()    管理領域を隠す/表示するが押された時に動作する
	// menu.dispmanstr() 管理領域を隠す/表示するにどの文字列を表示するか
	//------------------------------------------------------------------------------
	dispman : function(e){
		var idlist = ['usepanel','checkpanel'];
		var seplist = pzprv3.EDITOR ? [] : ['separator2'];

		if(this.displaymanage){
			for(var i=0;i<idlist.length;i++)         { ee(idlist[i])  .el.style.display = 'none';}
			for(var i=0;i<seplist.length;i++)        { ee(seplist[i]) .el.style.display = 'none';}
			if(pc.irowake!=0 && pp.getVal('irowake')){ ee('btncolor2').el.style.display = 'inline';}
			ee('menuboard').el.style.paddingBottom = '0pt';
		}
		else{
			for(var i=0;i<idlist.length;i++)         { ee(idlist[i])  .el.style.display = 'block';}
			for(var i=0;i<seplist.length;i++)        { ee(seplist[i]) .el.style.display = 'block';}
			if(pc.irowake!=0 && pp.getVal('irowake')){ ee("btncolor2").el.style.display = 'none';}
			ee('menuboard').el.style.paddingBottom = '8pt';
		}
		this.displaymanage = !this.displaymanage;
		this.dispmanstr();

		pc.forceRedraw();	// canvasの左上座標等を更新して再描画
	},
	dispmanstr : function(){
		if(!this.displaymanage){ ee('ms_manarea').el.innerHTML = this.selectStr("管理領域を表示","Show management area");}
		else                   { ee('ms_manarea').el.innerHTML = this.selectStr("管理領域を隠す","Hide management area");}
	},

	//------------------------------------------------------------------------------
	// menu.popupadjust()  "盤面の調整""回転・反転"でボタンが押された時に実行条件をチェック
	//------------------------------------------------------------------------------
	popupadjust : function(e){
		if(this.pop){
			bd.execadjust(ee.getSrcElement(e).name);
		}
	},

	//------------------------------------------------------------------------------
	// menu.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(this.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			this.owner.undo.newOperation(true);

			bd.ansclear();
			bd.resetInfo();
			pc.paintAll();
		}
	},
	ASconfirm : function(){
		if(this.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
			this.owner.undo.newOperation(true);

			bd.subclear();
			pc.paintAll();
		}
	}
});

//---------------------------------------------------------------------------
// ★Debugクラス  poptest関連の関数など
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Debug',
{
	poptest_func : function(){
		var _doc = document;

		menu.titlebarfunc(ee('bartest').el);

		_doc.testform.t1.onclick        = ee.binder(this, this.perfeval);
		_doc.testform.t2.onclick        = ee.binder(this, this.painteval);
		_doc.testform.t3.onclick        = ee.binder(this, this.resizeeval);
		_doc.testform.perfload.onclick  = ee.binder(this, this.loadperf);
		_doc.testform.adjimage.onclick  = ee.binder(this, this.adjustimage);

		_doc.testform.filesave.onclick  = ee.binder(this, this.filesave);
		_doc.testform.pbfilesave.onclick  = ee.binder(this, this.filesave_pencilbox);

		_doc.testform.fileopen.onclick  = ee.binder(this, this.fileopen);
		_doc.testform.database.onclick  = ee.binder(this, this.dispdatabase);

		_doc.testform.erasetext.onclick = ee.binder(this, this.erasetext);
		_doc.testform.close.onclick     = function(e){ ee('poptest').el.style.display = 'none';};

		_doc.testform.testarea.style.fontSize = '10pt';

		_doc.testform.starttest.style.display = 'none';

		_doc.testform.perfload.style.display = (this.owner.pid!=='country' ? 'none' : 'inline');
		_doc.testform.pbfilesave.style.display = (!menu.ispencilbox ? 'none' : 'inline');
		_doc.testform.database.style.display = (ee.storage.localST ? 'none' : 'inline');

		if(pzprv3.DEBUG){ this.testonly_func();}	// テスト用
	},

	disppoptest : function(){
		var _pop_style = ee('poptest').el.style;
		_pop_style.display = 'inline';
		_pop_style.left = '40px';
		_pop_style.top  = '80px';
	},

	// pzprv3.DEBUG===true時はオーバーライドされます
	keydown : function(ca){
		var kc = this.owner.key;
		if(kc.isCTRL && ca=='F8'){
			this.disppoptest();
			kc.tcMoved = true;
			return true;
		}
		return false;
	},

	filesave : function(){
		this.setTA(this.owner.fio.fileencode(this.owner.fio.PZPH).replace(/\//g,"\n"));
		this.addTA(this.owner.fio.history.replace(/\//g,"\n").replace(/\[\[slash\]\]/g,"/"));
	},
	filesave_pencilbox : function(){
		this.setTA(this.owner.fio.fileencode(this.owner.fio.PBOX).replace(/\//g,"\n"));
	},

	fileopen : function(){
		var dataarray = this.getTA().replace(/\//g,"[[slash]]").split("\n");
		menu.fileonload(dataarray.join("/"));
	},

	erasetext : function(){
		this.setTA('');
		if(pzprv3.DEBUG){ ee('testdiv').el.innerHTML = '';}
	},

	perfeval : function(){
		this.timeeval("正答判定測定",ee.binder(ans, ans.checkAns));
	},
	painteval : function(){
		this.timeeval("描画時間測定",ee.binder(pc, pc.paintAll));
	},
	resizeeval : function(){
		this.timeeval("resize描画測定",ee.binder(pc, pc.forceRedraw));
	},
	timeeval : function(text,func){
		this.addTA(text);
		var count=0, old = pzprv3.currentTime();
		while(pzprv3.currentTime() - old < 3000){
			count++;

			func();
		}
		var time = pzprv3.currentTime() - old;

		this.addTA("測定データ "+time+"ms / "+count+"回\n"+"平均時間   "+(time/count)+"ms")
	},

	dispdatabase : function(){
		var text = "";
		for(var i=0;i<localStorage.length;i++){
			var key = localStorage.key(i);
			text += (""+key+" "+localStorage[key]+"\n");
		}
		this.setTA(text);
	},

	loadperf : function(){
		menu.fileonload("pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /");
		pp.setVal('mode',3);
		pp.setVal('irowake',true);
	},

	adjustimage : function(){
		var size = 17;
		if     (bd.qcols<= 6){ size = 28;}
		else if(bd.qcols<= 8){ size = 27;}
		else if(bd.qcols<= 8){ size = 24;}
		else if(bd.qcols<= 9){ size = 21;}
		else if(bd.qcols<=18){ size = 19;}
		menu.imagesave(false,size);
	},

	getTA : function(){ return document.testform.testarea.value;},
	setTA : function(str){ document.testform.testarea.value  = str;},
	addTA : function(str){ document.testform.testarea.value += (str+"\n");}
});
