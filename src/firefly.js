//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.1.9p1
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

	k.fstruct = ["celldirecnum","borderline"];

	//k.def_csize = 36;
	k.def_psize = 16;
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

		if(k.callmode=="pmake"){
			base.setExpression("　黒点は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input black marks, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
							   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		}
		base.setTitle("ホタルビーム", 'Hotaru Beam'); //'Glow of Fireflies');
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.inputdirec(x,y);
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==1 && this.notInputted() && bd.getcnum(this.mouseCell.x,this.mouseCell.y)==this.cellid(new Pos(x,y))) this.inputqnum(x,y,99);
		};
		mv.mousemove = function(x,y){
			if(k.mode==1){
				if(this.notInputted()) this.inputdirec(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,99);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.fontErrcolor = "black";
		pc.fontsizeratio = 0.85;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawDashLines(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawNumCells_firefly(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawNumCells_firefly = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.40;
			var rsize2 = k.cwidth*0.36;
			var rsize3 = k.cwidth*0.10;

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQnumCell(c)!=-1){
					var px=bd.cell[c].px()+int(k.cwidth/2), py=bd.cell[c].py()+int(k.cheight/2);

					g.fillStyle = this.Cellcolor;
					g.beginPath();
					g.arc(px, py, rsize , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cira_",1)){ g.fill(); }

					if(bd.getErrorCell(c)==1){ g.fillStyle = this.errbcolor1;}
					else{ g.fillStyle = "white";}
					g.beginPath();
					g.arc(px, py, rsize2, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cirb_",1)){ g.fill(); }

					this.vdel("c"+c+"_circ_");
					g.fillStyle = this.Cellcolor;
					switch(bd.getDirecCell(c)){
						case  1: py-=(rsize-1); break;
						case  2: py+=(rsize-1); break;
						case  3: px-=(rsize-1); break;
						case  4: px+=(rsize-1); break;
					}
					if(bd.getDirecCell(c)!=0){
						g.beginPath();
						g.arc(px, py, rsize3 , 0, Math.PI*2, false);
						if(this.vnop("c"+c+"_circ_",1)){ g.fill();}
					}
				}
				else{ this.vhide("c"+c+"_cira_"); this.vhide("c"+c+"_cirb_"); this.vdel("c"+c+"_circ_");}

				this.dispnumCell_General(c);
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = enc.decodeArrowNumber16(bstr);}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeArrowNumber16();
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			ans.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
		}

		var saved = this.checkFireflies();
		if( !this.checkErrorFlag(saved,3) ){
			ans.setAlert('黒点同士が線で繋がっています。', 'Black points are connected each other.'); return false;
		}
		if( !this.checkErrorFlag(saved,2) ){
			ans.setAlert('線の曲がった回数が数字と違っています。', 'The number of curves is different from a firefly\'s number.'); return false;
		}
		if( !this.checkErrorFlag(saved,1) ){
			ans.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
		}

		ans.performAsLine = true;
		if( !ans.linkBWarea( ans.searchLarea() ) ){
			ans.setAlert('線が全体で一つながりになっていません。', 'All lines and fireflies are not connected each other.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			ans.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
		}

		if( !this.checkFireflyBeam() ){
			ans.setAlert('ホタルから線が出ていません。', 'There is a lonely firefly.'); return false;
		}

		if( !this.checkStrangeLine(saved) ){
			ans.setAlert('白丸の、黒点でない部分どうしがくっついています。', 'Fireflies are connected without a line starting from black point.'); return false;
		}

		bd.setErrorBorder(bd.borders,0);
		return true;
	},
	check1st : function(){ return true;},

	checkLcntCell : function(val){
		if(ans.lcnts.total[val]==0){ return true;}
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)==-1 && ans.lcnts.cell[c]==val){
				bd.setErrorBorder(bd.borders,2);
				ans.setCellLineError(c,false);
				return false;
			}
		}
		return true;
	},
	checkFireflyBeam : function(val){
		if(ans.lcnts.total[val]==0){ return true;}
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)!=-1 && bd.getDirecCell(c)!=0){
				if((bd.getDirecCell(c)==1 && bd.getLineBorder(bd.cell[c].ub())!=1) ||
				   (bd.getDirecCell(c)==2 && bd.getLineBorder(bd.cell[c].db())!=1) ||
				   (bd.getDirecCell(c)==3 && bd.getLineBorder(bd.cell[c].lb())!=1) ||
				   (bd.getDirecCell(c)==4 && bd.getLineBorder(bd.cell[c].rb())!=1) )
				{
					bd.setErrorCell([c],1);
					return false;
				}
			}
		}
		return true;
	},
	checkStrangeLine : function(saved){
		var idlist = new Array();
		for(var id=0;id<bd.border.length;id++){
			if(bd.getLineBorder(id)==1 && saved.area.check[id]!=2){ idlist.push(id);}
		}
		if(idlist.length>0){
			bd.setErrorBorder(bd.borders,2);
			bd.setErrorBorder(idlist,1);
			return false;
		}
		return true;
	},

	checkFireflies : function(){
		var saved = {errflag:0,cells:new Array(),idlist:new Array(),area:new AreaInfo()};
		for(var i=0;i<bd.border.length;i++){ saved.area.check[i]=0;}

		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)==-1 || bd.getDirecCell(c)==0){ continue;}

			var ccnt=0;
			var idlist = new Array();
			var dir=bd.getDirecCell(c);
			var bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;
			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if((bx+by)%2==0){
					var cc = bd.getcnum(int(bx/2),int(by/2));
					if     (bd.getQnumCell(cc)!=-1){ break;}
					else if(dir!=1 && bd.getLineBorder(bd.getbnum(bx,by+1))==1){ if(dir!=2){ ccnt++;} dir=2;}
					else if(dir!=2 && bd.getLineBorder(bd.getbnum(bx,by-1))==1){ if(dir!=1){ ccnt++;} dir=1;}
					else if(dir!=3 && bd.getLineBorder(bd.getbnum(bx+1,by))==1){ if(dir!=4){ ccnt++;} dir=4;}
					else if(dir!=4 && bd.getLineBorder(bd.getbnum(bx-1,by))==1){ if(dir!=3){ ccnt++;} dir=3;}
				}
				else{
					var id = bd.getbnum(bx,by);
					if(bd.getLineBorder(id)!=1){ break;}
					idlist.push(id);
				}
			}

			for(var i=0;i<idlist.length;i++){ saved.area.check[idlist[i]]=2;}

			var cc = bd.getcnum(int(bx/2),int(by/2));
			if(idlist.length>0 && (bx+by)%2==1 && saved.errflag==0){
				saved = {errflag:1,cells:[c],idlist:idlist,area:saved.area};
			}
			else if(idlist.length>0 && (bx+by)%2==0 && bd.getQnumCell(c)!=-2 && bd.getQnumCell(c)!=ccnt && saved.errflag<=1){
				saved = {errflag:2,cells:[c],idlist:idlist,area:saved.area};
			}
			else if(((bd.getDirecCell(cc)==1 && dir==2) || (bd.getDirecCell(cc)==2 && dir==1) ||
					 (bd.getDirecCell(cc)==3 && dir==4) || (bd.getDirecCell(cc)==4 && dir==3) ) && (bx+by)%2==0 && saved.errflag<=2 )
			{
				saved = {errflag:3,cells:[c,cc],idlist:idlist,area:saved.area};
				return saved;
			}
		}
		return saved;
	},
	checkErrorFlag : function(saved, val){
		if(saved.errflag==val){
			bd.setErrorCell(saved.cells,1);
			bd.setErrorBorder(bd.borders,2);
			bd.setErrorBorder(saved.idlist,1);
			return false;
		}
		return true;
	}
};
