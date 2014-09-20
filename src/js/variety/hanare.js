//
// パズル固有スクリプト部 はなれ組版 hanare.js v3.4.1
//
pzpr.classmgr.makeCustom(['hanare'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart){ this.inputqnum_hanare();}
				else if(this.mousemove){ this.inputDot();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputDot();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum_hanare();
			}
		}
	},

	inputqnum_hanare : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		var result = cell.setNum_hanare(1);
		if(result!==null){
			this.inputData = (result===-1?0:1);
			this.mouseCell = cell;
			cell.draw();
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
// 盤面管理系
Cell:{
	setNum_hanare : function(val){
		if(val>=0){
			var o=this.owner, rooms=o.board.rooms;
			val = rooms.getCntOfRoomByCell(this);
			if(val>this.maxnum){ return null;}

			var clist = rooms.getClistByCell(this), cell2=null;
			for(var i=0;i<clist.length;i++){
				if(clist[i].isNum()){ cell2=clist[i]; break;}
			}
			if(this===cell2){ val=(o.playmode?-2:-1);}
			else if(cell2!==null){
				if(o.playmode && cell2.qnum!==-1){ return null;}
				cell2.setNum(o.playmode?-2:-1);
				cell2.draw();
			}
			else{ /* c2===null */
				if(this.qsub===1){ val=-1;}
			}
		}
		this.setNum(val);
		return val;
	}
},
Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 1
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",
	dotcolor_type : "PINK",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawDotCells(true);
		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorderQues();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeBorderQues();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkDoubleNumber(rinfo) ){ return 'bkNumGe2';}

		if( !this.checkAnsNumberAndSize(rinfo) ){ return 'bkSizeNe';}

		if( !this.checkDiffNumber() ){ return 'nmDiffDistNe';}

		if( !this.checkNoNumber(rinfo) ){ return 'bkNoNum';}

		return null;
	},

	checkDiffNumber : function(){
		function eachcell(cell2){
			distance++;
			if(!cell2.isNum()){ /* nop */ }
			else if(!cell2.isValidNum(cell2)){ c=null;}
			else{
				if(cell!==null){
					if(Math.abs(num-cell2.getNum())!==distance){
						if(this.checkOnly){ return false;}
						cell.seterr(1);
						cell2.seterr(1)
						result = false;
					}
				}
				cell=cell2;
				num=cell2.getNum();
				distance=-1;
			}
		}

		var result = true, bd = this.owner.board;
		for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
			var cell=null, num, distance;
			for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
				eachcell(bd.getc(bx,by));
			}
		}
		for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
			var cell=null, num, distance;
			for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
				eachcell(bd.getc(bx,by));
			}
		}
		return result;
	},

	checkAnsNumberAndSize : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist, num = -1;
			for(var i=0;i<clist.length;i++){ if(clist[i].isNum()){ num=clist[i].getNum(); break;}}

			if( num!==-1 && num!==clist.length ){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkNoNum  : ["数字の入っていない部屋があります。","A room has no numbers."],
	bkNumGe2 : ["1つの部屋に2つ以上の数字が入っています。","A room has plural numbers."],
	bkSizeNe : ["数字と部屋の大きさが違います。","The size of the room is not equal to the number."],
	nmDiffDistNe : ["２つの数字の差とその間隔が正しくありません。","The distance of the paired numbers is not equal to the diff of them."]
}
});
