//
// パズル固有スクリプト部 ヘルゴルフ版 herugolf.js v3.4.1
//
pzpr.classmgr.makeCustom(['herugolf'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputMoveLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			var cell = this.getcell();
			if(this.mousestart || this.mousemove){
				if(this.btn.Right && cell.ques!==31 && cell.qnum===-1){ this.inputWater();}
			}
			else if(this.mouseend && this.notInputted()){
				if(!cell.ice()){ this.inputqnum_herugolf();}
			}
		}
	},

	/* inputLine, inputautodarkはぼんさんのものと同じ */
	inputLine : function(){
		this.common.inputLine.call(this);
		
		/* "丸数字を移動表示しない"場合の背景色描画準備 */
		if(this.owner.execConfig('autocmp') && !this.owner.execConfig('dispmove') && !this.notInputted()){
			this.inputautodark();
		}
	},
	inputautodark : function(){
		/* 最後に入力した線を取得する */
		var opemgr = this.owner.opemgr, lastope = opemgr.lastope;
		if(lastope.group!=='border' || lastope.property!=='line'){ return;}
		var border = this.owner.board.getb(lastope.bx, lastope.by);
		
		/* 線を引いた/消した箇所にある領域を取得 */
		var linfo = this.owner.board.linfo;
		var clist = new this.owner.CellList();
		Array.prototype.push.apply(clist, border.lineedge);
		clist = clist.notnull().filter(function(cell){ return !!linfo.id[cell.id];});
		
		/* 改めて描画対象となるセルを取得して再描画 */
		clist.each(function(cell){
			linfo.getClistByCell(cell).each(function(cell){ if(cell.isNum()){ cell.draw();}});
		});
	},

	inputMoveLine : function(){
		/* "ものを動かしたように描画する"でなければinputLineと同じ */
		if(!this.owner.execConfig('dispmove')){
			this.inputLine();
			return;
		}
		
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var cell0 = this.mouseCell, pos = cell.getaddr();
		/* 初回はこの中に入ってきます。 */
		if(this.mousestart && cell.isDestination()){
			this.mouseCell = cell;
			this.prevPos = pos;
			cell.draw();
		}
		/* 移動中の場合 */
		else if(this.mousemove && !cell0.isnull && !cell.isDestination()){
			var border = this.getnb(this.prevPos, pos);
			if(!border.isnull && ((!border.isLine() && cell.lcnt===0) || (border.isLine() && cell0.lcnt===1))){
				/* この条件を追加 */
				if(border.isLine() || border.sidecell[0].distance>0 || border.sidecell[1].distance>0){
					this.mouseCell = cell;
					this.prevPos = pos;
					if(!border.isLine()){ border.setLine();}else{ border.removeLine();}
					border.draw();
				}
			}
		}
	},

	inputWater : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(this.inputData===null){ this.inputData = (cell.ice()?0:6);}

		cell.setQues(this.inputData);
		cell.drawaround();
		this.mouseCell = cell;
	},

	inputqnum_herugolf : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			if(this.inputcell_herugolf(cell)){ return;}
			
			if(cell.ques===0){
				this.inputqnum_main(cell);
			}
		}
		this.mouseCell = cell;
	},
	inputcell_herugolf : function(cell){
		var val = null;
		/* inputqnum_mainの空白-?マーク間にHoleのフェーズを挿入する */
		if(cell.ques===31){
			if     (this.btn.Left) { val = -2;}
			else if(this.btn.Right){ val = -1;}
		}
		else if(cell.ques===0 && cell.qnum===-1){
			if(this.btn.Left){ val = -3;}
		}
		else if(cell.qnum===-2){
			if(this.btn.Right){ val = -3;}
		}

		if(val===-3){
			cell.setQues(31);
			cell.setQnum(-1);
			cell.draw();
		}
		else if(val===-1){
			cell.setQues(0);
			cell.setQnum(-1);
			cell.draw();
		}
		else if(val===-2){
			cell.setQues(0);
			cell.setQnum(-2);
			cell.draw();
		}

		return (val!==null);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputqnum_herugolf(ca);
	},
	key_inputqnum_herugolf : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q'||ca==='w'){
			cell.setQues(cell.ice()?0:6);
		}
		else if(ca==='h'){
			cell.setQues(cell.ques===31?0:31);
		}
		else if(ca===' '){
			cell.setQues(0);
		}
		else if(!cell.ice()){
			this.key_inputqnum(ca);
		}
		this.prev=cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	distance : null,
	
	isViaPoint : function(){
		if(this.distance===null){ return false;}
		var n=this.distance, k=0;
		while(n>0){ n-=++k;}
		return (n===0);
	},
	isCmp : function(){
		if(this.owner.execConfig('dispmove')){
			return (this.ques===31 && this.base.qnum!==-1 && this.isViaPoint());
		}
		else if(this.qnum!==-1){
			var clist = this.owner.board.linfo.getClistByCell(this);
			for(var i=0,len=clist.length;i<len;i++){
				if(clist[i].base===this && clist[i].ques===31 && clist[i].isViaPoint()){ return true;}
			}
		}
		return false;
	},
	maxnum : function(){
		var bd = this.owner.board, cx = (this.bx>>1), cy = (this.by>>1);
		return Math.max(cx, cy, bd.qcols-1-cx, bd.qrows-1-cy);
	},

	getDestination : function(){
		var bd = this.owner.board, linfo = bd.linfo, areaid = linfo.id[this.id];
		return (areaid!==null ? linfo.area[areaid].destination : bd.emptycell);
	},
	getDeparture : function(){
		var bd = this.owner.board, linfo = bd.linfo, areaid = linfo.id[this.id];
		return (areaid!==null ? linfo.area[areaid].departure : bd.emptycell);
	}
},
Board:{
	hasborder : 1,

	initialize : function(){
		this.common.initialize.call(this);

		this.waterinfo = this.addInfoList(this.owner.AreaWaterManager);
	}
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true,
	moveline : true,

	initMovedBase : function(clist){
		for(var i=0;i<clist.length;i++){ clist[i].distance = null;}
		
		pzpr.common.AreaLineManager.prototype.initMovedBase.call(this, clist);
	},
	setMovedBase : function(areaid){
		pzpr.common.AreaLineManager.prototype.setMovedBase.call(this, areaid);
		
		var area = this.area[areaid];
		if(!area.movevalid){ return;}
		
		var cell = area.departure, num = area.departure.qnum;
		num = (num>0 ? num : this.owner.board.cellmax);
		cell.distance = (num+1)*num/2;
		
		/* area.departureは線が1方向にしかふられていないはず */
		var dir = +({1:1,2:2,4:3,8:4}[this.linkinfo[cell.id] & 0x0F]);
		var pos = cell.getaddr(), n = cell.distance;
		while(1){
			pos.movedir(dir,2);
			var cell = pos.getc(), adb = cell.adjborder;
			if(cell.isnull || cell.lcnt>=3 || cell.lcnt===0){ break;}
			
			cell.distance = --n;
			if(cell===area.destination){ break;}
			else if(dir!==1 && adb.bottom.isLine()){ dir=2;}
			else if(dir!==2 && adb.top.isLine()   ){ dir=1;}
			else if(dir!==3 && adb.right.isLine() ){ dir=4;}
			else if(dir!==4 && adb.left.isLine()  ){ dir=3;}
		}
	}
},
"AreaWaterManager:AreaManager":{
	enabled : true,
	relation : ['cell'],
	isvalid : function(cell){ return cell.ice();}
},

