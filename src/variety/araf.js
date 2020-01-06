//
//  araf.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['araf'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','clear'],play:['border','subline']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

Cell:{
	minnum: 0,
	maxnum: 999
},

Board:{
	hasborder : 1,

	cols: 8,
	rows: 8
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系

Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",

	circleratio : [0.45, 0.40],


	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		// this.drawQuesNumbers();
		this.drawCircledNumbers();

		this.drawBorders();
		this.drawBorderQsubs();

		this.drawChassis();
		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderAns();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeAnsSquareRoom();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeAnsSquareRoom();
	},

	decodeAnsSquareRoom : function(){
		var bd = this.board, rdata = [], line;
		for(var i=0,rows=+this.readLine();i<rows;i++){
			if(!(line=this.readLine())){ break;}
			var pce = line.split(" ");
			for(var n=0;n<4;n++){ if(!isNaN(pce[n])){ pce[n]=2*(+pce[n])+1;} }
			bd.cellinside(pce[1],pce[0],pce[3],pce[2]).each(function(cell){ rdata[cell.id] = i;});
		}
		this.rdata2Border(false, rdata);
		bd.roommgr.rebuild();
	},
	encodeAnsSquareRoom : function(){
		var bd = this.board;
		bd.roommgr.rebuild();
		var rooms = bd.roommgr.components;
		this.writeLine(rooms.length);
		for(var id=0;id<rooms.length;id++){
			var d = rooms[id].clist.getRectSize();
			this.writeLine([(d.y1>>1), (d.x1>>1), (d.y2>>1), (d.x2>>1), ''].join(' '));
		}
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_shikaku_XMLBoard();
		this.decodeAnsSquareRoom_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_shikaku_XMLBoard();
		this.encodeAnsSquareRoom_XMLAnswer();
	},

	decodeCellQnum_shikaku_XMLBoard : function(){
		this.decodeCellXMLBoard(function(cell, val){
			if     (val>=  1){ cell.qnum = val;}
			else if(val===-1){ cell.qnum = -2;}
		});
	},
	encodeCellQnum_shikaku_XMLBoard : function(){
		this.encodeCellXMLBoard(function(cell){
			var val = 0;
			if     (cell.qnum>=  1){ val = cell.qnum;}
			else if(cell.qnum===-2){ val = -1;}
			return val;
		});
	},

	decodeAnsSquareRoom_XMLAnswer : function(){
		var nodes = this.xmldoc.querySelectorAll('answer area');
		var bd = this.board, rdata = [];
		for(var i=0;i<nodes.length;i++){
			var node = nodes[i];
			var bx1 = 2*(+node.getAttribute('c0'))-1;
			var by1 = 2*(+node.getAttribute('r0'))-1;
			var bx2 = 2*(+node.getAttribute('c1'))-1;
			var by2 = 2*(+node.getAttribute('r1'))-1;
			for(var bx=bx1;bx<=bx2;bx+=2){ for(var by=by1;by<=by2;by+=2){
				rdata[bd.getc(bx,by).id] = i;
			}}
		}
		this.rdata2Border(false, rdata);
		bd.roommgr.rebuild();
	},
	encodeAnsSquareRoom_XMLAnswer : function(){
		var boardnode = this.xmldoc.querySelector('answer');
		var bd = this.board;
		bd.roommgr.rebuild();
		var rooms = bd.roommgr.components;
		for(var id=0;id<rooms.length;id++){
			var d = rooms[id].clist.getRectSize();
			boardnode.appendChild(this.createXMLNode('area',{r0:(d.y1>>1)+1,c0:(d.x1>>1)+1,r1:(d.y2>>1)+1,c1:(d.x2>>1)+1}));
		}
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkLessThan2Num",
		"checkMoreThan2Num",
		"checkBigArea",
		"checkSmallArea",
		"checkBorderDeadend+"
	],

	checkLessThan2Num : function(){
		var rooms = this.board.roommgr.components;

		for(var r=0;r<rooms.length;r++){
			var room = rooms[r];
			var clist = room.clist;
			var clist2 = clist.filter(function(cell){return cell.qnum>=0;})

			if(clist2.length < 2){
				this.failcode.add("bkLessThan2Num");
				clist.seterr(1);
			}		
		}
	},

	checkMoreThan2Num : function(){
		var rooms = this.board.roommgr.components;

		for(var r=0;r<rooms.length;r++){
			var room = rooms[r];
			var clist = room.clist;
			var clist2 = clist.filter(function(cell){return cell.qnum>=0;})

			if(clist2.length > 2){
				this.failcode.add("bkMoreThan2Num");
				clist.seterr(1);
			}		
		}
	},

	checkBigArea : function(){
		var rooms = this.board.roommgr.components;

		for(var r=0;r<rooms.length;r++){
			var room = rooms[r];
			var clist = room.clist;
			var clist2 = clist.filter(function(cell){return cell.qnum>=0;})

			if(clist2.length === 2){
				var roomarea = clist.length;
				if(roomarea >= clist2[0].qnum && roomarea >= clist2[1].qnum){
					this.failcode.add("bkArafTooBig");
					if(this.checkOnly){ break;}
					clist.seterr(1);
				}
			}
		}
	},

	checkSmallArea : function(){
		var rooms = this.board.roommgr.components;

		for(var r=0;r<rooms.length;r++){
			var room = rooms[r];
			var clist = room.clist;
			var clist2 = clist.filter(function(cell){return cell.qnum>=0;})

			if(clist2.length === 2){
				var roomarea = clist.length;
				if(roomarea <= clist2[0].qnum && roomarea <= clist2[1].qnum){
					this.failcode.add("bkArafTooSmall");
					if(this.checkOnly){ break;}
					clist.seterr(1);
				}
			}
		}
	}

},

FailCode:{
	bkLessThan2Num  : ["(please translate) An area has less than two numbers.","An area has less than two numbers."],
	bkMoreThan2Num  : ["(please translate) An area has more than two numbers.","An area has more than two numbers."],
	bkArafTooBig:     ["(please translate) An area is too big.",  "An area is too big."],
	bkArafTooSmall:   ["(please translate) An area is too small.","An area is too small."]
}
}));
