---
title: Javascriptでcliを実装する - commander.js -
date: 2020-04-11 05:55:36
tags:
  - Javascript
---

頻繁に発生するオペレーション作業を自動化するなど、ちょっとしたCLIをツールを自作したいケースはよくあると思います。Shellでサクッと終わらせてもよいのですが、Web APIを利用するようなケースなど、高級言語で開発した方が効率か良いですし、副産物としてマルチOSで動作させられるおまけがついてきます。どうせやるなら今っぽいCLIを作りたい。ということで、`Vue.js`、`React`を参考に、`commander`モジュールを使ったJavascriptでのCLI実装について紹介します。

## Problem
Web APIを利用するCLIを開発することになりました。その他の機能要件として以下があるとします。
* 将来の拡張性を見据え、サブコマンドで実行できる
* ショートオプション、ロングオプション両方をサポートする
* ユーザフレンドリーなCLIにしたい
  * ヘルプ、エラー出力を充実
  * サブコマンドにはSuggestion機能を設ける

Shellで開発するには要件がリッチなので、高級言語を利用したいと思うでしょう。本ブログではJavascriptをメイン言語としているので、npmモジュールを利用していきます。ググってみても複数の選択肢があるのでどれを使えばよいでしょうか？

<SampleCodeNote />

## Solution
この手の意思決定をするときのおすすめは、**普段使っているOSSプロダクトの実装を参考にする**です。そこで得た知見は、参考にしたOSSプロダクトの理解が深まる。コードの書き方の勉強になる。といいこと尽くしだからです。

この記事では私が普段使いしている以下OSSプロダクトを参考にしました。本記事執筆時点でのそれぞれのプロダクトで使っているCLI実装用のライブラりは以下のようになっています。

