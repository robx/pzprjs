//
// パズル固有スクリプト部 交差は直角に限る版 kouchoku.js v3.4.1
//
pzpr.classmgr.makeCustom(['kouchoku'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputsegment();}
			else if(this.mouseend){ this.inputsegment_up();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputcross_kouchoku();}
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

		var puzzle = this.owner;
		var cross1=this.targetPoint[0], cross2=this.targetPoint[1];
		this.targetPoint = [null, null];
		if(cross1!==null){ cross1.draw();}
		if(cross2!==null){ cross2.draw();}
		if(cross1!==null && cross2!==null){
			if(!puzzle.getConfig('enline') || (cross1.qnum!==-1 && cross2.qnum!==-1)){
				var bx1=cross1.bx, bx2=cross2.bx, by1=cross1.by, by2=cross2.by, tmp;
				if(!puzzle.getConfig('lattice') || puzzle.board.getLatticePoint(bx1,by1,bx2,by2).length===0){
					this.inputsegment_main(bx1,by1,bx2,by2);
					if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;}
					if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
					puzzle.painter.paintRange(bx1-1,by1-1,bx2+1,by2+1);
				}
			}
		}
	},
	inputsegment_main : function(bx1,by1,bx2,by2){
		var tmp;
		if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp; tmp=by1;by1=by2;by2=tmp;}
		else if(bx1===bx2 && by1 > by2) { tmp=by1;by1=by2;by2=tmp;}
		else if(bx1===bx2 && by1===by2) { return;}

		var bd = this.owner.board, id = bd.getSegment(bx1,by1,bx2,by2);
		if(id===null){ bd.addSegmentByAddr(bx1,by1,bx2,by2);}
		else         { bd.removeSegment(id);}
	},

	inputcross_kouchoku : function(){
		var cross = this.getcross();
		if(cross.isnull || cross===this.mouseCell){ return;}

		if(cross!==this.cursor.getx()){
			this.setcursor(cross);
		}
		else{
			this.inputnumber(cross);
		}
		this.mouseCell = cross;
	},
	inputnumber : function(cross){
		var qn = cross.qnum;
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
	},

	e_mouseout : function(e){
		this.mouseout_kouchoku(e);
	},
	mouseout_kouchoku : function(e){
		// 子要素に入ってもmouseoutイベントが起きてしまうので、サイズを確認する
		var pos = pzpr.util.getPagePos(e), rect=pzpr.util.getRect(this.owner.canvas);
		if(pos.px<=rect.left || pos.px>=rect.right || pos.py<=rect.top || pos.py>=rect.bottom){
			if(this.inputData===1){
				var cross1=this.targetPoint[0], cross2=this.targetPoint[1];
				this.targetPoint = [null, null];
				if(cross1!==null){ cross1.draw();}
				if(cross2!==null){ cross2.draw();}
			}
			this.mousereset();
		}
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
		var cross = this.cursor.getx();

		if(ca.length>1){ return;}
		else if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-9;
			if(cross.qnum===num){ cross.setQnum(-1);}
			else{ cross.setQnum(num);}
		}
		else if(ca==='-'){ cross.setQnum(cross.qnum!==-2?-2:-1);}
		else if(ca===' '){ cross.setQnum(-1);}
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
		this.seglist = new this.owner.SegmentList();
	}
},

