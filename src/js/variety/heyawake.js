//
// パズル固有スクリプト部 へやわけ・∀人∃ＨＥＹＡ版 heyawake.js v3.4.1
//
pzpr.classmgr.makeCustom(['heyawake','ayeheya'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBShadeCell : true,

	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},
	inputRed : function(){ this.dispRed();}
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
		var d = this.owner.board.rooms.getClistByCell(this).getRectSize();
		var m=d.cols, n=d.rows; if(m>n){ var t=m;m=n;n=t;}
		if     (m===1){ return ((n+1)>>1);}
		else if(m===2){ return n;}
		else if(m===3){
			if     (n%4===0){ return (n  )/4*5  ;}
			else if(n%4===1){ return (n-1)/4*5+2;}
			else if(n%4===2){ return (n-2)/4*5+3;}
			else            { return (n+1)/4*5  ;}
		}
		else{
			if(((Math.log(m+1)/Math.log(2))%1===0)&&(m===n)){ return (m*n+m+n)/3;}
			else if((m&1)&&(n&1)){ return (((m*n+m+n-1)/3)|0);}
			else{ return (((m*n+m+n-2)/3)|0);}
		}
	},
	minnum : 0
},
Board:{
	hasborder : 1
},

AreaUnshadeManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true,
	hastop : true
},

Flags:{
	use      : true,
	redblkrb : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",
	bcolor_type : "GREEN",

	bgcellcolor_func : "qsub1",

	bbcolor : "rgb(160, 255, 191)",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();

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
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeSquareRoom();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeSquareRoom();
	},

	decodeHeyaApp : function(){
		var c=0, rdata=[], bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){ rdata[c]=null;}

		var i=0, inp=this.outbstr.split("/");
		for(var c=0;c<bd.cellmax;c++){
			if(rdata[c]!==null){ continue;}

			var cell = bd.cell[c];
			if(inp[i].match(/(\d+in)?(\d+)x(\d+)$/)){
				if(RegExp.$1.length>0){ cell.qnum = parseInt(RegExp.$1);}
				var x1 = cell.bx, x2 = x1 + 2*parseInt(RegExp.$2) - 2;
				var y1 = cell.by, y2 = y1 + 2*parseInt(RegExp.$3) - 2;
				this.owner.fio.setRdataRect(rdata, i, {x1:x1, x2:x2, y1:y1, y2:y2});
			}
			i++;
		}
		this.owner.fio.rdata2Border(true, rdata);
	},
	encodeHeyaApp : function(){
		var barray=[], bd=this.owner.board, rinfo=bd.getRoomInfo();
		for(var id=1;id<=rinfo.max;id++){
			var d = rinfo.area[r].clist.getRectSize();
			var ul = bd.getc(d.x1,d.y1).qnum;
			barray.push((ul>=0 ? ""+ul+"in" : "")+d.cols+"x"+d.rows);
		}
		this.outbstr = barray.join("/");
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
	},

	kanpenOpen : function(){
		this.decodeSquareRoom();
		this.decodeCellAns();
	},
	kanpenSave : function(){
		this.encodeSquareRoom();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkAdjacentShadeCell() ){ return 'csAdjacent';}

		var winfo = this.owner.board.getUnshadeInfo();
		if( !this.checkRBShadeCell(winfo) ){ return 'cuDivideRB';}

		var rinfo = this.owner.board.getRoomInfo();
		if( (this.owner.pid==='ayeheya') && !this.checkFractal(rinfo) ){ return 'bkNotSymShade';}

		if( !this.checkShadeCellCount(rinfo) ){ return 'bkShadeNe';}

		if( !this.checkCountinuousUnshadeCell() ){ return 'bkUnshadeConsecGt3';}

		if( !this.checkAreaRect(rinfo) ){ return 'bkNotRect';}

		return null;
	},

	checkFractal : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist, d = clist.getRectSize();
			var sx=d.x1+d.x2, sy=d.y1+d.y2;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], cell2 = this.owner.board.getc(sx-cell.bx, sy-cell.by);
				if(cell.isShade() ^ cell2.isShade()){
					if(this.checkOnly){ return false;}
					clist.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},

	checkCountinuousUnshadeCell : function(){
		return this.checkRowsColsPartly(this.isBorderCount, function(cell){ return cell.isShade();}, false);
	},
	isBorderCount : function(keycellpos, clist){
		var d = clist.getRectSize(), count = 0, bd = this.owner.board, bx, by;
		if(d.x1===d.x2){
			bx = d.x1;
			for(by=d.y1+1;by<=d.y2-1;by+=2){
				if(bd.getb(bx,by).isBorder()){ count++;}
			}
		}
		else if(d.y1===d.y2){
			by = d.y1;
			for(bx=d.x1+1;bx<=d.x2-1;bx+=2){
				if(bd.getb(bx,by).isBorder()){ count++;}
			}
		}

		if(count>=2){ clist.seterr(1); return false;}
		return true;
	}
},

FailCode:{
	bkUnshadeConsecGt3 : ["白マスが3部屋連続で続いています。","Unshaded cells are continued for three consecutive room."],
	bkNotSymShade      : ["部屋の中の黒マスが点対称に配置されていません。","Position of shaded cells in the room is not point symmetric."]
}
});
