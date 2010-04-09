//
// パズル固有スクリプト部 快刀乱麻版 kramma.js v3.3.0
//
Puzzles.kramma = function(){ };
Puzzles.kramma.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 1;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
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
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("快刀乱麻","KaitoRamma");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputcrossMark();
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode) this.inputQues([0,41,42,-2]);
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		// オーバーライド
		mv.inputBD = function(flag){
			var pos = this.borderpos(0.35);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!==-1 && id!==-1){
				if((!(pos.x&1) && this.mouseCell.x===pos.x && Math.abs(this.mouseCell.y-pos.y)===1) ||
				   (!(pos.y&1) && this.mouseCell.y===pos.y && Math.abs(this.mouseCell.x-pos.x)===1) )
				{
					this.mouseCell=-1
					if(this.inputData==-1){ this.inputData=(bd.isBorder(id)?0:1);}

					var idlist = [id];
					var bx1, bx2, by1, by2;
					if(bd.border[id].bx&1){
						var bx = bd.border[id].bx;
						while(bx>bd.minbx){ if(bd.QnX(bd.xnum(bx-1,bd.border[id].by))===1){ break;} bx-=2;} bx1 = bx;
						while(bx<bd.maxbx){ if(bd.QnX(bd.xnum(bx+1,bd.border[id].by))===1){ break;} bx+=2;} bx2 = bx;
						by1 = by2 = bd.border[id].by;
					}
					else if(bd.border[id].by&1){
						var by = bd.border[id].by;
						while(by>bd.minby){ if(bd.QnX(bd.xnum(bd.border[id].bx,by-1))===1){ break;} by-=2;} by1 = by;
						while(by<bd.maxby){ if(bd.QnX(bd.xnum(bd.border[id].bx,by+1))===1){ break;} by+=2;} by2 = by;
						bx1 = bx2 = bd.border[id].bx;
					}
					idlist = [];
					for(var i=bx1;i<=bx2;i+=2){ for(var j=by1;j<=by2;j+=2){ idlist.push(bd.bnum(i,j)); } }

					for(var i=0;i<idlist.length;i++){
						if     (this.inputData==1){ bd.setBorder(idlist[i]);}
						else if(this.inputData==0){ bd.removeBorder(idlist[i]);}
						pc.paintBorder(idlist[i]);
					}
				}
			}
			this.mouseCell = pos;
		};
		mv.inputQuesDirectly = true;

		// キーボード入力系
		kc.keyinput = function(ca){ };
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.BorderQanscolor = "rgb(64, 64, 255)";
		pc.setBorderColorFunc('qans');

		pc.crosssize = 0.15;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawCircles41_42(x1,y1,x2,y2);
			this.drawCrossMarks(x1,y1,x2+1,y2+1);

			this.drawQuesHatenas(x1,y1,x2,y2);

			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCrossMark();
			this.decodeCircle41_42();
		};
		enc.pzlexport = function(type){
			this.encodeCrossMark();
			this.encodeCircle41_42();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQues41_42();
			this.decodeCrossNum();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQues41_42();
			this.encodeCrossNum();
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(3,0) ){
				this.setAlert('分岐している線があります。','There is a branched line.'); return false;
			}
			if( !this.checkLcntCross(4,1) ){
				this.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
			}
			if( !this.checkLcntCurve() ){
				this.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
			}

			rinfo = area.getRoomInfo();
			if( !this.checkNoObjectInRoom(rinfo, function(c){ return (bd.QuC(c)!=0?bd.QuC(c):-1);}) ){
				this.setAlert('白丸も黒丸も含まれない領域があります。','An area has no marks.'); return false;
			}

			if( !this.checkSameObjectInRoom(rinfo, function(c){ return (bd.QuC(c)!=0?bd.QuC(c):-1);}) ){
				this.setAlert('白丸と黒丸が両方含まれる領域があります。','An area has both white and black circles.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}
			if( !this.checkLcntCross(0,1) ){
				this.setAlert('黒点上を線が通過していません。','No lines on the black point.'); return false;
			}

			return true;
		};

		ans.checkLcntCurve = function(){
			var result = true;
			for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
				for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
					var xc = bd.xnum(bx,by);
					if(area.lcntCross(xc)===2 && bd.QnX(xc)!==1){
						if(    !(bd.QaB(bd.bnum(bx  ,by-1))===1 && bd.QaB(bd.bnum(bx  ,by+1))===1)
							&& !(bd.QaB(bd.bnum(bx-1,by  ))===1 && bd.QaB(bd.bnum(bx+1,by  ))===1) )
						{
							if(this.inAutoCheck){ return false;}
							this.setCrossBorderError(bx,by);
							result = false;
						}
					}
				}
			}
			return result;
		};
	}
};
