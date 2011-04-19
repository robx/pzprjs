//
// パズル固有スクリプト部 交差は直角に限る版 kouchoku.js v3.4.0
//
pzprv3.custom.kouchoku = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.playmode){ this.inputsegment();}
		else if(k.editmode){ this.inputcross_kouchoku();}
	},
	mouseup : function(){
		if(k.playmode){ this.inputsegment_up();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputsegment();}
	},

	setEvents : function(){
		this.SuperFunc.setEvents.call(this);

		var canvas = ee('divques').el;
		ee.addEvent(canvas, "mouseout", ee.ebinder(this, this.e_mouseout));
	},
	e_mouseout : function(e){
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
	},

	targetPoint : [null, null],
	inputsegment : function(){
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
		
		this.mouseCell = cc;
	},
	inputsegment_up : function(){
		if(this.inputData!==1){ return;}

		var cc1=this.targetPoint[0], cc2=this.targetPoint[1];
		this.targetPoint = [null, null];
		if(cc1!==null){ pc.paintCross(cc1);}
		if(cc2!==null){ pc.paintCross(cc2);}
		if(cc1!==null && cc2!==null){
			if(!pp.getVal('enline') || (bd.cross[cc1].qnum!==-1 && bd.cross[cc2].qnum!==-1)){
				var bx1=bd.cross[cc1].bx, bx2=bd.cross[cc2].bx,
					by1=bd.cross[cc1].by, by2=bd.cross[cc2].by, tmp;
				if(!pp.getVal('lattice') || bd.getLatticePoint(bx1,by1,bx2,by2).length===0){
					bd.segs.input(bx1,by1,bx2,by2);
					if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;}
					if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
					pc.paintRange(bx1-1,by1-1,bx2+1,by2+1);
				}
			}
		}
	},

	inputcross_kouchoku : function(){
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
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTCross(ca);},

	keyinput : function(ca){
		this.key_inputqnum_kouchoku(ca);
	},
	key_inputqnum_kouchoku : function(ca){
		var c = tc.getTXC();

		if(ca.length>1){ return;}
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
	}
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Cross:{
	segment : []
},

Board:{
	qcols : 7,
	qrows : 7,

	iscross : 2,

	maxnum : 26,

	segs : null,

	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		this.segs = new (pzprv3.getPuzzleClass('SegmentManager'))();
		this.segs.init();
	},

	disableInfo : function(){
		this.SuperFunc.disableInfo.call(this);
		this.segs.disableRecord();
	},
	enableInfo : function(){
		this.SuperFunc.enableInfo.call(this);
		this.segs.enableRecord();
	},
	resetInfo : function(){
		this.segs.reset();
	},

	allclear : function(isrec){
		this.SuperFunc.allclear.call(this,isrec);

		if(!!this.segs){
			var idlist = this.segs.getallsegment();
			for(var i=0;i<idlist.length;i++){
				pc.eraseSegment1(idlist[i]);
			}
			this.segs.allclear();
		}
	},
	ansclear : function(){
		this.SuperFunc.ansclear.call(this);

		if(!!this.segs){
			var idlist = this.segs.getallsegment();
			for(var i=0;i<idlist.length;i++){
				pc.eraseSegment1(idlist[i]);
				this.segs.removeSegment(idlist[i]);
			}
			this.segs.allclear();
		}
	},
	errclear : function(){
		if(!this.haserror){ return;}

		if(!!this.segs){
			var idlist = this.segs.getallsegment();
			for(var i=0;i<idlist.length;i++){ this.segs.seg[idlist[i]].error=0;}
		}

		this.SuperFunc.errclear.call(this);
	},

	getLatticePoint : function(bx1,by1,bx2,by2){
		var seg = new (pzprv3.getPuzzleClass('Segment'))(bx1,by1,bx2,by2), lattice = [];
		for(var i=0;i<seg.lattices.length;i++){
			var xc = seg.lattices[i][2];
			if(xc!==null && bd.cross[xc].qnum!==-1){ lattice.push(xc);}
		}
		return lattice;
	}
},

