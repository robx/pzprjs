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

		var fc = bd.xnum(bd.cell[cc].bx+(bd.QaC(cc)===31?-1:1),bd.cell[cc].by-1);
		var check = bd.searchline(fc);
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
		var sdata=[], sinfo=this.getSlashInfo();
		for(var c=0;c<this.cellmax;c++){ sdata[c] =(this.QaC(c)!==0?0:-1);}
		for(var c=0;c<this.cellmax;c++){
			if(sdata[c]!==0){ continue;}

			var fc = this.xnum(this.cell[c].bx+(this.QaC(c)===31?-1:1), this.cell[c].by-1);
			this.searchloop(fc, sinfo, sdata);
		}
		for(var c=0;c<this.cellmax;c++){ if(sdata[c]===0){ sdata[c]=2;} }
		return sdata;
	},
	searchloop : function(fc, sinfo, sdata){
		var passed=[];
		for(var xc=0;xc<this.crossmax;xc++){ passed[xc]=false;}

		var xc=fc, history=[{cell:null,cross:fc}];

		while(history.length>0){
			var cc=null, xc=history[history.length-1].cross;
			passed[xc] = true;

			// 今まで通っていないセルを調べる
			for(var i=0;i<sinfo.cross[xc].length;i++){
				var cellid = sinfo.cross[xc][i];
				if(!!sinfo.cell[cellid].length){ cc=cellid; break;}
			}

			// セルを経由してその先の交点へ
			if(cc!==null){
				var xc2 = sinfo.cell[cc][((sinfo.cell[cc][0]!==xc)?0:1)];
				history.push({cell:cc,cross:null});
				sinfo.cell[cc] = []

				// ループになった場合 => ループフラグをセットする
				if(!!passed[xc2]){
					for(var i=history.length-1;i>=0;i--){
						if(history[i].cross===xc2){ break;}
						sdata[history[i].cell] = 1;
					}
				}
				// 先の交点でループ判定にならなかった場合 => 次のループへ
				else{
					history[history.length-1].cross = xc2;
					continue;
				}
			}
			else{ sinfo.cross[xc] = [];}	/* 全て通過済み */

			// 一つ前に戻る
			var h = history.pop();
			if(sdata[h.cell]===0){ sdata[h.cell]=2;}
		}
	},

	getSlashInfo : function(){
		var sinfo={cell:[],cross:[]};
		for(var c=0;c<this.crossmax;c++){ sinfo.cross[c]=[];}
		for(var c=0;c<this.cellmax;c++){
			sinfo.cell[c]=[];
			var bx=this.cell[c].bx, by=this.cell[c].by, qa=this.QaC(c), xc1, xc2;
			if     (qa===31){ xc1=this.xnum(bx-1,by-1); xc2=this.xnum(bx+1,by+1);}
			else if(qa===32){ xc1=this.xnum(bx-1,by+1); xc2=this.xnum(bx+1,by-1);}
			else{ continue;}

			sinfo.cell[c] = [xc1,xc2];
			sinfo.cross[xc1].push(c);
			sinfo.cross[xc2].push(c);
		}
		return sinfo;
	},

	searchline : function(fc){
		var check = [], stack=[fc];
		for(var i=0;i<bd.crossmax;i++){ check[i]=0;}

		while(stack.length>0){
			var c=stack.pop();
			if(check[c]!==0){ continue;}

			check[c]=1;
			var nc, tx=this.cross[c].bx, ty=this.cross[c].by;
			nc=this.xnum(tx-2,ty-2); if(nc!==null && check[nc]===0 && this.QaC(this.cnum(tx-1,ty-1))===31){ stack.push(nc);}
			nc=this.xnum(tx-2,ty+2); if(nc!==null && check[nc]===0 && this.QaC(this.cnum(tx-1,ty+1))===32){ stack.push(nc);}
			nc=this.xnum(tx+2,ty-2); if(nc!==null && check[nc]===0 && this.QaC(this.cnum(tx+1,ty-1))===32){ stack.push(nc);}
			nc=this.xnum(tx+2,ty+2); if(nc!==null && check[nc]===0 && this.QaC(this.cnum(tx+1,ty+1))===31){ stack.push(nc);}
		}
		return check;
	}
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
	getBGCellColor : function(cell){
		if(cell.qans===0 && cell.error===1){ return this.errbcolor1;}
		return null;
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
		var result = true, sinfo = bd.getSlashInfo();
		for(var c=0;c<bd.crossmax;c++){
			var qn = bd.QnX(c);
			if(qn>=0 && qn!=sinfo.cross[c].length){
				if(this.inAutoCheck){ return false;}
				bd.sErX([c],1);
				result = false;
			}
		}
		return result;
	}
}
};
