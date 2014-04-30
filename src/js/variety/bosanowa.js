//
// パズル固有スクリプト部 ボサノワ版 bosanowa.js v3.4.1
//
pzpr.classmgr.makeCustom(['bosanowa'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.mousestart){ this.inputqnum_bosanowa();}
	},

	inputqnum_bosanowa : function(){
		var pos = this.getpos(0.31);
		if(!pos.isinside()){ return;}

		if(!this.cursor.equals(pos)){
			this.setcursor(pos);
		}
		else if(pos.oncell()){
			this.inputcell_bosanowa(pos);
		}
	},
	inputcell_bosanowa : function(pos){
		var cell = pos.getc();
		if(cell.isnull){ return;}

		var max = cell.nummaxfunc(), ques = cell.getQues(), num = cell.getNum();
		if(this.owner.editmode){
			if(this.btn.Left){
				if     (ques===7) { cell.setNum(-1); cell.setQues(0);}
				else if(num===-1) { cell.setNum(1);  cell.setQues(0);}
				else if(num===max){ cell.setNum(-1); cell.setQues(7);}
				else{ cell.setNum(num+1);}
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
		cell.drawaround();
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
		var cursor = this.cursor;
		if(cursor.oncell()){
			var cell = cursor.getc();
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
		else if(cursor.onborder()){
			var border = cursor.getb(), cell1 = border.sidecell[0], cell2 = border.sidecell[1];
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

		cursor.drawaround();
	}
},

TargetCursor:{
	initCursor : function(){
		var bd = this.owner.board;
		this.bx = ((bd.qcols-1)&~1)+1;
		this.by = ((bd.qrows-1)&~1)+1;
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
	hasborder : 2,

	initBoardSize : function(col,row){
		this.common.initBoardSize.call(this,col,row);

		if(pzpr.EDITOR){
			var cell = this.owner.cursor.getc(); /* 真ん中にあるはず */
			if(!cell.isnull){ cell.ques = 0;}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	circleratio : [0.47, 0.42],

	paint : function(){
		this.drawBGCells();

		var disptype = +this.owner.getConfig('disptype_bosanowa');
		if(disptype===1){
			this.drawCircles();
			this.drawBDnumbase();
		}
		else if(disptype===2){
			this.drawOutside_souko();
			this.drawGrid_souko();
			this.drawBDnumbase();
		}
		else if(disptype===3){
			this.drawBorders();
			this.drawGrid_waritai();
		}

		this.drawNumbers();
		this.drawNumbersBD();

		if(pzpr.EDITOR && !this.outputImage){
			this.drawChassis();
		}

		this.drawTarget_bosanowa();
	},

	getCanvasCols : function(){
		var disptype = this.owner.getConfig('disptype_bosanowa');
		return this.getBoardCols()+2*this.margin+(disptype==2?2:0);
	},
	getCanvasRows : function(){
		var disptype = this.owner.getConfig('disptype_bosanowa');
		return this.getBoardRows()+2*this.margin+(disptype==2?2:0);
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
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					g.fillRectCenter(px, py, this.bw, this.bh);
				}
			}
			else{ g.vhide(header+cell.id);}
		}
	},

	getCircleStrokeColor : function(cell){
		if(cell.isValid() && !cell.isNum()){
			return (cell.error===1 ? this.errcolor1 : this.cellcolor);
		}
		return null;
	},
	getCircleFillColor : function(cell){
		return null;
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
				var px = border.bx*this.bw, py = border.by*this.bh;
				if(this.vnop(header+border.id,this.NONE)){
					if(border.isVert()){
						var py1 = py-this.bh, py2 = py+this.bh+1;
						g.strokeDashedLine(px, py1, px, py2, [3]);
					}
					else{
						var px1 = px-this.bw, px2 = px+this.bw+1;
						g.strokeDashedLine(px1, py, px2, py, [3]);
					}
				}
			}
			else{ if(!g.use.canvas){ g.vhide(header+border.id);}}
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
				var px = border.bx*this.bw, py = border.by*this.bh;
				g.fillStyle=this.gridcolor;
				if(this.vnop(headers[0]+id,this.NONE)){
					if(border.isVert()){ g.fillRectCenter(px, py, 0.5, this.bh);}
					else               { g.fillRectCenter(px, py, this.bw, 0.5);}
				}

				g.fillStyle = ((border.error===0) ? "white" : this.errbcolor1);
				if(this.vnop(headers[1]+id,this.FILL)){
					if(border.isVert()){ g.fillRectCenter(px, py, 0.5, csize);}
					else               { g.fillRectCenter(px, py, csize, 0.5);}
				}
			}
			else{ g.vhide([headers[0]+id, headers[1]+id]);}
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
					var px = border.bx*this.bw, py = border.by*this.bh;
					g.fillRectCenter(px, py, csize, csize);
				}
			}
			else{ g.vhide(header+border.id);}
		}
	},
	drawNumbersBD : function(){
		var g = this.vinc('border_number', 'auto');

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border=blist[i], px = border.bx*this.bw, py = border.by*this.bh;
			var text = (border.qsub>=0 ? ""+border.qsub : "");
			var option = { key:"border_text_"+border.id };
			option.ratio = [0.35];
			option.color = "blue";
			this.disptext(text, px, py, option);
		}
	},

	// 倉庫番の外側(グレー)描画用
	drawOutside_souko : function(){
		var g = this.vinc('cell_outside_souko', 'crispEdges');

		var header = "c_full_", d = this.range;
		for(var bx=(d.x1-2)|1;bx<=d.x2+2;bx+=2){
			for(var by=(d.y1-2)|1;by<=d.y2+2;by+=2){
				var cell=this.owner.board.getc(bx,by);
				var addr=new this.owner.Address(bx, by);
				if( cell.isEmpty() && (
					addr.rel(-2, 0).getc().ques===0 || addr.rel(2, 0).getc().ques===0 || 
					addr.rel( 0,-2).getc().ques===0 || addr.rel(0, 2).getc().ques===0 || 
					addr.rel(-2,-2).getc().ques===0 || addr.rel(2,-2).getc().ques===0 || 
					addr.rel(-2, 2).getc().ques===0 || addr.rel(2, 2).getc().ques===0 ) )
				{
					g.fillStyle = "rgb(127,127,127)";
					if(this.vnop([header,bx,by].join('_'),this.NONE)){
						g.fillRectCenter(bx*this.bw, by*this.bh, this.bw+0.5, this.bh+0.5);
					}
				}
				else{ g.vhide([header,bx,by].join('_'));}
			}
		}
	},

	drawTarget_bosanowa : function(){
		var islarge = this.owner.cursor.oncell();
		this.drawCursor(islarge);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBoard();
		this.decodeNumber16();

		var puzzle = this.owner;
		if     (this.checkpflag("h")){ puzzle.setConfig('disptype_bosanowa',2);}
		else if(this.checkpflag("t")){ puzzle.setConfig('disptype_bosanowa',3);}
	},
	encodePzpr : function(type){
		this.encodeBosanowa();

		var puzzle = this.owner;
		if     (puzzle.getConfig('disptype_bosanowa')==2){ this.outpflag="h";}
		else if(puzzle.getConfig('disptype_bosanowa')==3){ this.outpflag="t";}
	},

	decodeBoard : function(){
		var bstr = this.outbstr, c=0, bd = this.owner.board, twi=[16,8,4,2,1];
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
		var x1=9999, x2=-1, y1=9999, y2=-1, bd=this.owner.board;
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

		this.outcols = (x2-x1+2)/2;
		this.outrows = (y2-y1+2)/2;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			obj.ques = (ca==="."?7:0);
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

		if( !this.checkSubsNumber() ){ return 'nmSumOfDiff';}
		if( !this.checkValidFillCell() ){ return 'ceEmpty';}

		return null;
	},
	check1st : function(){
		return (this.checkValidFillCell() ? null : 'ceEmpty');
	},

	checkValidFillCell : function(){
		return this.checkAllCell(function(cell){ return (cell.isValid() && cell.noNum());});
	},

	checkSubsNumber : function(){
		var subs=[], bd=this.owner.board, UNDEF=-1;
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

			var adb=cell.adjborder, num=cell.getNum(), sum=0, sub;
			sub=subs[adb.top.id   ]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			sub=subs[adb.bottom.id]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			sub=subs[adb.left.id  ]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			sub=subs[adb.right.id ]; if(sub>0){ sum+=sub;}else if(sub===UNDEF){ continue;}
			if(num!==sum){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	nmSumOfDiff : ["数字とその隣の数字の差の合計が合っていません。", "Sum of the differences between the number and adjacent numbers is not equal to the number."],
	ceEmpty : ["数字の入っていないマスがあります。","There is an empty cell."]
}
});
