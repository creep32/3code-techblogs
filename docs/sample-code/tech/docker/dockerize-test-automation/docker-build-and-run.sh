#!/usr/bin/env bash

ROOT_DIR=$( cd $( dirname ${BASH_SOURCE:-$0} ) && pwd )

help() {
    cat << HELP
 Usage: $0 [options...] [unit|integration]

 Options
    -h                show this help
HELP
    exit 0
}

while getopts "h" OPT
do
    case $OPT in
        h) help ;;
        *) exit ;;
    esac
done

set -eu

shift $(( OPTIND - 1 ));

[ -z "$1" ] && help

cd $ROOT_DIR

app() {
  TAG=3code/app-deploy
  docker build -f Dockerfile.app . -t $TAG
  docker run -d -p 3000:3000 --rm $TAG
}

unitTest() {
  TAG=3code/unit-test
  docker build -f Dockerfile.test --target unit . -t $TAG
  docker run --rm $TAG
}

integrationTest() {
  TAG=3code/intregration
  docker build -f Dockerfile.test --target integration . -t $TAG
  docker run --rm $TAG
}

case "$1" in
  "app") app ;;
  "unit") unitTest ;;
  "integration") integrationTest ;;
  *) help ;;
esac