Board:{
	qcols : 7,
	qrows : 7,

	seginfo : null,

	initialize : function(){
		this.initSegmentGroup();

		this.common.initialize.call(this);

		this.seginfo = this.addInfoList(this.owner.SegmentManager);
	},

	initBoardSize : function(col,row){
		this.seginfo.eraseall();	// SegmentManager

		this.initSegmentGroup();

		this.common.initBoardSize.call(this,col,row);
	},

	initSegmentGroup : function(){
		if(!!this.segment){
			var pc = this.owner.painter;
			this.segment.each(function(seg){ pc.eraseSegment1(seg);});
		}
		this.segment = new this.owner.SegmentList();
		this.segmax = 0;
		this.seginvalid = [];
	},

	resetInfo : function(){
		this.seginfo.reset();
		this.common.resetInfo.call(this);
	},

	allclear : function(isrec){
		this.initSegmentGroup();
		
		this.common.allclear.call(this,isrec);
	},
	ansclear : function(){
		this.initSegmentGroup();
		
		this.common.ansclear.call(this);
	},
	errclear : function(){
		if(this.haserror){
			this.segment.errclear();
		}
		this.common.errclear.call(this);
	},

	irowakeRemake : function(){
		this.seginfo.newIrowake();
	},

	getLatticePoint : function(bx1,by1,bx2,by2){
		var seg = new this.owner.Segment(bx1,by1,bx2,by2), lattice = [];
		for(var i=0;i<seg.lattices.length;i++){
			var xc = seg.lattices[i][2];
			if(xc!==null && this.cross[xc].qnum!==-1){ lattice.push(xc);}
		}
		return lattice;
	},

	//---------------------------------------------------------------------------
	// bd.segmentinside() 座標(x1,y1)-(x2,y2)に含まれるsegmentのIDリストを取得する
	//---------------------------------------------------------------------------
	segmentinside : function(x1,y1,x2,y2){
		if(x1<=this.minbx && x2>=this.maxbx && y1<=this.minby && y2>=this.maxby){ return this.segment;}

		var pseudoSegment = new this.owner.Segment(x1,y1,x2,y2);
		return this.segment.filter(function(seg){
			if(seg.isAreaOverLap(pseudoSegment)){
				var cnt=0;
				if(seg.ispositive(x1,y1)){ cnt++;}
				if(seg.ispositive(x1,y2)){ cnt++;}
				if(seg.ispositive(x2,y1)){ cnt++;}
				if(seg.ispositive(x2,y2)){ cnt++;}
				if(cnt>0 && cnt<4){ return true;}
			}
			return false;
		});
	},

	//---------------------------------------------------------------------------
	// bd.addSegmentByAddr()    線をアドレス指定で引く時に呼ぶ
	// bd.removeSegmentByAddr() 線をアドレス指定で消す時に呼ぶ
	// bd.removeSegment()       線を消す時に呼ぶ
	//---------------------------------------------------------------------------
	addSegmentByAddr : function(bx1,by1,bx2,by2){
		var newsegid;
		if(this.seginvalid.length>0){ newsegid = this.seginvalid.shift();}
		else{ newsegid = this.segmax++; this.segment.length++;}
		
		var seg = new this.owner.Segment(bx1,by1,bx2,by2);
		seg.id = newsegid;
		this.segment[newsegid] = seg;
		if(this.isenableInfo()){ this.seginfo.setSegmentInfo(seg, true);}
		seg.addOpe(0, 1);
	},
	removeSegmentByAddr : function(bx1,by1,bx2,by2){
		this.removeSegment(this.getSegment(bx1,by1,bx2,by2));
	},
	removeSegment : function(seg){
		if(this.isenableInfo()){ this.seginfo.setSegmentInfo(seg, false);}
		seg.addOpe(1, 0);
		this.owner.painter.eraseSegment1(seg);
		
		this.seginvalid.push(seg.id);
		this.segment[seg.id] = new this.owner.Segment();
	},

	//---------------------------------------------------------------------------
	// bd.getSegment() 位置情報からsegmentを取得する
	//---------------------------------------------------------------------------
	getSegment : function(bx1,by1,bx2,by2){
		var cross = this.getx(bx1,by1), seg = null;
		for(var i=0,len=cross.seglist.length;i<len;i++){
			var search = cross.seglist[i];
			if(search.bx2===bx2 && search.by2===by2){
				seg = search;
				break;
			}
		}
		return seg;
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		var bd=this.owner.board, bexec=this;
		if(key & this.REDUCE){
			var sublist=new this.owner.SegmentList();
			bd.segment.each(function(seg){
				var bx1=seg.bx1, by1=seg.by1, bx2=seg.bx2, by2=seg.by2;
				switch(key){
					case bexec.REDUCEUP: if(by1<bd.minby+2||by2<bd.minby+2){ sublist.add(seg);} break;
					case bexec.REDUCEDN: if(by1>bd.maxby-2||by2>bd.maxby-2){ sublist.add(seg);} break;
					case bexec.REDUCELT: if(bx1<bd.minbx+2||bx2<bd.minbx+2){ sublist.add(seg);} break;
					case bexec.REDUCERT: if(bx1>bd.maxbx-2||bx2>bd.maxbx-2){ sublist.add(seg);} break;
				}
			});

			var opemgr = this.owner.opemgr, isrec = (!opemgr.undoExec && !opemgr.redoExec);
			if(isrec){ opemgr.forceRecord = true;}
			for(var i=0;i<sublist.length;i++){ bd.removeSegment(sublist[i]);}
			if(isrec){ opemgr.forceRecord = false;}
		}
	},
	adjustBoardData2 : function(key,d){
		var bexec=this, xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		this.owner.board.segment.each(function(seg){
			var bx1=seg.bx1, by1=seg.by1, bx2=seg.bx2, by2=seg.by2;
			switch(key){
				case bexec.FLIPY: seg.setpos(bx1,yy-by1,bx2,yy-by2); break;
				case bexec.FLIPX: seg.setpos(xx-bx1,by1,xx-bx2,by2); break;
				case bexec.TURNR: seg.setpos(yy-by1,bx1,yy-by2,bx2); break;
				case bexec.TURNL: seg.setpos(by1,xx-bx1,by2,xx-bx2); break;
				case bexec.EXPANDUP: seg.setpos(bx1,  by1+2,bx2,  by2+2); break;
				case bexec.EXPANDDN: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
				case bexec.EXPANDLT: seg.setpos(bx1+2,by1,  bx2+2,by2  ); break;
				case bexec.EXPANDRT: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
				case bexec.REDUCEUP: seg.setpos(bx1,  by1-2,bx2,  by2-2); break;
				case bexec.REDUCEDN: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
				case bexec.REDUCELT: seg.setpos(bx1-2,by1,  bx2-2,by2  ); break;
				case bexec.REDUCERT: seg.setpos(bx1,  by1,  bx2,  by2  ); break;
			}
		});
	}
},

