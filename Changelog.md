#### New puzzle

* dbchoco: Introduce new puzzle: Double Chocolate (due to Lennard Sprong)
* geradeweg: Introduce new puzzle: Geradeweg
* heteromino: Introduce new puzzle: Heteromino
* pencils: Introduce new puzzle: Pencils (due to Lennard Sprong)
* yajilin-regions: Introduce new puzzle: Regional Yajilin

#### Improvement

* amibo, mashu, starbattle: Reword English error messages
* cbblock: Add error for dead-end walls
* heyawake: Don't autocheck until the grid is fully decided
* slither: Allow 4 as clue number
* starbattle: Input dots in auto-mode; change style of empty cells;
  hide redundant dots
* Change default value of "shade undefined cells" back to `true`
* Change unshaded cells without changing shaded cells in checkerboard
  puzzles with right mouse button (Hitori, Heyawake, Yajilin, etc.)

#### BugFix

* amibo, usotatami: Allow encoding multi-digit clues
* cbblock: Fix wrong error during edit
* fourcells, fivecells: No borders and connection lines between empty cells
* heteromino: Don't compare shapes of non-triminos
* kinkonkan: Fix answer check for large clues
* nagare: Allow cross input mode to remove aux marks
* nawabari: Fix answer check for border clues
* nawabari: Correct English translation
* nurimisaki: Switch to unshaded cell connection info for edit mode, too
* Fix interaction of "Clear Answer" and trial mode

## Version 0.11.1

Release date: 2019/04/22

#### Improvement

* bag, meander, scrin: Complete Japanese translation
* loopsp: Less ugly loop ends at clue cells
* nurimisaki: When undefined cells are grayed, leave the unshaded cells white
* yajilin: Various input fixes
* yajilin: Give an error when a number has no arrow
* yajilin: Limit clue value based on grid size

#### BugFix

* nurimisaki: Fix one-button input mode to unshade
* scrin: Disallow inner rectangle

## Version 0.11.0

Release date: 2019/4/17

#### New puzzle

* angleloop: Introduce new puzzle: Angle Loop
* doubleback: Introduce new puzzle: Double Back
* heyawacky: Introduce new puzzle: Heyawacky
* meander: Introduce new puzzle: Meandering Numbers
* nurimisaki: Introduce new puzzle: Nurimisaki
* satogaeri: Introduce new puzzle: Satogaeri (due to Lennard Sprong)
* scrin: Introduce new puzzle: Scrin

#### Improvement

* Export: Support https URLs
* Language: Rework some English language messages
* bag: Rework as shading puzzle
* fillomino: Automatically draw borders between different numbers
* yajilin: Allow clues to be marked complete
* yajilin: Autocompletion for clues

#### BugFix

* LineManager: Fix connection logic and colouring for pipelink, ringring etc.
* nurimaze: Fix broken cleared clue cells afer random key input
* tentaisho: Fix false error when placing star after drawing border in edit mode
* fivecells: Fix encoding/decoding of missing cells

## Version 0.10.0

Release date: 2017/7/29

#### New puzzle

* armyants: Introduce new puzzle: Army Ants
* walllogic: Introduce new puzzle: Wall Logic

#### Improvement

* Config: Enable set autocmp and autoerr config indivisually by puzzle genre
* akari: Add autocmp config to toggle painting light
* lits: Enable autocmp config to indicate four consective shaded cells in the room
* country, nagenawa: Enable to input cross marks
* slither, bag, mejilink: Set canvas margin wider
* stostone: Change the shape of unshaded cell dots

#### BugFix

* Encode: Fix misdecoding large number more than five digits
* LineManager: Fix regenerating line information when paths are separated
* LineManager: Fix adding or eraseing number misses regenerating line information
* fillomino: Prevent copying answer number onto question number
* slalom: Fix gate number trace routine occasionally misses proper order
* Update pzpr-canvas.js to v0.8.2 to avoid rendering bug of IE and Edge
* Graphic: Avoid SVG textLength and textAlign rendering bug of IE and Edge
* Graphic: Fix illegal rendering of indicator when graphic is canvas mode
* Graphic: Erase border on the edge when graphic is canvas mode

## Version 0.9.1

Release data: 2017/4/21

#### BugFix

* lib: Update pzpr-canvas to v0.8.1 to avoid error on Opera 12

## Version 0.9.0

Release data: 2017/4/20

#### Improvement

* dosufuwa: Add shade input mode

#### BugFix

* variety: Fix "Goats and Wolves" name
* Mouse: Fix circle-unshade and circle-shade input mode
* Mouse: Merge dot input mode into objblank
* bonsan, yosenabe: Fix completion inputting routine to ensure redraw circles

## Version 0.9.0-beta2

Release data: 2017/4/16

#### Breaking Change

* Config: autocmp_area is integrated with autocmp again. Please check `puzzle.painter.autocmp` for disambiguating autocmp type.

#### Improvement

* Config: Change default setting of autocmp to true

## Version 0.9.0-beta1

Release data: 2017/4/14

#### Breaking Change

* Configs: redline, redblk, redroad configs are removed. Use `puzzle.mouse.setInputMode()` instead.

#### Improvement

* Graphic: Use narrow font for two or more length text instead of small size font
* Cell: Expand max number from 255 up to 999
* Mouse: Enable pinch-zoom for Android Chrome
* Mouse: Add various common input modes
* Mouse: Integrate dispRed routine into common input mode
* Mouse: Add mouse.setInversion method to invert mouse button
* Puzzle: Introduce 'mode' event when entering edit or play mode or after puzzle getting ready
* CellList: Prevent cross marks from erasing on subclear for usoone
* icebarn: Enable to input dir. aux. marks
* kakuru: Change display type to original Sapporo-nikolist style

