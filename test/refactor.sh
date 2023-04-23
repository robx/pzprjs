#!/bin/bash
STR='\(function\(pidlist, classbase\) \{\s*if \(typeof module === "object" && module.exports\) \{\s*module.exports = \[pidlist, classbase\];\s*\} else \{\s*pzpr.classmgr.makeCustom\(pidlist, classbase\);\s*\}\s*\}\)\((\[(?:.|\n)*\]), (\{(?:.|\n)*\})\);'
RES=$'export const pidlist = ${1};\nexport const classbase = ${2};'
set +x
for file in $(find ./pzpr -name '*.js')
do
    rg --passthru ', function\(\)' -r ', async function()' $file > "${file}.1"
    rg --passthru 'puzzle.open\(' -r $'var puzzle = new pzpr.Puzzle();\nawait puzzle.openAsync(' "${file}.1" > "${file}.2"
    rm "${file}.1"
    rm $file
    mv "${file}.2" $file
done
