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

	iscrossing : function(){ return this.noNum();}
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
		var g = this.vinc('line', 'crispEdges');

		// LineWidth, LineMargin, LineSpace
		var lw = this.lw + this.addlw, lm = this.lm, ls = lw*1.5;

		var headers = ["b_line_","b_dline1_","b_dline2_"];
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], id = border.id, color = this.getLineColor(border);
			if(!!color){
				g.fillStyle = color;
				var isvert = border.isVert();
				var px = border.bx*this.bw, py = border.by*this.bh;

				if(border.line===1){
					if(this.vnop(headers[0]+id,this.FILL)){
						if(!isvert){ g.fillRectCenter(px, py, lm, this.bh+lm);}
						else       { g.fillRectCenter(px, py, this.bw+lm, lm);}
					}
				}
				else{ g.vhide(headers[0]+id);}

				if(border.line===2){
					if(this.vnop(headers[1]+id,this.FILL)){
						if(!isvert){ g.fillRectCenter(px-ls, py, lm, this.bh+lm);}
						else       { g.fillRectCenter(px, py-ls, this.bw+lm, lm);}
					}
					if(this.vnop(headers[2]+id,this.FILL)){
						if(!isvert){ g.fillRectCenter(px+ls, py, lm, this.bh+lm);}
						else       { g.fillRectCenter(px, py+ls, this.bw+lm, lm);}
					}
				}
				else{ g.vhide([headers[1]+id, headers[2]+id]);}
			}
			else{ g.vhide([headers[0]+id, headers[1]+id, headers[2]+id]);}
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
		this.decodeCell( function(obj,ca){
			if(ca==="0"){ return;}
			var adb = obj.adjborder;
			var val = parseInt(ca);
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
		});
	},
	kanpenSave : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum  > 0){ return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "9 ";}
			else                  { return ". ";}
		});
		this.encodeCell( function(obj){
			if(obj.qnum!==-1){ return "0 ";}
			var uborder=obj.adjborder.top, lborder=obj.adjborder.left;
			var datah = (!uborder.isnull ? uborder.line : 0);
			var dataw = (!lborder.isnull ? lborder.line : 0);
			return ""+((datah>0?datah:0)+(dataw>0?(dataw<<2):0))+" ";
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkCellNumberNotOver() ){ return 'nmLineCntGt';}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkOneLine(linfo) ){ return 'lcDivided';}

		if( !this.checkCellNumberNotLess() ){ return 'nmLineCntLt';}

		return null;
	},

	checkCellNumberNotOver :function(){
		return this.checkAllCell(function(cell){ return cell.isValidNum() && (cell.qnum < cell.getCountOfBridges());});
	},
	checkCellNumberNotLess :function(){
		return this.checkAllCell(function(cell){ return cell.isValidNum() && (cell.qnum > cell.getCountOfBridges());});
	}
},

FailCode:{
	nmLineCntGt : ["数字につながる橋の数が違います。","The number of connecting bridges to a number is not correct."],
	nmLineCntLt : ["数字につながる橋の数が違います。","The number of connecting bridges to a number is not correct."]
}
});
