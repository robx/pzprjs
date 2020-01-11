#!/bin/sh

hash=`git rev-parse --short HEAD`
cat > git.json <<END
{
  "hash": "$hash"
}
END
