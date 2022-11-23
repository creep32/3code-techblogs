---
title: 2022年 - OpenAPI（旧:Swagger）エコスステムの充実度がヤバい！
date: 2022-02-17 13:49:40
tags:
  - DevOps
  - OAS
---

![main image](./oas-logo.png)

Web APIを開発している皆様、OpenAPI（以降`OAS`と表記）使ってますか？API開発を効率化していきたいなーと思い、久しぶにエコシステムをチェックしたら、その充実具合にテンション爆上がりでした。熱量そのままに、最新エコシステム郡を使ったAPI開発フローを検証してみたのでご紹介します。

本記事で記載の内容は、オフィシャルの[ベストプラクティス](https://oai.github.io/Documentation/best-practices.html)に乗っ取り、[Design-First Approach](https://oai.github.io/Documentation/best-practices.html#use-a-design-first-approach)での開発フローとなります。Code-First Approachのようにコード先行で、annotationなどからOASを生成をするようなフローについては言及しません。（経験上Code-First Approachだと形骸化、最新API使用共有のタイムラグが発生するため）

::: warning 注記
[Open API](https://www.openapis.org/)をご存じない方は、先に概要をご確認ください。もしAPI設計を、Excelなどで実施されているのであれば、明日から切り替えることをお勧めします。
:::

<SampleCodeNote />

## Problem
Web APIをチーム開発する場合OASは必須と言っても過言ではないかと思いますが、[ベストプラクティス](https://oai.github.io/Documentation/best-practices.html)にあるように、[Design-First Approach](https://oai.github.io/Documentation/best-practices.html#use-a-design-first-approach)が必要だとわかっていても以下のような理由から積極的に実施できないチームもあるのではないかと思います。

1. 定義できる項目も多いでの教育コストが高い
1. ドキュメンティング嫌いのコード至高主義のエンジニアが言うことを聞いてくれない
1. [Single Source of Truth](https://oai.github.io/Documentation/best-practices.html#keep-a-single-source-of-truth)を徹底しようと思うと、どこのリポジトリにおくか、自動化機構がないとメンテナンス、アナウンスにコストがかかる

これらの阻害要因のいずれも、かけるコストに対する費用対効果を上げれれば、啓蒙活動などせずとも導入が進んでいくはずです。ナポレオンも言っている通り`利益`を提示することで開発者達を動かしていきましょう！

## Solution
例としてSPAを開発する以下のようなチーム構成があるとします。

OASエコシステムを使い倒すことで、開発フローの効率化、テストの効率化をしていきます。
[OpenAPI.Tools](https://openapi.tools/)にエコシステムの一覧が紹介されています。いくつかタイプがありますが、本Solutionで使うエコシステムのタイプを太字 + :tada:としました。

> * Auto Generators: Tools that will take your code and turn it into an OpenAPI Specification document
> * Converters: Various tools to convert to and from OpenAPI and other API description formats.
> * **Data Validators** :tada: : Check to see if API requests and responses are lining up with the API description.
> * **Description Validators** :tada: : Check your API description to see if it is valid OpenAPI.
> * **Documentation** :tada: : Render API Description as HTML (or maybe a PDF) so slightly less technical people can figure out how to work with the API.
> * DSL: Writing YAML by hand is no fun, and maybe you don't want a GUI, so use a Domain Specific Language to write OpenAPI in your language of choice.
> * GUI Editors: Visual editors help you design APIs without needing to memorize the entire OpenAPI specification.
> * Learning: Whether you're trying to get documentation for a third party API based on traffic, or are trying to switch to design-first at an organization with no OpenAPI at all, learning can help you move your API spec forward and keep it up to date.
> * Miscellaneous: Anything else that does stuff with OpenAPI but hasn't quite got enough to warrant its own category.
> * **Mock Servers** :tada: : Fake servers that take description document as input, then route incoming HTTP requests to example responses or dynamically generates examples.
> * **Parsers** :tada: : Loads and read OpenAPI descriptions, so you can work with them programmatically.
> * SDK Generators: Generate code to give to consumers, to help them avoid interacting at a HTTP level.
> * Security: By poking around your OpenAPI description, some tools can look out for attack vectors you might not have noticed.
> * Server Implementations: Easily create and implement resources and routes for your APIs.
> * **Testing** :tada: :  Quickly execute API requests and validate responses on the fly through command line or GUI interfaces.
> * Text Editors: Text editors give you visual feedback whilst you write OpenAPI, so you can see what docs might look like.


それぞれのタイプについて利用するツールと、利用目的を記載します。OASのVersionは`>3.0`の想定で、本ブログはJavascript(Nodejs)推しのため、可能無範囲でNodejsで実装されており、GitHubのスターが多く、CICDに組み込みやすいようCLIで動かせるツールという観点で選定しました。（各ツールの検証内容、使い方の詳細は[Discusion](#discusion)の章で説明します。）
* Data Validators: [prism](https://stoplight.io/open-source/prism/)
    * proxyサーバ経由でやるよね
* Description Validators: [Redocly/](https://github.com/Redocly/openapi-cli)
    * そこそこオプションがあるからね
* Documentation: [Stoplight](https://stoplight.io/)
    * ドキュメントプラス
    * テスターのテスト
* Mock Servers: [prism](https://stoplight.io/open-source/prism/)
    * mockだよね
* Parsers: [swagger-parse](https://github.com/APIDevTools/swagger-parser)
    * パースしてパフォテとか
* Testing: [portman](https://github.com/apideck-libraries/portman)
  * 開発者ようテスト
  * テスターのテストは、Stoplight


::: warning
Security（Testing）ということで、[OWASP ZAP](https://www.zaproxy.org/)を組み込みたかったのですが、記事のボリュームが大きすぎるのでスキップ。パフォーマンステストにおいては、[ReadyAPI](https://smartbear.com/product/ready-api/overview/)が使えそうでしたが、GUIツールのためスキップ。興味がある方は是非ご覧ください。
:::

## Discusion
[Solutionの章](#solution)で紹介したツールの詳細、使い方について記載していきます。

OASには、お馴染みの[petostore（オフィシャルサンプル）](https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.0/petstore-expanded.yaml)を使っていきます。


## Conclusion
本記事ではカスタムDockerイメージにタグを振ることなくdocker runする方法を紹介しました。Dockerfileをそのまま実行できるような感覚なので、スクリプトをシンプルに保つことができます。
