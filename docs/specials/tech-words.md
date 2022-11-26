---
title: 技術用語集
date: 2020-01-01 14:05:31
tags:
  - tech word
---

# 技術用語集
技術の専門用語について例文とあわせてまとめています。技術情報は英語で書かれているものも多いので、英単語の直訳だとニュアンスがわからないものを中心まとめています。

::: details hoist

荷物の上げ下ろしや運搬に用いる小型の巻き上げ装置のことを指す[weblio](https://www.weblio.jp/content/hoist)。yarnのworkspaces機能でmonorepo管理をすると、各子プロジェクトのdependencyが、ルートのnode_modulesに巻き上げられてインストールされる。この機能がhoistingと呼ばれている。

> Packages like diff, pretty-format and the symlink to jest-matcher-utils were `hoisted` to the root node_modules directory, making the installation faster and smaller.
>
> [Yarn Workspaces](https://ssr.vuejs.org/guide/hydration.html)
:::

::: details hydration

SSRの文脈で度々出現する単語です。実際のDOMが先にあり、そこから Virtual DOMを生成するプロセスのことを指します。

> `Hydration` refers to the client-side process during which Vue takes over the static HTML sent by the server and turns it into dynamic DOM that can react to client-side data changes.
>
> [Vue ssr docs](https://ssr.vuejs.org/guide/hydration.html)
:::

::: details innersource
Open Sourceの開発プラクティスを、組織に採用すること。ソフトウェア開発プロセスだけでなく、組織文化も対象となる。
[Github article](https://resources.github.com/whitepapers/introduction-to-innersource/)

> Leading companies like PayPal, Bloomberg, and Walmart use `innersource` to build software for their teams and their customers
>
> [Github innersource article](https://resources.github.com/whitepapers/introduction-to-innersource/)
:::

:::  details silo
システムや組織がそれぞれ連携をとらず、(自己中心的に）孤立しているような状態。 [ITmedia](https://www.itmedia.co.jp/im/articles/0609/30/news018.html)
>  The slow, systematic practice of gathering requirements, holding meetings, and developing in `silos` is not in step with the pace of technology today
>
> [Github innersource article](https://resources.github.com/whitepapers/introduction-to-innersource/)
:::

:::  details triage
「肥大化した要求仕様の絞り込み」や「発見した不具合のうち、どれを即時対応するか」といった意志決定について、「トリアージ」という言葉を使うことがある。元々はフランス語で、コーヒー豆やブドウ、羊毛などを基準に従って選別することをいう。通常、災害医療などで使われる言葉で、傷病者（患者）を重症度と緊急性によって選び分ける作業をいう。 [ITmedia](https://www.itmedia.co.jp/im/articles/0612/12/news117.html)

>  `Triage`: Recommended for contributors who need to proactively manage issues and pull requests without write access`
>
> [Github Repository roles for organizations](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/repository-roles-for-an-organization#repository-roles-for-organizations)
:::
