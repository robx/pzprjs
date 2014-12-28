//
// パズル固有スクリプト部 タテボーヨコボー版 tateyoko.js v3.4.1
//
pzpr.classmgr.makeCustom(['tateyoko'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if     (this.mousestart || this.mousemove)  { this.inputTateyoko();}
			else if(this.mouseend && this.notInputted()){ this.clickTateyoko();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	clickTateyoko : function(){
		var cell  = this.getcell();
		if(cell.isnull || cell.ques===1){ return;}

		cell.setQans((this.btn.Left?{0:12,12:13,13:0}:{0:13,12:0,13:12})[cell.qans]);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		if(this.key_inputqnum_tateyoko(ca)){ return;}
		this.key_inputqnum(ca);
	},
	key_inputqnum_tateyoko : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q'||ca==='q1'||ca==='q2'){
			if(ca==='q'){ ca = (cell.ques!==1?'q1':'q2');}
			if(ca==='q1'){
				cell.setQues(1);
				cell.setQans(0);
				if(cell.qnum>4){ cell.setQnum(-1);}
			}
			else if(ca==='q2'){ cell.setQues(0);}
		}
		else{ return false;}

		this.prev=cell;
		cell.draw();
		return true;
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		var bd = this.owner.board;
		return (this.ques===1?4:Math.max(bd.qcols,bd.qrows));
	},
	minnum : 0
},
Board:{
	getBarInfo : function(){
		var barinfo = new this.owner.AreaBarManager();
		return barinfo.getBarInfo();
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			var tans = {0:0,12:13,13:12};
			var clist = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans(tans[cell.qans]);
			}
		}
	}
},

AreaBarManager:{
	getBarInfo : function(){
		var bd = this.owner.board;
		var binfo = new this.owner.AreaInfo();
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			binfo.id[c]=((cell.ques===1||cell.qans===0) ? null : 0);
		}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(binfo.id[cell.id]!==0){ continue;}
			var pos=cell.getaddr(), val=cell.qans, list=[];
			while(!cell.isnull && cell.qans===val){
				list.push(cell);
				if(val===12){ pos.move(0,2);}else{ pos.move(2,0);}
				cell = pos.getc();
			}
			binfo.addAreaByClist(list);
		}
		return binfo;
	}
},

