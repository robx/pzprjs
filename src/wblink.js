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
		if(this.inputData==2){ return;}
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getnb(this.prevPos, pos);
		if(id!==null){
			var d = bd.getlinesize(id);
			var idlist = new pzprv3.core.IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));

			if(this.inputData===null){ this.inputData=(bd.isLine(id)?0:1);}
			for(var i=0;i<idlist.data.length;i++){
				if(this.inputData==1){ bd.setLine(idlist.data[i]);}
				else              { bd.removeLine(idlist.data[i]);}
			}
			this.inputData=2;

			pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	},
	inputpeke : function(){
		var pos = this.borderpos(0.22);
		var id = pos.borderid();
		if(id===null || this.prevPos.equals(pos)){ return;}

		if(this.inputData===null){ this.inputData=(bd.QsB(id)!=2?2:0);}
		bd.sQsB(id, this.inputData);

		var d = bd.getlinesize(id);
		var idlist = new pzprv3.core.IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));
		for(var i=0;i<idlist.data.length;i++){ bd.sLiB(idlist.data[i], 0);}
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
		var cc = tc.getTCC();

		if     (ca=='1'){ bd.sQnC(cc,(bd.QnC(cc)!==1?1:-1));}
		else if(ca=='2'){ bd.sQnC(cc,(bd.QnC(cc)!==2?2:-1));}
		else if(ca=='-'){ bd.sQnC(cc,(bd.QnC(cc)!==-2?-2:-1));}
		else if(ca=='3'||ca==" "){ bd.sQnC(cc,-1);}
		else{ return;}

		pc.paintCell(cc);
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	numberAsObject : true,

	maxnum : 2,

	getlinesize : function(id){
		var bx=this.border[id].bx, by=this.border[id].by;
		var d = {x1:bx, x2:bx, y1:by, y2:by};
		if(this.isVert(id)){
			while(d.x1>this.minbx && this.noNum(this.cnum(d.x1-1,by))){d.x1-=2;}
			while(d.x2<this.maxbx && this.noNum(this.cnum(d.x2+1,by))){d.x2+=2;}
		}
		else{
			while(d.y1>this.minby && this.noNum(this.cnum(bx,d.y1-1))){d.y1-=2;}
			while(d.y2<this.maxby && this.noNum(this.cnum(bx,d.y2+1))){d.y2+=2;}
		}
		return d;
	}
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

		if( !this.checkAllCell(function(c){ return (bd.isNum(c) && bd.lines.lcntCell(c)===0);} ) ){
			this.setAlert('○から線が出ていません。','A circle doesn\'t start any line.'); return false;
		}

		return true;
	},

	checkWBcircle : function(linfo,val){
		var result = true;
		for(var r=1;r<=linfo.max;r++){
			if(linfo.room[r].idlist.length<=1){ continue;}

			var tip1 = linfo.room[r].idlist[0];
			var tip2 = linfo.room[r].idlist[linfo.room[r].idlist.length-1];
			if(bd.QnC(tip1)!==val || bd.QnC(tip2)!==val){ continue;}

			if(this.inAutoCheck){ return false;}
			if(result){ bd.sErBAll(2);}
			bd.setErrLareaById(linfo,r,1);
			bd.sErC([tip1,tip2],1);
			result = false;
		}
		return result;
	}
}
};
