// AreaManager.js v3.4.1

//--------------------------------------------------------------------------------
// ★AreaManagerクラス セルの部屋情報などを保持するクラス
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRoomNumber()等が必要です。
//--------------------------------------------------------------------------------
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
AreaManager:{
	initialize : function(){
		this.id = [];			// 各々のセルのid
		this.area = [];			// つながっている領域の情報を保持する
		this.max = 0;			// 1からいくつまでidが使用されているか保持する
		this.invalidid = [];	// 使わなくなったIDのリスト

		this.linkinfo = [];		// セルの情報を保持しておく
		this.separate = [];		// 境界線に線が引いてあるかどうか
	},
	init : function(){
		if(this.enabled){
			var info = this.owner.board.validinfo;
			for(var i=0;i<this.relation.length;i++){
				info[this.relation[i]].push(this);
				info.all.push(this);
			}
		}
	},
	enabled : false,
	relation : ['cell'],

	//--------------------------------------------------------------------------------
	// info.isvalid() そのセルが有効かどうか返す
	// info.bdfunc()  境界線が存在するかどうかを返す
	//--------------------------------------------------------------------------------
	isvalid : function(cell){
		return (cell.ques!==7);
	},
	bdfunc : function(border){
		return false;
	},

	//--------------------------------------------------------------------------------
	// info.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// info.rebuild() 既存の情報からデータを再設定する
	//--------------------------------------------------------------------------------
	reset : function(){
		// 基本変数初期化
		this.id        = [];
		this.area      = [];
		this.max       = 0;
		this.invalidid = [];

		// 状態のチェックに使用する変数初期化
		this.linkinfo  = [];
		this.separate  = [];

		this.rebuild();
	},
	rebuild : function(){
		if(!this.enabled){ return;}

		var bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){ this.id[c] = 0;}

		for(var id=0;id<bd.bdmax;id++){ /* hasborder=0の時はbdmax=0です */
			this.separate[id] = false;
			this.checkSeparateInfo(bd.border[id]);
		}

		for(var c=0;c<bd.cellmax;c++){
			this.calcLinkInfo(bd.cell[c]);
		}

		this.searchIdlist(bd.cell);
	},

	//--------------------------------------------------------------------------------
	// info.setCell()        黒マス・白マスが入力されたり消された時などに、IDの情報を変更する
	// info.checkLinkInfo()  自分のセルと4方向の接続情報を設定する
	// info.calcLinkInfo()   上下左右にのセルに繋がることが可能かどうかの情報を取得する
	//--------------------------------------------------------------------------------
	setCell : function(cell){
		if(!this.enabled){ return;}

		var change = this.checkLinkInfo(cell);
		if(change[0]!==0){
			var val = this.linkinfo[cell.id];
			var isadd = !!((val&16)&&(change[0]&16)), isremove = !!(!(val&16)&&(change[0]&16));
			var cidlist = this.getRemakeCell(cell, change);
			
			// 新たに黒マス(白マス)くっつける場合 => 自分に領域IDを設定するだけ
			if(isadd && (cidlist.length<=1)){
				this.assignCell(cell, (cidlist.length===1?this.owner.board.cell[cidlist[0]]:null));
			}
			// 端の黒マス(白マス)ではなくなった時 => まわりの数が0か1なら情報or自分を消去するだけ
			else if(isremove && (cidlist.length<=1)){
				this.removeCell(cell);
			}
			else{
				cidlist.push(cell.id);
				this.remakeInfo(cidlist);
			}
		}
	},
	checkLinkInfo : function(cell){
		var old = this.linkinfo[cell.id], val = this.calcLinkInfo(cell);
		var change = [(old^val), 0, 0, 0, 0];
		
		if(this.owner.board.hasborder){
			/* 自分の状態によってseparate状態が変わる場合があるのでチェックします */
			var cblist=cell.getdir4cblist();
			for(var i=0;i<cblist.length;i++){
				var cell2 = cblist[i][0], border2 = cblist[i][1], dir2 = cblist[i][2];
				
				var old2 = this.linkinfo[cell2.id], val2 = this.calcLinkInfo(cell2);
				change[dir2] = (old2^val2);
				
				this.checkSeparateInfo(border2);
			}
		}
		
		return change;
	},
	calcLinkInfo : function(cell){
		if(cell.isnull){ return false;}
		var val = 0, adc = cell.adjacent, adb = cell.adjborder;
		if(adc.top.group   ==="cell" && !adc.top.isnull    && !this.bdfunc(adb.top   )){ val+=1;}
		if(adc.bottom.group==="cell" && !adc.bottom.isnull && !this.bdfunc(adb.bottom)){ val+=2;}
		if(adc.left.group  ==="cell" && !adc.left.isnull   && !this.bdfunc(adb.left  )){ val+=4;}
		if(adc.right.group ==="cell" && !adc.right.isnull  && !this.bdfunc(adb.right )){ val+=8;}
		if(this.isvalid(cell)){ val+=16;}
		return (this.linkinfo[cell.id] = val);
	},

	//--------------------------------------------------------------------------------
	// info.setBorder()     境界線が引かれたり消されてたりした時に、部屋情報を更新する
	// info.checkSeparateInfo() 境界線情報と実際の境界線の差異を調べて設定する
	// info.checkExecSearch()   部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	setBorder : function(border){
		if(!this.enabled){ return;}
		
		if(this.checkSeparateInfo(border)){
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull){ this.calcLinkInfo(cell1);}
			if(!cell2.isnull){ this.calcLinkInfo(cell2);}
			if(cell1.isnull || cell2.isnull || !this.checkExecSearch(border)){ return;}

			this.remakeInfo([cell1.id, cell2.id]);
		}
	},
	checkSeparateInfo : function(border){
		var isbd = this.bdfunc(border);
		if(this.separate[border.id]!==isbd){
			this.separate[border.id]=isbd;
			return true;
		}
		return false;
	},
	checkExecSearch : function(border){
		var cc1 = border.sidecell[0].id,  cc2 = border.sidecell[1].id;

		if(this.separate[border.id]){ /* 部屋を分けるのに、最初から分かれていた */
			if(this.id[cc1]===null || this.id[cc2]===null || this.id[cc1]!==this.id[cc2]){ return false;} // はじめから分かれていた
		}
		else{ /* 部屋を繋げるのに、最初から同じ部屋だった */
			if(this.id[cc1]!==null && this.id[cc1]===this.id[cc2]){ return false;}
		}
		return true;
	},

	//--------------------------------------------------------------------------------
	// info.getRemakeCell() 自分＋接する最大4箇所のセルのうち、自分に繋がることができるものを返す
	// info.getLinkCell()   今自分が繋がっているセルを返す
	//--------------------------------------------------------------------------------
	getRemakeCell : function(cell, change){
		var link = (this.linkinfo[cell.id] | (change[0] || 0));
		var cidlist = [], list = cell.getdir4clist(), pow=[0,1,2,4,8], pow2=[0,2,1,8,4];
		for(var i=0;i<list.length;i++){
			var cell2 = list[i][0], dir = list[i][1];
			var link2 = (this.linkinfo[cell2.id] | (change[dir] || 0));
			if(this.id[cell2.id]!==null && !!(link & pow[dir]) && !!(link2 & pow2[dir])){ cidlist.push(cell2.id);}
		}
		return cidlist;
	},
	getLinkCell : function(cell){
		return this.getRemakeCell(cell, []);
	},

	//--------------------------------------------------------------------------------
	// info.assignCell() 指定されたセルを有効なセルとして設定する
	// info.removeCell() 指定されたセルを無効なセルとして設定する
	// info.remakeInfo() 線が引かれたり消された時、領域分割統合時のidの再設定を行う
	//--------------------------------------------------------------------------------
	assignCell : function(cell, cell2){
		var areaid = this.id[cell.id];
		if(areaid!==null && areaid!==0){ return;}

		if(cell2===null){
			areaid = this.addArea();
			if(this.irowakeEnable()){ cell.color = this.getNewColor();}
		}
		else{
			areaid = this.id[cell2.id];
			if(this.irowakeEnable()){ cell.color = cell2.color;}
		}
		this.area[areaid].clist.add(cell);
		this.id[cell.id] = areaid;
	},
	removeCell : function(cell){
		var areaid = this.id[cell.id];
		if(areaid===null || areaid===0){ return;}

		this.area[areaid].clist.remove(cell);
		this.id[cell.id] = null;
		if(this.area[areaid].clist.length===0){ this.removeArea(areaid);}
		if(this.irowakeEnable()){ cell.color = "";}
	},
	remakeInfo : function(cidlist){
		var longColor = (this.irowakeEnable() ? this.getLongColor(cidlist) : "");

		/* info.popArea() 指定された複数のセルが含まれる部屋を全て無効にしてidlistを返す */
		/* 周りのセルから、周りのセルを含む領域のセル全体に対象を拡大する */
		var clist = new this.owner.CellList();
		for(var i=0;i<cidlist.length;i++){
			var r=this.id[cidlist[i]], bd=this.owner.board;
			if(r!==null && r!==0){ clist.extend(this.removeArea(r));}
			else if(r===null)    { clist.add(bd.cell[cidlist[i]]);}
		}
		var assign = this.searchIdlist(clist);

		if(this.irowakeEnable()){ this.setLongColor(assign, longColor);}
	},

	//--------------------------------------------------------------------------------
	// info.addArea()    新しく割り当てるidを取得する
	// info.removeArea() 部屋idを無効にする
	//--------------------------------------------------------------------------------
	addArea : function(){
		var newid;
		if(this.invalidid.length>0){ newid = this.invalidid.shift();}
		else{ newid = ++this.max;}

		this.area[newid] = {clist:(new this.owner.CellList())};
		return newid;
	},
	removeArea : function(id){
		var clist = this.area[id].clist;
		for(var i=0;i<clist.length;i++){ this.id[clist[i].id] = null;}
		
		this.area[id] = {clist:(new this.owner.CellList())};
		this.invalidid.push(id);
		return clist;
	},

	//--------------------------------------------------------------------------------
	// info.irowakeEnable()  色分けが実行可能なパズルかどうかを返す
	// info.irowakeValid()   色分けを実行するかどうかを返す
	// info.getNewColor()    新しい色を返す
	// info.newIrowake()     線の情報が再構築された際、ブロックに色をつける
	//--------------------------------------------------------------------------------
	irowakeEnable : function(){
		return this.owner.flags.irowakeblk;
	},
	irowakeValid : function(){
		return this.owner.getConfig('irowakeblk');
	},
	getNewColor : function(){
		return "";
	},
	newIrowake : function(){
		for(var i=1;i<=this.max;i++){
			var clist = this.area[i].clist;
			if(clist.length>0){
				var newColor = this.getNewColor();
				for(var n=0;n<clist.length;n++){ clist[n].color = newColor;}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(cidlist){
		// 周りで一番大きな線は？
		var largeid = null, longColor = "";
		for(var i=0;i<cidlist.length;i++){
			var r = this.id[cidlist[i]];
			if(r===null){ continue;}
			if(largeid===null || this.area[largeid].clist.length < this.area[r].clist.length){
				largeid = r;
				longColor = this.owner.board.cell[cidlist[i]].color;
			}
		}
		return (!!longColor ? longColor : this.getNewColor());
	},
	setLongColor : function(assign, longColor){
		/* assign:影響のあったareaidの配列 */
		var clist_all = new this.owner.CellList();
		
		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		// もしassign.length===1の場合、色が同じになる
		
		// できた線の中でもっとも長いものを取得する
		var longid = assign[0];
		for(var i=1;i<assign.length;i++){
			if(this.area[longid].clist.length < this.area[assign[i]].clist.length){ longid = assign[i];}
		}
		
		// 新しい色の設定
		for(var i=0;i<assign.length;i++){
			var newColor = (assign[i]===longid ? longColor : this.getNewColor());
			var clist = this.area[assign[i]].clist;
			for(var n=0,len=clist.length;n<len;n++){ clist[n].color = newColor;}
			clist_all.extend(clist);
		}
		
		if(this.irowakeValid()){ this.owner.painter.repaintBlocks(clist_all);}
	},

	//--------------------------------------------------------------------------------
	// info.searchIdlist() 盤面内のidlistに含まれるセルにIDを付け直す
	// info.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	searchIdlist : function(clist){
		var assign = [];
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			this.id[cell.id] = (this.isvalid(cell)?0:null);
		}
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(this.id[cell.id]!==0){ continue;}
			var newid = this.addArea();
			this.searchSingle(cell, newid);
			assign.push(newid);
		}
		return assign;
	},
	searchSingle : function(cell, newid){
		var stack=[cell], iid=this.id[cell.id];
		while(stack.length>0){
			var cell=stack.pop();
			if(this.id[cell.id]!==iid){ continue;}
			this.id[cell.id] = newid;
			this.area[newid].clist.add(cell);

			var cidlist = this.getLinkCell(cell);
			for(var i=0;i<cidlist.length;i++){
				if(this.id[cidlist[i]]===0){ stack.push(this.owner.board.cell[cidlist[i]]);}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getAreaInfo()  情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getAreaInfo : function(){
		var bd = this.owner.board, info = new this.owner.AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(this.id[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(info.id[cell.id]!==0){ continue;}
			var area = info.addAreaByClist( this.getClistByCell(cell) );
			
			if(!!this.hastop){ area.top = this.getTopOfRoomByCell(cell);}
		}
		return info;
	},

	//--------------------------------------------------------------------------------
	// info.getClistByCell() 指定したセルが含まれる領域のセル配列を取得する
	//--------------------------------------------------------------------------------
	getClistByCell : function(cell){ return this.area[this.id[cell.id]].clist;}
},

//--------------------------------------------------------------------------------
// ☆AreaShadeManagerクラス  黒マス情報オブジェクトのクラス
// ☆AreaUnshadeManagerクラス  白マス情報オブジェクトのクラス
// ☆AreaNumberManagerクラス 数字情報オブジェクトのクラス
//--------------------------------------------------------------------------------
'AreaShadeManager:AreaManager':{
	isvalid : function(cell){ return cell.isShade();}
},

'AreaUnshadeManager:AreaManager':{
	isvalid : function(cell){ return cell.isUnshade();}
},

'AreaNumberManager:AreaManager':{
	isvalid : function(cell){ return cell.isNumberObj();}
},

//--------------------------------------------------------------------------------
// ☆AreaRoomManagerクラス 部屋情報オブジェクトのクラス
//--------------------------------------------------------------------------------
'AreaRoomManager:AreaManager':{
	relation : ['cell', 'border'],
	bdfunc : function(border){ return border.isBorder();},

	hastop : false,

	//--------------------------------------------------------------------------------
	// rooms.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// rooms.rebuild() 部屋情報の再設定を行う
	//--------------------------------------------------------------------------------
	rebuild : function(){
		if(!this.enabled){ return;}

		/* 外枠のカウントをあらかじめ足しておく */
		var bd = this.owner.board;
		for(var c=0;c<bd.crossmax;c++){
			var cross = bd.cross[c], bx = cross.bx, by = cross.by;
			var ischassis = (bd.hasborder===1 ? (bx===bd.minbx||bx===bd.maxbx||by===bd.minby||by===bd.maxby) : false);
			cross.lcnt = (ischassis?2:0);
		}

		this.owner.AreaManager.prototype.rebuild.call(this);

		if(this.enabled && this.hastop){ this.resetRoomNumber();}
	},

	//--------------------------------------------------------------------------------
	// rooms.checkSeparateInfo()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	checkSeparateInfo : function(border){
		var isbd = this.bdfunc(border);
		if(this.separate[border.id]!==isbd){
			var cross1 = border.sidecross[0], cross2 = border.sidecross[1];
			if(!cross1.isnull){ cross1.lcnt += (isbd?1:-1);}
			if(!cross2.isnull){ cross2.lcnt += (isbd?1:-1);}
			this.separate[border.id]=isbd;
			if(border.id<this.owner.board.bdinside){ return true;}
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// rooms.checkExecSearch() 部屋情報が変化したかsearch前にチェックする
	//--------------------------------------------------------------------------------
	// オーバーライド
	checkExecSearch : function(border){
		if(!this.owner.AreaManager.prototype.checkExecSearch.call(this,border)){ return false;}

		// 途切れた線だったとき
		var cross1 = border.sidecross[0], cross2 = border.sidecross[1];
		if     ( this.separate[border.id] && (cross1.lcnt===1 || cross2.lcnt===1)){ return false;}
		else if(!this.separate[border.id] && (cross1.lcnt===0 || cross2.lcnt===0)){ return false;}

		// TOPがある場合 どっちの数字を残すかは、TOP同士の位置で比較する
		var cell1 = border.sidecell[0],  cell2 = border.sidecell[1];
		if(!this.separate[border.id] && this.hastop){this.setTopOfRoom_combine(cell1,cell2);}

		return true;
	},

	//--------------------------------------------------------------------------------
	// rooms.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	// オーバーライド
	searchSingle : function(cell, newid){
		this.owner.AreaManager.prototype.searchSingle.call(this, cell, newid);

		if(this.hastop){
			this.area[newid].top = this.area[newid].clist.getTopCell();
		}
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
				keep.setQnum(merged.qnum);
				keep.draw();
			}
			merged.setQnum(-1);
			merged.draw();
		}
	},

	//--------------------------------------------------------------------------------
	// rooms.resetRoomNumber() 情報の再構築時に部屋のTOPのIDを設定したり、数字を移動する
	//--------------------------------------------------------------------------------
	resetRoomNumber : function(){
		for(var r=1;r<=this.max;r++){
			var val = -1, clist = this.area[r].clist, top = this.getTopOfRoom(r);
			for(var i=0,len=clist.length;i<len;i++){
				var cell = clist[i];
				if(this.id[cell.id]===r && cell.qnum!==-1){
					if(val===-1){ val = cell.qnum;}
					if(top!==cell){ cell.qnum = -1;}
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

	getTopOfRoomByCell : function(cell){ return this.area[this.id[cell.id]].top;},
	getTopOfRoom       : function(id)  { return this.area[id].top;},

	getCntOfRoomByCell : function(cell){ return this.area[this.id[cell.id]].clist.length;}
//	getCntOfRoom       : function(id)  { return this.area[id].clist.length;},
},

//--------------------------------------------------------------------------------
// ☆AreaLineManagerクラス 線つながり情報オブジェクトのクラス
//--------------------------------------------------------------------------------
'AreaLineManager:AreaManager':{
	initialize : function(){
		this.bdcnt = [];		// セルの周りの領域を分断する境界線の数

		this.owner.AreaManager.prototype.initialize.call(this);
	},
	relation : ['cell', 'line'],
	isvalid : function(cell){ return (this.bdcnt[cell.id]<4 || (this.moveline && cell.isNum()));},
	bdfunc : function(border){ return !border.isLine();},

	moveline : false,

	//--------------------------------------------------------------------------------
	// linfo.reset()   ファイル読み込み時などに、保持している情報を再構築する
	// linfo.rebuild() 境界線情報の再設定を行う
	//--------------------------------------------------------------------------------
	reset : function(){
		this.bdcnt = [];

		this.owner.AreaManager.prototype.reset.call(this);
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

		this.owner.AreaManager.prototype.rebuild.call(this);

		if(this.moveline){ this.resetMovedBase();}
	},

	//--------------------------------------------------------------------------------
	// linfo.checkSeparateInfo()  境界線情報と実際の境界線の差異を調べて設定する
	//--------------------------------------------------------------------------------
	checkSeparateInfo : function(border){
		var isbd = this.bdfunc(border);
		if(this.separate[border.id]!==isbd){
			var cc1 = border.sidecell[0].id, cc2 = border.sidecell[1].id;
			if(cc1!==null){ this.bdcnt[cc1]+=(isbd?1:-1);}
			if(cc2!==null){ this.bdcnt[cc2]+=(isbd?1:-1);}
			this.separate[border.id]=isbd;
			if(border.id<this.owner.board.bdinside){ return true;}
		}
		return false;
	},

	//--------------------------------------------------------------------------------
	// linfo.setCell()        黒マス・白マスが入力されたり消された時などに、IDの情報を変更する
	//--------------------------------------------------------------------------------
	setCell : function(cell){
		this.owner.AreaManager.prototype.setCell.call(this, cell);

		var newid = this.id[cell.id];
		if(this.moveline && newid!==null){ this.setMovedBase(newid);}
	},

	//--------------------------------------------------------------------------------
	// linfo.setLine()  線が引かれたり消されてたりした時に、部屋情報を更新する
	//--------------------------------------------------------------------------------
	setLine : function(border){
		this.setBorder(border);
	},

	//--------------------------------------------------------------------------------
	// linfo.assignCell() 指定されたセルを有効なセルとして設定する
	// linfo.removeCell() 指定されたセルを無効なセルとして設定する
	//--------------------------------------------------------------------------------
	// オーバーライド
	assignCell : function(cell, cell2){
		this.owner.AreaManager.prototype.assignCell.call(this, cell, cell2);

		/* AreaLineManagerではCell入力で他とくっつくことはないので、cell2===nullとして考える */
		if(this.moveline){ this.setMovedBase(this.id[cell.id]);}
	},
	removeCell : function(cell){
		this.owner.AreaManager.prototype.removeCell.call(this, cell);

		if(this.moveline){ this.initMovedBase([cell]);}
	},

	//--------------------------------------------------------------------------------
	// linfo.searchIdlist() 盤面内のidlistに含まれるセルにIDを付け直す
	// linfo.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	// オーバーライド
	searchIdlist : function(clist){
		/* searchSingleにはIDがついた領域しかこないので、先にbaseを初期値にする */
		if(this.moveline){ this.initMovedBase(clist);}

		this.owner.AreaManager.prototype.searchIdlist.call(this, clist);
	},
	searchSingle : function(cell, newid){
		this.owner.AreaManager.prototype.searchSingle.call(this, cell, newid);

		if(this.moveline){ this.setMovedBase(newid);}
	},

	//--------------------------------------------------------------------------------
	// linfo.resetMovedBase()  情報の再構築時に移動情報を初期化する
	// linfo.initMovedBase()   指定されたセルの移動情報を初期化する
	// linfo.setMovedBase()    指定された領域の移動情報を設定する
	//--------------------------------------------------------------------------------
	resetMovedBase : function(){
		this.initMovedBase(this.owner.board.cell);
		for(var r=1;r<=this.max;r++){ this.setMovedBase(r);}
	},
	initMovedBase : function(clist){
		for(var i=0;i<clist.length;i++){
			clist[i].base = ((this.id[clist[i].id]!==null && clist[i].isNum()) ? clist[i] : this.owner.board.emptycell);
		}
	},
	setMovedBase : function(areaid){
		var area = this.area[areaid], emptycell = this.owner.board.emptycell;
		area.departure = area.destination = emptycell;
		area.movevalid = false;
		
		var clist = area.clist;
		if(clist.length<1){ return;}
		
		var before=null, after=null, point=0;
		if(clist.length===1){
			before = after = clist[0];
			point = 2;
		}
		else{
			for(var i=0;i<clist.length;i++){
				var cell=clist[i];
				cell.base = emptycell;
				if(cell.lcnt===1){
					point++;
					if(cell.isNum()){ before=cell;}else{ after=cell;}
				}
			}
		}
		if(before!==null && after!==null && point===2){
			area.departure   = after.base = before;
			area.destination = after;
			area.movevalid = true;
		}
	},

	//--------------------------------------------------------------------------------
	// linfo.eraseLineByCell()  移動系パズルの丸が消えたとき等、領域に含まれる線を消去する
	//--------------------------------------------------------------------------------
	eraseLineByCell : function(cell){
		if(this.id[cell.id]===null){ return;}
		var clist = this.getClistByCell(cell), count = 0;
		for(var i=0,len=clist.length;i<len;i++){ for(var j=i+1;j<len;j++){
			var border = this.owner.mouse.getnb(clist[i].getaddr(), clist[j].getaddr());
			if(!border.isnull){ border.removeLine(); count++;}
		}}
		if(count>0){ clist.draw();}
	}
},

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : null   どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
AreaInfo:{
	initialize : function(){
		this.max  = 0;	// 最大の部屋番号(1〜maxまで存在するよう構成してください)
		this.id   = [];	// 各セル/線などが属する部屋番号を保持する
		this.area = [];	// 各部屋のidlist等の情報を保持する(info.area[id].clistで取得)
	},
	getRoomID : function(obj){ return this.id[obj.id];},
	getRoomByCell : function(cell){ return this.area[this.id[cell.id]];},

	//---------------------------------------------------------------------------
	// info.addArea()         空の領域を追加する
	// info.addAreaByClist()  指定されたclistを持つ領域を追加する
	//---------------------------------------------------------------------------
	addArea : function(){
		var areaid = ++this.max;
		return (this.area[areaid] = {clist:(new this.owner.CellList()), id:areaid});
	},
	addAreaByClist : function(clist){
		var areaid = ++this.max;
		var area = this.area[areaid] = {clist:(new this.owner.CellList()), id:areaid};

		for(var i=0;i<clist.length;i++){
			this.id[clist[i].id] = areaid;
		}
		area.clist.extend(clist);
		return area;
	},

	//---------------------------------------------------------------------------
	// info.getSideAreaInfo()  接しているが異なる領域部屋の情報を取得する
	//---------------------------------------------------------------------------
	getSideAreaInfo : function(){
		var adjs=[], sides=[], max=this.max, bd=this.owner.board;
		for(var r=1;r<=max-1;r++){ adjs[r]=[];}

		for(var id=0;id<bd.bdmax;id++){
			var cell1 = bd.border[id].sidecell[0], cell2 = bd.border[id].sidecell[1];
			if(cell1.isnull || cell2.isnull){ continue;}
			var r1=this.getRoomID(cell1), r2=this.getRoomID(cell2);
			if(r1===null || r2===null){ continue;}

			if(r1<r2){ adjs[r1][r2]=true;}
			if(r1>r2){ adjs[r2][r1]=true;}
		}

		for(var r=1;r<=max-1;r++){
			sides[r]=[];
			for(var s=r+1;s<=max;s++){
				if(!!adjs[r][s]){ sides[r].push(s);}
			}
		}
		return sides;
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
}
});
