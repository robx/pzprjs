//
// パズル固有スクリプト部 ビルディングパズル版 building.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['building'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number'],play:['number','clear']},
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
				if(piece.isnull){}
				else if(piece.group==='cell'){ this.inputqnum();}
				else{ this.inputflash();}
			}
			else{ this.inputflash();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){
				this.inputqnum_excell();
			}
		}
	},

	// board.haslightがerrclear関数で消えてしまうのでその前に値を保存しておく
	mouseevent : function(step){
		this.isclearflash = false;
		if(step===0){
			var excell = this.getpos(0).getex();
			if(!excell.isnull && excell.qinfo===1){ this.isclearflash = true;}
		}

		this.common.mouseevent.call(this, step);
	},

	inputflash : function(){
		var excell = this.getpos(0).getex(), puzzle = this.puzzle, board = puzzle.board;
		if(excell.isnull || this.mouseCell===excell){ return;}

		if(this.isclearflash){
			board.lightclear();
			this.mousereset();
		}
		else{
			board.flashlight(excell);
			this.mouseCell = excell;
		}
	},

	inputqnum_excell : function(){
		var excell = this.getpos(0).getex();
		if(excell.isnull){ return;}

		if(excell!==this.cursor.getex()){
			this.setcursor(excell);
		}
		else{
			this.inputqnum_main(excell);
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
			this.key_inputqnum(ca);
		}
		else{
			var excell = this.cursor.getex();
			if(!excell.isnull){
				this.key_inputqnum_main(excell,ca);
			}
		}
	}
},

TargetCursor:{
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

	maxnum : function(){
		return Math.max(this.board.cols,this.board.rows);
	}
},

EXCell:{
	disInputHatena : true,

	maxnum : function(){
		var bd = this.board;
		if(this.by<0 || this.by>bd.rows*2){
			return bd.rows;
		}
		else{
			return bd.cols;
		}
	}
},

