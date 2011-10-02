//
// パズル固有スクリプト部 ごきげんななめ版 gokigen.js v3.4.0
//
pzprv3.custom.gokigen = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){ if(this.mousestart){ this.inputcross();}},
	inputplay : function(){ if(this.mousestart){ this.inputslash();}},
	inputRed : function(){ if(this.owner.playmode){ this.dispBlue();}},

	dispBlue : function(){
		var cell = this.getcell();
		this.mousereset();
		if(cell.isnull || cell.getQans()===0){ return;}

		var fcross = cell.relcross((cell.qans===31?-1:1), -1);
		var check = bd.searchline(fcross);
		for(var c=0;c<bd.cellmax;c++){
			var cell2 = bd.cell[c];
			if(cell2.getQans()===31 && check[cell2.relcross(-1,-1).id]===1){ cell2.seterr(2);}
			if(cell2.getQans()===32 && check[cell2.relcross( 1,-1).id]===1){ cell2.seterr(2);}
		}

		bd.haserror = true;
		pc.paintAll();
	},
	inputslash : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var use = pp.getVal('use'), sl=(this.btn.Left?31:32), qa = cell.getQans();
		if     (use===1){ cell.setQans(qa!==sl?sl:0);}
		else if(use===2){ cell.setQans((this.btn.Left?{0:31,31:32,32:0}:{0:32,31:0,32:31})[qa]);}

		pc.paintCellAround(cell);
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
Cross:{
	maxnum : 4,
	minnum : 0
},
Board:{
	qcols : 7,
	qrows : 7,

	iscross : 2,

	// 正答判定用
	getSlashData : function(){
		var sdata=[], sinfo=this.getSlashInfo();
		for(var c=0;c<this.cellmax;c++){ sdata[c] =(this.cell[c].qans!==0?0:-1);}
		for(var c=0;c<this.cellmax;c++){
			if(sdata[c]!==0){ continue;}

			var cell = this.cell[c];
			var fcross = cell.relcross((cell.qans===31?-1:1), -1);
			this.searchloop(fcross.id, sinfo, sdata);
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
			var cell=this.cell[c], cross1, cross2;
			if     (cell.qans===31){ cross1=cell.relcross(-1,-1); cross2=cell.relcross(1,1);}
			else if(cell.qans===32){ cross1=cell.relcross(-1,1); cross2=cell.relcross(1,-1);}
			else{ continue;}

			sinfo.cell[c] = [cross1.id,cross2.id];
			sinfo.cross[cross1.id].push(c);
			sinfo.cross[cross2.id].push(c);
		}
		return sinfo;
	},

	searchline : function(fcross){
		var check = [], stack=[fcross];
		for(var i=0;i<this.crossmax;i++){ check[i]=0;}

		while(stack.length>0){
			var cross=stack.pop();
			if(check[cross.id]!==0){ continue;}
			check[cross.id]=1;

			var nc;
			nc=cross.relcross(-2,-2); if(!nc.isnull && check[nc.id]===0 && cross.relcell(-1,-1).getQans()===31){ stack.push(nc);}
			nc=cross.relcross( 2,-2); if(!nc.isnull && check[nc.id]===0 && cross.relcell(-1, 1).getQans()===32){ stack.push(nc);}
			nc=cross.relcross(-2, 2); if(!nc.isnull && check[nc.id]===0 && cross.relcell( 1,-1).getQans()===32){ stack.push(nc);}
			nc=cross.relcross( 2, 2); if(!nc.isnull && check[nc.id]===0 && cross.relcell( 1, 1).getQans()===31){ stack.push(nc);}
		}
		return check;
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){ // 反転・回転全て
			for(var c=0;c<bd.cellmax;c++){ bd.cell[c].setQans({0:0,31:32,32:31}[bd.cell[c].getQans()]);}
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

		if( !this.checkAllCell(function(cell){ return (cell.getQans()===0);}) ){
			this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},

	checkLoopLine : function(){
		var sdata = bd.getSlashData();
		var errclist = bd.cell.filter(function(cell){ return (sdata[cell.id]===1);});
		errclist.seterr(1);
		return (errclist.length===0);
	},
	checkQnumCross : function(){
		var result = true, sinfo = bd.getSlashInfo();
		for(var c=0;c<bd.crossmax;c++){
			var cross = bd.cross[c], qn = cross.getQnum();
			if(qn>=0 && qn!=sinfo.cross[c].length){
				if(this.inAutoCheck){ return false;}
				cross.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
};
