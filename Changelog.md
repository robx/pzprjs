
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
