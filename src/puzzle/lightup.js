//
// パズル固有スクリプト部 美術館版 lightup.js v3.4.0
//
pzprv3.createCustoms('lightup', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || (this.mousemove && this.btn.Right)){ this.inputcell();}
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

	numberIsWhite : true,

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
		var cell, clist=new this.owner.CellList();

		clist.add(this);
		cell=this.lt(); while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.lt();}
		cell=this.rt(); while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.rt();}
		cell=this.up(); while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.up();}
		cell=this.dn(); while(!cell.isnull && cell.qnum===-1){ clist.add(cell); cell=cell.dn();}
		return clist;
	},
	akariRange : function(){
		var cell, cell2, d={};

		cell=cell2=this.lt(); while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.lt();} d.x1=cell.bx;
		cell=cell2=this.rt(); while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.rt();} d.x2=cell.bx;
		cell=cell2=this.up(); while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.up();} d.y1=cell.by;
		cell=cell2=this.dn(); while(!cell2.isnull && cell2.qnum===-1){ cell=cell2; cell2=cell.dn();} d.y2=cell.by;
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

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.fontcolor = this.fontErrcolor = "white";
		this.dotcolor = this.dotcolor_PINK;
		this.setCellColorFunc('qnum');

		this.lightcolor = "rgb(192, 255, 127)";
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();
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
			else{ this.vhide(header+cell.id);}
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

		if( !this.checkNotDuplicateAkari() ){ return 90801;}
		if( !this.checkDir4Akari() ){ return 10039;}
		if( !this.checkShinedCell() ){ return 90811;}

		return 0;
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
}
});
