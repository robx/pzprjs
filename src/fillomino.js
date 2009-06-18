//
// パズル固有スクリプト部 フィルオミノ版 fillomino.js v3.2.0
//
Puzzles.fillomino = function(){ };
Puzzles.fillomino.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isborderCross   = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["cellqnum", "cellqanssub", "borderans"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		base.setTitle("フィルオミノ","Fillomino");
		base.setExpression("<small><span style=\"line-height:125%;\">　マウスの左ボタンを押しながら点線上を動かすと境界線が引けます。マスの中央から同じことをすると数字を隣のマスにコピーできます。右ボタンは補助記号です。<br>　キーボードでは同じ入力を、それぞれZキー、Xキー、Ctrlキーを押しながら矢印キーで行うことができます。</span></small>",
						   "<small><span style=\"line-height:125%;\"> Left Button Drag on dotted line to input border line. Do it from center of the cell to copy the number. Right Button Drag to input auxiliary marks.<br> By keyboard, it is available to input each ones by using arrow keys with 'Z', 'X' or 'Ctrl' key.</span></small>");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		pp.addCheckToFlags('enbnonum','setting',false);
		pp.setMenuStr('enbnonum', '未入力で正答判定', 'Allow Empty cell');
		pp.setLabel  ('enbnonum', '全ての数字が入っていない状態での正答判定を許可する', 'Allow answer check with empty cell in the board.');
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==3){
				if(this.btn.Left){ this.borderinput = this.inputborder_fillomino(x,y);}
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(!kp.enabled()){ this.mouseCell=-1; 	this.inputqnum(x,y,99);}
				else{ kp.display(x,y);}
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left){
					if(this.borderinput){ this.inputborder_fillomino(x,y);}
					else{ this.dragnumber(x,y);}
				}
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};
		mv.inputborder_fillomino = function(x,y){
			var pos = this.crosspos(new Pos(x,y), 0.25);
			if(this.mouseCell==-1 && pos.x%2==1 && pos.y%2==1){
				pos = this.cellid(new Pos(x,y));
				if(pos==-1){ return true;}
				this.inputData = (bd.QnC(pos)!=-1?bd.QnC(pos):bd.QaC(pos));
				this.mouseCell = pos;
				return false;
			}
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return true;}

			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!=-1 && id!=-1){
				if((pos.x%2==0 && this.mouseCell.x==pos.x && Math.abs(this.mouseCell.y-pos.y)==1) ||
				   (pos.y%2==0 && this.mouseCell.y==pos.y && Math.abs(this.mouseCell.x-pos.x)==1) )
				{
					this.mouseCell=-1

					if(this.inputData==-1){ this.inputData=(bd.QaB(id)==0?1:0);}
					if(this.inputData!=-1){ bd.sQaB(id, this.inputData);}
					else{ return true;}
					pc.paintBorder(id);
				}
			}
			this.mouseCell = pos;
			return true;
		};
		mv.dragnumber = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1||cc==this.mouseCell){ return;}
			bd.sQaC(cc, this.inputData);
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(!this.isCTRL && !this.isZ && !this.isX && this.moveTCell(ca)){ return;}
			if(kc.key_fillomino(ca)){ return;}
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(ca=='x' && !this.keyPressed){ this.isX=true; return;}
			this.key_inputqnum(ca,99);
		};
		kc.keyup    = function(ca){ if(ca=='z'){ this.isZ=false;} if(ca=='x'){ this.isX=false;}};
		kc.key_fillomino = function(ca){
			if(k.mode==1){ return false;}

			var cc = tc.getTCC();
			if(cc==-1){ return;}
			var flag = false;

			if     (ca == 'up'    && bd.up(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.ub(cc),(bd.QsB(bd.ub(cc))==0?1:0)); tc.decTCY(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.ub(cc),(bd.QaB(bd.ub(cc))==0?1:0)); flag = true;}
				else if(kc.isX){ bd.sQaC(bd.up(cc),ans.getNum(cc)); tc.decTCY(2); flag = true;}
			}
			else if(ca == 'down'  && bd.dn(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.db(cc),(bd.QsB(bd.db(cc))==0?1:0)); tc.incTCY(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.db(cc),(bd.QaB(bd.db(cc))==0?1:0)); flag = true;}
				else if(kc.isX){ bd.sQaC(bd.dn(cc),ans.getNum(cc)); tc.incTCY(2); flag = true;}
			}
			else if(ca == 'left'  && bd.lt(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.lb(cc),(bd.QsB(bd.lb(cc))==0?1:0)); tc.decTCX(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.lb(cc),(bd.QaB(bd.lb(cc))==0?1:0)); kc.tcMoved = true; flag = true;}
				else if(kc.isX){ bd.sQaC(bd.lt(cc),ans.getNum(cc)); tc.decTCX(2); kc.tcMoved = true; flag = true;}
			}
			else if(ca == 'right' && bd.rt(cc) != -1){
				if(kc.isCTRL)  { bd.sQsB(bd.rb(cc),(bd.QsB(bd.rb(cc))==0?1:0)); tc.incTCX(2); flag = true;}
				else if(kc.isZ){ bd.sQaB(bd.rb(cc),(bd.QaB(bd.rb(cc))==0?1:0)); flag = true;}
				else if(kc.isX){ bd.sQaC(bd.rt(cc),ans.getNum(cc)); tc.incTCX(2); flag = true;}
			}

			kc.tcMoved = flag;
			if(flag){ pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1); return true;}
			return false;
		};

		kc.isX = false;
		kc.isZ = false;

		kp.generate(0, true, true, '');
		kp.kpinput = function(ca){ kc.key_inputqnum(ca,99);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";

		pc.BorderQanscolor = "rgb(0, 127, 0)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeNumber16(bstr);}
			else if(type==2)      { bstr = this.decodeKanpen(bstr); }
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"fillomino.html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeNumber16();
		};

		enc.decodeKanpen = function(bstr){
			bstr = (bstr.split("_")).join(" ");
			fio.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},bstr.split("/"));
			return "";
		};
		enc.pzldataKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + "_"):"._";
			});
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			this.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},array.slice(0,k.qrows));
			this.decodeCell( function(c,ca){
				if(ca != "0" && ca != "."){ bd.sQaC(c, parseInt(ca));}
			},array.slice(k.qrows,2*k.qrows));
			this.generateBorder();
		};
		fio.kanpenSave = function(){
			return ""+this.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + " "):". ";
			})+this.encodeCell( function(c){
				if     (bd.QnC(c)>=0){ return ". ";}
				else if(bd.QaC(c)>=0){ return (bd.QaC(c).toString() + " ");}
				else                 { return "0 ";}
			});
		};
		fio.generateBorder = function(){
			for(var id=0;id<bd.border.length;id++){
				var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
				if(cc1!=-1 && cc2!=-1 && ans.getNum(cc1)!=-1 && ans.getNum(cc2)!=-1
					&& ans.getNum(cc1)!=ans.getNum(cc2)){ bd.sQaB(id,1);}
				else{ bd.sQaB(id,0);}
			}
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rarea = this.searchRarea2(this.searchRarea());
			if( !this.checkErrorFlag(rarea, 3) ){
				this.setAlert('数字が含まれていないブロックがあります。','A block has no number.'); return false;
			}

			if( !this.checkErrorFlag(rarea, 1) || !this.checkAreaSize(rarea, 2) ){
				this.setAlert('ブロックの大きさより数字のほうが大きいです。','A number is bigger than the size of block.'); return false;
			}

			if( !this.checkSideArea(rarea) ){
				this.setAlert('同じ数字のブロックが辺を共有しています。','Adjacent blocks have the same number.'); return false;
			}

			if( !this.checkErrorFlag(rarea, 2) || !this.checkAreaSize(rarea, 1) ){
				this.setAlert('ブロックの大きさよりも数字が小さいです。','A number is smaller than the size of block.'); return false;
			}

			if( !this.checkErrorFlag(rarea, 4) ){
				this.setAlert('複数種類の数字が入っているブロックがあります。','A block has two or more kinds of numbers.'); return false;
			}

			if( !menu.getVal('enbnonum') && !this.checkAllCell(function(c){ return (this.getNum(c)==-1);}.bind(this)) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return (menu.getVal('enbnonum') || this.checkAllCell(function(c){ return (this.getNum(c)==-1);}.bind(this)));};

		ans.checkAreaSize = function(area, flag){
			for(var id=1;id<=area.max;id++){
				if(area.error[id]==-1||area.number[id]<=0){ continue;}
				if     (flag==1 && area.number[id]<this.getCntOfRoom(area,id)){ bd.sErC(area.room[id],1); return false;}
				else if(flag==2 && area.number[id]>this.getCntOfRoom(area,id)){ bd.sErC(area.room[id],1); return false;}
			}
			return true;
		};
		ans.checkSideArea = function(area){
			var func = function(area, c1, c2){
				if(area.check[c1] == area.check[c2]){ return false;}
				var a1 = area.number[area.check[c1]];
				var a2 = area.number[area.check[c2]];
				return (a1>0 && a2>0 && a1==a2);
			}
			return this.checkSideAreaCell(area, func, true);
		};
		ans.checkErrorFlag = function(area, val){
			for(var id=1;id<=area.max;id++){
				if(area.error[id]==val){
					bd.sErC(area.room[id],1);
					return false;
				}
			}
			return true;
		};
		ans.getNum = function(cc){
			if(cc<0||cc>=bd.cell.length){ return -1;}
			return (bd.QnC(cc)!=-1?bd.QnC(cc):bd.QaC(cc));
		};

		ans.searchRarea2 = function(area){
			var max = area.max;
			area.error = new Array();
			area.number = new Array();
			for(var id=1;id<=max;id++){
				area.error[id] = 0;
				area.number[id] = -1;
				var nums = new Array();
				var emptycell = 0, numcnt = 0, filled = 0;
				for(var i=0;i<area.room[id].length;i++){
					var c = area.room[id][i];
					var num = this.getNum(c);
					if(num==-1){ emptycell++;}
					else if(isNaN(nums[num])){ numcnt++; filled=num; nums[num]=1;}
					else{ nums[num]++;}
				}
				if(numcnt>1 && emptycell>0){ area.error[id]=4; continue;}
				else if(numcnt==0)         { area.error[id]=3; continue;}
				else if(numcnt==1 && filled < nums[filled]+emptycell){ area.error[id]=2; area.number[id]=filled; continue;}
				else if(numcnt==1 && filled > nums[filled]+emptycell){ area.error[id]=1; area.number[id]=filled; continue;}
				else if(numcnt==1)                                   { area.error[id]=-1;area.number[id]=filled; continue;}

				// ここに来るのはemptycellが0で2種類以上の数字が入っている領域のみ
				var clist = area.room[id];
				area.room[id] = new Array();
				for(var i=0;i<clist.length;i++){ area.check[clist[i]] = 0;}
				var func = function(b,c){ return (this.getNum(b)==this.getNum(c));}.bind(this)

				area.number[id]=this.getNum(clist[0]);
				this.sa0(func, area, clist[0], id);
				for(var i=0;i<clist.length;i++){
					if(area.check[clist[i]]==0){
						area.max++;
						area.room[area.max]=new Array();
						area.error[area.max]=0;
						area.number[area.max]=this.getNum(clist[i]);
						this.sa0(func, area, clist[i], area.max);
					}
				}
			}
			return area;
		};
		ans.sa0 = function(func, area, i, areaid){
			if(i==-1 || area.check[i]!=0){ return;}
			area.check[i] = areaid;
			area.room[areaid].push(i);
			if( func(i,bd.up(i)) ){ this.sa0(func, area, bd.up(i), areaid);}
			if( func(i,bd.dn(i)) ){ this.sa0(func, area, bd.dn(i), areaid);}
			if( func(i,bd.lt(i)) ){ this.sa0(func, area, bd.lt(i), areaid);}
			if( func(i,bd.rt(i)) ){ this.sa0(func, area, bd.rt(i), areaid);}
			return;
		};
	}
};