Operation:{
	exec : function(num){
		if(this.SuperFunc.exec.call(this,num)){ return;}

		if(this.property=='segment'){
			var bx1=+this.id[0],by1=+this.id[1],bx2=+this.id[2],by2=+this.id[3],tmp;
			if     (num===1){ bd.segs.setSegment   (bx1,by1,bx2,by2);}
			else if(num===0){ bd.segs.removeSegment(bx1,by1,bx2,by2);}
			if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;} if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
			um.paintStack(bx1-1,by1-1,bx2+1,by2+1);
		}
	},
	decode : function(strs){
		if(this.SuperFunc.decode.call(this,strs)){ return;}

		this.group = bd.OTHER;
		this.property = 'segment';
		this.id = [strs[1],strs[2],strs[3],strs[4]];
		this.old = +strs[5];
		this.num = +strs[6];
	},
	toString : function(){
		var str = this.SuperFunc.toString.call(this);
		if(!!str){ return str;}

		return ['SG', this.id[0], this.id[1], this.id[2], this.id[3], this.old, this.num].join(',');
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
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
				case this.FLIPY: seg.setpos(bx1,yy-by1,bx2,yy-by2,bd.qcols,bd.qrows); break;
				case this.FLIPX: seg.setpos(xx-bx1,by1,xx-bx2,by2,bd.qcols,bd.qrows); break;
				case this.TURNR: seg.setpos(yy-by1,bx1,yy-by2,bx2,bd.qrows,bd.qcols); break;
				case this.TURNL: seg.setpos(by1,xx-bx1,by2,xx-bx2,bd.qrows,bd.qcols); break;
				case this.EXPANDUP: seg.setpos(bx1,  by1+2,bx2,  by2+2,bd.qcols,bd.qrows+1); break;
				case this.EXPANDDN: seg.setpos(bx1,  by1,  bx2,  by2,  bd.qcols,bd.qrows+1); break;
				case this.EXPANDLT: seg.setpos(bx1+2,by1,  bx2+2,by2,  bd.qcols+1,bd.qrows); break;
				case this.EXPANDRT: seg.setpos(bx1,  by1,  bx2,  by2,  bd.qcols+1,bd.qrows); break;
				case this.REDUCEUP: seg.setpos(bx1,  by1-2,bx2,  by2-2,bd.qcols,bd.qrows-1); break;
				case this.REDUCEDN: seg.setpos(bx1,  by1,  bx2,  by2,  bd.qcols,bd.qrows-1); break;
				case this.REDUCELT: seg.setpos(bx1-2,by1,  bx2-2,by2,  bd.qcols-1,bd.qrows); break;
				case this.REDUCERT: seg.setpos(bx1,  by1,  bx2,  by2,  bd.qcols-1,bd.qrows); break;
			}
		}
	},

	irowakeRemake : function(){
		bd.segs.newIrowake();
		if(pp.getVal('irowake')){ pc.paintAll();}
	}
},

