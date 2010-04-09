//
// パズル固有スクリプト部 タイルペイント版 tilepaint.js v3.3.0
//
Puzzles.tilepaint = function(){ };
Puzzles.tilepaint.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 1;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		k.def_psize = 40;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　左クリックで境界線や数字のブロックが、右クリックで下絵が入力できます。数字を入力する場所はSHIFTキーを押すと切り替えられます。",
							   " Left Click to input border lines or number block, Right Click to paint a design. Press SHIFT key to change the side of inputting numbers.");
		}
		else{
			base.setExpression("　左クリックで黒タイルが、右クリックで白タイル確定タイルが入力できます。",
							   " Left Click to input black tile, Right Click to determined white tile.");
		}
		base.setTitle("タイルペイント","TilePaint");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if     (this.btn.Left)  this.inputborder();
				else if(this.btn.Right) this.inputBGcolor1();
			}
			else if(k.playmode) this.inputtile();
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted()){
				if(!kp.enabled()){ this.input51();}
				else{ kp.display();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if     (this.btn.Left)  this.inputborder();
				else if(this.btn.Right) this.inputBGcolor1();
			}
			else if(k.playmode) this.inputtile();
		};
		mv.set51cell = function(cc,val){
			if(val==true){
				bd.sQuC(cc,51);
				bd.sQnC(cc, 0);
				bd.sDiC(cc, 0);
				bd.setWhite(cc);
				bd.sQsC(cc, 0);
				if(bd.ub(cc)!==-1){ bd.sQuB(bd.ub(cc), ((bd.up(cc)!=-1 && bd.QuC(bd.up(cc))!=51)?1:0));}
				if(bd.db(cc)!==-1){ bd.sQuB(bd.db(cc), ((bd.dn(cc)!=-1 && bd.QuC(bd.dn(cc))!=51)?1:0));}
				if(bd.lb(cc)!==-1){ bd.sQuB(bd.lb(cc), ((bd.lt(cc)!=-1 && bd.QuC(bd.lt(cc))!=51)?1:0));}
				if(bd.rb(cc)!==-1){ bd.sQuB(bd.rb(cc), ((bd.rt(cc)!=-1 && bd.QuC(bd.rt(cc))!=51)?1:0));}
			}
			else{
				bd.sQuC(cc, 0);
				bd.sQnC(cc, 0);
				bd.sDiC(cc, 0);
				bd.setWhite(cc);
				bd.sQsC(cc, 0);
			}
		};

		mv.inputBGcolor1 = function(){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell || bd.QuC(cc)==51){ return;}
			if(this.inputData==-1){ this.inputData=(bd.QsC(cc)==0)?3:0;}
			bd.sQsC(cc, this.inputData);
			this.mouseCell = cc; 
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.inputnumber51(ca,{2:(k.qcols-(tc.cursolx>>1)-1), 4:(k.qrows-(tc.cursoly>>1)-1)});
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('image','knumq','q',[0,0]);
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.insertrow();
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.insertrow();
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum0','0','0');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.imgCR = [1,1];
			kp.kpinput = function(ca){
				kc.inputnumber51(ca,{2:(k.qcols-(tc.cursolx>>1)-1), 4:(k.qrows-(tc.cursoly>>1)-1)});
			};
		}

		// 一部qsubで消したくないものがあるため上書き
		menu.ex.ASconfirm = function(){
			if(confirm(menu.isLangJP()?"補助記号を消去しますか？":"Do you want to erase the auxiliary marks?")){
				um.newOperation(true);
				for(i=0;i<bd.cellmax;i++){
					if(bd.QsC(i)===1){
						um.addOpe(k.CELL,k.QSUB,i,bd.QsC(i),0);
						bd.cell[i].qsub = 0;
					}
				}

				pc.paintAll();
			}
		};

		menu.ex.adjustSpecial  = menu.ex.adjustQues51_1;
		menu.ex.adjustSpecial2 = menu.ex.adjustQues51_2;

		tc.targetdir = 2;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.bcolor = pc.bcolor_GREEN;
		pc.BBcolor = "rgb(127, 127, 127)";
		pc.setBGCellColorFunc('qsub3');

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawBGEXcells(x1,y1,x2,y2);
			this.drawQues51(x1,y1,x2,y2);

			this.drawGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawBlackCells(x1,y1,x2,y2);
			this.drawBoxBorders(x1,y1,x2,y2,true);

			this.drawChassis_ex1(x1-1,y1-1,x2,y2,true);

			this.drawNumbersOn51(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeTilePaint();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeTilePaint();
		};

		enc.decodeTilePaint = function(){
			// 盤面内数字のデコード
			var cell=0, a=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(ca>='g' && ca<='z'){ cell+=(parseInt(ca,36)-15);}
				else{
					mv.set51cell(cell,true);
					if     (ca=='-'){
						bd.sDiC(cell,(bstr.charAt(i+1)!="."?parseInt(bstr.charAt(i+1),16):-1));
						bd.sQnC(cell,parseInt(bstr.substr(i+2,2),16));
						cell++; i+=3;
					}
					else if(ca=='+'){
						bd.sDiC(cell,parseInt(bstr.substr(i+1,2),16));
						bd.sQnC(cell,(bstr.charAt(i+3)!="."?parseInt(bstr.charAt(i+3),16):-1));
						cell++; i+=3;
					}
					else if(ca=='='){
						bd.sDiC(cell,parseInt(bstr.substr(i+1,2),16));
						bd.sQnC(cell,parseInt(bstr.substr(i+3,2),16));
						cell++; i+=4;
					}
					else{
						bd.sDiC(cell,(bstr.charAt(i)!="."?parseInt(bstr.charAt(i),16):-1));
						bd.sQnC(cell,(bstr.charAt(i+1)!="."?parseInt(bstr.charAt(i+1),16):-1));
						cell++; i+=1;
					}
				}
				if(cell>=bd.cellmax){ a=i+1; break;}
			}

			// 盤面外数字のデコード
			cell=0;
			for(var i=a;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if     (ca=='.'){ bd.sDiE(cell,-1); cell++;}
				else if(ca=='-'){ bd.sDiE(cell,parseInt(bstr.substr(i+1,1),16)); cell++; i+=2;}
				else            { bd.sDiE(cell,parseInt(ca,16)); cell++;}
				if(cell>=k.qcols){ a=i+1; break;}
			}
			for(var i=a;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if     (ca=='.'){ bd.sQnE(cell,-1); cell++;}
				else if(ca=='-'){ bd.sQnE(cell,parseInt(bstr.substr(i+1,2),16)); cell++; i+=2;}
				else            { bd.sQnE(cell,parseInt(ca,16)); cell++;}
				if(cell>=k.qcols+k.qrows){ a=i+1; break;}
			}

			this.outbstr = bstr.substr(a);
		};
		enc.encodeTilePaint = function(type){
			var cm="";

			// 盤面内側の数字部分のエンコード
			var count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr = "";

				if(bd.QuC(c)==51){
					pstr+=bd.DiC(c).toString(16);
					pstr+=bd.QnC(c).toString(16);

					if     (bd.QnC(c) >=16 && bd.DiC(c)>=16){ pstr = ("="+pstr);}
					else if(bd.QnC(c) >=16){ pstr = ("-"+pstr);}
					else if(bd.DiC(c)>=16){ pstr = ("+"+pstr);}
				}
				else{ pstr=" "; count++;}

				if     (count== 0){ cm += pstr;}
				else if(pstr!=" "){ cm += ((count+15).toString(36)+pstr); count=0;}
				else if(count==20){ cm += "z"; count=0;}
			}
			if(count>0){ cm += (count+15).toString(36);}

			// 盤面外側の数字部分のエンコード
			for(var c=0;c<k.qcols;c++){
				if     (bd.DiE(c)<  0){ cm += ".";}
				else if(bd.DiE(c)< 16){ cm += bd.DiE(c).toString(16);}
				else if(bd.DiE(c)<256){ cm += ("-"+bd.DiE(c).toString(16));}
			}
			for(var c=k.qcols;c<k.qcols+k.qrows;c++){
				if     (bd.QnE(c)<  0){ cm += ".";}
				else if(bd.QnE(c)< 16){ cm += bd.QnE(c).toString(16);}
				else if(bd.QnE(c)<256){ cm += ("-"+bd.QnE(c).toString(16));}
			}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum51();
			this.decodeCell( function(c,ca){
				if     (ca == "#"){ bd.setBlack(c);}
				else if(ca == "+"){ bd.sQsC(c, 1);}
				else if(ca == "-"){ bd.sQsC(c, 3);}
			});
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum51();
			this.encodeCell( function(c){
				if     (bd.isBlack(c)){ return "# ";}
				else if(bd.QsC(c)==1) { return "+ ";}
				else if(bd.QsC(c)==3) { return "- ";}
				else                  { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkSameObjectInRoom(area.getRoomInfo(), function(c){ return (bd.isBlack(c)?1:2);}) ){
				this.setAlert('白マスと黒マスの混在したタイルがあります。','A tile includes both balck and white cells.'); return false;
			}

			if( !this.checkRowsColsPartly(this.isBCellCount, {}, function(cc){ return (bd.QuC(cc)==51);}, false) ){
				this.setAlert('数字の下か右にある黒マスの数が間違っています。','The number of black cells underward or rightward is not correct.'); return false;
			}

			return true;
		};

		ans.isBCellCount = function(number, keycellpos, clist, nullobj){
			var count = 0;
			for(var i=0;i<clist.length;i++){
				if(bd.isBlack(clist[i])){ count++;}
			}
			if(number>=0 && count!=number){
				var isex = (keycellpos[0]===-1 || keycellpos[1]===-1);
				if(isex){ bd.sErE(bd.exnum(keycellpos[0],keycellpos[1]),1);}
				else    { bd.sErC(bd.cnum (keycellpos[0],keycellpos[1]),1);}
				bd.sErC(clist,1);
				return false;
			}
			return true;
		};
	}
};
