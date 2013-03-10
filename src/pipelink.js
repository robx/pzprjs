//
// パズル固有スクリプト部 パイプリンク・帰ってきたパイプリンク版 pipelink.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('pipelink', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputQues([0,11,12,13,14,15,16,17,-2]);}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputLineParts(ca);
	},
	key_inputLineParts : function(ca){
		if(this.owner.playmode){ return false;}
		var cell = this.cursor.getTCC();

		if     (ca=='q'){ cell.setQues(11);}
		else if(ca=='w'){ cell.setQues(12);}
		else if(ca=='e'){ cell.setQues(13);}
		else if(ca=='r'){ cell.setQues(0);}
		else if(ca==' '){ cell.setQues(0);}
		else if(ca=='a'){ cell.setQues(14);}
		else if(ca=='s'){ cell.setQues(15);}
		else if(ca=='d'){ cell.setQues(16);}
		else if(ca=='f'){ cell.setQues(17);}
		else if(ca=='-'){ cell.setQues(cell.getQues()!==-2?-2:0);}
		else if(this.owner.pid==='pipelinkr' && ca=='1'){ cell.setQues(6);}
		else{ return false;}

		cell.drawaround();
		return true;
	},

	enablemake_p : true,
	generate : function(mode,type){
		this.inputcol('num','knumq','q','╋');
		this.inputcol('num','knumw','w','┃');
		this.inputcol('num','knume','e','━');
		this.inputcol('num','knumr','r',' ');
		this.insertrow();
		this.inputcol('num','knuma','a','┗');
		this.inputcol('num','knums','s','┛');
		this.inputcol('num','knumd','d','┓');
		this.inputcol('num','knumf','f','┏');
		this.insertrow();
		this.inputcol('num','knum_','-','?');
		this.inputcol('empty','','','');
		this.inputcol('empty','','','');
		if(this.owner.pid==='pipelink'){
			this.inputcol('empty','','','');
		}
		else{
			this.inputcol('num','knum.','1','○');
		}
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	enableLineNG : true,
	enableLineCombined : true
},
Board:{
	isborder : 1,

	adjustBoardData : function(key,d){
		if(key & k.TURNFLIP){
			var tques={};
			switch(key){
				case k.FLIPY: tques={14:17,15:16,16:15,17:14}; break;
				case k.FLIPX: tques={14:15,15:14,16:17,17:16}; break;
				case k.TURNR: tques={12:13,13:12,14:17,15:14,16:15,17:16}; break;
				case k.TURNL: tques={12:13,13:12,14:15,15:16,16:17,17:14}; break;
			}
			var clist = this.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var val=tques[cell.getQues()]; if(!!val){ cell.setQues(val);}
			}
		}
	}
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

