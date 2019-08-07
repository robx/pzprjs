//
// パズル固有スクリプト部 ABCプレース版 easyasabc.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['easyasabc'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number'],play:['number','numexist','numblank','clear']},
	mouseinput_number: function(){
		if(this.mousestart){
			if(this.puzzle.editmode){ this.inputqnum_excell();}
			else                    { this.inputqnum();}
		}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart){
				var piece = this.getcell_excell();
				if(!piece.isnull && piece.group==='cell'){ this.inputqnum();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){
				this.inputqnum_excell();
			}
		}
	},

	inputqnum_excell : function(){
		var excell = this.getpos(0).getex();
		if(excell.isnull){ return;}

		if(excell!==this.cursor.getex()){
			this.setcursor(this.getpos(0));
		}
		else{
			if(excell.group==='excell'){
				this.inputqnum_main(excell);
			}
			else{
				var indicator = this.board.indicator;
				var val = this.getNewNumber(indicator, indicator.count);
				if(val===null){ return;}
				else if(val<=0){ val = (this.btn==='left' ? indicator.getminnum() : indicator.getmaxnum());}
				indicator.set(val);
			}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget  : function(ca){
		if(this.puzzle.playmode){
			return this.moveTCell(ca);
		}
		return this.moveEXCell(ca);
	},
	keyinput : function(ca){
		if(this.puzzle.playmode){
			var isSnum = (this.cursor.targetdir!==0);
			if(isSnum){}
			else if(ca==='1'){ ca='s1';}
			else if(ca==='2'){ ca='s2';}
			else if(ca==='3'){ ca='BS';}
			this.key_inputqnum(ca);
			if(!isSnum && ca===' '){ this.cursor.getc().clrSnum();}
		}
		else{
			if(this.cursor.by >= this.board.minby){
				var excell = this.cursor.getex();
				if(!excell.isnull){
					this.key_inputqnum_main(excell,ca);
				}
			}
			else{
				this.key_inputqnum_indicator(ca);
			}
		}
	},
	key_inputqnum_indicator : function(ca){
		var bd=this.puzzle.board;
		var val = this.getNewNumber(bd.indicator, ca, bd.indicator.count);
		if(val===null){ return;}
		bd.indicator.set(val);
		this.prev = bd.indicator;
	}
},

TargetCursor:{
	draw : function(){
		if(this.by >= this.board.minby){
			this.common.draw.call(this);
		}
		else{
			this.board.indicator.draw();
		}
	},

	initCursor : function(){
		this.init(-1,-1);
		this.adjust_init();
	},
	setminmax_customize : function(){
		if(this.puzzle.editmode){ return;}
		this.minx += 2;
		this.miny += 2;
		this.maxx -= 2;
		this.maxy -= 2;
	},
	adjust_init : function(){
		if(this.puzzle.playmode){
			this.common.adjust_init.call(this);
		}
		else if(this.puzzle.editmode){
			this.adjust_cell_to_excell();
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	enableSubNumberArray : true,
	numberWithMB : true,
	numberAsLetter : true,

	maxnum : function(){ return this.board.indicator.count;}
},

EXCell:{
	disInputHatena : true,
	numberAsLetter : true,

	maxnum : function(){ return this.board.indicator.count;}
},

Board:{
	cols : 5,
	rows : 5,
	hasexcell : 2,

	indicator : null,

	createExtraObject : function(){
		this.indicator = new this.klass.Indicator();
	},
	initExtraObject : function(col,row){
		this.indicator.init();
	},
	getex : function(bx,by){
		if(by>this.minby){
			return this.common.getex.call(this,bx,by);
		}
		else if(by===-3){
			return this.indicator;
		}
		return this.emptyexcell;
	},

	searchSight : function(startexcell, seterror){
		var pos = startexcell.getaddr(), dir=0, cell = this.emptycell;
		if     (pos.by===this.minby+1){ dir=2;}
		else if(pos.by===this.maxby-1){ dir=1;}
		else if(pos.bx===this.minbx+1){ dir=4;}
		else if(pos.bx===this.maxbx-1){ dir=3;}

		while(dir!==0){
			pos.movedir(dir,2);
			var cell2 = pos.getc();
			if(cell2.isnull){ break;}

			if(!cell2.isNumberObj()){ continue;}
			cell = cell2;
			break;
		}

		if(!!seterror){
			startexcell.error = 1;
			cell.error = 1;
		}

		return {dest:cell};
	}
},
Indicator:{
	count : 3,
	rect : null,
	numberAsLetter : true,
	initialize : function(val){
		if(!!val){ this.count = val;}
		this.rect = {bx1:-1, by1:-1, bx2:-1, by2:-1};
	},
	init : function(val){
		this.count = this.constructor.prototype.count;
		var bd=this.puzzle.board;
		this.rect = {
			bx1 : bd.maxbx-3.15, by1 : -3.8,
			bx2 : bd.maxbx-0.15, by2 : -2.2
		};
	},
	set : function(val){
		if(val<=0){ val = 1;}
		if(this.count !== val){
			this.addOpe(this.count, val);
			this.count = val;
			this.draw();
		}
	},
	getmaxnum:function(){
		var bd = this.board;
		return Math.max(bd.rows, bd.cols);
	},
	getminnum:function(){ return 1;},
	addOpe : function(old,num){
		this.puzzle.opemgr.add(new this.klass.IndicatorOperation(old, num));
	},
	draw : function(){
		this.puzzle.painter.paintRange(this.board.minbx,-1,this.board.maxbx,-1);
	}
},
"IndicatorOperation:Operation":{
	type : 'indicator',
	setData : function(old, num){
		this.old = old;
		this.num = num;
	},
	decode : function(strs){
		if(strs[0]!=='AS'){ return false;}
		this.old = +strs[1];
		this.num = +strs[2];
		return true;
	},
	toString : function(){
		return ['AS', this.old, this.num].join(',');
	},
	undo : function(){ this.exec(this.old);},
	redo : function(){ this.exec(this.num);},
	exec : function(num){
		this.board.indicator.set(num);
	}
},
OperationManager:{
	addExtraOperation : function(){
		this.operationlist.push(this.klass.IndicatorOperation);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawBGEXcells();
		this.drawTargetSubNumber();

		this.drawGrid();
		this.drawBorders();

		this.drawMBs();
		this.drawSubNumbers();
		this.drawAnsNumbers();
		this.drawNumbersEXcell();

		this.drawChassis();

		this.drawIndicator();
		this.drawCursor_easyasbac();
	},

	/* 上にアルファベット範囲の個数表示領域を追加 */
	getCanvasRows : function(){
		return this.getBoardRows()+2*this.margin+0.8;
	},
	getOffsetRows : function(){ return 1.45;},
	setRangeObject : function(x1,y1,x2,y2){
		this.common.setRangeObject.call(this,x1,y1,x2,y2);
		this.range.indicator = (y1<0);
	},
	copyBufferData : function(g,g2,x1,y1,x2,y2){
		this.common.copyBufferData.call(this,g,g2,x1,y1,x2,y2);
		if(g.use.canvas && this.range.indicator){
			var bd = this.board;
			var sx1 = 0, sy1 = 0, sx2 = g2.child.width, sy2 = bd.minby*this.bh+this.y0;
			g.context.clearRect(sx1, sy1-this.y0, sx2, sy2);
			g.drawImage(g2.child, sx1, sy1, (sx2-sx1), (sy2-sy1), sx1-this.x0, sy1-this.y0, (sx2-sx1), (sy2-sy1));
		}
	},

	drawIndicator : function(){
		var g = this.vinc('indicator', 'auto', true), bd = this.board;
		if(!this.range.indicator){ return;}

		if(g.use.canvas){
			g.context.clearRect(0, -this.y0, g.child.width, bd.minby*this.bh+this.y0);
		}

		g.fillStyle = this.quescolor;

		g.vid = 'bd_indicator';
		g.font         = ((this.ch*0.66)|0) + "px " + this.fontfamily;
		g.textAlign    = 'right';
		g.textBaseline = 'middle';
		g.fillText("(A-"+this.getNumberTextCore_letter(bd.indicator.count)+")", (bd.maxbx-0.2)*this.bw, -3*this.bh);
	},
	drawCursor_easyasbac : function(){
		var isOnBoard = (this.puzzle.board.minby <= this.puzzle.cursor.by);
		var isOnIndicator = !isOnBoard;
		this.drawCursor(true, isOnBoard);
		this.drawCursorOnIndicator(isOnIndicator);
	},
	drawCursorOnIndicator : function(isdraw){
		var g = this.vinc('target_cursor_indicator', 'crispEdges', true), bd = this.board;
		if(!this.range.indicator){ return;}

		var isdraw = (isdraw && this.puzzle.editmode && this.puzzle.getConfig('cursor') && !this.outputImage);
		g.vid = "ti";
		if(isdraw){
			var rect = bd.indicator.rect;
			g.strokeStyle = this.targetColor1;
			g.lineWidth = (Math.max(this.cw/16, 2))|0;
			g.strokeRect(rect.bx1*this.bw, rect.by1*this.bh, (rect.bx2-rect.bx1)*this.bw, (rect.by2-rect.by1)*this.bh);
		}
		else{ g.vhide();}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeIndicator();
		this.decodeNumber16EXCell();
	},
	encodePzpr : function(type){
		this.encodeIndicator();
		this.encodeNumber16EXCell();
	},

	decodeIndicator : function(){
		var barray = this.outbstr.split("/"), bd = this.board;
		bd.indicator.count = +barray[0];
		this.outbstr = (!!barray[1] ? barray[1] : '');
	},
	encodeIndicator : function(){
		this.outbstr = (this.board.indicator.count+"/");
	},

	decodeNumber16EXCell : function(){
		// 盤面外数字のデコード
		var ec=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell=bd.excell[ec];
			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
			                 { excell.qnum = parseInt(bstr.substr(i  ,1),16);}
			else if(ca==='-'){ excell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca==='.'){ excell.qnum = -2;}
			else if(ca >= 'g' && ca <= 'z'){ ec += (parseInt(ca,36)-16);}

			ec++;
			if(ec>=bd.excell.length){ break;}
		}

		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber16EXCell : function(){
		// 盤面外数字のエンコード
		var count=0, cm="", bd = this.board;
		for(var ec=0;ec<bd.excell.length;ec++){
			var pstr = "", qn = bd.excell[ec].qnum;

			if     (qn=== -2           ){ pstr = ".";}
			else if(qn>=   0 && qn<  16){ pstr =       qn.toString(16);}
			else if(qn>=  16 && qn< 256){ pstr = "-" + qn.toString(16);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeIndicator();
		this.decodeCellEXCellQnumAnumsub();
	},
	encodeData : function(){
		this.encodeIndicator();
		this.encodeCellEXCellQnumAnumsub();
	},

	decodeIndicator : function(){
		this.board.indicator.count = +this.readLine();
	},
	encodeIndicator : function(){
		this.writeLine(this.board.indicator.count);
	},

	decodeCellEXCellQnumAnumsub : function(){
		this.decodeCellExcell(function(obj, ca){
			if(ca==="."){ return;}
			else if(obj.group==='excell'){
				obj.qnum = +ca;
			}
			else if(obj.group==='cell'){
				if(ca.indexOf('[')>=0){ ca = this.setCellSnum(obj,ca);}
				if     (ca==="+"){ obj.qsub = 1;}
				else if(ca==="-"){ obj.qsub = 2;}
				else if(ca!=="."){ obj.anum = +ca;}
			}
		});
	},
	encodeCellEXCellQnumAnumsub : function(){
		this.encodeCellExcell(function(obj){
			if(obj.group==='excell'){
				if(obj.qnum!==-1){ return ""+obj.qnum+" ";}
			}
			else if(obj.group==='cell'){
				var ca = ".";
				if     (obj.anum!==-1){ ca = ""+obj.anum;}
				else if(obj.qsub===1) { ca = "+";}
				else if(obj.qsub===2) { ca = "-";}
				if(obj.anum===-1){ ca += this.getCellSnum(obj);}
				return ca+" ";
			}
			return ". ";
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkDifferentNumberInLine",
		"checkSight+",
		"checkNumberSaturatedInLine"
	],

	checkNumberSaturatedInLine : function(){
		this.checkRowsCols(this.isNumberSaturatedInClist, "nmMissRow");
	},
	isNumberSaturatedInClist : function(clist){
		if(clist.length<=0){ return true;}
		var result = true, d = [];
		var max = this.board.indicator.count, bottom = 1;
		for(var n=bottom;n<=max;n++){ d[n]=0;}
		for(var i=0;i<clist.length;i++){ if(clist[i].anum>=bottom){ d[clist[i].anum]++;} }
		for(var n=bottom;n<=max;n++){ if(d[n]===0){ result = false; break;}}

		if(!result){ clist.seterr(1);}
		return result;
	},

	checkSight : function(type){
		var bd = this.board, result = true;
		for(var ec=0;ec<bd.excell.length;ec++){
			var excell = bd.excell[ec];
			if(excell.qnum===-1){ continue;}
			var cell = bd.searchSight(excell, false).dest;
			if(cell.isnull || excell.qnum===cell.anum || cell.qsub===1){ continue;}

			result = false;
			if(this.checkOnly){ break;}

			excell.seterr(1);
			bd.searchSight(excell, true);
		}
		if(!result){
			this.failcode.add("nmSightNe");
		}
	}
},

FailCode:{
	nmDupRow  : ["同じ列に同じアルファベットが入っています。","There are same letters in a row."],
	nmMissRow : ["列に入っていないアルファベットがあります。","There are missing letters in a row."],
	nmSightNe : ["アルファベットが最も手前にありません。", "The letter is not the closest."]
}
}));
