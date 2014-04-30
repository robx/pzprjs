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
	/* 設定値 */
	list : {},

	//---------------------------------------------------------------------------
	// config.get()  各フラグの設定値を返す
	// config.set()  各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	get : function(name){
		return this.list[name]?this.list[name].val:null;
	},
	set : function(name, newval){
		this.configevent(name, newval);
		this.owner.execListener('config', name, newval);
	},

	//---------------------------------------------------------------------------
	// config.getAll()  全フラグの設定値を返す
	// config.setAll()  全フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getAll : function(){
		var object = {};
		for(var key in this.list){ object[key] = this.list[key].val;}
		return JSON.stringify(object);
	},
	setAll : function(json){
		var object = JSON.parse(json);
		for(var key in this.list){
			if(object[key]!==void 0){ this.list[key].val = object[key];}
		}
	},

	//---------------------------------------------------------------------------
	// config.init()        各設定値を初期化する
	//---------------------------------------------------------------------------
	init : function(){
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
		if(!option){ this.list[name] = {val:defvalue};}
		else{ this.list[name] = {val:defvalue, option:option};}
	},

	//---------------------------------------------------------------------------
	// config.configevent()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	configevent : function(name, newval){
		if(!this.list[name]){ return;}
		
		this.list[name].val = newval;

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