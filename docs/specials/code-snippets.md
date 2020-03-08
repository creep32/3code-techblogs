---
title: コードスニペット
date: 2020-01-01 14:05:31
tags:
  - code snippets
---

# コードスニペット集
よく使うけどなんだかんだ毎回調べているコードのスニペットについて参考先と併せてまとめています。このてのスニペットには複数の選択肢があるので、個人的にベストプラクティスだと思うものをピックアップして記載しています。よりよいプラクティスがあれば[ご連絡お願いします](/contact/)。

## javascripts
::: details Loop Key with Value of Object
```js
for (let [key, value] of Object.entries(obj)) {
  ...
}
```
:::

## Linux
::: details get pid from process name
```sh
$ pidof dockerd
```
:::

