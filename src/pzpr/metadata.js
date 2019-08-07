// metadata.js v3.5.2

//---------------------------------------------------------------------------
//  MetaData構造体  作者やコメントなどの情報を保持する
//---------------------------------------------------------------------------
pzpr.MetaData = function(){};
pzpr.MetaData.prototype =
{
	author  : '',
	source  : '',
	hard    : '',
	comment : '',
	items : {author:'',source:'',hard:'',comment:''},

	update : function(metadata){
		if(!metadata){ return;}
		for(var i in this.items){ if(typeof metadata[i]==='string'){ this[i] = metadata[i];}}
	},
	getvaliddata : function(){
		var obj = {};
		for(var i in this.items){ if(!!this[i]){ obj[i] = this[i];}}
		return obj;
	},
	reset : function(){
		for(var i in this.items){ this[i] = '';}
	},
	empty : function(){
		for(var i in this.items){ if(!!this[i]){ return false;}}
		return true;
	}
};
