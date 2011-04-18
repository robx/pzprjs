//
// パズル固有スクリプト部 タテボーヨコボー版 tateyoko.js v3.4.0
//
pzprv3.custom.tateyoko = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.dispzero        = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;

		this.floatbgcolor = "rgb(96, 255, 96)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.inputqnum();}
		else if(k.playmode){ this.inputTateyoko();}
	},
	mouseup : function(){
		if(k.playmode && this.notInputted()){ this.clickTateyoko();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputTateyoko();}
	},

	inputTateyoko : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		var pos = new pzprv3.core.Address(bd.cell[cc].bx, bd.cell[cc].by);
		var input=false;

		// 初回はこの中に入ってきます。
		if(this.mouseCell===null){ this.firstPoint.set(this.inputPoint);}
		// 黒マス上なら何もしない
		else if(bd.QuC(cc)==1){ }
		// まだ入力されていない(1つめの入力の)場合
		else if(this.inputData===null){
			if(cc==this.mouseCell){
				var mx=Math.abs(this.inputPoint.x-this.firstPoint.x);
				var my=Math.abs(this.inputPoint.y-this.firstPoint.y);
				if     (my>=8){ this.inputData=1; input=true;}
				else if(mx>=8){ this.inputData=2; input=true;}
			}
			else{
				var dir = this.getdir(this.prevPos, pos);
				if     (dir===k.UP || dir===k.DN){ this.inputData=1; input=true;}
				else if(dir===k.LT || dir===k.RT){ this.inputData=2; input=true;}
			}

			if(input){
				if(bd.QaC(cc)===this.inputData){ this.inputData=0;}
				this.firstPoint.reset();
				}
		}
		// 入力し続けていて、別のマスに移動した場合
		else if(cc!==this.mouseCell){
			if(this.inputData==0){ this.inputData=0; input=true;}
			else{
				var dir = this.getdir(this.prevPos, pos);
				if     (dir===k.UP || dir===k.DN){ this.inputData=1; input=true;}
				else if(dir===k.LT || dir===k.RT){ this.inputData=2; input=true;}
			}
		}

		// 描画・後処理
		if(input){
			bd.sQaC(cc,(this.inputData!==0?this.inputData:0));
			pc.paintCell(cc);
		}
		this.prevPos   = pos;
		this.mouseCell = cc;
	},
	clickTateyoko : function(){
		var cc  = this.cellid();
		if(cc===null || bd.QuC(cc)===1){ return;}

		bd.sQaC(cc, (this.btn.Left?[1,2,0]:[2,0,1])[bd.QaC(cc)]);
		pc.paintCell(cc);
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
		var cc = tc.getTCC();
		if(ca=='q'||ca=='q1'||ca=='q2'){
			if(ca=='q'){ ca = (bd.QuC(cc)!=1?'q1':'q2');}
			if(ca=='q1'){
				bd.sQuC(cc,1);
				bd.sQaC(cc,0);
				if(bd.QnC(cc)>4){ bd.sQnC(cc,-1);}
			}
			else if(ca=='q2'){ bd.sQuC(cc, 0);}
		}
		else{ return false;}

		this.prev=cc;
		pc.paintCell(cc);
		return true;
	}
},

