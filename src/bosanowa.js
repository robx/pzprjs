//
// パズル固有スクリプト部 ボサノワ版 bosanowa.js v3.4.0
//
pzprv3.custom.bosanowa = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){ if(this.mousestart){ this.inputqnum_bosanowa();}},
	inputplay : function(){ if(this.mousestart){ this.inputqnum_bosanowa();}},

	inputqnum_bosanowa : function(){
		var pos = this.borderpos(0.31);
		if(!bd.isinside(pos.x,pos.y)){ return;}

		var tcp = tc.getTCP();
		if(tcp.equals(pos)){
			if(pos.oncell()){
				var cell = pos.getc(), ques = cell.getQues(), num = cell.getNum();
				var max = cell.nummaxfunc();
				if(this.owner.editmode){
					if(this.btn.Left){
						if     (ques===7) { cell.setNum(-1); cell.setQues(0);}
						else if(num===-1) { cell.setNum(1);  cell.setQues(0);}
						else if(num===max){ cell.setNum(-1); cell.setQues(7);}
						else{ cell.setNum(cc,num+1);}
					}
					else if(this.btn.Right){
						if     (ques===7) { cell.setNum(max); cell.setQues(0);}
						else if(num=== 1) { cell.setNum(-1);  cell.setQues(0);}
						else if(num===-1) { cell.setNum(-1);  cell.setQues(7);}
						else{ cell.setNum(num-1);}
					}
				}
				if(this.owner.playmode && ques===0){
					if(this.btn.Left){
						if     (num===max){ cell.setNum(-1);}
						else if(num===-1) { cell.setNum(1);}
						else{ cell.setNum(num+1);}
					}
					else if(this.btn.Right){
						if     (num===-1) { cell.setNum(max);}
						else if(num=== 1) { cell.setNum(-1);}
						else{ cell.setNum(num-1);}
					}
				}
			}
		}
		else{
			tc.setTCP(pos);
			tcp.draw();
		}
		pos.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){ return this.moveTBorder(ca);},

	keyinput : function(ca){
		this.key_inputqnum_bosanowa(ca);
	},
	key_inputqnum_bosanowa : function(ca){
		var tcp = tc.getTCP();
		if(tcp.oncell()){
			var cell = tc.getTCC();
			if(this.owner.editmode){
				if     (ca=='w'){ cell.setQues(cell.getQues()!==7?7:0); cell.setNum(-1);}
				else if(ca=='-'||ca==' '){ cell.setQues(0); cell.setNum(-1);}
				else if('0'<=ca && ca<='9'){
					if(cell.getQues()!==0){ cell.setQues(0); cell.setNum(-1);}
					this.key_inputqnum(ca);
				}
				else{ return;}
			}
			else if(this.owner.playmode){
				if(cell.getQues()===0){ this.key_inputqnum(ca);}
				else{ return;}
			}
		}
		else if(tcp.onborder()){
			var border = tcp.getb(), cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!border.isGrid()){ return;}
			if('0'<=ca && ca<='9'){
				var num = parseInt(ca), qs = border.getQsub();
				var qsubmax = 99;

				if(qs<=0 || this.prev!==border){ if(num<=qsubmax){ border.setQsub(num);}}
				else{
					if(qs*10+num<=qsubmax){ border.setQsub(qs*10+num);}
					else if(num<=qsubmax){ border.setQsub(num);}
				}
				this.prev = border;
			}
			else if(ca=='-'||ca==' '){ border.setQsub(-1);}
			else{ return;}
		}
		else{ return;}

		tcp.draw();
	}
},

TargetCursor:{
	initCursor : function(){
		this.pos = new pzprv3.core.Address(this.owner, bd.qcols-1-bd.qcols%2, bd.qrows-1-bd.qrows%2);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	ques : 7
},

Border:{
	qsub : -1,

	isGrid : function(){
		return (this.sidecell[0].isValid() && this.sidecell[1].isValid());
	},
	isBorder : function(){
		return !!(this.sidecell[0].isEmpty()^this.sidecell[1].isEmpty());
	}
},

Board:{
	isborder : 2,

	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		if(pzprv3.EDITOR){
			var cell = tc.getTCC(); /* 真ん中にあるはず */
			if(!cell.isnull){ cell.ques = 0;}
		}
	}
},

