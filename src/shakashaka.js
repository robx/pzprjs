//
// パズル固有スクリプト部 シャカシャカ版 shakashaka.js v3.3.1
//
Puzzles.shakashaka = function(){ };
Puzzles.shakashaka.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 0;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = true;	// 線が交差するパズル
		k.isCenterLine    = true;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = true;	// 0を表示するかどうか
		k.isDispHatena    = false;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = true;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		base.setTitle("シャカシャカ","ShakaShaka");
		base.setExpression("　\"クリックした位置\"ではマス目の角のほうをクリックすることで三角形が入力できます。<br>　\"ドラッグ入力\"では斜め4方向にドラッグして三角形を入力できます。",
						   " Click corner-side to input triangles if 'Position of Cell'.<br> Left Button Drag to skew-ward to input triangle if 'Drag Type'.");
		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){
		pp.addSelect('use','setting',1,[1,2,3], '三角形の入力方法', 'Input Triangle Type');
		pp.setLabel ('use', '三角形の入力方法', 'Input Triangle Type');

		pp.addChild('use_1', 'use', 'クリックした位置', 'Position of Cell');
		pp.addChild('use_2', 'use', 'ドラッグ入力', 'Drag Type');
		pp.addChild('use_3', 'use', '1ボタン', 'One Button');
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode) this.inputTriangle(0);
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
		};
		mv.mouseup = function(){
			if(k.playmode && pp.getVal('use')===2 && this.notInputted()){
				this.inputTriangle(2);
			}
		};
		mv.mousemove = function(){
			if(k.playmode && pp.getVal('use')===2 && this.mouseCell!==null){
				this.inputTriangle(1);
			}
		};
		mv.inputTriangle = function(use2step){
			var cc;
			if(pp.getVal('use')!==2 || use2step==0){
				cc = this.cellid();
				if(cc===null || bd.QnC(cc)!==-1){ this.mousereset(); return;}
			}

			var use = pp.getVal('use');
			if(use===1){
				if(this.btn.Left){
					var dx = this.inputPoint.x - bd.cell[cc].px + k.p0.x;
					var dy = this.inputPoint.y - bd.cell[cc].py + k.p0.y;
					if(dx>0&&dx<=k.cwidth/2){
						if(dy>0&&dy<=k.cheight/2){ this.inputData = 5;}
						else if  (dy>k.cheight/2){ this.inputData = 2;}
					}
					else if(dx>k.cwidth/2){
						if(dy>0&&dy<=k.cheight/2){ this.inputData = 4;}
						else if  (dy>k.cheight/2){ this.inputData = 3;}
					}

					bd.sQaC(cc, (bd.QaC(cc)!==this.inputData?this.inputData:0));
					bd.sQsC(cc, 0);
				}
				else if(this.btn.Right){
					bd.sQaC(cc, 0);
					bd.sQsC(cc, (bd.QsC(cc)===0?1:0));
				}
			}
			else if(use===2){
				if(use2step==0){
					// 最初はどこのセルをクリックしたか取得するだけ
					this.firstPoint.set(this.inputPoint);
					this.mouseCell = cc;
					return;
				}

				var dx=(this.inputPoint.x-this.firstPoint.x), dy=(this.inputPoint.y-this.firstPoint.y);
				cc = this.mouseCell;

				if(use2step==1){
					// 一定以上動いていたら三角形を入力
					var diff = 12;
					if     (dx<=-diff && dy>= diff){ this.inputData=2;}
					else if(dx<=-diff && dy<=-diff){ this.inputData=5;}
					else if(dx>= diff && dy>= diff){ this.inputData=3;}
					else if(dx>= diff && dy<=-diff){ this.inputData=4;}

					if(this.inputData!==null){
						bd.sQaC(cc, (bd.QaC(cc)!==this.inputData)?this.inputData:0);
						bd.sQsC(cc, 0);
						this.mousereset();
					}
				}
				else if(use2step==2){
					// ほとんど動いていなかった場合は・を入力
					if(Math.abs(dx)<=3 && Math.abs(dy)<=3){
						bd.sQaC(cc, 0);
						bd.sQsC(cc, (bd.QsC(cc)==1?0:1));
					}
				}
			}
			else if(use===3){
				if(this.btn.Left){
					if     (bd.QsC(cc)===1){ bd.sQaC(cc,0); bd.sQsC(cc,0);}
					else if(bd.QaC(cc)===0){ bd.sQaC(cc,2); bd.sQsC(cc,0);}
					else if(bd.QaC(cc)===5){ bd.sQaC(cc,0); bd.sQsC(cc,1);}
					else{ bd.sQaC(cc,bd.QaC(cc)+1); bd.sQsC(cc,0);}
				}
				else if(this.btn.Right){
					if     (bd.QsC(cc)===1){ bd.sQaC(cc,5); bd.sQsC(cc,0);}
					else if(bd.QaC(cc)===0){ bd.sQaC(cc,0); bd.sQsC(cc,1);}
					else if(bd.QaC(cc)===2){ bd.sQaC(cc,0); bd.sQsC(cc,0);}
					else{ bd.sQaC(cc,bd.QaC(cc)-1); bd.sQsC(cc,0);}
				}
			}

			pc.paintCell(cc);
		};
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(2, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 4;

		menu.ex.adjustSpecial = function(key,d){
			switch(key){
			case this.FLIPY: // 上下反転
				for(var cc=0;cc<bd.cellmax;cc++){
					var val = [0,1,5,4,3,2][bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			case this.FLIPX: // 左右反転
				for(var cc=0;cc<bd.cellmax;cc++){
					var val = [0,1,3,2,5,4][bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			case this.TURNR: // 右90°反転
				for(var cc=0;cc<bd.cellmax;cc++){
					var val = [0,1,5,2,3,4][bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			case this.TURNL: // 左90°反転
				for(var cc=0;cc<bd.cellmax;cc++){
					var val = [0,1,3,4,5,2][bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";
		pc.setCellColorFunc('qnum');

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawRDotCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawTriangle(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
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

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnumb();
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeCellQnumb();
			this.encodeCellQanssub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAllCell(function(c){ return ( bd.QnC(c)>=0 && (bd.QnC(c)<ans.checkdir4Cell(c,ans.isTri)) );} ) ){
				this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is bigger than it.'); return false;
			}

			if( !this.checkWhiteArea() ){
				this.setAlert('白マスが長方形(正方形)ではありません。','A mass of white cells is not rectangle.'); return false;
			}

			if( !this.checkAllCell(function(c){ return ( bd.QnC(c)>=0 && (bd.QnC(c)>ans.checkdir4Cell(c,ans.isTri)) );} ) ){
				this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is smaller than it.'); return false;
			}

			return true;
		};
		ans.isTri = function(c){ return (bd.QaC(c)!==0);};

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
			for(var c=0;c<bd.cellmax;c++){ winfo.id[c]=(bd.QnC(c)===-1?0:null);}
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
