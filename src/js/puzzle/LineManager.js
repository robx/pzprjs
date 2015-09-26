// LineManager.js v3.4.1

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
LineManagerBase:{
	init : function(){
		if(this.enabled){
			var info = this.board.validinfo;
			for(var i=0;i<this.relation.length;i++){
				info[this.relation[i]].push(this);
			}
			info.all.push(this);
			this.init2();
		}
	},
	init2 : function(){},
	enabled : false,
	relation : ['line'],

	isLineCross : false,	// 線が交差するパズル

	ltotal : null,			// 線が0〜本引いてあるセル/交点がいくつあるか保持している

	//--------------------------------------------------------------------------------
	// linemgr.isvalid()    そのセルが有効かどうか返す
	// linemgr.iscrossing() そのセルで交差するかどうか返す
	//--------------------------------------------------------------------------------
	isvalid : function(border){
		return border.isLine();
	},
	iscrossing : function(){
		return this.isLineCross;
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
			paths[i].color = this.puzzle.painter.getNewLineColor();
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

		path = (!blist[0] ? this.addPath() : blist[0].path);
		path.objs.add(border);
		border.path = path;
	},
	removeLineInfo : function(border, blist){
		var path = border.path;
		if(path===null){ return;}

		path.objs.remove(border);
		if(path.objs.length===0){ this.removePath(path);}
		border.path = null;
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
		var path = {objs:(new this.PieceList()), color:this.puzzle.painter.getNewLineColor()};
		this.board.paths.push(path);
		return path;
	},
	removePath : function(path){
		var paths = this.board.paths, prop = this.pathname, idx = paths.indexOf(path);
		path.objs.each(function(border){ border[prop]=null;});
		return (idx>=0 ? paths.splice(idx, 1)[0].objs : []);
	},

	//--------------------------------------------------------------------------------
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(blist){
		// 周りで一番大きな線は？
		var largepath = null;
		for(var i=0,len=blist.length;i<len;i++){
			var path = blist[i].path;
			if(path===null){ continue;}
			if(largepath===null || largepath.objs.length < path.objs.length){
				largepath = path;
			}
		}
		return (!!largepath ? largepath.color : this.puzzle.painter.getNewLineColor());
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
			path.color = (path===longpath ? longColor : puzzle.painter.getNewLineColor());
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
			var lcnt = obj.lcnt+(this.isvalid(border)?0:1);
			if(obj.isnull){ }
			else if(this.iscrossing(obj)){
				var straightborder = obj.relbd((obj.bx-border.bx),(obj.by-border.by));
				if(lcnt===4){
					lines.add(straightborder); // objからのstraight
				}
				else if(lcnt===2 || (lcnt===3 && this.isvalid(straightborder))){
					lines.extend(obj.seglist);
					lines.remove(border);
				}
			}
			else if(lcnt>=2){
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
	}
},

"LineManager:LineManagerBase":{
	initialize : function(){
		this.enabled = (this.isCenterLine || this.borderAsLine);
	},
	init2 : function(){
		this.PieceList   = this.klass.BorderList;
		this.basegroup   = this.board.border;
		this.targetgroup = this.board[this.isCenterLine ? 'cell' : 'cross'];
	},

	// 下記の2フラグはどちらかがtrueになります(両方trueはだめです)
	isCenterLine : false,	// マスの真ん中を通る線を回答として入力するパズル
	borderAsLine : false	// 境界線をlineとして扱う
}
});
