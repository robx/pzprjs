// BoardExt.js v3.4.0

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
pzprv3.createCommonClass('LineManager',
{
	initialize : function(owner){
		this.owner = owner;

		this.lcnt    = [];
		this.ltotal  = [];

		this.disableLine = (!this.isCenterLine && !this.borderAsLine);
		this.data    = {};	// 線id情報

		this.disrec = 0;
	},

	// 下記の2フラグはどちらかがtrueになります(両方trueはだめです)
	isCenterLine : false,	// マスの真ん中を通る線を回答として入力するパズル
	borderAsLine : false,	// 境界線をlineとして扱う

	isLineCross : false,	// 線が交差するパズル

	// 定数
	typeA : 'A',
	typeB : 'B',
	typeC : 'C',

	//---------------------------------------------------------------------------
	// bd.lines.init()           変数の起動時の初期化を行う
	// bd.lines.disableRecord()  操作の登録を禁止する
	// bd.lines.enableRecord()   操作の登録を許可する
	// bd.lines.isenableRecord() 操作の登録できるかを返す
	//---------------------------------------------------------------------------
	init : function(){
		if(this.disableLine){ return;}

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
		this.data = {max:0,id:[]};
		for(var id=0;id<bd.bdmax;id++){ this.data.id[id] = null;}
	},

	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.disrec===0);},

	//---------------------------------------------------------------------------
	// bd.lines.resetLcnts()  lcnts等の変数の初期化を行う
	// bd.lines.newIrowake()  線の情報が再構築された際、線に色をつける
	// bd.lines.lcntCell()    セルに存在する線の本数を返す
	//---------------------------------------------------------------------------
	resetLcnts : function(){
		if(this.disableLine){ return;}

		this.init();
		var bid = [];
		for(var id=0;id<bd.bdmax;id++){
			if(bd.isLine(id)){
				this.data.id[id] = 0;
				bid.push(id);

				var cc1, cc2;
				if(this.isCenterLine){ cc1 = bd.border[id].cellcc[0];  cc2 = bd.border[id].cellcc[1]; }
				else                 { cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}

				if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
				if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
			}
			else{
				this.data.id[id] = null;
			}
		}
		this.reassignId(bid);
		if(pc.irowake!==0){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.data.max;i++){
			var idlist = this.data[i].idlist;
			if(idlist.length>0){
				var newColor = pc.getNewLineColor();
				for(var n=0;n<idlist.length;n++){
					bd.border[idlist[n]].color = newColor;
				}
			}
		}
	},
	lcntCell  : function(cc){ return (!!this.lcnt[cc]?this.lcnt[cc]:0);},

	//---------------------------------------------------------------------------
	// bd.lines.gettype()    線が引かれた/消された時に、typeA/typeB/typeCのいずれか判定する
	// bd.lines.isTpos()     pieceが、指定されたcc内でidの反対側にあるか判定する
	// bd.lines.iscrossing() 指定されたセル/交点で線が交差する場合にtrueを返す
	//---------------------------------------------------------------------------
	gettype : function(cc,id,isset){
		var erase = (isset?0:1);
		if(cc===null){
			return this.typeA;
		}
		else if(!this.iscrossing(cc)){
			return ((this.lcnt[cc]===(1-erase))?this.typeA:this.typeB);
		}
		else{
			if     (this.lcnt[cc]===(1-erase) || (this.lcnt[cc]===(3-erase) && this.isTpos(cc,id))){ return this.typeA;}
			else if(this.lcnt[cc]===(2-erase) ||  this.lcnt[cc]===(4-erase)){ return this.typeB;}
			return this.typeC;
		}
	},
	isTpos : function(cc,id){
		//   │ ←id                    
		// ━┷━                       
		//   ・ ←この場所に線があるか？
		if(this.isCenterLine){
			return !bd.isLine(bd.bnum( 2*bd.cell[cc].bx-bd.border[id].bx, 2*bd.cell[cc].by-bd.border[id].by ));
		}
		else{
			return !bd.isLine(bd.bnum( 4*(cc%(bd.qcols+1))-bd.border[id].bx, 4*((cc/(bd.qcols+1))|0)-bd.border[id].by ));
		}
	},
	iscrossing : function(cc){ return this.isLineCross;},

	//---------------------------------------------------------------------------
	// bd.lines.setLine()         線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	// 
	// bd.lines.combineLineInfo() 線が引かれた時に、周りの線が全てくっついて1つの線が
	//                            できる場合の線idの再設定を行う
	// bd.lines.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                            可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	setLine : function(id){
		if(this.disableLine || !this.isenableRecord()){ return;}
		var isset = bd.isLine(id);
		if(isset===(this.data.id[id]!==null)){ return;}

		var cc1, cc2;
		if(this.isCenterLine){ cc1 = bd.border[id].cellcc[0];  cc2 = bd.border[id].cellcc[1]; }
		else                 { cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}

		if(isset){
			if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
		}
		else{
			if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]--; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]--; this.ltotal[this.lcnt[cc2]]++;}
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
		var type1 = this.gettype(cc1,id,isset), type2 = this.gettype(cc2,id,isset);
		if(isset){
			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(type1===this.typeA && type2===this.typeA){
				this.data.max++;
				this.data[this.data.max] = {idlist:[id]};
				this.data.id[id] = this.data.max;
				bd.border[id].color = pc.getNewLineColor();
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var bid = (this.getbid(id,1))[0];
				this.data[this.data.id[bid]].idlist.push(id);
				this.data.id[id] = this.data.id[bid];
				bd.border[id].color = bd.border[bid].color;
			}
			// (B)+(B)の場合 -> くっついた線で、大きい方の線idに統一する
			else if(type1===this.typeB && type2===this.typeB){
				this.combineLineInfo(id);
			}
			// その他の場合
			else{
				this.remakeLineInfo(id,1);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			if(type1===this.typeA && type2===this.typeA){
				this.data[this.data.id[id]] = {idlist:[]};
				this.data.id[id] = null;
				bd.border[id].color = "";
			}
			// (A)+(B)の場合 -> 既存の線から取り除く
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var ownid = this.data.id[id], idlist = this.data[ownid].idlist;
				for(var i=0;i<idlist.length;i++){ if(idlist[i]===id){ idlist.splice(i,1); break;} }
				this.data.id[id] = null;
				bd.border[id].color = "";
			}
			// (B)+(B)の場合、その他の場合 -> 分かれた線にそれぞれ新しい線idをふる
			else{
				this.remakeLineInfo(id,0);
				bd.border[id].color = "";
			}
		}
	},

	combineLineInfo : function(id){
		var dataid = this.data.id;

		// この関数の突入条件より、bid.lengthは必ず2になる
		// →ならなかった... くっつく線のID数は必ず2以下になる
		var bid = this.getbid(id,1);
		var did = [dataid[bid[0]], null];
		for(var i=0;i<bid.length;i++){
			if(did[0]!=dataid[bid[i]]){
				did[1]=dataid[bid[i]];
				break;
			}
		}

		var newColor = bd.border[bid[0]].color;
		// くっつく線のID数が2種類の場合
		if(did[1] != null){
			// どっちが長いの？
			var longid = did[0], shortid = did[1];
			if(this.data[did[0]].idlist.length < this.data[did[1]].idlist.length){
				longid=did[1]; shortid=did[0];
				newColor = bd.border[bid[1]].color;
			}

			// つながった線は全て同じIDにする
			var longidlist  = this.data[longid].idlist;
			var shortidlist = this.data[shortid].idlist;
			for(var n=0,len=shortidlist.length;n<len;n++){
				longidlist.push(shortidlist[n]);
				dataid[shortidlist[n]] = longid;
			}
			this.data[shortid].idlist = [];

			longidlist.push(id);
			dataid[id] = longid;

			// 色を同じにする
			for(var i=0,len=longidlist.length;i<len;i++){
				bd.border[longidlist[i]].color = newColor;
			}
			if(pp.getVal('irowake')){ pc.repaintLines(longidlist, id);}
		}
		// くっつく線のID数が1種類の場合 => 既存の線にくっつける
		else{
			this.data[did[0]].idlist.push(id);
			dataid[id] = did[0];
			bd.border[id].color = newColor;
		}
	},
	remakeLineInfo : function(id,val){
		var dataid = this.data.id;
		var oldmax = this.data.max;	// いままでのthis.data.max値

		// つなげた線のIDを一旦0にして、max+1, max+2, ...を割り振りしなおす関数

		// つながった線の線情報を一旦0にする
		var bid = this.getbid(id,val);
		var oldlongid = dataid[bid[0]], longColor = bd.border[bid[0]].color;
		for(var i=0,len=bid.length;i<len;i++){
			var current = dataid[bid[i]];
			if(current<=0){ continue;}
			var idlist = this.data[current].idlist;
			if(this.data[oldlongid].idlist.length < idlist.length){
				oldlongid = current;
				longColor = bd.border[bid[i]].color;
			}
			for(var n=0,len2=idlist.length;n<len2;n++){ dataid[idlist[n]] = 0;}
			this.data[current] = {idlist:[]};
		}

		// 自分のIDの情報を変更する
		if(val>0){ dataid[id] =  0; bid.unshift(id);}
		else     { dataid[id] = null;}

		// 新しいidを設定する
		this.reassignId(bid);

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する

		// できた線の中でもっとも長いものを取得する
		var newlongid = oldmax+1;
		for(var current=oldmax+1;current<=this.data.max;current++){
			var idlist = this.data[current].idlist;
			if(this.data[newlongid].idlist.length<idlist.length){ newlongid = current;}
		}

		// 新しい色の設定
		for(var current=oldmax+1;current<=this.data.max;current++){
			var newColor = (current===newlongid ? longColor : pc.getNewLineColor());
			var idlist = this.data[current].idlist;
			for(var n=0,len=idlist.length;n<len;n++){ bd.border[idlist[n]].color = newColor;}
			if(pp.getVal('irowake')){ pc.repaintLines(idlist, id);}
		}
	},

	//---------------------------------------------------------------------------
	// bd.lines.getClistFromIdlist() idlistの線が重なるセルのリストを取得する
	// bd.lines.getXlistFromIdlist() idlistの線が重なる交点のリストを取得する
	//---------------------------------------------------------------------------
	getClistFromIdlist : function(idlist){
		var clist = new pzprv3.core.IDList();
		for(var i=0;i<idlist.length;i++){
			clist.push(bd.border[idlist[i]].cellcc[0]);
			clist.push(bd.border[idlist[i]].cellcc[1]);
		}
		return clist.unique().data;
	},
	getXlistFromIdlist : function(idlist){
		var xlist = new pzprv3.core.IDList();
		for(var i=0;i<idlist.length;i++){
			xlist.push(bd.border[idlist[i]].crosscc[0]);
			xlist.push(bd.border[idlist[i]].crosscc[1]);
		}
		return xlist.unique().data;
	},

	//---------------------------------------------------------------------------
	// bd.lines.getbid()     指定したpieceに繋がる、最大6箇所に引かれている線を全て取得する
	// bd.lines.reassignId() ひとつながりの線にlineidを設定する
	//---------------------------------------------------------------------------
	getbid : function(id,val){
		var erase=(val>0?0:1), bx=bd.border[id].bx, by=bd.border[id].by;
		var dx=((this.isCenterLine^(bx%2===0))?2:0), dy=(2-dx);	// (dx,dy) = (2,0) or (0,2)

		var cc1, cc2;
		if(this.isCenterLine){ cc1 = bd.border[id].cellcc[0];  cc2 = bd.border[id].cellcc[1]; }
		else                 { cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}
		// 交差ありでborderAsLine==true(->isCenterLine==false)のパズルは作ってないはず
		// 今までのオモパで該当するのもスリザーボックスくらいだったような、、

		var lines=[];
		if(cc1!==null){
			var iscrossing=this.iscrossing(cc1), lcnt=this.lcnt[cc1];
			if(iscrossing && lcnt>=(4-erase)){
				lines.push(bd.bnum(bx-dy,   by-dx  )); // cc1からのstraight
			}
			else if(lcnt>=(2-erase) && !(iscrossing && lcnt===(3-erase) && this.isTpos(cc1,id))){
				lines.push(bd.bnum(bx-dy,   by-dx  )); // cc1からのstraight
				lines.push(bd.bnum(bx-1,    by-1   )); // cc1からのcurve1
				lines.push(bd.bnum(bx+dx-1, by+dy-1)); // cc1からのcurve2
			}
		}
		if(cc2!==null){
			var iscrossing=this.iscrossing(cc2), lcnt=this.lcnt[cc2];
			if(iscrossing && lcnt>=(4-erase)){
				lines.push(bd.bnum(bx+dy,   by+dx  )); // cc2からのstraight
			}
			else if(lcnt>=(2-erase) && !(iscrossing && lcnt===(3-erase) && this.isTpos(cc2,id))){
				lines.push(bd.bnum(bx+dy,   by+dx  )); // cc2からのstraight
				lines.push(bd.bnum(bx+1,    by+1   )); // cc2からのcurve1
				lines.push(bd.bnum(bx-dx+1, by-dy+1)); // cc2からのcurve2
			}
		}

		var bid = [];
		for(var i=0;i<lines.length;i++){ if(bd.isLine(lines[i])){ bid.push(lines[i]);}}
		return bid;
	},

	reassignId : function(bid){
		for(var i=0,len=bid.length;i<len;i++){
			if(this.data.id[bid[i]]!==0){ continue;}	// 既にidがついていたらスルー
			var bx0=bd.border[bid[i]].bx, by0=bd.border[bid[i]].by;
			this.data.max++;
			this.data[this.data.max] = {idlist:[]};

			var newid = this.data.max;
			var stack=((!this.isCenterLine^(bx0&1))?[[bx0,by0+1,1],[bx0,by0,2]]:[[bx0+1,by0,3],[bx0,by0,4]]);
			while(stack.length>0){
				var dat=stack.pop(), bx=dat[0], by=dat[1], dir=dat[2];
				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if((bx+by)%2===0){
						var cc = (this.isCenterLine?bd.cnum:bd.xnum).call(bd,bx,by);
						if(cc===null){ break;}
						else if(this.lcnt[cc]>=3){
							if(!this.iscrossing(cc)){
								if(bd.isLine(bd.bnum(bx,by-1))){ stack.push([bx,by,1]);}
								if(bd.isLine(bd.bnum(bx,by+1))){ stack.push([bx,by,2]);}
								if(bd.isLine(bd.bnum(bx-1,by))){ stack.push([bx,by,3]);}
								if(bd.isLine(bd.bnum(bx+1,by))){ stack.push([bx,by,4]);}
								break;
							}
							/* lcnt>=3でiscrossing==trueの時は直進＝何もしない */
						}
						else{
							if     (dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
							else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
							else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
							else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
						}
					}
					else{
						var id = bd.bnum(bx,by);
						if(this.data.id[id]!==0){ break;}
						this.data.id[id] = newid;
						this.data[newid].idlist.push(id);
					}
				}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// bd.lines.getLineInfo()    線情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		var info = new pzprv3.core.AreaInfo();
		for(var id=0;id<bd.bdmax;id++){ info.id[id]=(bd.isLine(id)?0:null);}
		for(var id=0;id<bd.bdmax;id++){
			if(info.id[id]!=0){ continue;}
			info.max++;
			info.room[info.max] = {idlist:this.data[this.data.id[id]].idlist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0;i<info.room[info.max].idlist.length;i++){
				info.id[info.room[info.max].idlist[i]] = info.max;
			}
		}
		return info;
	}
});

