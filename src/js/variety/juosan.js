//
// パズル固有スクリプト部 縦横さん版 juosan.js v3.4.4
//
pzpr.classmgr.makeCustom(['juosan'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if     (this.mousestart || this.mousemove)  { this.inputTateyoko();}
			else if(this.mouseend && this.notInputted()){ this.clickTateyoko();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	clickTateyoko : function(){
		var cell  = this.getcell();
		if(cell.isnull){ return;}

		cell.setQans((this.btn.Left?{0:12,12:13,13:0}:{0:13,12:0,13:12})[cell.getQans()]);
		cell.draw();
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
Board:{
	hasborder : 1
},

BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			var tans = {0:0,12:13,13:12};
			var clist = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans(tans[cell.getQans()]);
			}
		}
	}
},

AreaRoomManager:{
	enabled : true,
	hastop : true
},

Flags:{
	disable_subclear : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",
	linecolor_type : "LIGHT",
	errbcolor1_type : "DARK",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawTateyokos()

		this.drawNumbers();
		this.drawMBs();
		this.drawBorders();

		this.drawChassis();

		this.drawTarget();
	},

	//オーバーライド
	drawNumber1 : function(cell){
		var px = cell.bx*this.bw, py = cell.by*this.bh;
		var text = (cell.qnum!==-1 ? (cell.qnum>=0 ? ""+cell.qnum : "?") : "");
		var option = { key:"cell_text_"+cell.id };
		option.ratio = [0.45];
		option.position = this.TOPLEFT;
		this.disptext(text, px, py, option);
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
		this.decodeCellBar();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellBar();
	},
	
	decodeCellBar : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="1"){ obj.qans = 12;}
			else if(ca==="2"){ obj.qans = 13;}
		});
	},
	encodeCellBar : function(){
		this.encodeCell( function(obj){
			if(obj.ques!==1){
				if     (obj.qans===0) { return "0 ";}
				else if(obj.qans===12){ return "1 ";}
				else if(obj.qans===13){ return "2 ";}
			}
			return ". ";
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var bd = this.owner.board;

		bd.cell.seterr(-1);
		if( !this.checkParallelBarCount() ){ return 'baParaGe3';}

		var rinfo = bd.getRoomInfo();
		if( !this.checkMajorityBarCount(rinfo, true) ) { return 'bkMajorBarGt';}
		if( !this.checkMajorityBarCount(rinfo, false) ){ return 'bkMajorBarLt';}
		bd.cell.seterr(0);

		if( !this.checkEmptyCell() ){ return 'ceEmpty';}

		return null;
	},
	check1st : function(){
		return (this.checkEmptyCell() ? null : 'ceEmpty');
	},

	checkParallelBarCount : function(){
		return this.checkRowsColsPartly2(this.isParallelCount, function(cell){ return cell.qans;}, true);
	},
	checkRowsColsPartly2 : function(evalfunc, categoryfunc, multierr){
		var result = true, bd = this.owner.board;
		for(var by=1;by<=bd.maxby;by+=2){
			for(var bx=1;bx<=bd.maxbx;bx+=2){
				var val = categoryfunc(bd.getc(bx,by)), tx = bx;
				while((tx+2<bd.maxbx) && (categoryfunc(bd.getc(tx+2,by))===val)){ tx+=2;}
				if(!evalfunc.call(this, [bx,by,false], bd.cellinside(bx,by,tx,by))){
					if(!multierr || this.checkOnly){ return false;}
					result = false;
				}
				bx = tx; /* 次のループはbx=tx+2 */
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			for(var by=1;by<=bd.maxby;by+=2){
				var val = categoryfunc(bd.getc(bx,by)), ty = by;
				while((ty+2<bd.maxby) && (categoryfunc(bd.getc(bx,ty+2))===val)){ ty+=2;}
				if(!evalfunc.call(this, [bx,by,true], bd.cellinside(bx,by,bx,ty))){
					if(!multierr || this.checkOnly){ return false;}
					result = false;
				}
				by = ty; /* 次のループはbx=ty+2 */
			}
		}
		return result;
	},
	isParallelCount : function(keycellpos, clist){
		var cell0 = clist[0], isvert = keycellpos[2];
		if     (cell0.qans===0)            { return true;}
		else if(cell0.qans===12 &&  isvert){ return true;}
		else if(cell0.qans===13 && !isvert){ return true;}
		else if(clist.length>=3){ clist.seterr(4); return false;}
		return true;
	},

	checkMajorityBarCount : function(rinfo, isover){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			var area = rinfo.area[id];
			if(!area.top.isValidNum()){ continue;}
			var clist = area.clist, vcount=0, hcount=0, count=0;
			for(var i=0;i<clist.length;i++){
				if     (clist[i].qans===12){ vcount++;}
				else if(clist[i].qans===13){ hcount++;}
			}
			count = (vcount>hcount ? vcount : hcount);
			if((area.top.qnum!==count) && (isover===(count>area.top.qnum))){
				if(this.checkOnly){ return false;}
				if     (vcount>hcount){ clist = clist.filter(function(cell){ return cell.qans===12;});}
				else if(vcount<hcount){ clist = clist.filter(function(cell){ return cell.qans===13;});}
				clist.seterr(4);
				result = false;
			}
		}
		return result;
	},
	
	checkEmptyCell : function(){
		return this.checkAllCell(function(cell){ return (cell.qans===0);});
	}
},

FailCode:{
	baParaGe3 : ["縦棒か横棒が3マス以上並んでいます。","There are at least there vertical or horizonal bars in parallel."],
	bkMajorBarGt : ["縦棒か横棒の多い方の数が部屋の数字より多いです。","The number of majority of vartial or horizonal bars is grater than the number of the area."],
	bkMajorBarLt : ["縦棒か横棒の多い方の数が部屋の数字より少ないです。","The number of majority of vartial or horizonal bars is less than the number of the area."]
}
});
