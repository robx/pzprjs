//
// パズル固有スクリプト部 はこいり○△□版 hakoiri.js v3.2.0
//
Puzzles.hakoiri = function(){ };
Puzzles.hakoiri.prototype = {
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

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["arearoom","cellqnum","cellqanssub"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		if(k.callmode=="pplay"){
			base.setExpression("　左クリックで記号が、右ドラッグで補助記号が入力できます。",
							   " Left Click to input answers, Right Button Drag to input auxiliary marks.");
		}
		else{
			base.setExpression("　キーボードの左側や-キー等で、記号の入力ができます。",
							   " Press left side of the keyboard or '-' key to input marks.");
		}
		base.setTitle("はこいり○△□","Triplets");
		base.setFloatbgcolor("rgb(127, 160, 96)");
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
				if(!kp.enabled() || this.btn.Right) this.inputmark(x,y);
				else kp.display(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==1 && this.notInputted()){
				if(!kp.enabled()) this.inputqnum(x,y,3);
				else if(this.btn.Left){ kp.display(x,y);}
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3 && this.btn.Right) this.inputDot(x,y);
		};

		mv.inputmark = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}

			if(cc==tc.getTCC()){
				this.inputmark3(cc);
				this.mouseCell = cc;
			}
			else{
				var cc0 = tc.getTCC();
				tc.setTCC(cc);
				pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
				if(bd.QsC(cc)==1 || bd.QaC(cc)==-1){ this.inputData=1;}
			}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
		};
		mv.inputmark3 = function(cc){
			if(bd.QnC(cc)!=-1){ return;}
			if(this.btn.Left){
				if(bd.QsC(cc)== 1){ bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				else{
					bd.sQsC(cc,(bd.QaC(cc)==3?1:0));
					bd.sQaC(cc,({'-1':1,'1':2,'2':3,'3':-1})[bd.QaC(cc).toString()]);
				}
			}
			else if(this.btn.Right){
				if(bd.QsC(cc)== 1){ bd.sQaC(cc, 3); bd.sQsC(cc,0);}
				else{
					bd.sQsC(cc,(bd.QaC(cc)==-1?1:0));
					bd.sQaC(cc,({'-1':-1,'1':-1,'2':1,'3':2})[bd.QaC(cc).toString()]);
				}
			}
			if(bd.QsC(cc)==1){ this.inputData=1;}
		};

		mv.inputDot = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell || this.inputData!=1 || bd.QnC(cc)!=-1){ return;}
			var cc0 = tc.getTCC(); tc.setTCC(cc);
			bd.sQaC(cc,-1);
			bd.sQsC(cc,1);
			this.mouseCell = cc;

			pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			kc.key_hakoiri(ca);
		};
		kc.key_hakoiri = function(ca){
			var cc = tc.getTCC();
			var flag = false;

			if     ((ca=='1'||ca=='q'||ca=='a'||ca=='z')){
				if(k.mode==1){ bd.sQnC(cc, 1); bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				else if(bd.QnC(cc)==-1){ bd.sQaC(cc,1); bd.sQsC(cc,0);}
				flag = true;
			}
			else if((ca=='2'||ca=='w'||ca=='s'||ca=='x')){
				if(k.mode==1){ bd.sQnC(cc, 2); bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				else if(bd.QnC(cc)==-1){ bd.sQaC(cc,2); bd.sQsC(cc,0);}
				flag = true;
			}
			else if((ca=='3'||ca=='e'||ca=='d'||ca=='c')){
				if(k.mode==1){ bd.sQnC(cc, 3); bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				else if(bd.QnC(cc)==-1){ bd.sQaC(cc,3); bd.sQsC(cc,0);}
				flag = true;
			}
			else if((ca=='4'||ca=='r'||ca=='f'||ca=='v')){
				if(k.mode==1){ bd.sQnC(cc,-2); bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				else if(bd.QnC(cc)==-1){ bd.sQaC(cc,-1); bd.sQsC(cc,1);}
				flag = true;
			}
			else if((ca=='5'||ca=='t'||ca=='g'||ca=='b'||ca==' ')){
				if(k.mode==1){ bd.sQnC(cc, -1); bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				else if(bd.QnC(cc)==-1){ bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				flag = true;
			}
			else if(ca=='-'){
				if(k.mode==1){ bd.sQnC(cc,(bd.QnC(cc)!=-2?-2:-1)); bd.sQaC(cc,-1); bd.sQsC(cc,0);}
				else if(bd.QnC(cc)==-1){ bd.sQaC(cc,-1); bd.sQsC(cc,(bd.QsC(cc)!=1?1:0));}
				flag = true;
			}

			if(flag){ pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy); return true;}
			return false;
		};

		kp.kpgenerate = function(mode){
			if(mode==1){
				this.inputcol('num','knum1','1','○');
				this.inputcol('num','knum2','2','△');
				this.inputcol('num','knum3','3','□');
				this.insertrow();
				this.inputcol('num','knum4','4','?');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','knumx','','');
				this.insertrow();
			}
			else{
				this.tdcolor = pc.fontAnscolor;
				this.inputcol('num','qnum1','1','○');
				this.inputcol('num','qnum2','2','△');
				this.inputcol('num','qnum3','3','□');
				this.insertrow();
				this.tdcolor = "rgb(255, 96, 191)";
				this.inputcol('num','qnum4','4','・');
				this.tdcolor = "black";
				this.inputcol('num','qnum_',' ',' ');
				this.inputcol('empty','qnumx','','');
				this.insertrow();
			}
		};
		kp.generate(99, true, true, kp.kpgenerate.bind(kp));
		kp.kpinput = function(ca){ kc.key_hakoiri(ca);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.bcolor = "rgb(160, 255, 160)";
		pc.BBcolor = "rgb(127, 127, 127)";
		pc.dotcolor = "rgb(255, 96, 191)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawDots(x1,y1,x2,y2);
			this.drawNumbers_hakoiri(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};

		pc.drawNumbers_hakoiri = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var num = (bd.QnC(c)!=-1 ? bd.QnC(c) : bd.QaC(c));
				if(num>=1 && num<=3){ text = ({1:"○",2:"△",3:"□"})[num];}
				else if(num==-2)    { text = "?";}
				else if(!bd.cell[c].numobj)  { continue;}
				else{ bd.cell[c].numobj.hide(); continue;}

				if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
				this.dispnumCell1(c, bd.cell[c].numobj, 1, text, 0.8, this.getNumberColor(c));
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeBorder(bstr);
				bstr = this.decodeNumber10(bstr);
			}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeNumber10();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAroundMarks() ){
				this.setAlert('同じ記号がタテヨコナナメに隣接しています。','Same marks are adjacent.'); return false;
			}

			var rarea = this.searchRarea();
			if( !this.checkAllArea(rarea, function(id){ return (this.getNum(id)!=-1);}.bind(this), function(w,h,a){ return (a<4);} ) ){
				this.setAlert('1つのハコに4つ以上の記号が入っています。','A box has four or more marks.'); return false;
			}

			if( !this.checkDifferentObjectInRoom(rarea) ){
				this.setAlert('1つのハコに同じ記号が複数入っています。','A box has same plural marks.'); return false;
			}

			if( !this.linkBWarea( this.searchBWarea(function(id){ return (id!=-1 && this.getNum(id)!=-1); }.bind(this)) ) ){
				this.setAlert('タテヨコにつながっていない記号があります。','Marks are devided.'); return false;
			}

			if( !this.checkAllArea(rarea, function(id){ return (this.getNum(id)!=-1);}.bind(this), function(w,h,a){ return (a>2);} ) ){
				this.setAlert('1つのハコに2つ以下の記号しか入っていません。','A box has tow or less marks.'); return false;
			}

			return true;
		};

		ans.checkDifferentObjectInRoom = function(area){
			for(var r=1;r<=area.max;r++){
				var d = new Array();
				d[-2]=0; d[1]=0; d[2]=0; d[3]=0;
				for(var i=0;i<area.room[r].length;i++){
					var val = this.getNum(area.room[r][i]);
					if(val==-1){ continue;}

					if(d[val]==0){ d[val]++;}
					else if(d[val]>0){ bd.sErC(area.room[r],1); return false;}
				}
			}
			return true;
		};
		ans.checkAroundMarks = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(this.getNum(c)<0){ continue;}
				var cx = bd.cell[c].cx; var cy = bd.cell[c].cy; var target=0;
				var func = function(cc){ return (cc!=-1 && this.getNum(c)==this.getNum(cc));}.bind(this);
				target = bd.cnum(cx+1,cy  ); if(func(target)){ bd.sErC([c,target],1); return false;}
				target = bd.cnum(cx  ,cy+1); if(func(target)){ bd.sErC([c,target],1); return false;}
				target = bd.cnum(cx-1,cy+1); if(func(target)){ bd.sErC([c,target],1); return false;}
				target = bd.cnum(cx+1,cy+1); if(func(target)){ bd.sErC([c,target],1); return false;}
			}
			return true;
		};
		ans.getNum = function(cc){
			if(cc<0||cc>=bd.cell.length){ return -1;}
			return (bd.QnC(cc)!=-1?bd.QnC(cc):bd.QaC(cc));
		};
	}
};
