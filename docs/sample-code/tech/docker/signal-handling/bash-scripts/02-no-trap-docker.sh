#!/usr/bin/env bash

ROOT_DIR=$( cd $( dirname ${BASH_SOURCE:-$0} ) && pwd )

echo "start sleep 120"

docker run --name test -it --rm centos sh -c 'sleep 120'

echo "finish sleep 120"

exit 0
