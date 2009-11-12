//
// パズル固有スクリプト部 ナンバーリンク版 numlin.js v3.2.3
//
Puzzles.numlin = function(){ };
Puzzles.numlin.prototype = {
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
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["cellqnum", "borderline"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("　ナンバーリンク","Numberlink");
		base.setExpression("　左ドラッグで線が、右ドラッグで×印が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.EDITOR){
			kp.generate(0, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawGrid(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawCellSquare(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCellSquare = function(x1,y1,x2,y2){
			var mgnw = mf(k.cwidth*0.15);
			var mgnh = mf(k.cheight*0.15);
			var header = "c_sq_";

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QnC(c)!=-1){
					if     (bd.ErC(c)==1){ g.fillStyle = this.errbcolor1;}
					else if(bd.ErC(c)==2){ g.fillStyle = this.errbcolor2;}
					else                 { g.fillStyle = "white";}

					if(this.vnop(header+c,1)){
						g.fillRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, k.cwidth-mgnw*2-1, k.cheight-mgnh*2-1);
					}
				}
				else{ this.vhide(header+c);}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeNumber16(bstr);}
			else if(type==2)      { bstr = this.decodeKanpen(bstr); }
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"numberlink.html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeNumber16();
		};

		enc.decodeKanpen = function(bstr){
			bstr = (bstr.split("_")).join(" ");
			fio.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},bstr.split("/"));
			return "";
		};
		enc.pzldataKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + "_"):"._";
			});
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			this.decodeCell( function(c,ca){ if(ca != "."){ bd.sQnC(c, parseInt(ca));} },array.slice(0,k.qrows));
			this.decodeBorderLine(array.slice(k.qrows,3*k.qrows-1));
		};
		fio.kanpenSave = function(){
			return ""+this.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + " "):". ";
			})
			+this.encodeBorderLine();
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

			var linfo = line.getLareaInfo();
			if( !this.checkQnumsInArea(linfo, function(a){ return (a>=3);}) ){
				this.setAlert('3つ以上の数字がつながっています。','Three or more numbers are connected.'); return false;
			}

			if( !this.checkSameObjectInRoom(linfo, bd.QnC.bind(bd)) ){
				this.setAlert('異なる数字がつながっています。','Different numbers are connected.'); return false;
			}

			if( !this.check2Line() ){
				this.setAlert('数字の上を線が通過しています。','A line goes through a number.'); return false;
			}
			if( !this.check1Line() ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}
			if( !this.checkDisconnectLine(linfo) ){
				this.setAlert('数字につながっていない線があります。','A line doesn\'t connect any number.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==0 && bd.QnC(c)!=-1);}) ){
				this.setAlert('どこにもつながっていない数字があります。','A number is not connected another number.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.check1Line = function(){ return this.checkLine(function(i){ return (line.lcntCell(i)==1 && bd.QnC(i)==-1);}); };
		ans.check2Line = function(){ return this.checkLine(function(i){ return (line.lcntCell(i)>=2 && bd.QnC(i)!=-1);}); };
		ans.checkLine = function(func){
			for(var c=0;c<bd.cellmax;c++){
				if(func(c)){
					bd.sErBAll(2);
					ans.setCellLineError(c,true);
					return false;
				}
			}
			return true;
		};
	}
};
