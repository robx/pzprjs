//
// パズル固有スクリプト部 ∀人∃ＨＥＹＡ版 ayeheya.js v3.2.2
//
Puzzles.ayeheya = function(){ };
Puzzles.ayeheya.prototype = {
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
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 1;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 1;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["arearoom","cellqnum","cellans"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		k.area = { bcell:0, wcell:1, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("∀人∃ＨＥＹＡ", "ekawayeh");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
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
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRed(x,y);}
			else if(k.editmode) this.inputborder(x,y);
			else if(k.playmode) this.inputcell(x,y);
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(k.editmode){
					if(!kp.enabled()){ this.inputqnum(x,y);}
					else{ kp.display(x,y);}
				}
			}
		};
		mv.mousemove = function(x,y){
			if     (k.editmode) this.inputborder(x,y);
			else if(k.playmode) this.inputcell(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.EDITOR){
			kp.generate(0, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.nummaxfunc = function(cc){ return area.getCntOfRoomByCell(cc);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.bcolor = pc.bcolor_GREEN;
		pc.BBcolor = "rgb(160, 255, 191)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawWhiteCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawBoxBorders(x1-1,y1-1,x2+1,y2+1,0);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeBorder(bstr);
				bstr = this.decodeRoomNumber16(bstr);
			}
			else if(type==2){ bstr = this.decodeKanpen(bstr); }
			else if(type==4){ bstr = this.decodeHeyaApp(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+k.puzzleid+".html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeRoomNumber16();
		};

		enc.decodeKanpen = function(bstr){
			var rdata = [];

			var inp = bstr.split("/");
			inp.shift();

			for(var i=0;i<inp.length;i++){
				if(inp[i]==""){ break;}
				var pce = inp[i].split("_");
				var sp = { y1:parseInt(pce[0]), x1:parseInt(pce[1]), y2:parseInt(pce[2]), x2:parseInt(pce[3]), num:pce[4]};
				if(sp.num!=""){ bd.sQnC(bd.cnum(sp.x1,sp.y1), parseInt(sp.num,10));}
				for(var cx=sp.x1;cx<=sp.x2;cx++){
					for(var cy=sp.y1;cy<=sp.y2;cy++){
						rdata[bd.cnum(cx,cy)] = i;
					}
				}
			}
			this.rdata2Border(rdata);
		};
		enc.decodeHeyaApp = function(bstr){
			var rdata = [];
			var c=0;
			while(c<bd.cellmax){ rdata[c]=-1; c++;}

			var inp = bstr.split("/");
			var RE1 = new RegExp("(\\d+)in(\\d+)x(\\d+)$","g");
			var RE2 = new RegExp("(\\d+)x(\\d+)$","g");

			var i=0;
			c=0;
			while(c<bd.cellmax){
				if(rdata[c]==-1){
					var width, height;
					if     (inp[i].match(RE1)){ width = parseInt(RegExp.$2); height = parseInt(RegExp.$3); bd.sQnC(bd.cnum(bd.cell[c].cx,bd.cell[c].cy), parseInt(RegExp.$1)); }
					else if(inp[i].match(RE2)){ width = parseInt(RegExp.$1); height = parseInt(RegExp.$2); }

					for(var cx=bd.cell[c].cx;cx<=bd.cell[c].cx+width-1;cx++){
						for(var cy=bd.cell[c].cy;cy<=bd.cell[c].cy+height-1;cy++){
							rdata[bd.cnum(cx,cy)] = i;
						}
					}
					i++;
				}
				c++;
			}
			this.rdata2Border(rdata);
		};
		enc.rdata2Border = function(rdata){
			for(var id=0;id<bd.bdmax;id++){
				var cc1=bd.cc1(id), cc2=bd.cc2(id);
				if(cc1!=-1 && cc2!=-1 && rdata[cc1]!=rdata[cc2]){ bd.sQuB(id,1);}
			}

			return true;
		};

		enc.pzldataKanpen = function(){
			var bstr = "";

			var rinfo = area.getRoomInfo();
			for(var id=1;id<=rinfo.max;id++){
				var d = ans.getSizeOfClist(rinfo.room[id].idlist,f_true);
				if(bd.QnC(bd.cnum(d.x1,d.y1))>=0){
					bstr += (""+d.y1+"_"+d.x1+"_"+d.y2+"_"+d.x2+"_"+bd.QnC(bd.cnum(d.x1,d.y1))+"/");
				}
				else{ bstr += (""+d.y1+"_"+d.x1+"_"+d.y2+"_"+d.x2+"_/");}
			}

			return ""+k.qrows+"/"+k.qcols+"/"+rinfo.max+"/"+bstr;
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			var rmax = array.shift();
			var barray = array.slice(0,rmax);
			for(var i=0;i<barray.length;i++){ barray[i] = (barray[i].split(" ")).join("_");}
			enc.decodeKanpen(""+rmax+"/"+barray.join("/"));
			this.decodeCellAns(array.slice(rmax,rmax+k.qrows));
		};
		fio.kanpenSave = function(){
			var barray = enc.pzldataKanpen().split("/");
			barray.shift(); barray.shift();
			var rmax = barray.shift();
			for(var i=0;i<barray.length;i++){ barray[i] = (barray[i].split("_")).join(" ");}

			return rmax + "/" + barray.join("/") + this.encodeCellAns()+"/";
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
			if( !this.checkFractal(rinfo) ){
				this.setAlert('部屋の中の黒マスが点対称に配置されていません。', 'Position of black cells in the room is not point symmetric.'); return false;
			}

			if( !this.checkBlackCellCount(rinfo) ){
				this.setAlert('部屋の数字と黒マスの数が一致していません。','The number of Black cells in the room and The number written in the room is different.'); return false;
			}

			if( !this.checkRowsCols() ){
				this.setAlert('白マスが3部屋連続で続いています。','White cells are continued for three consecutive room.'); return false;
			}

			if( !this.checkAreaRect(rinfo, f_true) ){
				this.setAlert('四角形ではない部屋があります。','There is a room whose shape is not square.'); return false;
			}

			return true;
		};

		ans.checkFractal = function(rinfo){
			for(var r=1;r<=rinfo.max;r++){
				var d = ans.getSizeOfClist(rinfo.room[r].idlist,f_true);
				var sx=d.x1+d.x2+1, sy=d.y1+d.y2+1;
				for(var i=0;i<rinfo.room[r].idlist.length;i++){
					var c=rinfo.room[r].idlist[i];
					if(bd.isBlack(c) ^ bd.isBlack(bd.cnum(sx-bd.cell[c].cx-1, sy-bd.cell[c].cy-1))){
						bd.sErC(rinfo.room[r].idlist,1);
						return false;
					}
				}
			}
			return true;
		};

		ans.checkRowsCols = function(){
			var fx, fy;

			for(var by=1;by<2*k.qrows;by+=2){
				var cnt=-1;
				for(var bx=1;bx<2*k.qcols;bx++){
					if(bx%2==1){
						if( bd.isWhite(bd.cnum( mf(bx/2),mf(by/2) )) && cnt==-1 ){ cnt=0; fx=bx;}
						else if( bd.isBlack(bd.cnum( mf(bx/2),mf(by/2) )) ){ cnt=-1;}

						if( cnt==2 ){
							for(bx=fx;bx<2*k.qcols;bx+=2){
								var cc = bd.cnum( mf(bx/2),mf(by/2) );
								if( bd.isWhite(cc) ){ bd.sErC([cc],1);}else{ break;}
							}
							return false;
						}
					}
					else{
						if( bd.isBorder(bd.bnum(bx,by)) && cnt>=0 ){ cnt++;}
					}
				}
			}
			for(var bx=1;bx<2*k.qcols;bx+=2){
				var cnt=-1;
				for(var by=1;by<2*k.qrows;by++){
					if(by%2==1){
						if( bd.isWhite(bd.cnum( mf(bx/2),mf(by/2) )) && cnt==-1 ){ cnt=0; fy=by;}
						else if( bd.isBlack(bd.cnum( mf(bx/2),mf(by/2) )) ){ cnt=-1;}

						if( cnt>=2 ){
							for(by=fy;by<2*k.qrows;by+=2){
								var cc = bd.cnum( mf(bx/2),mf(by/2) );
								if( bd.isWhite(cc) ){ bd.sErC([cc],1);}else{ break;}
							}
							return false;
						}
					}
					else{
						if( bd.isBorder(bd.bnum(bx,by)) && cnt>=0 ){ cnt++;}
					}
				}
			}

			return true;
		};
	}
};
