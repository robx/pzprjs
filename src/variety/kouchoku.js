//
// パズル固有スクリプト部 交差は直角に限る版 kouchoku.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['kouchoku', 'angleloop'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes:{edit:['number','clear']},
	mouseinput_number : function(){
		if(this.mousestart){ this.inputqnum_cross();}
	},
	mouseinput_clear : function(){
		this.inputclean_cross();
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputsegment();}
			else if(this.mouseend){ this.inputsegment_up();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum_cross();}
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

		var puzzle = this.puzzle;
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

		var bd = this.board, seg = bd.getSegment(bx1,by1,bx2,by2);
		if(seg===null){ bd.segment.addSegmentByAddr(bx1,by1,bx2,by2);}
		else          { bd.segment.remove(seg);}
	},

	mousereset : function(e){
		if(this.inputData===1){
			var cross1=this.targetPoint[0], cross2=this.targetPoint[1];
			this.targetPoint = [null, null];
			if(cross1!==null){ cross1.draw();}
			if(cross2!==null){ cross2.draw();}
		}
		this.common.mousereset.call(this);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTCross(ca);}
},

"KeyEvent@kouchoku":{
	keyinput : function(ca){
		var cross = this.cursor.getx();

		if(ca.length>1 && ca!=='BS'){ return;}
		else if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-9;
			if(cross.qnum===num){ cross.setQnum(-1);}
			else{ cross.setQnum(num);}
		}
		else if(ca==='-'){ cross.setQnum(cross.qnum!==-2?-2:-1);}
		else if(ca===' '||ca==='BS'){ cross.setQnum(-1);}
		else{ return;}

		this.prev = cross;
		cross.draw();
	}
},

