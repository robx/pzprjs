//
// パズル固有スクリプト部 交差は直角に限る版 kouchoku.js v3.3.3
//
Puzzles.kouchoku = function(){ };
Puzzles.kouchoku.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}
		if(!k.qrows){ k.qrows = 7;}

		k.irowake  = 1;
		k.iscross  = 2;

		k.ispzprv3ONLY    = true;

		k.bdmargin       = 0.70;
		k.bdmargin_image = 0.50;

		base.setFloatbgcolor("rgb(127, 127, 127)");
	},
	menufix : function(){
		pp.addCheck('circolor','setting',true,'点をグレーにする','Set Grey Color');
		pp.setLabel('circolor', '線が2本になったら点をグレーにする', 'Grey if the number of linked segment is two.');
		pp.funcs['circolor'] = function(){ pc.paintAll();};

		pp.addCheck('enline','setting',true,'線は点の間','Line between points');
		pp.setLabel('enline', '点の間のみ線を引けるようにする', 'Able to draw line only between the points.');

		pp.addCheck('lattice','setting',true,'格子点チェック','Check lattice point');
		pp.setLabel('lattice', '点を通過する線を引けないようにする', 'Disable drawing segment passing over a lattice point.');
	},
	finalfix : function(){
		ee('btnclear2').el.style.display = 'none';
	},
	protoChange : function(){
		Cross.prototype.segment = [];

		Operation.prototype.decodeSpecial = function(strs){
			this.property = 'segment';
			this.id = [strs[1],strs[2],strs[3],strs[4]];
			this.old = +strs[5];
			this.num = +strs[6];
		};
		Operation.prototype.toStringSpecial = function(){
			return ['SG', this.id[0], this.id[1], this.id[2], this.id[3], this.old, this.num].join(',');
		};
	},
	protoOriginal : function(){
		delete Cross.prototype.segment;
		ee('btnclear2').el.style.display = 'inline';

		Operation.prototype.decodeSpecial = function(strs){};
		Operation.prototype.toStringSpecial = function(){};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode){ this.inputsegment();}
			else if(k.editmode){ this.inputcross_kouchoku();}
		};
		mv.mouseup = function(){
			if(k.playmode){ this.inputsegment_up();}
		};
		mv.mousemove = function(){
			if(k.playmode){ this.inputsegment();}
		};

		mv.inputsegment = function(){
			var cc = this.crossid();
			if(cc===null || cc===this.mouseCell){ return;}

			if(this.ismousedown){
				this.inputData = 1;
				this.targetPoint[0] = cc;
				pc.paintCross(cc);
			}
			else if(this.inputData===1){
				var old=this.targetPoint[1];
				this.targetPoint[1] = cc;
				pc.paintCross(cc);
				if(old!==null){ pc.paintCross(old);}
			}
		};
		mv.inputsegment_up = function(){
			var cc = this.crossid();
			if(cc===null || cc===this.mouseCell || this.inputData!==1){ return;}

			var cc1=this.targetPoint[0], cc2=this.targetPoint[1];
			this.targetPoint = [null, null];
			if(cc1!==null){ pc.paintCross(cc1);}
			if(cc2!==null){ pc.paintCross(cc2);}
			if(cc1!==null && cc2!==null){
				if(!pp.getVal('enline') || (bd.cross[cc1].qnum!==-1 && bd.cross[cc2].qnum!==-1)){
					var bx1=bd.cross[cc1].bx, bx2=bd.cross[cc2].bx,
						by1=bd.cross[cc1].by, by2=bd.cross[cc2].by, tmp;
					if(!pp.getVal('lattice') || ans.getLatticePoint(bx1,by1,bx2,by2).length===0){
						bd.segs.input(bx1,by1,bx2,by2);
						if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;}
						if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
						pc.paintRange(bx1,by1,bx2,by2);
					}
				}
			}
		};

		var canvas = ee('divques').el;
		ee.addEvent(canvas, "mouseout",  function(e){ mv.mv_e_mouseout.call(mv,e);});
		mv.mv_e_mouseout = function(e){
			// 子要素に入ってもイベントが起きてしまうので、サイズを確認する
			var ex=ee.pageX(e), ey=ee.pageY(e), rect=ee('divques').getRect();
			if(ex<=rect.left || ex>=rect.right || ey<=rect.top || ey>=rect.bottom){
				if(this.inputData===1){
					var cc1=this.targetPoint[0], cc2=this.targetPoint[1];
					this.targetPoint = [null, null];
					if(cc1!==null){ pc.paintCross(cc1);}
					if(cc2!==null){ pc.paintCross(cc2);}
				}
				this.mousereset();
			}
		};

		mv.inputcross_kouchoku = function(){
			var cc = this.crossid();
			if(cc===null || cc===this.mouseCell){ return;}

			if(cc===tc.getTXC()){
				var qn = bd.QnX(cc);
				if(this.btn.Left){
					if     (qn===26){ bd.sQnX(cc,-1);}
					else if(qn===-1){ bd.sQnX(cc,-2);}
					else if(qn===-2){ bd.sQnX(cc, 1);}
					else{ bd.sQnX(cc,qn+1);}
				}
				else if(this.btn.Right){
					if     (qn==-2){ bd.sQnX(cc,-1);}
					else if(qn==-1){ bd.sQnX(cc,26);}
					else if(qn== 1){ bd.sQnX(cc,-2);}
					else{ bd.sQnX(cc,qn-1);}
				}
			}
			else{
				var cc0 = tc.getTXC();
				tc.setTXC(cc);
				pc.paintCross(cc0);
			}
			this.mouseCell = cc;

			pc.paintCross(cc);
		};
		mv.targetPoint = [null, null];

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCross(ca)){ return;}
			this.key_inputqnum_kouchoku(ca);
		};
		kc.key_inputqnum_kouchoku = function(ca){
			var c = tc.getTXC();

			if(ca==k.KEYUP||ca==k.KEYDN||ca==k.KEYLT||ca==k.KEYRT||!!menu.pop){ return;}
			else if('a'<=ca && ca<='z'){
				var num = parseInt(ca,36)-9;
				if(bd.QnX(c)===num){ bd.sQnX(c,-1);}
				else{ bd.sQnX(c,num);}
			}
			else if(ca=='-'){ bd.sQnX(c,(bd.QnX(c)!==-2?-2:-1));}
			else if(ca==' '){ bd.sQnX(c,-1);}
			else{ return;}

			this.prev = c;
			pc.paintCross(c);
		};

		tc.setCrossType();

		bd.maxnum = 26;
		bd.segs = new SegmentManager();

		bd.disableInfo = function(){
			um.disableRecord();
			this.segs.disableRecord();
		};
		bd.enableInfo = function(){
			um.enableRecord();
			this.segs.enableRecord();
		};
		bd.resetInfo = function(){
			this.segs.reset();
		};

		bd.allclearSpecial = function(isrec){
			var idlist = this.segs.getallsegment();
			for(var i=0;i<idlist.length;i++){
				pc.eraseSegment1(idlist[i]);
			}
			this.segs.init();
		};
		bd.ansclearSpecial = function(){
			var idlist = this.segs.getallsegment();
			for(var i=0;i<idlist.length;i++){
				pc.eraseSegment1(idlist[i]);
				this.segs.removeSegment(idlist[i]);
			}
			this.segs.init();
		};
		bd.errclearSpecial = function(){
			var idlist = this.segs.getallsegment();
			for(var i=0;i<idlist.length;i++){ this.segs.seg[idlist[i]].error=0;}
		};

		um.execSpecial = function(ope, num){
			if(ope.property=='segment'){
				var bx1=+ope.id[0],by1=+ope.id[1],bx2=+ope.id[2],by2=+ope.id[3],tmp;
				if     (num===1){ bd.segs.setSegment   (bx1,by1,bx2,by2);}
				else if(num===0){ bd.segs.removeSegment(bx1,by1,bx2,by2);}
				if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;} if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
				this.paintStack(bx1,by1,bx2,by2);
			}
		};

		menu.ex.adjustSpecial = function(key,d){
			var idlist=bd.segs.getallsegment();
			if(key & this.REDUCE){
				var sublist=[];
				for(var i=0;i<idlist.length;i++){
					var id=idlist[i], seg=bd.segs.seg[id];
					var bx1=seg.bx1, by1=seg.by1, bx2=seg.bx2, by2=seg.by2;
					switch(key){
						case this.REDUCEUP: if(by1<bd.minby+2||by2<bd.minby+2){ sublist.push(id);} break;
						case this.REDUCEDN: if(by1>bd.maxby-2||by2>bd.maxby-2){ sublist.push(id);} break;
						case this.REDUCELT: if(bx1<bd.minbx+2||bx2<bd.minbx+2){ sublist.push(id);} break;
						case this.REDUCERT: if(bx1>bd.maxbx-2||bx2>bd.maxbx-2){ sublist.push(id);} break;
					}
				}

				var isrec = (!um.undoExec && !um.redoExec);
				if(isrec){ um.forceRecord = true;}
				for(var i=0;i<sublist.length;i++){ bd.segs.removeSegment(sublist[i]);}
				if(isrec){ um.forceRecord = false;}

				idlist=bd.segs.getallsegment(); // 再取得
			}

			var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i], seg=bd.segs.seg[id];
				var bx1=seg.bx1, by1=seg.by1, bx2=seg.bx2, by2=seg.by2;
				switch(key){
					case this.FLIPY: seg.setpos(bx1,yy-by1,bx2,yy-by2,k.qcols,k.qrows); break;
					case this.FLIPX: seg.setpos(xx-bx1,by1,xx-bx2,by2,k.qcols,k.qrows); break;
					case this.TURNR: seg.setpos(yy-by1,bx1,yy-by2,bx2,k.qrows,k.qcols); break;
					case this.TURNL: seg.setpos(by1,xx-bx1,by2,xx-bx2,k.qrows,k.qcols); break;
					case this.EXPANDUP: seg.setpos(bx1,  by1+2,bx2,  by2+2,k.qcols,k.qrows+1); break;
					case this.EXPANDDN: seg.setpos(bx1,  by1,  bx2,  by2,  k.qcols,k.qrows+1); break;
					case this.EXPANDLT: seg.setpos(bx1+2,by1,  bx2+2,by2,  k.qcols+1,k.qrows); break;
					case this.EXPANDRT: seg.setpos(bx1,  by1,  bx2,  by2,  k.qcols+1,k.qrows); break;
					case this.REDUCEUP: seg.setpos(bx1,  by1-2,bx2,  by2-2,k.qcols,k.qrows-1); break;
					case this.REDUCEDN: seg.setpos(bx1,  by1,  bx2,  by2,  k.qcols,k.qrows-1); break;
					case this.REDUCELT: seg.setpos(bx1-2,by1,  bx2-2,by2,  k.qcols-1,k.qrows); break;
					case this.REDUCERT: seg.setpos(bx1,  by1,  bx2,  by2,  k.qcols-1,k.qrows); break;
				}
			}
		};

		menu.ex.irowakeRemake = function(){
			bd.segs.newIrowake();
			if(pp.getVal('irowake')){ pc.paintAll();}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;

		pc.paint = function(){
			this.drawDashedGrid(false);

			this.drawSegments();

			this.drawCrosses_kouchoku();
			this.drawSegmentTarget();
			this.drawTarget();
		};

		pc.drawSegments = function(){
			this.vinc('segment', 'auto');

			var idlist = bd.segs.segmentinside(this.range.x1,this.range.y1,this.range.x2,this.range.y2);
			for(var i=0;i<idlist.length;i++){ this.drawSegment1(idlist[i],true);}
		};
		pc.eraseSegment1 = function(id){
			this.vinc('segment', 'auto');
			this.drawSegment1(id,false);
		};
		pc.drawSegment1 = function(id,isdraw){
			g.lineWidth = this.lw;

			var seg = bd.segs.seg[id];
			var header_id = ["seg",seg.bx1,seg.by1,seg.bx2,seg.by2].join("_");
			if(isdraw){
				if     (seg.error===1){ g.strokeStyle = this.errlinecolor1;}
				else if(seg.error===2){ g.strokeStyle = this.errlinecolor2;}
				else if(k.irowake===0 || !pp.getVal('irowake') || !seg.color){ g.strokeStyle = this.linecolor;}
				else{ g.strokeStyle = seg.color;}

				if(this.vnop(header_id,this.STROKE)){
					var px1 = seg.bx1*this.bw, px2 = seg.bx2*this.bw,
						py1 = seg.by1*this.bh, py2 = seg.by2*this.bh;
					g.strokeLine(px1,py1,px2,py2);
				}
			}
			else{ this.vhide(header_id);}
		};

		pc.drawCrosses_kouchoku = function(){
			this.vinc('cross_base', 'auto');

			var isgray = pp.getVal('circolor');
			var csize1 = this.cw*0.30+1, csize2 = this.cw*0.20;
			var headers = ["x_cp_", "x_cm_"];
			g.lineWidth = 1;

			var clist = this.range.crosses;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cross[c], key = ['cross',c].join('_');
				var graydisp = (isgray && obj.error===0 && obj.segment.length>=2);
				if(obj.qnum>0){
					// ○の描画
					g.fillStyle = (obj.error===1 ? this.errbcolor1 : "white");
					g.strokeStyle = (graydisp ? "gray" : "black");
					if(this.vnop(headers[0]+c,this.FILL_STROKE)){
						g.shapeCircle(obj.px, obj.py, csize1);
					}

					// アルファベットの描画
					var letter = (obj.qnum+9).toString(36).toUpperCase();
					var color = (graydisp ? "gray" : this.fontcolor);
					this.dispnum(key, 1, letter, 0.55, color, obj.px, obj.py);
				}
				else{ this.vhide([headers[0]+c]); this.hidenum(key);}

				if(obj.qnum===-2){
					g.fillStyle = (obj.error===1 ? this.errcolor1 : this.cellcolor);
					if(graydisp){ g.fillStyle="gray";}
					if(this.vnop(headers[1]+c,this.FILL)){
						g.fillCircle(obj.px, obj.py, csize2);
					}
				}
				else{ this.vhide(headers[1]+c);}
			}
		};

		pc.drawSegmentTarget = function(){
			this.vinc('cross_target_', 'auto');

			var csize = this.cw*0.32;
			var header = "x_point_";
			g.strokeStyle = "rgb(64,127,255)";
			g.lineWidth = this.lw*1.5;

			var clist = this.range.crosses;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cross[c];
				if(mv.targetPoint[0]===c || mv.targetPoint[1]===c){
					if(this.vnop(header+c,this.STROKE)){
						g.strokeCircle(obj.px, obj.py, csize);
					}
				}
				else{ this.vhide(header+c);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCrossABC();
		};
		enc.pzlexport = function(type){
			this.encodeCrossABC();
		};

		//---------------------------------------------------------------------------
		enc.decodeCrossABC = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var obj = bd.cross[c], ca = bstr.charAt(i);
				if     (this.include(ca,"a","z")){ obj.qnum = parseInt(ca,36)-9;}
				else if(this.include(ca,"0","9")){ c+=(parseInt(ca,36));}
				else if(ca=="."){ obj.qnum=-2;}

				c++;
				if(c>=bd.crossmax){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};
		enc.encodeCrossABC = function(){
			var count=0, cm="";
			for(var c=0;c<bd.crossmax;c++){
				var pstr="", qn=bd.cross[c].qnum;

				if     (qn>=  0){ pstr=(9+qn).toString(36);}
				else if(qn===-2){ pstr=".";}
				else{ count++;}

				if     (count=== 0){ cm += pstr;}
				else if(pstr || count===10){ cm += ((count-1).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm += ((count-1).toString(36));}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCrossNum();
			this.decodeSegment();
		};
		fio.encodeData = function(){
			this.encodeCrossNum();
			this.encodeSegment();
		};

		//---------------------------------------------------------
		fio.decodeSegment = function(){
			var len = parseInt(this.readLine(),10);
			for(var i=0;i<len;i++){
				var data = this.readLine().split(" ");
				bd.segs.input(+data[0], +data[1], +data[2], +data[3]);
			}
		};
		fio.encodeSegment = function(){
			var idlist = bd.segs.getallsegment();
			this.datastr += (idlist.length+"/");
			for(var i=0;i<idlist.length;i++){
				var seg = bd.segs.seg[idlist[i]];
				this.datastr += ([seg.bx1,seg.by1,seg.bx2,seg.by2].join(" ")+"/");
			}
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var idlist = bd.segs.getallsegment();
			if( !this.checkSegmentExist(idlist) ){
				this.setAlert('線が存在していません。', 'There is no segment.'); return false;
			}

			if( !this.checkSegmentPoint() ){
				this.setAlert('線が丸のないところから出ています。','A segment comes from out of circle.'); return false;
			}

			if( !this.checkSegmentBranch() ){
				this.setAlert('分岐している線があります。','There is a branched segment.'); return false;
			}

			if( !this.checkSegmentOverPoint(idlist) ){
				this.setAlert('線が丸を通過しています。','A segment passes over a circle.'); return false;
			}

			if( !this.checkDuplicateSegment(idlist) ){
				this.setAlert('線が同一直線上で重なっています。','Plural segments are overlapped.'); return false;
			}

			if( !this.checkDifferentLetter(idlist) ){
				this.setAlert('異なる文字が直接繋がっています。','Different Letters are connected directly.'); return false;
			}

			if( !this.checkRightAngle(idlist) ){
				this.setAlert('線が直角に交差していません。','Segments don\'n intersect at a right angle.'); return false;
			}

			if( !this.checkOneSegmentLoop(idlist) ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			if( !this.checkSegmentDeadend() ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end segment.'); return false;
			}

			if( !this.checkAlonePoint() ){
				this.setAlert('線が2本出ていない丸があります。','A circle doesn\'t have two segments.'); return false;
			}

			if( !this.checkConsequentLetter(idlist) ){
				this.setAlert('同じ文字がひとつながりになっていません。','Same Letters are not consequent.'); return false;
			}

			return true;
		};

		ans.checkSegmentExist = function(idlist){
			return (idlist.length!==0);
		};

		ans.checkSegment = function(func){
			var result = true;
			for(var c=0;c<bd.crossmax;c++){
				if(func(c)){
					if(result){ bd.segs.seterrorAll(2);}
					bd.segs.seterror(bd.cross[c].segment,1);
					result = false;
				}
			}
			return result;
		}

		ans.checkAlonePoint = function(){
			return this.checkSegment(function(c){ return (bd.cross[c].segment.length<2 && bd.cross[c].qnum!==-1);});
		};
		ans.checkSegmentPoint = function(){
			return this.checkSegment(function(c){ return (bd.cross[c].segment.length>0 && bd.cross[c].qnum===-1);});
		};
		ans.checkSegmentBranch = function(){
			return this.checkSegment(function(c){ return (bd.cross[c].segment.length>2);});
		};
		ans.checkSegmentDeadend = function(){
			return this.checkSegment(function(c){ return (bd.cross[c].segment.length===1);});
		};

		ans.checkOneSegmentLoop = function(idlist){
			var xinfo = new AreaInfo();
			for(var i=0;i<idlist.length;i++){ xinfo.id[idlist[i]]=0;}
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(xinfo.id[id]!==0){ continue;}
				xinfo.max++;
				xinfo.room[xinfo.max] = {idlist:bd.segs.idlist[bd.segs.lineid[id]]}; /* 参照だけなのでconcat()じゃなくてよい */
				for(var n=0,len=xinfo.room[xinfo.max].idlist.length;n<len;n++){
					xinfo.id[xinfo.room[xinfo.max].idlist[n]] = xinfo.max;
				}
			}
			if(xinfo.max>1){
				bd.segs.seterrorAll(2);
				bd.segs.seterror(xinfo.room[1].idlist,1);
				return false;
			}
			return true;
		};

		ans.checkSegmentOverPoint = function(idlist){
			var result = true;
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i], seg=bd.segs.seg[id], tmp;
				var lattice = this.getLatticePoint(seg.bx1,seg.by1,seg.bx2,seg.by2);
				for(var n=0;n<lattice.length;n++){
					if(result){ bd.segs.seterrorAll(2);}
					bd.segs.seterror([id],1);
					bd.sErX([xc],1);
					result = false;
				}
			}
			return result;
		};
		ans.getLatticePoint = function(bx1,by1,bx2,by2){
			var div=(bx2-bx1), n=(by2-by1);
			div=(div<0?-div:div); n=(n<0?-n:n);
			if(div<n){ tmp=div;div=n;n=tmp;}        // (m,n)=(0,0)は想定外
			while(n>0){ tmp=(div%n); div=n; n=tmp;} // ユークリッドの互助法

			// div-1が格子点を途中で通る数になってる
			var lattice = [];
			for(var a=1;a<div;a++){
				var bx=bx1+(bx2-bx1)*(a/div);
				var by=by1+(by2-by1)*(a/div);
				var xc=bd.xnum(bx,by);
				if(xc!==null && bd.cross[xc].qnum!==-1){ lattice.push(xc);}
			}
			return lattice;
		};

		ans.checkDifferentLetter = function(idlist){
			var result = true;
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i], seg=bd.segs.seg[id], cc1=seg.point1, cc2=seg.point2;
				if(bd.cross[cc1].qnum!==-2 && bd.cross[cc2].qnum!==-2 && bd.cross[cc1].qnum!==bd.cross[cc2].qnum){
					if(result){ bd.segs.seterrorAll(2);}
					bd.segs.seterror([id],1);
					bd.sErX([cc1,cc2],1);
					result = false;
				}
			}
			return result;
		};

		ans.checkConsequentLetter = function(idlist){
			result = true, count = {}, qnlist = [];
			// この関数に来る時は、線は黒－黒、黒－文字、文字－文字(同じ)のいずれか
			for(var c=0;c<bd.crossmax;c++){ var qn = bd.cross[c].qnum; if(qn>=0){ count[qn] = [0,0,0];}}
			for(var c=0;c<bd.crossmax;c++){
				var qn = bd.cross[c].qnum;
				if(qn>=0){
					if(count[qn][0]===0){ qnlist.push(qn);}
					count[qn][0]++;
				}
			}
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i], seg=bd.segs.seg[id], cc1=seg.point1, cc2=seg.point2;
				if(bd.cross[cc1].qnum>=0 && bd.cross[cc2].qnum>=0 && bd.cross[cc1].qnum===bd.cross[cc2].qnum){
					var qn = bd.cross[cc1].qnum; if(qn>=0){ count[qn][1]++;}
				}
				else if(bd.cross[cc1].qnum>=0 || bd.cross[cc2].qnum>=0){
					var qn = bd.cross[cc1].qnum; if(qn>=0){ count[qn][2]++;}
					var qn = bd.cross[cc2].qnum; if(qn>=0){ count[qn][2]++;}
				}
			}
			for(var i=0;i<qnlist.length;i++){
				var qn = qnlist[i];
				if(count[qn][2]!==2 || (count[qn][1]!==count[qn][0]-1)){
					for(var c=0;c<bd.crossmax;c++){ if(bd.cross[c].qnum===qn){ bd.sErX([c],1);}}
					result = false;
				}
			}
			return result;
		};

		ans.isParallel = function(seg1, seg2){
			var vert1=(seg1.bx1===seg1.bx2), vert2=(seg2.bx1===seg2.bx2); // 縦線
			var horz1=(seg1.by1===seg1.by2), horz2=(seg2.by1===seg2.by2); // 横線
			if(vert1&&vert2){ return true;} // 両方縦線
			if(horz1&&horz2){ return true;} // 両方横線
			if(!vert1&&!vert2&&!horz1&&!horz2){ // 両方ナナメ
				return ((seg1.bx2-seg1.bx1)*(seg2.by2-seg2.by1)===(seg2.bx2-seg2.bx1)*(seg1.by2-seg1.by1));
			}
			return false;
		};

		ans.checkDuplicateSegment = function(idlist){
			var result = true, len = idlist.length, errors = [], tmp;
			for(var i=0;i<len;i++){
				var id1=idlist[i], seg1=bd.segs.seg[id1], bx1=seg1.bx1, bx2=seg1.bx2, by1=seg1.by1, by2=seg1.by2;
				for(var j=i+1;j<len;j++){
					var id2=idlist[j], seg2=bd.segs.seg[id2], bx3=seg2.bx1, bx4=seg2.bx2, by3=seg2.by1, by4=seg2.by2;
					if(!this.isParallel(seg1,seg2)){ continue;}
					if(bx1===bx2 && bx3===bx4 && bx1===bx3){ // 垂直で両方同じX座標
						if(by1>by2){ tmp=by1;by1=by2;by2=tmp;} if(by3>by4){ tmp=by3;by3=by4;by4=tmp;}
						if(by3<by2 && by1<by4){ errors.push([id1,id2]);}
					}
					else{ // 垂直でない時 => bx=0の時のY座標の値を比較 => 割り算にならないように展開
						if(by1*(bx2-bx1)*(bx4-bx3)-bx1*(by2-by1)*(bx4-bx3)===by3*(bx2-bx1)*(bx4-bx3)-bx3*(by4-by3)*(bx2-bx1)){
							if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;} if(bx3>bx4){ tmp=bx3;bx3=bx4;bx4=tmp;}
							if(bx3<bx2 && bx1<bx4){ errors.push([id1,id2]);}
						}
					}
				}
			}
			/* エラー処理 */
			for(var i=0;i<errors.length;i++){
				if(result){ bd.segs.seterrorAll(2);}
				bd.segs.seterror(errors[i],1);
				result = false;
			}
			return result;
		};

		ans.checkRightAngle = function(idlist){
			var result = true, len = idlist.length;
			var cand1 = [], cand2 = [], cand3 = [], tmp;
			/* 交差している候補の判定 */
			for(var i=0;i<len;i++){
				var id1=idlist[i], seg1=bd.segs.seg[id1], bx1=seg1.bx1, bx2=seg1.bx2, by1=seg1.by1, by2=seg1.by2;
				if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;} if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
				for(var j=i+1;j<len;j++){
					var id2=idlist[j], seg2=bd.segs.seg[id2], bx3=seg2.bx1, bx4=seg2.bx2, by3=seg2.by1, by4=seg2.by2;
					if(this.isParallel(seg1,seg2)){ continue;}
					if(bx3>bx4){ tmp=bx3;bx3=bx4;bx4=tmp;} if(by3>by4){ tmp=by3;by3=by4;by4=tmp;}
					if(bx3<bx2 && bx1<bx4 && by3<by2 && by1<by4){ cand1.push([id1,id2]);}
				}
			}
			/* 交差判定 */
			for(var i=0;i<cand1.length;i++){
				var seg1=bd.segs.seg[cand1[i][0]], bx1=seg1.bx1, bx2=seg1.bx2, by1=seg1.by1, by2=seg1.by2;
				var seg2=bd.segs.seg[cand1[i][1]], bx3=seg2.bx1, bx4=seg2.bx2, by3=seg2.by1, by4=seg2.by2;
				if     (bx1===bx2){ // 片方の線だけ垂直
					var bx0=bx1, by0=(by4-by3)/(bx4-bx3)*(bx0-bx3)+by3;
					if((by1<by0 && by0<by2)||(by2<by0 && by0<by1)){ cand2.push(cand1[i]);}
				}
				else if(bx3===bx4){ // 片方の線だけ垂直
					var bx0=bx3, by0=(by2-by1)/(bx2-bx1)*(bx0-bx1)+by1;
					if((by3<by0 && by0<by4)||(by4<by0 && by0<by3)){ cand2.push(cand1[i]);}
				}
				else{ // 2本とも垂直でない (SegmentManagerの仕様的にbx1<bx2になるはず)
					var div1=(by2-by1)/(bx2-bx1), div2=(by4-by3)/(bx4-bx3);
					var bx0=((bx3*div2-by3)-(bx1*div1-by1))/(div2-div1);
					if(bx1<bx0 && bx0<bx2 && bx3<bx0 && bx0<bx4){ cand2.push(cand1[i]);}
				}
			}
			/* 直角判定 */ // 傾きベクトルの内積=0なら直角
			for(var i=0;i<cand2.length;i++){
				var seg1=bd.segs.seg[cand2[i][0]], bx1=seg1.bx1, bx2=seg1.bx2, by1=seg1.by1, by2=seg1.by2;
				var seg2=bd.segs.seg[cand2[i][1]], bx3=seg2.bx1, bx4=seg2.bx2, by3=seg2.by1, by4=seg2.by2;
				if(((bx2-bx1)*(bx4-bx3)+(by2-by1)*(by4-by3))!==0){ cand3.push(cand2[i]);}
			}
			/* エラー処理 */
			for(var i=0;i<cand3.length;i++){
				if(result){ bd.segs.seterrorAll(2);}
				bd.segs.seterror(cand3[i],1);
				result = false;
			}
			return result;
		};
	}
};

