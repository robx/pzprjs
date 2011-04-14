//
// パズル固有スクリプト部 なわばり版 nawabari.js v3.4.0
//
pzprv3.custom.nawabari = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.dispzero        = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;

		this.floatbgcolor = "rgb(127, 127, 255)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyPopup:{
	paneltype  : 1,
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	maxnum : 4,

	getdir4Border : function(cc){
		var cnt=0, bx=this.cell[cc].bx, by=this.cell[cc].by;
		if( by===this.minby+1 || this.isBorder(this.bnum(bx  ,by-1)) ){ cnt++;}
		if( by===this.maxby-1 || this.isBorder(this.bnum(bx  ,by+1)) ){ cnt++;}
		if( bx===this.minbx+1 || this.isBorder(this.bnum(bx-1,by  )) ){ cnt++;}
		if( bx===this.maxby-1 || this.isBorder(this.bnum(bx+1,by  )) ){ cnt++;}
		return cnt;
	}
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
		if( !this.checkAreaRect(rinfo) ){
			this.setAlert('部屋の形が長方形ではありません。','There is not rectangle territory.'); return false;
		}

		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('数字の入っていない部屋があります。','A territory has no numbers.'); return false;
		}

		if( !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つの部屋に2つ以上の数字が入っています。','A territory has plural numbers.'); return false;
		}

		if( !this.checkdir4BorderAns() ){
			this.setAlert('数字の周りにある境界線の本数が違います。','The number is not equal to the number of border lines around it.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
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
