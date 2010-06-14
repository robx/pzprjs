//
// パズル固有スクリプト部 ひとりにしてくれ�?hitori.js v3.3.1
//
Puzzles.hitori = function(){ };
Puzzles.hitori.prototype = {
	setting : function(){
		// グローバル変数の初期設�?		if(!k.qcols){ k.qcols = 8;}	// 盤面の横�?		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦�?		k.irowake  = 0;		// 0:色�?��設定無�?1:色�?��しな�?2:色�?��する

		k.iscross  = 0;		// 1:盤面�??のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 0;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上�?左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を�?�る線を回答として入力するパズル
		k.isborderAsLine  = false;	// �?��線をlineとして扱�?		k.hasroom         = false;	// �?��つか�?領域に�?��れて�?��/�?��るパズル
		k.roomNumber      = false;	// 部屋�?問題�?数字が1つ�?け�?るパズル

		k.dispzero        = false;	// 0を表示するかど�?��
		k.isDispHatena    = false;	// qnum�?2のときに?�を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答�?数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = true;	// 黒�?スを�?力するパズル
		k.NumberIsWhite   = false;	// 数字�?あるマスが黒�?スにならな�?��ズル
		k.RBBlackCell     = true;	// 連黒�?断禁�?パズル
		k.checkBlackCell  = false;	// 正答判定で黒�?スの�??�をチェ�?��するパズル
		k.checkWhiteCell  = true;	// 正答判定で白マスの�??�をチェ�?��するパズル

		k.ispzprv3ONLY    = true;	// ぱず�?れアプレ�?��には存在しな�?��ズル
		k.isKanpenExist   = true;	// pencilbox/カンペンにあるパズル

		base.setTitle("ひとりにしてくれ","Hitori");
		base.setExpression("�?左クリ�?��で黒�?スが�?�右クリ�?��で白マス確定�?スが�?力できます�??,
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(0, 224, 0)");

		enc.pidKanpen = 'hitori';
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockRBToFlags();

		pp.addCheck('plred','setting',false, '重�?��字を表示', 'Show overlapped number');
		pp.setLabel('plred', '重�?��て�?��数字を赤くす�?, 'Show overlapped number as red.');
		pp.funcs['plred'] = function(){ pc.paintAll();};
	},

	//---------------------------------------------------------
	//入力系関数オーバ�?ライ�?	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
			else if(k.editmode) this.inputqnum();
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
		};

		// キーボ�?ド�?力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		bd.nummaxfunc = function(cc){ return Math.max(k.qcols,k.qrows);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバ�?ライ�?	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.bcolor = pc.bcolor_GREEN;
		pc.fontErrcolor = "red";
		pc.fontBCellcolor = "rgb(96,96,96)";
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers_hitori(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawNumbers_hitori = function(x1,y1,x2,y2){
			if(!pp.getVal('plred') || ans.errDisp){
				this.drawNumbers(x1,y1,x2,y2);
			}
			else{
				ans.inCheck = true;
				ans.checkRowsCols(ans.isDifferentNumberInClist_hitori, bd.QnC);
				ans.inCheck = false;

				this.drawNumbers(bd.minbx, bd.minby, bd.maxbx, bd.maxby);

				ans.errDisp = true;
				bd.errclear(false);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコー�?�?��ード�?�?	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeHitori();
		};
		enc.pzlexport = function(type){
			this.encodeHitori();
		};

		enc.decodeHitori = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(this.include(ca,"0","9")||this.include(ca,"a","z"))
								 { bd.cell[c].qnum = parseInt(ca,36);}
				else if(ca==='-'){ bd.cell[c].qnum = parseInt(bstr.substr(i+1,2),36); i+=2;}
				else if(ca==='%'){ bd.cell[c].qnum = -2;}

				c++;
				if(c > bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i);
		};
		enc.encodeHitori = function(){
			var count=0, cm="";
			for(var c=0;c<bd.cellmax;c++){
				var pstr = "", qn= bd.cell[c].qnum;

				if     (qn===-2)       { pstr = "%";}
				else if(qn>= 0&&qn< 16){ pstr =       qn.toString(36);}
				else if(qn>=16&&qn<256){ pstr = "-" + qn.toString(36);}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else{ cm+="."; count=0;}
			}
			if(count>0){ cm+=".";}

			this.outbstr += cm;
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen_hitori();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnum_kanpen_hitori();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellAns();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen_hitori();
			this.decodeCellAns();
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen_hitori();
			this.encodeCellAns();
		};

		fio.decodeCellQnum_kanpen_hitori = function(){
			this.decodeCell( function(obj,ca){
				if(ca!=="0"){ obj.qnum = parseInt(ca);}
			});
		};
		fio.encodeCellQnum_kanpen_hitori = function(){
			this.encodeCell( function(obj){
				return ((obj.qnum>0)?(obj.qnum.toString() + " "):"0 ");
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定�?�?��行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
				this.setAlert('黒�?スがタ�?��コに連続して�?��す�??,'Black cells are adjacent.'); return false;
			}

			if( !this.checkOneArea( area.getWCellInfo() ) ){
				this.setAlert('白マスが�?断されて�?��す�??,'White cells are devided.'); return false;
			}

			if( !this.checkRowsCols(this.isDifferentNumberInClist_hitori, bd.QnC) ){
				this.setAlert('同じ列に同じ数字が入って�?��す�??,'There are same numbers in a row.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.isDifferentNumberInClist_hitori = function(clist_all, numfunc){
			var clist = [];
			for(var i=0;i<clist_all.length;i++){
				var c = clist_all[i];
				if(bd.isWhite(c) && numfunc.call(bd,c)!==-1){ clist.push(c);}
			}
			return this.isDifferentNumberInClist(clist, numfunc);
		};
	}
};
