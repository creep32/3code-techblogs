# google natural language
テキストの構造や、意味を明らかにするために機械学習が使用されます。人、場所、イベントに関する情報を抽出し、SNSに現れる感情やお客様との会話について理解を深めることができます

## AutoML Natural Language
最小限の労力と、機械学習の専門知識で高品質な独自のカスタム機械学習モデルをトレーニングすることで、感情の分析、抽出、検出ができます。

![workflow-of-autoML-natural-language](https://cloud.google.com/images/natural-language/automl-works.svg?hl=ja)

1. Upload your documents Label text based on your domain-specific keywords and pharase

1. train your custom model classify, extract and detect sentiment

1. Get insights that are releant your specifi needs


## Natural Language API
事前トレーニング済みモデルにより、デベロッパーは感情分析、エンティティ分析、エンティティ感情分析、コンテンツの分類、構文解析など、自然言語理解の機能を活用できます

## 検索メモ
* 同義語の設定
* 特定のクエリにおける検索結果の並び替え
* 重みづけやブースと
* 誤字の許容機能
* ステミング
* バイグラム

#### Elastic memo
* ユーザの行動を完全に可視化するElastic Searchアナりティクス
* [site-search](https://www.elastic.co/jp/products/site-search) - クローリングしていい感じにやってくれる

# elastic search
* document is stored, it is indexed.
* ES uses a data structure called an `inverted index` that supports very fast full-text-searces.
* an index can be thought of as an optimized collection of documents and each document is a collection of fiedls, which are the key-value pairs that contain your data
* default, ES indexes all data in every field and each indexed field has a dedicated, optimized data structure (eg. texit are stored in inverted indices, number and geo fields are stored in BKD trees)
* `dynamic mapping is enabled` ES automatically detects and adds new fields to the index.
* if you know modre about your data and how you want to use it that ES can. you can define rules to control dynamic mapping and explicity define mappings to take full control of how field are stored and indexed.
* Defining your own mapping enables you to
    * Distinguish between full-text string fields and exact value string fields
    * Perform language-specific text analysis
    * Optimize fields for partial matching
    * Use custom data formats
    * Use data types such as `geo_point` and `geo_shape` that canot be automatically deected
    * 同じフィールドを複数のindexで管理することも可能(full-text and keyword)
* The analysis chain that is applied to a full-text field during indexing is also used at serarch time.


# intaract es
```
# health check
GET /_cat/health?v

# list indices
GET _cat/indices?v
```

# gcp basic
## プロジェクト
* 組織内のプロジェクトをグループ化して、フォルダにまとめる
* フォルダには、複数のプロジェクトや他のフォルダを含めることができる
* フォルダを使用して、ポリシーを割り当てる

## 組織ノード
root node of resouce of gcp
* 組織管理者
* プロジェクト管理者

## IAMリソース階層の例
- ポリシーはリソースに対して設定される
- - 各プリシーには、役割のセットと、役割のメンバーが含まれる

- リソースは親リソースからポリシーを継承
- -　自身と親の和集合
- -  自身の制限より、親リソースの制限が緩い場合、親リソースのポリシーが優先

#### IAM
いか4種類のプリンシパルのいずれかに適用可能
- Google アカウント、Cloud Identity user
- service account
- Gogle Group
- CLoud Identity or G suite domain

* サーバ間のやりとりは、サービスアカウントでコントロール

#### サービスアカウントとIAM
* サービスアカウントはキーを使用して認証する
* IAMの事前定義の役割または、カスタム役割をサービスアカウントに割りあてることができる


* monitoring
* stackdriver






