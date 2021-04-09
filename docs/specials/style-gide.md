---
title: コードスニペット
date: 2020-01-01 14:05:31
tags:
  - code snippets
---

<div v-if="$lang === 'ja'">
<h1>3code style guide</h1>
<p>
勝手にコードスタイルガイド
</p>
</div>
<div v-if="$lang === 'en-US'">
<h1>Code Snipets Often Used</h1>
<p>The Code snipets I often used when develop, operation and more. </p>
<p>If you have better practices, please <router-link :to="'/en/contact/'">keep in touch with me.</router-link></p>
</div>

## common coding
::: naming converstaion
* varibales name of index is `idx` wheen loop, forEach or iteration
:::


## coding test case
::: naming converstaion for test
* variables name is `sut`(system under test) which keep target
:::

::: details need sanity check for integration test
* databaseとかのテストやるときは、sanity-chekcしようね
:::
