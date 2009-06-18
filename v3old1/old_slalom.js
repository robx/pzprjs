//
// パズル固有スクリプト部 スラローム版 slalom.js v3.1.2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.outside = 0;			// 1:盤面の外側にIDを用意する
	k.dispzero = 0;			// 1:0を表示するかどうか
	k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross = 0;			// 1:Crossが操作可能なパズル
	k.isborder = 1;			// 1:Border/Lineが操作可能なパズル
	k.isoutsidecross = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isborderCross = 0;	// 1:線が交差するパズル
	k.isCenterLine = 1;		// 1:線がセルの中央を通る
	k.isborderAsLine = 0;	// 1:境界線をlineとして扱う

	k.isDispHatena = 0;		// 1:qnumが-2のときに？を表示する
	k.isAnsNumber = 0;		// 1:回答に数字を入力するパズル
	k.isOneNumber = 0;		// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL = 0;		// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB = 0;		// 1:回答の数字と○×が入るパズル

	k.BlackCell = 1;		// 1:黒マスを入力するパズル
	k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell = 0;		// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["others", "borderline"];

	//k.def_csize = 36;
	//k.def_psize = 24;
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = Class.create();
Puzzle.prototype = {
	initialize : function(){
		this.input_init();
		this.graphic_init();

		this.hinfo = new Hurdle();
		this.hinfo.generateAll();

		this.startid = 0;

		if(k.callmode=="pplay"){
			$("expression").innerHTML = "　左クリックで線が、右クリックで×が入力できます。";
		}
		else{
			$("expression").innerHTML = "　問題の記号はQWEASの各キーで入力、Tキーや-キーで消去できます。";
//			$("keypopup").checked = true;
		}
	},

	//---------------------------------------------------------
	// htmlなどの表示設定を行う
	gettitle : function(){
		return "スラローム";
	},
	smenubgcolor : function(){
		return "rgb(96, 96, 96)";
	},

	//---------------------------------------------------------
	// "操作方法"関連関数群
	useclick : function(e){
		if(Event.element(e).id=="use1"){ k.use = 1;}
		else if(Event.element(e).id=="use2"){ k.use = 2;}
		this.usedisp();
	},
	usearea : function(){
		$("usepanel").innerHTML = "操作方法 |&nbsp;";
		new Insertion.Bottom("usepanel", "<div class=\"flag\" id=\"use1\">左右ボタン</div>&nbsp;");
		new Insertion.Bottom("usepanel", "<div class=\"flag\" id=\"use2\">1ボタン</div>&nbsp;");

		Event.observe($("use1"), 'click', this.useclick.bindAsEventListener(this), false);
		Event.observe($("use2"), 'click', this.useclick.bindAsEventListener(this), false);
		unselectable($("use1"));
		unselectable($("use2"));

		this.usedisp();
	},
	usedisp : function(){
		if(k.use==1)		{ $("use1").className = "flagsel"; $("use2").className = "flag";}
		else if(k.use==2)	{ $("use1").className = "flag"; $("use2").className = "flagsel";}
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){ this.inputGate(x,y);}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==1 && this.notInputted()){
				this.inputQues_slalom(x,y);
//				if(!$("keypopup").checked){ this.inputQues_slalom(x,y);}
//				else{ kp.display(x,y);}
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1){ this.inputGate(x,y);}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		mv.inputQues_slalom = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}

			if(cc!=tc.getTCC()){
				var cc0 = tc.getTCC(); tc.setTCC(cc);
				pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			}
			else{
				if     (this.btn.Left ){ bd.setQuesCell(cc, {0:1,1:21,21:22,22:0}[bd.getQuesCell(cc)]);}
				else if(this.btn.Right){ bd.setQuesCell(cc, {0:22,22:21,21:1,1:0}[bd.getQuesCell(cc)]);}
			}

			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
		};
		mv.inputGate = function(x,y){
			var pos = this.crosspos(new Pos(x,y),0.30);
			var cc  = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}
			if(pos.x==this.firstPos.x && pos.y==this.firstPos.y && cc==this.mouseCell){ return;}

			if(this.inputData==-1){
				if     (Math.abs(pos.y-this.firstPos.y)==1){ this.inputData=21;}
				else if(Math.abs(pos.x-this.firstPos.x)==1){ this.inputData=22;}
				if(bd.getQuesCell(cc)==this.inputData){ this.inputData=0;}
			}
			else{
				if     (this.inputData!=21 && Math.abs(pos.y-this.firstPos.y)==1){ return;}
				else if(this.inputData!=22 && Math.abs(pos.x-this.firstPos.x)==1){ return;}
			}

			if(this.inputData!=-1 && bd.getQuesCell(cc)!=this.inputData){
				bd.setQuesCell(cc,this.inputData);
				puz.hinfo.inputHurdle(cc);
			}

			this.firstPos = pos;
			this.mouseCell = cc;
			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx+1, bd.cell[cc].cy+1);

			$("title2").innerHTML = puz.hinfo.max;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			if(this.key_inputLineParts(ca)){ return;}
			this.key_inputqnum(ca,99);
		};
		kc.key_inputLineParts = function(ca){
			if(k.mode!=1){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'){ bd.setQuesCell(cc,2); bd.setQnumCell(cc,-1);}
			else if(ca=='w'){ bd.setQuesCell(cc,3); bd.setQnumCell(cc,-1);}
			else if(ca=='e'){ bd.setQuesCell(cc,4); bd.setQnumCell(cc,-1);}
			else if(ca=='r'){ bd.setQuesCell(cc,5); bd.setQnumCell(cc,-1);}
			else if(ca=='t'){ bd.setQuesCell(cc,101); bd.setQnumCell(cc,-1);}
			else if(ca=='y'){ bd.setQuesCell(cc,0); bd.setQnumCell(cc,-1);}
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};

//		if(k.callmode == "pmake"){
//			kp.generate(99, true, false, this.kpgenerate);
//			kp.imgCR = [4,1];
//			kp.kpinput = function(ca){
//				if(kc.key_inputLineParts(ca)){ return;}
//				kc.key_inputqnum(ca,99);
//			};
//		}
	},

	kpgenerate : function(mode, tbody){
		var tr = new Element('tr');
		tr.appendChild(kp.td_imgelement('knumq', 'q', 0, 0));
		tr.appendChild(kp.td_imgelement('knumw', 'w', 1, 0));
		tr.appendChild(kp.td_imgelement('knume', 'e', 2, 0));
		tr.appendChild(kp.td_imgelement('knumr', 'r', 3, 0));
		tr.appendChild(kp.td_element('knumt', 't', '╋'));
		tr.appendChild(kp.td_element('knumt', 'y', ' '));
		tbody.appendChild(tr);
		tr = new Element('tr');
		tr.appendChild(kp.td_element('knum1', '1', '1'));
		tr.appendChild(kp.td_element('knum2', '2', '2'));
		tr.appendChild(kp.td_element('knum3', '3', '3'));
		tr.appendChild(kp.td_element('knum4', '4', '4'));
		tr.appendChild(kp.td_element('knum5', '5', '5'));
		tr.appendChild(kp.td_element('knum6', '6', '6'));
		tbody.appendChild(tr);
		tr = new Element('tr');
		tr.appendChild(kp.td_element('knum7', '7', '7'));
		tr.appendChild(kp.td_element('knum8', '8', '8'));
		tr.appendChild(kp.td_element('knum9', '9', '9'));
		tr.appendChild(kp.td_element('knum0', '0', '0'));
		tr.appendChild(kp.td_element('knum.', '-', '-'));
		tbody.appendChild(tr);

		return tbody;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.linecolor = "rgb(0, 0, 255)";	// 色分けなしの場合

		pc.fontcolor = "white";
		pc.fontErrcolor = "white";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawGates(x1,y1,x2,y2)
			this.drawBCells_slalom(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawBCells_slalom = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQuesCell(c)==1){
					if(bd.getErrorCell(c)==1){ g.fillStyle = this.errcolor1;}
					else{ g.fillStyle = this.Cellcolor;}

					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth+1, k.cheight+1);}
					this.dispnumCell_slalom(c);
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		};
		pc.dispnumCell_slalom = function(c){
//			var num = (bd.getQnumCell(c)!=-1 ? bd.getQnumCell(c) : bd.getQansCell(c));
//			if(num>=1 && num<=3){ text = ({1:"○",2:"△",3:"□"})[num];}
//			else if(num==-2)    { text = "?";}
//			else if(!bd.cell[c].numobj)          { continue;}
//			else{ Element.hide(bd.cell[c].numobj); continue;}
//
//			if(!bd.cell[c].numobj){ bd.cell[c].numobj = CreateDOMAndSetNop();}
//			this.dispnumCell1(c, bd.cell[c].numobj, 1, text, 0.8, this.getNumberColor(c));
			this.vinc();
		};

		pc.drawGates = function(x1,y1,x2,y2){
			var lw = (int(k.cwidth/10)>=3?int(k.cwidth/10):3); //LineWidth
			var lm = int((lw-1)/2)+1; //LineMargin
			var ll = lw*1.1;	//LineLength
			g.fillStyle = this.Cellcolor;

			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				if(bd.getQuesCell(c)==21){ //たて
					for(var j=bd.cell[c].py();j<bd.cell[c].py()+k.cheight;j+=ll*2){
						if(this.vnop("c"+c+"_dl21_",1)){ g.fillRect(bd.cell[c].px()+int(k.cwidth/2)-lm+1, j, lw, ll);}
					}
				}
				else{ this.vhide("c"+c+"_dl21_");}

				if(bd.getQuesCell(c)==22){ //よこ
					for(var j=bd.cell[c].px();j<bd.cell[c].px()+k.cwidth;j+=ll*2){
						if(this.vnop("c"+c+"_dl22_",1)){ g.fillRect(j, bd.cell[c].py()+int(k.cheight/2)-lm+1, ll, lw);}
					}
				}
				else{ this.vhide("c"+c+"_dl22_");}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){
			bstr = this.decodeReflectlink(bstr);
			this.hinfo.generate();
		}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeReflectlink();
	},

	//---------------------------------------------------------
	decodeReflectlink : function(bstr){
		var i, ca, c;
		c = 0;
		for(i=0;i<bstr.length;i++){
			ca = bstr.charAt(i);

			if     (ca == '5')             { bd.setQuesCell(c, 101); c++;}
			else if(ca >= '1' && ca <= '4'){
				bd.setQuesCell(c, parseInt(ca)+1);
				bd.setQnumCell(c, parseInt(bstr.substring(i+1,i+2),16));
				c++; i++;
			}
			else if(ca >= '6' && ca <= '9'){
				bd.setQuesCell(c, parseInt(ca)-4);
				bd.setQnumCell(c, parseInt(bstr.substring(i+1,i+3),16));
				c++; i+=2;
			}
			else if(ca >= 'a' && ca <= 'z'){ c += (parseInt(ca,36)-9);}
			else{ c++;}

			if(c > bd.cell.length){ break;}
		}

		return bstr.substring(i,bstr.length);
	},
	encodeReflectlink : function(type){
		var count, pass, i;
		var cm="";
		var pstr="";

		count=0;
		for(i=0;i<bd.cell.length;i++){
			if     (bd.getQuesCell(i) == 101){ pstr = "5";}
			else if(bd.getQuesCell(i)>=2 && bd.getQuesCell(i)<=5){
				var val = bd.getQnumCell(i);
				if     (val<= 0){ pstr = ""+(bd.getQuesCell(i)-1)+"0";}
				else if(val>= 1 && val< 16){ pstr = ""+(bd.getQuesCell(i)-1)+val.toString(16);}
				else if(val>=16 && val<256){ pstr = ""+(bd.getQuesCell(i)+4)+val.toString(16);}
			}
			else{ pstr = ""; count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<k.qrows){ return false;}
		fio.decodeCell( function(c,ca){
			if(ca == "+")     { bd.setQuesCell(c, 101);}
			else if(ca != "."){
				bd.setQuesCell(c, parseInt(ca.charAt(0))+1);
				if(ca.length>1){ bd.setQnumCell(c, parseInt(ca.substring(1,ca.length)));}
			}
		},array.slice(0,k.qrows));
		return true;
	},
	encodeOthers : function(){
		return (""+fio.encodeCell( function(c){
			if     (bd.getQuesCell(c)==101) { return "+ ";}
			else if(bd.getQuesCell(c)>=2 && bd.getQuesCell(c)<=5) {
				if(bd.getQnumCell(c)==-1){ return ""+(bd.getQuesCell(c)-1).toString()+" ";}
				else{ return ""+(bd.getQuesCell(c)-1).toString()+(bd.getQnumCell(c)).toString()+" ";}
			}
			else{ return ". ";}
		}) );
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){
		ans.performAsLine = true;

		if( !ans.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLineCross() ){
			ans.setAlert('十字以外の場所で線が交差しています。','There is a crossing line out of cross mark.'); return false;
		}

		if( !this.checkTriNumber(1) ){
			ans.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
		}
		if( !this.checkTriangle() ){
			ans.setAlert('線が三角形を通過していません。','A line doesn\'t goes through a triangle.'); return false;
		}
		if( !this.checkTriNumber(2) ){
			ans.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
		}

		if( !this.checkLineCross2() ){
			ans.setAlert('十字の場所で線が交差していません。','There isn\'t a crossing line on a cross mark.'); return false;
		}

		if( !ans.checkLcntCell(1) ){
			ans.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		return true;
	},
	check1st : function(){ return ans.checkLcntCell(1);},

	checkLineCross : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==4 && bd.getQuesCell(c)!=101){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},
	checkLineCross2 : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)!=4 && bd.getQuesCell(c)==101){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},
	checkTriangle : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==0 && (bd.getQuesCell(c)>=2 && bd.getQuesCell(c)<=5)){
				bd.setErrorCell([c],4);
				return false;
			}
		}
		return true;
	},

	checkTriNumber : function(type){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQuesCell(c)<2 || bd.getQuesCell(c)>5 || bd.getQnumCell(c)<=0){ continue;}

			var list = new Array();
			var cnt=1;
			var tx, ty;

			bx = bd.cell[c].cx*2;   by = bd.cell[c].cy*2+1;
			while(bx>0)        { var id=bd.getbnum(bx,by); if(bd.getLineBorder(id)==1){ cnt++; list.push(id); bx-=2;} else{ break;} }
			bx = bd.cell[c].cx*2+2; by = bd.cell[c].cy*2+1;
			while(bx<k.qcols*2){ var id=bd.getbnum(bx,by); if(bd.getLineBorder(id)==1){ cnt++; list.push(id); bx+=2;} else{ break;} }
			bx = bd.cell[c].cx*2+1; by = bd.cell[c].cy*2;
			while(by>0)        { var id=bd.getbnum(bx,by); if(bd.getLineBorder(id)==1){ cnt++; list.push(id); by-=2;} else{ break;} }
			bx = bd.cell[c].cx*2+1; by = bd.cell[c].cy*2+2;
			while(by<k.qrows*2){ var id=bd.getbnum(bx,by); if(bd.getLineBorder(id)==1){ cnt++; list.push(id); by+=2;} else{ break;} }

			if(type==1?bd.getQnumCell(c)<cnt:bd.getQnumCell(c)>cnt){
				bd.setErrorCell([c],4);
				bd.setErrorBorder(bd.borders,2);
				bd.setErrorBorder(list,1);
				return false;
			}
		}
		return true;
	}
};

