//
// パズル固有スクリプト部 環状線スペシャル版 loopsp.js v3.4.0
//
pzprv3.custom.loopsp = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine();}
		else if(k.editmode){ this.inputLoopsp();}
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
	},

	inputLoopsp : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}

		if(cc===tc.getTCC()){
			var qu = bd.QuC(cc), qn = bd.QnC(cc);
			if(this.btn.Left){
				if(qn===-1){
					if     (qu==0)         { bd.sQuC(cc,11);}
					else if(qu>=11&&qu<=16){ bd.sQuC(cc,qu+1);}
					else if(qu==17)        { bd.sQuC(cc,0); bd.sQnC(cc,-2);}
				}
				else if(qn==-2){ bd.sQnC(cc,1);}
				else if(qn<bd.maxnum){ bd.sQnC(cc,qn+1);}
				else{ bd.sQuC(cc,0); bd.sQnC(cc,-1);}
			}
			else if(this.btn.Right){
				if(qn===-1){
					if     (qu==0)         { bd.sQuC(cc,0); bd.sQnC(cc,-2);}
					else if(qu==11)        { bd.sQuC(cc,0); bd.sQnC(cc,-1);}
					else if(qu>=12&&qs<=17){ bd.sQuC(cc,qu-1);}
				}
				else if(qn==-2){ bd.sQuC(cc,17); bd.sQnC(cc,-1);}
				else if(qn>1) { bd.sQnC(cc,qn-1);}
				else{ bd.sQuC(cc,0); bd.sQnC(cc,-2);}
			}
		}
		else{
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paintCell(cc0);
		}
		this.mouseCell = cc;

		pc.paintCell(cc);
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
		var cc = tc.getTCC();

		if     (ca=='q'){ bd.sQuC(cc,11); bd.sQnC(cc,-1);}
		else if(ca=='w'){ bd.sQuC(cc,12); bd.sQnC(cc,-1);}
		else if(ca=='e'){ bd.sQuC(cc,13); bd.sQnC(cc,-1);}
		else if(ca=='r'){ bd.sQuC(cc, 0); bd.sQnC(cc,-1);}
		else if(ca==' '){ bd.sQuC(cc, 0); bd.sQnC(cc,-1);}
		else if(ca=='a'){ bd.sQuC(cc,14); bd.sQnC(cc,-1);}
		else if(ca=='s'){ bd.sQuC(cc,15); bd.sQnC(cc,-1);}
		else if(ca=='d'){ bd.sQuC(cc,16); bd.sQnC(cc,-1);}
		else if(ca=='f'){ bd.sQuC(cc,17); bd.sQnC(cc,-1);}
		else if((ca>='0' && ca<='9') || ca=='-'){
			var old = bd.QnC(cc);
			this.key_inputqnum(ca);
			if(old!=bd.QnC(cc)){ bd.sQuC(cc,0);}
		}
		else{ return;}

		pc.paintCell(cc);
	}
},

