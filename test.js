
//import pzpr from './src/pzpr/core';

let pzpr;
require(['./src/pzpr/core'], (a) => { pzpr = a;});

export default {
  version : pzpr.version,
  a : 1,
  b : 2,
}
