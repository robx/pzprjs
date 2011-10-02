//
// パズル固有スクリプト部 ひとりにしてくれ hitori.js v3.4.0
//
pzprv3.custom.hitori = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	},
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	disInputHatena : true,

	nummaxfunc : function(){
		return Math.max(bd.qcols,bd.qrows);
	}
},
Board:{
	qcols : 8,
	qrows : 8
},

AreaManager:{
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addRedBlockRBToFlags();

		pp.addCheck('plred','setting',false, '重複した数字を表示', 'Show overlapped number');
		pp.setLabel('plred', '重複している数字を赤くする', 'Show overlapped number as red.');
		pp.funcs['plred'] = function(){ pc.paintAll();};
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.fontErrcolor = "red";
		this.fontBCellcolor = "rgb(96,96,96)";
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers_hitori();

		this.drawChassis();

		this.drawTarget();
	},

	drawNumbers_hitori : function(){
		this.drawNumbers();

		if(!bd.haserror && pp.getVal('plred')){
			ans.inCheck = true;
			ans.checkRowsCols(ans.isDifferentNumberInClist_hitori, function(cell){ return cell.getQnum();});
			ans.inCheck = false;

			for(var i=0;i<bd.cellmax;i++){ this.drawNumber1(bd.cell[i]);}

			bd.haserror = true;
			bd.errclear(false);
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeHitori();
	},
	pzlexport : function(type){
		this.encodeHitori();
	},

	decodeHitori : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z"))
							 { bd.cell[c].qnum = parseInt(ca,36);}
			else if(ca==='-'){ bd.cell[c].qnum = parseInt(bstr.substr(i+1,2),36); i+=2;}
			else if(ca==='%'){ bd.cell[c].qnum = -2;}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeHitori : function(){
		var count=0, cm="";
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", qn= bd.cell[c].qnum;

			if     (qn===-2)       { pstr = "%";}
			else if(qn>= 0&&qn< 16){ pstr =       qn.toString(36);}
			else if(qn>=16&&qn<256){ pstr = "-" + qn.toString(36);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else{ cm+="."; count=0;}
		}
		if(count>0){ cm+=".";}

		this.outbstr += cm;
	},

	decodeKanpen : function(){
		fio.decodeCellQnum_kanpen_hitori();
	},
	encodeKanpen : function(){
		fio.encodeCellQnum_kanpen_hitori();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAns();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen_hitori();
		this.decodeCellAns();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen_hitori();
		this.encodeCellAns();
	},

	decodeCellQnum_kanpen_hitori : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="0" && ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnum_kanpen_hitori : function(){
		this.encodeCell( function(obj){
			return ((obj.qnum>0)?(obj.qnum.toString() + " "):"0 ");
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSideCell(function(cell1,cell2){ return (cell1.isBlack() && cell2.isBlack());}) ){
			this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !this.checkRBBlackCell( bd.areas.getWCellInfo() ) ){
			this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}

		if( !this.checkRowsCols(this.isDifferentNumberInClist_hitori, function(cell){ return cell.getQnum();}) ){
			this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		return true;
	},

	isDifferentNumberInClist_hitori : function(clist, numfunc){
		var clist2 = clist.filter(function(cell){ return (cell.isWhite() && cell.isNum());});
		return this.isDifferentNumberInClist(clist2, numfunc);
	}
}
};
