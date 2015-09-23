// Address.js v3.4.1

pzpr.classmgr.makeCommon({
//----------------------------------------------------------------------------
// ★Positionクラス RawAddress, Pieceクラスのベースクラス
//---------------------------------------------------------------------------
Position:{
	bx : null,
	by : null,

	// 方向を表す定数
	NDIR : 0,	// 方向なし
	UP   : 1,	// up, top
	DN   : 2,	// down, bottom
	LT   : 3,	// left
	RT   : 4,	// right

	//---------------------------------------------------------------------------
	// pos.equals() 同じ位置にあるかどうか判定する
	//---------------------------------------------------------------------------
	equals : function(pos){
		return (this.bx===pos.bx && this.by===pos.by);
	},

	//---------------------------------------------------------------------------
	// pos.getaddr() 位置をAddressクラスのオブジェクトで取得する
	//---------------------------------------------------------------------------
	getaddr : function(){
		return (new this.klass.Address(this.bx, this.by));
	},

	//---------------------------------------------------------------------------
	// relcell(), relcross(), relbd(), relexcell(), relobj() 相対位置に存在するオブジェクトを返す
	//---------------------------------------------------------------------------
	relcell   : function(dx,dy){ return this.board.getc(this.bx+dx,this.by+dy);},
	relcross  : function(dx,dy){ return this.board.getx(this.bx+dx,this.by+dy);},
	relbd     : function(dx,dy){ return this.board.getb(this.bx+dx,this.by+dy);},
	relexcell : function(dx,dy){ return this.board.getex(this.bx+dx,this.by+dy);},
	relobj    : function(dx,dy){ return this.board.getobj(this.bx+dx,this.by+dy);},

	//---------------------------------------------------------------------------
	// pos.draw() 盤面に自分の周囲を描画する
	// pos.drawaround() 盤面に自分の周囲1マスを含めて描画する
	//---------------------------------------------------------------------------
	draw : function(){
		this.puzzle.painter.paintRange(this.bx-1, this.by-1, this.bx+1, this.by+1);
	},
	drawaround : function(){
		this.puzzle.painter.paintRange(this.bx-3, this.by-3, this.bx+3, this.by+3);
	},

	//---------------------------------------------------------------------------
	// pos.isinside() この場所が盤面内かどうか判断する
	//---------------------------------------------------------------------------
	isinside : function(){
		var bd = this.board;
		return (this.bx>=bd.minbx && this.bx<=bd.maxbx &&
				this.by>=bd.minby && this.by<=bd.maxby);
	}
},

//----------------------------------------------------------------------------
// ★RawAddressクラス (bx,by)座標を扱う ※端数あり
//---------------------------------------------------------------------------
"RawAddress:Position":{
	initialize : function(bx,by){
		if(arguments.length>=2){ this.init(bx,by);}
	},

	reset : function(){ this.bx = null;  this.by = null;},
	clone : function(){ return (new this.constructor(this.bx, this.by));},

	set  : function(addr) { this.bx = addr.bx; this.by = addr.by; return this;},
	init : function(bx,by){ this.bx  = bx; this.by  = by; return this;},
	move : function(dx,dy){ this.bx += dx; this.by += dy; return this;},

	//---------------------------------------------------------------------------
	// addr.movedir() 指定した方向に指定した数移動する
	//---------------------------------------------------------------------------
	movedir : function(dir,dd){
		switch(dir){
			case this.UP: this.by-=dd; break;
			case this.DN: this.by+=dd; break;
			case this.LT: this.bx-=dd; break;
			case this.RT: this.bx+=dd; break;
		}
		return this;
	}
},

//----------------------------------------------------------------------------
// ★Addressクラス (bx,by)座標を扱う ※端数無し
//---------------------------------------------------------------------------
// Addressクラス
'Address:RawAddress':{
	oncell   : function(){ return !!( (this.bx&1)&& (this.by&1));},
	oncross  : function(){ return !!(!(this.bx&1)&&!(this.by&1));},
	onborder : function(){ return !!((this.bx+this.by)&1);},
	
	getc  : function(){ return this.board.getc(this.bx, this.by);},
	getx  : function(){ return this.board.getx(this.bx, this.by);},
	getb  : function(){ return this.board.getb(this.bx, this.by);},
	getex : function(){ return this.board.getex(this.bx, this.by);},
	getobj: function(){ return this.board.getobj(this.bx, this.by);}
}
});
