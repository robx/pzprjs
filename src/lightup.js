//
// パズル固有スクリプト部 美術館版 lightup.js v3.3.2
//
Puzzles.lightup = function(){ };
Puzzles.lightup.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.dispzero        = true;
		k.isInputHatena   = true;
		k.NumberIsWhite   = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	protoChange : function(){
		this.protofunc = { resetinfo : base.resetInfo};

		base.resetInfo = function(){
			bd.initQlight();
		};
	},
	protoOriginal : function(){
		base.resetInfo = this.protofunc.resetinfo;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.playmode){ this.inputcell();}
			else if(k.editmode){ this.inputqnum();}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode && this.btn.Right) this.inputcell();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(2, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 4;

		bd.qlight = [];
		bd.initQlight = function(){
			bd.qlight = [];
			for(var c=0;c<this.cellmax;c++){ this.qlight[c] = false;}
			for(var c=0;c<this.cellmax;c++){
				if(!this.isAkari(c)){ continue;}

				var bx = this.cell[c].bx, by = this.cell[c].by;
				var d = this.cellRange(c);
				for(var tx=d.x1;tx<=d.x2;tx+=2){ bd.qlight[this.cnum(tx,by)]=true;}
				for(var ty=d.y1;ty<=d.y2;ty+=2){ bd.qlight[this.cnum(bx,ty)]=true;}
			}
		};
		bd.setQlight = function(id, val){
			var d = this.cellRange(id), bx = this.cell[id].bx, by = this.cell[id].by;
			if(val===1){
				for(var tx=d.x1;tx<=d.x2;tx+=2){ this.qlight[this.cnum(tx,by)]=true;}
				for(var ty=d.y1;ty<=d.y2;ty+=2){ this.qlight[this.cnum(bx,ty)]=true;}
			}
			else{
				var clist = [];
				for(var tx=d.x1;tx<=d.x2;tx+=2){ clist.push(this.cnum(tx,by));}
				for(var ty=d.y1;ty<=d.y2;ty+=2){ clist.push(this.cnum(bx,ty));}

				for(var i=0;i<clist.length;i++){
					var cc = clist[i];
					if(this.qlight[cc]?val===2:val===0){ continue;}

					var cbx = this.cell[cc].bx, cby = this.cell[cc].by;
					var dd  = this.cellRange(cc), isakari = false;
								  for(var tx=dd.x1;tx<=dd.x2;tx+=2){ if(this.isAkari(this.cnum(tx,cby))){ isakari=true; break;} }
					if(!isakari){ for(var ty=dd.y1;ty<=dd.y2;ty+=2){ if(this.isAkari(this.cnum(cbx,ty))){ isakari=true; break;} } }
					this.qlight[cc] = isakari;
				}
			}

			if(!!g){
				pc.paintRange(d.x1, by, d.x2, by);
				pc.paintRange(bx, d.y1, bx, d.y2);
			}
		};
		bd.cellRange = function(cc){
			var bx = tx = this.cell[cc].bx, by = ty = this.cell[cc].by;
			var d = {x1:bd.minbx+1, y1:bd.minby+1, x2:bd.maxbx-1, y2:bd.maxby-1};

			tx=bx-2; ty=by; while(tx>bd.minbx){ if(this.cell[this.cnum(tx,ty)].qnum!==-1){ d.x1=tx+2; break;} tx-=2; }
			tx=bx+2; ty=by; while(tx<bd.maxbx){ if(this.cell[this.cnum(tx,ty)].qnum!==-1){ d.x2=tx-2; break;} tx+=2; }
			tx=bx; ty=by-2; while(ty>bd.minby){ if(this.cell[this.cnum(tx,ty)].qnum!==-1){ d.y1=ty+2; break;} ty-=2; }
			tx=bx; ty=by+2; while(ty<bd.maxby){ if(this.cell[this.cnum(tx,ty)].qnum!==-1){ d.y2=ty-2; break;} ty+=2; }

			return d;
		};

		bd.isAkari = function(c){
			return (!!bd.cell[c] && bd.cell[c].qans===1);
		};

		// オーバーライド
		bd.sQnC = function(id, num) {
			var old = this.cell[id].qnum;
			um.addOpe(k.CELL, k.QNUM, id, old, num);
			this.cell[id].qnum = num;

			if((old===-1)^(num===-1)){ this.setQlight(id, (num!==-1?0:2));}
		};
		// オーバーライド
		bd.sQaC = function(id, num) {
			var old = this.cell[id].qans;
			um.addOpe(k.CELL, k.QANS, id, old, num);
			this.cell[id].qans = num;

			if((old===0)^(num===0)){ this.setQlight(id, (num!==0?1:0));}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";
		pc.dotcolor = pc.dotcolor_PINK;
		pc.setCellColorFunc('qnum');

		pc.lightcolor = "rgb(224, 255, 127)";

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();
			this.drawNumbers();

			this.drawAkari();
			this.drawDotCells(true);

			this.drawChassis();

			this.drawTarget();
		};

		// オーバーライド drawBGCells用
		pc.setBGCellColor = function(cc){
			if     (bd.cell[cc].qnum!==-1){ return false;}
			else if(bd.cell[cc].error===1){ g.fillStyle = this.errbcolor1; return true;}
			else if(bd.qlight[cc])        { g.fillStyle = this.lightcolor; return true;}
			return false;
		};

		pc.drawAkari = function(){
			this.vinc('cell_akari', 'auto');

			var rsize = this.cw*0.40;
			var lampcolor = "rgb(0, 127, 96)";
			var header = "c_AK_";

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.isAkari(c)){
					g.fillStyle = (bd.cell[c].error!==4 ? lampcolor : this.errcolor1);
					if(this.vnop(header+c,this.FILL)){
						g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
					}
				}
				else{ this.vhide(header+c);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decode4Cell();
		};
		enc.pzlexport= function(type){
			this.encode4Cell();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQnumb();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnumb();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnumAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnumAns();
		};

		fio.kanpenOpen = function(){
			this.decodeCell( function(obj,ca){
				if     (ca==="+"){ obj.qans = 1;}
				else if(ca==="*"){ obj.qsub = 1;}
				else if(ca==="5"){ obj.qnum = -2;}
				else if(ca!=="."){ obj.qnum = parseInt(ca);}
			});
		};
		fio.kanpenSave = function(){
			this.encodeCell( function(obj){
				if     (obj.qans=== 1){ return "+ ";}
				else if(obj.qsub=== 1){ return "* ";}
				else if(obj.qnum>=  0){ return (obj.qnum.toString() + " ");}
				else if(obj.qnum===-2){ return "5 ";}
				else                  { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkRowsColsPartly(this.isAkariCount, {}, bd.isNum, true) ){
				this.setAlert('照明に別の照明の光が当たっています。','Akari is shined from another Akari.'); return false;
			}

			if( !this.checkDir4Cell(bd.isAkari,0) ){
				this.setAlert('数字のまわりにある照明の数が間違っています。','The number is not equal to the number of Akari around it.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.noNum(c) && !bd.qlight[c]);}) ){
				this.setAlert('照明に照らされていないセルがあります。','A cell is not shined.'); return false;
			}

			return true;
		};

		ans.isAkariCount = function(nullnum, keycellpos, clist, nullobj){
			var akaris=[];
			for(var i=0;i<clist.length;i++){
				if(bd.isAkari(clist[i])){ akaris.push(clist[i]);}
			}
			var result = (akaris.length<=1);

			if(!result){ bd.sErC(akaris,4);}
			return result;
		};
	}
};
