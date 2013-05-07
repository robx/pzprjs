// Menu.js v3.4.0
(function(){

/* uiオブジェクト生成待ち */
if(!ui){ setTimeout(setTimeout(arguments.callee),15); return;}

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
var Menu = function(){
	this.items = null;

	this.menupid = '';				// どの種類のパズルのメニューを表示しているか

	this.menuconfig = {};

	this.dispfloat  = [];			// 現在表示しているフロートメニューウィンドウ(オブジェクト)
	this.floatpanel = [];			// (2段目含む)フロートメニューオブジェクトのリスト

	this.btnstack   = [];			// ボタンの情報(idnameと文字列のリスト)

	this.ispencilbox = false;

	this.displaymanage = true;		// メニューの下の管理領域を表示しているか

	this.reader;	// FileReaderオブジェクト

	this.enableSaveImage = false; // 画像保存が有効か

	this.fileio = (document.domain==='indi.s58.xrea.com'?"fileio.xcg":"fileio.cgi");
	this.enableReadText = false;
};
Menu.prototype =
{
	init : function(){
		this.initMenuConfig();
		
		this.items = new MenuList();
	},
	
	//---------------------------------------------------------------------------
	// menu.menuinit()   メニュー、サブメニュー、フロートメニュー、ボタン、
	//                   管理領域、ポップアップメニューの初期設定を行う
	// menu.menureset()  メニュー用の設定を消去する
	//---------------------------------------------------------------------------
	menuinit : function(){
		var pid = ui.puzzle.pid;
		
		if(ui.menu.menupid === pid){ return;}	/* パズルの種類が同じなら初期設定必要なし */
		
		this.menureset();
		
		var pinfo = pzprurl.info[pid];
		this.ispencilbox = (pinfo.exists.kanpen && (pid!=="nanro" && pid!=="ayeheya" && pid!=="kurochute"));

		this.items.reset();

		this.initReader();

		if(!!getEL("divques_sub").getContext && !!document.createElement('canvas').toDataURL){
			this.enableSaveImage = true;
		}

		if(pzprv3.browser.IE6){
			this.modifyCSS('menu.floatmenu li.smenusep', {lineHeight :'2pt', display:'inline'});
		}

		ui.keypopup.create();

		this.menuarea();
		this.managearea();
		this.buttonarea();

		this.displayAll();

		ui.event.setUIEvents();				/* イベントをくっつける */

		ui.puzzle.key.uievent    = ui.menu.key_common;
		ui.puzzle.mouse.uievent  = ui.menu.mouse_common;
		ui.puzzle.config.uievent = ui.menu.config_common;

		this.menupid = pid;
	},

	menureset : function(){
		this.dispfloat  = [];
		this.floatpanel = [];
		this.btnstack   = [];
		this.managestack = [];

		this.floatmenuclose(0);

		getEL('float_parent').innerHTML = '';

		getEL('btnarea').innerHTML = '';

		getEL('menupanel') .innerHTML = '';
		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';

		ui.keypopup.clear();

		if(!!ui.popupmgr){ ui.popupmgr.reset();}
		
		ui.event.removeUIEvents();
	},

	//---------------------------------------------------------------------------
	// menu.key_common()  キー入力時に呼び出される関数
	//---------------------------------------------------------------------------
	key_common : function(c){
		/* this === ui.puzzle.key になります */
		var o = this.owner, result = false;
		if(this.keydown){
			/* TimerでUndo/Redoする */
			if(c==='z' && (this.isCTRL || this.isMETA)){ ui.undotimer.startUndo(); result = true;}
			if(c==='y' && (this.isCTRL || this.isMETA)){ ui.undotimer.startRedo(); result = true;}

			/* F2で回答モード Shift+F2で問題作成モード */
			if(c==='F2' && pzprv3.EDITOR){
				if     (o.editmode && !this.isSHIFT){ o.setConfig('mode',3); result = true;}
				else if(o.playmode &&  this.isSHIFT){ o.setConfig('mode',1); result = true;}
			}

			/* デバッグ用ルーチンを通す */
			if(ui.debug.keydown(c)){ result = true;}
		}
		else if(this.keyup){
			/* TimerのUndo/Redoを停止する */
			if(c==='z' && (this.isCTRL || this.isMETA)){ ui.undotimer.stop(); result = true;}
			if(c==='y' && (this.isCTRL || this.isMETA)){ ui.undotimer.stop(); result = true;}
		}
		return result;
	},
	mouse_common : function(){
		/* this === ui.puzzle.mouse になります */
		if(this.mousestart && this.btn.Middle){ /* 中ボタン */
			if(pzprv3.EDITOR){
				this.owner.setConfig('mode', (this.owner.playmode?1:3));
			}
			this.mousereset();
			return true;
		}
		return false;
	},
	config_common : function(idname, newval){
		/* this === ui.puzzle.config になります */
		ui.menu.setcaption(idname);
		ui.menu.menuexec(idname, newval);
	},

	//---------------------------------------------------------------------------
	// initReader() File Reader (あれば)の初期化処理
	//---------------------------------------------------------------------------
	initReader : function(){
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
			this.reader.onload = function(e){
				ui.openFileData(e.target.result);
			};
		}
	},

	//---------------------------------------------------------------------------
	// menu.addButtons() ボタンの情報を変数に登録する
	//---------------------------------------------------------------------------
	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		pzprv3.unselectable(el);
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// menu.displayAll() 全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// menu.setdisplay() 管理パネルとサブメニューに表示する文字列を個別に設定する
	// menu.setcaption() 設定変更された場合にメニューなどのデータを作り直す
	//---------------------------------------------------------------------------
	displayAll : function(){
		for(var i in this.items.item){ this.setdisplay(i);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			if(!this.btnstack[i].el){ continue;}
			this.btnstack[i].el.value = this.btnstack[i].str[ui.puzzle.getConfig('language')];
		}
		this.enb_btn();
		this.displayManage();
		this.displayDesign();

		ui.puzzle.refreshCanvas();	// canvasの左上座標等を更新して再描画
	},
	setdisplay : function(idname){
		var pp = this.items;
		switch(pp.type(idname)){
		case pp.MENU:
			/* メニューの表記の設定 */
			var pmenu = getEL('ms_'+idname);
			if(!!pmenu){ pmenu.innerHTML = "["+pp.getMenuStr(idname)+"]";}
			break;

		case pp.SMENU: case pp.LABEL: case pp.SPARENT: case pp.SPARENT2:
			/* メニューの表記の設定 */
			var smenu = getEL('ms_'+idname);
			if(!!smenu){ smenu.innerHTML = pp.getMenuStr(idname);}
			break;

		case pp.SELECT:
			/* メニューの表記の設定 */
			var smenu = getEL('ms_'+idname);
			if(!!smenu){ smenu.innerHTML = "&nbsp;"+pp.getMenuStr(idname);}	// メニュー上の表記の設定
			/* 管理領域の表記の設定 */
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = pp.getLabel(idname);}
			
			/* 子要素の設定も行う */
			for(var i=0,len=pp.item[idname].child.length;i<len;i++){
				this.setdisplay(""+idname+"_"+pp.item[idname].child[i]);
			}
			break;

		case pp.CHILD:
			var val = ui.puzzle.getConfig(pp.item[idname].parent);
			if(val===null){ val = this.getMenuConfig(pp.item[idname].parent);}
			
			var issel = (pp.item[idname].val == val);	/* 選択されているかどうか */
			
			/* メニューの表記の設定 */
			var smenu = getEL('ms_'+idname);
			if(!!smenu){
				smenu.innerHTML = (issel?"+":"&nbsp;")+pp.getMenuStr(idname);
			}
			/* 管理領域の表記の設定 */
			var manage = getEL('up_'+idname);
			if(!!manage){
				manage.innerHTML = pp.getMenuStr(idname);
				manage.className = (issel?"childsel":"child");
			}
			break;

		case pp.CHECK:
			var flag = ui.puzzle.getConfig(idname);
			if(flag===null){ flag = this.getMenuConfig(idname);}
			
			/* メニューの表記の設定 */
			var smenu = getEL('ms_'+idname);
			if(!!smenu){ smenu.innerHTML = (flag?"+":"&nbsp;")+pp.getMenuStr(idname);}
			/* 管理領域(チェックボックス)の表記の設定 */
			var check = getEL('ck_'+idname);
			if(!!check){ check.checked = flag;}
			/* 管理領域(ラベル)の表記の設定 */
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = pp.getLabel(idname);}
			break;
		}

		if(idname==='manarea'){
			if(!this.displaymanage){ str = this.selectStr("管理領域を表示","Show management area");}
			else                   { str = this.selectStr("管理領域を隠す","Hide management area");}
			getEL('ms_manarea').innerHTML = str;
		}
		
		if(idname==='keypopup'){
			var kp = ui.keypopup;
			if(kp.paneltype[1]!==0 || kp.paneltype[3]!==0){
				var f = !!kp.paneltype[ui.puzzle.getConfig('mode')];
				getEL('ck_keypopup').disabled    = (f?"":"true");
				getEL('cl_keypopup').style.color = (f?"black":"silver");
			}
		}
		
		if(idname==='bgcolor'){
			if(ui.puzzle.flags.bgcolor){
				var mode = ui.puzzle.getConfig('mode');
				getEL('ck_bgcolor').disabled    = (mode==3?"":"true");
				getEL('cl_bgcolor').style.color = (mode==3?"black":"silver");
			}
		}
		
		if(idname==='disptype_pipelinkr'){
			getEL('btncircle').value = ((ui.puzzle.getConfig(idname)==1)?"○":"■");
		}
	},
	setcaption : function(idname){
		var pp = this.items;
		if(!!pp && !!pp.item[idname]){ this.setdisplay(idname);}
	},

	//---------------------------------------------------------------------------
	// menu.displayManage()  管理領域の表示するかしないか設定する
	// menu.displayDesign()  背景画像とかtitle・背景画像・html表示の設定
	// menu.bgimage()        背景画像を返す
	//---------------------------------------------------------------------------
	displayManage : function(e){
		var mandisp  = (this.displaymanage ? 'block' : 'none');

		getEL('usepanel').style.display = mandisp;
		getEL('checkpanel').style.display = mandisp;
		if(!pzprv3.EDITOR){ getEL('separator2').style.display = mandisp;}

		if(ui.puzzle.flags.irowake){
			/* ボタンエリアのボタンは、管理領域が消えている時に表示 */
			getEL('btncolor2').style.display = (this.displaymanage ? 'none' : 'inline');
		}
		getEL('menuboard').style.paddingBottom = (this.displaymanage ? '8pt' : '0pt');
	},
	displayDesign : function(){
		var pid = ui.puzzle.pid;
		var pinfo = pzprurl.info[pid];
		var title = this.selectStr(pinfo.ja, pinfo.en);
		if(pzprv3.EDITOR){ title += this.selectStr(" エディタ - ぱずぷれv3"," editor - PUZ-PRE v3");}
		else			 { title += this.selectStr(" player - ぱずぷれv3"  ," player - PUZ-PRE v3");}

		document.title = title;
		getEL('title2').innerHTML = title;

		var imageurl = this.bgimage(pid);
		if(!imageurl){ imageurl="./bg/"+pid+".gif";}
		document.body.style.backgroundImage = "url("+imageurl+")";
		if(pzprv3.browser.IE6){
			getEL('title2').style.marginTop = "24px";
			getEL('separator2').style.margin = '0pt';
		}
	},
	bgimage : function(pid){
		return toBGimage(pid);
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
			sl = function(){ pp.setLabel.apply(pp,arguments);};
		var pid = ui.puzzle.pid;

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
		if(!ui.puzzle.flags.disable_subclear){
			as('subclear', 'board', '補助記号消去', 'Erase auxiliary marks');
		}

		// *表示 ==============================================================
		am('disp', "表示", "Display");

		pp.addMenuSelect('cellsize','disp', '表示サイズ','Cell Size');
		ap('sep_disp1',  'disp');

		if(!!ui.puzzle.flags.irowake){
			ac('irowake','disp', '線の色分け','Color coding');
			sl('irowake', '線の色分けをする', 'Color each lines');
		}
		ac('cursor','disp','カーソルの表示','Display cursor');
		pp.addMenuCheck('adjsize', 'disp', '自動横幅調節', 'Auto Size Adjust');
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
		this.menuarea_setting(pp);		// コンフィグ関連のメニュー追加

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
	menuarea_setting : function(pp){
		var flags = ui.puzzle.flags, pid = ui.puzzle.pid;

		pp.addMenu('setting', "設定", "Setting");

		if(pzprv3.EDITOR){
			pp.addSelect('mode','setting', 'モード', 'mode');
			pp.setLabel('mode','モード', 'mode');
			pp.addChild('mode_1', 'mode', '問題作成モード', 'Edit mode'  );
			pp.addChild('mode_3', 'mode', '回答モード',     'Answer mode');
		}

		/* 操作方法の設定値 */
		if(flags.use){
			pp.addSelect('use','setting','操作方法', 'Input Type');
			pp.setLabel('use', '操作方法', 'Input Type');
			pp.addChild('use_1','use','左右ボタン','LR Button');
			pp.addChild('use_2','use','1ボタン',   'One Button');
		}
		if(pid==='shakashaka'){
			pp.addSelect('use_tri','setting','操作方法', 'Input Type');
			pp.setLabel('use_tri', '三角形の入力方法', 'Input Triangle Type');
			pp.addChild('use_tri_1', 'use_tri', 'クリックした位置', 'Corner-side');
			pp.addChild('use_tri_2', 'use_tri', '引っ張り入力', 'Pull-to-Input');
			pp.addChild('use_tri_3', 'use_tri', '1ボタン', 'One Button');
		}

		/* 盤面チェックの設定値 */
		if(flags.redline){
			pp.addCheck('redline','setting','繋がりチェック','Continuous Check');
			pp.setLabel('redline', '線のつながりをチェックする', 'Check countinuous lines');
		}
		else if(flags.redblk){
			pp.addCheck('redblk','setting','繋がりチェック','Continuous Check');
			pp.setLabel('redblk', '黒マスのつながりをチェックする', 'Check countinuous black cells');
		}
		else if(flags.redblkrb){
			pp.addCheck('redblkrb','setting','繋がりチェック','Continuous Check');
			pp.setLabel('redblkrb', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous black cells with its corner');
		}
		else if(pid==='roma'){
			pp.addCheck('redroad','setting','通り道のチェック', 'Check Road');
			pp.setLabel('redroad', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');
		}

		/* 背景色入力の設定値 */
		if(flags.bgcolor){
			pp.addCheck('bgcolor','setting', '背景色入力', 'Background-color');
			pp.setLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');
		}

		/* 文字別正解表示の設定値 */
		if(pid==='hashikake'||pid==='kurotto'){
			pp.addCheck('circolor','setting','数字をグレーにする','Set Grey Color');
			pp.setLabel('circolor', '正しい数字をグレーにする', 'Grey if the number is correct.');
		}
		else if(pid==='kouchoku'){
			pp.addCheck('circolor','setting','点をグレーにする','Set Grey Color');
			pp.setLabel('circolor', '線が2本以上になったら点をグレーにする', 'Grey if the letter links over two segments.');
		}

		if(pid==='hitori'){
			pp.addCheck('plred','setting', '重複した数字を表示', 'Show overlapped number');
			pp.setLabel('plred', '重複している数字を赤くする', 'Show overlapped number as red.');
		}

		if(pid==='wagiri'){
			pp.addCheck('colorslash','setting', '斜線の色分け', 'Slash with color');
			pp.setLabel('colorslash', '斜線を輪切りかのどちらかで色分けする(重いと思います)', 'Encolor slashes whether it consists in a loop or not.(Too busy)');
		}

		/* 正当判定方法の設定値 */
		if(pid==='fillomino'){
			pp.addCheck('enbnonum','setting','未入力で正答判定','Allow Empty cell');
			pp.setLabel('enbnonum', '全ての数字が入っていない状態での正答判定を許可する', 'Allow answer check with empty cell in the board.');
		}

		/* 線の引き方の設定値 */
		if(pid==='kouchoku'){
			pp.addCheck('enline','setting','線は点の間','Line between points');
			pp.setLabel('enline', '点の間のみ線を引けるようにする', 'Able to draw line only between the points.');

			pp.addCheck('lattice','setting','格子点チェック','Check lattice point');
			pp.setLabel('lattice', '点を通過する線を引けないようにする', 'Disable drawing segment passing over a lattice point.');
		}

		/* 問題形式の設定値 */
		if(pid==='mashu'){
			pp.addCheck('uramashu','setting', '裏ましゅ', 'Ura-Mashu');
			pp.setLabel('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');
		}

		/* 盤面表示形式の設定値 */
		if(pid==='pipelinkr'){
			pp.addSelect('disptype_pipelinkr','setting','表示形式','Display');
			pp.addChild('disptype_pipelinkr_1', 'disptype_pipelinkr', '○', 'Circle');
			pp.addChild('disptype_pipelinkr_2', 'disptype_pipelinkr', '■', 'Icebarn');
		}
		if(pid==='bosanowa'){
			pp.addSelect('disptype_bosanowa','setting','表示形式','Display');
			pp.setLabel('disptype_bosanowa', '表示形式', 'Display');
			pp.addChild('disptype_bosanowa_1', 'disptype_bosanowa', 'ニコリ紙面形式', 'Original Type');
			pp.addChild('disptype_bosanowa_2', 'disptype_bosanowa', '倉庫番形式',     'Sokoban Type');
			pp.addChild('disptype_bosanowa_3', 'disptype_bosanowa', 'ワリタイ形式',   'Waritai type');
		}

		if(pid==='snakes'){
			pp.addCheck('snakebd','setting','へび境界線有効','Enable snake border');
			pp.setLabel('snakebd', 'へびの周りに境界線を表示する', 'Draw border around a snake.');
		}

		/* EDITOR時の設定値 */
		if(pzprv3.EDITOR && pid==='goishi'){
			pp.addCheck('bdpadding','setting', '空隙つきURL', 'URL with Padding');
			pp.setLabel('bdpadding', 'URL生成時に周り1マス何もない部分をつける', 'Add Padding around the Board in outputting URL.');
		}
		if(pzprv3.EDITOR && pid==='tentaisho'){
			pp.addCheck('discolor','setting','色分け無効化','Disable color');
			pp.setLabel('discolor', '星クリックによる色分けを無効化する', 'Disable Coloring up by clicking star');
		}

		/* 共通設定値 */
		pp.addCheck('autocheck','setting', '正答自動判定', 'Auto Answer Check');

		pp.addCheck('lrcheck',  'setting', 'マウス左右反転', 'Mouse button inversion');
		pp.setLabel('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');

		if(ui.keypopup.paneltype[1]!==0 || ui.keypopup.paneltype[3]!==0){
			pp.addMenuCheck('keypopup', 'setting', 'パネル入力', 'Panel inputting');
			pp.setLabel('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');
		}

		pp.addSelect('language', 'setting', '言語', 'Language');
		pp.addChild('language_ja', 'language', '日本語',  '日本語');
		pp.addChild('language_en', 'language', 'English', 'English');
	},

	//---------------------------------------------------------------------------
	// menu.createAllFloat() 登録されたサブメニューから全てのフロートメニューを作成する
	//---------------------------------------------------------------------------
	createAllFloat : function(){
		var pp = this.items;

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
				pzprv3.getEL('menupanel').appendChild(smenu);
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
				pzprv3.getEL('float_parent').appendChild(panel);
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
		if(pzprv3.PLAYER){
			getEL('ms_newboard') .className = 'smenunull';
			getEL('ms_urloutput').className = 'smenunull';
			getEL('ms_adjust')   .className = 'smenunull';
		}
		getEL('ms_jumpv3')  .style.fontSize = '0.9em'; getEL('ms_jumpv3')  .style.paddingLeft = '8pt';
		getEL('ms_jumptop') .style.fontSize = '0.9em'; getEL('ms_jumptop') .style.paddingLeft = '8pt';
		getEL('ms_jumpblog').style.fontSize = '0.9em'; getEL('ms_jumpblog').style.paddingLeft = '8pt';

		if(this.enableSaveImage && !!ui.puzzle.classes.ImageTile){
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
	// menu.submenuexec(e)  通常サブメニューがクリックされたときの動作を実行する
	//---------------------------------------------------------------------------
	submenuclick : function(e){
		var el = (e.target||e.srcElement);
		if(!!el && el.className==="smenu"){
			this.floatmenuclose(0);

			var idname = el.id.substr(3), val, pp = this.items, menutype = pp.type(idname);
			if(menutype===pp.SMENU){ this.submenuexec(e, idname);}
			else if(menutype===pp.CHILD || menutype===pp.CHECK){
				if(menutype===pp.CHILD){
					val    = pp.item[idname].val;
					idname = pp.item[idname].parent;
				}
				
				if(!!this.menuconfig[idname]){
					if(menutype===pp.CHECK){ val = !this.getMenuConfig(idname);}
					this.setMenuConfig(idname, val);
				}
				else{
					if(menutype===pp.CHECK){ val = !ui.puzzle.getConfig(idname);}
					ui.puzzle.setConfig(idname, val);
				}
			}
		}
	},
	submenuexec : function(e, idname){
		var result = (this.menuexec(idname) || ui.puzzle.config.onchange_event(idname,null));
		if(!result){
			var pos = pzprv3.getPagePos(e);
			ui.popupmgr.open(idname, pos.px-8, pos.py-8);
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
				_float.style.left = pzprv3.pageX(e)  + 'px';
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
		var pos = pzprv3.getPagePos(e);
		var rect = pzprv3.getRect(el);
		return (pos.px>=rect.left && pos.px<=rect.right && pos.py>=rect.top && pos.py<=rect.bottom);
	},
	insideOfMenu : function(e){
		var pos = pzprv3.getPagePos(e);
		var rect_f = pzprv3.getRect(getEL('ms_file')), rect_o = pzprv3.getRect(getEL('ms_other'));
		return (pos.px>= rect_f.bottom || (pos.px>=rect_f.left && pos.py<=rect_o.right && pos.py>=rect_f.top));
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
		for(var idname in pp.item){
			if(!pp.getLabel(idname)){ continue;}
			var _div = el_div.cloneNode(false);
			_div.id = 'div_'+idname;
			//_div.innerHTML = "";

			switch(pp.type(idname)){
			case pp.SELECT:
				var span = el_span.cloneNode(false);
				span.id = 'cl_'+idname;
				_div.appendChild(span);
				_div.appendChild(document.createTextNode(" | "));
				for(var i=0;i<pp.item[idname].child.length;i++){
					var num = pp.item[idname].child[i];
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
		if(ui.puzzle.flags.irowake){
			// 横にくっつけたいボタンを追加
			var el = createButton();
			el.id = "ck_btn_irowake";
			this.addButtons(el, function(){ ui.puzzle.irowake();}, "色分けしなおす", "Change the color of Line");
			var node = getEL('cl_irowake');
			node.parentNode.insertBefore(el, node.nextSibling);

			// 色分けのやつを一番下に持ってくる
			var el = getEL('checkpanel').removeChild(getEL('div_irowake'));
			getEL('checkpanel').appendChild(el);
		}

		// 管理領域の表示/非表示設定
		if(pzprv3.EDITOR){
			getEL('timerpanel').style.display = 'none';
			getEL('separator2').style.display = 'none';
		}
	},

	checkclick : function(e){
		var el = (e.target||e.srcElement);
		var idname = el.id.substr(3);
		if(!!this.menuconfig[idname]){
			this.setMenuConfig(idname, !!el.checked);
		}
		else{
			ui.puzzle.setConfig(idname, !!el.checked);
		}
	},
	selectclick : function(e){
		var list = (e.target||e.srcElement).id.split('_');
		list.shift();
		var child = list.pop(), idname = list.join("_");
		if(!!this.menuconfig[idname]){
			this.setMenuConfig(idname, child);
		}
		else{
			ui.puzzle.setConfig(idname, child);
		}
	},

	//---------------------------------------------------------------------------
	// menu.buttonarea()   盤面下のボタンエリアの初期化を行う
	// menu.toggledisp()   アイスと○などの表示切り替え時の処理を行う
	// menu.enb_btn()      html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	buttonarea : function(){
		// (Canvas下) ボタンの初期設定
		var btncheck = createButton(); btncheck.id = "btncheck";
		var btnundo  = createButton(); btnundo.id  = "btnundo";
		var btnredo  = createButton(); btnredo.id  = "btnredo";
		var btnclear = createButton(); btnclear.id = "btnclear";

		getEL('btnarea').appendChild(btncheck);
		getEL('btnarea').appendChild(document.createTextNode(' '));
		getEL('btnarea').appendChild(btnundo);
		getEL('btnarea').appendChild(btnredo);
		getEL('btnarea').appendChild(document.createTextNode(' '));
		getEL('btnarea').appendChild(btnclear);

		var self = this;
		this.addButtons(btncheck, function(){ self.answercheck();}, "チェック", "Check");
		this.addButtons(btnundo,  function(){ ui.puzzle.opemgr.undo(); self.enb_btn();}, "戻", "<-");
		this.addButtons(btnredo,  function(){ ui.puzzle.opemgr.redo(); self.enb_btn();}, "進", "->");
		this.addButtons(btnclear, function(){ self.ACconfirm();}, "回答消去", "Erase Answer");

		// 初期値ではどっちも押せない
		getEL('btnundo').disabled = true;
		getEL('btnredo').disabled = true;

		if(!ui.puzzle.flags.disable_subclear){
			var el = createButton(); el.id = "btnclear2";
			getEL('btnarea').appendChild(el);
			this.addButtons(el, function(){ self.ASconfirm();}, "補助消去", "Erase Auxiliary Marks");
		}

		if(!!ui.puzzle.flags.irowake){
			var el = createButton(); el.id = "btncolor2";
			getEL('btnarea').appendChild(el);
			this.addButtons(el, function(){ ui.puzzle.irowake();}, "色分けしなおす", "Change the color of Line");
			el.style.display = 'none';
		}

		if(ui.puzzle.pid==='pipelinkr'){
			var el = createButton(); el.id = 'btncircle';
			pzprv3.unselectable(el);
			el.onclick = function(){ self.toggledisp();};
			getEL('btnarea').appendChild(el);
		}

		if(ui.puzzle.pid==='tentaisho'){
			var el = createButton(); el.id = 'btncolor';
			getEL('btnarea').appendChild(el);
			this.addButtons(el, function(){ puzzle.board.encolorall();}, "色をつける","Color up");
		}
	},
	toggledisp : function(){
		var current = ui.puzzle.getConfig('disptype_pipelinkr');
		ui.puzzle.setConfig('disptype_pipelinkr', (current==1?2:1));
	},
	enb_btn : function(){
		var opemgr = ui.puzzle.opemgr;
		getEL('btnundo').disabled = (!opemgr.enableUndo ? 'disabled' : '');
		getEL('btnredo').disabled = (!opemgr.enableRedo ? 'disabled' : '');

		getEL('ms_h_oldest').className = (opemgr.enableUndo ? 'smenu' : 'smenunull');
		getEL('ms_h_undo').className   = (opemgr.enableUndo ? 'smenu' : 'smenunull');
		getEL('ms_h_redo').className   = (opemgr.enableRedo ? 'smenu' : 'smenunull');
		getEL('ms_h_latest').className = (opemgr.enableRedo ? 'smenu' : 'smenunull');
	},

	//---------------------------------------------------------------------------
	// menu.initMenuConfig()  盤面下のボタンエリアの初期化を行う
	// menu.setMenuConfig()   アイスと○などの表示切り替え時の処理を行う
	// menu.getMenuConfig()   html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	initMenuConfig : function(){
		this.menuconfig = {};

		/* キーポップアップ */
		this.menuconfig.keypopup = {val:false};	/* 数字などのパネル入力 */

		/* 自動横幅調節 */
		this.menuconfig.adjsize = {val:true};

		/* 表示サイズ */
		this.menuconfig.cellsize = {val:2, option:[0,1,2,3,4]};

		/* テキストのサイズ */
		this.menuconfig.textsize = {val:(!pzprv3.OS.mobile?0:2), option:[0,1,2,3]};
		this.settextsize(this.menuconfig.textsize.val);
	},
	setMenuConfig : function(idname, newval){
		if(!this.menuconfig[idname]){ return;}
		this.menuconfig[idname].val = newval;
		this.setcaption(idname);
		if(idname==='keypopup'){
			ui.keypopup.display();
		}
		else if(idname==='adjsize'){
			ui.puzzle.refreshCanvas();
		}
		else if(idname==='cellsize'){
			ui.event.adjustcellsize();
			ui.puzzle.refreshCanvas();	/* pageX/Yの位置がずれる */
		}
		else if(idname==='textsize'){
			this.settextsize(newval);
			ui.puzzle.refreshCanvas();	/* pageX/Yの位置がずれる */
		}
	},
	getMenuConfig : function(idname){
		return (!!this.menuconfig[idname]?this.menuconfig[idname].val:null);
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.settextsize() テキストのサイズを設定する
	// menu.modifyCSS()   スタイルシートの中身を変更する
	//--------------------------------------------------------------------------------
	settextsize : function(num){
		this.modifyCSS({'.outofboard':{
			fontSize:['1.0em','1.5em','2.0em','3.0em'][num],
			lineHeight:['1.2','1.1','1.1','1.1'][num]
		} });
	},
	modifyCSS : function(input){
		var sheet = document.styleSheets[0];
		var rules = (!!sheet.cssRules ? sheet.cssRules : sheet.rules);
		if(!rules){ return;} /* Chrome6の挙動がおかしいのでエラー回避用 */
		var modified = this.modifyCSS_sub(rules, input);
		if(!modified){
			var sel = ''; for(sel in input){ break;}
			if(!!sheet.insertRule)  { sheet.insertRule(""+sel+" {}", rules.length);}
			else if(!!sheet.addRule){ sheet.addRule(sel, "");}
			rules = (!!sheet.cssRules ? sheet.cssRules : sheet.rules);
			this.modifyCSS_sub(rules, input);
		}
	},
	modifyCSS_sub : function(rules, input){
		var modified = false;
		for(var i=0,len=rules.length;i<len;i++){
			var rule = rules[i];
			if(!rule.selectorText){ continue;}
			var pps = input[rule.selectorText];
			if(!!pps){
				for(var p in pps){ rule.style[p]=pps[p];}
				modified = true;
			}
		}
		return modified;
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.selectStr()  現在の言語に応じた文字列を返す
	// menu.alertStr()   現在の言語に応じたダイアログを表示する
	// menu.confirmStr() 現在の言語に応じた選択ダイアログを表示し、結果を返す
	//--------------------------------------------------------------------------------
	selectStr : function(strJP, strEN){
		return (ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	alertStr : function(strJP, strEN){
		alert(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},
	confirmStr : function(strJP, strEN){
		return confirm(ui.puzzle.getConfig('language')==='ja' ? strJP : strEN);
	},

//--------------------------------------------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	menuexec : function(idname, val){
		if(!ui.puzzle.ready){ return true;}
		
		var result = true;
		switch(idname){
		case 'filesave'  : this.filesave(k.FILE_PZPR); break;
//		case 'filesave3' : this.filesave(k.FILE_PZPH); break;
		case 'filesave2' : if(!!ui.puzzle.fio.kanpenSave){ this.filesave(k.FILE_PBOX);} break;
		case 'imagedl'   : this.imagesave(true,null); break;
		case 'imagesave' : this.imagesave(false,null); break;
		
		case 'h_oldest'  : ui.puzzle.undoall(); this.enb_btn(); break;
		case 'h_undo'    : ui.puzzle.undo();    this.enb_btn(); break;
		case 'h_redo'    : ui.puzzle.redo();    this.enb_btn(); break;
		case 'h_latest'  : ui.puzzle.redoall(); this.enb_btn(); break;
		case 'check'     : this.answercheck(); break;
		case 'ansclear'  : this.ACconfirm(); break;
		case 'subclear'  : this.ASconfirm(); break;
		case 'duplicate' : this.duplicate(); break;
		
		case 'manarea'   : this.displaymanage = !this.displaymanage; this.displayAll(); break;
		case 'repaint'   : ui.puzzle.refreshCanvas(); break;
		
		case 'jumpexp'   : window.open('./faq.html?'+ui.puzzle.pid+(pzprv3.EDITOR?"_edit":""), ''); break;
		case 'jumpv3'    : window.open('./', '', ''); break;
		case 'jumptop'   : window.open('../../', '', ''); break;
		case 'jumpblog'  : window.open('http://d.hatena.ne.jp/sunanekoroom/', '', ''); break;
		
		case 'language'  : this.displayAll(); break;
		
		case 'mode':
			this.setcaption('keypopup');
			this.setcaption('bgcolor');
			break;
		
		default:
			result = false;
			break;
		}
		return result;
	},

//--------------------------------------------------------------------------------------------------------------

	//------------------------------------------------------------------------------
	// menu.filesave()   ファイルを保存する
	//------------------------------------------------------------------------------
	filesave : function(ftype){
		var fname = prompt("保存するファイル名を入力して下さい。", ui.puzzle.pid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		var form = document.fileform2;
		form.filename.value = fname;

		if     (navigator.platform.indexOf("Win")!==-1){ form.platform.value = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ form.platform.value = "Mac";}
		else                                           { form.platform.value = "Others";}

		form.ques.value   = ui.puzzle.getFileData(ftype);
		form.urlstr.value = "";
		form.operation.value = 'save';

		form.action = this.fileio
		form.submit();
	},

	//------------------------------------------------------------------------------
	// menu.duplicate() 盤面の複製を行う => 受取はCoreClass.jsのimportFileData()
	//------------------------------------------------------------------------------
	duplicate : function(){
		var filestr = ui.puzzle.getFileData(k.FILE_PZPH);
		var url = './p.html?'+ui.puzzle.pid+(pzprv3.PLAYER?"_play":"");
		if(!pzprv3.browser.Opera){
			var old = sessionStorage['filedata'];
			sessionStorage['filedata'] = filestr;
			window.open(url,'');
			if(!!old){ sessionStorage['filedata'] = old;}
			else     { delete sessionStorage['filedata'];}
		}
		else{
			localStorage['pzprv3_filedata'] = filestr;
			window.open(url,'');
		}
	},

	//------------------------------------------------------------------------------
	// menu.imagesave()   画像を保存する
	// menu.submitimage() "画像をダウンロード"の処理ルーチン
	// menu.openimage()   "別ウィンドウで開く"の処理ルーチン
	//------------------------------------------------------------------------------
	imagesave : function(isDL,cellsize){
		var canvas_sv = ui.puzzle.canvas;
		try{
			ui.puzzle.canvas = getEL('divques_sub');
			var pc = ui.puzzle.painter, pc2 = ui.puzzle.newInstance('Graphic');

			// 設定値・変数をcanvas用のものに変更
			pc2.suspendAll();
			pc2.outputImage = true;
			pc2.fillTextEmulate = false;
			pc2.bdmargin = pc.bdmargin_image;

			if(!cellsize){ cellsize = pc.cw;}
			pc2.cw = cellsize;
			pc2.ch = cellsize*(pc.ch/pc.cw);

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
		ui.puzzle.canvas = canvas_sv;
	},

	submitimage : function(url){
		var _doc = document;
		_doc.fileform2.filename.value  = ui.puzzle.pid+'.png';
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

	//------------------------------------------------------------------------------
	// menu.answercheck()「正答判定」ボタンを押したときの処理
	// menu.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	answercheck : function(){
		var failcode = ui.puzzle.anscheck();
		var strs = pzprv3.failcode[failcode];
		this.alertStr(strs[0], strs[1]);
	},
	ACconfirm : function(){
		if(this.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			ui.puzzle.ansclear();
		}
	},
	ASconfirm : function(){
		if(this.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
			ui.puzzle.subclear();
		}
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
		var first = ui.puzzle.config.list[idname].val;
		this.addFlags(idname, parent, this.CHECK, first, strJP, strEN);
	},
	addSelect : function(idname, parent, strJP, strEN){
		var first = ui.puzzle.config.list[idname].val;
		var child = ui.puzzle.config.list[idname].option;
		this.addFlags(idname, parent, this.SELECT, first, strJP, strEN);
		this.item[idname].child = child;
	},
	addChild : function(idname, parent, strJP, strEN){
		var list = idname.split("_"), first = list.pop();
		this.addFlags(idname, parent, this.CHILD, first, strJP, strEN);
	},

	addMenuCheck : function(idname, parent, strJP, strEN){
		var first = ui.menu.menuconfig[idname].val;
		this.addFlags(idname, parent, this.CHECK, first, strJP, strEN);
	},
	addMenuSelect : function(idname, parent, strJP, strEN){
		var first = ui.menu.menuconfig[idname].val;
		var child = ui.menu.menuconfig[idname].option;
		this.addFlags(idname, parent, this.SELECT, first, strJP, strEN);
		this.item[idname].child = child;
	},

	//---------------------------------------------------------------------------
	// pp.addFlags()  上記関数の内部共通処理
	// pp.setLabel()  管理領域に表記するラベル文字列を設定する
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

	setLabel : function(idname, strJP, strEN){
		if(!this.item[idname]){ return;}
		this.item[idname].str.ja.label = strJP;
		this.item[idname].str.en.label = strEN;
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を返す
	// pp.getLabel()   管理パネルとチェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	// pp.haschild()   サブメニューがあるかどうか調べる
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.item[idname].str[ui.puzzle.getConfig('language')].menu; },
	getLabel   : function(idname){ return this.item[idname].str[ui.puzzle.getConfig('language')].label;},
	type       : function(idname){ return this.item[idname].type;},
	haschild   : function(idname){
		var flag = this.item[idname];
		if(!flag){ return false;}
		var type = flag.type;
		return (type===this.SELECT || type===this.SPARENT || type===this.SPARENT2);
	}
};

var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createButton(){
	button = pzprv3.createEL('input');
	button.type = 'button';
	return button;
}

function toBGimage(pid){
	var header;
	var data = {
	/* カラーパレットが2色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
	aho       :['ICAgKCgoC','I4Qdp3vJDxwMtNorV85sQ6RwWhhiZPNF57Q+3udgcjWmLVMAADs='],
	amibo     :['P/AwP///y','HoRjqQvI36AKtNrrolx5Hz+BXjeKX4KlVWmSmyt1BQA7'],
	ayeheya   :['P/ow////y','F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs='],
	bag       :['P+vg///wC','JYRjl4DbmlqYtNr3mFs67g+FYiZd5uSlYjdyJNim56mytv3CeQEAOw=='],
	barns     :['MDAwID//y','JQyCqZa369hTDtg7cYxT+r51zUVyWSMiYbqKJZl65tOCqDHjZQEAOw=='],
	bdblock   :['Dn/pP///y','IoyPqQHb+lJE81RzmdsMeI994EKWJsVJKQqtlouFovydSgEAOw=='],
	bonsan    :['P//wMD/wC','JoSPicGqcWCSgBpbJWa81zlR4hNizomeHMh+1wZ2MtssrTmmmVQAADs='],
	box       :['ICAgKCgoC','IgyOCaadxpyKEkHqKH5tLxmEondg5MeBU2WyKziGakfPRwEAOw=='],
	cbblock   :['P/QQf///y','H4wDp3vJj+BzUlEIst784rp4lSiRH9igKdNpk2qYRwEAOw=='],
	chocona   :['P/AwP///y','IIyPGcDtD1BUM1WpVr6HG69R2yiWFnmamNqh0Ntk8iwXADs='],
	cojun     :['MD//////y','I4wfgMvKD+Jrcp6IrcF18ux9DiWOSNldaJqspgu28AZndVYAADs='],
	country   :['P/Gif///y','IISPGZFtDKB7SDZL78RYna6BjhhO1WdG3siubWZC5FkAADs='],
	creek     :['AD//8H+/y','JIQfGces2tyD8RkrU16XboBVExd1YTmSjXWa5NlirTsjU/k1BQA7'],
	factors   :['AD//////y','IISPqcsWHxp4iKq4cGXayd5dWwN+SXigqHeBawpJ8pwUADs='],
	fillmat   :['P//wLP/gS','JoSDAam2yh6SM9pbE4UaT3d0HrWRmDOiXMZ+oLfG5cjIMAnOIlsAADs='],
	fillomino :['ODg4P///y','I4QPgcvKn4KU0DhbE7qP3wl608FtDVRq3bkuYZillYxmLlQAADs='],
	firefly   :['ID/gP//wC','JISDpqvRzNySME2EMaAHzuddXEiWlVVSYxRl7riCsqeaG2orBQA7'],
	fivecells :['MD/wP///y','IwyOmWbqDaCLCgY7T5NT8vV02fdpYpVRSAmqZ4S145rS7FMAADs='],
	fourcells :['MD/wP///y','JoSPELeZrdxjoUJbmTYQ3T1xoEdh1gh+jhqtaZlxGOqK0nvL5o4VADs='],
	goishi    :['P/zwf///y','JoSPiRHK2UA0cU5JVz5V79stFzUq5oly5eOBG8a9sAu/4QetZXoUADs='],
	gokigen   :['OD/g////y','HYQPgafbvlKUMD42r9HbZg9W4oh9IdmZaLpSLZcUADs='],
	hakoiri   :['MD//////y','KISPicEa+UyUYE5KLcSVY81FVyc1JYMq6oKm6zgu2zur8Eoesd6aSgEAOw=='],
	hanare    :['AD//////y','FYSPqcvtDyMMdNLqLm46WC+F4kgmBQA7'],
	hashikake :['P///8DAwC','JoQflse829qLMlhLVYQuw8s5F+JtpTJSIKm2UgaAGBxrdI3TU1MAADs='],
	heyabon   :['P//wMD/wC','LYyPacDtH9p5LgJ7IYt4V559Clh9Idad0kJ57caimmex7nqNUN2lti8JvSaAAgA7'],
	heyawake  :['MD/wP///y','F4SPGJEN66KctNoGaZ5b9guGIsdoZVUAADs='],
	hitori    :['P//QP///y','H4SPFhvpwNpDcVJ2lz11Q+x1HgduonVOZ/qwjpvASAEAOw=='],
	icebarn   :['EH9/////y','F4SPqcvt3wJEcpp6g95cW/yAjmiV5nkWADs='],
	icelom    :['EH9/////y','GYSPqcvdAYOblMl1UU7b9PN9XkWSkVimaQEAOw=='],
	icelom2   :['H///////y','G4SPqcvNEQxsMVX71MWue7SBWjZyywSg38o2BQA7'],
	ichimaga  :['ODg4P///y','IIyPGcDtfZ4EUdmLzWRxQ+1kovh0HgVO42qhy+nCHBsUADs='],
	ichimagam :['ODg4P///y','F4yPGcDtD6NTtFojs3639w1m3kiW5lUAADs='],
	ichimagax :['ODg4P///y','HkSOicDtDyNUtNHKltzcXXsloNKVm2aEqHqYbsQuBQA7'],
	kaero     :['P/A/////y','KIyPecDtbUB4dE5JIbtSxa1VISaC5sOlmXo6LImOnCt77BxjuPhlbgEAOw=='],
	kakuro    :['ICAgP///y','F4SPqcut4V5McJ5qAbZ79vg5YTNmZlYAADs='],
	kakuru    :['MD/wP///y','HYSPqcut4QA8c1Vq2ZWu7vxpERYmXmeKz6oaJVUAADs='],
	kinkonkan :['P//gP///y','JoSDAanmrKBbsDaL7ctoUuwdjBhSWxdyHod+bObCZyetiVuOo1MAADs='],
	kouchoku  :['ODg4P///y','IIwDp3vJbxxccqraMKK6xX4BYDh+0SRSTLparevBsVwVADs='],
	kramma    :['ID/gMD/wC','IISPGJFt6xqMitEzL8hv+Q+G4idZGkehkeqwpdbBj7wVADs='],
	kramman   :['ID/gMD/wC','GYSPqcvtj4IMb85mbcy8+7xxGOho0ImmaQEAOw=='],
	kurochute :['PDw8ODg4C','IYSPFpGty9yBUD5qb9QVrER1GTaSUvWdadqILCKW2UzTBQA7'],
	kurodoko  :['ICAgMDAwC','H4SPiRHqDaAzMk66Lraa1g6GIhNCn1Kd2aGubUKKSAEAOw=='],
	kurotto   :['MDAwODg4C','KYxvoKuIzNKSD8gWMM2T12t5h+ZAncOZaoiu6LZFYtyRmGyHuPqmUF8AADs='],
	kusabi    :['MD/wP///y','I4SPqZvh/06QaxoLMMK80uuBYvaRY3eWW6mxqjuuJwQx9r0UADs='],
	lightup   :['MD//////y','IIRvgcvKDxycNAY5r6a6I99t2xdijVeN1bqYHJvA0VMAADs='],
	lits      :['ICAgKCgoC','IYQRqXmNq9yBUT7alr1wU2Z9gfeRWFiip6RNKfs6otkdBQA7'],
	lookair   :['AD//6D//y','GoSPqcsa/5qBUdIgwc07+w92jciQi+lQYFYAADs='],
	loopsp    :['P+AgP/Pgy','KYwPeLtpzoCcVDb1Mg7QQb55T9VVGrOBaPqhHomY6iyG2EfCa7dep1EAADs='],
	loute     :['IH/gf///y','IYyPaaDB+lJE89TVrssZ+Ph5zUiWG8ShqpSyK9V9Vmg2BQA7'],
	mashu     :['P/AwP///y','JoR/kRntvYxCFExb6b0ZS/Y4kdeRXLaVViqFJ1vCndw+oziP+QcUADs='],
	mejilink  :['NDQ0P///y','JoxheZrI4VhUE9iLc5ztQc8tz9ZBpPiN4Kq2hwZbpcTS7lk1zlYAADs='],
	minarism  :['AD//4H+/y','HYyPqcutAKN8DNBlU75oa/6FoOF141EG0po67vsWADs='],
	mochikoro :['AAAAICAgC','IYwDqXmNq9yBUT7alr1wU2Z9gPeRWFiip6RNKfs6otkdBQA7'],
	mochinyoro:['MDAwKCgoC','FoSPqct9AaOctNqLs4au+29s4kiWUwEAOw=='],
	nagenawa  :['ACAgACeoC','JYSPacHdCgKUiiaL8NFrO7eF3RiJJWml5geS2QRX8TWxDITnegEAOw=='],
	nanro     :['MD//+H//y','IIQfGcet2+KLUlFnL8rs+Q+G4khOWKJtaAqYqavBlwwUADs='],
	nawabari  :['MD//////y','IwRihsnK2xI88dnqJM68zhl9G6V5wYmmagc24vZisavWKYsVADs='],
	norinori  :['P/d1MDAwC','I4QfGcet2+KLUlFn8USvJ+Z5YLgZogZdZqYCpfpeMTVXX1MAADs='],
	numlin    :['MDAwP///y','JYyBaJG6Cx6UhzIbacuszaphYkhKG+SVD7eOJpZ2yXepdGuDRgEAOw=='],
	nuribou   :['KCgoICAgC','JYQRGYfKug58TlYzbaJbR3w1HTiKn8mdGamGK+ql6Uu7dlnjYQEAOw=='],
	nurikabe  :['P+hof/R0S','FoSPqcvtD1eY1NHa7rSaX49F4kiWTAEAOw=='],
	paintarea :['P//wMD/wC','JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs='],
	pipelink  :['ID/gM//gy','Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7'],
	pipelinkr :['ID//8D//y','Kkxgqae4bYCcjs6YaoaY9a99BxWRz4mmi1VeW+d44Px6cWXhrHzG/OMoAAA7'],
	reflect   :['MDAwP///y','HoyPqcvtCMAzMb5aWw5YbfpxVtKJEoONWrhO7gsnBQA7'],
	renban    :['ID/gP//wC','JoRjeZrI4FhUM9h7F4yzPfh1mkRp2MmF6iOCLIVaZvrWpF16bnwVADs='],
	ringring  :['KCgoMDAwC','JwRiqae4bYKctDr3Isw63dp1VsgcYCmeWDmirLpx6/p81n1xJL04BQA7'],
	ripple    :['AD//////y','IIyBYJG6jRg8sNqLs97RyvZMnxNGo3liKce2XkuBVVAAADs='],
	roma      :['P/wwf///y','IoSPqXvBGtxrcZpYJ85sc+hJYLiE2Ggm5oas7OWeQMzSWwEAOw=='],
	sashigane :['IH/gf///y','HYyPqcsBrcBrskp4LjZz+79p2NQxZRkhaOp4IhgUADs='],
	shakashaka:['AAAAICAgC','IoSPqRe7AR2CVAKKHd5q++l9VxgaJMecTXJqoltZ4ypfSwEAOw=='],
	shikaku   :['ICAgMDAwC','HoSPGcm43YKctMoIcVab9/N8QPiRjoVe4riyq7kFBQA7'],
	shimaguni :['P//wMD/wC','G4yPqavgDx2KFMwKL5as+w+GBqVtJXZWqcgeBQA7'],
	shugaku   :['AAAQAAAgC','JoRvoauIzNyBSyYaXp37Nv55GTiKGnWWQESmbguLrISp6ezUFlAAADs='],
	shwolf    :['ID/gMD/wC','IQyOiQas6RqcytlXsY569RaE4vhx5Zedx5WulKuamNwFBQA7'],
	slalom    :['ID//////y','IIwPecsJDIOLcNJlr3FP76yBF+d9SkmipydSbbWOsVEAADs='],
	slither   :['AAAAP///y','F4yPqcutAF5MULqLs978Vjohnxh2ZlYAADs='],
	snakes    :['ID/gMD/wC','FISPqcvtD1WYtM6Is96825pcHVQAADs='],
	sudoku    :['P//wP///y','HoRvgcvKDxxccp5qY0bY9hiE4khCn7ldabJq6/l8BQA7'],
	sukoro    :['MDAwODg4C','JYyPoMin39KDMUwa76p2crd9HGaQF0hpQHeqrOe671p6KEOKSAEAOw=='],
	tasquare  :['ICAgGBgYC','IYxvoKuIzNyBSyYKbMDZcv15HPaMzWR2l1mmFcrCYzsfBQA7'],
	tatamibari:['LP/gf///y','HYSPqaHA2x6SM9pETzbbwY9dFTiG5lmmzcq2rlIAADs='],
	tateyoko  :['P/AwP///y','H4RjqQvI3+BzJ9hLqUx6R8+BXreRkoZhofiJJvROSgEAOw=='],
	tawa      :['MDAwODg4C','GIR/gcud3hRccj57Mai6+8lZIeiNkOlwBQA7'],
	tentaisho :['IWL/X23/y','KASCYcum+5qDUx6mYtPZ3u19VZhooVWeBzJK5WNCr7jNsfOyXq6mQAEAOw=='],
	tilepaint :['KCgoICAgC','JowDCYfKug58TlYzbaJbR3w1HTiKn8lBZ5oxpOp6rTurIXvL+TsXADs='],
	toichika  :['ID/gP///y','IoSPqRvsGlqSJlp6adXAwreE4nhwooeYWWlW6ZpObfeRYQEAOw=='],
	triplace  :['MD/wP///y','JgyOCXas6dxrKNiLb51xv0593lJhI6ig0jlCZQabEzuHZH0v8V4AADs='],
	usotatami :['MD/wP//wC','KIQTppqcvc6BMKIKsIuZN10hjDdZnkguKNeV2ri+pQquKi2l9nulQAEAOw=='],
	wagiri    :['P/rw////y','IIQPEci42dgzs1Ua77na7ShBoNR1YpilKmqtrOd+MVUAADs='],
	yajikazu  :['P/B/f///y','HoSPEMm5DZ8JtNoKmcyTo+1loBh25YVSX3mMnMsyBQA7'],
	yajirin   :['MD/wP///y','HISDicas2tpL0c1Qs968nwuGl0eWHqihmVqxRgEAOw=='],
	yajitatami:['MD/wP//wC','J4wPeRvpj9SbwLhG4WV8aZkpWBVWFkh1HHSSZTuGY7ypXYnSE/y2BQA7'],
	yosenabe  :['ODg/////y','JIwDd6nGjdqD0VFZr5qg+4ltGgiKJkWO4bJ8nVhCT8yeq20dBQA7'],

	/* カラーパレットが3-4色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
	bosanowa  :['P/AwP/hw////////y','LowtAst5l1gTL6Q4r968e5VR0CUBToVJ55NOlQWqIhsvGv3l+j22/FgyzYAlRwEAOw=='],
	sukororoom:['NDQ0ODg4PDw8P///y','NIwfgqebBqJpS8X7nL0g18B1FNJgHukkwsqu6ZiioISYmzljN51LewfhZHBBICw2aSmXggIAOw=='],
	view      :['MD/wP//wP///////y','LoQtEst5l1gTDykZXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw=='],
	wblink    :['NDQ0ODg4Pj4+P///y','LoQdIct5l1gLDykpXNq8+99hThWJFHlJ41OqJ5tOFdDKaAbmOnebc71YQWJBSgEAOw==']
	}[pid];

	/* 無い場合はimage.gifを返します */
	if(!data){ data=['MD/wPD/8C','KYQTpogKnFxbMDpa7W18yjhp1yGO1OidW5mSKFuaTyy585t0ctZ+EFAAADs='];}

	if(data[0].length<=10){ header='R0lGODdhEAAQAIAAA';}
	else                  { header='R0lGODdhEAAQAKEAA';}

	return "data:image/gif;base64,"+header+data[0]+'wAAAAAEAAQAAAC'+data[1];
};

/* extern */
ui.menu = new Menu();

})();
