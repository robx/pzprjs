//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.4.0
//
pzprv3.createCustoms('slither', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		var inputbg = false;
		if     (this.mousestart){ inputbg = (!!this.owner.getConfig('bgcolor') && this.inputBGcolor0());}
		else if(this.mousemove) { inputbg = (!!this.owner.getConfig('bgcolor') && this.inputData>=10);}

		if(!inputbg){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
			else if(this.mouseend && this.notInputted()){
				if(this.btn.Left){
					this.prevPos.reset();
					this.inputpeke();
				}
			}
		}
		else{ this.inputBGcolor();}
	},
	inputRed : function(){ this.dispRedLine();},

	inputBGcolor0 : function(){
		return this.getpos(0.25).oncell();
	},
	inputBGcolor : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){
			if(this.btn.Left){
				if     (cell.qsub===0){ this.inputData=11;}
				else if(cell.qsub===1){ this.inputData=12;}
				else                  { this.inputData=10;}
			}
			else{
				if     (cell.qsub===0){ this.inputData=12;}
				else if(cell.qsub===1){ this.inputData=10;}
				else                  { this.inputData=11;}
			}
		}
		cell.setQsub(this.inputData-10);
		cell.draw();

		this.mouseCell = cell; 
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
Cell:{
	maxnum : 3,
	minnum : 0,

	getdir4BorderLine1 : function(){
		var cnt=0;
		if( this.ub().isLine() ){ cnt++;}
		if( this.db().isLine() ){ cnt++;}
		if( this.lb().isLine() ){ cnt++;}
		if( this.rb().isLine() ){ cnt++;}
		return cnt;
	}
},

Board:{
	iscross  : 2,
	isborder : 2
},

LineManager:{
	borderAsLine : true
},

Properties:{
	flag_redline : true,
	flag_irowake : 2
},

Menu:{
	menufix : function(pp){
		pp.addCheck('bgcolor','setting',false, '背景色入力', 'Background-color');
		pp.setLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');
	},

	menuinit : function(pp){
		this.SuperFunc.menuinit.call(this,pp);
		if(this.owner.editmode){
			pzprv3.getEL('ck_bgcolor').disabled    = "true";
			pzprv3.getEL('cl_bgcolor').style.color = "silver";
		}
	},

	modechange : function(num){
		this.SuperFunc.modechange.call(this,num);

		pzprv3.getEL('ck_bgcolor').disabled    = (num===3?"":"true");
		pzprv3.getEL('cl_bgcolor').style.color = (num===3?"black":"silver");
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.setBGCellColorFunc('qsub2');
	},
	paint : function(){
		this.drawBGCells();

		this.drawLines();

		this.drawBaseMarks();

		this.drawNumbers();

		this.drawPekes();

		this.drawTarget();
	},

	repaintParts : function(blist){
		this.range.crosses = blist.crossinside();

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
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnum_kanpen();
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
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], qn = cell.getQnum();
			if(qn>=0 && qn!==cell.getdir4BorderLine1()){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
