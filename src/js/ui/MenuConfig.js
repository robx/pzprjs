// MenuConfig.js v3.4.1
/* global pzpr:false, ui:false */

(function(){
//---------------------------------------------------------------------------
// ★MenuConfigクラス UI側の設定値を管理する
//---------------------------------------------------------------------------
var Config = pzpr.Puzzle.prototype.Config.prototype;

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
		this.add('keyboard', false);						/* 盤面をキー入力のターゲットにする */

		this.add('adjsize', true);							/* 自動横幅調節 */
		this.add('cellsizeval', 36);						/* セルのサイズ設定用 */
		this.add('fullwidth', (ui.windowWidth()<600));		/* キャンバスを横幅いっぱいに広げる */
		
		this.add('toolarea', 1, [0,1]);						/* ツールエリアの表示 */
	},
	add : Config.add,

	//---------------------------------------------------------------------------
	// menu.set()   アイスと○などの表示切り替え時の処理を行う
	// menu.get()   html上の[戻][進]ボタンを押すことが可能か設定する
	//---------------------------------------------------------------------------
	set : function(idname, newval){
		if(!this.list[idname]){ return;}
		newval = this.setproper(idname, newval);
		this.configevent(idname,newval);
	},
	get : Config.get,

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
	setAll : Config.setAll,

	//---------------------------------------------------------------------------
	// menuconfig.setproper()    設定値の型を正しいものに変換して設定変更する
	// menuconfig.valid()        設定値が有効なパズルかどうかを返す
	//---------------------------------------------------------------------------
	setproper : Config.setproper,
	valid : function(idname){
		if(idname==="keypopup"){ return (ui.keypopup.paneltype[1]!==0 || ui.keypopup.paneltype[3]!==0);}
		return !!this.list[idname];
	},

	//---------------------------------------------------------------------------
	// config.configevent()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	configevent : function(idname, newval){
		ui.setdisplay(idname);
		switch(idname){
		case 'keypopup':
			ui.keypopup.display();
			break;
			
		case 'keyboard':
			ui.misc.setkeyfocus();
			break;
			
		case 'adjsize': case 'cellsizeval': case 'fullwidth':
			ui.adjustcellsize();
			break;
		}
	}
};

})();