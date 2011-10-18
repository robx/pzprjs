//
// パズル固有スクリプト部 交差は直角に限る版 kouchoku.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('kouchoku', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputcross_kouchoku();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputsegment();}
		else if(this.mouseend){ this.inputsegment_up();}
	},

	setEvents : function(){
		this.SuperFunc.setEvents.call(this);

		var canvas = pzprv3.getEL('divques');
		this.owner.addEvent(canvas, "mouseout", this, this.e_mouseout);
	},
	e_mouseout : function(e){
		// 子要素に入ってもイベントが起きてしまうので、サイズを確認する
		var ex=this.pageX(e), ey=this.pageY(e), rect=this.owner.menu.getRect(pzprv3.getEL('divques'));
		if(ex<=rect.left || ex>=rect.right || ey<=rect.top || ey>=rect.bottom){
			if(this.inputData===1){
				var cross1=this.targetPoint[0], cross2=this.targetPoint[1];
				this.targetPoint = [null, null];
				if(cross1!==null){ cross1.draw();}
				if(cross2!==null){ cross2.draw();}
			}
			this.mousereset();
		}
	},

	targetPoint : [null, null],
	inputsegment : function(){
		var cross = this.getcross();
		if(cross.isnull || cross===this.mouseCell){ return;}

		if(this.mousestart){
			this.inputData = 1;
			this.targetPoint[0] = cross;
			cross.draw();
		}
		else if(this.mousemove && this.inputData===1){
			var cross0=this.targetPoint[1];
			this.targetPoint[1] = cross;
			cross.draw();
			if(cross0!==null){ cross0.draw();}
		}
		
		this.mouseCell = cross;
	},
	inputsegment_up : function(){
		if(this.inputData!==1){ return;}

		var o=this.owner, cross1=this.targetPoint[0], cross2=this.targetPoint[1];
		this.targetPoint = [null, null];
		if(cross1!==null){ cross1.draw();}
		if(cross2!==null){ cross2.draw();}
		if(cross1!==null && cross2!==null){
			if(!o.getConfig('enline') || (cross1.qnum!==-1 && cross2.qnum!==-1)){
				var bx1=cross1.bx, bx2=cross2.bx, by1=cross1.by, by2=cross2.by, tmp;
				if(!o.getConfig('lattice') || o.board.getLatticePoint(bx1,by1,bx2,by2).length===0){
					o.board.segs.input(bx1,by1,bx2,by2);
					if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;}
					if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
					o.painter.paintRange(bx1-1,by1-1,bx2+1,by2+1);
				}
			}
		}
	},

	inputcross_kouchoku : function(){
		var cross = this.getcross();
		if(cross.isnull || cross===this.mouseCell){ return;}

		if(cross!==this.cursor.getTXC()){
			this.setcursor(cross);
		}
		else{
			this.inputnumber(cross);
		}
		this.mouseCell = cross;
	},
	inputnumber : function(cross){
		var qn = cross.getQnum();
		if(this.btn.Left){
			if     (qn===26){ cross.setQnum(-1);}
			else if(qn===-1){ cross.setQnum(-2);}
			else if(qn===-2){ cross.setQnum(1);}
			else{ cross.setQnum(qn+1);}
		}
		else if(this.btn.Right){
			if     (qn===-2){ cross.setQnum(-1);}
			else if(qn===-1){ cross.setQnum(26);}
			else if(qn=== 1){ cross.setQnum(-2);}
			else{ cross.setQnum(qn-1);}
		}
		cross.draw();
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
		var cross = this.cursor.getTXC();

		if(ca.length>1){ return;}
		else if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-9;
			if(cross.getQnum()===num){ cross.setQnum(-1);}
			else{ cross.setQnum(num);}
		}
		else if(ca=='-'){ cross.setQnum(cross.getQnum()!==-2?-2:-1);}
		else if(ca==' '){ cross.setQnum(-1);}
		else{ return;}

		this.prev = cross;
		cross.draw();
	}
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Cross:{
	maxnum : 26,

	initialize : function(){
		this.SuperFunc.initialize.call(this);
		this.segment = this.owner.newInstance('SegmentList');
	}
},

