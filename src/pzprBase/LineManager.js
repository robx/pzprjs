// LineManager.js v3.4.0

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
pzprv3.createPuzzleClass('LineManager',
{
	initialize : function(){
		this.lcnt    = [];
		this.ltotal  = [];

		this.blist = [];
		this.id = [];
		this.max = 0;
		this.invalidid = [];	// 使わなくなったIDのリスト

		this.enabled = (this.isCenterLine || this.borderAsLine);
	},
	init : function(){
		if(this.enabled){
			this.owner.board.validinfo.line.push(this);
			this.owner.board.validinfo.all.push(this);
		}
	},
	// relation : ['line'],

	// 下記の2フラグはどちらかがtrueになります(両方trueはだめです)
	isCenterLine : false,	// マスの真ん中を通る線を回答として入力するパズル
	borderAsLine : false,	// 境界線をlineとして扱う

	isLineCross : false,	// 線が交差するパズル

	// 定数
	typeA : 'A',
	typeB : 'B',
	typeC : 'C',

	//---------------------------------------------------------------------------
	// lines.reset()       lcnts等の変数の初期化を行う
	// lines.rebuild()     既存の情報からデータを再設定する
	// lines.newIrowake()  線の情報が再構築された際、線に色をつける
	//---------------------------------------------------------------------------
	reset : function(){
		// lcnt, ltotal変数(配列)初期化
		var bd = this.owner.board;
		if(this.isCenterLine){
			for(var c=0;c<bd.cellmax;c++){ this.lcnt[c]=0;}
			this.ltotal=[(bd.qcols*bd.qrows), 0, 0, 0, 0];
		}
		else{
			for(var c=0,len=(bd.qcols+1)*(bd.qrows+1);c<len;c++){ this.lcnt[c]=0;}
			this.ltotal=[((bd.qcols+1)*(bd.qrows+1)), 0, 0, 0, 0];
		}

		// その他の変数初期化
		this.max = 0;
		for(var id=0;id<bd.bdmax;id++){ this.id[id] = null;}
		this.invalidid = [];

		this.rebuild();
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		var bd = this.owner.board, blist = new this.owner.classes.BorderList();
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
			if(border.isLine()){
				blist.add(border);

				var cc1 = border.lineedge[0].id, cc2 = border.lineedge[1].id;
				if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
				if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
			}
		}

		this.searchLine(blist);
		if(this.owner.flags.irowake){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.max;i++){
			var blist = this.blist[i];
			if(blist.length>0){
				var newColor = this.owner.painter.getNewLineColor();
				for(var n=0;n<blist.length;n++){ blist[n].color = newColor;}
			}
		}
	},

	//---------------------------------------------------------------------------
	// lines.gettype()    線が引かれた/消された時に、typeA/typeB/typeCのいずれか判定する
	// lines.isTpos()     pieceが、指定されたcc内でidの反対側にあるか判定する
	//---------------------------------------------------------------------------
	gettype : function(obj,border,isset){
		var erase = (isset?0:1);
		if(obj.isnull){
			return this.typeA;
		}
		else if(!obj.iscrossing()){
			return ((obj.lcnt()===(1-erase))?this.typeA:this.typeB);
		}
		else{
			var lcnt = obj.lcnt();
			if     (lcnt===(1-erase) || (lcnt===(3-erase) && this.isTpos(obj,border))){ return this.typeA;}
			else if(lcnt===(2-erase) ||  lcnt===(4-erase)){ return this.typeB;}
			return this.typeC;
		}
	},
	isTpos : function(obj,border){
		//   │ ←id                    
		// ━┷━                       
		//   ・ ←この場所に線があるか？
		return !this.owner.board.getb( 2*obj.bx-border.bx, 2*obj.by-border.by ).isLine();
	},

	//---------------------------------------------------------------------------
	// lines.setLineInfo()     線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setLineInfo : function(border){
		if(!this.enabled){ return;}

		var border = border, isset = border.isLine();
		if(isset===(this.id[border.id]!==null)){ return;}

		var obj1 = border.lineedge[0], obj2 = border.lineedge[1];
		if(isset){
			if(!obj1.isnull){ this.ltotal[this.lcnt[obj1.id]]--; this.lcnt[obj1.id]++; this.ltotal[this.lcnt[obj1.id]]++;}
			if(!obj2.isnull){ this.ltotal[this.lcnt[obj2.id]]--; this.lcnt[obj2.id]++; this.ltotal[this.lcnt[obj2.id]]++;}
		}
		else{
			if(!obj1.isnull){ this.ltotal[this.lcnt[obj1.id]]--; this.lcnt[obj1.id]--; this.ltotal[this.lcnt[obj1.id]]++;}
			if(!obj2.isnull){ this.ltotal[this.lcnt[obj2.id]]--; this.lcnt[obj2.id]--; this.ltotal[this.lcnt[obj2.id]]++;}
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
		var type1 = this.gettype(obj1,border,isset), type2 = this.gettype(obj2,border,isset);
		if(isset){
			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(type1===this.typeA && type2===this.typeA){
				this.assignLineInfo(border, null);
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				this.assignLineInfo(border, (this.getbid(border))[0]);
			}
			// (B)+(B)の場合, その他の場合 -> 大きい方の線idをふり直して、長いものに統一する
			else{
				this.remakeLineInfo(border);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			// (A)+(B)の場合 -> 既存の線から取り除く
			if((type1===this.typeA && type2===this.typeA) || (type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
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
	// lines.assignLineInfo()  指定された線を有効な線として設定する
	// lines.removeLineInfo()  指定されたセルを無効なセルとして設定する
	// lines.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                         可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	assignLineInfo : function(border, border2){
		var pathid = this.id[border.id];
		if(pathid!==null && pathid!==0){ return;}

		if(border2===null){
			pathid = this.addPath();
			border.color = this.owner.painter.getNewLineColor();
		}
		else{
			pathid = this.id[border2.id];
			border.color  = border2.color;
		}
		this.blist[pathid].add(border);
		this.id[border.id] = pathid;
	},
	removeLineInfo : function(border){
		var pathid = this.id[border.id];
		if(pathid===null || pathid===0){ return;}

		this.blist[pathid].remove(border);
		this.id[border.id] = null;
		if(this.blist[pathid].length===0){ this.removePath(pathid);}
		border.color = "";
	},
	remakeLineInfo : function(border){
		var blist_sub = this.getbid(border);
		blist_sub.add(border);
		
		var longColor = this.getLongColor(blist_sub);
		
		// つながった線の線情報を一旦0にする
		var blist = new this.owner.classes.BorderList();
		for(var i=0;i<blist_sub.length;i++){
			var id=blist_sub[i].id, r=this.id[id], bd=this.owner.board;
			if(r!==null && r!==0){ blist.extend(this.removePath(r));}
			else if(r===null)    { blist.add(bd.border[id]);}
		}

		// 新しいidを設定する
		var assign = this.searchLine(blist);

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		this.setLongColor(assign, longColor);
	},

	//--------------------------------------------------------------------------------
	// info.addArea()    新しく割り当てるidを取得する
	// info.removeArea() 部屋idを無効にする
	//--------------------------------------------------------------------------------
	addPath : function(){
		var newid;
		if(this.invalidid.length>0){ newid = this.invalidid.shift();}
		else{ this.max++; newid=this.max;}

		this.blist[newid] = new this.owner.classes.BorderList();
		return newid;
	},
	removePath : function(id){
		var blist = this.getBlist(id);
		for(var i=0;i<blist.length;i++){ this.id[blist[i].id] = null;}
		
		this.blist[newid] = new this.owner.classes.BorderList();
		this.invalidid.push(id);
		return blist;
	},

	//--------------------------------------------------------------------------------
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(blist){
		// 周りで一番大きな線は？
		var largeid = null, longColor = "";
		for(var i=0,len=blist.length;i<len;i++){
			var r = this.id[blist[i].id];
			if(r===null || r<=0){ continue;}
			if(largeid===null || this.blist[largeid].length < this.blist[r].length){
				largeid = r;
				longColor = blist[i].color;
			}
		}
		return (!!longColor ? longColor : this.owner.painter.getNewLineColor());
	},
	setLongColor : function(assign, longColor){
		/* assign:影響のあったareaidの配列 */
		var blist_all = new this.owner.classes.BorderList();
		
		// できた線の中でもっとも長いものを取得する
		var longid = assign[0];
		for(var i=1;i<assign.length;i++){
			var blist = this.blist[assign[i]];
			if(this.blist[longid].length<blist.length){ longid = assign[i];}
		}
		
		// 新しい色の設定
		for(var i=0;i<assign.length;i++){
			var newColor = (assign[i]===longid ? longColor : this.owner.painter.getNewLineColor());
			var blist = this.getBlist(assign[i]);
			for(var n=0,len=blist.length;n<len;n++){ blist[n].color = newColor;}
			blist_all.extend(blist);
		}
		
		if(this.owner.get('irowake')){
			this.owner.painter.repaintLines(blist);
		}
	},

	//---------------------------------------------------------------------------
	// lines.getbid()     自分に線が存在するものとして、自分に繋がる線(最大6箇所)を全て取得する
	//---------------------------------------------------------------------------
	getbid : function(border){
		var dx=((this.isCenterLine^border.isVert())?2:0), dy=(2-dx);	// (dx,dy) = 縦(2,0) or 横(0,2)
		var obj1 = border.lineedge[0], obj2 = border.lineedge[1], erase=(border.isLine()?0:1);

		// 交差ありでborderAsLine==true(->isCenterLine==false)のパズルは作ってないはず
		// 今までのオモパで該当するのもスリザーボックスくらいだったような、、

		var lines = new this.owner.classes.BorderList();
		if(!obj1.isnull){
			var iscrossing=obj1.iscrossing(), lcnt=obj1.lcnt();
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
			var iscrossing=obj2.iscrossing(), lcnt=obj2.lcnt();
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
	// lines.searchLine()   ひとつながりの線にlineidを設定する
	// lines.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//---------------------------------------------------------------------------
	searchLine : function(blist){
		var assign = [];
		for(var i=0,len=blist.length;i<len;i++){
			this.id[blist[i].id] = (blist[i].isLine()?0:null);
		}
		for(var i=0,len=blist.length;i<len;i++){
			var border = blist[i];
			if(this.id[border.id]!==0){ continue;}	// 既にidがついていたらスルー
			var newid = this.addPath();
			this.searchSingle(border, newid);
			assign.push(newid);
		}
		return assign;
	},
	searchSingle : function(border, newid){
		var bx=border.bx, by=border.by;
		var pos = new this.owner.classes.Address(null, null);
		var stack=((!this.isCenterLine^border.isHorz())?[[bx,by+1,1],[bx,by,2]]:[[bx+1,by,3],[bx,by,4]]);
		while(stack.length>0){
			var dat=stack.pop(), dir=dat[2];
			pos.init(dat[0], dat[1]);
			while(1){
				pos.movedir(dir,1);
				if(!pos.onborder()){
					var bx=pos.bx, by=pos.by;
					var obj = (this.isCenterLine ? pos.getc() : pos.getx());
					if(obj.isnull){ break;}
					else if(obj.lcnt()>=3){
						if(!obj.iscrossing()){
							if(obj.ub().isLine()){ stack.push([bx,by,1]);}
							if(obj.db().isLine()){ stack.push([bx,by,2]);}
							if(obj.lb().isLine()){ stack.push([bx,by,3]);}
							if(obj.rb().isLine()){ stack.push([bx,by,4]);}
							break;
						}
						/* lcnt>=3でiscrossing==trueの時は直進＝何もしない */
					}
					else{
						if     (dir!==1 && obj.db().isLine()){ dir=2;}
						else if(dir!==2 && obj.ub().isLine()){ dir=1;}
						else if(dir!==3 && obj.rb().isLine()){ dir=4;}
						else if(dir!==4 && obj.lb().isLine()){ dir=3;}
					}
				}
				else{
					var border = pos.getb();
					if(this.id[border.id]!==0){ break;}
					this.id[border.id] = newid;
					this.blist[newid].add(border);
				}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// lines.getLineInfo()    線情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		var bd = this.owner.board, info = new this.owner.classes.LineInfo();
		for(var id=0;id<bd.bdmax;id++){ info.id[id]=(bd.border[id].isLine()?0:null);}
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
			if(!info.emptyBorder(border)){ continue;}
			info.addRoom();

			var blist = this.getBlistByBorder(border);
			for(var i=0;i<blist.length;i++){ info.addBorder(blist[i]);}
		}
		return info;
	},

	//--------------------------------------------------------------------------------
	// info.getBlistByBorder() 指定した線が含まれる領域の線配列を取得する
	// info.getBlist()         指定した領域の線配列を取得する
	//--------------------------------------------------------------------------------
	getBlistByBorder : function(border){ return this.getBlist(this.id[border.id]);},
	getBlist : function(id){ return this.blist[id];}
});

//---------------------------------------------------------------------------
// LineInfoクラス
//   id : null   どのPathにも属さない線
//         0     どのPathに属させるかの処理中
//         1以上 その番号のPathに属する
//---------------------------------------------------------------------------
pzprv3.createPuzzleClass('LineInfo',
{
	initialize : function(){
		this.max  = 0;	// 最大の部屋番号(1〜maxまで存在するよう構成してください)
		this.id   = [];	// 各セル/線などが属する部屋番号を保持する
		this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].blistで取得)
	},

	addRoom : function(){
		this.max++;
		this.room[this.max] = {blist:(new this.owner.classes.BorderList())};
	},
	getRoomID : function(obj){ return this.id[obj.id];},
	setRoomID : function(obj, areaid){
		this.room[areaid].blist.add(obj);
		this.id[obj.id] = areaid;
	},

	addBorder : function(border){ this.setRoomID(border, this.max);},
	emptyBorder : function(border){ return (this.id[border.id]===0);},

	getblist : function(areaid){ return this.room[areaid].blist;}
});
