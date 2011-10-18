//
// パズル固有スクリプト部 カントリーロード版 country.js v3.4.0
//
pzprv3.createCustoms('country', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			this.inputborder();
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum();
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if(this.btn.Left){ this.inputLine();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputMB();
		}
	},
	inputRed : function(){ this.dispRedLine();}
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
	nummaxfunc : function(){
		return Math.min(this.maxnum, this.owner.board.rooms.getCntOfRoomByCell(this));
	}
},
Board:{
	isborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaRoomManager:{
	enabled : true,
	hastop : true
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

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkRoom2( rinfo ) ){
			this.setAlert('線が１つの国を２回以上通っています。','A line passes a country twice or more.'); return false;
		}

		if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0||n==a);}) ){
			this.setAlert('数字のある国と線が通過するマスの数が違います。','The number of the cells that is passed any line in the country and the number written in the country is diffrerent.'); return false;
		}
		if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (a!=0);}) ){
			this.setAlert('線の通っていない国があります。','There is a country that is not passed any line.'); return false;
		}

		if( !this.checkSideAreaCell(rinfo, function(cell1,cell2){ return (cell1.lcnt()===0 && cell2.lcnt()===0);}, false) ){
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
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var cnt=0, clist=rinfo.getclist(r);
			for(var i=0;i<clist.length;i++){
				var cell=clist[i], border;
				border=cell.ub(); if(border.ques===1 && border.line===1){ cnt++;}
				border=cell.db(); if(border.ques===1 && border.line===1){ cnt++;}
				border=cell.lb(); if(border.ques===1 && border.line===1){ cnt++;}
				border=cell.rb(); if(border.ques===1 && border.line===1){ cnt++;}
			}
			if(cnt>2){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
