//
// パズル固有スクリプト部 快刀乱麻・新・快刀乱麻・ヤギとオオカミ版 kramma.js v3.4.0
//
(function(){ var custombase = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart && this.owner.pid!=='kramma'){ this.inputcrossMark();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	// オーバーライド
	inputBD : function(flag){
		var pos = this.getpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getborderobj(this.prevPos, pos);
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.isBorder()?0:1);}

			var d = border.getlinesize();
			var borders = bd.borderinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<borders.length;i++){
				if     (this.inputData===1){ borders[i].setBorder();}
				else if(this.inputData===0){ borders[i].removeBorder();}
			}

			this.owner.painter.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
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
Cell:{
	numberAsObject : true,

	maxnum : 2,
},
Cross:{
	noNum : function(){ return this.id!==null && this.qnum===-1;}
},

Border:{
	getlinesize : function(){
		var pos1 = this.getaddr(), pos2 = pos1.clone();
		if(this.isVert()){
			while(pos1.move(0,-1).getx().noNum()){ pos1.move(0,-1);}
			while(pos2.move(0, 1).getx().noNum()){ pos2.move(0, 1);}
		}
		else{
			while(pos1.move(-1,0).getx().noNum()){ pos1.move(-1,0);}
			while(pos2.move( 1,0).getx().noNum()){ pos2.move( 1,0);}
		}
		return {x1:pos1.bx, y1:pos1.by, x2:pos2.bx, y2:pos2.by};
	}
},

Board:{
	iscross  : 1,
	isborder : 1
},
"Board@kramma,krammar":{
	qcols : 8,
	qrows : 8
},

AreaManager:{
	hasroom : true
},

