// LineManager.js v3.4.1

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
LineManager:{
	initialize : function(){
		this.ltotal  = [0,0,0,0,0];	// 線が0〜4本引いてあるセル/交点がいくつあるか保持している

		this.enabled = (this.isCenterLine || this.borderAsLine);
	},
	init : function(){
		if(this.enabled){
			this.board.validinfo.line.push(this);
			this.board.validinfo.all.push(this);
		}
	},
	// relation : ['line'],

	// 下記の2フラグはどちらかがtrueになります(両方trueはだめです)
	isCenterLine : false,	// マスの真ん中を通る線を回答として入力するパズル
	borderAsLine : false,	// 境界線をlineとして扱う

	isLineCross : false,	// 線が交差するパズル

	//---------------------------------------------------------------------------
	// linemgr.reset()       lcnts等の変数の初期化を行う
	// linemgr.rebuild()     既存の情報からデータを再設定する
	// linemgr.newIrowake()  線の情報が再構築された際、線に色をつける
	//---------------------------------------------------------------------------
	reset : function(){
		// lcnt, ltotal変数(配列)初期化
		var bd = this.board;
		bd.paths = [];
		if(this.isCenterLine){
			for(var c=0;c<bd.cellmax;c++){ bd.cell[c].lcnt=0;}
			this.ltotal=[bd.cellmax, 0, 0, 0, 0];
		}
		else{
			for(var c=0;c<bd.crossmax;c++){ bd.cross[c].lcnt=0;}
			this.ltotal=[bd.crossmax, 0, 0, 0, 0];
		}

		this.rebuild();
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		var bd = this.board;
		var blist = new this.klass.BorderList();
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
			border.path = null;
			if(border.isLine()){
				blist.add(border);
				var piece1 = border.lineedge[0], piece2 = border.lineedge[1]; /* cell or cross */
				if(!piece1.isnull){ this.ltotal[piece1.lcnt]--; piece1.lcnt++; this.ltotal[piece1.lcnt]++;}
				if(!piece2.isnull){ this.ltotal[piece2.lcnt]--; piece2.lcnt++; this.ltotal[piece2.lcnt]++;}
			}
		}

		this.searchLine(blist);
		if(this.puzzle.flags.irowake){ this.newIrowake();}
	},
	newIrowake : function(){
		var paths = this.board.paths;
		for(var i=0;i<paths.length;i++){
			paths[i].blist.setColor(this.puzzle.painter.getNewLineColor());
		}
	},

	//---------------------------------------------------------------------------
	// linemgr.gettype()    線が引かれた/消された時に、typeA/typeB/typeCのいずれか判定する
	// linemgr.isTpos()     pieceが、指定されたcc内でidの反対側にあるか判定する
	//---------------------------------------------------------------------------
	gettype : function(piece,border,isset){ /* piece : cell or cross */
		var erase = (isset?0:1);
		if(piece.isnull){
			return 'A';
		}
		else if(!piece.iscrossing()){
			return ((piece.lcnt===(1-erase))?'A':'B');
		}
		else{
			var lcnt = piece.lcnt;
			if     (lcnt===(1-erase) || (lcnt===(3-erase) && this.isTpos(piece,border))){ return 'A';}
			else if(lcnt===(2-erase) ||  lcnt===(4-erase)){ return 'B';}
			return 'C';
		}
	},
	isTpos : function(piece,border){ /* piece : cell or cross */
		//   │ ←id                    
		// ━┷━                       
		//   ・ ←この場所に線があるか？
		return !this.board.getb( 2*piece.bx-border.bx, 2*piece.by-border.by ).isLine();
	},

	//---------------------------------------------------------------------------
	// linemgr.setLine()     線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setLine : function(border){
		if(!this.enabled){ return;}

		var isset = border.isLine();
		if(isset===(border.path!==null)){ return;}

		var piece1 = border.lineedge[0], piece2 = border.lineedge[1]; /* cell or cross */
		if(isset){
			if(!piece1.isnull){ this.ltotal[piece1.lcnt]--; piece1.lcnt++; this.ltotal[piece1.lcnt]++;}
			if(!piece2.isnull){ this.ltotal[piece2.lcnt]--; piece2.lcnt++; this.ltotal[piece2.lcnt]++;}
		}
		else{
			if(!piece1.isnull){ this.ltotal[piece1.lcnt]--; piece1.lcnt--; this.ltotal[piece1.lcnt]++;}
			if(!piece2.isnull){ this.ltotal[piece2.lcnt]--; piece2.lcnt--; this.ltotal[piece2.lcnt]++;}
		}

		//---------------------------------------------------------------------------
		// (A)くっつきなし                        (B)単純くっつき
		//     ・      │    - 交差ありでlcnt=1     ┃      │    - 交差なしでlcnt=2～4
		//   ・ ━   ・┝━  - 交差なしでlcnt=1   ・┗━  ━┿━  - 交差ありでlcnt=2or4
		//     ・      │    - 交差ありでlcnt=3     ・      │                         
		// 
		// (C)複雑くっつき
		//    ┃        │   - 交差ありでlcnt=3(このパターン)
		//  ━┛・ => ━┷━   既存の線情報が別々になってしまう
		//    ・        ・   
		//---------------------------------------------------------------------------
		var types = this.gettype(piece1,border,isset) + this.gettype(piece2,border,isset);
		if(isset){
			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(types==='AA'){
				this.assignLineInfo(border, null);
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if(types==='AB'||types==='BA'){
				this.assignLineInfo(border, this.getaround(border)[0]);
			}
			// (B)+(B)の場合, その他の場合 -> 大きい方の線idをふり直して、長いものに統一する
			else{
				this.remakeLineInfo(border);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			// (A)+(B)の場合 -> 既存の線から取り除く
			if(types==='AA'||types==='AB'||types==='BA'){
				this.removeLineInfo(border);
			}
			// (B)+(B)の場合、その他の場合 -> 分かれた線にそれぞれ新しい線idをふる
			else{
				this.remakeLineInfo(border);
			}
			border.color = "";
		}
	},

	//---------------------------------------------------------------------------
	// linemgr.assignLineInfo()  指定された線を有効な線として設定する
	// linemgr.removeLineInfo()  指定されたセルを無効なセルとして設定する
	// linemgr.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                           可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	assignLineInfo : function(border, border2){
		var path = border.path;
		if(path!==null){ return;}

		if(!border2){
			path = this.addPath();
			border.color = this.puzzle.painter.getNewLineColor();
		}
		else{
			path = border2.path;
			border.color  = border2.color;
		}
		path.blist.add(border);
		border.path = path;
	},
	removeLineInfo : function(border){
		var path = border.path;
		if(path===null){ return;}

		path.blist.remove(border);
		if(path.blist.length===0){ this.removePath(path);}
		border.path = null;
		border.color = "";
	},
	remakeLineInfo : function(border){
		var blist_sub = this.getaround(border);
		if(border.isLine()){ blist_sub.add(border);}
		else{ this.removeLineInfo(border);}
		
		var longColor = this.getLongColor(blist_sub);
		
		// つながった線の線情報を一旦0にする
		var blist = new this.klass.BorderList();
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
		var path = {blist:(new this.klass.BorderList())};
		this.board.paths.push(path);
		return path;
	},
	removePath : function(path){
		var paths = this.board.paths, idx = paths.indexOf(path);
		path.blist.each(function(border){ border.path=null;});
		return (idx>=0 ? paths.splice(idx, 1)[0].blist : []);
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
			if(largepath===null || largepath.blist.length < path.blist.length){
				largepath = path;
				longColor = blist[i].color;
			}
		}
		return (!!longColor ? longColor : this.puzzle.painter.getNewLineColor());
	},
	setLongColor : function(newpaths, longColor){
		var puzzle = this.puzzle;
		/* newpaths:新しく生成されたpathの配列 */
		var blist_all = new puzzle.klass.BorderList();
		
		// できた線の中でもっとも長いものを取得する
		var longpath = newpaths[0];
		for(var i=1;i<newpaths.length;i++){
			if(longpath.blist.length < newpaths[i].blist.length){ longpath = newpaths[i];}
		}
		
		// 新しい色の設定
		for(var i=0;i<newpaths.length;i++){
			var path = newpaths[i];
			path.blist.setColor(path===longpath ? longColor : puzzle.painter.getNewLineColor());
			blist_all.extend(path.blist);
		}
		
		if(puzzle.execConfig('irowake')){ puzzle.painter.repaintLines(blist_all);}
	},

	//---------------------------------------------------------------------------
	// linemgr.getaround()     自分に線が存在するものとして、自分に繋がる線(最大6箇所)を全て取得する
	//---------------------------------------------------------------------------
	getaround : function(border){
		var dx=((this.isCenterLine!==border.isVert())?2:0), dy=(2-dx);	// (dx,dy) = 縦(2,0) or 横(0,2)
		var obj1 = border.lineedge[0], obj2 = border.lineedge[1], erase=(border.isLine()?0:1);

		// 交差ありでborderAsLine==true(->isCenterLine==false)のパズルは作ってないはず
		// 今までのオモパで該当するのもスリザーボックスくらいだったような、、

		var lines = new this.klass.BorderList();
		if(!obj1.isnull){
			var iscrossing=obj1.iscrossing(), lcnt=obj1.lcnt;
			if(iscrossing && lcnt>=(4-erase)){
				lines.add(border.relbd(-dy,-dx)); // obj1からのstraight
			}
			else if(lcnt>=(2-erase) && !(iscrossing && lcnt===(3-erase) && this.isTpos(obj1,border))){
				lines.add(border.relbd(-dy,-dx));   // obj1からのstraight
				lines.add(border.relbd(-1,-1));     // obj1からのcurve1
				lines.add(border.relbd(dx-1,dy-1)); // obj1からのcurve2
			}
		}
		if(!obj2.isnull){
			var iscrossing=obj2.iscrossing(), lcnt=obj2.lcnt;
			if(iscrossing && lcnt>=(4-erase)){
				lines.add(border.relbd(dy,dx)); // obj2からのstraight
			}
			else if(lcnt>=(2-erase) && !(iscrossing && lcnt===(3-erase) && this.isTpos(obj2,border))){
				lines.add(border.relbd(dy,dx));       // obj2からのstraight
				lines.add(border.relbd(1,1));         // obj2からのcurve1
				lines.add(border.relbd(-dx+1,-dy+1)); // obj2からのcurve2
			}
		}

		return lines.filter(function(border){ return border.isLine();});
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
	searchSingle : function(border, newpath){
		var bx=border.bx, by=border.by;
		var pos = new this.klass.Address(null, null);
		var stack=((this.isCenterLine===border.isHorz())?[[bx,by+1,1],[bx,by,2]]:[[bx+1,by,3],[bx,by,4]]);
		while(stack.length>0){
			var dat=stack.pop(), dir=dat[2];
			pos.init(dat[0], dat[1]);
			while(1){
				pos.movedir(dir,1);
				if(!pos.onborder()){
					var bx=pos.bx, by=pos.by;
					var piece = (this.isCenterLine ? pos.getc() : pos.getx());
					var adb = piece.adjborder;
					if(piece.isnull){ break;}
					else if(piece.lcnt>=3){
						if(!piece.iscrossing()){
							if(adb.top.isLine()   ){ stack.push([bx,by,1]);}
							if(adb.bottom.isLine()){ stack.push([bx,by,2]);}
							if(adb.left.isLine()  ){ stack.push([bx,by,3]);}
							if(adb.right.isLine() ){ stack.push([bx,by,4]);}
							break;
						}
						/* lcnt>=3でiscrossing==trueの時は直進＝何もしない */
					}
					else{
						if     (dir!==1 && adb.bottom.isLine()){ dir=2;}
						else if(dir!==2 && adb.top.isLine()   ){ dir=1;}
						else if(dir!==3 && adb.right.isLine() ){ dir=4;}
						else if(dir!==4 && adb.left.isLine()  ){ dir=3;}
					}
				}
				else{
					var border = pos.getb();
					if(border.path!==null || !border.isLine()){ break;}
					border.path = newpath;
					newpath.blist.add(border);
				}
			}
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
			blist :(new this.klass.BorderList()),
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
				else if(cell.iscrossing() && cell.lcnt>=3){ }
				else if(dir!==1 && adb.bottom.isLine()){ if(dir!==2){ pathseg.ccnt++;} dir=2;}
				else if(dir!==2 && adb.top.isLine()   ){ if(dir!==1){ pathseg.ccnt++;} dir=1;}
				else if(dir!==3 && adb.right.isLine() ){ if(dir!==4){ pathseg.ccnt++;} dir=4;}
				else if(dir!==4 && adb.left.isLine()  ){ if(dir!==3){ pathseg.ccnt++;} dir=3;}
			}
			else{
				var border = pos.getb();
				if(border.isnull || !border.isLine() || border.pathseg!==null){ break;}

				pathseg.blist.add(border);
				border.pathseg = pathseg;

				if(isNaN(pathseg.length[pathseg.ccnt])){ pathseg.length[pathseg.ccnt]=1;}else{ pathseg.length[pathseg.ccnt]++;}
			}
		}
		
		if(pathseg.blist.length>0){
			pathseg.cells[1] = pos.getc();
			pathseg.dir2 = [0,2,1,4,3][dir];
			return pathseg;
		}
		return null;
	}
}
});
