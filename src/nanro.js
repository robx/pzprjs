//
// パズル固有スクリプト部 ナンロー版 nanro.js v3.3.2
//
Puzzles.nanro = function(){ };
Puzzles.nanro.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.isAnsNumber     = true;
		k.NumberWithMB    = true;
		k.linkNumber      = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setTitle("ナンロー","Nanro");
		base.setExpression("　数字などをクリックして動かすことで、数字を入力することができます。右クリックしてマウスを動かして×を入力することもできます。",
						   " Press Mouse Button on the number and Move to copy the number. It is able to Press Right Mouse Button and Move to input a cross.");
		base.setFloatbgcolor("rgb(64, 64, 64)");

		enc.pidKanpen = 'nanro';
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.dragnumber_nanro();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				this.mouseCell=null;
				this.inputqnum();
			}
		};
		mv.mousemove = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.dragnumber_nanro();
				else if(this.btn.Right) this.inputDot_nanro();
			}
		};
		mv.dragnumber_nanro = function(){
			var cc = this.cellid();
			if(cc===null||cc===this.mouseCell){ return;}
			if(this.mouseCell===null){
				this.inputData = bd.getNum(cc);
				if     (this.inputData===-2){ this.inputData=null;}
				else if(this.inputData===-1){
					if     (bd.QsC(cc)===1){ this.inputData=-2;}
					else if(bd.QsC(cc)===2){ this.inputData=-3;}
				}
				this.mouseCell = cc;
			}
			else if(bd.QnC(cc)===-1){
				bd.setNum(cc,this.inputData);
				this.mouseCell = cc;
				pc.paintCell(cc);
			}
		};
		mv.inputDot_nanro = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell || bd.isNum(cc)){ return;}
			if(this.inputData===null){ this.inputData = (bd.QsC(cc)===2?0:2);}
			if     (this.inputData==2){ bd.sAnC(cc,-1); bd.sQsC(cc,2);}
			else if(this.inputData==0){ bd.sAnC(cc,-1); bd.sQsC(cc,0);}
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_view(ca);
		};
		kc.key_view = function(ca){
			if(k.playmode){
				var cc=tc.getTCC();
				if     (ca==='q'||ca==='a'||ca==='z')          { ca='s1';}
				else if(ca==='w'||ca==='s'||ca==='x')          { ca='s2';}
				else if(ca==='e'||ca==='d'||ca==='c'||ca==='-'){ ca=' '; }
				else if(ca==='1' && bd.AnC(cc)===1)            { ca='s1';}
				else if(ca==='2' && bd.AnC(cc)===2)            { ca='s2';}
			}
			this.key_inputqnum(ca);
		};

		kp.kpgenerate = function(mode){
			if(mode==3){
				this.tdcolor = pc.mbcolor;
				this.inputcol('num','knumq','q','○');
				this.inputcol('num','knumw','w','×');
				this.tdcolor = "black";
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','','','');
				this.insertrow();
			}
			this.inputcol('num','knum1','1','1');
			this.inputcol('num','knum2','2','2');
			this.inputcol('num','knum3','3','3');
			this.inputcol('num','knum4','4','4');
			this.insertrow();
			this.inputcol('num','knum5','5','5');
			this.inputcol('num','knum6','6','6');
			this.inputcol('num','knum7','7','7');
			this.inputcol('num','knum8','8','8');
			this.insertrow();
			this.inputcol('num','knum9','9','9');
			this.inputcol('num','knum0','0','0');
			((mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','','',''));
			((mode==1)?this.inputcol('num','knumc',' ','') :this.inputcol('empty','','',''));
			this.insertrow();
		};
		kp.generate(kp.ORIGINAL, true, true);
		kp.kpinput = function(ca){ kc.keyinput(ca);};

		area.resetArea();
		bd.nummaxfunc = function(cc){ return area.getCntOfRoomByCell(cc);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawMBs();
			this.drawNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawCursor();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeNumber16();
		};

		enc.decodeKanpen = function(){
			fio.decodeAreaRoom();
			fio.decodeCellQnum_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeAreaRoom();
			fio.encodeCellQnum_kanpen();
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

			if( !this.check2x2Block(bd.isNum) ){
				this.setAlert('数字が2x2のかたまりになっています。','There is a 2x2 block of numbers.'); return false;
			}

			if( !this.checkSideAreaCell(rinfo, bd.sameNumber, false) ){
				this.setAlert('同じ数字が境界線を挟んで隣り合っています。','Adjacent blocks have the same number.'); return false;
			}

			var rinfo = this.searchRarea2();
			if( !this.checkErrorFlag(rinfo, 4) ){
				this.setAlert('複数種類の数字が入っているブロックがあります。','A block has two or more kinds of numbers.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, 1) ){
				this.setAlert('入っている数字の数が数字より多いです。','A number is bigger than the size of block.'); return false;
			}

			if( !this.checkOneArea( area.getNumberInfo() ) ){
				this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, 2) ){
				this.setAlert('入っている数字の数が数字より少ないです。','A number is smaller than the size of block.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, 3) ){
				this.setAlert('数字が含まれていないブロックがあります。','A block has no number.'); return false;
			}

			return true;
		};
		//check1st : function(){ return ans.checkOneArea( ans.searchBWarea(function(id){ return (id!=-1 && puz.getNum(id)!=-1); }) );},

		ans.checkErrorFlag = function(rinfo, val){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].error!==val){ continue;}

				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
			return result;
		};

		ans.searchRarea2 = function(){
			var rinfo = area.getRoomInfo();
			for(var id=1,max=rinfo.max;id<=max;id++){
				var room = rinfo.room[id];
				room.error  =  0;		// 後でエラー表示するエラーのフラグ
				room.number = -1;		// そのエリアに入っている数字
				var nums = [];			// キーの数字が入っている数
				var numcnt = 0;			// エリアに入っている数字の種類数
				var emptycell = 0;		// 数字が入っていないセルの数
				var filled = 0;			// エリアに入っている数字
				for(var i=0;i<room.idlist.length;i++){
					var c = room.idlist[i];
					var num = bd.getNum(c);
					if(num==-1){ emptycell++;}
					else if(isNaN(nums[num])){ numcnt++; filled=num; nums[num]=1;}
					else{ nums[num]++;}
				}
				if(numcnt>1)                               { room.error=4;}
				else if(numcnt==0)                         { room.error=3;}
				else if(numcnt==1 && filled < nums[filled]){ room.error=1; room.number=filled;}
				else if(numcnt==1 && filled > nums[filled]){ room.error=2; room.number=filled;}
				else                                       { room.error=-1;room.number=filled;}
			}
			return rinfo;
		};
	}
};
