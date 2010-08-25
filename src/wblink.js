//
// パズル固有スクリプト部 シロクロリンク版 wblink.js v3.3.2
//
Puzzles.wblink = function(){ };
Puzzles.wblink.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.isCenterLine    = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.numberAsObject  = true;

		k.ispzprv3ONLY    = true;

		k.bdmargin       = 0.50;
		k.bdmargin_image = 0.10;

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
			if(k.editmode) this.inputqnum();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		mv.inputLine = function(){
			if(this.inputData==2){ return;}
			var pos = this.borderpos(0);
			if(this.prevPos.equals(pos)){ return;}

			var id = this.getnb(this.prevPos, pos);
			if(id!==null){
				var dir = this.getdir(this.prevPos, pos);
				var d = this.getrange(id);
				var idlist = new IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));

				if(this.inputData===null){ this.inputData=(bd.isLine(id)?0:1);}
				for(var i=0;i<idlist.data.length;i++){
					if(this.inputData==1){ bd.setLine(idlist.data[i]);}
					else                 { bd.removeLine(idlist.data[i]);}
				}
				this.inputData=2;

				pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
			}
			this.prevPos = pos;
		};

		mv.getrange = function(id){
			var bx=bd.border[id].bx, by=bd.border[id].by;
			var d = {x1:bx, x2:bx, y1:by, y2:by};
			if(bd.border[id].bx&1){
				while(d.y1>bd.minby && bd.noNum(bd.cnum(bx,d.y1-1))){d.y1-=2;}
				while(d.y2<bd.maxby && bd.noNum(bd.cnum(bx,d.y2+1))){d.y2+=2;}
			}
			else if(bd.border[id].by&1){
				while(d.x1>bd.minbx && bd.noNum(bd.cnum(d.x1-1,by))){d.x1-=2;}
				while(d.x2<bd.maxbx && bd.noNum(bd.cnum(d.x2+1,by))){d.x2+=2;}
			}
			return d;
		};

		mv.inputpeke = function(){
			var pos = this.borderpos(0.22);
			var id = bd.bnum(pos.x, pos.y);
			if(id===null || this.prevPos.equals(pos)){ return;}

			if(this.inputData===null){ this.inputData=(bd.QsB(id)!=2?2:0);}
			bd.sQsB(id, this.inputData);

			var d = this.getrange(id);
			var idlist = new IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));
			for(var i=0;i<idlist.data.length;i++){ bd.sLiB(idlist.data[i], 0);}
			this.prevPos = pos;

			pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		},

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputcircle(ca);
		};
		kc.key_inputcircle = function(ca){
			if(k.playmode){ return false;}

			var cc = tc.getTCC();
			var flag = false;

			if     (ca=='1'){ bd.sQnC(cc,(bd.QnC(cc)!==1?1:-1)); flag = true;}
			else if(ca=='2'){ bd.sQnC(cc,(bd.QnC(cc)!==2?2:-1)); flag = true;}
			else if(ca=='-'){ bd.sQnC(cc,(bd.QnC(cc)!==-2?-2:-1)); flag = true;}
			else if(ca=='3'||ca==" "){ bd.sQnC(cc,-1); flag = true;}

			if(flag){ pc.paintCell(cc);}
			return flag;
		};

		bd.maxnum = 2;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_THIN;
		pc.errbcolor1 = "white";
		pc.circleratio = [0.35, 0.30];

		// 線の太さを通常より少し太くする
		pc.lwratio = 8;

		pc.paint = function(){
			this.drawGrid(false, (k.editmode && !this.fillTextPrecisely));

			this.drawPekes(0);
			this.drawLines();

			this.drawQnumCircles();
			this.drawHatenas();

			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCircle();
		};
		enc.pzlexport = function(type){
			this.encodeCircle();
		};

		//---------------------------------------------------------
		fio.decodeData = function(array){
			this.decodeCellQnum();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
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
			if( !this.checkTripleNumber(linfo) ){
				this.setAlert('3つ以上の○が繋がっています。','Three or more objects are connected.'); return false;
			}

			if( !this.checkWBcircle(linfo, 1) ){
				this.setAlert('白丸同士が繋がっています。','Two white circles are connected.'); return false;
			}
			if( !this.checkWBcircle(linfo, 2) ){
				this.setAlert('黒丸同士が繋がっています。','Two black circles are connected.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.isNum(c) && line.lcntCell(c)===0);} ) ){
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
				if(bd.QnC(tip1)!==val || bd.QnC(tip2)!==val){ continue;}

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
