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
