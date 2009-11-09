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
	// menu.menuinit()  メニュー、ボタン、サブメニュー、フロートメニュー、
	//                  ポップアップメニューの初期設定を行う
	// menu.menureset() メニュー用の設定を消去する
	//---------------------------------------------------------------------------
	menuinit : function(){
		this.buttonarea();
		this.menuarea();
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

		$("#popup_parent > .floatmenu").remove();
		$("#menupanel,#usepanel,#checkpanel").html("");
		if($("#btncolor2").length>0){ $("#btncolor2").remove();}
		$("#btnclear2").nextAll().remove();
		$("#outbtnarea").remove();

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

		$("#expression").html(base.expression.ja);
		if(k.PLAYER){ $("#ms_newboard,#ms_urloutput").attr("class", "smenunull");}
		if(k.PLAYER){ $("#ms_adjust").attr("class", "smenunull");}
		$("#ms_jumpv3,#ms_jumptop,#ms_jumpblog").css("font-size",'10pt').css("padding-left",'8pt');

		this.managearea();
	},

	addMenu : function(idname, strJP, strEN){
		var jqel = newEL("div").attr("class", 'menu').attr("id",'menu_'+idname).appendTo($("#menupanel"))
							   .html("["+strJP+"]").css("margin-right","4pt")
							   .hover(this.menuhover.ebind(this,idname), this.menuout.ebind(this));
		this.addLabels(jqel, "["+strJP+"]", "["+strEN+"]");
	},
	menuhover : function(e, idname){
		this.floatmenuopen(e,idname,0);
		$("div.menusel").attr("class", "menu");
		$(getSrcElement(e)).attr("class", "menusel");
	},
	menuout   : function(e){ if(!this.insideOfMenu(e)){ this.menuclear();} },
	menuclear : function(){
		$("div.menusel").attr("class", "menu");
		$("div.smenusel").attr("class", "smenu");
		$("#popup_parent > .floatmenu").hide();
		this.dispfloat = [];
	},

	//---------------------------------------------------------------------------
	// menu.submenuhover(e) サブメニューにマウスが乗ったときの表示設定を行う
	// menu.submenuout(e)   サブメニューからマウスが外れたときの表示設定を行う
	// menu.submenuclick(e) 通常/選択型/チェック型サブメニューがクリックされたときの動作を実行する
	// menu.checkclick()    管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	//---------------------------------------------------------------------------
	submenuhover : function(e, idname){
		if($(getSrcElement(e)).attr("class")=="smenu"){ $(getSrcElement(e)).attr("class", "smenusel");}
		if(pp.flags[idname] && pp.type(idname)==1){ this.floatmenuopen(e,idname,this.dispfloat.length);}
	},
	submenuout   : function(e, idname){
		if($(getSrcElement(e)).attr("class")=="smenusel"){ $(getSrcElement(e)).attr("class", "smenu");}
		if(pp.flags[idname] && pp.type(idname)==1){ this.floatmenuout(e);}
	},
	submenuclick : function(e, idname){
		if($(getSrcElement(e)).attr("class") == "smenunull"){ return;}
		this.menuclear();

		if(pp.type(idname)==0){
			this.popclose();							// 表示しているウィンドウがある場合は閉じる
			if(pp.funcs[idname]){ pp.funcs[idname]();}	// この中でthis.popupenuも設定されます。
			if(this.pop){
				this.pop.css("left", mv.pointerX(e) - 8 + k.IEMargin.x)
						.css("top",  mv.pointerY(e) - 8 + k.IEMargin.y).css("visibility", "visible");
			}
		}
		else if(pp.type(idname)==4){ this.setVal(pp.flags[idname].parent, pp.getVal(idname));}
		else if(pp.type(idname)==2){ this.setVal(idname, !pp.getVal(idname));}
	},
	checkclick : function(idname){ this.setVal(idname, $("#ck_"+idname).attr("checked"));},

	//---------------------------------------------------------------------------
	// menu.floatmenuopen()  マウスがメニュー項目上に来た時にフロートメニューを表示する
	// menu.floatmenuclose() フロートメニューをcloseする
	// menu.floatmenuout(e)  マウスがフロートメニューを離れた時にフロートメニューをcloseする
	// menu.insideOf()       イベントeがjQueryオブジェクトjqobjの範囲内で起こったか？
	// menu.insideOfMenu()   マウスがメニュー領域の中にいるか判定する
	//---------------------------------------------------------------------------
	floatmenuopen : function(e, idname, depth){
		this.floatmenuclose(depth);
		var src = $(getSrcElement(e));

		if(depth==0||this.dispfloat[depth-1]){
			if(depth==0){ this.floatpanel[idname].css("left", src.offset().left - 3 + k.IEMargin.x).css("top" , src.offset().top + src.height());}
			else        { this.floatpanel[idname].css("left", src.offset().left + src.width())     .css("top",  src.offset().top - 3);}
			this.floatpanel[idname].css("z-index",101+depth).css("visibility", "visible").show();
			this.dispfloat.push(idname);
		}
	},
	// マウスが離れたときにフロートメニューをクローズする
	// フロート->メニュー側に外れた時は、関数終了直後にfloatmenuopen()が呼ばれる
	floatmenuclose : function(depth){
		if(depth==0){ this.menuclear(); return;}
		for(var i=this.dispfloat.length-1;i>=depth;i--){
			if(this.dispfloat[i]){
				$("#ms_"+this.dispfloat[i]).attr("class", "smenu");
				this.floatpanel[this.dispfloat[i]].hide();
				this.dispfloat.pop();
			}
		}
	},
	floatmenuout : function(e){
		for(var i=this.dispfloat.length-1;i>=0;i--){
			if(this.insideOf(this.floatpanel[this.dispfloat[i]],e)){ this.floatmenuclose(i+1); return;}
		}
		this.menuclear();
	},

	insideOf : function(jqobj, e){
		var LT = new Pos(jqobj.offset().left, jqobj.offset().top);
		var ev = new Pos(mv.pointerX(e), mv.pointerY(e));
		return !(ev.x<=LT.x || ev.x>=LT.x+jqobj.width() || ev.y<=LT.y || ev.y>=LT.y+jqobj.height());
	},
	insideOfMenu : function(e){
		var upperLimit = $("#menu_file").offset().top;
		var leftLimit  = $("#menu_file").offset().left;
		var rightLimit = $("#menu_other").offset().left + $("#menu_other").width();
		var ex = mv.pointerX(e), ey = mv.pointerY(e);
		return (ex>leftLimit && ex<rightLimit && ey>upperLimit);
	},

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
		if(pp.type(idname)==0||pp.type(idname)==3){
			if($("#ms_"+idname)){ $("#ms_"+idname).html(pp.getMenuStr(idname));}
		}
		else if(pp.type(idname)==1){
			if($("#ms_"+idname)){ $("#ms_"+idname).html("&nbsp;"+pp.getMenuStr(idname));}	// メニュー上の表記の設定
			$("#cl_"+idname).html(pp.getLabel(idname));									// 管理領域上の表記の設定
			for(var i=0;i<pp.flags[idname].child.length;i++){ this.setdisplay(""+idname+"_"+pp.flags[idname].child[i]);}
		}
		else if(pp.type(idname)==4){
			var issel = (pp.getVal(idname) == pp.getVal(pp.flags[idname].parent));
			var cap = pp.getMenuStr(idname);
			$("#ms_"+idname).html((issel?"+":"&nbsp;")+cap);					// メニューの項目
			$("#up_"+idname).html(cap).attr("class", issel?"flagsel":"flag");	// 管理領域の項目
		}
		else if(pp.type(idname)==2){
			var flag = pp.getVal(idname);
			if($("#ms_"+idname)){ $("#ms_"+idname).html((flag?"+":"&nbsp;")+pp.getMenuStr(idname));}	// メニュー
			$("#ck_"+idname).attr("checked",flag);			// 管理領域(チェックボックス)
			$("#cl_"+idname).html(pp.getLabel(idname));		// 管理領域(ラベル)
		}
	},
	displayAll : function(){
		for(var i in pp.flags){ this.setdisplay(i);}
		$.each(this.btnstack,function(i,obj){obj.el.attr("value",obj.str[menu.language]);});
		$.each(this.labelstack,function(i,obj){obj.el.html(obj.str[menu.language]);});
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
				if(last>0 && last!=pp.type(idname)){ $("<div class=\"smenusep\">&nbsp;</div>").appendTo(floats);}
				last=pp.type(idname);
			}

			var smenu;
			if     (pp.type(idname)==5){ smenu = $("<div class=\"smenusep\">&nbsp;</div>");}
			else if(pp.type(idname)==3){ smenu = newEL("span").css("color", 'white');}
			else if(pp.type(idname)==1){
				smenu = newEL("div").attr("class", 'smenu').css("font-weight","900").css("font-size",'10pt')
									.hover(this.submenuhover.ebind(this,idname), this.submenuout.ebind(this,idname));
				this.getFloatpanel(idname);
			}
			else{
				smenu = newEL("div").attr("class", 'smenu')
									.hover(this.submenuhover.ebind(this,idname), this.submenuout.ebind(this,idname))
									.click(this.submenuclick.ebind(this,idname));
				if(pp.type(idname)!=0){ smenu.css("font-size",'10pt').css("padding-left",'6pt');}
			}
			smenu.attr("id","ms_"+idname).appendTo(floats);
			this.setdisplay(idname);
		}
		this.floatpanel[menuid] = floats;
	},
	getFloatpanel : function(id){
		if(!this.floatpanel[id]){
			this.floatpanel[id] = newEL("div")
				.attr("class", 'floatmenu').attr("id",'float_'+id).appendTo($("#popup_parent"))
				.css("background-color", base.floatbgcolor).css("z-index",101)
				.mouseout(this.floatmenuout.ebind(this)).hide();
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

			if(pp.type(idname)==1){
				$("#usepanel").append("<span id=\"cl_"+idname+"\">"+pp.getLabel(idname)+"</span> |&nbsp;");
				for(var i=0;i<pp.flags[idname].child.length;i++){
					var num = pp.flags[idname].child[i];
					var el = newEL('div').attr("class",((num==pp.getVal(idname))?"flagsel":"flag")).attr("id","up_"+idname+"_"+num)
										 .html(pp.getMenuStr(""+idname+"_"+num)).appendTo($("#usepanel"))
										 .click(pp.setVal.bind(pp,idname,num)).unselectable();
					$("#usepanel").append(" ");
				}
				$("#usepanel").append("<br>\n");
			}
			else if(pp.type(idname)==2){
				$("#checkpanel").append("<input type=\"checkbox\" id=\"ck_"+idname+"\""+(pp.getVal(idname)?' checked':'')+"> ")
								.append("<span id=\"cl_"+idname+"\"> "+pp.getLabel(idname)+"</span>");
				if(idname=="irowake"){
					$("#checkpanel").append("<input type=button id=\"ck_irowake2\" value=\"色分けしなおす\" onClick=\"javascript:menu.ex.irowakeRemake();\">");
					this.addButtons($("#ck_irowake2"), "色分けしなおす", "Change the color of Line");
				}
				$("#checkpanel").append("<br>\n");
				$("#ck_"+idname).click(this.checkclick.bind(this,idname));
			}
		}

		$("#translation").css("position","absolute").css("cursor","pointer")
						 .css("font-size","10pt").css("color","green").css("background-color","#dfdfdf")
						 .click(this.translate.bind(this)).unselectable();
		if(k.EDITOR){ $("#timerpanel,#separator2").hide();}
		if(k.irowake!=0){
			$("#btnarea").append("<input type=\"button\" id=\"btncolor2\" value=\"色分けしなおす\">");
			$("#btncolor2").click(menu.ex.irowakeRemake).hide();
			menu.addButtons($("#btncolor2"), "色分けしなおす", "Change the color of Line");
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
		var self = this;
		// Popupメニューを動かすイベント
		var popupfunc = function(){
			$(this).mousedown(self.titlebardown.ebind(self)).mouseup(self.titlebarup.ebind(self))
				   .mouseout(self.titlebarout.ebind(self)).mousemove(self.titlebarmove.ebind(self))
				   .unselectable();
		};
		$("div.titlebar,#credir3_1").each(popupfunc);

		//---------------------------------------------------------------------------
		//// formボタンのイベント
		var px = this.popclose.ebind(this);

		// 盤面の新規作成
		$(document.newboard.newboard).click(this.ex.newboard.ebind(this.ex));
		$(document.newboard.cancel).click(px);

		// URL入力
		$(document.urlinput.urlinput).click(this.ex.urlinput.ebind(this.ex));
		$(document.urlinput.cancel).click(px);

		// URL出力
		$(document.urloutput.ta).before(newEL('div').attr('id','outbtnarea'));
		var ib = function(name, strJP, strEN, eval){ if(!eval) return;
			var btn = newEL('input').attr('type','button').attr("name",name).click(this.ex.urloutput.ebind(this.ex));
			$("#outbtnarea").append(btn).append("<br>");
			this.addButtons(btn, strJP, strEN);
		}.bind(this);
		ib('pzprv3', "ぱずぷれv3のURLを出力する", "Output PUZ-PRE v3 URL", true);
		ib('pzprapplet', "ぱずぷれ\(アプレット\)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", !k.ispzprv3ONLY);
		ib('kanpen', "カンペンのURLを出力する", "Output Kanpen URL", k.isKanpenExist);
		ib('heyaapp', "へやわけアプレットのURLを出力する", "Output Heyawake-Applet URL", (k.puzzleid=="heyawake"));
		ib('pzprv3edit', "ぱずぷれv3の再編集用URLを出力する", "Output PUZ-PRE v3 Re-Edit URL", true);
		$("#outbtnarea").append("<br>\n");
		$(document.urloutput.openurl).click(this.ex.openurl.ebind(this.ex));
		$(document.urloutput.close).click(px);

		this.addButtons($(document.urloutput.openurl), "このURLを開く", "Open this URL on another window/tab");
		this.addButtons($(document.urloutput.close),   "閉じる", "Close");

		// ファイル入力
		$(document.fileform.filebox).change(this.ex.fileopen.ebind(this.ex));
		$(document.fileform.close).click(px);

		// データベースを開く
		$(document.database.sorts   ).change(fio.displayDataTableList.ebind(fio));
		$(document.database.datalist).change(fio.selectDataTable.ebind(fio));
		$(document.database.tableup ).click(fio.upDataTable.ebind(fio));
		$(document.database.tabledn ).click(fio.downDataTable.ebind(fio));
		$(document.database.open    ).click(fio.openDataTable.ebind(fio));
		$(document.database.save    ).click(fio.saveDataTable.ebind(fio));
		$(document.database.comedit ).click(fio.editComment.ebind(fio));
		$(document.database.difedit ).click(fio.editDifficult.ebind(fio));
		$(document.database.del     ).click(fio.deleteDataTable.ebind(fio));
		$(document.database.close   ).click(px);

		// 盤面の調整
		var pa = this.ex.popupadjust.ebind(this.ex);
		$(document.adjust.expandup).click(pa);
		$(document.adjust.expanddn).click(pa);
		$(document.adjust.expandlt).click(pa);
		$(document.adjust.expandrt).click(pa);
		$(document.adjust.reduceup).click(pa);
		$(document.adjust.reducedn).click(pa);
		$(document.adjust.reducelt).click(pa);
		$(document.adjust.reducert).click(pa);
		$(document.adjust.close   ).click(px);

		// 反転・回転
		$(document.flip.turnl).click(pa);
		$(document.flip.turnr).click(pa);
		$(document.flip.flipy).click(pa);
		$(document.flip.flipx).click(pa);
		$(document.flip.close).click(px);

		// credit
		$(document.credit.close).click(px);

		// 表示サイズ
		$(document.dispsize.dispsize).click(this.ex.dispsize.ebind(this));
		$(document.dispsize.cancel).click(px);
	},
	popclose : function(){
		if(this.pop){
			this.pop.css("visibility","hidden");
			this.pop = '';
			this.menuclear();
			this.isptitle = 0;
			k.enableKey = true;
		}
	},

	//---------------------------------------------------------------------------
	// menu.titlebardown() Popupタイトルバーをクリックしたときの動作を行う
	// menu.titlebarup()   Popupタイトルバーでボタンを離したときの動作を行う
	// menu.titlebarout()  Popupタイトルバーからマウスが離れたときの動作を行う
	// menu.titlebarmove() Popupタイトルバーからマウスを動かしたときポップアップメニューを動かす
	//---------------------------------------------------------------------------
	titlebardown : function(e){
		this.isptitle = 1;
		this.offset.x = mv.pointerX(e) - parseInt(this.pop.css("left"));
		this.offset.y = mv.pointerY(e) - parseInt(this.pop.css("top"));
	},
	titlebarup   : function(e){ this.isptitle = 0; },
	titlebarout  : function(e){ if(this.pop && !this.insideOf(this.pop, e)){ this.isptitle = 0;} },
	titlebarmove : function(e){
		if(this.pop && this.isptitle){
			this.pop.css("left", (mv.pointerX(e) - this.offset.x));
			this.pop.css("top" , (mv.pointerY(e) - this.offset.y));
		}
	},

//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.buttonarea()        ボタンの初期設定を行う
	// menu.addButtons()        ボタンの情報を変数に登録する
	// menu.addLAbels()         ラベルの情報を変数に登録する
	// menu.setDefaultButtons() ボタンをbtnstackに設定する
	// menu.setDefaultLabels()  ラベルをspanstackに設定する
	//---------------------------------------------------------------------------
	buttonarea : function(){
		this.addButtons($("#btncheck").click(ans.check.bind(ans)),              "チェック", "Check");
		this.addButtons($("#btnundo").click(um.undo.bind(um)),                  "戻",       "<-");
		this.addButtons($("#btnredo").click(um.redo.bind(um)),                  "進",       "->");
		this.addButtons($("#btnclear").click(menu.ex.ACconfirm.bind(menu.ex)),  "回答消去", "Erase Answer");
		this.addButtons($("#btnclear2").click(menu.ex.ASconfirm.bind(menu.ex)), "補助消去", "Erase Auxiliary Marks");
		$("#btnarea,#btnundo,#btnredo,#btnclear,#btnclear2").unselectable();

		this.setDefaultButtons();
		this.setDefaultLabels();
	},
	addButtons : function(jqel, strJP, strEN){ this.btnstack.push({el:jqel, str:{ja:strJP, en:strEN}}); },
	addLabels  : function(jqel, strJP, strEN){ this.labelstack.push({el:jqel, str:{ja:strJP, en:strEN}}); },

	setDefaultButtons : function(){
		var t = this.addButtons.bind(this);
		t($(document.newboard.newboard), "新規作成",   "Create");
		t($(document.newboard.cancel),   "キャンセル", "Cancel");
		t($(document.urlinput.urlinput), "読み込む",   "Import");
		t($(document.urlinput.cancel),   "キャンセル", "Cancel");
		t($(document.fileform.button),   "閉じる",     "Close");
		t($(document.database.save),     "盤面を保存", "Save");
		t($(document.database.comedit),  "コメントを編集する", "Edit Comment");
		t($(document.database.difedit),  "難易度を設定する",   "Set difficulty");
		t($(document.database.open),     "データを読み込む",   "Load");
		t($(document.database.del),      "削除",       "Delete");
		t($(document.database.close),    "閉じる",     "Close");
		t($(document.adjust.expandup),   "上",         "UP");
		t($(document.adjust.expanddn),   "下",         "Down");
		t($(document.adjust.expandlt),   "左",         "Left");
		t($(document.adjust.expandrt),   "右",         "Right");
		t($(document.adjust.reduceup),   "上",         "UP");
		t($(document.adjust.reducedn),   "下",         "Down");
		t($(document.adjust.reducelt),   "左",         "Left");
		t($(document.adjust.reducert),   "右",         "Right");
		t($(document.adjust.close),      "閉じる",     "Close");
		t($(document.flip.turnl),        "左90°回転", "Turn left by 90 degree");
		t($(document.flip.turnr),        "右90°回転", "Turn right by 90 degree");
		t($(document.flip.flipy),        "上下反転",   "Flip upside down");
		t($(document.flip.flipx),        "左右反転",   "Flip leftside right");
		t($(document.flip.close),        "閉じる",     "Close");
		t($(document.dispsize.dispsize), "変更する",   "Change");
		t($(document.dispsize.cancel),   "キャンセル", "Cancel");
		t($(document.credit.close),      "閉じる",     "OK");
	},
	setDefaultLabels : function(){
		var t = this.addLabels.bind(this);
		t($("#translation"), "English",                      "日本語");
		t($("#bar1_1"),      "&nbsp;盤面の新規作成",         "&nbsp;Createing New Board");
		t($("#pop1_1_cap0"), "盤面を新規作成します。",       "Create New Board.");
		t($("#pop1_1_cap1"), "よこ",                         "Cols");
		t($("#pop1_1_cap2"), "たて",                         "Rows");
		t($("#bar1_2"),      "&nbsp;URL入力",                "&nbsp;Import from URL");
		t($("#pop1_2_cap0"), "URLから問題を読み込みます。",  "Import a question from URL.");
		t($("#bar1_3"),      "&nbsp;URL出力",                "&nbsp;Export URL");
		t($("#bar1_4"),      "&nbsp;ファイルを開く",         "&nbsp;Open file");
		t($("#pop1_4_cap0"), "ファイル選択",                 "Choose file");
		t($("#bar1_8"),      "&nbsp;データベースの管理",     "&nbsp;Database Management");
		t($("#pop1_8_com"),  "コメント:",                    "Comment:");
		t($("#bar2_1"),      "&nbsp;盤面の調整",             "&nbsp;Adjust the board");
		t($("#pop2_1_cap0"), "盤面の調整を行います。",       "Adjust the board.");
		t($("#pop2_1_cap1"), "拡大",                         "Expand");
		t($("#pop2_1_cap2"), "縮小",                         "Reduce");
		t($("#bar2_2"),      "&nbsp;反転・回転",             "&nbsp;Flip/Turn the board");
		t($("#pop2_2_cap0"), "盤面の回転・反転を行います。", "Flip/Turn the board.");
		t($("#bar4_1"),      "&nbsp;表示サイズの変更",       "&nbsp;Change size");
		t($("#pop4_1_cap0"), "表示サイズを変更します。",     "Change the display size.");
		t($("#pop4_1_cap1"), "表示サイズ",                   "Display size");
		t($("#bar3_1"),      "&nbsp;credit",                 "&nbsp;credit");
		t($("#credit3_1"), "ぱずぷれv3 "+pzprversion+"<br>\n<br>\nぱずぷれv3は はっぱ/連続発破が作成しています。<br>\nライブラリとしてjQuery1.3.2, uuCanvas1.0, <br>Google Gearsを\n使用しています。<br>\n<br>\n",
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
		$("#title2").html(base.gettitle());
		$("#expression").html(base.expression[this.language]);

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
};
Properties.prototype = {
	reset : function(){
		this.flags    = [];
		this.flaglist = [];
	},

	// pp.setMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を設定する
	addSmenuToFlags : function(idname, parent)       { this.addToFlags(idname, parent, 0, 0);},
	addCheckToFlags : function(idname, parent, first){ this.addToFlags(idname, parent, 2, first);},
	addCaptionToFlags     : function(idname, parent) { this.addToFlags(idname, parent, 3, 0);},
	addSeparatorToFlags   : function(idname, parent) { this.addToFlags(idname, parent, 5, 0);},
	addUseToFlags   : function(idname, parent, first, child){
		this.addToFlags(idname, parent, 1, first);
		this.flags[idname].child = child;
	},
	addUseChildrenToFlags : function(idname, parent){
		if(!this.flags[idname]){ return;}
		for(var i=0;i<this.flags[idname].child.length;i++){
			var num = this.flags[idname].child[i];
			this.addToFlags(""+idname+"_"+num, parent, 4, num);
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
	// pp.getVal()     各フラグのvalの値を返す
	// pp.setVal()     各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.flags[idname].str[menu.language].menu; },
	getLabel   : function(idname){ return this.flags[idname].str[menu.language].label;},
	type : function(idname){ return this.flags[idname].type;},

	getVal : function(idname)  { return this.flags[idname]?this.flags[idname].val:0;},
	setVal : function(idname, newval){
		if(!this.flags[idname]){ return;}
		else if(this.type(idname)==1 || this.type(idname)==2){
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
		var as = this.addSmenuToFlags.bind(this),
			au = this.addUseToFlags.bind(this),
			ac = this.addCheckToFlags.bind(this),
			aa = this.addCaptionToFlags.bind(this),
			ai = this.addUseChildrenToFlags.bind(this),
			ap = this.addSeparatorToFlags.bind(this);

		au('mode','setting',(k.editmode?1:3),[1,3]);

		puz.menufix();	// 各パズルごとのメニュー追加

		ac('autocheck','setting',k.autocheck);
		ac('lrcheck','setting',false);
		ac('keypopup','setting',kp.defaultdisp);
		au('language','setting',0,[0,1]);
		if(k.PLAYER){ delete this.flags['mode'];}
		if(!kp.ctl[1].enable && !kp.ctl[3].enable){ delete this.flags['keypopup'];}

		as('newboard', 'file');
		as('urlinput', 'file');
		as('urloutput', 'file');
		ap('sep_2','file');
		as('fileopen', 'file');
		as('filesave', 'file');
		as('database', 'file');
		ap('sep_3','file');
		as('fileopen2', 'file');
		as('filesave2', 'file');
		if(fio.DBtype==0){ delete this.flags['database'];}
		if(!k.isKanpenExist || (k.puzzleid=="nanro"||k.puzzleid=="ayeheya"||k.puzzleid=="kurochute")){
			delete this.flags['fileopen2']; delete this.flags['filesave2']; delete this.flags['sep_3'];
		}

		as('adjust', 'edit');
		as('turn', 'edit');

		au('size','disp',k.widthmode,[0,1,2,3,4]);
		ap('sep_4','disp');
		ac('irowake','disp',(k.irowake==2?true:false));
		ap('sep_5','disp');
		as('manarea', 'disp');
		if(k.irowake==0){ delete this.flags['irowake']; delete this.flags['sep_4'];}

		as('dispsize', 'size');
		aa('cap_dispmode', 'size');
		ai('size','size');

		ai('mode','mode');

		ai('language','language');

		as('credit', 'other');
		aa('cap_others1', 'other');
		as('jumpv3', 'other');
		as('jumptop', 'other');
		as('jumpblog', 'other');

		this.setStringToFlags();
	},
	setStringToFlags : function(){
		var sm = this.setMenuStr.bind(this),
			sl = this.setLabel.bind(this);

		sm('size', '表示サイズ', 'Cell Size');
		sm('size_0', 'サイズ 極小', 'Ex Small');
		sm('size_1', 'サイズ 小', 'Small');
		sm('size_2', 'サイズ 標準', 'Normal');
		sm('size_3', 'サイズ 大', 'Large');
		sm('size_4', 'サイズ 特大', 'Ex Large');

		sm('irowake', '線の色分け', 'Color coding');
		sl('irowake', '線の色分けをする', 'Color each lines');

		sm('mode', 'モード', 'mode');
		sl('mode', 'モード', 'mode');
		sm('mode_1', '問題作成モード', 'Edit mode');
		sm('mode_3', '回答モード', 'Answer mode');

		sm('autocheck', '正答自動判定', 'Auto Answer Check');

		sm('lrcheck', 'マウス左右反転', 'Mouse button inversion');
		sl('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');

		sm('keypopup', 'パネル入力', 'Panel inputting');
		sl('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');

		sm('language', '言語', 'Language');
		sm('language_0', '日本語', '日本語');
		sm('language_1', 'English', 'English');

		sm('newboard', '新規作成', 'New Board');
		sm('urlinput', 'URL入力', 'Import from URL');
		sm('urloutput', 'URL出力', 'Export URL');
		sm('fileopen', 'ファイルを開く', 'Open the file');
		sm('filesave', 'ファイル保存', 'Save the file as ...');
		sm('database', 'データベースの管理', 'Database Management');
		sm('fileopen2', 'pencilboxのファイルを開く', 'Open the pencilbox file');
		sm('filesave2', 'pencilboxのファイルを保存', 'Save the pencilbox file as ...');
		sm('adjust', '盤面の調整', 'Adjust the Board');
		sm('turn', '反転・回転', 'Filp/Turn the Board');
		sm('dispsize', 'サイズ指定', 'Cell Size');
		sm('cap_dispmode', '&nbsp;表示モード', '&nbsp;Display mode');
		sm('manarea', '管理領域を隠す', 'Hide Management Area');
		sm('credit', 'ぱずぷれv3について', 'About PUZ-PRE v3');
		sm('cap_others1', '&nbsp;リンク', '&nbsp;Link');
		sm('jumpv3', 'ぱずぷれv3のページへ', 'Jump to PUZ-PRE v3 page');
		sm('jumptop', '連続発破保管庫TOPへ', 'Jump to indi.s58.xrea.com');
		sm('jumpblog', 'はっぱ日記(blog)へ', 'Jump to my blog');

		sm('eval', 'テスト用', 'for Evaluation');
	},

//--------------------------------------------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	funcs : {
		urlinput  : function(){ menu.pop = $("#pop1_2");},
		urloutput : function(){ menu.pop = $("#pop1_3"); document.urloutput.ta.value = "";},
		filesave  : function(){ menu.ex.filesave();},
		database  : function(){ menu.pop = $("#pop1_8"); fio.getDataTableList();},
		filesave2 : function(){ if(fio.kanpenSave){ menu.ex.filesave2();}},
		adjust    : function(){ menu.pop = $("#pop2_1");},
		turn      : function(){ menu.pop = $("#pop2_2");},
		credit    : function(){ menu.pop = $("#pop3_1");},
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
			menu.pop = $("#pop1_1");
			if(k.puzzleid!="sudoku"){
				document.newboard.col.value = k.qcols;
				document.newboard.row.value = k.qrows;
			}
			k.enableKey = false;
		},
		fileopen : function(){
			document.fileform.pencilbox.value = "0";
			if(k.br.IE || k.br.Gecko || k.br.Opera){ if(!menu.pop){ menu.pop = $("#pop1_4");}}
			else{ if(!menu.pop){ document.fileform.filebox.click();}}
		},
		fileopen2 : function(){
			if(!fio.kanpenOpen){ return;}
			document.fileform.pencilbox.value = "1";
			if(k.br.IE || k.br.Gecko || k.br.Opera){ if(!menu.pop){ menu.pop = $("#pop1_4");}}
			else{ if(!menu.pop){ document.fileform.filebox.click();}}
		},
		dispsize : function(){
			menu.pop = $("#pop4_1");
			document.dispsize.cs.value = k.def_csize;
			k.enableKey = false;
		},
		keypopup : function(){
			var f = kp.ctl[pp.flags['mode'].val].enable;
			$("#ck_keypopup").attr("disabled", f?"":"true");
			$("#cl_keypopup").css("color",f?"black":"silver");
		}
	}
};
