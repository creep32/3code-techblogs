---
title: docker runにおけるSignal HandlingのBest Practices
date: 2020-08-06 07:25:56
tags:
  - DevOps
  - Linux
---

![main image](./linux.png)

最近本業の方でJenkinsを使ったCICDを担当しており、パイプライン処理にもDockerを使い倒しているのですが、Jenkinsジョブを中断(Abort)した際にうまくSignalが伝搬されない事象に遭遇したため、改めてLinuxのSignalの扱いとDockerにおけるBest Practiceを検証したので紹介したいと思います。

まずはクイズです。

以下のbash shellを実行し、ハイライト箇所の処理最中に`kill -SIGTERM $PID`したら何が起きるか正確に説明できるでしょうか？

<<< @/3code-tech-blog/docs/sample-code/tech/docker/signal-handling/bash-scripts/in-appropriate.sh{5}

## Problem
まずは冒頭のクイズに専門用語全開で答えると、、

`re-parenting(リペアレンティング)され、docker runしている子プロセスがorphan process(孤児プロセス)になる`

となります。wrapper shellからforkされて実行された子プロセス(docker run)にはSIGTERMが伝搬されず、孤児プロセスとして処理を続けます。

SIGTERMをwrapper shellに送ったタイミングで、docker runしているプロセスも正しく終わってほしいのです。

::: tip
本記事の内容はdockerを使っていなくてもshell scriptを開発する方にはお役に立つと思います。

冒頭のクイズが不正解だった場合後半の内容もご拝読ください。
:::

<SampleCodeNote />

## Solution
先頭に挙げたBash Shellの完成版を先に紹介します。主な改良点は以下です

1. wrapper shellに`Signal Handler`を設置し、子プロセスに正しくSignalを伝搬させる
1. docker runに`--init`フラグを付加し、コンテナ内に伝搬されたSignalを直観通りに処理させる

<<< @/3code-tech-blog/docs/sample-code/tech/docker/signal-handling/bash-scripts/appropriate.sh

冗長にはなりますが、これにより例えばジョブスケジュール経由での実行の中断も、terminal経由での実行時`Ctl-C`での終了も意図した通りの動作になります。

次章では、それぞれの改良点の詳細と関連するLinuxの仕様とを併せて説明していきます。

::: warning
1. Shellは`Bash`のみ検証
2. 使っているDocker Imageによっては、プロセス管理にスーパーバイザーなどを導入しているものがあるので、利用するDocker Imageの詳細を確認
:::


## Discussion
それでは改良点の詳細を説明していきます。

