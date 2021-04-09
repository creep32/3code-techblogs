---
title: コードスニペット
date: 2020-01-01 14:05:31
tags:
  - code snippets
---

<div v-if="$lang === 'ja'">
<h1>コードスニペット集</h1>
<p>
よく使うけどなんだかんだ毎回調べているコードのスニペットについてまとめています。このてのスニペットには複数の選択肢があるので、個人的にベストプラクティスだと思うものをピックアップして記載しています。よりよいプラクティスがあれば<router-link :to="'/contact/'">ご連絡お願いします</router-link>。
</p>
</div>
<div v-if="$lang === 'en-US'">
<h1>Code Snipets Often Used</h1>
<p>The Code snipets I often used when develop, operation and more. </p>
<p>If you have better practices, please <router-link :to="'/en/contact/'">keep in touch with me.</router-link></p>
</div>

## javascripts
::: details Loop Key with Value of Object
```js
for (let [key, value] of Object.entries(obj)) {
  ...
}
```
::: details access nested object key without catching the ReferenceError that intermediate key is undefined
This snippet use [loadash.get](https://lodash.com/docs/#get) function.

```
const _ = require('lodash');

const nested = {
  'a': 1,
  'b': {
    'c': 2,
    'd': [3, 4 ,5]
  },
};

console.log(_.get(nested, 'a'));
// => 1
console.log(_.get(nested, 'b.d[1]'));
// => 4
console.log(_.get(nested, 'e.f.g'));
// => undefined (not ReferenceError: e is not defined)
console.log(_.get(nested, 'e.f.g', 'default'));
// => with default value
```
:::

::: details checks if values is an empty object, array, collection, or set.
This snippet use [lodash.#isEmpty](https://lodash.com/docs/#isEmpty) function.

```
const _ = require('lodash');                                                                                                                                                                                                              console.log(_.isEmpty({}));
// => true
console.log(_.isEmpty([]));
// => true
console.log(_.isEmpty(undefined));
// => true
console.log(_.isEmpty(null));                                                                                        // => true
console.log(_.isEmpty(''));
// => true
console.log(_.isEmpty(0));
// => true
```
:::

::: moment with time-zone
This snippet use [moment-timezone](https://momentjs.com/timezone/) npm module.

```
const moment = require('moment');
const momentTimezone = require('moment-timezone');

// UTC
console.log(moment().format('YYYY-MM-DD HH:mm'));
//=>  2021-02-16 01:49

// JST
console.log(momentTimezone().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm'));
//=> 2021-02-16 10:49
```

## One-Liner
::: details Rscript
```
# percentile
$ seq 1 10 | docker run --rm -i r-base Rscript -e 'round(quantile (as.numeric (readLines ("stdin")), c(.80, .90, .99)), 2)' -
 80%  90%  99%
8.20 9.10 9.91

# summary
$ seq 1 10 | docker run --rm -i r-base Rscript -e 'round(summary (as.numeric (readLines ("stdin"))), 1)' -
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.
    1.0     3.2     5.5     5.5     7.8    10.0

# standard deviation
$ seq 1 10 | docker run --rm -i r-base Rscript -e 'round(sd (as.numeric (readLines ("stdin"))), 4)' -
[1] 3.0277
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
