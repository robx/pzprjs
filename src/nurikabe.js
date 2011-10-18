//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js v3.4.0
//
pzprv3.createCustoms('nurikabe', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	}
},
"MouseEvent@nurikabe":{
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberIsWhite : true,
},
Board:{
	getdir8WareaInfo : function(){
		var winfo = this.owner.newInstance('AreaCellInfo');
		for(var fc=0;fc<this.cellmax;fc++){ winfo.id[fc]=(this.cell[fc].isWhite()?0:null);}
		for(var fc=0;fc<this.cellmax;fc++){
			if(!winfo.emptyCell(this.cell[fc])){ continue;}
			winfo.addRoom();

			var stack=[this.cell[fc]];
			while(stack.length>0){
				var cell = stack.pop();
				if(!winfo.emptyCell(cell)){ continue;}
				winfo.addCell(cell);

				var bx=cell.bx, by=cell.by;
				var clist = this.cellinside(bx-2, by-2, bx+2, by+2);
				for(var i=0;i<clist.length;i++){
					if(winfo.emptyCell(clist[i])){ stack.push(clist[i]);}
				}
			}
		}
		return winfo;
	}
},

AreaBlackManager:{
	enabled : true
},
"AreaBlackManager@mochikoro":{
	enabled : false
},
AreaWhiteManager:{
	enabled : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		if(this.owner.pid==='nurikabe'){
			this.addRedBlockToFlags();
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		if(this.owner.pid!=='nurikabe'){
			this.bcolor = this.bcolor_GREEN;
			this.setBGCellColorFunc('qsub1');
		}
	},
	paint : function(){
		this.drawBGCells();
		if(this.owner.pid==='nurikabe'){ this.drawDotCells(false);}
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
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
		if(this.owner.pid==='nurikabe'){
			this.decodeCellQnumAns();
		}
		else{
			this.decodeCellQnum();
			this.decodeCellAns();
		}
	},
	encodeData : function(){
		if(this.owner.pid==='nurikabe'){
			this.encodeCellQnumAns();
		}
		else{
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	kanpenOpen : function(){
		this.decodeCellQnumAns_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnumAns_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var o=this.owner, bd=o.board, pid=o.pid, mochi=(pid==='mochikoro'||pid==='mochinyoro');

		if( (pid!=='nuribou') && !this.check2x2Block( function(cell){ return cell.isBlack();} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。','There is a 2x2 block of black cells.'); return false;
		}

		if(pid!=='mochikoro'){ var binfo = bd.getBCellInfo();}
		if( (pid==='nuribou') && !this.checkAllArea(binfo, function(w,h,a,n){ return (w==1||h==1);} ) ){
			this.setAlert('「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。','There is a mass of black cells, whose width is more than two.'); return false;
		}

		if( (pid==='nuribou') && !this.checkCorners(binfo) ){
			this.setAlert('同じ面積の黒マスのカタマリが、角を共有しています。','Masses of black cells whose length is the same share a corner.'); return false;
		}

		if( (mochi) && !this.checkOneArea( bd.getdir8WareaInfo() ) ){
			this.setAlert('孤立した白マスのブロックがあります。','White cells are devided.'); return false;
		}

		var winfo = bd.getWCellInfo();
		if( (mochi) && !this.checkAreaRect(winfo) ){
			this.setAlert('四角形でない白マスのブロックがあります。','There is a block of white cells that is not rectangle.'); return false;
		}

		if( (!mochi) && !this.checkNoNumber(winfo) ){
			this.setAlert('数字の入っていないシマがあります。','An area of white cells has no numbers.'); return false;
		}

		if( (pid==='nurikabe') && !this.checkOneArea( binfo ) ){
			this.setAlert('黒マスが分断されています。','Black cells are devided,'); return false;
		}

		if( !this.checkDoubleNumber(winfo) ){
			if(!mochi){ this.setAlert('1つのシマに2つ以上の数字が入っています。','An area of white cells has plural numbers.');}
			else      { this.setAlert('1つのブロックに2つ以上の数字が入っています。','A block has plural numbers.');}
			return false;
		}

		if( !this.checkNumberAndSize(winfo) ){
			if(!mochi){ this.setAlert('数字とシマの面積が違います。','The number is not equal to the number of the size of the area.');}
			else      { this.setAlert('数字とブロックの面積が違います。','A size of tha block and the number written in the block is differrent.');}
			return false;
		}

		if( pid==='mochinyoro' && !this.checkAllArea(binfo, function(w,h,a,n){ return (w*h!=a);} ) ){
			this.setAlert('四角形になっている黒マスのブロックがあります。','There is a block of black cells that is rectangle.'); return false;
		}

		return true;
	},

	checkCorners : function(binfo){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx===bd.maxbx-1 || cell.by===bd.maxby-1){ continue;}

			var cell1, cell2;
			if     ( cell.isBlack() && cell.rt().dn().isBlack() ){ cell1 = cell; cell2 = cell.rt().dn();}
			else if( cell.rt().isBlack() && cell.dn().isBlack() ){ cell1 = cell.rt(); cell2 = cell.dn();}
			else{ continue;}

			if(binfo.getclistbycell(cell1).length == binfo.getclistbycell(cell2).length){
				if(this.inAutoCheck){ return false;}
				binfo.getclistbycell(cell1).seterr(1);
				binfo.getclistbycell(cell2).seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
