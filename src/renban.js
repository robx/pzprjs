//
// パズル固有スクリプト部 連番窓口版 renban.js v3.4.0
//
pzprv3.createCustoms('renban', {
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

	isborder : 1,

	// 正答判定用
	getBorderLengthInfo : function(){
		var rdata = this.owner.newInstance('AreaBorderInfo');
		for(var i=0;i<this.bdmax;i++){ rdata.id[i] = (this.border[i].isBorder()?0:null);}
		for(var i=0;i<this.bdmax;i++){
			var border0 = this.border[i];
			if(!rdata.emptyBorder(border0)){ continue;}
			var pos=border0.getaddr(), isvert=border0.isVert(), blist=[];
			while(1){
				var border = pos.getb();
				if(border.isnull || !rdata.emptyBorder(border)){ break;}

				blist.push(border);
				if(isvert){ pos.move(0,2);}else{ pos.move(2,0);}
			}
			rdata.addRoom();
			for(var n=0;n<blist.length;n++){ rdata.addBorder(blist[n]);}
		}
		return rdata;
	}
},

AreaRoomManager:{
	enabled : true
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
		if( !this.checkDiffNumberInRoom(rinfo) ){ return 30421;}
		if( !this.checkNumbersInRoom(rinfo) ){ return 69801;}

		if( !this.checkBorderSideNumber() ){ return 69811;}
		if( !this.checkNoNumCell() ){ return 50171;}

		return 0;
	},
	check1st : function(){
		return (this.checkNoNumCell() ? 0 : 50171);
	},

	checkDiffNumberInRoom : function(rinfo){
		return this.checkDifferentNumberInRoom(rinfo, function(cell){ return cell.getNum();});
	},

	checkNumbersInRoom : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.getclist(r);
			if(clist.length<=1){ continue;}
			var max=-1, min=clist[0].maxnum, breakflag=false;
			for(var i=0,len=clist.length;i<len;i++){
				var val = clist[i].getNum();
				if(val===-1 || val===-2){ breakflag=true; break;}
				if(max<val){ max=val;}
				if(min>val){ min=val;}
			}
			if(breakflag){ break;}

			if(clist.length !== (max-min)+1){
				if(this.inAutoCheck){ return false;}
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

			var blist = rdata.getblist(rdata.id[i]);
			if(Math.abs(val1-val2)!==blist.length){
				if(this.inAutoCheck){ return false;}
				cell1.seterr(1);
				cell2.seterr(1);
				blist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