KeyPopup:{
	enablemake : true,
	generate : function(mode,type){
		this.inputcol('num','knumq1','q1','■');
		this.inputcol('num','knumq2','q2','□');
		this.inputcol('num','knum_','-','?');
		this.inputcol('num','knum.',' ',' ');
		this.insertrow();
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.insertrow();
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.insertrow();
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.inputcol('empty','','','');
		this.inputcol('empty','','','');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	nummaxfunc : function(cc){
		return (this.cell[cc].ques===1?4:Math.max(k.qcols,k.qrows));
	},

	getBarInfo : function(){
		var binfo = new pzprv3.core.AreaInfo();
		for(var c=0;c<this.cellmax;c++){ binfo.id[c]=((this.QuC(c)===1||this.QaC(c)===0) ? null : 0);}
		for(var c=0;c<this.cellmax;c++){
			if(binfo.id[c]!==0){ continue;}
			binfo.max++;
			binfo.room[binfo.max] = {idlist:[]};

			var bx=this.cell[c].bx, by=this.cell[c].by, val=this.cell[c].qans, cc=c;
			while(cc!==null && this.cell[cc].qans===val){
				binfo.room[binfo.max].idlist.push(cc);
				binfo.id[cc]=binfo.max;
				if(val===1){ by+=2;}else{ bx+=2;}
				cc = this.cnum(bx,by);
			}
		}
		return binfo;
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,[0,2,1][bd.QaC(c)]);}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.errbcolor1 = this.errbcolor1_DARK;
		this.errbcolor2 = "white";
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawTateyokos()

		this.drawBcellsAtNumber();
		this.drawNumbers_tateyoko();

		this.drawChassis();

		this.drawTarget();
	},

	drawTateyokos : function(){
		this.vinc('cell_tateyoko', 'crispEdges');

		var headers = ["c_bar1_", "c_bar2_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			var lw = Math.max(this.cw/6, 3);	//LineWidth
			var lp = (this.bw-lw/2);			//LinePadding

			var err = bd.cell[c].error;
			if     (err===1||err===4){ g.fillStyle = this.errlinecolor1; lw++;}
			else if(err===2){ g.fillStyle = this.errlinecolor2;}
			else{ g.fillStyle = this.linecolor;}

			if(bd.cell[c].qans!==-1){
				if(bd.cell[c].qans===1){
					if(this.vnop(headers[0]+c,this.FILL)){
						g.fillRect(bd.cell[c].px+lp, bd.cell[c].py, lw, this.ch+1);
					}
				}
				else{ this.vhide(headers[0]+c);}

				if(bd.cell[c].qans===2){
					if(this.vnop(headers[1]+c,this.FILL)){
						g.fillRect(bd.cell[c].px, bd.cell[c].py+lp, this.cw+1, lw);
					}
				}
				else{ this.vhide(headers[1]+c);}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c]);}
		}
	},

	drawBcellsAtNumber : function(){
		this.vinc('cell_number', 'crispEdges');

		var header = "c_full_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c=clist[i], obj=bd.cell[c];
			if(bd.cell[c].ques===1){
				g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(obj.px, obj.py, this.cw+1, this.ch+1);
				}
			}
			else{ this.vhide(header+c);}
		}
	},
	drawNumbers_tateyoko : function(){
		this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj = bd.cell[c], key='cell_'+c;
			var num = bd.cell[c].qnum;
			if(num!==-1){
				var color = (bd.cell[c].ques!==1 ? this.fontcolor : "white");
				this.dispnum(key, 1, (num!=-2?""+num:"?"), (num<10?0.8:0.75), color, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeTateyoko();
	},
	pzlexport : function(type){
		this.encodeTateyoko();
	},

	decodeTateyoko : function(){
		var c=0, i=0, bstr = this.outbstr;
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
		var cm="", count=0;
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
			if(ca!=="."){ obj.qans = parseInt(ca);}
		});
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if(obj.ques===1){
				if(obj.qnum==-1||obj.qnum==-2){ return "f ";}
				else{ return {0:"e ",1:"a ",2:"b ",3:"c ",4:"d "}[obj.qnum];}
			}
			else if(obj.qnum===-2){ return "? ";}
			else if(obj.qnum>=  0){ return ""+obj.qnum+" ";}
			else{ return ". ";}
		});
		this.encodeCell( function(obj){
			return (obj.ques!==1 ? ""+obj.qans+" " : ". ");
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkBCell(1) ){
			this.setAlert('黒マスに繋がる線の数が正しくありません。','The number of lines connected to a black cell is wrong.'); return false;
		}

		for(var i=0;i<bd.cellmax;i++){ bd.sErC([i],2);}
		var binfo = bd.getBarInfo();
		if( !this.checkDoubleNumber(binfo) ){
			this.setAlert('1つの棒に2つ以上の数字が入っています。','A line passes plural numbers.'); return false;
		}

		if( !this.checkNumberAndSize(binfo) ){
			this.setAlert('数字と棒の長さが違います。','The number is different from the length of line.'); return false;
		}
		for(var i=0;i<bd.cellmax;i++){ bd.sErC([i],0);}

		if( !this.checkBCell(2) ){
			this.setAlert('黒マスに繋がる線の数が正しくありません。','The number of lines connected to a black cell is wrong.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QuC(c)===0 && bd.QaC(c)===0);}) ){
			this.setAlert('何も入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(c){ return (bd.QuC(c)===0 && bd.QaC(c)===0);});},

	checkBCell : function(type){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QuC(c)!==1 || bd.QnC(c)<0){ continue;}

			var cnt1=0, cnt2=0, cc;
			cc=bd.up(c); if(cc!==null){ if(bd.QaC(cc)===1){ cnt1++;}else if(bd.QaC(cc)===2){ cnt2++;} }
			cc=bd.dn(c); if(cc!==null){ if(bd.QaC(cc)===1){ cnt1++;}else if(bd.QaC(cc)===2){ cnt2++;} }
			cc=bd.lt(c); if(cc!==null){ if(bd.QaC(cc)===2){ cnt1++;}else if(bd.QaC(cc)===1){ cnt2++;} }
			cc=bd.rt(c); if(cc!==null){ if(bd.QaC(cc)===2){ cnt1++;}else if(bd.QaC(cc)===1){ cnt2++;} }

			if((type===1 && (bd.QnC(c)>4-cnt2 || bd.QnC(c)<cnt1)) || (type===2 && bd.QnC(c)!==cnt1)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	}
}
};
