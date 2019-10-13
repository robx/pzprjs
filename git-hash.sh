#!/bin/sh

hash=`git rev-parse HEAD`
cat > git.json <<END
{
  "hash": "$hash"
}
END
