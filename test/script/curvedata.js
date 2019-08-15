/* curvedata.js */

ui.debug.addDebugData('curvedata', {
    url : '4/4/=g1l0l/b000080/3/3/5e85/3/3/06a4',
    failcheck : [
        ["ceNoLine", "pzprv3/curvedata/4/4/2/-3 . 1 . /. . . . /. 0 . . /. . . . /3/3/1 1 /1 0 /1 1 /0 0 1 /1 0 1 /3/3/0 0 /1 0 /0 1 /0 0 1 /0 1 1 /0 1 0 /0 0 1 /0 0 0 /0 0 0 /0 0 1 1 /0 0 -2 0 /0 0 0 0 /"],
        ["shNone", "pzprv3/curvedata/4/4/2/-3 . 1 . /. . . . /. 0 . . /. . . . /3/3/1 1 /1 0 /1 1 /0 0 1 /1 0 1 /3/3/0 0 /1 0 /0 1 /0 0 1 /0 1 1 /0 0 0 /0 0 0 /0 0 0 /1 1 0 /0 0 0 0 /1 0 -2 0 /1 0 1 0 /"],
        ["shMultiple", "pzprv3/curvedata/4/4/2/-3 . 1 . /. . . . /. 0 . . /. . . . /3/3/1 1 /1 0 /1 1 /0 0 1 /1 0 1 /3/3/0 0 /1 0 /0 1 /0 0 1 /0 1 1 /0 1 1 /0 0 0 /1 1 0 /1 1 1 /0 0 0 1 /0 0 -2 1 /1 0 0 1 /"],
        ["shIncorrect", "pzprv3/curvedata/4/4/2/-3 . 1 . /. . . . /. 0 . . /. . . . /3/3/1 1 /1 0 /1 1 /0 0 1 /1 0 1 /3/3/0 0 /1 0 /0 1 /0 0 1 /0 1 1 /0 0 0 /1 0 0 /0 0 0 /1 1 0 /0 0 0 0 /1 1 -2 0 /1 0 1 0 /"],
        [null, "pzprv3/curvedata/4/4/2/-3 . 1 . /. . . . /. 0 . . /. . . . /3/3/1 1 /1 0 /1 1 /0 0 1 /1 0 1 /3/3/0 0 /1 0 /0 1 /0 0 1 /0 1 1 /0 1 0 /1 0 1 /0 1 1 /1 1 1 /0 0 1 1 /1 0 -2 0 /1 0 0 1 /"]
    ],
    inputs : [
        { input:["newboard,3,2", "editmode"],
        result:"pzprv3/curvedata/2/3/0/. . . /. . . /0 0 /0 0 /0 0 0 /" },
        { input:["editmode,border","mouse,left, 4,2, 6,2"], /* Add border */
        result:"pzprv3/curvedata/2/3/0/. . . /. . . /0 0 /0 0 /0 0 -2 /" },
        { input:["editmode,shade","mouse,left, 5,3"], /* Adding shaded cell removes adjacent border */
        result:"pzprv3/curvedata/2/3/0/. . . /. . -3 /0 0 /0 0 /0 0 0 /" },
        { input:["newboard,3,2","editmode,shade","mouse,left, 3,1"],
        result:"pzprv3/curvedata/2/3/0/. -3 . /. . . /0 0 /0 0 /0 0 0 /" },
        { input:["editmode,undef","mouse,left, 1,1"], /* Add question mark */
        result:"pzprv3/curvedata/2/3/0/-2 -3 . /. . . /0 0 /0 0 /0 0 0 /" },
        { input:["editmode,move-clue","mouse,left, 1,1, 3,1, 5,1"], /* Slide clue over occupied cell */
        result:"pzprv3/curvedata/2/3/0/. -3 -2 /. . . /0 0 /0 0 /0 0 0 /" },

        { input:["newboard,2,3", "playmode,auto"],
        result:"pzprv3/curvedata/3/2/0/. . /. . /. . /0 /0 /0 /0 0 /0 0 /" },
        { input:["mouse,left, 1,1, 1,3, 3,3, 3,5"], /* Add lines */
        result:"pzprv3/curvedata/3/2/0/. . /. . /. . /0 /1 /0 /1 0 /0 1 /" },
        { input:["editmode,copylines", "mouse,left, 1,3"], /* Copy lines */
        result:"pzprv3/curvedata/3/2/1/. . /0 . /. . /2/3/0 /1 /0 /1 0 /0 1 /0 /1 /0 /1 0 /0 1 /" },
        { input:["mouse,left, 3,3"], /* Copying lines again results in identical shape */
        result:"pzprv3/curvedata/3/2/1/. . /0 0 /. . /2/3/0 /1 /0 /1 0 /0 1 /0 /1 /0 /1 0 /0 1 /" },
        { input:["mouse,left, 5,1"], /* Copying lines on empty cell does nothing */
        result:"pzprv3/curvedata/3/2/1/. . /0 0 /. . /2/3/0 /1 /0 /1 0 /0 1 /0 /1 /0 /1 0 /0 1 /" }
    ]
});
