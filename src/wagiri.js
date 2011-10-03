//
// パズル固有スクリプト部 ごきげんななめ・輪切版 wagiri.js v3.4.0
//
pzprv3.custom.wagiri = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){ if(this.mousestart){ this.inputquestion();}},
	inputplay : function(){ if(this.mousestart){ this.inputslash();}},

	inputquestion : function(){
		var pos = this.borderpos(0.33);
		if(!bd.isinside(pos.bx,pos.by)){ return;}
		if(pos.oncross()){
			this.inputcross();
		}
		else if(pos.oncell()){
			var cell0 = tc.getTCC(), cell = this.getcell();
			if(cell!==cell0){
				tc.setTCC(cell);
				cell0.draw();
				cell.draw();
			}
			else if(!cell.isnull){
				var trans = (this.btn.Left ? [-1,1,0,2,-2] : [2,-2,0,-1,1]);
				cell.setNum(trans[cell.getQnum()+2]);
				cell.draw();
			}
		}
		else{
			var tcp = tc.getTCP();
			if(pos.equals(tcp)){
				tc.setTCP(pos);
				tcp.draw();
				pos.draw();
			}
		}
	},
	inputslash : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var use = pp.getVal('use'), sl=(this.btn.Left?31:32), qa = cell.getQans();
		if     (use===1){ cell.setQans(qa!==sl?sl:0);}
		else if(use===2){ cell.setQans((this.btn.Left?{0:31,31:32,32:0}:{0:32,31:0,32:31})[qa]);}

		cell.drawaround();
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
		if(pos.oncross()){
			this.key_inputcross(ca);
		}
		else if(pos.oncell()){
			var cell = tc.getTCC(), val = 0;
			if     (ca=='1'){ val= 1;}
			else if(ca=='2'){ val= 2;}
			else if(ca=='-'){ val=-2;}
			else if(ca==' '){ val=-1;}

			if(!cell.isnull && val!==0){
				cell.setNum(val);
				cell.draw();
			}
		}
	}
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

	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){ // 反転・回転全て
			for(var c=0;c<this.cellmax;c++){ this.cell[c].setQans({0:0,31:32,32:31}[this.cell[c].getQans()]);}
		}
	}
},

Menu:{
	disable_subclear : true,

	menufix : function(){
		this.addUseToFlags();

		pp.addCheck('colorslash','setting',false, '斜線の色分け', 'Slash with color');
		pp.setLabel('colorslash', '斜線を輪切りかのどちらかで色分けする(重いと思います)', 'Encolor slashes whether it consists in a loop or not.(Too busy)');
		this.funcs['colorslash'] = function(){ pc.paintAll();};
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.70,
	bdmargin_image : 0.50,

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
	paintRange : function(x1,y1,x2,y2){
		if(!bd.haserror && pp.getVal('colorslash')){
			this.setRange(bd.minbx, bd.minby, bd.maxbx, bd.maxby);
		}
		else{
			this.setRange(x1,y1,x2,y2);
		}
		this.prepaint();
	},

	// オーバーライド
	getBGCellColor : function(cell){
		if(cell.qans===0 && cell.error===1){ return this.errbcolor1;}
		return null;
	},

	drawNumber1 : function(cell){
		var num = cell.qnum, key='cell_'+cell.id;
		if(num!==-1){
			var text = (num!==-2 ? ({1:"輪",2:"切"})[num] : "?");
			this.dispnum(key, 1, text, 0.70, this.fontcolor, cell.px, cell.py);
		}
		else{ this.hideEL(key);}
	},

	drawSlashes : function(){
		if(!bd.haserror && pp.getVal('colorslash')){
			var sdata=bd.getSlashData();
			for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.cell[c].seterr(sdata[c]);} }

			this.SuperFunc.drawSlashes.call(this);

			for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.cell[c].seterr(0);} }
		}
		else{
			this.SuperFunc.drawSlashes.call(this);
		}
	},

	drawTarget_wagiri : function(){
		var islarge = tc.pos.oncell();
		this.drawCursor(islarge,this.owner.editmode);
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
		this.decodeCell( function(obj,ca){
			if     (ca==="1"){ obj.qans = 31;}
			else if(ca==="2"){ obj.qans = 32;}
		});
	},
	encodeData : function(){
		this.encodeCrossNum();
		this.encodeCellQnum();
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

		if( !this.checkAllCell(function(cell){ return (cell.getQans()===0);}) ){
			this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},

	checkLoopLine : function(sdata, checkLoop){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(!checkLoop && sdata[c]==1 && bd.cell[c].getQnum()===2){ result = false;}
			if( checkLoop && sdata[c]==2 && bd.cell[c].getQnum()===1){ result = false;}
		}
		if(!result){ for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.cell[c].seterr(sdata[c]);} } }
		return result;
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
