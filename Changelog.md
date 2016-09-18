
## Version 0.6.0

Release date: 2016/9/18

#### New puzzle

* stostone: Introduce new puzzle: Stostone

#### Improvement

* Config: Add config to paint circles background for yinyang
* hanare: Add singlenum config to allow prural numbers in a room
* shugaku: Add undefcell config to paint background color of unfilled cells
* toichika, hanare: Enable autocmp config
* Graph: Validate 'irowakeblk' config to set and draw color of shaded cell blocks
* variety: Make it enable to use 'cave', 'rome' and 'bossanova' for alias

#### Minor Changes

* moonsun: Set name to 'Moon or Sun' from 'The moon or the sun'
* Graphic: Set the color of lines between border lines and shaded cells brighter
* Graphic: Stop expanding chassis pos to set cells exactly square
* Graphic: Commonize color calculation functions
* Graphic: Separate drawing shaded cell routine from drawBGCells
* Graphic: Separate drawQuesCells from drawShadedCells
* Change project URL to github.com

## Version 0.5.1

Release date: 2016/9/3

#### BugFix

* variety, Answer: Fix spell miss
* yinyang: Set board.disable_subclear true not to show aux. erase button
* Config: Add missing limitation for passallcell config

#### Minor Changes

* arukone: Fix error drawing range and descriptions
* Graphic: Keep lines boldness regardless of irowake config

## Version 0.5.0

Release date: 2016/8/10

#### New puzzle

* moonsun: Introduce new puzzle: The moon and the sun
* arukone: Introduce new puzzle: Arukone
* nondango: Introduce new puzzle: Nondango
* yinyang: Introduce new puzzle: Yin-Yang

#### BugFix

* Opeartion: Prevent trial operation from connecting to previous operation
* usoone, kurochute: Fix aux. mark on numbers can't be inputted when one button input is selected

#### Minor Changes

* Graphic: Integrate some color definitions

## Version 0.4.0

Release date: 2016/8/2

#### BugFix

* Avoid using `Function#bind` on account of iOS 5.1 being lack of supporting
* Operation: Fix `'trial'` event should be called once and pass correct argument number
* Puzzle: Change `this` of listener function from `window` to `puzzle` so as not to refer window object in node.js environment
* Config: Avoid `'foeceallcell'` config to appear other than fillomino

## Version 0.4.0-beta (beta)

Release date: 2016/7/24

#### New puzzle

* usoone: Introduce new puzzle: uso-one

#### Notable change

* puzzle, history: Introduce trial mode

#### Improvement

* parser: `pzpr.parser` now become a function which calls `pzpr.parser.parse` internally
* opemgr: Add puzzle.saved() API to reset modified state
* env: Drop pzpr.env.storage property so as not to ask using local storage on Safari
* Board, Piece: Implement `Board#freezecopy`, `Board#compareData` function

#### BugFix

* lits: Fix tetromino shape misclassfication
* fillomino: Implement `'forceallcell'` config to allow to get completed with empty cells
* pipelink: Fix line under question marks can't be a member of loops
* parser: Append / if URL last charactor is not a-z, A-Z or 0-9 to prevent misdecoding URL
* Operation: Replace mis-referneced `'isbroken'` flag with proper `'broken'` flag
* Operation: Fix error when decoding empty history and wipe out the whole board unexpectedly

#### Breaking changes

* Config: `'color_qanscolor'` config is renamed to `'color_shadecolor'`

#### Minor changes, Refactoring

* Graphic: Tweak some drawing routines
* FileData: Add file encoding/decoding common routines
* pipelink: Merge `loopsp.js` into `pipelink.js` and remove from repo

## Version 0.3.2

Release date: 2016/3/06

#### BugFix

* env: Work properly under Electron envirornment
* util: `pzpr.uti.getpath()` now works correctly when pzpr.js is loaded with ? suffix
* classmgr: Reload files in pzpr-variety dir when updated by adding suffix with version number

## Version 0.3.1

Release date: 2016/3/03

#### BugFix

* Puzzle: Fix illegal handling of option value in outputting image functions
* Config: Ensure `puzzle.validConfig('disptype_yajilin')` returns true only if `puzzle.pid==='yajirin'`


## Version 0.3.0

Release date: 2016/2/28

#### Improvement

* project: Update candle.js to v0.5.0 and remove jsdom dependency
* candle: Update candle.js to v0.6.0, v0.6.1 which suffers extra id attribute from being outputted
* Puzzle: Jpeg quality augument for outputting image is now available
* Puzzle: Allow some of the arguments of outputting image are not given
* Puzzle, Graphic: Make bgcolor and transparency configurable for outputting image
* Config, Graphic: Add `color_bgcolor` to set background color
* Puzzle, Config: Add puzzle.resetConfig() API
* Graphic: Polish drawing arrows with number
* Graphic: Introduce independent error color for icy cells
* yajilin: Give an ability to be a gray-backgdound cell which indicates unused by `disptype_yajilin` config

#### BugFix

* box: Update drawing number routine to avoid numbers are overwritten while previous number remains
* Graphic: Fix background is not drawn when image other than svg is outputted
* shwolf: Ensure images to be outputted on first drawing chance in Goats and Wolves
* Key: Fix unexpected number disappearing when arrow is inputted by keyboard in slalom etc.

#### Refactoring

* Puzzle: Create puzzle sub objects as well when puzzle object is created
* classmgr: Add prototype.pid to each puzzle class when they are generated
* Board: Set infolist only when board instance is created
* Board,Operation: Add some hook functions to init additional object
* Answer: Add checklist to common class so as not to occur an exception before puzzle.open is called
* parser: Move the routine determining proper puzzle genre into pzpr.parser from Encode and FileData class
* Puzzle: Update generating canvas method to be used for subcanvas or outputting images
* Config: Make lrcheck, redblk, redline, redroad volatile
* Graphic: Separate deciding font color from drawing number function
* test: Divide general.js into some scripts based on classes