Board:{
	qcols : 7,
	qrows : 7,

	iscross : 2,

	segs : null,

	initialize2 : function(){
		this.SuperFunc.initialize2.call(this);
		this.segs = this.owner.newInstance('SegmentManager');
	},
	initBoardSize : function(col,row){
		this.segs.seg    = {};	// segmentの配列
		this.segs.segmax = 0;

		this.SuperFunc.initBoardSize.call(this,col,row);
	},

	allclear : function(isrec){
		if(!!this.segs){
			var seglist = this.segs.getallsegment();
			for(var i=0;i<seglist.length;i++){
				this.owner.painter.eraseSegment1(seglist[i]);
			}
		}

		this.SuperFunc.allclear.call(this,isrec);
	},
	ansclear : function(){
		if(!!this.segs){
			var seglist = this.segs.getallsegment();
			for(var i=0;i<seglist.length;i++){
				this.owner.painter.eraseSegment1(seglist[i]);
				this.segs.removeSegment(seglist[i]);
			}
		}

		this.SuperFunc.ansclear.call(this);
	},
	errclear : function(){
		if(!this.haserror){ return;}

		if(!!this.segs){
			var seglist = this.segs.getallsegment();
			for(var i=0;i<seglist.length;i++){ seglist[i].error=0;}
		}

		this.SuperFunc.errclear.call(this);
	},

	getLatticePoint : function(bx1,by1,bx2,by2){
		var seg = this.owner.newInstance('Segment',[bx1,by1,bx2,by2]), lattice = [];
		for(var i=0;i<seg.lattices.length;i++){
			var xc = seg.lattices[i][2];
			if(xc!==null && this.cross[xc].qnum!==-1){ lattice.push(xc);}
		}
		return lattice;
	},

	adjustBoardData : function(key,d){
		if(key & k.REDUCE){
			var seglist=this.segs.getallsegment(), sublist=this.owner.newInstance('SegmentList');
			for(var i=0;i<seglist.length;i++){
				var seg = seglist[i];
				var bx1=seg.bx1, by1=seg.by1, bx2=seg.bx2, by2=seg.by2;
				switch(key){
					case k.REDUCEUP: if(by1<this.minby+2||by2<this.minby+2){ sublist.add(seg);} break;
					case k.REDUCEDN: if(by1>this.maxby-2||by2>this.maxby-2){ sublist.add(seg);} break;
					case k.REDUCELT: if(bx1<this.minbx+2||bx2<this.minbx+2){ sublist.add(seg);} break;
					case k.REDUCERT: if(bx1>this.maxbx-2||bx2>this.maxbx-2){ sublist.add(seg);} break;
				}
			}

			var um = this.owner.undo, isrec = (!um.undoExec && !um.redoExec);
			if(isrec){ um.forceRecord = true;}
			for(var i=0;i<sublist.length;i++){ this.segs.removeSegment(sublist[i]);}
			if(isrec){ um.forceRecord = false;}
		}
	},
	adjustBoardData2 : function(key,d){
		var seglist=this.segs.getallsegment();
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		for(var i=0;i<seglist.length;i++){
			var seg=seglist[i], bx1=seg.bx1, by1=seg.by1, bx2=seg.bx2, by2=seg.by2;
			switch(key){
				case k.FLIPY: seg.setpos(bx1,yy-by1,bx2,yy-by2); break;
				case k.FLIPX: seg.setpos(xx-bx1,by1,xx-bx2,by2); break;
				case k.TURNR: seg.setpos(yy-by1,bx1,yy-by2,bx2); break;
				case k.TURNL: seg.setpos(by1,xx-bx1,by2,xx-bx2); break;
				case k.EXPANDUP: seg.setpos(bx1,  by1+2,bx2,  by2+2); break;
				case k.EXPANDDN: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
				case k.EXPANDLT: seg.setpos(bx1+2,by1,  bx2+2,by2  ); break;
				case k.EXPANDRT: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
				case k.REDUCEUP: seg.setpos(bx1,  by1-2,bx2,  by2-2); break;
				case k.REDUCEDN: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
				case k.REDUCELT: seg.setpos(bx1-2,by1,  bx2-2,by2  ); break;
				case k.REDUCERT: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
			}
		}
	}
},

"SegmentList:PieceList":{
	name : 'SegmentList'
},

"SegmentOperation:Operation":{
	setData : function(x1, y1, x2, y2, old, num){
		this.bx1 = x1;
		this.by1 = y1;
		this.bx2 = x2;
		this.by2 = y2;
		this.old = old;
		this.num = num;
	},
	decode : function(strs){
		if(strs[0]!=='SG'){ return false;}
		this.bx1 = +strs[1];
		this.by1 = +strs[2];
		this.bx2 = +strs[3];
		this.by2 = +strs[4];
		this.old = +strs[5];
		this.num = +strs[6];
		return true;
	},
	toString : function(){
		return ['SG', this.bx1, this.by1, this.bx2, this.by2, this.old, this.num].join(',');
	},

	exec : function(num){
		var bx1=this.bx1, by1=this.by1, bx2=this.bx2, by2=this.by2, o=this.owner, tmp;
		if     (num===1){ o.board.segs.setSegment   (bx1,by1,bx2,by2);}
		else if(num===0){ o.board.segs.removeSegment(bx1,by1,bx2,by2);}
		if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;} if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
		o.painter.paintRange(bx1-1,by1-1,bx2+1,by2+1);
	}
},

