---
title: 自動テストを効率的にDocerizeするためのDockerfile構成
date: 2020-01-02 18:12:31
tags:
  - DevOps
  - IaC
---

![main image](./docker.png)

「Unitテスト、IntegrationテストコードもDocker化してCI環境で動かそう！」とチームで決定したとします。なんだが簡単にできそうな気がしますが、少し深く考えてみると考慮
事項がいくつかあることが見えてきます。例えば、既にアプリケーションをDockerizeしている場合は、`.dockerignore`ファイルを使いテストコードをコンテナーから除外しているのではないのかと思います。この記事ではコードベースに極力手を加えず、自動テストをDockerlizする方法を検討します。

## Problem
`Jenkins`などで自前のCI環境を構築し、複数プロジェクトで利用しているケースなどは良くあるかと思います。Jenkinsスレーブに各プロジェクトに必要なソフトウェアをインストールしたくない。ポートの競合が起きないようにしたい。といった場合、コンテナ技術はうってつけのソリューションです。ただし自動テストをDockerizeするうえでいくつかの考慮次項があります。

* Dockerイメージを最小化するため、アプリケーション用のコンテナからはテストコードを除外したい
* 開発の生産性を損なわぬようコードべースには余計な手を加えたくない
* Integration、E2Eなど各テスト毎のコンテナ化を効率化したい

## Solution
本Solutionの<SampleCode />です。

