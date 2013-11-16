//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.4.0
//
pzpr.createCustoms('slither', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			var inputbg = false;
			if     (this.mousestart){ inputbg = (!!this.owner.get('bgcolor') && this.inputBGcolor0());}
			else if(this.mousemove) { inputbg = (!!this.owner.get('bgcolor') && this.inputData>=10);}

			if(!inputbg){
				if(this.btn.Left){
					if(this.mousestart || this.mousemove){ this.inputLine();}
					else if(this.mouseend && this.notInputted()){
						this.prevPos.reset();
						this.inputpeke();
					}
				}
				else if(this.btn.Right){
					if(this.mousestart || this.mousemove){ this.inputpeke();}
				}
			}
			else{ this.inputBGcolor();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
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
	enablemake : true
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

Flags:{
	redline : true,
	bgcolor : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

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
	decodePzpr : function(type){
		this.decode4Cell();
	},
	encodePzpr : function(type){
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

		if( !this.checkLineCount(3) ){ return 40201;}
		if( !this.checkLineCount(4) ){ return 40301;}

		if( !this.checkdir4BorderLine() ){ return 49101;}

		if( !this.checkOneLoop() ){ return 41101;}

		if( !this.checkLineCount(1) ){ return 40101;}

		return 0;
	},
	
	checkdir4BorderLine : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], qn = cell.getQnum();
			if(qn>=0 && qn!==cell.getdir4BorderLine1()){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
