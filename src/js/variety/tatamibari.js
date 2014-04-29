//
// パズル固有スクリプト部 タタミバリ版 tatamibari.js v3.4.1
//
pzpr.classmgr.makeCustom(['tatamibari'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputMarks(ca);
	},
	key_inputMarks : function(ca){
		var cell = this.cursor.getc();

		if     (ca=='q'||ca=='1'){ cell.setQnum(1); }
		else if(ca=='w'||ca=='2'){ cell.setQnum(2); }
		else if(ca=='e'||ca=='3'){ cell.setQnum(3); }
		else if(ca=='r'||ca=='4'){ cell.setQnum(-1); }
		else if(ca==' '         ){ cell.setQnum(-1); }
		else if(ca=='-'         ){ cell.setQnum(cell.getQnum()!==-2?-2:-1); }
		else{ return;}

		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberAsObject : true,

	maxnum : 3
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){
			var tques = {2:3,3:2};
			var clist = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], val = tques[cell.getQnum()];
				if(!!val){ cell.setQnum(val);}
			}
		}
	}
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawMarks();

		this.drawHatenas();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	drawMarks : function(){
		var g = this.vinc('cell_ques', 'crispEdges');

		var lm = Math.max(this.cw/12, 3)/2;	//LineWidth
		var lp = this.bw*0.70;				//LineLength
		var headers = ["c_lp1_", "c_lp2_"];
		g.fillStyle = this.borderQuescolor;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id, qn = cell.qnum;
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			if(qn===1||qn===2){
				if(this.vnop(headers[0]+id,this.NONE)){
					g.fillRectCenter(px, py, lm, lp);
				}
			}
			else{ g.vhide(headers[0]+id);}

			if(qn===1||qn===3){
				if(this.vnop(headers[1]+id,this.NONE)){
					g.fillRectCenter(px, py, lp, lm);
				}
			}
			else{ g.vhide(headers[1]+id);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeTatamibari();
	},
	encodePzpr : function(type){
		this.encodeTatamibari();
	},

	decodeTatamibari : function(){
		var c=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell = bd.cell[c];

			if     (ca==='.'){ cell.qnum = -2;}
			else if(ca==='1'){ cell.qnum = 2;}
			else if(ca==='2'){ cell.qnum = 3;}
			else if(ca==='3'){ cell.qnum = 1;}
			else if(ca>='g' && ca<='z'){ c+=(parseInt(ca,36)-16);}
			else{ c++;}

			c++;
			if(c>=bd.cellmax){ break;}
		}

		this.outbstr = bstr.substr(i);
	},
	encodeTatamibari : function(){
		var count=0, pass, cm="", bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", qn=bd.cell[c].qnum;
			if     (qn===-2){ pstr = ".";}
			else if(qn=== 1){ pstr = "3";}
			else if(qn=== 2){ pstr = "1";}
			else if(qn=== 3){ pstr = "2";}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="a"){ obj.qnum = 2;}
			else if(ca==="b"){ obj.qnum = 3;}
			else if(ca==="c"){ obj.qnum = 1;}
			else if(ca==="-"){ obj.qnum =-2;}
		});
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum===-2){ return "- ";}
			else if(obj.qnum=== 1){ return "c ";}
			else if(obj.qnum=== 2){ return "a ";}
			else if(obj.qnum=== 3){ return "b ";}
			else                  { return ". ";}
		});
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkBorderCount(4,0) ){ return 'bdCross';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){ return 'bkNoNum';}

		if( !this.checkSquareTatami(rinfo) ){ return 'bkNotSquare';}
		if( !this.checkHorizonLongTatami(rinfo) ){ return 'bkNotHRect';}
		if( !this.checkVertLongTatami(rinfo) ){ return 'bkNotVRect';}

		if( !this.checkDoubleNumber(rinfo) ){ return 'bkNumGe2';}

		if( !this.checkAreaRect(rinfo) ){ return 'bkNotRect';}

		if( !this.checkBorderCount(1,0) ){ return 'bdDeadEnd';}

		return null;
	},

	checkSquareTatami : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (n!=1||a<=0||(w*h!=a)||w==h);});
	},
	checkHorizonLongTatami : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (n!=3||a<=0||(w*h!=a)||w>h);});
	},
	checkVertLongTatami : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (n!=2||a<=0||(w*h!=a)||w<h);});
	}
},

FailCode:{
	bkNoNum  : ["記号の入っていないタタミがあります。","A tatami has no marks."],
	bkNumGe2 : ["1つのタタミに2つ以上の記号が入っています。","A tatami has plural marks."],
	bkNotRect : ["タタミの形が長方形ではありません。","A tatami is not rectangle."],
	bkNotSquare : ["正方形でないタタミがあります。","A tatami is not regular rectangle."],
	bkNotHRect : ["横長ではないタタミがあります。","A tatami is not horizontally long rectangle."],
	bkNotVRect : ["縦長ではないタタミがあります。","A tatami is not vertically long rectangle."]
}
});
