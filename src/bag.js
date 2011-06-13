//
// パズル固有スクリプト部 バッグ版 bag.js v3.4.0
//
pzprv3.custom.bag = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if(!pp.getVal('bgcolor') || !this.inputBGcolor0()){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputBGcolor(true);}
			}
			else{ this.inputBGcolor(false);}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if(!pp.getVal('bgcolor') || this.inputData<10){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputBGcolor(true);}
			}
			else{ this.inputBGcolor(false);}
		}
	},

	inputBGcolor0 : function(){
		var pos = this.borderpos(0.25);
		return ((pos.x&1) && (pos.y&1));
	},
	inputBGcolor : function(isnormal){
		var cc = this.cellid();
		if(cc===null || cc==this.mouseCell){ return;}
		if(this.inputData===null){
			if(isnormal || this.btn.Left){
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
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 2,

	nummaxfunc : function(cc){
		return Math.min(this.maxnum, this.qcols+this.qrows-1);
	},
	minnum : 2,

	getInsideArea : function(){
		var icheck = [];
		icheck[0]=(this.lines.lcntCell(0)!==0);
		for(var by=1;by<this.maxby;by+=2){
			if(by>1){ icheck[this.cnum(1,by)] = !!(icheck[this.cnum(1,by-2)] ^ this.isLine(this.bnum(1,by-1)));}
			for(var bx=3;bx<this.maxbx;bx+=2){
				icheck[this.cnum(bx,by)] = !!(icheck[this.cnum(bx-2,by)] ^ this.isLine(this.bnum(bx-1,by)));
			}
		}
		return icheck;
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
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBGCellColorFunc('qsub2');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid(false);
		this.drawLines();

		this.drawNumbers();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQsub();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQsub();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCross(3,0) ){
			this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
		}
		if( !this.checkLcntCross(4,0) ){
			this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		var icheck = bd.getInsideArea();
		if( !this.checkNumberInside(icheck) ){
			this.setAlert('輪の内側に入っていない数字があります。','There is an outside number.'); return false;
		}
		if( !this.checkCellNumber(icheck) ){
			this.setAlert('数字と輪の内側になる4方向のマスの合計が違います。','The number and the sum of the inside cells of four direction is different.'); return false;
		}

		return true;
	},

	checkNumberInside : function(icheck){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(!icheck[c] && bd.isNum(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},
	checkCellNumber : function(icheck){
		var result = true;
		for(var cc=0;cc<bd.cellmax;cc++){
			if(!bd.isValidNum(cc)){ continue;}

			var list = [];
			list.push(cc);
			var cnt = 1;
			var tx, ty;
			tx = bd.cell[cc].bx-2; ty = bd.cell[cc].by;
			while(tx>bd.minbx){ var c=bd.cnum(tx,ty); if(icheck[c]){ cnt++; list.push(c); tx-=2;} else{ break;} }
			tx = bd.cell[cc].bx+2; ty = bd.cell[cc].by;
			while(tx<bd.maxbx){ var c=bd.cnum(tx,ty); if(icheck[c]){ cnt++; list.push(c); tx+=2;} else{ break;} }
			tx = bd.cell[cc].bx; ty = bd.cell[cc].by-2;
			while(ty>bd.minby){ var c=bd.cnum(tx,ty); if(icheck[c]){ cnt++; list.push(c); ty-=2;} else{ break;} }
			tx = bd.cell[cc].bx; ty = bd.cell[cc].by+2;
			while(ty<bd.maxby){ var c=bd.cnum(tx,ty); if(icheck[c]){ cnt++; list.push(c); ty+=2;} else{ break;} }

			if(bd.QnC(cc)!==cnt){
				if(this.inAutoCheck){ return false;}
				bd.sErC(list,1);
				result = false;
			}
		}
		return result;
	}
}
};