//---------------------------------------------------------
//---------------------------------------------------------
HurdleData = Class.create();
HurdleData.prototype = {
	initialize : function(){
		this.order = -1;				// 旗門につく数字
		this.val   =  0;				// 旗門のタテヨコ(21か22か)
		this.clist = new Array();		// このデータに含まれるセルのリスト

		this.x1 = this.x2 = this.y1 = this.y2 = -1; // 旗門のサイズ
	}
};

Hurdle = Class.create();
Hurdle.prototype = {
	initialize : function(){
		this.max    = 0;
		this.gateid = new Array();
		this.data   = new Array();
	},

	getGateid : function(cc){
		if(cc<0 || cc>=bd.cell.length){ return -1;}
		return this.gateid[cc];
	},
	getGateval : function(cc){
		if(cc<0 || cc>=bd.cell.length || this.gateid[cc]==-1){ return -1;}
		return this.data[this.gateid[cc]].val;
	},
	getGateorder : function(cc){
		if(cc<0 || cc>=bd.cell.length || this.gateid[cc]==-1){ return -1;}
		return this.data[this.gateid[cc]].order;
	},

	//---------------------------------------------------------
	init : function(){
		this.max=0;
		for(var c=0;c<bd.cell.length;c++){ this.gateid[c] = -1;}
		this.data=new Array();
	},
	generateAll : function(){
		this.init();
		this.addHurdleWithClist(bd.cells);
	},
	addHurdleWithClist : function(clist){
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.getQuesCell(c)==0 || bd.getQuesCell(c)==1 || this.getGateid(c)!=-1){ continue;}

			var cx=bd.cell[c].cx, cy=bd.cell[c].cy;
			var val=bd.getQuesCell(c);

			this.max++;
			this.data[this.max] = new HurdleData();
			this.data[this.max].order = -1;
			this.data[this.max].val   = val;

			while(bd.getQuesCell(bd.getcnum(cx,cy))==val){ if(val==21){ cy++;}else{ cx++;}}
			if(val==21){ cy--;}else{ cx--;}
			this.data[this.max].x1 = bd.cell[c].cx;
			this.data[this.max].y1 = bd.cell[c].cy;
			this.data[this.max].x2 = cx;
			this.data[this.max].y2 = cy;
			this.setGateclist(this.max);
			for(var i=0;i<this.data[this.max].clist.length;i++){ this.gateid[this.data[this.max].clist[i]]=this.max;}
		}
	},
	removeHurdle : function(gateid){
//		for(var i=gateid+1;i<this.data.length;i++){ this.data[i-1]=this.data[i];}
//		this.data.pop();
		this.data.splice(gateid,1);
		for(var c=0;c<bd.cell.length;c++){ if(this.gateid[c]>gateid){ this.gateid[c]--;} }
		this.max--;
	},
	setGateclist : function(gateid){
		this.data[gateid].clist = this.getClist(this.data[gateid].x1,this.data[gateid].y1,this.data[gateid].x2,this.data[gateid].y2);
	},
	getClist : function(x1,y1,x2,y2){
		var clist = new Array();
		for(var cy=y1;cy<=y2;cy++){
			for(var cx=x1;cx<=x2;cx++){ if(bd.getcnum(cx,cy)!=-1){ clist.push(bd.getcnum(cx,cy));} }
		}
		return clist;
	},

	//---------------------------------------------------------
	inputHurdle : function(cc){
		if(cc==-1 || bd.getQuesCell(cc)==this.getGateval(cc)){ return;}
		var cx=bd.cell[cc].cx, cy=bd.cell[cc].cy, val=bd.getQuesCell(cc);

		// 入力されたデータで旗門情報を消去する
		if(this.getGateid(cc)!=-1){
			var ccid = this.getGateid(cc);
			var old  = this.getGateval(cc);

			//1マスだけ
			if(this.data[ccid].clist.length==1){
				this.removeHurdle(ccid);
				this.gateid[cc]=-1;
			}
			//旗門の端のマス
			else if((this.data[ccid].x1==cx || this.data[ccid].x2==cx) && (this.data[ccid].y1==cy || this.data[ccid].y2==cy)){
				if(old==21){ if(this.data[ccid].y1==cy){ this.data[ccid].y1++;}else{ this.data[ccid].y2--;} }
				else       { if(this.data[ccid].x1==cx){ this.data[ccid].x1++;}else{ this.data[ccid].x2--;} }
				this.setGateclist(ccid);
				this.gateid[cc]=-1;
			}
			//旗門の中のマス
			else{
				var clist;
				if(old==21){ clist=this.getClist(cx,cy+1,cx,this.data[ccid].y2); this.data[ccid].y2=cy-1;}
				else       { clist=this.getClist(cx+1,cy,this.data[ccid].x2,cy); this.data[ccid].x2=cx-1;}
				this.setGateclist(ccid);
				for(var i=0;i<clist.length;i++){ this.gateid[clist[i]]=-1;}
				this.gateid[cc]=-1;
				this.addHurdleWithClist(clist);
			}
		}

		// 入力されたデータで旗門情報を作成する
		if(val==21 || val==22){
			var adjid1, adjid2;
			if(bd.getQuesCell(cc)==21){
				adjid1 = (bd.getQuesCell(bd.cell[cc].up())==21?this.getGateid(bd.cell[cc].up()):-1);
				adjid2 = (bd.getQuesCell(bd.cell[cc].dn())==21?this.getGateid(bd.cell[cc].dn()):-1);
			}
			else if(bd.getQuesCell(cc)==22){
				adjid1 = (bd.getQuesCell(bd.cell[cc].lt())==22?this.getGateid(bd.cell[cc].lt()):-1);
				adjid2 = (bd.getQuesCell(bd.cell[cc].rt())==22?this.getGateid(bd.cell[cc].rt()):-1);
			}

			//1マスだけ
			if(adjid1==-1 && adjid2==-1){ this.addHurdleWithClist([cc]);}
			//旗門の端に追加
			else if(adjid1==-1 || adjid2==-1){
				if(val==21){
					if     (adjid1!=-1){ this.gateid[cc]=adjid1; this.data[adjid1].clist.push(cc); this.data[adjid1].y2++;}
					else if(adjid2!=-1){ this.gateid[cc]=adjid2; this.data[adjid2].clist.push(cc); this.data[adjid2].y1--;}
				}
				else if(val==22){
					if     (adjid1!=-1){ this.gateid[cc]=adjid1; this.data[adjid1].clist.push(cc); this.data[adjid1].x2++;}
					else if(adjid2!=-1){ this.gateid[cc]=adjid2; this.data[adjid2].clist.push(cc); this.data[adjid2].x1--;}
				}
			}
			//旗門の中に追加
			else{
				var odr1=this.data[adjid1].order, odr2=this.data[adjid1].order;
				var neworder=-1;
				if(odr1>0){ neworder=odr1;}else if(odr2>0){ neworder=odr2;}
				this.data[adjid1].order = neworder;

				var clist0;
				if(val==21){ clist0=this.getClist(cx,cy,cx,this.data[adjid2].y2); this.data[adjid1].y2=this.data[adjid2].y2;}
				else       { clist0=this.getClist(cx,cy,this.data[adjid2].x2,cy); this.data[adjid1].x2=this.data[adjid2].x2;}
				for(var i=0;i<clist0.length;i++){ this.gateid[clist0[i]]=adjid1;}
				this.removeHurdle(adjid2);
			}
		}
	},

	//---------------------------------------------------------
	getGatePole : function(gateid){
		var clist = new Array();
		var cc1,cc2;
		if(this.data[gateid].val==21){
			var cc1 = bd.getcnum(this.data[gateid].x1, this.data[gateid].y1-1);
			var cc2 = bd.getcnum(this.data[gateid].x1, this.data[gateid].y2+1);
		}
		else if(this.data[gateid].val==22){
			var cc1 = bd.getcnum(this.data[gateid].x1-1, this.data[gateid].y1);
			var cc2 = bd.getcnum(this.data[gateid].x2+1, this.data[gateid].y1);
		}
		if(cc1!=-1){ clist.push(cc1);}
		if(cc2!=-1){ clist.push(cc2);}
		return clist;
	},
	getConnectedGate : function(cc){
		var item = new Array();
		if(bd.getQuesCell(bd.cell[cc].up())==21){ item[this.gateid[bd.cell[c].up()]]=1;}
		if(bd.getQuesCell(bd.cell[cc].dn())==21){ item[this.gateid[bd.cell[c].dn()]]=1;}
		if(bd.getQuesCell(bd.cell[cc].lt())==22){ item[this.gateid[bd.cell[c].lt()]]=1;}
		if(bd.getQuesCell(bd.cell[cc].rt())==22){ item[this.gateid[bd.cell[c].rt()]]=1;}

		var idlist = new Array();
		for(i in item){ idlist.push(i);}
		return idlist;
	}
};
