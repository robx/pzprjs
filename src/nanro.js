//
// パズル固有スクリプト部 ナンロー版 nanro.js v3.2.0
//
Puzzles.nanro = function(){ };
Puzzles.nanro.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
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
		k.NumberWithMB  = 1;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["arearoom", "cellqnum", "cellqanssub"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		base.setTitle("ナンロー","Nanro");
		base.setExpression("　数字などをクリックして動かすことで、数字を入力することができます。右クリックしてマウスを動かして×を入力することもできます。",
						   " Press Mouse Button on the number and Move to copy the number. It is able to Press Right Mouse Button and Move to input a cross.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		kp.defaultdisp = true;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3){
				if(this.btn.Left) this.dragnumber(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(!kp.enabled()){ this.mouseCell=-1; this.inputqnum(x,y,99);}
				else{ kp.display(x,y);}
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3){
				if(this.btn.Left) this.dragnumber(x,y);
				else if(this.btn.Right) this.inputDot(x,y);
			}
		};
		mv.dragnumber = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1||cc==this.mouseCell){ return;}
			if(this.mouseCell==-1){
				this.inputData = ans.getNum(cc);
				if   (this.inputData==-2){ this.inputData=-4;}
				else if(this.inputData==-1){
					if     (bd.QsC(cc)==1){ this.inputData=-2;}
					else if(bd.QsC(cc)==2){ this.inputData=-3;}
				}
				this.mouseCell = cc;
			}
			else if(bd.QnC(cc)==-1){
				if(this.inputData>=-1){ bd.sQaC(cc, this.inputData); bd.sQsC(cc,0);}
				else if(this.inputData==-2){ bd.sQaC(cc,-1); bd.sQsC(cc,1);}
				else if(this.inputData==-3){ bd.sQaC(cc,-1); bd.sQsC(cc,2);}
				this.mouseCell = cc;
				pc.paintCell(cc);
			}
		};
		mv.inputDot = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell || bd.QnC(cc)!=-1 || bd.QaC(cc)!=-1){ return;}
			if(this.inputData==-1){ this.inputData = (bd.QsC(cc)==2?0:2);}
			if     (this.inputData==2){ bd.sQaC(cc,-1); bd.sQsC(cc,2);}
			else if(this.inputData==0){ bd.sQaC(cc,-1); bd.sQsC(cc,0);}
			this.mouseCell = cc;
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			if(this.key_view(ca)){ return;}
			this.key_inputqnum(ca,99);
		};
		kc.key_view = function(ca){
			if(k.mode==1 || bd.QnC(tc.getTCC())!=-1){ return false;}

			var cc = tc.getTCC();
			var flag = false;

			if     ((ca=='q'||ca=='a'||ca=='z')){ bd.sQaC(cc,-1); bd.sQsC(cc,1); flag = true;}
			else if((ca=='w'||ca=='s'||ca=='x')){ bd.sQaC(cc,-1); bd.sQsC(cc,2); flag = true;}
			else if((ca=='e'||ca=='d'||ca=='c')){ bd.sQaC(cc,-1); bd.sQsC(cc,0); flag = true;}
			else if(ca=='1' && bd.QaC(cc)==1)   { bd.sQaC(cc,-1); bd.sQsC(cc,1); flag = true;}
			else if(ca=='2' && bd.QaC(cc)==2)   { bd.sQaC(cc,-1); bd.sQsC(cc,2); flag = true;}

			if(flag){ pc.paintCell(cc); return true;}
			return false;
		};

		kp.kpgenerate = function(mode){
			if(mode==3){
				this.tdcolor = pc.MBcolor;
				this.inputcol('num','knumq','q','○');
				this.inputcol('num','knumw','w','×');
				this.tdcolor = "black";
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','knumx','','');
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
			((mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','knumz','',''));
			((mode==1)?this.inputcol('num','knumc',' ','') :this.inputcol('empty','knumy','',''));
			this.insertrow();
		};
		kp.generate(99, true, true, kp.kpgenerate.bind(kp));
		kp.kpinput = function(ca){ kc.keyinput(ca,99);};

		room.setEnable();
		mv.roommaxfunc = function(cc,mode){ return room.getCntOfRoomByCell(cc);};
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

			this.drawBDline(x1,y1,x2,y2);

			this.drawMBs(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeBorder(bstr);
				bstr = this.decodeNumber16(bstr);
			}
			else if(type==2){ bstr = this.decodeKanpen(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"nanro.html?problem="+this.encodeKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeNumber16();
		};

		enc.decodeKanpen = function(bstr){
			var barray = bstr.split("/").slice(1,k.qrows+1);
			var carray = new Array();
			for(var i=0;i<k.qrows;i++){
				var array2 = barray[i].split("_");
				for(var j=0;j<array2.length;j++){ if(array2[j]!=""){ carray.push(array2[j]);} }
			}
			this.decodeRoom_kanpen(carray);

			barray = bstr.split("/").slice(k.qrows+1,2*k.qrows+1);
			for(var i=0;i<barray.length;i++){ barray[i] = (barray[i].split("_")).join(" ");}
			fio.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},barray);

			return "";
		};
		enc.decodeRoom_kanpen = function(array){
			for(var id=0;id<bd.border.length;id++){
				var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
				if(cc1!=-1 && cc2!=-1 && array[cc1]!=array[cc2]){ bd.sQuB(id,1);}
				else{ bd.sQuB(id,0);}
			}
		};

		enc.encodeKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+this.encodeRoom_kanpen()+
			fio.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + "_"):"._";
			});
		};
		enc.encodeRoom_kanpen = function(){
			var rarea = ans.searchRarea();
			var bstr = "";
			for(var c=0;c<bd.cell.length;c++){
				bstr += (""+(rarea.check[c]-1)+"_");
				if((c+1)%k.qcols==0){ bstr += "/";}
			}
			return ""+rarea.max+"/"+bstr;
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			var rmax = array.shift();
			var barray = array.slice(0,2*k.qrows);
			for(var i=0;i<barray.length;i++){ barray[i] = barray[i].replace(/ /g, "_");}
			enc.decodeKanpen(""+rmax+"/"+barray.join("/"));
			this.decodeCell( function(c,ca){
				if(ca!="."&&ca!="0"){ bd.sQaC(c, parseInt(ca));}
			},array.slice(2*k.qrows,3*k.qrows));
		};
		fio.kanpenSave = function(){
			var barray = enc.encodeKanpen().split("/");
			barray.shift(); barray.shift();
			var rmax = barray.shift();
			for(var i=0;i<barray.length;i++){ barray[i] = barray[i].replace(/_/g, " ");}
			var ansstr = this.encodeCell( function(c){
				if     (bd.QnC(c)!=-1){ return ". ";}
				else if(bd.QaC(c)==-1){ return "0 ";}
				else                  { return ""+bd.QaC(c).toString()+" ";}
			})
			return rmax + "/" + barray.join("/") + ansstr+"/";
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.check2x2Block( function(cc){ return (this.getNum(cc)>0);}.bind(this) ) ){
				this.setAlert('数字が2x2のかたまりになっています。','There is a 2x2 block of numbers.'); return false;
			}

			if( !this.checkSideAreaCell(rarea, function(area,c1,c2){ return (this.getNum(c1)>0 && this.getNum(c1)==this.getNum(c2));}.bind(this), false) ){
				this.setAlert('同じ数字が境界線を挟んで隣り合っています。','Adjacent blocks have the same number.'); return false;
			}

			var rarea = this.searchRarea2(this.searchRarea());
			if( !this.checkErrorFlag(rarea, 4) ){
				this.setAlert('複数種類の数字が入っているブロックがあります。','A block has two or more kinds of numbers.'); return false;
			}

			if( !this.checkErrorFlag(rarea, 1) ){
				this.setAlert('入っている数字の数が数字より多いです。','A number is bigger than the size of block.'); return false;
			}

			if( !this.linkBWarea( this.searchBWarea(function(id){ return (id!=-1 && this.getNum(id)!=-1); }.bind(this)) ) ){
				this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
			}

			if( !this.checkErrorFlag(rarea, 2) ){
				this.setAlert('入っている数字の数が数字より少ないです。','A number is smaller than the size of block.'); return false;
			}

			if( !this.checkErrorFlag(rarea, 3) ){
				this.setAlert('数字が含まれていないブロックがあります。','A block has no number.'); return false;
			}

			return true;
		};
		//check1st : function(){ return ans.linkBWarea( ans.searchBWarea(function(id){ return (id!=-1 && puz.getNum(id)!=-1); }) );},

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
				area.error[id] = 0;		// 後でエラー表示するエラーのフラグ
				area.number[id] = -1;	// そのエリアに入っている数字
				var nums = new Array();	// キーの数字が入っている数
				var numcnt = 0;			// エリアに入っている数字の種類数
				var emptycell = 0;		// 数字が入っていないセルの数
				var filled = 0;			// エリアに入っている数字
				for(var i=0;i<area.room[id].length;i++){
					var c = area.room[id][i];
					var num = this.getNum(c);
					if(num==-1){ emptycell++;}
					else if(isNaN(nums[num])){ numcnt++; filled=num; nums[num]=1;}
					else{ nums[num]++;}
				}
				if(numcnt>1)                               { area.error[id]=4;}
				else if(numcnt==0)                         { area.error[id]=3;}
				else if(numcnt==1 && filled < nums[filled]){ area.error[id]=1; area.number[id]=filled;}
				else if(numcnt==1 && filled > nums[filled]){ area.error[id]=2; area.number[id]=filled;}
				else                                       { area.error[id]=-1;area.number[id]=filled;}
			}
			return area;
		};
	}
};
