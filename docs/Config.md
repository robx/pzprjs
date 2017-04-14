# List of puzzle config

## List of config for Graphic/Canvas

|Name|Type|Default value|Description|
|---|---|---|---|
|`font`|`number`|`1`|The font of the canvas.  <br> Possible value: `1: Serif, 2: Sans-serif`|
|`cursor`|`boolean`|`true`|Display the cursor on the canvas|
|`irowake`|`boolean`|`false`|Set individual color to lines|
|`irowakeblk`|`boolean`|`false`|Set individual color to mass of shaded cells|
|`dispmove`|`boolean`|`true`|Display objects as if it is really moving for moving puzzles|
|`disptype_yajirin`|`number`|`1`|Display type for `'Yajilin'` means whether gray background isallowed <br> Possible value: `1 or 2`|
|`disptype_pipelinkr`|`number`|`1`|Ice/circle display type for `'Pipelink Returns'` <br> Possible value: `1 or 2`|
|`disptype_bosanowa`|`number`|`1`|Display type for `'Bosanova'` <br> Possible value: `1, 2 or 3`|
|`snakebd`|`boolean`|`false`|Display the border between inside and outside the snake for `'Hebi-Ichigo'`|
|`dispqnumbg`|`boolean`|`false`|Set background color of question circles silver for `'Yin Yang'`|
|`undefcell`|`boolean`|`true`|Set background color of undetermined cell for `'School Trip'`|
|`squarecell`|`boolean`|`true`|Set cell on the board always square|
|`color_shadecolor`|`string`|''|Set the color of the shaded cells. `''` means default color (probably black)|
|`color_bgcolor`|`string`|`'white'`|Set the background color of the board. `''` indicates transparent|

## List of config for input method

|Name|Type|Default value|Description|
|---|---|---|---|
|`use`|`number`|`1`|Input method for shaded cells from mouse <br> Possible value: `1 or 2`|
|`use_tri`|`number`|`1`|Input method for triangles from mouse for `'Shakashaka'` <br> Possible value: `1, 2 or 3`|
|`bgcolor`|`boolean`|`false`|Enable to input background color for `'Slitherlink'`|
|`singlenum`|`boolean`|`true`|Disable to input plural answer numbers in a room for `'Hanare-gumi'`|
|`enline`|`boolean`|`true`|Limit to input segments only between points for `'Kouchoku'`|
|`lattice`|`boolean`|`true`|Restrict not to input segments if other points are on the lattice for `'Kouchoku'`|

## List of config for answer check

|Name|Type|Default value|Description|
|---|---|---|---|
|`autocmp`|`boolean`|`true`|Show complete numbers apart from incompleted one automatically.|
|`autocmp_area`|`boolean`|`true`|Paint background of completed blocks/areas automatically.|
|`autoerr`|`boolean`|`false`|Show incomplete/wrong numbers automatically.|
|`multierr`|`boolean`|`false`|Check prural errors in `puzzle.check()` API.|
|`allowempty`|`boolean`|`false`|Ignore 'No lines/blocks on the board' error.|
|`forceallcell`|`boolean`|`false`|Force all cells to have number to get completed for `'fillomino'`|
|`passallcell`|`boolean`|`true`|Force all cells to be passed for `'arukone'`|

## List of miscellaneous config

|Name|Type|Default value|Description|
|---|---|---|---|
|`bdpadding`|`boolean`|`true`|Output URL with one row padding for `'Goishi'`.|
|`discolor`|`boolean`|`false`|Disable setting color for `'Tentai-show'`.|
|`uramashu`|`boolean`|`false`|Ura-masyu mode for `Masyu`.|