Menu:{
	disable_subclear : true,

	menufix : function(){
		pp.addCheck('circolor','setting',true,'点をグレーにする','Set Grey Color');
		pp.setLabel('circolor', '線が2本になったら点をグレーにする', 'Grey if the number of linked segment is two.');
		pp.funcs['circolor'] = function(){ pc.paintAll();};

		pp.addCheck('enline','setting',true,'線は点の間','Line between points');
		pp.setLabel('enline', '点の間のみ線を引けるようにする', 'Able to draw line only between the points.');

		pp.addCheck('lattice','setting',true,'格子点チェック','Check lattice point');
		pp.setLabel('lattice', '点を通過する線を引けないようにする', 'Disable drawing segment passing over a lattice point.');
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.70,
	bdmargin_image : 0.50,

	irowake : 1,

	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
	},
	paint : function(){
		this.drawDashedGrid(false);

		this.drawSegments();

		this.drawCrosses_kouchoku();
		this.drawSegmentTarget();
		this.drawTarget();
	},

	repaintSegments : function(idlist, id){
		this.vinc('segment', 'auto');

		for(var i=0;i<idlist.length;i++){
			if(id!==idlist[i]){ this.drawSegment1(idlist[i],true);}
		}
	},

	drawSegments : function(){
		this.vinc('segment', 'auto');

		var idlist = [];
		/* 全領域の30%以下なら範囲指定 */
		if(((this.range.x2-this.range.x1)*(this.range.y2-this.range.y1))/((bd.maxbx-bd.minbx)*(bd.maxby-bd.minby))<0.30){
			idlist = bd.segs.segmentinside(this.range.x1,this.range.y1,this.range.x2,this.range.y2);
		}
		else{
			idlist = bd.segs.getallsegment();
		}
		for(var i=0;i<idlist.length;i++){ this.drawSegment1(idlist[i],true);}
	},
	eraseSegment1 : function(id){
		this.vinc('segment', 'auto');
		this.drawSegment1(id,false);
	},
	drawSegment1 : function(id,isdraw){
		g.lineWidth = this.lw;

		var seg = bd.segs.seg[id];
		var header_id = ["seg",seg.bx1,seg.by1,seg.bx2,seg.by2].join("_");
		if(isdraw){
			if     (seg.error===1){ g.strokeStyle = this.errlinecolor1;}
			else if(seg.error===2){ g.strokeStyle = this.errlinecolor2;}
			else if(this.irowake===0 || !pp.getVal('irowake') || !seg.color){ g.strokeStyle = this.linecolor;}
			else{ g.strokeStyle = seg.color;}

			if(this.vnop(header_id,this.STROKE)){
				var px1 = seg.bx1*this.bw, px2 = seg.bx2*this.bw,
					py1 = seg.by1*this.bh, py2 = seg.by2*this.bh;
				g.strokeLine(px1,py1,px2,py2);
			}
		}
		else{ this.vhide(header_id);}
	},

	drawCrosses_kouchoku : function(){
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
	},

	drawSegmentTarget : function(){
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
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeCrossABC();
	},
	pzlexport : function(type){
		this.encodeCrossABC();
	},

	decodeCrossABC : function(){
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
	},
	encodeCrossABC : function(){
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
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
			this.decodeCrossNum();
			this.decodeSegment();
	},
	encodeData : function(){
			this.encodeCrossNum();
			this.encodeSegment();
	},

	decodeSegment : function(){
		var len = parseInt(this.readLine(),10);
		for(var i=0;i<len;i++){
			var data = this.readLine().split(" ");
			bd.segs.input(+data[0], +data[1], +data[2], +data[3]);
		}
	},
	encodeSegment : function(){
		var idlist = bd.segs.getallsegment();
		this.datastr += (idlist.length+"/");
		for(var i=0;i<idlist.length;i++){
			var seg = bd.segs.seg[idlist[i]];
			this.datastr += ([seg.bx1,seg.by1,seg.bx2,seg.by2].join(" ")+"/");
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

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
	},

	checkSegmentExist : function(idlist){
		return (idlist.length!==0);
	},

	checkAlonePoint : function(){
		return this.checkSegment(function(c){ return (bd.cross[c].segment.length<2 && bd.cross[c].qnum!==-1);});
	},
	checkSegmentPoint : function(){
		return this.checkSegment(function(c){ return (bd.cross[c].segment.length>0 && bd.cross[c].qnum===-1);});
	},
	checkSegmentBranch : function(){
		return this.checkSegment(function(c){ return (bd.cross[c].segment.length>2);});
	},
	checkSegmentDeadend : function(){
		return this.checkSegment(function(c){ return (bd.cross[c].segment.length===1);});
	},
	checkSegment : function(func){
		var result = true;
		for(var c=0;c<bd.crossmax;c++){
			if(func(c)){
				if(result){ bd.segs.seterrorAll(2);}
				bd.segs.seterror(bd.cross[c].segment,1);
				result = false;
			}
		}
		return result;
	},

	checkOneSegmentLoop : function(idlist){
		var xinfo = new pzprv3.core.AreaInfo();
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
	},

	checkSegmentOverPoint : function(idlist){
		var result = true;
		for(var i=0;i<idlist.length;i++){
			var id=idlist[i], seg=bd.segs.seg[id], tmp;
			var lattice = bd.getLatticePoint(seg.bx1,seg.by1,seg.bx2,seg.by2);
			for(var n=0;n<lattice.length;n++){
				if(result){ bd.segs.seterrorAll(2);}
				bd.segs.seterror([id],1);
				bd.sErX([lattice[n]],1);
				result = false;
			}
		}
		return result;
	},

	checkDifferentLetter : function(idlist){
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
	},

	checkConsequentLetter : function(idlist){
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
	},

	checkDuplicateSegment : function(idlist){
		var result = true, len = idlist.length;
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=bd.segs.seg[idlist[i]], seg2=bd.segs.seg[idlist[j]];
			if(bd.segs.isOverLapSegment(seg1,seg2)){
				if(result){ bd.segs.seterrorAll(2);}
				bd.segs.seterror([idlist[i],idlist[j]],1);
				result = false;
			}
		}}
		return result;
	},

	checkRightAngle : function(idlist){
		var result = true, len = idlist.length;
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=bd.segs.seg[idlist[i]], seg2=bd.segs.seg[idlist[j]];
			if(bd.segs.isCrossing(seg1,seg2) && !bd.segs.isRightAngle(seg1,seg2)){
				if(result){ bd.segs.seterrorAll(2);}
				bd.segs.seterror([idlist[i],idlist[j]],1);
				result = false;
			}
		}}
		return result;
	}
},