| OSSプロダクト  | CLI実装ライブライ | GitHubスター数|
| ------------- |:-------------:| -----:|
| [Vue Cli](https://github.com/vuejs/vue-cli) | [commander](https://github.com/vuejs/vue-cli/blob/8749f4b71579037cf23c43df8dc9c9bf5c09a5cc/packages/%40vue/cli/bin/vue.js#L45) |★17,344|
| [Vue Press](https://github.com/vuejs/vuepress)| [cac](https://github.com/vuejs/vuepress/blob/76da78001b6dac036d9f6b22d4c9514ce4261009/packages/vuepress/lib/util.js#L8)     |★504|
| [Gridsome](https://github.com/gridsome/gridsome)| [commander](https://github.com/gridsome/gridsome/blob/7a48f0c81c1b5ae870cc6b06190d53936553baa9/packages/cli/package.json#L19)     |★17,344|
| [Create React App](https://github.com/facebook/create-react-app) | [commander](https://github.com/facebook/create-react-app/blob/6adb82a505eb06080dc11702a472f74131e95dc7/packages/create-react-app/createReactApp.js#L38) |★17.344|

※ 2020/03/16日時点

Vue, Reactの両巨頭が採用していること、GitHubのスター数も十分なことから[commander](https://github.com/tj/commander.js/)一択と考えて問題なさそうです。

### commander 概要
[Readme](https://github.com/tj/commander.js/#common-option-types-boolean-and-value)が充実しているので、流し読みしてもらえればその便利さにワクワクしてくると思います
最小限の実装でもこれだけのことができます。

```js
const { program } = require('commander');

// version
program.version('1.0.0')

// options
program
  // 引数をとらない flgオプション
  .option('-d, --debug', 'output extra debugging')
  // 引数をとるオプション。default valueも指定可能(3rd args)
  .option('-s, --pizza-size <size>', 'S, M, or L', 'S')
  // 必須オプション。直観通り未指定の場合エラーに倒してくれる
  .requiredOption('-p, --pizza-type <type>', 'flavour of pizza');

program.parse(process.argv);

console.log(program.opts())
```

上記プログラムを実行してみます。
```sh
# 必須オプションのバリデーション
$ node cli.js
error: required option '-p, --pizza-type <type>' not specified

$ node cli.js -s M -p Margherita
{
  version: '1.0.0',
  debug: undefined,
  pizzaSize: 'M',
  pizzaType: 'Margherita'
}

# ロングオプションのサポート
$ node cli.js --pizza-size=M --pizza-type=Margherita -d
{
  version: '1.0.0',
  debug: true,
  pizzaSize: 'M',
  pizzaType: 'Margherita'
}

# Helpもいい感じに出力してくれる
$ node cli.js --help
Usage: cli [options]

Options:
  -V, --version            output the version number
  -d, --debug              output extra debugging
  -s, --pizza-size <size>  S, M, or L (default: "S")
  -p, --pizza-type <type>  flavour of pizza
  -h, --help               display help for command
```

10行前後でオプションのパース処理が完了してまいました。あとはオプションに応じた処理を実装するだけです。生産的な作業のみに集中できますね。これぞ開発者エクスペリエンスです。


次セクションではより具体的な例として、GitHubのAPIとやりとりをするcommanderの実装をベースに、よりユーザフレンドリーなCLIを実装方法をご紹介します。

## Discussion
サンプルとして、GitHubのWeb APIとやりとりをするCLIを実装しました。同サンプルをベースに、Readmeからだとわかりずらいと思われる以下の実装方法について説明をします。
* [サブコマンドの実装とポイント](#サブコマンドの実装とポイント)
* [エラー出力の改善](#エラー出力の改善)
* [サブコマンドにSuggestion機能を設ける](#サブコマンドにSuggestion機能を設ける)

以下完成したCLIの出力結果です。2つのサブコマンドを実装しています。

* `main-branch` : 引数のRepositoryの本流ブランチをdevelopに変更(Git Flow)
* `issues`: ステータスがOpenのIssueを一覧表示

以下CLI自体のヘルプです。GHEにアクセスするクレデンシャルなどはグローバルオプションとして定義しています
```sh
$ node bin/ghe.js --help
Usage: ghe <command> [options]

Options:
  -v, --version                       output the version number
  -u, --username <username>           username of GitHub Enterprise call Web API
  -p, --password <password>           password of GitHub Enterprise user
  -o, --org <org>                     organization of Github
  -a, --api-base <apibase>            api baseurl (eg. https://api.github.com)
  -h, --help                          display help for command

Commands:
  main-branch <repository-name>       set a main branch
  issues [options] <repository-name>  search issues filterd lables
```

`maine-barnch` サブコマンドのhelpと実行結果です
```sh
# hlelp
$ node bin/ghe.js main-branch --help
Usage: ghe main-branch [options] <repository-name>

set a main branch

Options:
  -h, --help  display help for command

# execution
$ node bin/ghe.js -u creep_32 -p ****** -o my-org --api-base https://api.github.com  main-branch my-repository
 INFO  my-repository set default branch is 'develop'

```

`issues` サブコマンドのhelpと実行結果です。`--labels`オプションで渡されたlabelが付与されているissueを一覧表示します(複数選択可)
```sh
# help
$ node bin/ghe.js issues --help
Usage: ghe issues [options] <repository-name>

search issues filterd lables

Options:
  -l, --labels <labels>  comma separeted labels (default: [])
  -h, --help             display help for command

# execution
$ node bin/ghe.js -u creep_32 -p ****** -o my-org --api-base https://api.github.com -l bug,enhancement my-repository
INFO  my-repository issues filterd [bug, enhancement]

┌────────────────────────────────────────┬──────────────────────────────┬────────────────────────────────────────┐
│ title                                  │ assignee                     │ labels                                 │
├────────────────────────────────────────┼──────────────────────────────┼────────────────────────────────────────┤
│ write test code                        │ creep_32                     │ bug, enhancement, help wanted          │
│ bug fix fro lib/command.js             │ creep_42                     │ bug, enhancement                       │
└────────────────────────────────────────┴──────────────────────────────┴────────────────────────────────────────┘

```

<SampleCodeNote />

### サブコマンドの実装とポイント
[(sub)command](https://github.com/tj/commander.js/#commands)の章で説明があるように、`command`メソッドで登録することができます。高階関数でWrapすることで、今後サブコマンドが増えてもエラーハンドリングを一元管理化することができます。
```js{2,7-8,11-19}
program
  .command('main-branch <repository-name>')
  .description('set a main branch')
  .action(function (repositoryName, cmd) {
    const option = mergeOpts(cmd)

    const command = require('../lib/commands/mainBranch')
    return wrapCommand(command)(repositoryName, option)
  })

// higher function for error handling
function wrapCommand (fn) {
  return (...args) => {
    return fn(...args).catch(err => {
      error(err.stack)
      process.exitCode = 1
    })
  }
}
```

グローバルオプションは、`command`に直接`option`メソッド経由で登録することができます。
```js{3-6}
// set Global Option
program
  .requiredOption('-u, --username <username>', 'username of GitHub Enterprise call Web API')
  .requiredOption('-p, --password <password>', 'password of GitHub Enterprise user')
  .requiredOption('-o, --org <org>', 'organization of Github')
  .requiredOption('-a, --api-base <apibase>', 'api baseurl (eg. https://api.github.com)')
```

ここでポイントです。サブコマンド実行時は、`action`メソッドが呼ばれますが、`cmd`引数には実行コンテキストが設定された`commander`のインスタンスが渡されます。このインスタンスの`opts`メソッドをコールした場合、サブコマンド用のオプションのみが返ってきます。グローバルオプションを取得するには、`cmd.parent.opts()`というように、`parent`プロパティの`opts`メソッドをコールします。
```js{5,11-14}
program
  .command('main-branch <repository-name>')
  .description('set a main branch')
  .action(function (repositoryName, cmd) {
    const option = mergeOpts(cmd)

    const command = require('../lib/commands/mainBranch')
    return wrapCommand(command)(repositoryName, option)
  })

// merge global and subcommand's option
function mergeOpts(cmd) {
  return { ...cmd.parent.opts(), ...cmd.opts()}
}
```
### エラー出力の改善
例えば前セクションの実行例で紹介したように、デフォルトだとオプションのバリデーションに失敗した場合、以下のようにエラーの内容だけが表示されます。この時helpの内容も表示された方がユーザフレンドリーです。

```sh
# 必須オプションのバリデーション
$ node cli.js
error: required option '-p, --pizza-type <type>' not specified
```

[Override exit handling](https://github.com/tj/commander.js/#override-exit-handling)に説明があるように、終了時の処理をオーバライドすることができます。

> By default Commander calls process.exit when it detects errors, or after displaying the help or version. You can override this behaviour and optionally supply a callback. The default override throws a CommanderError.

以下のように`exitOverride`メソッドを実装します。help, versionアクションを実行されたときもこのメソッドが呼ばれるので、その時はデフォルト通りの処理が行われるように条件分岐します。これは`exitOverride`のコールバックに渡される`CommanderError`インスタンスの`code`プロパティで判断が可能です。
```js
program.exitOverride(function (err) {
  if (err && ! ['commander.version', 'commander.helpDisplayed'].includes(err.code)) {
    this.outputHelp()
    log('')
    warn(err.message)
  }
});
```

自身でカスタムエラーハンドリングを実施した場合もこの仕組みを利用することができます。[_exit(exitCode, code, message)](https://github.com/tj/commander.js/blob/ebc8b41c9c713ab059a10547d11dfe2ab5f71855/index.js#L368-L374)メソッドを呼ぶことで、適切な`CommanderError`を放出することができ、カスタムエラーハンドリングを想定通りに機能させることができます。

以下は`issues`サブコマンドで受け付ける`--labels`オプションが想定外の値だった場合バリデーションエラーにして、helpと、エラーメッセージを表示する方法です。

```js{12}
program
  .command('issues <repository-name>')
  .description('search issues filterd lables')
  .option('-l, --labels <labels>', 'comma separeted labels', parseLabels, [])
  .action(function (repositoryName, cmd) {
    const option = mergeOpts(cmd)

    const allowedLabels = ['bug', 'documentation', 'duplicate', 'enhancement', 'good first issue', 'help wanted', 'invalid', 'question', 'wontfix']
    option.labels.forEach(each => {
      if (!allowedLabels.includes(each)) {
        const msg = `"${each}" is not allowed value for -l, --labels option`
        this._exit(1, 'self.optionNotAllowedValue', msg)
      }
    })

    const command = require('../lib/commands/issues')
    return wrapCommand(command)(repositoryName, option)
  })

```

想定外のlabelが指定された場合、以下のようなエラー出力になります。
```sh
$ node bin/ghe.js -u creep_32 -p ****** -o my-org --api-base https://api.github.com -l bug,unexpected my-repository
Usage: ghe issues [options] <repository-name>

search issues filterd lables

Options:
  -l, --labels <labels>  comma separeted labels (default: [])
  -h, --help             display help for command

 WARN  "unexpected" is not allowed value for -l, --labels option
```

### サブコマンドにSuggestion機能を設ける
おまけに近い章になりますが、[Gridsomeの実装](https://github.com/gridsome/gridsome/blob/dcafdcc5010147d458b887076ec530330edca3fd/packages/cli/bin/gridsome.js#L53-L74)を参考に、サブコマンドのSuggestion機能を実装してみました。

[Specify the argument syntax](https://github.com/tj/commander.js/#specify-the-argument-syntax)を使うと、case文のdefault句のように、明示的に設定されていないサブコマンドが指定された場合のactionを実装することができます。

suggestionは、二つの文字列の違いをレベルで返却してくれる[leven](https://github.com/sindresorhus/leven)モジュールで実装しています。

```js{2,5}
// show a warning if the command does not exist
program.arguments('<command>').action(async function(command) {
  const availableCommands = program.commands.map(cmd => cmd._name)
  const suggestion = availableCommands.find(cmd => {
    const steps = leven(cmd, command)
    return steps < 3
  })
  console.log(suggestion)
  if (suggestion) {
    this._exit(1, 'self.thereIsSuggestion', `Did you mean ${suggestion}?`)
  } else {
    this.unknownCommand()
  }
})

```

不要な機能だと思うかもしれませんが、このような遊び心を加えておくことで、同CLIを使うユーザの中にいる感度の高い開発者が実装内容に興味を示す可能性があります。興味を持ってもらえれば、コントリビュートしてくれる可能性が高くなり、それは良い開発サイクルを生むきっかけになります。ちょっとしたこだわりも大切にしたいものです。

## Conclusion
本記事ではJavascriptでCLIを実装してみました。オペレーションの手順をドキュメントに記載するのはもう終わりにして、CLIを開発してチームに展開しましょう！それが文化になれば、楽しい開発サイクルにつながるはずです。

Thank you for commander.js !
