//
// パズル固有スクリプト部 はこいり○△□版 hakoiri.js v3.4.0
//
pzprv3.createCustoms('hakoiri', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart){ this.inputqnum();}
			}
			else if(this.btn.Right){
				if(this.mousemove){ this.inputDot();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
			}
		}
		
		if(this.mouseend && this.notInputted()){
			this.mouseCell = this.owner.board.emptycell;
			this.inputqnum();
		}
	},

	inputDot : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.getQnum()!==-1){ return;}

		if(this.inputData===null){ this.inputData=(cell.getQsub()===1?0:1);}

		cell.setAnum(-1);
		cell.setQsub(this.inputData===1?1:0);
		this.mouseCell = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		this.key_hakoiri(ca);
	},
	key_hakoiri : function(ca){
		if     (ca==='1'||ca==='q'||ca==='a'||ca==='z'){ ca='1';}
		else if(ca==='2'||ca==='w'||ca==='s'||ca==='x'){ ca='2';}
		else if(ca==='3'||ca==='e'||ca==='d'||ca==='c'){ ca='3';}
		else if(ca==='4'||ca==='r'||ca==='f'||ca==='v'){ ca='s1';}
		else if(ca==='5'||ca==='t'||ca==='g'||ca==='b'){ ca=' ';}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberAsObject : true,

	maxnum : 3
},
Board:{
	isborder : 1
},

AreaNumberManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.bcolor = this.bcolor_GREEN;
		this.bbcolor = "rgb(127, 127, 127)";
		this.dotcolor = this.dotcolor_PINK;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBorders();

		this.drawDotCells(true);
		this.drawQnumMarks();
		this.drawHatenas();

		this.drawChassis();

		this.drawCursor();
	},

	drawQnumMarks : function(){
		var g = this.vinc('cell_mark', 'auto');

		var rsize = this.cw*0.30, tsize=this.cw*0.26;
		var lampcolor = "rgb(0, 127, 96)";
		var headers = ["c_mk1_", "c_mk2_", "c_mk3_"];
		g.lineWidth = 2;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id, num=cell.getNum();
			this.vhide([headers[0]+id, headers[1]+id, headers[2]+id]);
			if(num<=0){ continue;}

			g.strokeStyle = this.getCellNumberColor(cell);
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			if(this.vnop(headers[(num-1)]+id,this.STROKE)){
				switch(num){
				case 1:
					g.strokeCircle(px, py, rsize);
					break;
				case 2:
					g.setOffsetLinePath(px, py, 0,-tsize, -rsize,tsize, rsize,tsize, true);
					g.stroke();
					break;
				case 3:
					g.strokeRect(px-rsize, py-rsize, 2*rsize, 2*rsize);
					break;
				}
			}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkAroundMarks() ){ return 60211;}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkOverFourMarksInBox(rinfo) ){ return 31013;}
		if( !this.checkDiffMarkInBox(rinfo) ){ return 30423;}

		var numinfo = this.owner.board.getNumberInfo();
		if( !this.checkOneArea(numinfo) ){ return 10010;}

		if( !this.checkAllMarkInBox(rinfo) ){ return 31014;}

		return 0;
	},

	checkOverFourMarksInBox : function(rinfo){
		return this.checkAllBlock(rinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a<=3);});
	},
	checkDiffMarkInBox : function(rinfo){
		return this.checkDifferentNumberInRoom(rinfo, function(cell){ return cell.getNum();});
	},
	checkAllMarkInBox : function(rinfo){
		return this.checkAllBlock(rinfo, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a>=3);});
	},

	checkAroundMarks : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], num = cell.getNum();
			if(num<0){ continue;}
			var bx = cell.bx, by = cell.by, target=0, clist=this.owner.newInstance('CellList');
			var func = function(cell){ return (!cell.isnull && num===cell.getNum());};
			// 右・左下・下・右下だけチェック
			clist.add(cell);
			target = cell.relcell( 2,0); if(func(target)){ clist.add(target);}
			target = cell.relcell( 0,2); if(func(target)){ clist.add(target);}
			target = cell.relcell(-2,2); if(func(target)){ clist.add(target);}
			target = cell.relcell( 2,2); if(func(target)){ clist.add(target);}

			if(clist.length>1){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
