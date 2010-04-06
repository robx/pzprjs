//
// パズル固有スクリプト部 フィルオミノ版 fillomino.js v3.2.4
//
Puzzles.fillomino = function(){ };
Puzzles.fillomino.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("フィルオミノ","Fillomino");
		base.setExpression("<small><span style=\"line-height:125%;\">　マウスの左ボタンを押しながら点線上を動かすと境界線が引けます。マスの中央から同じことをすると数字を隣のマスにコピーできます。右ボタンは補助記号です。<br>　キーボードでは同じ入力を、それぞれZキー、Xキー、Ctrlキーを押しながら矢印キーで行うことができます。</span></small>",
						   "<small><span style=\"line-height:125%;\"> Left Button Drag on dotted line to input border line. Do it from center of the cell to copy the number. Right Button Drag to input auxiliary marks.<br> By keyboard, it is available to input each ones by using arrow keys with 'Z', 'X' or 'Ctrl' key.</span></small>");
		base.setFloatbgcolor("rgb(64, 64, 64)");

		enc.pidKanpen = 'fillomino';
	},
	menufix : function(){
		pp.addCheck('enbnonum','setting',false,'未入力で正答判定','Allow Empty cell');
		pp.setLabel('enbnonum', '全ての数字が入っていない状態での正答判定を許可する', 'Allow answer check with empty cell in the board.');
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode){
				if(this.btn.Left){ this.borderinput = this.inputborder_fillomino();}
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(!kp.enabled()){ this.mouseCell=-1; 	this.inputqnum();}
				else{ kp.display();}
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left){
					if(this.borderinput){ this.inputborder_fillomino();}
					else{ this.dragnumber();}
				}
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.inputborder_fillomino = function(){
			var pos = this.crosspos(0.25);
			if(this.mouseCell==-1 && pos.x%2==1 && pos.y%2==1){
				pos = this.cellid();
				if(pos==-1){ return true;}
				this.inputData = bd.getNum(pos);
				this.mouseCell = pos;
				return false;
			}
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return true;}

			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!=-1 && id!=-1){
				if((pos.x%2==0 && this.mouseCell.x==pos.x && Math.abs(this.mouseCell.y-pos.y)==1) ||
				   (pos.y%2==0 && this.mouseCell.y==pos.y && Math.abs(this.mouseCell.x-pos.x)==1) )
				{
					this.mouseCell=-1

					if(this.inputData==-1){ this.inputData=(bd.QaB(id)==0?1:0);}
					if(this.inputData!=-1){ bd.sQaB(id, this.inputData);}
					else{ return true;}
					pc.paintBorder(id);
				}
			}
			this.mouseCell = pos;
			return true;
		};
		mv.dragnumber = function(){
			var cc = this.cellid();
			if(cc==-1||cc==this.mouseCell){ return;}
			bd.sQaC(cc, this.inputData);
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(!this.isCTRL && !this.isZ && !this.isX && this.moveTCell(ca)){ return;}
			if(kc.key_fillomino(ca)){ return;}
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(ca=='x' && !this.keyPressed){ this.isX=true; return;}
			this.key_inputqnum(ca);
		};
		kc.keyup    = function(ca){ if(ca=='z'){ this.isZ=false;} if(ca=='x'){ this.isX=false;}};
		kc.key_fillomino = function(ca){
			if(k.editmode){ return false;}

			var cc = tc.getTCC();
			if(cc==-1){ return;}
			var flag = false;

			if     (ca == k.KEYUP && bd.up(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.ub(cc),(bd.QsB(bd.ub(cc))==0?1:0)); tc.decTCY(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.ub(cc),(bd.QaB(bd.ub(cc))==0?1:0)); flag = true;}
				else if(kc.isX){ bd.sQaC(bd.up(cc),bd.getNum(cc)); tc.decTCY(2); flag = true;}
			}
			else if(ca == k.KEYDN && bd.dn(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.db(cc),(bd.QsB(bd.db(cc))==0?1:0)); tc.incTCY(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.db(cc),(bd.QaB(bd.db(cc))==0?1:0)); flag = true;}
				else if(kc.isX){ bd.sQaC(bd.dn(cc),bd.getNum(cc)); tc.incTCY(2); flag = true;}
			}
			else if(ca == k.KEYLT && bd.lt(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.lb(cc),(bd.QsB(bd.lb(cc))==0?1:0)); tc.decTCX(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.lb(cc),(bd.QaB(bd.lb(cc))==0?1:0)); kc.tcMoved = true; flag = true;}
				else if(kc.isX){ bd.sQaC(bd.lt(cc),bd.getNum(cc)); tc.decTCX(2); kc.tcMoved = true; flag = true;}
			}
			else if(ca == k.KEYRT && bd.rt(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.rb(cc),(bd.QsB(bd.rb(cc))==0?1:0)); tc.incTCX(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.rb(cc),(bd.QaB(bd.rb(cc))==0?1:0)); flag = true;}
				else if(kc.isX){ bd.sQaC(bd.rt(cc),bd.getNum(cc)); tc.incTCX(2); flag = true;}
			}

			kc.tcMoved = flag;
			if(flag){ pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1); return true;}
			return false;
		};

		kc.isX = false;
		kc.isZ = false;

		kp.generate(0, true, true, '');
		kp.kpinput = function(ca){ kc.key_inputqnum(ca);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.setBorderColorFunc('qans');

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeNumber16();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnum_kanpen();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCellQanssub();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellQanssub();
			this.encodeBorderAns();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeCellQans_kanpen();

			// 境界線を自動入力
			for(var id=0;id<bd.bdmax;id++){
				var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
				var bdflag = (cc1!=-1 && cc2!=-1 && bd.getNum(cc1)!=-1 && bd.getNum(cc2)!=-1 && bd.getNum(cc1)!=bd.getNum(cc2));
				bd.sQaB(id,(bdflag?1:0));
			}
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen();
			this.encodeCellQans_kanpen();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = this.searchRarea2();
			if( !this.checkErrorFlag(rinfo, 3) ){
				this.setAlert('数字が含まれていないブロックがあります。','A block has no number.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, 1) || !this.checkAreaSize(rinfo, 2) ){
				this.setAlert('ブロックの大きさより数字のほうが大きいです。','A number is bigger than the size of block.'); return false;
			}

			if( !this.checkSideAreaSize(rinfo, function(rinfo,r){ return rinfo.room[r].number;}) ){
				this.setAlert('同じ数字のブロックが辺を共有しています。','Adjacent blocks have the same number.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, 2) || !this.checkAreaSize(rinfo, 1) ){
				this.setAlert('ブロックの大きさよりも数字が小さいです。','A number is smaller than the size of block.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, 4) ){
				this.setAlert('複数種類の数字が入っているブロックがあります。','A block has two or more kinds of numbers.'); return false;
			}

			if( !pp.getVal('enbnonum') && !this.checkAllCell(bd.noNum) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return (pp.getVal('enbnonum') || this.checkAllCell(bd.noNum));};

		ans.checkAreaSize = function(rinfo, flag){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				var room = rinfo.room[id];
				if(room.error==-1||room.number<=0){ continue;}
				if     (flag==1 && room.number<room.idlist.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC(room.idlist,1);
					result = false;
				}
				else if(flag==2 && room.number>room.idlist.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC(room.idlist,1);
					result = false;
				}
			}
			return result;
		};
		ans.checkErrorFlag = function(rinfo, val){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].error==val){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
				}
			}
			return result;
		};

		ans.searchRarea2 = function(){
			var rinfo = area.getRoomInfo();
			for(var id=1,max=rinfo.max;id<=max;id++){
				var room = rinfo.room[id];
				room.error  =  0;
				room.number = -1;
				var nums = [];
				var emptycell = 0, numcnt = 0, filled = 0;
				for(var i=0;i<room.idlist.length;i++){
					var c = room.idlist[i];
					var num = bd.getNum(c);
					if(num==-1){ emptycell++;}
					else if(isNaN(nums[num])){ numcnt++; filled=num; nums[num]=1;}
					else{ nums[num]++;}
				}
				if(numcnt>1 && emptycell>0){ room.error=4; continue;}
				else if(numcnt==0)         { room.error=3; continue;}
				else if(numcnt==1 && filled < nums[filled]+emptycell){ room.error=2;  room.number=filled; continue;}
				else if(numcnt==1 && filled > nums[filled]+emptycell){ room.error=1;  room.number=filled; continue;}
				else if(numcnt==1)                                   { room.error=-1; room.number=filled; continue;}

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
			return rinfo;
		};
		ans.sa0 = function(rinfo, i, areaid){
			if(rinfo.id[i]!=0){ return;}
			rinfo.id[i] = areaid;
			rinfo.room[areaid].idlist.push(i);
			if( bd.sameNumber(i,bd.up(i)) ){ this.sa0(rinfo, bd.up(i), areaid);}
			if( bd.sameNumber(i,bd.dn(i)) ){ this.sa0(rinfo, bd.dn(i), areaid);}
			if( bd.sameNumber(i,bd.lt(i)) ){ this.sa0(rinfo, bd.lt(i), areaid);}
			if( bd.sameNumber(i,bd.rt(i)) ){ this.sa0(rinfo, bd.rt(i), areaid);}
			return;
		};
	}
};
