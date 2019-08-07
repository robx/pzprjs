//
// パズル固有スクリプト部 連番窓口版 renban.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['renban'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','number','clear'],play:['number','clear']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
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
Cell:{
	enableSubNumberArray : true
},
Board:{
	cols : 6,
	rows : 6,

	hasborder : 1,

	// 正答判定用
	getBorderLengthInfo : function(){
		var rdata = new this.klass.BorderInfo();
		for(var i=0;i<this.border.length;i++){ rdata.id[i] = (this.border[i].isBorder()?0:null);}
		for(var i=0;i<this.border.length;i++){
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

AreaRoomGraph:{
	enabled : true
},

BorderInfo:{
	initialize : function(){
		this.max  = 0;	// 最大の部屋番号(1〜maxまで存在するよう構成してください)
		this.id   = [];	// 各セル/線などが属する部屋番号を保持する
		this.path = [];	// 各部屋のidlist等の情報を保持する(info.path[id].blistで取得)
	},

	//---------------------------------------------------------------------------
	// info.addPath() 空のPathを追加する
	//---------------------------------------------------------------------------
	addPath : function(){
		var pathid = ++this.max;
		return (this.path[pathid] = {blist:(new this.klass.BorderList()), id:pathid});
	}
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
	},

	getBorderColor : function(border){
		if(border.ques===1){
			return (border.error===1 ? this.errcolor1 : this.quescolor);
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
		"checkDifferentNumberInRoom",
		"checkNumbersInRoom",
		"checkBorderSideNumber",
		"checkNoNumCell+"
	],

	checkNumbersInRoom : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist;
			if(clist.length<=1){ continue;}
			var max=-1, min=clist[0].getmaxnum(), breakflag=false;
			for(var i=0,len=clist.length;i<len;i++){
				var val = clist[i].getNum();
				if(val===-1 || val===-2){ breakflag=true; break;}
				if(max<val){ max=val;}
				if(min>val){ min=val;}
			}
			if(breakflag){ break;}

			if(clist.length === (max-min)+1){ continue;}

			this.failcode.add("bkNotSeqNum");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},

	checkBorderSideNumber : function(){
		var bd = this.board;
		// 線の長さを取得する
		var rdata = bd.getBorderLengthInfo();

		// 実際に差を調査する
		for(var i=0;i<bd.border.length;i++){
			if(rdata.id[i]===null){ continue;}
			var border = bd.border[i], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			var val1=cell1.getNum(), val2=cell2.getNum();
			if(val1<=0 || val2<=0){ continue;}

			var blist = rdata.path[rdata.id[i]].blist;
			if(Math.abs(val1-val2)===blist.length){ continue;}

			this.failcode.add("cbDiffLenNe");
			if(this.checkOnly){ break;}
			cell1.seterr(1);
			cell2.seterr(1);
			blist.seterr(1);
		}
	}
},

FailCode:{
	bkDupNum : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	bkNotSeqNum : ["部屋に入る数字が正しくありません。","The numbers in the room are wrong."],
	cbDiffLenNe : ["数字の差がその間にある線の長さと等しくありません。","The differnece between two numbers is not equal to the length of the line between them."]
}
}));
