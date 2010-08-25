//
// パズル固有スクリプト部 バーンズ版 barns.js v3.3.2
//
Puzzles.barns = function(){ };
Puzzles.barns.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}
		k.irowake  = 1;

		k.iscross  = 0;
		k.isborder = 1;
		k.isexcell = 0;

		k.isLineCross     = true;
		k.isCenterLine    = true;
		k.isborderAsLine  = false;
		k.hasroom         = false;
		k.roomNumber      = false;

		k.dispzero        = false;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.inputQnumDirect = false;
		k.isAnsNumber     = false;
		k.NumberWithMB    = false;
		k.linkNumber      = false;

		k.BlackCell       = false;
		k.NumberIsWhite   = false;
		k.numberAsObject  = false;
		k.RBBlackCell     = false;
		k.checkBlackCell  = false;
		k.checkWhiteCell  = false;

		k.ispzprv3ONLY    = false;
		k.isKanpenExist   = false;

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
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
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
		bd.isLineNG = function(id){ return bd.isBorder(id);},
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

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawLines();
			this.drawPekes(0);

			this.drawChassis();
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
			var c=0, bstr = this.outbstr, twi=[16,8,4,2,1];
			for(var i=0;i<bstr.length;i++){
				var ca = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){
					if(c<bd.cellmax){
						bd.cell[c].ques = (ca&twi[w]?6:0);
						c++;
					}
				}
				if(c>=bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};
		enc.encodeBarns = function(){
			var cm="", num=0, pass=0, twi=[16,8,4,2,1];
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
				if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(obj,ca){
				if(ca==="1"){ obj.ques = 6;}
			});
			this.decodeBorderQues();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCell( function(obj){
				return (obj.ques===6?"1 ":". ");
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

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)===4 && bd.QuC(c)!==6);}) ){
				this.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
			}
			if( !this.checkIceLines() ){
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
