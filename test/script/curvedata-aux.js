/* curvedata-aux.js */

ui.debug.addDebugData('curvedata-aux', {
    url : '4/4/3/2/921',
    failcheck : [
        [null, "pzprv3/curvedata-aux/4/4/3/2/921"]
    ],
    inputs : [
        { input:["newboard,4,4", "playmode"],
        result:"pzprv3/curvedata-aux/4/4/0/0/" },
        { input:["mouse,left, 1,1, 1,3, 1,5"],
        result:"pzprv3/curvedata-aux/4/4/1/3/a/" },
        { input:["mouse,left, 7,5, 5,5, 5,7"],
        result:"pzprv3/curvedata-aux/4/4/4/4/20200300/" },
        { input:["playmode,slide", "mouse,left, 1,3, 3,3"], /* Slide the left-most shape 1 to the right */
        result:"pzprv3/curvedata-aux/4/4/3/4/280c00/" },
        { input:["playmode,slide", "mouse,left, 3,3, 5,3"], /* Attempt to slide into an occupied space */
        result:"pzprv3/curvedata-aux/4/4/3/4/280c00/" }
    ]
});
