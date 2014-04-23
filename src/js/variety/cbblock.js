//
// パズル固有スクリプト部 コンビブロック版 cbblock.js v3.4.1
//
pzpr.classmgr.makeCustom(['cbblock'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
			}
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	ques : 1,

	enableLineNG : true,

	// 線を引かせたくないので上書き
	isLineNG : function(){ return (this.ques===1);},

	isGround : function(){ return (this.ques>0);}
},

Board:{
	qcols : 8,
	qrows : 8,

	hascross  : 1,
	hasborder : 1,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.tiles = this.addInfoList(this.owner.AreaTileManager);
		this.blocks = this.addInfoList(this.owner.AreaBlockManager);
	},

	getBlockInfo : function(){
		var tinfo = this.tiles.getAreaInfo();
		var cinfo = this.blocks.getAreaInfo();

		for(var r=1;r<=cinfo.max;r++){
			var d=[], cnt=0, clist=cinfo.room[r].clist;
			cinfo.room[r].size = clist.length;

			for(var i=1;i<=tinfo.max;i++){ d[i]=0;}
			for(var i=0;i<clist.length;i++){
				d[ tinfo.getRoomID(clist[i]) ]++;
			}
			for(var i=1;i<=tinfo.max;i++){ if(d[i]>0){ cnt++;}}
			cinfo.room[r].dotcnt = cnt;
		}
		return cinfo;
	}
},

"AreaTileManager:AreaManager":{
	enabled : true,
	relation : ['border'],
	bdfunc : function(border){ return !border.isGround();}
},
"AreaBlockManager:AreaManager":{
	enabled : true,
	relation : ['border'],
	bdfunc : function(border){ return border.qans>0;}
},

