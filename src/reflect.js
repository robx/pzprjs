//
// パズル固有スクリプト部 リフレクトリンク版 reflect.js v3.3.1
//
Puzzles.reflect = function(){ };
Puzzles.reflect.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 1;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = true;	// 線が交差するパズル
		k.isCenterLine    = true;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = false;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

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

		pc.paint = function(x1,y1,x2,y2){
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
			var idlist = bd.borderinside(x1-1,y1-1,x2+2,y2+2);
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

			var clist = bd.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){ this.draw101_1(clist[i]);}
		};
		pc.draw101_1 = function(id){
			var vids = ["c_lp1_"+id, "c_lp2_"+id];

			if(bd.cell[id].ques===101){
				var lw = this.lw+2, lm=(lw-1)/2, ll=this.cw*0.76;
				g.fillStyle = this.cellcolor;

				// Gridの真ん中＝cpx,cpy+0.5
				if(this.vnop(vids[0],this.NONE)){
					g.fillRect(bd.cell[id].cpx+0.5-lm, bd.cell[id].cpy+0.5-ll/2,  lw, ll);
				}
				if(this.vnop(vids[1],this.NONE)){
					g.fillRect(bd.cell[id].cpx+0.5-ll/2, bd.cell[id].cpy+0.5-lm,  ll, lw);
				}
			}
			else{ this.vhide(vids);}
		};
		pc.drawNumber1 = function(c){
			var obj = bd.cell[c], key = ['cell',c].join('_');
			if((obj.ques>=2 && obj.ques<=5) && obj.qnum>0){
				this.dispnum(key, obj.ques, ""+obj.qnum, 0.45, "white", obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		},

		line.repaintParts = function(idlist){
			var clist = this.getClistFromIdlist(idlist);
			for(var i=0;i<clist.length;i++){
				pc.draw101_1(clist[i]);
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

				if     (ca==='5'){ bd.sQuC(c, 101);}
				else if(this.include(ca,'1','4')){
					bd.cell[c].ques = parseInt(ca)+1;
					bd.cell[c].qnum = parseInt(bstr.substr(i+1,1),16);
					i++;
				}
				else if(this.include(ca,'6','9')){
					bd.cell[c].ques = parseInt(ca)-4;
					bd.cell[c].qnum = parseInt(bstr.substr(i+1,2),16);
					i+=2;
				}
				else if(this.include(ca,'a','z')){ c+=(parseInt(ca,36)-10);}

				c++;
				if(c>=bd.cellmax){ break;}
			}

			this.outbstr = bstr.substr(i);
		};
		enc.encodeReflectlink = function(type){
			var cm="", pstr="", count=0;
			for(var c=0;c<bd.cellmax;c++){
				var qu=bd.cell[c].ques;
				if     (qu===101){ pstr = "5";}
				else if(qu>=2 && qu<=5){
					var val = bd.cell[c].qnum;
					if     (val<= 0){ pstr = ""+(qu-1)+"0";}
					else if(val>= 1 && val< 16){ pstr = ""+(qu-1)+val.toString(16);}
					else if(val>=16 && val<256){ pstr = ""+(qu+4)+val.toString(16);}
				}
				else{ pstr = ""; count++;}

				if(count===0){ cm += pstr;}
				else if(pstr || count===26){ cm+=((9+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(9+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(obj,ca){
				if     (ca==="+"){ obj.ques = 101;}
				else if(ca!=="."){
					obj.ques = parseInt(ca.charAt(0))+1;
					if(ca.length>1){ obj.qnum = parseInt(ca.substr(1));}
				}
			});
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCell( function(obj){
				if     (obj.ques===101) { return "+ ";}
				else if(obj.ques>=2 && obj.ques<=5) {
					return ""+(obj.ques-1)+(obj.qnum!==-1 ? obj.qnum : "")+" ";
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