"KeyEvent@angleloop":{
	keyinput : function(ca){
		var cross = this.cursor.getx();

		if(ca.length>1 && ca!=='BS'){ return;}
		else if('a'<=ca && ca<='c'){
			var num = parseInt(ca,36)-9;
			if(cross.qnum===num){ cross.setQnum(-1);}
			else{ cross.setQnum(num);}
		}
		else if(ca===' '||ca==='BS'){ cross.setQnum(-1);}
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
"Cross@kouchoku":{
	maxnum : 26
},
"Cross@angleloop":{
	disInputHatena : true,
	maxnum : 3,
	minnum : 1
},
Segment:{
	group : "segment",
	initialize : function(bx1, by1, bx2, by2){
		this.path = null;
		this.isnull = true;

		this.sideobj = [null,null];	// 2つの端点を指すオブジェクトを保持する

		this.bx1 = null;		// 端点1のX座標(border座標系)を保持する
		this.by1 = null;		// 端点1のY座標(border座標系)を保持する
		this.bx2 = null;		// 端点2のX座標(border座標系)を保持する
		this.by2 = null;		// 端点2のY座標(border座標系)を保持する

		this.dx = 0;	// X座標の差分を保持する
		this.dy = 0;	// Y座標の差分を保持する

		this.lattices = [];	// 途中で通過する格子点を保持する

		this.error = 0;
		this.trial = 0;

		this.setpos(bx1,by1,bx2,by2);
	},
	setpos : function(bx1,by1,bx2,by2){
		this.sideobj[0] = this.board.getx(bx1,by1);
		this.sideobj[1] = this.board.getx(bx2,by2);

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
			var cross=this.board.getx(bx,by);
			this.lattices.push([bx,by,cross.id]);
		}
	},

	seterr : function(num){
		if(this.board.isenableSetError()){ this.error = num;}
	},

	//---------------------------------------------------------------------------
	// addOpe()  履歴情報にプロパティの変更を通知する
	//---------------------------------------------------------------------------
	addOpe : function(old, num){
		this.puzzle.opemgr.add(new this.klass.SegmentOperation(this, old, num));
	},

	//---------------------------------------------------------------------------
	// seg.isRightAngle() 2本のsegmentが直角かどうか判定する
	// seg.isParallel()   2本のsegmentが平行かどうか判定する
	// seg.isCrossing()   2本のsegmentが平行でなく交差しているかどうか判定する
	// seg.isOverLapSegment() 2本のsegmentが平行でさらに重なっているかどうか判定する
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
		if(!this.isOverLapRect(seg.bx1,seg.by1,seg.bx2,seg.by2)){ return false;}

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

	//---------------------------------------------------------------------------
	// seg.isOverLapRect() (x1,y1)-(x2,y2)の長方形内か縦か横にいることを判定する
	// seg.isAreaInclude() (x1,y1)-(x2,y2)の長方形に含まれるかどうかを判定する
	// seg.isOverLap()     一次元軸上で(a1-a2)と(b1-b2)の範囲が重なっているかどうか判定する
	// seg.ispositive()    (端点1-P)と(P-端点2)で外積をとった時のZ軸方向の符号がが正か負か判定する
	//                     端点1-P-端点2の経路が左曲がりの時、値が正になります (0は直線)
	//---------------------------------------------------------------------------
	isOverLapRect : function(bx1,by1,bx2,by2){
		return (this.isOverLap(this.bx1,this.bx2,bx1,bx2) &&
				this.isOverLap(this.by1,this.by2,by1,by2));
	},
	isAreaInclude : function(x1,y1,x2,y2){
		if(this.isOverLapRect(x1,y1,x2,y2)){
			var cnt=0;
			if(this.ispositive(x1,y1)){ cnt++;}
			if(this.ispositive(x1,y2)){ cnt++;}
			if(this.ispositive(x2,y1)){ cnt++;}
			if(this.ispositive(x2,y2)){ cnt++;}
			if(cnt>0 && cnt<4){ return true;}
		}
		return false;
	},
	isOverLap : function(a1,a2,b1,b2){
		var tmp;
		if(a1>a2){ tmp=a1;a1=a2;a2=tmp;} if(b1>b2){ tmp=b1;b1=b2;b2=tmp;}
		return (b1<a2 && a1<b2);
	},
	ispositive : function(bx,by){
		return((bx-this.bx1)*(this.by2-by)-(this.bx2-bx)*(by-this.by1)>0);
	}
},
"SegmentList:PieceList":{
	name : 'SegmentList',

	add : function(seg){
		var bd = this.board;
		if(this===bd.segment){
			seg.isnull = false;
		}
		this.klass.PieceList.prototype.add.call(this, seg);
		if(this===bd.segment){
			bd.getx(seg.bx1, seg.by1).seglist.add(seg);
			bd.getx(seg.bx2, seg.by2).seglist.add(seg);
			if(bd.isenableInfo()){ bd.linegraph.modifyInfo(seg, 'segment');}
			seg.addOpe(0, 1);

			if(bd.trialstage>0){ seg.trial = bd.trialstage;}
		}
	},
	remove : function(seg){
		var bd = this.board;
		if(this===bd.segment){
			seg.isnull = true;
		}
		this.klass.PieceList.prototype.remove.call(this, seg);
		if(this===bd.segment){
			bd.getx(seg.bx1, seg.by1).seglist.remove(seg);
			bd.getx(seg.bx2, seg.by2).seglist.remove(seg);
			if(bd.isenableInfo()){ bd.linegraph.modifyInfo(seg, 'segment');}
			seg.addOpe(1, 0);
			if(!!this.puzzle.canvas){
				this.puzzle.painter.eraseSegment1(seg); // 描画が残りっぱなしになってしまうのを防止
			}
		}
	},

	allclear : function(){
		this.ansclear();
	},
	ansclear : function(){
		// Segmentのclearとは配列を空にすること
		for(var i=this.length-1;i>=0;i--){ this.remove(this[i]);}
	},
	errclear : function(){
		for(var i=0;i<this.length;i++){ this[i].error = 0;}
	},
	trialclear : function(){
		for(var i=0;i<this.length;i++){ this[i].trial = 0;}
	},

	//---------------------------------------------------------------------------
	// segment.getRange()    SegmentListが存在する範囲を返す
	//---------------------------------------------------------------------------
	getRange : function(){
		if(this.length===0){ return null;}
		var bd = this.board;
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

	//---------------------------------------------------------------------------
	// segment.addSegmentByAddr()    線をアドレス指定で引く時に呼ぶ
	// segment.removeSegmentByAddr() 線をアドレス指定で消す時に呼ぶ
	//---------------------------------------------------------------------------
	addSegmentByAddr : function(bx1,by1,bx2,by2){
		this.add(new this.klass.Segment(bx1,by1,bx2,by2));
	},
	removeSegmentByAddr : function(bx1,by1,bx2,by2){
		this.remove(this.board.getSegment(bx1,by1,bx2,by2));
	}
},

Board:{
	cols : 7,
	rows : 7,
	disable_subclear : true,

	createExtraObject : function(){
		this.segment = new this.klass.SegmentList();
	},

	setposCrosses : function(){
		this.common.setposCrosses.call(this);

		for(var id=0;id<this.cross.length;id++){
			if(!this.cross[id].seglist){
				this.cross[id].seglist = new this.klass.PieceList();
			}
		}
	},

	allclear : function(isrec){
		this.segment.allclear();

		this.common.allclear.call(this,isrec);
	},
	ansclear : function(){
		this.puzzle.opemgr.newOperation();
		this.segment.ansclear();

		this.common.ansclear.call(this);
	},
	errclear : function(){
		if(this.haserror){
			this.segment.errclear();
		}
		return this.common.errclear.call(this);
	},
	trialclear : function(){
		if(this.trialstage>0){
			this.segment.trialclear();
		}
		this.common.trialclear.call(this);
	},

	getLatticePoint : function(bx1,by1,bx2,by2){
		var seg = new this.klass.Segment(bx1,by1,bx2,by2), lattice = [];
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

		return this.segment.filter(function(seg){ return seg.isAreaInclude(x1,y1,x2,y2);});
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
		var bd=this.board, bexec=this;
		if(key & this.REDUCE){
			var sublist=new this.klass.SegmentList();
			bd.segment.each(function(seg){
				var bx1=seg.bx1, by1=seg.by1, bx2=seg.bx2, by2=seg.by2;
				switch(key){
					case bexec.REDUCEUP: if(by1<bd.minby+2||by2<bd.minby+2){ sublist.add(seg);} break;
					case bexec.REDUCEDN: if(by1>bd.maxby-2||by2>bd.maxby-2){ sublist.add(seg);} break;
					case bexec.REDUCELT: if(bx1<bd.minbx+2||bx2<bd.minbx+2){ sublist.add(seg);} break;
					case bexec.REDUCERT: if(bx1>bd.maxbx-2||bx2>bd.maxbx-2){ sublist.add(seg);} break;
				}
			});

			var opemgr = this.puzzle.opemgr, isrec = (!opemgr.undoExec && !opemgr.redoExec);
			if(isrec){ opemgr.forceRecord = true;}
			for(var i=0;i<sublist.length;i++){ bd.segment.remove(sublist[i]);}
			if(isrec){ opemgr.forceRecord = false;}
		}
	},
	adjustBoardData2 : function(key,d){
		var bexec=this, xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		this.board.segment.each(function(seg){
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

LineGraph:{
	enabled : true,
	relation : {'segment':'link'},

	pointgroup : 'cross',
	linkgroup  : 'segment',

	isedgevalidbylinkobj : function(seg){ return !seg.isnull;},

	repaintNodes : function(components){
		var segs_all = new this.klass.SegmentList();
		for(var i=0;i<components.length;i++){
			segs_all.extend(components[i].getedgeobjs());
		}
		this.puzzle.painter.repaintLines(segs_all);
	}
},
GraphComponent:{
	getLinkObjByNodes : function(node1, node2){
		var bx1=node1.obj.bx, by1=node1.obj.by, bx2=node2.obj.bx, by2=node2.obj.by;
		return this.board.getSegment(bx1, by1, bx2, by2);
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
		var bx1=this.bx1, by1=this.by1, bx2=this.bx2, by2=this.by2, puzzle=this.puzzle, tmp;
		if     (num===1){ puzzle.board.segment.addSegmentByAddr   (bx1,by1,bx2,by2);}
		else if(num===0){ puzzle.board.segment.removeSegmentByAddr(bx1,by1,bx2,by2);}
		if(bx1>bx2){ tmp=bx1;bx1=bx2;bx2=tmp;} if(by1>by2){ tmp=by1;by1=by2;by2=tmp;}
		puzzle.painter.paintRange(bx1-1,by1-1,bx2+1,by2+1);
	}
},

OperationManager:{
	addExtraOperation : function(){
		this.operationlist.push(this.klass.SegmentOperation);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	margin : 0.50,

	hideHatena : true,

	irowake : true,

	gridcolor_type : "DLIGHT",

	repaintLines : function(segs){
		if(!this.context.use.canvas){
			this.vinc('segment', 'auto');
			for(var i=0;i<segs.length;i++){ this.drawSegment1(segs[i],true);}
		}
		else{
			var d = segs.getRange();
			this.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
	},

	drawSegments : function(){
		var bd = this.board;
		this.vinc('segment', 'auto');

		var segs = bd.segment;
		/* 全領域の30%以下なら範囲指定 */
		if(((this.range.x2-this.range.x1)*(this.range.y2-this.range.y1))/((bd.maxbx-bd.minbx)*(bd.maxby-bd.minby))<0.30){
			segs = bd.segmentinside(this.range.x1,this.range.y1,this.range.x2,this.range.y2);
		}

		for(var i=0;i<segs.length;i++){ this.drawSegment1(segs[i],true);}
	},
	eraseSegment1 : function(seg){
		this.vinc('segment', 'auto');
		this.drawSegment1(seg,false);
	},
	drawSegment1 : function(seg,isdraw){
		if(seg.bx1===void 0){ /* 消すための情報が無い場合は何もしない */ return; }

		var g = this.context;
		g.vid = ["seg",seg.bx1,seg.by1,seg.bx2,seg.by2].join("_");
		if(isdraw){
			if(seg.trial && this.puzzle.getConfig('irowake')){ g.lineWidth = this.lw - this.lm;}
			else{ g.lineWidth = this.lw;}

			if     (seg.error=== 1){ g.strokeStyle = this.errlinecolor;}
			else if(seg.error===-1){ g.strokeStyle = this.noerrcolor;}
			else if(this.puzzle.execConfig('irowake') && seg.path.color){ g.strokeStyle = seg.path.color;}
			else if(seg.trial)     { g.strokeStyle = this.trialcolor;}
			else{ g.strokeStyle = this.linecolor;}

			var px1 = seg.bx1*this.bw, px2 = seg.bx2*this.bw,
				py1 = seg.by1*this.bh, py2 = seg.by2*this.bh;
			g.strokeLine(px1,py1,px2,py2);
		}
		else{ g.vhide();}
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
			if(this.puzzle.mouse.targetPoint[0]===cross ||
			   this.puzzle.mouse.targetPoint[1]===cross){
				g.strokeCircle(cross.bx*this.bw, cross.by*this.bh, csize);
			}
			else{ g.vhide();}
		}
	}
},

"Graphic@kouchoku":{
	autocmp: "kouchoku",

	paint : function(){
		this.drawDashedGrid(false);

		this.drawSegments();

		this.drawCrosses_kouchoku();
		this.drawSegmentTarget();
		this.drawTarget();
	},

	drawCrosses_kouchoku : function(){
		var g = this.vinc('cross_base', 'auto', true);

		var isgray = this.puzzle.execConfig('autocmp');
		var csize1 = this.cw*0.30+1, csize2 = this.cw*0.20;
		g.lineWidth = 1;

		var option = {ratio:0.55};
		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			var graydisp = (isgray && cross.error===0 && cross.lcnt>=2);
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
				g.fillStyle = (graydisp ? "gray" : this.quescolor);
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
	}
},

"Graphic@angleloop":{
	paint : function(){
		this.drawDashedGrid(false);

		this.drawSegments();

		this.drawCrosses_angleloop();
		this.drawSegmentTarget();
		this.drawTarget();
	},

	drawCrosses_angleloop : function(){
		var g = this.vinc('cross_base', 'auto', true);
		g.lineWidth = 1;

		var r=this.cw*0.25;
		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			var px = cross.bx*this.bw, py = cross.by*this.bh;
			for(var d=1;d<=3;d++){
				g.vid = "x_cp_"+d+"_"+cross.id;
				if(cross.qnum!==d){
					g.vhide();
					continue;
				}
				g.strokeStyle = "black";
				if(cross.error===1){
					g.fillStyle = this.errbcolor1;
				}else{
					switch(d){
						case 1: g.fillStyle = "black"; break;
						case 2: g.fillStyle = "gray"; break;
						case 3: g.fillStyle = "white"; break;
					}
				}
				switch(d){
					case 1:
						var a=0.85*r, b=0.5*r;
						g.setOffsetLinePath(px, py, 0,-r, -a,b, a,b, true);
						break;
					case 2:
						var a=0.7*r;
						g.setOffsetLinePath(px, py, -a,-a, -a,a, a,a, a,-a, true);
						break;
					case 3:
						var a=0.31*r, b=0.95*r, c=0.81*r, d=0.59*r;
						g.setOffsetLinePath(px, py, 0,-r, -b,-a, -d,c, d,c, b,-a, true);
						break;
				}
				g.shape();
			}
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
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cross = bd.cross[c], ca = bstr.charAt(i);
			if     (this.include(ca,"a","z")){ cross.qnum = parseInt(ca,36)-9;}
			else if(this.include(ca,"0","9")){ c+=(parseInt(ca,36));}
			else if(ca==="."){ cross.qnum=-2;}

			c++;
			if(!bd.cross[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeCrossABC : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cross.length;c++){
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
		var len = +this.readLine();
		for(var i=0;i<len;i++){
			var data = this.readLine().split(" ");
			this.board.segment.addSegmentByAddr(+data[0], +data[1], +data[2], +data[3]);
		}
	},
	encodeSegment : function(){
		var fio = this, segs = this.board.segment;
		this.writeLine(segs.length);
		segs.each(function(seg){
			fio.writeLine([seg.bx1, seg.by1, seg.bx2, seg.by2].join(" "));
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkSegmentExist : function(){
		if(this.board.segment.length===0){ this.failcode.add("brNoLine");}
	},

	checkAlonePoint : function(){
		this.checkSegment(function(cross){ return (cross.lcnt<2 && cross.qnum!==-1);}, "nmLineLt2");
	},
	checkSegmentPoint : function(){
		this.checkSegment(function(cross){ return (cross.lcnt>0 && cross.qnum===-1);}, "lnIsolate");
	},
	checkSegmentBranch : function(){
		this.checkSegment(function(cross){ return (cross.lcnt>2);}, "lnBranch");
	},
	checkSegmentDeadend : function(){
		this.checkSegment(function(cross){ return (cross.lcnt===1);}, "lnDeadEnd");
	},
	checkSegment : function(func, code){
		var result = true, bd = this.board;
		for(var c=0;c<bd.cross.length;c++){
			var cross = bd.cross[c];
			if(!func(cross)){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			cross.seterr(1);
		}
		if(!result){
			this.failcode.add(code);
			bd.segment.setnoerr();
		}
	},

	checkOneSegmentLoop : function(){
		var bd = this.board, paths = bd.linegraph.components, validcount = 0;
		for(var r=0;r<paths.length;r++){
			if(paths[r].length===0){ continue;}
			validcount++;
			if(validcount<=1){ continue;}

			this.failcode.add("lnPlLoop");
			bd.segment.setnoerr();
			paths[r].setedgeerr(1);
			break;
		}
	},

	checkSegmentOverClue : function(){
		var result = true, bd = this.board, segs = bd.segment;
		segs.each(function(seg){
			var lattice = bd.getLatticePoint(seg.bx1,seg.by1,seg.bx2,seg.by2);
			for(var n=0;n<lattice.length;n++){
				seg.seterr(1);
				bd.cross[lattice[n]].seterr(1);
				result = false;
			}
		});
		if(!result){
			this.failcode.add("lnPassOver");
			segs.setnoerr();
		}
	},

	checkDifferentLetter : function(){
		var result = true, bd = this.board, segs = bd.segment;
		segs.each(function(seg){
			var cross1=seg.sideobj[0], cross2=seg.sideobj[1];
			if(cross1.qnum!==-2 && cross2.qnum!==-2 && cross1.qnum!==cross2.qnum){
				seg.seterr(1);
				cross1.seterr(1);
				cross2.seterr(1);
				result = false;
			}
		});
		if(!result){
			this.failcode.add("nmConnDiff");
			segs.setnoerr();
		}
	},

	checkConsequentLetter : function(){
		var count = {}, qnlist = [], bd = this.board;
		// この関数に来る時は、線は黒－黒、黒－文字、文字－文字(同じ)のいずれか
		for(var c=0;c<bd.cross.length;c++){
			var qn = bd.cross[c].qnum;
			if(qn>=0){ count[qn] = [0,0,0];}
		}
		for(var c=0;c<bd.cross.length;c++){
			var qn = bd.cross[c].qnum;
			if(qn>=0){
				if(count[qn][0]===0){ qnlist.push(qn);}
				count[qn][0]++;
			}
		}
		bd.segment.each(function(seg){
			var cross1=seg.sideobj[0], cross2=seg.sideobj[1];
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
		var result = true, segs = this.board.segment, len = segs.length;
		allloop:
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=segs[i], seg2=segs[j];
			if(seg1===null || seg2===null || !seg1.isOverLapSegment(seg2)){ continue;}

			result = false;
			if(this.checkOnly){ break allloop;}
			seg1.seterr(1);
			seg2.seterr(1);
		}}
		if(!result){
			this.failcode.add("lnOverlap");
			segs.setnoerr();
		}
	},

	checkRightAngle : function(){
		var result = true, segs = this.board.segment, len = segs.length;
		allloop:
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=segs[i], seg2=segs[j];
			if(seg1===null || seg2===null || !seg1.isCrossing(seg2) || seg1.isRightAngle(seg2)){ continue;}

			result = false;
			if(this.checkOnly){ break allloop;}
			seg1.seterr(1);
			seg2.seterr(1);
		}}
		if(!result){
			this.failcode.add("lnRightAngle");
			segs.setnoerr();
		}
	},

	checkCrossLine : function(){
		var result = true, segs = this.board.segment, len = segs.length;
		allloop:
		for(var i=0;i<len;i++){ for(var j=i+1;j<len;j++){
			var seg1=segs[i], seg2=segs[j];
			if(seg1===null || seg2===null || !seg1.isCrossing(seg2)){ continue;}

			result = false;
			if(this.checkOnly){ break allloop;}
			seg1.seterr(1);
			seg2.seterr(1);
		}}
		if(!result){
			this.failcode.add("lnCross");
			segs.setnoerr();
		}
	},

	checkAngle : function(){
		var result = true, bd=this.board;
		for(var c=0;c<bd.cross.length;c++){
			var cross = bd.cross[c];
			if(cross.qnum<1||cross.lcnt!==2){
				continue;
			}
			var seg1=cross.seglist[0], seg2=cross.seglist[1];
			if(seg1.isParallel(seg2)){
				result = false;
				if(this.checkOnly){ break;}
				cross.seterr(1);
				continue;
			}
			if(seg1.isRightAngle(seg2)){
				if(cross.qnum===2){
					continue;
				}
				result = false;
				if(this.checkOnly){ break;}
				cross.seterr(1);
				continue;
			}
			var dir=function(seg){
				if(cross.bx===seg.bx1&&cross.by===seg.by1){
					return [seg.dx,seg.dy];
				}else{
					return [-seg.dx,-seg.dy];
				}
			};
			var dir1=dir(seg1), dir2=dir(seg2);
			var p=dir1[0]*dir2[0]+dir1[1]*dir2[1];
			if(p>0&&cross.qnum!==1 || p<0&&cross.qnum!==3){
				result = false;
				if(this.checkOnly){ break;}
				cross.seterr(1);
			}
		}
		if(!result){
			this.failcode.add("lnWrongAngle");
		}
	}
},

"AnsCheck@kouchoku":{
	checklist : [
		"checkSegmentExist",
		"checkSegmentPoint",
		"checkSegmentBranch",
		"checkSegmentOverClue",
		"checkDuplicateSegment",
		"checkDifferentLetter",
		"checkRightAngle",
		"checkOneSegmentLoop",
		"checkSegmentDeadend",
		"checkAlonePoint",
		"checkConsequentLetter"
	]
},

"AnsCheck@angleloop":{
	checklist : [
		"checkSegmentExist",
		"checkSegmentPoint",
		"checkSegmentBranch",
		"checkSegmentOverClue",
		"checkDuplicateSegment",
		"checkOneSegmentLoop",
		"checkSegmentDeadend",
		"checkAlonePoint",
		"checkCrossLine",
		"checkAngle"
	]
},

FailCode:{
	lnIsolate    : ["線が丸のないところから出ています。","A segment starts outside a clue."],
	lnPassOver   : ["線が丸を通過しています。","A segment passes over a clue."],
	lnOverlap    : ["線が同一直線上で重なっています。","Some segments overlap."],
	lnRightAngle : ["線が直角に交差していません。","Segments don't intersect at a right angle."],
	lnWrongAngle : ["直線のなす角度がマークと違います。","Some segments meet at the wrong angle."],
	nmConnDiff   : ["異なる文字が直接繋がっています。","Different letters are connected directly."],
	nmNotConseq  : ["同じ文字がひとつながりになっていません。","Equal letters are not connected directly."],
	nmLineLt2    : ["線が2本出ていない丸があります。","A clue doesn't have two segments."],
	brNoLine     : ["線が存在していません。","There is no segment."]
}
}));