#### BugFix

* util: Listen both touch and mouse event for user agents supporting touch event
* util: Surpress plural finger tap from inputting the board
* util: Fix mouse button detection when Pointer Event is triggered
* Operation: Add ansclear history to ensure regenerate graph info

#### Minor Changes

* Graphic: Separate number drawing method into for question and answer
* docs: Add InputModes.md
* package: Use pzpr-canvas on npmjs.org instead of local file
* package: Move in-publish on to devDependencies

## Version 0.8.1

Release date: 2017/2/13

#### BugFix

* akari: Prevent from erasing background color for Akari
* kinkonkan: Fix outputted file data is wrong for Opera 12.17

## Version 0.8.0

Release date: 2017/2/8

#### Improvement

* Mouse: Add an augument for getInputModeList function

#### BugFix

* Mouse: Enable to input sub numbers on aux. marks by mouse for the genre View
* slalom: Regenerate gate number when the numbers or arrows are changed

## Version 0.8.0-beta2 (beta)

Release date: 2017/1/9

#### New puzzle

* easyasabc: Introduce new puzzle: Easy as ABC
* starbattle: Introduce new puzzle: Star Battle
* kropki: Introduce new puzzle: Kropki
* building: Introduce new puzzle: Skyscrapers

#### BugFix

* kinkonkan: Suppress painting background without sight error
* Piece: Enable to clear sub numbers by ansclear or so

#### Minor Changes

* Board: Remove corner EXCells
* Cursor: Commonize some methods with Skyscrapers and Easy as ABC

## Version 0.8.0-beta1 (beta)

Release date: 2016/12/31

#### Notable change

* Board: Enable to input sub numbers

#### Improvement

* bosanowa: Enable to erase circles by BS or space key
* gokigen: Enable to input diagonal lines by mouse drag
* norinori: Stop inputting shaded cells if a mouse drag sequence puts two cells
* Mouse: Introduce setInputMode and getInputModeList method for smart devices to input icebarn etc.

#### Breaking changes

* Config: Separate autocmp_area from autocmp config for painting background genres (Currently autocmp can be still used)
* Config: Get rid of lrcheck config

## Version 0.7.1

Release date: 2016/12/3

#### BugFix

* LineManager: Fix modified line could not reculcurate loop info for gokigen
* onsen: Add checking isolated circles for answer check

#### Minor Changes

* Install in-publish to stop working prepublish hook for npm 4 or earlier

## Version 0.7.0

Release date: 2016/10/10

#### New puzzle

* onsen: Introduce new puzzle: Onsen-meguri

#### Improvement

* variety: Add pzpr.genre as an alias of pzpr.variety
* moonsun: Enable to input cross marks by smartphone or tablet
* shugaku: Add an ability to input shaded cells by tap
* kakuru: Enable to input shaded cells by tap
* hakoiri: Enable to drag dots
* hebi: Make it possible to drag dots
* tatamibari: Enable to input question marks as amibo manner
* amibo: Enable to input aux. marks by tap
* bag: Make it possible to input background color regardless of bgcolor config
* tilepaint: Make it possible to input shaded cells if config.use is 2
* Graph: Add coloring property that indicates if the graph generates individual color
* AreaGraph: Prevent attaching if node has been valid before modifying info
* AreaGraph: Stop searching components unless necessary
* LineGraph: Avoid searching components when path end is attached or detached
* Graph: Prevent room info regeneration if border line does not really divide rooms

#### BugFix

* BoardExec: Prevent errors when board.exec.execadjust is called with invalid type
* Puzzle: Fix setCanvasSize before puzzle.open() doesn't work

#### Minor Changes

* Puzzle: Copy contents of init option data to avoid unexpected init option change
* Puzzle: Hide cursor if puzzle instance type is viewer
* Graphic: Change default dot color to green from black
* variety: Change some puzzle name
* stostone: Cache calculated fallen blocks position
* stostone: Stop drawing number behind fallen blocks
* stostone: Fix board.newIrowake() occurs an error
* slither, bag: Intergate bag script into slitherlink
* hebi: Change script name to hebi.js from snakes.js
* Graph: Make AreaNumBlockGraph of fillomino inherit AreaNumberGraph instead of AreaRoomGraph
* Graph: Move setting info by node, edge obj to LineGraph or AreaGraphBase
* Graph: Move calling remakeComponent to common modifyInfo method
* Graph: Set pointgroup = cross automatically if genre's board.borderAsLine is true
* Graph: Add GraphComponent::checkAutoCmp
* Graph: Integrate calling graph info updating methods
* Graph: Change when the number of lines linked to the cell is counted
* Graph: Separate initializing ltotal, lcnt method

## Version 0.6.1

Release date: 2016/9/18

#### BugFix

* stostone: Tweak puzzle genre name
* stostone: Divide blocks by border lines
* stostone: Modify error descriptions and test problem
* stostone: Prevent borderline from being drawn when blocks are moving
* stostone: Set separation lines thinner when blocks are moving
* stostone: Fix the shape of the blocks when they are moving
* shimaguni, stostone: Use common routine with lits to reduce code size
* shimaguni, stostone: Use stone property instead of sblk for disambiguation
* norinori: Prevent generating unused graph object
* yinyang: Fix shaded circle is drawn gray when dispqnumbg config is true

#### Minor Changes

* KeyInput: Add keyDispInfo function to show some information
* slalom: Implement show/hidegatenumber operation into board object

## Version 0.6.0

Release date: 2016/9/18

#### New puzzle

* stostone: Introduce new puzzle: Stostone

#### Improvement

* Config: Add config to paint circles background for yinyang
* hanare: Add singlenum config to allow plural numbers in a room
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