Menu:{
	menufix : function(){
		pp.addSelect('disptype','setting',1,[1,2,3],'表示形式','Display');
		pp.setLabel ('disptype', '表示形式', 'Display');

		pp.addChild('disptype_1', 'disptype', 'ニコリ紙面形式', 'Original Type');
		pp.addChild('disptype_2', 'disptype', '倉庫番形式',     'Sokoban Type');
		pp.addChild('disptype_3', 'disptype', 'ワリタイ形式',   'Waritai type');
		pp.funcs['disptype'] = function(num){
			pc.suspendAll();
			if     (num==1){ pc.bdmargin = 0.70; pc.bdmargin_image = 0.10;}
			else if(num==2){ pc.bdmargin = 1.20; pc.bdmargin_image = 1.10;}
			else if(num==3){ pc.bdmargin = 0.70; pc.bdmargin_image = 0.10;}
			pc.unsuspend();
		};
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.70,
	bdmargin_image : 0.10,

	setColors : function(){
		this.borderfontcolor = "blue";
	},
	paint : function(){
		this.drawBGCells();

		if(pp.getVal('disptype')==1){
			this.drawCircles_bosanowa();
			this.drawBDnumbase();
		}
		else if(pp.getVal('disptype')==2){
			this.drawOutside_souko();
			this.drawGrid_souko();
			this.drawBDnumbase();
		}
		else if(pp.getVal('disptype')==3){
			this.drawBorders();
			this.drawGrid_waritai();
		}

		this.drawNumbers();
		this.drawNumbersBD();

		if(pzprv3.EDITOR && !this.outputImage){
			this.drawChassis();
		}

		this.drawTarget_bosanowa();
	},

	drawErrorCells_bosanowa : function(){
		var g = this.vinc('cell_back', 'crispEdges');

		var header = "c_fullerr_";
		g.fillStyle = this.errbcolor1;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.error===1){
				if(this.vnop(header+cell.id,this.FILL)){
					g.fillRect(cell.rpx, cell.rpy, this.cw, this.ch);
				}
			}
			else{ this.vhide([header+cell.id]);}
		}
	},

	drawCircles_bosanowa : function(){
		var g = this.vinc('cell_circle', 'auto');

		g.lineWidth = 1;
		g.fillStyle = "white";
		var rsize  = this.cw*0.44;
		var header = "c_cir_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.isValid() && !cell.isNum()){
				g.strokeStyle = (cell.error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+cell.id,this.STROKE)){
					g.strokeCircle(cell.px, cell.py, rsize);
				}
			}
			else{ this.vhide([header+cell.id]);}
		}
	},

	drawGrid_souko : function(){
		var g = this.vinc('grid_souko', 'crispEdges');

		var header = "b_grids_";
		g.lineWidth = 1;
		g.fillStyle="rgb(127,127,127)";
		g.strokeStyle="rgb(127,127,127)";

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			if(border.isGrid()){
				if(!g.use.canvas){
					if(this.vnop(header+border.id,this.NONE)){
						if(border.isVert()){
							var px = border.px, py1 = border.py-this.bh, py2 = py1+this.ch+1;
							g.strokeLine(px, py1, px, py2);
							g.setDashSize(3);
						}
						else{
							var py = border.py, px1 = border.px-this.bw, px2 = px1+this.cw+1;
							g.strokeLine(px1, py, px2, py);
							g.setDashSize(3);
						}
					}
				}
				else{
					var dotmax = this.cw/10+3;
					var dotCount = Math.max(this.cw/dotmax, 1);
					var dotSize  = this.cw/(dotCount*2);
					if(border.isVert()){ 
						for(var j=0;j<this.ch+1;j+=(2*dotSize)){
							g.fillRect(border.px, border.py-this.bh+j, 1, dotSize);
						}
					}
					else{ 
						for(var j=0;j<this.cw+1 ;j+=(2*dotSize)){
							g.fillRect(border.px-this.bw+j, border.py, dotSize, 1);
						}
					}
				}
			}
			else{ if(!g.use.canvas){ this.vhide([header+border.id]);}}
		}
	},
	drawGrid_waritai : function(){
		var g = this.vinc('grid_waritai', 'crispEdges');

		var csize = this.cw*0.20;
		var headers = ["b_grid_", "b_grid2_"];
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], id = border.id;
			if(border.isGrid()){
				g.fillStyle=this.gridcolor;
				if(this.vnop(headers[0]+id,this.NONE)){
					if(border.isVert()){ g.fillRect(border.px, border.py-this.bh, 1, this.ch+1);}
					else               { g.fillRect(border.px-this.bw, border.py, this.cw+1, 1);}
				}

				g.fillStyle = ((border.error===0) ? "white" : this.errbcolor1);
				if(this.vnop(headers[1]+id,this.FILL)){
					if(border.isVert()){ g.fillRect(border.px, border.py-csize, 1, 2*csize+1);}
					else               { g.fillRect(border.px-csize, border.py, 2*csize+1, 1);}
				}
			}
			else{ this.vhide([headers[0]+id, headers[1]+id]);}
		}
	},

	drawBDnumbase : function(){
		var g = this.vinc('border_number_base', 'crispEdges');

		var csize = this.cw*0.20;
		var header = "b_bbse_";
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];

			if(border.qsub>=0 && border.isGrid()){
				g.fillStyle = "white";
				if(this.vnop(header+border.id,this.NONE)){
					g.fillRect(border.px-csize, border.py-csize, 2*csize+1, 2*csize+1);
				}
			}
			else{ this.vhide(header+border.id);}
		}
	},
	drawNumbersBD : function(){
		var g = this.vinc('border_number', 'auto');

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border=blist[i], key='border_'+border.id;
			if(border.qsub>=0){
				var px = border.px, py = border.py;
				this.dispnum(key, 1, ""+border.qsub, 0.35 ,this.borderfontcolor, border.px, border.py);
			}
			else{ this.hideEL(key);}
		}
	},

	// 倉庫番の外側(グレー)描画用
	drawOutside_souko : function(){
		var g = this.vinc('cell_outside_souko', 'crispEdges');

		var header = "c_full_", d = this.range;
		for(var bx=(d.x1-2)|1;bx<=d.x2+2;bx+=2){
			for(var by=(d.y1-2)|1;by<=d.y2+2;by+=2){
				var cell=bd.getc(bx,by), addr=cell.getaddr();
				if( cell.isEmpty() && (
					addr.rel(-2, 0).getc().ques===0 || addr.rel(2, 0).getc().ques===0 || 
					addr.rel( 0,-2).getc().ques===0 || addr.rel(0, 2).getc().ques===0 || 
					addr.rel(-2,-2).getc().ques===0 || addr.rel(2,-2).getc().ques===0 || 
					addr.rel(-2, 2).getc().ques===0 || addr.rel(2, 2).getc().ques===0 ) )
				{
					g.fillStyle = "rgb(127,127,127)";
					if(this.vnop([header,bx,by].join('_'),this.NONE)){
						g.fillRect((bx-1)*this.bw, (by-1)*this.bh, this.cw+1, this.ch+1);
					}
				}
				else{ this.vhide([header,bx,by].join('_'));}
			}
		}
	},

	drawTarget_bosanowa : function(){
		var islarge = tc.pos.oncell();
		this.drawCursor(islarge);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBoard();
		this.decodeNumber16();

		if     (this.checkpflag("h")){ pp.setValOnly('disptype',2);}
		else if(this.checkpflag("t")){ pp.setValOnly('disptype',3);}
	},
	pzlexport : function(type){
		this.encodeBosanowa();

		if     (pp.getVal('disptype')==2){ this.outpflag="h";}
		else if(pp.getVal('disptype')==3){ this.outpflag="t";}
	},

	decodeBoard : function(){
		var bstr = this.outbstr, c=0, twi=[16,8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(c<bd.cellmax){
					bd.cell[c].ques = (num&twi[w]?7:0);
					c++;
				}
			}
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},

	// エンコード時は、盤面サイズの縮小という特殊処理を行ってます
	encodeBosanowa : function(type){
		var x1=9999, x2=-1, y1=9999, y2=-1;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.isEmpty()){ continue;}
			if(x1>cell.bx){ x1=cell.bx;}
			if(x2<cell.bx){ x2=cell.bx;}
			if(y1>cell.by){ y1=cell.by;}
			if(y2<cell.by){ y2=cell.by;}
		}

		var cm="", count=0, pass=0, twi=[16,8,4,2,1];
		for(var by=y1;by<=y2;by+=2){
			for(var bx=x1;bx<=x2;bx+=2){
				var cell=bd.getc(bx,by);
				if(cell.isEmpty()){ pass+=twi[count];} count++;
				if(count===5){ cm += pass.toString(32); count=0; pass=0;}
			}
		}
		if(count>0){ cm += pass.toString(32);}
		this.outbstr += cm;

		cm="", count=0;
		for(var by=y1;by<=y2;by+=2){
			for(var bx=x1;bx<=x2;bx+=2){
				var pstr="", qn=bd.getc(bx,by).qnum;

				if     (qn===-2       ){ pstr = ".";}
				else if(qn>= 0&&qn< 16){ pstr =       qn.toString(16);}
				else if(qn>=16&&qn<256){ pstr = "-" + qn.toString(16);}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
			}
		}
		if(count>0){ cm+=(15+count).toString(36);}
		this.outbstr += cm;

		this.outsize = [(x2-x1+2)/2, (y2-y1+2)/2].join("/");
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."){ obj.ques = 0;}
			if(ca!=="0"&&ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeCell( function(obj,ca){
			if(ca!=="0"&&ca!=="."){ obj.anum = parseInt(ca);}
		});
		this.decodeBorder( function(obj,ca){
			if(ca!=="."){ obj.qsub = parseInt(ca);}
		});
	},
	encodeData : function(){
		this.encodeCell(function(obj){
			if(obj.ques===7){ return ". ";}
			return (obj.qnum>=0 ? ""+obj.qnum.toString()+" " : "0 ");
		});
		this.encodeCell( function(obj){
			if(obj.ques===7 || obj.qnum!==-1){ return ". ";}
			return (obj.anum>=0 ? ""+obj.anum.toString()+" " : "0 ");
		});
		this.encodeBorder( function(obj){
			return (obj.qsub!==-1 ? ""+obj.qsub.toString()+" " : ". ");
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSubsNumber() ){
			this.setAlert('数字とその隣の数字の差の合計が合っていません。', 'Sum of the differences between the number and adjacent numbers is not equal to the number.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.isValid() && cell.noNum());}) ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(cell){ return (cell.isValid() && cell.noNum());});},

	checkSubsNumber : function(){
		var subs=[], UNDEF=-1;
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(border.isGrid()){
				if(cell1.isValidNum() && cell2.isValidNum()){
					subs[id]=Math.abs(cell1.getNum()-cell2.getNum());
				}
				else{ subs[id]=UNDEF;}
			}
			else{ subs[id]=null;}
		}

		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.isEmpty() || cell.noNum()){ continue;}

			var num=cell.getNum(), sum=0, sub;
			sub=subs[cell.ub().id]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			sub=subs[cell.db().id]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			sub=subs[cell.lb().id]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			sub=subs[cell.rb().id]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			if(num!==sum){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
};
