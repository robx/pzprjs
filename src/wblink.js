//
// パズル固有スクリプト部 シロクロリンク版 wblink.js v3.3.0
//
Puzzles.wblink = function(){ };
Puzzles.wblink.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = true;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		k.bdmargin       = 0.50;	// 枠外の一辺のmargin(セル数換算)
		k.bdmargin_image = 0.10;	// 画像出力時のbdmargin値

		base.setTitle("シロクロリンク","Shirokuro-link");
		base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputQues([0,41,42,-2]);
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		mv.inputLine = function(){
			if(this.inputData==2){ return;}
			var pos = this.borderpos(0);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = -1;
			if     (pos.y-this.mouseCell.y==-2){ id=bd.bnum(this.mouseCell.x  ,this.mouseCell.y-1);}
			else if(pos.y-this.mouseCell.y== 2){ id=bd.bnum(this.mouseCell.x  ,this.mouseCell.y+1);}
			else if(pos.x-this.mouseCell.x==-2){ id=bd.bnum(this.mouseCell.x-1,this.mouseCell.y  );}
			else if(pos.x-this.mouseCell.x== 2){ id=bd.bnum(this.mouseCell.x+1,this.mouseCell.y  );}

			if(this.mouseCell!=-1 && id!=-1){
				var idlist = this.getidlist(id);
				if(this.inputData==-1){ this.inputData=(bd.isLine(id)?0:1);}
				if(this.inputData> 0 && ((pos.x-this.mouseCell.x==-2)||(pos.y-this.mouseCell.y==-2))){ idlist=idlist.reverse();} // 色分けの都合上の処理
				for(var i=0;i<idlist.length;i++){
					if(idlist[i]===-1){ continue;}
					if(this.inputData==1){ bd.setLine(idlist[i]);}
					else                 { bd.removeLine(idlist[i]);}
					pc.paintLine(idlist[i]);
				}
				this.inputData=2;
			}
			this.mouseCell = pos;
		};
		mv.getidlist = function(id){
			var idlist=[], bx=bd.border[id].bx, by=bd.border[id].by;
			if(bd.border[id].bx&1){
				var by1=by, by2=by;
				while(by1>bd.minby && bd.QuC(bd.cnum(bx,by1-1))===0){ by1-=2;}
				while(by2<bd.maxby && bd.QuC(bd.cnum(bx,by2+1))===0){ by2+=2;}
				if(bd.minby<by1 && by2<bd.maxby){
					for(by=by1;by<=by2;by+=2){ idlist.push(bd.bnum(bx,by)); }
				}
			}
			else if(bd.border[id].by&1){
				var bx1=bx, bx2=bx;
				while(bx1>bd.minbx && bd.QuC(bd.cnum(bx1-1,by))===0){ bx1-=2;}
				while(bx2<bd.maxbx && bd.QuC(bd.cnum(bx2+1,by))===0){ bx2+=2;}
				if(bd.minbx<bx1 && bx2<bd.maxbx){
					for(bx=bx1;bx<=bx2;bx+=2){ idlist.push(bd.bnum(bx,by)); }
				}
			}
			return idlist;
		};

		mv.inputpeke = function(){
			var pos = this.borderpos(0.22);
			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 || (pos.x==this.mouseCell.x && pos.y==this.mouseCell.y)){ return;}

			if(this.inputData==-1){ this.inputData=(bd.QsB(id)!=2?2:0);}
			bd.sQsB(id, this.inputData);

			var idlist = this.getidlist(id);
			for(var i=0;i<idlist.length;i++){
				bd.sLiB(idlist[i], 0);
				pc.paintBorder(idlist[i]);
			}
			if(idlist.length==0){ pc.paintBorder(id);}
			this.mouseCell = pos;
		},

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.input41_42(ca);
		};
		kc.input41_42 = function(ca){
			if(k.playmode){ return false;}

			var cc = tc.getTCC();
			var flag = false;

			if     (ca=='1'){ bd.sQuC(cc,(bd.QuC(cc)!=41?41:0)); flag = true;}
			else if(ca=='2'){ bd.sQuC(cc,(bd.QuC(cc)!=42?42:0)); flag = true;}
			else if(ca=='-'){ bd.sQuC(cc,(bd.QuC(cc)!=-2?-2:0)); flag = true;}
			else if(ca=='3'||ca==" "){ bd.sQuC(cc,0); flag = true;}

			if(flag){ pc.paintCell(cc);}
			return flag;
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_THIN;
		pc.errbcolor1 = "white";
		pc.circleratio = [0.35, 0.30];
		pc.chassisflag = false;

		// 線の太さを通常より少し太くする
		pc.lwratio = 8;

		pc.paint = function(x1,y1,x2,y2){
			this.drawGrid(x1,y1,x2,y2,(k.editmode && !this.fillTextPrecisely));

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawCircles41_42(x1-2,y1-2,x2+1,y2+1);
			this.drawQuesHatenas(x1-2,y1-2,x2+1,y2+1);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCircle41_42();
		};
		enc.pzlexport = function(type){
			this.encodeCircle41_42();
		};

		//---------------------------------------------------------
		fio.decodeData = function(array){
			this.decodeCellQues41_42();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellQues41_42();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			var linfo = line.getLareaInfo();
			if( !this.checkAllArea(linfo, function(c){ return (bd.QuC(c)!=0);}, function(w,h,a,n){ return (a<3);}) ){
				this.setAlert('3つ以上の○が繋がっています。','Three or more objects are connected.'); return false;
			}

			if( !this.checkWBcircle(linfo, 41) ){
				this.setAlert('白丸同士が繋がっています。','Two white circles are connected.'); return false;
			}
			if( !this.checkWBcircle(linfo, 42) ){
				this.setAlert('黒丸同士が繋がっています。','Two black circles are connected.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)!=0 && line.lcntCell(c)==0);} ) ){
				this.setAlert('○から線が出ていません。','A circle doesn\'t start any line.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkWBcircle = function(linfo,val){
			var result = true;
			for(var r=1;r<=linfo.max;r++){
				if(linfo.room[r].idlist.length<=1){ continue;}

				var tip1 = linfo.room[r].idlist[0];
				var tip2 = linfo.room[r].idlist[linfo.room[r].idlist.length-1];
				if(bd.QuC(tip1)!==val || bd.QuC(tip2)!==val){ continue;}

				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				ans.setErrLareaById(linfo,r,1);
				bd.sErC([tip1,tip2],1);
				result = false;
			}
			return result;
		};
	}
};
