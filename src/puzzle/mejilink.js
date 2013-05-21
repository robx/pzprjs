//
// パズル固有スクリプト部 メジリンク版 mejilink.js v3.4.0
//

pzprv3.createCustoms('mejilink', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
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
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	enableLineNG : true,

	isGround : function(){
		return this.ques>0;
	},

	propall : ['line', 'qsub'], /* quesは取り除いておく */
	allclear : function(isrec){
		var bd = this.owner.board;
		var def = (this.id<bd.qcols*(bd.qrows-1)+(bd.qcols-1)*bd.qrows ? 1 : 0);
		if(this.ques!==def){
			if(isrec){ this.owner.opemgr.addOpe_Object(this, pzprv3.consts.QUES, this.ques, def);}
			this.ques = def;
		}

		this.SuperFunc.allclear.call(this,isrec);
	},

	// 線を引かせたくないので上書き
	isLineNG : function(){ return (this.ques===1);}
},
Board:{
	qcols : 8,
	qrows : 8,

	iscross  : 2,
	isborder : 2,

	initialize : function(){
		this.SuperFunc.initialize.call(this);
		this.tiles = this.addInfoList('AreaTileManager');
	},

	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		for(var id=0;id<this.bdmax;id++){
			this.border[id].allclear(false);
		}
	}
},

LineManager:{
	borderAsLine : true
},
"AreaTileManager:AreaManager":{
	enabled : true,
	relation : ['border'],
	bdfunc : function(border){ return !border.isGround();}
},

Flags:{
	redline : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.borderQuescolor = "white";
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid(false);
		this.drawBorders();
		this.drawLines();

		this.drawBaseMarks();

		this.drawPekes();
	},

	// オーバーライド
	getBorderColor : function(border){
		if(border.ques===1){
			var cell2=border.sidecell[1];
			return ((cell2.isnull || cell2.error===0) ? this.borderQuescolor : this.errbcolor1);
		}
		return null;
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
		this.decodeMejilink();
	},
	encodePzpr : function(type){
		this.encodeMejilink();
	},

	decodeMejilink : function(){
		var bstr = this.outbstr, bd = this.owner.board, twi=[16,8,4,2,1];
		var pos = (bstr?Math.min((((bd.bdmax+4)/5)|0),bstr.length):0), id=0;
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<bd.bdmax){
					bd.border[id].ques = (ca&twi[w]?1:0);
					id++;
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeMejilink : function(){
		var count = 0, bd = this.owner.board;
		for(var id=bd.bdinside;id<bd.bdmax;id++){ if(bd.border[id].isGround()) count++;}
		var num=0, pass=0, cm="", twi=[16,8,4,2,1];
		for(var id=0,max=(count===0?bd.bdinside:bd.bdmax);id<max;id++){
			if(bd.border[id].isGround()){ pass+=twi[num];} num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}
		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="2" ){ obj.ques = 0; obj.line = 1;}
			else if(ca==="-1"){ obj.ques = 0; obj.qsub = 2;}
			else if(ca==="1" ){ obj.ques = 0;}
			else              { obj.ques = 1;}
		});
	},
	encodeData : function(){
		this.encodeBorder( function(obj){
			if     (obj.line===1){ return "2 ";}
			else if(obj.qsub===2){ return "-1 ";}
			else if(obj.ques===0){ return "1 ";}
			else                 { return "0 ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkdir4Line_meji(3) ){ return 40201;}
		if( !this.checkdir4Line_meji(4) ){ return 40301;}

		if( !this.checkDotLength() ){ return 39101;}

		if( !this.checkdir4Line_meji(1) ){ return 40101;}

		if( !this.checkOneLoop() ){ return 41101;}

		return 0;
	},

	checkdir4Line_meji : function(val){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.crossmax;c++){
			var cnt = 0, cross = bd.cross[c];
			if(cross.lb().isLine()){ cnt++;}
			if(cross.rb().isLine()){ cnt++;}
			if(cross.ub().isLine()){ cnt++;}
			if(cross.db().isLine()){ cnt++;}
			if(cnt==val){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				bd.setCrossBorderError(cross.bx,cross.by);
				result = false;
			}
		}
		return result;
	},
	checkDotLength : function(){
		var result = true, bd = this.owner.board;
		var tarea = bd.tiles.getAreaInfo();

		var tcount = [], numerous_value = 999999;
		for(var r=1;r<=tarea.max;r++){ tcount[r]=0;}
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(border.isGround() && id>=bd.bdinside){
				if(!cell1.isnull){ tcount[tarea.getRoomID(cell1)] -= numerous_value;}
				if(!cell2.isnull){ tcount[tarea.getRoomID(cell2)] -= numerous_value;}
			}
			else if(!border.isGround() && !border.isLine()){
				if(!cell1.isnull){ tcount[tarea.getRoomID(cell1)]++;}
				if(!cell2.isnull){ tcount[tarea.getRoomID(cell2)]++;}
			}
		}
		for(var r=1;r<=tarea.max;r++){
			var clist = tarea.getclist(r);
			if(tcount[r]>=0 && tcount[r]!==clist.length){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