//--------------------------------------------------------------------------------
// ★AreaManagerクラス 部屋のTOP-Cellの位置等の情報を扱う
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRoomNumber()等が必要です。
//--------------------------------------------------------------------------------
// 部屋のTOPに数字を入力する時の、ハンドリング等
pzprv3.createCommonClass('AreaManager',
{
	initialize : function(owner){
		this.owner = owner;

		this.rinfo = null;	// 部屋情報を保持する
		this.linfo = null;	// 線つながり情報を保持する

		this.bcell = null;	// 黒マス情報を保持する
		this.wcell = null;	// 白マス情報を保持する
		this.ncell = null;	// 数字情報を保持する

		// 問題の数字が部屋の左上に1つだけ入るパズル
		this.roomNumber = (!!this.owner.classes.AreaRoomData.prototype.hastop);

		this.disrec = 0;
	},
	roomNumber     : false,	// initialize()で初期化

	hasroom        : false,	// いくつかの領域に分かれている/分けるパズル
	lineToArea     : false,	// 線のつながりを部屋情報として取得するパズル

	checkBlackCell : false,	// 正答判定で黒マスの情報をチェックするパズル
	checkWhiteCell : false,	// 正答判定で白マスの情報をチェックするパズル
	linkNumber     : false,	// 数字がひとつながりになるパズル

	//--------------------------------------------------------------------------------
	// bd.areas.disableRecord()  操作の登録を禁止する
	// bd.areas.enableRecord()   操作の登録を許可する
	// bd.areas.isenableRecord() 操作の登録できるかを返す
	//--------------------------------------------------------------------------------
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.disrec===0);},

	//--------------------------------------------------------------------------------
	// bd.areas.init()       起動時に変数を初期化する
	// bd.areas.resetArea()  部屋、黒マス、白マスの情報をresetする
	//--------------------------------------------------------------------------------
	init : function(){
		if(this.hasroom)   { this.rinfo = new this.owner.classes.AreaRoomData(this.owner);}
		if(this.lineToArea){ this.linfo = new this.owner.classes.AreaLineData(this.owner);}

		if(this.checkBlackCell){ this.bcell = new this.owner.classes.AreaBlackData(this.owner);}
		if(this.checkWhiteCell){ this.wcell = new this.owner.classes.AreaWhiteData(this.owner);}
		if(this.linkNumber)    { this.ncell = new this.owner.classes.AreaNumberData(this.owner);}
	},

	resetArea : function(){
		if(!!this.bcell){ this.bcell.reset();}
		if(!!this.wcell){ this.wcell.reset();}
		if(!!this.ncell){ this.ncell.reset();}

		if(!!this.rinfo){ this.rinfo.reset();}
		if(!!this.linfo){ this.linfo.reset();}
	},

	//--------------------------------------------------------------------------------
	// bd.areas.setBorder()  境界線が引かれたり消されてたりした時に、部屋情報を更新する
	//--------------------------------------------------------------------------------
	setBorder : function(id){
		if(!this.isenableRecord()){ return;}

		if(!!this.rinfo){ this.rinfo.setBorder(id);}
		if(!!this.linfo){ this.linfo.setBorder(id);}
	},

	//--------------------------------------------------------------------------------
	// bd.areas.setCell() 黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	//--------------------------------------------------------------------------------
	setCell : function(cc){
		if(!this.isenableRecord()){ return;}

		if(!!this.bcell){ this.bcell.setCell(cc);}
		if(!!this.wcell){ this.wcell.setCell(cc);}
		if(!!this.ncell){ this.ncell.setCell(cc);}

		if(!!this.rinfo){ this.rinfo.setCell(cc);}
		if(!!this.linfo){ this.linfo.setCell(cc);}
	},

	//--------------------------------------------------------------------------------
	// bd.areas.getRoomInfo()  部屋情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getLareaInfo() 線つながり情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getBCellInfo() 黒マス情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getWCellInfo() 白マス情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getNumberInfo() 数字情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getRoomInfo  : function(){ return this.rinfo.getAreaInfo();},
	getLareaInfo : function(){ return this.linfo.getAreaInfo();},
	getBCellInfo : function(){ return this.bcell.getAreaInfo();},
	getWCellInfo : function(){ return this.wcell.getAreaInfo();},
	getNumberInfo : function(){ return this.ncell.getAreaInfo();}
});

