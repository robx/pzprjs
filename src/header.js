var pzpr = {};
export default pzpr;

import Candle from 'pzpr-canvas';
pzpr.Candle = Candle;
console.log("hi!", pzpr.Candle);

import {common, custom, classmgr} from './pzpr/classmgr.js';
pzpr.common = common;
pzpr.custom = custom;
pzpr.classmgr = classmgr;

import variety from "./pzpr/variety.js";
pzpr.variety = variety;

