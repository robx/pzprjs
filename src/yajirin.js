//
// パズル固有スクリプト部 ヤジリン版 yajirin.js v3.3.1
// 
Puzzles.yajirin = function(){ };
Puzzles.yajirin.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 1;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = true;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = true;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = true;	// 黒マスを入力するパズル
		k.NumberIsWhite   = true;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = true;	// pencilbox/カンペンにあるパズル

		if(k.EDITOR){
			base.setExpression("　矢印は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input Arrows, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左ドラッグで線が、左クリックで黒マスが入力できます。",
							   " Left Button Drag to input black cells, Left Click to input black cells.");
		}
		base.setTitle("ヤジリン","Yajilin");
		base.setFloatbgcolor("rgb(0, 224, 0)");

		enc.pidKanpen = 'yajilin';
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
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.dotcolor = "rgb(255, 96, 191)";

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDotCells(x1,y1,x2,y2,false);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawArrowNumbers(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);
			this.drawPekes(x1,y1,x2,y2,1);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
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
