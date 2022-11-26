---
title: 明日から使える！激選GitHub Actions Tips 10
date: 2022-11-23 18:37:11
tags:
  - DevOps
  - CICD
---

![main image](./docker.png)

最近[GitHub Actions](https://docs.github.com/ja/actions)を使い倒しているので、明日から使えるTIPS１０選を紹介します。

<SampleCodeNote />

## Problem
GitHub Actions便利だしなんとなく使っているもののなんか使いこなせてない感がある、でも公式ドキュメント読むのも骨が折れます。それっぽいチートシートを探してみるも、なんともピンとくるものがありません。

## Solution
ということで、現在SRE部署のDevOpsチームというGitHub Actionsを触り倒している私が思う激選Tips10をご紹介します。
各項目の詳細の説明は[Discusion](#discusion)の章で説明します。言語はJavascriptになりますが、他の言語でも転用できるTipsに限定しています。

1. cache actionでキャッシュを使う
1. metrixを使いこなす
要注意ね
https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration
  Job matrix - A job matrix can generate a maximum of 256 jobs per workflow run. This limit applies to both GitHub-hosted and self-hosted runners.
1. code scaningをやる
1. slackに通知する
1. 使えるデフォルト変数
https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
1. compositeで再利用性および、可読性をあげる
1. 制御分一覧
1. マニュアル実行
1. 誰かの承認が必要なやつ
1. 別flowから呼ぶ方法
* 誰かの承認
1. scheduled
In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days.
1. concurrencyを使って、同じジョブがばんばん動かされない様にする
1. github tokenのやつ。いみがわからん
  https://docs.github.com/en/actions/using-workflows/triggering-a-workflow#triggering-a-workflow-from-a-workflow
1. 無駄にworkflow走らせない
  * ignore-path
    ファイルの比較方法
    * Pull requests: Three-dot diffs are a comparison between the most recent version of the topic branch and the commit where the topic branch was last synced with the base branch.
    *  Pushes to existing branches: A two-dot diff compares the head and base SHAs directly with each other.
    *  Pushes to new branches: A two-dot diff against the parent of the ancestor of the deepest commit pushed.
  ```
      on:
    push:
      paths-ignore:
        - 'docs/**'
  ```


https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration

## Discussion
[Solutionの章](#solution)の 各項目について詳細を説明してきます。なかなかのボリュームになっているので、必要な項目だけでも参考にしていただければ幸いです。

### 1.

## Conclusion

## Memo
* actions maerket places - https://github.com/marketplace/actions/
* self hosted runner
* reusable workflows
* check if cacneled signal
* context concurrency なんのためにあるやつ？？
　なるほど。これか
  ```
  # This allows a subsequently queued workflow run to interrupt previous runs
concurrency:
  group: '${{ github.workflow }} @ ${{ github.event.pull_request.head.label || github.head_ref || github.ref }}'
  cancel-in-progress: true
  ```
* 何に使うん？`GITHUB_TOKEN`: GITHUB_TOKEN is a secret that is automatically created for every workflow run, and is always included in the secrets context. For more information, see "Automatic token authentication."
 *  When you use the repository's GITHUB_TOKEN to perform tasks, events triggered by the GITHUB_TOKEN, with the exception of workflow_dispatch and repository_dispatch, will not create a new workflow run. This prevents you from accidentally creating recursive workflow runs.
 *  For example, if a workflow run pushes code using the repository's GITHUB_TOKEN, a new workflow will not run even when the repository contains a workflow configured to run when push events occur.
 *  If you do want to trigger a workflow from within a workflow run, you can use a personal access token instead of GITHUB_TOKEN to trigger events that require a token.
* actions/labeler@v4


### 流移転
* contextの存在しないプロパティアクセスは、エラーではなく空になる
If you attempt to dereference a non-existent property, it will evaluate to an empty string.
https://docs.github.com/en/actions/learn-github-actions/contexts#about-contexts
* trigger `push`はtagも含まれるよ！



### advanced
* [review dog](https://github.com/reviewdog/reviewdog#github-actions)


## foundemental
Workflow triggers
* Events that occur in your workflow's repository
* Events that occur outside of GitHub and trigger a repository_dispatch event on GitHub
* Scheduled times
* Manual


## simple usecase

### Use environment variables
```
jobs:
  example-job:
      steps:
        - name: Connect to PostgreSQL
          run: node client.js
          env:
            POSTGRES_HOST: postgres
            POSTGRES_PORT: 5432
```

### [sharing data between jobs](https://docs.github.com/en/actions/learn-github-actions/essential-features-of-github-actions#sharing-data-between-jobs)

save side
```
jobs:
  example-job:
    name: Save output
    steps:
      - shell: bash
        run: |
          expr 1 + 1 > output.log
      - name: Upload output file
        uses: actions/upload-artifact@v3
        with:
          name: output-log-file
          path: output.log
```

use side
`To download an artifact from the same workflow run, your download job should specify needs: upload-job-name so it doesn't start until the upload job finishes.`
```
jobs:
  example-job:
    steps:
      - name: Download a single artifact
        uses: actions/download-artifact@v3
        with:
          name: output-log-file
```

### expression
https://docs.github.com/en/actions/learn-github-actions/expressions

#### expression
`${{ <expression> }}`

if文の中では不要だよ

#### Literal
* null
* string
* number
* boolean

#### contain
Example matching an array of strings
Instead of writing github.event_name == "push" || github.event_name == "pull_request", you can use contains() with fromJson() to check if an array of strings contains an item.

For example, contains(fromJson('["push", "pull_request"]'), github.event_name) returns true if github.event_name is "push" or "pull_request".

#### format
```
Example escaping braces
format('{{Hello {0} {1} {2}!}}', 'Mona', 'the', 'Octocat')
Returns '{Hello Mona the Octocat!}'.
```

#### fromJson good use case
```
name: build
on: push
jobs:
  job1:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: echo "matrix={\"include\":[{\"project\":\"foo\",\"config\":\"Debug\"},{\"project\":\"bar\",\"config\":\"Release\"}]}" >> $GITHUB_OUTPUT
  job2:
    needs: job1
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ fromJSON(needs.job1.outputs.matrix) }}
    steps:
      - run: build
```

#### hash
maybe useful for cache key

Example with a single pattern
Matches any package-lock.json file in the repository.

hashFiles('**/package-lock.json')

Example with multiple patterns
Creates a hash for any package-lock.json and Gemfile.lock files in the repository.

hashFiles('**/package-lock.json', '**/Gemfile.lock')


#### success
Returns true when none of the previous steps have failed or been canceled.

```
steps:
  ...
  - name: The job has succeeded
    if: ${{ success() }}
```

#### always
```
if: ${{ always() }}
```

####  canceld
if: ${{ cancelled() }}


#### Object filters
You can yse `*` synatax
```
[
  { "name": "apple", "quantity": 1 },
  { "name": "orange", "quantity": 2 },
  { "name": "pear", "quantity": 1 }
]
```

The filter fruits.*.name returns the array [ "apple", "orange", "pear" ].


### using context

```
name: Run CI
on: [push, pull_request]

jobs:
  normal_ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run normal CI
        run: ./run-tests

  pull_request_ci:
    runs-on: ubuntu-latest
    if: ${{ github.event_name == 'pull_request' }}
    steps:
      - uses: actions/checkout@v3
      - name: Run PR CI
        run: ./run-additional-pr-ci
```


```services
name: PostgreSQL Service Example
on: push
jobs:
  postgres-job:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres
        env:
          POSTGRES_PASSWORD: postgres
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
        ports:
          # Maps TCP port 5432 in the service container to a randomly chosen available port on the host.
          - 5432

    steps:
      - uses: actions/checkout@v3
      - run: pg_isready -h localhost -p ${{ job.services.postgres.ports[5432] }}
      - run: ./run-tests
```

### jobs context

```
name: Reusable workflow

on:
  workflow_call:
    # Map the workflow outputs to job outputs
    outputs:
      firstword:
        description: "The first output string"
        value: ${{ jobs.example_job.outputs.output1 }}
      secondword:
        description: "The second output string"
        value: ${{ jobs.example_job.outputs.output2 }}

jobs:
  example_job:
    name: Generate output
    runs-on: ubuntu-latest
    # Map the job outputs to step outputs
    outputs:
      output1: ${{ steps.step1.outputs.firstword }}
      output2: ${{ steps.step2.outputs.secondword }}
    steps:
      - id: step1
        run: echo "firstword=hello" >> $GITHUB_OUTPUT
      - id: step2
        run: echo "secondword=world" >> $GITHUB_OUTPUT
```

example job context
```
{
  "example_job": {
    "result": "success",
    "outputs": {
      "output1": "hello",
      "output2": "world"
    }
  }
}

```

### runnter context
```
{
  "os": "Linux",
  "arch": "X64",
  "name": "GitHub Actions 2",
  "tool_cache": "/opt/hostedtoolcache",
  "temp": "/home/runner/work/_temp"
}
```

example of usecase
```
\name: Build
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build with logs
        run: |
          mkdir ${{ runner.temp }}/build_logs
          ./build.sh --log-path ${{ runner.temp }}/build_logs
      - name: Upload logs on fail
        if: ${{ failure() }}
        uses: actions/upload-artifact@v3
        with:
          name: Build failure logs
          path: ${{ runner.temp }}/build_logs
```

# use martrix
```
name: Test matrix
on: push

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [14, 16]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

# example contents of needs context

```
Example contents of the needs context
The following example contents of the needs context shows information for two jobs that the current job depends on.

{
  "build": {
    "result": "success",
    "outputs": {
      "build_id": "ABC123"
    }
  },
  "deploy": {
    "result": "failure",
    "outputs": {}
  }
}
```

exmaple context
```
name: Build and deploy
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      build_id: ${{ steps.build_step.outputs.build_id }}
    steps:
      - uses: actions/checkout@v3
      - name: Build
        id: build_step
        run: |
          ./build
          echo "build_id=$BUILD_ID" >> $GITHUB_OUTPUT
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: ./deploy --build ${{ needs.build.outputs.build_id }}
  debug:
    needs: [build, deploy]
    runs-on: ubuntu-latest
    if: ${{ failure() }}
    steps:
      - uses: actions/checkout@v3
      - run: ./debug
```

### Environment variables
```
name: Greeting on variable day

on:
  workflow_dispatch

env:
  DAY_OF_WEEK: Monday

jobs:
  greeting_job:
    runs-on: ubuntu-latest
    env:
      Greeting: Hello
    steps:
      - name: "Say Hello Mona it's Monday"
        run: echo "$Greeting $First_Name. Today is $DAY_OF_WEEK!"
        env:
          First_Name: Mona
```

### lfsは除外 checkout
```
     - name: Check out repo
        uses: actions/checkout@v3
        with:
          # Not all test suites need the LFS files. So instead, we opt to
          # NOT clone them initially and instead, include them manually
          # only for the test groups that we know need the files.
          lfs: ${{ matrix.test-group == 'content' }}
```

### cache sample

```
      - name: Cache nextjs build
        uses: actions/cache@v3
        with:
          path: .next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('package*.json') }}
```


### needs example

```
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - run: ./setup_server.sh
  build:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - run: ./build_server.sh
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: ./test_server.sh
```


### npm cache
```
This example demonstrates how to cache the ~/.npm directory:

jobs:
  example-job:
    steps:
      - name: Cache node modules
        uses: actions/cache@v3
        env:
          cache-name: cache-node-modules
        with:
          path: ~/.npm
          key: ${{ runner.os }}-build-${{ env.cache-name }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-build-${{ env.cache-name }}-
```
