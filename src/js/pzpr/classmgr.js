// classmgr.js v3.4.0

(function(){

//----------------------------------------------------------------------------
// ★pzpr.classmgrオブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
pzpr.classmgr = {
	//---------------------------------------------------------------
	// 共通クラス・パズル別クラスに継承させる親クラスを生成する
	//---------------------------------------------------------------
	createPuzzleClass : function(classname, proto){
		var rel = _createClass(classname, proto);
		pzpr.common[rel.name] = rel.body;
	},
	extendPuzzleClass : function(classname, proto){
		for(var name in proto){ pzpr.common[classname].prototype[name] = proto[name];}
	},

	//---------------------------------------------------------------
	// 単体ファイルの読み込み
	// idを取得して、ファイルを読み込み
	//---------------------------------------------------------------
	includeCustomFile : function(pid){
		if(!!pzpr.custom[pid] || !!this.includedFile[pid]){ return;}
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = pzpr.util.getpath()+"../js/variety/"+pzpr.variety.toScript(pid)+".js";
		document.body.appendChild(_script);
		this.includedFile[pid] = true;
	},
	includedFile : {},

	//---------------------------------------------------------------
	// includeCustomFileでファイルを読み込んだ後の処理
	//---------------------------------------------------------------
	createCustoms : function(scriptid, custombase){
		var pidlist = pzpr.variety.PIDlist(scriptid);
		for(var i=0;i<pidlist.length;i++){
			var pid=pidlist[i], customclass=_PIDfilter(pid, custombase);
			this.createCustomSingle(pid, customclass);
		}
	},

	createCustomSingle : function(pid, customclass){
		// 追加があるクラス => 残りの共通クラスの順に継承
		var custom = {};
		for(var classname in customclass){
			var proto = customclass[classname];

			if(!custom[classname]){
				if(!!pzpr.common[classname]){ classname = classname+":"+classname;}

				var rel = _createClass(classname, proto);
				custom[rel.name] = rel.body;
			}
			else{
				for(var name in proto){ custom[classname].prototype[name] = proto[name];}
			}
		}
		for(var classname in pzpr.common){
			if(!custom[classname]){
				custom[classname] = pzpr.common[classname];
			}
		}
		for(var classname in pzpr.common){
			if(!!pzpr.common[classname]){
				custom[classname].prototype.Common = pzpr.common[classname];
			}
		}

		pzpr.custom[pid] = custom;
	},

	//---------------------------------------------------------------------------
	// 新しくパズルのファイルを開く時の処理
	//---------------------------------------------------------------------------
	setPuzzleClass : function(puzzle, newpid, callback){
		/* 今のパズルと別idの時 */
		if(puzzle.pid != newpid){
			this.includeCustomFile(newpid);
		}
		/* Customファイルが読み込みできるまで待つ */
		if(!pzpr.custom[newpid]){
			setTimeout(function(){ pzpr.classmgr.setPuzzleClass(puzzle,newpid,callback);},10);
			return;
		}

		if(puzzle.pid != newpid){
			/* 各クラスをpzpr.customから設定する */
			this.setClasses(puzzle, newpid);
			puzzle.pid = newpid;
		}
		
		callback();
	},

	//---------------------------------------------------------------
	// パズル種類別のクラスをパズルのクラス一覧に設定する
	//  共通クラス
	//   -> パズル種類別クラス (this.Commonがつく)
	//   -> パズルが保持するクラス (initialize()の呼び出しやthis.owner等がつく)
	// と、ちょっとずつ変わっている状態になります
	//---------------------------------------------------------------
	setClasses : function(puzzle, pid){
		/* 現在のクラスを消去する */
		for(var name in puzzle.classlist){
			puzzle[name] = null; delete puzzle[name];
		}
		puzzle.classlist = [];

		var custom = pzpr.custom[pid];
		for(var classname in custom){
			var base = custom[classname];
			var cls = function(){
				var args = Array.prototype.slice.apply(arguments);
				if(!!this.initialize){ this.initialize.apply(this,args);}
			}
			for(var name in base.prototype){ cls.prototype[name] = base.prototype[name];}
			cls.prototype.owner = puzzle;
			puzzle[classname] = cls;
			puzzle.classlist.push(classname);
		}
	}
};

function _createClass(classname, proto){
	classname = classname.replace(/\s+/g,'');
	var colon = classname.indexOf(':'), basename = '';
	if(colon>=0){
		basename  = classname.substr(colon+1);
		classname = classname.substr(0,colon);
	}

	var NewClass = function(){};
	if(!!basename && !!pzpr.common[basename]){
		var BaseClass = pzpr.common[basename];
		for(var name in BaseClass.prototype){
			NewClass.prototype[name] = BaseClass.prototype[name];
		}
	}
	for(var name in proto){ NewClass.prototype[name] = proto[name];}
	NewClass.prototype.constructor = NewClass;
	return {body:NewClass, name:classname};
}

function _PIDfilter(pid, custombase){
	var customclass = {};
	for(var hashkey in custombase){
		var name = hashkey, pidcond = [], isexist = false;
		if(hashkey.match('@')){
			pidcond = hashkey.substr(hashkey.indexOf('@')+1).split(/,/);
			name    = hashkey.substr(0,hashkey.indexOf('@'));
			for(var n=0;n<pidcond.length;n++){ if(pidcond[n]===pid){ isexist=true; break;}}
			if(!isexist){ name = '';}
		}
		if(!!name){
			var proto = custombase[hashkey];
			if(!customclass[name]){ customclass[name]={};}
			for(var key in proto){ customclass[name][key] = proto[key];}
		}
	}
	return customclass
}

})();