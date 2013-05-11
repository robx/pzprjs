// ManageArea.js v3.4.0
(function(){

/* uiオブジェクト生成待ち */
if(!window.ui){ setTimeout(setTimeout(arguments.callee),15); return;}

var k = pzprv3.consts;

// メニュー描画/取得/html表示系
// ManageAreaオブジェクト
/* extern */
ui.managearea = {

	isdisp : true,		// 表示しているか

	//---------------------------------------------------------------------------
	// managearea.init()   管理領域の初期設定を行う
	// managearea.reset()  管理領域用の設定を消去する
	//---------------------------------------------------------------------------
	init : function(){
		this.createArea();
	},

	reset : function(){
		this.btnstack   = [];

		getEL('usepanel')  .innerHTML = '';
		getEL('checkpanel').innerHTML = '';
	},

	//---------------------------------------------------------------------------
	// managearea.addButtons() ボタンの情報を変数に登録する
	//---------------------------------------------------------------------------
	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		pzprv3.unselectable(el);
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// managearea.createArea()  管理領域を初期化する
	//---------------------------------------------------------------------------
	createArea : function(){
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
		var pp = ui.menu.items;
		for(var idname in pp.item){
			if(!pp.getLabel(idname)){ continue;}
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

	//---------------------------------------------------------------------------
	// managearea.display()    全てのラベルに対して文字列を設定する
	// managearea.setdisplay() 管理パネルに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	display : function(){
		for(var i in ui.menu.items.item){ this.setdisplay(i);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			if(!this.btnstack[i].el){ continue;}
			this.btnstack[i].el.value = this.btnstack[i].str[ui.menu.getMenuConfig('language')];
		}
		
		var mandisp  = (this.isdisp ? 'block' : 'none');
		getEL('usepanel').style.display = mandisp;
		getEL('checkpanel').style.display = mandisp;
		if(!pzprv3.EDITOR){
			getEL('separator2').style.display = mandisp;
		}
		if(ui.puzzle.flags.irowake){
			/* ボタンエリアのボタンは、管理領域が消えている時に表示 */
			getEL('btncolor2').style.display = (this.isdisp ? 'none' : 'inline');
		}
		getEL('menuboard').style.paddingBottom = (this.isdisp ? '8pt' : '0pt');
		
		if(pzprv3.browser.IE6){
			getEL('separator2').style.margin = '0pt';
		}
	},
	setdisplay : function(idname){
		var pp = ui.menu.items;
		if(!pp || !pp.item[idname]){ return;}
		
		switch(pp.type(idname)){
		case pp.SELECT:
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = pp.getLabel(idname);}
			
			/* 子要素の設定も行う */
			for(var i=0,len=pp.item[idname].children.length;i<len;i++){
				this.setdisplay(""+idname+"_"+pp.item[idname].children[i]);
			}
			break;

		case pp.CHILD:
			var manage = getEL('up_'+idname);
			if(!!manage){
				var val = ui.menu.getConfigVal(pp.item[idname].parent);
				manage.innerHTML = pp.getMenuStr(idname);
				manage.className = ((pp.item[idname].val == val)?"childsel":"child");
			}
			break;

		case pp.CHECK:
			/* チェックボックスの表記の設定 */
			var check = getEL('ck_'+idname);
			if(!!check){ check.checked = ui.menu.getConfigVal(idname);}
			/* ラベルの表記の設定 */
			var label = getEL('cl_'+idname);
			if(!!label){ label.innerHTML = pp.getLabel(idname);}
			break;
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
	},

	//---------------------------------------------------------------------------
	// managearea.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// managearea.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	//---------------------------------------------------------------------------
	checkclick : function(e){
		var el = (e.target||e.srcElement);
		var idname = el.id.substr(3);
		ui.menu.setConfigVal(idname, !!el.checked);
	},
	selectclick : function(e){
		var list = (e.target||e.srcElement).id.split('_');
		list.shift();
		var child = list.pop(), idname = list.join("_");
		ui.menu.setConfigVal(idname, child);
	}
};

var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createButton(){
	button = pzprv3.createEL('input');
	button.type = 'button';
	return button;
}

})();
