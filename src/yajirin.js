//
// パズル固有スクリプト部 ヤジリン版 yajirin.js v3.3.2
// 
Puzzles.yajirin = function(){ };
Puzzles.yajirin.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.irowake  = 1;
		k.isborder = 1;

		k.isCenterLine    = true;
		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.NumberIsWhite   = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode) this.inputdirec();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputcell();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if     (k.editmode) this.inputqnum();
				else if(k.playmode) this.inputcell();
			}
		};
		mv.mousemove = function(){
			if(k.editmode) this.inputdirec();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputcell();
			}
		};

		// 線を引かせたくないので上書き
		bd.noLP = function(cc,dir){ return (bd.isBlack(cc) || bd.isNum(cc));},
		bd.enableLineNG = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.dotcolor = "rgb(255, 96, 191)";

		pc.paint = function(){
			this.drawBGCells();
			this.drawDotCells(false);
			this.drawGrid();
			this.drawBlackCells();

			this.drawArrowNumbers();

			this.drawLines();
			this.drawPekes(1);

			this.drawChassis();

			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeArrowNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeArrowNumber16();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellDirecQnum_kanpen(true);
		};
		enc.encodeKanpen = function(){
			fio.encodeCellDirecQnum_kanpen(true);
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellDirecQnum();
			this.decodeCellAns();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellDirecQnum();
			this.encodeCellAns();
			this.encodeBorderLine();
		};

		fio.kanpenOpen = function(array){
			this.decodeCellDirecQnum_kanpen(false);
			this.decodeBorderLine();
		};
		fio.kanpenSave = function(){
			this.encodeCellDirecQnum_kanpen(false);
			this.encodeBorderLine();
		};

		fio.decodeCellDirecQnum_kanpen = function(isurl){
			var dirs = [k.UP, k.LT, k.DN, k.RT];
			this.decodeCell( function(obj,ca){
				if     (ca==="#" && !isurl){ obj.qans = 1;}
				else if(ca==="+" && !isurl){ obj.qsub = 1;}
				else if(ca!=="."){
					var num = parseInt(ca);
					obj.qdir = dirs[(num & 0x30) >> 4];
					obj.qnum = (num & 0x0F);
				}
			});
		};
		fio.encodeCellDirecQnum_kanpen = function(isurl){
			var dirs = [k.UP, k.LT, k.DN, k.RT];
			this.encodeCell( function(obj){
				var num = ((obj.qnum>=0&&obj.qnum<16) ? obj.qnum : -1), dir;
				if(num!==-1 && obj.qdir!==k.NONE){
					for(dir=0;dir<4;dir++){ if(dirs[dir]===obj.qdir){ break;}}
					return (""+((dir<<4)+(num&0x0F))+" ");
				}
				else if(!isurl){
					if     (obj.qans===1){ return "# ";}
					else if(obj.qsub===1){ return "+ ";}
				}
				return ". ";
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branched line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('交差している線があります。','There is a crossing line.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)>0 && bd.isBlack(c));}) ){
				this.setAlert('黒マスの上に線が引かれています。','Theer is a line on the black cell.'); return false;
			}

			if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
				this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			if( !this.checkArrowNumber() ){
				this.setAlert('矢印の方向にある黒マスの数が正しくありません。','The number of black cells are not correct.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==0 && !bd.isBlack(c) && bd.noNum(c));}) ){
				this.setAlert('黒マスも線も引かれていないマスがあります。','Theer is an empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkLcntCell(1);};

		ans.checkArrowNumber = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isValidNum(c) || bd.DiC(c)==0 || bd.isBlack(c)){ continue;}
				var bx = bd.cell[c].bx, by = bd.cell[c].by, dir = bd.DiC(c);
				var cnt=0, clist = [];
				if     (dir==k.UP){ by-=2; while(by>bd.minby){ clist.push(bd.cnum(bx,by)); by-=2;} }
				else if(dir==k.DN){ by+=2; while(by<bd.maxby){ clist.push(bd.cnum(bx,by)); by+=2;} }
				else if(dir==k.LT){ bx-=2; while(bx>bd.minbx){ clist.push(bd.cnum(bx,by)); bx-=2;} }
				else if(dir==k.RT){ bx+=2; while(bx<bd.maxbx){ clist.push(bd.cnum(bx,by)); bx+=2;} }

				for(var i=0;i<clist.length;i++){ if(bd.isBlack(clist[i])){ cnt++;} }

				if(bd.QnC(c)!=cnt){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					bd.sErC(clist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
