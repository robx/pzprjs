//
// パズル固有スクリプト部 ぼんさん/へやぼん版 bonsan.js v3.1.9p1
//

function setting(){
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
	k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 1;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum","cellqsub","borderques","borderline"];

	//k.def_csize = 36;
	//k.def_psize = 24;
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = function(){
	this.before = new Array();
	this.prefix();
};
Puzzle.prototype = {
	prefix : function(){
		this.input_init();
		this.graphic_init();

		base.setTitle("ぼんさん/へやぼん","Bonsan/Heya-Bon");
		base.setExpression("　左ドラッグで線が、マスのクリックでセルの背景色が入力できます。",
						   " Left Button Drag to input lines, Click the cell to input background color of the cell.");
		base.setFloatbgcolor("rgb(127,96,64)");
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){ this.inputborder(x,y);}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				//else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if     (k.mode==1 && this.notInputted()){
				if(!kp.enabled()){this.inputqnum(x,y,Math.max(k.qcols,k.qrows)-1);}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3 && this.notInputted()){ this.inputlight(x,y);}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1){ this.inputborder(x,y);}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				//else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.inputlight = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}

			if     (bd.getQsubCell(cc)==0){ bd.setQsubCell(cc, (this.btn.Left?1:2));}
			else if(bd.getQsubCell(cc)==1){ bd.setQsubCell(cc, (this.btn.Left?2:0));}
			else if(bd.getQsubCell(cc)==2){ bd.setQsubCell(cc, (this.btn.Left?0:1));}
			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
		}

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca, Math.max(k.qcols,k.qrows)-1);
		};

		if(k.callmode == "pmake"){
			kp.generate(99, true, false, this.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,4);
			};
		}
	},

	kpgenerate : function(mode){
		kp.inputcol('num','knum0','0','0');
		kp.inputcol('num','knum1','1','1');
		kp.inputcol('num','knum.','-','○');
		kp.inputcol('num','knum_',' ',' ');
		kp.insertrow();
		kp.inputcol('num','knum2','2','2');
		kp.inputcol('num','knum3','3','3');
		kp.inputcol('num','knum4','4','4');
		kp.inputcol('num','knum5','5','5');
		kp.insertrow();
		kp.inputcol('num','knum6','6','6');
		kp.inputcol('num','knum7','7','7');
		kp.inputcol('num','knum8','8','8');
		kp.inputcol('num','knum9','9','9');
		kp.insertrow();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
//		pc.errcolor1 = "rgb(192, 0, 0)";
		pc.qsubcolor1 = "rgb(224, 224, 255)";
		pc.qsubcolor2 = "rgb(255, 255, 144)";
		pc.fontsizeratio = 0.9;	// 数字の倍率

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawQSubCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);
			this.drawTip(x1,y1,x2,y2);

			//this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawNumCells(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawTip = function(x1,y1,x2,y2){
			var tsize = k.cwidth*0.30;
			var tplus = k.cwidth*0.05;

			var clist = this.cellinside(x1-1,y1-1,x2+1,y2+1,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				this.vhide(["c"+c+"_tp1_","c"+c+"_tp2_","c"+c+"_tp3_","c"+c+"_tp4_"]);
				if(ans.lcntCell(c)==1 && bd.getQnumCell(c)==-1){
					var dir=0, id=-1;
					if     (bd.getLineBorder(bd.cell[c].ub())==1){ dir=2; id=bd.cell[c].ub();}
					else if(bd.getLineBorder(bd.cell[c].db())==1){ dir=1; id=bd.cell[c].db();}
					else if(bd.getLineBorder(bd.cell[c].lb())==1){ dir=4; id=bd.cell[c].lb();}
					else if(bd.getLineBorder(bd.cell[c].rb())==1){ dir=3; id=bd.cell[c].rb();}

					g.lineWidth = (int(k.cwidth/12)>=3?int(k.cwidth/12):3); //LineWidth
					if     (bd.getErrorBorder(id)==1){ g.strokeStyle = this.errlinecolor1; g.lineWidth=g.lineWidth+1;}
					else if(bd.getErrorBorder(id)==2){ g.strokeStyle = this.errlinecolor2;}
					else                             { g.strokeStyle = this.linecolor;}

					if(this.vnop("c"+c+"_tp"+dir+"_",0)){
						var px=bd.cell[c].px()+k.cwidth/2+1, py=bd.cell[c].py()+k.cheight/2+1;
						if     (dir==1){ this.inputPath([px,py ,-tsize, tsize ,0,-tplus , tsize, tsize], false);}
						else if(dir==2){ this.inputPath([px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize], false);}
						else if(dir==3){ this.inputPath([px,py , tsize,-tsize ,-tplus,0 , tsize, tsize], false);}
						else if(dir==4){ this.inputPath([px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize], false);}
						g.stroke();
					}
				}
			}
			this.vinc();
		};

		pc.drawNumCells = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.40;
			var rsize2 = k.cwidth*0.35;

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQnumCell(c)!=-1){
					if(bd.getErrorCell(c)==1){ g.fillStyle = this.errcolor1;}
					else{ g.fillStyle = this.Cellcolor;}
					g.beginPath();
					g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cira_",1)){ g.fill();}

					g.fillStyle = "white";
					g.beginPath();
					g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize2, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cirb_",1)){ g.fill();}
				}
				else{ this.vhide("c"+c+"_cira_"); this.vhide("c"+c+"_cirb_");}

				this.dispnumCell_General(c);
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){
			bstr = enc.decodeBorder(bstr);
			bstr = enc.decodeNumber16(bstr);
		}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeBorder()+enc.encodeNumber16();
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){
		ans.performAsLine = true;

		if( !ans.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !ans.checkLcntCell(4) ){
			ans.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		ans.performAsLine = false;
		var larea = ans.searchLarea();
		if( !ans.checkQnumsInArea(larea, function(a){ return (a>=2);}) ){
			ans.setAlert('○が繋がっています。','There are connected circles.'); return false;
		}
		if( !this.checkLineOverLetter() ){
			ans.setAlert('○の上を線が通過しています。','A line goes through a circle.'); return false;
		}

		if( !ans.checkAllArea(larea, f_true, function(w,h,a){ return (w==1||h==1);} ) ){
			ans.setAlert('曲がっている線があります。','A line has curve.'); return false;
		}
		if( !ans.checkOneNumber(larea, function(num, a){ return (num>=0 && num!=a-1);}, f_true) ){
			ans.setAlert('数字と線の長さが違います。','The length of a line is wrong.'); return false;
		}

		var rarea = ans.searchRarea();
		this.movedPosition(larea);
		if( !this.checkFractal(rarea) ){
			ans.setAlert('部屋の中の○が点対称に配置されていません。', 'Position of circles in the room is not point symmetric.'); return false;
		}
		if( !ans.checkNoObjectInRoom(rarea, this.getMoved.bind(this)) ){
			ans.setAlert('○のない部屋があります。','A room has no circle.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (bd.getQnumCell(c)>=1 && ans.lcntCell(c)==0);} ) ){
			ans.setAlert('○から線が出ていません。','A circle doesn\'t start any line.'); return false;
		}

		ans.performAsLine = true;
		if( !ans.checkDisconnectLine(larea) ){
			ans.setAlert('○につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
		}

		return true;
	},
	check1st : function(){ return true;},

	checkLineOverLetter : function(func){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)>=2 && bd.getQnumCell(c)!=-1){
				bd.setErrorBorder(bd.borders,2);
				ans.setCellLineError(c,true);
				return false;
			}
		}
		return true;
	},

	checkFractal : function(area){
		for(var id=1;id<=area.max;id++){
			var d = ans.getSizeOfArea(area,id,f_true);
			var sx=d.x1+d.x2+1, sy=d.y1+d.y2+1;
			var movex=0, movey=0;
			for(var i=0;i<area.room[id].length;i++){
				var c=area.room[id][i];
				if(this.getMoved(c)!=-1 ^ this.getMoved(bd.getcnum(sx-bd.cell[c].cx-1, sy-bd.cell[c].cy-1))!=-1){
					for(var a=0;a<area.room[id].length;a++){ if(this.getMoved(area.room[id][a])!=-1){ bd.setErrorCell([area.room[id][a]],1);} }
					return false;
				}
			}
		}
		return true;
	},

	movedPosition : function(larea){
		this.before = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==0 && bd.getQnumCell(c)!=-1){ this.before.check[c]=c;}
			else{ this.before.check[c]=-1;}
		}
		for(var r=1;r<=larea.max;r++){
			var before=-1, after=-1;
			if(larea.room[r].length>1){
				for(var i=0;i<larea.room[r].length;i++){
					var c=larea.room[r][i];
					if(ans.lcntCell(c)==1){
						if(bd.getQnumCell(c)!=-1){ before=c;} else{ after=c;}
					}
				}
			}
			this.before.check[after]=before;
		}
	},
	getMoved : function(cc){ return bd.getQnumCell(this.before.check[cc]);},
	getBeforeCell : function(cc){ return this.before.check[cc];}
};
