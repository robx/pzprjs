import pzpr from './pzpr/core.js';
export default pzpr;

import Candle from 'pzpr-canvas';
pzpr.Candle = Candle;

import {env, lang} from "./pzpr/env.js";
pzpr.env = env;
import './pzpr/event.js';
pzpr.lang = lang;
import {common, custom, classmgr} from './pzpr/classmgr.js';
pzpr.common = common;
pzpr.custom = custom;
pzpr.classmgr = classmgr;
import variety from "./pzpr/variety.js";
pzpr.variety = variety;
import Parser from "./pzpr/parser.js";
pzpr.parser = Parser;
import util from "./pzpr/util.js";
pzpr.util = util;

import Puzzle from "./puzzle/Puzzle.js";
pzpr.Puzzle = Puzzle;
import "./puzzle/Config.js"; // modifies Puzzle
import "./puzzle/Address.js";
import "./puzzle/Piece.js";
import "./puzzle/PieceList.js";
import "./puzzle/Board.js";
import "./puzzle/BoardExec.js";
import "./puzzle/GraphBase.js";
import "./puzzle/LineManager.js";
import "./puzzle/AreaManager.js";
import "./puzzle/Graphic.js";
import "./puzzle/MouseInput.js";
import "./puzzle/KeyInput.js";
import "./puzzle/Encode.js";
import "./puzzle/FileData.js";
import "./puzzle/Answer.js";
import "./puzzle/Operation.js";
import "./variety-common/Graphic.js";
import "./variety-common/KeyInput.js";
import "./variety-common/MouseInput.js";
import "./variety-common/Answer.js";
import "./variety-common/BoardExec.js";
import "./variety-common/Encode.js";
import "./variety-common/FileData.js";
