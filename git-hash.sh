#!/bin/sh

if [ -z "$GIT_HASH" ]; then
  GIT_HASH=$(git rev-parse --short HEAD)
fi

cat > git.json <<END
{
  "hash": "$GIT_HASH"
}
END
