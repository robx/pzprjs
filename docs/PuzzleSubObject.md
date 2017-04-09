# Sub-Objects of puzzle object

## puzzle.board:Board

This sub-object contains board model data.

### Methods

* `puzzle.board.operate([operation])` Execute the size of the board expanding, reducing or flipping or turning the board.
    * `operation==='flipy'` Flip the board up-size down.
    * `operation==='flipx'` Flip the board left-size right.
    * `operation==='turnr'` Turn right the board by 90 degree.
    * `operation==='turnl'` Turn left the board by 90 degree.
    * `operation==='expand(up|dn|lt|rt)'` Expand the board by a row.
    * `operation==='reduce(up|dn|lt|rt)'` Reduce the board by a row.
    * These two below operations are for 'Slalom' only.
        * `operation==='showgatenumber'` Show numbers on gates.
        * `operation==='hidegatenumber'` Reset `'showgatenumber'` effect.
    * These three below operations are for 'Stostone' only.
        * `operation==='drop'` Drop all blocks and display them.
        * `operation==='raise'` Raise all blocks and display them.
        * `operation==='resetpos'` Reset the blocks position.
* `puzzle.board.getc(bx,by)` Returns the `Cell` object at the coordinate `(bx,by)`.
* `puzzle.board.getb(bx,by)` Returns the `Border` object at the coordinate `(bx,by)`.
* `puzzle.board.getx(bx,by)` Returns the `Cross` object at the coordinate `(bx,by)`.
* `puzzle.board.getex(bx,by)` Returns the `Excell` object at the coordinate `(bx,by)`.

## puzzle.mouse:MouseInput

This sub-obejct handles mouse or touch event.

### Methods

* `puzzle.mouse.inputPath([button,]bx,by,...)` Input consequent mouse input path.
* `puzzle.mouse.moveTo(bx,by)` Set the mouse position and emulate mousedown/touchstart event.
* `puzzle.mouse.lineTo(bx,by)` Move the mouse position incrementally and emulate mousemove/touchmove event.
* `puzzle.mouse.inputEnd()` Emulate mouseup/touchend event.
* `puzzle.mouse.setInversion(input)` Invert mouse button or enable right button for touch event
* `puzzle.mouse.setInputMode(mode)` Set current inputMode to input specific marks (e.g. icebarn, waterhazard, etc.)
* `puzzle.mouse.getInputModeList([type])` Return an array of valid inputModes. If type (edit or play) is given, it will return the list in the given mode.
    * Values for both question mode and answer mode
        * `inputMode==='auto'` Initial value
        * `inputMode==='number'` Input numbers on the board
        * `inputMode==='number-'` Input numbers on the board which is decremented by click or tap
        * `inputMode==='border'` Input border lines
        * `inputMode==='arrow'` Input arrows
        * `inputMode==='mark-circle', 'mark-triangle', 'mark-rect'` Input marks for `'Hakoiri-masahi'`
    * Values for question mode
        * `inputMode==='direc'` Input direction or arrows of the number
        * `inputMode==='circle-unshade'` Input unshaded circles
        * `inputMode==='circle-shade'` Input shaded circles
        * `inputMode==='undef'` Input undefined numbers which are usually drawn as question marks
        * `inputMode==='crossdot'` Input dots on the corner of cells
        * `inputMode==='circle'` Input circles for `Nurimaze`, `Loute` and `Nondango`
        * `inputMode==='triangle'` Input triangles for `Nurimaze`
        * `inputMode==='empty'` Toggle on board and out of board cells for `Five cells` and or so
        * `inputMode==='shade'` Toggle shaded and unshaded cells for `Tatebo-Yokobo` and `Nagareru-loop`
        * `inputMode==='ice'` Input icebarns for `Icebarn`, `Barns` and or so
        * `inputMode==='water'` Input water hazard cells for `Herugolf`
        * `inputMode==='nabe'` Input crocks for `Yosenabe`
        * `inputMode==='bgpaint'` Input background for picture for `Tentaisho` or `Tile paint`
        * `inputMode==='goat', 'wolf'` Input goats or wolves for `Goats and Wolves`
        * `inputMode==='moon', 'sun'` Input moon marks or sun marks for `Moon or Sun`
        * `inputMode==='letter', 'letter-'` Input letters on the board for `'Kinkonkan'`
        * `inputMode==='quesmark', 'quesmark-'` Input marks for question for `Reflect link` and `Pipelink`
        * `inputMode==='ineq'` Input signs of inequality for `'Minarism'`
    * Values for answer mode
        * `inputMode==='shade'` Input shaded cells
        * `inputMode==='unshade'` Input unshaded cells
        * `inputMode==='line'` Input lines
        * `inputMode==='peke'` Input cross marks which means lines don't pass
        * `inputMode==='bar'` Input vertical or/and horizonal lines
        * `inputMode==='subline'` Input auxiliary lines between cells
        * `inputMode==='numexist'` Input auxiliary circles which will be put some number
        * `inputMode==='numblank'` Input auxiliary cross marks that means they should remain blank
        * `inputMode==='subcircle'` Input auxiliary circles that indicates some line will pass or true number
        * `inputMode==='subcross'` Input auxiliary cross marks that means they should remain blank or liar number
        * `inputMode==='dot'` Input auxiliary dots that means they should remain blank
        * `inputMode==='bgcolor', 'bgcolor1' or 'bgcolor2'` Input background color of cells
        * `inputMode==='completion'` Input completion gray color
        * `inputMode==='clear'` Clear answer of cells
        * `inputMode==='copynum'` Copy numbers by drag for `Fillomino` and `Nanro`
        * `inputMode==='dragnum+'` Increment numbers by drag for `Hebi-Ichigo`
        * `inputMode==='dragnum-'` Decrement numbers by drag for `Hebi-Ichigo`
        * `inputMode==='akari'` Input bulbs for `Akari`
        * `inputMode==='star'` Input stars for `Star Battle`
        * `inputMode==='futon'` Input futons for `School Trip`
        * `inputMode==='balloon', 'ironball', 'objblank'` Input baloons, iron balls or blank cells for `Dosun-Fuwari`
        * `inputMode==='copycircle'` Copy circles by drag for `Yin-yang`
        * `inputMode==='diraux'` Input dir. aux. marks for `Nagareru-loop`

