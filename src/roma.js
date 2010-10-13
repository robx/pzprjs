//
// パズル固有スクリプト部 ろーま版 roma.js v3.3.3
//
Puzzles.roma = function(){ };
Puzzles.roma.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.isAnsNumber     = true;
		k.numberAsObject  = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(127, 160, 96)");
	},
	menufix : function(){
		pp.addCheck('disproad','setting', false, '通り道のチェック', 'Check Road');
		pp.setLabel('disproad', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('disproad')){ this.dispRoad();}
			else if(k.editmode){
				this.checkBorderMode();
				if(this.bordermode){ this.inputborder();}
				else               { this.inputdirec_toichika();}
			}
			else if(k.playmode){ this.inputdirec_toichika();}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(!(kc.isZ ^ pp.getVal('disproad'))){ this.inputqnum();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.bordermode){ this.inputborder();}
				else               { this.inputdirec_toichika();}
			}
			else if(k.playmode){ this.inputdirec_toichika();}
		};

		// ルーチンが同じなので名称もtoichikaのまま
		mv.inputdirec_toichika = function(){
			var pos = this.borderpos(0);
			if(this.prevPos.equals(pos) && this.inputData===1){ return;}

			var dir = k.NONE, cc = bd.cnum(this.prevPos.x, this.prevPos.y);
			if(cc!==null){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==k.NONE){
					bd.setNum(cc,dir);
					pc.paintCell(cc);
					this.mousereset();
					return;
				}
			}
			this.prevPos = pos;
		};
		mv.dispRoad = function(){
			var cc = this.cellid();
			if(cc===null){ return;}

			var ldata = [];
			for(var c=0;c<bd.cellmax;c++){ ldata[c]=-1;}
			ans.checkBall1(cc,ldata);
			for(var c=0;c<bd.cellmax;c++){
				if     (ldata[c]===1){ bd.sErC([c],2);}
				else if(ldata[c]===2){ bd.sErC([c],3);}
			}
			ans.errDisp = true;
			pc.paintAll();
		},

		// キーボード入力系
		kc.keyinput = function(ca){
			if(!this.isSHIFT && this.moveTCell(ca)){ return;}
			this.key_toichika(ca);
		};
		kc.key_toichika = function(ca){
			if     (ca==='1'||(this.isSHIFT && ca===k.KEYUP)){ ca='1';}
			else if(ca==='2'||(this.isSHIFT && ca===k.KEYRT)){ ca='4';}
			else if(ca==='3'||(this.isSHIFT && ca===k.KEYDN)){ ca='2';}
			else if(ca==='4'||(this.isSHIFT && ca===k.KEYLT)){ ca='3';}
			else if(ca==='q')                                { ca='5';}
			else if(k.editmode && (ca==='5'||ca==='-'))      { ca='s1';}
			else if(ca==='6'||ca===' ')                      { ca=' ';}
			this.key_inputqnum(ca);
		};

		bd.nummaxfunc = function(){ return (k.editmode?5:4);};

		menu.ex.adjustSpecial = function(key,d){
			var trans = {};
			switch(key){
				case this.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case this.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case this.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case this.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val = trans[bd.QnC(c)]; if(!!val){ bd.sQnC(c,val);}
				var val = trans[bd.AnC(c)]; if(!!val){ bd.sAnC(c,val);}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.dotcolor = pc.dotcolor_PINK;
		pc.errbcolor2 = "rgb(255, 224, 192)";
		pc.errbcolor3 = "rgb(192, 192, 255)";

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawArrows();
			this.drawGoals();
			this.drawHatenas();

			this.drawChassis();

			this.drawCursor();
		};

		pc.setBGCellColor = function(c){
			var cell = bd.cell[c];
			if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
			else if(cell.error===2){ g.fillStyle = this.errbcolor2; return true;}
			else if(cell.error===3){ g.fillStyle = this.errbcolor3; return true;}
			return false;
		};

		pc.drawArrows = function(){
			this.vinc('cell_arrow', 'auto');

			var headers = ["c_arup_", "c_ardn_", "c_arlt_", "c_arrt_"];
			var ll = this.cw*0.8;				//LineLength
			var lw = Math.max(this.cw/18, 2);	//LineWidth
			var al = ll*0.5, aw = lw*0.5;	// ArrowLength, ArrowWidth
			var tl = ll*0.5-ll*0.3;			// 矢じりの長さの座標(中心-長さ)
			var tw = Math.max(ll*0.2, 5);	// 矢じりの幅

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], dir=bd.getNum(c);
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
				if(dir>=1 && dir<=4){
					g.fillStyle = (bd.cell[c].qnum!==-1?this.fontcolor:this.fontAnscolor);

					// 矢印の描画 ここに来る場合、dirは1～4
					if(this.vnop(headers[(dir-1)]+c,this.FILL)){
						var ax=px=bd.cell[c].cpx;
						var ay=py=bd.cell[c].cpy;
						switch(dir){
							case k.UP: g.setOffsetLinePath(ax,ay, 0,-al, -tw,-tl, -aw,-tl, -aw, al,  aw, al, aw,-tl,  tw,-tl, true); break;
							case k.DN: g.setOffsetLinePath(ax,ay, 0, al, -tw, tl, -aw, tl, -aw,-al,  aw,-al, aw, tl,  tw, tl, true); break;
							case k.LT: g.setOffsetLinePath(ax,ay, -al,0, -tl,-tw, -tl,-aw,  al,-aw,  al, aw, -tl,aw, -tl, tw, true); break;
							case k.RT: g.setOffsetLinePath(ax,ay,  al,0,  tl,-tw,  tl,-aw, -al,-aw, -al, aw,  tl,aw,  tl, tw, true); break;
						}
						g.fill();
					}
				}
			}
		};

		pc.drawGoals = function(){
			this.vinc('cell_circle', 'auto');

			var rsize = this.cw*this.circleratio[0];
			var header = "c_cir_";
			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum===5){
					g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
					if(this.vnop(header+c,this.FILL)){
						g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
					}
				}
				else{ this.vhide(header+c);}
			}
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

			if( !this.checkDifferentNumberInRoom(area.getRoomInfo(), function(c){ var num=bd.getNum(c); return ((num>=1&&num<=4)?num:-1);}) ){
				this.setAlert('1つの領域に2つ以上の同じ矢印が入っています。','An area has plural same arrows.'); return false;
			}

			if( !this.checkBalls() ){
				this.setAlert('ゴールにたどり着かないセルがあります。','A cell cannot reach a goal.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;}

		ans.checkBalls = function(){
			var ldata = [];
			for(var c=0;c<bd.cellmax;c++){ ldata[c]=(bd.getNum(c)===5?2:-1);}
			for(var c=0;c<bd.cellmax;c++){
				if(ldata[c]!==-1){ continue;}
				if(!this.checkBall1(c,ldata) && this.inAutoCheck){ return false;}
			}

			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(ldata[c]===1){ bd.sErC([c],1); result=false;}
			}
			return result;
		};
		ans.checkBall1 = function(startcc, ldata){
			var bx=bd.cell[startcc].bx, by=bd.cell[startcc].by;
			var dir=bd.getNum(startcc), cc=startcc, result=(dir===5);
			ldata[cc]=0;

			while(dir>=1 && dir<=4){
				switch(dir){ case 1: by-=2; break; case 2: by+=2; break; case 3: bx-=2; break; case 4: bx+=2; break;}
				cc = bd.cnum(bx,by);
				if(cc===null){ break;}
				if(ldata[cc]!==-1){ result=(ldata[cc]===2); break;}

				ldata[cc]=0;

				dir=bd.getNum(cc);
				if(dir===5){ result=true;}
			}
			ans.cb0(startcc, ldata);

			for(var c=0;c<bd.cellmax;c++){
				if(ldata[c]===0){ ldata[c] = (result?2:1)}
			}
			return result;
		};
		ans.cb0 = function(c, ldata){
			ldata[c]=0;
			var tc, dir=bd.getNum(c);
			tc=bd.up(c); if( dir!==1 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===2 ){ this.cb0(tc,ldata);}
			tc=bd.dn(c); if( dir!==2 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===1 ){ this.cb0(tc,ldata);}
			tc=bd.lt(c); if( dir!==3 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===4 ){ this.cb0(tc,ldata);}
			tc=bd.rt(c); if( dir!==4 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===3 ){ this.cb0(tc,ldata);}
		};
	}
};