CellList:{
	getBlockShapes : function(){
		var bd=this.owner.board;
		var d=this.getRectSize();
		var data=[[],[],[],[],[],[],[],[]];
		var shapes={cols:d.cols, rows:d.rows, data:[]};

		for(var by=0;by<2*d.rows;by+=2){
			for(var bx=0;bx<2*d.cols;bx+=2){
				data[0].push(this.include(bd.getc(d.x1+bx,d.y1+by))?1:0);
				data[1].push(this.include(bd.getc(d.x1+bx,d.y2-by))?1:0);
			}
		}
		for(var bx=0;bx<2*d.cols;bx+=2){
			for(var by=0;by<2*d.rows;by+=2){
				data[4].push(this.include(bd.getc(d.x1+bx,d.y1+by))?1:0);
				data[5].push(this.include(bd.getc(d.x1+bx,d.y2-by))?1:0);
			}
		}
		data[2]=data[1].concat().reverse(); data[3]=data[0].concat().reverse();
		data[6]=data[5].concat().reverse(); data[7]=data[4].concat().reverse();
		for(var i=0;i<8;i++){ shapes.data[i]=data[i].join('');}
		return shapes;
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
		this.borderQuescolor = "white";
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawBorderQsubs();

		this.drawBaseMarks();

		this.drawChassis();

		this.drawPekes();
	},

	// オーバーライド
	getBorderColor : function(border){
		if(border.ques===1){
			var cell2=border.sidecell[1];
			return ((cell2.isnull || cell2.error===0) ? this.borderQuescolor : this.errbcolor1);
		}
		else if(border.qans===1){
			return this.borderQanscolor;
		}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeCBBlock();
	},
	encodePzpr : function(type){
		this.encodeCBBlock();
	},

	decodeCBBlock : function(){
		var bstr = this.outbstr, bd = this.owner.board, twi=[16,8,4,2,1];
		var pos = (bstr?Math.min((((bd.bdmax+4)/5)|0),bstr.length):0), id=0;
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<bd.bdmax){
					bd.border[id].ques = (ca&twi[w]?1:0);
					id++;
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCBBlock : function(){
		var num=0, pass=0, cm="", bd = this.owner.board, twi=[16,8,4,2,1];
		for(var id=0,max=bd.bdmax;id<max;id++){
			if(bd.border[id].isGround()){ pass+=twi[num];} num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}
		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="3" ){ obj.ques = 0; obj.qans = 1; obj.qsub = 1;}
			else if(ca==="1" ){ obj.ques = 0; obj.qans = 1;}
			else if(ca==="-1"){ obj.ques = 1; obj.qsub = 1;}
			else if(ca==="-2"){ obj.ques = 0; obj.qsub = 1;}
			else if(ca==="2" ){ obj.ques = 0;}
			else              { obj.ques = 1;}
		});
	},
	encodeData : function(){
		this.encodeBorder( function(obj){
			if     (obj.qans===1 && obj.qsub===1){ return "3 ";}
			else if(obj.qans===1){ return "1 ";}
			else if(obj.ques===1 && obj.qsub===1){ return "-1 ";}
			else if(obj.ques===0 && obj.qsub===1){ return "-2 ";}
			else if(obj.ques===0){ return "2 ";}
			else                 { return "0 ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		/* 境界線で作られる領域の情報 */
		var cinfo = this.owner.board.getBlockInfo();
		if( !this.checkMiniBlockCount(cinfo, 1) ){ return 'bkSubLt2';}
		if( !this.checkBlockNotRect(cinfo) ){ return 'bkRect';}
		if( !this.checkDifferentShapeBlock(cinfo) ){ return 'sbSameShape';}
		if( !this.checkMiniBlockCount(cinfo, 3) ){ return 'bkSubGt2';}

		return null;
	},

	checkBlockNotRect : function(cinfo){
		return this.checkAllArea(cinfo, function(w,h,a,n){ return (w*h!==a);});
	},

	checkMiniBlockCount : function(cinfo, flag){
		var result=true;
		for(var r=1;r<=cinfo.max;r++){
			var cnt=cinfo.room[r].dotcnt;
			if((flag===1&&cnt===1) || (flag===3&&cnt>=3)){
				if(this.checkOnly){ return false;}
				cinfo.room[r].clist.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkDifferentShapeBlock : function(cinfo){
		var result=true, sides=cinfo.getSideAreaInfo(), sc={};
		for(var r=1;r<=cinfo.max-1;r++){
			var room1 = cinfo.room[r];
			if(room1.dotcnt!==2){ continue;}
			for(var i=0;i<sides[r].length;i++){
				var s = sides[r][i], room2 = cinfo.room[s];
				// サイズ等は先に確認
				if(room2.dotcnt!==2){ continue;}
				if(room1.size!==room2.size){ continue;}

				if(!this.isDifferentShapeBlock(cinfo, r, s, sc)){
					if(this.checkOnly){ return false;}
					room1.clist.seterr(1);
					room2.clist.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},
	isDifferentShapeBlock : function(cinfo, r, s, sc){
		if(!sc[r]){ sc[r]=cinfo.room[r].clist.getBlockShapes();}
		if(!sc[s]){ sc[s]=cinfo.room[s].clist.getBlockShapes();}
		var t1=((sc[r].cols===sc[s].cols && sc[r].rows===sc[s].rows)?0:4);
		var t2=((sc[r].cols===sc[s].rows && sc[r].rows===sc[s].cols)?8:4);
		for(var t=t1;t<t2;t++){ if(sc[r].data[0]===sc[s].data[t]){ return false;}}
		return true;
	}
},

FailCode:{
	bkRect : ["ブロックが四角形になっています。","A block is rectangle."],
	sbSameShape : ["同じ形のブロックが接しています。","The blocks that has the same shape are adjacent."],
	bkSubLt2 : ["ブロックが1つの点線からなる領域で構成されています。","A block has one area framed by dotted line."],
	bkSubGt2 : ["ブロックが3つ以上の点線からなる領域で構成されています。","A block has three or more areas framed by dotted line."]
}
});
