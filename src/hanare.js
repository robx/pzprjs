//
// パズル固有スクリプト部 はなれ組版 hanare.js v3.3.4
//
Puzzles.hanare = function(){ };
Puzzles.hanare.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isAnsNumber     = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.editmode){ this.inputborder();}
			else if(k.playmode){
				if     (this.btn.Left) { this.inputqnum_hanare();}
				else if(this.btn.Right){ this.inputDot();}
			}
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted()){ this.inputqnum_hanare();}
		};
		mv.mousemove = function(){
			if     (k.editmode){ this.inputborder();}
			else if(k.playmode){ this.inputDot();}
		};

		mv.inputqnum_hanare = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell){ return;}
			var result = bd.setNum_hanare(cc,1);
			if(result!==null){
				this.inputData = (result===-1?0:1);
				this.mouseCell = cc;
				pc.paintCell(cc);
			}
		};

		mv.inputDot = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell || bd.QnC(cc)!==-1){ return;}

			if(this.inputData===null){ this.inputData=(bd.QsC(cc)===1?0:1);}

			bd.sAnC(cc,-1);
			bd.sQsC(cc,(this.inputData===1?1:0));
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum_hanare(ca);
		};
		kc.key_inputqnum_hanare = function(ca){
			var cc=tc.getTCC(), val=-1;

			if('0'<=ca && ca<='9'){ val = 1;}
			else if(ca==='-') { val = (k.playmode?-2:-1);}
			else if(ca===' ') { val = -1;}
			else{ return;}

			bd.setNum_hanare(cc,val);
			this.prev = cc;
			pc.paintCell(cc);
		};

		bd.setNum_hanare = function(c,val){
			if(val>=0){
				val = area.getCntOfRoomByCell(c);
				if(val>this.maxnum){ return null;}

				var clist = area.room[area.room.id[c]].clist, c2=null;
				for(var i=0;i<clist.length;i++){
					if(this.isNum(clist[i])){ c2=clist[i]; break;}
				}
				if(c===c2){ val=(k.playmode?-2:-1);}
				else if(c2!==null){
					if(k.playmode && this.cell[c2].qnum!==-1){ return null;}
					this.setNum(c2,(k.playmode?-2:-1));
					pc.paintCell(c2);
				}
				else{ /* c2===null */
					if(this.cell[c].qsub===1){ val=-1;}
				}
			}
			this.setNum(c,val);
			return val;
		};

		area.resetArea();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.dotcolor = pc.dotcolor_PINK;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawDotCells(true);
			this.drawNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawCursor();
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
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = area.getRoomInfo();
			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1つの部屋に2つ以上の数字が入っています。','A room has plural numbers.'); return false;
			}

			if( !this.checkNumberAndSize(rinfo) ){
				this.setAlert('数字と部屋の大きさが違います。','The size of the room is not equal to the number.'); return false;
			}

			if( !this.checkDiffNumber() ){
				this.setAlert('２つの数字の差とその間隔が正しくありません。','The distance of the paired numbers is not equal to the diff of them.'); return false;
			}

			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('数字の入っていない部屋があります。','A room has no numbers.'); return false;
			}

			return true;
		};

		ans.checkDiffNumber = function(){
			function eachcell(tc){
				distance++;
				if(!bd.isNum(tc)){ /* nop */ }
				else if(!bd.isValidNum(tc)){ c=null;}
				else{
					if(c!==null){
						if(Math.abs(num-bd.getNum(tc))!==distance){
							if(this.inAutoCheck){ return false;}
							bd.sErC([c,tc],1);
							result = false;
						}
					}
					c=tc;
					num=bd.getNum(tc);
					distance=-1;
				}
			}

			var result = true;
			for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
				var c=null, num, distance;
				for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
					eachcell(bd.cnum(bx,by));
				}
			}
			for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
				var c=null, num, distance;
				for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
					eachcell(bd.cnum(bx,by));
				}
			}
			return result;
		};
	}
};
