//
// パズル固有スクリプト部 島国・チョコナ版 shimaguni.js v3.4.0
//
pzprv3.createCustoms('shimaguni', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputborder();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return Math.min(this.maxnum, bd.rooms.getCntOfRoomByCell(this));
	}
},
"Cell@chocona":{
	minnum : 0
},

Board:{
	isborder : 1
},

CellList:{
	getLandAreaOfClist : function(){
		var cnt = 0;
		for(var i=0,len=this.length;i<len;i++){
			if(this[i].isBlack()){ cnt++;}
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

AreaBlackManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true,
	hastop : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
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
		this.drawBlackCells();

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
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	pzlexport : function(type){
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

		var rinfo = bd.getRoomInfo();
		if( !this.checkSideAreaCell(rinfo, function(cell1,cell2){ return (cell1.isBlack() && cell2.isBlack());}, true) ){
			this.setAlert('異なる海域にある国どうしが辺を共有しています。','Countries in other marine area share the side over border line.'); return false;
		}

		if( !this.checkSeqBlocksInRoom() ){
			this.setAlert('1つの海域に入る国が2つ以上に分裂しています。','Countries in one marine area are devided to plural ones.'); return false;
		}

		if( !this.checkBlackCellCount(rinfo) ){
			this.setAlert('海域内の数字と国のマス数が一致していません。','The number of black cells is not equals to the number.'); return false;
		}

		if( !this.checkSideAreaSize(rinfo, function(rinfo,r){ return rinfo.getclist(r).getLandAreaOfClist();}) ){
			this.setAlert('隣り合う海域にある国の大きさが同じです。','The size of countries that there are in adjacent marine areas are the same.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
			this.setAlert('黒マスのカタマリがない海域があります。','A marine area has no black cells.'); return false;
		}

		return true;
	},

	// 部屋の中限定で、黒マスがひとつながりかどうか判定する
	checkSeqBlocksInRoom : function(){
		var result = true;
		for(var r=1;r<=bd.rooms.max;r++){
			var clist = bd.rooms.getClist(r).filter(function(cell){ return cell.isBlack()});
			if(!clist.isSeqBlock()){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},
"AnsCheck@chocona":{
	checkAns : function(){

		if( !this.checkAreaRect(bd.getBCellInfo()) ){
			this.setAlert('黒マスのカタマリが正方形か長方形ではありません。','A mass of black cells is not rectangle.'); return false;
		}

		if( !this.checkBlackCellCount( bd.getRoomInfo() ) ){
			this.setAlert('数字のある領域と、領域の中にある黒マスの数が違います。','The number of Black cells in the area and the number written in the area is different.'); return false;
		}

		return true;
	}
}
});
