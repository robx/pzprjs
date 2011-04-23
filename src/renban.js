//
// パズル固有スクリプト部 連番窓口版 renban.js v3.4.0
//
pzprv3.custom.renban = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			if     (this.btn.Left) { this.inputborder();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
		if(k.playmode){ this.inputqnum();}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(k.editmode){
			if     (this.btn.Left) { this.inputborder();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	enablemake_p : true,
	enableplay_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 6,
	qrows : 6,

	isborder : 1
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.borderQsubcolor = this.borderQuescolor;
	},
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
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	pzlexport : function(type){
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

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkDifferentNumberInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
		}

		if( !this.checkNumbersInRoom(rinfo) ){
			this.setAlert('部屋に入る数字が正しくありません。','The numbers in the room are wrong.'); return false;
		}

		if( !this.checkBorderSideNumber() ){
			this.setAlert('数字の差がその間にある線の長さと等しくありません。','The differnece between two numbers is not equal to the length of the line between them.'); return false;
		}

		if( !this.checkNoNumCell() ){
			this.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkNoNumCell();},

	checkNumbersInRoom : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var idlist = rinfo.room[r].idlist
			if(idlist.length<=1){ continue;}
			var max=-1, min=bd.maxnum, breakflag=false;
			for(var i=0,len=idlist.length;i<len;i++){
				var val=bd.getNum(idlist[i]);
				if(val===-1 || val===-2){ breakflag=true; break;}
				if(max<val){ max=val;}
				if(min>val){ min=val;}
			}
			if(breakflag){ break;}

			if(idlist.length !== (max-min)+1){
				if(this.inAutoCheck){ return false;}
				bd.sErC(idlist,1);
				result = false;
			}
		}
		return result;
	},

	checkBorderSideNumber : function(){
		var result = true;
		// 線の長さを取得する
		var rdata = new pzprv3.core.AreaInfo();
		for(var i=0;i<bd.bdmax;i++){ rdata.id[i] = (bd.isBorder(i)?0:null);}
		for(var i=0;i<bd.bdmax;i++){
			if(rdata.id[i]!==0){ continue;}
			var bx=bd.border[i].bx, by=bd.border[i].by, idlist=[];
			while(1){
				var id = bd.bnum(bx,by);
				if(id===null || rdata.id[id]!==0){ break;}

				idlist.push(id);
				if(bx%2===1){ bx+=2;}else{ by+=2;}
			}
			rdata.max++;
			for(var n=0;n<idlist.length;n++){ rdata.id[idlist[n]]=rdata.max;}
			rdata.room[rdata.max] = {idlist:idlist};
		}

		// 実際に差を調査する
		for(var i=0;i<bd.bdmax;i++){
			if(rdata.id[i]===null){ continue;}
			var cc1 = bd.border[i].cellcc[0], cc2 = bd.border[i].cellcc[1];
			var val1=bd.getNum(cc1), val2=bd.getNum(cc2);
			if(val1<=0 || val2<=0){ continue;}

			if(Math.abs(val1-val2)!==rdata.room[rdata.id[i]].idlist.length){
				if(this.inAutoCheck){ return false;}
				bd.sErC([cc1,cc2],1);
				bd.sErB(rdata.room[rdata.id[i]].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
