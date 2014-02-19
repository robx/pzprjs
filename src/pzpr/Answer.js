// Answer.js v3.4.0

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
pzpr.createPuzzleClass('AnsCheck',
{
	initialize : function(){
		this.inCheck = false;
		this.checkOnly = false;
	},
	failcode : (void 0),

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う
	// ans.checkAns()  答えのチェックを行い、エラーコードを返す(nullはNo Error) (オーバーライド用)
	//---------------------------------------------------------------------------
	check : function(activemode){
		var o = this.owner, bd = o.board;
		this.inCheck = true;
		
		if(activemode){
			this.checkOnly = false;
			this.failcode = this.checkAns();
			if(!!this.failcode){
				bd.haserror = true;
				o.redraw();
			}
		}
		/* activemodeでなく、前回の判定結果が残っている場合はそれを返します */
		else if(this.failcode===void 0){
			bd.disableSetError();
			this.checkOnly = true;
			this.failcode = (this.autocheck1st() || this.checkAns());
			bd.enableSetError();
		}
		
		this.inCheck = false;
		return this.failcode;
	},
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
				if(!this.checkLineCount(1)){ return 'lnDeadEnd';}
			}
		}
		return this.check1st();
	},
	check1st : function(){ return null;},	//オーバーライド用

	//---------------------------------------------------------------------------
	// ans.resetCache() 前回のエラー情報を破棄する
	//---------------------------------------------------------------------------
	resetCache : function(){ this.failcode = void 0;}
});

//---------------------------------------------------------------------------
// ★FailCodeクラス 答えの文字列を扱う
//---------------------------------------------------------------------------
// FailCodeクラス
pzpr.createPuzzleClass('FailCode',
{
	getStr : function(code){
		if(!code){ code='complete';}
		var lang = (this.owner.getConfig('language')==='ja' ? 0 : 1);
		return this[code][lang];
	},

	complete : ["正解です！","Complete!"],
	invalid  : ["不明なエラーです","Invalid Error"]
});
