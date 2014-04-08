//
// パズル固有スクリプト部 リフレクトリンク版 reflect.js v3.4.1
//

pzpr.classmgr.makeCustom('reflect', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputQues([0,2,3,4,5,11]);}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		if(this.key_inputLineParts(ca)){ return;}
		this.key_inputqnum(ca);
	},
	key_inputLineParts : function(ca){
		var cell = this.cursor.getTCC();

		if     (ca=='q'){ cell.setQues(2); cell.setQnum(-1);}
		else if(ca=='w'){ cell.setQues(3); cell.setQnum(-1);}
		else if(ca=='e'){ cell.setQues(4); cell.setQnum(-1);}
		else if(ca=='r'){ cell.setQues(5); cell.setQnum(-1);}
		else if(ca=='t'){ cell.setQues(11);cell.setQnum(-1);}
		else if(ca=='y'){ cell.setQues(0); cell.setQnum(-1);}
		else{ return false;}

		cell.drawaround();
		return true;
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	disInputHatena : true,

	minnum : 3,

	getTriLine : function(){
		var blist=new this.owner.BorderList(), border;

		border=this.lb(); while(!border.isnull && border.isLine()){ blist.add(border); border=border.relbd(-2,0);}
		border=this.rb(); while(!border.isnull && border.isLine()){ blist.add(border); border=border.relbd( 2,0);}
		border=this.ub(); while(!border.isnull && border.isLine()){ blist.add(border); border=border.relbd(0,-2);}
		border=this.db(); while(!border.isnull && border.isLine()){ blist.add(border); border=border.relbd(0, 2);}

		return blist;
	}
},
Border:{
	enableLineNG : true
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){
			var tques={};
			switch(key){
				case this.FLIPY: tques={2:5,3:4,4:3,5:2}; break;
				case this.FLIPX: tques={2:3,3:2,4:5,5:4}; break;
				case this.TURNR: tques={2:5,3:2,4:3,5:4}; break;
				case this.TURNL: tques={2:3,3:4,4:5,5:2}; break;
			}
			var clist = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], val = tques[cell.getQues()];
				if(!!val){ cell.setQues(val);}
			}
		}
	}
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

