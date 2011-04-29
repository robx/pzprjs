//
// パズル固有スクリプト部 カントリーロード版 country.js v3.4.0
//
pzprv3.custom.country = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine();}
		else if(k.editmode){ this.inputborder();}
		else if(k.playmode){
			if(this.btn.Left){ this.inputLine();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if     (k.editmode){ this.inputqnum();}
			else if(k.playmode){ this.inputMB();}
		}
	},
	mousemove : function(){
		if(k.editmode){ this.inputborder();}
		else if(k.playmode){
			if(this.btn.Left){ this.inputLine();}
		}
	}
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
Board:{
	isborder : 1,

	nummaxfunc : function(cc){
		return Math.min(this.maxnum, this.areas.rinfo.getCntOfRoomByCell(cc));
	}
},

LineManager:{
	isCenterLine : true
},

AreaManager:{
	hasroom    : true,
	roomNumber : true
},

Menu:{
	menufix : function(){
		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	setColors : function(){
		this.gridcolor = this.gridcolor_SLIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawNumbers();

		this.drawGrid();
		this.drawBorders();

		this.drawMBs();
		this.drawLines();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeBorderLine();
		this.decodeCellQsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeBorderLine();
		this.encodeCellQsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			this.setAlert('交差している線があります。','There is a crossing line.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkRoom2( rinfo ) ){
			this.setAlert('線が１つの国を２回以上通っています。','A line passes a country twice or more.'); return false;
		}

		if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0||n==a);}) ){
			this.setAlert('数字のある国と線が通過するマスの数が違います。','The number of the cells that is passed any line in the country and the number written in the country is diffrerent.'); return false;
		}
		if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (a!=0);}) ){
			this.setAlert('線の通っていない国があります。','There is a country that is not passed any line.'); return false;
		}

		if( !this.checkSideAreaCell(rinfo, function(c1,c2){ return (bd.lines.lcntCell(c1)==0 && bd.lines.lcntCell(c2)==0);}, false) ){
			this.setAlert('線が通らないマスが、太線をはさんでタテヨコにとなりあっています。','The cells that is not passed any line are adjacent over border line.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		return true;
	},

	checkRoom2 : function(rinfo){
		if(rinfo.max<=1){ return true;}
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var cnt=0;
			for(var i=0;i<rinfo.room[r].idlist.length;i++){
				var c=rinfo.room[r].idlist[i], id;
				id=bd.ub(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
				id=bd.db(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
				id=bd.lb(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
				id=bd.rb(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
			}
			if(cnt>2){
				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[r].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
