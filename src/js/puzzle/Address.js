// Address.js v3.4.1

pzpr.classmgr.makeCommon({
//----------------------------------------------------------------------------
// ★RawAddressクラス (bx,by)座標を扱う ※端数あり
//---------------------------------------------------------------------------
RawAddress:{
	initialize : function(bx,by){
		if(arguments.length>=2){ this.init(bx,by);}
	},

	bx : null,
	by : null,

	reset  : function()   { this.bx = null;  this.by = null;},
	equals : function(addr){return (this.bx===addr.bx && this.by===addr.by);},
	clone  : function()   { return (new this.constructor(this.bx, this.by));},

	set  : function(addr) { this.bx = addr.bx; this.by = addr.by; return this;},
	init : function(bx,by){ this.bx  = bx; this.by  = by; return this;},
	move : function(dx,dy){ this.bx += dx; this.by += dy; return this;},
	rel  : function(dx,dy){ return (new this.constructor(this.bx+dx, this.by+dy));},

	// 方向を表す定数 (Pieceと同じ)
	NDIR : 0,	// 方向なし
	UP   : 1,	// up, top
	DN   : 2,	// down, bottom
	LT   : 3,	// left
	RT   : 4,	// right

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
	},

	//---------------------------------------------------------------------------
	// addr.draw() 盤面に自分の周囲を描画する
	// addr.drawaround() 盤面に自分の周囲1マスを含めて描画する
	//---------------------------------------------------------------------------
	draw : function(){
		this.owner.painter.paintRange(this.bx-1, this.by-1, this.bx+1, this.by+1);
	},
	drawaround : function(){
		this.owner.painter.paintRange(this.bx-3, this.by-3, this.bx+3, this.by+3);
	},

	//---------------------------------------------------------------------------
	// addr.isinside() この場所が盤面内かどうか判断する
	//---------------------------------------------------------------------------
	isinside : function(){
		var bd = this.owner.board;
		return (this.bx>=bd.minbx && this.bx<=bd.maxbx &&
				this.by>=bd.minby && this.by<=bd.maxby);
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
	
	getc  : function(){ return this.owner.board.getc(this.bx, this.by);},
	getx  : function(){ return this.owner.board.getx(this.bx, this.by);},
	getb  : function(){ return this.owner.board.getb(this.bx, this.by);},
	getex : function(){ return this.owner.board.getex(this.bx, this.by);},
	
	//---------------------------------------------------------------------------
	// pos.setCrossBorderError() ある交点とその周り四方向にエラーフラグを設定する
	//---------------------------------------------------------------------------
	setCrossBorderError : function(){
		var bd = this.owner.board;
		if(bd.hascross!==0){ this.getx().seterr(1);}
		bd.borderinside(this.bx-1,this.by-1,this.bx+1,this.by+1).seterr(1);
	}
}
});
