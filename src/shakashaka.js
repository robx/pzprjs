//
// パズル固有スクリプト部 シャカシャカ版 shakashaka.js v3.3.3
//
Puzzles.shakashaka = function(){ };
Puzzles.shakashaka.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isLineCross     = true;
		k.isCenterLine    = true;
		k.dispzero        = true;
		k.isInputHatena   = true;
		k.NumberIsWhite   = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){
		pp.addSelect('use','setting',(!k.mobile?1:2),[1,2,3], '三角形の入力方法', 'Input Triangle Type');
		pp.setLabel ('use', '三角形の入力方法', 'Input Triangle Type');

		pp.addChild('use_1', 'use', 'クリックした位置', 'Corner-side');
		pp.addChild('use_2', 'use', '引っ張り入力', 'Pull-to-Input');
		pp.addChild('use_3', 'use', '1ボタン', 'One Button');
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode){
				if(pp.getVal('use')==3){ this.inputTriangle_onebtn();}
				else if(this.btn.Left){
					if     (pp.getVal('use')==1){ this.inputTriangle_corner();}
					else if(pp.getVal('use')==2){ this.inputTriangle_pull_start();}
				}
				else if(this.btn.Right){
					this.inputDot();
				}
			}
			if(k.editmode){ this.inputqnum();}
		};
		mv.mouseup = function(){
			if(k.playmode){
				if(pp.getVal('use')==2 && this.inputData===null){
					this.inputTriangle_pull_end();
				}
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.inputData===null){
					if(pp.getVal('use')==2){  this.inputTriangle_pull_move();}
				}
				else if(this.inputData>=2 && this.inputData<=5){
					this.inputTriangle_drag();
				}
				else{ // this.inputData==0か-1
					this.inputDot();
				}
			}
		};

		mv.inputTriangle_corner = function(){
			var cc = this.cellid();
			if(cc===null || bd.isNum(cc)){ return;}

			this.inputData = this.checkCornerData(cc);
			if(this.inputData===bd.QaC(cc)){ this.inputData = 0;}

			this.setAnswer(cc, this.inputData);
			this.mouseCell = cc;
			pc.paintCell(cc);
		};
		mv.checkCornerData = function(cc){
			var dx = this.inputPoint.x - bd.cell[cc].cpx;
			var dy = this.inputPoint.y - bd.cell[cc].cpy;
			if(dx<=0){ return ((dy<=0)?5:2);}
			else     { return ((dy<=0)?4:3);}
		};

		mv.inputTriangle_pull_start = function(){
			var cc = this.cellid();
			if(cc===null || bd.isNum(cc)){ this.mousereset(); return;}

			// 最初はどこのセルをクリックしたか取得するだけ
			this.firstPoint.set(this.inputPoint);
			this.mouseCell = cc;
		};
		mv.inputTriangle_pull_move = function(){
			var cc = this.mouseCell;
			var dx = (this.inputPoint.x-this.firstPoint.x);
			var dy = (this.inputPoint.y-this.firstPoint.y);

			// 一定以上動いていたら三角形を入力
			var diff = 12;
			if     (dx<=-diff && dy>= diff){ this.inputData = 2;}
			else if(dx<=-diff && dy<=-diff){ this.inputData = 5;}
			else if(dx>= diff && dy>= diff){ this.inputData = 3;}
			else if(dx>= diff && dy<=-diff){ this.inputData = 4;}

			if(this.inputData!==null){
				if(this.inputData===bd.QaC(cc)){ this.inputData = 0;}
				this.setAnswer(cc, this.inputData);
				this.mouseCell = cc;
			}
			pc.paintCell(cc);
		};
		mv.inputTriangle_pull_end = function(){
			var dx = (this.inputPoint.x-this.firstPoint.x);
			var dy = (this.inputPoint.y-this.firstPoint.y);

			// ほとんど動いていなかった場合は・を入力
			if(Math.abs(dx)<=3 && Math.abs(dy)<=3){
				var cc = this.mouseCell;
				this.setAnswer(cc,(bd.QsC(cc)!==1?-1:0));
				pc.paintCell(cc);
			}
		};

		mv.inputTriangle_drag = function(){
			if(this.inputData===null || this.inputData<=0){ return;}

			var cc = this.cellid();
			if(cc===null || bd.isNum(cc)){ return;}

			var dbx=bd.cell[cc].bx-bd.cell[this.mouseCell].bx;
			var dby=bd.cell[cc].by-bd.cell[this.mouseCell].by;
			var tri=this.checkCornerData(cc), ret=null, cur=this.inputData;
			if((dbx===2 && dby===2)||(dbx===-2 && dby===-2)){ // 左上・右下
				if(cur===2||cur===4){ ret=cur;}
			}
			else if((dbx===2 && dby===-2)||(dbx===-2 && dby===2)){ // 右上・左下
				if(cur===3||cur===5){ ret=cur;}
			}
			else if(dbx===0 && dby===-2){ // 上下反転(上側)
				if(((cur===2||cur===3)&&(tri!==cur))||((cur===4||cur===5)&&(tri===cur))){
					ret=[null,null,5,4,3,2][cur];
				}
			}
			else if(dbx===0 && dby===2){  // 上下反転(下側)
				if(((cur===4||cur===5)&&(tri!==cur))||((cur===2||cur===3)&&(tri===cur))){
					ret=[null,null,5,4,3,2][cur];
				}
			}
			else if(dbx===-2 && dby===0){ // 左右反転(左側)
				if(((cur===3||cur===4)&&(tri!==cur))||((cur===2||cur===5)&&(tri===cur))){
					ret=[null,null,3,2,5,4][cur];
				}
			}
			else if(dbx===2 && dby===0){  // 左右反転(右側)
				if(((cur===2||cur===5)&&(tri!==cur))||((cur===3||cur===4)&&(tri===cur))){
					ret=[null,null,3,2,5,4][cur];
				}
			}

			if(ret!==null){
				this.setAnswer(cc,ret);
				this.inputData = ret;
				this.mouseCell = cc;
				pc.paintCell(cc);
			}
		};
		mv.inputDot = function(){
			var cc = this.cellid();
			if(cc===null || bd.isNum(cc)){ return;}

			if(this.inputData===null){ this.inputData = (bd.QsC(cc)===1?0:-1);}

			this.setAnswer(cc, this.inputData);
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		mv.inputTriangle_onebtn = function(){
			var cc = this.cellid();
			if(cc===null || bd.isNum(cc)){ return;}

			var ans = this.getAnswer(cc);
			if     (this.btn.Left) { this.inputData = [0,2,1,3,4,5,-1][ans+1];}
			else if(this.btn.Right){ this.inputData = [5,-1,1,0,2,3,4][ans+1];}
			this.setAnswer(cc, this.inputData);
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		mv.getAnswer = function(c){
			if(c===null || bd.isNum(c)){ return 0;}
			if     (bd.QaC(c)>0)  { return bd.QaC(c);}
			else if(bd.QsC(c)===1){ return -1;}
			return 0;
		};
		mv.setAnswer = function(c,val){
			if(c===null || bd.isNum(c)){ return;}
			bd.sQaC(c,((val>=2&&val<=5)?val:0));
			bd.sQsC(c,((val===-1)?1:0));
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(2, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 4;
		bd.isTri = function(c){ return (!!bd.cell[c] && bd.cell[c].qans!==0);};

		menu.ex.adjustSpecial = function(key,d){
			var trans = [];
			switch(key){
				case this.FLIPY: trans=[0,1,5,4,3,2]; break;	// 上下反転
				case this.FLIPX: trans=[0,1,3,2,5,4]; break;	// 左右反転
				case this.TURNR: trans=[0,1,5,2,3,4]; break;	// 右90°回転
				case this.TURNL: trans=[0,1,3,4,5,2]; break;	// 左90°回転
				default: return;
			}
			for(var c=0;c<bd.cellmax;c++){
				var val=trans[bd.QaC(c)]; if(!!val){ bd.cell[c].qans=val;}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";
		pc.setCellColorFunc('qnum');

		pc.paint = function(){
			this.drawBGCells();
			this.drawDotCells(false);
			this.drawDashedGrid();
			this.drawBlackCells();
			this.drawNumbers();

			this.drawTriangle();

			this.drawChassis();

			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decode4Cell();
		};
		enc.pzlexport = function(type){
			this.encode4Cell();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQnumb();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnumb();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnumb();
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeCellQnumb();
			this.encodeCellQanssub();
		};

		fio.kanpenOpen = function(){
			this.decodeCell( function(obj,ca){
				if     (ca==="5"){ obj.qnum = -2;}
				else if(ca!=="."){ obj.qnum = parseInt(ca);}
			});
			this.decodeCell( function(obj,ca){
				if     (ca==="+"){ obj.qsub = 1;}
				else if(ca!=="."){ obj.qans = parseInt(ca);}
			});
		};
		fio.kanpenSave = function(){
			this.encodeCell( function(obj){
				if     (obj.qnum>=  0){ return (obj.qnum.toString() + " ");}
				else if(obj.qnum===-2){ return "5 ";}
				else                  { return ". ";}
			});
			this.encodeCell( function(obj){
				if     (obj.qsub=== 1){ return "+ ";}
				else if(obj.qans>=  2){ return (obj.qans.toString() + " ");}
				else                  { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkDir4Cell(bd.isTri,2) ){
				this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is bigger than it.'); return false;
			}

			if( !this.checkWhiteArea() ){
				this.setAlert('白マスが長方形(正方形)ではありません。','A mass of white cells is not rectangle.'); return false;
			}

			if( !this.checkDir4Cell(bd.isTri,1) ){
				this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is smaller than it.'); return false;
			}

			return true;
		};

		ans.checkWhiteArea = function(){
			var result = true;
			var winfo = this.searchWarea_slope();
			for(var id=1;id<=winfo.max;id++){
				var d = this.getSizeOfClist(winfo.room[id].idlist,function(cc){ return (bd.QaC(cc)===0);});
				if(d.cols*d.rows!=d.cnt && !this.isAreaRect_slope(winfo,id)){
					if(this.inAutoCheck){ return false;}
					bd.sErC(winfo.room[id].idlist,1);
					result = false;
				}
			}
			return result;
		};
		// 斜め領域判定用
		ans.isAreaRect_slope = function(winfo,id){
			for(var i=0;i<winfo.room[id].idlist.length;i++){
				var c = winfo.room[id].idlist[i];
				var a = bd.QaC(c);
				if( ((a==4||a==5)^(bd.up(c)===null||winfo.id[bd.up(c)]!=id)) ||
					((a==2||a==3)^(bd.dn(c)===null||winfo.id[bd.dn(c)]!=id)) ||
					((a==2||a==5)^(bd.lt(c)===null||winfo.id[bd.lt(c)]!=id)) ||
					((a==3||a==4)^(bd.rt(c)===null||winfo.id[bd.rt(c)]!=id)) )
				{
					return false;
				}
			}
			return true;
		};

		ans.searchWarea_slope = function(){
			var winfo = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){ winfo.id[c]=(bd.noNum(c)?0:null);}
			for(var c=0;c<bd.cellmax;c++){
				if(winfo.id[c]!==0){ continue;}
				winfo.max++;
				winfo.room[winfo.max] = {idlist:[]};
				this.sw0(winfo, c, winfo.max);
			}
			return winfo;
		};
		ans.sw0 = function(winfo,c,areaid){
			winfo.id[c] = areaid;
			winfo.room[areaid].idlist.push(c);
			var a=bd.QaC(c), b, cc;
			cc=bd.up(c); if(cc!==null){ b=bd.QaC(cc); if(winfo.id[cc]===0 && (a!==4&&a!==5) && (b!==2&&b!==3)){ this.sw0(winfo,cc,areaid);} }
			cc=bd.dn(c); if(cc!==null){ b=bd.QaC(cc); if(winfo.id[cc]===0 && (a!==2&&a!==3) && (b!==4&&b!==5)){ this.sw0(winfo,cc,areaid);} }
			cc=bd.lt(c); if(cc!==null){ b=bd.QaC(cc); if(winfo.id[cc]===0 && (a!==2&&a!==5) && (b!==3&&b!==4)){ this.sw0(winfo,cc,areaid);} }
			cc=bd.rt(c); if(cc!==null){ b=bd.QaC(cc); if(winfo.id[cc]===0 && (a!==3&&a!==4) && (b!==2&&b!==5)){ this.sw0(winfo,cc,areaid);} }
		};
	}
};