### Properties

* `puzzle.mouse.btn:string` Detected mouse button.
* `puzzle.mouse.mousestart:boolean` `true` if mousedown/touchstart event is detected.
* `puzzle.mouse.mousemove:boolean` `true` if mousemove/touchmove event is detected.
* `puzzle.mouse.mouseend:boolean` `true` if mouseup/touchend event is detected.
* `puzzle.mouse.cancelEvent:boolean` Cancel mouse event from `mouse` listener.

## puzzle.key:KeyInput

This sub-obejct controls keyboard event.

### Methods

* `puzzle.key.inputKeys(...chars)` Emulate keydown and keyup event with given characters.

### Properties

* `puzzle.key.cancelEvent:boolean` Cancel mouse event from `key` listener.
* `puzzle.key.keydown:boolean` `true` if kwydown event is detected.
* `puzzle.key.keyup:boolean` `true` if keyup event is detected.
* `puzzle.key.isCTRL:boolean` `true` if `Ctrl` key is being pressed.
* `puzzle.key.isMETA:boolean` `true` if `Meta/Command` key is being pressed.
* `puzzle.key.isALT:boolean` `true` if `Alt` key is being pressed.
* `puzzle.key.isSHIFT:boolean` `true` if `Shift` key is being pressed.
* `puzzle.key.isZ:boolean` `true` if `Z` key is being pressed.
* `puzzle.key.isX:boolean` `true` if `X` key is being pressed.
* `puzzle.key.isY:boolean` `true` if `Y` key is being pressed.

## puzzle.metadata:pzpr.Metadata

### Properties

* `puzzle.metadata.author`
* `puzzle.metadata.source`
* `puzzle.metadata.hard`
* `puzzle.metadata.comment`

### Methods

* `puzzle.metadata.update(metadata)` Update metadata of the puzzles.
* `puzzle.metadata.getvaliddata()` Get metadata without empty properties.
* `puzzle.metadata.reset()` Clear all metadata.
* `puzzle.metadata.update()` Return `true` if each metadata is empty.

## Other sub-objects

* `puzzle.opemgr:OperationManager` Contains operation history data.
* `puzzle.checker:Answer` Check if the board is correct.
* `puzzle.cursor:TargetCursor` Contains current cursor position.
