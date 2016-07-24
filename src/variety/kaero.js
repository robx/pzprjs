//
// パズル固有スクリプト部 お家に帰ろう版 kaero.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['kaero'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn==='left') { this.inputMoveLine();}
				else if(this.btn==='right'){ this.inputpeke();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputlight();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	inputlight : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if     (cell.qsub===0){ cell.setQsub(this.btn==='left'?1:2);}
		else if(cell.qsub===1){ cell.setQsub(this.btn==='left'?2:0);}
		else if(cell.qsub===2){ cell.setQsub(this.btn==='left'?0:1);}
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	key_inputqnum_main : function(cell,ca){
		return this.key_inputqnum_main_kaero(cell,ca);
	},
	key_inputqnum_main_kaero : function(cell,ca){
		if(ca.length>1 && ca!=='BS'){ return false;}
		else if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = cell.qnum;
			if     ((canum-1)%26===num && canum>0 && canum<=26){ cell.setQnum(canum+26);}
			else if((canum-1)%26===num){ cell.setQnum(-1);}
			else{ cell.setQnum(num+1);}
		}
		else if(ca==='-'){ cell.setQnum(cell.qnum!==-2?-2:-1);}
		else if(ca===' '||ca==='BS'){ cell.setQnum(-1);}
		else{ return false;}

		return true;
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : 52
},
CellList:{
	getDeparture : function(){ return this.map(function(cell){ return cell.base;}).notnull();}
},

Board:{
	cols : 6,
	rows : 6,

	hasborder : 1
},

LineGraph:{
	enabled : true,
	moveline : true
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub2",
	numbercolor_func : "move",
	qsubcolor1 : "rgb(224, 224, 255)",
	qsubcolor2 : "rgb(255, 255, 144)",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawTip();
		this.drawPekes();
		this.drawDepartures();
		this.drawLines();

		this.drawCellSquare();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges', true);

		var rw = this.bw*0.7-1;
		var rh = this.bh*0.7-1;
		var isdrawmove = this.puzzle.execConfig('dispmove');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "c_sq_"+cell.id;
			if((!isdrawmove && cell.isDeparture()) || (isdrawmove && cell.isDestination())){
				if     (cell.error===1){ g.fillStyle = this.errbcolor1;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2;}
				else                   { g.fillStyle = "white";}

				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, rw, rh);
			}
			else{ g.vhide();}
		}
	},
	textoption : {ratio:[0.85]},
	getNumberText : function(cell){
		var isdrawmove = this.puzzle.execConfig('dispmove');
		var num = (isdrawmove ? cell.base : cell).qnum, text = "";
		if     (num===-1)        { text = "";}
		else if(num===-2)        { text = "?";}
		else if(num> 0&&num<= 26){ text+=(num+ 9).toString(36).toUpperCase();}
		else if(num>26&&num<= 52){ text+=(num-17).toString(36).toLowerCase();}
		else{ text = ""+num;}
		return text;
	},
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeKaero();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeKaero();
	},

	decodeKaero : function(){
		var c=0, a=0, bstr = this.outbstr, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if     (this.include(ca,'0','9')){ cell.qnum = parseInt(ca,36)+27;}
			else if(this.include(ca,'A','Z')){ cell.qnum = parseInt(ca,36)-9; }
			else if(ca==="-"){ cell.qnum = parseInt(bstr.charAt(i+1),36)+37; i++;}
			else if(ca==="."){ cell.qnum = -2;}
			else if(this.include(ca,'a','z')){ c+=(parseInt(ca,36)-10);}

			c++;
			if(!bd.cell[c]){ a=i+1; break;}
		}

		this.outbstr = bstr.substring(a);
	},
	encodeKaero : function(){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", qnum = bd.cell[c].qnum;
			if     (qnum===-2){ pstr = ".";}
			else if(qnum>= 1 && qnum<=26){ pstr = ""+ (qnum+9).toString(36).toUpperCase();}
			else if(qnum>=27 && qnum<=36){ pstr = ""+ (qnum-27).toString(10);}
			else if(qnum>=37 && qnum<=72){ pstr = "-"+ (qnum-37).toString(36).toUpperCase();}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr||count===26){ cm+=((9+count).toString(36).toLowerCase()+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36).toLowerCase();}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQanssub();
		this.decodeBorderQues();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQanssub();
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",
		"checkConnectObject",
		"checkLineOverLetter",

		"checkSameObjectInRoom_kaero",
		"checkGatheredObject",
		"checkNoObjectBlock",

		"checkDisconnectLine"
	],

	// checkSameObjectInRoom()にbaseを付加した関数
	checkSameObjectInRoom_kaero : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist, rnum=-1;
			var cbase = clist.getDeparture();
			for(var i=0;i<cbase.length;i++){
				var num=cbase[i].qnum;
				if(rnum===-1){ rnum=num;}
				else if(rnum!==num){
					this.failcode.add("bkPlNum");
					if(this.checkOnly){ break allloop;}
					if(!this.puzzle.execConfig('dispmove')){ cbase.seterr(4);}
					clist.seterr(1);
				}
			}
		}
	},

	// 同じ値であれば、同じ部屋に存在することを判定する
	checkGatheredObject : function(){
		var max=0, bd=this.board;
		for(var c=0;c<bd.cell.length;c++){ var num=bd.cell[c].base.qnum; if(max<num){ max=num;} }
		allloop:
		for(var num=0;num<=max;num++){
			var clist = bd.cell.filter(function(cell){ return (num===cell.base.qnum);}), rid=null;
			for(var i=0;i<clist.length;i++){
				var room = clist[i].room;
				if(rid===null){ rid=room;}
				else if(room!==null && rid!==room){
					this.failcode.add("bkSepNum");
					if(!this.puzzle.execConfig('dispmove')){ clist.getDeparture().seterr(4);}
					clist.seterr(1);
					break allloop;
				}
			}
		}
	},

	checkNoObjectBlock : function(){
		this.checkNoMovedObjectInRoom(this.board.roommgr);
	}
},

FailCode:{
	bkNoNum : ["アルファベットのないブロックがあります。","A block has no letters."],
	bkPlNum : ["１つのブロックに異なるアルファベットが入っています。","A block has plural kinds of letters."],
	bkSepNum : ["同じアルファベットが異なるブロックに入っています。","Same kinds of letters are placed different blocks."]
}
}));
