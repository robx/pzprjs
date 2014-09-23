// MenuConfig.js v3.4.1
/* global ui:false */

//---------------------------------------------------------------------------
// ★MenuConfigクラス UI側の設定値を管理する
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
ui.menuconfig = {

	list : null,			// MenuConfigの設定内容を保持する

	//---------------------------------------------------------------------------
	// menuconfig.init()  MenuConfigの初期化を行う
	// menuconfig.add()   初期化時に設定を追加する
	//---------------------------------------------------------------------------
	init : function(){
		this.list = {};
		
		this.add('autocheck', pzpr.PLAYER);					/* 正解自動判定機能 */
		
		this.add('keypopup', false);						/* キーポップアップ (数字などのパネル入力) */
		
		this.add('adjsize', true);							/* 自動横幅調節 */
		this.add('cellsize', 2, [0,1,2,3,4]);				/* 表示サイズ */
		this.add('cellsizeval', 36);						/* セルのサイズ設定用 */
		this.add('fullwidth', (ui.windowWidth()<600));		/* キャンバスを横幅いっぱいに広げる */
	},
	add : function(name, defvalue, option){
		var item = {val:defvalue, defval:defvalue};
		if(!!option){ item.option = option;}
		this.list[name] = item;
	},

	//---------------------------------------------------------------------------
	// menu.set()   アイスと○などの表示切り替え時の処理を行う
	// menu.get()   html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	set : function(idname, newval){
		if(!this.list[idname]){ return;}
		this.setproper(idname, newval);
		ui.setdisplay(idname);
		switch(idname){
		case 'keypopup':
			ui.keypopup.display();
			break;
			
		case 'adjsize': case 'cellsize': case 'fullwidth':
			ui.event.adjustcellsize();
			break;
		}
	},
	get : function(idname){
		return (!!this.list[idname]?this.list[idname].val:null);
	},

	//---------------------------------------------------------------------------
	// menu.getAll()  全フラグの設定値を返す
	// menu.setAll()  全フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getAll : function(){
		var object = {};
		for(var key in this.list){
			var item = this.list[key];
			if(item.val!==item.defval){ object[key] = item.val;}
		}
		delete object.autocheck;
		return JSON.stringify(object);
	},
	setAll : function(json){
		var object = JSON.parse(json);
		this.init();
		for(var key in this.list){
			if(object[key]!==void 0){ this.setproper(key, object[key]);}
		}
	},

	//---------------------------------------------------------------------------
	// menuconfig.setproper()    設定値の型を正しいものに変換して設定変更する
	//---------------------------------------------------------------------------
	setproper : function(idname, newval){
		var item = this.list[idname];
		switch(typeof item.defval){
			case "boolean": item.val = !!newval;  break;
			case "number":  item.val = +newval;   break;
			case "string":  item.val = ""+newval; break;
		}
	}
};
