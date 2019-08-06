//
// パズル固有スクリプト部 マカロ版 makaro.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['makaro'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','arrow','number','clear'],play:['number','clear']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.isBorderMode()){ this.inputborder();}
				else                   { this.inputarrow_cell();}
			}
			else if(this.mouseend && this.notInputted()){
 				this.inputqnum();
			}
		}
	},

	inputarrow_cell_main : function(cell, dir){
		cell.setQnum(-1);
		cell.setAnum(-1);
		if(cell.qdir!==dir){
			cell.setQdir(dir);
			cell.setQues(1);
		}
		else{
			cell.setQdir(cell.NDIR);
			cell.setQues(0);
		}
	},

	inputqnum_main : function(cell){	// オーバーライド
		if(this.puzzle.editmode && this.inputshade_preqnum(cell)){ return;}
		if(cell.ques===1){ return;}

		this.common.inputqnum_main.call(this,cell);
	},
	inputshade_preqnum : function(cell){
		var val = null;
		if(cell.ques===1 && cell.qdir!==cell.NDIR){
			val = -3;
		}
		else if(cell.ques===1 && cell.qdir===cell.NDIR){
			if     (this.btn==='left') { val = -2;}
			else if(this.btn==='right'){ val = -1;}
		}
		/* inputqnum_mainの空白-?マーク間に黒マスのフェーズを挿入する */
		else if(cell.ques===0 && cell.qnum===-1){
			if(this.btn==='left'){ val = -3;}
		}
		else if(cell.qnum===-2){
			if(this.btn==='right'){ val = -3;}
		}

		if(val===-3){
			cell.setQues(1);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			cell.draw();
		}
		else if(val===-1){
			cell.setQues(0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			cell.draw();
		}
		else if(val===-2){
			cell.setQues(0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-2);
			cell.setAnum(-1);
			cell.draw();
		}

		return (val!==null);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		var cell = this.cursor.getc();

		if(this.puzzle.editmode){
			if(this.key_inputcell_makaro_edit(cell,ca)){ return;}
		}

		if(cell.ques!==1){
			this.key_inputqnum(ca);
		}
	},

	key_inputcell_makaro_edit : function(cell, ca){
		var retval = false;

		if(ca===' '){
			cell.setQues(0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			retval = true;
		}
		else if(ca==='BS' && cell.ques===1){
			if(cell.qdir!==cell.NDIR){
				cell.setQdir(cell.NDIR);
			}
			else{
				cell.setQues(0);
				cell.setQnum(-1);
				cell.setAnum(-1);
			}
			retval = true;
		}
		else if(ca==='-'){
			cell.setQues(cell.ques===0 ? 1 : 0);
			cell.setQdir(cell.NDIR);
			cell.setQnum(-1);
			cell.setAnum(-1);
			retval = true;
		}
		else if(this.key_inputarrow(ca)){
			/* 数字とは排他になる */
			cell.setQues(1);
			cell.setQnum(-1);
			cell.setAnum(-1);
			retval = true;
		}

		if(retval){ cell.draw();}

		return retval;
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	enableSubNumberArray : true,
	maxnum : function(){
		return Math.min(99, this.room.clist.length);
	}
},
Border:{
	isBorder : function(){
		return this.isnull || this.ques>0 || !!(this.sidecell[0].ques===1 || this.sidecell[1].ques===1);
	}
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
	}
},

AreaRoomGraph:{
	enabled : true,
	isnodevalid : function(cell){ return (cell.ques===0);}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawTargetSubNumber();
		this.drawGrid();
		this.drawQuesCells();

		this.drawCellArrows();
		this.drawSubNumbers();
		this.drawAnsNumbers();
		this.drawQuesNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	},

	getCellArrowColor : function(cell){
		return (cell.qdir!==0 ? "white" : null);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeMakaro();
	},
	encodePzpr : function(type){
		this.encodeBorder_makaro();
		this.encodeMakaro();
	},

	decodeMakaro : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(this.include(ca,"0","9")){ cell.qnum = parseInt(ca,10)+1;}
			else if(ca === '-')         { cell.qnum = parseInt(bstr.substr(i+1,2),10)+1; i+=2;}
			else if(ca>='a' && ca<='e') { cell.ques = 1; cell.qdir = parseInt(ca,36)-10;}
			else if(ca>='g' && ca<='z') { c+=(parseInt(ca,36)-16);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeMakaro : function(){
		var cm = "", count = 0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", cell=bd.cell[c], qn=cell.qnum;
			if     (qn>= 1&&qn< 11){ pstr =     (qn-1).toString(10);}
			else if(qn>=11&&qn<100){ pstr = "-"+(qn-1).toString(10);}
			else if(cell.ques===1) { pstr = (cell.qdir+10).toString(36);}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+15).toString(36);}

		this.outbstr += cm;
	},

	encodeBorder_makaro : function(){
		/* 同じ見た目のパズルにおけるURLを同じにするため、        */
		/* 一時的にcell.ques=1にしてURLを出力してから元に戻します */
		var bd = this.board, sv_ques = [];
		for(var id=0;id<bd.border.length;id++){
			sv_ques[id] = bd.border[id].ques;
			bd.border[id].ques = (bd.border[id].isBorder() ? 1 : 0);
		}

		this.encodeBorder();

		for(var id=0;id<bd.border.length;id++){
			bd.border[id].ques = sv_ques[id];
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQuesData_makaro();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQuesData_makaro();
		this.encodeCellAnumsub();
	},

	decodeCellQuesData_makaro : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="t"){ cell.ques = 1; cell.qdir = 1;}
			else if(ca==="b"){ cell.ques = 1; cell.qdir = 2;}
			else if(ca==="l"){ cell.ques = 1; cell.qdir = 3;}
			else if(ca==="r"){ cell.ques = 1; cell.qdir = 4;}
			else if(ca==="#"){ cell.ques = 1; cell.qdir = 0;}
			else if(ca==="-"){ cell.qnum = -2;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
	},
	encodeCellQuesData_makaro : function(){
		this.encodeCell( function(cell){
			if(cell.ques===1){
				if     (cell.qdir===1){ return "t ";}
				else if(cell.qdir===2){ return "b ";}
				else if(cell.qdir===3){ return "l ";}
				else if(cell.qdir===4){ return "r ";}
				else                  { return "# ";}
			}
			else if(cell.qnum>=0)  { return cell.qnum+" ";}
			else if(cell.qnum===-2){ return "- ";}
			else{ return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkDifferentNumberInRoom",
		"checkAdjacentDiffNumber",
		"checkPointAtBiggestNumber",
		"checkNoNumCell+"
	],

	/* 矢印が盤外を向いている場合も、この関数でエラー判定します */
	/* 矢印の先が空白マスである場合は判定をスルーします         */
	checkPointAtBiggestNumber : function(){
		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			if(cell.ques!==1 || cell.qdir===cell.NDIR){ continue;}
			var list = cell.getdir4clist(), maxnum = -1, maxdir = cell.NDIR;
			var dupnum = false, isempty = false, invalidarrow = true;
			for(var i=0;i<list.length;i++){
				var num = list[i][0].getNum();
				if(num===-1){ /* 数字が入っていない場合何もしない */ }
				else if(num>maxnum){ maxnum=num; maxdir=list[i][1]; dupnum=false;}
				else if(num===maxnum){ maxdir=cell.NDIR; dupnum=true;}

				if(list[i][1]===cell.qdir){
					if(list[i][0].ques===0){ invalidarrow = false;}
					if(num===-1){ isempty = true;}
				}
			}
			if(!invalidarrow && (isempty || (!dupnum && cell.qdir===maxdir))){ continue;}

			this.failcode.add("arNotMax");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			for(var i=0;i<list.length;i++){
				if(list[i][0].getNum()!==-1){ list[i][0].seterr(1);}
			}
		}
	}
},

FailCode:{
	bkDupNum : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	arNotMax : ["矢印の先が最も大きい数字でありません。", "An arrow doesn't point out biggest number."]
}
}));
