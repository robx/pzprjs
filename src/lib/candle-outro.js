// candle-outro.js

})(module,exports);

pzpr.Candle = module.exports;

})();

//---------------------------------------------------------------------------
// node.js環境向けの対策
//---------------------------------------------------------------------------
/* jshint ignore:start */
var DOMParser     = this.DOMParser     || pzpr.Candle.MockDOMParser;
var XMLSerializer = this.XMLSerializer || pzpr.Candle.MockXMLSerializer;
/* jshint ignore:end */
