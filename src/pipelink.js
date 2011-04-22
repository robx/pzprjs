//
// パズル固有スクリプト部 パイプリンク・帰ってきたパイプリンク版 pipelink.js v3.4.0
//
pzprv3.custom.pipelink = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
		if(k.editmode){ this.inputQues([0,11,12,13,14,15,16,17,-2]);}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},
	mouseup : function(){
		if(k.playmode && this.btn.Left && this.notInputted()){
			this.inputpeke();
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputLineParts(ca);
	},
	key_inputLineParts : function(ca){
		if(k.playmode){ return false;}
		var cc = tc.getTCC();

		if     (ca=='q'){ bd.sQuC(cc,11); }
		else if(ca=='w'){ bd.sQuC(cc,12); }
		else if(ca=='e'){ bd.sQuC(cc,13); }
		else if(ca=='r'){ bd.sQuC(cc, 0); }
		else if(ca==' '){ bd.sQuC(cc, 0); }
		else if(ca=='a'){ bd.sQuC(cc,14); }
		else if(ca=='s'){ bd.sQuC(cc,15); }
		else if(ca=='d'){ bd.sQuC(cc,16); }
		else if(ca=='f'){ bd.sQuC(cc,17); }
		else if(ca=='-'){ bd.sQuC(cc,(bd.QuC(cc)!==-2?-2:0)); }
		else if(bd.puzzleid==='pipelinkr' && ca=='1'){ bd.sQuC(cc, 6); }
		else{ return false;}

		pc.paintCellAround(cc);
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
		if(bd.puzzleid==='pipelink'){
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
Board:{
	isborder : 1,

	enableLineNG : true,
	enableLineCombined : true
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){
			var tques={};
			switch(key){
				case this.FLIPY: tques={14:17,15:16,16:15,17:14}; break;
				case this.FLIPX: tques={14:15,15:14,16:17,17:16}; break;
				case this.TURNR: tques={12:13,13:12,14:17,15:14,16:15,17:16}; break;
				case this.TURNL: tques={12:13,13:12,14:15,15:16,16:17,17:14}; break;
			}
			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val=tques[bd.QnC(c)]; if(!!val){ bd.sQnC(c,val);}
			}
		}
	}
},

Menu:{
	menufix : function(){
		this.addRedLineToFlags();

		if(bd.puzzleid==='pipelinkr'){
			pp.addSelect('disptype','setting',1,[1,2],'表示形式','Display');

			pp.addChild('disptype_1', 'disptype', '○', 'Circle');
			pp.addChild('disptype_2', 'disptype', '■', 'Icebarn');
			pp.funcs['disptype'] = function(num){
				if     (num==1){ ee('btncircle').el.value="○";}
				else if(num==2){ ee('btncircle').el.value="■";}
				pc.paintAll();
			};
			this.ex.toggledisp = function(){ pp.setVal('disptype', (pp.getVal('disptype')==1?2:1));};
			
			var el = ee.createEL(this.EL_BUTTON, 'btncircle');
			this.addButtons(el, ee.binder(this.ex, this.ex.toggledisp), "○", "○");
			ee('btnarea').appendEL(el);
		}
	},

	menuinit : function(){
		this.SuperFunc.menuinit.call(this);
		if(k.puzzeid==='pipelinkr'){ pp.funcs['disptype']();}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;

		this.minYdeg = 0.42;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		if(bd.puzzleid==='pipelinkr'){
			this.drawCircles_pipelink((pp.getVal('disptype')==1));
			this.drawBorders();
		}

		this.drawHatenas();

		this.drawLines();

		this.drawPekes(0);

		this.drawLineParts();

		this.drawChassis();

		this.drawTarget();
	},

	setBGCellColor : function(c){
		if     (bd.cell[c].error===1)                           { g.fillStyle = this.errbcolor1; return true;}
		else if(bd.cell[c].ques===6 && pp.getVal('disptype')==2){ g.fillStyle = this.icecolor;   return true;}
		return false;
	},
	setBorderColor : function(id){
		if(pp.getVal('disptype')==2){
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cc1!==null && cc2!==null && (bd.cell[cc1].ques===6^bd.cell[cc2].ques===6)){
				g.fillStyle = this.cellcolor;
				return true;
			}
		}
		return false;
	},

	drawCircles_pipelink : function(isdraw){
		this.vinc('cell_circle', 'auto');

		var header = "c_cir_";
		var clist = this.range.cells;
		if(isdraw){
			var rsize  = this.cw*0.40;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===6){
					g.strokeStyle = this.cellcolor;
					if(this.vnop(header+c,this.NONE)){
						g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
					}
				}
				else{ this.vhide(header+c);}
			}
		}
		else{
			var header = "c_cir_";
			for(var i=0;i<clist.length;i++){ this.vhide(header+clist[i]);}
		}
	},

	repaintParts : function(idlist){
		var clist = bd.lines.getClistFromIdlist(idlist);
		for(var i=0;i<clist.length;i++){
			this.drawLineParts1(clist[i]);
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodePipelink();

		this.checkPuzzleid();
		if(bd.puzzleid==='pipelinkr'){ pp.setVal('disptype', (!this.checkpflag('i')?1:2));}
	},
	pzlexport : function(type){
		this.outpflag = ((bd.puzzleid==='pipelinkr' && pp.getVal('disptype')==2)?"i":"");
		this.encodePipelink(type);
	},

	decodePipelink : function(){
		var c=0, bstr = this.outbstr;
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
		var count, pass, cm="";

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
		if(bd.puzzleid==='pipelink'){
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ bd.puzzleid='pipelinkr'; break;}
			}
			menu.displayDesign();
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

		enc.checkPuzzleid();
		if(bd.puzzleid==='pipelinkr'){ pp.setVal('disptype', (disptype=="circle"?1:2));}
	},
	encodeData : function(){
		if     (bd.puzzleid==='pipelink') { this.datastr += 'pipe/';}
		else if(bd.puzzleid==='pipelinkr'){ this.datastr += (pp.getVal('disptype')==1?"circle/":"ice/");}
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

		if( (bd.puzzleid==='pipelinkr') && !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===4 && bd.QuC(c)!==6 && bd.QuC(c)!==11);}) ){
			this.setAlert((pp.getVal('disptype')==2?'氷':'○')+'の部分以外で線が交差しています。','There is a crossing line out of '+(pp.getVal('disptype')==1?'circles':'ices')+'.'); return false;
		}
		if( (bd.puzzleid==='pipelinkr') && !this.checkIceLines() ){
			this.setAlert((pp.getVal('disptype')==2?'氷':'○')+'の部分で線が曲がっています。','A line curves on '+(pp.getVal('disptype')==1?'circles':'ices')+'.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QuC(c)===11 && bd.lines.lcntCell(c)!==4);}) ){
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
};
