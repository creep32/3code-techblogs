---
title: カスタムDcokerイメージをタグ付けすることなくdocker runで実行する
date: 2020-03-08 08:20:03
タグs:
  - DevOps
---

![main image](./docker.png)

Dockerを使いだすと、自作Docker Imageをちょっとしたスクリプトに使いたいことはよくあります。この記事ではDockerイメージにタグ付けすることなく`docker run`する方法について紹介します。

## Problem
個人の環境で動かしているときは良いですが、共有環境で動かす、チームに展開する。となると、イメージのタグ名の扱いは意外にめんどくさいものです。簡易スクリプトなのでprivate repositoryにアップロードするのも重厚すぎる気がします。

かなり雑に実装しても以下のようになり、タグの名前衝突は厳密には防げていません。

```sh
$ TAG=3code/$(whoami)
$ docker build -t $TAG .
$ docker run --rm $TAG bash run.sh
```

## Solution
以下のようにすることで、タグを振らなくてもカスタムDockerイメージをrunすることが可能です。

```sh
$ docker run --rm $(docker build -q .) bash run.sh
```

ポイントはdocker buildに`-q, --quiet`オプションをつけていることです。これをつけることでbuildされたイメージのIDが返されるので、タグの名前を気にすることなくカスタムdockerイメージを実行することができます。

::: vue
$ docker build --help

Usage:  docker build [OPTIONS] PATH | URL | -

Build an image from a Dockerfile

Options:
      --add-host list           Add a custom host-to-IP mapping (host:ip)
      --build-arg list          Set build-time variables
      --cache-from strings      Images to consider as cache sources
      --cgroup-parent string    Optional parent cgroup for the container
      --compress                Compress the build context using gzip
      --cpu-period int          Limit the CPU CFS (Completely Fair Scheduler) period
      --cpu-quota int           Limit the CPU CFS (Completely Fair Scheduler) quota
  -c, --cpu-shares int          CPU shares (relative weight)
      --cpuset-cpus string      CPUs in which to allow execution (0-3, 0,1)
      --cpuset-mems string      MEMs in which to allow execution (0-3, 0,1)
      --disable-content-trust   Skip image verification (default true)
  -f, --file string             Name of the Dockerfile (Default is 'PATH/Dockerfile')
      --force-rm                Always remove intermediate containers
      --iidfile string          Write the image ID to the file
      --isolation string        Container isolation technology
      --label list              Set metadata for an image
  -m, --memory bytes            Memory limit
      --memory-swap bytes       Swap limit equal to memory plus swap: '-1' to enable unlimited swap
      --network string          Set the networking mode for the RUN instructions during build (default "default")
      --no-cache                Do not use cache when building the image
      --pull                    Always attempt to pull a newer version of the image
  `-q, --quiet                   Suppress the build output and print image ID on success`
      --rm                      Remove intermediate containers after a successful build (default true)
      --security-opt strings    Security options
      --shm-size bytes          Size of /dev/shm
  -t, --tag list                Name and optionally a tag in the 'name:tag' format
      --target string           Set the target build stage to build.
      --ulimit ulimit           Ulimit options (default [])
:::
もちろん、2回目以降の実行はDockerfileを更新しない限りbuildしたイメージが再利用されます。

## Conclusion
本記事ではカスタムDockerイメージにタグを振ることなくdocker runする方法を紹介しました。Dockerfileをそのまま実行できるような感覚なので、スクリプトをシンプルに保つことができます。
