// AreaManager.js v3.4.0

//--------------------------------------------------------------------------------
// ★AreaManagerクラス セルの部屋情報などを保持するクラス
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRoomNumber()等が必要です。
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaManager',
{
	initialize : function(){
		this.max;
		this.invalid;	// 使わなくなったIDのリスト
		this.id;		// 各々のセルのid
		this.cellinfo;	// セルの情報を保持しておく
	},
	init : function(){
		if(this.enabled){
			for(var i=0;i<this.relation.length;i++){
				this.owner.board.validinfo[this.relation[i]].push(this);
				this.owner.board.validinfo.all.push(this);
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
		for(var cc=0;cc<this.owner.board.cellmax;cc++){
			this.cellinfo[cc] = this.getlink(this.owner.board.cell[cc]);
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
					this.owner.board.cell[idlist[n]].color = newColor;
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
			if(!!this.owner.flags.irowake){ cell.color = this.owner.painter.getNewLineColor();}
		}
		else{
			areaid = this.id[c2];
			if(!!this.owner.flags.irowake){ cell.color = this.owner.board.cell[c2].color;}
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
		if(!!this.owner.flags.irowake){ cell.color = "";}
	},

	//--------------------------------------------------------------------------------
	// info.remakeInfo()   線が引かれたり消された時、線が分かれるときのidの再設定を行う
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	remakeInfo : function(cell, cid){
		var longColor = (!!this.owner.flags.irowake ? this.getLongColor(cid) : "");

		if(this.id[cell.id]!==null){ cid.push([cell.id]);}
		var idlist = this.popRoom(cid);
		if(this.id[cell.id]===null){ idlist.push(cell.id);}
		var assign = this.searchIdlist(idlist);

		if(!!this.owner.flags.irowake){ this.setLongColor(assign, longColor);}
	},

	getLongColor : function(cid){
		var longColor = this.owner.board.cell[cid[0]].color;
		// 周りで一番大きな線は？
		if(cid.length>1){
			var largeid = this.id[cid[0]];
			for(var i=1;i<cid.length;i++){
				if(this[largeid].idlist.length < this[this.id[cid[i]]].idlist.length){
					largeid = this.id[cid[0]];
					longColor = this.owner.board.cell[cid[i]].color;
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
				var cell = this.owner.board.cell[idlist[i]];
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
					var cell = this.owner.board.cell[idlist[n]];
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
			this.id[cc] = (this.isvalid(this.owner.board.cell[cc])?0:null);
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

			var cid = this.getcellaround(this.owner.board.cell[cc]);
			for(var i=0;i<cid.length;i++){
				if(this.id[cid[i]]===0){ stack.push(cid[i]);}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getAreaInfo()  情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getAreaInfo : function(){
		var bd = this.owner.board, info = this.owner.newInstance('AreaInfo');
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
		for(var i=0;i<idlist.length;i++){ clist.add(this.owner.board.cell[idlist[i]]);}
		return clist;
	}
});

//--------------------------------------------------------------------------------
// ☆AreaBlackManagerクラス  黒マス情報オブジェクトのクラス
// ☆AreaWhiteManagerクラス  白マス情報オブジェクトのクラス
// ☆AreaNumberManagerクラス 数字情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaBlackManager:AreaManager',
{
	isvalid : function(cell){ return cell.isBlack();}
});

pzprv3.createPuzzleClass('AreaWhiteManager:AreaManager',
{
	isvalid : function(cell){ return cell.isWhite();}
});

pzprv3.createPuzzleClass('AreaNumberManager:AreaManager',
{
	isvalid : function(cell){ return cell.isNumberObj();}
});

//--------------------------------------------------------------------------------
// ★AreaBorderManagerクラス セル＋境界線情報が必要な情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaBorderManager:AreaManager',
{
	initialize : function(){
		this.isbd  = [];		// 境界線に線が引いてあるかどうか

		pzprv3.core.AreaManager.prototype.initialize.call(this);
	},
	relation : ['cell', 'border'],

	//--------------------------------------------------------------------------------
	// info.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// info.rebuild() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset : function(){
		this.isbd = [];

		pzprv3.core.AreaManager.prototype.reset.call(this);
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		for(var id=0;id<this.owner.board.bdmax;id++){
			this.isbd[id]=false;
			this.setbd(this.owner.board.border[id]);
		}

		pzprv3.core.AreaManager.prototype.rebuild.call(this);
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

		pzprv3.core.AreaManager.prototype.setCellInfo.call(this, cell);
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
pzprv3.createPuzzleClass('AreaRoomManager:AreaBorderManager',
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
		var bd = this.owner.board;
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
			if(border.id<this.owner.board.bdinside){ return true;}
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
		var bd=this.owner.board, cc=null, bx=bd.maxbx, by=bd.maxby;
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
				var c = idlist[i], cell = this.owner.board.cell[c];
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

	getTopOfRoomByCell : function(cell){ return this.owner.board.cell[this[this.id[cell.id]].top];},
	getTopOfRoom       : function(id)  { return this.owner.board.cell[this[id].top];},

	getCntOfRoomByCell : function(cell){ return this[this.id[cell.id]].idlist.length;}
//	getCntOfRoom       : function(id)  { return this[id].idlist.length;},
});

//--------------------------------------------------------------------------------
// ☆AreaLineManagerクラス 線つながり情報オブジェクトのクラス
//--------------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaLineManager:AreaBorderManager',
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
		var bd = this.owner.board;
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
			if(border.id<this.owner.board.bdinside){ return true;}
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

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : null   どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
pzprv3.createPuzzleClass('AreaInfo',
{
	initialize : function(){
		this.max  = 0;	// 最大の部屋番号(1〜maxまで存在するよう構成してください)
		this.id   = [];	// 各セル/線などが属する部屋番号を保持する
		this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
	},

	addRoom : function(){
		this.max++;
		this.room[this.max] = {idlist:[]};
	},
	getRoomID : function(obj){ return this.id[obj.id];},
	setRoomID : function(obj, areaid){
		this.room[areaid].idlist.push(obj.id);
		this.id[obj.id] = areaid;
	},

	addCell   : function(cell){ this.setRoomID(cell, this.max);},
	emptyCell : function(cell){ return (this.id[cell.id]===0);},

	getclistbycell : function(cell)  { return this.getclist(this.id[cell.id]);},
	getclist : function(areaid){
		var idlist = this.room[areaid].idlist, clist = this.owner.newInstance('CellList');
		for(var i=0;i<idlist.length;i++){ clist.add(this.owner.board.cell[idlist[i]]);}
		return clist;
	},

	//---------------------------------------------------------------------------
	// info.setErrLareaByCell() ひとつながりになった線が存在するマスにエラーを設定する
	// info.setErrLareaById()   ひとつながりになった線が存在するマスにエラーを設定する
	//---------------------------------------------------------------------------
	setErrLareaByCell : function(cell, val){
		this.setErrLareaById(this.id[cell.id], val);
	},
	setErrLareaById : function(areaid, val){
		var self = this;
		this.owner.board.border.filter(function(border){
			var cc1 = border.sidecell[0].id, cc2 = border.sidecell[1].id;
			return (border.isLine() && self.id[cc1]===areaid && self.id[cc2]===areaid);
		}).seterr(val);

		this.owner.board.cell.filter(function(cell){
			return (self.id[cell.id]===areaid && cell.isNum());
		}).seterr(4);
	}
});
