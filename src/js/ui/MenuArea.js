// MenuArea.js v3.4.0
/* global ui:false, getEL:false */

// メニュー描画/取得/html表示系
ui.menuarea = {
	captions : [],				// 言語指定を切り替えた際のキャプションを保持する
	menuitem : null,			// メニューの設定切り替え用エレメント等を保持する
	
	//---------------------------------------------------------------------------
	// menuarea.reset()  メニュー、サブメニュー、フロートメニューの初期設定を行う
	//---------------------------------------------------------------------------
	reset : function(){
		this.createMenu();
		
		this.display();
	},

	//---------------------------------------------------------------------------
	// menuarea.createMenu()  メニューの初期設定を行う
	//---------------------------------------------------------------------------
	createMenu : function(){
		if(this.menuitem===null){
			this.menuitem = {};
			this.walkElement(getEL("menupanel"));
		}
		this.walkElement2(getEL("menupanel"));
	},

	//---------------------------------------------------------------------------
	// menuarea.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement : function(parent){
		var menuarea = this;
		ui.misc.walker(parent, function(el){
			if(el.nodeType===1 && el.nodeName==="LI"){
				var setevent = false;
				var idname = ui.customAttr(el,"config");
				if(!!idname){
					menuarea.menuitem[idname] = {el:el};
					if(el.className==="check"){
						pzpr.util.addEvent(el, "mousedown", menuarea, menuarea.checkclick);
						setevent = true;
					}
				}
				var value = ui.customAttr(el,"value");
				if(!!value){
					var parent = el.parentNode.parentNode, idname = ui.customAttr(parent,"config");
					var item = menuarea.menuitem[idname];
					if(!item.children){ item.children=[];}
					item.children.push(el);
					
					pzpr.util.addEvent(el, "mousedown", menuarea, menuarea.childclick);
					setevent = true;
				}
				
				var role = ui.customAttr(el,"menuExec");
				if(!!role){
					pzpr.util.addEvent(el, "mousedown", menuarea, menuarea[role]);
					setevent = true;
				}
				role = ui.customAttr(el,"popup");
				if(!!role){
					pzpr.util.addEvent(el, "mousedown", menuarea, menuarea.disppopup);
					setevent = true;
				}
				
				if(!setevent){
					pzpr.util.addEvent(el, "mousedown", menuarea, function(e){ e.preventDefault();});
				}
			}
			else if(el.nodeType===1 && el.nodeName==="MENU"){
				var label = el.getAttribute("label");
				if(!!label && label.match(/^__(.+)__(.+)__$/)){
					menuarea.captions.push({menu:el, str_jp:RegExp.$1, str_en:RegExp.$2});
				}
			}
			else if(el.nodeType===3){
				if(el.data.match(/^__(.+)__(.+)__$/)){
					menuarea.captions.push({textnode:el, str_jp:RegExp.$1, str_en:RegExp.$2});
				}
			}
		});
	},
	walkElement2 : function(parent){
		ui.misc.walker(parent, function(el){
			if(el.nodeType===1 && el.nodeName==="SPAN"){
				var disppid = ui.customAttr(el,"dispPid");
				if(!!disppid){ el.style.display = (pzpr.util.checkpid(disppid, ui.puzzle.pid) ? "" : "none");}
			}
		});
	},
	
	//---------------------------------------------------------------------------
	// menuarea.display()    全てのメニューに対して文字列を設定する
	// menuarea.setdisplay() サブメニューに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display : function(){
		getEL('menupanel').style.display = "";
		
		getEL("menu_database").className  = (pzpr.env.storage.localST ? "" : "disabled");
		getEL("menu_imagesave").className = ((ui.enableSaveImage || ui.enableSaveSVG) ? "" : "disabled");
		
		getEL("menu_duplicate").className = (pzpr.env.storage.session ? "" : "disabled");
		getEL("menu_subclear").style.display  = (!ui.puzzle.flags.disable_subclear ? "" : "none");
		
		for(var idname in this.menuitem){ this.setdisplay(idname);}
		this.setdisplay("operation");
		
		/* キャプションの設定 */
		for(var i=0;i<this.captions.length;i++){
			var obj = this.captions[i];
			if(!!obj.textnode) { obj.textnode.data = ui.selectStr(obj.str_jp, obj.str_en);}
			else if(!!obj.menu){ obj.menu.setAttribute("label", ui.selectStr(obj.str_jp, obj.str_en));}
		}
	},
	setdisplay : function(idname){
		if(idname==="operation"){
			var opemgr = ui.puzzle.opemgr;
			getEL('menu_oldest').className = (opemgr.enableUndo ? "" : "disabled");
			getEL('menu_undo').className   = (opemgr.enableUndo ? "" : "disabled");
			getEL('menu_redo').className   = (opemgr.enableRedo ? "" : "disabled");
			getEL('menu_latest').className = (opemgr.enableRedo ? "" : "disabled");
		}
		else if(idname==="toolarea"){
			var str;
			if(!ui.toolarea.isdisp){ str = ui.selectStr("管理領域を表示","Show management area");}
			else                   { str = ui.selectStr("管理領域を隠す","Hide management area");}
			getEL('menu_toolarea').innerHTML = str;
		}
		else if(this.menuitem===null || !this.menuitem[idname]){
			/* DO NOTHING */
		}
		else if(ui.validConfig(idname)){
			var menuitem = this.menuitem[idname];
			menuitem.el.style.display = "";
			
			/* セレクタ部の設定を行う */
			if(!!menuitem.children){
				var children = menuitem.children;
				for(var i=0;i<children.length;i++){
					var child = children[i], selected = (ui.customAttr(child,"value")===""+ui.getConfig(idname));
					child.className = (selected ? "checked" : "");
				}
			}
			/* Check部の表記の変更 */
			else if(!!menuitem.el){
				menuitem.el.className = (ui.getConfig(idname) ? "checked" : "check");
			}
		}
		else if(!!this.menuitem[idname]){
			this.menuitem[idname].el.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// menuarea.checkclick()   メニューから設定値の入力があった時、設定を変更する
	// menuarea.childclick()   メニューから設定値の入力があった時、設定を変更する
	//---------------------------------------------------------------------------
	checkclick : function(e){
		var el = e.target;
		if(el.nodeName==="SPAN"){ el = el.parentNode;}
		
		var idname = ui.customAttr(el,"config");
		ui.setConfig(idname, !ui.getConfig(idname));
	},
	childclick : function(e){
		var el = e.target;
		if(el.nodeName==="SPAN"){ el = el.parentNode;}
		
		var parent = el.parentNode.parentNode;
		ui.setConfig(ui.customAttr(parent,"config"), ui.customAttr(el,"value"));
	},

	//---------------------------------------------------------------------------
	// メニューがクリックされた時の動作を呼び出す
	//---------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	undoall : function(){ ui.puzzle.undoall();},
	undo    : function(){ ui.puzzle.undo();},
	redo    : function(){ ui.puzzle.redo();},
	redoall : function(){ ui.puzzle.redoall();},
	anscheck : function(){ this.answercheck();},
	ansclear : function(){ this.ACconfirm();},
	subclear : function(){ this.ASconfirm();},
	duplicate: function(){ this.duplicate_board();},
	toolarea : function(){
		ui.toolarea.isdisp = !ui.toolarea.isdisp;
		ui.displayAll();
		ui.puzzle.adjustCanvasSize();
		this.setdisplay("toolarea");
	},
	repaint : function(){ ui.puzzle.redraw();},
	jumpexp : function(){
		ui.saveConfig();	/* faq.htmlで言語設定を使用するので、一旦Config値を保存 */
		window.open('./faq.html?'+ui.puzzle.pid+(pzpr.EDITOR?"_edit":""), '');
	},
	disppopup : function(e){
		var el = e.target;
		if(el.nodeName==="SPAN"){ el = el.parentNode;}
		if(el.className!=="disabled"){
			var idname = ui.customAttr(el,"popup");
			var pos = pzpr.util.getPagePos(e);
			ui.popupmgr.open(idname, pos.px-8, pos.py-8);
		}
	},
	dispdebug : function(){ ui.popupmgr.open("debug", 0, 0);},

	//------------------------------------------------------------------------------
	// menuarea.duplicate_board() 盤面の複製を行う => 受取はBoot.jsのimportFileData()
	//------------------------------------------------------------------------------
	duplicate_board : function(){
		if(getEL("menu_duplicate").className==="disabled"){ return;}
		var filestr = ui.puzzle.getFileData(pzpr.parser.FILE_PZPH);
		var url = './p.html?'+ui.puzzle.pid+(pzpr.PLAYER?"_play":"");
		if(!pzpr.env.browser.Presto){
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
	// menuarea.answercheck()「正答判定」ボタンを押したときの処理
	// menuarea.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menuarea.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	answercheck : function(){
		window.alert( ui.puzzle.check(true).text() );
	},
	ACconfirm : function(){
		if(ui.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			ui.puzzle.ansclear();
		}
	},
	ASconfirm : function(){
		if(ui.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
			ui.puzzle.subclear();
		}
	}
};
