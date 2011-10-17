// BoardExt.js v3.4.0

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
pzprv3.createCommonClass('LineManager',
{
	initialize : function(){
		this.lcnt    = [];
		this.ltotal  = [];

		this.idlist = [];
		this.id = [];
		this.max = 0;

		this.enabled = (this.isCenterLine || this.borderAsLine);

		if(this.enabled){
			bd.validinfo.line.push(this);
			bd.validinfo.all.push(this);
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
	// bd.lines.reset()       lcnts等の変数の初期化を行う
	// bd.lines.rebuild()     既存の情報からデータを再設定する
	// bd.lines.newIrowake()  線の情報が再構築された際、線に色をつける
	//---------------------------------------------------------------------------
	reset : function(){
		// lcnt, ltotal変数(配列)初期化
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

		var blist = this.owner.newInstance('BorderList');
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
		if(this.owner.painter.irowake!==0){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.max;i++){
			var idlist = this.idlist[i];
			if(idlist.length>0){
				var newColor = this.owner.painter.getNewLineColor();
				for(var n=0;n<idlist.length;n++){ bd.border[idlist[n]].color = newColor;}
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.lines.gettype()    線が引かれた/消された時に、typeA/typeB/typeCのいずれか判定する
	// bd.lines.isTpos()     pieceが、指定されたcc内でidの反対側にあるか判定する
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
		return !bd.getb( 2*obj.bx-border.bx, 2*obj.by-border.by ).isLine();
	},

	//---------------------------------------------------------------------------
	// bd.lines.setLineInfo()     線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	// 
	// bd.lines.combineLineInfo() 線が引かれた時に、周りの線が全てくっついて1つの線が
	//                            できる場合の線idの再設定を行う
	// bd.lines.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                            可能性がある場合の線idの再設定を行う
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
				var border = bd.border[longidlist[i]];
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
	// bd.lines.getbid()     自分に線が存在するものとして、自分に繋がる線(最大6箇所)を全て取得する
	// bd.lines.reassignId() ひとつながりの線にlineidを設定する
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
	// bd.lines.getLineInfo()    線情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		var info = this.owner.newInstance('AreaBorderInfo');
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
		for(var i=0;i<idlist.length;i++){ blist.add(bd.border[idlist[i]]);}
		return blist;
	}
});

//--------------------------------------------------------------------------------
// ★AreaCellManagerクラス セルの部屋情報などを保持するクラス
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRoomNumber()等が必要です。
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaCellManager',
{
	initialize : function(){
		this.max;
		this.invalid;	// 使わなくなったIDのリスト
		this.id;		// 各々のセルのid
		this.cellinfo;	// セルの情報を保持しておく

		if(this.enabled){
			for(var i=0;i<this.relation.length;i++){
				bd.validinfo[this.relation[i]].push(this);
				bd.validinfo.all.push(this);
			}
		}
	},
	enabled : false,
	relation : ['cell'],

	isvalid : function(cell){ return (cell.ques!==7);},

	//--------------------------------------------------------------------------------
	// info.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// info.rebuild() 既存の情報からデータを再設定する
	//--------------------------------------------------------------------------------
	reset : function(){
		this.max      = 0;
		this.invalid  = [];
		this.id       = [];
		this.cellinfo = [];

		this.rebuild();
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		var idlist = [];
		for(var cc=0;cc<bd.cellmax;cc++){
			this.cellinfo[cc] = this.getlink(bd.cell[cc]);
			this.id[cc] = 0;
			idlist.push(cc);
		}

		this.searchIdlist(idlist);
	},

	//--------------------------------------------------------------------------------
	// info.getnewid()  新しく割り当てるidを取得する
	// info.invalidid() 部屋idを無効にする
	// info.popRoom()   指定された複数のセルが含まれる部屋を全て無効にしてidlistを返す
	//--------------------------------------------------------------------------------
	getnewid : function(){
		var newid;
		if(this.invalid.length>0){ newid = this.invalid.shift();}
		else{ this.max++; newid=this.max;}

		this[newid] = {idlist:[]};
		return newid;
	},
	invalidid : function(id){
		var idlist = this[id].idlist.concat();
		this[id] = {idlist:[]};
		this.invalid.push(id);
		return idlist;
	},

	popRoom : function(ccs){
		var idlist = [];
		for(var n=0;n<ccs.length;n++){
			var r = this.id[ccs[n]];
			if(r!==null && r!==0){
				var idlist2 = this.invalidid(r);
				for(var i=0,len=idlist2.length;i<len;i++){
					idlist.push(idlist2[i]);
					this.id[idlist2[i]] = 0;
				}
			}
			else if(r===null){ idlist.push(ccs[n]);}
		}
		return idlist;
	},

	//--------------------------------------------------------------------------------
	// info.newIrowake()  線の情報が再構築された際、ブロックに色をつける
	//--------------------------------------------------------------------------------
	newIrowake : function(){
		for(var i=1;i<=this.max;i++){
			var idlist = this[i].idlist;
			if(idlist.length>0){
				var newColor = this.owner.painter.getNewLineColor();
				for(var n=0;n<idlist.length;n++){
					bd.cell[idlist[n]].color = newColor;
				}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.setCellInfo() 黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	//--------------------------------------------------------------------------------
	setCellInfo : function(cell){
		if(!this.enabled){ return;}

		var val = this.getlink(cell), old = this.cellinfo[cell.id];

		if(val!==old){
			this.cellinfo[cell.id] = val;

			var cid = this.getcid(cell, (val|old));
			var isadd = !!((val&16)&&!(old&16)), isremove = !!(!(val&16)&&(old&16));
			// 新たに黒マス(白マス)くっつける場合 => 自分に領域IDを設定するだけ
			if(isadd && (cid.length<=1)){
				this.assignCell(cell, (cid.length===1?cid[0]:null));
			}
			// 端の黒マス(白マス)ではなくなった時 => まわりの数が0か1なら情報or自分を消去するだけ
			else if(isremove && (cid.length<=1)){
				this.removeCell(cell);
			}
			else{
				this.remakeInfo(cell, cid);
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getlink() 上下左右にのセルに繋がることが可能かどうかの情報を取得する
	// info.getcid()  接する最大4箇所のセルのうち、自分に繋がることができるものを返す
	// info.getcellaround() 今自分が繋がっているセルを返す
	//--------------------------------------------------------------------------------
	getlink : function(cell){
		var val = 0;
		if(!cell.up().isnull){ val+=1;}
		if(!cell.dn().isnull){ val+=2;}
		if(!cell.lt().isnull){ val+=4;}
		if(!cell.rt().isnull){ val+=8;}
		if(this.isvalid(cell)){ val+=16;}
		return val;
	},
	getcid : function(cell, link){
		var cid = [], list = cell.getdir4clist(), pow=[0,1,2,4,8], pow2=[0,2,1,8,4];
		for(var i=0;i<list.length;i++){
			var cell2=list[i][0], dir=list[i][1], link2=this.cellinfo[cell2.id];
			if(this.id[cell2.id]!==null && !!(link & pow[dir]) && !!(link2 & pow2[dir])){ cid.push(cell2.id);}
		}
		return cid;
	},
	getcellaround : function(cell){
		return this.getcid(cell, this.cellinfo[cell.id]);
	},

	//--------------------------------------------------------------------------------
	// info.assignCell() 指定されたセルを有効なセルとして設定する
	// info.removeCell() 指定されたセルを無効なセルとして設定する
	//--------------------------------------------------------------------------------
	assignCell : function(cell, c2){
		var areaid = this.id[cell.id];
		if(areaid!==null && areaid!==0){ return;}

		if(c2===null){
			areaid = this.getnewid();
			if(!!this.owner.painter.irowake){ cell.color = this.owner.painter.getNewLineColor();}
		}
		else{
			areaid = this.id[c2];
			if(!!this.owner.painter.irowake){ cell.color = bd.cell[c2].color;}
		}
		this[areaid].idlist.push(cell.id);
		this.id[cell.id] = areaid;
	},
	removeCell : function(cell){
		var areaid = this.id[cell.id];
		if(areaid===null || areaid===0){ return;}

		var idlist = this[areaid].idlist;
		if(idlist.length>1){
			for(var i=0;i<idlist.length;i++){
				if(idlist[i]===cell.id){ idlist.splice(i,1); break;}
			}
		}

		if(idlist.length===0){ this.invalidid(areaid);}
		this.id[cell.id] = null;
		if(!!this.owner.painter.irowake){ cell.color = "";}
	},

	//--------------------------------------------------------------------------------
	// info.remakeInfo()   線が引かれたり消された時、線が分かれるときのidの再設定を行う
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	remakeInfo : function(cell, cid){
		var longColor = (!!this.owner.painter.irowake ? this.getLongColor(cid) : "");

		if(this.id[cell.id]!==null){ cid.push([cell.id]);}
		var idlist = this.popRoom(cid);
		if(this.id[cell.id]===null){ idlist.push(cell.id);}
		var assign = this.searchIdlist(idlist);

		if(!!this.owner.painter.irowake){ this.setLongColor(assign, longColor);}
	},

	getLongColor : function(cid){
		var longColor = bd.cell[cid[0]].color;
		// 周りで一番大きな線は？
		if(cid.length>1){
			var largeid = this.id[cid[0]];
			for(var i=1;i<cid.length;i++){
				if(this[largeid].idlist.length < this[this.id[cid[i]]].idlist.length){
					largeid = this.id[cid[0]];
					longColor = bd.cell[cid[i]].color;
				}
			}
		}
		return longColor;
	},
	setLongColor : function(assign, longColor){
		// 色を同じにする
		if(assign.length===1){
			var idlist = this[assign[0]].idlist, clist = this.owner.newInstance('CellList');
			for(var i=0,len=idlist.length;i<len;i++){
				var cell = bd.cell[idlist[i]];
				cell.color = longColor;
				clist.add(cell);
			}
			if(this.owner.getConfig('irowake')){ this.owner.painter.repaintBlocks(clist);}
		}
		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		else if(assign.length>1){
			// できた線の中でもっとも長いものを取得する
			var longid = assign[0];
			for(var i=1;i<assign.length;i++){
				if(this[longid].idlist.length < this[assign[i]].idlist.length){ longid = assign[i];}
			}

			// 新しい色の設定
			var clist = this.owner.newInstance('CellList');
			for(var i=0;i<assign.length;i++){
				var newColor = (assign[i]===longid ? longColor : this.owner.painter.getNewLineColor());
				var idlist = this[assign[i]].idlist;
				for(var n=0,len=idlist.length;n<len;n++){
					var cell = bd.cell[idlist[n]];
					cell.color = newColor;
					clist.add(cell);
				}
			}
			if(this.owner.getConfig('irowake')){ this.owner.painter.repaintBlocks(clist);}
		}
	},

	//--------------------------------------------------------------------------------
	// info.searchIdlist() 盤面内のidlistに含まれるセルにIDを付け直す
	// info.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	searchIdlist : function(idlist){
		var assign = [];
		for(var i=0;i<idlist.length;i++){
			var cc = idlist[i];
			this.id[cc] = (this.isvalid(bd.cell[cc])?0:null);
		}
		for(var i=0;i<idlist.length;i++){
			var cc = idlist[i];
			if(this.id[cc]!==0){ continue;}
			var newid = this.getnewid();
			this.searchSingle(cc, newid);
			assign.push(newid);
		}
		return assign;
	},
	searchSingle : function(c, newid){
		var stack=[c], iid=this.id[c];
		while(stack.length>0){
			var cc=stack.pop();
			if(this.id[cc]!==iid){ continue;}
			this.id[cc] = newid;
			this[newid].idlist.push(cc);

			var cid = this.getcellaround(bd.cell[cc]);
			for(var i=0;i<cid.length;i++){
				if(this.id[cid[i]]===0){ stack.push(cid[i]);}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getAreaInfo()  情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getAreaInfo : function(){
		var info = this.owner.newInstance('AreaCellInfo');
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(this.id[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!info.emptyCell(cell)){ continue;}
			info.addRoom();

			var clist = this.getClistByCell(cell);
			for(var i=0;i<clist.length;i++){ info.addCell(clist[i]);}
		}
		return info;
	},

	//--------------------------------------------------------------------------------
	// info.getClistByCell() 指定したセルが含まれる領域のセル配列を取得する
	// info.getClist()       指定した領域のセル配列を取得する
	//--------------------------------------------------------------------------------
	getClistByCell : function(cell){ return this.getClist(this.id[cell.id]);},
	getClist : function(areaid){
		if(!this[areaid]){ alert(areaid);}
		var idlist = this[areaid].idlist, clist = this.owner.newInstance('CellList');
		for(var i=0;i<idlist.length;i++){ clist.add(bd.cell[idlist[i]]);}
		return clist;
	}
});

//--------------------------------------------------------------------------------
// ☆AreaBlackManagerクラス  黒マス情報オブジェクトのクラス
// ☆AreaWhiteManagerクラス  白マス情報オブジェクトのクラス
// ☆AreaNumberManagerクラス 数字情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaBlackManager:AreaCellManager',
{
	isvalid : function(cell){ return cell.isBlack();}
});

pzprv3.createCommonClass('AreaWhiteManager:AreaCellManager',
{
	isvalid : function(cell){ return cell.isWhite();}
});

pzprv3.createCommonClass('AreaNumberManager:AreaCellManager',
{
	isvalid : function(cell){ return cell.isNumberObj();}
});

//--------------------------------------------------------------------------------
// ★AreaBorderManagerクラス セル＋境界線情報が必要な情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaBorderManager:AreaCellManager',
{
	initialize : function(){
		this.isbd  = [];		// 境界線に線が引いてあるかどうか

		pzprv3.core.AreaCellManager.prototype.initialize.call(this);
	},
	relation : ['cell', 'border'],

	//--------------------------------------------------------------------------------
	// info.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// info.rebuild() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset : function(){
		this.isbd = [];

		pzprv3.core.AreaCellManager.prototype.reset.call(this);
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		for(var id=0;id<bd.bdmax;id++){
			this.isbd[id]=false;
			this.setbd(bd.border[id]);
		}

		pzprv3.core.AreaCellManager.prototype.rebuild.call(this);
	},

	//--------------------------------------------------------------------------------
	// info.bdfunc() 境界線が存在するかどうかを返す
	// info.setbd()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	bdfunc : function(border){ return false;}, /* 境界線の存在条件 */
	setbd : function(border){
		var isbd = this.bdfunc(border);
		if(this.isbd[border.id]!==isbd){
			this.isbd[border.id]=isbd;
			return true;
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// info.getlink() 上下左右に繋がるかの情報を取得する
	//--------------------------------------------------------------------------------
	getlink : function(cell){
		var val = 0;
		if(!cell.up().isnull && !this.isbd[cell.ub().id]){ val+=1;}
		if(!cell.dn().isnull && !this.isbd[cell.db().id]){ val+=2;}
		if(!cell.lt().isnull && !this.isbd[cell.lb().id]){ val+=4;}
		if(!cell.rt().isnull && !this.isbd[cell.rb().id]){ val+=8;}
		if(this.isvalid(cell)){ val+=16;}
		return val;
	},

	//--------------------------------------------------------------------------------
	// info.setCellInfo() マスの有効/無効切り替え時などに、IDの情報を変更する
	//--------------------------------------------------------------------------------
	setCellInfo : function(cell){
		if(!this.enabled){ return;}

		var result = false, cblist=cell.getdir4cblist();
		for(var i=0;i<cblist.length;i++){
			var cell2=cblist[i][0], border=cblist[i][1];
			if(this.setbd(border)){
				this.cellinfo[cell2.id] = this.getlink(cell2);
				result = true;
			}
		}
		if(!result){ return;}

		pzprv3.core.AreaCellManager.prototype.setCellInfo.call(this, cell);
	},

	//--------------------------------------------------------------------------------
	// info.setBorderInfo()   境界線が引かれたり消されてたりした時に、部屋情報を更新する
	// info.checkExecSearch() 部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	setBorderInfo : function(border){
		if(!this.enabled){ return;}
		if(!this.setbd(border)){ return;}

		var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
		this.cellinfo[cell1.id] = this.getlink(cell1);
		this.cellinfo[cell2.id] = this.getlink(cell2);
		if(cell1.isnull || cell2.isnull || !this.checkExecSearch(border)){ return;}

		this.searchIdlist(this.popRoom([cell1.id, cell2.id]));
	},
	checkExecSearch : function(border){
		var cc1 = border.sidecell[0].id,  cc2 = border.sidecell[1].id;

		if(this.isbd[border.id]){ /* 部屋を分けるのに、最初から分かれていた */
			if(this.id[cc1]===null || this.id[cc2]===null || this.id[cc1]!==this.id[cc2]){ return false;} // はじめから分かれていた
		}
		else{ /* 部屋を繋げるのに、最初から同じ部屋だった */
			if(this.id[cc1]!==null && this.id[cc1]===this.id[cc2]){ return false;}
		}
		return true;
	}
});

//--------------------------------------------------------------------------------
// ☆AreaRoomManagerクラス 部屋情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaRoomManager:AreaBorderManager',
{
	initialize : function(){
		this.bdcnt = [];		// 格子点の周りの境界線の数

		pzprv3.core.AreaBorderManager.prototype.initialize.call(this);
	},
	relation : ['cell', 'border'],
	bdfunc : function(border){ return border.isBorder();},

	hastop : false,

	//--------------------------------------------------------------------------------
	// rooms.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// rooms.rebuild() 部屋情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset : function(){
		this.bdcnt = [];

		pzprv3.core.AreaBorderManager.prototype.reset.call(this);
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		/* 外枠のカウントをあらかじめ足しておく */
		for(var by=bd.minby;by<=bd.maxby;by+=2){ for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
			var c = (bx>>1)+(by>>1)*(bd.qcols+1);
			var ischassis = (bd.isborder===1 ? (bx===bd.minbx||bx===bd.maxbx||by===bd.minby||by===bd.maxby):false);
			this.bdcnt[c]=(ischassis?2:0);
		}}

		pzprv3.core.AreaBorderManager.prototype.rebuild.call(this);

		if(this.enabled && this.hastop){ this.resetRoomNumber();}
	},

	//--------------------------------------------------------------------------------
	// rooms.setbd()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	setbd : function(border){
		var isbd = this.bdfunc(border);
		if(this.isbd[border.id]!==isbd){
			var cc1 = border.sidecross[0].id, cc2 = border.sidecross[1].id;
			if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
			if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
			this.isbd[border.id]=isbd;
			if(border.id<bd.bdinside){ return true;}
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// rooms.checkExecSearch() 部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	// オーバーライド
	checkExecSearch : function(border){
		if(!pzprv3.core.AreaBorderManager.prototype.checkExecSearch.call(this,border)){ return false;}

		// 途切れた線だったとき
		var xc1 = border.sidecross[0].id, xc2 = border.sidecross[1].id;
		if     ( this.isbd[border.id] && (this.bdcnt[xc1]===1 || this.bdcnt[xc2]===1)){ return false;}
		else if(!this.isbd[border.id] && (this.bdcnt[xc1]===0 || this.bdcnt[xc2]===0)){ return false;}

		// TOPがある場合 どっちの数字を残すかは、TOP同士の位置で比較する
		var cell1 = border.sidecell[0],  cell2 = border.sidecell[1];
		if(!this.isbd[border.id] && this.hastop){this.setTopOfRoom_combine(cell1,cell2);}

		return true;
	},

	//--------------------------------------------------------------------------------
	// rooms.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	// オーバーライド
	searchSingle : function(c, newid){
		pzprv3.core.AreaBorderManager.prototype.searchSingle.call(this, c, newid);

		if(this.hastop){ this.setTopOfRoom(newid);}
	},

	//--------------------------------------------------------------------------------
	// rooms.setTopOfRoom_combine()  部屋が繋がったとき、部屋のTOPを設定する
	//--------------------------------------------------------------------------------
	setTopOfRoom_combine : function(cell1,cell2){
		var merged, keep;
		var tcell1 = this.getTopOfRoomByCell(cell1);
		var tcell2 = this.getTopOfRoomByCell(cell2);
		if(cell1.bx>cell2.bx || (cell1.bx===cell2.bx && cell1.id>cell2.id)){ merged = tcell1; keep = tcell2;}
		else                                                               { merged = tcell2; keep = tcell1;}

		// 消える部屋のほうの数字を消す
		if(merged.isNum()){
			// 数字が消える部屋にしかない場合 -> 残るほうに移動させる
			if(keep.noNum()){
				keep.setQnum(merged.getQnum());
				keep.draw();
			}
			merged.setQnum(-1);
			merged.draw();
		}
	},

	//--------------------------------------------------------------------------------
	// rooms.calcTopOfRoom()   部屋のTOPになりそうなセルのIDを返す
	// rooms.setTopOfRoom()    部屋のTOPを設定する
	// rooms.resetRoomNumber() 情報の再構築時に部屋のTOPのIDを設定したり、数字を移動する
	//--------------------------------------------------------------------------------
	calcTopOfRoom : function(roomid){
		var cc=null, bx=bd.maxbx, by=bd.maxby;
		var idlist = this[roomid].idlist;
		for(var i=0;i<idlist.length;i++){
			var cell = bd.cell[idlist[i]];
			if(cell.bx>bx || (cell.bx===bx && cell.by>=by)){ continue;}
			cc=idlist[i];
			bx=cell.bx;
			by=cell.by;
		}
		return cc;
	},
	setTopOfRoom : function(roomid){
		this[roomid].top = this.calcTopOfRoom(roomid);
	},
	resetRoomNumber : function(){
		for(var r=1;r<=this.max;r++){
			var val = -1, idlist = this[r].idlist, top = this.getTopOfRoom(r);
			for(var i=0,len=idlist.length;i<len;i++){
				var c = idlist[i], cell = bd.cell[c];
				if(this.id[c]===r && cell.qnum!==-1){
					if(val===-1){ val = cell.qnum;}
					if(top!==c){ cell.qnum = -1;}
				}
			}
			if(val!==-1 && top.qnum===-1){
				top.qnum = val;
			}
		}
	},

	//--------------------------------------------------------------------------------
	// rooms.getRoomID()  このオブジェクトで管理しているセルの部屋IDを取得する
	// rooms.setRoomID()  このオブジェクトで管理しているセルの部屋IDを設定する
	// rooms.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// rooms.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// rooms.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// rooms.getCntOfRoom()       指定した領域の大きさを抽出する
	//--------------------------------------------------------------------------------
	getRoomID : function(cell){ return this.id[cell.id];},
//	setRoomID : function(cell,val){ this.id[cell.id] = val;},

	getTopOfRoomByCell : function(cell){ return bd.cell[this[this.id[cell.id]].top];},
	getTopOfRoom       : function(id)  { return bd.cell[this[id].top];},

	getCntOfRoomByCell : function(cell){ return this[this.id[cell.id]].idlist.length;}
//	getCntOfRoom       : function(id)  { return this[id].idlist.length;},
});

//--------------------------------------------------------------------------------
// ☆AreaLineManagerクラス 線つながり情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaLineManager:AreaBorderManager',
{
	initialize : function(){
		this.bdcnt = [];		// セルの周りの線の数

		pzprv3.core.AreaBorderManager.prototype.initialize.call(this);
	},
	relation : ['cell', 'line'],
	isvalid : function(cell){ return this.bdcnt[cell.id]<4;},
	bdfunc : function(border){ return !border.isLine();},

	//--------------------------------------------------------------------------------
	// linfo.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// linfo.rebuild() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset : function(){
		this.bdcnt = [];

		pzprv3.core.AreaBorderManager.prototype.reset.call(this);
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		/* 外枠のカウントをあらかじめ足しておく */
		for(var c=0;c<bd.cellmax;c++){
			var bx=bd.cell[c].bx, by=bd.cell[c].by;
			this.bdcnt[c]=0;
			if(bx===bd.minbx+1||bx===bd.maxbx-1){ this.bdcnt[c]++;}
			if(by===bd.minby+1||by===bd.maxby-1){ this.bdcnt[c]++;}
		}

		pzprv3.core.AreaBorderManager.prototype.rebuild.call(this);
	},

	//--------------------------------------------------------------------------------
	// linfo.setbd()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	setbd : function(border){
		var isbd = this.bdfunc(border);
		if(this.isbd[border.id]!==isbd){
			var cc1 = border.sidecell[0].id, cc2 = border.sidecell[1].id;
			if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
			if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
			this.isbd[border.id]=isbd;
			if(border.id<bd.bdinside){ return true;}
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// info.setLineInfo()  線が引かれたり消されてたりした時に、部屋情報を更新する
	//--------------------------------------------------------------------------------
	setLineInfo : function(border){
		this.setBorderInfo(border);
	}
});
