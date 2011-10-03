//
// パズル固有スクリプト部 シロクロリンク版 wblink.js v3.4.0
//
pzprv3.custom.wblink = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
		}
	},

	inputLine : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getnb(this.prevPos, pos);
		if(!border.isnull){
			var d = border.getlinesize();
			var borders = bd.borderinside(d.x1,d.y1,d.x2,d.y2);

			if(this.inputData===null){ this.inputData=(border.isLine()?0:1);}
			for(var i=0;i<borders.length;i++){
				if(this.inputData==1){ borders[i].setLine();}
				else                 { borders[i].removeLine();}
			}
			this.inputData=2;

			pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	},
	inputpeke : function(){
		var pos = this.borderpos(0.22);
		var border = pos.getb();
		if(border.isnull || this.prevPos.equals(pos)){ return;}

		if(this.inputData===null){ this.inputData=(border.getQsub()!==2?2:0);}
		border.setQsub(this.inputData);

		var d = border.getlinesize();
		var borders = bd.borderinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<borders.length;i++){ borders[i].setLineVal(0);}
		this.prevPos = pos;

		pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputcircle(ca);
	},
	key_inputcircle : function(ca){
		var cell = tc.getTCC();

		if     (ca=='1'){ cell.setQnum(cell.getQnum()!==1?1:-1);}
		else if(ca=='2'){ cell.setQnum(cell.getQnum()!==2?2:-1);}
		else if(ca=='-'){ cell.setQnum(cell.getQnum()!==-2?-2:-1);}
		else if(ca=='3'||ca==" "){ cell.setQnum(-1);}
		else{ return;}

		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberAsObject : true,

	maxnum : 2
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
		return {x1:pos1.bx, y1:pos1.by, x2:pos2.bx, y2:pos2.by};
	}
},

Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaManager:{
	lineToArea : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.50,
	bdmargin_image : 0.10,

	setColors : function(){
		this.gridcolor = this.gridcolor_THIN;
		this.errbcolor1 = "white";
		this.circleratio = [0.35, 0.30];

		// 線の太さを通常より少し太くする
		this.lwratio = 8;
	},
	paint : function(){
		this.drawGrid(false, (this.owner.editmode && !this.outputImage));

		this.drawPekes(0);
		this.drawLines();

		this.drawQnumCircles();
		this.drawHatenas();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeCircle();
	},
	pzlexport : function(type){
		this.encodeCircle();
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
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell(4) ){
			this.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		var linfo = bd.areas.getLareaInfo();
		if( !this.checkTripleNumber(linfo) ){
			this.setAlert('3つ以上の○が繋がっています。','Three or more objects are connected.'); return false;
		}

		if( !this.checkWBcircle(linfo, 1) ){
			this.setAlert('白丸同士が繋がっています。','Two white circles are connected.'); return false;
		}
		if( !this.checkWBcircle(linfo, 2) ){
			this.setAlert('黒丸同士が繋がっています。','Two black circles are connected.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.isNum() && cell.lcnt()===0);} ) ){
			this.setAlert('○から線が出ていません。','A circle doesn\'t start any line.'); return false;
		}

		return true;
	},

	checkWBcircle : function(linfo,val){
		var result = true;
		for(var r=1;r<=linfo.max;r++){
			var clist = linfo.getclist(r);
			if(clist.length<=1){ continue;}

			var tip1 = clist[0], tip2 = clist[clist.length-1];
			if(tip1.getQnum()!==val || tip2.getQnum()!==val){ continue;}

			if(this.inAutoCheck){ return false;}
			if(result){ bd.border.seterr(2);}
			linfo.setErrLareaById(r,1);
			tip1.seterr(1);
			tip2.seterr(1);
			result = false;
		}
		return result;
	}
}
};
