// BoardExt.js v3.4.0

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
pzprv3.createCommonClass('LineManager',
{
	initialize : function(pid){
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
		this.lc0main(bid);
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
		this.lc0main(bid);

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
	// bd.lines.getbid()  指定したpieceに繋がる、最大6箇所に引かれている線を全て取得する
	// bd.lines.lc0main() 指定されたpieceのリストに対して、lc0関数を呼び出す
	// bd.lines.lc0()     ひとつながりの線にlineidを設定する(再帰呼び出し用関数)
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

	lc0main : function(bid){
		for(var i=0,len=bid.length;i<len;i++){
			if(this.data.id[bid[i]]!=0){ continue;}	// 既にidがついていたらスルー
			var bx=bd.border[bid[i]].bx, by=bd.border[bid[i]].by;
			this.data.max++;
			this.data[this.data.max] = {idlist:[]};
			if(!this.isCenterLine^(bx&1)){ this.lc0(bx,by+1,1,this.data.max); this.lc0(bx,by,2,this.data.max);}
			else                         { this.lc0(bx+1,by,3,this.data.max); this.lc0(bx,by,4,this.data.max);}
		}
	},
	lc0 : function(bx,by,dir,newid){
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if((bx+by)%2===0){
				var cc = (this.isCenterLine?bd.cnum:bd.xnum).call(bd,bx,by);
				if(cc===null){ break;}
				else if(this.lcnt[cc]>=3){
					if(!this.iscrossing(cc)){
						if(bd.isLine(bd.bnum(bx,by-1))){ this.lc0(bx,by,1,newid);}
						if(bd.isLine(bd.bnum(bx,by+1))){ this.lc0(bx,by,2,newid);}
						if(bd.isLine(bd.bnum(bx-1,by))){ this.lc0(bx,by,3,newid);}
						if(bd.isLine(bd.bnum(bx+1,by))){ this.lc0(bx,by,4,newid);}
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
				if(this.data.id[id]!=0){ break;}
				this.data.id[id] = newid;
				this.data[newid].idlist.push(id);
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
// ★AreaDataクラス AreaManagerで使用するオブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createCoreClass('AreaData',
{
	initialize : function(parent, enabled, isvalid_func, isborder_func){
		this.parent  = parent;

		this.max     = 0;
		this.invalid = []; /* 使わなくなったIDのリスト */

		this.id    = [];		// 各々のセルのid
		this.isbd  = [];		// 境界線に線が引いてあるかどうか
		this.bdcnt = [];		// セルの周りの境界線の数

		this.enabled  = enabled;
		this.isvalid  = isvalid_func;
		this.isborder = !!isborder_func;

		if(this.isborder){ this.bdfunc = isborder_func;}
	},

	bdfunc      : function(id){ return false;}, /* 境界線の存在条件 */
	reset_count : function(){ return;},

	setbd : function(id){
		var isbd = this.bdfunc(id);
		if(this.isbd[id]!==isbd){
			this.isbd[id]=isbd;
			return true;
		}
		return false;
	},

	reset : function(){
		if(this.enabled){
			this.reset_count();
			if(!!this.isborder){ for(var id=0;id<bd.bdmax;id++){ this.isbd[id]=false; this.setbd(id);}}
			for(var c=0;c<bd.cellmax;c++){ this.id[c] = (this.isvalid(c)?0:null);}
			this.parent.searchAll(this);
		}
	},

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
	}
});

//--------------------------------------------------------------------------------
// ★AreaManagerクラス 部屋のTOP-Cellの位置等の情報を扱う
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRarea()等が必要です。
//--------------------------------------------------------------------------------
// 部屋のTOPに数字を入力する時の、ハンドリング等
pzprv3.createCommonClass('AreaManager',
{
	initialize : function(pid){
		this.rinfo = {};	// 部屋情報を保持する
		this.linfo = {};	// 線つながり情報を保持する

		this.bcell = {};	// 黒マス情報を保持する
		this.wcell = {};	// 白マス情報を保持する
		this.ncell = {};	// 数字情報を保持する

		this.disrec = 0;
	},

	hasroom        : false,	// いくつかの領域に分かれている/分けるパズル
	roomNumber     : false,	// 問題の数字が部屋の左上に1つだけ入るパズル
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
		var self = this;
		this.rinfo = new pzprv3.core.AreaData(self, this.hasroom,    function(c){ return bd.cell[c].ques!==7;}, function(id){ return bd.isBorder(id);});
		this.linfo = new pzprv3.core.AreaData(self, this.lineToArea, function(c){ return this.bdcnt[c]<4;},     function(id){ return !bd.isLine(id);});

		this.bcell = new pzprv3.core.AreaData(self, this.checkBlackCell, function(c){ return bd.isBlack(c);});
		this.wcell = new pzprv3.core.AreaData(self, this.checkWhiteCell, function(c){ return bd.isWhite(c);});
		this.ncell = new pzprv3.core.AreaData(self, this.linkNumber,     function(c){ return bd.isNumberObj(c);});

		this.rinfo.reset_count = function(){
			this.bdcnt = []; /* "交点の周り"のカウント */
			for(var by=bd.minby;by<=bd.maxby;by+=2){ for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
				var c = (bx>>1)+(by>>1)*(bd.qcols+1);
				var ischassis = (bd.isborder===1 ? (bx===bd.minbx||bx===bd.maxbx||by===bd.minby||by===bd.maxby):false);
				this.bdcnt[c]=(ischassis?2:0);
			}}
		};
		this.linfo.reset_count = function(){
			this.bdcnt = []; /* "セルの周り"のカウント */
			for(var c=0;c<bd.cellmax;c++){
				var bx=bd.cell[c].bx, by=bd.cell[c].by;
				this.bdcnt[c]=0;
				if(bx===bd.minbx+1||bx===bd.maxbx-1){ this.bdcnt[c]++;}
				if(by===bd.minby+1||by===bd.maxby-1){ this.bdcnt[c]++;}
			}
		};

		this.rinfo.setbd = function(id){
			var isbd = this.bdfunc(id);
			if(this.isbd[id]!==isbd){
				var cc1 = bd.border[id].crosscc[0], cc2 = bd.border[id].crosscc[1];
				if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
				if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
				this.isbd[id]=isbd;
				return true;
			}
			return false;
		};
		this.linfo.setbd = function(id){
			var isbd = this.bdfunc(id);
			if(this.isbd[id]!==isbd){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
				if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
				this.isbd[id]=isbd;
				return true;
			}
			return false;
		};
	},

	resetArea : function(){
		this.rinfo.reset();
		this.linfo.reset();

		this.bcell.reset();
		this.wcell.reset();
		this.ncell.reset();

		if(this.roomNumber){ this.moveRoomNumber();}
	},

	//--------------------------------------------------------------------------------
	// bd.areas.moveRoomNumber() 部屋ごとに、TOPの場所に数字があるかどうか判断して移動する
	//--------------------------------------------------------------------------------
	moveRoomNumber : function(){
		for(var r=1;r<=this.rinfo.max;r++){
			this.setTopOfRoom(r);

			var val = -1, clist = this.rinfo[r].clist;
			for(var i=0,len=clist.length;i<len;i++){
				var c = clist[i];
				if(this.rinfo.id[c]===r && bd.cell[c].qnum!==-1){
					if(val===-1){ val = bd.cell[c].qnum;}
					if(this.rinfo[r].top!==c){ bd.sQnC(c, -1);}
				}
			}
			if(val!==-1 && bd.QnC(this.rinfo[r].top)===-1){ bd.sQnC(this.rinfo[r].top, val);}
		}
	},

	//--------------------------------------------------------------------------------
	// bd.areas.lcntCross()  指定された位置のCrossの上下左右のうち境界線が引かれている(ques==1 or qans==1の)数を求める
	// 
	// bd.areas.getRoomID()  このオブジェクトで管理しているセルの部屋IDを取得する
	// bd.areas.setRoomID()  このオブジェクトで管理しているセルの部屋IDを設定する
	// bd.areas.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// bd.areas.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// bd.areas.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// bd.areas.getCntOfRoom()       指定した領域の大きさを抽出する
	// 
	// bd.areas.getQnumCellOfClist()  部屋の中で一番左上にある数字を返す
	//--------------------------------------------------------------------------------
	lcntCross : function(id){ return this.rinfo.bdcnt[id];},

	getRoomID : function(cc){ return this.rinfo.id[cc];},
//	setRoomID : function(cc,val){ this.rinfo.id[cc] = val;},

	getTopOfRoomByCell : function(cc){ return this.rinfo[this.rinfo.id[cc]].top;},
	getTopOfRoom       : function(id){ return this.rinfo[id].top;},

	getCntOfRoomByCell : function(cc){ return this.rinfo[this.rinfo.id[cc]].clist.length;},
//	getCntOfRoom       : function(id){ return this.rinfo[id].clist.length;},

	getQnumCellOfClist : function(clist){
		for(var i=0,len=clist.length;i<len;i++){
			if(bd.QnC(clist[i])!==-1){ return clist[i];}
		}
		return null;
	},

	//--------------------------------------------------------------------------------
	// bd.areas.setBorder()    境界線が引かれたり消されてたりした時に、部屋情報を更新する
	//--------------------------------------------------------------------------------
	setBorder : function(id){
		if(this.rinfo.enabled){ this.setRLBorder(id,this.rinfo,true);}
		if(this.linfo.enabled){ this.setRLBorder(id,this.linfo,false);}
	},
	setRLBorder : function(id,data,isroom){
		if(!this.isenableRecord()){ return;}
		if(!data.setbd(id)){ return;}

		var xc1 = bd.border[id].crosscc[0], xc2 = bd.border[id].crosscc[1];
		var cc1 = bd.border[id].cellcc[0],  cc2 = bd.border[id].cellcc[1];
		if(data.isbd[id]){ /* 部屋を分けるとき */
			if(isroom && (data.bdcnt[xc1]===1 || data.bdcnt[xc2]===1)){ return;} // 途切れた線だったとき
			if(cc1===null || cc2===null){ return;}
			if(data.id[cc1]===null || data.id[cc2]===null || data.id[cc1]!==data.id[cc2]){ return;} // はじめから分かれていた

			var clist=this.popRoom(data, [cc1]), oldmax=data.max;
		}
		else{ /* 部屋を繋げるとき */
			if(isroom && (data.bdcnt[xc1]===0 || data.bdcnt[xc2]===0)){ return;} // 途切れた線だったとき
			if(cc1===null || cc2===null){ return;}
			if(data.id[cc1]!==null && data.id[cc1]===data.id[cc2]){ return;} // はじめから同じ部屋だった

			// roomNumberの時 どっちの数字を残すかは、TOP同士の位置で比較する
			if(isroom && this.roomNumber){ this.setTopOfRoom_combine(data,cc1,cc2);}

			var clist=this.popRoom(data, [cc1,cc2]), oldmax=data.max;
		}

		this.searchClist(data, clist);

		// TOPの情報を設定する
		if(isroom && this.roomNumber){
			for(var r=oldmax+1;r<=data.max;r++){ this.setTopOfRoom(r);}
		}
	},

	//--------------------------------------------------------------------------------
	// bd.areas.setTopOfRoom_combine()  部屋が繋がったとき、部屋のTOPを設定する
	// bd.areas.setTopOfRoom()          セルのリストから部屋のTOPを設定する
	//---------------------------------------------------------------------------
	setTopOfRoom_combine : function(data,cc1,cc2){
		var merged, keep;

		var tc1 = data[data.id[cc1]].top, tc2 = data[data.id[cc2]].top;
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

	setTopOfRoom : function(roomid){
		var cc=null, bx=bd.maxbx, by=bd.maxby;
		var clist = this.rinfo[roomid].clist;
		for(var i=0;i<clist.length;i++){
			var cell = bd.cell[clist[i]];
			if(cell.bx>bx || (cell.bx===bx && cell.by>=by)){ continue;}
			cc=clist[i];
			bx=cell.bx;
			by=cell.by;
		}
		this.rinfo[roomid].top = cc;
	},

	//--------------------------------------------------------------------------------
	// bd.areas.setCell()    黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	// bd.areas.setBWCell()  setCellから呼ばれる関数
	//--------------------------------------------------------------------------------
	setCell : function(cc){
		if(this.bcell.enabled){ this.setBWCell(cc,this.bcell);}
		if(this.wcell.enabled){ this.setBWCell(cc,this.wcell);}
		if(this.ncell.enabled){ this.setBWCell(cc,this.ncell);}

		if(this.rinfo.enabled){ this.setBWCell(cc,this.rinfo);}
		if(this.linfo.enabled){ this.setBWCell(cc,this.linfo);}
	},
	setBWCell : function(cc,data){
		if(!this.isenableRecord()){ return;}
		var isvalid=data.isvalid(cc);
		if(isvalid===(data.id[cc]!==null)){ return;}

		var cid = [], cblist = bd.getdir4cblist(cc);
		for(var i=0;i<cblist.length;i++){
			var tc=cblist[i][0], tid=cblist[i][1];
			if(tc!==null && data.id[tc]!==null){ cid.push(tc);}
			if(data.isborder && tid!==null){ data.setbd(tid);}
		}

		if(isvalid){ this.setBWCell_set(data,cc,cid);}   // 新たに黒マス(白マス)になった時
		else       { this.setBWCell_clear(data,cc,cid);} // 黒マス(白マス)ではなくなった時
	},
	setBWCell_set : function(data,cc,cid){
		// まわりに黒マス(白マス)がない時は新しいIDで登録です
		if(cid.length===0){
			var newid = data.getnewid();
			data[newid].clist = [cc];
			data.id[cc] = newid;
		}
		// 1方向にあるときは、そこにくっつけばよい
		else if(cid.length===1){
			data[data.id[cid[0]]].clist.push(cc);
			data.id[cc] = data.id[cid[0]];
		}
		// 2方向以上の時
		else{
			var clist=this.popRoom(data, cid), oldmax=data.max;
			clist.push(cc);
			this.searchClist(data, clist);
		}
	},
	setBWCell_clear : function(data,cc,cid){
		// まわりに黒マス(白マス)がない時は情報を消去するだけ
		if(cid.length===0){
			data.invalidid(data.id[cc]);
			data.id[cc] = null;
		}
		// まわり1方向の時も自分を消去するだけでよい
		else if(cid.length===1){
			var ownid = data.id[cc], clist = data[ownid].clist;
			for(var i=0;i<clist.length;i++){ if(clist[i]===cc){ clist.splice(i,1); break;} }
			data.id[cc] = null;
		}
		// 2方向以上の時
		else{
			var clist=this.popRoom(data, cid), oldmax=data.max;
			this.searchClist(data, clist);
		}
	},

	//--------------------------------------------------------------------------------
	// bd.areas.popRoom() 指定された複数のセルが含まれる部屋を全て無効にしてclistを返す
	//--------------------------------------------------------------------------------
	popRoom : function(data,ccs,isdisp){
		var clist = [];
		for(var n=0;n<ccs.length;n++){
			var r = data.id[ccs[n]];
			if(r!==null && r!==0){
				var clist2 = data.invalidid(r);
				for(var i=0,len=clist2.length;i<len;i++){ clist.push(clist2[i]); data.id[clist2[i]]=0;}
			}
			else if(r===null){ clist.push(ccs[n]);}
		}
		return clist;
	},

	//--------------------------------------------------------------------------------
	// bd.areas.searchAll()    盤面内の指定された条件でAreaInfoを取得する
	// bd.areas.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	// bd.areas.searchEXT()    外部からsearchAll()関数を呼び出す
	//--------------------------------------------------------------------------------
	searchAll : function(data){
		var clist = [];
		data.max = 0;
		for(var cc=0;cc<bd.cellmax;cc++){ data.id[cc]=0; clist.push(cc);}
		this.searchClist(data,clist);
	},
	searchClist : function(data,clist,isdisp){
		for(var i=0;i<clist.length;i++){
			var cc = clist[i];
			data.id[cc] = (data.isvalid(cc)?0:null);
		}
		for(var i=0;i<clist.length;i++){
			var cc = clist[i];
			if(data.id[cc]!==0){ continue;}
			this.searchSingle(cc, data, data.getnewid());
		}
	},
	searchSingle : function(c, data, newid){
		var stack=[c], iid=data.id[c];
		while(stack.length>0){
			var cc=stack.pop();
			if(data.id[cc]!==iid){ continue;}
			data.id[cc] = newid;
			data[newid].clist.push(cc);

			var cblist = bd.getdir4cblist(cc);
			for(var i=0;i<cblist.length;i++){
				var tc=cblist[i][0], tid=cblist[i][1];
				if(tc!==null && data.id[tc]===iid && (!data.isborder || !data.isbd[tid])){ stack.push(tc);}
			}
		}
	},
	searchEXT : function(isset_func, isborder_func){
		var data = new pzprv3.core.AreaData(this,true,isset_func,isborder_func);
		data.reset();

		var info = new pzprv3.core.AreaInfo();
		info.max = data.max;
		for(var c=0;c<bd.cellmax;c++){ info.id[c] = data.id[c];}
		for(var r=1;r<=info.max;r++){ info.room[r] = {idlist:data[r].clist};}
		return info;
	},

	//--------------------------------------------------------------------------------
	// bd.areas.getRoomInfo()  部屋情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getLareaInfo() 線つながり情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getBCellInfo() 黒マス情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getWCellInfo() 白マス情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getNumberInfo() 数字情報をAreaInfo型のオブジェクトで返す
	// bd.areas.getAreaInfo()  上記関数の共通処理
	//--------------------------------------------------------------------------------
	getRoomInfo  : function(){ return this.getAreaInfo(this.rinfo);},
	getLareaInfo : function(){ return this.getAreaInfo(this.linfo);},
	getBCellInfo : function(){ return this.getAreaInfo(this.bcell);},
	getWCellInfo : function(){ return this.getAreaInfo(this.wcell);},
	getNumberInfo : function(){ return this.getAreaInfo(this.ncell);},
	getAreaInfo : function(block){
		var info = new pzprv3.core.AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(block.id[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(info.id[c]!==0){ continue;}
			info.max++;
			var clist = block[block.id[c]].clist;
			info.room[info.max] = {idlist:clist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0,len=clist.length;i<len;i++){ info.id[clist[i]] = info.max;}
		}
		return info;
	}
});