Flags:{
	redline : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawPekes();
		this.drawLines();

		this.drawTriangle();
		this.drawTriangleBorder();
		this.drawNumbers();

		this.draw11s();

		this.drawChassis();

		this.drawTarget();
	},

	getTriangleColor : function(cell){
		return ((cell.error===1||cell.error===4||cell.qinfo===1||cell.qinfo===4) ? this.errcolor1 : this.cellcolor);
	},

	drawTriangleBorder : function(){
		var g = this.vinc('cell_triangle_border', 'crispEdges');

		var header = "b_tb_";
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], lflag = border.isVert();
			var qs1 = border.sidecell[0].ques, qs2 = border.sidecell[1].ques;
			var px = border.bx*this.bw, py = border.by*this.bh;

			g.fillStyle = this.gridcolor;
			if(lflag && (qs1===3||qs1===4)&&(qs2===2||qs2===5)){
				if(this.vnop(header+border.id,this.NONE)){
					g.fillRect(px, py-this.bh, 1, this.ch);
				}
			}
			else if(!lflag && (qs1===2||qs1===3)&&(qs2===4||qs2===5)){
				if(this.vnop(header+border.id,this.NONE)){
					g.fillRect(px-this.bw, py, this.cw, 1);
				}
			}
			else{ this.vhide(header+border.id);}
		}
	},
	draw11s : function(){
		var g = this.vinc('cell_ques', 'crispEdges');
		var headers = ["c_lp1_", "c_lp2_"];

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;

			if(cell.ques===11){
				var lw = this.lw+2, lm=(lw-1)/2, ll=this.cw*0.76;
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				g.fillStyle = this.cellcolor;

				// Gridの真ん中＝cpx,cpy+0.5
				if(this.vnop(headers[0]+id,this.NONE)){
					g.fillRect(px+0.5-lm, py+0.5-ll/2,  lw, ll);
				}
				if(this.vnop(headers[1]+id,this.NONE)){
					g.fillRect(px+0.5-ll/2, py+0.5-lm,  ll, lw);
				}
			}
			else{ this.vhide([headers[0]+id, headers[1]+id]);}
		}
	},
	drawNumber1 : function(cell){
		var key = ['cell',cell.id].join('_');
		if((cell.ques>=2 && cell.ques<=5) && cell.qnum>0){
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			this.dispnum(key, cell.ques, ""+cell.qnum, 0.45, "white", px, py);
		}
		else{ this.hidenum(key);}
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.draw11s();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeReflectlink();
	},
	encodePzpr : function(type){
		this.encodeReflectlink();
	},

	decodeReflectlink : function(){
		var c=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if     (ca==='5'){ obj.ques = 11;}
			else if(this.include(ca,'1','4')){
				obj.ques = parseInt(ca)+1;
				obj.qnum = parseInt(bstr.substr(i+1,1),16);
				i++;
			}
			else if(this.include(ca,'6','9')){
				obj.ques = parseInt(ca)-4;
				obj.qnum = parseInt(bstr.substr(i+1,2),16);
				i+=2;
			}
			else if(this.include(ca,'a','z')){ c+=(parseInt(ca,36)-10);}
			if(obj.qnum===0){ obj.qnum=-1;}

			c++;
			if(c>=bd.cellmax){ break;}
		}

		this.outbstr = bstr.substr(i);
	},
	encodeReflectlink : function(type){
		var cm="", pstr="", count=0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var qu=bd.cell[c].ques;
			if     (qu===11){ pstr = "5";}
			else if(qu>=2 && qu<=5){
				var val = bd.cell[c].qnum;
				if     (val<= 0){ pstr = ""+(qu-1)+"0";}
				else if(val>= 1 && val< 16){ pstr = ""+(qu-1)+val.toString(16);}
				else if(val>=16 && val<256){ pstr = ""+(qu+4)+val.toString(16);}
			}
			else{ pstr = ""; count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.ques = 11;}
			else if(ca!=="."){
				obj.ques = parseInt(ca.charAt(0))+1;
				if(ca.length>1){ obj.qnum = parseInt(ca.substr(1));}
			}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.ques===11) { return "+ ";}
			else if(obj.ques>=2 && obj.ques<=5) {
				return ""+(obj.ques-1)+(obj.qnum!==-1 ? obj.qnum : "")+" ";
			}
			else{ return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLineCount(3) ){ return 'lnBranch';}
		if( !this.checkCrossOutOfMark() ){ return 'lnCrossExMk';}

		if( !this.checkTriNumber(1) ){ return 'lnLenGt';}
		if( !this.checkTriangle() ){ return 'lnExTri';}
		if( !this.checkTriNumber(2) ){ return 'lnLenLt';}

		if( !this.checkNotCrossOnMark() ){ return 'lnNotCrossMk';}

		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		return null;
	},

	checkCrossOutOfMark : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()===4 && cell.getQues()!==11);});
	},
	checkNotCrossOnMark : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()!==4 && cell.getQues()===11);});
	},

	checkTriangle : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.lcnt()==0 && (cell.getQues()>=2 && cell.getQues()<=5)){
				if(this.checkOnly){ return false;}
				cell.seterr(4);
				result = false;
			}
		}
		return result;
	},

	checkTriNumber : function(type){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQues()<2 || cell.getQues()>5 || !cell.isValidNum()){ continue;}

			var blist = cell.getTriLine();
			if(type==1?cell.getQnum()<(blist.length+1):cell.getQnum()>(blist.length+1)){
				if(this.checkOnly){ return false;}
				cell.seterr(4);
				if(result){ bd.border.seterr(-1);}
				blist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	lnExTri : ["線が三角形を通過していません。","A line doesn't goes through a triangle."],
	lnLenGt : ["三角形の数字とそこから延びる線の長さが一致していません。","A number on triangle is not equal to sum of the length of lines from it."],
	lnLenLt : ["三角形の数字とそこから延びる線の長さが一致していません。","A number on triangle is not equal to sum of the length of lines from it."]
}
});