"SegmentList:PieceList":{
	name : 'SegmentList',

	getRange : function(){
		if(this.length===0){ return null;}
		var bd = this.owner.board;
		var d = { x1:bd.maxbx+1, x2:bd.minbx-1, y1:bd.maxby+1, y2:bd.minby-1};
		for(var i=0;i<this.length;i++){
			var seg=this[i];
			if(d.x1>seg.bx1){ d.x1=seg.bx1;}
			if(d.x2<seg.bx2){ d.x2=seg.bx2;}
			if(d.y1>seg.by1){ d.y1=seg.by1;}
			if(d.y2<seg.by2){ d.y2=seg.by2;}
		}
		return d;
	},
	
	each : function(func){
		for(var i=0;i<this.length;i++){
			if(this[i]!==null){ func(this[i]);}
		}
	},

	errclear : function(){
		this.each(function(seg){ seg.error = 0;});
	}
},

"SegmentOperation:Operation":{
	setData : function(seg, old, num){
		this.bx1 = seg.bx1;
		this.by1 = seg.by1;
		this.bx2 = seg.bx2;
		this.by2 = seg.by2;
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
		if     (num===1){ o.board.addSegmentByAddr   (bx1,by1,bx2,by2);}
		else if(num===0){ o.board.removeSegmentByAddr(bx1,by1,bx2,by2);}
		if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;} if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
		o.painter.paintRange(bx1-1,by1-1,bx2+1,by2+1);
	}
},

OperationManager:{
	initialize : function(){
		this.common.initialize.call(this);

		this.operationlist.push(this.owner.SegmentOperation);
	}
},

