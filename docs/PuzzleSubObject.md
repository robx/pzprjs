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
