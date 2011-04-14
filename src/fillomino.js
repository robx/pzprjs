//
// パズル固有スクリプト部 フィルオミノ版 fillomino.js v3.4.0
//
pzprv3.custom.fillomino = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.isAnsNumber     = true;

		this.floatbgcolor = "rgb(64, 64, 64)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.playmode){
			if(this.btn.Left){
				this.checkBorderMode();
				if(this.bordermode){ this.inputborderans();}
				else               { this.dragnumber_fillomino();}
			}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			this.mouseCell=null;
			this.inputqnum();
		}
	},
	mousemove : function(){
		if(k.playmode){
			if(this.btn.Left){
				if(this.bordermode){ this.inputborderans();}
				else               { this.dragnumber_fillomino();}
			}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	dragnumber_fillomino : function(){
		var cc = this.cellid();
		if(cc===null||cc===this.mouseCell){ return;}

		if(this.inputData===null){
			this.inputData = bd.getNum(cc);
			if(this.inputData===-1){ this.inputData=-2;}
			this.mouseCell = cc;
			return;
		}
		else if(this.inputData===-2){
			this.inputData=(bd.getNum(cc)===-1?-3:-1);
		}

		if(this.inputData>=-1){
			bd.sAnC(cc, this.inputData);
			pc.paintCell(cc);
		}
		else if(this.inputData<=-3){
			var id = bd.bnum(((bd.cell[cc].bx+bd.cell[this.mouseCell].bx)>>1),
							 ((bd.cell[cc].by+bd.cell[this.mouseCell].by)>>1));
			if(this.inputData===-3){ this.inputData=(bd.QsB(id)===1?-5:-4);}
			if(id!==null){
				bd.sQsB(id, (this.inputData===-4?1:0));
				pc.paintBorder(id);
			}
		}
		this.mouseCell = cc;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	keyinput : function(ca){
		if(this.isCTRL || this.isX || this.isZ){
			if(k.playmode){ this.key_fillomino(ca);}
		}
		else{
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		}
	},
	key_fillomino : function(ca){
		var cc = tc.getTCC();
		if(cc===null){ return;}

		var nc, nb, move, flag;
		switch(ca){
			case k.KEYUP: nc=bd.up(cc); nb=bd.ub(cc); move=function(){ tc.decTCY(2);}; break;
			case k.KEYDN: nc=bd.dn(cc); nb=bd.db(cc); move=function(){ tc.incTCY(2);}; break;
			case k.KEYLT: nc=bd.lt(cc); nb=bd.lb(cc); move=function(){ tc.decTCX(2);}; break;
			case k.KEYRT: nc=bd.rt(cc); nb=bd.rb(cc); move=function(){ tc.incTCX(2);}; break;
			default: return;
		}
		if(nc!==null){
			this.tcMoved = (this.isCTRL || this.isX || this.isZ);
			if(this.isCTRL)  { if(nb!==null){ bd.sQsB(nb,((bd.QsB(nb)===0)?1:0)); move();}}
			else if(this.isZ){ if(nb!==null){ bd.sQaB(nb,(!bd.isBorder(nb)?1:0));        }}
			else if(this.isX){ if(nc!==null){ bd.sAnC(nc,bd.getNum(cc));          move();}}

			if(this.tcMoved){ pc.paintCell(cc);}
		}
	}
},

KeyPopup:{
	paneltype  : 10,
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Menu:{
	menufix : function(){
		pp.addCheck('enbnonum','setting',false,'未入力で正答判定','Allow Empty cell');
		pp.setLabel('enbnonum', '全ての数字が入っていない状態での正答判定を許可する', 'Allow answer check with empty cell in the board.');
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBorderColorFunc('qans');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawNumbers();

		this.drawBorders();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawCursor();
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
	},

	decodeKanpen : function(){
		fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellAnumsub();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAnumsub();
		this.encodeBorderAns();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();

		// 境界線を自動入力
		for(var id=0;id<bd.bdmax;id++){
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			var bdflag = (cc1!==null && cc2!==null && bd.getNum(cc1)!==-1 && bd.getNum(cc2)!==-1 && bd.getNum(cc1)!==bd.getNum(cc2));
			bd.border[id].qans = (bdflag?1:0);
		}
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.getErrorFlag_cell();
		if( !this.checkErrorFlag_cell(rinfo, 3) ){
			this.setAlert('数字が含まれていないブロックがあります。','A block has no number.'); return false;
		}

		if( !this.checkErrorFlag_cell(rinfo, 1) || !this.checkAreaSize(rinfo, 2) ){
			this.setAlert('ブロックの大きさより数字のほうが大きいです。','A number is bigger than the size of block.'); return false;
		}

		if( !this.checkSideAreaSize(rinfo, function(rinfo,r){ return rinfo.room[r].number;}) ){
			this.setAlert('同じ数字のブロックが辺を共有しています。','Adjacent blocks have the same number.'); return false;
		}

		if( !this.checkErrorFlag_cell(rinfo, 2) || !this.checkAreaSize(rinfo, 1) ){
			this.setAlert('ブロックの大きさよりも数字が小さいです。','A number is smaller than the size of block.'); return false;
		}

		if( !this.checkErrorFlag_cell(rinfo, 4) ){
			this.setAlert('複数種類の数字が入っているブロックがあります。','A block has two or more kinds of numbers.'); return false;
		}

		if( !pp.getVal('enbnonum') && !this.checkNoNumCell() ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return (pp.getVal('enbnonum') || this.checkNoNumCell());},

	checkAreaSize : function(rinfo, flag){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			var room = rinfo.room[id];
			if(room.error===-1||room.number<=0){ continue;}
			if     (flag===1 && room.number<room.idlist.length){
				if(this.inAutoCheck){ return false;}
				bd.sErC(room.idlist,1);
				result = false;
			}
			else if(flag===2 && room.number>room.idlist.length){
				if(this.inAutoCheck){ return false;}
				bd.sErC(room.idlist,1);
				result = false;
			}
		}
		return result;
	},

	getErrorFlag_cell : function(){
		var rinfo = bd.areas.getRoomInfo();
		for(var id=1,max=rinfo.max;id<=max;id++){
			var room = rinfo.room[id];
			room.error  =  0;
			room.number = -1;
			var nums = [];
			var emptycell=0, numcnt=0, filled=0;
			for(var i=0;i<room.idlist.length;i++){
				var c = room.idlist[i];
				var num = bd.getNum(c);
				if(num==-1){ emptycell++;}
				else if(isNaN(nums[num])){ numcnt++; filled=num; nums[num]=1;}
				else{ nums[num]++;}
			}

			if(numcnt>1 && emptycell>0){ room.error=4;}
			else if(numcnt===0)        { room.error=3;}
			else if(numcnt===1 && filled < nums[filled]+emptycell){ room.error=2;  room.number=filled;}
			else if(numcnt===1 && filled > nums[filled]+emptycell){ room.error=1;  room.number=filled;}
			else if(numcnt===1)                                   { room.error=-1; room.number=filled;}
			else{
				// ここまで来るのはemptycellが0で2種類以上の数字が入っている領域のみ
				// -> それぞれに別の領域idを割り当てて判定できるようにする
				var clist = room.idlist;
				for(var i=0;i<clist.length;i++){ rinfo.id[clist[i]] = 0;}
				for(var i=0;i<clist.length;i++){
					if(rinfo.id[clist[i]]!=0){ continue;}
					rinfo.max++; max++;
					rinfo.room[rinfo.max] = {idlist:[]};
					this.sa0(rinfo, clist[i], rinfo.max);
				}
				// 最後に自分の情報を無効にする
				room = {idlist:[], error:0, number:-1};
			}
		}
		return rinfo;
	},
	sa0 : function(rinfo, i, areaid){
		if(rinfo.id[i]!=0){ return;}
		rinfo.id[i] = areaid;
		rinfo.room[areaid].idlist.push(i);
		if( bd.sameNumber(i,bd.up(i)) ){ this.sa0(rinfo, bd.up(i), areaid);}
		if( bd.sameNumber(i,bd.dn(i)) ){ this.sa0(rinfo, bd.dn(i), areaid);}
		if( bd.sameNumber(i,bd.lt(i)) ){ this.sa0(rinfo, bd.lt(i), areaid);}
		if( bd.sameNumber(i,bd.rt(i)) ){ this.sa0(rinfo, bd.rt(i), areaid);}
		return;
	}
}
};
