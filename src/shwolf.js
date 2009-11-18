//
// パズル固有スクリプト部 ヤギとオオカミ版 shwolf.js v3.2.3
//
Puzzles.shwolf = function(){ };
Puzzles.shwolf.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 1;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
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

		k.fstruct = ["cellques41_42","crossnum","borderans"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("ヤギとオオカミ","Sheeps and Wolves");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputcrossMark();
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode) this.inputQues([0,41,42,-2]);
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		// オーバーライド
		mv.inputBD = function(flag){
			var pos = this.crosspos(0.35);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!=-1 && id!=-1){
				if((pos.x%2==0 && this.mouseCell.x==pos.x && Math.abs(this.mouseCell.y-pos.y)==1) ||
				   (pos.y%2==0 && this.mouseCell.y==pos.y && Math.abs(this.mouseCell.x-pos.x)==1) )
				{
					this.mouseCell=-1
					if(this.inputData==-1){ this.inputData=(bd.isBorder(id)?0:1);}

					var idlist = [id];
					var bx1, bx2, by1, by2;
					if(bd.border[id].cx%2==1){
						var bx;
						bx = bd.border[id].cx; while(bx>=0        ){ if(bd.QnX(bd.xnum(mf(bx/2)  ,mf(bd.border[id].cy/2)))==1){ bx-=2; break;} bx-=2;} bx1 = bx+2;
						bx = bd.border[id].cx; while(bx<=2*k.qcols){ if(bd.QnX(bd.xnum(mf(bx/2)+1,mf(bd.border[id].cy/2)))==1){ bx+=2; break;} bx+=2;} bx2 = bx-2;
						by1 = by2 = bd.border[id].cy;
					}
					else if(bd.border[id].cy%2==1){
						var by;
						by = bd.border[id].cy; while(by>=0        ){ if(bd.QnX(bd.xnum(mf(bd.border[id].cx/2),mf(by/2)  ))==1){ by-=2; break;} by-=2;} by1 = by+2;
						by = bd.border[id].cy; while(by<=2*k.qrows){ if(bd.QnX(bd.xnum(mf(bd.border[id].cx/2),mf(by/2)+1))==1){ by+=2; break;} by+=2;} by2 = by-2;
						bx1 = bx2 = bd.border[id].cx;
					}
					idlist = [];
					for(var i=bx1;i<=bx2;i+=2){ for(var j=by1;j<=by2;j+=2){ idlist.push(bd.bnum(i,j)); } }

					for(var i=0;i<idlist.length;i++){
						if     (this.inputData==1){ bd.setBorder(idlist[i]);}
						else if(this.inputData==0){ bd.removeBorder(idlist[i]);}
						pc.paintBorder(idlist[i]);
					}
				}
			}
			this.mouseCell = pos;
		};
		mv.inputQuesDirectly = true;

		// キーボード入力系
		kc.keyinput = function(ca){ };
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.BorderQanscolor = "rgb(64, 64, 255)";

		pc.crosssize = 0.15;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawSheepWolf(x1,y1,x2,y2);
			this.drawCrossMarks(x1,y1,x2+1,y2+1);

			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};

		// numobj:？表示用 numobj2:画像表示用
		pc.drawSheepWolf = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cell[c];
				if(bd.cell[c].ques===0){
					this.hideEL(obj.numobj);
					this.hideEL(obj.numobj2);
				}
				else if(bd.cell[c].ques===-2){
					if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}
					this.dispnum(obj.numobj, 1, "?", 0.8, this.fontcolor, obj.px, obj.py);

					this.hideEL(obj.numobj2);
				}
				else{
					this.hideEL(obj.numobj);

					if(!obj.numobj2){
						var _img  = ee.newELx('img').unselectable().el;
						_img.src = './src/img/shwolf_obj.gif';

						var _sdiv = ee.newELx('div').unselectable().el;
						_sdiv.style.position = 'relative';
						_sdiv.style.display = 'inline';
						_sdiv.appendChild(_img);

						obj.numobj2 = this.CreateDOMAndSetNop();
						obj.numobj2.appendChild(_sdiv);
						obj.imgobj  = _img; // 勝手に追加しちゃいます悪影響はないと思いますごめんなさい＞＜
					}
					div = obj.numobj2;
					img = obj.imgobj;

					var ipos = {41:0,42:1}[bd.QuC(c)];
					img.style.width  = ""+(2*k.cwidth)+"px";
					img.style.height = ""+(k.cheight)+"px";
					img.style.left   = "-"+mf((ipos+0.5)*k.cwidth)+"px";
					img.style.top    = ""+mf((!k.br.Opera?0:15)-k.cwidth/2)+"px";
					img.style.clip   = "rect(1px,"+(k.cwidth*(ipos+1))+"px,"+k.cwidth+"px,"+(k.cwidth*ipos+1)+"px)";
					img.style.position = 'absolute';

					this.showEL(div);
					var wid = div.clientWidth, hgt = div.clientHeight;
					div.style.left = k.cv_oft.x+bd.cell[c].px+mf((k.cwidth-wid) /2)+2;
					div.style.top  = k.cv_oft.y+bd.cell[c].py+mf((k.cheight-hgt)/2)+1;
				}
			}
			this.vinc();
		};
		pc.isdispnumCell = f_true;
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeCrossMark(bstr);
				bstr = this.decodeCircle(bstr);
			}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeCrossMark()+this.encodeCircle();
		};

		enc.decodeCircle = function(bstr){
			var pos = bstr?Math.min(mf((k.qcols*k.qrows+2)/3), bstr.length):0;
			for(var i=0;i<pos;i++){
				var ca = parseInt(bstr.charAt(i),27);
				for(var w=0;w<3;w++){
					if(i*3+w<k.qcols*k.qrows){
						if     (mf(ca/Math.pow(3,2-w))%3==1){ bd.sQuC(i*3+w,41);}
						else if(mf(ca/Math.pow(3,2-w))%3==2){ bd.sQuC(i*3+w,42);}
					}
				}
			}

			return bstr.substr(pos);
		};
		enc.encodeCircle = function(){
			var cm = "", num = 0, pass = 0;
			for(var i=0;i<bd.cellmax;i++){
				if     (bd.QuC(i)==41){ pass+=(  Math.pow(3,2-num));}
				else if(bd.QuC(i)==42){ pass+=(2*Math.pow(3,2-num));}
				num++; if(num==3){ cm += pass.toString(27); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(27);}

			return cm;
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(3,0) ){
				this.setAlert('分岐している線があります。','There is a branched line.'); return false;
			}
			if( !this.checkLcntCross(4,1) ){
				this.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
			}
			if( !this.checkLcntCurve() ){
				this.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
			}

			if( !this.checkLineChassis() ){
				this.setAlert('外枠につながっていない線があります。','A line doesn\'t connect to the chassis.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkNoObjectInRoom(rinfo, function(c){ return (bd.QuC(c)!=0?bd.QuC(c):-1);}) ){
				this.setAlert('ヤギもオオカミもいない領域があります。','An area has neither sheeps nor wolves.'); return false;
			}

			if( !this.checkSameObjectInRoom(rinfo, function(c){ return (bd.QuC(c)!=0?bd.QuC(c):-1);}) ){
				this.setAlert('ヤギとオオカミが両方いる領域があります。','An area has both sheeps and wolves.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkLcntCross(1,0);};

		ans.checkLcntCurve = function(){
			for(var i=0;i<(k.qcols-1)*(k.qrows-1);i++){
				var cx = i%(k.qcols-1)+1, cy = mf(i/(k.qcols-1))+1, xc = bd.xnum(cx,cy);
				if(area.lcntCross(xc)==2 && bd.QnX(xc)!=1){
					if(    !(bd.QaB(bd.bnum(cx*2  ,cy*2-1))==1 && bd.QaB(bd.bnum(cx*2  ,cy*2+1))==1)
						&& !(bd.QaB(bd.bnum(cx*2-1,cy*2  ))==1 && bd.QaB(bd.bnum(cx*2+1,cy*2  ))==1) )
					{
						this.setCrossBorderError(cx,cy);
						return false;
					}
				}
			}
			return true;
		};

		ans.checkLineChassis = function(){
			var lines = [];
			for(var id=0;id<bd.bdmax;id++){ lines[id]=bd.QaB(id);}
			for(var bx=0;bx<=2*k.qcols;bx+=2){
				for(var by=0;by<=2*k.qrows;by+=2){
					if((bx==0||bx==2*k.qcols)^(by==0||by==2*k.qrows)){
						if     (by==0)        { this.cl0(lines,bx,by,2);}
						else if(by==2*k.qrows){ this.cl0(lines,bx,by,1);}
						else if(bx==0)        { this.cl0(lines,bx,by,4);}
						else if(bx==2*k.qcols){ this.cl0(lines,bx,by,3);}
					}
				}
			}
			for(var id=0;id<bd.bdmax;id++){
				if(lines[id]==1){
					var errborder = [];
					for(var i=0;i<bd.bdmax;i++){ if(lines[i]==1){ errborder.push(i);} }
					bd.sErBAll(2);
					bd.sErB(errborder,1);
					return false;
				}
			}

			return true;
		};
		ans.cl0 = function(lines,bx,by,dir){
			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if((bx+by)%2==0){
					if(bd.QnX(bd.xnum(mf(bx/2),mf(by/2)))==1){
						if(bd.QaB(bd.bnum(bx,by-1))==1){ this.cl0(lines,bx,by,1);}
						if(bd.QaB(bd.bnum(bx,by+1))==1){ this.cl0(lines,bx,by,2);}
						if(bd.QaB(bd.bnum(bx-1,by))==1){ this.cl0(lines,bx,by,3);}
						if(bd.QaB(bd.bnum(bx+1,by))==1){ this.cl0(lines,bx,by,4);}
						break;
					}
				}
				else{
					var id = bd.bnum(bx,by);
					if(id==-1 || lines[id]==0){ break;}
					lines[id]=0;
				}
			}
		};
	}
};