### wrapper shellに`Signal Handler`を設置し、子プロセスに正しくSignalを伝搬させる
Linuxのプロセス管理のデフォルトの動作として親プロセスにkillコマンドでSignalを送信した場合、子プロセスは孤児プロセスとなります。この挙動を[re-parenting](https://ja.wikipedia.org/wiki/%E5%AD%90%E3%83%97%E3%83%AD%E3%82%BB%E3%82%B9)といいいます。

```bash
$ cat sleep.sh
sleep 100

$ cat $$
15887

$ bash sleep.sh

# 親プロセスがbashで、子プロセスがsleep 100
$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 2
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
vagrant  15887  0.3  0.2 119964  6740 pts/5    Ss   02:32   0:00  \_ -bash
vagrant  16416  0.0  0.0 113184  1188 pts/5    S+   02:32   0:00      \_ bash sleep.sh
vagrant  16417  0.0  0.0 107960   360 pts/5    S+   02:32   0:00          \_ sleep 100

# この状態で親プロセスをkill （SIGTERMを送付）する
$ kill -SIGTERM 16416

# forkされた子プロセス（sleep 100）が孤児プロセスになっている
$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 1
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
vagrant  15887  0.1  0.2 119964  6740 pts/5    Ss+  02:32   0:00  \_ -bash
vagrant  16417  0.0  0.0 107960   360 pts/5    S    02:32   0:00 sleep 100

$ pstree -gpu 16417
sleep(16417,16416,vagrant)
```

このデフォルトの挙動をオーバーライドするために用意されている機構がSignal Handlerでbashでは`trap`というコマンドが該当します。

`trap "実行したい処理" SIGNALS ...`

ではtrapにてSignal Handlerを実装した時の動作を確認してみます。
```bash
$ cat sleep.sh

# SIGTERMが送付されたら、終了コード1で終了
trap 'echo "catch SIGTERM"; exit 1' SIGTERM

sleep 100

$ cat $$
15887

$ bash sleep.sh

# 親プロセスがbashで、子プロセスがsleep 100
$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 2
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
vagrant  15887  0.0  0.2 119964  6740 pts/5    Ss   02:32   0:00  \_ -bash
vagrant  16595  0.0  0.0 113184  1400 pts/5    S+   02:46   0:00      \_ bash sleep.sh
vagrant  16596  0.0  0.0 107960   356 pts/5    S+   02:46   0:00          \_ sleep 100

# この状態で親プロセスをkill （SIGTERMを送付）する
$ kill -SIGTERM 16595

# あれ？何も変わらない
$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 2
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
vagrant  15887  0.0  0.2 119964  6740 pts/5    Ss   02:32   0:00  \_ -bash
vagrant  16595  0.0  0.0 113184  1400 pts/5    S+   02:46   0:00      \_ bash sleep.sh
vagrant  16596  0.0  0.0 107960   356 pts/5    S+   02:46   0:00          \_ sleep 100

# 100秒後。。。

# Signal Handlerは正しく機能し、親シェルが終了した
catch SIGTERM

$ echo $?
1
```

trapでSIGTERMを捕捉できましたが、動作したのは100秒後でした。

これはShellの正しい挙動で、現在実行の子プロセス(上記の例ではsleep 100)が終了するまで、SignalをQueueするという仕組みがあるためです。

しかしながら、例えば子プロセスがDBのdata dumpなどのロングランニングプロセスの場合、意図した中断をすることができず、ジョブスケジュールなどによくある、SIGTERMを送る-> 規定時間親プロセスの終了を待機 -> SIGKILLを送信する。の挙動により、Gracefulな終了操作ができなくなってしまいます。

この挙動への対応として、子プロセスをバックグラウンド実行に変更することで、別のコマンドが受け入れられる状態になり、親プロセスがSignalに即座に反応できるようになります。

これを実現するため、子プロセスに`&`をつけてバックグラウンド実行し、`wait $!`で子プロセスの終了を待機する。という処理を追加します。

```bash
$ cat sleep.sh

sleep 100 &

CHILD=$!

trap "echo 'catch signal'; kill -SIGTERM $CHILD; exit 1" SIGTERM

wait $CHILD


$ echo $$
15887

$ bash -x sleep.sh
+ trap 'echo '\''catch signal'\''; kill -SIGTERM ; exit 1' SIGTERM
+ CHILD=16889
+ wait 16889
+ sleep 100

$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 2
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
vagrant  15887  0.0  0.2 119964  6744 pts/5    Ss   02:32   0:00  \_ -bash
vagrant  17125  0.0  0.0 113188  1400 pts/5    S+   03:06   0:00      \_ bash -x sleep.sh
vagrant  17126  0.0  0.0 107960   360 pts/5    S+   03:06   0:00          \_ sleep 100

$ kill -SIGTERM 17125

# (...kill -SIGTERM直後...)
++ echo 'catch signal'
catch signal
++ kill -SIGTERM 17126
++ exit 1

# 意図通り子プロセスも終了されている
$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 2
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
```

SIGTERM送信のタイミングで意図通り親、子それぞれのプロセスを終了させることができました。

かつSignal Handlerに事後処理や、ロギングなどを追加することで、よりリッチなwrapper shellを開発することができます。

### docker runに`--init`フラグを付加し、コンテナ内に伝搬されたSignalを直観通りに処理させる
続いてdocker runの基本的な挙動を確認していきます。

docker runを実行すると、通常のdocker imageであれば指定したコマンドがコンテナ内で`PID=1`で実行されます。

```bash
$ docker run --rm --name poc busybox sleep 100

$ docker exec poc ps | grep -v ps
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 100
```

Linuxにおいて`PID=1`は`init`として知られるプロセスで、孤児プロセスを管理したり、ゾンビプロセスを刈り取ったりといった責務があります。

かつ、[dockerの公式ドキュメント](https://docs.docker.com/engine/reference/run/#foreground)にも記載がありますが、dockerにおいては特別な実装をしていない限り基本的なシグナルは無視される。という特徴があります。

> A process running as PID 1 inside a container is treated specially by Linux: it ignores any signal with the default action. As a result, the process will not terminate on SIGINT or SIGTERM unless it is coded to do so.

常勤の動作を検証してみます。

```bash
# PID=1でコマンド実行
$ docker run --rm --name poc busybox sleep 100

$ docker exec poc ps | grep -v ps
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 100

# SIGTERMを送ってみるが無視される
$ docker exec poc sh -c 'kill -SIGTERM 1'

$ docker exec poc ps | grep -v ps
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 100


# SIGKILLを送ってみるが無視される
$ docker exec poc sh -c 'kill -SIGKILL 1'

$ docker exec poc ps | grep -v ps
PID   USER     TIME  COMMAND
    1 root      0:00 sleep 100

# 直接docker runのプロセスにSIGTERMを送ってみる
$ kill -SIGTERM $(ps -aux | grep -E 'docker run.*sleep 100$' | awk '{print $2}')

# 同様の理由から無視されてしまう
$ ps -aux | grep -E '(sleep 100|docker run.* sleep 100)$'
vagrant  22652  0.0  1.9 385588 57772 pts/5    Sl+  04:02   0:00 docker run --rm --name poc busybox sleep 100
root     22696  0.0  0.0   1284     4 ?        Ss   04:02   0:00 sleep 100

USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root     19610  0.0  0.0   1284     4 pts/0    Ss+  03:42   0:00 sleep 100

# docker runプロセス自体はkillは可能だが、コンテナ内で動いていたコマンドは実環境で孤児プロセスとなる
$ kill -SIGKILL $(ps -aux | grep -E 'docker run.*sleep 100$' | awk '{print $2}')
$ ps -aux | grep -E '(sleep 100|docker run.* sleep 100)$'
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root     22696  0.0  0.0   1284     4 ?        Ss   04:04   0:00 sleep 100

# docker kill（docker stopも同様）であれば停止させられる（ただしGracefulではない）
$ docker kill -s SIGKILL poc
poc

$ ps -aux | grep sleep
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
```

これがdockerの基本的な挙動になります。この動作から初期の頃のdocker imageにはinitプロセスを独自で管理するものも多くみられました。

ここで前述した`特別な実装`がデフォルトでdockerに実装されました。それを有効にするのが`--init`オプションになります。

```bash
$ docker run --help | grep 'init '
      --init                           Run an init inside the container that forwards signals and reaps processes
```

同オプションをdocker runコマンドに付与することで、シグナルを直観通りに伝搬してくれます。

```bash{7}
#  --initオプションを付加
$  docker run --init --rm --name poc busybox sleep 100

# PID=1が/sbin/docker-initというプロセスに置き換わっている
$ docker exec poc ps
PID   USER     TIME  COMMAND
    1 root      0:00 /sbin/docker-init -- sleep 100
    6 root      0:00 sleep 100
    7 root      0:00 ps

# /sbin/docker-initに"特別な実装"がなされているため、signalが正しく伝搬される
$ docker exec poc kill -SIGTERM 1

$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES

$ docker run --init --rm --name poc busybox sleep 100

# 直接docker runコマンドにSignalを送った場合も正しく伝搬される
$ kill -SIGTERM $(ps -aux | grep -E 'docker run.*sleep 100$' | awk '{print $2}')

$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES

# 孤児プロセスも生まれていない
$ ps -aux | grep -E '(sleep 100|docker run.* sleep 100)$'
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND

```

乱暴な結論でいうと、docker runをするときは、とりあえず`--init`オプションを付与する。と考えて問題なさそうです。

### Alternative Patterns
もっと簡単にSignalを伝搬する方法として、`fork`せずに`exec`で親プロセスを置き換えてしまう。というパターンがあります。これであればShellがSignalをQueueすることなど考慮せず、Signalをダイレクトにdocker run プロセスに送ることが可能です。

```bash{5}
# execコマンドでdocker runを実行
$ cat exec.sh
echo '# start'

exec docker run --init --rm busybox sleep 100

echo '# finish'

$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 2
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
vagrant  15887  0.0  0.2 119964  6744 pts/5    Ss   02:32   0:00  \_ -bash
vagrant  25058  0.2  1.8 377392 53688 pts/5    Sl+  04:48   0:00  |   \_ docker run --init --rm busybox sleep 100

$ kill -SIGTERM 25058

$ ps -auxf | head -1; ps -auxf | grep -E "sleep 100$" -B 2
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
```

こっちの方が簡単じゃん！という声が聞こえそうな中、何故前述の方法を紹介したかというと、wrapper scriptを作るということは、後処理や、ロギングなどの処理が必要であることがほとんどであるため、この`exec`パターンだと現在実行中の子プロセスはGracefulに終了されるものの、そのあと後処理ができなくなるというのが理由です。

そのため、冗長であっても後処理も自由に実装できるパターンとして自身でSignal Handlingをするパターンを紹介しました。execを利用する同パターンもユースケースによっては有用なオプションになります。

## Conclusion
本記事ではdocker runを使うときのSignal HandlingのBest Practiceを解説しました。
SaaS、サーバレス、ついには`No Code`の波まで押し寄せて来ていますが、低レイヤーの知識を学ぶことは改めて重要であると考えさせられた検証でした。

少しでも読者の皆様の参考になれば幸いです。

## See Also
今回の記事を書くにあたり非常に参考になった記事を紹介します。

* [Ctrl+Cとkill -SIGINTの違いからLinuxプロセスグループを理解する](http://equj65.net/tech/linuxprocessgroup/)
* [Best practices for propagating signals on Docker(英)](https://www.kaggle.com/residentmario/best-practices-for-propagating-signals-on-docker)