Flags:{
	disable_subclear : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",
	linecolor_type : "LIGHT",
	errbcolor1_type : "DARK",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawTateyokos();

		this.drawShadeAtNumber();
		this.drawNumbers_tateyoko();

		this.drawChassis();

		this.drawTarget();
	},

	drawShadeAtNumber : function(){
		var g = this.vinc('cell_bcells', 'crispEdges', true);

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell=clist[i];
			g.vid = "c_full_"+cell.id;
			if(cell.ques===1){
				g.fillStyle = (cell.error===1 ? this.errcolor1 : this.quescolor);
				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, this.bw+0.5, this.bh+0.5);
			}
			else{ g.vhide();}
		}
	},
	drawNumbers_tateyoko : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], num = cell.qnum;
			g.vid = "cell_text_"+cell.id;
			if(num!==-1){
				g.fillStyle = (cell.ques!==1 ? this.fontcolor : "white");
				this.disptext((num>=0 ? ""+num : "?"), cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeTateyoko();
	},
	encodePzpr : function(type){
		this.encodeTateyoko();
	},

	decodeTateyoko : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if     (ca==='x'){ obj.ques = 1;}
			else if(this.include(ca,"o","s")){ obj.ques = 1; obj.qnum = (parseInt(ca,29)-24);}
			else if(this.include(ca,"0","9")||this.include(ca,"a","f")){ obj.qnum = parseInt(ca,16);}
			else if(ca==="-"){ obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca==="i"){ c+=(parseInt(bstr.charAt(i+1),16)-1); i++;}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeTateyoko : function(type){
		var cm="", count=0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", qu=bd.cell[c].ques, qn=bd.cell[c].qnum;
			if(qu===0){
				if     (qn===-1){ count++;}
				else if(qn===-2){ pstr=".";}
				else if(qn<  16){ pstr="" +qn.toString(16);}
				else if(qn< 256){ pstr="-"+qn.toString(16);}
				else{ pstr=""; count++;}
			}
			else if(qu===1){
				pstr=(qn>=0 ? (qn+24).toString(29) : "x");
			}

			if(count===0){ cm+=pstr;}
			else if(pstr || count===15){
				if(count===1){ cm+=("n"+pstr);}
				else{ cm+=("i"+count.toString(16)+pstr);}
				count=0;
			}
		}
		if(count===1){ cm+="n";}
		else if(count>1){ cm+=("i"+count.toString(16));}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca>="a"&&ca<='f'){ obj.ques = 1; obj.qnum = {a:1,b:2,c:3,d:4,e:0,f:-1}[ca];}
			else if(ca==="?"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeCell( function(obj,ca){
			if     (ca==="1"){ obj.qans = 12;}
			else if(ca==="2"){ obj.qans = 13;}
		});
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if(obj.ques===1){
				if(obj.qnum===-1||obj.qnum===-2){ return "f ";}
				else{ return {0:"e ",1:"a ",2:"b ",3:"c ",4:"d "}[obj.qnum];}
			}
			else if(obj.qnum===-2){ return "? ";}
			else if(obj.qnum>=  0){ return ""+obj.qnum+" ";}
			else{ return ". ";}
		});
		this.encodeCell( function(obj){
			if(obj.ques!==1){
				if     (obj.qans===0) { return "0 ";}
				else if(obj.qans===12){ return "1 ";}
				else if(obj.qans===13){ return "2 ";}
			}
			return ". ";
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkBarOverNum() ){ return 'nmConnBarGt';}

		if( !this.checkDoubleNumberInBar() ){ return 'baPlNum';}
		if( !this.checkSizeAndNumberInBar() ){ return 'bkSizeNe';}

		if( !this.checkBarLessNum() ){ return 'nmConnBarLt';}

		if( !this.checkEmptyCell() ){ return 'ceEmpty';}

		return null;
	},
	check1st : function(){
		return (this.checkEmptyCell() ? null : 'ceEmpty');
	},

	getBarInfo : function(){
		return (this._info.bar = this._info.bar || this.owner.board.getBarInfo());
	},

	checkDoubleNumberInBar : function(){
		var bd = this.owner.board;
		bd.cell.seterr(-1);
		var result = this.checkAllBlock(this.getBarInfo(), function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a<2);} );
		if(!result){ bd.cell.seterr(0);}
		return result;
	},
	checkSizeAndNumberInBar : function(){
		var bd = this.owner.board;
		bd.cell.seterr(-1);
		var result = this.checkAllArea(this.getBarInfo(), function(w,h,a,n){ return (n<=0 || n===a);} );
		if(!result){ bd.cell.seterr(0);}
		return result;
	},

	checkBarOverNum : function(){ return this.checkShade(1);},
	checkBarLessNum : function(){ return this.checkShade(2);},
	checkShade : function(type){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], num = cell.qnum;
			if(cell.ques!==1 || num<0){ continue;}

			var cnt1=0, cnt2=0, cell2, adc=cell.adjacent;
			cell2=adc.top;    if(!cell2.isnull){ if(cell2.qans===12){ cnt1++;}else if(cell2.qans===13){ cnt2++;} }
			cell2=adc.bottom; if(!cell2.isnull){ if(cell2.qans===12){ cnt1++;}else if(cell2.qans===13){ cnt2++;} }
			cell2=adc.left;   if(!cell2.isnull){ if(cell2.qans===13){ cnt1++;}else if(cell2.qans===12){ cnt2++;} }
			cell2=adc.right;  if(!cell2.isnull){ if(cell2.qans===13){ cnt1++;}else if(cell2.qans===12){ cnt2++;} }

			if((type===1 && (num>4-cnt2 || num<cnt1)) || (type===2 && num!==cnt1)){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},
	
	checkEmptyCell : function(){
		return this.checkAllCell(function(cell){ return (cell.ques===0 && cell.qans===0);});
	}
},

FailCode:{
	bkSizeNe    : ["数字と棒の長さが違います。","The number is different from the length of line."],
	baPlNum     : ["1つの棒に2つ以上の数字が入っています。","A line passes plural numbers."],
	nmConnBarGt : ["黒マスに繋がる線の数が正しくありません。","The number of lines connected to a shaded cell is wrong."],
	nmConnBarLt : ["黒マスに繋がる線の数が正しくありません。","The number of lines connected to a shaded cell is wrong."]
}
});
