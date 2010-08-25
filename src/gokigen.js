//
// パズル固有スクリプト部 ごきげんななめ版 gokigen.js v3.3.2
//
Puzzles.gokigen = function(){ };
Puzzles.gokigen.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}
		if(!k.qrows){ k.qrows = 7;}

		k.iscross  = 2;

		k.dispzero        = true;

		k.bdmargin       = 0.70;
		k.bdmargin_image = 0.50;

		base.setTitle("ごきげんななめ","Gokigen-naname");
		base.setExpression("　マウスで斜線を入力できます。",
						   " Click to input slashes.");
		base.setFloatbgcolor("rgb(0, 127, 0)");
		base.proto = 1;
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedLineToFlags();
	},
	finalfix : function(){
		ee('btnclear2').el.style.display = 'none';
	},
	protoChange : function(){
	},
	protoOriginal : function(){
		ee('btnclear2').el.style.display = 'inline';
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode){
				if(!(kc.isZ ^ pp.getVal('dispred'))){ this.inputslash();}
				else{ this.dispBlue();}
			}
			else if(k.editmode){ this.inputcross();}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };
		mv.dispBlue = function(){
			var cc = this.cellid();
			if(cc===null || bd.QaC(cc)===0){ return;}

			var check = [];
			for(var i=0;i<bd.crossmax;i++){ check[i]=0;}

			var fc = bd.xnum(bd.cell[cc].bx+(bd.isBlack(cc)?-1:1),bd.cell[cc].by-1);
			ans.searchline(check, 0, fc);
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QaC(c)===1 && check[bd.xnum(bd.cell[c].bx-1,bd.cell[c].by-1)]===1){ bd.sErC([c],2);}
				if(bd.QaC(c)===2 && check[bd.xnum(bd.cell[c].bx+1,bd.cell[c].by-1)]===1){ bd.sErC([c],2);}
			}

			ans.errDisp = true;
			pc.paintAll();
		};
		mv.inputslash = function(){
			var cc = this.cellid();
			if(cc===null){ return;}

			var use = pp.getVal('use');
			if     (use===1){ bd.sQaC(cc, (bd.QaC(cc)!==(this.btn.Left?1:2)?(this.btn.Left?1:2):0));}
			else if(use===2){ bd.sQaC(cc, (this.btn.Left?[1,2,0]:[2,0,1])[bd.QaC(cc)]);}

			pc.paintCellAround(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCross(ca)){ return;}
			this.key_inputcross(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;} };

		kc.isZ = false;

		if(k.EDITOR){
			kp.generate(4, true, false);
			kp.kpinput = function(ca){
				kc.key_inputcross(ca);
			};
		}

		tc.setCrossType();

		bd.maxnum = 4;

		menu.ex.adjustSpecial = function(key,d){
			if(key & this.TURNFLIP){ // 反転・回転全て
				for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,[0,2,1][bd.QaC(c)]);}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;

		pc.crosssize = 0.33;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid(false);

			this.drawSlashes();

			this.drawCrosses();
			this.drawTarget();
		};

		// オーバーライド
		pc.setBGCellColor = function(c){
			if(bd.cell[c].qans===-1 && bd.cell[c].error===1){
				g.fillStyle = this.errbcolor1;
				return true;
			}
			return false;
		};

		pc.drawSlashes = function(){
			this.vinc('cell_slash', 'auto');

			var headers = ["c_sl1_", "c_sl2_"];
			g.lineWidth = Math.max(this.cw/8, 2);

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				if(bd.cell[c].qans!==-1){
					if     (bd.cell[c].error===1){ g.strokeStyle = this.errcolor1;}
					else if(bd.cell[c].error===2){ g.strokeStyle = this.errcolor2;}
					else                         { g.strokeStyle = this.cellcolor;}

					if(bd.cell[c].qans===1){
						if(this.vnop(headers[0]+c,this.STROKE)){
							g.setOffsetLinePath(bd.cell[c].px,bd.cell[c].py, 0,0, this.cw,this.ch, true);
							g.stroke();
						}
					}
					else{ this.vhide(headers[0]+c);}

					if(bd.cell[c].qans===2){
						if(this.vnop(headers[1]+c,this.STROKE)){
							g.setOffsetLinePath(bd.cell[c].px,bd.cell[c].py, this.cw,0, 0,this.ch, true);
							g.stroke();
						}
					}
					else{ this.vhide(headers[1]+c);}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c]);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			var oldflag = ((type==1 && !this.checkpflag("c")) || (type==0 && this.checkpflag("d")));
			if(!oldflag){ this.decode4Cross();}
			else        { this.decodecross_old();}
		};
		enc.pzlexport = function(type){
			if(type==1){ this.outpflag = 'c';}
			this.encode4Cross();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCrossNum();
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeCrossNum();
			this.encodeCellQanssub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLoopLine() ){
				this.setAlert('斜線で輪っかができています。', 'There is a loop consisted in some slashes.'); return false;
			}

			if( !this.checkQnumCross() ){
				this.setAlert('数字に繋がる線の数が間違っています。', 'A number is not equal to count of lines that is connected to it.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QaC(c)===0);}) ){
				this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};

		ans.scntCross = function(id){
			if(id===null){ return 0;}
			var bx=bd.cross[id].bx, by=bd.cross[id].by;
			var obj, cnt=0;
			obj=bd.cell[bd.cnum(bx-1,by-1)]; if(!!obj && obj.qans===1){ cnt++;}
			obj=bd.cell[bd.cnum(bx+1,by-1)]; if(!!obj && obj.qans===2){ cnt++;}
			obj=bd.cell[bd.cnum(bx-1,by+1)]; if(!!obj && obj.qans===2){ cnt++;}
			obj=bd.cell[bd.cnum(bx+1,by+1)]; if(!!obj && obj.qans===1){ cnt++;}
			return cnt;
		};
		ans.scntCross2 = function(id){
			if(id===null){ return 0;}
			var bx=bd.cross[id].bx, by=bd.cross[id].by;
			var obj, cnt=0;
			obj=bd.cell[bd.cnum(bx-1,by-1)]; if(!!obj && obj.error===1 && obj.qans===1){ cnt++;}
			obj=bd.cell[bd.cnum(bx+1,by-1)]; if(!!obj && obj.error===1 && obj.qans===2){ cnt++;}
			obj=bd.cell[bd.cnum(bx-1,by+1)]; if(!!obj && obj.error===1 && obj.qans===2){ cnt++;}
			obj=bd.cell[bd.cnum(bx+1,by+1)]; if(!!obj && obj.error===1 && obj.qans===1){ cnt++;}
			return cnt;
		};

		ans.checkLoopLine = function(){
			var check = [], result = true;
			for(var i=0;i<bd.crossmax;i++){ check[i]=0;}

			while(1){
				var fc=null;
				for(var i=0;i<bd.crossmax;i++){ if(check[i]==0){ fc=i; break;}}
				if(fc===null){ break;}

				if(!this.searchline(check, 0, fc)){
					for(var c=0;c<bd.cellmax;c++){
						if(bd.QaC(c)===1 && check[bd.xnum(bd.cell[c].bx-1,bd.cell[c].by-1)]==1){ bd.sErC([c],1);}
						if(bd.QaC(c)===2 && check[bd.xnum(bd.cell[c].bx+1,bd.cell[c].by-1)]==1){ bd.sErC([c],1);}
					}
					while(1){
						var endflag = true;
						for(var c=0;c<bd.cellmax;c++){
							if(bd.cell[c].error!==1){ continue;}
							var cc1, cc2, bx=bd.cell[c].bx, by=bd.cell[c].by;
							if     (bd.QaC(c)===1){ cc1=bd.xnum(bx-1,by-1); cc2=bd.xnum(bx+1,by+1);}
							else if(bd.QaC(c)===2){ cc1=bd.xnum(bx-1,by+1); cc2=bd.xnum(bx+1,by-1);}
							if(this.scntCross2(cc1)==1 || this.scntCross2(cc2)==1){ bd.sErC([c],0); endflag = false; break;}
						}
						if(endflag){ break;}
					}
					if(this.inAutoCheck){ return false;}
					result = false;
				}
				for(var c=0;c<bd.crossmax;c++){ if(check[c]==1){ check[c]=2;} }
			}
			return result;
		};
		ans.searchline = function(check, dir, c){
			var nx, tx=bd.cross[c].bx, ty=bd.cross[c].by, flag=true;
			check[c]=1;

			nx = bd.xnum(tx-2,ty-2);
			if(nx!==null && dir!==4 && bd.QaC(bd.cnum(tx-1,ty-1))===1 && (check[nx]!==0 || !this.searchline(check,1,nx))){ flag=false;}
			nx = bd.xnum(tx-2,ty+2);
			if(nx!==null && dir!==3 && bd.QaC(bd.cnum(tx-1,ty+1))===2 && (check[nx]!==0 || !this.searchline(check,2,nx))){ flag=false;}
			nx = bd.xnum(tx+2,ty-2);
			if(nx!==null && dir!==2 && bd.QaC(bd.cnum(tx+1,ty-1))===2 && (check[nx]!==0 || !this.searchline(check,3,nx))){ flag=false;}
			nx = bd.xnum(tx+2,ty+2);
			if(nx!==null && dir!==1 && bd.QaC(bd.cnum(tx+1,ty+1))===1 && (check[nx]!==0 || !this.searchline(check,4,nx))){ flag=false;}

			return flag;
		};

		ans.checkQnumCross = function(){
			var result = true;
			for(var c=0;c<bd.crossmax;c++){
				if(bd.QnX(c)>=0 && bd.QnX(c)!=this.scntCross(c)){
					if(this.inAutoCheck){ return false;}
					bd.sErX([c],1);
					result = false;
				}
			}
			return result;
		};
	}
};
