// pzprUtil.js v3.2.2

//---------------------------------------------------------------------------
// ★Colorsクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// Colorsクラスの定義
Colors = function(){
	this.lastHdeg = 0;
	this.lastYdeg = 0;
	this.minYdeg = 0.18;
	this.maxYdeg = 0.70;
};
Colors.prototype = {
	//---------------------------------------------------------------------------
	// col.getNewLineColor() 新しい色を返す
	//---------------------------------------------------------------------------
	getNewLineColor : function(){
		var loopcount = 0;

		while(1){
			var Rdeg = mf(Math.random() * 384)-64; if(Rdeg<0){Rdeg=0;} if(Rdeg>255){Rdeg=255;}
			var Gdeg = mf(Math.random() * 384)-64; if(Gdeg<0){Gdeg=0;} if(Gdeg>255){Gdeg=255;}
			var Bdeg = mf(Math.random() * 384)-64; if(Bdeg<0){Bdeg=0;} if(Bdeg>255){Bdeg=255;}

			// HLSの各組成値を求める
			var Cmax = Math.max(Rdeg,Math.max(Gdeg,Bdeg));
			var Cmin = Math.min(Rdeg,Math.min(Gdeg,Bdeg));

			var Hdeg = 0;
			var Ldeg = (Cmax+Cmin)*0.5 / 255;
			var Sdeg = (Cmax==Cmin?0:(Cmax-Cmin)/((Ldeg<=0.5)?(Cmax+Cmin):(2*255-Cmax-Cmin)) );

			if(Cmax==Cmin){ Hdeg = 0;}
			else if(Rdeg>=Gdeg && Rdeg>=Bdeg){ Hdeg = (    60*(Gdeg-Bdeg)/(Cmax-Cmin)+360)%360;}
			else if(Gdeg>=Rdeg && Gdeg>=Bdeg){ Hdeg = (120+60*(Bdeg-Rdeg)/(Cmax-Cmin)+360)%360;}
			else if(Bdeg>=Gdeg && Bdeg>=Rdeg){ Hdeg = (240+60*(Rdeg-Gdeg)/(Cmax-Cmin)+360)%360;}

			// YCbCrのYを求める
			var Ydeg = (0.29891*Rdeg + 0.58661*Gdeg + 0.11448*Bdeg) / 255;

			if( (this.minYdeg<Ydeg && Ydeg<this.maxYdeg) && (Math.abs(this.lastYdeg-Ydeg)>0.15) && (Sdeg<0.02 || 0.40<Sdeg)
				 && (((360+this.lastHdeg-Hdeg)%360>=45)&&((360+this.lastHdeg-Hdeg)%360<=315)) ){
				this.lastHdeg = Hdeg;
				this.lastYdeg = Ydeg;
				//alert("rgb("+Rdeg+", "+Gdeg+", "+Bdeg+")\nHLS("+mf(Hdeg)+", "+(""+mf(Ldeg*1000)*0.001).slice(0,5)+", "+(""+mf(Sdeg*1000)*0.001).slice(0,5)+")\nY("+(""+mf(Ydeg*1000)*0.001).slice(0,5)+")");
				return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";
			}

			loopcount++;
			if(loopcount>100){ return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";}
		}
	},

	//---------------------------------------------------------------------------
	// col.setLineColor()  入力された線に応じて周辺の線の色を変更する
	// col.setLineColor1() 入力された線に応じて周辺の線の色を変更する(線を書いた時)
	// col.setLineColor2() 入力された線に応じて周辺の線の色を変更する(線を消した時)
	//---------------------------------------------------------------------------
	setLineColor : function(id, val){
		if(k.br.IE && !menu.getVal('irowake')){ return;}

		if(!k.isborderCross){ this.setColor1(id,val); return;}

		var cc1, cc2;
		if(k.isborderAsLine==0){ cc1 = bd.cc1(id);      cc2 = bd.cc2(id);     }
		else                   { cc1 = bd.crosscc1(id); cc2 = bd.crosscc2(id);}

		if(val==1){ this.setLineColor1(id,cc1,cc2);}
		else      { this.setLineColor2(id,cc1,cc2);}
	},
	setLineColor1 : function(id, cc1, cc2){
		var setc = "";
		if(cc1!=-1 && bd.backLine(id)!=-1){
			if(ans.lcntCell(cc1)!=3){
				setc = bd.border[bd.backLine(id)].color;
			}
			else{
				setc = bd.border[bd.backLine(id)].color;
				this.changeColors(bd.backLine(id), id, setc);
				if(!ans.isConnectLine(this.tshapeid(cc1),id,-1)){ this.changeColors(this.tshapeid(cc1), -1, this.getNewLineColor());}
			}
		}
		if(cc2!=-1 && bd.nextLine(id)!=-1){
			if(ans.lcntCell(cc2)!=3){
				if(!setc){ setc = bd.border[bd.nextLine(id)].color;}
				else{ this.changeColors(bd.nextLine(id), id, setc);}
			}
			else{
				if(!setc){ setc = bd.border[bd.nextLine(id)].color;}
				this.changeColors(bd.nextLine(id), id, setc);
				if(!ans.isConnectLine(this.tshapeid(cc2),id,-1)){ this.changeColors(this.tshapeid(cc2), -1, this.getNewLineColor());}
			}
		}

		if(!setc){ bd.border[id].color = this.getNewLineColor();}
		else{ bd.border[id].color = setc;}
	},
	setLineColor2 : function(id, cc1, cc2){
		var keeped = 0;
		var firstchange = false;
		if(cc1!=-1 && cc2!=-1){
			if(!ans.isLoopLine(id) && cc1!=-1 && (ans.lcntCell(cc1)==2 || ans.lcntCell(cc1)==4)){
				keeped=1;
			}
			else if(cc1!=-1 && ans.lcntCell(cc1)==3 && this.tshapeid(cc1)!=id){
				this.changeColors(this.tshapeid(cc1), -1, bd.border[bd.backLine(id)].color);
				firstchange = true;
				if(!ans.isConnectLine(bd.nextLine(id), this.tshapeid(cc1), id)){ keeped=1;}
			}
			
			if(!ans.isLoopLine(id) && cc2!=-1 && (ans.lcntCell(cc2)==2 || ans.lcntCell(cc2)==4) && keeped==1){
				this.changeColors(bd.nextLine(id), id, this.getNewLineColor());
			}
			else if(cc2!=-1 && ans.lcntCell(cc2)==3 && this.tshapeid(cc2)!=id){
				if(keeped==0){ this.changeColors(this.tshapeid(cc2), -1, bd.border[bd.nextLine(id)].color);}
				else{
					if(ans.isConnectLine(this.tshapeid(cc2),bd.nextLine(id),-1)){
						if(!ans.isConnectLine(bd.backLine(id),this.tshapeid(cc2),id)){ this.changeColors(bd.nextLine(id), -1, this.getNewLineColor());}
					}
					else{
						this.changeColors(bd.nextLine(id), -1, bd.border[this.tshapeid(cc2)].color);
						if(firstchange){ this.changeColors(this.tshapeid(cc1), -1, bd.border[bd.backLine(id)].color);}
					}
				}
			}
		}
		bd.border[id].color = "";
	},
	//---------------------------------------------------------------------------
	// col.lcntCell()     周りの線の本数を取得する
	// col.changeColors() startidに繋がっている線の色をcolに変える
	// col.repaintParts() 各パズルで、色変え時に処理をしたいときオーバーライドする
	// col.changeLines()  startidに繋がっている線に何らかの処理を行う
	// col.tshapeid()     lcnt==3の時、Ｔ字路のぶつかっている方向のLineのIDを返す
	//---------------------------------------------------------------------------
	lcntCell : function(id){
		if(k.isborderAsLine==0){
			if(id==-1 || id>=bd.cell.length){ return -1;}
			return ans.lcntCell(bd.cnum(bd.cell[id].cx,bd.cell[id].cy));
		}
		else{
			if(id==-1 || id>=(k.qcols+1)*(k.qrows+1)){ return -1;}
			return ans.lcntCross(bd.xnum(id%(k.qcols+1), mf(id/(k.qcols+1))));
		}
	},
	changeColors : function(startid, backid, col){
		pc.zstable = true;
		this.changeLines(startid, backid, col, function(id,col){
			bd.border[id].color = col;
			if(menu.getVal('irowake')){
				if(k.isborderAsLine==0){ pc.drawLine1(id,true);}else{ pc.drawBorder1(id,true);}
				if(!g.vml){ this.repaintParts(id);}
			}
		}.bind(this));
		pc.zstable = false;
	},
	repaintParts : function(id){ }, // オーバーライド用
	changeLines : function(startid, backid, col, func){
		if(startid==-1){ return;}
		var forward = -1;
		var here = startid;
		var backward = backid;
		while(k.qcols*k.qrows*3){
			func(here,col);
			forward = bd.forwardLine(here, backward);
			backward = here; here = forward;
			if(forward==startid || forward==-1){ break;}
		}
	},
	tshapeid : function(cc){
		var bx, by, func;
		if(k.isborderAsLine==0){
			bx = cc%(k.qcols)*2+1; by = mf(cc/(k.qcols))*2+1;
			if(cc==-1 || ans.lcntCell(bd.cnum(bd.cell[cc].cx,bd.cell[cc].cy))!=3){ return -1;}
			func = bd.LiB.bind(bd);
		}
		else{
			bx = cc%(k.qcols+1)*2; by = mf(cc/(k.qcols+1))*2;
			if(cc==-1 || ans.lcntCross(bd.xnum(mf(bx/2),mf(by/2)))!=3){ return -1;}
			func = bd.QaB.bind(bd);
		}

		if     (func(bd.bnum(bx-1,by  ))<=0){ return bd.bnum(bx+1,by  );}
		else if(func(bd.bnum(bx+1,by  ))<=0){ return bd.bnum(bx-1,by  );}
		else if(func(bd.bnum(bx  ,by-1))<=0){ return bd.bnum(bx  ,by+1);}
		else if(func(bd.bnum(bx  ,by+1))<=0){ return bd.bnum(bx  ,by-1);}

		return -1;
	},

	//---------------------------------------------------------------------------
	// col.setColor1() 入力された線に応じて周辺の線の色を変更する(交差なし用)
	// col.point()     セルから出ている線が1本かどうか判定する
	//---------------------------------------------------------------------------
	setColor1 : function(id,val){
		var idlist=new Array();
		var cc1, cc2, color;
		if(k.isborderAsLine==0){ cc1 = bd.cc1(id);      cc2 = bd.cc2(id);     }
		else                   { cc1 = bd.crosscc1(id); cc2 = bd.crosscc2(id);}

		pc.zstable = true;
		if(val!=0){
			if(this.point(id,cc1) && this.point(id,cc2)){ bd.border[id].color = this.getNewLineColor();}
			else if(bd.nextLine(id)!=-1 && this.point(id,cc1)){
				bd.border[id].color = bd.border[bd.nextLine(id)].color;
			}
			else if(bd.backLine(id)!=-1 && this.point(id,cc2)){
				bd.border[id].color = bd.border[bd.backLine(id)].color;
			}
			else if(bd.backLine(id)!=-1){
				color = bd.border[bd.backLine(id)].color;
				for(var i=0;i<bd.border.length;i++){ idlist[i]=0;}
				var bx = bd.border[id].cx-(k.isborderAsLine==0?bd.border[id].cy:bd.border[id].cx)%2;
				var by = bd.border[id].cy-(k.isborderAsLine==0?bd.border[id].cx:bd.border[id].cy)%2;
				this.sc0(idlist,bx,by,0);
				this.changeColor2(idlist,color,true);
			}
		}
		else{
			if(this.point(id,cc1) || this.point(id,cc2)){ return;}
			for(var i=0;i<bd.border.length;i++){ idlist[i]=0;} idlist[id]=1; idlist[bd.nextLine(id)]=2;
			if(bd.border[id].cx%2==1){
				this.sc0(idlist,bd.border[id].cx,bd.border[id].cy,(k.isborderAsLine==0?1:3));
				if(idlist[bd.nextLine(id)]!=3){
					for(var i=0;i<bd.border.length;i++){ idlist[i]=0;} idlist[id]=1;
					this.sc0(idlist,bd.border[id].cx,bd.border[id].cy,(k.isborderAsLine==0?2:4));
					this.changeColor2(idlist,this.getNewLineColor(),true);
				}
			}
			else{
				this.sc0(idlist,bd.border[id].cx,bd.border[id].cy,(k.isborderAsLine==0?3:1));
				if(idlist[bd.nextLine(id)]!=3){
					for(var i=0;i<bd.border.length;i++){ idlist[i]=0;} idlist[id]=1;
					this.sc0(idlist,bd.border[id].cx,bd.border[id].cy,(k.isborderAsLine==0?4:2));
					this.changeColor2(idlist,this.getNewLineColor(),true);
				}
			}
		}
		pc.zstable = false;
	},
	point : function(id,cc){
		return ans.lcntCell(cc)==1;
	},

	//---------------------------------------------------------------------------
	// col.changeColor2() ひとつながりの線の色を変える
	// col.sc0()          ひとつながりの線の色を変える
	// col.branch()       セルから出ている線が3本以上かどうか判定する
	//---------------------------------------------------------------------------
	changeColor2 : function(idlist,color,flag){
		for(var i=0;i<bd.border.length;i++){
			if(idlist[i]==1){
				bd.border[i].color = color;
				if(flag && menu.getVal('irowake')){
					if(k.isborderAsLine==0){ pc.drawLine1(i,true);}else{ pc.drawBorder1(i,true);}
					if(!g.vml){ this.repaintParts(i);}
				}
			}
		}
	},
	sc0 : function(idlist,bx,by,dir){
		var line = (k.isborderAsLine==0?bd.LiB.bind(bd):bd.QaB.bind(bd));
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if((bx+by)%2==0){
				var lcnt = ans.lcntCell(mf(bx/2)+mf(by/2)*(k.qcols+(k.isborderAsLine==0?0:1)));
				if(dir==0 || this.branch(bx,by,lcnt)){
					if(line(bd.bnum(bx,by-1))>0){ this.sc0(idlist,bx,by,1)}
					if(line(bd.bnum(bx,by+1))>0){ this.sc0(idlist,bx,by,2)}
					if(line(bd.bnum(bx-1,by))>0){ this.sc0(idlist,bx,by,3)}
					if(line(bd.bnum(bx+1,by))>0){ this.sc0(idlist,bx,by,4)}
					break;
				}
				else if(lcnt==3||lcnt==4){ }
				else if(lcnt==0){ return;}
				else if(dir!=1 && line(bd.bnum(bx,by+1))>0){ dir=2;}
				else if(dir!=2 && line(bd.bnum(bx,by-1))>0){ dir=1;}
				else if(dir!=3 && line(bd.bnum(bx+1,by))>0){ dir=4;}
				else if(dir!=4 && line(bd.bnum(bx-1,by))>0){ dir=3;}
			}
			else{
				var id = bd.bnum(bx,by);
				if(id==-1 || line(id)<=0 || idlist[id]!=0){ if(idlist[id]==2){ idlist[id]=3;} return;}
				idlist[id]=1;
			}
		}
	},
	branch : function(bx,by,lcnt){
		return (lcnt==3||lcnt==4);
	},

	//---------------------------------------------------------------------------
	// col.irowakeClick()  「色分けしなおす」ボタンを押した時
	// col.irowakeRemake() 「色分けしなおす」ボタンを押した時に色分けしなおす
	//---------------------------------------------------------------------------
	irowakeClick : function(){
		if(k.br.IE && menu.getVal('irowake')){ this.irowakeRemake(); return;}
		pc.paint(0,0,k.qcols-1,k.qrows-1);
	},
	irowakeRemake : function(){
		if(!menu.getVal('irowake')){ return;}

		var cnt=0;
		var first=-1;
		for(var i=0;i<bd.border.length;i++){ bd.border[i].color = ""; }
		for(var i=0;i<bd.border.length;i++){
			if( bd.border[i].color == "" && ((k.isborderAsLine==0 && bd.LiB(i)>0) || (k.isborderAsLine==1 && bd.QaB(i)==1)) ){
				var newColor = col.getNewLineColor();
				if(k.isborderCross){
					this.changeLines(i,bd.backLine(i),newColor, function(id,col){ bd.border[id].color = col;});
					this.changeLines(i,bd.nextLine(i),newColor, function(id,col){ bd.border[id].color = col;});
				}
				else{
					var idlist=new Array();
					for(var id=0;id<bd.border.length;id++){ idlist[id]=0;}
					var bx = bd.border[i].cx-(k.isborderAsLine==0?bd.border[i].cy:bd.border[i].cx)%2;
					var by = bd.border[i].cy-(k.isborderAsLine==0?bd.border[i].cx:bd.border[i].cy)%2;
					this.sc0(idlist,bx,by,0);
					this.changeColor2(idlist,newColor,false);
				}
			}
		}
		pc.paint(0,0,k.qcols-1,k.qrows-1);
	}
};

