// LineManager.js

//---------------------------------------------------------------------------
// ★LineGraphクラス 主に線や色分けの情報を管理する
//---------------------------------------------------------------------------
pzpr.classmgr.makeCommon({
"LineGraph:GraphBase":{
	initialize : function(){
		if(this.moveline){ this.relation['cell.qnum'] = 'move';}
	},

	enabled : false,
	relation : {'border.line':'link'},

	pointgroup : 'cell',
	linkgroup  : 'border',

	isLineCross : false,	// 線が交差するパズル

	makeClist : false,		// 線が存在するclistを生成する
	moveline  : false,		// 丸数字などを動かすパズル

	coloring : true,

	//--------------------------------------------------------------------------------
	// linegraph.setComponentRefs()    objにcomponentの設定を行う (性能対策)
	// linegraph.isedgeexistsbylinkobj() linkobjにedgeが存在するか判定する
	//
	// linegraph.getObjNodeList()      objにあるnodeを取得する
	// linegraph.resetObjNodeList()    objからnodeをクリアする
	//--------------------------------------------------------------------------------
	setComponentRefs : function(obj, component){ obj.path = component;},
	isedgeexistsbylinkobj : function(linkobj){ return linkobj.path!==null;},

	getObjNodeList   : function(nodeobj){ return nodeobj.pathnodes;},
	resetObjNodeList : function(nodeobj){
		nodeobj.pathnodes = [];
		if(this.moveline){ this.resetExtraData(nodeobj);}
	},

	//--------------------------------------------------------------------------------
	// linegraph.isnodevalid()           そのセルにNodeが存在すべきかどうか返す
	// linegraph.isedgevalidbylinkobj()  そのborderにEdgeが存在すべきかどうか返す
	// linegraph.iscrossing()            そのセルで交差するかどうか返す
	//--------------------------------------------------------------------------------
	isnodevalid          : function(cell)  { return cell.lcnt>0 || (this.moveline && cell.isNum());},
	isedgevalidbylinkobj : function(border){ return border.isLine();},
	iscrossing           : function(cell)  { return this.isLineCross;},

	//---------------------------------------------------------------------------
	// linegraph.rebuild()  既存の情報からデータを再設定する
	// linegraph.rebuild2() 継承先に固有のデータを設定する
	//---------------------------------------------------------------------------
	rebuild : function(){
		if(this.board.borderAsLine){ this.pointgroup = 'cross';}
		pzpr.common.GraphBase.prototype.rebuild.call(this);
	},
	rebuild2 : function(){
		if(!!this.incdecLineCount){
			this.resetLineCount();
		}
		pzpr.common.GraphBase.prototype.rebuild2.call(this);
	},

	//---------------------------------------------------------------------------
	// linegraph.resetLineCount()  初期化時に、lcnt情報を初期化する
	// linegraph.incdecLineCount() 線が引かれたり消された時に、lcnt変数を生成し直す
	//---------------------------------------------------------------------------
	resetLineCount : function(){
		var cells = this.board[this.pointgroup], borders = this.board[this.linkgroup];
		this.ltotal=[cells.length];
		for(var c=0;c<cells.length;c++){
			cells[c].lcnt = 0;
		}
		for(var id=0;id<borders.length;id++){
			if(this.isedgevalidbylinkobj(borders[id])){
				this.incdecLineCount(borders[id], true);
			}
		}
	},
	incdecLineCount : function(border, isset){
		if(border.group!==this.linkgroup){ return;}
		for(var i=0;i<2;i++){
			var cell = border.sideobj[i];
			if(!cell.isnull){
				this.ltotal[cell.lcnt]--;
				if(isset){ cell.lcnt++;}else{ cell.lcnt--;}
				this.ltotal[cell.lcnt] = (this.ltotal[cell.lcnt] || 0) + 1;
			}
		}
	},

	//---------------------------------------------------------------------------
	// linegraph.setEdgeByLinkObj() 線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setEdgeByLinkObj : function(linkobj){
		var isset = this.isedgevalidbylinkobj(linkobj);
		if(isset===this.isedgeexistsbylinkobj(linkobj)){ return;}

		if(!!this.incdecLineCount){
			this.incdecLineCount(linkobj, isset);
		}

		if(isset){ this.addEdgeByLinkObj(linkobj);}
		else     { this.removeEdgeByLinkObj(linkobj);}
	},

	//---------------------------------------------------------------------------
	// graph.addEdgeByLinkObj()    指定されたオブジェクトの場所にEdgeを生成する
	// graph.removeEdgeByLinkObj() 指定されたオブジェクトの場所からEdgeを除去する
	//---------------------------------------------------------------------------
	addEdgeByLinkObj : function(linkobj){ // 線(など)を引いた時の処理
		var enattach = (this.modifyNodes.length===0);
		var sidenodeobj = this.getSideObjByLinkObj(linkobj);

		// 周囲のNodeをグラフに追加するかどうか確認する
		this.createNodeIfEmpty(sidenodeobj[0]);
		this.createNodeIfEmpty(sidenodeobj[1]);

		// linkするNodeを取得する
		var sidenodes = this.getSideNodesByLinkObj(linkobj);

		// 周囲のNodeとlink
		this.addEdge(sidenodes[0], sidenodes[1]);

		// 周囲のComponentにくっついただけの場合は情報を更新して終了
		if(this.rebuildmode || !enattach){ return;}
		var attachnodes = null, node1 = sidenodes[0], node2 = sidenodes[1];
		if     (node1.obj.lcnt===1 && node1.component===null && node2.component!==null){ attachnodes = [sidenodes[0], sidenodes[1]];}
		else if(node2.obj.lcnt===1 && node2.component===null && node1.component!==null){ attachnodes = [sidenodes[1], sidenodes[0]];}
		if(!!attachnodes){
			this.attachNode(attachnodes[0], attachnodes[1].component);
			this.modifyNodes = [];
		}
	},
	removeEdgeByLinkObj : function(linkobj){ // 線(など)を消した時の処理
		// unlinkするNodeを取得する
		var endetach = (this.modifyNodes.length===0);
		var sidenodes = this.getSideNodesByLinkObj(linkobj);

		// 周囲のNodeとunlink
		this.removeEdge(sidenodes[0], sidenodes[1]);

		// 周囲のNodeをグラフから取り除くかどうか確認する
		this.deleteNodeIfEmpty(sidenodes[0].obj);
		this.deleteNodeIfEmpty(sidenodes[1].obj);

		this.setComponentRefs(linkobj, null);

		// 周囲のComponent末端から切り離されただけの場合は情報を更新して終了
		if(!endetach){ return;}
		var detachnodes = null, node1 = sidenodes[0], node2 = sidenodes[1];
		var lcnt1 = node1.obj.lcnt, lcnt2 = node2.obj.lcnt;
		if     (lcnt1===0 && ((lcnt2===1 || (!this.isLineCross && lcnt2>1)) && node2.component!==null)){ detachnodes = [sidenodes[0], sidenodes[1]];}
		else if(lcnt2===0 && ((lcnt1===1 || (!this.isLineCross && lcnt1>1)) && node1.component!==null)){ detachnodes = [sidenodes[1], sidenodes[0]];}
		if(!!detachnodes){
			this.setComponentInfo(detachnodes[1].component);
			this.modifyNodes = [];
		}
	},

	//---------------------------------------------------------------------------
	// linegraph.setOtherInformation() 移動系パズルで数字などが入力された時に線の情報を生成しなおす
	//---------------------------------------------------------------------------
	modifyOtherInfo : function(cell, relation){
		var haspath = !!cell.path;
		if(haspath!==this.isnodevalid(cell)){
			if(haspath){ this.deleteNodeIfEmpty(cell);}
			else       { this.createNodeIfEmpty(cell);}
		}
		else{
			if(haspath){ this.setComponentInfo(cell.path);}
			else       { this.resetExtraData(cell);}
		}
	},

	//---------------------------------------------------------------------------
	// linegraph.createNodeIfEmpty()  指定されたオブジェクトの場所にNodeを生成する
	// linegraph.deleteNodeIfEmpty()  指定されたオブジェクトの場所からNodeを除去する
	//---------------------------------------------------------------------------
	createNodeIfEmpty : function(cell){
		var nodes = this.getObjNodeList(cell);

		// 周囲のNode生成が必要かもしれないのでチェック＆create
		if(nodes.length===0){
			this.createNode(cell);
		}
		// 交差あり盤面の処理
		else if(!nodes[1] && nodes[0].nodes.length===2 && this.iscrossing(cell)){
			// 2本->3本になる時はNodeを追加して分離します
			// 上下/左右の線が1本ずつだった場合は左右の線をnodes[1]に付加し直します
			var nbnodes = nodes[0].nodes;
			var isvert = [cell.getvert(nbnodes[0].obj, 2), cell.getvert(nbnodes[1].obj, 2)];
			if(isvert[0]!==isvert[1]){
				// breaking up a corner; we create two new nodes to ensure
				// that the graph gets rebuilt correctly
				var vertnode = nbnodes[isvert[0]?0:1];
				var horiznode = nbnodes[isvert[0]?1:0];
				this.removeEdge(nodes[0], vertnode);
				this.removeEdge(nodes[0], horiznode);
				this.deleteNode(nodes[0]);
				this.createNode(cell);
				this.createNode(cell);
				this.addEdge(nodes[0], vertnode);
				this.addEdge(nodes[1], horiznode);
			}
			// 両方左右線の場合はnodes[0], nodes[1]を交換してnodes[0]に0本、nodes[1]に2本付加する
			else{
				this.createNode(cell);
				if(!isvert[0] && !isvert[1]){
					nodes.push(nodes.shift());
				}
			}
		}
	},
	deleteNodeIfEmpty : function(cell){
		var nodes = this.getObjNodeList(cell);

		// 周囲のNodeが消えるかもしれないのでチェック＆remove
		if(nodes.length===1 && nodes[0].nodes.length===0 && !this.isnodevalid(cell)){
			this.deleteNode(nodes[0]);
		}
		// 交差あり盤面の処理
		else if(!!nodes[1] && nodes[0].nodes.length+nodes[1].nodes.length===2 && this.iscrossing(cell)){
			// 3本->2本になってnodes[0], nodes[1]に1本ずつEdgeが存在する場合はnodes[0]に統合
			if(nodes[1].nodes.length===1){
				var lrnode = nodes[1].nodes[0];
				this.removeEdge(nodes[1], lrnode);
				this.addEdge(nodes[0], lrnode);
			}
			// 両方左右線の場合はnodes[0], nodes[1]を交換してnodes[0]に2本、nodes[1]に0本にする
			else if(nodes[1].nodes.length===2){
				nodes.push(nodes.shift());
			}

			// 不要になったNodeを削除
			this.deleteNode(nodes[1]);
		}
	},

	//--------------------------------------------------------------------------------
	// linegraph.resetExtraData() 指定されたオブジェクトの拡張データをリセットする
	// linegraph.setExtraData()   指定された領域の拡張データを設定する
	//--------------------------------------------------------------------------------
	resetExtraData : function(nodeobj){
		if(this.moveline){ nodeobj.base = (nodeobj.isNum() ? nodeobj : this.board.emptycell);}
	},
	setExtraData : function(component){
		if(this.coloring && !component.color){
			component.color = this.puzzle.painter.getNewLineColor();
		}

		var edgeobjs = component.getedgeobjs();
		for(var i=0;i<edgeobjs.length;i++){
			this.setComponentRefs(edgeobjs[i], component);
		}

		if(this.makeClist || this.moveline){
			component.clist = new this.klass.CellList(component.getnodeobjs());
			if(this.moveline){ this.setMovedBase(component);}
		}
	},

	//--------------------------------------------------------------------------------
	// linegraph.repaintNodes() ブロックを再描画する
	//--------------------------------------------------------------------------------
	repaintNodes : function(components){
		var blist_all = new this.klass.BorderList();
		for(var i=0;i<components.length;i++){
			blist_all.extend(components[i].getedgeobjs());
		}
		this.puzzle.painter.repaintLines(blist_all);
	},

	//--------------------------------------------------------------------------------
	// linemgr.initMovedBase()   指定されたセルの移動情報を初期化する
	// linemgr.setMovedBase()    指定された領域の移動情報を設定する
	//--------------------------------------------------------------------------------
	setMovedBase : function(component){
		var emptycell = this.board.emptycell;
		component.departure = component.destination = emptycell;
		component.movevalid = false;

		var clist = component.clist;
		if(clist.length<1){ return;}
		for(var i=0;i<clist.length;i++){
			var cell=clist[i];
			cell.base = (cell.isNum() ? cell : emptycell);
		}

		var before=null, after=null, point=0;
		if(clist.length===1){
			before = after = clist[0];
			point = 2;
		}
		else{
			for(var i=0;i<clist.length;i++){
				var cell=clist[i];
				if(cell.lcnt===1){
					point++;
					if(cell.isNum()){ before=cell;}else{ after=cell;}
				}
			}
		}
		if(before!==null && after!==null && point===2){
			before.base = emptycell;
			component.departure   = after.base = before;
			component.destination = after;
			component.movevalid = true;
		}
	}
}
});
