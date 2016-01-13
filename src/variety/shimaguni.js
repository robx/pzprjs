//
// パズル固有スクリプト部 島国・チョコナ版 shimaguni.js
//
(function(pidlist, classbase){
	if(typeof pzpr!=='undefined'){ pzpr.classmgr.makeCustom(pidlist, classbase);}
	else{ module.exports = [pidlist, classbase];}
})
(['shimaguni','chocona'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,
	
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
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
	maxnum : function(){
		return Math.min(255, this.room.clist.length);
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

AreaShadeGraph:{
	enabled : true
},
AreaRoomGraph:{
	enabled : true,
	hastop : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub1",

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
"Graphic@shimaguni":{
	bcolor : "rgb(191, 191, 255)",
	bbcolor : "rgb(191, 191, 255)"
},
"Graphic@chocona":{
	bcolor_type : "GREEN"
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
"AnsCheck@shimaguni#1":{
	checklist : [
		"checkSideAreaShadeCell",
		"checkSeqBlocksInRoom",
		"checkShadeCellCount",
		"checkSideAreaLandSide",
		"checkNoShadeCellInArea"
	]
},
"AnsCheck@chocona#1":{
	checklist : [
		"checkShadeRect",
		"checkShadeCellCount"
	]
},
"AnsCheck@shimaguni":{
	checkSideAreaShadeCell : function(){
		this.checkSideAreaCell(function(cell1,cell2){ return (cell1.isShade() && cell2.isShade());}, true, "cbShade");
	},
	checkSideAreaLandSide : function(){
		this.checkSideAreaSize(function(area){ return area.clist.getLandAreaOfClist();}, "bsEqShade");
	},

	// 部屋の中限定で、黒マスがひとつながりかどうか判定する
	checkSeqBlocksInRoom : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist.filter(function(cell){ return cell.isShade();});
			if(clist.isSeqBlock()){ continue;}
			
			this.failcode.add("bkShadeDivide");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},
"AnsCheck@chocona":{
	checkShadeRect : function(){
		this.checkAllArea(this.board.sblkmgr, function(w,h,a,n){ return (w*h===a);}, "csNotRect");
	}
},

"FailCode@shimaguni":{
	bkShadeNe     : ["海域内の数字と国のマス数が一致していません。","The number of shaded cells is not equals to the number."],
	bkShadeDivide : ["1つの海域に入る国が2つ以上に分裂しています。","Countries in one marine area are devided to plural ones."],
	bkNoShade     : ["黒マスのカタマリがない海域があります。","A marine area has no shaded cells."],
	cbShade       : ["異なる海域にある国どうしが辺を共有しています。","Countries in other marine area share the side over border line."],
	bsEqShade     : ["隣り合う海域にある国の大きさが同じです。","The size of countries that there are in adjacent marine areas are the same."]
},

"FailCode@chocona":{
	csNotRect : ["黒マスのカタマリが正方形か長方形ではありません。","A mass of shaded cells is not rectangle."],
	bkShadeNe : ["数字のある領域と、領域の中にある黒マスの数が違います。","The number of shaded cells in the area and the number written in the area is different."]
}
});