//--------------------------------------------------------------------------------
// ★AreaDataクラス AreaManagerで使用するオブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCoreClass('AreaData',
{
	initialize : function(owner){
		this.owner = owner;

		this.max;
		this.invalid;	// 使わなくなったIDのリスト
		this.id;		// 各々のセルのid
		this.cellinfo;	// セルの情報を保持しておく

		this.reset();
	},
	isvalid : function(){ return true;},

	//--------------------------------------------------------------------------------
	// info.reset() ファイル読み込み時などに、保持している情報を再構築する
	//--------------------------------------------------------------------------------
	reset : function(){
		this.max      = 0;
		this.invalid  = [];
		this.id       = [];
		this.cellinfo = [];

		var clist = [];
		for(var cc=0;cc<bd.cellmax;cc++){
			this.cellinfo[cc] = this.getlink(cc);
			this.id[cc] = 0;
			clist.push(cc);
		}
		this.searchClist(clist);
	},

	//--------------------------------------------------------------------------------
	// info.newIrowake()  線の情報が再構築された際、ブロックに色をつける
	//--------------------------------------------------------------------------------
	newIrowake : function(){
		for(var i=1;i<=this.max;i++){
			var clist = this[i].clist;
			if(clist.length>0){
				var newColor = pc.getNewLineColor();
				for(var n=0;n<clist.length;n++){
					bd.cell[clist[n]].color = newColor;
				}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(cid){
		var longColor = bd.cell[cid[0]].color;
		// 周りで一番大きな線は？
		if(cid.length>1){
			var largeid = this.id[cid[0]];
			for(var i=1;i<cid.length;i++){
				if(this[largeid].clist.length < this[this.id[cid[i]]].clist.length){
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
			var clist = this[assign[0]].clist;
			for(var i=0,len=clist.length;i<len;i++){ bd.cell[clist[i]].color = longColor;}
			if(pp.getVal('irowake')){ pc.repaintBlocks(clist);}
		}
		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		else if(assign.length>1){
			// できた線の中でもっとも長いものを取得する
			var longid = assign[0];
			for(var i=1;i<assign.length;i++){
				if(this[longid].clist.length < this[assign[i]].clist.length){ longid = assign[i];}
			}

			// 新しい色の設定
			for(var i=0;i<assign.length;i++){
				var newColor = (assign[i]===longid ? longColor : pc.getNewLineColor());
				var clist = this[assign[i]].clist;
				for(var n=0,len=clist.length;n<len;n++){ bd.cell[clist[n]].color = newColor;}
			}
			if(pp.getVal('irowake')){ pc.repaintBlocks(org_clist);}
		}
	},

	//--------------------------------------------------------------------------------
	// info.setCell()      黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	// info.setCell_main() setCellから呼び出される本体
	//--------------------------------------------------------------------------------
	setCell : function(cc){
		var val = this.getlink(cc), old = this.cellinfo[cc];
		if(val===old){ return;}
		else{
			this.setCell_main(cc, val, old);
		}
	},
	setCell_main : function(cc, val, old){
		this.cellinfo[cc] = val;

		var isset = (val>old), cid = this.getcid(cc, (val>old?val:old));
		// 新たに黒マス(白マス)になった時
		if(isset){
			if(cid.length<=1){ this.assignCell(cc, (cid.length===1?cid[0]:null));}
			else             { this.combineInfo(cc, cid);}
		}
		// 黒マス(白マス)ではなくなった時
		else{
			if(cid.length<=1){ this.removeCell(cc);}	// まわりが0か1なら情報or自分を消去するだけ
			else             { this.remakeInfo(cc, cid);}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getlink() 上下左右に繋がるかの情報を取得する
	// info.getcid()  繋がることができる隣のセルのリストを返す
	//--------------------------------------------------------------------------------
	getlink : function(cc){
		var val = 0;
		if(this.isvalid(cc)){
			if(bd.up(cc)!==null){ val+=1;}
			if(bd.dn(cc)!==null){ val+=2;}
			if(bd.lt(cc)!==null){ val+=4;}
			if(bd.rt(cc)!==null){ val+=8;}
		}
		return val;
	},
	getcid : function(c, link){
		var cid = [], clist = bd.getdir4clist(c), pow=[0,1,2,4,8], pow2=[0,2,1,8,4];
		for(var i=0;i<clist.length;i++){
			var cc=clist[i][0], dir=clist[i][1], link2=this.cellinfo[cc];
			if(this.id[cc]!==null && !!(link & pow[dir]) && !!(link2 & pow2[dir])){ cid.push(cc);}
		}
		return cid;
	},

	//--------------------------------------------------------------------------------
	// info.assignCell() 指定されたセルを有効なセルとして設定する
	// info.removeCell() 指定されたセルを無効なセルとして設定する
	//--------------------------------------------------------------------------------
	assignCell : function(c, c2){
		var newid, areaid = this.id[c];
		if(areaid!==null && areaid!==0){ return;}

		if(c2===null){
			newid = this.getnewid();
			this[newid].clist = [];
			if(!!pc.irowake){ bd.cell[c].color = pc.getNewLineColor();}
		}
		else{
			newid = this.id[c2];
			if(!!pc.irowake){ bd.cell[c].color = bd.cell[c2].color;}
		}
		this[newid].clist.push(c);
		this.id[c] = newid;
	},
	removeCell : function(c){
		var areaid = this.id[c];
		if(areaid===null || areaid===0){ return;}

		var clist = this[areaid].clist;
		if(clist.length>1){
			for(var i=0;i<clist.length;i++){
				if(clist[i]===c){ clist.splice(i,1); break;}
			}
		}

		if(clist.length===0){ this.invalidid(areaid);}
		this.id[c] = null;
		if(!!pc.irowake){ bd.cell[c].color = "";}
	},

	//--------------------------------------------------------------------------------
	// info.getnewid()   新しく割り当てるidを取得する
	// info.invalidid()  部屋idを無効にする
	//--------------------------------------------------------------------------------
	getnewid : function(){
		var newid;
		if(this.invalid.length>0){ newid = this.invalid.shift();}
		else{ this.max++; newid=this.max;}

		this[newid] = {clist:[]};
		return newid;
	},
	invalidid : function(id){
		var clist = this[id].clist.concat();
		this[id] = {clist:[]};
		this.invalid.push(id);
		return clist;
	},

	//--------------------------------------------------------------------------------
	// info.popRoom() 指定された複数のセルが含まれる部屋を全て無効にしてclistを返す
	//--------------------------------------------------------------------------------
	popRoom : function(ccs){
		var clist = [];
		for(var n=0;n<ccs.length;n++){
			var r = this.id[ccs[n]];
			if(r!==null && r!==0){
				var clist2 = this.invalidid(r);
				for(var i=0,len=clist2.length;i<len;i++){
					clist.push(clist2[i]);
					this.id[clist2[i]] = 0;
				}
			}
			else if(r===null){ clist.push(ccs[n]);}
		}
		return clist;
	},

	//--------------------------------------------------------------------------------
	// info.combineInfo() 周りの線がくっついて1つの線ができる場合のidの再設定を行う
	// info.remakeInfo()  線が引かれたり消された時、線が分かれるときのidの再設定を行う
	//--------------------------------------------------------------------------------
	combineInfo : function(c, cid){
		var longColor = (!!pc.irowake ? this.getLongColor(cid) : "");

		var clist = this.popRoom(cid);
		clist.push(c);
		var assign = this.searchClist(clist);

		if(!!pc.irowake){ this.setLongColor(assign, longColor);}
	},
	remakeInfo : function(c, cid){
		var longColor = (!!pc.irowake ? this.getLongColor(cid) : "");

		var clist = this.popRoom(cid);
		var assign = this.searchClist(clist);

		if(!!pc.irowake){ this.setLongColor(assign, longColor);}
	},

	//--------------------------------------------------------------------------------
	// info.searchClist()  盤面内のclistに含まれるセルにIDを付け直す
	// info.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	searchClist : function(clist){
		var assign = [];
		for(var i=0;i<clist.length;i++){
			var cc = clist[i];
			this.id[cc] = (this.isvalid(cc)?0:null);
		}
		for(var i=0;i<clist.length;i++){
			var cc = clist[i];
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
			this[newid].clist.push(cc);

			var cid = this.getcid(cc, this.cellinfo[cc]);
			for(var i=0;i<cid.length;i++){
				if(this.id[cid[i]]===0){ stack.push(cid[i]);}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getAreaInfo()  情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getAreaInfo : function(){
		var info = new pzprv3.core.AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(this.id[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(info.id[c]!==0){ continue;}
			info.max++;
			var clist = this[this.id[c]].clist;
			info.room[info.max] = {idlist:clist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0,len=clist.length;i<len;i++){ info.id[clist[i]] = info.max;}
		}
		return info;
	}
});

//--------------------------------------------------------------------------------
// ☆AreaBlackDataクラス  AreaManagerで使用する黒マスオブジェクトのクラス
// ☆AreaWhiteDataクラス  AreaManagerで使用する白マスオブジェクトのクラス
// ☆AreaNumberDataクラス AreaManagerで使用する数字オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaBlackData:AreaData',
{
	isvalid : function(c){ return bd.isBlack(c);}
});

pzprv3.createCommonClass('AreaWhiteData:AreaData',
{
	isvalid : function(c){ return bd.isWhite(c);}
});

pzprv3.createCommonClass('AreaNumberData:AreaData',
{
	isvalid : function(c){ return bd.isNumberObj(c);}
});

//--------------------------------------------------------------------------------
// ★AreaBorderDataクラス AreaManagerで使用するオブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCoreClass('AreaBorderData:AreaData',
{
	initialize : function(owner){
		this.isbd  = [];		// 境界線に線が引いてあるかどうか

		pzprv3.core.AreaData.prototype.initialize.call(this, owner);
	},
	bdfunc : function(id){ return false;},

	//--------------------------------------------------------------------------------
	// info.reset()         ファイル読み込み時などに、保持している情報を再構築する
	// info.reset_bdcount() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset : function(){
		this.reset_bdcount();
		pzprv3.core.AreaData.prototype.reset.call(this);
	},
	reset_bdcount : function(){
		this.isbd = [];
		for(var id=0;id<bd.bdmax;id++){
			this.isbd[id]=false;
			this.setbd(id);
		}
	},

	//--------------------------------------------------------------------------------
	// info.bdfunc() 境界線が存在するかどうかを返す
	// info.setbd()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	bdfunc : function(id){ return false;}, /* 境界線の存在条件 */
	setbd : function(id){
		var isbd = this.bdfunc(id);
		if(this.isbd[id]!==isbd){
			this.isbd[id]=isbd;
			return true;
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// info.getlink() 上下左右に繋がるかの情報を取得する
	//--------------------------------------------------------------------------------
	getlink : function(cc){
		var val = 0;
		if(this.isvalid(cc)){
			if(bd.ub(cc)!==null && !this.isbd[bd.ub(cc)]){ val+=1;}
			if(bd.db(cc)!==null && !this.isbd[bd.db(cc)]){ val+=2;}
			if(bd.lb(cc)!==null && !this.isbd[bd.lb(cc)]){ val+=4;}
			if(bd.rb(cc)!==null && !this.isbd[bd.rb(cc)]){ val+=8;}
		}
		return val;
	},

	//--------------------------------------------------------------------------------
	// info.setBorder()       境界線が引かれたり消されてたりした時に、部屋情報を更新する
	// info.checkExecSearch() 部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	setBorder : function(id){
		if(!this.setbd(id)){ return;}

		var cc1 = bd.border[id].cellcc[0],  cc2 = bd.border[id].cellcc[1];
		this.cellinfo[cc1] = this.getlink(cc1);
		this.cellinfo[cc2] = this.getlink(cc2);
		if(cc1===null || cc2===null || !this.checkExecSearch(id)){ return;}

		this.searchClist(this.popRoom([cc1,cc2]));
	},
	checkExecSearch : function(id){
		var cc1 = bd.border[id].cellcc[0],  cc2 = bd.border[id].cellcc[1];

		if(this.isbd[id]){ /* 部屋を分けるのに、最初から分かれていた */
			if(this.id[cc1]===null || this.id[cc2]===null || this.id[cc1]!==this.id[cc2]){ return false;} // はじめから分かれていた
		}
		else{ /* 部屋を繋げるのに、最初から同じ部屋だった */
			if(this.id[cc1]!==null && this.id[cc1]===this.id[cc2]){ return false;}
		}
		return true;
	}
});

//--------------------------------------------------------------------------------
// ☆AreaRoomDataクラス AreaManagerで使用するオブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaRoomData:AreaBorderData',
{
	initialize : function(owner){
		this.bdcnt = [];		// 格子点の周りの境界線の数

		pzprv3.core.AreaBorderData.prototype.initialize.call(this, owner);
	},
	bdfunc : function(id){ return bd.isBorder(id);},

	hastop : false,

	//--------------------------------------------------------------------------------
	// info.reset() ファイル読み込み時などに、保持している情報を再構築する
	//--------------------------------------------------------------------------------
	reset : function(){
		pzprv3.core.AreaBorderData.prototype.reset.call(this);

		if(this.hastop){ this.resetRoomNumber();}
	},

	//--------------------------------------------------------------------------------
	// info.reset_bdcount() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset_bdcount : function(){
		/* 外枠のカウントをあらかじめ足しておく */
		this.bdcnt = [];
		for(var by=bd.minby;by<=bd.maxby;by+=2){ for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
			var c = (bx>>1)+(by>>1)*(bd.qcols+1);
			var ischassis = (bd.isborder===1 ? (bx===bd.minbx||bx===bd.maxbx||by===bd.minby||by===bd.maxby):false);
			this.bdcnt[c]=(ischassis?2:0);
		}}

		pzprv3.core.AreaBorderData.prototype.reset_bdcount.call(this);
	},

	//--------------------------------------------------------------------------------
	// info.setbd()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	setbd : function(id){
		var isbd = this.bdfunc(id);
		if(this.isbd[id]!==isbd){
			var cc1 = bd.border[id].crosscc[0], cc2 = bd.border[id].crosscc[1];
			if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
			if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
			this.isbd[id]=isbd;
			return true;
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// info.checkExecSearch() 部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	// オーバーライド
	checkExecSearch : function(id){
		if(!pzprv3.core.AreaBorderData.prototype.checkExecSearch.call(this,id)){ return false;}

		// 途切れた線だったとき
		var xc1 = bd.border[id].crosscc[0], xc2 = bd.border[id].crosscc[1];
		if     ( this.isbd[id] && (this.bdcnt[xc1]===1 || this.bdcnt[xc2]===1)){ return false;}
		else if(!this.isbd[id] && (this.bdcnt[xc1]===0 || this.bdcnt[xc2]===0)){ return false;}

		// roomNumberの時 どっちの数字を残すかは、TOP同士の位置で比較する
		var cc1 = bd.border[id].cellcc[0],  cc2 = bd.border[id].cellcc[1];
		if(!this.isbd[id] && this.hastop){this.setTopOfRoom_combine(cc1,cc2);}

		return true;
	},

	//--------------------------------------------------------------------------------
	// info.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	// オーバーライド
	searchSingle : function(c, newid){
		pzprv3.core.AreaBorderData.prototype.searchSingle.call(this, c, newid);

		if(this.hastop){ this.setTopOfRoom(newid);}
	},

	//--------------------------------------------------------------------------------
	// info.setTopOfRoom_combine()  部屋が繋がったとき、部屋のTOPを設定する
	//--------------------------------------------------------------------------------
	setTopOfRoom_combine : function(cc1,cc2){
		var merged, keep;

		var tc1 = this[this.id[cc1]].top, tc2 = this[this.id[cc2]].top;
		var tbx1 = bd.cell[tc1].bx, tbx2 = bd.cell[tc2].bx;
		if(tbx1>tbx2 || (tbx1===tbx2 && tc1>tc2)){ merged = tc1; keep = tc2;}
		else                                     { merged = tc2; keep = tc1;}

		// 消える部屋のほうの数字を消す
		if(bd.QnC(merged)!==-1){
			// 数字が消える部屋にしかない場合 -> 残るほうに移動させる
			if(bd.QnC(keep)===-1){ bd.sQnC(keep, bd.QnC(merged)); pc.paintCell(keep);}
			bd.sQnC(merged,-1); pc.paintCell(merged);
		}
	},

	//--------------------------------------------------------------------------------
	// info.calcTopOfRoom()   部屋のTOPになりそうなセルのIDを返す
	// info.setTopOfRoom()    部屋のTOPを設定する
	// info.resetRoomNumber() 情報の再構築時に部屋のTOPのIDを設定したり、数字を移動する
	//--------------------------------------------------------------------------------
	calcTopOfRoom : function(roomid){
		var cc=null, bx=bd.maxbx, by=bd.maxby;
		var clist = this[roomid].clist;
		for(var i=0;i<clist.length;i++){
			var cell = bd.cell[clist[i]];
			if(cell.bx>bx || (cell.bx===bx && cell.by>=by)){ continue;}
			cc=clist[i];
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
			var val = -1, clist = this[r].clist;
			for(var i=0,len=clist.length;i<len;i++){
				var c = clist[i];
				if(this.id[c]===r && bd.cell[c].qnum!==-1){
					if(val===-1){ val = bd.cell[c].qnum;}
					if(this[r].top!==c){ bd.cell[c].qnum = -1;}
				}
			}
			if(val!==-1 && bd.cell[this[r].top].qnum===-1){
				bd.cell[this[r].top].qnum = val;
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getRoomID()  このオブジェクトで管理しているセルの部屋IDを取得する
	// info.setRoomID()  このオブジェクトで管理しているセルの部屋IDを設定する
	// info.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// info.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// info.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// info.getCntOfRoom()       指定した領域の大きさを抽出する
	//--------------------------------------------------------------------------------
	getRoomID : function(cc){ return this.id[cc];},
//	setRoomID : function(cc,val){ this.id[cc] = val;},

	getTopOfRoomByCell : function(cc){ return this[this.id[cc]].top;},
	getTopOfRoom       : function(id){ return this[id].top;},

	getCntOfRoomByCell : function(cc){ return this[this.id[cc]].clist.length;}
//	getCntOfRoom       : function(id){ return this[id].clist.length;}
});

//--------------------------------------------------------------------------------
// ☆AreaLineDataクラス AreaManagerで使用するオブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCommonClass('AreaLineData:AreaBorderData',
{
	initialize : function(owner){
		this.bdcnt = [];		// セルの周りの線の数

		pzprv3.core.AreaBorderData.prototype.initialize.call(this, owner);
	},
	isvalid : function(c){ return this.bdcnt[c]<4;},
	bdfunc : function(id){ return !bd.isLine(id);},

	//--------------------------------------------------------------------------------
	// info.reset_bdcount() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset_bdcount : function(){
		/* 外枠のカウントをあらかじめ足しておく */
		this.bdcnt = [];
		for(var c=0;c<bd.cellmax;c++){
			var bx=bd.cell[c].bx, by=bd.cell[c].by;
			this.bdcnt[c]=0;
			if(bx===bd.minbx+1||bx===bd.maxbx-1){ this.bdcnt[c]++;}
			if(by===bd.minby+1||by===bd.maxby-1){ this.bdcnt[c]++;}
		}

		pzprv3.core.AreaBorderData.prototype.reset_bdcount.call(this);
	},

	//--------------------------------------------------------------------------------
	// info.setbd()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	setbd : function(id){
		var isbd = this.bdfunc(id);
		if(this.isbd[id]!==isbd){
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
			if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
			this.isbd[id]=isbd;
			return true;
		}
		return false;
	}
});
