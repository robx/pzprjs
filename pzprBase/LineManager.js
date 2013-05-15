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

		this.idlist = [];
		this.id = [];
		this.max = 0;

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

		this.rebuild();
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		var bd = this.owner.board, blist = this.owner.newInstance('BorderList');
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
			if(border.isLine()){
				this.id[border.id] = 0;
				blist.add(border);

				var cc1 = border.lineedge[0].id, cc2 = border.lineedge[1].id;
				if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
				if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
			}
			else{
				this.id[border.id] = null;
			}
		}

		this.reassignId(blist);
		if(this.owner.flags.irowake){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.max;i++){
			var idlist = this.idlist[i];
			if(idlist.length>0){
				var newColor = this.owner.painter.getNewLineColor();
				for(var n=0;n<idlist.length;n++){ this.owner.board.border[idlist[n]].color = newColor;}
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
	// 
	// lines.combineLineInfo() 線が引かれた時に、周りの線が全てくっついて1つの線が
	//                         できる場合の線idの再設定を行う
	// lines.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                         可能性がある場合の線idの再設定を行う
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
				this.max++;
				this.idlist[this.max] = [border.id];
				this.id[border.id] = this.max;
				border.color = this.owner.painter.getNewLineColor();
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var border2 = (this.getbid(border))[0];
				this.idlist[this.id[border2.id]].push(border.id);
				this.id[border.id] = this.id[border2.id];
				border.color  = border2.color;
			}
			// (B)+(B)の場合 -> くっついた線で、大きい方の線idに統一する
			else if(type1===this.typeB && type2===this.typeB){
				this.combineLineInfo(border);
			}
			// その他の場合
			else{
				this.remakeLineInfo(border,1);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			if(type1===this.typeA && type2===this.typeA){
				this.idlist[this.id[border.id]] = [];
				this.id[border.id] = null;
			}
			// (A)+(B)の場合 -> 既存の線から取り除く
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var ownid =this.id[border.id], idlist = this.idlist[ownid];
				for(var i=0;i<idlist.length;i++){ if(idlist[i]===border.id){ idlist.splice(i,1); break;} }
				this.id[border.id] = null;
			}
			// (B)+(B)の場合、その他の場合 -> 分かれた線にそれぞれ新しい線idをふる
			else{
				this.remakeLineInfo(border,0);
			}
			border.color = "";
		}
	},

	combineLineInfo : function(border){
		// この関数の突入条件より、bid.lengthは必ず2になる
		// →ならなかった... くっつく線のID数は必ず2以下になる
		var blist = this.getbid(border);
		var did = [this.id[blist[0].id], null];
		for(var i=0;i<blist.length;i++){
			if(did[0]!==this.id[blist[i].id]){ did[1]=this.id[blist[i].id]; break;}
		}

		var newColor = blist[0].color;
		// くっつく線のID数が2種類の場合
		if(did[1] != null){
			// どっちが長いの？
			var longid = did[0], shortid = did[1];
			if(this.idlist[did[0]].length < this.idlist[did[1]].length){
				longid=did[1]; shortid=did[0];
				newColor = blist[1].color;
			}

			// つながった線は全て同じIDにする
			var longidlist  = this.idlist[longid];
			var shortidlist = this.idlist[shortid];
			for(var n=0,len=shortidlist.length;n<len;n++){
				longidlist.push(shortidlist[n]);
				this.id[shortidlist[n]] = longid;
			}
			this.idlist[shortid] = [];

			longidlist.push(border.id);
			this.id[border.id] = longid;

			// 色を同じにする
			var blist = this.owner.newInstance('BorderList');
			for(var i=0,len=longidlist.length;i<len;i++){
				var border = this.owner.board.border[longidlist[i]];
				border.color = newColor;
				blist.add(border);
			}
			if(this.owner.getConfig('irowake')){ this.owner.painter.repaintLines(blist);}
		}
		// くっつく線のID数が1種類の場合 => 既存の線にくっつける
		else{
			this.idlist[did[0]].push(border.id);
			this.id[border.id] = did[0];
			border.color = newColor;
		}
	},
	remakeLineInfo : function(border,val){
		var oldmax = this.max;	// いままでのthis.max値

		// つなげた線のIDを一旦0にして、max+1, max+2, ...を割り振りしなおす関数

		// つながった線の線情報を一旦0にする
		var blist = this.getbid(border);
		var oldlongid = this.id[blist[0].id], longColor = blist[0].color;
		for(var i=0,len=blist.length;i<len;i++){
			var current = this.id[blist[i].id];
			if(current<=0){ continue;}
			var idlist = this.idlist[current];
			if(this.idlist[oldlongid].length < idlist.length){
				oldlongid = current;
				longColor = blist[i].color;
			}
			for(var n=0,len2=idlist.length;n<len2;n++){ this.id[idlist[n]] = 0;}
			this.idlist[current] = [];
		}

		// 自分のIDの情報を変更する
		if(val>0){ this.id[border.id] = 0; blist.unshift(border);}
		else     { this.id[border.id] = null;}

		// 新しいidを設定する
		this.reassignId(blist);

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する

		// できた線の中でもっとも長いものを取得する
		var newlongid = oldmax+1;
		for(var current=oldmax+1;current<=this.max;current++){
			var idlist = this.idlist[current];
			if(this.idlist[newlongid].length<idlist.length){ newlongid = current;}
		}

		// 新しい色の設定
		for(var current=oldmax+1;current<=this.max;current++){
			var newColor = (current===newlongid ? longColor : this.owner.painter.getNewLineColor());
			var blist = this.getBlist(current);
			for(var n=0,len=blist.length;n<len;n++){ blist[n].color = newColor;}
			if(this.owner.getConfig('irowake')){ this.owner.painter.repaintLines(blist);}
		}
	},

	//---------------------------------------------------------------------------
	// lines.getbid()     自分に線が存在するものとして、自分に繋がる線(最大6箇所)を全て取得する
	// lines.reassignId() ひとつながりの線にlineidを設定する
	//---------------------------------------------------------------------------
	getbid : function(border){
		var dx=((this.isCenterLine^border.isVert())?2:0), dy=(2-dx);	// (dx,dy) = 縦(2,0) or 横(0,2)
		var obj1 = border.lineedge[0], obj2 = border.lineedge[1], erase=(border.isLine()?0:1);

		// 交差ありでborderAsLine==true(->isCenterLine==false)のパズルは作ってないはず
		// 今までのオモパで該当するのもスリザーボックスくらいだったような、、

		var lines = this.owner.newInstance('BorderList');
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

	reassignId : function(blist){
		for(var i=0,len=blist.length;i<len;i++){
			var border0 = blist[i];
			if(this.id[border0.id]!==0){ continue;}	// 既にidがついていたらスルー
			var bx0=border0.bx, by0=border0.by;
			this.max++;
			this.idlist[this.max] = [];

			var newid = this.max;
			var pos = this.owner.newInstance('Address', [null, null]);
			var stack=((!this.isCenterLine^border0.isHorz())?[[bx0,by0+1,1],[bx0,by0,2]]:[[bx0+1,by0,3],[bx0,by0,4]]);
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
						this.idlist[newid].push(border.id);
					}
				}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// lines.getLineInfo()    線情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		var bd = this.owner.board, info = this.owner.newInstance('LineInfo');
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
	getBlist : function(id){
		var idlist = this.idlist[id], blist = this.owner.newInstance('BorderList');
		for(var i=0;i<idlist.length;i++){ blist.add(this.owner.board.border[idlist[i]]);}
		return blist;
	}
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
		this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
	},

	addRoom : function(){ pzprv3.core.AreaInfo.prototype.addRoom.call(this);},
	getRoomID : function(obj){ return this.id[obj.id];},
	setRoomID : function(obj, areaid){ pzprv3.core.AreaInfo.prototype.setRoomID.call(this, obj,areaid);},

	addBorder : function(border){ this.setRoomID(border, this.max);},
	emptyBorder : function(border){ return (this.id[border.id]===0);},

	getblist : function(areaid){
		var idlist = this.room[areaid].idlist, blist = this.owner.newInstance('BorderList');
		for(var i=0;i<idlist.length;i++){ blist.add(this.owner.board.border[idlist[i]]);}
		return blist;
	}
});
