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
::: details tail and head
`tail` `-n, --lines=K`

print the starting with the K(spcifed)th lines
```sh
$ tail -n +2 1-10.txt
2
3
4
5
6
7
8
9
10
```

`tail` `-n, --lines=-K`

print the last K(specified) lines
```sh
$ tail -n -2 1-10.txt
9
10
```

`head` `-n, --lines=K`

print the first K(specified) lines
```sh
$ head -n +2 1-10.txt
1
2
```

`head` `-n, --lines=-K`

print all but the last K(specified) lines of each file
```sh
$ head -n -2 1-10.txt
1
2
3
4
5
6
7
8
```

combined. last 5 lines of the files excludes header(first line)

```
$ tail -n +2 1-10.txt  | head -n 5
2
3
4
5
6
```

:::

::: details get pid from process name
 ```sh
$ pidof dockerd
```
:::
