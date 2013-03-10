//
// パズル固有スクリプト部 へやわけ・∀人∃ＨＥＹＡ版 heyawake.js v3.4.0
//
pzprv3.createCustoms('heyawake', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputborder();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	},
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 10
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
	isborder : 1
},

AreaWhiteManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true,
	hastop : true
},

Properties:{
	flag_use      : true,
	flag_redblkrb : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.bbcolor = "rgb(160, 255, 191)";
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

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
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	pzlexport : function(type){
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
			var d = rinfo.getclist(id).getRectSize();
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

		if( !this.checkSideCell(function(cell1,cell2){ return (cell1.isBlack() && cell2.isBlack());}) ){
			this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !this.checkRBBlackCell( this.owner.board.getWCellInfo() ) ){
			this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}

		var rinfo = this.owner.board.getRoomInfo();
		if( (this.owner.pid==='ayeheya') && !this.checkFractal(rinfo) ){
			this.setAlert('部屋の中の黒マスが点対称に配置されていません。', 'Position of black cells in the room is not point symmetric.'); return false;
		}

		if( !this.checkBlackCellCount(rinfo) ){
			this.setAlert('部屋の数字と黒マスの数が一致していません。','The number of Black cells in the room and The number written in the room is different.'); return false;
		}

		if( !this.checkRowsColsPartly(this.isBorderCount, function(cell){ return cell.isBlack();}, false) ){
			this.setAlert('白マスが3部屋連続で続いています。','White cells are continued for three consecutive room.'); return false;
		}

		if( !this.checkAreaRect(rinfo) ){
			this.setAlert('四角形ではない部屋があります。','There is a room whose shape is not square.'); return false;
		}

		return true;
	},

	checkFractal : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.getclist(r), d = clist.getRectSize();
			var sx=d.x1+d.x2, sy=d.y1+d.y2;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], cell2 = this.owner.board.getc(sx-cell.bx, sy-cell.by);
				if(cell.isBlack() ^ cell2.isBlack()){
					if(this.inAutoCheck){ return false;}
					clist.seterr(1);
					result = false;
				}
			}
		}
		return result;
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
}
});
