//
// パズル固有スクリプト部 快刀乱麻・新・快刀乱麻・ヤギとオオカミ版 kramma.js v3.4.0
//
pzprv3.custom.kramma = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			if(bd.puzzleid!=='kramma'){ this.inputcrossMark();}
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	// オーバーライド
	inputBD : function(flag){
		var pos = this.borderpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getborderID(this.prevPos, pos);
		if(id!==null){
			if(this.inputData===null){ this.inputData=(bd.isBorder(id)?0:1);}

			var d = bd.getlinesize(id);
			var idlist = new pzprv3.core.IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));
			for(var i=0;i<idlist.data.length;i++){
				if     (this.inputData===1){ bd.setBorder(idlist.data[i]);}
				else if(this.inputData===0){ bd.removeBorder(idlist.data[i]);}
			}

			pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	iscross  : 1,
	isborder : 1,

	numberAsObject : true,

	maxnum : 2,

	initialize : function(pid){
		this.SuperFunc.initialize.call(this,pid);

		if(pid==='kramma'||pid==='kramman'){
			this.qcols = 8;
			this.qrows = 8;
		}
	},

	getlinesize : function(id){
		var bx=this.border[id].bx, by=this.border[id].by;
		var d = {x1:bx, x2:bx, y1:by, y2:by};
		if(this.border[id].bx&1){
			while(d.x1>this.minbx && this.QnX(this.xnum(d.x1-1,by))!==1){d.x1-=2;}
			while(d.x2<this.maxbx && this.QnX(this.xnum(d.x2+1,by))!==1){d.x2+=2;}
		}
		else if(this.border[id].by&1){
			while(d.y1>this.minby && this.QnX(this.xnum(bx,d.y1-1))!==1){d.y1-=2;}
			while(d.y2<this.maxby && this.QnX(this.xnum(bx,d.y2+1))!==1){d.y2+=2;}
		}
		return d;
	}
},

AreaManager:{
	hasroom : true
},

