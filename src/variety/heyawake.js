//
// パズル固有スクリプト部 へやわけ・∀人∃ＨＥＹＡ版 heyawake.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['heyawake','ayeheya'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBShadeCell : true,
	use    : true,
	inputModes : {edit:['border','number','clear','info-blk'],play:['shade','unshade','info-blk']},

	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
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
	maxnum : function(){
		var d = this.room.clist.getRectSize();
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

AreaUnshadeGraph:{
	enabled : true
},
AreaRoomGraph:{
	enabled : true,
	hastop : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	enablebcolor : true,
	bgcellcolor_func : "qsub1",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();

		this.drawQuesNumbers();

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
		this.fio.decodeSquareRoom();
	},
	encodeKanpen : function(){
		this.fio.encodeSquareRoom();
	},

	decodeHeyaApp : function(){
		var c=0, rdata=[], bd = this.board;
		for(var c=0;c<bd.cell.length;c++){ rdata[c]=null;}

		var fileio = new this.puzzle.klass.FileIO();
		var i=0, inp=this.outbstr.split("/");
		for(var c=0;c<bd.cell.length;c++){
			if(rdata[c]!==null){ continue;}

			var cell = bd.cell[c];
			if(inp[i].match(/((\d+)in)?(\d+)x(\d+)$/)){
				if(RegExp.$2.length>0){ cell.qnum = +RegExp.$2;}
				var x1 = cell.bx, x2 = x1 + 2*(+RegExp.$3) - 2;
				var y1 = cell.by, y2 = y1 + 2*(+RegExp.$4) - 2;
				for(var bx=x1;bx<=x2;bx+=2){ for(var by=y1;by<=y2;by+=2){
					rdata[bd.getc(bx,by).id] = i;
				}}
			}
			i++;
		}
		fileio.rdata2Border(true, rdata);
	},
	encodeHeyaApp : function(){
		var barray=[], bd=this.board, rooms = bd.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var d = rooms[r].clist.getRectSize();
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
	},

	decodeSquareRoom : function(){
		var bd = this.board, rdata = [], line;
		for(var i=0,rows=+this.readLine();i<rows;i++){
			if(!(line=this.readLine())){ break;}
			var pce = line.split(" ");
			for(var n=0;n<4;n++){ if(!isNaN(pce[n])){ pce[n]=2*(+pce[n])+1;} }
			if(pce[4]!==""){ bd.getc(pce[1],pce[0]).qnum = +pce[4];}
			bd.cellinside(pce[1],pce[0],pce[3],pce[2]).each(function(cell){ rdata[cell.id] = i;});
		}
		this.rdata2Border(true, rdata);
		bd.roommgr.rebuild();
	},
	encodeSquareRoom : function(){
		var bd = this.board;
		bd.roommgr.rebuild();
		var rooms = bd.roommgr.components;
		this.writeLine(rooms.length);
		for(var r=0;r<rooms.length;r++){
			var d = rooms[r].clist.getRectSize();
			var num = rooms[r].top.qnum;
			this.writeLine([(d.y1>>1),(d.x1>>1),(d.y2>>1),(d.x2>>1),(num>=0 ? ""+num : "")].join(' '));
		}
	},

	kanpenOpenXML : function(){
		this.decodeSquareRoom_XMLBoard();
		this.decodeCellAns_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeSquareRoom_XMLBoard();
		this.encodeCellAns_XMLAnswer();
	},

	decodeSquareRoom_XMLBoard : function(){
		var nodes = this.xmldoc.querySelectorAll('board area');
		var bd = this.board, rdata = [];
		for(var i=0;i<nodes.length;i++){
			var node = nodes[i];
			var bx1 = 2*(+node.getAttribute('c0'))-1;
			var by1 = 2*(+node.getAttribute('r0'))-1;
			var bx2 = 2*(+node.getAttribute('c1'))-1;
			var by2 = 2*(+node.getAttribute('r1'))-1;
			var num = +node.getAttribute('n');
			if(num>=0){ bd.getc(bx1,by1).qnum = num;}
			for(var bx=bx1;bx<=bx2;bx+=2){ for(var by=by1;by<=by2;by+=2){
				rdata[bd.getc(bx,by).id] = i;
			}}
		}
		this.rdata2Border(true, rdata);
		bd.roommgr.rebuild();
	},
	encodeSquareRoom_XMLBoard : function(){
		var boardnode = this.xmldoc.querySelector('board');
		var bd = this.board;
		bd.roommgr.rebuild();
		var rooms = bd.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var d = rooms[r].clist.getRectSize(), num = rooms[r].top.qnum;
			boardnode.appendChild(this.createXMLNode('area',{r0:(d.y1>>1)+1,c0:(d.x1>>1)+1,r1:(d.y2>>1)+1,c1:(d.x2>>1)+1,n:num}));
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkShadeCellExist",
		"checkAdjacentShadeCell",
		"checkConnectUnshadeRB",
		"checkFractal@ayeheya",
		"checkShadeCellCount",
		"checkCountinuousUnshadeCell",
		"checkRoomSymm@ayeheya",
		"checkDone"
	],

	checkFractal : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist, d = clist.getRectSize();
			var sx=d.x1+d.x2, sy=d.y1+d.y2;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], cell2 = this.board.getc(sx-cell.bx, sy-cell.by);
				if(cell.isShade() === cell2.isShade()){ continue;}

				this.failcode.add("bkNotSymShade");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
			}
		}
	},

	checkRoomSymm : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist, d = clist.getRectSize();
			var sx=d.x1+d.x2, sy=d.y1+d.y2;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], cell2 = this.board.getc(sx-cell.bx, sy-cell.by);
				if(cell2.room===rooms[r]){ continue;}

				this.failcode.add("bkNotSymRoom");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
			}
		}
	},

	checkCountinuousUnshadeCell : function(){
		var savedflag = this.checkOnly;
		this.checkOnly = true;	/* エラー判定を一箇所だけにしたい */
		this.checkRowsColsPartly(this.isBorderCount, function(cell){ return cell.isShade();}, "bkUnshadeConsecGt3");
		this.checkOnly = savedflag;
	},
	isBorderCount : function(clist){
		var d = clist.getRectSize(), count = 0, bd = this.board, bx, by;
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

		var result = (count<=1);
		if(!result){ clist.seterr(1);}
		return result;
	},

	checkDone : function(){
		this.checkShadingDecided();
	}
},

FailCode:{
	bkUnshadeConsecGt3 : ["白マスが3部屋連続で続いています。","Unshaded cells are continued for three consecutive room."],
	bkNotSymShade      : ["部屋の中の黒マスが点対称に配置されていません。","Position of shaded cells in the room is not point symmetric."],
	bkNotSymRoom       : ["部屋の形が点対称ではありません。","The room is not point symmetric."]
}
}));
