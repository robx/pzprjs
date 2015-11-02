// AreaManager.js

pzpr.classmgr.makeCommon({
//--------------------------------------------------------------------------------
// ★AreaGraphBaseクラス セルの部屋情報などを保持するクラス
//   ※このクラスで管理しているroomsは左上からの順番に並ばないので
//     回答チェックやURL出力前には一旦resetRoomNumber()等が必要です。
//--------------------------------------------------------------------------------
"AreaGraphBase:GraphBase":{
	relation : ['cell'],
	pointgroup : 'cell',
	
	//--------------------------------------------------------------------------------
	// areagraph.isedgeexists()        linkobjにedgeが存在するか判定する
	// areagraph.isseparate()          接続してはいけないかどうか判定する
	//--------------------------------------------------------------------------------
	isedgeexists : function(linkobj){ return true;},
	isseparate : function(nodeobj1, nodeobj2){ return false;},

	//---------------------------------------------------------------------------
	// areagraph.getSideObjByNodeObj()   cellから接続するNodeにあるobjを取得する
	//---------------------------------------------------------------------------
	getSideObjByNodeObj : function(cell){
		var list = cell.getdir4clist(), cells = [];
		for(var i=0;i<list.length;i++){
			var cell2 = list[i][0];
			if(this.isnodevalid(cell2)){ cells.push(cell2);}
		}
		return cells;
	},

	//---------------------------------------------------------------------------
	// areagraph.setCell()     黒マスになったりした時にブロックの情報を生成しなおす
	//---------------------------------------------------------------------------
	setCell : function(cell){
		if(!this.enabled){ return;}
		this.setEdgeByNodeObj(cell);
	},

	//---------------------------------------------------------------------------
	// areagraph.setEdgeByNodeObj() 黒マスになったりした時にブロックの情報を生成しなおす
	// areagraph.putEdgeByNodeObj() 黒マスになったりした時にブロックの情報を生成しなおす
	// areagraph.calcNodeCount()    そのセルにあるべきNode数を返す
	// areagraph.removeEdgeByNodeObj() 黒マスになったりした時にブロックの情報を消去する
	// areagraph.addEdgeByNodeObj()    黒マスになったりした時にブロックの情報を生成する
	//---------------------------------------------------------------------------
	setEdgeByNodeObj : function(nodeobj){
		this.modifyNodes = [];

		this.putEdgeByNodeObj(nodeobj);

		this.remakeComponent();
	},
	putEdgeByNodeObj : function(cell){
		if(this.calcNodeCount(cell)===0 && this.getObjNodeList(cell).length===0){ return;}
		
		// 一度Edgeを取り外す
		this.removeEdgeByNodeObj(cell);
			
		// Edgeを付け直す
		this.addEdgeByNodeObj(cell);
	},

	calcNodeCount : function(cell){
		return (this.isnodevalid(cell)?1:0);
	},
	removeEdgeByNodeObj : function(cell){
		// Edgeの除去
		var sidenodeobj = this.getSideObjByNodeObj(cell);
		var node1 = this.getObjNodeList(cell)[0];
		for(var i=0;i<sidenodeobj.length;i++){
			var node2 = this.getObjNodeList(sidenodeobj[i])[0];
			if(!!node1 && !!node2){ this.removeEdge(node1, node2);}
		}

		// Nodeを一旦取り除く
		if(!!node1){ this.deleteNode(node1);}
	},
	addEdgeByNodeObj : function(cell){
		// Nodeを付加する
		for(var i=0,len=this.calcNodeCount(cell);i<len;i++){ this.createNode(cell);}
		
		// Edgeの付加
		var sidenodeobj = this.getSideObjByNodeObj(cell);
		var node1 = this.getObjNodeList(cell)[0];
		for(var i=0;i<sidenodeobj.length;i++){
			if(this.isseparate(cell, sidenodeobj[i])){ continue;}
			var node2 = this.getObjNodeList(sidenodeobj[i])[0];
			if(!!node1 && !!node2){ this.addEdge(node1, node2);}
		}
	},

	//--------------------------------------------------------------------------------
	// areagraph.setExtraData()   指定された領域の拡張データを設定する
	//--------------------------------------------------------------------------------
	setExtraData : function(component){
		component.clist = new this.klass.CellList(component.getnodeobjs());
	},

	//---------------------------------------------------------------------------
	// areagraph.getSideAreaInfo()  接しているが異なる領域部屋の情報を取得する
	//---------------------------------------------------------------------------
	getSideAreaInfo : function(cellinfo){
		var sides=[], len=this.components.length, adjs={}, bd=this.board;
		for(var r=0;r<this.components.length;r++){ this.components[r].id = r;}
		for(var id=0;id<bd.bdmax;id++){
			var cell1 = bd.border[id].sidecell[0], cell2 = bd.border[id].sidecell[1];
			if(cell1.isnull || cell2.isnull){ continue;}
			var room1=cell1[cellinfo], room2=cell2[cellinfo];
			if(room1===room2 || room1===null || room2===null){ continue;}

			var key = (room1.id<room2.id ? room1.id*len+room2.id : room2.id*len+room1.id);
			if(!!adjs[key]){ continue;}
			adjs[key] = true;

			sides.push([room1,room2]);
		}
		return sides;
	}
},

//--------------------------------------------------------------------------------
// ☆AreaShadeGraphクラス  黒マス情報オブジェクトのクラス
// ☆AreaUnshadeGraphクラス  白マス情報オブジェクトのクラス
// ☆AreaNumberGraphクラス 数字情報オブジェクトのクラス
//--------------------------------------------------------------------------------
'AreaShadeGraph:AreaGraphBase':{
	setComponentRefs : function(obj, component){ obj.sblk = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.sblknodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.sblknodes = [];},
	
	isnodevalid : function(cell){ return cell.isShade();}
},

'AreaUnshadeGraph:AreaGraphBase':{
	setComponentRefs : function(obj, component){ obj.ublk = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.ublknodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.ublknodes = [];},
	
	isnodevalid : function(cell){ return cell.isUnshade();}
},

'AreaNumberGraph:AreaGraphBase':{
	setComponentRefs : function(obj, component){ obj.nblk = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.nblknodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.nblknodes = [];},
	
	isnodevalid : function(cell){ return cell.isNumberObj();}
},

//--------------------------------------------------------------------------------
// ☆AreaRoomGraphクラス 部屋情報オブジェクトのクラス
//--------------------------------------------------------------------------------
'AreaRoomGraph:AreaGraphBase':{
	relation : ['cell', 'border'],
	pointgroup : 'cell',

	hastop : false,
	countLcnt : true,

	setComponentRefs : function(obj, component){ obj.room = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.roomnodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.roomnodes = [];},
	
	isnodevalid : function(cell){ return (cell.ques!==7);},
	isedgeexists : function(border){
		var sidenodes = this.getSideNodesBySeparator(border);
		if(!sidenodes[0] || !sidenodes[1]){ return false;}
		return sidenodes[0].nodes.indexOf(sidenodes[1])>=0;
	},
	isedgevalid : function(border){ return !border.isBorder();},
	isseparate : function(cell1, cell2){
		return this.board.getb(((cell1.bx+cell2.bx)>>1), ((cell1.by+cell2.by)>>1)).isBorder();
	},

	//--------------------------------------------------------------------------------
	// roomgraph.rebuild2() 部屋情報の再設定を行う
	//--------------------------------------------------------------------------------
	rebuild2 : function(){
		var bd = this.board;
		if(this.countLcnt){
			this.ltotal=[];
			/* 外枠のカウントをあらかじめ足しておく */
			for(var c=0;c<bd.crossmax;c++){
				var cross = bd.cross[c], bx = cross.bx, by = cross.by;
				var ischassis = (bd.hasborder===1 ? (bx===bd.minbx||bx===bd.maxbx||by===bd.minby||by===bd.maxby) : false);
				cross.lcnt = (ischassis?2:0);
				this.ltotal[cross.lcnt] = (this.ltotal[cross.lcnt] || 0) + 1;
			}
		}

		this.klass.AreaGraphBase.prototype.rebuild2.call(this);

		var borders = bd.border;
		for(var id=0;id<borders.length;id++){
			if(!this.isedgevalid(borders[id])){
				var sidenodes = this.getSideNodesBySeparator(borders[id]);
				if(!!sidenodes[0] && !!sidenodes[1]){
					this.removeEdge(sidenodes[0], sidenodes[1]);
				}
				if(this.countLcnt){
					this.incdecLineCount(borders[id].sidecross[0], true);
					this.incdecLineCount(borders[id].sidecross[1], true);
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// roomgraph.incdecLineCount() 線が引かれたり消された時に、lcnt変数を生成し直す
	//---------------------------------------------------------------------------
	incdecLineCount : function(cross, isset){
		if(!cross.isnull){
			this.ltotal[cross.lcnt]--;
			if(isset){ cross.lcnt++;}else{ cross.lcnt--;}
			this.ltotal[cross.lcnt] = (this.ltotal[cross.lcnt] || 0) + 1;
		}
	},

	//---------------------------------------------------------------------------
	// roomgraph.getSideObjByNodeObj()   cellから接続するNodeにあるobjを取得する
	//---------------------------------------------------------------------------
	getSideObjByNodeObj : function(cell){
		var list = cell.getdir4clist(), cells = [];
		for(var i=0;i<list.length;i++){
			var cell2 = list[i][0];
			if(this.isnodevalid(cell2)){ cells.push(cell2);}
		}
		return cells;
	},

	//---------------------------------------------------------------------------
	// roomgraph.getSideNodesBySeparator() borderからEdgeに接続するNodeを取得する
	//---------------------------------------------------------------------------
	getSideNodesBySeparator : function(border){
		var sidenodes = [], sidenodeobj = border.sideobj;
		for(var i=0;i<sidenodeobj.length;i++){
			var nodes = this.getObjNodeList(sidenodeobj[i]);
			sidenodes.push(!!nodes ? nodes[0] : null);
		}
		return sidenodes;
	},

	//--------------------------------------------------------------------------------
	// roomgraph.setBorder() 部屋情報の再設定を行う
	//--------------------------------------------------------------------------------
	setBorder : function(border){
		if(!this.enabled){ return;}
		this.setEdgeBySeparator(border);
	},

	//---------------------------------------------------------------------------
	// roomgraph.setEdgeBySeparator() 境界線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setEdgeBySeparator : function(border){
		var isvalid = this.isedgevalid(border);
		if(isvalid===this.isedgeexists(border)){ return;}

		this.modifyNodes = [];

		var sidenodes = this.getSideNodesBySeparator(border);
		if(!!sidenodes[0] && !!sidenodes[1]){
			if(isvalid){ 
				this.addEdge(sidenodes[0], sidenodes[1]);
				if(this.hastop){ this.setTopOfRoom_combine(sidenodes[0].obj,sidenodes[1].obj);}
			}
			else{ this.removeEdge(sidenodes[0], sidenodes[1]);}
		}
		if(this.countLcnt){
			this.incdecLineCount(border.sidecross[0], !isvalid);
			this.incdecLineCount(border.sidecross[1], !isvalid);
		}

		this.remakeComponent();
	},

	//--------------------------------------------------------------------------------
	// roommgr.setTopOfRoom_combine()  部屋が繋がったとき、部屋のTOPを設定する
	//--------------------------------------------------------------------------------
	setTopOfRoom_combine : function(cell1,cell2){
		var merged, keep;
		var tcell1 = cell1.room.top;
		var tcell2 = cell2.room.top;
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
	// roommgr.setExtraData()   指定された領域の拡張データを設定する
	//--------------------------------------------------------------------------------
	setExtraData : function(component){
		component.clist = new this.klass.CellList(component.getnodeobjs());
		if(this.hastop){
			component.top = component.clist.getTopCell();
			
			if(this.rebuildmode){
				var val = -1, clist = component.clist, top = component.top;
				for(var i=0,len=clist.length;i<len;i++){
					var cell = clist[i];
					if(cell.room===component && cell.qnum!==-1){
						if(val===-1){ val = cell.qnum;}
						if(top!==cell){ cell.qnum = -1;}
					}
				}
				if(val!==-1 && top.qnum===-1){
					top.qnum = val;
				}
			}
		}
	}
}
});
