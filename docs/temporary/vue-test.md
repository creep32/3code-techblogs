# references
* [safari books](https://learning.oreilly.com/library/view/testing-vuejs-applications/9781617295249/OEBPS/Text/kindle_split_010.html)

## glossary
* `flaky test`: e2eのテストが時たまなぞに事象で失敗すること？


## Snapshot testint
written by overview testing... after, unit-test, e2e test
similar to  間違い探しゲーム、
A snapshot test takes a picture of your running application and compares it against previously saved pictures. If the pictures are different, the thest fails. This test method is a useful way to make sure an application continues to render correctly after code chagnes.

Traditonal snapshot test launch an application in a brower and take a screenshot of the renderer page. Therey compare the newly taken screenshot to a saved screenshot and display an error if differences eixst.
this have problem...
when differences between OS or browser version cause test to fail even though the snapshot has not changed.
Instead of comparing screenshots, Jest snapshot tests can compare any serializable value in JavaScript

::: warn
No integration test 
I don’t recommend writing integration tests for frontend code. Integration tests on the frontend are difficult to define, difficult to write, and difficult to debug.
:::

## input and output(components construct) is important
VUe component exampe input and output
* input
  * Component props
  * User actions(like a button click)
  * Vue events
  * Data in a Vuex store
* output
  * Emitted events
  * External founction calls

  