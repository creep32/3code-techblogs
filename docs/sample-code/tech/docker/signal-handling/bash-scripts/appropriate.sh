#!/usr/bin/env bash

echo "# start"

CHILD=""

# l. Handle signal for propagating signal to child process
signal_handler () {
  echo "catched signal $1"

  if [ -n "$CHILD" ] ; then
    kill -$1 $CHILD

    wait $CHILD
  fi

  exit 1
}

trap "signal_handler SIGTERM" SIGTERM
trap "signal_handler SIGHUP" SIGHUP

# 2. Run an init inside the container that forwards signals and reaps processes
docker run --init --name sleeper --rm busybox sleep 60 &

CHILD="$!"
wait "$CHILD"

echo "# finish"

exit 0
