//
// パズル固有スクリプト部 島国・チョコナ版 shimaguni.js v3.4.1
//
pzpr.classmgr.makeCustom(['shimaguni','chocona'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
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
Cell:{
	nummaxfunc : function(){
		return Math.min(this.maxnum, this.owner.board.rooms.getCntOfRoomByCell(this));
	}
},
"Cell@chocona":{
	minnum : 0
},

Board:{
	hasborder : 1
},

CellList:{
	getLandAreaOfClist : function(){
		var cnt = 0;
		for(var i=0,len=this.length;i<len;i++){
			if(this[i].isShade()){ cnt++;}
		}
		return cnt;
	},

	isSeqBlock : function(){
		var stack=(this.length>0?[this[0]]:[]), count=this.length, passed={};
		for(var i=0;i<count;i++){ passed[this[i].id]=0;}
		while(stack.length>0){
			var cell=stack.pop();
			if(passed[cell.id]===1){ continue;}
			count--;
			passed[cell.id]=1;
			var list = cell.getdir4clist();
			for(var i=0;i<list.length;i++){
				if(passed[list[i][0].id]===0){ stack.push(list[i][0]);}
			}
		}
		return (count===0);
	}
},

AreaShadeManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true,
	hastop : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		if(this.owner.pid==='shimaguni'){
			this.bcolor = "rgb(191, 191, 255)";
			this.bbcolor = "rgb(191, 191, 255)";
		}
		else if(this.owner.pid==='chocona'){
			this.bcolor = this.bcolor_GREEN;
		}
		this.gridcolor = this.gridcolor_LIGHT;
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();

		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(false);

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
"AnsCheck@shimaguni":{
	checkAns : function(){

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkSideAreaShadeCell(rinfo) ){ return 'scShade';}

		if( !this.checkSeqBlocksInRoom() ){ return 'bkShadeDivide';}

		if( !this.checkShadeCellCount(rinfo) ){ return 'bkShadeNe';}

		if( !this.checkSideAreaLandSide(rinfo) ){ return 'sbEqShade';}

		if( !this.checkNoShadeCellInArea(rinfo) ){ return 'bkNoShade';}

		return null;
	},

	checkSideAreaShadeCell : function(rinfo){
		return this.checkSideAreaCell(rinfo, function(cell1,cell2){ return (cell1.isShade() && cell2.isShade());}, true);
	},
	checkSideAreaLandSide : function(rinfo){
		return this.checkSideAreaSize(rinfo, function(room){ return room.clist.getLandAreaOfClist();});
	},

	// 部屋の中限定で、黒マスがひとつながりかどうか判定する
	checkSeqBlocksInRoom : function(){
		var result = true;
		for(var r=1;r<=this.owner.board.rooms.max;r++){
			var clist = this.owner.board.rooms.getClist(r).filter(function(cell){ return cell.isShade()});
			if(!clist.isSeqBlock()){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},
"AnsCheck@chocona":{
	checkAns : function(){

		var binfo = this.owner.board.getShadeInfo();
		if( !this.checkAreaRect(binfo) ){ return 'csNotRect';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkShadeCellCount(rinfo) ){ return 'bkShadeNe';}

		return null;
	}
},

"FailCode@shimaguni":{
	bkShadeNe     : ["海域内の数字と国のマス数が一致していません。","the number of shaded cells is not equals to the number."],
	bkShadeDivide : ["1つの海域に入る国が2つ以上に分裂しています。","Countries in one marine area are devided to plural ones."],
	bkNoShade     : ["黒マスのカタマリがない海域があります。","A marine area has no shaded cells."],
	scShade       : ["異なる海域にある国どうしが辺を共有しています。","Countries in other marine area share the side over border line."],
	sbEqShade     : ["隣り合う海域にある国の大きさが同じです。","the size of countries that there are in adjacent marine areas are the same."]
},

"FailCode@chocona":{
	csNotRect : ["黒マスのカタマリが正方形か長方形ではありません。","A mass of shaded cells is not rectangle."],
	bkShadeNe : ["数字のある領域と、領域の中にある黒マスの数が違います。","the number of shaded cells in the area and the number written in the area is different."]
}
});
