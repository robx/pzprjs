// LineManager.js

//---------------------------------------------------------------------------
// ★GraphBaseクラス 線や領域情報を管理する
//---------------------------------------------------------------------------
// GraphBaseクラスの定義
pzpr.classmgr.makeCommon({
GraphBase:{
	init : function(){
		if(this.enabled){
			var info = this.board.validinfo;
			for(var i=0;i<this.relation.length;i++){
				info[this.relation[i]].push(this);
			}
			info.all.push(this);
			this.init2();
		}
	},

	init2 : function(){},
	enabled : false,
	relation : [],
	
	pointgroup : '',
	linkgroup  : '',
	
	//--------------------------------------------------------------------------------
	// graph.removeFromArray()    Arrayからitemを取り除く
	//--------------------------------------------------------------------------------
	removeFromArray : function(array, item){
		var idx = array.indexOf(item);
		if(idx>=0){ Array.prototype.splice.call(array, idx, 1);}
	},
		
	//--------------------------------------------------------------------------------
	// graph.setComponentRefs()    objにcomponentの設定を行う (性能対策)
	// graph.isedgeexists()        linkobjにedgeが存在するか判定する
	// 
	// graph.getObjNodeList()      objにあるnodeを取得する
	// graph.resetObjNodeList()    objからnodeをクリアする
	//--------------------------------------------------------------------------------
	setComponentRefs : function(obj, component){},
	isedgeexists : function(linkobj){ return false;},
	
	getObjNodeList   : function(nodeobj){ return [];},
	resetObjNodeList : function(nodeobj){ },
	
	//--------------------------------------------------------------------------------
	// graph.isnodevalid()  そのセルにNodeが存在すべきかどうか返す
	// graph.isedgevalid()  そのborderにEdgeが存在すべきかどうか返す
	//--------------------------------------------------------------------------------
	isnodevalid : function(nodeobj){ return false;},
	isedgevalid : function(linkobj){ return false;},
	
	//---------------------------------------------------------------------------
	// graph.rebuild()  既存の情報からデータを再設定する
	// graph.rebuild2() 継承先に固有のデータを設定する
	//---------------------------------------------------------------------------
	rebuildmode : false,
	rebuild : function(){
		if(!this.enabled){ return;}

		this.rebuildmode = true;

		this.components  = [];
		this.modifyNodes = [];

		this.rebuild2();

		this.searchGraph();

		this.rebuildmode = false;
	},
	rebuild2 : function(){
		var nodeobjs = this.board[this.pointgroup], linkobjs = this.board[this.linkgroup];
		for(var c=0;c<nodeobjs.length;c++){
			this.setComponentRefs(nodeobjs[c], null);
			this.resetObjNodeList(nodeobjs[c]);
			if(this.isnodevalid(nodeobjs[c])){ this.createNode(nodeobjs[c]);}
		}
		if(this.linkgroup){
			for(var id=0;id<linkobjs.length;id++){
				this.setComponentRefs(linkobjs[id], null);
				if(this.isedgevalid(linkobjs[id])){ this.addEdgeByLinkObj(linkobjs[id]);}
			}
		}
		else{
			for(var c=0;c<nodeobjs.length;c++){
				if(this.isnodevalid(nodeobjs[c])){ this.putEdgeByNodeObj(nodeobjs[c]);}
			}
		}
	},

	//---------------------------------------------------------------------------
	// graph.createComponent()  GraphComponentオブジェクトを作成する
	// graph.deleteComponent()  GraphComponentオブジェクトを削除してNodeをmodifyNodesに戻す
	//---------------------------------------------------------------------------
	createComponent : function(){
		var component = new this.klass.GraphComponent();
		this.components.push(component);
		return component;
	},
	deleteComponent : function(component){
		for(var i=0;i<component.nodes.length;i++){
			this.modifyNodes.push(component.nodes[i]);
			this.setComponentRefs(component.nodes[i].obj, null);
			component.nodes[i].component = null;
		}
		this.removeFromArray(this.components, component);
	},

	//---------------------------------------------------------------------------
	// graph.createNode()    GraphNodeオブジェクトを生成する
	// graph.deleteNode()    GraphNodeオブジェクトをグラフから削除する (先にEdgeを0本にしてください)
	//---------------------------------------------------------------------------
	createNode : function(cell){
		var node = new this.klass.GraphNode(cell);
		this.getObjNodeList(cell).push(node);
		this.modifyNodes.push(node);
		return node;
	},
	deleteNode : function(node){
		var cell = node.obj;
		this.setComponentRefs(cell, null);
		this.removeFromArray(this.getObjNodeList(cell), node);
		
		// rebuildmode中にはこの関数は呼ばれません
		this.removeFromArray(this.modifyNodes, node);
		var component = node.component;
		if(component!==null){
			this.removeFromArray(component.nodes, node);
			this.resetExtraData(cell);
			if(component.nodes.length===0){
				this.deleteComponent(component);
			}
		}
	},

	//---------------------------------------------------------------------------
	// linegraph.createNodeIfEmpty()  指定されたオブジェクトの場所にNodeを生成する
	// linegraph.deleteNodeIfEmpty()  指定されたオブジェクトの場所からNodeを除去する
	//---------------------------------------------------------------------------
	createNodeIfEmpty : function(nodeobj){
		// 周囲のNode生成が必要かもしれないのでチェック＆create
		if(this.getObjNodeList(nodeobj).length===0){
			this.createNode(nodeobj);
		}
	},
	deleteNodeIfEmpty : function(nodeobj){
		var nodes = this.getObjNodeList(nodeobj);
		
		// 周囲のNodeが消えるかもしれないのでチェック＆remove
		if(nodes[0].nodes.length===0 && !this.isnodevalid(nodeobj)){
			this.deleteNode(nodes[0]);
		}
	},

	//---------------------------------------------------------------------------
	// graph.addEdge()    Node間にEdgeを追加する
	// graph.removeEdge() Node間からEdgeを除外する
	//---------------------------------------------------------------------------
	addEdge : function(node1, node2){
		if(node1.nodes.indexOf(node2)>=0){ return;} // 多重辺にしないため
		node1.nodes.push(node2);
		node2.nodes.push(node1);
		
		if(!this.rebuildmode){
			if(this.modifyNodes.indexOf(node1)<0){ this.modifyNodes.push(node1);}
			if(this.modifyNodes.indexOf(node2)<0){ this.modifyNodes.push(node2);}
		}
	},
	removeEdge : function(node1, node2){
		if(node1.nodes.indexOf(node2)<0){ return;} // 存在しない辺を削除しない
		this.removeFromArray(node1.nodes, node2);
		this.removeFromArray(node2.nodes, node1);
		
		if(!this.rebuildmode){
			if(this.modifyNodes.indexOf(node1)<0){ this.modifyNodes.push(node1);}
			if(this.modifyNodes.indexOf(node2)<0){ this.modifyNodes.push(node2);}
		}
	},

	//---------------------------------------------------------------------------
	// graph.getSideObjByLinkObj()   borderから接続するNodeにあるobjを取得する
	// graph.getSideNodesByLinkObj() borderからEdgeに接続するNodeを取得する
	//---------------------------------------------------------------------------
	getSideObjByLinkObj   : function(linkobj){ return [];},
	getSideNodesByLinkObj : function(linkobj){ return [];},

	//---------------------------------------------------------------------------
	// graph.setEdgeByLinkObj() 線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setEdgeByLinkObj : function(linkobj){
		var isset = this.isedgevalid(linkobj);
		if(isset===this.isedgeexists(linkobj)){ return;}

		this.modifyNodes = [];

		if(isset){ this.addEdgeByLinkObj(linkobj);}
		else     { this.removeEdgeByLinkObj(linkobj);}

		this.remakeComponent();
	},

	//---------------------------------------------------------------------------
	// linegraph.addEdgeByLinkObj()    指定されたオブジェクトの場所にEdgeを生成する
	// linegraph.removeEdgeByLinkObj() 指定されたオブジェクトの場所からEdgeを除去する
	//---------------------------------------------------------------------------
	addEdgeByLinkObj : function(linkobj){
		var sidenodeobj = this.getSideObjByLinkObj(linkobj);
		
		// 周囲のNodeをグラフに追加するかどうか確認する
		this.createNodeIfEmpty(sidenodeobj[0]);
		this.createNodeIfEmpty(sidenodeobj[1]);

		// linkするNodeを取得する
		var sidenodes = this.getSideNodesByLinkObj(linkobj);

		// 周囲のNodeとlink
		this.addEdge(sidenodes[0], sidenodes[1]);
	},
	removeEdgeByLinkObj : function(linkobj){
		// unlinkするNodeを取得する
		var sidenodes = this.getSideNodesByLinkObj(linkobj);

		// 周囲のNodeとunlink
		this.removeEdge(sidenodes[0], sidenodes[1]);

		// 周囲のNodeをグラフから取り除くかどうか確認する
		this.deleteNodeIfEmpty(sidenodes[0].obj);
		this.deleteNodeIfEmpty(sidenodes[1].obj);

		if(this.linkgroup){
			this.setComponentRefs(linkobj, null);
		}
	},

	//---------------------------------------------------------------------------
	// graph.remakeComponent() modifyNodesに含まれるsubgraph成分からremakeしたりします
	// graph.getAffectedComponents() modifyNodesを含むcomponentsを取得します
	// graph.checkDividedComponent() 指定されたComponentがひとつながりかどうか探索します
	// graph.remakeMaximalComonents()指定されたcomponentsを探索し直します
	//---------------------------------------------------------------------------
	remakeComponent : function(){
		// subgraph中にcomponentが何種類あるか調べる
		var remakeComponents = this.getAffectedComponents();
		
		// Component数が1ならsubgraphが分断していないかどうかチェック
		if(remakeComponents.length===1){
			this.checkDividedComponent(remakeComponents[0]);
		}
		
		// Component数が0なら現在のmodifyNodesに新規IDを割り振り終了
		// Component数が2以上ならmodifyNodesに極大部分グラフを取り込んで再探索
		if(!!this.modifyNodes && this.modifyNodes.length>0){
			this.remakeMaximalComonents(remakeComponents);
		}
	},
	getAffectedComponents : function(){
		var remakeComponents = [];
		for(var i=0;i<this.modifyNodes.length;i++){
			var component = this.modifyNodes[i].component;
			if(component!==null){
				if(!component.isremake){
					remakeComponents.push(component);
					component.isremake = true;
				}
			}
		}
		return remakeComponents;
	},
	checkDividedComponent : function(component){
		// 1つだけsubgraphを生成してみる
		for(var i=0,len=this.modifyNodes.length;i<len;i++){
			var node = this.modifyNodes[i];
			node.component = null;
			this.setComponentRefs(node.obj, null);
			this.removeFromArray(component.nodes, node);
		}
		var pseudoComponent = new this.klass.GraphComponent();
		this.searchSingle(this.modifyNodes[0], pseudoComponent);
		// subgraphがひとつながりならComponentに属していないNodeをそのComponentに割り当てる
		if(pseudoComponent.nodes.length===this.modifyNodes.length){
			for(var i=0;i<this.modifyNodes.length;i++){
				var node = this.modifyNodes[i];
				node.component = component;
				this.setComponentRefs(node.obj, component);
				component.nodes.push(node);
			}
			this.modifyNodes = [];
			this.setComponentInfo(component);
			component.isremake = false;
		}
		// subgraphがひとつながりでないなら再探索ルーチンを回す
	},
	remakeMaximalComonents : function(remakeComponents){
		var longColor = this.getLongColor(remakeComponents);
		for(var p=0;p<remakeComponents.length;p++){
			this.deleteComponent(remakeComponents[p]);
		}
		var newComponents = this.searchGraph();
		this.setLongColor(newComponents, longColor);
	},

	//---------------------------------------------------------------------------
	// graph.searchGraph()  ひとつながりの線にlineidを設定する
	// graph.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//---------------------------------------------------------------------------
	searchGraph : function(){
		var partslist = this.modifyNodes;
		var newcomponents = [];
		for(var i=0,len=partslist.length;i<len;i++){
			partslist[i].component = null;
		}
		for(var i=0,len=partslist.length;i<len;i++){
			if(partslist[i].component!==null){ continue;}	// 既にidがついていたらスルー
			var component = this.createComponent();
			this.searchSingle(partslist[i], component);
			this.setComponentInfo(component);
			newcomponents.push(component);
		}
		this.modifyNodes = [];
		return newcomponents;
	},
	searchSingle : function(startparts, component){
		var stack = [startparts];
		while(stack.length>0){
			var node = stack.pop();
			if(node.component!==null){ continue;}

			node.component = component;
			component.nodes.push(node);

			for(var i=0;i<node.nodes.length;i++){ stack.push(node.nodes[i]);}
		}
	},

	//--------------------------------------------------------------------------------
	// graph.setComponentInfo() Componentオブジェクトのデータを設定する
	//--------------------------------------------------------------------------------
	setComponentInfo : function(component){
		var edges = 0;
		for(var i=0;i<component.nodes.length;i++){
			var node = component.nodes[i];
			edges += node.nodes.length;
			
			this.setComponentRefs(node.obj, component);
		}
		component.circuits = (edges>>1) - component.nodes.length + 1;
		
		this.setExtraData(component);
	},

	//--------------------------------------------------------------------------------
	// graph.resetExtraData() 指定されたオブジェクトの拡張データをリセットする
	// graph.setExtraData()   指定された領域の拡張データを設定する
	//--------------------------------------------------------------------------------
	resetExtraData : function(nodeobj){},
	setExtraData : function(component){},

	//--------------------------------------------------------------------------------
	// graph.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// graph.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(components){ return '';},
	setLongColor : function(components, longColor){}
},
GraphComponent:{
	initialize : function(){
		this.nodes = [];
		this.color = '';
		this.circuits = -1;
	},

	//---------------------------------------------------------------------------
	// component.getLinkObjByNodes()  node間のオブジェクトを取得する
	//---------------------------------------------------------------------------
	getLinkObjByNodes : function(node1, node2){
		var bx1=node1.obj.bx, by1=node1.obj.by, bx2=node2.obj.bx, by2=node2.obj.by;
		if(bx1>bx2||((bx1===bx2)&&(by1>by2))){ return null;}
		return this.board.getobj(((bx1+bx2)>>1), ((by1+by2)>>1));
	},

	//---------------------------------------------------------------------------
	// component.getnodeobjs()  nodeのオブジェクトリストを取得する
	// component.getedgeobjs()  edgeのオブジェクトリストを取得する
	//---------------------------------------------------------------------------
	getnodeobjs : function(){
		var objs = new (this.board.getGroup(this.nodes[0].obj.group).constructor)();
		for(var i=0;i<this.nodes.length;i++){ objs.add(this.nodes[i].obj);}
		return objs;
	},
	getedgeobjs : function(){
		var objs = [];
		for(var i=0;i<this.nodes.length;i++){
			var node = this.nodes[i];
			for(var n=0;n<node.nodes.length;n++){
				var obj = this.getLinkObjByNodes(node, node.nodes[n]);
				if(!!obj){ objs.push(obj);}
			}
		}
		return objs;
	},

	//---------------------------------------------------------------------------
	// component.setedgeerr()   edgeにerror値を設定する
	// component.setedgeinfo()  edgeにqinfo値を設定する
	//---------------------------------------------------------------------------
	setedgeerr : function(val){
		var objs = this.getedgeobjs();
		for(var i=0;i<objs.length;i++){ objs[i].seterr(val);}
	},
	setedgeinfo : function(val){
		var objs = this.getedgeobjs();
		for(var i=0;i<objs.length;i++){ objs[i].setinfo(val);}
	}
},
GraphNode:{
	initialize : function(obj){
		this.obj   = obj;
		this.nodes = [];	// Array of Linked GraphNode
		this.component = null;
	}
},

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に線や色分けの情報を管理する
//---------------------------------------------------------------------------
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
	// linegraph.isedgeexists()        linkobjにedgeが存在するか判定する
	// 
	// linegraph.getObjNodeList()      objにあるnodeを取得する
	// linegraph.resetObjNodeList()    objからnodeをクリアする
	//--------------------------------------------------------------------------------
	setComponentRefs : function(obj, component){ obj.path = component;},
	isedgeexists     : function(linkobj){ return linkobj.path!==null;},
	
	getObjNodeList   : function(nodeobj){ return nodeobj.pathnodes;},
	resetObjNodeList : function(nodeobj){
		nodeobj.pathnodes = [];
		if(this.moveline){ this.resetExtraData(nodeobj);}
	},

	//--------------------------------------------------------------------------------
	// linegraph.isnodevalid()  そのセルにNodeが存在すべきかどうか返す
	// linegraph.isedgevalid()  そのborderにEdgeが存在すべきかどうか返す
	// linegraph.iscrossing()   そのセルで交差するかどうか返す
	//--------------------------------------------------------------------------------
	isnodevalid : function(cell)  { return cell.lcnt>0 || (this.moveline && cell.isNum());},
	isedgevalid : function(border){ return border.isLine();},
	iscrossing  : function(cell)  { return this.isLineCross;},

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
		if(!cell.isnull){
			this.ltotal[cell.lcnt]--;
			if(isset){ cell.lcnt++;}else{ cell.lcnt--;}
			this.ltotal[cell.lcnt] = (this.ltotal[cell.lcnt] || 0) + 1;
		}
	},

	//---------------------------------------------------------------------------
	// linegraph.getSideObjByLinkObj()   borderから接続するNodeにあるobjを取得する
	// linegraph.getSideNodesByLinkObj() borderからEdgeに接続するNodeを取得する
	//---------------------------------------------------------------------------
	getSideObjByLinkObj : function(border){
		return border.sideobj;
	},
	getSideNodesByLinkObj : function(border){
		var sidenodes = [], sidenodeobj = this.getSideObjByLinkObj(border);
		for(var i=0;i<sidenodeobj.length;i++){
			var cell = sidenodeobj[i], nodes = this.getObjNodeList(cell), node = nodes[0];
			// 交差あり盤面の特殊処理 border.isvertはfalseの時タテヨコ線
			if(!!nodes[1] && border.isvert){ node = nodes[1];}
			sidenodes.push(node);
		}
		return sidenodes;
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
