//
// パズル固有スクリプト部 連番窓口版 renban.js v3.4.1
//
pzpr.classmgr.makeCustom(['renban'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputborder();}
				else if(this.btn.Right){ this.inputQsubLine();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
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
Board:{
	qcols : 6,
	qrows : 6,

	hasborder : 1,

	// 正答判定用
	getBorderLengthInfo : function(){
		var rdata = new this.owner.BorderInfo();
		for(var i=0;i<this.bdmax;i++){ rdata.id[i] = (this.border[i].isBorder()?0:null);}
		for(var i=0;i<this.bdmax;i++){
			var border0 = this.border[i];
			if(rdata.id[border0.id]!==0){ continue;}
			var path = rdata.addPath();
			var pos=border0.getaddr(), isvert=border0.isVert(), n=0;
			while(1){
				var border = pos.getb();
				if(border.isnull || rdata.id[border.id]!==0){ break;}

				path.blist[n++] = border;
				rdata.id[border.id] = path.id;

				if(isvert){ pos.move(0,2);}else{ pos.move(2,0);}
			}
			path.blist.length = n;
		}
		return rdata;
	}
},

AreaRoomManager:{
	enabled : true
},

"BorderInfo:LineInfo":{
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	borderQsubcolor : "black", /* borderQuescolor と同じ */

	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawNumbers();

		this.drawBorders();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawCursor();
	},

	getBorderColor : function(border){
		if(border.ques===1){
			return (border.error===1 ? this.errcolor1 : this.borderQuescolor);
		}
		return null;
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
		["checkOtherNumberInRoom", "bkDupNum"],
		["checkNumbersInRoom",     "bkNotSeqNum"],
		["checkBorderSideNumber",  "scDiffLenNe"],
		["checkNoNumCell",         "ceEmpty", "", 1]
	],

	checkNumbersInRoom : function(){
		var result = true;
		var rinfo = this.getRoomInfo();
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist;
			if(clist.length<=1){ continue;}
			var max=-1, min=clist[0].getmaxnum(), breakflag=false;
			for(var i=0,len=clist.length;i<len;i++){
				var val = clist[i].getNum();
				if(val===-1 || val===-2){ breakflag=true; break;}
				if(max<val){ max=val;}
				if(min>val){ min=val;}
			}
			if(breakflag){ break;}

			if(clist.length !== (max-min)+1){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkBorderSideNumber : function(){
		var result = true, bd = this.owner.board;
		// 線の長さを取得する
		var rdata = bd.getBorderLengthInfo();

		// 実際に差を調査する
		for(var i=0;i<bd.bdmax;i++){
			if(rdata.id[i]===null){ continue;}
			var border = bd.border[i], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			var val1=cell1.getNum(), val2=cell2.getNum();
			if(val1<=0 || val2<=0){ continue;}

			var blist = rdata.path[rdata.id[i]].blist;
			if(Math.abs(val1-val2)!==blist.length){
				if(this.checkOnly){ return false;}
				cell1.seterr(1);
				cell2.seterr(1);
				blist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkDupNum : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	bkNotSeqNum : ["部屋に入る数字が正しくありません。","The numbers in the room are wrong."],
	scDiffLenNe : ["数字の差がその間にある線の長さと等しくありません。","The differnece between two numbers is not equal to the length of the line between them."],
	ceEmpty : ["数字の入っていないマスがあります。","There is an empty cell."]
}
});
