// Menu.js v3.4.0
(function(){

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
pzprv3.createCoreClass('Menu',
{
	initialize : function(targetpuzzle){
		this.items = null;

		this.dispfloat  = [];			// 現在表示しているフロートメニューウィンドウ(オブジェクト)
		this.floatpanel = [];			// (2段目含む)フロートメニューオブジェクトのリスト
		this.popel      = null;			// 現在表示しているポップアップウィンドウ(オブジェクト)

		this.movingpop  = null;			// 移動中のポップアップメニュー
		this.offset = new pzprv3.core.Point(0, 0);	// ポップアップウィンドウの左上からの位置

		this.btnstack   = [];			// ボタンの情報(idnameと文字列のリスト)
		this.labelstack = [];			// span等の文字列の情報(idnameと文字列のリスト)

		this.targetpuzzle = targetpuzzle;

		this.ispencilbox = false;

		this.displaymanage = true;

		this.reader;	// FileReaderオブジェクト

		this.resizetimer  = null;	// resizeタイマー

		// ElementTemplate : ボタン
		this.el_button = pzprv3.createEL('input');
		this.el_button.type = 'button';
	},

	language : 'ja',

	enableSaveImage  : false, // 画像保存が有効か

	fileio : (document.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi"),
	enableReadText : false,

	//---------------------------------------------------------------------------
	// menu.menuinit()   メニュー、サブメニュー、フロートメニュー、ボタン、
	//                   管理領域、ポップアップメニューの初期設定を行う
	// menu.menureset()  メニュー用の設定を消去する
	//---------------------------------------------------------------------------
	menuinit : function(pp){
		var pid = this.targetpuzzle.pid, pinfo = pzprv3.PZLINFO.info[pid];
		this.ispencilbox = (pinfo.exists.kanpen && (pid!=="nanro" && pid!=="ayeheya" && pid!=="kurochute"));

		this.items = new pzprv3.core.MenuList();

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
			this.reader.onload = function(e){ this.fileonload(e.target.result.replace(/\//g, "[[slash]]"));};
		}

		if(!!getEL("divques_sub").getContext && !!document.createElement('canvas').toDataURL){
			this.enableSaveImage = true;
		}

		if(pzprv3.browser.IE6){
			this.modifyCSS('menu.floatmenu li.smenusep', {lineHeight :'2pt', display:'inline'});
		}

		this.menuarea();
		this.managearea();
		this.buttonarea();
		this.poparea();

		this.displayAll();

		this.displayDesign();	// デザイン変更関連関数の呼び出し
		this.checkUserLang();	// 言語のチェック
	},

	menureset : function(){
		this.dispfloat  = [];
		this.floatpanel = [];
		this.popel      = null;
		this.btnstack   = [];
		this.labelstack = [];
		this.managestack = [];

		this.popclose();
		this.floatmenuclose(0);

		getEL('float_parent').innerHTML = '';

		getEL('btnarea').innerHTML = '';

		getEL('urlbuttonarea').innerHTML = '';

		getEL('menupanel') .innerHTML = '';
		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';

		if(this.targetpuzzle.pid==='tawa'){
			document.flip.turnl.disabled = false;
			document.flip.turnr.disabled = false;
		}

		this.items.reset();
	},

	//---------------------------------------------------------------------------
	// menu.addButtons() ボタンの情報を変数に登録する
	// menu.addLabels()  ラベルの情報を変数に登録する
	//---------------------------------------------------------------------------
	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		pzprv3.unselectable(el);
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
		for(var i in this.items.flags){ this.setdisplay(i);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			if(!this.btnstack[i].el){ continue;}
			this.btnstack[i].el.value = this.btnstack[i].str[this.language];
		}
		for(var i=0,len=this.labelstack.length;i<len;i++){
			if(!this.labelstack[i].el){ continue;}
			this.labelstack[i].el.innerHTML = this.labelstack[i].str[this.language];
		}
		this.targetpuzzle.opemgr.enb_btn();
	},
	setdisplay : function(idname){
		var pp = this.items, puzzle = this.targetpuzzle;
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
			var smenu = getEL('ms_'+idname), label = getEL('cl_'+idname);
			if(!!smenu){ smenu.innerHTML = "&nbsp;"+pp.getMenuStr(idname);}	// メニュー上の表記の設定
			if(!!label){ label.innerHTML = pp.getLabel(idname);}			// 管理領域上の表記の設定
			for(var i=0,len=pp.flags[idname].child.length;i<len;i++){ this.setdisplay(""+idname+"_"+pp.flags[idname].child[i]);}
			break;

		case pp.CHILD:
			var smenu = getEL('ms_'+idname), manage = getEL('up_'+idname);
			var issel = (puzzle.getConfig(idname) == puzzle.getConfig(pp.flags[idname].parent));
			var cap = pp.getMenuStr(idname);
			if(!!smenu){ smenu.innerHTML = (issel?"+":"&nbsp;")+cap;}	// メニューの項目
			if(!!manage){													// 管理領域の項目
				manage.innerHTML = cap;
				manage.className = (issel?"childsel":"child");
			}
			break;

		case pp.CHECK:
			var smenu = getEL('ms_'+idname), check = getEL('ck_'+idname), label = getEL('cl_'+idname);
			var flag = puzzle.getConfig(idname);
			if(!!smenu){ smenu.innerHTML = (flag?"+":"&nbsp;")+pp.getMenuStr(idname);}	// メニュー
			if(!!check){ check.checked   = flag;}					// 管理領域(チェックボックス)
			if(!!label){ label.innerHTML = pp.getLabel(idname);}		// 管理領域(ラベル)
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
		var pid = this.targetpuzzle.pid;
		var imageurl = pzprv3.PZLINFO.toBGimage(pid);
		if(!imageurl){ imageurl="./bg/"+pid+".gif";}
		document.body.style.backgroundImage = "url("+imageurl+")";
		if(pzprv3.browser.IE6){
			getEL('title2').style.marginTop = "24px";
			getEL('separator2').style.margin = '0pt';
		}
	},
	displayTitle : function(){
		var title;
		if(pzprv3.EDITOR){ title = ""+this.getPuzzleName()+this.selectStr(" エディタ - ぱずぷれv3"," editor - PUZ-PRE v3");}
		else			 { title = ""+this.getPuzzleName()+this.selectStr(" player - ぱずぷれv3"  ," player - PUZ-PRE v3");}

		document.title = title;
		getEL('title2').innerHTML = title;
	},
	getPuzzleName : function(){
		var pinfo = pzprv3.PZLINFO.info[this.targetpuzzle.pid];
		return this.selectStr(pinfo.ja, pinfo.en);
	},

	//---------------------------------------------------------------------------
	// menu.setWindowEvents()  マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setWindowEvents : function(){
		var puzzle = this.targetpuzzle;
		// File API＋Drag&Drop APIの設定
		if(!!this.reader){
			var DDhandler = function(e){
				this.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			};
			puzzle.addEvent(window, 'dragover', this, function(e){ e.preventDefault();}, true);
			puzzle.addEvent(window, 'drop', this, DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		puzzle.addEvent(document, 'blur', this, this.onblur_func);

		// onresizeイベントを割り当てる
		var evname = (!pzprv3.OS.iOS ? 'resize' : 'orientationchange');
		puzzle.addEvent(window, evname, this, this.onresize_func);
	},

	//---------------------------------------------------------------------------
	// menu.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// menu.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		var self = this;
		this.resizetimer = setTimeout(function(){ self.targetpuzzle.painter.forceRedraw();},250);
	},
	onblur_func : function(){
		this.targetpuzzle.key.keyreset();
		this.targetpuzzle.mouse.mousereset();
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.menuarea()   メニューの初期設定を行う
	// menu.menufix()    各パズルの設定を追加する
	//---------------------------------------------------------------------------
	menuarea : function(){
		var pp = this.items;
		var am = function(){ pp.addMenu.apply(pp,arguments);},
			at = function(){ pp.addSParent.apply(pp,arguments);},
			an = function(){ pp.addSParent2.apply(pp,arguments);},
			as = function(){ pp.addSmenu.apply(pp,arguments);},
			au = function(){ pp.addSelect.apply(pp,arguments);},
			ac = function(){ pp.addCheck.apply(pp,arguments);},
			aa = function(){ pp.addCaption.apply(pp,arguments);},
			ai = function(){ pp.addChild.apply(pp,arguments);},
			ap = function(){ pp.addSeparator.apply(pp,arguments);},
			af = function(){ pp.addFlagOnly.apply(pp,arguments);},
			sl = function(){ pp.setLabel.apply(pp,arguments);};
		var puzzle = this.targetpuzzle, pid = puzzle.pid;

		// *ファイル ==========================================================
		am('file', "ファイル", "File");

		as('newboard', 'file', '新規作成','New Board');
		as('urlinput', 'file', 'URL入力', 'Import from URL');
		as('urloutput','file', 'URL出力', 'Export URL');
		ap('sep_file', 'file');
		as('fileopen', 'file', 'ファイルを開く','Open the file');
		at('filesavep', 'file', 'ファイル保存 ->',  'Save the file as ... ->');
		if(pzprv3.storage.localST){
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
		if(pzprv3.storage.session){
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
		if(!puzzle.config.disable_subclear){
			as('subclear', 'board', '補助記号消去', 'Erase auxiliary marks');
		}

		// *表示 ==============================================================
		am('disp', "表示", "Display");

		as('dispsize', 'disp','サイズ指定','Cell Size');
		ap('sep_disp0',  'disp');

		au('size','disp',2,[0,1,2,3,4], '表示サイズ','Cell Size');
		au('text','disp',(!pzprv3.OS.mobile?0:2),[0,1,2,3], 'テキストのサイズ','Text Size');
		ap('sep_disp1',  'disp');

		if(!!puzzle.config.flag_irowake){
			ac('irowake','disp',(puzzle.config.flag_irowake==2?true:false),'線の色分け','Color coding');
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
		this.textsize(puzzle.getConfig('text'));

		// *設定 ==============================================================
		am('setting', "設定", "Setting");

		if(pzprv3.EDITOR){
			au('mode','setting',(puzzle.editmode?1:3),[1,3],'モード', 'mode');
			sl('mode','モード', 'mode');
		}
		else{
			af('mode', 3);
		}
		ai('mode_1', 'mode', '問題作成モード', 'Edit mode'  );
		ai('mode_3', 'mode', '回答モード',     'Answer mode');

		this.menuconfig(pp);		// コンフィグ関連のメニュー追加

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
	menuconfig : function(pp){
		var puzzle = this.targetpuzzle, pid = puzzle.pid;

		/* 操作方法の設定値 */
		if(puzzle.config.flag_use){
			pp.addSelect('use','setting',(!pzprv3.env.touchevent?1:2),[1,2], '操作方法', 'Input Type');
			pp.setLabel('use', '操作方法', 'Input Type');
			pp.addChild('use_1','use','左右ボタン','LR Button');
			pp.addChild('use_2','use','1ボタン',   'One Button');
		}
		if(pid==='shakashaka'){
			pp.addSelect('use_tri','setting',(!pzprv3.env.touchevent?1:2),[1,2,3], '三角形の入力方法', 'Input Triangle Type');
			pp.setLabel('use_tri', '三角形の入力方法', 'Input Triangle Type');
			pp.addChild('use_tri_1', 'use', 'クリックした位置', 'Corner-side');
			pp.addChild('use_tri_2', 'use', '引っ張り入力', 'Pull-to-Input');
			pp.addChild('use_tri_3', 'use', '1ボタン', 'One Button');
		}

		/* 盤面チェックの設定値 */
		if(puzzle.config.flag_redline){
			pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
			pp.setLabel('dispred', '線のつながりをチェックする', 'Check countinuous lines');
		}
		else if(puzzle.config.flag_redblk){
			pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
			pp.setLabel('dispred', '黒マスのつながりをチェックする', 'Check countinuous black cells');
		}
		else if(puzzle.config.flag_redblkrb){
			pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
			pp.setLabel('dispred', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous black cells with its corner');
		}
		else if(pid==='roma'){
			pp.addCheck('dispred','setting',false,'通り道のチェック', 'Check Road');
			pp.setLabel('dispred', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');
		}

		/* 背景色入力の設定値 */
		if(puzzle.config.flag_bgcolor){
			pp.addCheck('bgcolor','setting',false, '背景色入力', 'Background-color');
			pp.setLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');
		}

		/* 文字別正解表示の設定値 */
		if(pid==='hashikake'||pid==='kurotto'){
			pp.addCheck('circolor','setting',false,'数字をグレーにする','Set Grey Color');
			pp.setLabel('circolor', '正しい数字をグレーにする', 'Grey if the number is correct.');
		}
		else if(pid==='kouchoku'){
			pp.addCheck('circolor','setting',true,'点をグレーにする','Set Grey Color');
			pp.setLabel('circolor', '線が2本以上になったら点をグレーにする', 'Grey if the letter links over two segments.');
		}

		if(pid==='hitori'){
			pp.addCheck('plred','setting',false, '重複した数字を表示', 'Show overlapped number');
			pp.setLabel('plred', '重複している数字を赤くする', 'Show overlapped number as red.');
		}

		if(pid==='wagiri'){
			pp.addCheck('colorslash','setting',false, '斜線の色分け', 'Slash with color');
			pp.setLabel('colorslash', '斜線を輪切りかのどちらかで色分けする(重いと思います)', 'Encolor slashes whether it consists in a loop or not.(Too busy)');
		}

		/* 正当判定方法の設定値 */
		if(pid==='fillomino'){
			pp.addCheck('enbnonum','setting',false,'未入力で正答判定','Allow Empty cell');
			pp.setLabel('enbnonum', '全ての数字が入っていない状態での正答判定を許可する', 'Allow answer check with empty cell in the board.');
		}

		/* 線の引き方の設定値 */
		if(pid==='kouchoku'){
			pp.addCheck('enline','setting',true,'線は点の間','Line between points');
			pp.setLabel('enline', '点の間のみ線を引けるようにする', 'Able to draw line only between the points.');

			pp.addCheck('lattice','setting',true,'格子点チェック','Check lattice point');
			pp.setLabel('lattice', '点を通過する線を引けないようにする', 'Disable drawing segment passing over a lattice point.');
		}

		/* 問題形式の設定値 */
		if(pid==='mashu'){
			pp.addCheck('uramashu','setting',false, '裏ましゅ', 'Ura-Mashu');
			pp.setLabel('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');
		}

		/* 盤面表示形式の設定値 */
		if(pid==='pipelinkr'){
			pp.addSelect('disptype_pipelinkr','setting',1,[1,2],'表示形式','Display');
			pp.addChild('disptype_pipelinkr_1', 'disptype', '○', 'Circle');
			pp.addChild('disptype_pipelinkr_2', 'disptype', '■', 'Icebarn');
		}

		if(pid==='bosanowa'){
			pp.addSelect('disptype_bosanowa','setting',1,[1,2,3],'表示形式','Display');
			pp.setLabel('disptype_bosanowa', '表示形式', 'Display');
			pp.addChild('disptype_bosanowa_1', 'disptype', 'ニコリ紙面形式', 'Original Type');
			pp.addChild('disptype_bosanowa_2', 'disptype', '倉庫番形式',     'Sokoban Type');
			pp.addChild('disptype_bosanowa_3', 'disptype', 'ワリタイ形式',   'Waritai type');
		}

		if(pid==='snakebd'){
			pp.addCheck('snakebd','setting',false,'へび境界線有効','Enable snake border');
			pp.setLabel('snakebd', 'へびの周りに境界線を表示する', 'Draw border around a snake.');
		}

		/* EDITOR時の設定値 */
		if(pzprv3.EDITOR && pid==='goishi'){
			pp.addCheck('bdpadding','setting',true, '空隙つきURL', 'URL with Padding');
			pp.setLabel('bdpadding', 'URL生成時に周り1マス何もない部分をつける', 'Add Padding around the Board in outputting URL.');
		}
		if(pzprv3.EDITOR && pid==='tentaisho'){
			pp.addCheck('discolor','setting',false,'色分け無効化','Disable color');
			pp.setLabel('discolor', '星クリックによる色分けを無効化する', 'Disable Coloring up by clicking star');
		}

		/* 共通設定値 */
		pp.addCheck('autocheck','setting', puzzle.playmode, '正答自動判定', 'Auto Answer Check');

		pp.addCheck('lrcheck',  'setting', false, 'マウス左右反転', 'Mouse button inversion');
		pp.setLabel('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');

		if(puzzle.key.haspanel[1] || puzzle.key.haspanel[3]){
			pp.addCheck('keypopup', 'setting', false, 'パネル入力', 'Panel inputting');
			pp.setLabel('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');
		}

		pp.addSelect('language', 'setting', 'ja', ['ja','en'], '言語', 'Language');
		pp.addChild('language_ja', 'language', '日本語',  '日本語');
		pp.addChild('language_en', 'language', 'English', 'English');
	},

	//---------------------------------------------------------------------------
	// menu.createAllFloat() 登録されたサブメニューから全てのフロートメニューを作成する
	//---------------------------------------------------------------------------
	createAllFloat : function(){
		var pp = this.items;
		var puzzle = this.targetpuzzle;

		// ElementTemplate : メニュー領域
		var el_menu = pzprv3.createEL('li');
		el_menu.className = 'menu';

		// ElementTemplate : フロートメニュー
		var el_float = pzprv3.createEL('menu');
		el_float.className = 'floatmenu';

		// ElementTemplate : フロートメニュー(中身)
		var el_smenu = pzprv3.createEL('li');
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

		var el_separate = pzprv3.createEL('li');
		el_separate.className = 'smenusep';
		el_separate.innerHTML = '&nbsp;';

		var el_label = pzprv3.createEL('li');
		el_label.className = 'smenulabel';

		for(var i=0;i<pp.flaglist.length;i++){
			var id = pp.flaglist[i];
			if(!pp.flags[id]){ continue;}

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
				pzprv3.getEL('menupanel').appendChild(smenu);
				puzzle.addEvent(smenu, "mouseover", this, this.menuhover);
				puzzle.addEvent(smenu, "mouseout",  this, this.menuout);
				continue;
			}
			else if(sfunc){
				puzzle.addEvent(smenu, "mouseover", this, this.submenuhover);
				puzzle.addEvent(smenu, "mouseout",  this, this.submenuout);
				if(cfunc){ puzzle.addEvent(smenu, "click", this, this.submenuclick);}
			}

			var parentid = pp.flags[id].parent;
			if(!this.floatpanel[parentid]){
				var panel = el_float.cloneNode(false);
				panel.id = 'float_'+parentid;
				pzprv3.getEL('float_parent').appendChild(panel);
				puzzle.addEvent(panel, "mouseout", this, this.floatmenuout);
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
		if(pzprv3.PLAYER){
			getEL('ms_newboard') .className = 'smenunull';
			getEL('ms_urloutput').className = 'smenunull';
			getEL('ms_adjust')   .className = 'smenunull';
		}
		getEL('ms_jumpv3')  .style.fontSize = '0.9em'; getEL('ms_jumpv3')  .style.paddingLeft = '8pt';
		getEL('ms_jumptop') .style.fontSize = '0.9em'; getEL('ms_jumptop') .style.paddingLeft = '8pt';
		getEL('ms_jumpblog').style.fontSize = '0.9em'; getEL('ms_jumpblog').style.paddingLeft = '8pt';

		if(this.enableSaveImage && !!puzzle.classes.ImageTile){
			if(pzprv3.browser.Gecko && !location.hostname){
				pzprv3.getEL('ms_imagesavep').className = 'smenunull';
			}
		}
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
	// menu.submenuclick(e) 通常/選択型/チェック型サブメニューがクリックされたときの動作を実行する
	//---------------------------------------------------------------------------
	submenuclick : function(e){
		var el = (e.target||e.srcElement);
		if(!!el && el.className==="smenu"){
			this.floatmenuclose(0);

			var idname = el.id.substr(3), pp = this.items;
			var puzzle = this.targetpuzzle;
			switch(pp.type(idname)){
				case pp.SMENU: this.popopen(e, idname); break;
				case pp.CHILD: puzzle.setConfig(pp.flags[idname].parent, puzzle.getConfig(idname)); break;
				case pp.CHECK: puzzle.setConfig(idname, !puzzle.getConfig(idname)); break;
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

		var rect = pzprv3.getRect(e.target||e.srcElement);
		var idname = (e.target||e.srcElement).id.substr(3);
		var _float = this.floatpanel[idname];
		if(depth==0){
			_float.style.left = rect.left   + 1 + 'px';
			_float.style.top  = rect.bottom + 1 + 'px';
		}
		else{
			if(!pzprv3.browser.IE6){
				_float.style.left = rect.right - 3 + 'px';
				_float.style.top  = rect.top   - 3 + 'px';
			}
			else{
				_float.style.left = this.targetpuzzle.mouse.pageX(e)  + 'px';
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
		var ex = this.targetpuzzle.mouse.pageX(e);
		var ey = this.targetpuzzle.mouse.pageY(e);
		var rect = pzprv3.getRect(el);
		return (ex>=rect.left && ex<=rect.right && ey>=rect.top && ey<=rect.bottom);
	},
	insideOfMenu : function(e){
		var ex = this.targetpuzzle.mouse.pageX(e);
		var ey = this.targetpuzzle.mouse.pageY(e);
		var rect_f = pzprv3.getRect(getEL('ms_file')), rect_o = pzprv3.getRect(getEL('ms_other'));
		return (ey>= rect_f.bottom || (ex>=rect_f.left && ex<=rect_o.right && ey>=rect_f.top));
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.managearea()   管理領域の初期化を行う(内容はサブメニューのものを参照)
	// menu.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// menu.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	//---------------------------------------------------------------------------
	managearea : function(){
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
		var pp = this.items;
		var puzzle = this.targetpuzzle;
		for(var n=0;n<pp.flaglist.length;n++){
			var idname = pp.flaglist[n];
			if(!pp.flags[idname] || !pp.getLabel(idname)){ continue;}
			var _div = el_div.cloneNode(false);
			_div.id = 'div_'+idname;
			//_div.innerHTML = "";

			switch(pp.type(idname)){
			case pp.SELECT:
				var span = el_span.cloneNode(false);
				span.id = 'cl_'+idname;
				_div.appendChild(span);
				_div.appendChild(document.createTextNode(" | "));
				for(var i=0;i<pp.flags[idname].child.length;i++){
					var num = pp.flags[idname].child[i];
					var sel = el_selchild.cloneNode(false);
					sel.id = ['up',idname,num].join("_");
					puzzle.addEvent(sel, "click", this, this.selectclick);
					_div.appendChild(sel);
					_div.appendChild(document.createTextNode(' '));
				}
				_div.appendChild(document.createElement('br'));

				getEL('usepanel').appendChild(_div);
				break;

			case pp.CHECK:
				var box = el_checkbox.cloneNode(false);
				box.id = 'ck_'+idname;
				puzzle.addEvent(box, "click", this, this.checkclick);
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
		if(puzzle.config.flag_irowake){
			// 横にくっつけたいボタンを追加
			var el = this.el_button.cloneNode(false);
			el.id = "ck_btn_irowake";
			this.addButtons(el, function(){ puzzle.board.irowakeRemake();}, "色分けしなおす", "Change the color of Line");
			var node = getEL('cl_irowake');
			node.parentNode.insertBefore(el, node.nextSibling);

			// 色分けのやつを一番下に持ってくる
			var el = getEL('checkpanel').removeChild(getEL('div_irowake'));
			getEL('checkpanel').appendChild(el);
		}

		// 背景色のクリック入力用の処理
		if(puzzle.config.flag_bgcolor && puzzle.editmode){
			pzprv3.getEL('ck_bgcolor').disabled    = "true";
			pzprv3.getEL('cl_bgcolor').style.color = "silver";
		}

		// 管理領域の表示/非表示設定
		if(pzprv3.EDITOR){
			getEL('timerpanel').style.display = 'none';
			getEL('separator2').style.display = 'none';
		}
		if(!!getEL('ck_keypopup')){ this.funcs.keypopup.call(this);}
	},

	checkclick : function(e){
		var el = (e.target||e.srcElement);
		var idname = el.id.substr(3);
		this.targetpuzzle.setConfig(idname, !!el.checked);
	},
	selectclick : function(e){
		var list = (e.target||e.srcElement).id.split('_');
		this.targetpuzzle.setConfig(list[1], list[2]);
	},

	//---------------------------------------------------------------------------
	// menu.buttonarea()   盤面下のボタンエリアの初期化を行う
	// menu.toggledisp()   アイスと○などの表示切り替え時の処理を行う
	//---------------------------------------------------------------------------
	buttonarea : function(){
		// (Canvas下) ボタンの初期設定
		var btncheck = this.el_button.cloneNode(false); btncheck.id = "btncheck";
		var btnundo = this.el_button.cloneNode(false);  btnundo.id = "btnundo";
		var btnredo = this.el_button.cloneNode(false);  btnredo.id = "btnredo";
		var btnclear = this.el_button.cloneNode(false); btnclear.id = "btnclear";

		getEL('btnarea').appendChild(btncheck);
		getEL('btnarea').appendChild(document.createTextNode(' '));
		getEL('btnarea').appendChild(btnundo);
		getEL('btnarea').appendChild(btnredo);
		getEL('btnarea').appendChild(document.createTextNode(' '));
		getEL('btnarea').appendChild(btnclear);

		var puzzle = this.targetpuzzle, self = this;
		this.addButtons(btncheck, function(){ puzzle.checker.check();}, "チェック", "Check");
		this.addButtons(btnundo,  function(){ puzzle.opemgr.undo(1);}, "戻", "<-");
		this.addButtons(btnredo,  function(){ puzzle.opemgr.redo(1);}, "進", "->");
		this.addButtons(btnclear, function(){ self.ACconfirm();}, "回答消去", "Erase Answer");

		// 初期値ではどっちも押せない
		getEL('btnundo').disabled = true;
		getEL('btnredo').disabled = true;

		if(!puzzle.config.disable_subclear){
			var el = this.el_button.cloneNode(false); el.id = "btnclear2";
			getEL('btnarea').appendChild(el);
			this.addButtons(el, function(){ self.ASconfirm();}, "補助消去", "Erase Auxiliary Marks");
		}

		if(!!puzzle.config.flag_irowake){
			var el = this.el_button.cloneNode(false); el.id = "btncolor2";
			getEL('btnarea').appendChild(el);
			this.addButtons(el, function(){ puzzle.board.irowakeRemake();}, "色分けしなおす", "Change the color of Line");
			el.style.display = 'none';
		}

		if(puzzle.pid==='pipelinkr'){
			var el = this.el_button.cloneNode(false); el.id = 'btncircle';
			getEL('btnarea').appendChild(el);
			this.addButtons(el, function(){ self.toggledisp();}, "○", "○");
		}

		if(puzzle.pid==='tentaisho'){
			var el = this.el_button.cloneNode(false); el.id = 'btncolor';
			getEL('btnarea').appendChild(el);
			this.addButtons(el, function(){ puzzle.board.encolorall();}, "色をつける","Color up");
		}
	},
	toggledisp : function(){
		var puzzle = this.targetpuzzle;
		puzzle.setConfig('disptype', (puzzle.getConfig('disptype')==1?2:1));
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.poparea()       ポップアップメニューの初期設定を行う
	//---------------------------------------------------------------------------
	poparea : function(){
		var _doc = document, self=this;
		var puzzle = this.targetpuzzle, pid = puzzle.pid;

		//=====================================================================
		//// 各タイトルバーの動作設定
		var popel = getEL('popup_parent').firstChild;
		while(!!popel){
			var _el = popel.firstChild;
			while(!!_el){
				if(_el.className==='titlebar'){
					this.titlebarfunc(_el);
					break;
				}
				_el = _el.nextSibling;
			}
			popel = popel.nextSibling;
		}
		this.titlebarfunc(getEL('credit3_1'));

		puzzle.addMouseMoveEvent(_doc, this, this.titlebarmove);
		puzzle.addMouseUpEvent  (_doc, this, this.titlebarup);

		//=====================================================================
		//// formボタンの動作設定・その他のCaption設定
		var btn = function(el, func, strJP, strEN){ self.addButtons(el, func, strJP, strEN);};
		var lab = function(el, strJP, strEN){ self.addLabels(el, strJP, strEN);};
		var close = function(e){ self.popclose();};
		var func = null;

		// 盤面の新規作成 -----------------------------------------------------

		// URL入力 ------------------------------------------------------------
		func = function(e){ self.urlinput(e||window.event);};
		lab(getEL('bar1_2'),      "URL入力",                     "Import from URL");
		lab(getEL('pop1_2_cap0'), "URLから問題を読み込みます。", "Import a question from URL.");
		btn(_doc.urlinput.urlinput, func,  "読み込む",   "Import");
		btn(_doc.urlinput.cancel,   close, "キャンセル", "Cancel");

		// URL出力 ------------------------------------------------------------
		func = function(e){ self.urloutput(e||window.event);};
		lab(getEL('bar1_3'), "URL出力", "Export URL");
		var btt = function(name, strJP, strEN, eval){
			if(eval===false){ return;}
			var el = self.el_button.cloneNode(false); el.name = name;
			getEL('urlbuttonarea').appendChild(el);
			getEL('urlbuttonarea').appendChild(document.createElement('br'));
			btn(el, func, strJP, strEN);
		};
		var pinfo = pzprv3.PZLINFO.info[pid];
		btt('pzprv3',     "ぱずぷれv3のURLを出力する",           "Output PUZ-PRE v3 URL",          true);
		btt('pzprapplet', "ぱずぷれ(アプレット)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", pinfo.exists.pzprapp);
		btt('kanpen',     "カンペンのURLを出力する",             "Output Kanpen URL",              pinfo.exists.kanpen);
		btt('heyaapp',    "へやわけアプレットのURLを出力する",   "Output Heyawake-Applet URL",     (pid==="heyawake"));
		btt('pzprv3edit', "ぱずぷれv3の再編集用URLを出力する",   "Output PUZ-PRE v3 Re-Edit URL",  true);
		getEL("urlbuttonarea").appendChild(document.createElement('br'));
		func = function(e){ self.openurl(e||window.event);};
		btn(_doc.urloutput.openurl, func,  "このURLを開く", "Open this URL on another window/tab");
		btn(_doc.urloutput.close,   close, "閉じる", "Close");

		// ファイル入力 -------------------------------------------------------
		func = function(e){ self.fileopen(e||window.event);};
		lab(getEL('bar1_4'),      "ファイルを開く", "Open file");
		lab(getEL('pop1_4_cap0'), "ファイル選択",   "Choose file");
		_doc.fileform.filebox.onchange = func;
		btn(_doc.fileform.close,    close, "閉じる",     "Close");

		// データベースを開く -------------------------------------------------
		func = function(e){ self.database_handler(e||window.event);};
		lab(getEL('bar1_8'), "一時保存/戻す", "Temporary Stack");
		_doc.database.sorts   .onchange = func;
		_doc.database.datalist.onchange = func;
		_doc.database.tableup .onclick  = func;
		_doc.database.tabledn .onclick  = func;
		btn(_doc.database.open,     func,  "データを読み込む",   "Load");
		btn(_doc.database.save,     func,  "盤面を保存",         "Save");
		lab(getEL('pop1_8_com'), "コメント:", "Comment:");
		btn(_doc.database.comedit,  func,  "コメントを編集する", "Edit Comment");
		btn(_doc.database.difedit,  func,  "難易度を設定する",   "Set difficulty");
		btn(_doc.database.del,      func,  "削除",               "Delete");
		btn(_doc.database.close,    close, "閉じる",             "Close");

		// 盤面の調整 ---------------------------------------------------------
		func = function(e){ self.popupadjust(e||window.event)};
		lab(getEL('bar2_1'),      "盤面の調整",             "Board Dimension Resizer");
		lab(getEL('pop2_1_cap0'), "盤面の調整を行います。", "Adjust the board.");
		lab(getEL('pop2_1_cap1'), "拡大",  "Expand");
		btn(_doc.adjust.expandup,   func,  "上",     "Top");
		btn(_doc.adjust.expanddn,   func,  "下",     "Bottom");
		btn(_doc.adjust.expandlt,   func,  "左",     "Left");
		btn(_doc.adjust.expandrt,   func,  "右",     "Right");
		lab(getEL('pop2_1_cap2'), "縮小", "Reduce");
		btn(_doc.adjust.reduceup,   func,  "上",     "Top");
		btn(_doc.adjust.reducedn,   func,  "下",     "Bottom");
		btn(_doc.adjust.reducelt,   func,  "左",     "Left");
		btn(_doc.adjust.reducert,   func,  "右",     "Right");
		btn(_doc.adjust.close,      close, "閉じる", "Close");

		// 反転・回転 ---------------------------------------------------------
		lab(getEL('bar2_2'),      "反転・回転",                  "Flip/Turn the board");
		lab(getEL('pop2_2_cap0'), "盤面の回転・反転を行います。","Flip/Turn the board.");
		btn(_doc.flip.turnl,  func,  "左90°回転", "Turn left by 90 degree");
		btn(_doc.flip.turnr,  func,  "右90°回転", "Turn right by 90 degree");
		btn(_doc.flip.flipy,  func,  "上下反転",   "Flip upside down");
		btn(_doc.flip.flipx,  func,  "左右反転",   "Flip leftside right");
		btn(_doc.flip.close,  close, "閉じる",     "Close");
		if(pid==='tawa'){
			_doc.flip.turnl.disabled = true;
			_doc.flip.turnr.disabled = true;
		}

		// credit -------------------------------------------------------------
		lab(getEL('bar3_1'),   "credit", "credit");
		lab(getEL('credit3_1'),"ぱずぷれv3 "+pzprv3.version+"<br>\n<br>\nぱずぷれv3は はっぱ/連続発破が作成しています。<br>\n",
							   "PUZ-PRE v3 "+pzprv3.version+"<br>\n<br>\nPUZ-PRE v3 id made by happa.<br>\n");
		btn(_doc.credit.close,  close, "閉じる", "OK");

		// 表示サイズ ---------------------------------------------------------
		func = function(e){ self.dispsize(e||window.event);};
		lab(getEL('bar4_1'),      "表示サイズの変更",         "Change size");
		lab(getEL('pop4_1_cap0'), "表示サイズを変更します。", "Change the display size.");
		lab(getEL('pop4_1_cap1'), "表示サイズ",               "Display size");
		btn(_doc.dispsize.dispsize, func,  "変更する",   "Change");
		btn(_doc.dispsize.cancel,   close, "キャンセル", "Cancel");

		// poptest ------------------------------------------------------------
		pzprv3.debug.poptest_func();

		if(getEL("pop1_8").style.display=='inline'){ this.popel = getEL("pop1_8");}
	},

	//---------------------------------------------------------------------------
	// menu.popopen()  ポップアップメニューを開く
	// menu.popclose() ポップアップメニューを閉じる
	//---------------------------------------------------------------------------
	popopen : function(e, idname){
		// 表示しているウィンドウがある場合は閉じる
		this.popclose();

		// この中でmenu.popelも設定されます。
		if(this.funcs[idname]){ this.funcs[idname].call(this);}

		// ポップアップメニューを表示する
		if(this.popel){
			var _popel = this.popel;
			_popel.style.left = this.targetpuzzle.mouse.pageX(e) - 8 + 'px';
			_popel.style.top  = this.targetpuzzle.mouse.pageY(e) - 8 + 'px';
			_popel.style.display = 'inline';
		}
	},
	popclose : function(){
		if(this.popel){
			if(this.popel.id=='pop1_8'){
				pzprv3.dbm.closeDialog();
			}

			this.popel.style.display = "none";
			this.popel = null;
			this.movingpop = null;
			this.targetpuzzle.key.enableKey = true;
			this.targetpuzzle.mouse.enableMouse = true;
		}
	},

	//---------------------------------------------------------------------------
	// menu.titlebarfunc()  下の4つのイベントをイベントハンドラにくっつける
	// menu.titlebardown()  タイトルバーをクリックしたときの動作を行う(タイトルバーにbind)
	// menu.titlebarup()    タイトルバーでボタンを離したときの動作を行う(documentにbind)
	// menu.titlebarmove()  タイトルバーからマウスを動かしたときポップアップメニューを動かす(documentにbind)
	//---------------------------------------------------------------------------
	titlebarfunc : function(bar){
		this.targetpuzzle.addMouseDownEvent(bar, this, this.titlebardown);
		pzprv3.unselectable(bar);
	},

	titlebardown : function(e){
		var popel = (e.target||e.srcElement).parentNode;
		var puzzle = this.targetpuzzle;
		this.movingpop = popel;
		this.offset.px = puzzle.mouse.pageX(e) - parseInt(popel.style.left);
		this.offset.py = puzzle.mouse.pageY(e) - parseInt(popel.style.top);
		puzzle.mouse.enableMouse = false;
	},
	titlebarup : function(e){
		var popel = this.movingpop;
		if(!!popel){
			this.movingpop = null;
			this.targetpuzzle.mouse.enableMouse = true;
		}
	},
	titlebarmove : function(e){
		var popel = this.movingpop;
		if(!!popel){
			popel.style.left = this.targetpuzzle.mouse.pageX(e) - this.offset.px + 'px';
			popel.style.top  = this.targetpuzzle.mouse.pageY(e) - this.offset.py + 'px';
			pzprv3.preventDefault(e);
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
		if(userlang.substr(0,2)!=='ja'){ this.targetpuzzle.setConfig('language','en');}
	},
	setLang : function(ln){
		this.language = ln;
		this.displayTitle();

		this.displayAll();
		this.dispmanstr();

		this.targetpuzzle.painter.forceRedraw();
	},
	selectStr  : function(strJP, strEN){ return (this.language==='ja' ? strJP : strEN);},
	alertStr   : function(strJP, strEN){ alert(this.language==='ja' ? strJP : strEN);},
	confirmStr : function(strJP, strEN){ return confirm(this.language==='ja' ? strJP : strEN);},

//--------------------------------------------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	funcs : {
		urlinput  : function(){ this.popel = getEL("pop1_2");},
		urloutput : function(){ this.popel = getEL("pop1_3"); document.urloutput.ta.value = "";},
		fileopen  : function(){ this.popel = getEL("pop1_4");},
		filesave  : function(){ this.filesave(k.PZPR);},
//		filesave3 : function(){ this.filesave(k.PZPH);},
		filesave2 : function(){ if(!!this.targetpuzzle.fio.kanpenSave){ this.filesave(k.PBOX);}},
		imagedl   : function(){ this.imagesave(true,null);},
		imagesave : function(){ this.imagesave(false,null);},
		database  : function(){ this.popel = getEL("pop1_8"); pzprv3.dbm.openDialog();},

		h_oldest  : function(){ this.targetpuzzle.opemgr.undoall();},
		h_undo    : function(){ this.targetpuzzle.opemgr.undo(1);},
		h_redo    : function(){ this.targetpuzzle.opemgr.redo(1);},
		h_latest  : function(){ this.targetpuzzle.opemgr.redoall();},
		check     : function(){ this.targetpuzzle.checker.check();},
		ansclear  : function(){ this.ACconfirm();},
		subclear  : function(){ this.ASconfirm();},
		adjust    : function(){ this.popel = getEL("pop2_1");},
		turn      : function(){ this.popel = getEL("pop2_2");},
		duplicate : function(){ this.duplicate();},

		credit    : function(){ this.popel = getEL("pop3_1");},
		jumpexp   : function(){ window.open('./faq.html?'+this.targetpuzzle.pid+(pzprv3.EDITOR?"_edit":""), '');},
		jumpv3    : function(){ window.open('./', '', '');},
		jumptop   : function(){ window.open('../../', '', '');},
		jumpblog  : function(){ window.open('http://d.hatena.ne.jp/sunanekoroom/', '', '');},
		irowake   : function(){ this.targetpuzzle.painter.paintAll();},
		cursor    : function(){ this.targetpuzzle.painter.paintAll();},
		manarea   : function(){ this.dispman();},
		poptest   : function(){ pzprv3.debug.disppoptest();},

		mode      : function(num){ this.modechange(num);},
		text      : function(num){ this.textsize(num); this.targetpuzzle.painter.forceRedraw();},
		size      : function(num){ this.targetpuzzle.painter.forceRedraw();},
		repaint   : function(num){ this.targetpuzzle.painter.forceRedraw();},
		adjsize   : function(num){ this.targetpuzzle.painter.forceRedraw();},
		language  : function(str){ this.setLang(str);},

		circolor   : function(){ this.targetpuzzle.painter.paintAll();},
		plred      : function(){ this.targetpuzzle.painter.paintAll();},
		colorslash : function(){ this.targetpuzzle.painter.paintAll();},
		snakebd    : function(){ this.targetpuzzle.painter.paintAll();},
		uramashu   : function(){
			var bd = this.targetpuzzle.board;
			for(var c=0;c<bd.cellmax;c++){
				var cell = bd.cell[c];
				if     (cell.getQnum()===1){ cell.setQnum(2);}
				else if(cell.getQnum()===2){ cell.setQnum(1);}
			}
			this.targetpuzzle.painter.paintAll();
		},
		disptype_pipelinkr : function(num){
			if     (num==1){ pzprv3.getEL('btncircle').value="○";}
			else if(num==2){ pzprv3.getEL('btncircle').value="■";}
			this.targetpuzzle.painter.paintAll();
		},
		disptype_bosanowa : function(num){
			var pc = this.targetpuzzle.painter;
			pc.suspendAll();
			if     (num==1){ pc.bdmargin = 0.70; pc.bdmargin_image = 0.10;}
			else if(num==2){ pc.bdmargin = 1.20; pc.bdmargin_image = 1.10;}
			else if(num==3){ pc.bdmargin = 0.70; pc.bdmargin_image = 0.10;}
			pc.unsuspend();
		},

		newboard : function(){
			this.popel = getEL("pop1_1");
			this.newboard_createpop();
			this.targetpuzzle.key.enableKey = false;
		},
		dispsize : function(){
			this.popel = getEL("pop4_1");
			document.dispsize.cs.value = this.targetpuzzle.painter.cellsize;
			this.targetpuzzle.key.enableKey = false;
		},
		keypopup : function(){
			var f = this.targetpuzzle.key.haspanel[this.items.flags['mode'].val];
			getEL('ck_keypopup').disabled    = (f?"":"true");
			getEL('cl_keypopup').style.color = (f?"black":"silver");

			this.targetpuzzle.key.display();
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//------------------------------------------------------------------------------
	// menu.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		var o = this.targetpuzzle;
		o.editmode = (num==1);
		o.playmode = (num==3);

		o.key.keyreset();
		o.board.errclear();
		o.cursor.adjust_modechange();

		o.board.haserror=true;
		o.painter.paintAll();

		if(o.key.haspanel[1] || o.key.haspanel[3]){ this.funcs.keypopup.call(this);}
		if(o.config.flag_bgcolor){
			pzprv3.getEL('ck_bgcolor').disabled    = (num===3?"":"true");
			pzprv3.getEL('cl_bgcolor').style.color = (num===3?"black":"silver");
		}
	},

	//---------------------------------------------------------------------------
	// menu.newboard_createpop() 新規盤面作成のポップアップメニューを作成する
	// menu.newboard_createpop_tawa_lap() たわむれんがの形状入力用部
	// menu.newboard_exec()      新規盤面を作成するボタンを押したときの処理を行う
	//---------------------------------------------------------------------------
	newboard_createpop : function(){
		var puzzle = this.targetpuzzle, bd = puzzle.board, pid = puzzle.pid;
		var _doc = document, pop = _doc.getElementById("pop1_1");
		
		pop.innerHTML = '';
		
		/* Titlebar */
		var bar = _doc.createElement('div');
		bar.className = 'titlebar';
		bar.appendChild(_doc.createTextNode(this.selectStr("盤面の新規作成", "Createing New Board")));
		this.titlebarfunc(bar);
		pop.appendChild(bar);
		
		/* Form */
		var form = _doc.createElement('form');
		form.name = 'newboard';
		pop.appendChild(form);
		
		/* Caption */
		var el = _doc.createElement('span');
		el.appendChild(_doc.createTextNode(this.selectStr("盤面を新規作成します。", "Create New Board.")));
		form.appendChild(el);
		form.appendChild(_doc.createElement('br'));
		
		/* タテヨコのサイズ指定部分 */
		var col = bd.qcols, row = bd.qrows;
		if(pid==='tawa' && bd.lap===3){ col++;}
		
		if(pid!=='sudoku'){
			el = _doc.createElement('span');
			if(pid!=='tawa'){
				el.appendChild(_doc.createTextNode(this.selectStr("よこ", "Cols")));
			}
			else{
				el.appendChild(_doc.createTextNode(this.selectStr("横幅 (黄色の数)", "Width (Yellows)")));
			}
			form.appendChild(el);
			
			var numel = _doc.createElement('input');
			numel.type = 'number';
			numel.name = 'col';
			numel.value = ''+col;
			numel.size = '4';
			numel.maxlength = '3';
			numel.min = '1';
			numel.max = '999';
			form.appendChild(numel);
			form.appendChild(_doc.createElement('br'));
			
			el = _doc.createElement('span');
			if(pid!=='tawa'){
				el.appendChild(_doc.createTextNode(this.selectStr("たて", "Rows")));
			}
			else{
				el.appendChild(_doc.createTextNode(this.selectStr("高さ", "Height")));
			}
			form.appendChild(el);
			
			numel = numel.cloneNode(numel, false);
			numel.name = 'row';
			numel.value = ''+row;
			form.appendChild(numel);
			form.appendChild(_doc.createElement('br'));
		}
		else{
			var sizelist = [4,9,16,25], idx=1;
			if    (col!==row){ idx=1;}
			else if(col===16){ idx=2;}
			else if(col===25){ idx=3;}
			else if(col=== 4){ idx=0;}
			
			for(var i=0;i<4;i++){
				var size = sizelist[i];
				var radio = _doc.createElement('input');
				radio.type = 'radio';
				radio.name = 'size';
				radio.value = ''+size;
				radio.checked = ((idx===i) ? 'checked' : '');
				form.appendChild(radio);
				
				el = _doc.createElement('span');
				el.appendChild(_doc.createTextNode(""+size+"x"+size));
				form.appendChild(el);
				form.appendChild(_doc.createElement('br'));
			}
		}
		
		/* たわむレンガの形状指定ルーチン */
		if(pid==='tawa'){ this.newboard_createpop_tawa_lap(form);}
		
		/* 新規作成 or Cancel */
		el = _doc.createElement('input');
		el.type = 'button';
		el.value = this.selectStr("新規作成", "Create");
		el.onclick = function(e){ pzprv3.ui.newboard_exec(e||window.event);};
		form.appendChild(el);
		
		el = _doc.createElement('input');
		el.type = 'button';
		el.value = this.selectStr("キャンセル", "Cancel");
		el.onclick = function(e){ pzprv3.ui.popclose();};
		form.appendChild(el);
	},
	newboard_createpop_tawa_lap : function(form){
		var table = _doc.createElement('table');
		table.border = '0';
		table.cellPadding = '0';
		table.cellSpacing = '2';
		table.style.marginTop = '4pt';
		table.style.marginBottom = '4pt';
		form.appendChild(table);
		
		var tbody = _doc.createElement('tbody');
		table.appendChild(tbody);
		
		var trow = _doc.createElement('tr');
		trow.style.paddingBottom = '2px';
		tbody.appendChild(trow);
		
		var clicklap = function(e){
			var idx = (e.target||e.srcElement).parentNode.id.charAt(2);
			for(var i=0;i<=3;i++){
				pzprv3.getEL("nb"+i).style.backgroundColor = (i==idx?'red':'');
			}
		};
		
		/* cw=32, margin=2, width&height=cw+(margin*2)=36 */
		for(var i=0;i<=3;i++){
			var tcell = _doc.createElement('td');
			trow.appendChild(tcell);
			
			var _div = _doc.createElement('div');
			_div.id = "nb"+i;
			_div.style.display  = 'block';
			_div.style.position = 'relative';
			_div.style.width    = '36px';
			_div.style.height   = '36px';
			_div.style.backgroundColor = (i==[0,2,3,1][this.targetpuzzle.board.lap]?'red':'');
			tcell.appendChild(_div);
			
			var _img = _doc.createElement('img');
			_img.src = "src/img/tawa_nb.gif";
			_img.style.position = 'absolute';
			_img.style.margin   = '2px';
			_img.style.left = "-"+(i*32)+"px";
			_img.style.clip = "rect(0px,"+((i+1)*32)+"px,"+32+"px,"+(i*32)+"px)";
			_img.onclick = clicklap;
			_div.appendChild(_img);
		}
	},
	newboard_exec : function(e){
		if(this.popel){
			var puzzle = this.targetpuzzle, pid = puzzle.pid;
			var col, row, slap=null, url=[], NB=document.newboard;
			
			if(pid!=='sudoku'){
				col = (parseInt(NB.col.value))|0;
				row = (parseInt(NB.row.value))|0;
			}
			else{
				if     (NB.size[2].checked){ col=row=16;}
				else if(NB.size[3].checked){ col=row=25;}
				else if(NB.size[0].checked){ col=row= 4;}
				else                       { col=row= 9;}
			}
			if(!!col && !!row){ url = [col, row];}
			
			if(url.length>0 && pid==='tawa'){
				for(var i=0;i<=3;i++){
					if(pzprv3.getEL("nb"+i).style.backgroundColor==='red'){ slap=[0,3,1,2][i]; break;}
				}
				if(!isNaN(slap) && !(col==1 && (slap==0||slap==3))){
					if(slap===3){ col--; url=[col,row];}
					url.push(slap);
				}
				else{ url=[];}
			}
			
			this.popclose();
			if(url.length>0){
				puzzle.importBoardData({id:pid, qdata:url.join('/')});
			}
		}
	},

	//------------------------------------------------------------------------------
	// menu.urlinput()   URLを入力する
	// menu.urloutput()  URLを出力する
	// menu.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(this.popel){
			this.popclose();

			var pzl = pzprv3.parseURLType(document.urlinput.ta.value);
			if(!!pzl.id){ this.targetpuzzle.importBoardData(pzl);}
		}
	},
	urloutput : function(e){
		if(this.popel){
			var _doc = document, enc = this.targetpuzzle.enc;
			switch((e.target||e.srcElement).name){
				case "pzprv3":     _doc.urloutput.ta.value = enc.pzloutput(k.PZPRV3);  break;
				case "pzprapplet": _doc.urloutput.ta.value = enc.pzloutput(k.PZPRAPP); break;
				case "kanpen":     _doc.urloutput.ta.value = enc.pzloutput(k.KANPEN);  break;
				case "pzprv3edit": _doc.urloutput.ta.value = enc.pzloutput(k.PZPRV3E); break;
				case "heyaapp":    _doc.urloutput.ta.value = enc.pzloutput(k.HEYAAPP); break;
			}
		}
	},
	openurl : function(e){
		if(this.popel){
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
		if(this.popel){ this.popclose();}
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

		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.targetpuzzle.pid);
		this.targetpuzzle.importBoardData({id:pid, fstr:fstr});

		document.fileform.reset();
		pzprv3.timer.reset();
	},

	filesave : function(ftype){
		var puzzle = this.targetpuzzle;
		var fname = prompt("保存するファイル名を入力して下さい。", puzzle.pid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		var _doc = document;
		_doc.fileform2.filename.value = fname;

		if     (navigator.platform.indexOf("Win")!==-1){ _doc.fileform2.platform.value = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ _doc.fileform2.platform.value = "Mac";}
		else                                           { _doc.fileform2.platform.value = "Others";}

		_doc.fileform2.ques.value   = puzzle.fio.fileencode(ftype);
		_doc.fileform2.urlstr.value = puzzle.fio.history;
		_doc.fileform2.operation.value = 'save';

		_doc.fileform2.action = this.fileio
		_doc.fileform2.submit();
	},

	//------------------------------------------------------------------------------
	// menu.duplicate() 盤面の複製を行う => 受取はCoreClass.jsのimportFileData()
	//------------------------------------------------------------------------------
	duplicate : function(){
		var puzzle = this.targetpuzzle, fio = puzzle.fio;
		var str = fio.fileencode(k.PZPH);
		var url = './p.html?'+puzzle.pid+(pzprv3.PLAYER?"_play":"");
		if(!pzprv3.browser.Opera){
			var old = sessionStorage['filedata'];
			sessionStorage['filedata'] = (str+fio.history);
			window.open(url,'');
			if(!!old){ sessionStorage['filedata'] = old;}
			else     { delete sessionStorage['filedata'];}
		}
		else{
			localStorage['pzprv3_filedata'] = (str+fio.history);
			window.open(url,'');
		}
	},

	//------------------------------------------------------------------------------
	// menu.imagesave()   画像を保存する
	// menu.submitimage() "画像をダウンロード"の処理ルーチン
	// menu.openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	imagesave : function(isDL,cellsize){
		var puzzle = this.targetpuzzle, canvas_sv = puzzle.canvas;
		try{
			puzzle.canvas = getEL('divques_sub');
			var pc = puzzle.painter, pc2 = puzzle.newInstance('Graphic');

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
		puzzle.canvas = canvas_sv;
	},

	submitimage : function(url){
		var _doc = document;
		_doc.fileform2.filename.value  = this.targetpuzzle.pid+'.png';
		_doc.fileform2.urlstr.value    = url.replace('data:image/png;base64,', '');
		_doc.fileform2.operation.value = 'imagesave';

		_doc.fileform2.action = this.fileio
		_doc.fileform2.submit();
	},
	openimage : function(url){
		if(!pzprv3.browser.IE9){
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

	//---------------------------------------------------------------------------
	// menu.database_handler() データベースmanagerへ処理を渡します
	//---------------------------------------------------------------------------
	database_handler : function(e){
		if(this.popel){
			var operation = (e.target||e.srcElement).name;
			pzprv3.dbm.clickHandler(operation, this.targetpuzzle);
		}
	},

	//------------------------------------------------------------------------------
	// menu.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(this.popel){
			var pc = this.targetpuzzle.painter;
			var csize = parseInt(document.dispsize.cs.value);
			if(csize>0){ pc.cellsize = (csize|0);}

			this.popclose();
			pc.forceRedraw();	// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.dispman()    管理領域を隠す/表示するが押された時に動作する
	// menu.dispmanstr() 管理領域を隠す/表示するにどの文字列を表示するか
	//------------------------------------------------------------------------------
	dispman : function(e){
		var idlist = ['usepanel','checkpanel'];
		var seplist = pzprv3.EDITOR ? [] : ['separator2'];

		var mandisp  = (this.displaymanage ? 'none' : 'block');
		var btn2disp = (this.displaymanage ? 'inline' : 'none');
		var mbpad = (this.displaymanage ? '0pt' : '8pt');

		for(var i=0;i<idlist.length;i++) { getEL(idlist[i]) .style.display = mandisp;}
		for(var i=0;i<seplist.length;i++){ getEL(seplist[i]).style.display = mandisp;}
		if(this.targetpuzzle.config.flag_irowake){ getEL('btncolor2').style.display = btn2disp;}
		getEL('menuboard').style.paddingBottom = mbpad;

		this.displaymanage = !this.displaymanage;
		this.dispmanstr();

		this.targetpuzzle.painter.forceRedraw();	// canvasの左上座標等を更新して再描画
	},
	dispmanstr : function(){
		if(!this.displaymanage){ getEL('ms_manarea').innerHTML = this.selectStr("管理領域を表示","Show management area");}
		else                   { getEL('ms_manarea').innerHTML = this.selectStr("管理領域を隠す","Hide management area");}
	},

	//------------------------------------------------------------------------------
	// menu.popupadjust()  "盤面の調整""回転・反転"でボタンが押された時に実行条件をチェック
	//------------------------------------------------------------------------------
	popupadjust : function(e){
		if(this.popel){
			this.targetpuzzle.board.execadjust((e.target||e.srcElement).name);
		}
	},

	//------------------------------------------------------------------------------
	// menu.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(this.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			var o = this.targetpuzzle;
			o.opemgr.newOperation(true);

			o.board.ansclear();
			o.board.resetInfo();
			o.painter.paintAll();
		}
	},
	ASconfirm : function(){
		if(this.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
			var o = this.targetpuzzle;
			o.opemgr.newOperation(true);

			o.board.subclear();
			o.painter.paintAll();
		}
	}
});

// MenuListクラス
pzprv3.createCoreClass('MenuList',
{
	initialize : function(){
		this.reset();
	},

	flags    : [],	// サブメニュー項目の情報(オブジェクトの配列になる)
	flaglist : [],	// idnameの配列

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
		this.flags    = [];
		this.flaglist = [];
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
	// pp.addFlagOnly()  情報のみを登録する
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

	addCheck : function(idname, parent, first, strJP, strEN){
		this.addFlags(idname, parent, this.CHECK, first, strJP, strEN);
	},
	addSelect : function(idname, parent, first, child, strJP, strEN){
		this.addFlags(idname, parent, this.SELECT, first, strJP, strEN);
		this.flags[idname].child = child;
	},
	addChild : function(idname, parent, strJP, strEN){
		var list = idname.split("_");
		this.addFlags(idname, list[0], this.CHILD, list[1], strJP, strEN);
	},

	addFlagOnly : function(idname, first){
		this.addFlags(idname, '', '', first, '', '');
	},

	//---------------------------------------------------------------------------
	// pp.addFlags()  上記関数の内部共通処理
	// pp.setLabel()  管理領域に表記するラベル文字列を設定する
	//---------------------------------------------------------------------------
	addFlags : function(idname, parent, type, first, strJP, strEN){
		this.flags[idname] = {
			id     : idname,
			type   : type,
			val    : first,
			parent : parent,
			str : {
				ja : { menu:strJP, label:''},
				en : { menu:strEN, label:''}
			}
		};
		this.flaglist.push(idname);
	},

	setLabel : function(idname, strJP, strEN){
		if(!this.flags[idname]){ return;}
		this.flags[idname].str.ja.label = strJP;
		this.flags[idname].str.en.label = strEN;
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を返す
	// pp.getLabel()   管理パネルとチェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	// pp.haschild()   サブメニューがあるかどうか調べる
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.flags[idname].str[pzprv3.ui.language].menu; },
	getLabel   : function(idname){ return this.flags[idname].str[pzprv3.ui.language].label;},
	type       : function(idname){ return this.flags[idname].type;},
	haschild   : function(idname){
		var flag = this.flags[idname];
		if(!flag){ return false;}
		var type = flag.type;
		return (type===this.SELECT || type===this.SPARENT || type===this.SPARENT2);
	}
});

// MenuItemクラス
pzprv3.createCoreClass('MenuItem',
{
	initialize : function(){
	}
});

var _doc = document;
function getEL(id){ return _doc.getElementById(id);}

})();
