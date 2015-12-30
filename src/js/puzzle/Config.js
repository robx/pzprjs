// Config.js v3.4.1

(function(){
//---------------------------------------------------------------------------
// ★Configクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
var Config = pzpr.Puzzle.prototype.Config = function(puzzle){
	this.puzzle = puzzle;
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

		/* 表示色の設定 */
		this.add('color_qanscolor', "");						/* 黒マスの表示色の表示 */

		/* 入力方法設定 */
		this.add('use', (!pzpr.env.API.touchevent?1:2), [1,2]);	/* 黒マスの入力方法 */
		this.add('use_tri', 1, [1,2,3]);						/* shakashaka: 三角形の入力方法 */

		this.add('lrcheck', false);			/* マウス左右反転 */

		this.add('bgcolor', false);			/* 背景色入力 */
		this.add('dirauxmark', true);		/* nagare: 方向の補助記号を入力 */
		this.add('enline', true);			/* kouchoku: 線は点の間のみ引ける */
		this.add('lattice', true);			/* kouchoku: 格子点チェック */

		/* 補助入力設定 */
		this.add('redline', false);			/* 線の繋がりチェック */
		this.add('redblk', false);			/* 黒マスつながりチェック (連黒分断禁も) */
		this.add('redroad', false);			/* roma: ローマの通り道チェック */

		/* 回答お助け機能 */
		this.add('autocmp', false);			/* 数字 or kouchokuの正解の点をグレーにする */
		this.add('autoerr', false);			/* hitori:ひとくれの重複した数字を表示, gokigen,wagiri:斜線の色分け */

		/* 正解判定 */
		this.add('multierr', false);		/* エラー判定で複数エラーを出力する */

		/* EDITORのみ */
		this.add('bdpadding', true);		/* goishi: URL出力で1マス余裕を持って出力する */
		this.add('discolor', false);		/* tentaisho: 色分け無効化 */

		/* その他の特殊項目(保存なし) */
		this.add('mode', (this.puzzle.editmode?1:3), [1,3]);		/* mode 1:問題入力モード 3:回答入力モード */
		this.add('uramashu', false);		/* 裏ましゅにする */
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
		if(!this.list[name] || (name==="mode" && this.puzzle.playeronly)){ return;}
		newval = this.setproper(name, newval);
		this.configevent(name, newval);
		this.puzzle.emit('config', name, newval);
	},

	//---------------------------------------------------------------------------
	// config.getList()  現在有効な設定値のリストを返す
	//---------------------------------------------------------------------------
	getList : function(){
		var conf = {};
		for(var idname in this.list){
			if(this.getexec(idname)){ conf[idname] = this.get(idname);}
		}
		return conf;
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
		delete object.mode;
		delete object.uramashu;
		return object;
	},
	setAll : function(settings){
		this.init();
		for(var key in this.list){
			if(settings[key]!==void 0){ this.setproper(key,settings[key]);}
		}
	},

	//---------------------------------------------------------------------------
	// config.setproper()    設定値の型を正しいものに変換して設定変更する
	//---------------------------------------------------------------------------
	setproper : function(name, newval){
		var item = this.list[name];
		switch(typeof item.defval){
			case "boolean": item.val = !!newval;  break;
			case "number":  item.val = +newval;   break;
			case "string":  item.val = ""+newval; break;
		}
		return item.val;
	},

	//---------------------------------------------------------------------------
	// config.getexec()  設定値を現在のパズルで有効かどうか返す
	//---------------------------------------------------------------------------
	getexec : function(name){
		var puzzle = this.puzzle, pid = puzzle.pid, EDITOR = !puzzle.playeronly, exec = false;
		switch(name){
			case 'use':      exec = puzzle.mouse.use; break;
			case 'use_tri':  exec = (pid==="shakashaka"); break;
			case 'dispmove': exec = puzzle.board.linegraph.moveline; break;
			case 'disptype_pipelinkr': exec = (pid==="pipelinkr"); break;
			case 'disptype_bosanowa':  exec = (pid==="bosanowa"); break;
			case 'bgcolor':  exec = puzzle.mouse.bgcolor; break;
			case 'irowake':  exec = puzzle.painter.irowake; break;
			case 'irowakeblk':exec= puzzle.painter.irowakeblk; break;
			case 'snakebd':  exec = (pid==="snakes"); break;
			case 'redline':  exec = puzzle.mouse.redline; break;
			case 'redblk':   exec = puzzle.mouse.redblk;  break;
			case 'redroad':  exec = (pid==="roma"); break;
			case 'autocmp':  exec = (puzzle.painter.autocmp!==''); break;
			case 'autoerr':  exec = (pid==="hitori"||pid==="gokigen"||pid==="wagiri"); break;
			case 'dirauxmark': exec = (pid==="nagare"); break;
			case 'enline': case'lattice': exec = (pid==="kouchoku"); break;
			case 'bdpadding': exec = (EDITOR && pid==='goishi'); break;
			case 'discolor':  exec = (EDITOR && pid==='tentaisho'); break;
			case 'mode':     exec = EDITOR; break;
			case 'uramashu': exec = (pid==="mashu"); break;
			default: exec = !!this.list[name];
		}
		return exec;
	},

	//---------------------------------------------------------------------------
	// config.configevent()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	configevent : function(name, newval){
		var puzzle = this.puzzle, bd = puzzle.board;
		switch(name){
		case 'irowake': case 'font': case 'cursor': case 'autocmp': case 'autoerr':
		case 'snakebd': case 'disptype_pipelinkr': case 'dispmove':
			puzzle.redraw();
			break;
		
		case 'multierr':
			puzzle.checker.resetCache();
			break;
		
		case 'disptype_bosanowa':
			puzzle.setCanvasSizeByCellSize();	/* セルのサイズを変えないために、この関数を引数なしで呼び出す */
			break;
		
		case 'color_qanscolor':
			puzzle.painter.setColor('qanscolor', newval);
			break;
		
		case "mode":
			puzzle.editmode = (newval===puzzle.MODE_EDITOR);
			puzzle.playmode = (newval===puzzle.MODE_PLAYER);
			if(puzzle.ready){
				puzzle.cursor.adjust_modechange();
				puzzle.key.keyreset();
				puzzle.mouse.mousereset();
				if(bd.haserror){
					bd.errclear();
				}
				else{
					puzzle.redraw();
				}
			}
			break;
		
		case 'uramashu':
			bd.uramashu = newval;
			bd.revCircleMain();
			puzzle.redraw();
			break;
		}
	}
};

})();