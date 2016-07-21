// LineManager.js

//---------------------------------------------------------------------------
// ★LineGraphクラス 主に線や色分けの情報を管理する
//---------------------------------------------------------------------------
pzpr.classmgr.makeCommon({
"LineGraph:GraphBase":{
	initialize : function(){
		if(this.moveline){ this.relation.push('cell');}
	},
	
	enabled : false,
	relation : ['line'],
	
	pointgroup : 'cell',
	linkgroup  : 'border',
	
	isLineCross : false,	// 線が交差するパズル
	
	makeClist : false,		// 線が存在するclistを生成する
	moveline  : false,		// 丸数字などを動かすパズル
	
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
	// linegraph.rebuild2() 継承先に固有のデータを設定する
	//---------------------------------------------------------------------------
	rebuild2 : function(){
		var cells = this.board[this.pointgroup];
		this.ltotal=[cells.length];
		for(var c=0;c<cells.length;c++){ cells[c].lcnt = 0;}
		
		pzpr.common.GraphBase.prototype.rebuild2.call(this);
	},

	//---------------------------------------------------------------------------
	// linegraph.incdecLineCount() 線が引かれたり消された時に、lcnt変数を生成し直す
	//---------------------------------------------------------------------------
	incdecLineCount : function(cell, isset){
		if(cell.group===this.pointgroup && !cell.isnull){
			this.ltotal[cell.lcnt]--;
			if(isset){ cell.lcnt++;}else{ cell.lcnt--;}
			this.ltotal[cell.lcnt] = (this.ltotal[cell.lcnt] || 0) + 1;
		}
	},

	//---------------------------------------------------------------------------
	// linegraph.setLine()     線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setLine : function(border){
		if(!this.enabled){ return;}
		this.setEdgeByLinkObj(border);
	},

	//---------------------------------------------------------------------------
	// linegraph.setCell()     移動系パズルで数字などが入力された時に線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setCell : function(cell){
		if(this.moveline){
			if(!!cell.path){ this.setComponentInfo(cell.path);}
			else           { this.resetExtraData(cell);}
		}
		else if(this.board.emptyborder.enableLineCombined){
			var cblist = cell.getdir4cblist();
			for(var i=0;i<cblist.length;i++){
				this.setEdgeByLinkObj(cblist[i][1]);
			}
		}
	},

	//---------------------------------------------------------------------------
	// linegraph.createNodeIfEmpty()  指定されたオブジェクトの場所にNodeを生成する
	// linegraph.deleteNodeIfEmpty()  指定されたオブジェクトの場所からNodeを除去する
	//---------------------------------------------------------------------------
	createNodeIfEmpty : function(cell){
		var nodes = this.getObjNodeList(cell);
		
		// ここどうする？
		this.incdecLineCount(cell, true);
		
		// 周囲のNode生成が必要かもしれないのでチェック＆create
		if(nodes.length===0){
			this.createNode(cell);
		}
		// 交差あり盤面の処理
		else if(!nodes[1] && nodes[0].nodes.length===2 && this.iscrossing(cell)){
			// 2本->3本になる時はNodeを追加して分離します
			this.createNode(cell);
			
			// 上下/左右の線が1本ずつだった場合は左右の線をnodes[1]に付加し直します
			var nbnodes = nodes[0].nodes;
			var isvert = [cell.getvert(nbnodes[0].obj, 2), cell.getvert(nbnodes[1].obj, 2)];
			if(isvert[0]!==isvert[1]){
				var lrnode = nbnodes[!isvert[0]?0:1];
				this.removeEdge(nodes[0], lrnode);
				this.addEdge(nodes[1], lrnode);
			}
			// 両方左右線の場合はnodes[0], nodes[1]を交換してnodes[0]に0本、nodes[1]に2本付加する
			else if(!isvert[0] && !isvert[1]){
				nodes.push(nodes.shift());
			}
		}
	},
	deleteNodeIfEmpty : function(cell){
		var nodes = this.getObjNodeList(cell);
		
		// ここどうする？
		this.incdecLineCount(cell, false);
		
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
		if(!component.color){
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
	// linemgr.initMovedBase()   指定されたセルの移動情報を初期化する
	// linemgr.setMovedBase()    指定された領域の移動情報を設定する
	//--------------------------------------------------------------------------------
	setMovedBase : function(component){
		var emptycell = this.board.emptycell;
		component.departure = component.destination = emptycell;
		component.movevalid = false;
		
		var clist = component.clist;
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
			component.departure   = after.base = before;
			component.destination = after;
			component.movevalid = true;
		}
	},

	//--------------------------------------------------------------------------------
	// linegraph.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// linegraph.setLongColor() ブロックに色をつけなおす
	// linegraph.repaintNodes() ブロックを再描画する
	//--------------------------------------------------------------------------------
	getLongColor : function(components){
		// 周りで一番大きな線は？
		var largeComponent = components[0];
		for(var i=1;i<components.length;i++){
			if(largeComponent.nodes.length < components[i].nodes.length){ largeComponent = components[i];}
		}
		return (!!largeComponent ? largeComponent.color : this.puzzle.painter.getNewLineColor());
	},
	setLongColor : function(components, longColor){
		if(components.length===0){ return;}
		var puzzle = this.puzzle;
		
		// できた線の中でもっとも長いものを取得する
		var largeComponent = components[0];
		for(var i=1;i<components.length;i++){
			if(largeComponent.nodes.length < components[i].nodes.length){ largeComponent = components[i];}
		}
		
		// 新しい色の設定
		for(var i=0;i<components.length;i++){
			var path = components[i];
			path.color = (path===largeComponent ? longColor : path.color);
		}
		
		if(puzzle.execConfig('irowake')){
			this.repaintNodes(components);
		}
	},
	repaintNodes : function(components){
		var blist_all = new this.klass.BorderList();
		for(var i=0;i<components.length;i++){
			blist_all.extend(components[i].getedgeobjs());
		}
		this.puzzle.painter.repaintLines(blist_all);
	},

	//---------------------------------------------------------------------------
	// linegraph.newIrowake()  線の情報が再構築された際、線に色をつける
	//---------------------------------------------------------------------------
	newIrowake : function(){
		var paths = this.components;
		for(var i=0;i<paths.length;i++){
			paths[i].color = this.puzzle.painter.getNewLineColor();
		}
	}
}
});