"Menu@shwolf":{
	menuinit : function(pp){
		this.SuperFunc.menuinit.call(this,pp);
		if(this.enableSaveImage){
			if(pzprv3.browser.Gecko && !location.hostname){
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
		if(this.owner.pid==='shwolf'){
			this.imgtile = this.owner.newInstance('ImageTile',['./src/img/shwolf_obj.png',2,1]);
		}
	},

	prepaint : function(){
		if(this.owner.pid==='shwolf' && !this.imgtile.loaded){
			this.suspendAll();
		}
		else{
			this.SuperFunc.prepaint.call(this);
		}
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		if(this.owner.pid!=='shwolf'){ this.drawQnumCircles();}
		else                         { this.drawSheepWolf();}

		if(this.owner.pid!=='kramma'){ this.drawCrossMarks();}

		this.drawHatenas();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	drawSheepWolf : function(){
		var g = this.vinc('cell_number_image', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], keyimg = ['cell',cell.id,'quesimg'].join('_');
			if(cell.qnum>0){
				var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
				this.vshow(keyimg);
				this.imgtile.putImage(cell.qnum-1, g, rpx,rpy,this.cw,this.ch);
			}
			else{ this.vhide(keyimg);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		if(this.owner.pid==='shwolf' || !this.checkpflag("c")){
			this.decodeCrossMark();
			this.decodeCircle();
		}
		else{
			this.decodeCircle();
		}

		this.checkPuzzleid();
	},
	pzlexport : function(type){
		if(this.owner.pid!=='kramma'){
			this.encodeCrossMark();
			this.encodeCircle();
		}
		else{
			this.outpflag="c";
			this.encodeCircle();
		}
	},

	checkPuzzleid : function(){
		if(this.owner.pid==='kramma'){
			for(var c=0;c<bd.crossmax;c++){
				if(bd.cross[c].qnum===1){ this.owner.pid='kramman'; break;}
			}
			this.owner.menu.displayDesign();
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCrossNum();
		this.decodeBorderAns();

		this.owner.enc.checkPuzzleid();
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

		if( (this.owner.pid!=='kramma') && !this.checkLcntCross(3,0) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( (this.owner.pid!=='kramma') && !this.checkLcntCross(4,1) ){
			this.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
		}
		if( (this.owner.pid!=='kramma') && !this.checkLcntCurve() ){
			this.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
		}

		if( (this.owner.pid==='shwolf') && !this.checkLineChassis() ){
			this.setAlert('外枠につながっていない線があります。','A line doesn\'t connect to the chassis.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){
			if(this.owner.pid!=='shwolf')
				{ this.setAlert('白丸も黒丸も含まれない領域があります。','An area has no marks.');}
			else
				{ this.setAlert('ヤギもオオカミもいない領域があります。','An area has neither sheeps nor wolves.');}
			return false;
		}

		if( !this.checkSameObjectInRoom(rinfo, function(cell){ return cell.getNum();}) ){
			if(this.owner.pid!=='shwolf')
				{ this.setAlert('白丸と黒丸が両方含まれる領域があります。','An area has both white and black circles.');}
			else
				{ this.setAlert('ヤギとオオカミが両方いる領域があります。','An area has both sheeps and wolves.');}
			return false;
		}

		if( (this.owner.pid!=='kramma') && !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}
		if( (this.owner.pid==='kramman') && !this.checkLcntCross(0,1) ){
			this.setAlert('黒点上を線が通過していません。','No lines on the black point.'); return false;
		}

		return true;
	},
	check1st : function(){ return (this.owner.pid==='kramma') || this.checkLcntCross(1,0);},

	checkLcntCurve : function(){
		var result = true;
		for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
			for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
				var cross = bd.getx(bx,by);
				if(bd.areas.rinfo.bdcnt[cross.id]===2 && cross.getQnum()!==1){
					if(    !(cross.ub().getQans()===1 && cross.db().getQans()===1)
						&& !(cross.lb().getQans()===1 && cross.rb().getQans()===1) )
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
		for(var id=0;id<bd.bdmax;id++){ lines[id]=bd.border[id].getQans();}

		var pos = this.owner.newInstance('Address',[0,0]);
		for(pos.bx=bd.minbx;pos.bx<=bd.maxbx;pos.bx+=2){
			for(pos.by=bd.minby;pos.by<=bd.maxby;pos.by+=2){
				/* 盤面端から探索をスタートする */
				if((pos.bx===bd.minbx||pos.bx===bd.maxbx)^(pos.by===bd.minby||pos.by===bd.maxby)){
					if     (pos.by===bd.minby){ this.clearLineInfo(lines,pos,2);}
					else if(pos.by===bd.maxby){ this.clearLineInfo(lines,pos,1);}
					else if(pos.bx===bd.minbx){ this.clearLineInfo(lines,pos,4);}
					else if(pos.bx===bd.maxbx){ this.clearLineInfo(lines,pos,3);}
				}
			}
		}

		for(var id=0;id<bd.bdmax;id++){
			if(lines[id]!==1){ continue;}

			if(this.inAutoCheck){ return false;}
			if(result){ bd.border.seterr(-1);}
			for(var i=0;i<bd.bdmax;i++){ if(lines[i]==1){ bd.border[i].seterr(1);} }
			result = false;
		}

		return result;
	},
	clearLineInfo : function(lines,pos,dir){
		var stack = [[pos.clone(),dir]];
		while(stack.length>0){
			var dat = stack.pop();
			pos = dat[0];
			dir = dat[1];
			while(1){
				pos.movedir(dir,1);
				if(pos.oncross()){
					var cross = pos.getx();
					if(!cross.isnull && cross.getQnum()===1){
						if(cross.ub().getQans()){ stack.push([pos.clone(),1]);}
						if(cross.db().getQans()){ stack.push([pos.clone(),2]);}
						if(cross.lb().getQans()){ stack.push([pos.clone(),3]);}
						if(cross.rb().getQans()){ stack.push([pos.clone(),4]);}
						break;
					}
				}
				else{
					var border = pos.getb();
					if(border.isnull || lines[border.id]===0){ break;}
					lines[border.id]=0;
				}
			}
		}
	}
}
};

pzprv3.createCommonClass('ImageTile',
{
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
		this.owner.painter.unsuspend();
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
});

pzprv3.createCustoms('kramma', custombase);

})();