Menu:{
	menuinit : function(){
		this.SuperFunc.menuinit.call(this);
		if(bd.puzzleid==='shwolf' && this.enableSaveImage){
			if(ee.br.Gecko && !location.hostname){
				ee('ms_imagesavep').el.className = 'smenunull';
			}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.borderQanscolor = "rgb(64, 64, 255)";
		this.setBorderColorFunc('qans');

		this.crosssize = 0.15;
		if(bd.puzzleid==='shwolf'){
			this.imgtile = new (pzprv3.getPuzzleClass('ImageTile'))('./src/img/shwolf_obj.png',2,1);
		}
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		if(bd.puzzleid!=='shwolf'){ this.drawQnumCircles();}
		else                      { this.drawSheepWolf();}

		if(bd.puzzleid!=='kramma'){ this.drawCrossMarks();}

		this.drawHatenas();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	drawSheepWolf : function(){
		var g = this.vinc('cell_number_image', 'auto');

		if(!this.imgtile.loaded){
			var func = arguments.callee, self = this;
			setTimeout(function(){func.call(self);},10);
			return;
		}

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj = bd.cell[c];
			var keyimg = ['cell',c,'quesimg'].join('_');
			if(obj.qnum>0){
				this.vshow(keyimg);
				this.imgtile.putImage(obj.qnum-1, g,obj.px,obj.py,this.cw,this.ch);
			}
			else{ this.vhide(keyimg);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		if(bd.puzzleid==='shwolf' || !this.checkpflag("c")){
			this.decodeCrossMark();
			this.decodeCircle();
		}
		else{
			this.decodeCircle();
		}

		this.checkPuzzleid();
	},
	pzlexport : function(type){
		if(bd.puzzleid!=='kramma'){
			this.encodeCrossMark();
			this.encodeCircle();
		}
		else{
			this.outpflag="c";
			this.encodeCircle();
		}
	},

	checkPuzzleid : function(){
		if(bd.puzzleid==='kramma'){
			for(var c=0;c<bd.crossmax;c++){
				if(bd.cross[c].qnum===1){ bd.puzzleid='kramman'; break;}
			}
			menu.displayDesign();
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCrossNum();
		this.decodeBorderAns();

		enc.checkPuzzleid();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCrossNum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( (bd.puzzleid!=='kramma') && !this.checkLcntCross(3,0) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( (bd.puzzleid!=='kramma') && !this.checkLcntCross(4,1) ){
			this.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
		}
		if( (bd.puzzleid!=='kramma') && !this.checkLcntCurve() ){
			this.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
		}

		if( (bd.puzzleid==='shwolf') && !this.checkLineChassis() ){
			this.setAlert('外枠につながっていない線があります。','A line doesn\'t connect to the chassis.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){
			if(bd.puzzleid!=='shwolf')
				{ this.setAlert('白丸も黒丸も含まれない領域があります。','An area has no marks.');}
			else
				{ this.setAlert('ヤギもオオカミもいない領域があります。','An area has neither sheeps nor wolves.');}
			return false;
		}

		if( !this.checkSameObjectInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			if(bd.puzzleid!=='shwolf')
				{ this.setAlert('白丸と黒丸が両方含まれる領域があります。','An area has both white and black circles.');}
			else
				{ this.setAlert('ヤギとオオカミが両方いる領域があります。','An area has both sheeps and wolves.');}
			return false;
		}

		if( (bd.puzzleid!=='kramma') && !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}
		if( (bd.puzzleid==='kramman') && !this.checkLcntCross(0,1) ){
			this.setAlert('黒点上を線が通過していません。','No lines on the black point.'); return false;
		}

		return true;
	},
	check1st : function(){ return (bd.puzzleid==='kramma') || this.checkLcntCross(1,0);},

	checkLcntCurve : function(){
		var result = true;
		for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
			for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
				var xc = bd.xnum(bx,by);
				if(bd.areas.rinfo.bdcnt[xc]===2 && bd.QnX(xc)!==1){
					if(    !(bd.QaB(bd.bnum(bx  ,by-1))===1 && bd.QaB(bd.bnum(bx  ,by+1))===1)
						&& !(bd.QaB(bd.bnum(bx-1,by  ))===1 && bd.QaB(bd.bnum(bx+1,by  ))===1) )
					{
						if(this.inAutoCheck){ return false;}
						bd.setCrossBorderError(bx,by);
						result = false;
					}
				}
			}
		}
		return result;
	},

	// ヤギとオオカミ用
	checkLineChassis : function(){
		var result = true;
		var lines = [];
		for(var id=0;id<bd.bdmax;id++){ lines[id]=bd.QaB(id);}
		for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
			for(var by=bd.minby;by<=bd.maxby;by+=2){
				/* 盤面端から探索をスタートする */
				if((bx===bd.minbx||bx===bd.maxbx)^(by===bd.minby||by===bd.maxby)){
					if     (by===bd.minby){ this.clearLineInfo(lines,bx,by,2);}
					else if(by===bd.maxby){ this.clearLineInfo(lines,bx,by,1);}
					else if(bx===bd.minbx){ this.clearLineInfo(lines,bx,by,4);}
					else if(bx===bd.maxbx){ this.clearLineInfo(lines,bx,by,3);}
				}
			}
		}
		for(var id=0;id<bd.bdmax;id++){
			if(lines[id]!==1){ continue;}

			if(this.inAutoCheck){ return false;}
			var errborder = [];
			for(var i=0;i<bd.bdmax;i++){ if(lines[i]==1){ errborder.push(i);} }
			if(result){ bd.sErBAll(2);}
			bd.sErB(errborder,1);
			result = false;
		}

		return result;
	},
	clearLineInfo : function(lines,bx,by,dir){
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if(!((bx+by)&1)){
				var xc = bd.xnum(bx,by), id;
				if(xc!==null && bd.QnX(xc)===1){
					id=bd.bnum(bx,by-1); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,1);}
					id=bd.bnum(bx,by+1); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,2);}
					id=bd.bnum(bx-1,by); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,3);}
					id=bd.bnum(bx+1,by); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,4);}
					break;
				}
			}
			else{
				var id = bd.bnum(bx,by);
				if(id===null || lines[id]===0){ break;}
				lines[id]=0;
			}
		}
	}
},

//---------------------------------------------------------
//---------------------------------------------------------
ImageTile:{
	initialize : function(src,col,row){
		this.image = new Image();
		this.image.src = src;

		this.cols = col;
		this.rows = row;

		this.width  = 0;
		this.height = 0;
		this.cw     = 0;
		this.ch     = 0;
		this.loaded = false;

		var self = this;
		setTimeout(function(){
			if(self.image.height>0){ self.load_func.call(self);}
			else{ setTimeout(arguments.callee,10);}
		},10);
	},
	load_func : function(){
		this.width  = this.image.width;
		this.height = this.image.height;
		this.cw     = this.width/this.cols;
		this.ch     = this.height/this.rows;
		this.loaded = true;
	},
	putImage : function(id,ctx,dx,dy,dw,dh){
		if(this.loaded){
			if(dw===(void 0)){ dw=this.cw; dh=this.ch;}
			var col=id%this.cols, row=(id/this.cols)|0;
			ctx.drawImage(this.image, col*this.cw,row*this.ch,this.cw,this.ch, dx,dy,dw,dh);
			return true;
		}
		return false;
	}
}
};
