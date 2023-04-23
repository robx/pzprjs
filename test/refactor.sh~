#!/bin/bash
STR='\(function\(pidlist, classbase\) \{\s*if \(typeof module === "object" && module.exports\) \{\s*module.exports = \[pidlist, classbase\];\s*\} else \{\s*pzpr.classmgr.makeCustom\(pidlist, classbase\);\s*\}\s*\}\)\((\[(?:.|\n)*\]), (\{(?:.|\n)*\})\);'
RES=$'export const pidlist = ${1};\nexport const classbase = ${2};'
set +x
for file in *.js
do
    rg --multiline --passthru "$STR" -r $'export const pidlist = ${1};\nexport const classbase = ${2};' $file > "${file%.js}.mjs"
    if [ "$(md5sum $file | cut -d' ' -f1)" != "$(md5sum ${file%.js}.mjs | cut -d' ' -f1)" ]
    then
	rm $file
	git add "${file%.js}.mjs"
    fi
done
