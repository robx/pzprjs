//
// パズル固有スクリプト部 メジリンク版 mejilink.js v3.4.0
//
Puzzles.mejilink = function(){ };
Puzzles.mejilink.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.iscross  = 2;
		k.isborder = 2;

		k.isborderAsLine  = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	protoChange : function(){
		this.protofunc = Border.prototype.allclear;
		Border.prototype.allclear = function(id,isrec){
			this.defques = (id<k.qcols*(k.qrows-1)+(k.qcols-1)*k.qrows ? 1 : 0);
			if(this.ques!==this.defques){ if(isrec){ um.addOpe(k.BORDER, k.QUES, id, this.ques, this.defques);} this.ques=this.defques;}
			if(this.line!==this.defline){ if(isrec){ um.addOpe(k.BORDER, k.LINE, id, this.line, this.defline);} this.line=this.defline;}
			if(this.qsub!==this.defqsub){ if(isrec){ um.addOpe(k.BORDER, k.QSUB, id, this.qsub, this.defqsub);} this.qsub=this.defqsub;}
			this.color = "";
			this.error = 0;
		};
	},
	protoOriginal : function(){
		Border.prototype.allclear = this.protofunc;
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
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.prevPos.reset();
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		bd.initSpecial = function(col,row){
			k.qcols = col;
			k.qrows = row;
			for(var id=0;id<bd.bdmax;id++){
				this.border[id].allclear(id,false);
			}
		};

		// 線を引かせたくないので上書き
		bd.isLineNG = function(id){ return (bd.border[id].ques===1);},
		bd.enableLineNG = true;

		bd.isGround = function(id){ return (!!bd.border[id] && bd.border[id].ques>0);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.borderQuescolor = "white";

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid(false);
			this.drawBorders();
			this.drawLines();

			this.drawBaseMarks();

			this.drawPekes(0);
		};

		// オーバーライド
		pc.setBorderColor = function(id){
			if(bd.border[id].ques===1){
				var cc2=bd.border[id].cellcc[1];
				g.fillStyle = ((cc2===null || bd.cell[cc2].error===0) ? this.borderQuescolor : this.errbcolor1);
				return true;
			}
			return false;
		};

		pc.repaintParts = function(idlist){
			var xlist = bd.lines.getXlistFromIdlist(idlist);
			for(var i=0;i<xlist.length;i++){
				this.drawBaseMark1(xlist[i]);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeMejilink();
		};
		enc.pzlexport = function(type){
			this.encodeMejilink();
		};

		enc.decodeMejilink = function(){
			var bstr = this.outbstr, twi=[16,8,4,2,1];
			var pos = (bstr?Math.min((((bd.bdmax+4)/5)|0),bstr.length):0), id=0;
			for(var i=0;i<pos;i++){
				var ca = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){
					if(id<bd.bdmax){
						bd.border[id].ques = (ca&twi[w]?1:0);
						id++;
					}
				}
			}
			this.outbstr = bstr.substr(pos);
		};
		enc.encodeMejilink = function(){
			var count = 0;
			for(var id=bd.bdinside;id<bd.bdmax;id++){ if(bd.isGround(id)) count++;}
			var num=0, pass=0, cm="", twi=[16,8,4,2,1];
			for(var id=0,max=(count===0?bd.bdinside:bd.bdmax);id<max;id++){
				if(bd.isGround(id)){ pass+=twi[num];} num++;
				if(num===5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}
			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeBorder( function(obj,ca){
				if     (ca==="2" ){ obj.ques = 0; obj.line = 1;}
				else if(ca==="-1"){ obj.ques = 0; obj.qsub = 2;}
				else if(ca==="1" ){ obj.ques = 0;}
				else              { obj.ques = 1;}
			});
		};
		fio.encodeData = function(){
			this.encodeBorder( function(obj){
				if     (obj.line===1){ return "2 ";}
				else if(obj.qsub===2){ return "-1 ";}
				else if(obj.ques===0){ return "1 ";}
				else                 { return "0 ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkdir4Line_meji(3) ){
				this.setAlert('分岐している線があります。','There is a branched line.'); return false;
			}
			if( !this.checkdir4Line_meji(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			if( !this.checkDotLength() ){
				this.setAlert('タイルと周囲の線が引かれない点線の長さが異なります。','The size of the tile is not equal to the total of length of lines that is remained dotted around the tile.'); return false;
			}

			if( !this.checkdir4Line_meji(1) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkdir4Line_meji = function(val){
			var result = true;
			for(var by=bd.minby;by<=bd.maxby;by+=2){
				for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
					var cnt = 0;
					if(bd.isLine(bd.bnum(bx-1,by  ))){ cnt++;}
					if(bd.isLine(bd.bnum(bx+1,by  ))){ cnt++;}
					if(bd.isLine(bd.bnum(bx  ,by-1))){ cnt++;}
					if(bd.isLine(bd.bnum(bx  ,by+1))){ cnt++;}
					if(cnt==val){
						if(this.inAutoCheck){ return false;}
						if(result){ bd.sErBAll(2);}
						ans.setCrossBorderError(bx,by);
						result = false;
					}
				}
			}
			return result;
		};
		ans.checkDotLength = function(){
			var result = true;
			var tarea = new AreaInfo();
			for(var cc=0;cc<bd.cellmax;cc++){ tarea.id[cc]=0;}
			for(var cc=0;cc<bd.cellmax;cc++){
				if(tarea.id[cc]!=0){ continue;}
				tarea.max++;
				tarea[tarea.max] = {clist:[]};
				bd.areas.sr0(cc,tarea,function(id){ return !bd.isGround(id);});

				tarea.room[tarea.max] = {idlist:tarea[tarea.max].clist};
			}

			var tcount = [], numerous_value = 999999;
			for(var r=1;r<=tarea.max;r++){ tcount[r]=0;}
			for(var id=0;id<bd.bdmax;id++){
				if(bd.isGround(id) && id>=bd.bdinside){
					var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
					if(cc1!==null){ tcount[tarea.id[cc1]] -= numerous_value;}
					if(cc2!==null){ tcount[tarea.id[cc2]] -= numerous_value;}
					continue;
				}
				else if(bd.isGround(id) || bd.isLine(id)){ continue;}
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1!==null){ tcount[tarea.id[cc1]]++;}
				if(cc2!==null){ tcount[tarea.id[cc2]]++;}
			}
			for(var r=1;r<=tarea.max;r++){
				if(tcount[r]>=0 && tcount[r]!=tarea.room[r].idlist.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC(tarea.room[r].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
