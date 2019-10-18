// ToolArea.js v3.4.0
/* global getEL:readonly */

// メニュー描画/取得/html表示系
// toolareaオブジェクト
ui.toolarea = {
	items : null,		// ツールパネルのエレメント等を保持する
	captions : [],		// 言語指定を切り替えた際のキャプションを保持する

	//---------------------------------------------------------------------------
	// toolarea.reset()  ツールパネル・ボタン領域の初期設定を行う
	//---------------------------------------------------------------------------
	reset : function(){
		if(this.items===null){
			this.items = {};
			this.walkElement(getEL("usepanel"));
			this.walkElement(getEL("checkpanel"));
			this.walkElement(getEL('btnarea'));
		}
		ui.misc.displayByPid(getEL("checkpanel"));
		ui.misc.displayByPid(getEL("btnarea"));

		this.display();
	},

	//---------------------------------------------------------------------------
	// toolarea.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement : function(parent){
		var toolarea = this;
		function btnfactory(role){
			return function(e){ toolarea[role](e); if(e.type!=='click'){ e.preventDefault(); e.stopPropagation();}};
		}
		function addbtnevent(el,type,role){ pzpr.util.addEvent(el, type, toolarea, btnfactory(role));}
		ui.misc.walker(parent, function(el){
			if(el.nodeType===1){
				/* ツールパネル領域 */
				var parent, idname;
				if(el.className==="config"){
					toolarea.items[ui.customAttr(el,"config")] = {el:el};
				}
				else if(el.className.match(/child/)){
					parent = el.parentNode.parentNode, idname = ui.customAttr(parent,"config");
					var item = toolarea.items[idname];
					if(!item.children){ item.children=[];}
					item.children.push(el);

					addbtnevent(el, "mousedown", "toolclick");
				}
				else if(el.nodeName==="INPUT" && el.type==="checkbox"){
					parent = el.parentNode, idname = ui.customAttr(parent,"config");
					if(!idname){ parent = parent.parentNode, idname = ui.customAttr(parent,"config"); }
					if(!idname){ return;}
					toolarea.items[idname].checkbox=el;

					addbtnevent(el, "click", "toolclick");
				}

				/* ボタン領域 */
				var role = ui.customAttr(el,"buttonExec");
				if(!!role){
					addbtnevent(el, (!pzpr.env.API.touchevent ? "click" : "mousedown"), role);
				}
				role = ui.customAttr(el,"pressExec");
				if(!!role){
					var roles = role.split(/,/);
					addbtnevent(el, "mousedown", roles[0]);
					if(!!role[1]){
						addbtnevent(el, "mouseup", roles[1]);
						addbtnevent(el, "mouseleave", roles[1]);
						addbtnevent(el, "touchcancel", roles[1]);
					}
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
		/* ツールパネル領域 */
		/* -------------- */
		var mandisp  = (ui.menuconfig.get("toolarea") ? 'block' : 'none');
		getEL('usepanel').style.display = mandisp;
		getEL('checkpanel').style.display = mandisp;
		/* 経過時間の表示/非表示設定 */
		getEL('separator2').style.display = (ui.puzzle.playeronly ? "" : "none");
		getEL('timerpanel').style.display = (ui.puzzle.playeronly ? "block" : "none");

		for(var idname in this.items){ this.setdisplay(idname);}

		/* ボタン領域 */
		/* --------- */
		getEL('btnarea').style.display = "";
		pzpr.util.unselectable(getEL('btnarea'));

		this.setdisplay("operation");
		getEL('btnclear2').style.display  = (!ui.puzzle.board.disable_subclear ? "" : "none");
		getEL('btncircle').style.display  = (ui.puzzle.pid==='pipelinkr' ? "" : "none");
		getEL('btncolor').style.display   = (ui.puzzle.pid==='tentaisho' ? "" : "none");
		/* ボタンエリアの色分けボタンは、ツールパネル領域が消えている時に表示 */
		getEL('btnirowake').style.display = ((ui.puzzle.painter.irowake && !ui.menuconfig.get("toolarea")) ? "" : "none");
		getEL('btnirowakeblk').style.display = ((ui.puzzle.painter.irowakeblk && !ui.menuconfig.get("toolarea")) ? "" : "none");
		this.setdisplay("trialmode");

		/* 共通：キャプションの設定 */
		/* --------------------- */
		for(var i=0;i<this.captions.length;i++){
			var obj = this.captions[i];
			obj.textnode.data = ui.selectStr(obj.str_jp, obj.str_en);
		}
	},
	setdisplay : function(idname){
		if(idname==="operation"){
			var opemgr = ui.puzzle.opemgr;
			getEL('btnundo').style.color = (!opemgr.enableUndo ? 'silver' : '');
			getEL('btnredo').style.color = (!opemgr.enableRedo ? 'silver' : '');
		}
		else if(idname==="trialmode"){
			var trialstage = ui.puzzle.board.trialstage;
			getEL('btnclear').style.display     = ((trialstage>0) ? 'none' : '');
			getEL('btntrial').style.color       = ((trialstage>0) ? 'silver' : '');
			getEL('btntrialarea').style.display = ((trialstage>0) ? 'block' : 'none');

			getEL('btntrialr').style.display  = ((trialstage<=1) ? '' : 'none');
			getEL('btntrialr2').style.display = ((trialstage>1)  ? '' : 'none');
			getEL('btntrialra').style.display = ((trialstage>1)  ? '' : 'none');
		}
		else if(this.items===null || !this.items[idname]){
			/* DO NOTHING */
		}
		else if(ui.menuconfig.valid(idname)){
			var toolitem = this.items[idname];
			toolitem.el.style.display = "";

			var disabled = null;
			/* 子要素の設定を行う */
			if(!!toolitem.children){
				var children = toolitem.children;
				var validval = (idname==='inputmode' ? ui.puzzle.mouse.getInputModeList() : null);
				for(var i=0;i<children.length;i++){
					var child = children[i], value = ui.customAttr(child,"value"), selected = (value===""+ui.menuconfig.get(idname));
					child.className = (selected ? "child childsel" : "child");
					child.style.display = ((validval===null || validval.indexOf(value)>=0) ? '' : 'none');
				}

				if(idname==="inputmode"){ disabled = (validval.length===1);}
				if(disabled!==null){ toolitem.el.className = (!disabled ? "" : "disabled");}
			}
			/* チェックボックスの表記の設定 */
			else if(!!toolitem.checkbox){
				var check = toolitem.checkbox;
				if(!!check){ check.checked = ui.menuconfig.get(idname);}

				if(idname==="keypopup"){ disabled = !ui.keypopup.paneltype[ui.puzzle.editmode?1:3];}
				if(idname==="bgcolor") { disabled = ui.puzzle.editmode;}
				if(idname==="passallcell"||idname==="aquarium_regions"){ disabled = !ui.puzzle.editmode;}
				if(disabled!==null){ toolitem.checkbox.disabled = (!disabled ? "" : "true");}
			}

			if((idname==="disptype_pipelinkr") && !!getEL('btncircle')){
				getEL('btncircle').innerHTML = ((ui.menuconfig.get(idname)===1)?"○":"■");
			}
		}
		else if(!!this.items[idname]){
			this.items[idname].el.style.display = "none";
		}
	},

	//---------------------------------------------------------------------------
	// toolarea.toolclick()   ツールパネルの入力があった時、設定を変更する
	//---------------------------------------------------------------------------
	toolclick : function(e){
		var el = e.target, parent = el.parentNode;
		var idname = ui.customAttr(parent,"config")||ui.customAttr(parent.parentNode,"config"), value;
		if(!!this.items[idname].checkbox){ value = !!el.checked;}
		else                             { value = ui.customAttr(el,"value");}
		ui.menuconfig.set(idname, value);
	},

	//---------------------------------------------------------------------------
	// Canvas下にあるボタンが押された/放された時の動作
	//---------------------------------------------------------------------------
	answercheck : function(){ ui.menuarea.answercheck();},
	undo     : function(){ ui.undotimer.startUndo();},
	undostop : function(){ ui.undotimer.stopUndo();},
	redo     : function(){ ui.undotimer.startRedo();},
	redostop : function(){ ui.undotimer.stopRedo();},
	ansclear : function(){ ui.menuarea.answerclear();},
	subclear : function(){ ui.menuarea.submarkclear();},
	irowake  : function(){ ui.puzzle.irowake();},
	encolorall : function(){ ui.puzzle.board.encolorall();}, /* 天体ショーのボタン */
	dropblocks : function(){ ui.puzzle.board.operate('drop');},
	resetblocks: function(){ ui.puzzle.board.operate('resetpos');},
	showgatenum: function(){ ui.puzzle.board.operate('showgatenumber');},
	hidegatenum: function(){ ui.puzzle.board.operate('hidegatenumber');},
	enterTrial : function(){ if(ui.puzzle.board.trialstage===0){ ui.puzzle.enterTrial();}},
	enterFurtherTrial : function(){ ui.puzzle.enterTrial();},
	acceptTrial : function(){ ui.puzzle.acceptTrial();},
	rejectTrial : function(){ ui.puzzle.rejectTrial();},
	rejectCurrentTrial : function(){ ui.puzzle.rejectCurrentTrial();},

	//---------------------------------------------------------------------------
	// toolarea.toggledisp()   帰ってきたパイプリンクでアイスと○などの表示切り替え時の処理を行う
	//---------------------------------------------------------------------------
	toggledisp : function(){
		var current = ui.menuconfig.get('disptype_pipelinkr');
		ui.menuconfig.set('disptype_pipelinkr', (current===1?2:1));
	}
};
