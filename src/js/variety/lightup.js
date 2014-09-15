//
// パズル固有スクリプト部 美術館版 lightup.js v3.4.1
//
pzpr.classmgr.makeCustom(['lightup'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || (this.mousemove && (this.inputData!==1))){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
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
	qlight : 0,
	akariinfo : 0, /* 0:なし 1:あかり 2:黒マス */

	numberRemainsUnshaded : true,

	maxnum : 4,
	minnum : 0,

	posthook : {
		qnum : function(num){ this.setAkariInfo(num);},
		qans : function(num){ this.setAkariInfo(num);}
	},

	isAkari : function(){ return this.qans===1;},

	setAkariInfo : function(num){
		var val=0, old = this.akariinfo;
		if     (this.qnum!==-1){ val=2;}
		else if(this.qans=== 1){ val=1;}
		if(old===val){ return;}

		this.akariinfo = val;
		this.setQlight(old, val);
	},
	setQlight : function(old, val){
		var clist = this.akariRangeClist();
		if(old===0 && val===1){
			for(var i=0;i<clist.length;i++){ clist[i].qlight=1;}
		}
		else{
			for(var i=0;i<clist.length;i++){
				var cell2 = clist[i], ql_old=cell2.qlight;
				if(ql_old===0 && ((old===1 && val===0) || (old===0 && val===2))){ continue;}
				if(ql_old===1 && (old===2 && val===0)){ continue;}

				cell2.qlight = (cell2.akariRangeClist().some(function(cell){ return cell.isAkari();}) ? 1 : 0);
			}
			if(val===2){ this.qlight = 0;}
		}

		var d=this.akariRange();
		this.owner.painter.paintRange(d.x1-1, this.by-1, d.x2+1, this.by+1);
		this.owner.painter.paintRange(this.bx-1, d.y1-1, this.bx+1, d.y2+1);
	},

	akariRangeClist : function(){
		var cell, clist=new this.owner.CellList(), adc=this.adjacent;

		clist.add(this);
		cell=adc.left;   while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.adjacent.left;  }
		cell=adc.right;  while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.adjacent.right; }
		cell=adc.top;    while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.adjacent.top;   }
		cell=adc.bottom; while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.adjacent.bottom;}
		return clist;
	},
	akariRange : function(){
		var cell, cell2, d={}, adc=this.adjacent;

		cell=this; cell2=adc.left;   while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.adjacent.left;  } d.x1=cell.bx;
		cell=this; cell2=adc.right;  while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.adjacent.right; } d.x2=cell.bx;
		cell=this; cell2=adc.top;    while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.adjacent.top;   } d.y1=cell.by;
		cell=this; cell2=adc.bottom; while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.adjacent.bottom;} d.y2=cell.by;
		return d;
	}
},

Board:{
	resetInfo : function(){
		this.initQlight();
	},

	initQlight : function(){
		for(var c=0;c<this.cellmax;c++){
			var cell = this.cell[c];
			cell.qlight = 0;
			cell.akariinfo = 0;
			if     (cell.qnum!==-1){ cell.akariinfo=2;}
			else if(cell.qans=== 1){ cell.akariinfo=1;}
		}
		for(var c=0;c<this.cellmax;c++){
			var cell = this.cell[c];
			if(cell.akariinfo!==1){ continue;}

			var clist = cell.akariRangeClist();
			for(var i=0;i<clist.length;i++){ clist[i].qlight=1;}
		}
	}
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",
	dotcolor_type : "PINK",

	cellcolor_func : "qnum",

	fontcolor    : "white",
	fontErrcolor : "white",

	lightcolor : "rgb(192, 255, 127)",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();
		this.drawNumbers();

		this.drawAkari();
		this.drawDotCells(true);

		this.drawChassis();

		this.drawTarget();
	},

	// オーバーライド drawBGCells用
	getBGCellColor : function(cell){
		if(cell.qnum===-1){
			if     (cell.error ===1){ return this.errbcolor1;}
			else if(cell.qlight===1){ return this.lightcolor;}
		}
		return null;
	},

	drawAkari : function(){
		var g = this.vinc('cell_akari', 'auto');

		var rsize = this.cw*0.40;
		var lampcolor = "rgb(0, 127, 96)";
		var header = "c_AK_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.isAkari()){
				g.fillStyle = (cell.error!==4 ? lampcolor : this.errcolor1);
				if(this.vnop(header+cell.id,this.FILL)){
					g.fillCircle((cell.bx*this.bw), (cell.by*this.bh), rsize);
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
		this.decode4Cell();
	},
	encodePzpr : function(type){
		this.encode4Cell();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellQnumb();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnumb();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnumAns();
	},
	encodeData : function(){
		this.encodeCellQnumAns();
	},

	kanpenOpen : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qans = 1;}
			else if(ca==="*"){ obj.qsub = 1;}
			else if(ca==="5"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	kanpenSave : function(){
		this.encodeCell( function(obj){
			if     (obj.qans=== 1){ return "+ ";}
			else if(obj.qsub=== 1){ return "* ";}
			else if(obj.qnum>=  0){ return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "5 ";}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkNotDuplicateAkari() ){ return 'akariDup';}
		if( !this.checkDir4Akari() ){ return 'nmAkariNe';}
		if( !this.checkShinedCell() ){ return 'ceDark';}

		return null;
	},

	checkDir4Akari : function(){
		return this.checkDir4Cell(function(cell){ return cell.isAkari();},0);
	},
	checkShinedCell : function(){
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.qlight!==1);});
	},

	checkNotDuplicateAkari : function(){
		return this.checkRowsColsPartly(this.isPluralAkari, function(cell){ return cell.isNum();}, true);
	},
	isPluralAkari : function(keycellpos, clist){
		var akaris = clist.filter(function(cell){ return cell.isAkari();});
		if(akaris.length>1){
			akaris.seterr(4);
			return false;
		}
		return true;
	}
},

FailCode:{
	nmAkariNe : ["数字のまわりにある照明の数が間違っています。","The number is not equal to the number of Akari around it."],
	akariDup  : ["照明に別の照明の光が当たっています。","Akari is shined from another Akari."],
	ceDark    : ["照明に照らされていないセルがあります。","A cell is not shined."]
}
});
