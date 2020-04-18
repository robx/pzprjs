var pzpr = {
	version: "<%= git.hash %>"
};
export default pzpr;
 
import Candle from 'pzpr-canvas';
pzpr.Candle = Candle;

//eslint-disable-next-line no-unused-vars
var document      = this.document      || pzpr.Candle.document;
//eslint-disable-next-line no-unused-vars
var DOMParser     = this.DOMParser     || pzpr.Candle.DOMParser;
//eslint-disable-next-line no-unused-vars
var XMLSerializer = this.XMLSerializer || pzpr.Candle.XMLSerializer;
