// LineManager.js v3.4.1

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
LineManager:{
	initialize : function(){
		this.enabled = (this.isCenterLine || this.borderAsLine);
	},
	init : function(){
		if(this.enabled){
			this.board.validinfo.line.push(this);
			this.board.validinfo.all.push(this);
			this.PieceList   = this.klass.BorderList;
			this.basegroup   = this.board.border;
			this.targetgroup = this.board[this.isCenterLine ? 'cell' : 'cross'];
		}
	},
	// relation : ['line'],

	ltotal : null,			// 線が0〜本引いてあるセル/交点がいくつあるか保持している

	// 下記の2フラグはどちらかがtrueになります(両方trueはだめです)
	isCenterLine : false,	// マスの真ん中を通る線を回答として入力するパズル
	borderAsLine : false,	// 境界線をlineとして扱う

	isLineCross : false,	// 線が交差するパズル

	//--------------------------------------------------------------------------------
	// linemgr.isvalid()    そのセルが有効かどうか返す
	// linemgr.iscrossing() そのセルで交差するかどうか返す
	//--------------------------------------------------------------------------------
	isvalid : function(border){
		return border.isLine();
	},
	iscrossing : function(){
		return this.board.linemgr.isLineCross;
	},

	//---------------------------------------------------------------------------
	// linemgr.reset()       lcnts等の変数の初期化を行う
	// linemgr.rebuild()     既存の情報からデータを再設定する
	// linemgr.newIrowake()  線の情報が再構築された際、線に色をつける
	//---------------------------------------------------------------------------
	reset : function(){
		this.board.paths = [];
		for(var c=0;c<this.targetgroup.length;c++){
			this.targetgroup[c].lcnt=0;
			this.targetgroup[c].seglist=new this.PieceList();
		}
		this.ltotal=[this.targetgroup.length];

		this.rebuild();
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		var blist = new this.PieceList();
		for(var id=0;id<this.basegroup.length;id++){
			var border = this.basegroup[id];
			border.path = null;
			if(this.isvalid(border)){
				blist.add(border);
				this.incdecLineCount(border, true);
			}
		}

		this.searchLine(blist);
		if(this.puzzle.flags.irowake){ this.newIrowake();}
	},
	newIrowake : function(){
		var paths = this.board.paths;
		for(var i=0;i<paths.length;i++){
			paths[i].objs.setColor(this.puzzle.painter.getNewLineColor());
		}
	},

	//---------------------------------------------------------------------------
	// linemgr.incdecLineCount() 線が引かれたり消された時に、lcnt変数, seglistを生成し直す
	//---------------------------------------------------------------------------
	incdecLineCount : function(border, isset){
		for(var i=0;i<2;i++){
			var obj = border.lineedge[i];
			if(!obj.isnull){
				this.ltotal[obj.lcnt]--;
				if(isset){ obj.lcnt++; obj.seglist.add(border);}
				else     { obj.lcnt--; obj.seglist.remove(border);}
				this.ltotal[obj.lcnt] = (this.ltotal[obj.lcnt] || 0) + 1;
			}
		}
	},

	//---------------------------------------------------------------------------
	// linemgr.setLine()     線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setLine : function(border){
		if(!this.enabled){ return;}

		var isset = this.isvalid(border);
		if(isset===(border.path!==null)){ return;}

		this.incdecLineCount(border, isset);

		var blist = this.getaround(border);
		if(blist.length<=1){
			if(isset){ this.assignLineInfo(border, blist);} // 新しい線idを割り当て or 既存の線にくっつける
			else     { this.removeLineInfo(border, blist);} // 線idの削除 or 既存の線から削除する
		}
		// つながる線が2つ以上ある場合 -> 分かれた線にそれぞれ新しい線idをふる
		else{
			this.remakeLineInfo(border, blist);
		}
	},

	//---------------------------------------------------------------------------
	// linemgr.assignLineInfo()  指定された線を有効な線として設定する
	// linemgr.removeLineInfo()  指定されたセルを無効なセルとして設定する
	// linemgr.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                           可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	assignLineInfo : function(border, blist){
		var path = border.path;
		if(path!==null){ return;}

		if(!blist[0]){
			path = this.addPath();
			border.color = this.puzzle.painter.getNewLineColor();
		}
		else{
			path = blist[0].path;
			border.color  = blist[0].color;
		}
		path.objs.add(border);
		border.path = path;
	},
	removeLineInfo : function(border, blist){
		var path = border.path;
		if(path===null){ return;}

		path.objs.remove(border);
		if(path.objs.length===0){ this.removePath(path);}
		border.path = null;
		border.color = "";
	},
	remakeLineInfo : function(border, blist_sub){
		if(this.isvalid(border)){ blist_sub.add(border);}
		else{ this.removeLineInfo(border);}
		
		var longColor = this.getLongColor(blist_sub);
		
		// つながった線の線情報を一旦0にする
		var blist = new this.PieceList();
		for(var i=0;i<blist_sub.length;i++){
			var path = blist_sub[i].path;
			if(path!==null){ blist.extend(this.removePath(path));}
			else           { blist.add(blist_sub[i]);}
		}

		// 新しいidを設定する
		var newpaths = this.searchLine(blist);

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		this.setLongColor(newpaths, longColor);
	},

	//--------------------------------------------------------------------------------
	// info.addArea()    新しく割り当てるidを取得する
	// info.removeArea() 部屋idを無効にする
	//--------------------------------------------------------------------------------
	addPath : function(){
		var path = {objs:(new this.PieceList())};
		this.board.paths.push(path);
		return path;
	},
	removePath : function(path){
		var paths = this.board.paths, idx = paths.indexOf(path);
		path.objs.each(function(border){ border.path=null;});
		return (idx>=0 ? paths.splice(idx, 1)[0].objs : []);
	},

	//--------------------------------------------------------------------------------
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(blist){
		// 周りで一番大きな線は？
		var largepath = null, longColor = "";
		for(var i=0,len=blist.length;i<len;i++){
			var path = blist[i].path;
			if(path===null){ continue;}
			if(largepath===null || largepath.objs.length < path.objs.length){
				largepath = path;
				longColor = blist[i].color;
			}
		}
		return (!!longColor ? longColor : this.puzzle.painter.getNewLineColor());
	},
	setLongColor : function(newpaths, longColor){
		var puzzle = this.puzzle;
		/* newpaths:新しく生成されたpathの配列 */
		var blist_all = new this.PieceList();
		
		// できた線の中でもっとも長いものを取得する
		var longpath = newpaths[0];
		for(var i=1;i<newpaths.length;i++){
			if(longpath.objs.length < newpaths[i].objs.length){ longpath = newpaths[i];}
		}
		
		// 新しい色の設定
		for(var i=0;i<newpaths.length;i++){
			var path = newpaths[i];
			path.objs.setColor(path===longpath ? longColor : puzzle.painter.getNewLineColor());
			blist_all.extend(path.objs);
		}
		
		if(puzzle.execConfig('irowake')){ puzzle.painter.repaintLines(blist_all);}
	},

	//---------------------------------------------------------------------------
	// linemgr.getaround()     自分に線が存在するものとして、自分に繋がる線(最大6箇所)を全て取得する
	//---------------------------------------------------------------------------
	getaround : function(border){
		var lines = new this.PieceList();
		for(var i=0;i<2;i++){
			var obj = border.lineedge[i];
			if(obj.isnull){ }
			else if(this.iscrossing(obj)){
				var lcnt = obj.lcnt+(this.isvalid(border)?0:1);
				var straightborder = obj.relbd((obj.bx-border.bx),(obj.by-border.by));
				if(lcnt>=4){
					lines.add(straightborder); // objからのstraight
				}
				else if(lcnt<3 || this.isvalid(straightborder)){
					lines.extend(obj.seglist);
					lines.remove(border);
				}
			}
			else{
				lines.extend(obj.seglist);
				lines.remove(border);
			}
		}
		return lines;
	},

	//---------------------------------------------------------------------------
	// linemgr.searchLine()   ひとつながりの線にlineidを設定する
	// linemgr.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//---------------------------------------------------------------------------
	searchLine : function(blist){
		var newpaths = [];
		for(var i=0,len=blist.length;i<len;i++){
			blist[i].path = null;
		}
		for(var i=0,len=blist.length;i<len;i++){
			if(blist[i].path!==null){ continue;}	// 既にidがついていたらスルー
			var newpath = this.addPath();
			this.searchSingle(blist[i], newpath);
			newpaths.push(newpath);
		}
		return newpaths;
	},
	searchSingle : function(startborder, newpath){
		var stack = [startborder];
		while(stack.length>0){
			var border = stack.pop();
			if(border.path!==null||!this.isvalid(border)){ continue;}

			border.path = newpath;
			newpath.objs.add(border);

			stack = stack.concat(Array.prototype.slice.apply(this.getaround(border)));
		}
	},

	//---------------------------------------------------------------------------
	// info.setLineShapeInfo()    丸などで区切られた線を探索し情報を付加して返します
	// info.serachLineShapeInfo() 丸などで区切られた線を探索します
	//---------------------------------------------------------------------------
	// 丸の場所で線を切り離して考える
	setLineShapeInfo : function(){
		var bd = this.board;
		bd.pathsegs = [];
		for(var id=0;id<bd.bdmax;id++){ bd.border[id].pathseg = null;}

		var clist = this.board.cell.filter(function(cell){ return cell.isNum();});
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], adb = cell.adjborder;
			var dir4bd = [adb.top, adb.bottom, adb.left, adb.right];
			for(var a=0;a<4;a++){
				var firstbd = dir4bd[a];
				if(firstbd.isnull){ continue;}

				var pathseg = this.serachLineShapeInfo(cell,(a+1));
				if(!!pathseg){ bd.pathsegs.push(pathseg);}
			}
		}
	},
	serachLineShapeInfo : function(cell1,dir){
		var pathseg = {
			objs  :(new this.PieceList()),
			cells : [cell1,null],	// 出発したセル、到達したセル
			ccnt  : 0,				// 曲がった回数
			length: [],				// 曲がった箇所で区切った、それぞれの線分の長さの配列
			dir1  : dir,			// dir1 スタート地点で線が出発した方向
			dir2  : 0				// dir2 到達地点から見た、到達した線の方向
		};

		var pos = cell1.getaddr();
		while(1){
			pos.movedir(dir,1);
			if(pos.oncell()){
				var cell = pos.getc(), adb = cell.adjborder;
				if(cell.isnull || cell1===cell || cell.isNum()){ break;}
				else if(this.iscrossing(cell) && cell.lcnt>=3){ }
				else if(dir!==1 && adb.bottom.isLine()){ if(dir!==2){ pathseg.ccnt++;} dir=2;}
				else if(dir!==2 && adb.top.isLine()   ){ if(dir!==1){ pathseg.ccnt++;} dir=1;}
				else if(dir!==3 && adb.right.isLine() ){ if(dir!==4){ pathseg.ccnt++;} dir=4;}
				else if(dir!==4 && adb.left.isLine()  ){ if(dir!==3){ pathseg.ccnt++;} dir=3;}
			}
			else{
				var border = pos.getb();
				if(border.isnull || !border.isLine() || border.pathseg!==null){ break;}

				pathseg.objs.add(border);
				border.pathseg = pathseg;

				if(isNaN(pathseg.length[pathseg.ccnt])){ pathseg.length[pathseg.ccnt]=1;}else{ pathseg.length[pathseg.ccnt]++;}
			}
		}
		
		if(pathseg.objs.length>0){
			pathseg.cells[1] = pos.getc();
			pathseg.dir2 = [0,2,1,4,3][dir];
			return pathseg;
		}
		return null;
	}
}
});
