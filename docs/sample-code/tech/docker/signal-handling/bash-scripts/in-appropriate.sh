#!/usr/bin/env bash

echo "# start"

docker run --name sleeper --rm busybox sleep 60

echo "# finish"

exit 0


