//
// パズル固有スクリプト部 ごきげんななめ版 gokigen.js v3.4.0
//
pzprv3.custom.gokigen = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.playmode){
			if(!(kc.isZ ^ pp.getVal('dispred'))){ this.inputslash();}
			else{ this.dispBlue();}
		}
		else if(k.editmode){ this.inputcross();}
	},

	dispBlue : function(){
		var cc = this.cellid();
		if(cc===null || bd.QaC(cc)===0){ return;}

		var check = [];
		for(var i=0;i<bd.crossmax;i++){ check[i]=0;}

		var fc = bd.xnum(bd.cell[cc].bx+(bd.QaC(cc)===31?-1:1),bd.cell[cc].by-1);
		bd.searchline(check, 0, fc);
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QaC(c)===31 && check[bd.xnum(bd.cell[c].bx-1,bd.cell[c].by-1)]===1){ bd.sErC([c],2);}
			if(bd.QaC(c)===32 && check[bd.xnum(bd.cell[c].bx+1,bd.cell[c].by-1)]===1){ bd.sErC([c],2);}
		}

		bd.haserror = true;
		pc.paintAll();
	},
	inputslash : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		var use = pp.getVal('use'), sl=(this.btn.Left?31:32);
		if     (use===1){ bd.sQaC(cc, (bd.QaC(cc)!==sl?sl:0));}
		else if(use===2){ bd.sQaC(cc, (this.btn.Left?{0:31,31:32,32:0}:{0:32,31:0,32:31})[bd.QaC(cc)]);}

		pc.paintCellAround(cc);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTCross(ca);},

	keyinput : function(ca){
		this.key_inputcross(ca);
	},

	enablemake_p : true,
	paneltype    : 4
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 7,
	qrows : 7,

	iscross : 2,

	numzero : true,

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

			var fc = this.xnum(this.cell[c].bx+(this.QaC(c)===31?-1:1), this.cell[c].by-1);
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
			{ cell:this.cnum(bx-1,by-1), cross:this.xnum(bx-2,by-2), qans:31},
			{ cell:this.cnum(bx+1,by-1), cross:this.xnum(bx+2,by-2), qans:32},
			{ cell:this.cnum(bx-1,by+1), cross:this.xnum(bx-2,by+2), qans:32},
			{ cell:this.cnum(bx+1,by+1), cross:this.xnum(bx+2,by+2), qans:31}
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
			if(this.QaC(c)===31){
				scnt[this.xnum(bx-1,by-1)]++;
				scnt[this.xnum(bx+1,by+1)]++;
			}
			else if(this.QaC(c)===32){
				scnt[this.xnum(bx-1,by+1)]++;
				scnt[this.xnum(bx+1,by-1)]++;
			}
		}
		return scnt;
	},

	searchline : function(check, dir, c){
		var nx, tx=this.cross[c].bx, ty=this.cross[c].by, flag=true;
		check[c]=1;

		nx = this.xnum(tx-2,ty-2);
		if(nx!==null && dir!==4 && this.QaC(this.cnum(tx-1,ty-1))===31 && (check[nx]!==0 || !this.searchline(check,1,nx))){ flag=false;}
		nx = this.xnum(tx-2,ty+2);
		if(nx!==null && dir!==3 && this.QaC(this.cnum(tx-1,ty+1))===32 && (check[nx]!==0 || !this.searchline(check,2,nx))){ flag=false;}
		nx = this.xnum(tx+2,ty-2);
		if(nx!==null && dir!==2 && this.QaC(this.cnum(tx+1,ty-1))===32 && (check[nx]!==0 || !this.searchline(check,3,nx))){ flag=false;}
		nx = this.xnum(tx+2,ty+2);
		if(nx!==null && dir!==1 && this.QaC(this.cnum(tx+1,ty+1))===31 && (check[nx]!==0 || !this.searchline(check,4,nx))){ flag=false;}

		return flag;
	},
},

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){ // 反転・回転全て
			for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,{0:0,31:32,32:31}[bd.QaC(c)]);}
		}
	}
},

Menu:{
	disable_subclear : true,

	menufix : function(){
		this.addUseToFlags();
		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.70,
	bdmargin_image : 0.50,

	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;

		this.crosssize = 0.33;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid(false);

		this.drawSlashes();

		this.drawCrosses();
		this.drawTarget();
	},

	// オーバーライド
	setBGCellColor : function(c){
		if(bd.cell[c].qans===0 && bd.cell[c].error===1){
			g.fillStyle = this.errbcolor1;
			return true;
		}
		return false;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		var oldflag = ((type==1 && !this.checkpflag("c")) || (type==0 && this.checkpflag("d")));
		if(!oldflag){ this.decode4Cross();}
		else        { this.decodecross_old();}
	},
	pzlexport : function(type){
		if(type==1){ this.outpflag = 'c';}
		this.encode4Cross();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCrossNum();
		this.decodeCell( function(obj,ca){
			if     (ca==="1"){ obj.qans = 31;}
			else if(ca==="2"){ obj.qans = 32;}
		});
	},
	encodeData : function(){
		this.encodeCrossNum();
		this.encodeCell( function(obj){
			if     (obj.qans===31){ return "1 ";}
			else if(obj.qans===32){ return "2 ";}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLoopLine() ){
			this.setAlert('斜線で輪っかができています。', 'There is a loop consisted in some slashes.'); return false;
		}

		if( !this.checkQnumCross() ){
			this.setAlert('数字に繋がる線の数が間違っています。', 'A number is not equal to count of lines that is connected to it.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QaC(c)===0);}) ){
			this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},

	checkLoopLine : function(){
		var result = true, sdata = bd.getSlashData();
		for(var c=0;c<bd.cellmax;c++){
			if(sdata[c]==1){ result = false;}
		}
		if(!result){ for(var c=0;c<bd.cellmax;c++){ if(sdata[c]===1){ bd.sErC([c],1);} } }
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
