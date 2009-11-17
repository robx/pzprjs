// Menu.js v3.2.3

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------
Caption = function(){
	this.menu     = '';
	this.label    = '';
};
MenuData = function(strJP, strEN){
	this.caption = { ja: strJP, en: strEN};
	this.smenus = [];
};

// メニュー描画/取得/html表示系
// Menuクラス
Menu = function(){
	this.dispfloat  = [];			// 現在表示しているフロートメニューウィンドウ(オブジェクト)
	this.floatpanel = [];			// (2段目含む)フロートメニューオブジェクトのリスト
	this.pop        = "";			// 現在表示しているポップアップウィンドウ(オブジェクト)

	this.isptitle   = 0;			// タイトルバーが押されているか
	this.offset = new Pos(0, 0);	// ポップアップウィンドウの左上からの位置

	this.btnstack   = [];			// ボタンの情報(idnameと文字列のリスト)
	this.labelstack = [];			// span等の文字列の情報(idnameと文字列のリスト)

	this.ex = new MenuExec();
	this.language = 'ja';
};
Menu.prototype = {
	//---------------------------------------------------------------------------
	// menu.menuinit()      メニュー、ボタン、サブメニュー、フロートメニュー、
	//                      ポップアップメニューの初期設定を行う
	// menu.menureset()     メニュー用の設定を消去する
	//---------------------------------------------------------------------------
	menuinit : function(){
		this.buttonarea();
		this.menuarea();
		this.managearea();
		this.poparea();

		this.displayAll();
	},

	menureset : function(){
		this.dispfloat  = [];
		this.floatpanel = [];
		this.pop        = "";
		this.btnstack   = [];
		this.labelstack = [];

		this.popclose();
		this.menuclear();
		this.floatmenuclose(0);

		getEL("float_parent").innerHTML;

		if(!!getEL("btncolor2")){ getEL('btnarea').removeChild(getEL('btncolor2'));}
		$("#btnclear2").nextAll().remove();
		$("#outbtnarea").remove();

		getEL('menupanel') .innerHTML = '';
		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';

		pp.reset();
	},

	//---------------------------------------------------------------------------
	// menu.menuarea()   メニューの初期設定を行う
	// menu.addMenu()    メニューの情報を変数に登録する
	// menu.menuhover(e) メニューにマウスが乗ったときの表示設定を行う
	// menu.menuout(e)   メニューからマウスが外れた時の表示設定を行う
	// menu.menuclear()  メニュー/サブメニュー/フロートメニューを全て選択されていない状態に戻す
	//---------------------------------------------------------------------------
	menuarea : function(){
		this.addMenu('file', "ファイル", "File");
		this.addMenu('edit', "編集", "Edit");
		this.addMenu('disp', "表示", "Display");
		this.addMenu('setting', "設定", "Setting");
		this.addMenu('other', "その他", "Others");

		pp.setDefaultFlags();
		this.createFloats();

		getEL("expression").innerHTML = base.expression.ja;
		if(k.PLAYER){
			getEL('ms_newboard').className = 'smenunull';
			getEL('ms_urloutput').className = 'smenunull';
			getEL('ms_adjust').className = 'smenunull';
		}
		getEL('ms_jumpv3')  .style.fontSize = '10pt'; getEL('ms_jumpv3')  .style.paddingLeft = '8pt';
		getEL('ms_jumptop') .style.fontSize = '10pt'; getEL('ms_jumptop') .style.paddingLeft = '8pt';
		getEL('ms_jumpblog').style.fontSize = '10pt'; getEL('ms_jumpblog').style.paddingLeft = '8pt';
	},

	addMenu : function(idname, strJP, strEN){
		var el = ee.newEL('div');
		el.className = 'menu';
		el.id        = 'menu_'+idname;
		el.innerHTML = "["+strJP+"]";
		el.style.marginRight = "4pt";
		el.onmouseover = ee.ebinder(this, this.menuhover, [idname]);
		el.onmouseout  = ee.ebinder(this, this.menuout);
		getEL('menupanel').appendChild(el);

		this.addLabels(el, "["+strJP+"]", "["+strEN+"]");
	},
	menuhover : function(e, idname){
		this.floatmenuopen(e,idname,0);
		$("div.menusel").attr("class", "menu");
		ee.getSrcElement(e).className = "menusel";
	},
	menuout   : function(e){
		if(!this.insideOfMenu(e)){
			this.menuclear();
			this.floatmenuclose(0);
		}
	},
	menuclear : function(){
		$("div.menusel").attr("class", "menu");
	},

	//---------------------------------------------------------------------------
	// menu.submenuhover(e) サブメニューにマウスが乗ったときの表示設定を行う
	// menu.submenuout(e)   サブメニューからマウスが外れたときの表示設定を行う
	// menu.submenuclick(e) 通常/選択型/チェック型サブメニューがクリックされたときの動作を実行する
	// menu.checkclick()    管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	//---------------------------------------------------------------------------
	submenuhover : function(e, idname){
		if(ee.getSrcElement(e).className==="smenu"){ ee.getSrcElement(e).className="smenusel";}
		if(pp.flags[idname] && pp.istype(idname, pp.SELECT)){ this.floatmenuopen(e,idname,this.dispfloat.length);}
	},
	submenuout   : function(e, idname){
		if(ee.getSrcElement(e).className==="smenusel"){ ee.getSrcElement(e).className="smenu";}
		if(pp.flags[idname] && pp.istype(idname, pp.SELECT)){ this.floatmenuout(e);}
	},
	submenuclick : function(e, idname){
		if(ee.getSrcElement(e).className==="smenunull"){ return;}
		this.menuclear();
		this.floatmenuclose(0);

		if(pp.istype(idname, pp.SMENU)){
			this.popclose();							// 表示しているウィンドウがある場合は閉じる
			if(pp.funcs[idname]){ pp.funcs[idname]();}	// この中でthis.popupenuも設定されます。
			if(this.pop){
				var _pop = this.pop;
				_pop.style.left = mv.pointerX(e) - 8 + k.IEMargin.x;
				_pop.style.top  = mv.pointerY(e) - 8 + k.IEMargin.y;
				_pop.style.display = 'inline';
			}
		}
		else if(pp.istype(idname, pp.CHILD)){ this.setVal(pp.flags[idname].parent, pp.getVal(idname));}
		else if(pp.istype(idname, pp.CHECK)){ this.setVal(idname, !pp.getVal(idname));}
	},
	checkclick : function(idname){
		this.setVal(idname, getEL("ck_"+idname).checked);
	},

	//---------------------------------------------------------------------------
	// menu.floatmenuopen()  マウスがメニュー項目上に来た時にフロートメニューを表示する
	// menu.floatmenuclose() フロートメニューをcloseする
	// menu.floatmenuout(e)  マウスがフロートメニューを離れた時にフロートメニューをcloseする
	// menu.insideOf()       イベントeがjQueryオブジェクトjqobjの範囲内で起こったか？
	// menu.insideOfMenu()   マウスがメニュー領域の中にいるか判定する
	//---------------------------------------------------------------------------
	floatmenuopen : function(e, idname, depth){
		if(depth===0){ this.menuclear();}
		this.floatmenuclose(depth);

		if(depth>0 && !this.dispfloat[depth-1]){ return;}

		var rect = ee(ee.getSrcElement(e).id).getRect();
		var _float = this.floatpanel[idname];
		if(depth==0){
			_float.style.left = rect.left - 3 + k.IEMargin.x;
			_float.style.top  = rect.bottom + (k.br.IE?-2:1);
		}
		else{
			_float.style.left = rect.right - 2;
			_float.style.top  = rect.top + (k.br.IE?-5:-2);
		}
		_float.style.zIndex   = 101+depth;
		_float.style.display  = 'inline';

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
		this.menuclear();
		this.floatmenuclose(0);
	},

	insideOf : function(el, e){
		var ex = mv.pointerX(e)+(k.br.WinWebKit?1:0);
		var ey = mv.pointerY(e)+(k.br.WinWebKit?1:0);
		var rect = ee(el.id).getRect();
		return (ex>=rect.left && ex<=rect.right && ey>=rect.top && ey<=rect.bottom);
	},
	insideOfMenu : function(e){
		var ex = mv.pointerX(e)+(k.br.WinWebKit?1:0);
		var ey = mv.pointerY(e)+(k.br.WinWebKit?1:0);
		var rect_f = ee('menu_file').getRect(), rect_o = ee('menu_other').getRect();
		return (ex>=rect_f.left && ex<=rect_o.right && ey>=rect_f.top);
	},
	//---------------------------------------------------------------------------
	// menu.getTop()         要素の上座標を取得する
	// menu.getBottom()      要素の下座標を取得する
	// menu.getLeft()        要素の左座標を取得する
	// menu.getRight()       要素の右座標を取得する
	// menu.getWidth()       要素の横幅を取得する
	// menu.getHeight()      要素の縦幅を取得する
	//---------------------------------------------------------------------------
	getTop    : function(el){
		var _html = _doc.documentElement, _body = _doc.body;
		return el.getBoundingClientRect().top + ((_body.scrollTop || _html.scrollTop) - _html.clientTop);
	},
	getBottom : function(el){
		var _html = _doc.documentElement, _body = _doc.body;
		return el.getBoundingClientRect().top + ((_body.scrollTop || _html.scrollTop) - _html.clientTop) + el.offsetHeight;
	},
	getLeft   : function(el){
		var _html = document.documentElement, _body = _doc.body;
		return el.getBoundingClientRect().left + ((_body.scrollLeft || _html.scrollLeft) - _html.clientLeft);
	},
	getRight  : function(el){
		var _html = document.documentElement, _body = _doc.body;
		return el.getBoundingClientRect().left + ((_body.scrollLeft || _html.scrollLeft) - _html.clientLeft) + el.offsetWidth;
	},
	getWidth  : function(el){ return el.offsetWidth;},
	getHeight : function(el){ return el.offsetHeight;},

	//---------------------------------------------------------------------------
	// menu.addUseToFlags()      「操作方法」サブメニュー登録用共通関数
	// menu.addRedLineToFlags()  「線のつながりをチェック」サブメニュー登録用共通関数
	// menu.addRedBlockToFlags() 「黒マスのつながりをチェック」サブメニュー登録用共通関数
	//---------------------------------------------------------------------------
	// menu登録用の関数
	addUseToFlags : function(){
		pp.addUseToFlags('use','setting',1,[1,2]);
		pp.setMenuStr('use', '操作方法', 'Input Type');
		pp.setLabel  ('use', '操作方法', 'Input Type');

		pp.addUseChildrenToFlags('use','use');
		pp.setMenuStr('use_1', '左右ボタン', 'LR Button');
		pp.setMenuStr('use_2', '1ボタン', 'One Button');
	},
	addRedLineToFlags : function(){
		pp.addCheckToFlags('dispred','setting',false);
		pp.setMenuStr('dispred', '繋がりチェック', 'Continuous Check');
		pp.setLabel  ('dispred', '線のつながりをチェックする', 'Check countinuous lines');
	},
	addRedBlockToFlags : function(){
		pp.addCheckToFlags('dispred','setting',false);
		pp.setMenuStr('dispred', '繋がりチェック', 'Continuous Check');
		pp.setLabel  ('dispred', '黒マスのつながりをチェックする', 'Check countinuous black cells');
	},
	addRedBlockRBToFlags : function(){
		pp.addCheckToFlags('dispred','setting',false);
		pp.setMenuStr('dispred', '繋がりチェック', 'Continuous Check');
		pp.setLabel  ('dispred', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous black cells with its corner');
	},

	//---------------------------------------------------------------------------
	// menu.getVal()     各フラグのvalの値を返す
	// menu.setVal()     各フラグの設定値を設定する
	// menu.setdisplay() 管理パネルとサブメニューに表示する文字列を設定する
	// menu.displayAll() 全てのメニュー、ボタン、ラベルに対して文字列を設定する
	//---------------------------------------------------------------------------
	getVal : function(idname)  { return pp.getVal(idname);},
	setVal : function(idname, newval){ pp.setVal(idname,newval);},
	setdisplay : function(idname){
		if(pp.istype(idname, pp.SMENU)||pp.istype(idname, pp.LABEL)){
			if(getEL("ms_"+idname)){ getEL("ms_"+idname).innerHTML = pp.getMenuStr(idname);}
		}
		else if(pp.istype(idname, pp.SELECT)){
			if(getEL("ms_"+idname)){ getEL("ms_"+idname).innerHTML = "&nbsp;"+pp.getMenuStr(idname);}	// メニュー上の表記の設定
			if(getEL("cl_"+idname)){ getEL("cl_"+idname).innerHTML = pp.getLabel(idname);}				// 管理領域上の表記の設定
			for(var i=0,len=pp.flags[idname].child.length;i<len;i++){ this.setdisplay(""+idname+"_"+pp.flags[idname].child[i]);}
		}
		else if(pp.istype(idname, pp.CHILD)){
			var issel = (pp.getVal(idname) == pp.getVal(pp.flags[idname].parent));
			var cap = pp.getMenuStr(idname);
			if(getEL("ms_"+idname)){ getEL("ms_"+idname).innerHTML = (issel?"+":"&nbsp;")+cap;}	// メニューの項目
			if(getEL("up_"+idname)){															// 管理領域の項目
				getEL("up_"+idname).innerHTML = cap;
				getEL("up_"+idname).className = (issel?"flagsel":"flag");
			}
		}
		else if(pp.istype(idname, pp.CHECK)){
			var flag = pp.getVal(idname);
			if(getEL("ms_"+idname)){ getEL("ms_"+idname).innerHTML = (flag?"+":"&nbsp;")+pp.getMenuStr(idname);}	// メニュー
			if(getEL("ck_"+idname)){ getEL("ck_"+idname).checked = flag;}						// 管理領域(チェックボックス)
			if(getEL("cl_"+idname)){ getEL("cl_"+idname).innerHTML = pp.getLabel(idname);}		// 管理領域(ラベル)
		}
	},
	displayAll : function(){
		for(var i in pp.flags){ this.setdisplay(i);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			if(!this.btnstack[i].el){ continue;}
			this.btnstack[i].el.value = this.btnstack[i].str[menu.language];
		}
		for(var i=0,len=this.labelstack.length;i<len;i++){
			if(!this.labelstack[i].el){ continue;}
			this.labelstack[i].el.innerHTML = this.labelstack[i].str[menu.language];
		}
	},

	//---------------------------------------------------------------------------
	// menu.createFloatMenu() 登録されたサブメニューからフロートメニューを作成する
	// menu.getFloatpanel()   指定されたIDを持つフロートメニューを返す(ない場合は作成する)
	//---------------------------------------------------------------------------
	createFloats : function(){
		var last=0;
		for(var i=0;i<pp.flaglist.length;i++){
			var idname = pp.flaglist[i];
			if(!pp.flags[idname]){ continue;}

			var menuid = pp.flags[idname].parent;
			var floats = this.getFloatpanel(menuid);

			if(menuid=='setting'){
				if(last>0 && last!=pp.type(idname)){
					var _sep = ee.newEL('div');
					_sep.className = 'smenusep';
					_sep.innerHTML = '&nbsp;';
					floats.appendChild(_sep);
				}
				last=pp.type(idname);
			}

			var smenu;
			if     (pp.istype(idname, pp.SEPARATE)){
				smenu = ee.newEL('div');
				smenu.className = 'smenusep';
				smenu.innerHTML = '&nbsp;';
			}
			else if(pp.istype(idname, pp.LABEL)){
				smenu = ee.newEL('span');
				smenu.style.color = 'white';
			}
			else if(pp.istype(idname, pp.SELECT)){
				smenu = ee.newEL('div');
				smenu.className  = 'smenu';
				smenu.style.fontWeight = '900';
				smenu.style.fontSize   = '10pt';
				smenu.onmouseover = ee.ebinder(this, this.submenuhover, [idname]);
				smenu.onmouseout  = ee.ebinder(this, this.submenuout,   [idname]);
				this.getFloatpanel(idname);
			}
			else{
				smenu = ee.newEL('div');
				smenu.className  = 'smenu';
				smenu.onmouseover = ee.ebinder(this, this.submenuhover, [idname]);
				smenu.onmouseout  = ee.ebinder(this, this.submenuout,   [idname]);
				smenu.onclick     = ee.ebinder(this, this.submenuclick, [idname]);
				this.getFloatpanel(idname);
				if(!pp.istype(idname, pp.SMENU)){
					smenu.style.fontSize    = '10pt';
					smenu.style.paddingLeft = '6pt';
				}
			}
			smenu.id = "ms_"+idname;
			floats.appendChild(smenu);

			this.setdisplay(idname);
		}
		this.floatpanel[menuid] = floats;
	},
	getFloatpanel : function(id){
		if(!this.floatpanel[id]){
			var _float = ee.newEL("div");
			_float.className = 'floatmenu';
			_float.id        = 'float_'+id;
			_float.onmouseout = ee.ebinder(this, this.floatmenuout);
			_float.style.zIndex = 101;
			_float.style.backgroundColor = base.floatbgcolor;
			getEL('float_parent').appendChild(_float);

			this.floatpanel[id] = _float;
			//$(_float).hide();
		}
		return this.floatpanel[id];
	},

	//---------------------------------------------------------------------------
	// menu.managearea()   管理領域の初期化を行う
	//---------------------------------------------------------------------------
	managearea : function(){
		for(var n=0;n<pp.flaglist.length;n++){
			var idname = pp.flaglist[n];
			if(!pp.flags[idname] || !pp.getLabel(idname)){ continue;}

			if(pp.istype(idname, pp.SELECT)){
				var plx = ee("usepanel");

				var _el = ee.newEL('span');
				_el.id = "cl_" + idname;
				_el.innerHTML = pp.getLabel(idname);
				plx.appendEL(_el);
				plx.appendHTML(" |&nbsp;");

				for(var i=0;i<pp.flags[idname].child.length;i++){
					var num = pp.flags[idname].child[i];
					var _el = ee.newELx('div').unselectable().el;
					_el.className = ((num==pp.getVal(idname))?"flagsel":"flag");
					_el.id        = "up_"+idname+"_"+num;
					_el.innerHTML = pp.getMenuStr(""+idname+"_"+num);
					_el.onclick   = ee.binder(pp, pp.setVal, [idname,num]);

					plx.appendEL(_el);
					plx.appendHTML(" ");
				}

				plx.appendEL(ee.newEL('br'));
			}
			else if(pp.istype(idname, pp.CHECK)){
				var cpx = ee("checkpanel");

				var _el = ee.newEL('input');
				_el.type  = 'checkbox';
				_el.id    = "ck_" + idname;
				_el.check = '';
				_el.onclick = ee.binder(this, this.checkclick, [idname]);
				cpx.appendEL(_el)

				cpx.appendHTML(" ");

				_el = ee.newEL('span');
				_el.id = "cl_" + idname;
				_el.innerHTML = pp.getLabel(idname);
				cpx.appendEL(_el);

				if(idname==="irowake"){
					cpx.appendEL(ee.newBTN('ck_irowake2','','色分けしなおす'));
					this.addButtons(getEL("ck_irowake2"), ee.binder(menu.ex, menu.ex.irowakeRemake), "色分けしなおす", "Change the color of Line");
				}

				cpx.appendEL(ee.newEL('br'));
			}
		}

		var _tr = ee('translation').unselectable().el;
		_tr.style.position = 'absolute';
		_tr.style.cursor   = 'pointer';
		_tr.style.fontSize = '10pt';
		_tr.style.color    = 'green';
		_tr.style.backgroundColor = '#dfdfdf';
		_tr.onclick = ee.binder(this, this.translate);

		if(k.EDITOR){
			$("#timerpanel,#separator2").hide();
		}
		if(k.irowake!=0){
			getEL('btnarea').appendChild(menu.createButton('btncolor2','','色分けしなおす'))
			this.addButtons(getEL("btncolor2"), ee.binder(menu.ex, menu.ex.irowakeRemake), "色分けしなおす", "Change the color of Line");
			$("#btncolor2").hide();
		}
	},

//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.poparea()     ポップアップメニューの初期設定を行う
	// menu.popclose()    ポップアップメニューを閉じる
	//---------------------------------------------------------------------------
	poparea : function(){

		$("div.titlebar,#credir3_1").each(function(){ menu.titlebarfunc(this);});

		//---------------------------------------------------------------------------
		//// formボタンのイベント
		var px = ee.ebinder(this, this.popclose);

		// 盤面の新規作成
		document.newboard.newboard.onclick = ee.ebinder(this.ex, this.ex.newboard);
		document.newboard.cancel.onclick   = px;

		// URL入力
		document.urlinput.urlinput.onclick = ee.ebinder(this.ex, this.ex.urlinput);
		document.urlinput.cancel.onclick   = px;

		// URL出力
		var _div = getEL('urlbuttonarea');
		var ib = ee.binder(this, function(name, strJP, strEN, eval){
			if(eval===false) return;
			var el = menu.createButton('', name, strJP);
			this.addButtons(el, ee.ebinder(this.ex, this.ex.urloutput), strJP, strEN);
			_div.appendChild(el)
			_div.appendChild(ee.newEL('br'));
		});
		ib('pzprv3',     "ぱずぷれv3のURLを出力する",           "Output PUZ-PRE v3 URL",          true);
		ib('pzprapplet', "ぱずぷれ(アプレット)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", !k.ispzprv3ONLY);
		ib('kanpen',     "カンペンのURLを出力する",             "Output Kanpen URL",              !!k.isKanpenExist);
		ib('heyaapp',    "へやわけアプレットのURLを出力する",   "Output Heyawake-Applet URL",     (k.puzzleid==="heyawake"));
		ib('pzprv3edit', "ぱずぷれv3の再編集用URLを出力する",   "Output PUZ-PRE v3 Re-Edit URL",  true);
		getEL("urlbuttonarea").appendChild(ee.newEL('br'));

		this.addButtons(document.urloutput.openurl, ee.ebinder(this.ex, this.ex.openurl), "このURLを開く", "Open this URL on another window/tab");
		this.addButtons(document.urloutput.close,   px,                                   "閉じる", "Close");

		// ファイル入力
		document.fileform.filebox.onchange = ee.ebinder(this.ex, this.ex.fileopen);
		document.fileform.close.onclick    = px;

		// データベースを開く
		document.database.sorts   .onchange = ee.ebinder(fio, fio.displayDataTableList);
		document.database.datalist.onchange = ee.ebinder(fio, fio.selectDataTable);
		document.database.tableup.onclick   = ee.ebinder(fio, fio.upDataTable);
		document.database.tabledn.onclick   = ee.ebinder(fio, fio.downDataTable);
		document.database.open   .onclick   = ee.ebinder(fio, fio.openDataTable);
		document.database.save   .onclick   = ee.ebinder(fio, fio.saveDataTable);
		document.database.comedit.onclick   = ee.ebinder(fio, fio.editComment);
		document.database.difedit.onclick   = ee.ebinder(fio, fio.editDifficult);
		document.database.del    .onclick   = ee.ebinder(fio, fio.deleteDataTable);
		document.database.close  .onclick   = px;

		// 盤面の調整
		var pa = ee.ebinder(this.ex, this.ex.popupadjust);
		document.adjust.expandup.onclick = pa;
		document.adjust.expanddn.onclick = pa;
		document.adjust.expandlt.onclick = pa;
		document.adjust.expandrt.onclick = pa;
		document.adjust.reduceup.onclick = pa;
		document.adjust.reducedn.onclick = pa;
		document.adjust.reducelt.onclick = pa;
		document.adjust.reducert.onclick = pa;
		document.adjust.close   .onclick = px;

		// 反転・回転
		document.flip.turnl.onclick = pa;
		document.flip.turnr.onclick = pa;
		document.flip.flipy.onclick = pa;
		document.flip.flipx.onclick = pa;
		document.flip.close.onclick = px;

		// credit
		document.credit.close.onclick = px;

		// 表示サイズ
		document.dispsize.dispsize.onclick = ee.ebinder(this, this.ex.dispsize);
		document.dispsize.cancel.onclick   = px;
	},
	popclose : function(){
		if(this.pop){
			this.pop.style.display = "none";
			this.pop = '';
			this.menuclear();
			this.isptitle = 0;
			k.enableKey = true;
		}
	},

	//---------------------------------------------------------------------------
	// menu.titlebarfunc() 下の4つのイベントをイベントハンドラにくっつける
	// menu.titlebardown() Popupタイトルバーをクリックしたときの動作を行う
	// menu.titlebarup()   Popupタイトルバーでボタンを離したときの動作を行う
	// menu.titlebarout()  Popupタイトルバーからマウスが離れたときの動作を行う
	// menu.titlebarmove() Popupタイトルバーからマウスを動かしたときポップアップメニューを動かす
	//---------------------------------------------------------------------------
	titlebarfunc : function(bar){
		bar.onmousedown = ee.ebinder(menu, menu.titlebardown);
		bar.onmouseup   = ee.ebinder(menu, menu.titlebarup);
		bar.onmouseout  = ee.ebinder(menu, menu.titlebarout);
		bar.onmousemove = ee.ebinder(menu, menu.titlebarmove);

		ee(bar).unselectable().el;
	},

	titlebardown : function(e){
		var pop = ee.getSrcElement(e).parentNode;
		this.isptitle = 1;
		this.offset.x = mv.pointerX(e) - parseInt(pop.style.left);
		this.offset.y = mv.pointerY(e) - parseInt(pop.style.top);
	},
	titlebarup   : function(e){
		this.isptitle = 0;
	},
	titlebarout  : function(e){
		var pop = ee.getSrcElement(e).parentNode;
		if(!this.insideOf(pop, e)){ this.isptitle = 0;}
	},
	titlebarmove : function(e){
		var pop = ee.getSrcElement(e).parentNode;
		if(pop && this.isptitle){
			pop.style.left = mv.pointerX(e) - this.offset.x;
			pop.style.top  = mv.pointerY(e) - this.offset.y;
		}
	},

//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.buttonarea()        ボタンの初期設定を行う
	// menu.createButton()      指定したid, name, ラベルを持ったボタンを作成する
	// menu.addButtons()        ボタンの情報を変数に登録する
	// menu.addLAbels()         ラベルの情報を変数に登録する
	// menu.setDefaultButtons() ボタンをbtnstackに設定する
	// menu.setDefaultLabels()  ラベルをspanstackに設定する
	//---------------------------------------------------------------------------
	buttonarea : function(){
		this.addButtons(getEL("btncheck"),  ee.binder(ans, ans.check),             "チェック", "Check");
		this.addButtons(getEL("btnundo"),   ee.binder(um, um.undo),                "戻",       "<-");
		this.addButtons(getEL("btnredo"),   ee.binder(um, um.redo),                "進",       "->");
		this.addButtons(getEL("btnclear"),  ee.binder(menu.ex, menu.ex.ACconfirm), "回答消去", "Erase Answer");
		this.addButtons(getEL("btnclear2"), ee.binder(menu.ex, menu.ex.ASconfirm), "補助消去", "Erase Auxiliary Marks");

		this.setDefaultButtons();
		this.setDefaultLabels();
	},
	createButton : function(id, name, val){
		var _btn = ee.newEL('input');
		_btn.type  = 'button';
		if(!!id)  { _btn.id   = id;}
		if(!!name){ _btn.name = name;}
		_btn.value = val;

		return _btn;
	},

	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		this.btnstack.push({el:ee(el).unselectable().el, str:{ja:strJP, en:strEN}});
	},
	addLabels  : function(el, strJP, strEN){
		this.labelstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	setDefaultButtons : function(){
		var t = ee.binder(this, this.addButtons);
		t(document.newboard.newboard, null, "新規作成",   "Create");
		t(document.newboard.cancel,   null, "キャンセル", "Cancel");
		t(document.urlinput.urlinput, null, "読み込む",   "Import");
		t(document.urlinput.cancel,   null, "キャンセル", "Cancel");
		t(document.fileform.close,    null, "閉じる",     "Close");
		t(document.database.save,     null, "盤面を保存", "Save");
		t(document.database.comedit,  null, "コメントを編集する", "Edit Comment");
		t(document.database.difedit,  null, "難易度を設定する",   "Set difficulty");
		t(document.database.open,     null, "データを読み込む",   "Load");
		t(document.database.del,      null, "削除",       "Delete");
		t(document.database.close,    null, "閉じる",     "Close");
		t(document.adjust.expandup,   null, "上",         "UP");
		t(document.adjust.expanddn,   null, "下",         "Down");
		t(document.adjust.expandlt,   null, "左",         "Left");
		t(document.adjust.expandrt,   null, "右",         "Right");
		t(document.adjust.reduceup,   null, "上",         "UP");
		t(document.adjust.reducedn,   null, "下",         "Down");
		t(document.adjust.reducelt,   null, "左",         "Left");
		t(document.adjust.reducert,   null, "右",         "Right");
		t(document.adjust.close,      null, "閉じる",     "Close");
		t(document.flip.turnl,        null, "左90°回転", "Turn left by 90 degree");
		t(document.flip.turnr,        null, "右90°回転", "Turn right by 90 degree");
		t(document.flip.flipy,        null, "上下反転",   "Flip upside down");
		t(document.flip.flipx,        null, "左右反転",   "Flip leftside right");
		t(document.flip.close,        null, "閉じる",     "Close");
		t(document.dispsize.dispsize, null, "変更する",   "Change");
		t(document.dispsize.cancel,   null, "キャンセル", "Cancel");
		t(document.credit.close,      null, "閉じる",     "OK");
	},
	setDefaultLabels : function(){
		var t = ee.binder(this, this.addLabels);
		t(getEL("translation"), "English",                     "日本語");
		t(getEL("bar1_1"),      "盤面の新規作成",              "Createing New Board");
		t(getEL("pop1_1_cap0"), "盤面を新規作成します。",      "Create New Board.");
		t(getEL("pop1_1_cap1"), "よこ",                        "Cols");
		t(getEL("pop1_1_cap2"), "たて",                        "Rows");
		t(getEL("bar1_2"),      "URL入力",                     "Import from URL");
		t(getEL("pop1_2_cap0"), "URLから問題を読み込みます。", "Import a question from URL.");
		t(getEL("bar1_3"),      "URL出力",                     "Export URL");
		t(getEL("bar1_4"),      "ファイルを開く",              "Open file");
		t(getEL("pop1_4_cap0"), "ファイル選択",                "Choose file");
		t(getEL("bar1_8"),      "データベースの管理",          "Database Management");
		t(getEL("pop1_8_com"),  "コメント:",                   "Comment:");
		t(getEL("bar2_1"),      "盤面の調整",                  "Adjust the board");
		t(getEL("pop2_1_cap0"), "盤面の調整を行います。",      "Adjust the board.");
		t(getEL("pop2_1_cap1"), "拡大",                        "Expand");
		t(getEL("pop2_1_cap2"), "縮小",                        "Reduce");
		t(getEL("bar2_2"),      "反転・回転",                  "Flip/Turn the board");
		t(getEL("pop2_2_cap0"), "盤面の回転・反転を行います。","Flip/Turn the board.");
		t(getEL("bar4_1"),      "表示サイズの変更",            "Change size");
		t(getEL("pop4_1_cap0"), "表示サイズを変更します。",    "Change the display size.");
		t(getEL("pop4_1_cap1"), "表示サイズ",                  "Display size");
		t(getEL("bar3_1"),      "credit",                      "credit");
		t(getEL("credit3_1"), "ぱずぷれv3 "+pzprversion+"<br>\n<br>\nぱずぷれv3は はっぱ/連続発破が作成しています。<br>\nライブラリとしてjQuery1.3.2, uuCanvas1.0, <br>Google Gearsを\n使用しています。<br>\n<br>\n",
							  "PUZ-PRE v3 "+pzprversion+"<br>\n<br>\nPUZ-PRE v3 id made by happa.<br>\nThis script use jQuery1.3.2, uuCanvas1.0, <br>Google Gears as libraries.<br>\n<br>\n");
	},

//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.isLangJP()  言語モードを日本語にする
	// menu.isLangEN()  言語モードを英語にする
	//--------------------------------------------------------------------------------
	isLangJP : function(){ return this.language == 'ja';},
	isLangEN : function(){ return this.language == 'en';},

	//--------------------------------------------------------------------------------
	// menu.setLang()   言語を設定する
	// menu.translate() htmlの言語を変える
	//--------------------------------------------------------------------------------
	setLang : function(ln){ (ln=='ja')       ?this.setLangJP():this.setLangEN();},
	translate : function(){ (this.isLangJP())?this.setLangEN():this.setLangJP();},

	//--------------------------------------------------------------------------------
	// menu.setLangJP()  文章を日本語にする
	// menu.setLangEN()  文章を英語にする
	// menu.setLangStr() 文章を設定する
	//--------------------------------------------------------------------------------
	setLangJP : function(){ this.setLangStr('ja');},
	setLangEN : function(){ this.setLangStr('en');},
	setLangStr : function(ln){
		this.language = ln;
		document.title = base.gettitle();
		getEL("title2").innerHTML = base.gettitle();
		getEL("expression").innerHTML = base.expression[this.language];

		this.displayAll();
		this.ex.dispmanstr();

		base.resize_canvas();
	}
};

//---------------------------------------------------------------------------
// ★Propertiesクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
SSData = function(){
	this.id     = '';
	this.type   = 0;
	this.val    = 1;
	this.parent = 1;
	this.child  = [];

	this.str    = { ja: new Caption(), en: new Caption()};
	//this.func   = null;
};
Properties = function(){
	this.flags    = [];	// サブメニュー項目の情報(SSDataクラスのオブジェクトの配列になる)
	this.flaglist = [];	// idnameの配列

	// const
	this.SMENU    = 0;
	this.SELECT   = 1;
	this.CHECK    = 2;
	this.LABEL    = 3;
	this.CHILD    = 4;
	this.SEPARATE = 5;
};
Properties.prototype = {
	reset : function(){
		this.flags    = [];
		this.flaglist = [];
	},

	// pp.setMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を設定する
	addSmenuToFlags : function(idname, parent)       { this.addToFlags(idname, parent, this.SMENU, 0);},
	addCheckToFlags : function(idname, parent, first){ this.addToFlags(idname, parent, this.CHECK, first);},
	addCaptionToFlags     : function(idname, parent) { this.addToFlags(idname, parent, this.LABEL, 0);},
	addSeparatorToFlags   : function(idname, parent) { this.addToFlags(idname, parent, this.SEPARATE, 0);},
	addUseToFlags   : function(idname, parent, first, child){
		this.addToFlags(idname, parent, this.SELECT, first);
		this.flags[idname].child = child;
	},
	addUseChildrenToFlags : function(idname, parent){
		if(!this.flags[idname]){ return;}
		for(var i=0;i<this.flags[idname].child.length;i++){
			var num = this.flags[idname].child[i];
			this.addToFlags(""+idname+"_"+num, parent, this.CHILD, num);
		}
	},
	addToFlags : function(idname, parent, type, first){
		this.flags[idname] = new SSData();
		this.flags[idname].id     = idname;
		this.flags[idname].type   = type;
		this.flags[idname].val    = first;
		this.flags[idname].parent = parent;
		this.flaglist.push(idname);
	},

	setMenuStr : function(idname, strJP, strEN){
		if(!this.flags[idname]){ return;}
		this.flags[idname].str.ja.menu = strJP; this.flags[idname].str.en.menu = strEN;
	},
	setLabel : function(idname, strJP, strEN){
		if(!this.flags[idname]){ return;}
		this.flags[idname].str.ja.label = strJP; this.flags[idname].str.en.label = strEN;
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を返す
	// pp.getLabel()   管理パネルとチェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	// pp.istype()     設定値のサブメニュータイプが指定された値かどうかを返す
	//
	// pp.getVal()     各フラグのvalの値を返す
	// pp.setVal()     各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.flags[idname].str[menu.language].menu; },
	getLabel   : function(idname){ return this.flags[idname].str[menu.language].label;},
	type   : function(idname)     { return this.flags[idname].type;},
	istype : function(idname,type){ return (this.flags[idname].type===type);},

	getVal : function(idname)  { return this.flags[idname]?this.flags[idname].val:0;},
	setVal : function(idname, newval){
		if(!this.flags[idname]){ return;}
		else if(this.flags[idname].type===this.CHECK || this.flags[idname].type===this.SELECT){
			this.flags[idname].val = newval;
			menu.setdisplay(idname);
			if(this.funcs[idname]){ this.funcs[idname](newval);}
		}
	},

	//---------------------------------------------------------------------------
	// pp.setDefaultFlags()  設定値を登録する
	// pp.setStringToFlags() 設定値に文字列を登録する
	//---------------------------------------------------------------------------
	setDefaultFlags : function(){
		var as = ee.binder(this, this.addSmenuToFlags),
			au = ee.binder(this, this.addUseToFlags),
			ac = ee.binder(this, this.addCheckToFlags),
			aa = ee.binder(this, this.addCaptionToFlags),
			ai = ee.binder(this, this.addUseChildrenToFlags),
			ap = ee.binder(this, this.addSeparatorToFlags);

		au('mode','setting',(k.editmode?1:3),[1,3]);

		puz.menufix();	// 各パズルごとのメニュー追加

		ac('autocheck','setting',k.autocheck);
		ac('lrcheck','setting',false);
		ac('keypopup','setting',kp.defaultdisp);
		au('language','setting',0,[0,1]);
		if(k.PLAYER){ delete this.flags['mode'];}
		if(!kp.ctl[1].enable && !kp.ctl[3].enable){ delete this.flags['keypopup'];}

		as('newboard',  'file');
		as('urlinput',  'file');
		as('urloutput', 'file');
		ap('sep_2',     'file');
		as('fileopen',  'file');
		as('filesave',  'file');
		as('database',  'file');
		ap('sep_3',     'file');
		as('fileopen2', 'file');
		as('filesave2', 'file');
		if(fio.DBtype==0){ delete this.flags['database'];}
		if(!k.isKanpenExist || (k.puzzleid=="nanro"||k.puzzleid=="ayeheya"||k.puzzleid=="kurochute")){
			delete this.flags['fileopen2']; delete this.flags['filesave2']; delete this.flags['sep_3'];
		}

		as('adjust', 'edit');
		as('turn',   'edit');

		au('size',   'disp',k.widthmode,[0,1,2,3,4]);
		ap('sep_4',  'disp');
		ac('irowake','disp',(k.irowake==2?true:false));
		ap('sep_5',  'disp');
		as('manarea','disp');
		if(k.irowake==0){ delete this.flags['irowake']; delete this.flags['sep_4'];}

		as('dispsize',    'size');
		aa('cap_dispmode','size');
		ai('size','size');

		ai('mode','mode');

		ai('language','language');

		as('credit',      'other');
		aa('cap_others1', 'other');
		as('jumpv3',      'other');
		as('jumptop',     'other');
		as('jumpblog',    'other');

		this.setStringToFlags();
	},
	setStringToFlags : function(){
		var sm = ee.binder(this, this.setMenuStr),
			sl = ee.binder(this, this.setLabel);

		sm('size',   '表示サイズ',  'Cell Size');
		sm('size_0', 'サイズ 極小', 'Ex Small');
		sm('size_1', 'サイズ 小',   'Small');
		sm('size_2', 'サイズ 標準', 'Normal');
		sm('size_3', 'サイズ 大',   'Large');
		sm('size_4', 'サイズ 特大', 'Ex Large');

		sm('irowake', '線の色分け', 'Color coding');
		sl('irowake', '線の色分けをする', 'Color each lines');

		sm('mode',   'モード', 'mode');
		sl('mode',   'モード', 'mode');
		sm('mode_1', '問題作成モード', 'Edit mode'  );
		sm('mode_3', '回答モード',     'Answer mode');

		sm('autocheck', '正答自動判定', 'Auto Answer Check');

		sm('lrcheck', 'マウス左右反転', 'Mouse button inversion');
		sl('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');

		sm('keypopup', 'パネル入力', 'Panel inputting');
		sl('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');

		sm('language',   '言語',    'Language');
		sm('language_0', '日本語',  '日本語');
		sm('language_1', 'English', 'English');

		sm('newboard',     '新規作成',                  'New Board');
		sm('urlinput',     'URL入力',                   'Import from URL');
		sm('urloutput',    'URL出力',                   'Export URL');
		sm('fileopen',     'ファイルを開く',            'Open the file');
		sm('filesave',     'ファイル保存',              'Save the file as ...');
		sm('database',     'データベースの管理',        'Database Management');
		sm('fileopen2',    'pencilboxのファイルを開く', 'Open the pencilbox file');
		sm('filesave2',    'pencilboxのファイルを保存', 'Save the pencilbox file as ...');
		sm('adjust',       '盤面の調整',                'Adjust the Board');
		sm('turn',         '反転・回転',                'Filp/Turn the Board');
		sm('dispsize',     'サイズ指定',                'Cell Size');
		sm('cap_dispmode', '表示モード',                'Display mode');
		sm('manarea',      '管理領域を隠す',            'Hide Management Area');
		sm('credit',       'ぱずぷれv3について',        'About PUZ-PRE v3');
		sm('cap_others1',  'リンク',                    'Link');
		sm('jumpv3',       'ぱずぷれv3のページへ',      'Jump to PUZ-PRE v3 page');
		sm('jumptop',      '連続発破保管庫TOPへ',       'Jump to indi.s58.xrea.com');
		sm('jumpblog',     'はっぱ日記(blog)へ',        'Jump to my blog');

		sm('eval', 'テスト用', 'for Evaluation');
	},

//--------------------------------------------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	funcs : {
		urlinput  : function(){ menu.pop = getEL("pop1_2");},
		urloutput : function(){ menu.pop = getEL("pop1_3"); document.urloutput.ta.value = "";},
		filesave  : function(){ menu.ex.filesave();},
		database  : function(){ menu.pop = getEL("pop1_8"); fio.getDataTableList();},
		filesave2 : function(){ if(fio.kanpenSave){ menu.ex.filesave2();}},
		adjust    : function(){ menu.pop = getEL("pop2_1");},
		turn      : function(){ menu.pop = getEL("pop2_2");},
		credit    : function(){ menu.pop = getEL("pop3_1");},
		jumpv3    : function(){ window.open('./', '', '');},
		jumptop   : function(){ window.open('../../', '', '');},
		jumpblog  : function(){ window.open('http://d.hatena.ne.jp/sunanekoroom/', '', '');},
		irowake   : function(){ menu.ex.irowakeRemake();},
		manarea   : function(){ menu.ex.dispman();},
		autocheck : function(val){ k.autocheck = !k.autocheck;},
		mode      : function(num){ menu.ex.modechange(num);},
		size      : function(num){ k.widthmode=num; base.resize_canvas();},
		use       : function(num){ k.use =num;},
		language  : function(num){ menu.setLang({0:'ja',1:'en'}[num]);},

		newboard : function(){
			menu.pop = getEL("pop1_1");
			if(k.puzzleid!="sudoku"){
				document.newboard.col.value = k.qcols;
				document.newboard.row.value = k.qrows;
			}
			k.enableKey = false;
		},
		fileopen : function(){
			document.fileform.pencilbox.value = "0";
			if(k.br.IE || k.br.Gecko || k.br.Opera){ if(!menu.pop){ menu.pop = getEL("pop1_4");}}
			else{ if(!menu.pop){ document.fileform.filebox.click();}}
		},
		fileopen2 : function(){
			if(!fio.kanpenOpen){ return;}
			document.fileform.pencilbox.value = "1";
			if(k.br.IE || k.br.Gecko || k.br.Opera){ if(!menu.pop){ menu.pop = getEL("pop1_4");}}
			else{ if(!menu.pop){ document.fileform.filebox.click();}}
		},
		dispsize : function(){
			menu.pop = getEL("pop4_1");
			document.dispsize.cs.value = k.def_csize;
			k.enableKey = false;
		},
		keypopup : function(){
			var f = kp.ctl[pp.flags['mode'].val].enable;
			getEL("ck_keypopup").disabled    = (f?"":"true");
			getEL("cl_keypopup").style.color = (f?"black":"silver");
		}
	}
};
