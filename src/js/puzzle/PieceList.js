// PieceList.js v3.4.1

pzpr.classmgr.makeCommon({
//----------------------------------------------------------------------------
// ★PieceListクラス オブジェクトの配列を扱う
//---------------------------------------------------------------------------
PieceList:{
	length : 0,
	
	//--------------------------------------------------------------------------------
	// ☆Arrayオブジェクト関連の関数
	// list.add()      与えられたオブジェクトを配列の末尾に追加する(push()相当)
	// list.extend()   与えられたPieceListを配列の末尾に追加する
	// list.unshift()  与えられたオブジェクトを配列の先頭に入れる
	// list.pop()      配列の最後のオブジェクトを取り除いて返す
	// list.reverse()  保持している配列の順番を逆にする
	//--------------------------------------------------------------------------------
	add     : Array.prototype.push,
	extend  : function(list){
		var self = this;
		list.each(function(obj){ self.add(obj);})
	},
	unshift : Array.prototype.unshift,
	pop     : Array.prototype.pop,
	reverse : Array.prototype.reverse,
	
	//--------------------------------------------------------------------------------
	// ☆Arrayオブジェクトiterator関連の関数
	// list.each()     全てのオブジェクトに指定された関数を実行する
	// list.some()     条件がtrueとなるオブジェクトが存在するか判定する
	// list.include()  与えられたオブジェクトが配列に存在するか判定する
	//--------------------------------------------------------------------------------
	each    : Array.prototype.forEach,
	some    : Array.prototype.some,
	include : function(target){ return this.some(function(obj){ return (obj===target);});},
	
	//--------------------------------------------------------------------------------
	// list.filter()   条件がtrueとなるオブジェクトを抽出したclistを新たに作成する
	// list.notnull()  nullではないオブジェクトを抽出したclistを新たに作成する
	//--------------------------------------------------------------------------------
	/* constructorが変わってしまうので、Array.prototypeが使用できない */
	filter  : function(cond){
		var list = new this.constructor();
		for(var i=0;i<this.length;i++){ if(cond(this[i])){ list.add(this[i]);}}
		return list;
	},
	notnull : function(cond){ return this.filter(function(obj){ return !obj.isnull;});},
	
	//--------------------------------------------------------------------------------
	// list.map()      clistの各要素に指定された関数を適用したclistを新たに作成する
	//--------------------------------------------------------------------------------
	/* constructorが変わってしまうので、Array.prototypeが使用できない */
	map : function(cond){
		var list = new this.constructor();
		for(var i=0;i<this.length;i++){ list.add(cond(this[i]));}
		return list;
	},
	
	//--------------------------------------------------------------------------------
	// list.indexOf()  与えられたオブジェクトの配列上の位置を取得する
	// list.remove()   与えられたオブジェクトを配列から取り除く
	//--------------------------------------------------------------------------------
	indexOf : Array.prototype.indexOf,
	remove : function(obj){
		var idx = this.indexOf(obj);
		if(idx>=0){ Array.prototype.splice.call(this, idx, 1);}
	},
	
	//--------------------------------------------------------------------------------
	// list.seterr()  保持しているオブジェクトにerror値を設定する
	// list.setinfo() 保持しているオブジェクトにqinfo値を設定する
	//--------------------------------------------------------------------------------
	seterr : function(num){
		if(!this.owner.board.isenableSetError()){ return;}
		for(var i=0;i<this.length;i++){ this[i].error = num;}
	},
	setinfo : function(num){
		for(var i=0;i<this.length;i++){ this[i].qinfo = num;}
	},

	//---------------------------------------------------------------------------
	// list.allclear() 位置,描画情報以外をクリアする
	// list.ansclear() qans,anum,line,qsub,error情報をクリアする
	// list.subclear() qsub,error情報をクリアする
	// list.errclear() error情報をクリアする
	// list.propclear() 4つの共通処理
	//---------------------------------------------------------------------------
	/* undo,redo以外で盤面縮小やったときは, isrec===true */
	allclear : function(isrec){ this.propclear(this.getprop('all'), isrec);},
	ansclear : function()     { this.propclear(this.getprop('ans'), true);},
	subclear : function()     { this.propclear(this.getprop('sub'), true);},
	errclear : function()     { this.propclear(this.getprop('err'), false);},
	propclear : function(props, isrec){
		var norec = (this.length>0?this[0].propnorec:{});
		for(var i=0;i<this.length;i++){
			var obj = this[i];
			for(var j=0;j<props.length;j++){
				var pp = props[j];
				var def = obj.constructor.prototype[pp];
				if(obj[pp]!==def){
					if(isrec && !norec[pp]){
						this.owner.opemgr.addOpe_Object(obj, pp, obj[pp], def);
					}
					obj[pp] = def;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// list.getprop() 上記の関数で使用するプロパティの配列を取得する
	//---------------------------------------------------------------------------
	getprop : function(type){
		var array = [];
		if(this.length>0){
			var level = {all:3,ans:2,sub:1,err:0}[type];
			if(level>=3){ array=array.concat(this[0].propques);}
			if(level>=2){ array=array.concat(this[0].propans);}
			if(level>=1){ array=array.concat(this[0].propsub);}
			if(level>=0){ array=array.concat(this[0].propinfo);}
		}
		return array;
	}
},

//----------------------------------------------------------------------------
// ★CellListクラス Cellの配列を扱う
//---------------------------------------------------------------------------
'CellList:PieceList':{
	//---------------------------------------------------------------------------
	// clist.getRectSize()  指定されたCellのリストの上下左右の端と、セルの数を返す
	//---------------------------------------------------------------------------
	getRectSize : function(){
		var bd = this.owner.board;
		var d = { x1:bd.maxbx+1, x2:bd.minbx-1, y1:bd.maxby+1, y2:bd.minby-1, cols:0, rows:0, cnt:0};
		for(var i=0;i<this.length;i++){
			var cell = this[i];
			if(d.x1>cell.bx){ d.x1=cell.bx;}
			if(d.x2<cell.bx){ d.x2=cell.bx;}
			if(d.y1>cell.by){ d.y1=cell.by;}
			if(d.y2<cell.by){ d.y2=cell.by;}
			d.cnt++;
		}
		d.cols = (d.x2-d.x1+2)/2;
		d.rows = (d.y2-d.y1+2)/2;
		return d;
	},

	//--------------------------------------------------------------------------------
	// clist.getQnumCell()  指定されたClistの中で一番左上にある数字のあるセルを返す
	//--------------------------------------------------------------------------------
	getQnumCell : function(){
		for(var i=0,len=this.length;i<len;i++){
			if(this[i].isNum()){ return this[i];}
		}
		return this.owner.board.emptycell;
	},

	//---------------------------------------------------------------------------
	// clist.draw()   盤面に自分の周囲を描画する
	//---------------------------------------------------------------------------
	draw : function(){
		var d = this.getRectSize();
		this.owner.painter.paintRange(d.x1-1, d.y1-1, d.x2+1, d.y2+1);
	}
},

//----------------------------------------------------------------------------
// ★CrossListクラス Crossの配列を扱う
//---------------------------------------------------------------------------
'CrossList:PieceList':{
},

//----------------------------------------------------------------------------
// ★BorderListクラス Borderの配列を扱う
//---------------------------------------------------------------------------
'BorderList:PieceList':{
	//---------------------------------------------------------------------------
	// blist.cellinside()  線が重なるセルのリストを取得する
	// blist.crossinside() 線が重なる交点のリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(){
		var clist = new this.owner.CellList(), pushed = [];
		for(var i=0;i<this.length;i++){
			var border=this[i], cell1=border.sidecell[0], cell2=border.sidecell[1];
			if(!cell1.isnull && pushed[cell1.id]!==true){ clist.add(cell1); pushed[cell1.id]=true;}
			if(!cell2.isnull && pushed[cell2.id]!==true){ clist.add(cell2); pushed[cell2.id]=true;}
		}
		return clist;
	},
	crossinside : function(){
		var clist = new this.owner.CrossList(), pushed = [];
		for(var i=0;i<this.length;i++){
			var border=this[i], cross1=border.sidecross[0], cross2=border.sidecross[1];
			if(!cross1.isnull && pushed[cross1.id]!==true){ clist.add(cross1); pushed[cross1.id]=true;}
			if(!cross2.isnull && pushed[cross2.id]!==true){ clist.add(cross2); pushed[cross2.id]=true;}
		}
		return clist;
	}
},

//----------------------------------------------------------------------------
// ★EXCellListクラス EXCellの配列を扱う
//---------------------------------------------------------------------------
'EXCellList:PieceList':{
}
});