Flags:{
	disable_subclear : true,
	irowake : true,
	autocmp : "kouchoku"
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	margin : 0.50,

	hideHatena : true,

	gridcolor_type : "DLIGHT",

	paint : function(){
		this.drawDashedGrid(false);

		this.drawSegments();

		this.drawCrosses_kouchoku();
		this.drawSegmentTarget();
		this.drawTarget();
	},

	repaintSegments : function(seglist){
		if(!this.context.use.canvas){
			this.vinc('segment', 'auto');
			for(var i=0;i<seglist.length;i++){ this.drawSegment1(seglist[i],true);}
		}
		else{
			var d = seglist.getRange();
			this.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
	},

	drawSegments : function(){
		var bd = this.owner.board;
		this.vinc('segment', 'auto');

		var seglist = bd.segment;
		/* 全領域の30%以下なら範囲指定 */
		if(((this.range.x2-this.range.x1)*(this.range.y2-this.range.y1))/((bd.maxbx-bd.minbx)*(bd.maxby-bd.minby))<0.30){
			seglist = bd.segmentinside(this.range.x1,this.range.y1,this.range.x2,this.range.y2);
		}

		for(var i=0;i<seglist.length;i++){ this.drawSegment1(seglist[i],true);}
	},
	eraseSegment1 : function(seg){
		this.vinc('segment', 'auto');
		this.drawSegment1(seg,false);
	},
	drawSegment1 : function(seg,isdraw){
		if(seg.bx1===void 0){ /* 消すための情報が無い場合は何もしない */ return; }

		var g = this.context;

		g.lineWidth = this.lw;
		g.vid = ["seg",seg.bx1,seg.by1,seg.bx2,seg.by2].join("_");
		if(isdraw){
			if     (seg.error=== 1){ g.strokeStyle = this.errlinecolor;}
			else if(seg.error===-1){ g.strokeStyle = this.errlinebgcolor;}
			else if(!this.owner.execConfig('irowake') || !seg.color){ g.strokeStyle = this.linecolor;}
			else{ g.strokeStyle = seg.color;}

			var px1 = seg.bx1*this.bw, px2 = seg.bx2*this.bw,
				py1 = seg.by1*this.bh, py2 = seg.by2*this.bh;
			g.strokeLine(px1,py1,px2,py2);
		}
		else{ g.vhide();}
	},

	drawCrosses_kouchoku : function(){
		var g = this.vinc('cross_base', 'auto', true);

		var isgray = this.owner.execConfig('autocmp');
		var csize1 = this.cw*0.30+1, csize2 = this.cw*0.20;
		g.lineWidth = 1;

		var option = {ratio:[0.55]};
		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			var graydisp = (isgray && cross.error===0 && cross.seglist.length>=2);
			var px = cross.bx*this.bw, py = cross.by*this.bh;
			// ○の描画
			g.vid = "x_cp_"+cross.id;
			if(cross.qnum>0){
				g.fillStyle = (cross.error===1 ? this.errbcolor1 : "white");
				g.strokeStyle = (graydisp ? "gray" : "black");
				g.shapeCircle(px, py, csize1);
			}
			else{ g.vhide();}

			// アルファベットの描画
			g.vid = "cross_text_"+cross.id;
			if(cross.qnum>0){
				g.fillStyle = (graydisp ? "gray" : this.fontcolor);
				this.disptext((cross.qnum+9).toString(36).toUpperCase(), px, py, option);
			}
			else{ g.vhide();}

			// ●の描画
			g.vid = "x_cm_"+cross.id;
			if(cross.qnum===-2){
				g.fillStyle = (cross.error===1 ? this.errcolor1 : this.quescolor);
				if(graydisp){ g.fillStyle="gray";}
				g.fillCircle(px, py, csize2);
			}
			else{ g.vhide();}
		}
	},

	drawSegmentTarget : function(){
		var g = this.vinc('cross_target_', 'auto', true);

		var csize = this.cw*0.32;
		g.strokeStyle = "rgb(64,127,255)";
		g.lineWidth = this.lw*1.5;

		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			g.vid = "x_point_"+cross.id;
			if(this.owner.mouse.targetPoint[0]===cross ||
			   this.owner.mouse.targetPoint[1]===cross){
				g.strokeCircle(cross.bx*this.bw, cross.by*this.bh, csize);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeCrossABC();
	},
	encodePzpr : function(type){
		this.encodeCrossABC();
	},

	decodeCrossABC : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cross[c], ca = bstr.charAt(i);
			if     (this.include(ca,"a","z")){ obj.qnum = parseInt(ca,36)-9;}
			else if(this.include(ca,"0","9")){ c+=(parseInt(ca,36));}
			else if(ca==="."){ obj.qnum=-2;}

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
			this.owner.board.addSegmentByAddr(+data[0], +data[1], +data[2], +data[3]);
		}
	},
	encodeSegment : function(){
		var fio = this, seglist = this.owner.board.segment.filter(function(seg){ return (seg.id!==null);});
		this.datastr += (seglist.length+"\n");
		seglist.each(function(seg){
			fio.datastr += ([seg.bx1,seg.by1,seg.bx2,seg.by2].join(" ")+"\n");
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSegmentExist",
		"checkSegmentPoint",
		"checkSegmentBranch",
		"checkSegmentOverPoint",
		"checkDuplicateSegment",
		"checkDifferentLetter",
		"checkRightAngle",
		"checkOneSegmentLoop",
		"checkSegmentDeadend",
		"checkAlonePoint",
		"checkConsequentLetter"
	],

	checkSegmentExist : function(){
		if(this.owner.board.segment.length===0){ this.failcode.add("brNoLine");}
	},

	checkAlonePoint : function(){
		this.checkSegment(function(cross){ return (cross.seglist.length<2 && cross.qnum!==-1);}, "nmLineLt2");
	},
	checkSegmentPoint : function(){
		this.checkSegment(function(cross){ return (cross.seglist.length>0 && cross.qnum===-1);}, "lnIsolate");
	},
	checkSegmentBranch : function(){
		this.checkSegment(function(cross){ return (cross.seglist.length>2);}, "lnBranch");
	},
	checkSegmentDeadend : function(){
		this.checkSegment(function(cross){ return (cross.seglist.length===1);}, "lnDeadEnd");
	},
	checkSegment : function(func, code){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.crossmax;c++){
			var cross = bd.cross[c];
			if(!func(cross)){ continue;}
			
			result = false;
			if(this.checkOnly){ break;}
			cross.seglist.seterr(1);
		}
		if(!result){
			this.failcode.add(code);
			bd.segment.setnoerr();
		}
	},

	checkOneSegmentLoop : function(){
		var bd = this.owner.board, validcount = 0;
		for(var r=1;r<=bd.seginfo.linemax;r++){
			if(bd.seginfo.seglist[r].length===0){ continue;}
			validcount++;
			if(validcount<=1){ continue;}
			
			this.failcode.add("lnPlLoop");
			bd.segment.setnoerr();
			bd.seginfo.seglist[r].seterr(1);
			break;
		}
	},

	checkSegmentOverPoint : function(){
		var result = true, bd = this.owner.board, seglist = bd.segment;
		seglist.each(function(seg){
			var lattice = bd.getLatticePoint(seg.bx1,seg.by1,seg.bx2,seg.by2);
			for(var n=0;n<lattice.length;n++){
				seg.seterr(1);
				bd.cross[lattice[n]].seterr(1);
				result = false;
			}
		});
		if(!result){
			this.failcode.add("lnPassOver");
			seglist.setnoerr();
		}
	},

	checkDifferentLetter : function(){
		var result = true, bd = this.owner.board, seglist = bd.segment;
		seglist.each(function(seg){
			var cross1=seg.cross1, cross2=seg.cross2;
			if(cross1.qnum!==-2 && cross2.qnum!==-2 && cross1.qnum!==cross2.qnum){
				seg.seterr(1);
				cross1.seterr(1);
				cross2.seterr(1);
				result = false;
			}
		});
		if(!result){
			this.failcode.add("nmConnDiff");
			seglist.setnoerr();
		}
	},

	checkConsequentLetter : function(){
		var count = {}, qnlist = [], bd = this.owner.board;
		// この関数に来る時は、線は黒－黒、黒－文字、文字－文字(同じ)のいずれか
		for(var c=0;c<bd.crossmax;c++){ var qn = bd.cross[c].qnum; if(qn>=0){ count[qn] = [0,0,0];}}
		for(var c=0;c<bd.crossmax;c++){
			var qn = bd.cross[c].qnum;
			if(qn>=0){
				if(count[qn][0]===0){ qnlist.push(qn);}
				count[qn][0]++;
			}
		}
		bd.segment.each(function(seg){
			var cross1=seg.cross1, cross2=seg.cross2;
			if(cross1.qnum>=0 && cross2.qnum>=0 && cross1.qnum===cross2.qnum){
				var qn = cross1.qnum; if(qn>=0){ count[qn][1]++;}
			}
			else if(cross1.qnum>=0 || cross2.qnum>=0){
				var qn = cross1.qnum; if(qn>=0){ count[qn][2]++;}
				var qn = cross2.qnum; if(qn>=0){ count[qn][2]++;}
			}
		});
		for(var i=0;i<qnlist.length;i++){
			var qn = qnlist[i];
			if(count[qn][2]===2 && (count[qn][1]===count[qn][0]-1)){ continue;}
			
			this.failcode.add("nmNotConseq");
			if(this.checkOnly){ break;}
			bd.cross.filter(function(cross){ return cross.qnum===qn;}).seterr(1);
		}
	},

	checkDuplicateSegment : function(){
		var result = true, seglist = this.owner.board.segment, len = seglist.length;
		allloop:
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=seglist[i], seg2=seglist[j];
			if(seg1===null || seg2===null || !seg1.isOverLapSegment(seg2)){ continue;}
			
			result = false;
			if(this.checkOnly){ break allloop;}
			seg1.seterr(1);
			seg2.seterr(1);
		}}
		if(!result){
			this.failcode.add("lnOverlap");
			seglist.setnoerr();
		}
	},

	checkRightAngle : function(seglist){
		var result = true, seglist = this.owner.board.segment, len = seglist.length;
		allloop:
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=seglist[i], seg2=seglist[j];
			if(seg1===null || seg2===null || !seg1.isCrossing(seg2) || seg1.isRightAngle(seg2)){ continue;}
			
			result = false;
			if(this.checkOnly){ break allloop;}
			seg1.seterr(1);
			seg2.seterr(1);
		}}
		if(!result){
			this.failcode.add("lnRightAngle");
			seglist.setnoerr();
		}
	}
},

