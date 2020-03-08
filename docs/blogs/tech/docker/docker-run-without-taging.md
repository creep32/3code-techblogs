---
title: カスタムDcokerイメージにタグ付けすることなくdocker runを実行する
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

ポイントはdocker buildに`-q`オプションをつけていることです。これをつけることでbuildされたイメージのIDが返されるので、タグの名前を気にすることなくカスタムdockerイメージを実行することができます。

```sh
$ docker build --help | grep quiet
  -q, --quiet                   Suppress the build output and print image ID on success
```
もちろん、2回目以降の実行はDockerfileを更新しない限りbuildしたイメージが再利用されます。

## Conclusion
本記事ではカスタムDockerイメージにタグを振ることなくdocker runする方法を紹介しました。Dockerfileをそのまま実行できるような感覚なので、スクリプトをシンプルに保つことができます。
