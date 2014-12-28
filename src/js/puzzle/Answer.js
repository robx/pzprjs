// Answer.js v3.4.1

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
AnsCheck:{
	initialize : function(){
		this.inCheck = false;
		this.checkOnly = false;
	},
	failcode : (void 0),
	_info    : (void 0),

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う
	// ans.checkAns()  答えのチェックを行い、エラーコードを返す(nullはNo Error) (オーバーライド用)
	//---------------------------------------------------------------------------
	check : function(activemode){
		var puzzle = this.owner, bd = puzzle.board;
		this.inCheck = true;
		
		if(activemode){
			this.checkOnly = false;
			this.precheck();
			this.failcode = this.checkAns();
			if(!!this.failcode){
				bd.haserror = true;
				puzzle.redraw();
			}
		}
		/* activemodeでなく、前回の判定結果が残っている場合はそれを返します */
		else if(this.failcode===void 0){
			bd.disableSetError();
			this.checkOnly = true;
			this.precheck();
			this.failcode = (this.autocheck1st() || this.checkAns());
			bd.enableSetError();
		}
		
		this.inCheck = false;
		return new puzzle.CheckInfo(this.failcode);
	},
	precheck : function(){ return;},		//オーバーライド用
	checkAns : function(){ return null;},	//オーバーライド用

	//---------------------------------------------------------------------------
	// ans.autocheck1st() autocheckの最初に、軽い正答判定を行う
	// ans.check1st()     autocheckの最初に、軽い正答判定を行う(オーバーライド用)
	//---------------------------------------------------------------------------
	// リンク系は重いので最初に端点を判定する
	autocheck1st : function(){
		var bd = this.owner.board;
		if(bd.lines.enabled && !bd.linfo.enabled){
			if(bd.lines.isCenterLine || bd.lines.borderAsLine){
				if(!this.checkDeadendLine()){ return 'lnDeadEnd';}
			}
		}
		return this.check1st();
	},
	check1st : function(){ return null;},	//オーバーライド用

	//---------------------------------------------------------------------------
	// ans.resetCache() 前回のエラー情報等を破棄する
	//---------------------------------------------------------------------------
	resetCache : function(){
		this.failcode = void 0;
		this._info    = {};
	}
},

//---------------------------------------------------------------------------
// ★CheckInfoクラス ans.checkで返すインスタンスのクラス
//---------------------------------------------------------------------------
CheckInfo:{
	initialize : function(code){
		this.add(code);
	},
	complete : true,
	length : 0,
	
	add : function(code){
		if(!!code){
			Array.prototype.push.call(this, code);
			this.complete = false;
		}
	},
	text : function(lang){
		var code = (this[0] || 'complete');
		lang = lang || this.owner.getConfig('language');
		return this.owner.faillist[code][lang==='ja'?0:1];
	}
},

//---------------------------------------------------------------------------
// ★FailCodeクラス 答えの文字列を扱う
//---------------------------------------------------------------------------
// FailCodeクラス
FailCode:{
	complete : ["正解です！","Complete!"],
	invalid  : ["不明なエラーです","Invalid Error"]
}
});