KeyPopup:{
	enablemake : true,
	generate : function(mode,type){
		this.inputcol('num','knumq','q','╋');
		this.inputcol('num','knumw','w','┃');
		this.inputcol('num','knume','e','━');
		this.inputcol('num','knumr','r',' ');
		this.inputcol('num','knum.','-','○');
		this.insertrow();
		this.inputcol('num','knuma','a','┗');
		this.inputcol('num','knums','s','┛');
		this.inputcol('num','knumd','d','┓');
		this.inputcol('num','knumf','f','┏');
		this.inputcol('empty','','','');
		this.insertrow();
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.insertrow();
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	enableLineNG : true,
	enableLineCombined : true,
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
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.fontsizeratio = 0.85;
		this.circleratio = [0.38, 0.30];

		this.minYdeg = 0.36;
		this.maxYdeg = 0.74;
	},
	paint : function(){
		this.drawBGCells();
		if(g.use.canvas){ this.drawPekes(2);}
		this.drawDashedGrid();

		this.drawLines();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawPekes(1);

		this.drawLineParts();

		this.drawChassis();

		this.drawTarget();
	},

	repaintParts : function(idlist){
		var clist = bd.lines.getClistFromIdlist(idlist);
		for(var i=0;i<clist.length;i++){
			this.drawLineParts1(clist[i]);
			this.drawCircle1AtNumber(clist[i]);
			this.drawNumber1(clist[i]);
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeLoopsp();
	},
	pzlexport : function(type){
		this.encodeLoopsp();
	},

	decodeLoopsp : function(){
		var c=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj = bd.cell[c];

			if     (ca ==='.'){ obj.qnum = -2;}
			else if(ca ==='-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca >= '0' && ca <= '9'){ obj.qnum = parseInt(ca,16);}
			else if(ca >= 'a' && ca <= 'f'){ obj.qnum = parseInt(ca,16);}
			else if(ca >= 'g' && ca <= 'm'){ obj.ques = parseInt(ca,36)-5;}
			else if(ca >= 'n' && ca <= 'z'){ c += (parseInt(ca,36)-23);}

			c++;
			if(c > bd.cellmax){ break;}
		}

		this.outbstr = bstr.substr(i);
	},
	encodeLoopsp : function(){
		var cm="", pstr="", count=0;
		for(var c=0;c<bd.cellmax;c++){
			var qn=bd.cell[c].qnum, qu=bd.cell[c].ques;
			if     (qn===-2)       { pstr = ".";}
			else if(qn>= 0&&qn< 16){ pstr =     qn.toString(16);}
			else if(qn>=16&&qn<256){ pstr = "-"+qn.toString(16);}
			else if(qu>=11&&qu<=17){ pstr = (qu+5).toString(36);}
			else{ pstr = ""; count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===13){ cm+=((22+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(22+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="o"){ obj.ques = 6;}
			else if(ca==="-"){ obj.ques =-2;}
			else if(ca>="a" && ca<="g"){ obj.ques = parseInt(ca,36)+1;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.ques===6) { return "o ";}
			else if(obj.ques>=11 && obj.ques<=17) { return ""+(obj.ques-1).toString(36)+" ";}
			else if(obj.ques===-2){ return "- ";}
			else if(obj.qnum!==-1){ return obj.qnum.toString()+" ";}
			else                  { return ". ";}
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

		if( !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===4 && bd.isNum(c));}) ){
			this.setAlert('○の部分で線が交差しています。','The lines are crossed on the number.'); return false;
		}

		if( !this.checkLoopNumber() ){
			this.setAlert('異なる数字を含んだループがあります。','A loop has plural kinds of number.'); return false;
		}
		if( !this.checkNumberLoop() ){
			this.setAlert('同じ数字が異なるループに含まれています。','A kind of numbers are in differernt loops.'); return false;
		}
		if( !this.checkNumberInLoop() ){
			this.setAlert('○を含んでいないループがあります。','A loop has no numbers.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)!==4 && bd.QuC(c)===11);}) ){
			this.setAlert('┼のマスから線が4本出ていません。','A cross-joint cell doesn\'t have four-way lines.'); return false;
		}

		if( !this.checkLcntCell(0) ){
			this.setAlert('線が引かれていないマスがあります。','There is an empty cell.'); return false;
		}
		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	},

	checkLoopNumber : function(){
		return this.checkAllLoops(function(cells){
			var sub = (new pzprv3.core.IDList(cells)).sublist(function(c){ return bd.isValidNum(c);});
			var number = null;
			for(var i=0;i<sub.data.length;i++){
				if(number===null){ number=bd.QnC(sub.data[i]);}
				else if(number!==bd.QnC(sub.data[i])){
					bd.sErC(sub.data,1);
					return false;
				}
			}
			return true;
		});
	},
	checkNumberLoop : function(){
		return this.checkAllLoops(function(cells){
			var sub = (new pzprv3.core.IDList(cells)).sublist(function(c){ return bd.isValidNum(c);});
			if(sub.isnull()){ return true;}
			var number = bd.QnC(sub.data[0]);
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)===number && !sub.include(c)){
					bd.sErC(sub.data,1);
					return false;
				}
			}
			return true;
		});
	},
	checkNumberInLoop : function(){
		return this.checkAllLoops(function(cells){
			return (!(new pzprv3.core.IDList(cells)).sublist(function(c){ return bd.isNum(c);}).isnull());
		});
	},
	checkAllLoops : function(func){
		var result = true;
		var linfo = bd.lines.getLineInfo();
		for(var r=1;r<=linfo.max;r++){
			if(func(bd.lines.getClistFromIdlist(linfo.room[r].idlist))){ continue;}

			if(this.inAutoCheck){ return false;}
			if(result){ bd.sErBAll(2);}
			bd.sErB(linfo.room[r].idlist,1);
			result = false;
		}
		return result;
	}
}
};
