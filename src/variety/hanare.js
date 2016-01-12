//
// パズル固有スクリプト部 はなれ組版 hanare.js v3.4.1
//
pzpr.classmgr.makeCustom(['hanare'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart){ this.inputqnum_hanare();}
				else if(this.mousemove){ this.inputDot();}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputDot();}
			}
		}
		else if(this.puzzle.editmode){
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
		if(cell.isnull || cell===this.mouseCell || cell.qnum!==-1){ return;}

		if(this.inputData===null){ this.inputData=(cell.qsub===1?0:1);}

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
			var puzzle=this.puzzle;
			val = this.room.clist.length;
			if(val>this.getmaxnum()){ return null;}

			var clist = this.room.clist, cell2=null;
			for(var i=0;i<clist.length;i++){
				if(clist[i].isNum()){ cell2=clist[i]; break;}
			}
			if(this===cell2){ val=(puzzle.playmode?-2:-1);}
			else if(cell2!==null){
				if(puzzle.playmode && cell2.qnum!==-1){ return null;}
				cell2.setNum(puzzle.playmode?-2:-1);
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
	cols : 8,
	rows : 8,

	hasborder : 1
},

AreaRoomGraph:{
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
	checklist : [
		"checkDoubleNumber",
		"checkAnsNumberAndSize",
		"checkDiffNumber",
		"checkNoNumber"
	],

	checkDiffNumber : function(){
		var cell, num, distance;
		var result = true, bd = this.board;
		function eachcell(cell2){
			distance++;
			if(!cell2.isNum()){ /* nop */ }
			else if(!cell2.isValidNum(cell2)){ cell=null;}
			else{
				if(cell!==null && Math.abs(num-cell2.getNum())!==distance){
					this.failcode.add("nmDiffDistNe");
					result = false;
					cell.seterr(1);
					cell2.seterr(1);
				}
				cell=cell2;
				num=cell2.getNum();
				distance=-1;
			}
		}

		for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
			cell=null;
			for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
				eachcell.call(this, bd.getc(bx,by));
				if(!result && this.checkOnly){ return;}
			}
		}
		for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
			cell=null;
			for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
				eachcell.call(this, bd.getc(bx,by));
				if(!result && this.checkOnly){ return;}
			}
		}
	},

	checkAnsNumberAndSize : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist, num = -1;
			for(var i=0;i<clist.length;i++){ if(clist[i].isNum()){ num=clist[i].getNum(); break;}}

			if( num===-1 || num===clist.length ){ continue;}
			
			this.failcode.add("bkSizeNe");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},

FailCode:{
	bkNoNum  : ["数字の入っていない部屋があります。","A room has no numbers."],
	bkNumGe2 : ["1つの部屋に2つ以上の数字が入っています。","A room has plural numbers."],
	bkSizeNe : ["数字と部屋の大きさが違います。","The size of the room is not equal to the number."],
	nmDiffDistNe : ["２つの数字の差とその間隔が正しくありません。","The distance of the paired numbers is not equal to the diff of them."]
}
});
