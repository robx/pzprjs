//
// パズル固有スクリプト部 バーンズ版 barns.js v3.4.0
//
pzprv3.createCustoms('barns', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputborder();}
				else if(this.btn.Right){ this.inputIcebarn();}
			}
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

Flags:{
	redline : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
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
		this.drawPekes();

		this.drawChassis();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBarns();
		this.decodeBorder();
	},
	encodePzpr : function(type){
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

		if( !this.checkLcntCell(3) ){ return 40201;}

		if( !this.checkCrossOutOfIce() ){ return 40501;}
		if( !this.checkIceLines() ){ return 40601;}

		if( !this.checkOneLoop() ){ return 41101;}

		if( !this.checkLcntCell(0) ){ return 50151;}

		if( !this.checkLcntCell(1) ){ return 40101;}

		return 0;
	},

	checkCrossOutOfIce : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()===4 && !cell.ice());});
	}
}
});
