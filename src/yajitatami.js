//
// パズル固有スクリプト部 ヤジタタミ版 yajitatami.js v3.3.5
//
Puzzles.yajitatami = function(){ };
Puzzles.yajitatami.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				this.checkBorderMode();
				if(this.bordermode){ this.inputborder();}
				else               { this.inputdirec();}
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){ this.inputqnum();}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.bordermode){ this.inputborder();}
				else               { this.inputdirec();}
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(0, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.setBorderColorFunc('qans');

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawQansBorders();
			this.drawQuesBorders();

			this.drawArrowNumbers();

			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		};

		// 問題と回答の境界線を別々に描画するようにします
		pc.drawQansBorders = function(){
			this.vinc('border_answer', 'crispEdges');
			this.bdheader = "b_bdans";
			this.setBorderColor = function(id){ return (bd.border[id].qans===1);};

			g.fillStyle = this.borderQanscolor;
			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
			this.isdrawBD = true;
		};
		pc.drawQuesBorders = function(){
			this.vinc('border_question', 'crispEdges');
			this.bdheader = "b_bdques";
			this.setBorderColor = function(id){ return (bd.border[id].ques===1);};

			g.fillStyle = this.borderQuescolor;
			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
			this.isdrawBD = true;
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeArrowNumber16();
			this.decodeBorder();
		};
		enc.pzlexport = function(type){
			this.encodeArrowNumber16();
			this.encodeBorder_if_exist();
		};

		enc.encodeBorder_if_exist = function(){
			for(var id=0;id<bd.bdmax;id++){
				if(bd.QuB(id)){ this.encodeBorder(); break;}
			}
		};

		// 応急措置でオーバーライド
		enc.decodeArrowNumber16 = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i), obj=bd.cell[c];

				if(this.include(ca,"0","4")){
					var ca1 = bstr.charAt(i+1);
					obj.qdir = parseInt(ca,16);
					obj.qnum = (ca1!="." ? parseInt(ca1,16) : -2);
					i++;
				}
				else if(this.include(ca,"5","9")){
					obj.qdir = parseInt(ca,16)-5;
					obj.qnum = parseInt(bstr.substr(i+1,2),16);
					i+=2;
				}
				else if(ca>='a' && ca<='z'){ c+=(parseInt(ca,36)-10);}

				c++;
				if(c >= bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellDirecQnum();
			this.decodeBorderQues();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellDirecQnum();
			this.encodeBorderQues();
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(4,0) ){
				this.setAlert('十字の交差点があります。','There is a crossing border line.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkArrowNumber_border() ){
				this.setAlert('矢印の方向に境界線がありません。','There is no border in front of the arrowed number.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (a>1);} ) ){
				this.setAlert('長さが１マスのタタミがあります。','The length of the tatami is one.'); return false;
			}

			if( !this.checkArrowNumber_tatami() ){
				this.setAlert('矢印の方向にあるたたみの数が正しくありません。','The number of tatamis are not correct.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (n<0||n===a);}) ){
				this.setAlert('数字とタタミの大きさが違います。','The size of the tatami and the number is different.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (w===1||h===1);} ) ){
				this.setAlert('幅が１マスではないタタミがあります。','The width of the tatami is not one.'); return false;
			}

			return true;
		};

		ans.checkArrowNumber_tatami = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isValidNum(c)){ continue;}

				var bx = bd.cell[c].bx, by = bd.cell[c].by, dir = bd.DiC(c);
				var idlist = [];
				if     (dir===k.UP){ idlist = bd.borderinside(bx,bd.minby,bx,by);}
				else if(dir===k.DN){ idlist = bd.borderinside(bx,by,bx,bd.maxby);}
				else if(dir===k.LT){ idlist = bd.borderinside(bd.minbx,by,bx,by);}
				else if(dir===k.RT){ idlist = bd.borderinside(bx,by,bd.maxbx,by);}
				else{ continue;}

				var count = 0;
				for(var i=0;i<idlist.length;i++){
					if(bd.isBorder(idlist[i])){ count++;}
				}

				if(bd.QnC(c)!==count){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};

		ans.checkArrowNumber_border = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isValidNum(c)){ continue;}

				var dir = bd.DiC(c), err = false;
				if     (dir==k.UP && !bd.isBorder(bd.ub(c))){ err=true;}
				else if(dir==k.DN && !bd.isBorder(bd.db(c))){ err=true;}
				else if(dir==k.LT && !bd.isBorder(bd.lb(c))){ err=true;}
				else if(dir==k.RT && !bd.isBorder(bd.rb(c))){ err=true;}

				if(err){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
	}
};