OperationManager:{
	addOpe_Segment : function(x1, y1, x2, y2, old, num){
		// 操作を登録する
		this.addOpe_common(function(){
			var ope = this.owner.newInstance('SegmentOperation');
			ope.setData(x1, y1, x2, y2, old, num);
			return ope;
		});
	},
	decodeOpe : function(strs){
		var ope = this.owner.newInstance('SegmentOperation');
		if(ope.decode(strs)){ return ope;}

		return this.SuperFunc.decodeOpe.call(this, strs);
	}
},

Menu:{
	disable_subclear : true,

	menufix : function(pp){
		pp.addCheck('circolor','setting',true,'点をグレーにする','Set Grey Color');
		pp.setLabel('circolor', '線が2本になったら点をグレーにする', 'Grey if the number of linked segment is two.');
		this.funcs['circolor'] = function(){ this.owner.painter.paintAll();};

		pp.addCheck('enline','setting',true,'線は点の間','Line between points');
		pp.setLabel('enline', '点の間のみ線を引けるようにする', 'Able to draw line only between the points.');

		pp.addCheck('lattice','setting',true,'格子点チェック','Check lattice point');
		pp.setLabel('lattice', '点を通過する線を引けないようにする', 'Disable drawing segment passing over a lattice point.');
	},

	irowakeRemake : function(){
		var o=this.owner;
		o.board.segs.newIrowake();
		if(o.getConfig('irowake')){ o.painter.paintAll();}
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

	repaintSegments : function(seglist){
		var g = this.vinc('segment', 'auto');

		for(var i=0;i<seglist.length;i++){ this.drawSegment1(seglist[i],true);}
	},

	drawSegments : function(){
		var g = this.vinc('segment', 'auto'), bd = this.owner.board;

		var seglist;
		/* 全領域の30%以下なら範囲指定 */
		if(((this.range.x2-this.range.x1)*(this.range.y2-this.range.y1))/((bd.maxbx-bd.minbx)*(bd.maxby-bd.minby))<0.30){
			seglist = bd.segs.segmentinside(this.range.x1,this.range.y1,this.range.x2,this.range.y2);
		}
		else{
			seglist = bd.segs.getallsegment();
		}
		for(var i=0;i<seglist.length;i++){ this.drawSegment1(seglist[i],true);}
	},
	eraseSegment1 : function(seg){
		var g = this.vinc('segment', 'auto');
		this.drawSegment1(seg,false);
	},
	drawSegment1 : function(seg,isdraw){
		var g = this.currentContext;

		g.lineWidth = this.lw;

		var header_id = ["seg",seg.bx1,seg.by1,seg.bx2,seg.by2].join("_");
		if(isdraw){
			if     (seg.error=== 1){ g.strokeStyle = this.errlinecolor;}
			else if(seg.error===-1){ g.strokeStyle = this.errlinebgcolor;}
			else if(this.irowake===0 || !this.owner.getConfig('irowake') || !seg.color){ g.strokeStyle = this.linecolor;}
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
		var g = this.vinc('cross_base', 'auto');

		var isgray = this.owner.getConfig('circolor');
		var csize1 = this.cw*0.30+1, csize2 = this.cw*0.20;
		var headers = ["x_cp_", "x_cm_"];
		g.lineWidth = 1;

		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i], id = cross.id, key = ['cross',id].join('_');
			var graydisp = (isgray && cross.error===0 && cross.segment.length>=2);
			var px = cross.bx*this.bw, py = cross.by*this.bh;
			if(cross.qnum>0){
				// ○の描画
				g.fillStyle = (cross.error===1 ? this.errbcolor1 : "white");
				g.strokeStyle = (graydisp ? "gray" : "black");
				if(this.vnop(headers[0]+id,this.FILL_STROKE)){
					g.shapeCircle(px, py, csize1);
				}

				// アルファベットの描画
				var letter = (cross.qnum+9).toString(36).toUpperCase();
				var color = (graydisp ? "gray" : this.fontcolor);
				this.dispnum(key, 1, letter, 0.55, color, px, py);
			}
			else{ this.vhide([headers[0]+id]); this.hidenum(key);}

			if(cross.qnum===-2){
				g.fillStyle = (cross.error===1 ? this.errcolor1 : this.cellcolor);
				if(graydisp){ g.fillStyle="gray";}
				if(this.vnop(headers[1]+id,this.FILL)){
					g.fillCircle(px, py, csize2);
				}
			}
			else{ this.vhide(headers[1]+id);}
		}
	},

	drawSegmentTarget : function(){
		var g = this.vinc('cross_target_', 'auto');

		var csize = this.cw*0.32;
		var header = "x_point_";
		g.strokeStyle = "rgb(64,127,255)";
		g.lineWidth = this.lw*1.5;

		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			if(this.owner.mouse.targetPoint[0]===cross ||
			   this.owner.mouse.targetPoint[1]===cross){
				if(this.vnop(header+cross.id,this.STROKE)){
					var px = cross.bx*this.bw, py = cross.by*this.bh;
					g.strokeCircle(px, py, csize);
				}
			}
			else{ this.vhide(header+cross.id);}
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
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
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
		var count=0, cm="", bd = this.owner.board;
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
			this.owner.board.segs.input(+data[0], +data[1], +data[2], +data[3]);
		}
	},
	encodeSegment : function(){
		var seglist = this.owner.board.segs.getallsegment();
		this.datastr += (seglist.length+"/");
		for(var i=0;i<seglist.length;i++){
			var seg = seglist[i];
			this.datastr += ([seg.bx1,seg.by1,seg.bx2,seg.by2].join(" ")+"/");
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var seglist = this.owner.board.segs.getallsegment();
		if( !this.checkSegmentExist(seglist) ){
			this.setAlert('線が存在していません。', 'There is no segment.'); return false;
		}

		if( !this.checkSegmentPoint() ){
			this.setAlert('線が丸のないところから出ています。','A segment comes from out of circle.'); return false;
		}

		if( !this.checkSegmentBranch() ){
			this.setAlert('分岐している線があります。','There is a branched segment.'); return false;
		}

		if( !this.checkSegmentOverPoint(seglist) ){
			this.setAlert('線が丸を通過しています。','A segment passes over a circle.'); return false;
		}

		if( !this.checkDuplicateSegment(seglist) ){
			this.setAlert('線が同一直線上で重なっています。','Plural segments are overlapped.'); return false;
		}

		if( !this.checkDifferentLetter(seglist) ){
			this.setAlert('異なる文字が直接繋がっています。','Different Letters are connected directly.'); return false;
		}

		if( !this.checkRightAngle(seglist) ){
			this.setAlert('線が直角に交差していません。','Segments don\'n intersect at a right angle.'); return false;
		}

		if( !this.checkOneSegmentLoop(seglist) ){
			this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		if( !this.checkSegmentDeadend() ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end segment.'); return false;
		}

		if( !this.checkAlonePoint() ){
			this.setAlert('線が2本出ていない丸があります。','A circle doesn\'t have two segments.'); return false;
		}

		if( !this.checkConsequentLetter(seglist) ){
			this.setAlert('同じ文字がひとつながりになっていません。','Same Letters are not consequent.'); return false;
		}

		return true;
	},

	checkSegmentExist : function(seglist){
		return (seglist.length!==0);
	},

	checkAlonePoint : function(){
		return this.checkSegment(function(cross){ return (cross.segment.length<2 && cross.qnum!==-1);});
	},
	checkSegmentPoint : function(){
		return this.checkSegment(function(cross){ return (cross.segment.length>0 && cross.qnum===-1);});
	},
	checkSegmentBranch : function(){
		return this.checkSegment(function(cross){ return (cross.segment.length>2);});
	},
	checkSegmentDeadend : function(){
		return this.checkSegment(function(cross){ return (cross.segment.length===1);});
	},
	checkSegment : function(func){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.crossmax;c++){
			var cross = bd.cross[c];
			if(func(cross)){
				if(result){ bd.segs.getallsegment().seterr(-1);}
				cross.segment.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkOneSegmentLoop : function(seglist){
		var bd = this.owner.board, xinfo = this.owner.newInstance('AreaSegmentInfo');
		for(var i=0;i<seglist.length;i++){ xinfo.id[seglist[i].id] = 0;}
		for(var i=0;i<seglist.length;i++){
			var seg = seglist[i];
			if(!xinfo.emptySegment(seg)){ continue;}
			xinfo.addRoom();

			var idlist = bd.segs.idlist[bd.segs.lineid[seg.id]];
			for(var n=0;n<idlist.length;n++){
				xinfo.addSegment(bd.segs.seg[idlist[n]]);
			}
		}
		if(xinfo.max>1){
			bd.segs.getallsegment().seterr(-1);
			xinfo.getseglist(xinfo.max).seterr(1);
			return false;
		}
		return true;
	},

	checkSegmentOverPoint : function(seglist){
		var result = true, bd = this.owner.board;
		for(var i=0;i<seglist.length;i++){
			var seg=seglist[i], tmp;
			var lattice = bd.getLatticePoint(seg.bx1,seg.by1,seg.bx2,seg.by2);
			for(var n=0;n<lattice.length;n++){
				if(result){ bd.segs.getallsegment().seterr(-1);}
				seg.seterr(1);
				bd.cross[lattice[n]].seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkDifferentLetter : function(seglist){
		var result = true;
		for(var i=0;i<seglist.length;i++){
			var seg=seglist[i], cross1=seg.cross1, cross2=seg.cross2;
			if(cross1.qnum!==-2 && cross2.qnum!==-2 && cross1.qnum!==cross2.qnum){
				if(result){ this.owner.board.segs.getallsegment().seterr(-1);}
				seg.seterr(1);
				cross1.seterr(1);
				cross2.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkConsequentLetter : function(seglist){
		var result = true, count = {}, qnlist = [], bd = this.owner.board;
		// この関数に来る時は、線は黒－黒、黒－文字、文字－文字(同じ)のいずれか
		for(var c=0;c<bd.crossmax;c++){ var qn = bd.cross[c].qnum; if(qn>=0){ count[qn] = [0,0,0];}}
		for(var c=0;c<bd.crossmax;c++){
			var qn = bd.cross[c].qnum;
			if(qn>=0){
				if(count[qn][0]===0){ qnlist.push(qn);}
				count[qn][0]++;
			}
		}
		for(var i=0;i<seglist.length;i++){
			var seg=seglist[i], cross1=seg.cross1, cross2=seg.cross2;
			if(cross1.qnum>=0 && cross2.qnum>=0 && cross1.qnum===cross2.qnum){
				var qn = cross1.qnum; if(qn>=0){ count[qn][1]++;}
			}
			else if(cross1.qnum>=0 || cross2.qnum>=0){
				var qn = cross1.qnum; if(qn>=0){ count[qn][2]++;}
				var qn = cross2.qnum; if(qn>=0){ count[qn][2]++;}
			}
		}
		for(var i=0;i<qnlist.length;i++){
			var qn = qnlist[i];
			if(count[qn][2]!==2 || (count[qn][1]!==count[qn][0]-1)){
				for(var c=0;c<bd.crossmax;c++){
					var cross = bd.cross[c];
					if(cross.qnum===qn){ cross.seterr(1);}
				}
				result = false;
			}
		}
		return result;
	},

	checkDuplicateSegment : function(seglist){
		var result = true, len = seglist.length;
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=seglist[i], seg2=seglist[j];
			if(seg1.isOverLapSegment(seg2)){
				if(result){ this.owner.board.segs.getallsegment().seterr(-1);}
				seg1.seterr(1);
				seg2.seterr(1);
				result = false;
			}
		}}
		return result;
	},

	checkRightAngle : function(seglist){
		var result = true, len = seglist.length;
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=seglist[i], seg2=seglist[j];
			if(seg1.isCrossing(seg2) && !seg1.isRightAngle(seg2)){
				if(result){ this.owner.board.segs.getallsegment().seterr(-1);}
				seg1.seterr(1);
				seg2.seterr(1);
				result = false;
			}
		}}
		return result;
	}
},

"AreaSegmentInfo:AreaCellInfo":{
	addSegment : function(seg){ this.setRoomID(seg, this.max);},
	emptySegment : function(seg){ return (this.id[seg.id]===0);},

	getseglist : function(areaid){
		var idlist = this.room[areaid].idlist, seglist = this.owner.newInstance('SegmentList');
		for(var i=0;i<idlist.length;i++){ seglist.add(this.owner.board.segs.seg[idlist[i]]);}
		return seglist;
	},

	addCell   : function(cell){ },
	emptyCell : function(cell){ return true;},
	getclistbycell : function(cell){ },
	getclist : function(areaid){ }
},

//---------------------------------------------------------
//---------------------------------------------------------
Segment:{
	initialize : function(bx1, by1, bx2, by2){
		this.id = null;

		this.cross1;	// 端点1のIDを保持する
		this.cross2;	// 端点2のIDを保持する

		this.bx1;		// 端点1のX座標(border座標系)を保持する
		this.by1;		// 端点1のY座標(border座標系)を保持する
		this.bx2;		// 端点2のX座標(border座標系)を保持する
		this.by2;		// 端点2のY座標(border座標系)を保持する

		this.dx;		// X座標の差分を保持する
		this.dy;		// Y座標の差分を保持する

		this.lattices;	// 途中で通過する格子点を保持する

		this.color = "";
		this.error = 0;

		this.setpos(bx1,by1,bx2,by2);
	},
	setpos : function(bx1,by1,bx2,by2){
		this.cross1 = this.owner.board.getx(bx1,by1);
		this.cross2 = this.owner.board.getx(bx2,by2);

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
		var div=(this.dx>>1), n=(this.dy>>1), tmp;
		div=(div<0?-div:div); n=(n<0?-n:n);
		if(div<n){ tmp=div;div=n;n=tmp;} // (m,n)=(0,0)は想定外
		while(n>0){ tmp=(div%n); div=n; n=tmp;}

		// div-1が途中で通る格子点の数になってる
		this.lattices = [];
		for(var a=1;a<div;a++){
			var bx=this.bx1+this.dx*(a/div);
			var by=this.by1+this.dy*(a/div);
			var cross=this.owner.board.getx(bx,by);
			this.lattices.push([bx,by,cross.id]);
		}
	},
	ispositive : function(bx,by){
		/* (端点1-P)と(P-端点2)で外積をとった時のZ軸方向の符号がが正か負か */
		return((bx-this.bx1)*(this.by2-by)-(this.bx2-bx)*(by-this.by1)>0);
	},

	seterr : function(num){
		if(!this.owner.board.isenableSetError()){ return;}
		for(var i=0;i<this.length;i++){ this[i].error = num;}
	},

	//---------------------------------------------------------------------------
	// seg.isRightAngle() 2本のsegmentが直角かどうか判定する
	// seg.isParallel()   2本のsegmentが並行かどうか判定する
	// seg.isCrossing()   2本のsegmentが並行でなく交差しているかどうか判定する
	// seg.isOverLapSegment() 2本のsegmentが重なっているかどうか判定する
	//---------------------------------------------------------------------------
	isRightAngle : function(seg){
		/* 傾きベクトルの内積が0かどうか */
		return ((this.dx*seg.dx+this.dy*seg.dy)===0);
	},
	isParallel : function(seg){
		var vert1=(this.dx===0), vert2=(seg.dx===0); // 縦線
		var horz1=(this.dy===0), horz2=(seg.dy===0); // 横線
		if(vert1&&vert2){ return true;} // 両方縦線
		if(horz1&&horz2){ return true;} // 両方横線
		if(!vert1&&!vert2&&!horz1&&!horz2){ // 両方ナナメ
			return (this.dx*seg.dy===seg.dx*this.dy);
		}
		return false;
	},
	isCrossing : function(seg){
		/* 平行ならここでは対象外 */
		if(this.isParallel(seg)){ return false;}

		var bx11=this.bx1, bx12=this.bx2, by11=this.by1, by12=this.by2, dx1=this.dx, dy1=this.dy;
		var bx21= seg.bx1, bx22= seg.bx2, by21= seg.by1, by22= seg.by2, dx2= seg.dx, dy2= seg.dy, tmp;

		/* X座標,Y座標が重なっているかどうか調べる */
		if(!this.owner.board.segs.isOverLap(bx11,bx12,bx21,bx22) ||
		   !this.owner.board.segs.isOverLap(by11,by12,by21,by22)){ return false;}

		/* 交差している位置を調べる */
		if     (dx1===0){ // 片方の線だけ垂直
			var _by0=dy2*(bx11-bx21)+by21*dx2, t=dx2;
			if(t<0){ _by0*=-1; t*=-1;} var _by11=by11*t, _by12=by12*t;
			if(_by11<_by0 && _by0<_by12){ return true;}
		}
		else if(dx2===0){ // 片方の線だけ垂直
			var _by0=dy1*(bx21-bx11)+by11*dx1, t=dx1;
			if(t<0){ _by0*=-1; t*=-1;} var _by21=by21*dx1, _by22=by22*dx1;
			if(_by21<_by0 && _by0<_by22){ return true;}
		}
		else{ // 2本とも垂直でない (仕様的にbx1<bx2になるはず)
			var _bx0=(bx21*dy2-by21*dx2)*dx1-(bx11*dy1-by11*dx1)*dx2, t=(dy2*dx1)-(dy1*dx2);
			if(t<0){ _bx0*=-1; t*=-1;} var _bx11=bx11*t, _bx12=bx12*t, _bx21=bx21*t, _bx22=bx22*t;
			if((_bx11<_bx0 && _bx0<_bx12)&&(_bx21<_bx0 && _bx0<_bx22)){ return true;}
		}
		return false;
	},
	isOverLapSegment : function(seg){
		if(!this.isParallel(seg)){ return false;}
		if(this.dx===0 && seg.dx===0){ // 2本とも垂直の時
			if(this.bx1===seg.bx1){ // 垂直で両方同じX座標
				if(this.owner.board.segs.isOverLap(this.by1,this.by2,seg.by1,seg.by2)){ return true;}
			}
		}
		else{ // 垂直でない時 => bx=0の時のY座標の値を比較 => 割り算にならないように展開
			if((this.dx*this.by1-this.bx1*this.dy)*seg.dx===(seg.dx*seg.by1-seg.bx1*seg.dy)*this.dx){
				if(this.owner.board.segs.isOverLap(this.bx1,this.bx2,seg.bx1,seg.bx2)){ return true;}
			}
		}
		return false;
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

		this.owner.board.validinfo.all.push(this);
	},

	//---------------------------------------------------------------------------
	// segs.reset()      lcnts等の変数の初期化を行う
	// segs.rebuild()    情報の再設定を行う
	// segs.newIrowake() reset()時などに色情報を設定しなおす
	//---------------------------------------------------------------------------
	reset : function(){
		// 変数の初期化
		this.lineid = {};
		this.idlist = {};
		this.linemax = 0;

		var o = this.owner, bd=o.board;
		for(var c=0,len=(bd.qcols+1)*(bd.qrows+1);c<len;c++){
			bd.cross[c].segment=o.newInstance('SegmentList');
		}

		this.rebuild();
	},
	rebuild : function(){
		// if(!this.enabled){ return;} enabled==true扱いなのでここのif文は削除

		var ids = [];
		for(var id in this.seg){
			var seg = this.seg[id];
			if(seg===null){ continue;}
			id = +id;
			this.lineid[id] = 0;
			ids.push(id);

			seg.cross1.segment.add(seg);
			seg.cross2.segment.add(seg);
		}
		this.reassignId(ids);
		if(this.owner.painter.irowake!==0){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.linemax;i++){
			if(this.idlist[i].length>0){
				var newColor = this.owner.painter.getNewLineColor();
				for(var n=0;n<this.idlist[i].length;n++){
					this.seg[this.idlist[i][n]].color = newColor;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// segs.getSegment() 位置情報からsegmentを取得する
	//---------------------------------------------------------------------------
	getSegment : function(bx1,by1,bx2,by2){
		var cross = this.owner.board.getx(bx1,by1), seg = null;
		for(var i=0,len=cross.segment.length;i<len;i++){
			var search = cross.segment[i];
			if(search.bx2===bx2 && search.by2===by2){
				seg = search;
				break;
			}
		}
		return seg;
	},

	//---------------------------------------------------------------------------
	// segs.isOverLap()    (a1-a2)と(b1-b2)の範囲が重なっているかどうか判定する
	//---------------------------------------------------------------------------
	isOverLap : function(a1,a2,b1,b2){
		var tmp;
		if(a1>a2){ tmp=a1;a1=a2;a2=tmp;} if(b1>b2){ tmp=b1;b1=b2;b2=tmp;}
		return (b1<a2 && a1<b2);
	},

	//---------------------------------------------------------------------------
	// segs.getallsegment() 盤面に存在する全てのsegmentのIDリストを取得する
	// segs.segmentinside() 座標(x1,y1)-(x2,y2)に含まれるsegmentのIDリストを取得する
	//---------------------------------------------------------------------------
	getallsegment : function(){
		var seglist = this.owner.newInstance('SegmentList');
		for(var id in this.seg){ seglist.add(this.seg[id]);}
		return seglist;
	},
	segmentinside : function(x1,y1,x2,y2){
		var bd = this.owner.board;
		if(x1<=bd.minbx && x2>=bd.maxbx && y1<=bd.minby && y2>=bd.maxby){ return this.getallsegment();}

		var seglist = this.owner.newInstance('SegmentList');
		for(var id in this.seg){
			var seg=this.seg[id], cnt=0;
			if(this.isOverLap(seg.bx1,seg.bx2,x1,x2) && this.isOverLap(seg.by1,seg.by2,y1,y2)){
				if(seg.ispositive(x1,y1)){ cnt++;}
				if(seg.ispositive(x1,y2)){ cnt++;}
				if(seg.ispositive(x2,y1)){ cnt++;}
				if(seg.ispositive(x2,y2)){ cnt++;}
				if(cnt>0 && cnt<4){ seglist.add(seg);}
			}
		}
		return seglist;
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

		var id = this.getSegment(bx1,by1,bx2,by2);
		if(id===null){ this.setSegment   (bx1,by1,bx2,by2);}
		else         { this.removeSegment(id);}
	},
	setSegment : function(bx1,by1,bx2,by2){
		this.segmax++;
		this.seg[this.segmax] = this.owner.newInstance('Segment',[bx1,by1,bx2,by2]);
		this.seg[this.segmax].id = this.segmax;
		if(this.owner.board.isenableInfo()){ this.setSegmentInfo(this.seg[this.segmax], true);}
		this.owner.undo.addOpe_Segment(bx1, by1, bx2, by2, 0, 1);
	},
	removeSegment : function(bx1,by1,bx2,by2){
		var seg = bx1;
		if(by1!==(void 0)){ seg = this.getSegment(bx1,by1,bx2,by2);}
		if(this.owner.board.isenableInfo()){ this.setSegmentInfo(seg, false);}
		this.owner.undo.addOpe_Segment(seg.bx1, seg.by1, seg.bx2, seg.by2, 1, 0);
		this.owner.painter.eraseSegment1(seg);
		delete this.seg[seg.id];
	},

	//---------------------------------------------------------------------------
	// segs.setSegmentInfo()    線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setSegmentInfo : function(seg, isset){
		if(!isset && (this.lineid[seg.id]===null)){ return;}

		var self = this;
		var gettype = function(cross){
			if(cross.isnull){ return self.typeA;}
			else{ return ((cross.segment.length===(isset?0:1))?self.typeA:self.typeB);}
		};
		var id = seg.id, cross1 = seg.cross1, cross2 = seg.cross2;
		var type1 = gettype(cross1), type2 = gettype(cross2);

		if(isset){
			if(!cross1.isnull){ cross1.segment.add(seg);}
			if(!cross2.isnull){ cross2.segment.add(seg);}

			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(type1===this.typeA && type2===this.typeA){
				this.linemax++;
				this.idlist[this.linemax] = [id];
				this.lineid[id] = this.linemax;
				seg.color = this.owner.painter.getNewLineColor();
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var bid = (this.getaround(id))[0];
				this.idlist[this.lineid[bid]].push(id);
				this.lineid[id] = this.lineid[bid];
				seg.color = this.seg[bid].color;
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

			if(!cross1.isnull){ cross1.segment.remove(seg);}
			if(!cross2.isnull){ cross2.segment.remove(seg);}
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
			if(this.owner.getConfig('irowake')){
				var idlist = this.idlist[longid], seglist = this.owner.newInstance('SegmentList');
				for(var i=0;i<idlist.length;i++){ if(idlist[i]!==id){ seglist.add(this.seg[idlist[i]]);}}
				this.owner.painter.repaintSegments(seglist);
			}
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
			var newColor = (current===newlongid ? longColor : this.owner.painter.getNewLineColor());
			for(var n=0,len=this.idlist[current].length;n<len;n++){
				this.seg[this.idlist[current][n]].color = newColor;
				idlist.push(this.idlist[current][n]);
			}
		}
		if(this.owner.getConfig('irowake')){
			var seglist = this.owner.newInstance('SegmentList');
			for(var i=0;i<idlist.length;i++){ if(idlist[i]!==id){ seglist.add(this.seg[idlist[i]]);}}
			this.owner.painter.repaintSegments(seglist);
		}
	},

	//---------------------------------------------------------------------------
	// segs.getaround()  指定したsegmentに繋がる線を全て取得する
	// segs.reassignId() id=0となっているsegmentにlineidを設定する
	//---------------------------------------------------------------------------
	getaround : function(id){
		var around = [], cross1 = this.seg[id].cross1, cross2 = this.seg[id].cross2;
		for(var i=0,len=cross1.segment.length;i<len;i++){
			if(cross1.segment[i].id!==id){ around.push(cross1.segment[i].id);}
		}
		for(var i=0,len=cross2.segment.length;i<len;i++){
			if(cross2.segment[i].id!==id){ around.push(cross2.segment[i].id);}
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
});

})();
