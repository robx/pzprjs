# pzpr object

#### Methods

* `pzpr.on(eventtype, listener)` Register event listener to pzpr object.
    * `eventtype:string` Event type. Currently it only accepts `'load'`.
    * `listener:function` Function to be called.
* `pzpr.connectKeyEvents(puzzle)` Pass document keydown and keyup event to the given puzzle.

#### Events

* `'load'` Fire if pzpr object become ready. If this event is registered after pzpr is loaded, the listener will be executed immediately.

#### Properties

* `lang:string` Specific the language of pzpr.js. This value will be used for answer check. Possible value: `'en'` or `'ja'`.  Default value depends on browser or node.js env language.
* `version:string` Indicate pzpr.js version.

## pzpr.parser object

#### Methods

* `pzpr.parser.parse(data[, pid])` Parse given data then return parsed `URLData` or `FileData`.
    * Return value: `URLData or FileData`
    * `data:string` Data to be parsed.
    * `pid:string` Predefined puzzle veriety name.

### pzpr.parser.URLData class

#### Properties

* `pid:string`  Parsed puzzle variety/genre.
* `type:URLType`  Parsed URL type. See below
* `rows:number`  The number of rows of the board.
* `cols:number`  The number of cols of the board.
* `pflag:string`  Extra flag in given URL.
* `body:string`  Data in the URL other than type, rows, cols and pflag.
* `isurl:boolean` `true`

### pzpr.parser.FileData class

#### Propertes

* `pid:string` Parsed puzzle variety/genre.
* `type:FileType` Parsed File data type. See below.
* `rows:number` The number of rows of the board.
* `cols:number` The number of cols of the board.
* `metadata:pzpr.Metadata` Author, source, difficulty and comment properies.
* `history:HistoryData` History data in the file data, available if exists.
* `body:string` Data in the URL other than type, rows, cols and pflag.
* `isfile:boolean` `true`

### pzpr.parser URLType definition

These values are defined under pzpr.parser.

#### Const values

* `URL_AUTO` Undefined URL type.
* `URL_PZPRV3` PUZ-PRE v3 URL type.
* `URL_PZPRAPP` PUZ-PRE Applet URL type.
* `URL_KANPEN` Kanpen URL type.
* `URL_KANPENP` Kanpen with PUZ-PRE data URL type.
* `URL_HEYAAPP` Heyawaek Applet URL type.

### pzpr.parser FileType definition

These values are defined under pzpr.parser.

#### Const values

* `FILE_AUTO` Undefined file type.
* `FILE_PZPR` pzpr.js file type.
* `FILE_PBOX` pencilbox (text) file type.
* `FILE_PBOX_XML` pencilbox (XML) file type.

## pzpr.variety object

This object contains each puzzle variety/genre information.

#### Methods

* `pzpr.variety.exists(pid)` Return if puzzle variety is supported.
    * Return value: `boolean`
    * `pid:string` Puzzle variety type.