FailCode:{
	lnDeadEnd    : ["途中で途切れている線があります。","There is a dead-end segment."],
	lnBranch     : ["分岐している線があります。","There is a branched segment."],
	lnPlLoop     : ["輪っかが一つではありません。","There are plural loops."],
	lnIsolate    : ["線が丸のないところから出ています。","A segment comes from out of circle."],
	lnPassOver   : ["線が丸を通過しています。","A segment passes over a circle."],
	lnOverlap    : ["線が同一直線上で重なっています。","Plural segments are overlapped."],
	lnRightAngle : ["線が直角に交差していません。","Segments don't intersect at a right angle."],
	nmConnDiff   : ["異なる文字が直接繋がっています。","Different Letters are connected directly."],
	nmNotConseq  : ["同じ文字がひとつながりになっていません。","Same Letters are not consequent."],
	nmLineLt2    : ["線が2本出ていない丸があります。","A circle doesn't have two segments."],
	brNoLine     : ["線が存在していません。","There is no segment."]
},

//---------------------------------------------------------
//---------------------------------------------------------
Segment:{
	initialize : function(bx1, by1, bx2, by2){
		this.id = null;

		this.cross1 = null;	// 端点1の交点を保持する
		this.cross2 = null;	// 端点2の交点を保持する

		this.bx1 = null;		// 端点1のX座標(border座標系)を保持する
		this.by1 = null;		// 端点1のY座標(border座標系)を保持する
		this.bx2 = null;		// 端点2のX座標(border座標系)を保持する
		this.by2 = null;		// 端点2のY座標(border座標系)を保持する

		this.dx = 0;	// X座標の差分を保持する
		this.dy = 0;	// Y座標の差分を保持する

		this.lattices = [];	// 途中で通過する格子点を保持する

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
		if(this.owner.board.isenableSetError()){ this.error = num;}
	},

	//---------------------------------------------------------------------------
	// addOpe()  履歴情報にプロパティの変更を通知する
	//---------------------------------------------------------------------------
	addOpe : function(old, num){
		this.owner.opemgr.add(new this.owner.SegmentOperation(this, old, num));
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

		/* X座標,Y座標が重なっているかどうか調べる */
		if(!this.isAreaOverLap(seg)){ return false;}

		var bx11=this.bx1, bx12=this.bx2, by11=this.by1, by12=this.by2, dx1=this.dx, dy1=this.dy;
		var bx21= seg.bx1, bx22= seg.bx2, by21= seg.by1, by22= seg.by2, dx2= seg.dx, dy2= seg.dy;

		/* 交差している位置を調べる */
		if     (dx1===0){ /* 片方の線だけ垂直 */
			var _by0=dy2*(bx11-bx21)+by21*dx2, t=dx2;
			if(t<0){ _by0*=-1; t*=-1;} var _by11=by11*t, _by12=by12*t;
			if(_by11<_by0 && _by0<_by12){ return true;}
		}
		else if(dx2===0){ /* 片方の線だけ垂直 */
			var _by0=dy1*(bx21-bx11)+by11*dx1, t=dx1;
			if(t<0){ _by0*=-1; t*=-1;} var _by21=by21*dx1, _by22=by22*dx1;
			if(_by21<_by0 && _by0<_by22){ return true;}
		}
		else{ /* 2本とも垂直でない (仕様的にbx1<bx2になるはず) */
			var _bx0=(bx21*dy2-by21*dx2)*dx1-(bx11*dy1-by11*dx1)*dx2, t=(dy2*dx1)-(dy1*dx2);
			if(t<0){ _bx0*=-1; t*=-1;} var _bx11=bx11*t, _bx12=bx12*t, _bx21=bx21*t, _bx22=bx22*t;
			if((_bx11<_bx0 && _bx0<_bx12)&&(_bx21<_bx0 && _bx0<_bx22)){ return true;}
		}
		return false;
	},
	/* X-Y座標でつくる長方形のエリアがかぶっているかどうか調べる */
	isAreaOverLap : function(seg){
		return (this.isOverLap(this.bx1,this.bx2,seg.bx1,seg.bx2) &&
				this.isOverLap(this.by1,this.by2,seg.by1,seg.by2));
	},
	/* 同じ傾きで重なっているSegmentかどうかを調べる */
	isOverLapSegment : function(seg){
		if(!this.isParallel(seg)){ return false;}
		if(this.dx===0 && seg.dx===0){ // 2本とも垂直の時
			if(this.bx1===seg.bx1){ // 垂直で両方同じX座標
				if(this.isOverLap(this.by1,this.by2,seg.by1,seg.by2)){ return true;}
			}
		}
		else{ // 垂直でない時 => bx=0の時のY座標の値を比較 => 割り算にならないように展開
			if((this.dx*this.by1-this.bx1*this.dy)*seg.dx===(seg.dx*seg.by1-seg.bx1*seg.dy)*this.dx){
				if(this.isOverLap(this.bx1,this.bx2,seg.bx1,seg.bx2)){ return true;}
			}
		}
		return false;
	},

	/*  一次元で(a1-a2)と(b1-b2)の範囲が重なっているかどうか判定する */
	isOverLap : function(a1,a2,b1,b2){
		var tmp;
		if(a1>a2){ tmp=a1;a1=a2;a2=tmp;} if(b1>b2){ tmp=b1;b1=b2;b2=tmp;}
		return (b1<a2 && a1<b2);
	}
},