## Version 0.2.2

Release date: 2016/2/16

#### BugFix

* slalom: Fix miss-calculating gate number
* slalom: Fix tracing line routine cannot trace correctly when it is aware of reverse tracing
* slalom: Correct answer description about circle which doesn't have two lines

## Version 0.2.0

Release date: 2016/2/13

#### Breaking Change

* Puzzle: Add a callback to toBlob() as first augument.

#### Improvement

* nagare: Allow "wind from both side" if there is no line on the unit.

## Version 0.1.0

Release date: 2016/2/11

#### Breaking Change

* pzpr.variety: Make pzpr.variety function and remove some functions. Use `pzpr.variety('puzzle-genre').urlid` or other property instead.
* Puzzle: Replace puzzle.toSVG() with puzzle.toBuffer().

#### BugFix

* pzpr.metadata: Fix setting undefined value to each property unexpectedly

#### Improvement

* Puzzle: puzzle.toDataURL(), tBlob() and toBuffer() now accept 'gif' and 'jpeg' if browser supports.
* Board: Make null objects frozen

## Version 0.0.2

Release date: 2016/2/6

#### BugFix

* Graphic: Fix font face under Android Chrome browser

## Version 0.0.1

Release date: 2016/1/31

Difference from pzprv3-v3.5.2

#### Improvement

* gokigen: Use LineManager for judging Loop and make it enable to give individual color to connected slashes
* dosufuwa: Enable to input balloons and iron balls with drag and set completed area's background color light blue
* Mouse: Release mouse event when mouse button is released even the pointer is out of the canvas

#### Notable change

* Key: Erase number when BackSpace key is asserted instead of replacing question mark
* Answer: Disturb answer check from judging correct if the board is empty by default

#### API, I/F Change (Overall)

* project: Independence pzpr.js from legacy pzprv3.js project
* project: Make it possible to work undef node.js environment
* project: Set Candle object as pzpr's member object
* project: Wipe out work around for IE8 or older
* project: Add UnitTest with mocha
* project: Separate tests folder script and html files into sample folder and test folder
* project: Generate source maps under debug environment
* project: Add prefix for legacy pzprv3 tag
* docs: Update README.md and API description Markdown files

#### API, I/F Change (puzzle object)

* core: Delete pzpr.createPuzzle API
* core, Puzzle: Delete pzpr.PLAYER, EDITOR and integrate to puzzle.playeronly option
* pzpr.event: Change pzpr.addLoadListener API to pzpr.on('load', function) API
* pzpr.variety: Add some aliases able to be used for puzzle.open()
* Puzzle: Add puuzle.on, once, emit as registering and executing listeners
* Puzzle: Fire fail-open event and throw when error is occurred in puzzle.open
* Puzzle: Delete option.imagesave constructor option and create canvas for image save every time
* Puzzle: Delete option.noinput constructor option; option.type should be used
* Puzzle, Config: Add option.config to set initial config value
* Puzzle: Add puzzle.toSVG API because Japanese character cannot be base64 string
* Puzzle: Add puzzle.clone API
* Puzzle: Change puzzle.modechange to puzzle.setMode and make it enable to accept string (play/edit)
* Board: Add puzzle.board.operate API to call puzzle.board.exec.expandreduce instead
* Answer: Set text string in puzzle.check return value and old text([lang]) function to get text([lang])
* Answer: Break as soon as error is detected when puzzle.check(false) is called even If config.multierr is true
* Mouse: Add mouse.inputPath API to input one consecutive line
* Mouse: Change mouse.btn option string
* Key: Add key.inputKeys API to emulate inputting characters
* Encode, parser: Delete outputting PUZ-PRE applet URL
* Encode: Change URL Type value and throwing string when invalid URL Type is inputted
* Encode, FileIO: Create enc, fio instance every time encoding and decoding URL/FileData

#### BugFix

* pzpr.parser: Fix outputting unexpected data when parse, generate is called repeatedly
* Puzzle: Prioritize given value by setCanvasSize before setCanvas is called
* MetaData: Fix each property cannot be empty
* Encode: Fix script error when unexpected long URL is decoded
* kouchoku: Fix script error if canvas is drawn with config.irowake
* kouchoku: Fix script error if puzzle doesn't have canvas
* yajitatami: Fix missing changing arrow direction when board flip/turn operation is executed
* kinkonkan: Fix missing changing numbers out of the board when board flip/turn operation is executed
* tawa: Fix board flip (up-side down) operation is corrupted
* heyawake: Fix parsing Heyawake-Applet URL
* factors: Fix time consumption of answer check in editmode
* mashu: Respect current uramashu mode if uramashu config is changed

#### Refactoring

* pzpr.classmgr: Add board. pid, klass properties under each puzzle object and rename this.owner to this.puzzle
* pzpr.parser: Rename 'id' member value to 'pid'
* Graph: Use Graph theory for controlling line/area information
* LineManager: Move color property from Border to component of LineGraph
* slalom: Delete gateid member object
* Board: Rename qcols, grows member value to cols, rows
* Board: Delete some member object which is indicated the number of Cell, etc on the board (use bd.cell.length instead)
* BoardExec: Integrate expandreduce/turnflip functions
* Graphic: Refactoring canvas initialize routine due to removal of SilverLight
* Key: Modify not storing event object
* Config: Change initialize option for volatile config setting
* Config, fillomino: Change answer check routine and delete config.enbnonum
* Flags: Delete puzzle.flags object and integrate its option into each puzzle sub-objects
