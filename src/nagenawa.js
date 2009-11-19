//
// パズル固有スクリプト部 なげなわ版 nagenawa.js v3.2.3
//
Puzzles.nagenawa = function(){ };
Puzzles.nagenawa.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 1;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 1;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 1;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["arearoom","cellqnum","borderline","cellqsub"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("なげなわ","Nagenawa");
		base.setExpression("　ドラッグで線が、マスのクリックで○×(補助記号)が入力できます。",
						   " Left Button Drag to input lines, Click to input auxiliary marks.");
		base.setFloatbgcolor("rgb(0, 127, 0)");
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
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){
					if(!kp.enabled()){ this.inputqnum();}
					else{ kp.display();}
				}
				else if(k.playmode) this.inputMB();
			}
		};
		mv.mousemove = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
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

		bd.nummaxfunc = function(cc){ return Math.min(this.maxnum, area.getCntOfRoomByCell(cc));};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_SLIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

		//	this.drawPekes(x1,y1,x2,y2,0);
			this.drawMBs(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeBorder(bstr);
				bstr = this.decodeRoomNumber16(bstr);
			}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeRoomNumber16();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var cnt=0;
			for(var i=0;i<bd.bdmax;i++){ if(bd.isLine(i)){ cnt++;} }
			if( cnt==0 ){ this.setAlert('線が引かれていません。','There is no line on the board.'); return false;}

			var rinfo = area.getRoomInfo();
			if( !this.checkOneNumber(rinfo, function(top,lcnt){ return (top>=0 && top<lcnt);}, function(cc){ return line.lcntCell(cc)>0;}) ){
				this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
			}

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkOneNumber(rinfo, function(top,lcnt){ return (top>=0 && top>lcnt);}, function(cc){ return line.lcntCell(cc)>0;}) ){
				this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
			}

			if( !this.checkAllLoopRect() ){
				this.setAlert('長方形か正方形でない輪っかがあります。','There is a non-rectangle loop.'); return false;
			}

			return true;
		};

		ans.checkAllLoopRect = function(){
			var xinfo = line.getLineInfo();
			for(var r=1;r<=xinfo.max;r++){
				if(!this.isLoopRect(xinfo.room[r].idlist)){
					bd.sErBAll(2);
					bd.sErB(xinfo.room[r].idlist,1);
					return false;
				}
			}
			return true;
		};
		ans.isLoopRect = function(list){
			var x1=2*k.qcols; var x2=0; var y1=2*k.qrows; var y2=0;
			for(var i=0;i<list.length;i++){
				if(x1>bd.border[list[i]].cx){ x1=bd.border[list[i]].cx;}
				if(x2<bd.border[list[i]].cx){ x2=bd.border[list[i]].cx;}
				if(y1>bd.border[list[i]].cy){ y1=bd.border[list[i]].cy;}
				if(y2<bd.border[list[i]].cy){ y2=bd.border[list[i]].cy;}
			}
			for(var i=0;i<list.length;i++){
				if(bd.border[list[i]].cx!=x1 && bd.border[list[i]].cx!=x2 && bd.border[list[i]].cy!=y1 && bd.border[list[i]].cy!=y2){ return false;}
			}
			return true;
		};
	}
};
