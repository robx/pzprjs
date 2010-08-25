//
// パズル固有スクリプト部 カントリーロード版 country.js v3.3.2
//
Puzzles.country = function(){ };
Puzzles.country.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.irowake  = 1;
		k.isborder = 1;

		k.isCenterLine    = true;
		k.hasroom         = true;
		k.roomNumber      = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		base.setTitle("カントリーロード","Country Road");
		base.setExpression("　ドラッグで線が、マスのクリックで○×(補助記号)が入力できます。",
						   " Left Button Drag to input lines, Click to input auxiliary marks.");
		base.setFloatbgcolor("rgb(191, 0, 0)");
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
				if     (k.editmode){ this.inputqnum();}
				else if(k.playmode){ this.inputMB();}
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
			kp.generate(0, true, false);
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

		pc.paint = function(){
			this.drawBGCells();
			this.drawNumbers();

			this.drawGrid();
			this.drawBorders();

			this.drawMBs();
			this.drawLines();

			this.drawChassis();

			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeRoomNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeRoomNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeBorderLine();
			this.decodeCellQsub();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeBorderLine();
			this.encodeCellQsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('交差している線があります。','There is a crossing line.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkRoom2( rinfo ) ){
				this.setAlert('線が１つの国を２回以上通っています。','A line passes a country twice or more.'); return false;
			}

			if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0||n==a);}) ){
				this.setAlert('数字のある国と線が通過するマスの数が違います。','The number of the cells that is passed any line in the country and the number written in the country is diffrerent.'); return false;
			}
			if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (a!=0);}) ){
				this.setAlert('線の通っていない国があります。','There is a country that is not passed any line.'); return false;
			}

			if( !this.checkSideAreaCell(rinfo, function(c1,c2){ return (line.lcntCell(c1)==0 && line.lcntCell(c2)==0);}, false) ){
				this.setAlert('線が通らないマスが、太線をはさんでタテヨコにとなりあっています。','The cells that is not passed any line are adjacent over border line.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
			}

			return true;
		};

		ans.checkRoom2 = function(rinfo){
			if(rinfo.max<=1){ return true;}
			var result = true;
			for(var r=1;r<=rinfo.max;r++){
				var cnt=0;
				for(var i=0;i<rinfo.room[r].idlist.length;i++){
					var c=rinfo.room[r].idlist[i], id;
					id=bd.ub(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
					id=bd.db(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
					id=bd.lb(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
					id=bd.rb(c); if(!!bd.border[id] && bd.border[id].ques===1 && bd.border[id].line===1){ cnt++;}
				}
				if(cnt>2){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[r].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
