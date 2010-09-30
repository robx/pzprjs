//
// パズル固有スクリプト部 へやわけ版 heyawake.js v3.3.2
//
Puzzles.heyawake = function(){ };
Puzzles.heyawake.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.roomNumber      = true;
		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.RBBlackCell     = true;
		k.checkWhiteCell  = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(0, 191, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockRBToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
			else if(k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum();}
			}
		};
		mv.mousemove = function(){
			if     (k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
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

		bd.nummaxfunc = function(cc){
			var id = area.room.id[cc];
			var d = ans.getSizeOfClist(area.room[id].clist,f_true);
			var m=d.cols, n=d.rows; if(m>n){ var t=m;m=n;n=t;}
			if     (m===1){ return ((n+1)>>1);}
			else if(m===2){ return n;}
			else if(m===3){
				if     (n%4===0){ return (n  )/4*5  ;}
				else if(n%4===1){ return (n-1)/4*5+2;}
				else if(n%4===2){ return (n-2)/4*5+3;}
				else            { return (n+1)/4*5  ;}
			}
			else{
				if(((Math.log(m+1)/Math.log(2))%1===0)&&(m===n)){ return (m*n+m+n)/3;}
				else if((m&1)&&(n&1)){ return (((m*n+m+n-1)/3)|0);}
				else{ return (((m*n+m+n-2)/3)|0);}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.bcolor = pc.bcolor_GREEN;
		pc.bbcolor = "rgb(160, 255, 191)";
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();

			this.drawNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(false);

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

		enc.decodeKanpen = function(){
			fio.decodeSquareRoom();
		};
		enc.encodeKanpen = function(){
			fio.encodeSquareRoom();
		};

		enc.decodeHeyaApp = function(){
			var c=0, rdata=[];
			while(c<bd.cellmax){ rdata[c]=null; c++;}

			var i=0, inp=this.uri.bstr.split("/");
			for(var c=0;c<bd.cellmax;c++){
				if(rdata[c]!==null){ continue;}

				if(inp[i].match(/(\d+in)?(\d+)x(\d+)$/)){
					if(RegExp.$1.length>0){ bd.cell[c].qnum = parseInt(RegExp.$1);}
					var x1 = bd.cell[c].bx, x2 = x1 + 2*parseInt(RegExp.$2) - 2;
					var y1 = bd.cell[c].by, y2 = y1 + 2*parseInt(RegExp.$3) - 2;
					fio.setRdataRect(rdata, i, {x1:x1, x2:x2, y1:y1, y2:y2});
				}
				i++;
			}
			fio.rdata2Border(true, rdata);
		};
		enc.encodeHeyaApp = function(){
			var barray=[], rinfo=area.getRoomInfo();
			for(var id=1;id<=rinfo.max;id++){
				var d = ans.getSizeOfClist(rinfo.room[id].idlist,f_true);
				var ul = bd.cell[bd.cnum(d.x1,d.y1)].qnum;
				barray.push((ul>=0 ? ""+ul+"in" : "")+d.cols+"x"+d.rows);
			}
			this.outbstr = barray.join("/");
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAns();
		};

		fio.kanpenOpen = function(){
			this.decodeSquareRoom();
			this.decodeCellAns();
		};
		fio.kanpenSave = function(){
			this.encodeSquareRoom();
			this.encodeCellAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
				this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
			}

			if( !this.checkOneArea( area.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkBlackCellCount(rinfo) ){
				this.setAlert('部屋の数字と黒マスの数が一致していません。','The number of Black cells in the room and The number written in the room is different.'); return false;
			}

			if( !this.checkRowsColsPartly(this.isBorderCount, {}, bd.isBlack, false) ){
				this.setAlert('白マスが3部屋連続で続いています。','White cells are continued for three consecutive room.'); return false;
			}

			if( !this.checkAreaRect(rinfo) ){
				this.setAlert('四角形ではない部屋があります。','There is a room whose shape is not square.'); return false;
			}

			return true;
		};

		ans.isBorderCount = function(nullnum, keycellpos, clist, nullobj){
			var d = ans.getSizeOfClist(clist,f_true), count = 0, bx, by;
			if(d.x1===d.x2){
				bx = d.x1;
				for(by=d.y1+1;by<=d.y2-1;by+=2){
					if(bd.isBorder(bd.bnum(bx,by))){ count++;}
				}
			}
			else if(d.y1===d.y2){
				by = d.y1;
				for(bx=d.x1+1;bx<=d.x2-1;bx+=2){
					if(bd.isBorder(bd.bnum(bx,by))){ count++;}
				}
			}

			if(count>=2){ bd.sErC(clist,1); return false;}
			return true;
		};
	}
};
