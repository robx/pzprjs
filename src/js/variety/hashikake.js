//
// パズル固有スクリプト部 橋をかけろ版 hashikake.js v3.4.1
//
pzpr.classmgr.makeCustom(['hashikake'], {
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
			if(this.mousestart){ this.inputqnum();}
		}
	},

	prevblist : null,
	mousereset : function(){
		this.common.mousereset.call(this);
		this.prevblist = new this.owner.BorderList();
	},

	inputLine : function(){
		var pos = this.getpos(0.20);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getlineobj(this.prevPos, pos);
		if(!border.isnull){
			var dir = this.getlinedir(this.prevPos, pos);
			var d = border.getlinesize();
			var borders = this.owner.board.borderinside(d.x1,d.y1,d.x2,d.y2);

			if(this.prevblist.length===0 || !this.prevblist.include(border)){ this.inputData=null;}
			
			if(this.inputData===null){ this.inputData = [1,2,0][border.line];}
			if(this.inputData>0 && (dir===border.UP||dir===border.LT)){ borders.reverse();} // 色分けの都合上の処理
			borders.setLineVal(this.inputData);
			borders.setQsub(0);
			this.prevblist = borders;

			this.owner.painter.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	},
	getlineobj : function(base, current){
		if(((current.bx&1)===1 && base.bx===current.bx && Math.abs(base.by-current.by)===1) ||
		   ((current.by&1)===1 && base.by===current.by && Math.abs(base.bx-current.bx)===1) )
			{ return (base.onborder() ? base : current).getb();}
		return this.owner.board.nullobj;
	},
	getlinedir : function(base, current){
		var dx = (current.bx-base.bx), dy = (current.by-base.by);
		if     (dx=== 0 && dy===-1){ return base.UP;}
		else if(dx=== 0 && dy=== 1){ return base.DN;}
		else if(dx===-1 && dy=== 0){ return base.LT;}
		else if(dx=== 1 && dy=== 0){ return base.RT;}
		return base.NDIR;
	},

	inputpeke : function(){
		var pos = this.getpos(0.22);
		if(this.btn.Right && this.prevPos.equals(pos)){ return;}

		var border = pos.getb();
		if(border.isnull){ return;}

		if(this.inputData===null){ this.inputData=(border.qsub!==2?2:0);}
		border.setQsub(this.inputData);

		var d = border.getlinesize();
		this.owner.board.borderinside(d.x1,d.y1,d.x2,d.y2).setLineVal(0);
		this.prevPos = pos;

		this.owner.painter.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
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

	isCmp : function(){
		return this.qnum === this.getCountOfBridges();
	},

	iscrossing : function(){ return this.noNum();},

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
	setQsub    : function(num){ this.each(function(border){ border.setQsub(num);});}
},

Board:{
	qcols : 9,
	qrows : 9,

	hasborder : 1
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

AreaLineManager:{
	enabled : true
},

Flags:{
	autocmp : "number",
	irowake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "THIN",

	globalfontsizeratio : 0.85,
	circleratio : [0.47, 0.42],

	circlefillcolor_func : "qcmp",

	// 線の太さを通常より少し太くする
	lwratio : 8,

	paint : function(){
		this.drawGrid(false, (this.owner.editmode && !this.outputImage));

		this.drawPekes();
		this.drawLines_hashikake();

		this.drawCircles();
		this.drawNumbers();

		this.drawTarget();
	},

	// オーバーライド
	drawLines_hashikake : function(id){
		var g = this.vinc('line', 'crispEdges', true);

		// LineWidth, LineMargin, LineSpace
		var lw = this.lw + this.addlw, lm = this.lm, ls = lw*1.5;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], color = this.getLineColor(border);
			var isvert = border.isVert();
			var px = border.bx*this.bw, py = border.by*this.bh;

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

		this.drawCircles();
		this.drawNumbers();
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
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnum_kanpen();
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
		this.decodeCell( function(obj,ca){
			if(ca>="1" && ca<="8"){ obj.qnum = parseInt(ca);}
			else if(ca==="9")     { obj.qnum = -2;}
		});
		this.decodeCell( function(cell,ca){
			if(ca!=="0"){ cell.setState(+ca);}
		});
	},
	kanpenSave : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum  > 0){ return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "9 ";}
			else                  { return ". ";}
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
});
