// GraphicCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
Graphic:{
	//---------------------------------------------------------------------------
	// pc.drawShadedCells() Cellの、境界線の上から描画される■黒マスをCanvasに書き込む
	// pc.getCellColor()    前景色の設定・描画判定する
	//---------------------------------------------------------------------------
	// err==2になるlitsは、drawBGCellsで描画します
	drawShadedCells : function(){
		var g = this.vinc('cell_front', 'crispEdges', true);

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], color = this.getCellColor(cell);
			
			g.vid = "c_fullb_"+cell.id;
			if(!!color){
				g.fillStyle = color;
				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, this.bw+0.5, this.bh+0.5);
			}
			else{ g.vhide();}
		}
	},
	getCellColor : function(cell){
		var type = this.cellcolor_func || "qans";
		this.getCellColor = (
			(type==="ques") ? this.getCellColor_ques :
			(type==="qnum") ? this.getCellColor_qnum :
			(type==="qans") ? this.getCellColor_qans :
							  function(){ return null;}
		);
		return this.getCellColor(cell);
	},
	getCellColor_ques : function(cell){
		if(cell.ques===1){ return this.quescolor;}
		return null;
	},
	getCellColor_qnum : function(cell){
		if(cell.qnum===-1){ return null;}
		var info = cell.error || cell.qinfo;
		if     (info===0){ return this.quescolor;}
		else if(info===1){ return this.errcolor1;}
		return null;
	},
	getCellColor_qans : function(cell){
		if(cell.qans!==1){ return null;}
		var info = cell.error || cell.qinfo;
		if     (info===0){ return this.qanscolor;}
		else if(info===1){ return this.errcolor1;}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawBGCells()    Cellの、境界線の下に描画される背景色をCanvasに書き込む
	// pc.getBGCellColor() 背景色の設定・描画判定する
	//---------------------------------------------------------------------------
	drawBGCells : function(){
		var g = this.vinc('cell_back', 'crispEdges', true);
		
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], color = this.getBGCellColor(cell);
			
			g.vid = "c_full_"+cell.id;
			if(!!color){
				g.fillStyle = color;
				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, this.bw+0.5, this.bh+0.5);
			}
			else{ g.vhide();}
		}
	},
	getBGCellColor : function(cell){
		var type = this.bgcellcolor_func || "error1";
		this.getBGCellColor = (
			(type==="error1") ? this.getBGCellColor_error1 :
			(type==="error2") ? this.getBGCellColor_error2 :
			(type==="qans1")  ? this.getBGCellColor_qans1 :
			(type==="qans2")  ? this.getBGCellColor_qans2 :
			(type==="qsub1")  ? this.getBGCellColor_qsub1 :
			(type==="qsub2")  ? this.getBGCellColor_qsub2 :
			(type==="qsub3")  ? this.getBGCellColor_qsub3 :
			(type==="icebarn")? this.getBGCellColor_icebarn :
								function(){ return null;}
		);
		return this.getBGCellColor(cell);
	},
	getBGCellColor_error1 : function(cell){
		if(cell.error===1||cell.qinfo===1){ return this.errbcolor1;}
		return null;
	},
	getBGCellColor_error2 : function(cell){
		var info = cell.error || cell.qinfo;
		if     (info===1){ return this.errbcolor1;}
		else if(info===2){ return this.errbcolor2;}
		return null;
	},
	getBGCellColor_qans1 : function(cell){
		var info = cell.error || cell.qinfo;
		if     (cell.qans===1){ return (info===1 ? this.errcolor1 : this.qanscolor);}
		else if(info     ===1){ return this.errbcolor1;}
		else if(info     ===2){ return this.errbcolor2;}
		else if(cell.qsub===1 && this.bcolor!=="white"){ return this.bcolor;}
		return null;
	},
	getBGCellColor_qans2 : function(cell){
		var info = cell.error || cell.qinfo;
		if(cell.qans===1){
			if     (info===0){ return this.qanscolor;}
			else if(info===1){ return this.errcolor1;}
			else if(info===2){ return this.errcolor2;}
		}
		if     (info===1){ return this.errbcolor1;}
		else if(cell.qsub===1 && this.bcolor!=="white"){ return this.bcolor;}
		return null;
	},
	getBGCellColor_qsub1 : function(cell){
		if     (cell.error===1||cell.qinfo===1){ return this.errbcolor1;}
		else if(cell.qsub===1){ return this.bcolor;}
		return null;
	},
	getBGCellColor_qsub2 : function(cell){
		this.bcolor = "silver"; /* 数字入力で背景が消えないようにする応急処置 */
		if     (cell.error===1||cell.qinfo===1){ return this.errbcolor1;}
		else if(cell.qsub===1){ return this.qsubcolor1;}
		else if(cell.qsub===2){ return this.qsubcolor2;}
		return null;
	},
	getBGCellColor_qsub3 : function(cell){
		if     (cell.error===1||cell.qinfo===1){ return this.errbcolor1;}
		else if(cell.qsub===1){ return this.qsubcolor1;}
		else if(cell.qsub===2){ return this.qsubcolor2;}
		else if(cell.qsub===3){ return this.qsubcolor3;}
		return null;
	},
	getBGCellColor_icebarn : function(cell){
		if     (cell.error===1||cell.qinfo===1){ return this.errbcolor1;}
		else if(cell.ques===6){ return this.icecolor;}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawBGEXcells()    EXCellに描画される背景色をCanvasに書き込む
	// pc.getBGEXcellColor() 背景色の設定・描画判定する
	//---------------------------------------------------------------------------
	drawBGEXcells : function(){
		var g = this.vinc('excell_back', 'crispEdges', true);

		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], color = this.getBGEXcellColor(excell);
			
			g.vid = "ex_full_"+excell.id;
			if(!!color){
				g.fillStyle = color;
				g.fillRectCenter(excell.bx*this.bw, excell.by*this.bh, this.bw+0.5, this.bh+0.5);
			}
			else{ g.vhide();}
		}
	},
	getBGEXcellColor : function(excell){
		if(excell.error===1||excell.qinfo===1){ return this.errbcolor1;}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawDotCells()  ・だけをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawDotCells : function(isrect){
		var g = this.vinc('cell_dot', (isrect ? 'crispEdges' : 'auto'), true);
		g.fillStyle = this.dotcolor;

		var dsize = Math.max(this.cw*(isrect?0.075:0.06), 2);
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			
			g.vid = "c_dot_"+cell.id;
			if(cell.qsub===1){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				if(isrect){ g.fillRectCenter(px, py, dsize, dsize);}
				else      { g.fillCircle(px, py, dsize);}
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCellArrows() 矢印だけをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCellArrows : function(){
		var g = this.vinc('cell_arrow', 'auto');

		var ll = this.cw*0.8;				//LineLength
		var lw = Math.max(this.cw/18, 2);	//LineWidth
		var al = ll*0.5, aw = lw*0.5;	// ArrowLength, ArrowWidth
		var tl = ll*0.5-ll*0.3;			// 矢じりの長さの座標(中心-長さ)
		var tw = Math.max(ll*0.2, 5);	// 矢じりの幅

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], dir=(!cell.numberAsObject ? cell.qdir : cell.getNum());
			
			g.vid = "c_arrow_"+cell.id;
			if(dir>=1 && dir<=4){
				g.fillStyle = ((!cell.numberAsObject||cell.qnum!==-1)?this.arrowQuescolor:this.arrowQanscolor);
				g.beginPath();
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				switch(dir){
					case cell.UP: g.setOffsetLinePath(px,py, 0,-al, -tw,-tl, -aw,-tl, -aw, al,  aw, al, aw,-tl,  tw,-tl, true); break;
					case cell.DN: g.setOffsetLinePath(px,py, 0, al, -tw, tl, -aw, tl, -aw,-al,  aw,-al, aw, tl,  tw, tl, true); break;
					case cell.LT: g.setOffsetLinePath(px,py, -al,0, -tl,-tw, -tl,-aw,  al,-aw,  al, aw, -tl,aw, -tl, tw, true); break;
					case cell.RT: g.setOffsetLinePath(px,py,  al,0,  tl,-tw,  tl,-aw, -al,-aw, -al, aw,  tl,aw,  tl, tw, true); break;
				}
				g.fill();
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawSlashes() 斜線をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawSlashes : function(){
		var g = this.vinc('cell_slash', 'auto');

		g.lineWidth = Math.max(this.cw/8, 2);

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var info = cell.error || cell.qinfo;
			if     (info===1){ g.strokeStyle = this.errcolor1;}
			else if(info===2){ g.strokeStyle = this.errcolor2;}
			else             { g.strokeStyle = this.qanscolor;}

			g.vid = "c_slash_"+cell.id;
			if(cell.qans!==0){
				g.beginPath();
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				if     (cell.qans===31){ g.setOffsetLinePath(px,py, -this.bw,-this.bh, this.bw,this.bh, true);}
				else if(cell.qans===32){ g.setOffsetLinePath(px,py, this.bw,-this.bh, -this.bw,this.bh, true);}
				g.stroke();
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbers()  Cellの数字をCanvasに書き込む
	// pc.drawNumber1()  Cellに数字を記入するためdisptext関数を呼び出す
	// pc.getCellNumberColor()  Cellの数字の色を設定する
	// 
	// pc.drawArrowNumbers() Cellの数字と矢印をCanvasに書き込む
	// pc.drawHatenas()     ques===-2の時に？をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawNumbers : function(){
		this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){ this.drawNumber1(clist[i]);}
	},
	drawNumber1 : function(cell){
		var g = this.context;
		var num  = (this.owner.execConfig('dispmove') ? cell.base : cell).getNum();
		g.vid = "cell_text_"+cell.id;
		if(num>=0 || (!this.hideHatena && num===-2)){
			g.fillStyle = this.getCellNumberColor(cell);
			this.disptext((num>=0 ? ""+num : "?"), cell.bx*this.bw, cell.by*this.bh);
		}
		else{ g.vhide();}
	},
	getCellNumberColor : function(cell){
		var color = this.fontcolor, puzzle = this.owner;
		if((cell.ques>=1 && cell.ques<=5) || (cell.qans>=1 && cell.qans<=5)){
			color = this.fontShadecolor;
		}
		else if(cell.error===1 || cell.error===4 || cell.qinfo===1 || cell.qinfo===4){
			color = this.fontErrcolor;
		}
		else if(puzzle.execConfig('dispmove') && puzzle.mouse.mouseCell===cell){
			color = this.movecolor;
		}
		else if(cell.qnum===-1 && cell.anum!==-1){
			color = this.fontAnscolor;
		}
		return color;
	},

	drawArrowNumbers : function(){
		var g = this.vinc('cell_arrownumber', 'auto');

		var ll = this.cw*0.7;				//LineLength
		var ls = (this.cw-ll)/2;			//LineStart
		var lw = Math.max(this.cw/24, 1);	//LineWidth
		var lm = lw/2;						//LineMargin

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell=clist[i], num=cell.qnum, dir=cell.qdir;
			var ax=(cell.bx-1)*this.bw, ay=(cell.by-1)*this.bh;
			var info = cell.error || cell.qinfo;

			if(dir!==cell.NDIR || num>=0 || (!this.hideHatena && num===-2)){
				if     (cell.qans===1){ g.fillStyle = this.fontShadecolor;}
				else if(info===1)     { g.fillStyle = this.fontErrcolor;}
				else                  { g.fillStyle = this.fontcolor;}
			}

			// 矢印の線の描画
			g.vid = "c_ar1_"+cell.id;
			if(dir!==cell.NDIR){
				g.beginPath();
				// 矢印の描画(上下向き)
				if(dir===cell.UP||dir===cell.DN){
					ax+=(this.cw-ls*1.5-lm); ay+=(ls+1);
					g.rect(ax, ay, lw, ll);
					ax+=lw/2;
				}
				// 矢印の描画(左右向き)
				else if(dir===cell.LT||dir===cell.RT){
					ax+=(ls+1); ay+=(ls*1.5-lm);
					g.rect(ax, ay, ll, lw);
					ay+=lw/2;
				}
				g.fill();
			}
			else{ g.vhide();}

			// 矢じりの描画
			g.vid = "c_dt1_"+cell.id;
			if(dir!==cell.NDIR){
				g.beginPath();
				switch(dir){
					case cell.UP: g.setOffsetLinePath(ax,ay,    0,0, -ll/6, ll/3,  ll/6, ll/3, true); break;
					case cell.DN: g.setOffsetLinePath(ax,ay+ll, 0,0, -ll/6,-ll/3,  ll/6,-ll/3, true); break;
					case cell.LT: g.setOffsetLinePath(ax,ay,    0,0,  ll/3,-ll/6,  ll/3, ll/6, true); break;
					case cell.RT: g.setOffsetLinePath(ax+ll,ay, 0,0, -ll/3,-ll/6, -ll/3, ll/6, true); break;
				}
				g.fill();
			}
			else{ g.vhide();}

			// 数字の描画
			g.vid = "cell_arnum_"+cell.id;
			if(num>=0 || (!this.hideHatena && num===-2)){
				var option = {};
				if(dir!==cell.NDIR){ option.globalratio = 0.85 * this.globalfontsizeratio;}

				var px = cell.bx*this.bw, py = cell.by*this.bh;
				if     (dir===cell.UP||dir===cell.DN){ px-=this.cw*0.1;}
				else if(dir===cell.LT||dir===cell.RT){ py+=this.ch*0.1;}

				this.disptext((num>=0 ? ""+num : "?"), px, py, option);
			}
			else{ g.vhide();}
		}
	},
	drawHatenas : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "cell_text_"+cell.id;
			if(cell.ques===-2||cell.qnum===-2){
				g.fillStyle = (cell.error===1||cell.qinfo===1 ? this.fontErrcolor : this.fontcolor);
				this.disptext("?", cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCrosses()    Crossの丸数字をCanvasに書き込む
	// pc.drawCrossMarks() Cross上の黒点をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCrosses : function(){
		var g = this.vinc('cross_base', 'auto', true);

		var csize = this.cw*this.crosssize+1;
		g.lineWidth = 1;

		var option = {ratio:[0.6]};
		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i], px = cross.bx*this.bw, py = cross.by*this.bh;

			// ○の描画
			g.vid = "x_cp_"+cross.id;
			if(cross.qnum!==-1){
				g.fillStyle = (cross.error===1||cross.qinfo===1 ? this.errcolor1 : "white");
				g.strokeStyle = "black";
				g.shapeCircle(px, py, csize);
			}
			else{ g.vhide();}

			// 数字の描画
			g.vid = "cross_text_"+cross.id;
			if(cross.qnum>=0){
				g.fillStyle = this.fontcolor;
				this.disptext(""+cross.qnum, px, py, option);
			}
			else{ g.vhide();}
		}
	},
	drawCrossMarks : function(){
		var g = this.vinc('cross_mark', 'auto', true);

		var csize = this.cw*this.crosssize;
		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			
			g.vid = "x_cm_"+cross.id;
			if(cross.qnum===1){
				g.fillStyle = (cross.error===1||cross.qinfo===1 ? this.errcolor1 : this.quescolor);
				g.fillCircle(cross.bx*this.bw, cross.by*this.bh, csize);
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBorders()        境界線をCanvasに書き込む
	// pc.drawBorders_common() 境界線をCanvasに書き込む(共通処理)
	// pc.getBorderColor()     境界線の設定・描画判定する
	//---------------------------------------------------------------------------
	drawBorders : function(){
		this.vinc('border', 'crispEdges', true);
		this.drawBorders_common("b_bd");
	},
	drawBorders_common : function(header){
		var g = this.context;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], color = this.getBorderColor(border);
			
			g.vid = header+border.id;
			if(!!color){
				var px = border.bx*this.bw, py = border.by*this.bh;
				var lm = (this.lw + this.addlw)/2;
				g.fillStyle = color;
				if(border.isVert()){ g.fillRectCenter(px, py, lm, this.bh+lm);}
				else               { g.fillRectCenter(px, py, this.bw+lm, lm);}
			}
			else{ g.vhide();}
		}
	},

	getBorderColor : function(border){
		var type = this.bordercolor_func || "ques";
		this.getBorderColor = (
			(type==="ques") ? this.getBorderColor_ques :
			(type==="qans") ? this.getBorderColor_qans :
			(type==="ice")  ? this.getBorderColor_ice :
							  function(){ return null;}
		);
		return this.getBorderColor(border);
	},
	getBorderColor_ques : function(border){
		if(border.isBorder()){ return this.borderQuescolor;}
		return null;
	},
	getBorderColor_qans : function(border){
		var err=border.error||border.qinfo;
		if(border.isBorder()){
			if     (err=== 1){ return this.errcolor1;       }
			else if(err===-1){ return this.errborderbgcolor;}
			else             { return this.borderQanscolor; }
		}
		return null;
	},
	getBorderColor_ice : function(border){
		var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
		if(!cell1.isnull && !cell2.isnull && (cell1.ice()^cell2.ice())){
			return this.quescolor;
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawQansBorders()    問題の境界線をCanvasに書き込む
	// pc.drawQuesBorders()    回答の境界線をCanvasに書き込む
	// pc.getQuesBorderColor() 問題の境界線の設定・描画判定する
	// pc.getQansBorderColor() 回答の境界線の設定・描画判定する
	//---------------------------------------------------------------------------
	drawQansBorders : function(){
		this.vinc('border_answer', 'crispEdges', true);
		this.getBorderColor = this.getQansBorderColor;
		this.drawBorders_common("b_bdans");
	},
	drawQuesBorders : function(){
		this.vinc('border_question', 'crispEdges', true);
		this.getBorderColor = this.getQuesBorderColor;
		this.drawBorders_common("b_bdques");
	},

	getQuesBorderColor : function(border){
		if(border.ques===1){ return this.borderQuescolor;}
		return null;
	},
	getQansBorderColor : function(border){
		if(border.qans===1){ return this.borderQanscolor;}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawBorderQsubs() 境界線用の補助記号をCanvasに書き込む
	// pc.drawBoxBorders()  境界線と黒マスの間の線を描画する
	//---------------------------------------------------------------------------
	drawBorderQsubs : function(){
		var g = this.vinc('border_qsub', 'crispEdges', true);
		g.fillStyle = this.borderQsubcolor;

		var m = this.cw*0.15; //Margin
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			
			g.vid = "b_qsub1_" + border.id;
			if(border.qsub===1){
				var px = border.bx*this.bw, py = border.by*this.bh;
				if(border.isHorz()){ g.fillRectCenter(px, py, 0.5, this.bh-m);}
				else               { g.fillRectCenter(px, py, this.bw-m, 0.5);}
			}
			else{ g.vhide();}
		}
	},

	// 外枠がない場合は考慮していません
	drawBoxBorders  : function(tileflag){
		var g = this.vinc('boxborder', 'crispEdges');

		var lm = this.lm;
		var cw = this.cw;
		var ch = this.ch;

		g.strokeStyle = this.bbcolor;
		g.lineWidth = 1;
		
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_bb_"+cell.id;
			if(cell.qans===1){
				var px = (cell.bx-1)*this.bw, py = (cell.by-1)*this.bh;
				var px0 = px-0.5, px1 = px+lm+0.5, px2 = px+cw-lm-0.5, px3 = px+cw+0.5;
				var py0 = py-0.5, py1 = py+lm+0.5, py2 = py+ch-lm-0.5, py3 = py+ch+0.5;
				
				// この関数を呼ぶ場合は全てhasborder===1なので
				// 外枠用の考慮部分を削除しています。
				var adb = cell.adjborder;
				var UPin = (cell.by>2), DNin = (cell.by<2*this.owner.board.qrows-2);
				var LTin = (cell.bx>2), RTin = (cell.bx<2*this.owner.board.qcols-2);

				var isUP = (!UPin || adb.top.ques   ===1);
				var isDN = (!DNin || adb.bottom.ques===1);
				var isLT = (!LTin || adb.left.ques  ===1);
				var isRT = (!RTin || adb.right.ques ===1);

				var isUL = (!UPin || !LTin || cell.relbd(-2,-1).ques===1 || cell.relbd(-1,-2).ques===1);
				var isUR = (!UPin || !RTin || cell.relbd( 2,-1).ques===1 || cell.relbd( 1,-2).ques===1);
				var isDL = (!DNin || !LTin || cell.relbd(-2, 1).ques===1 || cell.relbd(-1, 2).ques===1);
				var isDR = (!DNin || !RTin || cell.relbd( 2, 1).ques===1 || cell.relbd( 1, 2).ques===1);
				
				g.beginPath();
				
				if( isUP || isUL){ g.moveTo(px1, py1);}
				if(!isUP && isUL){ g.lineTo(px1, py0);}
				if(!isUP && isUR){ g.moveTo(px2, py0);}
				if( isUP || isUR){ g.lineTo(px2, py1);}
				
				else if( isRT || isUR){ g.moveTo(px2, py1);}
				if(!isRT && isUR){ g.lineTo(px3, py1);}
				if(!isRT && isDR){ g.moveTo(px3, py2);}
				if( isRT || isDR){ g.lineTo(px2, py2);}
				
				else if( isDN || isDR){ g.moveTo(px2, py2);}
				if(!isDN && isDR){ g.lineTo(px2, py3);}
				if(!isDN && isDL){ g.moveTo(px1, py3);}
				if( isDN || isDL){ g.lineTo(px1, py2);}
				
				else if( isLT || isDL){ g.moveTo(px1, py2);}
				if(!isLT && isDL){ g.lineTo(px0, py2);}
				if(!isLT && isUL){ g.moveTo(px0, py1);}
				if( isLT || isUL){ g.lineTo(px1, py1);}
				
				g.stroke();
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawLines()    回答の線をCanvasに書き込む
	// pc.getLineColor() 描画する線の色を設定する
	//---------------------------------------------------------------------------
	drawLines : function(){
		var g = this.vinc('line', 'crispEdges', true);

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], color = this.getLineColor(border);
			
			g.vid = "b_line_"+border.id;
			if(!!color){
				var px = border.bx*this.bw, py = border.by*this.bh;
				var isvert = (this.owner.board.lines.isCenterLine^border.isVert());
				var lm = this.lm + this.addlw/2;
				
				g.fillStyle = color;
				if(isvert){ g.fillRectCenter(px, py, lm, this.bh+1);}
				else      { g.fillRectCenter(px, py, this.bw+1, lm);}
			}
			else{ g.vhide();}
		}
		this.addlw = 0;
	},
	getLineColor : function(border){
		this.addlw = 0;
		if(border.isLine()){
			var info = border.error || border.qinfo, puzzle = this.owner;
			if(info===1){
				if(this.context.use.canvas){ this.addlw=1;}
				return this.errlinecolor;
			}
			else if(info===-1){ return this.errlinebgcolor;}
			else if(puzzle.execConfig('dispmove')){ return this.movelinecolor;}
			else if(!puzzle.execConfig('irowake') || !border.color){ return this.linecolor;}
			else{ return border.color;}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawTip()    動いたことを示す矢印のやじりを書き込む
	//---------------------------------------------------------------------------
	drawTip : function(){
		var g = this.vinc('cell_linetip', 'auto');

		var tsize = this.cw*0.30;
		var tplus = this.cw*0.05;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], dir=0, border=null;
			if(cell.lcnt===1 && cell.qnum===-1 && !this.owner.execConfig('dispmove')){
				var adb = cell.adjborder;
				if     (adb.top.isLine()   ){ dir=2; border=adb.top;   }
				else if(adb.bottom.isLine()){ dir=1; border=adb.bottom;}
				else if(adb.left.isLine()  ){ dir=4; border=adb.left;  }
				else if(adb.right.isLine() ){ dir=3; border=adb.right; }
			}

			g.vid = "c_tip_"+cell.id;
			if(dir!==0){
				g.lineWidth = this.lw; //LineWidth
				var info = border.error || border.qinfo;
				if     (info=== 1){ g.strokeStyle = this.errlinecolor; g.lineWidth=g.lineWidth+1;}
				else if(info===-1){ g.strokeStyle = this.errlinebgcolor;}
				else              { g.strokeStyle = this.linecolor;}

				g.beginPath();
				var px = cell.bx*this.bw+1, py = cell.by*this.bh+1;
				if     (dir===1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
				else if(dir===2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
				else if(dir===3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
				else if(dir===4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
				g.stroke();
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawPekes()    境界線上の×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawPekes : function(){
		var g = this.vinc('border_peke', 'auto', true);

		var size = this.cw*0.15+1; if(size<4){ size=4;}
		g.lineWidth = 1 + (this.cw/40)|0;
		g.strokeStyle = this.pekecolor;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			g.vid = "b_peke_"+border.id;
			if(border.qsub===2){
				g.strokeCross(border.bx*this.bw, border.by*this.bh, size-1);
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBaseMarks() 交点のdotをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawBaseMarks : function(){
		var g = this.vinc('cross_mark', 'auto', true);
		g.fillStyle = this.quescolor;

		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			g.vid = "x_cm_"+cross.id;
			g.fillCircle(cross.bx*this.bw, cross.by*this.bh, (this.lw*1.2)/2);
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTriangle()   三角形をCanvasに書き込む
	// pc.drawTriangle1()  三角形をCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawTriangle : function(){
		var g = this.vinc('cell_triangle', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], num = (cell.ques!==0?cell.ques:cell.qans);

			g.vid = "c_tri_"+cell.id;
			if(num>=2 && num<=5){
				g.fillStyle = this.getTriangleColor(cell);
				this.drawTriangle1(cell.bx*this.bw,cell.by*this.bh,num);
			}
			else{ g.vhide();}
		}
	},
	getTriangleColor : function(cell){
		return this.quescolor;
	},
	drawTriangle1 : function(px,py,num){
		var g = this.context;
		var mgn = (this.owner.pid==="reflect"?1:0), bw = this.bw+1-mgn, bh = this.bh+1-mgn;
		g.beginPath();
		switch(num){
			case 2: g.setOffsetLinePath(px,py, -bw,-bh, -bw,bh, bw,bh, true); break;
			case 3: g.setOffsetLinePath(px,py,  bw,-bh, -bw,bh, bw,bh, true); break;
			case 4: g.setOffsetLinePath(px,py, -bw,-bh, bw,-bh, bw,bh, true); break;
			case 5: g.setOffsetLinePath(px,py, -bw,-bh, bw,-bh, -bw,bh, true); break;
		}
		g.fill();
	},

	//---------------------------------------------------------------------------
	// pc.drawMBs()    Cell上の○,×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawMBs : function(){
		var g = this.vinc('cell_mb', 'auto', true);
		g.lineWidth = 1;
		g.strokeStyle = this.mbcolor;

		var rsize = this.cw*0.35;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px, py;
			if(cell.qsub>0){ px = cell.bx*this.bw; py = cell.by*this.bh;}

			g.vid = "c_MB1_" + cell.id;
			if(cell.qsub===1){ g.strokeCircle(px, py, rsize);}else{ g.vhide();}

			g.vid = "c_MB2_" + cell.id;
			if(cell.qsub===2){ g.strokeCross(px, py, rsize);}else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCircles()          数字や白丸黒丸等を表すCellの丸を書き込む
	// pc.getCircleStrokeColor() 描画する円の線の色を設定する
	// pc.getCircleFillColor()   描画する円の背景色を設定する
	//---------------------------------------------------------------------------
	drawCircles : function(){
		var g = this.vinc('cell_circle', 'auto', true);

		var ra = this.circleratio;
		var rsize_stroke = this.cw*(ra[0]+ra[1])/2, rsize_fill = this.cw*ra[0];
		
		/* fillとstrokeの間に線を描画するスキマを与える */
		if(this.owner.pid==='loopsp'){ rsize_fill -= this.cw*0.10;}

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			var color = this.getCircleFillColor(cell);
			g.vid = "c_cirb_"+cell.id;
			if(!!color){
				g.fillStyle = color;
				g.fillCircle(cell.bx*this.bw, cell.by*this.bh, rsize_fill);
			}
			else{ g.vhide();}
		}

		g = this.vinc('cell_circle_stroke', 'auto', true);
		g.lineWidth = Math.max(this.cw*(ra[0]-ra[1]), 1);

		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			var color = this.getCircleStrokeColor(cell);
			g.vid = "c_cira_"+cell.id;
			if(!!color){
				g.strokeStyle = color;
				g.strokeCircle(cell.bx*this.bw, cell.by*this.bh, rsize_stroke);
			}
			else{ g.vhide();}
		}
	},

	getCircleStrokeColor : function(cell){
		var type = this.circlestrokecolor_func || "qnum";
		this.getCircleStrokeColor = (
			(type==="qnum")  ? this.getCircleStrokeColor_qnum :
			(type==="qnum2") ? this.getCircleStrokeColor_qnum2 :
								function(){ return null;}
		);
		return this.getCircleStrokeColor(cell);
	},
	getCircleStrokeColor_qnum : function(cell){
		var puzzle = this.owner, error = cell.error || cell.qinfo;
		var isdrawmove = puzzle.execConfig('dispmove');
		var num = (!isdrawmove ? cell : cell.base).qnum;
		if(num!==-1){
			if(isdrawmove && puzzle.mouse.mouseCell===cell){ return this.movecolor;}
			else if(error===1||error===4){ return this.errcolor1;}
			else{ return this.quescolor;}
		}
		return null;
	},
	getCircleStrokeColor_qnum2 : function(cell){
		if(cell.qnum===1){
			return (cell.error===1 ? this.errcolor1 : this.quescolor);
		}
		return null;
	},

	getCircleFillColor : function(cell){
		var type = this.circlefillcolor_func || "qnum";
		this.getCircleFillColor = (
			(type==="qnum")  ? this.getCircleFillColor_qnum :
			(type==="qnum2") ? this.getCircleFillColor_qnum2 :
			(type==="qcmp")  ? this.getCircleFillColor_qcmp :
								function(){ return null;}
		);
		return this.getCircleFillColor(cell);
	},
	getCircleFillColor_qnum : function(cell){
		if(cell.qnum!==-1){
			var error = cell.error || cell.qinfo;
			if(error===1||error===4){ return this.errbcolor1;}
			else{ return this.circledcolor;}
		}
		return null;
	},
	getCircleFillColor_qnum2 : function(cell){
		if(cell.qnum===1){
			return (cell.error===1 ? this.errbcolor1 : "white");
		}
		else if(cell.qnum===2){
			return (cell.error===1 ? this.errcolor1 : this.quescolor);
		}
		return null;
	},
	getCircleFillColor_qcmp : function(cell){
		var puzzle = this.owner, error = cell.error || cell.qinfo;
		var isdrawmove = puzzle.execConfig('dispmove');
		var num = (!isdrawmove ? cell : cell.base).qnum;
		if(num!==-1){
			if     (error===1||error===4)                        { return this.errbcolor1;}
			else if(puzzle.execConfig('autocmp') && cell.isCmp()){ return this.qcmpcolor;}
			else{ return this.circledcolor;}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawDepartures()    移動系パズルで、移動元を示す記号を書き込む
	//---------------------------------------------------------------------------
	drawDepartures : function(){
		var g = this.vinc('cell_depart', 'auto', true);
		g.fillStyle = this.movelinecolor;
		
		var rsize  = this.cw*0.15;
		var isdrawmove = this.owner.execConfig('dispmove');
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_dcir_"+cell.id;
			if(isdrawmove && cell.isDeparture()){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				g.fillCircle(px, py, rsize);
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawLineParts()   ╋などをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawLineParts : function(){
		var g = this.vinc('cell_lineparts', 'crispEdges');
		g.fillStyle = this.borderQuescolor;

		var lm = this.lm, bw = this.bw, bh = this.bh;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], qu = cell.ques;

			g.vid = "c_lp_"+cell.id;
			if(qu>=11 && qu<=17){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				var px0 = px-bw-0.5, px1 = px-lm, px2 = px+lm, px3 = px+bw+0.5;
				var py0 = py-bh-0.5, py1 = py-lm, py2 = py+lm, py3 = py+bh+0.5;

				var flag = {11:15, 12:3, 13:12, 14:9, 15:5, 16:6, 17:10}[qu];
				g.beginPath();
				g.moveTo(px1, py1); if(flag&1){ g.lineTo(px1, py0); g.lineTo(px2, py0);} // top
				g.lineTo(px2, py1); if(flag&8){ g.lineTo(px3, py1); g.lineTo(px3, py2);} // right
				g.lineTo(px2, py2); if(flag&2){ g.lineTo(px2, py3); g.lineTo(px1, py3);} // bottom
				g.lineTo(px1, py2); if(flag&4){ g.lineTo(px0, py2); g.lineTo(px0, py1);} // left
				g.closePath();
				g.fill();
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTateyokos()   縦棒・横棒をCanvasに書き込む
	// pc.getBarColor()     縦棒・横棒の色を取得する
	//---------------------------------------------------------------------------
	drawTateyokos : function(){
		var g = this.vinc('cell_tateyoko', 'crispEdges');
		var lm = Math.max(this.cw/6, 3)/2;	//LineWidth

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px = cell.bx*this.bw, py = cell.by*this.bh;
			var qa=cell.qans;

			g.vid = "c_bar1_"+cell.id;
			if(qa===11 || qa===12){
				g.fillStyle = this.getBarColor(cell,true);
				g.fillRectCenter(px, py, lm+this.addlw/2, this.bh);
			}
			else{ g.vhide();}

			g.vid = "c_bar2_"+cell.id;
			if(qa===11 || qa===13){
				g.fillStyle = this.getBarColor(cell,false);
				g.fillRectCenter(px, py, this.bw, lm+this.addlw/2);
			}
			else{ g.vhide();}
		}
		this.addlw = 0;
	},

	getBarColor : function(cell,vert){
		var err=cell.error, color="";
		this.addlw = 0;
		if(err===1||err===4||((err===5&&vert)||(err===6&&!vert))){ color = this.errlinecolor; this.addlw=1;}
		else if(err!==0){ color = this.errlinebgcolor;}
		else if(!this.owner.execConfig('irowake') || !cell.color){ color = this.linecolor;}
		else{ color = cell.color;}
		return color;
	},

	//---------------------------------------------------------------------------
	// pc.drawQues51()         Ques===51があるようなパズルで、描画関数を呼び出す
	// pc.drawSlash51Cells()   [＼]のナナメ線をCanvasに書き込む
	// pc.drawSlash51EXcells() EXCell上の[＼]のナナメ線をCanvasに書き込む
	// pc.drawEXCellGrid()     EXCell間の境界線をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawQues51 : function(){
		this.drawEXCellGrid();
		this.drawSlash51Cells();
		this.drawSlash51EXcells();
		this.drawTargetTriangle();
	},
	drawSlash51Cells : function(){
		var g = this.vinc('cell_ques51', 'crispEdges', true);

		g.strokeStyle = this.quescolor;
		g.lineWidth = 1;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_slash51_"+cell.id;
			if(cell.ques===51){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				g.strokeLine(px-this.bw,py-this.bh, px+this.bw,py+this.bh);
			}
			else{ g.vhide();}
		}
	},
	drawSlash51EXcells : function(){
		var g = this.vinc('excell_ques51', 'crispEdges', true);

		g.strokeStyle = this.quescolor;
		g.lineWidth = 1;
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], px = excell.bx*this.bw, py = excell.by*this.bh;
			g.vid = "ex_slash51_"+excell.id;
			g.strokeLine(px-this.bw,py-this.bh, px+this.bw,py+this.bh);
		}
	},
	drawEXCellGrid : function(){
		var g = this.vinc('grid_excell', 'crispEdges', true);

		g.fillStyle = this.quescolor;
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i];
			var px = excell.bx*this.bw, py = excell.by*this.bh;

			g.vid = "ex_bdx_"+excell.id;
			if(excell.by===-1 && excell.bx<this.owner.board.maxbx){
				g.fillRectCenter(px+this.bw, py, 0.5, this.bh);
			}
			else{ g.vhide();}

			g.vid = "ex_bdy_"+excell.id;
			if(excell.bx===-1 && excell.by<this.owner.board.maxby){
				g.fillRectCenter(px, py+this.bh, this.bw, 0.5);
			}
			else{ g.vhide();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbersOn51()   [＼]に数字を記入する
	// pc.drawNumbersOn51_1() 1つの[＼]に数字を記入する
	//---------------------------------------------------------------------------
	drawNumbersOn51 : function(){
		this.vinc('cell_number51', 'auto');

		var d = this.range;
		for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
			for(var by=(d.y1|1);by<=d.y2;by+=2){
				var obj = this.owner.board.getobj(bx,by);
				if(!obj.isnull){ this.drawNumbersOn51_1(obj);}
			}
		}
	},
	drawNumbersOn51_1 : function(obj){
		var g = this.context, val, adj, px = obj.bx*this.bw, py = obj.by*this.bh;
		var option = {ratio:[0.45]};
		g.fillStyle = (obj.error===1||obj.qinfo===1 ? this.fontErrcolor : this.fontcolor);

		adj = obj.relcell(2,0);
		val = (obj.ques===51 ? obj.qnum : -1);

		g.vid = [obj.group, obj.id, 'text_ques51_rt'].join('_');
		if(val>=0 && !adj.isnull && adj.ques!==51){
			option.position = this.TOPRIGHT;
			this.disptext(""+val, px, py, option);
		}
		else{ g.vhide();}

		adj = obj.relcell(0,2);
		val = (obj.ques===51 ? obj.qnum2 : -1);

		g.vid = [obj.group, obj.id, 'text_ques51_dn'].join('_');
		if(val>=0 && !adj.isnull && adj.ques!==51){
			option.position = this.BOTTOMLEFT;
			this.disptext(""+val, px, py, option);
		}
		else{ g.vhide();}
	},

	//---------------------------------------------------------------------------
	// pc.drawTarget()  入力対象となる場所を描画する
	// pc.drawCursor()  キーボードからの入力対象をCanvasに書き込む
	// pc.drawTargetTriangle() [＼]のうち入力対象のほうに背景色をつける
	//---------------------------------------------------------------------------
	drawTarget : function(){
		this.drawCursor(true, this.owner.editmode);
	},

	drawCursor : function(islarge,isdraw){
		var g = this.vinc('target_cursor', 'crispEdges');

		var d = this.range, cursor = this.owner.cursor;
		if(cursor.bx < d.x1-1 || d.x2+1 < cursor.bx){ return;}
		if(cursor.by < d.y1-1 || d.y2+1 < cursor.by){ return;}

		var px = cursor.bx*this.bw, py = cursor.by*this.bh, w, size;
		if(islarge!==false){ w = (Math.max(this.cw/16, 2))|0; size = this.bw-0.5;}
		else	           { w = (Math.max(this.cw/24, 1))|0; size = this.bw*0.56;}

		isdraw = (isdraw!==false && this.owner.getConfig('cursor') && !this.outputImage);
		g.fillStyle = (this.owner.editmode ? this.targetColor1 : this.targetColor3);

		g.vid = "ti1_"; if(isdraw){ g.fillRect(px-size,   py-size,   size*2, w);}else{ g.vhide();}
		g.vid = "ti2_"; if(isdraw){ g.fillRect(px-size,   py-size,   w, size*2);}else{ g.vhide();}
		g.vid = "ti3_"; if(isdraw){ g.fillRect(px-size,   py+size-w, size*2, w);}else{ g.vhide();}
		g.vid = "ti4_"; if(isdraw){ g.fillRect(px+size-w, py-size,   w, size*2);}else{ g.vhide();}
	},

	drawTargetTriangle : function(){
		var g = this.vinc('target_triangle', 'auto');

		var d = this.range, cursor = this.owner.cursor;
		if(cursor.bx < d.x1 || d.x2 < cursor.bx){ return;}
		if(cursor.by < d.y1 || d.y2 < cursor.by){ return;}

		var target = cursor.detectTarget(cursor.getobj());

		g.vid = "target_triangle";
		g.fillStyle = this.ttcolor;
		if(this.owner.editmode && target!==0){
			this.drawTriangle1((cursor.bx*this.bw), (cursor.by*this.bh), (target===2?4:2));
		}
		else{ g.vhide();}
	},

	//---------------------------------------------------------------------------
	// pc.drawDashedCenterLines() セルの中心から中心にひかれる点線をCanvasに描画する
	//---------------------------------------------------------------------------
	drawDashedCenterLines : function(){
		var g = this.vinc('centerline', 'crispEdges', true), bd = this.owner.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx+1){ x1=bd.minbx+1;} if(x2>bd.maxbx-1){ x2=bd.maxbx-1;}
		if(y1<bd.minby+1){ y1=bd.minby+1;} if(y2>bd.maxby-1){ y2=bd.maxby-1;}
		x1-=(~x1&1); y1-=(~y1&1); x2+=(~x2&1); y2+=(~y2&1); /* (x1,y1)-(x2,y2)を外側の奇数範囲まで広げる */

		var dotCount = (Math.max(this.cw/(this.cw/10+3), 1)|0);
		var dotSize  = this.cw/(dotCount*2);

		g.lineWidth = 1;
		g.strokeStyle = this.gridcolor;
		for(var i=x1;i<=x2;i+=2){
			var px = i*this.bw, py1 = y1*this.bh, py2 = y2*this.bh;
			g.vid = "cliney_"+i;
			g.strokeDashedLine(px, py1, px, py2, [dotSize]);
		}
		for(var i=y1;i<=y2;i+=2){
			var py = i*this.bh, px1 = x1*this.bw, px2 = x2*this.bw;
			g.vid = "clinex_"+i;
			g.strokeDashedLine(px1, py, px2, py, [dotSize]);
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawGrid()        セルの枠線(実線)をCanvasに書き込む
	// pc.drawDashedGrid()  セルの枠線(点線)をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawGrid : function(haschassis, isdraw){
		var g = this.vinc('grid', 'crispEdges', true), bd = this.owner.board;

		// 外枠まで描画するわけじゃないので、maxbxとか使いません
		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<0){ x1=0;} if(x2>2*bd.qcols){ x2=2*bd.qcols;}
		if(y1<0){ y1=0;} if(y2>2*bd.qrows){ y2=2*bd.qrows;}
		x1-=(x1&1); y1-=(y1&1); /* (x1,y1)を外側の偶数位置に移動する */

		var bs = ((bd.hasborder!==2&&haschassis!==false)?2:0), bw = this.bw, bh = this.bh;
		var xa = Math.max(x1,0+bs), xb = Math.min(x2,2*bd.qcols-bs);
		var ya = Math.max(y1,0+bs), yb = Math.min(y2,2*bd.qrows-bs);

		// isdraw!==false: 指定無しかtrueのときは描画する
		g.lineWidth = 1;
		g.strokeStyle = this.gridcolor;
		for(var i=xa;i<=xb;i+=2){
			g.vid = "bdy_"+i;
			if(isdraw!==false){
				var px = i*bw, py1 = y1*bh, py2 = y2*bh;
				g.strokeLine(px, py1, px, py2);
			}
			else{ g.vhide();}
		}
		for(var i=ya;i<=yb;i+=2){
			g.vid = "bdx_"+i;
			if(isdraw!==false){
				var py = i*bh, px1 = x1*bw, px2 = x2*bw;
				g.strokeLine(px1, py, px2, py);
			}
			else{ g.vhide();}
		}
	},
	drawDashedGrid : function(haschassis){
		var g = this.vinc('grid', 'crispEdges', true), bd = this.owner.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<bd.minby){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}
		x1-=(x1&1); y1-=(y1&1); x2+=(x2&1); y2+=(y2&1); /* (x1,y1)-(x2,y2)を外側の偶数範囲に移動する */

		var dotCount = (Math.max(this.cw/(this.cw/10+3), 1)|0);
		var dotSize  = this.cw/(dotCount*2);

		var bs = ((haschassis!==false)?2:0), bw = this.bw, bh = this.bh;
		var xa = Math.max(x1,bd.minbx+bs), xb = Math.min(x2,bd.maxbx-bs);
		var ya = Math.max(y1,bd.minby+bs), yb = Math.min(y2,bd.maxby-bs);

		g.lineWidth = 1;
		g.strokeStyle = this.gridcolor;
		for(var i=xa;i<=xb;i+=2){
			var px = i*bw, py1 = y1*bh, py2 = y2*bh;
			g.vid = "bdy_"+i;
			g.strokeDashedLine(px, py1, px, py2, [dotSize]);
		}
		for(var i=ya;i<=yb;i+=2){
			var py = i*bh, px1 = x1*bw, px2 = x2*bw;
			g.vid = "bdx_"+i;
			g.strokeDashedLine(px1, py, px2, py, [dotSize]);
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawChassis()     外枠をCanvasに書き込む
	// pc.drawChassis_ex1() bd.hasexcell==1の時の外枠をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawChassis : function(){
		var g = this.vinc('chassis', 'crispEdges', true), bd = this.owner.board;

		// ex===0とex===2で同じ場所に描画するので、maxbxとか使いません
		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<0){ x1=0;} if(x2>2*bd.qcols){ x2=2*bd.qcols;}
		if(y1<0){ y1=0;} if(y2>2*bd.qrows){ y2=2*bd.qrows;}

		var lw = (this.owner.pid!=='bosanowa'?this.lw:1);
		var boardWidth = bd.qcols*this.cw, boardHeight = bd.qrows*this.ch;
		g.fillStyle = "black";
		g.vid = "chs1_"; g.fillRect(-(lw-0.5),       -(lw-0.5), lw, boardHeight+2*lw-2);
		g.vid = "chs2_"; g.fillRect(boardWidth-0.5,  -(lw-0.5), lw, boardHeight+2*lw-2);
		g.vid = "chs3_"; g.fillRect(-(lw-0.5),       -(lw-0.5), boardWidth+2*lw-2, lw);
		g.vid = "chs4_"; g.fillRect(-(lw-0.5), boardHeight-0.5, boardWidth+2*lw-2, lw);
	},
	drawChassis_ex1 : function(boldflag){
		var g = this.vinc('chassis_ex1', 'crispEdges', true), bd = this.owner.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<=0){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<=0){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}

		var lw = this.lw, lm = this.lm;
		var boardWidth = bd.qcols*this.cw, boardHeight = bd.qrows*this.ch;

		// extendcell==1も含んだ外枠の描画
		g.fillStyle = "black";
		g.vid = "chsex1_1_"; g.fillRect(-this.cw-(lw-0.5), -this.ch-(lw-0.5), lw, boardHeight+this.ch+2*lw-2);
		g.vid = "chsex1_2_"; g.fillRect(   boardWidth-0.5, -this.ch-(lw-0.5), lw, boardHeight+this.ch+2*lw-2);
		g.vid = "chsex1_3_"; g.fillRect(-this.cw-(lw-0.5), -this.ch-(lw-0.5), boardWidth+this.cw+2*lw-2, lw);
		g.vid = "chsex1_4_"; g.fillRect(-this.cw-(lw-0.5),   boardHeight-0.5, boardWidth+this.cw+2*lw-2, lw);

		// 通常のセルとextendcell==1の間の描画
		if(boldflag){
			// すべて太線で描画する場合
			g.vid = "chs1_"; g.fillRect(-(lw-0.5), -(lw-0.5), lw, boardHeight+lw-1);
			g.vid = "chs2_"; g.fillRect(-(lw-0.5), -(lw-0.5), boardWidth+lw-1,  lw);
		}
		else{
			// ques==51のセルが隣接している時に細線を描画する場合
			g.vid = "chs1_"; g.fillRect(-0.5, -0.5, 1, boardHeight);
			g.vid = "chs2_"; g.fillRect(-0.5, -0.5, boardWidth, 1);

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], px = (cell.bx-1)*this.bw, py = (cell.by-1)*this.bh;
				
				if(cell.bx===1){
					g.vid = "chs1_sub_"+cell.by;
					if(cell.ques!==51){ g.fillRect(-lm-0.5, py-lm-0.5, lw, this.ch+lw);}else{ g.vhide();}
				}
				
				if(cell.by===1){
					g.vid = "chs2_sub_"+cell.bx;
					if(cell.ques!==51){ g.fillRect(px-lm-0.5, -lm-0.5, this.cw+lw, lw);}else{ g.vhide();}
				}
			}
		}
	}
}
});
