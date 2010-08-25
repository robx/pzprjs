//
// パズル固有スクリプト部 連番窓口版 renban.js v3.3.2
//
Puzzles.renban = function(){ };
Puzzles.renban.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 6;}
		if(!k.qrows){ k.qrows = 6;}
		k.irowake  = 0;

		k.iscross  = 0;
		k.isborder = 1;
		k.isexcell = 0;

		k.isLineCross     = false;
		k.isCenterLine    = false;
		k.isborderAsLine  = false;
		k.hasroom         = true;
		k.roomNumber      = false;

		k.dispzero        = false;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.inputQnumDirect = false;
		k.isAnsNumber     = true;
		k.NumberWithMB    = false;
		k.linkNumber      = false;

		k.BlackCell       = false;
		k.NumberIsWhite   = false;
		k.numberAsObject  = false;
		k.RBBlackCell     = false;
		k.checkBlackCell  = false;
		k.checkWhiteCell  = false;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = false;

		base.setTitle("連番窓口","Renban-Madoguchi");
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if     (this.btn.Left)  this.inputborder();
				else if(this.btn.Right) this.inputQsubLine();
			}
			if(k.playmode){ this.inputqnum();}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if     (this.btn.Left)  this.inputborder();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kp.generate(0, true, true);
		kp.kpinput = function(ca){ kc.key_inputqnum(ca);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.borderQsubcolor = pc.borderQuescolor;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawNumbers();

			this.drawBorders();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawCursor();
		};

		// エラー時に赤く表示したいので上書き
		pc.setBorderColor = function(id){
			if(bd.border[id].ques===1){
				g.fillStyle = (bd.border[id].error===1 ? this.errcolor1 : this.borderQuescolor);
				return true;
			}
			return false;
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
			if( !this.checkDifferentNumberInRoom(rinfo, bd.getNum) ){
				this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
			}

			if( !this.checkNumbersInRoom(rinfo) ){
				this.setAlert('部屋に入る数字が正しくありません。','The numbers in the room are wrong.'); return false;
			}

			if( !this.checkBorderSideNumber() ){
				this.setAlert('数字の差がその間にある線の長さと等しくありません。','The differnece between two numbers is not equal to the length of the line between them.'); return false;
			}

			if( !this.checkNoNumCell() ){
				this.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkNoNumCell();};

		ans.checkNumbersInRoom = function(rinfo){
			var result = true;
			for(var r=1;r<=rinfo.max;r++){
				var idlist = rinfo.room[r].idlist
				if(idlist.length<=1){ continue;}
				var max=-1, min=bd.maxnum, breakflag=false;
				for(var i=0,len=idlist.length;i<len;i++){
					var val=bd.getNum(idlist[i]);
					if(val===-1 || val===-2){ breakflag=true; break;}
					if(max<val){ max=val;}
					if(min>val){ min=val;}
				}
				if(breakflag){ break;}

				if(idlist.length !== (max-min)+1){
					if(this.inAutoCheck){ return false;}
					bd.sErC(idlist,1);
					result = false;
				}
			}
			return result;
		};

		ans.checkBorderSideNumber = function(){
			var result = true;
			// 線の長さを取得する
			var rdata = new AreaInfo();
			for(var i=0;i<bd.bdmax;i++){ rdata.id[i] = (bd.isBorder(i)?0:null);}
			for(var i=0;i<bd.bdmax;i++){
				if(rdata.id[i]!==0){ continue;}
				var bx=bd.border[i].bx, by=bd.border[i].by, idlist=[];
				while(1){
					var id = bd.bnum(bx,by);
					if(id===null || rdata.id[id]!==0){ break;}

					idlist.push(id);
					if(bx%2===1){ bx+=2;}else{ by+=2;}
				}
				rdata.max++;
				for(var n=0;n<idlist.length;n++){ rdata.id[idlist[n]]=rdata.max;}
				rdata.room[rdata.max] = {idlist:idlist};
			}

			// 実際に差を調査する
			for(var i=0;i<bd.bdmax;i++){
				if(rdata.id[i]===null){ continue;}
				var cc1 = bd.border[i].cellcc[0], cc2 = bd.border[i].cellcc[1];
				var val1=bd.getNum(cc1), val2=bd.getNum(cc2);
				if(val1<=0 || val2<=0){ continue;}

				if(Math.abs(val1-val2)!==rdata.room[rdata.id[i]].idlist.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC([cc1,cc2],1);
					bd.sErB(rdata.room[rdata.id[i]].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
