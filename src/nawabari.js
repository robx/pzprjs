//
// パズル固有スクリプト部 なわばり・フォーセルズ版 nawabari.js v3.4.0
//
pzprv3.custom.nawabari = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 1
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	initialize : function(owner){
		this.SuperFunc.initialize.call(this, owner);
		if(owner.pid==='nawabari'){
			this.maxnum = 4;
			this.minnum = 0;
		}
		else if(owner.pid==='fourcells'){
			this.maxnum = 3;
		}
	},

	getdir4Border : function(cc){
		var cnt=0, pos=this.cell[cc].getaddr();
		if( pos.y===this.minby+1 || this.isBorder(this.ub(cc)) ){ cnt++;}
		if( pos.y===this.maxby-1 || this.isBorder(this.db(cc)) ){ cnt++;}
		if( pos.x===this.minbx+1 || this.isBorder(this.lb(cc)) ){ cnt++;}
		if( pos.x===this.maxby-1 || this.isBorder(this.rb(cc)) ){ cnt++;}
		return cnt;
	}
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBorderColorFunc('qans');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawNumbers();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = bd.areas.getRoomInfo();
		if( (this.owner.pid==='nawabari') && !this.checkAreaRect(rinfo) ){
			this.setAlert('部屋の形が長方形ではありません。','There is not rectangle territory.'); return false;
		}

		if( (this.owner.pid==='nawabari') && !this.checkNoNumber(rinfo) ){
			this.setAlert('数字の入っていない部屋があります。','A territory has no numbers.'); return false;
		}

		if( (this.owner.pid==='nawabari') && !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つの部屋に2つ以上の数字が入っています。','A territory has plural numbers.'); return false;
		}

		if( (this.owner.pid==='fourcells') && !this.checkAllArea(rinfo, function(w,h,a,n){ return (a>=4);} ) ){
			this.setAlert('サイズが4マスより小さいブロックがあります。','The size of block is smaller than four.'); return false;
		}

		if( !this.checkdir4BorderAns() ){
			this.setAlert('数字の周りにある境界線の本数が違います。','The number is not equal to the number of border lines around it.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( (this.owner.pid==='fourcells') && !this.checkAllArea(rinfo, function(w,h,a,n){ return (a<=4);} ) ){
			this.setAlert('サイズが4マスより大きいブロックがあります。','The size of block is larger than four.'); return false;
		}

		return true;
	},

	checkdir4BorderAns : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.isValidNum(c) && bd.getdir4Border(c)!=bd.QnC(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	}
}
};
