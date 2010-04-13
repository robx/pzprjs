// pzprUtil.js v3.3.0

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : -1     どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
AreaInfo = function(){
	this.max  = 0;	// 最大の部屋番号(1～maxまで存在するよう構成してください)
	this.id   = [];	// 各セル/線などが属する部屋番号を保持する
	this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
};

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
LineManager = function(){
	this.lcnt    = [];
	this.ltotal  = [];

	this.disableLine = (!k.isCenterLine && !k.isborderAsLine);
	this.data    = {};	// 線id情報

	this.typeA = 'A';
	this.typeB = 'B';
	this.typeC = 'C';

	this.init();
};
LineManager.prototype = {

	//---------------------------------------------------------------------------
	// line.init()        変数の起動時の初期化を行う
	// line.resetLcnts()  lcnts等の変数の初期化を行う
	// line.newIrowake()  線の情報が再構築された際、線に色をつける
	// line.lcntCell()    セルに存在する線の本数を返す
	//---------------------------------------------------------------------------
	init : function(){
		if(this.disableLine){ return;}

		// lcnt, ltotal変数(配列)初期化
		if(k.isCenterLine){
			for(var c=0;c<bd.cellmax;c++){ this.lcnt[c]=0;}
			this.ltotal=[(k.qcols*k.qrows), 0, 0, 0, 0];
		}
		else{
			for(var c=0,len=(k.qcols+1)*(k.qrows+1);c<len;c++){ this.lcnt[c]=0;}
			this.ltotal=[((k.qcols+1)*(k.qrows+1)), 0, 0, 0, 0];
		}

		// その他の変数初期化
		this.data = {max:0,id:[]};
		for(var id=0;id<bd.bdmax;id++){ this.data.id[id] = -1;}
	},

	resetLcnts : function(){
		if(this.disableLine){ return;}

		this.init();
		var bid = [];
		for(var id=0;id<bd.bdmax;id++){
			if(bd.isLine(id)){
				this.data.id[id] = 0;
				bid.push(id);

				var cc1, cc2;
				if(k.isCenterLine){ cc1 = bd.border[id].cellcc[0];  cc2 = bd.border[id].cellcc[1]; }
				else              { cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}

				if(cc1!=-1){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
				if(cc2!=-1){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
			}
			else{
				this.data.id[id] = -1;
			}
		}
		this.lc0main(bid);
		if(k.irowake!==0){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.data.max;i++){
			var idlist = this.data[i].idlist;
			if(idlist.length>0){
				var newColor = pc.getNewLineColor();
				for(n=0;n<idlist.length;n++){
					bd.border[idlist[n]].color = newColor;
				}
			}
		}
	},
	lcntCell  : function(cc){ return (cc!=-1?this.lcnt[cc]:0);},

	//---------------------------------------------------------------------------
	// line.gettype()    線が引かれた/消された時に、typeA/typeB/typeCのいずれか判定する
	// line.isTpos()     pieceが、指定されたcc内でidの反対側にあるか判定する
	// line.iscrossing() 指定されたセル/交点で線が交差する場合にtrueを返す
	//---------------------------------------------------------------------------
	gettype : function(cc,id,val){
		var erase = (val>0?0:1);
		if(cc===-1){
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
		if(k.isCenterLine){
			return !bd.isLine(bd.bnum( 2*bd.cell[cc].bx-bd.border[id].bx, 2*bd.cell[cc].by-bd.border[id].by ));
		}
		else{
			return !bd.isLine(bd.bnum( 4*(cc%(k.qcols+1))-bd.border[id].bx, 4*mf(cc/(k.qcols+1))-bd.border[id].by ));
		}
	},
	iscrossing : function(cc){ return !!k.isLineCross;},

	//---------------------------------------------------------------------------
	// line.setLine()         線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	// line.setLineInfo()     線が引かれた時に、線の情報を生成しなおす
	// line.removeLineInfo()  線が消された時に、線の情報を生成しなおす
	// line.combineLineInfo() 線が引かれた時に、周りの線が全てくっついて1つの線が
	//                        できる場合の線idの再設定を行う
	// line.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                        可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	setLine : function(id, val){
		if(this.disableLine){ return;}
		val = (val>0?1:0);

		var cc1, cc2;
		if(k.isCenterLine){ cc1 = bd.border[id].cellcc[0];  cc2 = bd.border[id].cellcc[1]; }
		else              { cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}

		if(val>0){
			if(cc1!=-1){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!=-1){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
		}
		else{
			if(cc1!=-1){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]--; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!=-1){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]--; this.ltotal[this.lcnt[cc2]]++;}
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
		var type1 = this.gettype(cc1,id,val), type2 = this.gettype(cc2,id,val);
		if(val>0){
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
				this.data.id[id] = -1;
				bd.border[id].color = "";
			}
			// (A)+(B)の場合 -> 既存の線から取り除く
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var ownid = this.data.id[id], idlist = this.data[ownid].idlist;
				for(var i=0;i<idlist.length;i++){ if(idlist[i]===id){ idlist.splice(i,1); break;} }
				this.data.id[id] = -1;
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
		var did = [dataid[bid[0]], -1];
		for(var i=0;i<bid.length;i++){
			if(did[0]!=dataid[bid[i]]){
				did[1]=dataid[bid[i]];
				break;
			}
		}

		var newColor = bd.border[bid[0]].color;
		// くっつく線のID数が2種類の場合
		if(did[1] != -1){
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
			this.repaintLine(longidlist, id);
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
		else     { dataid[id] = -1;}

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
			this.repaintLine(idlist, id);
		}
	},

	//---------------------------------------------------------------------------
	// line.repaintLine()  ひとつながりの線を再描画する
	// line.repaintParts() repaintLine()関数で、さらに上から描画しなおしたい処理を書く
	//                     canvas描画時のみ呼ばれます(他は描画しなおす必要なし)
	// line.getClistFromIdlist() idlistの線が重なるセルのリストを取得する
	// line.getXlistFromIdlist() idlistの線が重なる交点のリストを取得する
	//---------------------------------------------------------------------------
	repaintLine : function(idlist, id){
		if(!pp.getVal('irowake')){ return;}
		var draw1 = (k.isCenterLine ? pc.drawLine1 : pc.drawBorder1);
		for(var i=0,len=idlist.length;i<len;i++){
			if(id===idlist[i]){ continue;}
			draw1.call(pc, idlist[i]);
		}
		if(g.use.canvas){ this.repaintParts(idlist);}
	},
	repaintParts : function(idlist){ }, // オーバーライド用

	getClistFromIdlist : function(idlist){
		var cdata=[], clist=[];
		for(var c=0;c<bd.cellmax;c++){ cdata[c]=false;}
		for(var i=0;i<idlist.length;i++){
			cdata[bd.border[idlist[i]].cellcc[0]] = true;
			cdata[bd.border[idlist[i]].cellcc[1]] = true;
		}
		for(var c=0;c<bd.cellmax;c++){ if(cdata[c]){ clist.push(c);} }
		return clist;
	},
	getXlistFromIdlist : function(idlist){
		var cdata=[], xlist=[], crossmax=(k.qcols+1)*(k.qrows+1);
		for(var c=0;c<crossmax;c++){ cdata[c]=false;}
		for(var i=0;i<idlist.length;i++){
			cdata[bd.border[idlist[i]].crosscc[0]] = true;
			cdata[bd.border[idlist[i]].crosscc[1]] = true;
		}
		for(var c=0;c<crossmax;c++){ if(cdata[c]){ xlist.push(c);} }
		return xlist;
	},

	//---------------------------------------------------------------------------
	// line.getbid()  指定したpieceに繋がる、最大6箇所に引かれている線を全て取得する
	// line.lc0main() 指定されたpieceのリストに対して、lc0関数を呼び出す
	// line.lc0()     ひとつながりの線にlineidを設定する(再帰呼び出し用関数)
	//---------------------------------------------------------------------------
	getbid : function(id,val){
		var erase=(val>0?0:1), bx=bd.border[id].bx, by=bd.border[id].by;
		var dx=((k.isCenterLine^(bx%2===0))?2:0), dy=(2-dx);	// (dx,dy) = (2,0) or (0,2)

		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		if(!k.isCenterLine){ cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}
		// 交差ありでk.isborderAsLine==1(->k.isCenterLine==0)のパズルは作ってないはず
		// 今までのオモパで該当するのもスリザーボックスくらいだったような、、

		var lines=[];
		if(cc1!==-1){
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
		if(cc2!==-1){
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
			if(!k.isCenterLine^(bx&1)){ this.lc0(bx,by+1,1,this.data.max); this.lc0(bx,by,2,this.data.max);}
			else                      { this.lc0(bx+1,by,3,this.data.max); this.lc0(bx,by,4,this.data.max);}
		}
	},
	lc0 : function(bx,by,dir,newid){
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if((bx+by)%2===0){
				var cc = (k.isCenterLine?bd.cnum:bd.xnum).call(bd,bx,by);
				if(cc===-1){ break;}
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
	// line.getLineInfo()    線情報をAreaInfo型のオブジェクトで返す
	// line.getLareaInfo()   同じ線がまたがるセルの情報をAreaInfo型のオブジェクトで返す
	//                       (これだけは旧型の生成方法でやってます)
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		var info = new AreaInfo();
		for(var id=0;id<bd.bdmax;id++){ info.id[id]=(bd.isLine(id)?0:-1);}
		for(var id=0;id<bd.bdmax;id++){
			if(info.id[id]!=0){ continue;}
			info.max++;
			info.room[info.max] = {idlist:this.data[this.data.id[id]].idlist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0;i<info.room[info.max].idlist.length;i++){
				info.id[info.room[info.max].idlist[i]] = info.max;
			}
		}
		return info;
	},
	getLareaInfo : function(){
		var linfo = new AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ linfo.id[c]=(this.lcnt[c]>0?0:-1);}
		for(var c=0;c<bd.cellmax;c++){
			if(linfo.id[c]!=0){ continue;}
			linfo.max++;
			linfo.room[linfo.max] = {idlist:[]};
			this.sr0(linfo, c, linfo.max);
		}
		return linfo;
	},
	sr0 : function(linfo, i, areaid){
		linfo.id[i] = areaid;
		linfo.room[areaid].idlist.push(i);
		if( bd.isLine(bd.ub(i)) && linfo.id[bd.up(i)]===0 ){ this.sr0(linfo, bd.up(i), areaid);}
		if( bd.isLine(bd.db(i)) && linfo.id[bd.dn(i)]===0 ){ this.sr0(linfo, bd.dn(i), areaid);}
		if( bd.isLine(bd.lb(i)) && linfo.id[bd.lt(i)]===0 ){ this.sr0(linfo, bd.lt(i), areaid);}
		if( bd.isLine(bd.rb(i)) && linfo.id[bd.rt(i)]===0 ){ this.sr0(linfo, bd.rt(i), areaid);}
	}
};

//--------------------------------------------------------------------------------
// ★AreaManagerクラス 部屋のTOP-Cellの位置等の情報を扱う
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRarea()等が必要です。
//--------------------------------------------------------------------------------
// 部屋のTOPに数字を入力する時の、ハンドリング等
AreaManager = function(){
	this.lcnt  = [];	// 交点id -> 交点から出る線の本数

	this.room  = {};	// 部屋情報を保持する
	this.bcell = {};	// 黒マス情報を保持する
	this.wcell = {};	// 白マス情報を保持する

	this.disroom = (!k.isborder || !!k.area.disroom);	// 部屋情報を生成しない
	this.bblock = (!!k.area.bcell || !!k.area.number);	// 黒マス(or 繋がる数字・記号)の情報を生成する
	this.wblock = !!k.area.wcell;						// 白マスの情報を生成する
	this.numberColony = !!k.area.number;				// 数字・記号を黒マス情報とみなして情報を生成する

	this.init();
};
AreaManager.prototype = {
	//--------------------------------------------------------------------------------
	// area.init()       起動時に変数を初期化する
	// area.resetArea()  部屋、黒マス、白マスの情報をresetする
	//--------------------------------------------------------------------------------
	init : function(){
		this.initRarea();
		this.initBarea();
		this.initWarea();
	},
	resetArea : function(){
		if(k.isborder && !k.isborderAsLine){ this.resetRarea();}
		if(this.bblock){ this.resetBarea();}
		if(this.wblock){ this.resetWarea();}
	},

	//--------------------------------------------------------------------------------
	// area.initRarea()  部屋関連の変数を初期化する
	// area.resetRarea() 部屋の情報をresetして、1から割り当てしなおす
	// 
	// area.lcntCross()  指定された位置のCrossの上下左右のうち境界線が引かれている(ques==1 or qans==1の)数を求める
	// area.getRoomID()          このオブジェクトで管理しているセルの部屋IDを取得する
	// area.setRoomID()          このオブジェクトで管理しているセルの部屋IDを設定する
	// area.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// area.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// area.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// area.getCntOfRoom()       指定した領域の大きさを抽出する
	//--------------------------------------------------------------------------------
	initRarea : function(){
		// 部屋情報初期化
		this.room = {max:1,id:[],1:{top:0,clist:[]}};
		for(var c=0;c<bd.cellmax;c++){ this.room.id[c] = 1; this.room[1].clist[c] = c;}

		// lcnt変数初期化
		this.lcnt = [];
		for(var c=0;c<(k.qcols+1)*(k.qrows+1);c++){ this.lcnt[c]=0;}

		if(k.isoutsideborder===0){
			for(var by=bd.minby;by<=bd.maxby;by+=2){
				for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
					if(bx===bd.minbx || bx===bd.maxbx || by===bd.minby || by===bd.maxby){
						var c = (bx>>1)+(by>>1)*(k.qcols+1);
						this.lcnt[c]=2;
					}
				}
			}
		}

		if(this.disroom){ return;}
		for(var id=0;id<bd.bdmax;id++){
			if(bd.isBorder(id)){
				var cc1 = bd.border[id].crosscc[0], cc2 = bd.border[id].crosscc[1];
				if(cc1!==-1){ this.lcnt[cc1]++;}
				if(cc2!==-1){ this.lcnt[cc2]++;}
			}
		}
	},
	resetRarea : function(){
		if(this.disroom){ return;}

		this.initRarea();
		this.room.max = 0;
		for(var cc=0;cc<bd.cellmax;cc++){ this.room.id[cc]=0;}
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.room.id[cc]!=0){ continue;}
			this.room.max++;
			this.room[this.room.max] = {top:-1,clist:[]};
			this.sr0(cc,this.room,bd.isBorder);
		}

		// 部屋ごとに、TOPの場所に数字があるかどうか判断して移動する
		if(k.isOneNumber){
			for(var r=1;r<=this.room.max;r++){
				this.setTopOfRoom(r);

				var val = -1, clist = this.room[r].clist;
				for(var i=0,len=clist.length;i<len;i++){
					var c = clist[i];
					if(this.room.id[c]===r && bd.cell[c].qnum!==-1){
						if(val===-1){ val = bd.cell[c].qnum;}
						if(this.getTopOfRoom(r)!==c){ bd.sQnC(c, -1);}
					}
				}
				if(val!==-1 && bd.QnC(this.getTopOfRoom(r))===-1){ bd.sQnC(this.getTopOfRoom(r), val);}
			}
		}
	},

	lcntCross : function(id){ return this.lcnt[id];},

	getRoomID : function(cc){ return this.room.id[cc];},
//	setRoomID : function(cc,val){ this.room.id[cc] = val;},

	getTopOfRoomByCell : function(cc){ return this.room[this.room.id[cc]].top;},
	getTopOfRoom       : function(id){ return this.room[id].top;},

	getCntOfRoomByCell : function(cc){ return this.room[this.room.id[cc]].clist.length;},
//	getCntOfRoom       : function(id){ return this.room[id].clist.length;},

	//--------------------------------------------------------------------------------
	// area.setBorder()    境界線が引かれたり消されてたりした時に、変数lcntの内容を変更する
	// area.setTopOfRoom() セルのリストから部屋のTOPを設定する
	// area.sr0()          setBorder()から呼ばれて、初期idを含む一つの部屋の領域を、指定されたareaidにする
	//---------------------------------------------------------------------------
	setBorder : function(id,val){
		if(this.disroom){ return;}
		val = (val>0?1:0);

		var cc1, cc2, xc1 = bd.border[id].crosscc[0], xc2 = bd.border[id].crosscc[1];
		var room = this.room, roomid = room.id;
		if(val>0){
			this.lcnt[xc1]++; this.lcnt[xc2]++;

			if(this.lcnt[xc1]===1 || this.lcnt[xc2]===1){ return;}
			cc1 = bd.border[id].cellcc[0]; cc2 = bd.border[id].cellcc[1];
			if(cc1===-1 || cc2===-1 || roomid[cc1]!==roomid[cc2]){ return;}

			var baseid = roomid[cc1];

			// まず下or右側のセルから繋がるセルのroomidを変更する
			room.max++;
			room[room.max] = {top:-1,clist:[]}
			this.sr0(cc2,room,bd.isBorder);

			// 部屋が分割されていなかったら、元に戻して終了
			if(roomid[cc1] === room.max){
				for(var i=0,len=room[room.max].clist.length;i<len;i++){
					roomid[room[room.max].clist[i]] = baseid;
				}
				room.max--;
				return;
			}

			// roomの情報を更新する
			var clist = room[baseid].clist.concat();
			room[baseid].clist = [];
			room[room.max].clist = [];
			for(var i=0,len=clist.length;i<len;i++){
				room[roomid[clist[i]]].clist.push(clist[i]);
			}

			// TOPの情報を設定する
			if(k.isOneNumber){
				if(roomid[room[baseid].top]===baseid){
					this.setTopOfRoom(room.max);
				}
				else{
					room[room.max].top = room[baseid].top;
					this.setTopOfRoom(baseid);
				}
			}
		}
		else{
			this.lcnt[xc1]--; this.lcnt[xc2]--;

			if(this.lcnt[xc1]===0 || this.lcnt[xc2]===0){ return;}
			cc1 = bd.border[id].cellcc[0]; cc2 = bd.border[id].cellcc[1];
			if(cc1===-1 || cc2===-1 || roomid[cc1]===roomid[cc2]){ return;}

			// k.isOneNumberの時 どっちの数字を残すかは、TOP同士の位置で比較する
			if(k.isOneNumber){
				var merged, keep;

				var tc1 = room[roomid[cc1]].top, tc2 = room[roomid[cc2]].top;
				var tbx1 = bd.cell[tc1].bx, tbx2 = bd.cell[tc2].bx;
				if(tbx1>tbx2 || (tbx1===tbx2 && tc1>tc2)){ merged = tc1; keep = tc2;}
				else                                     { merged = tc2; keep = tc1;}

				// 消える部屋のほうの数字を消す
				if(bd.QnC(merged)!==-1){
					// 数字が消える部屋にしかない場合 -> 残るほうに移動させる
					if(bd.QnC(keep)===-1){ bd.sQnC(keep, bd.QnC(merged)); pc.paintCell(keep);}
					bd.sQnC(merged,-1); pc.paintCell(merged);
				}
			}

			// room, roomidを更新
			var r1 = roomid[cc1], r2 = roomid[cc2], clist = room[r2].clist;
			for(var i=0;i<clist.length;i++){
				roomid[clist[i]] = r1;
				room[r1].clist.push(clist[i]);
			}
			room[r2] = {top:-1,clist:[]};
		}
	},
	setTopOfRoom : function(roomid){
		var cc=-1, bx=bd.maxbx, by=bd.maxby;
		var clist = this.room[roomid].clist;
		for(var i=0;i<clist.length;i++){
			var tc = bd.cell[clist[i]];
			if(tc.bx>bx || (tc.bx===bx && tc.by>=by)){ continue;}
			cc=clist[i];
			bx=tc.bx;
			by=tc.by;
		}
		this.room[roomid].top = cc;
	},
	sr0 : function(c,data,func){
		data.id[c] = data.max;
		data[data.max].clist.push(c);
		var tc;
		tc=bd.up(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.ub(c)) ){ this.sr0(tc,data,func);}
		tc=bd.dn(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.db(c)) ){ this.sr0(tc,data,func);}
		tc=bd.lt(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.lb(c)) ){ this.sr0(tc,data,func);}
		tc=bd.rt(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.rb(c)) ){ this.sr0(tc,data,func);}
	},

	//--------------------------------------------------------------------------------
	// area.initBarea()  黒マス関連の変数を初期化する
	// area.resetBarea() 黒マスの情報をresetして、1から割り当てしなおす
	// area.initWarea()  白マス関連の変数を初期化する
	// area.resetWarea() 白マスの情報をresetして、1から割り当てしなおす
	//--------------------------------------------------------------------------------
	initBarea : function(){
		this.bcell = {max:0,id:[]};
		for(var c=0;c<bd.cellmax;c++){
			this.bcell.id[c] = -1;
		}
	},
	resetBarea : function(){
		this.initBarea();
		if(!this.numberColony){ for(var cc=0;cc<bd.cellmax;cc++){ this.bcell.id[cc]=(bd.isBlack(cc)?0:-1);} }
		else                  { for(var cc=0;cc<bd.cellmax;cc++){ this.bcell.id[cc]=(bd.isNum(cc)  ?0:-1);} }
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.bcell.id[cc]!=0){ continue;}
			this.bcell.max++;
			this.bcell[this.bcell.max] = {clist:[]};
			this.sc0(cc,this.bcell);
		}
	},

	initWarea : function(){
		this.wcell = {max:1,id:[],1:{clist:[]}};
		for(var c=0;c<bd.cellmax;c++){
			this.wcell.id[c] = 1;
			this.wcell[1].clist[c]=c;
		}
	},
	resetWarea : function(){
		this.initWarea();
		this.wcell.max = 0;
		for(var cc=0;cc<bd.cellmax;cc++){ this.wcell.id[cc]=(bd.isWhite(cc)?0:-1); }
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.wcell.id[cc]!=0){ continue;}
			this.wcell.max++;
			this.wcell[this.wcell.max] = {clist:[]};
			this.sc0(cc,this.wcell);
		}
	},

	//--------------------------------------------------------------------------------
	// area.setCell()    黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	// area.setBWCell()  setCellから呼ばれる関数
	// area.sc0()        初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	setCell : function(cc,val){
		if(val>0){
			if(this.bblock){ this.setBWCell(cc,1,this.bcell);}
			if(this.wblock){ this.setBWCell(cc,0,this.wcell);}
		}
		else{
			if(this.bblock){ this.setBWCell(cc,0,this.bcell);}
			if(this.wblock){ this.setBWCell(cc,1,this.wcell);}
		}
	},
	setBWCell : function(cc,val,data){
		var cid = [], dataid = data.id, tc;
		tc=bd.up(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}
		tc=bd.dn(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}
		tc=bd.lt(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}
		tc=bd.rt(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}

		// 新たに黒マス(白マス)になった時
		if(val>0){
			// まわりに黒マス(白マス)がない時は新しいIDで登録です
			if(cid.length===0){
				data.max++;
				data[data.max] = {clist:[cc]};
				dataid[cc] = data.max;
			}
			// 1方向にあるときは、そこにくっつけばよい
			else if(cid.length===1){
				data[dataid[cid[0]]].clist.push(cc);
				dataid[cc] = dataid[cid[0]];
			}
			// 2方向以上の時
			else{
				// 周りで一番大きな黒マスは？
				var largeid = dataid[cid[0]];
				for(var i=1;i<cid.length;i++){
					if(data[largeid].clist.length < data[dataid[cid[i]]].clist.length){ largeid=dataid[cid[i]];}
				}
				// つながった黒マス(白マス)は全て同じIDにする
				for(var i=0;i<cid.length;i++){
					if(dataid[cid[i]]===largeid){ continue;}
					var clist = data[dataid[cid[i]]].clist;
					for(var n=0,len=clist.length;n<len;n++){
						dataid[clist[n]] = largeid;
						data[largeid].clist.push(clist[n]);
					}
					clist = [];
				}
				// 自分をくっつける
				dataid[cc] = largeid;
				data[largeid].clist.push(cc);
			}
		}
		// 黒マス(白マス)ではなくなった時
		else{
			// まわりに黒マス(白マス)がない時は情報を消去するだけ
			if(cid.length===0){
				data[dataid[cc]].clist = [];
				dataid[cc] = -1;
			}
			// まわり1方向の時も自分を消去するだけでよい
			else if(cid.length===1){
				var ownid = dataid[cc], clist = data[ownid].clist;
				for(var i=0;i<clist.length;i++){ if(clist[i]===cc){ clist.splice(i,1); break;} }
				dataid[cc] = -1;
			}
			// 2方向以上の時は考慮が必要
			else{
				// 一度自分の領域の黒マス(白マス)情報を無効にする
				var ownid = dataid[cc], clist = data[ownid].clist;
				for(var i=0;i<clist.length;i++){ dataid[clist[i]] = 0;}
				data[ownid].clist = [];

				// 自分を黒マス(白マス)情報から消去
				dataid[cc] = -1;

				// まわりのIDが0なセルに黒マス(白マス)IDをセットしていく
				for(var i=0;i<cid.length;i++){
					if(dataid[cid[i]]!==0){ continue;}
					data.max++;
					data[data.max] = {clist:[]};
					this.sc0(cid[i],data);
				}
			}
		}
	},
	sc0 : function(c,data){
		data.id[c] = data.max;
		data[data.max].clist.push(c);
		var tc;
		tc=bd.up(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.dn(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.lt(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.rt(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
	},

	//--------------------------------------------------------------------------------
	// area.getRoomInfo()  部屋情報をAreaInfo型のオブジェクトで返す
	// area.getBCellInfo() 黒マス情報をAreaInfo型のオブジェクトで返す
	// area.getWCellInfo() 白マス情報をAreaInfo型のオブジェクトで返す
	// area.getNumberInfo() 数字情報(=黒マス情報)をAreaInfo型のオブジェクトで返す
	// area.getAreaInfo()  上記関数の共通処理
	//--------------------------------------------------------------------------------
	getRoomInfo  : function(){ return this.getAreaInfo(this.room);},
	getBCellInfo : function(){ return this.getAreaInfo(this.bcell);},
	getWCellInfo : function(){ return this.getAreaInfo(this.wcell);},
	getNumberInfo : function(){ return this.getAreaInfo(this.bcell);},
	getAreaInfo : function(block){
		var info = new AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(block.id[c]>0?0:-1);}
		for(var c=0;c<bd.cellmax;c++){
			if(info.id[c]!=0){ continue;}
			info.max++;
			var clist = block[block.id[c]].clist;
			info.room[info.max] = {idlist:clist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0,len=clist.length;i<len;i++){ info.id[clist[i]] = info.max;}
		}
		return info;
	}
};
