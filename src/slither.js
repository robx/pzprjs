//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.4.0
//
pzprv3.custom.slither = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
		if(k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if(!pp.getVal('bgcolor') || !this.inputBGcolor0()){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
			else{ this.inputBGcolor();}
		}
	},
	mouseup : function(){
		if(k.playmode && this.btn.Left && this.notInputted()){
			this.prevPos.reset();
			this.inputpeke();
		}
	},
	mousemove : function(){
		if(k.playmode){
			if(!pp.getVal('bgcolor') || this.inputData<10){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
			else{ this.inputBGcolor();}
		}
	},

	inputBGcolor0 : function(){
		var pos = this.borderpos(0.25);
		return ((pos.x&1) && (pos.y&1));
	},
	inputBGcolor : function(){
		var cc = this.cellid();
		if(cc===null || cc==this.mouseCell){ return;}
		if(this.inputData===null){
			if(this.btn.Left){
				if     (bd.cell[cc].qsub===0){ this.inputData=11;}
				else if(bd.cell[cc].qsub===1){ this.inputData=12;}
				else                         { this.inputData=10;}
			}
			else{
				if     (bd.cell[cc].qsub===0){ this.inputData=12;}
				else if(bd.cell[cc].qsub===1){ this.inputData=10;}
				else                         { this.inputData=11;}
			}
		}
		bd.sQsC(cc, this.inputData-10);
		pc.paintCell(cc);

		this.mouseCell = cc; 
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	generate : function(mode,type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.insertrow();
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum.','-','?');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	iscross  : 2,
	isborder : 2,

	maxnum : 3,
	minnum : 0,

	getdir4BorderLine1 : function(cc){
		var cnt=0, bx=this.cell[cc].bx, by=this.cell[cc].by;
		if( this.isLine(this.bnum(bx  ,by-1)) ){ cnt++;}
		if( this.isLine(this.bnum(bx  ,by+1)) ){ cnt++;}
		if( this.isLine(this.bnum(bx-1,by  )) ){ cnt++;}
		if( this.isLine(this.bnum(bx+1,by  )) ){ cnt++;}
		return cnt;
	}
},

LineManager:{
	borderAsLine : true
},

MenuExec:{
	modechange : function(num){
		this.SuperFunc.modechange.call(this,num);

		ee('ck_bgcolor').el.disabled    = (num===3?"":"true");
		ee('cl_bgcolor').el.style.color = (num===3?"black":"silver");
	}
},

Menu:{
	menufix : function(){
		pp.addCheck('bgcolor','setting',false, '背景色入力', 'Background-color');
		pp.setLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');

		this.addRedLineToFlags();
	},

	menuinit : function(){
		this.SuperFunc.menuinit.call(this);
		if(k.editmode){
			ee('ck_bgcolor').el.disabled    = "true";
			ee('cl_bgcolor').el.style.color = "silver";
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	setColors : function(){
		this.setBGCellColorFunc('qsub2');
	},
	paint : function(){
		this.drawBGCells();

		this.drawLines();

		this.drawBaseMarks();

		this.drawNumbers();

		this.drawPekes(0);

		this.drawTarget();
	},

	repaintParts : function(idlist){
		this.range.crosses = bd.lines.getXlistFromIdlist(idlist);

		this.drawBaseMarks();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decode4Cell();
	},
	pzlexport : function(type){
		this.encode4Cell();
	},

	decodeKanpen : function(){
		fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		if(this.filever===1){
			this.decodeCellQnum();
			this.decodeCellQsub();
			this.decodeBorderLine();
		}
		else if(this.filever===0){
			this.decodeCellQnum();
			this.decodeBorderLine();
		}
	},
	encodeData : function(){
		this.filever = 1;
		this.encodeCellQnum();
		this.encodeCellQsub();
		this.encodeBorderLine();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeBorderLine();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCross(3,0) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( !this.checkLcntCross(4,0) ){
			this.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		if( !this.checkdir4BorderLine() ){
			this.setAlert('数字の周りにある線の本数が違います。','The number is not equal to the number of lines around it.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	},
	
	checkdir4BorderLine : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var qn = bd.QnC(c);
			if(qn>=0 && qn!==bd.getdir4BorderLine1(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	}
}
};