Board:{
	cols : 5,
	rows : 5,

	hasborder : 1,
	hasexcell : 2,

	flashlight : function(excell){
		this.lightclear();
		this.searchSight(excell, true);
		this.puzzle.redraw();
	},
	lightclear : function(){
		if(!this.hasinfo){ return;}
		for(var i=0;i<this.cell.length  ;i++){ this.cell[i].qinfo=0;}
		for(var i=0;i<this.excell.length;i++){ this.excell[i].qinfo=0;}
		this.haslight = false;
		this.puzzle.redraw();
	},
	searchSight : function(startexcell, seterror){
		var ccnt=0, ldata = [];
		for(var c=0;c<this.cell.length;c++){ ldata[c]=0;}

		var pos = startexcell.getaddr(), dir=0, height = 0;
		if     (pos.by===this.minby+1){ dir=2;}
		else if(pos.by===this.maxby-1){ dir=1;}
		else if(pos.bx===this.minbx+1){ dir=4;}
		else if(pos.bx===this.maxbx-1){ dir=3;}

		while(dir!==0){
			pos.movedir(dir,2);

			var cell = pos.getc();
			if(cell.isnull){ break;}

			if(cell.anum<=height){ continue;}
			height = cell.anum;
			ldata[cell.id]=1;
			ccnt++;
		}

		if(!!seterror){
			startexcell.qinfo = 1;
			for(var c=0;c<this.cell.length;c++){
				if(!!ldata[c]){ this.cell[c].qinfo=ldata[c];}
			}
			this.hasinfo = true;
		}

		return {cnt:ccnt};
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	lightcolor : "rgb(255, 255, 127)",

	paint : function(){
		this.drawBGCells();
		this.drawBGEXcells();
		this.drawTargetSubNumber();

		this.drawGrid();
		this.drawBorders();

		this.drawSubNumbers();
		this.drawAnsNumbers();
		this.drawArrowNumbersEXCell_skyscrapers();

		this.drawChassis();

		this.drawCursor();
	},

	getBGCellColor : function(cell){
		if(cell.error===1){ return this.errbcolor1;}
		else if(cell.qinfo===1){ return this.lightcolor;}
		return null;
	},
	getBGEXcellColor : function(excell){
		if(excell.error===1){ return this.errbcolor1;}
		else if(excell.qinfo===1){ return this.lightcolor;}
		return null;
	},

	drawArrowNumbersEXCell_skyscrapers : function(){
		var g = this.vinc('excell_number', 'auto'), bd = this.board;

		var tho = this.bw*0.5;		// y offset of horizonal arrows' head
		var tvo = this.bh*0.5;		// x offset of vertical arrows' head
		var thl = this.bw*0.3;		// length of horizonal arrows' head
		var tvl = this.bh*0.3;		// length of vertical arrows' head
		var thw = this.bh*0.25;		// width of horizonal arrows' head
		var tvw = this.bw*0.25;		// width of vertical arrows' head

		var option = {ratio : 0.7};

		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], num=excell.qnum;
			var px = excell.bx*this.bw, py = excell.by*this.bh;
			var text=(num>=0 ? ""+num : "");

			if(!!text){
				g.fillStyle = this.getQuesNumberColor(excell);
			}

			// 矢印の描画
			g.vid = "excell_arrow_"+excell.id;
			if(!!text){
				g.beginPath();
				if     (excell.by===bd.minby+1){ g.setOffsetLinePath(px,py+tvo, 0, tvl, tvw,0, -tvw,0);}
				else if(excell.by===bd.maxby-1){ g.setOffsetLinePath(px,py-tvo, 0,-tvl, tvw,0, -tvw,0);}
				else if(excell.bx===bd.minbx+1){ g.setOffsetLinePath(px+tho,py,  thl,0, 0,thw, 0,-thw);}
				else if(excell.bx===bd.maxbx-1){ g.setOffsetLinePath(px-tho,py, -thl,0, 0,thw, 0,-thw);}
				g.fill();
			}
			else{ g.vhide();}

			g.vid = "excell_text_"+excell.id;
			if(!!text){
				if     (excell.by===bd.minby+1){ py-=this.ch*0.1;}
				else if(excell.by===bd.maxby-1){ py+=this.ch*0.1;}
				else if(excell.bx===bd.minbx+1){ px-=this.cw*0.1;}
				else if(excell.bx===bd.maxbx-1){ px+=this.cw*0.1;}

				this.disptext(text, px, py, option);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber16EXCell();
	},
	encodePzpr : function(type){
		this.encodeNumber16EXCell();
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
		this.decodeCellEXCellQnumAnumsub();
	},
	encodeData : function(){
		this.encodeCellEXCellQnumAnumsub();
	},

	decodeCellEXCellQnumAnumsub : function(){
		this.decodeCellExcell(function(obj, ca){
			if(ca==="."){ return;}
			else if(obj.group==='excell'){
				obj.qnum = +ca;
			}
			else if(obj.group==='cell'){
				if(ca.indexOf('[')>=0){ ca = this.setCellSnum(obj,ca);}
				if(ca!=="."){ obj.anum = +ca;}
			}
		});
	},
	encodeCellEXCellQnumAnumsub : function(){
		this.encodeCellExcell(function(obj){
			if(obj.group==='excell'){
				if(obj.qnum!==-1){ return ""+obj.qnum+" ";}
			}
			else if(obj.group==='cell'){
				var ca = ".", num = obj.anum;
				if(num!==-1){ ca = ""+num;}
				else{ ca += this.getCellSnum(obj);}
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
		"checkSight",
		"checkNoNumCell+"
	],

	checkSight : function(type){
		var bd = this.board, result = true, errorExcell = new this.klass.EXCellList();
		for(var ec=0;ec<bd.excell.length;ec++){
			var excell = bd.excell[ec];
			if(excell.qnum===-1){ continue;}
			var count = bd.searchSight(excell, false).cnt;
			if(excell.qnum===count){ continue;}

			result = false;
			if(this.checkOnly){ break;}

			excell.seterr(1);
			errorExcell.add(excell);
		}
		if(!result){
			this.failcode.add("nmSightNe");
			errorExcell.each(function(excell){ bd.searchSight(excell, true);});
		}
	}
},

FailCode:{
	nmSightNe : ["見えるビルの数が正しくありません。", "The count of seeable buildings is wrong."]
}
}));
