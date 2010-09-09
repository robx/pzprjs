//
// パズル固有スクリプト部 はこいり○△□版 hakoiri.js v3.3.2
//
Puzzles.hakoiri = function(){ };
Puzzles.hakoiri.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.isAnsNumber     = true;
		k.linkNumber      = true;
		k.numberAsObject  = true;

		base.setTitle("はこいり○△□","Triplets");
		base.setFloatbgcolor("rgb(127, 160, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.inputborder();}
			else if(k.playmode){
				if(this.btn.Left){ this.inputqnum();}
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){
					this.mouseCell=null;
					this.inputqnum();
				}
				else if(k.playmode){
					if(this.btn.Right){ this.inputqnum();}
				}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){ this.inputborder();}
			else if(k.playmode){
				if(this.btn.Right){ this.inputDot();}
			}
		};

		mv.inputDot = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell || bd.QnC(cc)!==-1){ return;}

			if(this.inputData===null){ this.inputData=(bd.QsC(cc)===1?0:1);}

			bd.sAnC(cc,-1);
			bd.sQsC(cc,(this.inputData===1?1:0));
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_hakoiri(ca);
		};
		kc.key_hakoiri = function(ca){
			if     (ca==='1'||ca==='q'||ca==='a'||ca==='z'){ ca='1';}
			else if(ca==='2'||ca==='w'||ca==='s'||ca==='x'){ ca='2';}
			else if(ca==='3'||ca==='e'||ca==='d'||ca==='c'){ ca='3';}
			else if(ca==='4'||ca==='r'||ca==='f'||ca==='v'){ ca='s1';}
			else if(ca==='5'||ca==='t'||ca==='g'||ca==='b'){ ca=' ';}
			this.key_inputqnum(ca);
		};

		kp.kpgenerate = function(mode){
			if(mode==3){ this.tdcolor = pc.fontAnscolor;}
			this.inputcol('num','knum1','1','○');
			this.inputcol('num','knum2','2','△');
			this.inputcol('num','knum3','3','□');
			this.insertrow();
			if(mode==3){ this.tdcolor = "rgb(255, 96, 191)";}
			this.inputcol('num','knum4','4',(mode===1 ? '?' : '・'));
			if(mode==3){ this.tdcolor = "black";}
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('empty','','','');
			this.insertrow();
		};
		kp.generate(kp.ORIGINAL, true, true);
		kp.kpinput = function(ca){ kc.key_hakoiri(ca);};

		bd.maxnum = 3;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.bcolor = pc.bcolor_GREEN;
		pc.bbcolor = "rgb(127, 127, 127)";
		pc.dotcolor = pc.dotcolor_PINK;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawDotCells(true);
			this.drawNumbers();

			this.drawChassis();

			this.drawCursor();
		};

		pc.drawNumber1 = function(c){
			var num = bd.getNum(c), obj = bd.cell[c], key='cell_'+c;
			if(num!==-1){
				var text = (num>0 ? ({1:"○",2:"△",3:"□"})[num] : "?");
				this.dispnum(key, 1, text, 0.8, this.getCellNumberColor(c), obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAroundMarks() ){
				this.setAlert('同じ記号がタテヨコナナメに隣接しています。','Same marks are adjacent.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkAllArea(rinfo, bd.isNum, function(w,h,a,n){ return (a<=3);}) ){
				this.setAlert('1つのハコに4つ以上の記号が入っています。','A box has four or more marks.'); return false;
			}

			if( !this.checkDifferentObjectInRoom(rinfo) ){
				this.setAlert('1つのハコに同じ記号が複数入っています。','A box has same plural marks.'); return false;
			}

			if( !this.checkOneArea( area.getNumberInfo() ) ){
				this.setAlert('タテヨコにつながっていない記号があります。','Marks are devided.'); return false;
			}

			if( !this.checkAllArea(rinfo, bd.isNum, function(w,h,a,n){ return (a>=3);}) ){
				this.setAlert('1つのハコに2つ以下の記号しか入っていません。','A box has tow or less marks.'); return false;
			}

			return true;
		};

		ans.checkDifferentObjectInRoom = function(rinfo){
			result = true;
			for(var r=1;r<=rinfo.max;r++){
				var d = [];
				d[-2]=0; d[1]=0; d[2]=0; d[3]=0;
				for(var i=0;i<rinfo.room[r].idlist.length;i++){
					var val = bd.getNum(rinfo.room[r].idlist[i]);
					if(val==-1){ continue;}

					if(d[val]==0){ d[val]++; continue;}

					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[r].idlist,1);
					result = false;
				}
			}
			return result;
		};
		ans.checkAroundMarks = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				var num = bd.getNum(c);
				if(num<0){ continue;}
				var bx = bd.cell[c].bx, by = bd.cell[c].by, target=0, clist=[c];
				var func = function(cc){ return (cc!==null && num==bd.getNum(cc));};
				// 右・左下・下・右下だけチェック
				target = bd.cnum(bx+2,by  ); if(func(target)){ clist.push(target);}
				target = bd.cnum(bx  ,by+2); if(func(target)){ clist.push(target);}
				target = bd.cnum(bx-2,by+2); if(func(target)){ clist.push(target);}
				target = bd.cnum(bx+2,by+2); if(func(target)){ clist.push(target);}

				if(clist.length>1){
					if(this.inAutoCheck){ return false;}
					bd.sErC(clist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
