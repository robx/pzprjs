// Config.js v3.4.1

(function(){
//---------------------------------------------------------------------------
// ★Configクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
var Config = pzpr.Puzzle.prototype.Config = function(owner){
	this.owner = owner;
	this.init();
};
Config.prototype =
{
	list : null,		/* 設定値 */

	//---------------------------------------------------------------------------
	// config.init()        各設定値を初期化する
	// config.add()         初期化時に設定を追加する
	//---------------------------------------------------------------------------
	init : function(){
		this.list = {};

		/* 全般的な設定 */
		this.add('language', pzpr.util.getUserLang(), ['ja','en']);	/* 言語設定 */

		/* 盤面表示設定 */
		this.add('font', 1, [1,2]);								/* 文字の描画 1:ゴシック 2:明朝 */
		this.add('cursor', true);								/* カーソルの表示 */
		this.add('irowake', false);								/* 線の色分け */
		this.add('irowakeblk', false);							/* 黒マスの色分け */

		this.add('dispmove', true);								/* 線で動かすパズルで実際に動いたように描画 */
		this.add('disptype_pipelinkr', 1, [1,2]);				/* pipelinkr: 表示形式 */
		this.add('disptype_bosanowa', 1, [1,2,3]);				/* bosanowa: 表示形式 */
		this.add('snakebd', false);								/* snakes: へびの境界線を表示する */

		this.add('squarecell', true);							/* セルは正方形にする */
		this.add('fixsize', false);								/* 拡大縮小してもcanvasのサイズを変えない */

		/* 表示色の設定 */
		this.add('color_qanscolor', "");						/* 黒マスの表示色の表示 */

		/* 入力方法設定 */
		this.add('use', (!pzpr.env.API.touchevent?1:2), [1,2]);	/* 黒マスの入力方法 */
		this.add('use_tri', 1, [1,2,3]);						/* shakashaka: 三角形の入力方法 */

		this.add('lrcheck', false);			/* マウス左右反転 */

		this.add('keytarget', true);		/* 盤面をキー入力のターゲットにする */

		this.add('bgcolor', false);			/* 背景色入力 */
		this.add('enline', true);			/* kouchoku: 線は点の間のみ引ける */
		this.add('lattice', true);			/* kouchoku: 格子点チェック */

		/* 補助入力設定 */
		this.add('redline', false);			/* 線の繋がりチェック */
		this.add('redblk', false);			/* 黒マスつながりチェック */
		this.add('redblkrb', false);		/* 連黒分断禁黒マス繋がりチェック */
		this.add('redroad', false);			/* roma: ローマの通り道チェック */

		/* 回答お助け機能 */
		this.add('autocmp', false);			/* 数字 or kouchokuの正解の点をグレーにする */
		this.add('autoerr', false);			/* hitori:ひとくれの重複した数字を表示, gokigen,wagiri:斜線の色分け */

		/* 正解判定 */
		this.add('enbnonum', false);		/* fillomino: 数字がすべて入っていなくても正解とする */

		/* EDITORのみ */
		this.add('bdpadding', true);		/* goishi: URL出力で1マス余裕を持って出力する */
		this.add('discolor', false);		/* tentaisho: 色分け無効化 */
	},
	add : function(name, defvalue, option){
		var item = {val:defvalue, defval:defvalue};
		if(!!option){ item.option = option;}
		this.list[name] = item;
	},

	//---------------------------------------------------------------------------
	// config.get()  各フラグの設定値を返す
	// config.set()  各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	get : function(name){
		return this.list[name]?this.list[name].val:null;
	},
	set : function(name, newval){
		if(!this.list[name]){ return;}
		this.setproper(name, newval);
		this.configevent(name, newval);
		this.owner.execListener('config', name, newval);
	},

	//---------------------------------------------------------------------------
	// config.getAll()  全フラグの設定値を返す
	// config.setAll()  全フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getAll : function(){
		var object = {};
		for(var key in this.list){
			var item = this.list[key];
			if(item.val!==item.defval){ object[key] = item.val;}
		}
		return JSON.stringify(object);
	},
	setAll : function(json){
		var object = JSON.parse(json);
		this.init();
		for(var key in this.list){
			if(object[key]!==void 0){ this.setproper(key,object[key]);}
		}
	},

	//---------------------------------------------------------------------------
	// config.setproper()    設定値の型を正しいものに変換して設定変更する
	// config.gettype()      設定値の持つ型を返す
	//---------------------------------------------------------------------------
	setproper : function(name, newval){
		var item = this.list[name];
		switch(typeof item.defval){
			case "boolean": item.val = !!newval;  break;
			case "number":  item.val = +newval;   break;
			case "string":  item.val = ""+newval; break;
		}
	},
	gettype : function(name){
		return (typeof this.list[name].defval);
	},

	//---------------------------------------------------------------------------
	// config.getexec()  設定値を現在のパズルで有効かどうか返す
	//---------------------------------------------------------------------------
	getexec : function(name){
		var puzzle = this.owner, pid = puzzle.pid, flags = puzzle.flags, exec = false;
		switch(name){
			case 'use':      exec = flags.use; break;
			case 'use_tri':  exec = (pid==="shakashaka"); break;
			case 'dispmove': exec = puzzle.board.linfo.moveline; break;
			case 'disptype_pipelinkr': exec = (pid==="pipelinkr"); break;
			case 'disptype_bosanowa':  exec = (pid==="bosanowa"); break;
			case 'bgcolor':  exec = flags.bgcolor; break;
			case 'irowake':  exec = flags.irowake; break;
			case 'irowakeblk':exec= flags.irowakeblk; break;
			case 'snakebd':  exec = (pid==="snakes"); break;
			case 'redline':  exec = flags.redline;   break;
			case 'redblk':   exec = flags.redblk;    break;
			case 'redblkrb': exec = flags.redblkrb;  break;
			case 'redroad':  exec = (pid==="roma"); break;
			case 'autocmp':  exec = (flags.autocmp!==''); break;
			case 'autoerr':  exec = (pid==="hitori"||pid==="gokigen"||pid==="wagiri"); break;
			case 'enbnonum': exec = (pid==="fillomino"); break;
			case 'enline': case'lattice': exec = (pid==="kouchoku"); break;
			case 'bdpadding': exec = (pzpr.EDITOR && pid==='goishi'); break;
			case 'discolor':  exec = (pzpr.EDITOR && pid==='tentaisho'); break;
			default: exec = !!this.list[name];
		}
		return exec;
	},

	//---------------------------------------------------------------------------
	// config.configevent()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	configevent : function(name, newval){
		var result = true, puzzle = this.owner;
		switch(name){
		case 'irowake': case 'cursor': case 'autocmp': case 'autoerr':
		case 'snakebd': case 'disptype_pipelinkr': case 'dispmove':
			puzzle.redraw();
			break;
		
		case 'disptype_bosanowa': case 'font':
			puzzle.adjustCanvasSize();
			break;
		
		case 'keytarget':
			this.owner.key.setfocus();
			break;
		
		case 'color_qanscolor':
			puzzle.painter.setColor('qanscolor', newval);
			break;
		
		default:
			result = false;
			break;
		}
		return result;
	}
};

pzpr.classmgr.makeCommon({
//---------------------------------------------------------------------------
// ★Flagsクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
Flags:{
	/* フラグ */
	use      : false,
	autocmp  : '',
	redline  : false,
	redblk   : false,
	redblkrb : false,
	bgcolor  : false,
	irowake    : false,			// 色分け設定
	irowakeblk : false,			// 色分け設定

	disable_subclear : false	// "補助消去"ボタンを作らない
}
});

})();