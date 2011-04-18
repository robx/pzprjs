//
// パズル固有スクリプト部 快刀乱麻・新・快刀乱麻版 kramma.js v3.4.0
//
pzprv3.custom.kramma = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			if(bd.puzzleid==='kramman'){ this.inputcrossMark();}
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	// オーバーライド
	inputBD : function(flag){
		var pos = this.borderpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getborderID(this.prevPos, pos);
		if(id!==null){
			if(this.inputData===null){ this.inputData=(bd.isBorder(id)?0:1);}

			var d = bd.getlinesize(id);
			var idlist = new pzprv3.core.IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));
			for(var i=0;i<idlist.data.length;i++){
				if     (this.inputData===1){ bd.setBorder(idlist.data[i]);}
				else if(this.inputData===0){ bd.removeBorder(idlist.data[i]);}
			}

			pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	iscross  : 1,
	isborder : 1,

	numberAsObject : true,

	maxnum : 2,

	getlinesize : function(id){
		var bx=this.border[id].bx, by=this.border[id].by;
		var d = {x1:bx, x2:bx, y1:by, y2:by};
		if(this.border[id].bx&1){
			while(d.x1>this.minbx && this.QnX(this.xnum(d.x1-1,by))!==1){d.x1-=2;}
			while(d.x2<this.maxbx && this.QnX(this.xnum(d.x2+1,by))!==1){d.x2+=2;}
		}
		else if(this.border[id].by&1){
			while(d.y1>this.minby && this.QnX(this.xnum(bx,d.y1-1))!==1){d.y1-=2;}
			while(d.y2<this.maxby && this.QnX(this.xnum(bx,d.y2+1))!==1){d.y2+=2;}
		}
		return d;
	}
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.borderQanscolor = "rgb(64, 64, 255)";
		this.setBorderColorFunc('qans');

		this.crosssize = 0.15;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawQnumCircles();
		if(bd.puzzleid==='kramman'){ this.drawCrossMarks();}

		this.drawHatenas();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		if(!this.checkpflag("c")){ this.decodeCrossMark();}
		this.decodeCircle();

		this.checkPuzzleid();
	},
	pzlexport : function(type){
		if(bd.puzzleid==='kramman'){ this.encodeCrossMark();}else{ this.outpflag="c";}
		this.encodeCircle();
	},

	checkPuzzleid : function(){
		if(bd.puzzleid==='kramma'){
			for(var c=0;c<bd.crossmax;c++){
				if(bd.cross[c].qnum===1){ bd.puzzleid='kramman'; break;}
			}
			menu.displayDesign();
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCrossNum();
		this.decodeBorderAns();

		enc.checkPuzzleid();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCrossNum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( (bd.puzzleid==='kramman') && !this.checkLcntCross(3,0) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( (bd.puzzleid==='kramman') && !this.checkLcntCross(4,1) ){
			this.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
		}
		if( (bd.puzzleid==='kramman') && !this.checkLcntCurve() ){
			this.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
		}

		rinfo = bd.areas.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('白丸も黒丸も含まれない領域があります。','An area has no marks.'); return false;
		}

		if( !this.checkSameObjectInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('白丸と黒丸が両方含まれる領域があります。','An area has both white and black circles.'); return false;
		}

		if( (bd.puzzleid==='kramman') && !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}
		if( (bd.puzzleid==='kramman') && !this.checkLcntCross(0,1) ){
			this.setAlert('黒点上を線が通過していません。','No lines on the black point.'); return false;
		}

		return true;
	},

	checkLcntCurve : function(){
		var result = true;
		for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
			for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
				var xc = bd.xnum(bx,by);
				if(bd.areas.lcntCross(xc)===2 && bd.QnX(xc)!==1){
					if(    !(bd.QaB(bd.bnum(bx  ,by-1))===1 && bd.QaB(bd.bnum(bx  ,by+1))===1)
						&& !(bd.QaB(bd.bnum(bx-1,by  ))===1 && bd.QaB(bd.bnum(bx+1,by  ))===1) )
					{
						if(this.inAutoCheck){ return false;}
						bd.setCrossBorderError(bx,by);
						result = false;
					}
				}
			}
		}
		return result;
	}
}
};
