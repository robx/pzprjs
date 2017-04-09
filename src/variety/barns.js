//
// パズル固有スクリプト部 バーンズ版 barns.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['barns'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','ice','info-line'],play:['line','peke','info-line']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn==='left') { this.inputborder();}
				else if(this.btn==='right'){ this.inputIcebarn();}
			}
		}
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
	cols : 8,
	rows : 8,

	hasborder : 1
},

LineGraph:{
	enabled : true,
	isLineCross : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : true,

	gridcolor_type : "LIGHT",

	bgcellcolor_func : "icebarn",

	maxYdeg : 0.70,

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
		var c=0, bstr = this.outbstr, bd=this.board, twi=[16,8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(!!bd.cell[c]){
					bd.cell[c].ques = (ca&twi[w]?6:0);
					c++;
				}
			}
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeBarns : function(){
		var cm="", num=0, pass=0, bd=this.board, twi=[16,8,4,2,1];
		for(var c=0;c<bd.cell.length;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if(ca==="1"){ cell.ques = 6;}
		});
		this.decodeBorderQues();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			return (cell.ques===6?"1 ":". ");
		});
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBranchLine",
		"checkCrossOutOfIce",
		"checkIceLines",
		"checkOneLoop",
		"checkNoLine",
		"checkDeadendLine+"
	],

	checkCrossOutOfIce : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===4 && !cell.ice());}, "lnCrossExIce");
	}
}
}));
