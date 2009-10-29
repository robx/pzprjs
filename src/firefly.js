//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.2.2
//
Puzzles.firefly = function(){ };
Puzzles.firefly.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["celldirecnum","borderline"];

		//k.def_csize = 36;
		k.def_psize = 16;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.callmode=="pmake"){
			base.setExpression("　黒点は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input black marks, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
							   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		}
		base.setTitle("ホタルビーム", 'Hotaru Beam'); //'Glow of Fireflies');
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.inputdirec(x,y);
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==1 && this.notInputted() && bd.cnum(this.mouseCell.x,this.mouseCell.y)==this.cellid(new Pos(x,y))) this.inputqnum(x,y,99);
		};
		mv.mousemove = function(x,y){
			if(k.mode==1){
				if(this.notInputted()) this.inputdirec(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,99);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.fontErrcolor = pc.fontcolor;
		pc.fontsizeratio = 0.85;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawDashLines(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawNumCells_firefly(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawNumCells_firefly = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.40;
			var rsize2 = k.cwidth*0.36;
			var rsize3 = k.cwidth*0.10;

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QnC(c)!=-1){
					var px=bd.cell[c].px+mf(k.cwidth/2), py=bd.cell[c].py+mf(k.cheight/2);

					g.fillStyle = this.Cellcolor;
					g.beginPath();
					g.arc(px, py, rsize , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cira_",1)){ g.fill(); }

					if(bd.ErC(c)==1){ g.fillStyle = this.errbcolor1;}
					else{ g.fillStyle = "white";}
					g.beginPath();
					g.arc(px, py, rsize2, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cirb_",1)){ g.fill(); }

					this.vdel("c"+c+"_circ_");
					g.fillStyle = this.Cellcolor;
					switch(bd.DiC(c)){
						case 1: py-=(rsize-1); break;
						case 2: py+=(rsize-1); break;
						case 3: px-=(rsize-1); break;
						case 4: px+=(rsize-1); break;
					}
					if(bd.DiC(c)!=0){
						g.beginPath();
						g.arc(px, py, rsize3 , 0, Math.PI*2, false);
						if(this.vnop("c"+c+"_circ_",1)){ g.fill();}
					}
				}
				else{ this.vhide(["c"+c+"_cira_","c"+c+"_cirb_"]); this.vdel("c"+c+"_circ_");}

				this.dispnumCell_General(c);
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeArrowNumber16(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeArrowNumber16();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
			}

			var saved = this.checkFireflies();
			if( !this.checkErrorFlag(saved,3) ){
				this.setAlert('黒点同士が線で繋がっています。', 'Black points are connected each other.'); return false;
			}
			if( !this.checkErrorFlag(saved,2) ){
				this.setAlert('線の曲がった回数が数字と違っています。', 'The number of curves is different from a firefly\'s number.'); return false;
			}
			if( !this.checkErrorFlag(saved,1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			this.performAsLine = true;
			if( !this.checkOneArea( line.getLareaInfo() ) ){
				this.setAlert('線が全体で一つながりになっていません。', 'All lines and fireflies are not connected each other.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkFireflyBeam() ){
				this.setAlert('ホタルから線が出ていません。', 'There is a lonely firefly.'); return false;
			}

			if( !this.checkStrangeLine(saved) ){
				this.setAlert('白丸の、黒点でない部分どうしがくっついています。', 'Fireflies are connected without a line starting from black point.'); return false;
			}

			bd.sErB(bd.borders,0);
			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkLcntCell = function(val){
			if(line.ltotal[val]==0){ return true;}
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QnC(c)==-1 && line.lcntCell(c)==val){
					bd.sErB(bd.borders,2);
					ans.setCellLineError(c,false);
					return false;
				}
			}
			return true;
		};
		ans.checkFireflyBeam = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QnC(c)==-1 || bd.DiC(c)==0){ continue;}
				if((bd.DiC(c)==1 && !bd.isLine(bd.ub(c))) || (bd.DiC(c)==2 && !bd.isLine(bd.db(c))) ||
				   (bd.DiC(c)==3 && !bd.isLine(bd.lb(c))) || (bd.DiC(c)==4 && !bd.isLine(bd.rb(c))) )
				{
					bd.sErC([c],1);
					return false;
				}
			}
			return true;
		};
		ans.checkStrangeLine = function(saved){
			var idlist = [];
			for(var id=0;id<bd.border.length;id++){
				if(bd.isLine(id) && saved.check[id]!=2){ idlist.push(id);}
			}
			if(idlist.length>0){
				bd.sErB(bd.borders,2);
				bd.sErB(idlist,1);
				return false;
			}
			return true;
		};

		ans.checkFireflies = function(){
			var saved = {errflag:0,cells:[],idlist:[],check:[]};
			for(var i=0;i<bd.border.length;i++){ saved.check[i]=0;}

			for(var c=0;c<bd.cell.length;c++){
				if(bd.QnC(c)==-1 || bd.DiC(c)==0){ continue;}

				var ccnt=0;
				var idlist = [];
				var dir=bd.DiC(c);
				var bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;
				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if((bx+by)%2==0){
						var cc = bd.cnum(mf(bx/2),mf(by/2));
						if     (bd.QnC(cc)!=-1){ break;}
						else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ if(dir!=2){ ccnt++;} dir=2;}
						else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ if(dir!=1){ ccnt++;} dir=1;}
						else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ if(dir!=4){ ccnt++;} dir=4;}
						else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ if(dir!=3){ ccnt++;} dir=3;}
					}
					else{
						var id = bd.bnum(bx,by);
						if(!bd.isLine(id)){ break;}
						idlist.push(id);
					}
				}

				for(var i=0;i<idlist.length;i++){ saved.check[idlist[i]]=2;}

				var cc = bd.cnum(mf(bx/2),mf(by/2));
				if(idlist.length>0 && (bx+by)%2==1 && saved.errflag==0){
					saved = {errflag:1,cells:[c],idlist:idlist,check:saved.check};
				}
				else if(idlist.length>0 && (bx+by)%2==0 && bd.QnC(c)!=-2 && bd.QnC(c)!=ccnt && saved.errflag<=1){
					saved = {errflag:2,cells:[c],idlist:idlist,check:saved.check};
				}
				else if(((bd.DiC(cc)==1 && dir==2) || (bd.DiC(cc)==2 && dir==1) ||
						 (bd.DiC(cc)==3 && dir==4) || (bd.DiC(cc)==4 && dir==3) ) && (bx+by)%2==0 && saved.errflag<=2 )
				{
					saved = {errflag:3,cells:[c,cc],idlist:idlist,check:saved.check};
					return saved;
				}
			}
			return saved;
		};
		ans.checkErrorFlag = function(saved, val){
			if(saved.errflag==val){
				bd.sErC(saved.cells,1);
				bd.sErB(bd.borders,2);
				bd.sErB(saved.idlist,1);
				return false;
			}
			return true;
		};
	}
};
