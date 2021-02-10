---
title: ワンライナーで統計計算 - RでDo one thing, and do it well !
date: 2021-02-09 13:07:54
tags:
  - Statistics
  - R
---

![main image](./r.png)

ログ解析、データ解析、パフォーマンステストなど、平均値、中央値、最大値などの基本統計量を算出する業務はそれなりに発生します。本記事では、統計プログラミングの雄である`R`を使い、コマンドライン上で統計値をサクッと出す方法を紹介します。

## Problem
例として、以下のようなExpress(app-server)のアクセスログがあり、パスが`/api`のGETリクエストのみ基礎統計量を算出したいとします。

```sh
$ cat access.log
GET / 200 188.949 ms - 170
GET /api 200 1.343 ms - 23
GET /api?user=3code 200 0.865 ms - 23
GET /api?user=tech 200 1.111 ms - 23
GET /api?user=blog 200 0.915 ms - 23
GET /blog 200 1.182 ms - 23
GET / 200 28.162 ms - 170
GET /blog 200 1.266 ms - 23
POST /api 200 22.007 ms - 23
POST /api 200 0.652 ms - 23
GET /api?user=3code 200 2.170 ms - 23
GET /api?user=3code&sort=reverse 200 0.568 ms - 23
GET /blog 200 0.666 ms - 23
```

ログのフォーマットは、`http-method path status-code request-time - content-length`です。

## Solution
[Rscript](https://www.rdocumentation.org/packages/utils/versions/3.6.2/topics/Rscript)コマンドを使い、ワンライナーで統計値を算出します。詳細は次項で説明します。

### summary(最大、最小、平均、中央値など）
```sh
$ grep "GET /api" access.log | awk '{print $4}' | docker run --rm -i r-base Rscript -e 'summary (as.numeric (readLines ("stdin")))' -

   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.
 0.5680  0.8775  1.0130  1.1620  1.2850  2.1700
```

### quantile(パーセンタイル)
```sh
$ grep "GET /api" access.log | awk '{print $4}' | docker run --rm -i r-base Rscript -e 'quantile (as.numeric (readLines ("stdin")), c(.80, .90, .99))' -

    80%     90%     99%
1.34300 1.75650 2.12865
```

あとはSlackに結果を張り付けて同僚にドヤるだけですね！


## Discussion
前項のワンライナーの詳細を説明します。パイプで区切られているコマンド群が各STEPになります。

1. `grep "GET /api" access.log ` パスが`/api`のGETリクエストに限定
1. `aws '{print $4}'`で、request-timeのみを表示(スペース区切りの4番目を表示)

ここまでで、以下のような計測したいデータのリストが標準出力に出力されます。

```sh
$ grep "GET /api" access.log | awk '{print $4}'
1.343
0.865
1.111
0.915
2.170
0.568
```

3. 生成されたデータのリストを[Rscript](https://www.rdocumentation.org/packages/utils/versions/3.6.2/topics/Rscript)に渡し、統計値を算出

`(any output) | docker run --rm -i r-base Rscript -e 'R_Function (as.numeric (readLines ("stdin")))' -`

標準入力を引数にRの関数を呼びだすフォーマットです。
R_Functionは、リストの数値データを受けとる関数に置きかえます。

ポイントを解説します。

* ポータビリティ性を高めるため、Rscriptはdocker経由で実行
* docker imageには公式の[r-base](https://hub.docker.com/_/r-base/)を利用
* docker runに`-i`オプションを付加
  * docker run --helpでは`-i, --interactive Keep STDIN open even if not attached`と説明されている
  * 標準入力をコンテナーの外から受け付けてくれる(コンテナ内のコマンドが、パイプで繋げれるようになる)
* 末尾の`-`、Rscriptの標準入力に、直前のパイプ前コマンドの標準出力を渡す。(前STEPで説明したデータのリストが渡る)
* `Rscript -e '...'`、シングルクオート内のRの構文を実行する
* `as.numeric (readLines ("stdin")))`、Rの構文で標準入力の内容を数値のリストとして解釈

これであとは好きな`R`の関数を呼び出すだけです。今回の例では、[summary](https://www.rdocumentation.org/packages/base/versions/3.6.2/topics/summary)関数を呼びだし基本統計量の算出を、[quantile](http://www.r-tutor.com/elementary-statistics/numerical-measures/percentile)関数を呼び出し、パーセンタイル値の算出をしています。

### Do One Thing and Do It Well
コマンドライン慣れていない方は逆に複雑に感じたかもしれませんが、これはUnixの哲学である、[Do One Thing and Do It Well](https://en.wikipedia.org/wiki/Unix_philosophy#Do_One_Thing_and_Do_It_Well)のプラクティスに従っています。餅は餅屋ということで、統計計測が得意なRに仕事を任せることで色々と応用が効きます。

```sh
$ aws dynamodb --table-name UserPoint | jq -r .Items[].point.N | docker run --rm -i r-base Rscript -e 'summary (as.numeric (readLines ("stdin")))' -

   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.
   0.00    1.00    3.20    2.28    3.60    3.60
```

作為的な例ではありますが、AWS DynamoDBに格納されているデータの統計値を取得する例です。
DynamoDBからデータを取得すると、以下のようにJSONで値が返ってきますが、JSONのパースが得意な`jq`、統計が得意な`R`と組み合わせることで、ワンライナーで処理することができました。
```json
{
    "Items": [
        {
            "userId": {
                "S": "Kurt Cobanin"
            },
            "point": {
                "N": "3.6"
            }
        },
        {
            "userId": {
                "S": "Brian Jones"
            },
            "point": {
                "N": "1"
            }
        },
        {
            "userId": {
                "S": "Jim Morrison"
            },
            "point": {
                "N": "0"
            }
        },
        {
            "userId": {
                "S": "Jimi Hendrix"
            },
            "point": {
                "N": "3.2"
            }
        },
        {
            "userId": {
                "S": "Janis Joplint"
            },
            "point": {
                "N": "3.6"
            }
        }
    ],
    "Count": 5,
    "ScannedCount": 5,
    "ConsumedCapacity": null
}
```

コマンドラインに処理を落とし込むことで、ドキュメンティングが楽になり、再現性も非常に高くなります。コマンドラインを組み立てるときは、**Do One Thing and Do It Well**を意識しコマンドを組み立てましょう！

### Alternative Pattern
別の方法として[st](https://github.com/nferraz/st)コマンドを利用するとよりシンプルに統計値を取得できます。

ですが、Rであればより複雑な計算もできるので、統計プログラミングへの足がかりという意味も込め本記事ではRの例を取り上げています。

> ```
> $ cat numbers.txt
> 1
> 2
> 3
> 4
> 5
> 6
> 7
> 8
> 9
> 10
>
> $ st --complete numbers.txt
> N   min   q1    median  q3    max   sum   mean  stddev  stderr
> 10  1     3.5   5.5     7.5   10    55    5.5   3.02765 0.957427
> ```

## Conclusion
Rscriptを使ったワンライナーでの統計計算を紹介しました。Unix哲学推しの要素が強くなってしまった感もありますが、Developer Expernceにおいて重要な要素なのでボリュームを使って説明しました。

ワンライナーでは無理ですが、Rscriptであればコマンドライン経由でグラフを画像に出力したりすることもできるので、別の記事で紹介予定です。
