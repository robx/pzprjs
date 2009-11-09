//
// パズル固有スクリプト部 連番窓口版 renban.js v3.2.2
//
Puzzles.renban = function(){ };
Puzzles.renban.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 6;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 6;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["borderques", "cellqnum", "cellqanssub"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("連番窓口","Renban-Madoguchi");
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		if(k.EDITOR){ kp.defaultdisp = true;}
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.editmode) this.borderinput = this.inputborder(x,y);
			if(k.playmode){
				if(!kp.enabled()){ this.inputqnum(x,y);}
				else{ kp.display(x,y);}
			}
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
			if(k.editmode && this.btn.Left) this.inputborder(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kp.generate(0, true, true, '');
		kp.kpinput = function(ca){ kc.key_inputqnum(ca);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawGrid(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};

		// エラー時に赤く表示したいので上書き
		pc.drawBorder1 = function(id,flag){
			g.fillStyle = this.BorderQuescolor;
			if(bd.ErB(id)===1){ g.fillStyle = this.errcolor1;}
			this.drawBorder1x(bd.border[id].cx,bd.border[id].cy,flag);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeBorder(bstr);
				bstr = this.decodeNumber16(bstr);
			}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeNumber16();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = area.getRoomInfo();
			if( !this.checkDifferentNumber(rinfo) ){
				this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
			}

			if( !this.checkNumbersInRoom(rinfo) ){
				this.setAlert('部屋に入る数字が正しくありません。','The numbers in the room are wrong.'); return false;
			}

			if( !this.checkBorderSideNumber() ){
				this.setAlert('数字の差がその間にある線の長さと等しくありません。','The differnece between two numbers is not equal to the length of the line between them.'); return false;
			}

			if( !this.checkAllCell(bd.noNum) ){
				this.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(bd.noNum);};

		ans.checkDifferentNumber = function(rinfo){
			for(var r=1;r<=rinfo.max;r++){
				var d = [], idlist = rinfo.room[r].idlist;
				for(var i=1;i<=bd.maxnum;i++){ d[i]=-1;}
				for(var i=0,len=idlist.length;i<len;i++){
					var val=bd.getNum(idlist[i]);
					if     (val===-1 || val===-2){ continue;}
					else if(d[val]===-1){ d[val] = idlist[i]; continue;}

					bd.sErC(idlist,1);
					return false;
				}
			}
			return true;
		};
		ans.checkNumbersInRoom = function(rinfo){
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
					bd.sErC(idlist,1);
					return false;
				}
			}
			return true;
		};

		ans.checkBorderSideNumber = function(){
			// 線の長さを取得する
			var rdata = new AreaInfo();
			for(var i=0;i<bd.bdmax;i++){ rdata.id[i] = (bd.isBorder(i)?0:-1);}
			for(var i=0;i<bd.bdmax;i++){
				if(rdata.id[i]!==0){ continue;}
				var bx=bd.border[i].cx, by=bd.border[i].cy, idlist=[];
				while(1){
					var id = bd.bnum(bx,by);
					if(id===-1 || rdata.id[id]!==0){ break;}

					idlist.push(id);
					if(bx%2===1){ bx+=2;}else{ by+=2;}
				}
				rdata.max++;
				for(var n=0;n<idlist.length;n++){ rdata.id[idlist[n]]=rdata.max;}
				rdata.room[rdata.max] = {idlist:idlist};
			}

			// 実際に差を調査する
			for(var i=0;i<bd.bdmax;i++){
				if(rdata.id[i]===-1){ continue;}
				var cc1=bd.cc1(i), cc2=bd.cc2(i);	// cc1もcc2も-1にはならない
				var val1=bd.getNum(cc1), val2=bd.getNum(cc2);
				if(val1<=0 || val2<=0){ continue;}

				if(Math.abs(val1-val2)!==rdata.room[rdata.id[i]].idlist.length){
					bd.sErC([cc1,cc2],1);
					bd.sErB(rdata.room[rdata.id[i]].idlist,1);
					return false;
				}
			}
			return true;
		};
	}
};