Flags:{
	autocmp : "number"
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",

	globalfontsizeratio : 0.85,

	bgcellcolor_func : "icebarn",
	bordercolor_func : "ice",
	circlefillcolor_func : "qcmp",

	invalidlinecolor : "silver",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawTip_herugolf();
		this.drawViaPoints();
		this.drawLines();

		this.drawCircles();
		this.drawNumbers();
		this.drawHoles();

		this.drawPekes();

		this.drawChassis();

		this.drawTarget();
	},

	drawNumber1 : function(cell){
		var text = this.getCircleCaption(cell);
		var option = { key: "cell_text_"+cell.id };
		if(!!text){
			option.color = this.getCellNumberColor(cell);
		}
		this.disptext(text, (cell.bx*this.bw), (cell.by*this.bh), option);
	},
	getCircleCaption : function(cell){
		if(this.owner.execConfig('dispmove')){
			if(!cell.isDestination() || cell.base.qnum<0){ return "";}
			/* cell.isViaPointに似ている関数 */
			var n=cell.distance, k=0;
			while(n>0){ n-=++k;}
			return ""+k;
		}
		else{
			var num = cell.getNum();
			return (num>=0 ? ""+num : "");
		}
	},

	getLineColor : function(border){
		this.addlw = 0;
		if(border.isLine()){
			var info = border.error || border.qinfo;
			if(info===1){
				if(this.context.use.canvas){ this.addlw=1;}
				return this.errlinecolor;
			}
			else if(info===-1){ return this.errlinebgcolor;}
			
			var cells = border.sidecell;
			var isvalidline = (cells[0].distance>=0 && cells[1].distance>=0);
			if(this.owner.execConfig('dispmove')){
				return (isvalidline ? this.movelinecolor : this.errlinecolor);
			}
			else{
				return (isvalidline ? this.linecolor : this.invalidlinecolor);
			}
		}
		return null;
	},

	drawTip_herugolf : function(){
		var g = this.vinc('cell_linetip', 'auto');

		var tsize = this.cw*0.30;
		var tplus = this.cw*0.05;
		var header = "c_tip_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vdel(header+cell.id);
			if(cell.qnum===-1 && !this.owner.execConfig('dispmove')){
				var adc = cell.adjacent, adb = cell.adjborder, dir=0, border=null;
				if     (adb.top.isLine()    && (cell.lcnt===1 || (cell.isViaPoint() && adc.top.distance   ===cell.distance+1))){ dir=2; border=adb.top;   }
				else if(adb.bottom.isLine() && (cell.lcnt===1 || (cell.isViaPoint() && adc.bottom.distance===cell.distance+1))){ dir=1; border=adb.bottom;}
				else if(adb.left.isLine()   && (cell.lcnt===1 || (cell.isViaPoint() && adc.left.distance  ===cell.distance+1))){ dir=4; border=adb.left;  }
				else if(adb.right.isLine()  && (cell.lcnt===1 || (cell.isViaPoint() && adc.right.distance ===cell.distance+1))){ dir=3; border=adb.right; }
				else{ continue;}

				g.lineWidth = this.lw; //LineWidth
				var info = border.error || border.qinfo;
				if     (info=== 1)       { g.strokeStyle = this.errlinecolor; g.lineWidth=g.lineWidth+1;}
				else if(info===-1)       { g.strokeStyle = this.errlinebgcolor;}
				else if(cell.distance>=0){ g.strokeStyle = this.linecolor;}
				else                     { g.strokeStyle = this.invalidlinecolor;}

				if(this.vnop(header+cell.id,this.STROKE)){
					var px = cell.bx*this.bw+1, py = cell.by*this.bh+1;
					if     (dir===1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
					else if(dir===2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
					else if(dir===3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
					else if(dir===4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
					g.stroke();
				}
			}
		}
	},

	drawHoles : function(){
		this.vinc('cell_hole', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], text = ((cell.ques===31 && !(this.owner.execConfig('dispmove') && cell.isDestination())) ? "H" : "");
			var option = { key:"cell_hole_text_"+cell.id };
			option.globalratio = 1;
			this.disptext(text, (cell.bx*this.bw), (cell.by*this.bh), option);
		}
	},

	// drawDeparturesから派生
	drawViaPoints : function(){
		var g = this.vinc('cell_via', 'auto');
		var rsize  = this.cw*0.15;
		var header = "c_dcir_";
		var isdrawmove = this.owner.execConfig('dispmove');
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px = cell.bx*this.bw, py = cell.by*this.bh;
			if(isdrawmove && cell.isViaPoint()){
				g.fillStyle = this.movelinecolor;
				if(this.vnop(header+cell.id,this.NONE)){
					g.fillCircle(px, py, rsize);
				}
			}
			else{ g.vhide(header+cell.id);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeIce();
		this.decodeNumber16_herugolf();
	},
	encodePzpr : function(type){
		this.encodeIce();
		this.encodeNumber16_herugolf();
	},

	/* 0-9a-fは数字、hはHole, i-zは空白とします (gは未使用) */
	decodeNumber16_herugolf : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qnum = parseInt(ca,16);}
			else if(ca === 'h'){ cell.ques = 31;}
			else if(ca >= 'i' && ca <= 'z'){ c += (parseInt(ca,36)-18);}

			c++;
			if(c >= bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber16_herugolf : function(){
		var count=0, cm="", bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", cell = bd.cell[c], qn = cell.qnum, qu = cell.ques;

			if     (qn===-2          ){ pstr = ".";}
			else if(qn>=  0 && qn< 16){ pstr =       qn.toString(16);}
			else if(qn>= 16 && qn<256){ pstr = "-" + qn.toString(16);}
			else if(qu===31          ){ pstr = "h";}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===18){ cm+=((17+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(17+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="H"){ cell.ques = 31;}
			else if(ca==="i"){ cell.ques = 6;}
			else if(ca!=="."){ cell.qnum = parseInt(ca);}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			if     (cell.ques===31){ return "H ";}
			else if(cell.ques=== 6){ return "i ";}
			else if(cell.qnum >  0){ return cell.qnum.toString()+" ";}
			else{ return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var bd = this.owner.board;

		if( !this.checkLineCount(3) ){ return 'lnBranch';}
		if( !this.checkLineCount(4) ){ return 'lnCross';}

		var linfo = bd.getLareaInfo();

		if( !this.checkDoubleObject(linfo) ){ return 'nmConnected';}
		if( !this.checkLineOverLetter() ){ return 'laOnNum';}

		if( !this.checkLineOverHole() ){ return 'laOnHole';}

		if( !this.checkCurveHalfway() ){ return 'laCurve';}

		if( !this.checkMoveOver() ){ return 'laMoveOver';}

		if( !this.checkStopHalfway() ){ return 'laLenNe';}

		if( !this.checkWaterHazard() ){ return 'laWaterHazard';}

		if( !this.checkCupIn() ){ return 'nmOutOfHole';}

		if( !this.checkIgnoredHole() ){ return 'nmIgnored';}

		if( !this.checkDisconnectLine(linfo) ){ return 'laIsolate';}

		return null;
	},
	
	checkMoveOver : function(){
		var result = true, bd = this.owner.board;
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
			if(!border.isLine()){ continue;}
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(cell1.distance<0 || cell2.distance<0){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				border.seterr(1);
				(this.owner.execConfig('dispmove') ? cell1.getDestination() : cell1.getDeparture()).seterr(1);
				result = false;
			}
		}
		return result;
	},
	checkLineOverHole : function(){
		return this.checkAllCell(function(cell){ return (cell.ques===31 && cell.lcnt>=2);});
	},
	checkStopHalfway : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===1 && cell.distance >=0 && !cell.isViaPoint());});
	},
	checkCurveHalfway : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===2 && !cell.isLineStraight() && !cell.isViaPoint());});
	},
	checkWaterHazard : function(){
		return this.checkAllCell(function(cell){ return (cell.ques===6 && cell.isViaPoint());});
	},
	checkCupIn : function(){
		if(this.owner.execConfig('dispmove')){
			return this.checkAllCell(function(cell){ return (cell.ques!==31 && cell.isDestination());});
		}
		else{
			return this.checkAllCell(function(cell){ return (cell.qnum!==-1 && cell.getDestination().ques!==31);});
		}
	},
	checkIgnoredHole : function(){
		return this.checkAllCell(function(cell){ return (cell.ques===31 && !cell.isDestination());});
	}
},

FailCode:{
	laIsolate    : ["ボールにつながっていない線があります。","A line doesn't connect any ball."],
	laOnNum      : ["ボールの上を線が通過しています。","A line goes through a ball."],
	laOnHole     : ["ホールの上を線が通過しています。","A line goes through a hole."],
	laCurve      : ["ボールが移動途中に曲がっています。","A ball curves halfway."],
	laLenNe      : ["ボールが移動途中に止まっています。","A ball stops halfway."],
	laMoveOver   : ["ボールが指示された打数を超えて動いています。","You make a bogey or more."],
	laWaterHazard: ["ウォーターハザードになっています。", ""],
	nmConnected  : ["ボールが繋がっています。","There are connected balls."],
	nmOutOfHole  : ["ホールに入っていないボールがあります。","A ball doesn't cup in."],
	nmIgnored    : ["ボールの入っていないホールがあります。","There is a Hole without a ball."]
}
});