//--------------------------------------------------------------------------------
// ★Roomsクラス 部屋のTOP-Cellの位置等の情報を扱う
//--------------------------------------------------------------------------------
// 部屋のTOPに数字を入力する時の、ハンドリング等
Rooms = function(){
	this.enable = false;
	this.rareamax;
	this.cell = new Array();
	if(k.isOneNumber){ this.setEnable();}
};
Rooms.prototype = {
	//--------------------------------------------------------------------------------
	// room.isEnable()   このオブジェクトの動作が有効か
	// room.setEnable()  このオブジェクトの動作を有効にする
	// room.resetRarea() 部屋の情報をresetする
	//--------------------------------------------------------------------------------
	isEnable : function(){ return this.isenable;},
	setEnable : function(){
		this.isenable = true;
		this.resetRarea();
	},
	resetRarea : function(){
		if(!this.isEnable()){ return;}

		this.cell = new Array();
		var rarea = ans.searchRarea();
		for(var c=0;c<bd.cell.length;c++){ this.cell[c] = rarea.check[c]; }
		this.rareamax = rarea.max;

		if(!k.isOneNumber){ return;}
		for(var i=1;i<=this.rareamax;i++){
			var val = -1;
			for(var c=0;c<bd.cell.length;c++){
				if(this.cell[c]==i && bd.QnC(c)!=-1){
					if(val==-1){ val = bd.QnC(c);}
					if(this.getTopOfRoom(i)!=c){ bd.sQnC(c, -1);}
				}
			}
			if(val!=-1){ bd.sQnC(this.getTopOfRoom(i), val);}
		}
	},
	//--------------------------------------------------------------------------------
	// room.lcnt()                指定された位置のCrossの上下左右のうち境界線が引かれている(ques==1 or qans==1の)数を求める
	// room.setLineToRarea()      境界線が入力された時に、部屋のTOPにある数字をどうハンドリングするか
	// room.removeLineFromRarea() 境界線が消された時に、部屋のTOPにある数字をどうハンドリングするか
	// room.sr0()                 setLineToRarea()から呼ばれて、idを含む一つの部屋の領域を、指定されたareaidにする
	//---------------------------------------------------------------------------
	lcnt : function(xx,xy){
		var func = function(id){ return (id!=-1&&((bd.QuB(id)==1)||(bd.QaB(id)==1)));};
		var cnt = 0;
		if(xy>0       && ( (k.isoutsideborder==0 && (xx==0 || xx==k.qcols)) || func(bd.bnum(xx*2  ,xy*2-1)) ) ){ cnt++;}
		if(xy<k.qrows && ( (k.isoutsideborder==0 && (xx==0 || xx==k.qcols)) || func(bd.bnum(xx*2  ,xy*2+1)) ) ){ cnt++;}
		if(xx>0       && ( (k.isoutsideborder==0 && (xy==0 || xy==k.qrows)) || func(bd.bnum(xx*2-1,xy*2  )) ) ){ cnt++;}
		if(xx<k.qcols && ( (k.isoutsideborder==0 && (xy==0 || xy==k.qrows)) || func(bd.bnum(xx*2+1,xy*2  )) ) ){ cnt++;}
		return cnt;
	},
	setLineToRarea : function(id){
		var bx = bd.border[id].cx, by = bd.border[id].cy;
		if( this.lcnt(mf((bx-bx%2)/2), mf((by-by%2)/2))>=2 && this.lcnt(mf((bx+bx%2)/2), mf((by+by%2)/2))>=2
			&& bd.cc1(id)!=-1 && bd.cc2(id)!=-1 )
		{
			var keep = this.cell[bd.cc1(id)];
			var func = function(id){ return (id!=-1 && bd.QuB(id)==0); };
			this.rareamax++;
			this.sr0(func, this.cell, bd.cc2(id), this.rareamax);
			if(this.cell[bd.cc1(id)] == this.rareamax){
				for(var i=0;i<bd.cell.length;i++){ if(this.cell[i]==this.rareamax){ this.cell[i] = keep;} }
				this.rareamax--;
			}
		}
	},
	removeLineFromRarea : function(id){
		if(!um.isenableRecord()){ return;}	// 盤面拡大時の文字消去をfix
		var fordel, keep;
		var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
		if(cc1!=-1 && cc2!=-1 && this.cell[cc1] != this.cell[cc2]){
			var tc1 = this.getTopOfRoomByCell(cc1);
			var tc2 = this.getTopOfRoomByCell(cc2);

			if(k.isOneNumber){
				if     (bd.QnC(tc1)!=-1&&bd.QnC(tc2)==-1){ bd.sQnC(tc2, bd.QnC(tc1)); pc.paintCell(tc2);}
				else if(bd.QnC(tc1)==-1&&bd.QnC(tc2)!=-1){ bd.sQnC(tc1, bd.QnC(tc2)); pc.paintCell(tc1);}
			}

			var dcc = -1;
			if(bd.cell[tc1].cx > bd.cell[tc2].cx || (bd.cell[tc1].cx == bd.cell[tc2].cx && bd.cell[tc1].cy > bd.cell[tc2].cy)){
				fordel = this.cell[tc1]; keep = this.cell[tc2]; dcc = tc1;
			}
			else{ fordel = this.cell[tc2]; keep = this.cell[tc1]; dcc = tc2;}

			for(var i=0;i<bd.cell.length;i++){ if(this.cell[i]==fordel){ this.cell[i] = keep;} }

			if(k.isOneNumber && bd.QnC(dcc) != -1){ bd.sQnC(dcc, -1); pc.paintCell(dcc);}
		}
	},
	sr0 : function(func, checks, i, areaid){
		if(checks[i]==areaid){ return;}
		checks[i] = areaid;
		if( func(bd.ub(i)) ){ this.sr0(func, checks, bd.up(i), areaid);}
		if( func(bd.db(i)) ){ this.sr0(func, checks, bd.dn(i), areaid);}
		if( func(bd.lb(i)) ){ this.sr0(func, checks, bd.lt(i), areaid);}
		if( func(bd.rb(i)) ){ this.sr0(func, checks, bd.rt(i), areaid);}
		return;
	},

	//--------------------------------------------------------------------------------
	// room.getRoomID()          このオブジェクトで管理しているセルの部屋IDを取得する
	// room.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// room.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// room.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// room.getCntOfRoom()       指定した領域の大きさを抽出する
	//--------------------------------------------------------------------------------
	getRoomID : function(cc){ return this.cell[cc];},
	getTopOfRoomByCell : function(cc){ return this.getTopOfRoom(this.cell[cc]);},
	getTopOfRoom : function(areaid){
		var cc=-1; var cx=k.qcols;
		for(var i=0;i<bd.cell.length;i++){
			if(this.cell[i] == areaid && bd.cell[i].cx < cx){ cc=i; cx = bd.cell[i].cx; }
		}
		return cc;
	},
	getCntOfRoomByCell : function(cc){ return this.getCntOfRoom(this.cell[cc]);},
	getCntOfRoom : function(areaid){
		var cnt=0;
		for(var i=0;i<bd.cell.length;i++){
			if(this.cell[i] == areaid){ cnt++; }
		}
		return cnt;
	}
};
