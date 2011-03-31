//
// パズル固有スクリプト部 エルート版 loute.js v3.3.3
//
Puzzles.loute = function(){ };
Puzzles.loute.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.numberAsObject  = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				this.inputarrow_cell();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted()){ this.inputqnum();}
		};
		mv.mousemove = function(){
			if(k.editmode){
				this.inputarrow_cell();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(!this.isSHIFT && this.moveTCell(ca)){ return;}
			this.key_toichika(ca);
		};
		kc.key_toichika = function(ca){
			if     (ca==='1'||(this.isSHIFT && ca===k.KEYUP)){ ca='1';}
			else if(ca==='2'||(this.isSHIFT && ca===k.KEYRT)){ ca='4';}
			else if(ca==='3'||(this.isSHIFT && ca===k.KEYDN)){ ca='2';}
			else if(ca==='4'||(this.isSHIFT && ca===k.KEYLT)){ ca='3';}
			else if(ca==='5'||ca==='q')                      { ca='5';}
			else if(ca==='-')                                { ca='s1';}
			else if(ca==='6'||ca===' ')                      { ca=' ';}
			this.key_inputqnum(ca);
		};

		bd.nummaxfunc = function(){ return 5;};

		menu.ex.adjustSpecial = function(key,d){
			var trans = {};
			switch(key){
				case this.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case this.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case this.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case this.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val = trans[bd.QnC(c)]; if(!!val){ bd.sQnC(c,val);}
				var val = trans[bd.AnC(c)]; if(!!val){ bd.sAnC(c,val);}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.setBorderColorFunc('qans');

		pc.circledcolor = "black";
		pc.circleratio = [0.35, 0.40];

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawArrowCells();
			this.drawCircles();
			this.drawHatenas();

			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		};

		pc.drawCircles = function(){
			this.vinc('cell_circle', 'auto');

			var rsize2 = this.cw*this.circleratio[1];
			var header = "c_cir_";
			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum===5){
					g.strokeStyle = this.cellcolor;
					if(this.vnop(header+c,this.STROKE)){
						g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
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

			var rinfo = ans.getLblockInfo();
			if( !this.checkArrowCorner1(rinfo) ){
				this.setAlert('矢印がブロックの端にありません。','An arrow is not at the edge of the block.'); return false;
			}

			if( !this.checkArrowCorner2(rinfo) ){
				this.setAlert('矢印の先にブロックの角がありません。','An arrow doesn\'t indicate the corner of a block.'); return false;
			}

			if( !this.checkCircleCorner(rinfo) ){
				this.setAlert('白丸がブロックの角にありません。','A circle is out of the corner.'); return false;
			}

			if( !this.checkLblock(rinfo) ){
				this.setAlert('ブロックが幅1のL字型になっていません。','A block is not L-shape or whose width is not one.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};

		ans.getLblockInfo = function(){
			var rinfo = area.getRoomInfo();
			rinfo.place = [];

			for(var id=1;id<=rinfo.max;id++){
				var clist = rinfo.room[id].idlist;
				var d = this.getSizeOfClist(clist,f_true);
				var subclist = [];
				for(var bx=d.x1;bx<=d.x2;bx+=2){
					for(var by=d.y1;by<=d.y2;by+=2){
						var cc = bd.cnum(bx,by);
						if(rinfo.id[cc]!=id){ subclist.push(cc);}
					}
				}
				/* 四角形のうち別エリアとなっている部分を調べる */
				/* 幅が1なので座標自体は調べなくてよいはず      */
				var dl = this.getSizeOfClist(subclist,f_true);
				if( subclist.length==0 || (dl.cols*dl.rows!=dl.cnt) || ((d.cols-1)!==dl.cols) || ((d.rows-1)!==dl.rows) ){
					rinfo.room[id].shape = 0;
					for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 0;}
				}
				else{
					rinfo.room[id].shape = 1; /* 幅が1のL字型 */
					for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 1;} /* L字型ブロックのセル */

					/* 端のセル */
					var edge1=null, edge2=null;
					if     ((d.x1===dl.x1&&d.y1===dl.y1)||(d.x2===dl.x2&&d.y2===dl.y2))
								{ edge1 = bd.cnum(d.x1,d.y2); edge2 = bd.cnum(d.x2,d.y1);}
					else if((d.x1===dl.x1&&d.y2===dl.y2)||(d.x2===dl.x2&&d.y1===dl.y1))
								{ edge1 = bd.cnum(d.x1,d.y1); edge2 = bd.cnum(d.x2,d.y2);}
					rinfo.place[edge1] = 2;
					rinfo.place[edge2] = 2;

					/* 角のセル */
					var corner=null;
					if     (d.x1===dl.x1 && d.y1===dl.y1){ corner = bd.cnum(d.x2,d.y2);}
					else if(d.x1===dl.x1 && d.y2===dl.y2){ corner = bd.cnum(d.x2,d.y1);}
					else if(d.x2===dl.x2 && d.y1===dl.y1){ corner = bd.cnum(d.x1,d.y2);}
					else if(d.x2===dl.x2 && d.y2===dl.y2){ corner = bd.cnum(d.x1,d.y1);}
					rinfo.place[corner] = 3;
				}
			}
			
			return rinfo;
		};

		ans.checkArrowCorner1 = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){ continue;}

				var error = false, clist = rinfo.room[id].idlist;
				for(var i=0;i<clist.length;i++){
					var cc = clist[i], num = bd.getNum(cc);
					if(num>=1 && num<=4 && rinfo.place[cc]!==2){
						if(this.inAutoCheck){ return false;}
						bd.sErC(rinfo.room[id].idlist,1);
						result = false;
						break;
					}
				}
			}
			return result;
		};

		ans.checkArrowCorner2 = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){ continue;}

				var error = false, clist = rinfo.room[id].idlist;
				for(var i=0;i<clist.length;i++){
					var cc = clist[i], num = bd.getNum(cc);
					if(num>=1 && num<=4 &&
					   ((num===k.UP && bd.isBorder(bd.ub(cc))) ||
						(num===k.DN && bd.isBorder(bd.db(cc))) ||
						(num===k.LT && bd.isBorder(bd.lb(cc))) ||
						(num===k.RT && bd.isBorder(bd.rb(cc)))) )
					{
						if(this.inAutoCheck){ return false;}
						bd.sErC(rinfo.room[id].idlist,1);
						result = false;
						break;
					}
				}
			}
			return result;
		};

		ans.checkCircleCorner = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){ continue;}

				var clist = rinfo.room[id].idlist;
				for(var i=0;i<clist.length;i++){
					var cc = clist[i];
					if(bd.getNum(cc)===5 && rinfo.place[cc]!==3){
						if(this.inAutoCheck){ return false;}
						bd.sErC(rinfo.room[id].idlist,1);
						result = false;
						break;
					}
				}
			}
			return result;
		};

		ans.checkLblock = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
