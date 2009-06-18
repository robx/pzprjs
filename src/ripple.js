//
// パズル固有スクリプト部 波及効果版 ripple.js v3.1.9p1
//

function setting(){
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

	k.fstruct = ["borderques", "cellqnum", "cellqanssub"];

	//k.def_csize = 36;
	//k.def_psize = 24;
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = function(){
	this.prefix();
};
Puzzle.prototype = {
	prefix : function(){
		this.input_init();
		this.graphic_init();

		base.setTitle("波及効果","Ripple Effect");
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		if(k.callmode=="pmake"){ kp.defaultdisp = true;}
	},
	postfix : function(){
		room.setEnable();
		this.roommaxfunc = function(cc,mode){ return room.getCntOfRoomByCell(cc);};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.borderinput = this.inputborder(x,y);
			if(k.mode==3){
				if(!kp.enabled()){ this.inputqnum(x,y,99);}
				else{ kp.display(x,y);}
			}
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(k.mode==1){
					if(!kp.enabled()){ this.inputqnum(x,y,99);}
					else{ kp.display(x,y);}
				}
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1 && this.btn.Left) this.inputborder(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,99);
		};

		kp.generate(0, true, true, '');
		kp.kpinput = function(ca){ kc.key_inputqnum(ca,99);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";

		pc.errbcolor1 = "rgb(255, 160, 160)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){
			bstr = enc.decodeBorder(bstr);
			bstr = enc.decodeNumber16(bstr);
		}
		else if(type==2){ bstr = this.decodeKanpen(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==2){ document.urloutput.ta.value = enc.kanpenbase()+"hakyukoka.html?problem="+this.encodeKanpen();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeBorder()+enc.encodeNumber16();
	},

	decodeKanpen : function(bstr){
		var barray = bstr.split("/").slice(1,k.qrows+1);
		var carray = new Array();
		for(var i=0;i<k.qrows;i++){
			var array2 = barray[i].split("_");
			for(var j=0;j<array2.length;j++){ if(array2[j]!=""){ carray.push(array2[j]);} }
		}
		this.decodeRoom_kanpen(carray);

		barray =  bstr.split("/").slice(k.qrows+1,2*k.qrows+1);
		for(var i=0;i<barray.length;i++){ barray[i] = (barray[i].split("_")).join(" ");}
		fio.decodeCell( function(c,ca){
			if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},barray);

		return "";
	},
	decodeRoom_kanpen : function(array){
		var id;
		for(id=0;id<bd.border.length;id++){
			var cc1 = bd.getcnum(int((bd.border[id].cx-(bd.border[id].cy%2))/2), int((bd.border[id].cy-(bd.border[id].cx%2))/2) );
			var cc2 = bd.getcnum(int((bd.border[id].cx+(bd.border[id].cy%2))/2), int((bd.border[id].cy+(bd.border[id].cx%2))/2) );

			if(cc1!=-1 && cc2!=-1 && array[cc1]!=array[cc2]){ bd.setQuesBorder(id,1);}
			else{ bd.setQuesBorder(id,0);}
		}
	},

	encodeKanpen : function(){
		return ""+k.qrows+"/"+k.qcols+"/"+this.encodeRoom_kanpen()+
		fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + "_");}
			else                          { return "._";}
		});
	},
	encodeRoom_kanpen : function(){
		var rarea = ans.searchRarea();
		var bstr = "";
		for(var c=0;c<bd.cell.length;c++){
			bstr += (""+(rarea.check[c]-1)+"_");
			if((c+1)%k.qcols==0){ bstr += "/";}
		}
		return ""+rarea.max+"/"+bstr;
	},

	//---------------------------------------------------------
	kanpenOpen : function(array){
		var rmax = array.shift();
		var barray = array.slice(0,2*k.qrows);
		for(var i=0;i<barray.length;i++){ barray[i] = barray[i].replace(/ /g, "_");}
		this.decodeKanpen(""+rmax+"/"+barray.join("/"));
		fio.decodeCell( function(c,ca){
			if(ca!="."&&ca!="0"){ bd.setQansCell(c, parseInt(ca));}
		},array.slice(2*k.qrows,3*k.qrows));
	},
	kanpenSave : function(){
		var barray = this.encodeKanpen().split("/");
		barray.shift(); barray.shift();
		var rmax = barray.shift();
		for(var i=0;i<barray.length;i++){ barray[i] = barray[i].replace(/_/g, " ");}
		var ansstr = fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)!=-1){ return ". ";}
			else if(bd.getQansCell(c)==-1){ return "0 ";}
			else                          { return ""+bd.getQansCell(c).toString()+" ";}
		})
		return rmax + "/" + barray.join("/") + ansstr+"/";
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkDifferentNumber(ans.searchRarea()) ){
			ans.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
		}

		if( !this.checkRippleNumber() ){
			ans.setAlert('数字よりもその間隔が短いところがあります。','The gap of the same kind of number is smaller than the number.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (puz.getNum(c)==-1);}) ){
			ans.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return ans.checkAllCell(function(c){ return (puz.getNum(c)==-1);});},

	checkDifferentNumber : function(area){
		for(var r=1;r<=area.max;r++){
			var d = new Array();
			for(var i=1;i<=99;i++){ d[i]=-1;}
			for(var i=0;i<area.room[r].length;i++){
				var val=this.getNum(area.room[r][i]);
				if     (val==-1 || val==-2){ continue;}
				else if(d[val]==-1){ d[val] = area.room[r][i]; continue;}

				bd.setErrorCell(area.room[r],1);
				return false;
			}
		}
		return true;
	},
	checkRippleNumber : function(area){
		for(var c=0;c<bd.cell.length;c++){
			var num=this.getNum(c), cx=bd.cell[c].cx, cy=bd.cell[c].cy;
			if(num<=0){ continue;}
			for(var i=1;i<=num;i++){
				var tc = bd.getcnum(cx+i,cy);
				if(tc!=-1&&this.getNum(tc)==num){
					bd.setErrorCell([c,tc],1);
					return false;
				}
			}
			for(var i=1;i<=num;i++){
				var tc = bd.getcnum(cx,cy+i);
				if(tc!=-1&&this.getNum(tc)==num){
					bd.setErrorCell([c,tc],1);
					return false;
				}
			}
		}
		return true;
	},
	getNum : function(cc){
		if(cc<0||cc>=bd.cell.length){ return -1;}
		return (bd.getQnumCell(cc)!=-1?bd.getQnumCell(cc):bd.getQansCell(cc));
	}
};
