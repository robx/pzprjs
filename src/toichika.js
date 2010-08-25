//
// パズル固有スクリプト部 遠い誓い版 toichika.js v3.3.2
//
Puzzles.toichika = function(){ };
Puzzles.toichika.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.isAnsNumber     = true;
		k.numberAsObject  = true;

		k.ispzprv3ONLY    = true;

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
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				this.checkBorderMode();
				if(this.bordermode){ this.inputborder();}
				else               { this.inputdirec_toichika();}
			}
			else if(k.playmode){
				if(this.btn.Left){ this.inputdirec_toichika();}
				else if(this.btn.Right){ this.inputDot();}
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){ this.inputqnum();}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.bordermode){ this.inputborder();}
				else               { this.inputdirec_toichika();}
			}
			else if(k.playmode){
				if     (this.btn.Left){ this.inputdirec_toichika();}
				else if(this.btn.Right){ this.inputDot();}
			}
		};

		mv.inputdirec_toichika = function(){
			var pos = this.borderpos(0);
			if(this.prevPos.equals(pos) && this.inputData===1){ return;}

			var dir = k.NONE, cc = bd.cnum(this.prevPos.x, this.prevPos.y);
			if(cc!==null){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==k.NONE){
					bd.setNum(cc,dir);
					pc.paintCell(cc);
					this.mousereset();
					return;
				}
			}
			this.prevPos = pos;
		};

		mv.inputDot = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell || bd.QnC(cc)!==-1){ return;}

			if(this.inputData===null){ this.inputData=(bd.QsC(cc)===1?0:1);}
			
			bd.sAnC(cc,-1);
			bd.sQsC(cc,(this.inputData===1?1:0));
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(!this.isSHIFT && this.moveTCell(ca)){ return;}
			this.key_toichika(ca);
		};
		kc.key_toichika = function(ca){
			if     (ca==='1'||ca==='w'||(this.isSHIFT && ca===k.KEYUP)){ ca='1';}
			else if(ca==='2'||ca==='s'||(this.isSHIFT && ca===k.KEYRT)){ ca='4';}
			else if(ca==='3'||ca==='z'||(this.isSHIFT && ca===k.KEYDN)){ ca='2';}
			else if(ca==='4'||ca==='a'||(this.isSHIFT && ca===k.KEYLT)){ ca='3';}
			else if(ca==='5'||ca==='q'||ca==='-')                      { ca='s1';}
			else if(ca==='6'||ca==='e'||ca===' ')                      { ca=' ';}
			this.key_inputqnum(ca);
		};

		bd.maxnum = 4;

		menu.ex.adjustSpecial = function(key,d){
			var trans = {};
			switch(key){
				case this.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case this.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case this.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case this.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val = trans[bd.QnC(c)]; if(!!val){ bd.sQnC(c,val);}
				var val = trans[bd.AnC(c)]; if(!!val){ bd.sAnC(c,val);}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.dotcolor = pc.dotcolor_PINK;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawDotCells(true);
			this.drawArrows();
			this.drawNumbers();

			this.drawChassis();

			this.drawCursor();
		};

		pc.drawArrows = function(){
			this.vinc('cell_arrow', 'auto');

			var headers = ["c_arup_", "c_ardn_", "c_arlt_", "c_arrt_"];
			var ll = this.cw*0.8;				//LineLength
			var lw = Math.max(this.cw/18, 2);	//LineWidth
			var al = ll*0.5, aw = lw*0.5;	// ArrowLength, ArrowWidth
			var tl = ll*0.5-ll*0.3;			// 矢じりの長さの座標(中心-長さ)
			var tw = Math.max(ll*0.2, 5);	// 矢じりの幅

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], dir=bd.getNum(c);
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
				if(dir>0){
					g.fillStyle = this.getCellNumberColor(c);

					// 矢印の描画 ここに来る場合、dirは1～4
					if(this.vnop(headers[(dir-1)]+c,this.FILL)){
						var ax=px=bd.cell[c].cpx;
						var ay=py=bd.cell[c].cpy;
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

		pc.drawNumber1 = function(c){
			var num = bd.getNum(c), obj = bd.cell[c], key='cell_'+c;
			if(num===-2){
				this.dispnum(key, 1, "?", 0.8, this.fontcolor, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decode4Cell_toichika();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encode4Cell_toichika();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		};

		//---------------------------------------------------------
		enc.decode4Cell_toichika = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(this.include(ca,"1","4")){ bd.cell[c].qnum = parseInt(bstr.substr(i,1),10);}
				else if(ca==='.')           { bd.cell[c].qnum = -2;}
				else                        { c += (parseInt(ca,36)-5);}

				c++;
				if(c>=bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i);
		};
		enc.encode4Cell_toichika = function(){
			var cm="", count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr = "", val = bd.cell[c].qnum;

				if     (val===-2)        { pstr = ".";}
				else if(val>=1 && val<=4){ pstr = val.toString(10);}
				else{ count++;}

				if(count===0){ cm += pstr;}
				else if(pstr || count===31){ cm+=((4+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(4+count).toString(36);}

			this.outbstr += cm;
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = area.getRoomInfo();
			if( !this.checkAllArea(rinfo, bd.isNum, function(w,h,a,n){ return (a<=1);}) ){
				this.setAlert('1つの国に2つ以上の矢印が入っています。','A country has plural arrows.'); return false;
			}

			var ainfo = ans.getPairedArrows();
			if( !this.checkAdjacentCountries(rinfo, ainfo) ){
				this.setAlert('辺を共有する国にペアとなる矢印が入っています。','There are paired arrows in adjacent countries.'); return false;
			}

			if( !this.checkDirectionOfArrow(ainfo) ){
				this.setAlert('矢印の先にペアとなる矢印がいません。','There is not paired arrow in the direction of an arrow.'); return false;
			}

			if( !this.checkAllArea(rinfo, bd.isNum, function(w,h,a,n){ return (a>=1);}) ){
				this.setAlert('国に矢印が入っていません。','A country has no arrow.'); return false;
			}

			return true;
		};

		ans.getPairedArrows = function(){
			var ainfo=[], isarrow=[];
			for(var c=0;c<bd.cellmax;c++){ isarrow[c]=bd.isNum(c);}
			for(var c=0;c<bd.cellmax;c++){
				if(bd.noNum(c)){ continue;}
				var bx=bd.cell[c].bx, by=bd.cell[c].by, tc=c, dir=bd.getNum(c);

				while(1){
					switch(dir){ case k.UP: by-=2; break; case k.DN: by+=2; break; case k.LT: bx-=2; break; case k.RT: bx+=2; break;}
					tc = bd.cnum(bx,by);
					if(tc===null){ ainfo.push([c]); break;}
					if(!!isarrow[tc]){
						var tdir = bd.getNum(tc);
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
				if(cc1===null || cc2===null){ continue;}
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
