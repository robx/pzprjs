//
// パズル固有スクリプト部 コンビブロック版 cbblock.js v3.3.3
//
Puzzles.cbblock = function(){ };
Puzzles.cbblock.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.iscross  = 1;
		k.isborder = 1;

		k.ispzprv3ONLY = true;

		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){ },

	protoChange : function(){
		this.protodef = Border.prototype.defques;
		Border.prototype.defques = 1;
	},
	protoOriginal : function(){
		Border.prototype.defques = this.protodef;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// 線を引かせたくないので上書き
		bd.isLineNG = function(id){ return (bd.border[id].ques===1);},
		bd.enableLineNG = true;

		bd.isGround = function(id){ return (!!bd.border[id] && bd.border[id].ques>0);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.borderQuescolor = "white";

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawBorderQsubs();

			this.drawBaseMarks();

			this.drawChassis();

			this.drawPekes(0);
		};

		// オーバーライド
		pc.setBorderColor = function(id){
			if(bd.border[id].ques===1){
				var cc2=bd.border[id].cellcc[1];
				g.fillStyle = ((cc2===null || bd.cell[cc2].error===0) ? this.borderQuescolor : this.errbcolor1);
				return true;
			}
			else if(bd.border[id].qans===1){
				g.fillStyle = this.borderQanscolor;
				return true;
			}
			return false;
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCBBlock();
		};
		enc.pzlexport = function(type){
			this.encodeCBBlock();
		};

		enc.decodeCBBlock = function(){
			var bstr = this.outbstr, twi=[16,8,4,2,1];
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
		};
		enc.encodeCBBlock = function(){
			var num=0, pass=0, cm="", twi=[16,8,4,2,1];
			for(var id=0,max=bd.bdmax;id<max;id++){
				if(bd.isGround(id)){ pass+=twi[num];} num++;
				if(num===5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}
			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeBorder( function(obj,ca){
				if     (ca==="3" ){ obj.ques = 0; obj.qans = 1; obj.qsub = 1;}
				else if(ca==="1" ){ obj.ques = 0; obj.qans = 1;}
				else if(ca==="-1"){ obj.ques = 1; obj.qsub = 1;}
				else if(ca==="-2"){ obj.ques = 0; obj.qsub = 1;}
				else if(ca==="2" ){ obj.ques = 0;}
				else              { obj.ques = 1;}
			});
		};
		fio.encodeData = function(){
			this.encodeBorder( function(obj){
				if     (obj.qans===1 && obj.qsub===1){ return "3 ";}
				else if(obj.qans===1){ return "1 ";}
				else if(obj.ques===1 && obj.qsub===1){ return "-1 ";}
				else if(obj.ques===0 && obj.qsub===1){ return "-2 ";}
				else if(obj.ques===0){ return "2 ";}
				else                 { return "0 ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			// それぞれ点線、境界線で作られる領域の情報
			var cinfo = this.getBlockData();
			if( !this.checkMiniBlockCount(cinfo, 1) ){
				this.setAlert('ブロックが1つの点線からなる領域で構成されています。','A block has one area framed by dotted line.'); return false;
			}

			if( !this.checkAllArea(cinfo, f_true, function(w,h,a,n){ return (w*h!==a);} ) ){
				this.setAlert('ブロックが四角形になっています。','A block is rectangle.'); return false;
			}

			if( !this.checkDifferentShapeBlock(cinfo) ){
				this.setAlert('同じ形のブロックが接しています。','The blocks that has the same shape are adjacent.'); return false;
			}

			if( !this.checkMiniBlockCount(cinfo, 3) ){
				this.setAlert('ブロックが3つ以上の点線からなる領域で構成されています。','A block has three or more areas framed by dotted line.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.getBlockData = function(){
			var tinfo = this.getArea(function(id){ return !bd.isGround(id);});
			var cinfo = this.getArea(function(id){ return bd.border[id].qans>0;});
			for(var r=1;r<=cinfo.max;r++){
				var d=[], cnt=0, room=cinfo.room[r], clist=room.idlist;
				room.size = room.idlist.length;

				for(var i=1;i<=tinfo.max;i++){ d[i]=0;}
				for(var i=0,len=room.size;i<len;i++){
					d[ tinfo.id[clist[i]] ]++;
				}
				for(var i=1;i<=tinfo.max;i++){ if(d[i]>0){ cnt++;}}
				room.dotcnt = cnt;
			}
			return cinfo;
		};
		ans.getArea = function(func){
			var tarea = new AreaInfo();
			for(var cc=0;cc<bd.cellmax;cc++){ tarea.id[cc]=null;}
			for(var cc=0;cc<bd.cellmax;cc++){
				if(tarea.id[cc]!=null){ continue;}
				tarea.max++;
				tarea[tarea.max] = {clist:[]};
				area.sr0(cc,tarea,func);

				tarea.room[tarea.max] = {idlist:tarea[tarea.max].clist};
			}
			return tarea;
		};

		ans.checkMiniBlockCount = function(cinfo, flag){
			var result=true;
			for(var r=1;r<=cinfo.max;r++){
				var cnt=cinfo.room[r].dotcnt;
				if((flag===1&&cnt===1) || (flag===3&&cnt>=3)){
					if(this.inAutoCheck){ return false;}
					bd.sErC(cinfo.room[r].idlist,1);
					result = false;
				}
			}
			return result;
		};

		ans.checkDifferentShapeBlock = function(cinfo){
			var result=true, sides=this.getSideAreaInfo(cinfo), sc={};
			for(var r=1;r<=cinfo.max-1;r++){
				if(cinfo.room[r].dotcnt!==2){ continue;}
				for(var i=0;i<sides[r].length;i++){
					var s = sides[r][i];
					// サイズ等は先に確認
					if(cinfo.room[s].dotcnt!==2){ continue;}
					if(cinfo.room[r].size!==cinfo.room[s].size){ continue;}

					if(!this.isDifferentShapeBlock(cinfo, r, s, sc)){
						if(this.inAutoCheck){ return false;}
						bd.sErC(cinfo.room[r].idlist,1);
						bd.sErC(cinfo.room[s].idlist,1);
						result = false;
					}
				}
			}
			return result;
		};
		ans.isDifferentShapeBlock = function(cinfo, r, s, sc){
			if(!sc[r]){ sc[r]=this.getBlockShapes(cinfo,r);}
			if(!sc[s]){ sc[s]=this.getBlockShapes(cinfo,s);}
			var t1=((sc[r].cols===sc[s].cols && sc[r].rows===sc[s].rows)?0:4);
			var t2=((sc[r].cols===sc[s].rows && sc[r].rows===sc[s].cols)?8:4);
			for(var t=t1;t<t2;t++){ if(sc[r].data[0]===sc[s].data[t]){ return false;}}
			return true;
		};
		ans.getBlockShapes = function(cinfo, r){
			var d=this.getSizeOfClist(cinfo.room[r].idlist, f_true);
			var data=[[],[],[],[],[],[],[],[]];
			var shapes={cols:d.cols, rows:d.rows, data:[]};

			for(var by=0;by<2*d.rows;by+=2){
				for(var bx=0;bx<2*d.cols;bx+=2){
					data[0].push((cinfo.id[bd.cnum(d.x1+bx,d.y1+by)]===r?1:0));
					data[1].push((cinfo.id[bd.cnum(d.x1+bx,d.y2-by)]===r?1:0));
				}
			}
			for(var bx=0;bx<2*d.cols;bx+=2){
				for(var by=0;by<2*d.rows;by+=2){
					data[4].push((cinfo.id[bd.cnum(d.x1+bx,d.y1+by)]===r?1:0));
					data[5].push((cinfo.id[bd.cnum(d.x1+bx,d.y2-by)]===r?1:0));
				}
			}
			data[2]=data[1].concat().reverse(); data[3]=data[0].concat().reverse();
			data[6]=data[5].concat().reverse(); data[7]=data[4].concat().reverse();
			for(var i=0;i<8;i++){ shapes.data[i]=data[i].join('');}
			return shapes;
		};
	}
};
