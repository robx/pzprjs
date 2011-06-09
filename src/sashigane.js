//
// パズル固有スクリプト部 さしがね版 sashigane.js v3.3.4
//
Puzzles.sashigane = function(){ };
Puzzles.sashigane.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				this.inputarrow_cell_sashigane();
			}
			else if(k.playmode){
				if(this.btn.Left){ this.inputborderans();}
				else if(this.btn.Right){ this.inputQsubLine();}
			}
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted()){ this.inputqnum_sashigane();}
		};
		mv.mousemove = function(){
			if(k.editmode){
				this.inputarrow_cell_sashigane();
			}
			else if(k.playmode){
				if(this.btn.Left){ this.inputborderans();}
				else if(this.btn.Right){ this.inputQsubLine();}
			}
		};

		mv.inputarrow_cell_sashigane = function(){
			var pos = this.borderpos(0);
			if(this.prevPos.equals(pos) && this.inputData===1){ return;}

			var dir = k.NONE, cc = bd.cnum(this.prevPos.x, this.prevPos.y);
			if(cc!==null){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==k.NONE){
					bd.sDiC(cc,dir);
					bd.sQnC(cc,-1);
					pc.paintCell(cc);
					this.mousereset();
					return;
				}
			}
			this.prevPos = pos;
		};
		mv.inputqnum_sashigane = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell){ return;}

			if(cc===tc.getTCC()){
				var dir = bd.DiC(cc), qn = bd.QnC(cc);
				var min = bd.numminfunc(cc), max = bd.nummaxfunc(cc);
				console.log(min,max);
				if(dir===0){
					bd.sDiC(cc,5);
					if(qn===-1 && this.btn.Right){ bd.sQnC(cc,max);}
				}
				else if(dir===5){
					if(this.btn.Left){
						if     (qn>=max){ bd.sDiC(cc,0); bd.sQnC(cc,-1);}
						else if(qn< min){ bd.sQnC(cc,min);}
						else{ bd.sQnC(cc,qn+1);}
					}
					else if(this.btn.Right){
						if     (qn===-1){ bd.sDiC(cc,0); bd.sQnC(cc,-1);}
						else if(qn<=min){ bd.sQnC(cc,-1);}
						else if(qn> max){ bd.sQnC(cc,max);}
						else{ bd.sQnC(cc,qn-1);}
					}
				}
			}
			else{
				var cc0 = tc.getTCC();
				tc.setTCC(cc);
				pc.paintCell(cc0);
			}

			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(!this.isSHIFT && this.moveTCell(ca)){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.key_sashigane(ca)){ return;}
			this.key_inputqnum_sashigane(ca);
		};

		kc.key_sashigane = function(ca){
			var cc = tc.getTCC();
			if(ca==='q'){
				if(bd.DiC(cc)===5){
					bd.sDiC(cc,0);
					bd.sQnC(cc,-1);
				}
				else{ bd.sDiC(cc,5);}
				pc.paintCell(cc);
				return true;
			}
			return false;
		};
		kc.key_inputqnum_sashigane = function(ca){
			var cc = tc.getTCC();
			if(ca===' ' || ca==='-'){
				if     (ca===' '){ bd.sDiC(cc,0);}
				else if(ca==='-'){ bd.sDiC(cc,((bd.DiC(cc)!==5||bd.QnC(cc)!==-1)?5:0));}
				bd.sQnC(cc,-1);
				pc.paintCell(cc);
				return;
			}

			this.key_inputqnum(ca);
			if(bd.isNum(cc) && bd.DiC(cc)!==5){
				bd.sDiC(cc,5);
				pc.paintCell(cc);
			}
		};

		bd.nummaxfunc = function(cc){
			var bx=this.cell[cc].bx, by=this.cell[cc].by;
			var col = (((bx<(this.maxbx>>1))?(this.maxbx-bx+2):bx+2)>>1);
			var row = (((by<(this.maxby>>1))?(this.maxby-by+2):by+2)>>1);
			return (col+row-1);
		};
		bd.numminfunc = function(cc){ return ((k.qcols>=2?2:1)+(k.qrows>=2?2:1)-1);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.setBorderColorFunc('qans');

		pc.fontAnscolor = "black"; /* 矢印用 */

		pc.circledcolor = "black";
		pc.fontsizeratio = 0.85;
		pc.circleratio = [0.35, 0.40];

		pc.cell_arrow_qdir = true;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawArrowCells();
			this.drawCircles();

			this.drawNumbers();

			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		};

		pc.drawCircles = function(){
			this.vinc('cell_circle', 'auto');

			var rsize2 = this.cw*this.circleratio[1];
			var header = "c_cir_";
			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qdir===5){
					g.strokeStyle = this.cellcolor;
					if(this.vnop(header+c,this.STROKE)){
						g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeSashigane();
		};
		enc.pzlexport = function(type){
			this.encodeSashigane();
		};

		enc.decodeSashigane = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i), obj=bd.cell[c];

				if(this.include(ca,"0","9")||this.include(ca,"a","f"))
								  { obj.qdir = 5; obj.qnum = parseInt(ca,16);}
				else if(ca == '-'){ obj.qdir = 5; obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
				else if(ca == '.'){ obj.qdir = 5;}
				else if(ca>='g' && ca<='j'){ obj.qdir = (parseInt(ca,20)-15);}
				else if(ca>='k' && ca<='z'){ c+=(parseInt(ca,36)-20);}

				c++;
				if(c > bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i);
		};
		enc.encodeSashigane = function(){
			var cm = "", count = 0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="", dir=bd.cell[c].qdir, qn=bd.cell[c].qnum;
				if(dir>=1 && dir<=4){ pstr=(dir+15).toString(20);}
				else if(dir===5){
					if     (qn===-1)        { pstr=".";}
					else if(qn>= 0&&qn<  16){ pstr=    qn.toString(16);}
					else if(qn>=16&&qn< 256){ pstr="-"+qn.toString(16);}
				}
				else{ count++;}

				if     (count=== 0){ cm += pstr;}
				else if(pstr || count===16){ cm += ((count+19).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm += (count+19).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(obj,ca){
				if(ca==="o"){ obj.qdir = 5;}
				else if(ca.charAt(0)==="o"){ obj.qdir = 5; obj.qnum = parseInt(ca.substr(1));}
				else if(ca!=="."){ obj.qdir = parseInt(ca);}
			});
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCell( function(obj){
				if(obj.qdir===5){
					if(obj.qnum===-1){ return "o ";}
					else{ return "o"+obj.qnum+" ";}
				}
				else if(obj.qdir!==0){ return obj.qdir+" ";}
				else{ return ". ";}
			});
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = ans.getLblockInfo();
			if( !this.checkArrowCorner1(rinfo) ){
				this.setAlert('矢印がブロックの端にありません。','An arrow is not at the edge of the block.'); return false;
			}

			if( !this.checkArrowCorner2(rinfo) ){
				this.setAlert('矢印の先にブロックの角がありません。','An arrow doesn\'t indicate the corner of a block.'); return false;
			}

			if( !this.checkCircleCorner(rinfo) ){
				this.setAlert('白丸がブロックの角にありません。','A circle is out of the corner.'); return false;
			}

			if( !this.checkNumberAndSize(rinfo) ){
				this.setAlert('数字とブロックのサイズが違います。','The size of the block is not equal to the number.'); return false;
			}

			if( !this.checkLblock(rinfo) ){
				this.setAlert('ブロックが幅1のL字型になっていません。','A block is not L-shape or whose width is not one.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};

		ans.getLblockInfo = function(){
			var rinfo = area.getRoomInfo();
			rinfo.place = [];

			for(var id=1;id<=rinfo.max;id++){
				var clist = rinfo.room[id].idlist;
				var d = this.getSizeOfClist(clist,f_true);
				var subclist = [];
				for(var bx=d.x1;bx<=d.x2;bx+=2){
					for(var by=d.y1;by<=d.y2;by+=2){
						var cc = bd.cnum(bx,by);
						if(rinfo.id[cc]!=id){ subclist.push(cc);}
					}
				}
				/* 四角形のうち別エリアとなっている部分を調べる */
				/* 幅が1なので座標自体は調べなくてよいはず      */
				var dl = this.getSizeOfClist(subclist,f_true);
				if( subclist.length==0 || (dl.cols*dl.rows!=dl.cnt) || ((d.cols-1)!==dl.cols) || ((d.rows-1)!==dl.rows) ){
					rinfo.room[id].shape = 0;
					for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 0;}
				}
				else{
					rinfo.room[id].shape = 1; /* 幅が1のL字型 */
					for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 1;} /* L字型ブロックのセル */

					/* 端のセル */
					var edge1=null, edge2=null;
					if     ((d.x1===dl.x1&&d.y1===dl.y1)||(d.x2===dl.x2&&d.y2===dl.y2))
								{ edge1 = bd.cnum(d.x1,d.y2); edge2 = bd.cnum(d.x2,d.y1);}
					else if((d.x1===dl.x1&&d.y2===dl.y2)||(d.x2===dl.x2&&d.y1===dl.y1))
								{ edge1 = bd.cnum(d.x1,d.y1); edge2 = bd.cnum(d.x2,d.y2);}
					rinfo.place[edge1] = 2;
					rinfo.place[edge2] = 2;

					/* 角のセル */
					var corner=null;
					if     (d.x1===dl.x1 && d.y1===dl.y1){ corner = bd.cnum(d.x2,d.y2);}
					else if(d.x1===dl.x1 && d.y2===dl.y2){ corner = bd.cnum(d.x2,d.y1);}
					else if(d.x2===dl.x2 && d.y1===dl.y1){ corner = bd.cnum(d.x1,d.y2);}
					else if(d.x2===dl.x2 && d.y2===dl.y2){ corner = bd.cnum(d.x1,d.y1);}
					rinfo.place[corner] = 3;
				}
			}
			
			return rinfo;
		};

		ans.checkArrowCorner1 = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){ continue;}

				var error = false, clist = rinfo.room[id].idlist;
				for(var i=0;i<clist.length;i++){
					var cc = clist[i], num = bd.DiC(cc);
					if(num>=1 && num<=4 && rinfo.place[cc]!==2){
						if(this.inAutoCheck){ return false;}
						bd.sErC(rinfo.room[id].idlist,1);
						result = false;
						break;
					}
				}
			}
			return result;
		};

		ans.checkArrowCorner2 = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){ continue;}

				var error = false, clist = rinfo.room[id].idlist;
				for(var i=0;i<clist.length;i++){
					var cc = clist[i], num = bd.DiC(cc);
					if(num>=1 && num<=4 &&
					   ((num===k.UP && bd.isBorder(bd.ub(cc))) ||
						(num===k.DN && bd.isBorder(bd.db(cc))) ||
						(num===k.LT && bd.isBorder(bd.lb(cc))) ||
						(num===k.RT && bd.isBorder(bd.rb(cc)))) )
					{
						if(this.inAutoCheck){ return false;}
						bd.sErC(rinfo.room[id].idlist,1);
						result = false;
						break;
					}
				}
			}
			return result;
		};

		ans.checkCircleCorner = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){ continue;}

				var clist = rinfo.room[id].idlist;
				for(var i=0;i<clist.length;i++){
					var cc = clist[i];
					if(bd.DiC(cc)===5 && rinfo.place[cc]!==3){
						if(this.inAutoCheck){ return false;}
						bd.sErC(rinfo.room[id].idlist,1);
						result = false;
						break;
					}
				}
			}
			return result;
		};

		ans.checkLblock = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].shape===0){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
