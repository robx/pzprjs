//
// パズル固有スクリプト部 ぼんさん/へやぼん版 bonsan.js v3.3.0
//
Puzzles.bonsan = function(){ };
Puzzles.bonsan.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		base.setTitle("ぼんさん/へやぼん","Bonsan/Heya-Bon");
		base.setExpression("　左ドラッグで線が、マスのクリックでセルの背景色が入力できます。",
						   " Left Button Drag to input lines, Click the cell to input background color of the cell.");
		base.setFloatbgcolor("rgb(127,96,64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.inputborder();}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){
					if(!kp.enabled()){this.inputqnum();}
					else{ kp.display();}
				}
				else if(k.playmode){ this.inputlight();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){ this.inputborder();}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
			}
		};
		mv.inputlight = function(){
			var cc = this.cellid();
			if(cc==-1){ return;}

			if     (bd.QsC(cc)==0){ bd.sQsC(cc, (this.btn.Left?1:2));}
			else if(bd.QsC(cc)==1){ bd.sQsC(cc, (this.btn.Left?2:0));}
			else if(bd.QsC(cc)==2){ bd.sQsC(cc, (this.btn.Left?0:1));}
			pc.paintCell(cc);
		};
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum0','0','0');
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum.','-','○');
				this.inputcol('num','knum_',' ',' ');
				this.insertrow();
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.insertrow();
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.nummaxfunc = function(cc){ return Math.max(k.qcols,k.qrows)-1;};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.qsubcolor1 = "rgb(224, 224, 255)";
		pc.qsubcolor2 = "rgb(255, 255, 144)";
		pc.setBGCellColorFunc('qsub2');

		pc.fontsizeratio = 0.9;	// 数字の倍率
		pc.circleratio = [0.38, 0.38];

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawTip(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);
			//this.drawPekes(x1,y1,x2,y2,0);

			this.drawCirclesAtNumber(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawTip = function(x1,y1,x2,y2){
			this.vinc('cell_linetip', 'auto');

			var tsize = this.cw*0.30;
			var tplus = this.cw*0.05;
			var header = "c_tip_";

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				this.vdel([header+c]);
				if(line.lcntCell(c)==1 && bd.cell[c].qnum==-1){
					var dir=0, id=-1;
					if     (bd.isLine(bd.ub(c))){ dir=2; id=bd.ub(c);}
					else if(bd.isLine(bd.db(c))){ dir=1; id=bd.db(c);}
					else if(bd.isLine(bd.lb(c))){ dir=4; id=bd.lb(c);}
					else if(bd.isLine(bd.rb(c))){ dir=3; id=bd.rb(c);}

					g.lineWidth = this.lw; //LineWidth
					if     (bd.border[id].error==1){ g.strokeStyle = this.errlinecolor1; g.lineWidth=g.lineWidth+1;}
					else if(bd.border[id].error==2){ g.strokeStyle = this.errlinecolor2;}
					else                           { g.strokeStyle = this.linecolor;}

					if(this.vnop(header+c,this.STROKE)){
						var px=bd.cell[c].cpx+1, py=bd.cell[c].cpy+1;
						if     (dir==1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
						else if(dir==2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
						else if(dir==3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
						else if(dir==4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
						g.stroke();
					}
				}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCellQsub();
			this.decodeBorderQues();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellQsub();
			this.encodeBorderQues();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			this.performAsLine = true;

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			this.performAsLine = false;
			var linfo = line.getLareaInfo();
			if( !this.checkDoubleNumber(linfo) ){
				this.setAlert('○が繋がっています。','There are connected circles.'); return false;
			}
			if( !this.checkLineOverLetter() ){
				this.setAlert('○の上を線が通過しています。','A line goes through a circle.'); return false;
			}

			if( !this.checkAllArea(linfo, f_true, function(w,h,a,n){ return (w==1||h==1);}) ){
				this.setAlert('曲がっている線があります。','A line has curve.'); return false;
			}
			if( !this.checkAllArea(linfo, f_true, function(w,h,a,n){ return (n<0||n==a-1);}) ){
				this.setAlert('数字と線の長さが違います。','The length of a line is wrong.'); return false;
			}

			var rinfo = area.getRoomInfo();
			this.movedPosition(linfo);
			if( !this.checkFractal(rinfo) ){
				this.setAlert('部屋の中の○が点対称に配置されていません。', 'Position of circles in the room is not point symmetric.'); return false;
			}
			if( !this.checkNoObjectInRoom(rinfo, ee.binder(this, this.getMoved)) ){
				this.setAlert('○のない部屋があります。','A room has no circle.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QnC(c)>=1 && line.lcntCell(c)==0);} ) ){
				this.setAlert('○から線が出ていません。','A circle doesn\'t start any line.'); return false;
			}

			this.performAsLine = true;
			if( !this.checkDisconnectLine(linfo) ){
				this.setAlert('○につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkLineOverLetter = function(func){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(line.lcntCell(c)>=2 && bd.QnC(c)!=-1){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,true);
					result = false;
				}
			}
			return result;
		};

		ans.checkFractal = function(rinfo){
			for(var id=1;id<=rinfo.max;id++){
				var d = ans.getSizeOfClist(rinfo.room[id].idlist,f_true);
				var sx=d.x1+d.x2, sy=d.y1+d.y2;
				var movex=0, movey=0;
				for(var i=0;i<rinfo.room[id].idlist.length;i++){
					var c=rinfo.room[id].idlist[i];
					if(this.getMoved(c)!=-1 ^ this.getMoved(bd.cnum(sx-bd.cell[c].bx, sy-bd.cell[c].by))!=-1){
						for(var a=0;a<rinfo.room[id].idlist.length;a++){
							if(this.getMoved(rinfo.room[id].idlist[a])!=-1){
								bd.sErC([rinfo.room[id].idlist[a]],1);
							}
						}
						return false;
					}
				}
			}
			return true;
		};

		ans.movedPosition = function(linfo){
			this.before = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){
				if(line.lcntCell(c)==0 && bd.QnC(c)!=-1){ this.before.id[c]=c;}
				else{ this.before.id[c]=-1;}
			}
			for(var r=1;r<=linfo.max;r++){
				var before=-1, after=-1;
				if(linfo.room[r].idlist.length>1){
					for(var i=0;i<linfo.room[r].idlist.length;i++){
						var c=linfo.room[r].idlist[i];
						if(line.lcntCell(c)==1){
							if(bd.QnC(c)!=-1){ before=c;} else{ after=c;}
						}
					}
				}
				this.before.id[after]=before;
			}
		};
		ans.getMoved = function(cc){ return bd.QnC(this.before.id[cc]);};
		ans.getBeforeCell = function(cc){ return this.before.id[cc];};
	}
};