SegmentManager:{ /* LineManagerクラスを拡張してます */
	initialize : function(){
		this.eraseall();
	},
	eraseall : function(){
		this.lineid = [];	// 線id情報(segment->line変換)
		this.seglist = [];	// 線id情報(line->segment変換)
		this.linemax = 0;
		this.invalidid = [];
	},
	init : function(){
		this.owner.board.validinfo.all.push(this);
	},

	typeA : 'A',
	typeB : 'B',

	//---------------------------------------------------------------------------
	// seginfo.reset()      lcnts等の変数の初期化を行う
	// seginfo.rebuild()    情報の再設定を行う
	// seginfo.newIrowake() reset()時などに色情報を設定しなおす
	//---------------------------------------------------------------------------
	reset : function(){
		// 変数の初期化
		this.lineid = [];
		this.seglist = [];
		this.linemax = 0;
		this.invalidid = [];

		var o = this.owner, bd=o.board;
		for(var c=0,len=bd.crossmax;c<len;c++){
			bd.cross[c].seglist=new o.SegmentList();
		}

		this.rebuild();
	},
	rebuild : function(){
		// if(!this.enabled){ return;} enabled==true扱いなのでここのif文は削除

		var seglist = new this.owner.SegmentList(), seginfo = this;
		this.owner.board.segment.each(function(seg){
			seginfo.lineid[seg.id] = 0;
			seglist.add(seg);

			seg.cross1.seglist.add(seg);
			seg.cross2.seglist.add(seg);
		});
		this.searchLine(seglist);

		// if(this.owner.flags.irowake){ this.newIrowake();} irowake==trueなので削除
		this.newIrowake();
	},
	newIrowake : function(){
		for(var i=1;i<=this.linemax;i++){
			if(this.seglist[i].length>0){
				var newColor = this.owner.painter.getNewLineColor();
				for(var n=0;n<this.seglist[i].length;n++){
					this.seglist[i][n].color = newColor;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// seginfo.setSegmentInfo()    線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	//---------------------------------------------------------------------------
	setSegmentInfo : function(seg, isset){
		if(!isset && (this.lineid[seg.id]===null)){ return;}

		var self = this;
		var gettype = function(cross){
			if(cross.isnull){ return self.typeA;}
			else{ return ((cross.seglist.length===(isset?0:1))?self.typeA:self.typeB);}
		};
		var cross1 = seg.cross1, cross2 = seg.cross2;
		var type1 = gettype(cross1), type2 = gettype(cross2);

		if(isset){
			if(!cross1.isnull){ cross1.seglist.add(seg);}
			if(!cross2.isnull){ cross2.seglist.add(seg);}
			this.lineid[seg.id] = null;

			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(type1===this.typeA && type2===this.typeA){
				this.assignLineInfo(seg, null);
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				this.assignLineInfo(seg, (this.getaround(seg))[0]);
			}
			// (B)+(B)の場合 -> くっついた線で、大きい方の線idに統一する
			else{
				this.remakeLineInfo(seg, isset);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			// (A)+(B)の場合 -> 既存の線から取り除く
			if((type1===this.typeA && type2===this.typeA) || (type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				this.removeLineInfo(seg);
			}
			// (B)+(B)の場合 -> 分かれた線にそれぞれ新しい線idをふる
			else{
				this.remakeLineInfo(seg, isset);
			}

			if(!cross1.isnull){ cross1.seglist.remove(seg);}
			if(!cross2.isnull){ cross2.seglist.remove(seg);}
		}
	},

	//---------------------------------------------------------------------------
	// seginfo.assignLineInfo()  指定された線を有効な線として設定する
	// seginfo.removeLineInfo()  指定されたセルを無効なセルとして設定する
	// seginfo.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                           可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	assignLineInfo : function(seg, seg2){
		var pathid = this.lineid[seg.id];
		if(pathid!==null && pathid!==0){ return;}

		if(seg2===null){
			pathid = this.addPath();
			seg.color = this.owner.painter.getNewLineColor();
		}
		else{
			pathid = this.lineid[seg2.id];
			seg.color = seg2.color;
		}
		this.seglist[pathid].add(seg);
		this.lineid[seg.id] = pathid;
	},
	removeLineInfo : function(seg){
		var pathid = this.lineid[seg.id];
		if(pathid===null || pathid===0){ return;}

		this.seglist[pathid].remove(seg);

		if(this.seglist[pathid].length===0){ this.removePath(pathid);}
		this.lineid[seg.id] = null;
		seg.color = "";
	},
	remakeLineInfo : function(seg, isset){
		var segs = this.getaround(seg);
		if(isset){ segs.unshift(seg);}
		else{ this.removeLineInfo(seg);}
		
		var longColor = this.getLongColor(segs);
		
		// つながった線の線情報を一旦0にする
		var seglist = new this.owner.SegmentList();
		for(var i=0,len=segs.length;i<len;i++){
			var id=segs[i].id, r=this.lineid[id];
			if(r!==null && r!==0){ seglist.extend(this.removePath(r));}
			else if(r===null)    { seglist.add(segs[i]);}
		}

		// 新しいidを設定する
		var assign = this.searchLine(seglist);

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		this.setLongColor(assign, longColor);
	},

	//--------------------------------------------------------------------------------
	// info.addPath()    新しく割り当てるidを取得する
	// info.removePath() 部屋idを無効にする
	//--------------------------------------------------------------------------------
	addPath : function(){
		var newid;
		if(this.invalidid.length>0){ newid = this.invalidid.shift();}
		else{ newid = ++this.linemax;}

		this.seglist[newid] = new this.owner.SegmentList();
		return newid;
	},
	removePath : function(r){
		var seglist = this.seglist[r];
		for(var i=0,len=seglist.length;i<len;i++){ this.lineid[seglist[i].id] = null;}
		
		this.seglist[r] = new this.owner.SegmentList();
		this.invalidid.push(r);
		return seglist;
	},

	//--------------------------------------------------------------------------------
	// info.getLongColor() ブロックを設定した時、ブロックにつける色を取得する
	// info.setLongColor() ブロックに色をつけなおす
	//--------------------------------------------------------------------------------
	getLongColor : function(seglist){
		// 周りで一番大きな線は？
		var largeid = null, longColor = "";
		for(var i=0,len=seglist.length;i<len;i++){
			var r = this.lineid[seglist[i].id];
			if(r===null || r<=0){ continue;}
			if(largeid===null || this.seglist[largeid].length < this.seglist[r].length){
				largeid = r;
				longColor = seglist[i].color;
			}
		}
		return (!!longColor ? longColor : this.owner.painter.getNewLineColor());
	},
	setLongColor : function(assign, longColor){
		var puzzle = this.owner;
		/* assign:影響のあったareaidの配列 */
		var seglist = new puzzle.SegmentList();
		
		// できた線の中でもっとも長いものを取得する
		var longid = assign[0];
		for(var i=1;i<assign.length;i++){
			if(this.seglist[longid].length<this.seglist[assign[i]].length){ longid = assign[i];}
		}
		
		// 新しい色の設定
		for(var i=0;i<assign.length;i++){
			var newColor = (assign[i]===longid ? longColor : puzzle.painter.getNewLineColor());
			var segs = this.seglist[assign[i]];
			for(var n=0,len=segs.length;n<len;n++){ segs[n].color = newColor;}
			seglist.extend(segs);
		}
		
		if(puzzle.execConfig('irowake')){ puzzle.painter.repaintSegments(seglist);}
	},

	//---------------------------------------------------------------------------
	// seginfo.getaround()  指定したsegmentに繋がる線を全て取得する
	// seginfo.searchLine() id=0となっているsegmentにlineidを設定する
	// seginfo.searchSingle() 初期idを含む一つの領域内のareaidを指定されたものにする
	//---------------------------------------------------------------------------
	getaround : function(seg){
		var seglist = new this.owner.SegmentList();
		var cross1 = seg.cross1, cross2 = seg.cross2;
		for(var i=0,len=cross1.seglist.length;i<len;i++){
			if(cross1.seglist[i].id!==seg.id){ seglist.add(cross1.seglist[i]);}
		}
		for(var i=0,len=cross2.seglist.length;i<len;i++){
			if(cross2.seglist[i].id!==seg.id){ seglist.add(cross2.seglist[i]);}
		}

		return seglist;
	},

	searchLine : function(seglist){
		var assign = [];
		for(var i=0,len=seglist.length;i<len;i++){
			this.lineid[seglist[i].id] = 0;
		}
		for(var i=0,len=seglist.length;i<len;i++){
			if(this.lineid[seglist[i].id]!==0){ continue;}	// 既にidがついていたらスルー
			var newid = this.addPath();
			this.searchSingle(seglist[i], newid);
			assign.push(newid);
		}
		return assign;
	},
	searchSingle : function(startseg, newid){
		var stack = [startseg];
		while(stack.length>0){
			var seg = stack.pop();
			if(this.lineid[seg.id]!==0){ continue;}

			this.lineid[seg.id] = newid;
			this.seglist[newid].add(seg);

			var around = this.getaround(seg);
			for(var j=0;j<around.length;j++){
				if(this.lineid[around[j].id]===0){ stack.push(around[j]);}
			}
		}
	}
}
});
