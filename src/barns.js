//
// パズル固有スクリプト部 バーンズ版 barns.js v3.4.0
//
pzprv3.createCustoms('barns', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborder();}
			else if(this.btn.Right){ this.inputIcebarn();}
		}
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
	inputRed : function(){ this.dispRedLine();},

	inputIcebarn : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.inputData = (cell.ice()?0:6);}

		cell.setQues(this.inputData);
		cell.draw();
		this.mouseCell = cell;
	}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	enableLineNG : true,

	// 線を引かせたくないので上書き
	isLineNG : function(){ return (this.ques===1);}
},

Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
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
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.errbcolor1 = this.errbcolor1_DARK;
		this.setBGCellColorFunc('icebarn');

		this.maxYdeg = 0.70;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawLines();
		this.drawPekes(0);

		this.drawChassis();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBarns();
		this.decodeBorder();
	},
	pzlexport : function(type){
		this.encodeBarns();
		this.encodeBorder();
	},

	decodeBarns : function(){
		var c=0, bstr = this.outbstr, bd=this.owner.board, twi=[16,8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(c<bd.cellmax){
					bd.cell[c].ques = (ca&twi[w]?6:0);
					c++;
				}
			}
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeBarns : function(){
		var cm="", num=0, pass=0, bd=this.owner.board, twi=[16,8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if(ca==="1"){ obj.ques = 6;}
		});
		this.decodeBorderQues();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			return (obj.ques===6?"1 ":". ");
		});
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()===4 && cell.getQues()!==6);}) ){
			this.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
		}
		if( !this.checkIceLines() ){
			this.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		if( !this.checkLcntCell(0) ){
			this.setAlert('線が引かれていないマスがあります。','There is a line-less cell.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		return true;
	}
}
});
