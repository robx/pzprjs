//
// パズル固有スクリプト部 へびいちご版 snakes.js v3.3.1
//
Puzzles.snakes = function(){ };
Puzzles.snakes.prototype = {
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
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = true;	// 0を表示するかどうか
		k.isDispHatena    = false;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = true;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		if(k.EDITOR){
			base.setExpression("　矢印は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input Arrows, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左クリックで黒マスが、右クリックでへびのいないマスが入力できます。キーボードでは、Qキーで補助記号が打てます。",
							   " Left Click or Press Keys to input numbers, Right Click to input determined snake not existing cells. Q Key to input auxiliary mark.");
		}
		base.setTitle("へびいちご","Hebi-Ichigo");
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();

		pp.addCheck('snakebd','setting',false,'へび境界線有効','Enable snake border');
		pp.setLabel('snakebd', 'へびの周りに境界線を表示する', 'Draw border around a snake.');
		pp.funcs['snakebd'] = function(){ pc.paintAll();};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputdirec();
			else if(k.playmode){
				if(!this.inputDot_snakes()){
					this.dragnumber_snakes();
				}
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				this.inputqnum_snakes();
			}
		};
		mv.mousemove = function(){
			if(k.editmode && this.notInputted()) this.inputdirec();
			else if(k.playmode){
				if(!this.inputDot_snakes()){
					this.dragnumber_snakes();
				}
			}
		};

		mv.dragnumber_snakes = function(){
			var cc = this.cellid();
			if(cc===null||cc===this.mouseCell){ return;}
			if(this.mouseCell===null){
				this.inputData = bd.AnC(cc)!==-1?bd.AnC(cc):10;
				this.mouseCell = cc;
			}
			else if(bd.QnC(cc)==-1 && this.inputData>=1 && this.inputData<=5){
				if     (this.btn.Left ) this.inputData++;
				else if(this.btn.Right) this.inputData--;
				if(this.inputData>=1 && this.inputData<=5){
					bd.sDiC(cc, 0);
					bd.sAnC(cc, this.inputData); bd.sQsC(cc,0);
					this.mouseCell = cc;
					pc.paintCell(cc);
				}
			}
			else if(bd.QnC(cc)==-1 && this.inputData==10){
				bd.sAnC(cc, -1); bd.sQsC(cc,0);
				pc.paintCell(cc);
			}
		};
		mv.inputDot_snakes = function(){
			if(!this.btn.Right || (this.inputData!==null && this.inputData>=0)){ return false;}

			var cc = this.cellid();
			if(cc===null||cc===this.mouseCell){ return (this.inputData<0);}

			if(this.inputData===null){
				if(bd.AnC(cc)===-1){
					this.inputData = (bd.QsC(cc)!==1?-2:-3);
					return true;
				}
				return false;
			}

			bd.sAnC(cc,-1);
			bd.sQsC(cc,(this.inputData===-2?1:0));
			pc.paintCell(cc);
			this.mouseCell = cc;
			return true;
		};
		mv.inputqnum_snakes = function(){
			k.dispzero = k.editmode;
			this.mouseCell=null;
			this.enableInputHatena = k.editmode;
			this.inputqnum();
			k.dispzero = true;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.editmode && this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}

			if(k.playmode && (ca==='q'||ca==='-')){ ca='s1';}
			this.key_inputqnum(ca);
		};

		bd.maxnum = 5;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.dotcolor = pc.dotcolor_PINK;
		pc.fontcolor = pc.fontErrcolor = "white";
		pc.setCellColorFunc('qnum');

		pc.paint = function(x1,y1,x2,y2){
			x1--; y1--; x2++; y2++;	// 跡が残ってしまう為

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDotCells(x1,y1,x2,y2,true);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawBlackCells(x1,y1,x2,y2);
			this.drawArrowNumbers(x1-2,y1-2,x2+2,y2+2);
			this.drawAnswerNumbers(x1-2,y1-2,x2+2,y2+2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawCursor(x1,y1,x2,y2);
		};

		pc.setBorderColor = function(id){
			if(!pp.getVal('snakebd')){ return false;}

			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cc1!==null && cc2!==null &&
			   (bd.cell[cc1].qnum===-1 && bd.cell[cc2].qnum===-1) &&
			   (bd.cell[cc1].anum!==-1 || bd.cell[cc2].anum!==-1) &&
			   ( ((bd.cell[cc1].anum===-1)^(bd.cell[cc2].anum===-1)) ||
				 (Math.abs(bd.cell[cc1].anum-bd.cell[cc2].anum)!==1)) )
			{
				g.fillStyle = this.borderQanscolor;
				return true;
			}
			return false;
		};

		pc.drawAnswerNumbers = function(x1,y1,x2,y2){
			this.vinc('cell_number', 'auto');

			var clist = bd.cellinside(x1-1,y1-1,x2+1,y2+1);
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cell[c], key='cell_'+c;
				if(obj.qnum===-1 && obj.anum>0){
					this.dispnum(key, 1, ""+obj.anum, 0.8, this.fontAnscolor, obj.cpx, obj.cpy);
				}
				/* 不要な文字はdrawArrowNumbersで消しているので、ここでは消さない */
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeArrowNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeArrowNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellDirecQnum();
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeCellDirecQnum();
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var sinfo = this.getSnakeInfo();
			if( !this.checkAllArea(sinfo, f_true, function(w,h,a,n){ return (a==5);} ) ){
				this.setAlert('大きさが５ではない蛇がいます。','The size of a snake is not five.'); return false;
			}

			if( !this.checkDifferentNumberInRoom(sinfo, bd.AnC) ){
				this.setAlert('同じ数字が入っています。','A Snake has same plural marks.'); return false;
			}

			if( !this.checkSideCell2(sinfo) ){
				this.setAlert('別々の蛇が接しています。','Other snakes are adjacent.'); return false;
			}

			if( !this.checkArrowNumber() ){
				this.setAlert('矢印の方向にある数字が正しくありません。','The number in the direction of the arrow is not correct.'); return false;
			}

			if( !this.checkSnakesView(sinfo) ){
				this.setAlert('蛇の視線の先に別の蛇がいます。','A snake can see another snake.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.getSnakeInfo = function(){
			var sinfo = new AreaInfo();
			var func = function(c,cc){ return (cc!==null && (Math.abs(bd.AnC(c)-bd.AnC(cc))===1)); };
			for(var c=0;c<bd.cellmax;c++){ sinfo.id[c]=(bd.AnC(c)>0?0:-1);}
			for(var c=0;c<bd.cellmax;c++){
				if(sinfo.id[c]!=0){ continue;}
				sinfo.max++;
				sinfo.room[sinfo.max] = {idlist:[]};
				this.ss0(func, sinfo, c, sinfo.max);
			}
			return sinfo;
		};
		ans.ss0 = function(func, sinfo, c, areaid){
			if(sinfo.id[c]!=0){ return;}
			sinfo.id[c] = areaid;
			sinfo.room[areaid].idlist.push(c);
			if( func(c, bd.up(c)) ){ this.ss0(func, sinfo, bd.up(c), areaid);}
			if( func(c, bd.dn(c)) ){ this.ss0(func, sinfo, bd.dn(c), areaid);}
			if( func(c, bd.lt(c)) ){ this.ss0(func, sinfo, bd.lt(c), areaid);}
			if( func(c, bd.rt(c)) ){ this.ss0(func, sinfo, bd.rt(c), areaid);}
			return;
		};

		ans.checkSideCell2 = function(sinfo){
			var result = true;
			var func = function(sinfo,c1,c2){ return (sinfo.id[c1]>0 && sinfo.id[c2]>0 && sinfo.id[c1]!=sinfo.id[c2]);};
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].bx<bd.maxbx-2 && func(sinfo,c,c+1)){
					if(this.inAutoCheck){ return false;}
					bd.sErC(sinfo.room[sinfo.id[c]].idlist,1);
					bd.sErC(sinfo.room[sinfo.id[c+1]].idlist,1);
					result = false;
				}
				if(bd.cell[c].by<bd.maxby-2 && func(sinfo,c,c+k.qcols)){
					if(this.inAutoCheck){ return false;}
					bd.sErC(sinfo.room[sinfo.id[c]].idlist,1);
					bd.sErC(sinfo.room[sinfo.id[c+k.qcols]].idlist,1);
					result = false;
				}
			}
			return result;
		};

		ans.checkArrowNumber = function(){
			var result = true;
			var gonext = function(){
				// bx,by,clist,ccは319行目で宣言されてるものと同一です。
				cc = bd.cnum(bx,by);
				if(cc!==null){ clist.push(cc);}
				return (cc!==null && bd.cell[cc].qnum===-1 && bd.cell[cc].anum===-1);
			};
			var noans = function(cc){ return (cc===null || bd.cell[cc].qnum!==-1 || bd.cell[cc].anum===-1);}

			for(var c=0;c<bd.cellmax;c++){
				var num=bd.QnC(c), dir=bd.DiC(c);
				if(num<0 || dir===0){ continue;}

				var bx=bd.cell[c].bx, by=bd.cell[c].by, clist=[c], cc;
				switch(dir){
					case k.UP: by-=2; while(gonext()){ by-=2;} break;
					case k.DN: by+=2; while(gonext()){ by+=2;} break;
					case k.LT: bx-=2; while(gonext()){ bx-=2;} break;
					case k.RT: bx+=2; while(gonext()){ bx+=2;} break;
				}
				// ccは数字のあるマスのIDか、null(盤面外)を指す

				// 矢印つき数字が0で、その先に回答の数字がある
				if(num===0 && !noans(cc)){
					if(this.inAutoCheck){ return false;}
					if(num>0){ bd.sErC(clist,1);}
					else{ bd.sErC([c,cc],1);}
					result = false;
				}
				// 矢印つき数字が1以上で、その先に回答の数字がない or 回答の数字が違う
				else if(num>0 && (noans(cc) || bd.cell[cc].anum!==num)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c,cc],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkSnakesView = function(sinfo){
			var result = true;
			var gonext = function(){
				// bx,by,clist,ccは366行目で宣言されてるものと同一です。
				cc = bd.cnum(bx,by);
				if(cc!==null){ clist.push(cc);}
				return (cc!==null && bd.cell[cc].qnum===-1 && bd.cell[cc].anum===-1);
			};

			for(var r=1;r<=sinfo.max;r++){
				var idlist=sinfo.room[r].idlist, c1=null, dir=k.NONE, c2;

				for(var i=0;i<idlist.length;i++){ if(bd.AnC(idlist[i])===1){ c1=idlist[i]; break;}}
				if(c1===null){ continue;}

				c2=bd.dn(c1); if(c2!==null && bd.AnC(c2)===2){ dir=k.UP;}
				c2=bd.up(c1); if(c2!==null && bd.AnC(c2)===2){ dir=k.DN;}
				c2=bd.rt(c1); if(c2!==null && bd.AnC(c2)===2){ dir=k.LT;}
				c2=bd.lt(c1); if(c2!==null && bd.AnC(c2)===2){ dir=k.RT;}
				if(dir===k.NONE){ continue;}

				var bx = bd.cell[c1].bx, by = bd.cell[c1].by, clist=[c1], cc;
				switch(dir){
					case k.UP: by-=2; while(gonext()){ by-=2;} break;
					case k.DN: by+=2; while(gonext()){ by+=2;} break;
					case k.LT: bx-=2; while(gonext()){ bx-=2;} break;
					case k.RT: bx+=2; while(gonext()){ bx+=2;} break;
				}
				// ccは数字のあるマスのIDか、null(盤面外)を指す

				var sid=sinfo.id[cc];
				if(cc!==null && bd.AnC(cc)>0 && bd.QnC(cc)===-1 && sid>0 && r!=sid){
					if(this.inAutoCheck){ return false;}
					bd.sErC(clist,1);
					bd.sErC(idlist,1);
					bd.sErC(sinfo.room[sid].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
