//
// パズル固有スクリプト部 ごきげんななめ・輪切版 wagiri.js v3.4.0
//
pzprv3.custom.wagiri = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 7;
		this.qrows = 7;

		this.iscross  = 2;

		this.isLineCross     = true;
		this.isCenterLine    = true;
		this.dispzero        = true;

		this.bdmargin       = 0.70;
		this.bdmargin_image = 0.50;

		this.floatbgcolor = "rgb(0, 127, 0)";
	},
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.playmode){ this.inputslash();}
		else if(k.editmode){ this.inputquestion();}
	},

	inputquestion : function(){
		var pos = this.borderpos(0.33);
		if(!bd.isinside(pos.x,pos.y)){ return;}
		if(!(pos.x&1) && !(pos.y&1)){
			this.inputcross();
		}
		else if((pos.x&1) && (pos.y&1)){
			var cc0 = tc.getTCC(), cc = this.cellid();
			if(cc!==cc0){
				tc.setTCC(cc);
				pc.paintCell(cc0);
				pc.paintCell(cc);
			}
			else if(cc!==null){
				var trans = (this.btn.Left ? [-1,1,0,2,-2] : [2,-2,0,-1,1]);
				bd.setNum(cc,trans[bd.QnC(cc)+2]);
				pc.paintCell(cc);
			}
		}
		else{
			var id = bd.bnum(pos.x, pos.y);
			if(id!==tc.getTBC()){
				var tcp = tc.getTCP();
				tc.setTCP(pos);
				pc.paintPos(tcp);
				pc.paintPos(pos);
			}
		}
	},
	inputslash : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		var use = pp.getVal('use');
		if     (use===1){ bd.sQaC(cc, (bd.QaC(cc)!=(this.btn.Left?1:2)?(this.btn.Left?1:2):0));}
		else if(use===2){ bd.sQaC(cc, (this.btn.Left?[1,2,0]:[2,0,1])[bd.QaC(cc)]);}

		pc.paintCellAround(cc);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTBorder(ca);},

	keyinput : function(ca){
		this.key_wagiri(ca);
	},
	key_wagiri : function(ca){
		var pos = tc.getTCP();
		if(!(pos.x&1)&&!(pos.y&1)){
			this.key_inputcross(ca);
		}
		else if((pos.x&1)&&(pos.y&1)){
			var cc = tc.getTCC(), val = 0;
			if     (ca=='1'){ val= 1;}
			else if(ca=='2'){ val= 2;}
			else if(ca=='-'){ val=-2;}
			else if(ca==' '){ val=-1;}

			if(cc!==null && val!==0){
				bd.setNum(cc,val);
				pc.paintCell(cc);
			}
		}
	}
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	maxnum : 4,

	// 正答判定用
	getSlashData : function(){
		var sdata=[], scnt=this.getScntData();
		for(var c=0;c<this.cellmax;c++){ sdata[c] =(this.QaC(c)!==0?0:-1);}
		for(var c=0;c<this.cellmax;c++){
			if(sdata[c]!==0){ continue;}
			// history -> スタックみたいなオブジェクト
			var history={cell:[],cross:[]};
			for(var cc=0;cc<this.cellmax;cc++) { history.cell[cc] =0;}
			for(var xc=0;xc<this.crossmax;xc++){ history.cross[xc]=0;}

			var fc = this.xnum(this.cell[c].bx+(this.QaC(c)===1 ? -1 : 1), this.cell[c].by-1);
			this.sp0(fc, 1, scnt, sdata, history);
		}
		for(var c=0;c<this.cellmax;c++){ if(sdata[c]===0){ sdata[c]=2;} }
		return sdata;
	},
	sp0 : function(xc, depth, scnt, sdata, history){
		// 過ぎ去った地点に到達した→その地点からココまではループしてる
		if(history.cross[xc]>0){
			var min = history.cross[xc];
			for(var cc=0;cc<this.cellmax;cc++){ if(history.cell[cc]>=min){ sdata[cc]=1;} }
			return;
		}

		// 別に到達していない -> 隣に進んでみる
		history.cross[xc] = depth; // この交点にマーキング
		var bx=this.cross[xc].bx, by=this.cross[xc].by;
		var nb = [
			{ cell:this.cnum(bx-1,by-1), cross:this.xnum(bx-2,by-2), qans:1},
			{ cell:this.cnum(bx+1,by-1), cross:this.xnum(bx+2,by-2), qans:2},
			{ cell:this.cnum(bx-1,by+1), cross:this.xnum(bx-2,by+2), qans:2},
			{ cell:this.cnum(bx+1,by+1), cross:this.xnum(bx+2,by+2), qans:1}
		];
		for(var i=0;i<4;i++){
			if( nb[i].cell===null ||					// そっちは盤面の外だよ！
				history.cell[nb[i].cell]!==0 ||			// そっちは通って来た道だよ！
				nb[i].qans!==this.QaC(nb[i].cell) ||	// そっちは繋がってない。
				scnt[nb[i].cross]===1 || 				// そっちは行き止まり。
				sdata[nb[i].cell]===1 )		// sdataが1になってるってことは前にそっちから既に来ている
			{ continue;}					//  -> 先に分岐があるとしても、既に探索済みです.

			history.cell[nb[i].cell] = depth;	 // 隣のセルにマーキング
			this.sp0(nb[i].cross, depth+1, scnt, sdata, history);
			history.cell[nb[i].cell] = 0;		 // セルのマーキングを外す
		}
		history.cross[xc] = 0; // 交点のマーキングを外す
	},

	getScntData : function(){
		var scnt = [];
		for(var c=0;c<this.crossmax;c++){ scnt[c]=0;}
		for(var c=0;c<this.cellmax;c++){
			var bx=this.cell[c].bx, by=this.cell[c].by;
			if(this.QaC(c)===1){
				scnt[this.xnum(bx-1,by-1)]++;
				scnt[this.xnum(bx+1,by+1)]++;
			}
			else if(this.QaC(c)===2){
				scnt[this.xnum(bx-1,by+1)]++;
				scnt[this.xnum(bx+1,by-1)]++;
			}
		}
		return scnt;
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){ // 反転・回転全て
			for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,[0,2,1][bd.QaC(c)]);}
		}
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();

		pp.addCheck('colorslash','setting',false, '斜線の色分け', 'Slash with color');
		pp.setLabel('colorslash', '斜線を輪切りかのどちらかで色分けする(超重い)', 'Encolor slashes whether it consists in a loop or not.(Too busy)');
		pp.funcs['colorslash'] = function(){ pc.paintAll();};
	},

	menuinit : function(){
		this.SuperFunc.menuinit.call(this);
		ee('btnclear2').el.style.display = 'none';
	},
	menureset : function(){
		ee('btnclear2').el.style.display = 'inline';
		this.SuperFunc.menureset.call(this);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.errcolor1 = "red";
		this.errcolor2 = "rgb(0, 0, 127)";

		this.crosssize = 0.33;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid(false);

		this.drawNumbers();
		this.drawSlashes();

		this.drawCrosses();
		this.drawTarget_wagiri();
	},

	// オーバーライド
	prepaint : function(x1,y1,x2,y2){
		if(!ans.errDisp && pp.getVal('colorslash')){ x1=bd.minbx; y1=bd.minby; x2=bd.maxbx; y2=bd.maxby;}
		this.setRange(x1,y1,x2,y2);

		this.flushCanvas();
		this.paint();
	},

	// オーバーライド
	setBGCellColor : function(c){
		if(bd.cell[c].qans===-1 && bd.cell[c].error===1){
			g.fillStyle = this.errbcolor1;
			return true;
		}
		return false;
	},

	drawNumber1 : function(c){
		var obj = bd.cell[c], num = obj.qnum, key='cell_'+c;
		if(num!==-1){
			var text = (num!==-2 ? ({1:"輪",2:"切"})[num] : "?");
			this.dispnum(key, 1, text, 0.70, this.fontcolor, obj.cpx, obj.cpy);
		}
		else{ this.hideEL(key);}
	},

	drawSlashes : function(){
		this.vinc('cell_slash', 'auto');

		var headers = ["c_sl1_", "c_sl2_"], check=[];
		g.lineWidth = Math.max(this.cw/8, 2);

		if(!ans.errDisp && pp.getVal('colorslash')){
			var sdata=bd.getSlashData();
			for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],sdata[c]);} }
		}

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.cell[c].qans!=-1){
				if     (bd.cell[c].error==1){ g.strokeStyle = this.errcolor1;}
				else if(bd.cell[c].error==2){ g.strokeStyle = this.errcolor2;}
				else                        { g.strokeStyle = this.cellcolor;}

				if(bd.cell[c].qans==1){
					if(this.vnop(headers[0]+c,this.STROKE)){
						g.setOffsetLinePath(bd.cell[c].px,bd.cell[c].py, 0,0, this.cw,this.ch, true);
						g.stroke();
					}
				}
				else{ this.vhide(headers[0]+c);}

				if(bd.cell[c].qans==2){
					if(this.vnop(headers[1]+c,this.STROKE)){
						g.setOffsetLinePath(bd.cell[c].px,bd.cell[c].py, this.cw,0, 0,this.ch, true);
						g.stroke();
					}
				}
				else{ this.vhide(headers[1]+c);}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c]);}
		}

		if(!ans.errDisp && pp.getVal('colorslash')){
			for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],0);} }
		}
	},

	drawTarget_wagiri : function(){
		var islarge = ((tc.pos.x&1)===(tc.pos.y&1));
		this.drawCursor(islarge,k.editmode);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decode4Cross();
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encode4Cross();
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCrossNum();
		this.decodeCellQnum();
		this.decodeCellQanssub();
	},
	encodeData : function(){
		this.encodeCrossNum();
		this.encodeCellQnum();
		this.encodeCellQanssub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var sdata=bd.getSlashData();
		if( !this.checkLoopLine(sdata, false) ){
			this.setAlert('"切"が含まれた線が輪っかになっています。', 'There is a loop that consists "切".'); return false;
		}

		if( !this.checkQnumCross() ){
			this.setAlert('数字に繋がる線の数が間違っています。', 'A number is not equal to count of lines that is connected to it.'); return false;
		}

		if( !this.checkLoopLine(sdata, true) ){
			this.setAlert('"輪"が含まれた線が輪っかになっていません。', 'There is not a loop that consists "輪".'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QaC(c)===0);}) ){
			this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},

	checkLoopLine : function(sdata, checkLoop){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(!checkLoop && sdata[c]==1 && bd.QnC(c)===2){ result = false;}
			if( checkLoop && sdata[c]==2 && bd.QnC(c)===1){ result = false;}
		}
		if(!result){ for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],sdata[c]);} } }
		return result;
	},

	checkQnumCross : function(){
		var result = true, scnt = bd.getScntData();
		for(var c=0;c<bd.crossmax;c++){
			var qn = bd.QnX(c);
			if(qn>=0 && qn!=scnt[c]){
				if(this.inAutoCheck){ return false;}
				bd.sErX([c],1);
				result = false;
			}
		}
		return result;
	}
}
};
