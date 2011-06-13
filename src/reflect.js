//
// パズル固有スクリプト部 リフレクトリンク版 reflect.js v3.4.0
//
pzprv3.custom.reflect = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
		if(k.editmode){ this.inputQues([0,2,3,4,5,11]);}
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
		if(this.key_inputLineParts(ca)){ return;}
		this.key_inputqnum(ca);
	},
	key_inputLineParts : function(ca){
		if(k.playmode){ return false;}
		var cc = tc.getTCC();

		if     (ca=='q'){ bd.sQuC(cc,2); bd.sQnC(cc,-1);}
		else if(ca=='w'){ bd.sQuC(cc,3); bd.sQnC(cc,-1);}
		else if(ca=='e'){ bd.sQuC(cc,4); bd.sQnC(cc,-1);}
		else if(ca=='r'){ bd.sQuC(cc,5); bd.sQnC(cc,-1);}
		else if(ca=='t'){ bd.sQuC(cc,11); bd.sQnC(cc,-1);}
		else if(ca=='y'){ bd.sQuC(cc,0); bd.sQnC(cc,-1);}
		else{ return false;}

		pc.paintCellAround(cc);
		return true;
	},

	enablemake_p : true,
	generate : function(mode,type){
		this.imgCR = [4,1];
		this.inputcol('image','knumq','q',[0,0]);
		this.inputcol('image','knumw','w',[1,0]);
		this.inputcol('image','knume','e',[2,0]);
		this.inputcol('image','knumr','r',[3,0]);
		this.inputcol('num','knumt','t','╋');
		this.inputcol('num','knumy','y',' ');
		this.insertrow();
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.insertrow();
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum.','-','-');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	disInputHatena : true,

	minnum : 3,

	enableLineNG : true,

	getTriLine : function(c){
		var list = [], bx, by, id;

		bx = this.cell[c].bx-1; by = this.cell[c].by;
		while(bx>this.minbx){ id=this.bnum(bx,by); if(this.isLine(id)){ list.push(id); bx-=2;} else{ break;} }
		bx = this.cell[c].bx+1; by = this.cell[c].by;
		while(bx<this.maxbx){ id=this.bnum(bx,by); if(this.isLine(id)){ list.push(id); bx+=2;} else{ break;} }
		bx = this.cell[c].bx; by = this.cell[c].by-1;
		while(by>this.minby){ id=this.bnum(bx,by); if(this.isLine(id)){ list.push(id); by-=2;} else{ break;} }
		bx = this.cell[c].bx; by = this.cell[c].by+1;
		while(by<this.maxby){ id=this.bnum(bx,by); if(this.isLine(id)){ list.push(id); by+=2;} else{ break;} }

		return list;
	}
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
				case this.FLIPY: tques={2:5,3:4,4:3,5:2}; break;
				case this.FLIPX: tques={2:3,3:2,4:5,5:4}; break;
				case this.TURNR: tques={2:5,3:2,4:3,5:4}; break;
				case this.TURNL: tques={2:3,3:4,4:5,5:2}; break;
			}
			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val=tques[bd.QuC(c)]; if(!!val){ bd.sQuC(c,val);}
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
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawPekes(0);
		this.drawLines();

		this.drawTriangle();
		this.drawTriangleBorder();
		this.drawNumbers();

		this.draw11s();

		this.drawChassis();

		this.drawTarget();
	},

	drawTriangleBorder : function(){
		var g = this.vinc('cell_triangle_border', 'crispEdges');

		var header = "b_tb_";
		var idlist = this.range.borders;
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i], lflag = !(bd.border[id].bx&1);
			var qs1 = bd.QuC(bd.border[id].cellcc[0]),
				qs2 = bd.QuC(bd.border[id].cellcc[1]);

			g.fillStyle = this.gridcolor;
			if(lflag && (qs1===3||qs1===4)&&(qs2===2||qs2===5)){
				if(this.vnop(header+id,this.NONE)){
					g.fillRect(bd.border[id].px, bd.border[id].py-this.bh, 1, this.ch);
				}
			}
			else if(!lflag && (qs1===2||qs1===3)&&(qs2===4||qs2===5)){
				if(this.vnop(header+id,this.NONE)){
					g.fillRect(bd.border[id].px-this.bw, bd.border[id].py, this.cw, 1);
				}
			}
			else{ this.vhide(header+id);}
		}
	},
	draw11s : function(){
		var g = this.vinc('cell_ques', 'crispEdges');
		var headers = ["c_lp1_", "c_lp2_"];

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.cell[c].ques===11){
				var lw = this.lw+2, lm=(lw-1)/2, ll=this.cw*0.76;
				g.fillStyle = this.cellcolor;

				// Gridの真ん中＝cpx,cpy+0.5
				if(this.vnop(headers[0]+c,this.NONE)){
					g.fillRect(bd.cell[c].cpx+0.5-lm, bd.cell[c].cpy+0.5-ll/2,  lw, ll);
				}
				if(this.vnop(headers[1]+c,this.NONE)){
					g.fillRect(bd.cell[c].cpx+0.5-ll/2, bd.cell[c].cpy+0.5-lm,  ll, lw);
				}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c]);}
		}
	},
	drawNumber1 : function(c){
		var obj = bd.cell[c], key = ['cell',c].join('_');
		if((obj.ques>=2 && obj.ques<=5) && obj.qnum>0){
			this.dispnum(key, obj.ques, ""+obj.qnum, 0.45, "white", obj.cpx, obj.cpy);
		}
		else{ this.hideEL(key);}
	},

	repaintParts : function(idlist){
		this.range.cells = bd.lines.getClistFromIdlist(idlist);

		this.draw11s();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeReflectlink();
	},
	pzlexport : function(type){
		this.encodeReflectlink();
	},

	decodeReflectlink : function(){
		var c=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if     (ca==='5'){ obj.ques = 11;}
			else if(this.include(ca,'1','4')){
				obj.ques = parseInt(ca)+1;
				obj.qnum = parseInt(bstr.substr(i+1,1),16);
				i++;
			}
			else if(this.include(ca,'6','9')){
				obj.ques = parseInt(ca)-4;
				obj.qnum = parseInt(bstr.substr(i+1,2),16);
				i+=2;
			}
			else if(this.include(ca,'a','z')){ c+=(parseInt(ca,36)-10);}
			if(obj.qnum===0){ obj.qnum=-1;}

			c++;
			if(c>=bd.cellmax){ break;}
		}

		this.outbstr = bstr.substr(i);
	},
	encodeReflectlink : function(type){
		var cm="", pstr="", count=0;
		for(var c=0;c<bd.cellmax;c++){
			var qu=bd.cell[c].ques;
			if     (qu===11){ pstr = "5";}
			else if(qu>=2 && qu<=5){
				var val = bd.cell[c].qnum;
				if     (val<= 0){ pstr = ""+(qu-1)+"0";}
				else if(val>= 1 && val< 16){ pstr = ""+(qu-1)+val.toString(16);}
				else if(val>=16 && val<256){ pstr = ""+(qu+4)+val.toString(16);}
			}
			else{ pstr = ""; count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.ques = 11;}
			else if(ca!=="."){
				obj.ques = parseInt(ca.charAt(0))+1;
				if(ca.length>1){ obj.qnum = parseInt(ca.substr(1));}
			}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.ques===11) { return "+ ";}
			else if(obj.ques>=2 && obj.ques<=5) {
				return ""+(obj.ques-1)+(obj.qnum!==-1 ? obj.qnum : "")+" ";
			}
			else{ return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		this.performAsLine = true;

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===4 && bd.QuC(c)!==11);}) ){
			this.setAlert('十字以外の場所で線が交差しています。','There is a crossing line out of cross mark.'); return false;
		}

		if( !this.checkTriNumber(1) ){
			this.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
		}
		if( !this.checkTriangle() ){
			this.setAlert('線が三角形を通過していません。','A line doesn\'t goes through a triangle.'); return false;
		}
		if( !this.checkTriNumber(2) ){
			this.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)!==4 && bd.QuC(c)===11);}) ){
			this.setAlert('十字の場所で線が交差していません。','There isn\'t a crossing line on a cross mark.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkLcntCell(1);},

	checkTriangle : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.lines.lcntCell(c)==0 && (bd.QuC(c)>=2 && bd.QuC(c)<=5)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],4);
				result = false;
			}
		}
		return result;
	},

	checkTriNumber : function(type){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QuC(c)<2 || bd.QuC(c)>5 || !bd.isValidNum(c)){ continue;}

			var list = bd.getTriLine(c);
			if(type==1?bd.QnC(c)<(list.length+1):bd.QnC(c)>(list.length+1)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],4);
				if(result){ bd.sErBAll(2);}
				bd.sErB(list,1);
				result = false;
			}
		}
		return result;
	}
}
};
