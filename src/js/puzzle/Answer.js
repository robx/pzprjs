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
		
		this.makeCheckList();
	},
	failcode : (void 0),
	_info    : (void 0),

	//---------------------------------------------------------------------------
	// ans.makeCheckList() 最初にchecklistの配列を生成する
	//---------------------------------------------------------------------------
	makeCheckList : function(){
		if(!this.checklist){ return;}

		/* 当該パズルで使用しないchecklistのアイテムをフィルタリング */
		var checklist = this.checklist, order = [];
		for(var i=0;i<checklist.length;i++){
			var item = checklist[i];
			if(!item[2] || pzpr.util.checkpid(item[2], this.owner.pid)){
				item[3] = item[3] || 0;
				order.push(item);
			}
		}
		this.checklist_normal = Array.prototype.concat.call([], order);

		/* autocheck用のエラーをソートする */
		this.checklist_auto = order.sort(function(a,b){ return b[3] - a[3];});
	},

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う
	// ans.checkAns()  答えのチェックを行い、エラーコードを返す(nullはNo Error)
	//---------------------------------------------------------------------------
	check : function(activemode, multierr){
		var puzzle = this.owner, bd = puzzle.board;
		this.inCheck = true;
		
		if(activemode){
			this.checkOnly = false;
			this.failcode = this.checkAns(multierr);
			if(!!this.failcode){
				bd.haserror = true;
				puzzle.redraw();
			}
		}
		/* activemodeでなく、前回の判定結果が残っている場合はそれを返します */
		else if(this.failcode===void 0){
			bd.disableSetError();
			this.checkOnly = true;
			this.failcode = this.checkAns(false);
			bd.enableSetError();
		}
		
		this.inCheck = false;
		return new puzzle.CheckInfo(this.failcode);
	},
	checkAns : function(multierr){
		this.failcode = [];
		var checklist = (this.checkOnly ? this.checklist_auto : this.checklist_normal);
		var errcount = 0;
		for(var i=0;i<checklist.length;i++){
			var item = checklist[i], result = this[item[0]]();
			if(result===false){
				if(this.failcode[this.failcode.length-1]!==item[1]){ this.failcode.push(item[1]);}
			}
			else if(errcount<this.failcode.length){
				result = false;
			}
			errcount = this.failcode.length;
			if(!multierr && result===false){ break;}
		}
		return (errcount>0 ? this.failcode : null);
	},

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
		if(!!code){
			if(code instanceof Array){ Array.prototype.push.apply(this, code);}
			else{ Array.prototype.push.call(this, code);}
			this.complete = false;
		}
	},
	complete : true,
	length : 0,
	
	text : function(lang){
		var puzzle = this.owner, texts = [];
		var langcode = ((lang || puzzle.getConfig('language'))==="ja"?0:1);
		if(this.length===0){ return puzzle.faillist.complete[langcode];}
		for(var i=0;i<this.length;i++){
			texts.push(puzzle.faillist[this[i]][langcode]);
		}
		return texts.join("\n");
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