Properties:{
	flag_redline : true,
	flag_irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;

		this.minYdeg = 0.42;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		if(this.owner.pid==='pipelinkr'){
			this.drawCircles_pipelink((this.owner.getConfig('disptype')==1));
			this.drawBorders();
		}

		this.drawHatenas();

		this.drawLines();

		this.drawPekes();

		this.drawLineParts();

		this.drawChassis();

		this.drawTarget();
	},

	getBGCellColor : function(cell){
		if     (cell.error===1)                                      { return this.errbcolor1;}
		else if(cell.ques===6 && this.owner.getConfig('disptype')==2){ return this.icecolor;}
		return null;
	},
	getBorderColor : function(border){
		if(this.owner.getConfig('disptype')==2){
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull && !cell2.isnull && (cell1.ice()^cell2.ice())){
				return this.cellcolor;
			}
		}
		return null;
	},

	drawCircles_pipelink : function(isdraw){
		var g = this.vinc('cell_circle', 'auto');

		var header = "c_cir_";
		var clist = this.range.cells;
		if(isdraw){
			var rsize  = this.cw*0.40;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.ques===6){
					g.strokeStyle = this.cellcolor;
					if(this.vnop(header+cell.id,this.NONE)){
						g.strokeCircle((cell.bx*this.bw), (cell.by*this.bh), rsize);
					}
				}
				else{ this.vhide(header+cell.id);}
			}
		}
		else{
			var header = "c_cir_";
			for(var i=0;i<clist.length;i++){ this.vhide(header+clist[i].id);}
		}
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawLineParts();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodePipelink();

		this.checkPuzzleid();
		if(this.owner.pid==='pipelinkr'){ this.owner.setConfigOnly('disptype', (!this.checkpflag('i')?1:2));}
	},
	pzlexport : function(type){
		this.outpflag = ((this.owner.pid==='pipelinkr' && this.owner.getConfig('disptype')==2)?"i":"");
		this.encodePipelink(type);
	},

	decodePipelink : function(){
		var c=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (ca=='.'){ bd.cell[c].ques = -2;}
			else if(ca>='0' && ca<='9'){
				for(var n=0,max=parseInt(ca,10)+1;n<max;n++){
					if(c<bd.cellmax){ bd.cell[c].ques = 6; c++;}
				}
				c--;
			}
			else if(ca>='a' && ca<='g'){ bd.cell[c].ques = parseInt(ca,36)+1;}
			else if(ca>='h' && ca<='z'){ c += (parseInt(ca,36)-17);}

			c++;
			if(c>=bd.cellmax){ break;}
		}

		this.outbstr = bstr.substr(i);
	},
	encodePipelink : function(type){
		var count, pass, cm="", bd = this.owner.board;

		count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", qu=bd.cell[c].ques;

			if     (qu===-2){ pstr = ".";}
			else if(qu=== 6){
				if(type===0){
					for(var n=1;n<10;n++){
						if((c+n)>=bd.cellmax || bd.cell[c+n].ques!==6){ break;}
					}
					pstr=(n-1).toString(10); c=(c+n-1);
				}
				else if(type===1){ pstr="0";}
			}
			else if(qu>=11 && qu<=17){ pstr = (qu-1).toString(36);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===19){ cm+=((16+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(16+count).toString(36);}

		this.outbstr += cm;
	},

	checkPuzzleid : function(){
		var o=this.owner, bd=o.board;
		if(o.pid==='pipelink'){
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ o.pid='pipelinkr'; break;}
			}
			o.menu.displayDesign();
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		var disptype = this.readLine();
		this.decodeCell( function(obj,ca){
			if     (ca==="o"){ obj.ques = 6; }
			else if(ca==="-"){ obj.ques = -2;}
			else if(ca!=="."){ obj.ques = parseInt(ca,36)+1;}
		});
		this.decodeBorderLine();

		this.owner.enc.checkPuzzleid();
		if(this.owner.pid==='pipelinkr'){ this.owner.setConfigOnly('disptype', (disptype=="circle"?1:2));}
	},
	encodeData : function(){
		if     (this.owner.pid==='pipelink') { this.datastr += 'pipe/';}
		else if(this.owner.pid==='pipelinkr'){ this.datastr += (this.owner.getConfig('disptype')==1?"circle/":"ice/");}
		this.encodeCell( function(obj){
			if     (obj.ques==6) { return "o ";}
			else if(obj.ques==-2){ return "- ";}
			else if(obj.ques>=11 && obj.ques<=17){ return ""+(obj.ques-1).toString(36)+" ";}
			else                 { return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkenableLineParts(1) ){
			this.setAlert('最初から引かれている線があるマスに線が足されています。','Lines are added to the cell that the mark lie in by the question.'); return false;
		}

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}

		if( (this.owner.pid==='pipelinkr') && !this.checkAllCell(function(cell){ return (cell.lcnt()===4 && cell.getQues()!==6 && cell.getQues()!==11);}) ){
			this.setAlert((this.owner.getConfig('disptype')==2?'氷':'○')+'の部分以外で線が交差しています。','There is a crossing line out of '+(this.owner.getConfig('disptype')==1?'circles':'ices')+'.'); return false;
		}
		if( (this.owner.pid==='pipelinkr') && !this.checkIceLines() ){
			this.setAlert((this.owner.getConfig('disptype')==2?'氷':'○')+'の部分で線が曲がっています。','A line curves on '+(this.owner.getConfig('disptype')==1?'circles':'ices')+'.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.getQues()===11 && cell.lcnt()!==4);}) ){
			this.setAlert('┼のマスから線が4本出ていません。','A cross-joint cell doesn\'t have four-way lines.'); return false;
		}

		if( !this.checkLcntCell(0) ){
			this.setAlert('線が引かれていないマスがあります。','There is an empty cell.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	}
}
});

})();
