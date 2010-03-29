//
// パズル固有スクリプト部 アホになり切れ版 aho.js v3.3.0
//
Puzzles.aho = function(){ };
Puzzles.aho.prototype = {
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
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("アホになり切れ","Aho-ni-Narikire");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

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
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";

		pc.circledcolor = "black";
		pc.fontsizeratio = 0.85;
		pc.circleratio = [0, 0.40];

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawCirclesAtNumber_shikaku(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCirclesAtNumber_shikaku = function(x1,y1,x2,y2){
			this.vinc('cell_circle', 'auto');

			var rsize2 = k.cwidth*this.circleratio[1];
			var mgnx = k.cwidth/2, mgny = k.cheight/2;
			var header = "c_cir_";
			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!=-1){
					var px=bd.cell[c].px+mgnx, py=bd.cell[c].py+mgny;

					g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
					if(this.vnop(header+c,this.FILL)){
						g.fillCircle(px, py, rsize2);
					}
				}
				else{ this.vhide([header+c]);}
			}
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

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = area.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('数字の入っていない領域があります。','An area has no numbers.'); return false;
			}

			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1つの領域に2つ以上の数字が入っています。','An area has plural numbers.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (n<0 || (n%3)==0 || w*h==a);} ) ){
				this.setAlert('大きさが3の倍数ではないのに四角形ではない領域があります。','An area whose size is not multiples of three is not rectangle.'); return false;
			}

			if( !this.checkAhoArea(rinfo) ){
				this.setAlert('大きさが3の倍数である領域がL字型になっていません。','An area whose size is multiples of three is not L-shape.'); return false;
			}

			if( !this.checkNumberAndSize(rinfo) ){
				this.setAlert('数字と領域の大きさが違います。','The size of the area is not equal to the number.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};

		ans.checkAhoArea = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				var n = bd.QnC(this.getQnumCellOfClist(rinfo.room[id].idlist));
				if(n<0 || (n%3)!=0){ continue;}

				var d = this.getSizeOfClist(rinfo.room[id].idlist,f_true);
				var clist = [];
				for(var cx=d.x1;cx<=d.x2;cx++){
					for(var cy=d.y1;cy<=d.y2;cy++){
						var cc = bd.cnum(cx,cy);
						if(rinfo.id[cc]!=id){ clist.push(cc);}
					}
				}
				var dl = this.getSizeOfClist(clist,f_true);
				if( clist.length==0 || ((dl.x2-dl.x1+1)*(dl.y2-dl.y1+1)!=dl.cnt) || (d.x1!=dl.x1 && d.x2!=dl.x2) || (d.y1!=dl.y1 && d.y2!=dl.y2) ){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
