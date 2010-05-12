//
// パズル固有スクリプト部 バーンズ版 barns.js v3.3.1
//
Puzzles.barns = function(){ };
Puzzles.barns.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake  = 1;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = true;	// 線が交差するパズル
		k.isCenterLine    = true;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		if(k.EDITOR){
			base.setExpression("　左ドラッグで境界線が、右クリックで氷が入力できます。",
							   " Left Button Drag to input border lines, Right Click to input ice.");
		}
		else{
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		base.setTitle("バーンズ","Barns");
		base.setFloatbgcolor("rgb(0, 0, 191)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(this.btn.Left) this.inputborder();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.editmode){
				if(this.btn.Left) this.inputborder();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.inputIcebarn = function(){
			var cc = this.cellid();
			if(cc===null || cc==this.mouseCell){ return;}
			if(this.inputData===null){ this.inputData = (bd.QuC(cc)==6?0:6);}

			bd.sQuC(cc, this.inputData);
			pc.paintCell(cc);
			this.mouseCell = cc;
		},

		// 線を引かせたくないので上書き
		bd.isLineNG = function(id){ return (bd.QuB(id)==1);},
		bd.enableLineNG = true;

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;}};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;
		pc.errbcolor1 = pc.errbcolor1_DARK;
		pc.setBGCellColorFunc('icebarn');

		pc.maxYdeg = 0.70;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);
			this.drawPekes(x1,y1,x2,y2,0);

			this.drawChassis(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBarns();
			this.decodeBorder();
		};
		enc.pzlexport = function(type){
			this.encodeBarns();
			this.encodeBorder();
		};

		enc.decodeBarns = function(){
			var c=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){ if((i*5+w)<bd.cellmax){ bd.sQuC(i*5+w,(ca&Math.pow(2,4-w)?6:0));} }
				if((i*5+5)>=bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};
		enc.encodeBarns = function(){
			var cm = "";
			var num = 0, pass = 0;
			for(var i=0;i<bd.cellmax;i++){
				if(bd.QuC(i)==6){ pass+=Math.pow(2,4-num);}
				num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(c,ca){
				if(ca=="1"){ bd.sQuC(c, 6);}
			});
			this.decodeBorderQues();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCell( function(c){
				return ""+(bd.QuC(c)==6?"1":".")+" ";
			});
			this.encodeBorderQues();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==4 && bd.QuC(c)!=6 && bd.QuC(c)!=101);}) ){
				this.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
			}
			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==2 && bd.QuC(c)==6 && !ans.isLineStraight(c));}) ){
				this.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
			}

			if( !this.checkLcntCell(0) ){
				this.setAlert('線が引かれていないマスがあります。','There is a line-less cell.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			return true;
		};
	}
};