コードベースに余計な手を加えないためにも、Dockerのソリューションだけで解決することがポイントになります。具体的には、Dockerfileと[.dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file)をわけることにより実現します。加えて、各種テスト毎に同セットを用意したくないので、自動テストのDockerfileは[multi stage builds](https://docs.docker.com/develop/develop-images/multistage-build/)を併用し管理コストを最小化します。


::: tip Note
このSolutionは[Stack overflow](https://stackoverflow.com/a/57774684)を参考にしています
:::

### 最終ディレクトリ構成
<SampleCode />のアプリケーションはNodejsのExpressフレームワークでの簡単なREST APIがあり、JestでUnitテスト、Integrationtテストを実装しています。
.dockerignoreファイルをわけるためには、`${DOCKERFILE_NAME}.docerignore`という命名規則でファイルを配置することで、`docker build -f $DOCKERFILE_NAME ・・・`でイメージを作成すると命名規則に応じた.dockerignoreファイルがピックアップされます。

最終構成は以下のようになります。

::: vue
.
├── app.js
├── docker-build-and-run.sh
├── `Dockerfile.app` _(**for application**)_
├── `Dockerfile.app.dockerignore` _(**for application**)_
├── `Dockerfile.test` _(**for automation-test (multi-staged)**)_
├── `Dockerfile.test.dockerignore` _(**for automation-test**)_
├── integration-test
├── lib
├── node_modules
├── package.json
├── package-lock.json
└── Readme.md
:::

自動テスト用のDockerfileは`multi stage build`を利用することで管理コストを最小化しています。

<<< @/3code-tech-blog/docs/sample-code/tech/docker/dockerize-test-automation/Dockerfile.test{10-15,17-22}

Dockerizeされた自動テストの実行結果は以下のようになります。
```sh
# run unit test
$ bash docker-build-and-run.sh unit
・
・
Successfully built 78fccf9aa415
Successfully tagged 3code/unit-test:latest

> 3code-Tech-Blogcode-exaples_dockerize-test-automation@1.0.0 test:unit /opt/app
> jest --testPathIgnorePatterns integration-test/

PASS lib/__tests__/sum.spec.js
  sum function
    ✓ simple calc (4ms)
    ✓ simple calc with negative number (1ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.749s
Ran all test suites.


# run integration test
$ bash docker-build-and-run.sh integration
・
・
Successfully built 481fa0bfe4b9
Successfully tagged 3code/intregration:latest

> 3code-Tech-Blogcode-exaples_dockerize-test-automation@1.0.0 test:integration /opt/app
> jest integration-test

PASS integration-test/__tests__/sum-endpoint.spec.js
  sum endpoint
    ✓ simple calculation (37ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.778s
Ran all test suites matching /integration-test/i.
```

イメージのサイズを見ると、アプリケーション用のイメージからは不要なファイルが除外されていることがわかります。
:::vue
$ docker images
REPOSITORY           TAG                  IMAGE ID            CREATED             SIZE
3code/intregration   latest               481fa0bfe4b9        14 minutes ago      161MB
3code/unit-test      latest               78fccf9aa415        14 minutes ago      161MB
`3code/application`     latest               0dbef66b6983        18 minutes ago      `123MB`
node                 12.14.0-alpine3.11   1cbcaddb8074        10 days ago         85.2MB
:::

## Discussion
本記事はDockerfile構成のコンセプトを説明するのが目的のため、<SampleCode/>のテストコードは必要最低限のものになっています。
現実のアプリケーションではDocker Compose等を利用し、DBなどのバックエンドサービスをあわせて起動することになると思います。より現実に近い自動テストのDockerizeについても別の記事で紹介する予定です。

### .dockerignoreの詳細
application用のものからはテストコードを除外しています。自動テストのものはUnitテスト、Integrationテストで同じものを利用しています。Dockerfile、 .dockerignoreをさらに細分化することでそれぞれに必要なテストコードのみイメージに焼きこむことも可能ですが、管理コストとのトレードオフで自動テストは一つにまとめ、`multi stage build`の恩恵を受けらえるようにしています。

::: tip NOTE
Jesテストフレームワークでは、`__tests__`というディレクトリにテストコードを配置するのが慣習です
:::

#### application用
<<< @/3code-tech-blog/docs/sample-code/tech/docker/dockerize-test-automation/Dockerfile.app.dockerignore{1}

#### 自動テスト用
<<< @/3code-tech-blog/docs/sample-code/tech/docker/dockerize-test-automation/Dockerfile.test.dockerignore

### multi stage buildを利用している理由
本テストではあまりメリットがありませんが、例えばE2EテストもDockerizeするとした場合、E2E用のstageを作成し、Selenimu用のヘッドレスブラウザーがインストールされたDockerイメージを作るなどの拡張が可能です。

multi stage buildのDockerfileは以下のようにbuildすることが可能です。

```sh
# unit test
docker build -f Dockerfile.test --target unit . -t $TAG

# integration test
docker build -f Dockerfile.test --target integration . -t $TAG
```

### Dcoekr Composeでの利用
[Dcoker Composeのbuildオプション](https://docs.docker.com/compose/compose-file/#build)を利用することでよりシンプルに管理することが可能です。以下のようなCompose fileを用意し、`$ dcoker-compose -f $COMPOSE_FILE run unit`とすることで、DockerizeされたUnitテストを実行することができます。

::: warning
CI環境で実行する場合、CI環境にDocker Composeをインストールする必要があります
:::


<<< @/3code-tech-blog/docs/sample-code/tech/docker/dockerize-test-automation/docker-compose-unit-test-sample.yml

### Alternative Patterns
単純にフォルダを切ることでも実現可能です。好みの問題になりますが、個人的にはDockerfileはルートディレクトリの直下にあるほうが直観的である点と、ディレクトリを掘り出すとディレクトリ名や階層についての考慮次項が増えるので、前述の方法を紹介しました。

:::vue
.
└── dockerfiles
    ├── app
    │   ├── Dockerfile
    │   └── .dockerignore
    └── auto-test
        ├── Dockerfile
        └── .dockerignore

:::

## Conclusion
自動テストを効果的にDocerlizeする方法を紹介しました。アプリケーションだけでなく、自動化プロセスや、Adminプロセスをどんどんコンテナ化しDevOpsを推し進めていきましょう！
