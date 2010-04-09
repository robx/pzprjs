//
// パズル固有スクリプト部 リフレクトリンク版 reflect.js v3.3.0
//
Puzzles.reflect = function(){ };
Puzzles.reflect.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 1;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
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

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　問題の記号はQWEASの各キーで入力、Tキーや-キーで消去できます。",
							   " Press each QWEAS key to input question. Press 'T' or '-' key to erase.");
		}
		else{
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		base.setTitle("リフレクトリンク","Reflect Link");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		if(k.EDITOR){ kp.defaultdisp = true;}
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(!kp.enabled()){ this.inputQues([0,2,3,4,5,101]);}
				else{ kp.display();}
			}
			else if(k.playmode){
				if     (this.btn.Left)  this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if     (this.btn.Left)  this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		bd.enableLineNG = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			if(this.key_inputLineParts(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.key_inputLineParts = function(ca){
			if(k.playmode){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'){ bd.sQuC(cc,2); bd.sQnC(cc,-1);}
			else if(ca=='w'){ bd.sQuC(cc,3); bd.sQnC(cc,-1);}
			else if(ca=='e'){ bd.sQuC(cc,4); bd.sQnC(cc,-1);}
			else if(ca=='r'){ bd.sQuC(cc,5); bd.sQnC(cc,-1);}
			else if(ca=='t'){ bd.sQuC(cc,101); bd.sQnC(cc,-1);}
			else if(ca=='y'){ bd.sQuC(cc,0); bd.sQnC(cc,-1);}
			else{ return false;}

			pc.paintCellAround(cc);
			return true;
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('image','knumq','q',[0,0]);
				this.inputcol('image','knumw','w',[1,0]);
				this.inputcol('image','knume','e',[2,0]);
				this.inputcol('image','knumr','r',[3,0]);
				this.inputcol('num','knumt','t','╋');
				this.inputcol('num','knumy','y',' ');
				this.insertrow();
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.insertrow();
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum0','0','0');
				this.inputcol('num','knum.','-','-');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.imgCR = [4,1];
			kp.kpinput = function(ca){
				if(kc.key_inputLineParts(ca)){ return;}
				kc.key_inputqnum(ca);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawTriangle(x1,y1,x2,y2);
			this.drawTriangleBorder(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.draw101(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawTriangleBorder = function(x1,y1,x2,y2){
			this.vinc('cell_triangle_border', 'crispEdges');

			var header = "b_tb_";
			var idlist = this.borderinside(x1-1,y1-1,x2+2,y2+2);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], lflag = !(bd.border[id].bx&1);
				var qs1 = bd.QuC(bd.border[id].cellcc[0]),
					qs2 = bd.QuC(bd.border[id].cellcc[1]);

				g.fillStyle = this.gridcolor;
				if(lflag && (qs1===3||qs1===4)&&(qs2===2||qs2===5)){
					if(this.vnop(header+id,this.NONE)){
						g.fillRect(bd.border[id].px, bd.border[id].py-this.bh, 1, this.ch);
					}
				}
				else if(!lflag && (qs1===2||qs1===3)&&(qs2===4||qs2===5)){
					if(this.vnop(header+id,this.NONE)){
						g.fillRect(bd.border[id].px-this.bw, bd.border[id].py, this.cw, 1);
					}
				}
				else{ this.vhide(header+id);}
			}
		};
		pc.draw101 = function(x1,y1,x2,y2){
			this.vinc('cell_ques', 'crispEdges');

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){ this.draw101_1(clist[i]);}
		};
		pc.draw101_1 = function(id){
			var vids = ["c_lp1_"+id, "c_lp2_"+id];

			if(bd.cell[id].ques===101){
				var lw = this.lw, lm=this.lm, mgn = this.cw*0.38;
				g.fillStyle = this.Cellcolor;

				if(this.vnop(vids[0],this.NONE)){
					g.fillRect(bd.cell[id].cpx-lm, bd.cell[id].cpy-mgn,  lw+2, this.ch-2*mgn);
				}
				if(this.vnop(vids[1],this.NONE)){
					g.fillRect(bd.cell[id].cpx-mgn, bd.cell[id].cpy-lm,  this.cw-2*mgn, lw+2);
				}
			}
			else{ this.vhide(vids);}
		};
		pc.isdispnumCell = function(id){ return ((bd.QuC(id)>=2 && bd.QuC(id)<=5) && bd.QnC(id)>0);};

		line.repaintParts = function(idlist){
			var cdata=[];
			for(var c=0;c<bd.cellmax;c++){ cdata[c]=false;}
			for(var i=0;i<idlist.length;i++){
				cdata[bd.border[idlist[i]].cellcc[0]] = true;
				cdata[bd.border[idlist[i]].cellcc[1]] = true;
			}
			for(var c=0;c<cdata.length;c++){
				if(cdata[c]){
					pc.draw101_1(c);
				}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeReflectlink();
		};
		enc.pzlexport = function(type){
			this.encodeReflectlink();
		};

		enc.decodeReflectlink = function(){
			var c=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca == '5'){ bd.sQuC(c, 101); c++;}
				else if(ca >= '1' && ca <= '4'){
					bd.sQuC(c, parseInt(ca)+1);
					bd.sQnC(c, parseInt(bstr.substr(i+1,1),16));
					c++; i++;
				}
				else if(ca >= '6' && ca <= '9'){
					bd.sQuC(c, parseInt(ca)-4);
					bd.sQnC(c, parseInt(bstr.substr(i+1,2),16));
					c++; i+=2;
				}
				else if(ca >= 'a' && ca <= 'z'){ c += (parseInt(ca,36)-9);}
				else{ c++;}

				if(c > bd.cellmax){ break;}
			}

			this.outbstr = bstr.substr(i);
		};
		enc.encodeReflectlink = function(type){
			var cm="", pstr="";
			var count=0;
			for(var i=0;i<bd.cellmax;i++){
				if     (bd.QuC(i)==101){ pstr = "5";}
				else if(bd.QuC(i)>=2 && bd.QuC(i)<=5){
					var val = bd.QnC(i);
					if     (val<= 0){ pstr = ""+(bd.QuC(i)-1)+"0";}
					else if(val>= 1 && val< 16){ pstr = ""+(bd.QuC(i)-1)+val.toString(16);}
					else if(val>=16 && val<256){ pstr = ""+(bd.QuC(i)+4)+val.toString(16);}
				}
				else{ pstr = ""; count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(9+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(c,ca){
				if(ca == "+"){ bd.sQuC(c, 101);}
				else if(ca != "."){
					bd.sQuC(c, parseInt(ca.charAt(0))+1);
					if(ca.length>1){ bd.sQnC(c, parseInt(ca.substr(1)));}
				}
			});
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCell( function(c){
				if     (bd.QuC(c)==101) { return "+ ";}
				else if(bd.QuC(c)>=2 && bd.QuC(c)<=5) {
					if(bd.QnC(c)==-1){ return ""+(bd.QuC(c)-1).toString()+" ";}
					else{ return ""+(bd.QuC(c)-1).toString()+(bd.QnC(c)).toString()+" ";}
				}
				else{ return ". ";}
			});
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			this.performAsLine = true;

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==4 && bd.QuC(c)!=101);}) ){
				this.setAlert('十字以外の場所で線が交差しています。','There is a crossing line out of cross mark.'); return false;
			}

			if( !this.checkTriNumber(1) ){
				this.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
			}
			if( !this.checkTriangle() ){
				this.setAlert('線が三角形を通過していません。','A line doesn\'t goes through a triangle.'); return false;
			}
			if( !this.checkTriNumber(2) ){
				this.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)!=4 && bd.QuC(c)==101);}) ){
				this.setAlert('十字の場所で線が交差していません。','There isn\'t a crossing line on a cross mark.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkLcntCell(1);};

		ans.checkTriangle = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(line.lcntCell(c)==0 && (bd.QuC(c)>=2 && bd.QuC(c)<=5)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],4);
					result = false;
				}
			}
			return result;
		};

		ans.checkTriNumber = function(type){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)<2 || bd.QuC(c)>5 || bd.QnC(c)<=0){ continue;}

				var list = [];
				var cnt=1;
				var tx, ty;

				bx = bd.cell[c].bx-1; by = bd.cell[c].by;
				while(bx>bd.minbx){ var id=bd.bnum(bx,by); if(bd.isLine(id)){ cnt++; list.push(id); bx-=2;} else{ break;} }
				bx = bd.cell[c].bx+1; by = bd.cell[c].by;
				while(bx<bd.maxbx){ var id=bd.bnum(bx,by); if(bd.isLine(id)){ cnt++; list.push(id); bx+=2;} else{ break;} }
				bx = bd.cell[c].bx; by = bd.cell[c].by-1;
				while(by>bd.minby){ var id=bd.bnum(bx,by); if(bd.isLine(id)){ cnt++; list.push(id); by-=2;} else{ break;} }
				bx = bd.cell[c].bx; by = bd.cell[c].by+1;
				while(by<bd.maxby){ var id=bd.bnum(bx,by); if(bd.isLine(id)){ cnt++; list.push(id); by+=2;} else{ break;} }

				if(type==1?bd.QnC(c)<cnt:bd.QnC(c)>cnt){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],4);
					if(result){ bd.sErBAll(2);}
					bd.sErB(list,1);
					result = false;
				}
			}
			return result;
		};
	}
};