//---------------------------------------------------------
//---------------------------------------------------------
Segment = function(bx1, by1, bx2, by2){
	this.point1;	// 端点1のIDを保持する
	this.point2;	// 端点2のIDを保持する

	this.bx1;		// 端点1のX座標(border座標系)を保持する
	this.by1;		// 端点1のY座標(border座標系)を保持する
	this.bx2;		// 端点2のX座標(border座標系)を保持する
	this.by2;		// 端点2のY座標(border座標系)を保持する

	this.color = "";
	this.error = 0;

	this.setpos(bx1,by1,bx2,by2,k.qcols,k.qrows);
};
Segment.prototype = {
	setpos : function(bx1,by1,bx2,by2,qc,qr){
		this.point1 = bd.xnum(bx1,by1,qc,qr);
		this.point2 = bd.xnum(bx2,by2,qc,qr);

		this.bx1 = bx1;
		this.by1 = by1;
		this.bx2 = bx2;
		this.by2 = by2;
	}
};
//---------------------------------------------------------------------------
// ★SegmentManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// SegmentManagerクラスの定義
SegmentManager = function(){
	this.seg    = {};	// segmentの配列
	this.segmax = 0;

	this.lineid = {};	// 線id情報(segment->line変換)
	this.idlist = {};	// 線id情報(line->segment変換)
	this.linemax = 0;

	this.typeA = 'A';
	this.typeB = 'B';

	this.disrec = 0;

	this.init();
};
SegmentManager.prototype = {

	//---------------------------------------------------------------------------
	// segs.init()           変数の起動時の初期化を行う
	// segs.initInfo()       segment以外の変数の起動時の初期化を行う
	// segs.reset()          lcnts等の変数の初期化を行う
	// segs.newIrowake()     reset()時に色情報を設定しなおす
	//
	// segs.disableRecord()  操作の登録を禁止する
	// segs.enableRecord()   操作の登録を許可する
	// segs.isenableRecord() 操作の登録できるかを返す
	//---------------------------------------------------------------------------
	init : function(){
		this.seg    = {};
		this.segmax = 0;
		this.initInfo();
	},
	initInfo : function(){
		for(var c=0,len=(k.qcols+1)*(k.qrows+1);c<len;c++){ bd.cross[c].segment=[];}

		this.lineid = {};
		this.idlist = {};
		this.linemax = 0;
	},
	reset : function(){
		this.initInfo();
		var ids = [];
		for(var id in this.seg){
			if(this.seg[id]===null){ continue;}
			this.lineid[id] = 0;
			ids.push(id);

			bd.cross[this.seg[id].point1].segment.push(id);
			bd.cross[this.seg[id].point2].segment.push(id);
		}
		this.reassignId(ids);
		if(k.irowake!==0){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.linemax;i++){
			if(this.idlist[i].length>0){
				var newColor = pc.getNewLineColor();
				for(var n=0;n<this.idlist[i].length;n++){
					this.seg[this.idlist[i][n]].color = newColor;
				}
			}
		}
	},

	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.disrec===0);},

	//---------------------------------------------------------------------------
	// segs.getSegmentId() 位置情報からsegmentのIDを取得する
	// segs.lcntPoint()    交点に存在する線の本数を返す
	// segs.getXlistFromIdlist() idlistの線が重なる交点のリストを取得する
	// segs.getXlistFromIdlist() idlistの線が含まれる四角形の領域を取得する
	//---------------------------------------------------------------------------
	getSegmentId : function(bx1,by1,bx2,by2){
		var cc1 = bd.xnum(bx1,by1), sid = null;
		for(var i=0,len=bd.cross[cc1].segment.length;i<len;i++){
			var search = bd.cross[cc1].segment[i];
			if(this.seg[search].bx2===bx2 && this.seg[search].by2===by2){
				sid = search;
				break;
			}
		}
		return sid;
	},
	lcntPoint : function(cc){ return bd.cross[cc].segment.length;},

	getXlistFromIdlist : function(idlist){
		var d = this.getRangefromIdlist(idlist);
		return bd.crossinside(d.x1,d.y1,d.x2,d.y2);
	},
	getRangeFromIdlist : function(idlist){
		var d = { x1:bd.maxbx+1, x2:bd.minbx-1, y1:bd.maxby+1, y2:bd.minby-1, cnt:0};
		for(var i=0;i<idlist.length;i++){
			var bx1=this.seg[idlist[i]].bx1, bx2=this.seg[idlist[i]].bx2;
			var by1=this.seg[idlist[i]].by1, by2=this.seg[idlist[i]].by2;
			if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
			
			if(d.x1>bx1){ d.x1=bx1;}if(d.x2<bx2){ d.x2=bx2;}
			if(d.y1>by1){ d.y1=by1;}if(d.y2<by2){ d.y2=by2;}
			d.cnt++;
		}
		return d;
	},

	//---------------------------------------------------------------------------
	// segs.seterror()    segmentに指定したエラー値を設定する
	// segs.seterrorAll() 全てのsegmentに指定したエラー値を設定する
	//---------------------------------------------------------------------------
	seterror : function(idlist,val){
		if(!ans.isenableSetError()){ return;}
		for(var i=0;i<idlist.length;i++){ this.seg[idlist[i]].error = val;}
	},
	seterrorAll : function(val){
		this.seterror(this.getallsegment(),val);
	},

	//---------------------------------------------------------------------------
	// segs.getallsegment() 盤面に存在する全てのsegmentのIDリストを取得する
	// segs.segmentinside() 座標(x1,y1)-(x2,y2)に含まれるsegmentのIDリストを取得する
	//---------------------------------------------------------------------------
	getallsegment : function(){
		return this.segmentinside(bd.minbx,bd.minby,bd.maxbx,bd.maxby);
	},
	segmentinside : function(x1,y1,x2,y2){
		/* 仮に、全描画にしておきます */
		var idlist = [];
		for(var id in this.seg){ idlist.push(id);}
		return idlist;
	},

	//---------------------------------------------------------------------------
	// segs.input()         マウスで入力された時に呼ぶ
	// segs.setSegment()    線を引く時に呼ぶ
	// segs.removeSegment() 線を消す時に呼ぶ
	//---------------------------------------------------------------------------
	input : function(bx1,by1,bx2,by2){
		var tmp;
		if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp; tmp=by1;by1=by2;by2=tmp;}
		else if(bx1===bx2 && by1 > by2) { tmp=by1;by1=by2;by2=tmp;}
		else if(bx1===bx2 && by1===by2) { return;}

		var id = this.getSegmentId(bx1,by1,bx2,by2);
		if(id===null){ this.setSegment   (bx1,by1,bx2,by2);}
		else         { this.removeSegment(id);}
	},
	setSegment : function(bx1,by1,bx2,by2){
		this.segmax++;
		this.seg[this.segmax] = new Segment(bx1,by1,bx2,by2);
		this.setSegmentInfo(this.segmax, true);
		um.addOpe(k.OTHER, 'segment', [bx1,by1,bx2,by2], 0, 1);
	},
	removeSegment : function(bx1,by1,bx2,by2){
		var id = bx1;
		if(by1!==(void 0)){ id = this.getSegmentId(bx1,by1,bx2,by2);}
		this.setSegmentInfo(id, false);
		var seg = this.seg[id];
		um.addOpe(k.OTHER, 'segment', [seg.bx1,seg.by1,seg.bx2,seg.by2], 1, 0);
		pc.eraseSegment1(id);
		delete this.seg[id];
	},

	//---------------------------------------------------------------------------
	// segs.setSegmentInfo()    線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setSegmentInfo : function(id, isset){
		if(!this.isenableRecord()){ return;}
		if(!isset && (this.lineid[id]===null)){ return;}

		var self = this;
		var gettype = function(cc){
			if(cc===null){ return self.typeA;}
			else{ return ((bd.cross[cc].segment.length===(isset?0:1))?self.typeA:self.typeB);}
		};
		var cc1 = this.seg[id].point1, cc2 = this.seg[id].point2;
		var type1 = gettype(cc1), type2 = gettype(cc2);

		if(isset){
			if(cc1!==null){ bd.cross[cc1].segment.push(id);}
			if(cc2!==null){ bd.cross[cc2].segment.push(id);}

			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(type1===this.typeA && type2===this.typeA){
				this.linemax++;
				this.idlist[this.linemax] = [id];
				this.lineid[id] = this.linemax;
				this.seg[id].color = pc.getNewLineColor();
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var bid = (this.getaround(id))[0];
				this.idlist[this.lineid[bid]].push(id);
				this.lineid[id] = this.lineid[bid];
				this.seg[id].color = this.seg[bid].color;
			}
			// (B)+(B)の場合 -> くっついた線で、大きい方の線idに統一する
			else{
				this.combineLineInfo(id);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			if(type1===this.typeA && type2===this.typeA){
				this.idlist[this.lineid[id]] = [];
				this.lineid[id] = null;
			}
			// (A)+(B)の場合 -> 既存の線から取り除く
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				this.array_remove(this.idlist[this.lineid[id]], id);
				this.lineid[id] = null;
			}
			// (B)+(B)の場合 -> 分かれた線にそれぞれ新しい線idをふる
			else{
				this.remakeLineInfo(id,0);
			}

			if(cc1!==null){ this.array_remove(bd.cross[cc1].segment, id);}
			if(cc2!==null){ this.array_remove(bd.cross[cc2].segment, id);}
		}
	},
	array_remove : function(array, val){
		for(var i=0;i<array.length;i++){ if(array[i]===val){ array.splice(i,1);} }
	},

	//---------------------------------------------------------------------------
	// segs.combineLineInfo() 線が引かれた時に、周りの線が全てくっついて1つの線が
	//                        できる場合の線idの再設定を行う
	// segs.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                        可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	combineLineInfo : function(id){
		// くっつく線の種類数は必ず2以下になるはず
		var around = this.getaround(id);
		var lid = [this.lineid[around[0]], null];
		for(var i=1;i<around.length;i++){
			if(lid[0]!==this.lineid[around[i]]){ lid[1]=this.lineid[around[i]]; break;}
		}

		// どっちが長いの？
		var longid, shortid;
		if((lid[1]===null)||(this.idlist[lid[0]].length >= this.idlist[lid[1]].length))
			{ longid=lid[0]; shortid=lid[1];}
		else{ longid=lid[1]; shortid=lid[0];}
		var newColor = this.seg[this.idlist[longid][0]].color;

		// くっつく線のID数が2種類の場合 => 短いほうを長いほうに統一
		if(shortid!==null){
			// つながった線は全て同じID・色にする
			for(var i=0,len=this.idlist[shortid].length;i<len;i++){
				var sid = this.idlist[shortid][i];
				this.idlist[longid].push(sid);
				this.lineid[sid] = longid;
				this.seg[sid].color = newColor;
			}
			this.idlist[shortid] = [];
		}

		this.idlist[longid].push(id);
		this.lineid[id] = longid;
		this.seg[id].color = newColor;

		if(shortid!==null){
			if(pp.getVal('irowake')){ pc.repaintLines(this.idlist[longid], id);}
		}
	},
	remakeLineInfo : function(id,val){

		// つなげた線のIDを一旦0にして、max+1, max+2, ...を割り振りしなおす関数

		// つながった線の線情報を一旦0にする
		var around = this.getaround(id), oldlongid = null, longColor;
		for(var i=0,len=around.length;i<len;i++){
			var current = this.lineid[around[i]];
			if(current<=0){ continue;}

			if(oldlongid===null || (this.idlist[oldlongid].length<this.idlist[current].length)){
				oldlongid = current;
				longColor = this.seg[around[i]].color;
			}

			for(var n=0,len2=this.idlist[current].length;n<len2;n++){
				this.lineid[this.idlist[current][n]] = 0;
			}
			this.idlist[current] = [];
		}

		// 自分のIDの情報を0にする
		if(val>0){ this.lineid[id] = 0; around.unshift(id);}
		else     { this.lineid[id] = null;} /* ここは必ずこっちを通る */

		// 新しいidを設定する
		var oldmax = this.linemax;	// いままでのthis.linemax値
		this.reassignId(around);

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する

		// できた線の中でもっとも長いものを取得する
		var newlongid = oldmax+1;
		for(var current=oldmax+1;current<=this.linemax;current++){
			if(this.idlist[newlongid].length<this.idlist[current].length){
				newlongid = current;
			}
		}

		// 新しい色の設定
		var idlist = [];
		for(var current=oldmax+1;current<=this.linemax;current++){
			var newColor = (current===newlongid ? longColor : pc.getNewLineColor());
			for(var n=0,len=this.idlist[current].length;n<len;n++){
				this.seg[this.idlist[current][n]].color = newColor;
				idlist.push(this.idlist[current][n]);
			}
		}
		if(pp.getVal('irowake')){ pc.repaintLines(idlist, id);}
	},

	//---------------------------------------------------------------------------
	// segs.getaround()  指定したsegmentに繋がる線を全て取得する
	// segs.reassignId() id=0となっているsegmentにlineidを設定する
	//---------------------------------------------------------------------------
	getaround : function(id){
		var around = [], cc1 = this.seg[id].point1, cc2 = this.seg[id].point2;
		for(var i=0,len=bd.cross[cc1].segment.length;i<len;i++){
			if(bd.cross[cc1].segment[i]!==id){ around.push(bd.cross[cc1].segment[i]);}
		}
		for(var i=0,len=bd.cross[cc2].segment.length;i<len;i++){
			if(bd.cross[cc2].segment[i]!==id){ around.push(bd.cross[cc2].segment[i]);}
		}
		return around;
	},

	reassignId : function(ids){
		for(var i=0,len=ids.length;i<len;i++){
			if(this.lineid[ids[i]]!==0){ continue;}	// 既にidがついていたらスルー
			this.linemax++;
			this.idlist[this.linemax] = [];

			var stack = [ids[i]];
			while(stack.length>0){
				var id = stack.pop();
				if(this.lineid[id]!==0){ continue;}

				this.lineid[id] = this.linemax;
				this.idlist[this.linemax].push(id);

				var around = this.getaround(id);
				for(var j=0;j<around.length;j++){
					if(this.lineid[around[j]]===0){ stack.push(around[j]);}
				}
			}
		}
	}
};