//---------------------------------------------------------
//---------------------------------------------------------
Segment:{
	initialize : function(bx1, by1, bx2, by2){
		this.point1;	// 端点1のIDを保持する
		this.point2;	// 端点2のIDを保持する

		this.bx1;		// 端点1のX座標(border座標系)を保持する
		this.by1;		// 端点1のY座標(border座標系)を保持する
		this.bx2;		// 端点2のX座標(border座標系)を保持する
		this.by2;		// 端点2のY座標(border座標系)を保持する

		this.dx;		// X座標の差分を保持する
		this.dy;		// Y座標の差分を保持する

		this.lattices;	// 途中で通過する格子点を保持する

		this.color = "";
		this.error = 0;

		this.setpos(bx1,by1,bx2,by2,bd.qcols,bd.qrows);
	},
	setpos : function(bx1,by1,bx2,by2,qc,qr){
		this.point1 = bd.xnum(bx1,by1,qc,qr);
		this.point2 = bd.xnum(bx2,by2,qc,qr);

		this.bx1 = bx1;
		this.by1 = by1;
		this.bx2 = bx2;
		this.by2 = by2;

		this.dx = (bx2-bx1);
		this.dy = (by2-by1);

		this.setLattices();
	},
	setLattices : function(){
		// ユークリッドの互助法で最大公約数を求める
		var div=(this.dx>>1), n=(this.dy>>1);
		div=(div<0?-div:div); n=(n<0?-n:n);
		if(div<n){ tmp=div;div=n;n=tmp;} // (m,n)=(0,0)は想定外
		while(n>0){ tmp=(div%n); div=n; n=tmp;}

		// div-1が途中で通る格子点の数になってる
		this.lattices = [];
		for(var a=1;a<div;a++){
			var bx=this.bx1+this.dx*(a/div);
			var by=this.by1+this.dy*(a/div);
			var xc=bd.xnum(bx,by);
			this.lattices.push([bx,by,xc]);
		}
	},
	ispositive : function(bx,by){
		/* (端点1-P)と(P-端点2)で外積をとった時のZ軸方向の符号がが正か負か */
		return((bx-this.bx1)*(this.by2-by)-(this.bx2-bx)*(by-this.by1)>0);
	}
},

