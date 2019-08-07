//
// パズル固有スクリプト部 波及効果・コージュン版 ripple.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['ripple','cojun','meander'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','number','clear'],play:['number','clear']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || (this.mousemove && this.btn==='left')){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	}
},
"MouseEvent@meander":{
	inputModes : {edit:['border','number','clear'],play:['number','dragnum+','dragnum-','clear']},
	mouseinput : function(){
		if(this.inputMode.indexOf('dragnum')===0){
			this.dragnumber_meander();
		}
		else{ this.common.mouseinput.call(this);}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				this.dragnumber_meander();
			}
			if(this.mouseend && this.notInputted()){
				this.inputqnum_meander();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || (this.mousemove && this.btn==='left')){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	},

	dragnumber_meander : function(){
		var cell = this.getcell();
		if(cell.isnull||cell===this.mouseCell){ return;}
		if(this.mouseCell.isnull){
			if(cell.isNum()){ this.inputData = cell.getNum();}
			this.mouseCell = cell;
			return;
		}
		else if(cell.room!==this.mouseCell.room){
			this.inputData = 0;
			this.mouseCell = cell;
			return;
		}
		else if(cell.qnum!==-1){
			this.inputData = cell.qnum;
			this.mouseCell = cell;
			return;
		}
		if(this.inputData>=1 && this.inputData<=cell.room.nodes.length){
			if(this.inputMode==='dragnum+' || (this.inputMode==='auto' && this.btn==='left')){ this.inputData++;}
			else{ this.inputData--;}
			if(this.inputData>=1 && this.inputData<=cell.room.nodes.length){
				cell.clrSnum();
				cell.setQdir(0);
				cell.setAnum(this.inputData);
				cell.setQsub(0);
			}
			else if(this.inputData>cell.room.nodes.length){ this.inputData=0; return;}
		}
		else{ return;}

		this.mouseCell = cell;
		cell.draw();
	},

	inputqnum_meander : function(){
		var cell = this.getcell();
		if(!cell.isnull){
			this.mouseCell = this.board.emptycell;
			this.inputqnum();
		}
	}

},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	enableSubNumberArray : true,
	maxnum : function(){
		return this.room.clist.length;
	}
},
Board:{
	hasborder : 1
},
"Board@cojun":{
	cols : 8,
	rows : 8
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawTargetSubNumber();
		this.drawGrid();

		this.drawSubNumbers();
		this.drawAnsNumbers();
		this.drawQuesNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
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
	},

	decodeKanpen : function(){
		this.fio.decodeAreaRoom();
		this.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.fio.encodeAreaRoom();
		this.fio.encodeCellQnum_kanpen();
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
	},

	kanpenOpen : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();
	},
	kanpenSave : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	},

	kanpenOpenXML : function(){
		this.decodeAreaRoom_XMLBoard();
		this.decodeCellQnum_XMLBoard();
		this.decodeCellAnum_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeAreaRoom_XMLBoard();
		this.encodeCellQnum_XMLBoard();
		this.encodeCellAnum_XMLAnswer();
	},

	UNDECIDED_NUM_XML : 0
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkDifferentNumberInRoom",
		"checkRippleNumber@ripple",
		"checkAdjacentDiffNumber@cojun",
		"checkUpperNumber@cojun",
		"checkAdjacentNumbers@meander",
		"checkConsecutiveNeighbors@meander",
		"checkNoNumCell+"
	],

	checkRippleNumber : function(){
		var result = true, bd = this.board;
		allloop:
		for(var c=0;c<bd.cell.length;c++){
			var cell=bd.cell[c], num=cell.getNum(), bx=cell.bx, by=cell.by;
			if(num<=0){ continue;}
			for(var i=2;i<=num*2;i+=2){
				var cell2 = bd.getc(bx+i,by);
				if(!cell2.isnull && cell2.getNum()===num){
					result = false;
					if(this.checkOnly){ break allloop;}
					cell.seterr(1);
					cell2.seterr(1);
				}
			}
			for(var i=2;i<=num*2;i+=2){
				var cell2 = bd.getc(bx,by+i);
				if(!cell2.isnull && cell2.getNum()===num){
					result = false;
					if(this.checkOnly){ break allloop;}
					cell.seterr(1);
					cell2.seterr(1);
				}
			}
		}
		if(!result){ this.failcode.add("nmSmallGap");}
	},

	checkUpperNumber : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length-bd.cols;c++){
			var cell=bd.cell[c], cell2=cell.adjacent.bottom;
			if(cell.room!==cell2.room || !cell.isNum() || !cell2.isNum()){ continue;}
			if(cell.getNum()>=cell2.getNum()){ continue;}

			this.failcode.add("bkSmallOnBig");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			cell2.seterr(1);
		}
	},

	checkAdjacentNumbers : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!cell.isNum()){ continue;}
			var bx = cell.bx, by = cell.by;
			var clist=new this.klass.CellList(), clist0 = bd.cellinside(bx,by,bx+2,by+2);
			clist.add(cell);
			clist0.add(bd.getc(bx-2,by+2));
			for(var i=0;i<clist0.length;i++){
				var cell2 = clist0[i];
				if(cell!==cell2 && cell2.isNum() && cell.getNum()===cell2.getNum()){ clist.add(cell2);}
			}
			if(clist.length<=1){ continue;}

			this.failcode.add("nmAround");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},

	checkConsecutiveNeighbors : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell=bd.cell[c];
			if(!cell.isNum()){ continue;}
			var num=cell.getNum();
			var size=cell.room.nodes.length;
			if(num>1&&cell.countDir4Cell(function(cell2){ return cell2.isNum()&&cell.room===cell2.room&&cell2.getNum()===num-1;})<=0 ||
				num<size&&cell.countDir4Cell(function(cell2){ return cell2.isNum()&&cell.room===cell2.room&&cell2.getNum()===num+1;})<=0){
				this.failcode.add("nmNotConsecNeighbors");
				if(this.checkOnly){ break;}
				cell.seterr(1);
			}
		}
	}
},

FailCode:{
	bkDupNum   : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	bkSmallOnBig : ["同じ部屋で上に小さい数字が乗っています。","There is a smaller number on top of a bigger number in a room."],
	nmSmallGap : ["数字よりもその間隔が短いところがあります。","The distance between two equal numbers is smaller than the number."],
	nmAround : ["同じ数字がタテヨコナナメに隣接しています。","Equal numbers are adjacent."],
	nmNotConsecNeighbors : ["連続する数字がタテヨコに隣り合っていません。","A number is not the neighbor of its consecutive numbers."]
}
}));
