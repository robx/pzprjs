//
// パズル固有スクリプト部 波及効果版 ripple.js v3.2.3
//
Puzzles.ripple = function(){ };
Puzzles.ripple.prototype = {
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
		k.isLineCross     = 0;	// 1:線が交差するパズル
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

		k.fstruct = ["borderques", "cellqnum", "cellqanssub"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("波及効果","Ripple Effect");
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		if(k.EDITOR){ kp.defaultdisp = true;}
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.borderinput = this.inputborder();
			if(k.playmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){
					if(!kp.enabled()){ this.inputqnum();}
					else{ kp.display();}
				}
			}
		};
		mv.mousemove = function(){
			if(k.editmode && this.btn.Left) this.inputborder();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kp.generate(0, true, true, '');
		kp.kpinput = function(ca){ kc.key_inputqnum(ca);};

		area.resetArea();
		bd.nummaxfunc = function(cc){ return area.getCntOfRoomByCell(cc);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);

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
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"hakyukoka.html?problem="+this.encodeKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeNumber16();
		};

		enc.decodeKanpen = function(bstr){
			var barray = bstr.split("/").slice(1,k.qrows+1);
			var carray = [];
			for(var i=0;i<k.qrows;i++){
				var array2 = barray[i].split("_");
				for(var j=0;j<array2.length;j++){ if(array2[j]!=""){ carray.push(array2[j]);} }
			}
			this.decodeRoom_kanpen(carray);

			barray =  bstr.split("/").slice(k.qrows+1,2*k.qrows+1);
			for(var i=0;i<barray.length;i++){ barray[i] = (barray[i].split("_")).join(" ");}
			fio.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},barray);

			return "";
		};
		enc.decodeRoom_kanpen = function(array){
			for(var id=0;id<bd.bdmax;id++){
				var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
				if(cc1!=-1 && cc2!=-1 && array[cc1]!=array[cc2]){ bd.sQuB(id,1);}
				//else{ bd.sQuB(id,0);}
			}
		};

		enc.encodeKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+this.encodeRoom_kanpen()+
			fio.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + "_"):"._";
			});
		};
		enc.encodeRoom_kanpen = function(){
			var rinfo = area.getRoomInfo();
			var bstr = "";
			for(var c=0;c<bd.cellmax;c++){
				bstr += (""+(rinfo.id[c]-1)+"_");
				if((c+1)%k.qcols==0){ bstr += "/";}
			}
			return ""+rinfo.max+"/"+bstr;
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

			if( !this.checkDifferentNumber(area.getRoomInfo()) ){
				this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
			}

			if( !this.checkRippleNumber() ){
				this.setAlert('数字よりもその間隔が短いところがあります。','The gap of the same kind of number is smaller than the number.'); return false;
			}

			if( !this.checkAllCell(bd.noNum) ){
				this.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(bd.noNum);};

		ans.checkDifferentNumber = function(rinfo){
			for(var r=1;r<=rinfo.max;r++){
				var d = [];
				for(var i=1;i<=bd.maxnum;i++){ d[i]=-1;}
				for(var i=0;i<rinfo.room[r].idlist.length;i++){
					var val=bd.getNum(rinfo.room[r].idlist[i]);
					if     (val==-1 || val==-2){ continue;}
					else if(d[val]==-1){ d[val] = rinfo.room[r].idlist[i]; continue;}

					bd.sErC(rinfo.room[r].idlist,1);
					return false;
				}
			}
			return true;
		};
		ans.checkRippleNumber = function(){
			for(var c=0;c<bd.cellmax;c++){
				var num=bd.getNum(c), cx=bd.cell[c].cx, cy=bd.cell[c].cy;
				if(num<=0){ continue;}
				for(var i=1;i<=num;i++){
					var tc = bd.cnum(cx+i,cy);
					if(tc!=-1&&bd.getNum(tc)==num){
						bd.sErC([c,tc],1);
						return false;
					}
				}
				for(var i=1;i<=num;i++){
					var tc = bd.cnum(cx,cy+i);
					if(tc!=-1&&bd.getNum(tc)==num){
						bd.sErC([c,tc],1);
						return false;
					}
				}
			}
			return true;
		};
	}
};