SegmentManager:{ /* LineManagerクラスを拡張してます */
	initialize : function(){
		this.seg    = {};	// segmentの配列
		this.segmax = 0;

		this.lineid = {};	// 線id情報(segment->line変換)
		this.idlist = {};	// 線id情報(line->segment変換)
		this.linemax = 0;

		this.typeA = 'A';
		this.typeB = 'B';

		this.disrec = 0;
	},

	//---------------------------------------------------------------------------
	// segs.init()           変数の起動時の初期化を行う
	// segs.allclear()       データを消去する
	// segs.resetInfo()      segment以外の変数の起動時の初期化を行う
	// segs.reset()          lcnts等の変数の初期化を行う
	// segs.newIrowake()     reset()時などに色情報を設定しなおす
	//
	// segs.disableRecord()  操作の登録を禁止する
	// segs.enableRecord()   操作の登録を許可する
	// segs.isenableRecord() 操作の登録できるかを返す
	//---------------------------------------------------------------------------
	init : function(){
		this.allclear();
	},
	allclear : function(){
		this.seg    = {};
		this.segmax = 0;
		this.resetInfo();
	},
	resetInfo : function(){
		for(var c=0,len=(bd.qcols+1)*(bd.qrows+1);c<len;c++){ bd.cross[c].segment=[];}

		this.lineid = {};
		this.idlist = {};
		this.linemax = 0;
	},
	reset : function(){
		this.resetInfo();
		var ids = [];
		for(var id in this.seg){
			if(this.seg[id]===null){ continue;}
			id = +id;
			this.lineid[id] = 0;
			ids.push(id);

			bd.cross[this.seg[id].point1].segment.push(id);
			bd.cross[this.seg[id].point2].segment.push(id);
		}
		this.reassignId(ids);
		if(pc.irowake!==0){ this.newIrowake();}
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
	// segs.getRangeFromIdlist() idlistの線が含まれる四角形の領域を取得する
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
	// segs.isRightAngle() 2本のsegmentが直角かどうか判定する
	// segs.isParallel()   2本のsegmentが並行かどうか判定する
	// segs.isCrossing()   2本のsegmentが並行でなく交差しているかどうか判定する
	// segs.isOverLapSegment() 2本のsegmentが重なっているかどうか判定する
	// segs.isOverLap()    (a1-a2)と(b1-b2)の範囲が重なっているかどうか判定する
	//---------------------------------------------------------------------------
	isRightAngle : function(seg1, seg2){
		/* 傾きベクトルの内積が0かどうか */
		return ((seg1.dx*seg2.dx+seg1.dy*seg2.dy)===0);
	},
	isParallel : function(seg1, seg2){
		var vert1=(seg1.dx===0), vert2=(seg2.dx===0); // 縦線
		var horz1=(seg1.dy===0), horz2=(seg2.dy===0); // 横線
		if(vert1&&vert2){ return true;} // 両方縦線
		if(horz1&&horz2){ return true;} // 両方横線
		if(!vert1&&!vert2&&!horz1&&!horz2){ // 両方ナナメ
			return (seg1.dx*seg2.dy===seg2.dx*seg1.dy);
		}
		return false;
	},
	isCrossing : function(seg1, seg2){
		/* 平行ならここでは対象外 */
		if(this.isParallel(seg1,seg2)){ return false;}

		var bx11=seg1.bx1, bx12=seg1.bx2, by11=seg1.by1, by12=seg1.by2, dx1=seg1.dx, dy1=seg1.dy;
		var bx21=seg2.bx1, bx22=seg2.bx2, by21=seg2.by1, by22=seg2.by2, dx2=seg2.dx, dy2=seg2.dy, tmp;

		/* X座標,Y座標が重なっているかどうか調べる */
		if(!this.isOverLap(bx11,bx12,bx21,bx22) || !this.isOverLap(by11,by12,by21,by22)){ return false;}

		/* 交差している位置を調べる */
		if     (dx1===0){ // 片方の線だけ垂直
			var bx0=bx11, by0=(dy2/dx2)*(bx0-bx21)+by21;
			if((by11<by0 && by0<by12)||(by12<by0 && by0<by11)){ return true;}
		}
		else if(dx2===0){ // 片方の線だけ垂直
			var bx0=bx21, by0=(dy1/dx1)*(bx0-bx11)+by11;
			if((by21<by0 && by0<by22)||(by22<by0 && by0<by21)){ return true;}
		}
		else{ // 2本とも垂直でない (仕様的にbx1<bx2になるはず)
			var div1=dy1/dx1, div2=dy2/dx2;
			var bx0=((bx21*div2-by21)-(bx11*div1-by11))/(div2-div1);
			if((bx11<bx0 && bx0<bx12)&&(bx21<bx0 && bx0<bx22)){ return true;}
		}
		return false;
	},
	isOverLapSegment : function(seg1, seg2){
		if(!this.isParallel(seg1,seg2)){ return false;}
		if(seg1.dx===0 && seg2.dx===0){ // 2本とも垂直の時
			if(seg1.bx1===seg2.bx1){ // 垂直で両方同じX座標
				if(this.isOverLap(seg1.by1,seg1.by2,seg2.by1,seg2.by2)){ return true;}
			}
		}
		else{ // 垂直でない時 => bx=0の時のY座標の値を比較 => 割り算にならないように展開
			if((seg1.dx*seg1.by1-seg1.bx1*seg1.dy)*seg2.dx===(seg2.dx*seg2.by1-seg2.bx1*seg2.dy)*seg1.dx){
				if(this.isOverLap(seg1.bx1,seg1.bx2,seg2.bx1,seg2.bx2)){ return true;}
			}
		}
		return false;
	},

	isOverLap : function(a1,a2,b1,b2){
		var tmp;
		if(a1>a2){ tmp=a1;a1=a2;a2=tmp;} if(b1>b2){ tmp=b1;b1=b2;b2=tmp;}
		return (b1<a2 && a1<b2);
	},

	//---------------------------------------------------------------------------
	// segs.seterror()    segmentに指定したエラー値を設定する
	// segs.seterrorAll() 全てのsegmentに指定したエラー値を設定する
	//---------------------------------------------------------------------------
	seterror : function(idlist,val){
		if(!bd.isenableSetError()){ return;}
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
		var idlist = [];
		for(var id in this.seg){ idlist.push(+id);}
		return idlist;
	},
	segmentinside : function(x1,y1,x2,y2){
		if(x1<=bd.minbx && x2>=bd.maxbx && y1<=bd.minby && y2>=bd.maxby){ return this.getallsegment();}

		var idlist = [];
		for(var id in this.seg){
			var seg=this.seg[id], cnt=0;
			if(this.isOverLap(seg.bx1,seg.bx2,x1,x2) && this.isOverLap(seg.by1,seg.by2,y1,y2)){
				if(seg.ispositive(x1,y1)){ cnt++;}
				if(seg.ispositive(x1,y2)){ cnt++;}
				if(seg.ispositive(x2,y1)){ cnt++;}
				if(seg.ispositive(x2,y2)){ cnt++;}
				if(cnt>0 && cnt<4){ idlist.push(+id);}
			}
		}
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
		this.seg[this.segmax] = new (pzprv3.getPuzzleClass('Segment'))(bx1,by1,bx2,by2);
		this.setSegmentInfo(this.segmax, true);
		um.addOpe(bd.OTHER, 'segment', [bx1,by1,bx2,by2], 0, 1);
	},
	removeSegment : function(bx1,by1,bx2,by2){
		var id = bx1;
		if(by1!==(void 0)){ id = this.getSegmentId(bx1,by1,bx2,by2);}
		this.setSegmentInfo(id, false);
		var seg = this.seg[id];
		um.addOpe(bd.OTHER, 'segment', [seg.bx1,seg.by1,seg.bx2,seg.by2], 1, 0);
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
			if(pp.getVal('irowake')){ pc.repaintSegments(this.idlist[longid], id);}
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
		if(pp.getVal('irowake')){ pc.repaintSegments(idlist, id);}
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
}
};
