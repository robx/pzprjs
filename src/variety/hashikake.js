//
// パズル固有スクリプト部 橋をかけろ版 hashikake.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['hashikake'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','clear'],play:['line','peke']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	prevblist : null,
	mousereset : function(){
		this.common.mousereset.call(this);
		this.prevblist = new this.klass.BorderList();
	},

	inputLine : function(){
		var pos = this.getpos(0.20);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.prevPos.getlineobj(pos);
		if(!border.isnull){
			var dir = this.prevPos.getdir(pos,1);
			var d = border.getlinesize();
			var borders = this.board.borderinside(d.x1,d.y1,d.x2,d.y2);

			if(this.prevblist.length===0 || !this.prevblist.include(border)){ this.inputData=null;}

			if(this.inputData===null){ this.inputData = [1,2,0][border.line];}
			if(this.inputData>0 && (dir===border.UP||dir===border.LT)){ borders.reverse();} // 色分けの都合上の処理
			borders.setLineVal(this.inputData);
			borders.setQsub(0);
			this.prevblist = borders;

			this.puzzle.painter.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	},

	inputpeke : function(){
		var pos = this.getpos(0.22);
		if(this.btn==='right' && this.prevPos.equals(pos)){ return;}

		var border = pos.getb();
		if(border.isnull){ return;}

		if(this.inputData===null){ this.inputData=(border.qsub!==2?2:0);}
		border.setQsub(this.inputData);

		var d = border.getlinesize();
		this.board.borderinside(d.x1,d.y1,d.x2,d.y2).setLineVal(0);
		this.prevPos = pos;

		this.puzzle.painter.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		border.draw();
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
	maxnum : 8,

	getCountOfBridges : function(){
		var cnt=0, cblist=this.getdir4cblist();
		for(var i=0;i<cblist.length;i++){
			var border = cblist[i][1];
			if(!border.isnull && border.line>0){ cnt+=border.line;}
		}
		return cnt;
	},

	isCmp : function(){ // 描画用
		return this.puzzle.execConfig('autocmp') && (this.qnum === this.getCountOfBridges());
	},

	// pencilbox互換関数 ここではファイル入出力用
	getState : function(){
		if(this.qnum!==-1){ return 0;}
		var uborder=this.adjborder.top, lborder=this.adjborder.left;
		var datah = (!uborder.isnull ? uborder.line : 0);
		var dataw = (!lborder.isnull ? lborder.line : 0);
		return (datah>0?datah:0)+(dataw>0?(dataw<<2):0);
	},
	setState : function(val){
		if(val===0){ return;}
		var adb = this.adjborder;
		var datah = (val&3);
		if(datah>0){
			var uborder=adb.top, dborder=adb.bottom;
			if(!uborder.isnull){ uborder.line = datah;}
			if(!dborder.isnull){ dborder.line = datah;}
		}
		var dataw = ((val&12)>>2);
		if(dataw>0){
			var lborder=adb.left, rborder=adb.right;
			if(!lborder.isnull){ lborder.line = dataw;}
			if(!rborder.isnull){ rborder.line = dataw;}
		}
	}
},
Border:{
	getlinesize : function(){
		var pos1 = this.getaddr(), pos2 = pos1.clone();
		if(this.isVert()){
			while(pos1.move(-1,0).getc().noNum()){ pos1.move(-1,0);}
			while(pos2.move( 1,0).getc().noNum()){ pos2.move( 1,0);}
		}
		else{
			while(pos1.move(0,-1).getc().noNum()){ pos1.move(0,-1);}
			while(pos2.move(0, 1).getc().noNum()){ pos2.move(0, 1);}
		}
		if(pos1.getc().isnull || pos2.getc().isnull){ return {x1:-1,y1:-1,x2:-1,y2:-1};}
		return {x1:pos1.bx, y1:pos1.by, x2:pos2.bx, y2:pos2.by};
	}
},
BorderList:{
	setLineVal : function(num){ this.each(function(border){ border.setLineVal(num);});},
	setQsub    : function(num){ this.each(function(border){ border.setQsub(num);});},
	reverse : Array.prototype.reverse
},

Address:{
	getlineobj : function(pos){
		if(((pos.bx&1)===1 && this.bx===pos.bx && Math.abs(this.by-pos.by)===1) ||
		   ((pos.by&1)===1 && this.by===pos.by && Math.abs(this.bx-pos.bx)===1) )
			{ return (this.onborder() ? this : pos).getb();}
		return this.board.nullobj;
	}
},

Board:{
	cols : 9,
	rows : 9,

	hasborder : 1
},

LineGraph:{
	enabled : true,
	isLineCross : true,
	makeClist : true,

	iscrossing : function(cell){ return cell.noNum();}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	autocmp : "number",
	irowake : true,

	gridcolor_type : "THIN",

	circleratio : [0.47, 0.42],

	circlefillcolor_func : "qcmp",
	numbercolor_func : "qnum",

	// 線の太さを通常より少し太くする
	lwratio : 8,

	paint : function(){
		this.drawGrid(false, (this.puzzle.editmode && !this.outputImage));

		this.drawPekes();
		this.drawLines_hashikake();

		this.drawCircledNumbers();

		this.drawTarget();
	},

	// オーバーライド
	drawLines_hashikake : function(id){
		var g = this.vinc('line', 'crispEdges');

		// LineWidth, LineSpace
		var lw = this.lw, ls = lw*1.5;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], color = this.getLineColor(border);
			var isvert = border.isVert();
			var px = border.bx*this.bw, py = border.by*this.bh;
			var lm = this.lm + this.addlw/2; // LineMargin

			g.fillStyle = color;
			g.vid = "b_line_"+border.id;
			if(!!color && border.line===1){
				if(!isvert){ g.fillRectCenter(px, py, lm, this.bh+lm);}
				else       { g.fillRectCenter(px, py, this.bw+lm, lm);}
			}
			else{ g.vhide();}

			g.vid = "b_dline_"+border.id;
			if(!!color && border.line===2){
				g.beginPath();
				if(!isvert){
					g.rectcenter(px-ls, py, lm, this.bh+lm);
					g.rectcenter(px+ls, py, lm, this.bh+lm);
				}
				else{
					g.rectcenter(px, py-ls, this.bw+lm, lm);
					g.rectcenter(px, py+ls, this.bw+lm, lm);
				}
				g.fill();
			}
			else{ g.vhide();}
		}
	},

	repaintLines : function(blist){
		this.range.borders = blist;
		this.drawLines_hashikake();

		if(this.context.use.canvas){ this.repaintParts(blist);}
	},
	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawCircledNumbers();
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
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderLine();
	},

	kanpenOpen : function(){
		this.decodeCell( function(cell,ca){
			if(ca>="1" && ca<="8"){ cell.qnum = +ca;}
			else if(ca==="9")     { cell.qnum = -2;}
		});
		this.decodeCell( function(cell,ca){
			if(ca!=="0"){ cell.setState(+ca);}
		});
	},
	kanpenSave : function(){
		this.encodeCell( function(cell){
			if     (cell.qnum  > 0){ return cell.qnum+" ";}
			else if(cell.qnum===-2){ return "9 ";}
			else                   { return ". ";}
		});
		this.encodeCell( function(cell){
			return ''+cell.getState()+' ';
		});
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_XMLBoard();
		this.decodeBorderLine_hashikake_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_XMLBoard();
		this.encodeBorderLine_hashikake_XMLAnswer();
	},

	UNDECIDED_NUM_XML : 9,

	decodeBorderLine_hashikake_XMLAnswer : function(){
		this.decodeCellXMLArow(function(cell, name){
			cell.setState(+name.substr(1));
		});
	},
	encodeBorderLine_hashikake_XMLAnswer : function(){
		this.encodeCellXMLArow(function(cell){
			return 'n'+cell.getState();
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkLineExist+",
		"checkCrossConnectLine",
		"checkCellNumberNotOver",
		"checkConnectAllNumber",
		"checkCellNumberNotLess"
	],

	checkCellNumberNotOver :function(){
		this.checkAllCell(function(cell){ return cell.isValidNum() && (cell.qnum < cell.getCountOfBridges());}, "nmLineGt");
	},
	checkCellNumberNotLess :function(){
		this.checkAllCell(function(cell){ return cell.isValidNum() && (cell.qnum > cell.getCountOfBridges());}, "nmLineLt");
	}
},

FailCode:{
	nmLineGt : ["数字につながる橋の数が違います。","The number of connecting bridges to a number is not correct."],
	nmLineLt : ["数字につながる橋の数が違います。","The number of connecting bridges to a number is not correct."]
}
}));
