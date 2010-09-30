//
// パズル固有スクリプト部 なげなわ版 nagenawa.js v3.3.2
//
Puzzles.nagenawa = function(){ };
Puzzles.nagenawa.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.irowake  = 1;
		k.isborder = 1;

		k.isLineCross     = true;
		k.isCenterLine    = true;
		k.hasroom         = true;
		k.roomNumber      = true;
		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;

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
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

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

			this.drawDashedGrid();
			this.drawBorders();

			this.drawMBs();
			this.drawLines();

			this.drawChassis();

			this.drawTarget();
		};

		//オーバーライド
		pc.drawNumber1 = function(id){
			var obj = bd.cell[id], key = ['cell',id].join('_');
			if(obj.qnum!==-1){
				var text = (obj.qnum>=0 ? ""+obj.qnum : "?");
				this.dispnum(key, 5, text, 0.45, this.fontcolor, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
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

			var cnt=0;
			for(var i=0;i<bd.bdmax;i++){ if(bd.isLine(i)){ cnt++;} }
			if( cnt==0 ){ this.setAlert('線が引かれていません。','There is no line on the board.'); return false;}

			var rinfo = area.getRoomInfo();
			if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0 || n>=a);}) ){
				this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
			}

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0 || n<=a);}) ){
				this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
			}

			if( !this.checkAllLoopRect() ){
				this.setAlert('長方形か正方形でない輪っかがあります。','There is a non-rectangle loop.'); return false;
			}

			return true;
		};

		ans.checkAllLoopRect = function(){
			var result = true;
			var xinfo = line.getLineInfo();
			for(var r=1;r<=xinfo.max;r++){
				if(this.isLoopRect(xinfo.room[r].idlist)){ continue;}

				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.sErB(xinfo.room[r].idlist,1);
				result = false;
			}
			return result;
		};
		ans.isLoopRect = function(list){
			var x1=bd.maxbx, x2=bd.minbx, y1=bd.maxby, y2=bd.minby;
			for(var i=0;i<list.length;i++){
				if(x1>bd.border[list[i]].bx){ x1=bd.border[list[i]].bx;}
				if(x2<bd.border[list[i]].bx){ x2=bd.border[list[i]].bx;}
				if(y1>bd.border[list[i]].by){ y1=bd.border[list[i]].by;}
				if(y2<bd.border[list[i]].by){ y2=bd.border[list[i]].by;}
			}
			for(var i=0;i<list.length;i++){
				if(bd.border[list[i]].bx!=x1 && bd.border[list[i]].bx!=x2 && bd.border[list[i]].by!=y1 && bd.border[list[i]].by!=y2){ return false;}
			}
			return true;
		};
	}
};
