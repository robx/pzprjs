//
// パズル固有スクリプト部 ボーダーブロック版 bdblock.js v3.4.0
//
pzpr.createCustoms('bdblock', {
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
			if     (this.mousestart){ this.inputcrossMark();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
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
Board:{
	iscross  : 2,
	isborder : 1
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.setBorderColorFunc('qans');
		this.gridcolor = this.gridcolor_DLIGHT;
		this.borderQanscolor = "black";
		this.crosssize = 0.15;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawNumbers();
		this.drawCrossMarks();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeCrossMark();
		this.outbstr = this.outbstr.substr(1); // /を消しておく
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeCrossMark();
		this.outbstr += "/";
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCrossNum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCrossNum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkBorderCount(3,2) ){ return 'bdBranchExBP';}
		if( !this.checkBorderCount(4,2) ){ return 'bdCrossExBP';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){ return 'bkNoNum';}
		if( !this.checkDiffNumberInBlock(rinfo) ){ return 'bkPlNum';}
		if( !this.checkGatheredObject(rinfo) ){ return 'bkSepNum';}

		if( !this.checkBorderCount(1,0) ){ return 'bdDeadEnd';}
		if( !this.checkBorderCount(2,1) ){ return 'bdCountLt3BP';}
		if( !this.checkBorderCount(0,1) ){ return 'bdIgnoreBP';}

		return null;
	},

	checkDiffNumberInBlock : function(rinfo){
		return this.checkSameObjectInRoom(rinfo, function(cell){ return cell.getNum();});
	},

	// 同じ値であれば、同じ部屋に存在することを判定する
	checkGatheredObject : function(rinfo){
		var d=[], dmax=0, val=[], bd=this.owner.board;
		for(var c=0;c<bd.cellmax;c++){ val[c]=bd.cell[c].getNum(); if(dmax<val[c]){ dmax=val[c];} }
		for(var i=0;i<=dmax;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(val[c]===-1){ continue;}
			if(d[val[c]]===-1){ d[val[c]] = rinfo.id[c];}
			else if(d[val[c]]!==rinfo.id[c]){
				bd.cell.filter(function(cell){ return (rinfo.id[c]===rinfo.id[cell.id] || d[val[c]]===rinfo.id[cell.id]);}).seterr(1);
				return false;
			}
		}
		return true;
	}
},

FailCode:{
	bdBranchExBP : ["黒点以外のところで線が分岐しています。","Lines are branched out of the black point."],
	bdCrossExBP  : ["黒点以外のところで線が交差しています。","Lines are crossed out of the black point."],
	bdCountLt3BP : ["黒点から線が３本以上出ていません。","A black point has two or less lines."],
	bdIgnoreBP   : ["黒点上を線が通過していません。","A black point has no line."]
}
});
