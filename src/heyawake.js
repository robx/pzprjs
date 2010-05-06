//
// パズル固有スクリプト部 へやわけ版 heyawake.js v3.3.0
//
Puzzles.heyawake = function(){ };
Puzzles.heyawake.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = true;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = true;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = true;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = true;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = true;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = true;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = true;	// pencilbox/カンペンにあるパズル

		base.setTitle("へやわけ","Heyawake");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(0, 191, 0)");

		enc.pidKanpen = 'heyawake';
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
				if(k.editmode){
					if(!kp.enabled()){ this.inputqnum();}
					else{ kp.display();}
				}
			}
		};
		mv.mousemove = function(){
			if     (k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
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

		bd.nummaxfunc = function(cc){
			var id = area.room.id[cc];
			var d = ans.getSizeOfClist(area.room[id].clist,f_true);
			var m=d.cols, n=d.rows; if(m>n){ var t=m;m=n;n=t;}
			if     (m===1){ return mf((n+1)/2);}
			else if(m===2){ return n;}
			else if(m===3){
				if     (n%4===0){ return (n  )/4*5  ;}
				else if(n%4===1){ return (n-1)/4*5+2;}
				else if(n%4===2){ return (n-2)/4*5+3;}
				else            { return (n+1)/4*5  ;}
			}
			else{
				if(((Math.log(m+1)/Math.log(2))%1===0)&&(m===n)){ return (m*n+m+n)/3;}
				else if((m&1)&&(n&1)){ return mf((m*n+m+n-1)/3);}
				else{ return mf((m*n+m+n-2)/3);}
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

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawBoxBorders(x1,y1,x2,y2,false);

			this.drawTarget(x1,y1,x2,y2);
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
			while(c<bd.cellmax){ rdata[c]=-1; c++;}

			var i=0, inp=this.uri.bstr.split("/");
			for(var c=0;c<bd.cellmax;c++){
				if(rdata[c]>-1){ continue;}

				if(inp[i].match(/(\d+in)?(\d+)x(\d+)$/)){
					if(RegExp.$1.length>0){ bd.sQnC(c, parseInt(RegExp.$1));}
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
				if(bd.QnC(bd.cnum(d.x1,d.y1))>=0){
					barray.push(""+bd.QnC(bd.cnum(d.x1,d.y1))+"in"+d.cols+"x"+d.rows);
				}
				else{ barray.push(""+d.cols+"x"+d.rows);}
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

			if( !this.checkRowsColsPartly(this.isBorderCount, {}, function(cc){ return (bd.QaC(cc)==1);}, false) ){
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
					if(bd.QuB(bd.bnum(bx,by))===1){ count++;}
				}
			}
			else if(d.y1===d.y2){
				by = d.y1;
				for(bx=d.x1+1;bx<=d.x2-1;bx+=2){
					if(bd.QuB(bd.bnum(bx,by))===1){ count++;}
				}
			}

			if(count>=2){ bd.sErC(clist,1); return false;}
			return true;
		};
	}
};
