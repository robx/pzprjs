//
// パズル固有スクリプト部 フィルマット・ウソタタミ版 fillmat.js v3.4.0
//
pzpr.createCustoms('fillmat', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left){
					if(this.mousestart){ this.checkBorderMode();}

					if(this.bordermode){ this.inputborder();}
					else               { this.inputQsubLine();}
				}
				else if(this.btn.Right){ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
"Cell@fillmat":{
	maxnum : 4
},

Board:{
	isborder : 1
},
"Board@usotatami":{
	qcols : 8,
	qrows : 8
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

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
	decodePzpr : function(type){
		this.decodeNumber10();
	},
	encodePzpr : function(type){
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
"AnsCheck@fillmat":{
	checkAns : function(){

		if( !this.checkBorderCount(4,0) ){ return 32301;}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkSideAreaRoomSize(rinfo) ){ return 30221;}
		if( !this.checkTatamiMaxSize(rinfo) ){ return 10032;}
		if( !this.checkDoubleNumber(rinfo) ){ return 30013;}
		if( !this.checkNumberAndSize(rinfo) ){ return 30023;}

		if( !this.checkBorderCount(1,0) ){ return 32101;}

		return 0;
	},

	checkTatamiMaxSize : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (w===1||h===1)&&a<=4;});
	},
	checkSideAreaRoomSize : function(rinfo){
		return this.checkSideAreaSize(rinfo, function(room){ return room.clist.length;});
	}
},
"AnsCheck@usotatami":{
	checkAns : function(){

		if( !this.checkBorderCount(4,0) ){ return 32301;}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){ return 30005;}
		if( !this.checkDoubleNumber(rinfo) ){ return 30013;}
		if( !this.checkTatamiDiffSize(rinfo) ){ return 30034;}

		if( !this.checkBorderCount(1,0) ){ return 32101;}

		if( !this.checkTatamiBreadth(rinfo) ){ return 30001;}

		return 0;
	},

	checkTatamiDiffSize : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0||n!==a);});
	},
	checkTatamiBreadth : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (w===1||h===1);});
	}
}
});
