//
// パズル固有スクリプト部 メジリンク版 mejilink.js v3.3.0
//
Puzzles.mejilink = function(){ };
Puzzles.mejilink.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 1;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		k.area = { bcell:0, wcell:0, number:0, disroom:1};	// areaオブジェクトで領域を生成する

		base.setTitle("メジリンク","Mejilink");
		base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(32, 32, 32)");
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
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;} };
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.BorderQuescolor = "white";

		pc.chassisflag = false;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawBaseMarks(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
		};

		pc.drawBaseMarks = function(x1,y1,x2,y2){
			this.vinc('cross_mark', 'auto');

			for(var by=bd.minby;by<=bd.maxby;by+=2){
				for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
					if(bx < x1-1 || x2+1 < bx){ continue;}
					if(by < y1-1 || y2+1 < by){ continue;}

					this.drawBaseMark1((bx>>1)+(by>>1)*(k.qcols+1));
				}
			}
		};
		pc.drawBaseMark1 = function(id){
			var vid = "x_cm_"+id;

			g.fillStyle = this.Cellcolor;
			if(this.vnop(vid,this.NONE)){
				var csize = (this.lw+1)/2;
				var bx = (id%(k.qcols+1))*2, by = mf(id/(k.qcols+1))*2;
				g.fillCircle(k.p0.x+bx*this.bw, k.p0.x+by*this.bh, csize);
			}
		};

		// オーバーライド
		pc.setBorderColor = function(id){
			if(bd.border[id].qans===1 || bd.border[id].ques===1){
				if(bd.border[id].qans===1){ this.setLineColor(id);}
				else{
					var cc2=bd.border[id].cellcc[1];
					g.fillStyle = ((cc2==-1 || bd.cell[cc2].error==0) ? this.BorderQuescolor : this.errbcolor1);
				}
				return true;
			}
			return false;
		};

		line.repaintParts = function(idlist){
			var xlist = this.getXlistFromIdlist(idlist);
			for(var i=0;i<xlist.length;i++){
				pc.drawBaseMark1(xlist[i]);
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
			var bstr = this.outbstr;
			var pos = bstr?Math.min(mf((bd.bdmax+4)/5),bstr.length):0;
			for(var i=0;i<pos;i++){
				var ca = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){
					if(i*5+w<bd.bdmax){ bd.sQuB(i*5+w,(ca&Math.pow(2,4-w)?1:0));}
				}
			}
			this.outbstr = bstr.substr(pos);
		};
		enc.encodeMejilink = function(){
			var count = 0;
			for(var i=bd.bdinside;i<bd.bdmax;i++){ if(bd.QuB(i)==1) count++;}
			var num=0, pass=0, cm="";
			for(var i=0;i<(count==0?bd.bdinside:bd.bdmax);i++){
				if(bd.QuB(i)==1){ pass+=Math.pow(2,4-num);}
				num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}
			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeBorder2( function(c,ca){
				if     (ca == "2" ){ bd.sQuB(c, 0); bd.sQaB(c, 1);}
				else if(ca == "-1"){ bd.sQuB(c, 0); bd.sQsB(c, 2);}
				else if(ca == "1" ){ bd.sQuB(c, 0);}
				else               { bd.sQuB(c, 1);}
			});
		};
		fio.encodeData = function(){
			this.encodeBorder2( function(c){
				if     (bd.QaB(c)==1){ return "2 ";}
				else if(bd.QsB(c)==2){ return "-1 ";}
				else if(bd.QuB(c)==0){ return "1 ";}
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
				area.sr0(cc,tarea,function(id){ return (id==-1 || bd.QuB(id)!=1);});

				tarea.room[tarea.max] = {idlist:tarea[tarea.max].clist};
			}

			var tcount = [], numerous_value = 999999;
			for(var r=1;r<=tarea.max;r++){ tcount[r]=0;}
			for(var id=0;id<bd.bdmax;id++){
				if(bd.QuB(id)==1 && id>=bd.bdinside){
					var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
					if(cc1!=-1){ tcount[tarea.id[cc1]] -= numerous_value;}
					if(cc2!=-1){ tcount[tarea.id[cc2]] -= numerous_value;}
					continue;
				}
				else if(bd.QuB(id)==1 || bd.QaB(id)==1){ continue;}
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1!=-1){ tcount[tarea.id[cc1]]++;}
				if(cc2!=-1){ tcount[tarea.id[cc2]]++;}
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
