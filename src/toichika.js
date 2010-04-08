//
// パズル固有スクリプト部 遠い誓い版 toichika.js v3.3.0
//
Puzzles.toichika = function(){ };
Puzzles.toichika.prototype = {
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
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		k.area = { bcell:0, wcell:0, number:1};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　キーボードの左側や-キー等で、記号の入力ができます。",
							   " Press left side of the keyboard or '-' key to input marks.");
		}
		else{
			base.setExpression("　左クリックで記号が、右ドラッグで補助記号が入力できます。",
							   " Left Click to input answers, Right Button Drag to input auxiliary marks.");
		}
		base.setTitle("遠い誓い","Toichika");
		base.setFloatbgcolor("rgb(127, 160, 96)");
	},
	menufix : function(){
		kp.defaultdisp = true;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.editmode){ this.inputdirec_toichika(true);}
			else if(k.playmode){
				if(this.btn.Left){ this.inputdirec_toichika(true);}
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				this.inputdirec_mouseup();
			}
		};
		mv.mousemove = function(){
			if     (k.editmode){ this.inputdirec_toichika(false);}
			else if(k.playmode){
				if     (this.btn.Left){ this.inputdirec_toichika(false);}
				else if(this.btn.Right){ this.inputDot(false);}
			}
		};

		mv.bordermode = false;
		mv.inputdirec_toichika = function(ismousedown){
			var pos;
			if(k.editmode){
				if(ismousedown){
					pos = this.crosspos(0.15);
					this.bordermode = (!((pos.x&1)&&(pos.y&1)));
				}
				if(this.bordermode){ this.inputborder(); return;}
			}

			pos = this.cellpos();
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y && this.inputData===1){ return;}

			var inp = 0;
			var cc = bd.cnum(this.mouseCell.x, this.mouseCell.y);
			if(cc!=-1){
				if     (pos.y-this.mouseCell.y==-1){ inp=k.UP;}
				else if(pos.y-this.mouseCell.y== 1){ inp=k.DN;}
				else if(pos.x-this.mouseCell.x==-1){ inp=k.LT;}
				else if(pos.x-this.mouseCell.x== 1){ inp=k.RT;}
				else{ return;}

				bd.setCell(cc,inp);
				pc.paintCell(cc);

				this.mousereset();
			}
			else{
				this.mouseCell = pos;
			}
		};
		mv.inputdirec_mouseup = function(){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell){ return;}

			if(cc==tc.getTCC()){
				var nex = (this.btn.Left ? [k.UP, k.RT, k.LT, -1, k.DN]
										 : [k.LT, -1, k.RT, k.DN, k.UP]);
				if     (k.editmode)    { bd.setCell(cc,nex[bd.DiC(cc)]);}
				else if(bd.DiC(cc)===0){ bd.setCell(cc,nex[(bd.QaC(cc)!==-1?bd.QaC(cc):0)]);}
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

		mv.inputDot = function(){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell || bd.DiC(cc)!==0){ return;}

			if(this.inputData===-1){ this.inputData=(bd.QsC(cc)===1?0:1);}
			
			var cc0 = tc.getTCC(); //tc.setTCC(cc);
			bd.sQaC(cc,-1);
			bd.sQsC(cc,(this.inputData===1?1:0));
			this.mouseCell = cc;

			pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(!this.isSHIFT && this.moveTCell(ca)){ return;}
			kc.key_toichika(ca);
		};
		kc.key_toichika = function(ca){
			var cc = tc.getTCC();
			var flag = false;

			if     (ca=='1'||ca=='w'||(this.isSHIFT && ca==k.KEYUP)){
				bd.setCell(cc,k.UP);
				flag = true;
			}
			else if(ca=='2'||ca=='s'||(this.isSHIFT && ca==k.KEYRT)){
				bd.setCell(cc,k.RT);
				flag = true;
			}
			else if(ca=='3'||ca=='z'||(this.isSHIFT && ca==k.KEYDN)){
				bd.setCell(cc,k.DN);
				flag = true;
			}
			else if(ca=='4'||ca=='a'||(this.isSHIFT && ca==k.KEYLT)){
				bd.setCell(cc,k.LT);
				flag = true;
			}
			else if(ca=='5'||ca=='q'){
				bd.setCell(cc,-2);
				flag = true;
			}
			else if(ca=='6'||ca=='e'||ca==' '||ca=='-'){
				bd.setCell(cc,-1);
				flag = true;
			}

			if(flag){ pc.paintCell(cc);}
			return flag;
		};

		bd.setCell = function(cc,val){
			if(cc===-1){ return;}

			if(val>0){
				// キー・マウス入力しか考えていないので、
				// 同じのが入力されたら消えるようにしちゃいます。
				if(k.editmode){
					bd.sDiC(cc,(this.cell[cc].direc!==val ? val : 0));
					bd.sQaC(cc, -1);
				}
				else if(this.cell[cc].direc===0){
					bd.sQaC(cc,(this.cell[cc].qans!==val ? val : -1));
				}
				bd.sQsC(cc, 0);
			}
			else if(val===-1){
				if(k.editmode){ bd.sDiC(cc,0);}
				bd.sQaC(cc,-1);
				bd.sQsC(cc, 0);
			}
			else if(val===-2){
				if(k.playmode && this.cell[cc].direc===0){
					bd.sQaC(cc,-1);
					bd.sQsC(cc,(this.cell[cc].qsub!==1 ? 1 : 0));
				}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.dotcolor = "rgb(255, 96, 191)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawDotCells(x1,y1,x2,y2);
//			this.drawNumbers(x1,y1,x2,y2);
			this.drawArrows(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};

		pc.drawArrows = function(x1,y1,x2,y2){
			this.vinc('cell_arrow', 'auto');

			var headers = ["c_arup_", "c_ardn_", "c_arlt_", "c_arrt_"];
			var ll = this.cw*0.8;				//LineLength
			var lw = Math.max(this.cw/18, 2);	//LineWidth
			var al = ll*0.5, aw = lw*0.5;	// ArrowLength, ArrowWidth
			var tl = ll*0.5-ll*0.3;			// 矢じりの長さの座標(中心-長さ)
			var tw = Math.max(ll*0.2, 5);	// 矢じりの幅

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
				if(bd.QaC(c)>0 || bd.DiC(c)>0){
					var ax=px=bd.cell[c].cpx;
					var ay=py=bd.cell[c].cpy;
					var dir=(bd.cell[c].direc>0 ? bd.cell[c].direc : bd.cell[c].qans);

					if     (bd.cell[c].error===1){ g.fillStyle = this.fontErrcolor;}
					else if(bd.cell[c].direc>0)  { g.fillStyle = this.fontcolor;}
					else if(bd.cell[c].qans >0)  { g.fillStyle = this.fontAnscolor;}

					// 矢印の描画 ここに来る場合、dirは1～4
					if(this.vnop(headers[(dir-1)]+c,this.FILL)){
						switch(dir){
							case k.UP: g.setOffsetLinePath(ax,ay, 0,-al, -tw,-tl, -aw,-tl, -aw, al,  aw, al, aw,-tl,  tw,-tl, true); break;
							case k.DN: g.setOffsetLinePath(ax,ay, 0, al, -tw, tl, -aw, tl, -aw,-al,  aw,-al, aw, tl,  tw, tl, true); break;
							case k.LT: g.setOffsetLinePath(ax,ay, -al,0, -tl,-tw, -tl,-aw,  al,-aw,  al, aw, -tl,aw, -tl, tw, true); break;
							case k.RT: g.setOffsetLinePath(ax,ay,  al,0,  tl,-tw,  tl,-aw, -al,-aw, -al, aw,  tl,aw,  tl, tw, true); break;
						}
						g.fill();
					}
				}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeDirec4();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeDirec4();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellDirec();
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellDirec();
			this.encodeCellQanssub();
		};

		//---------------------------------------------------------
		enc.decodeDirec4 = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (this.include(ca,"1","4")){ bd.sDiC(c, parseInt(bstr.substr(i,1),10)); c++;}
				else if(this.include(ca,"5","9")){ c += (parseInt(ca,36)-4);}
				else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-4);}
				else if(ca == '.'){ bd.sDiC(c, -2); c++;}
				else{ c++;}

				if(c > bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i);
		};
		enc.encodeDirec4 = function(){
			var cm="", count=0;
			for(var i=0;i<bd.cellmax;i++){
				var pstr = "";
				var val = bd.DiC(i);

				if     (val==-2          ){ pstr = ".";}
				else if(val>= 1 && val<=4){ pstr = val.toString(10);}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==31){ cm+=((4+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(4+count).toString(36);}

			this.outbstr += cm;
		};

		fio.decodeCellDirec = function(){
			this.decodeCell( function(c,ca){
				if     (ca === "-"){ bd.sDiC(c, -2);}
				else if(ca !== "."){ bd.sDiC(c, parseInt(ca));}
			});
		};
		fio.encodeCellDirec = function(){
			this.encodeCell( function(c){
				if     (bd.DiC(c)>=0)  { return (bd.DiC(c).toString() + " ");}
				else if(bd.DiC(c)===-2){ return "- ";}
				else                   { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = area.getRoomInfo();
			if( !this.checkAllArea(rinfo, ans.isObject, function(w,h,a,n){ return (a<=1);}) ){
				this.setAlert('1つの国に2つ以上の矢印が入っています。','A country has plural arrows.'); return false;
			}

			var ainfo = ans.getPairedArrows();
			if( !this.checkAdjacentCountries(rinfo, ainfo) ){
				this.setAlert('辺を共有する国にペアとなる矢印が入っています。','There are paired arrows in adjacent countries.'); return false;
			}

			if( !this.checkDirectionOfArrow(ainfo) ){
				this.setAlert('矢印の先にペアとなる矢印がいません。','There is not paired arrow in the direction of an arrow.'); return false;
			}

			if( !this.checkAllArea(rinfo, ans.isObject, function(w,h,a,n){ return (a>=1);}) ){
				this.setAlert('国に矢印が入っていません。','A country has no arrow.'); return false;
			}

			return true;
		};

		ans.isObject = function(c){ return (c!==-1 && (bd.cell[c].direc!==0 || bd.cell[c].qans!==-1));};

		ans.getPairedArrows = function(){
			var ainfo=[], check=[];
			for(var c=0;c<bd.cellmax;c++){ check[c]=(ans.isObject(c)?0:-1);}
			for(var c=0;c<bd.cellmax;c++){
				if(check[c]!==0){ continue;}
				var cx=bd.cell[c].cx, cy=bd.cell[c].cy, tc=c,
					dir=(bd.cell[c].direc!==0 ? bd.cell[c].direc : bd.cell[c].qans);

				while(1){
					switch(dir){ case k.UP: cy--; break; case k.DN: cy++; break; case k.LT: cx--; break; case k.RT: cx++; break;}
					tc = bd.cnum(cx,cy);
					if(tc===-1){ ainfo.push([c]); break;}
					if(tc!==-1 && check[tc]!==-1){
						var tdir = (bd.cell[tc].direc!==0 ? bd.cell[tc].direc : bd.cell[tc].qans);
						if(tdir!==[0,k.DN,k.UP,k.RT,k.LT][dir]){ ainfo.push([c]);}
						else{ ainfo.push([c,tc]);}
						break;
					}
				}
			}
			return ainfo;
		};

		ans.checkDirectionOfArrow = function(ainfo){
			var result = true;
			for(var i=0;i<ainfo.length;i++){
				if(ainfo[i].length===1){
					bd.sErC(ainfo[i],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkAdjacentCountries = function(rinfo, ainfo){
			// 隣接エリア情報を取得する
			var adjs = [];
			for(var r=1;r<=rinfo.max-1;r++){
				adjs[r] = [];
				for(var s=r+1;s<=rinfo.max;s++){ adjs[r][s]=0;}
			}
			for(var id=0;id<bd.bdmax;id++){
				if(!bd.isBorder(id)){ continue;}
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1==-1 || cc2==-1){ continue;}
				var r1=rinfo.id[cc1], r2=rinfo.id[cc2];
				try{
					if(r1<r2){ adjs[r1][r2]++;}
					if(r1>r2){ adjs[r2][r1]++;}
				}catch(e){ alert([r1,r2]); throw 0;}
			}

			// ここから実際の判定
			var result = true;
			for(var i=0;i<ainfo.length;i++){
				if(ainfo[i].length===1){ continue;}
				var r1 = rinfo.id[ainfo[i][0]], r2 = rinfo.id[ainfo[i][1]];
				if((r1<r2 ? adjs[r1][r2] : adjs[r2][r1])>0){
					bd.sErC(rinfo.room[r1].idlist,1);
					bd.sErC(rinfo.room[r2].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
