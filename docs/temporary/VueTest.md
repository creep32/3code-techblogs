# end to end test
* slowly
* debugging them can be difficult.(especially on the ci)
  ※ One way to avoid the reproducibility problem is to run end-to-end tests in a reproducible environment, like a Docker container.
* flaky. Flaky tests are test that frequently fail even the application they are testing is working.

# unit test
* A happy side effect of unit ttest is that they provide documentation
* A big problem with unit tests is that they make it difficult to refactor code.
  ※ If you dicide one function to separeate functions, you need to change the unit tests as well as the code. this can make refactoring a lot less appealing.
* Another problem with unit tests is that they check only individual parts of an application.

# Snapshot testing
snapsho test takes a picture of your running application and compares it agains previously save pictures. if the picture are diffferent, the test fails.

* 間違い探し的な
* Traditional snapshot tests launch an app in a browser and take a screenshot(osやbrowserの差異の影響をめっちゃうける)
* Jset snapshot test, instead serialized value in JS.You can use them to compare the DOM output from Vue components.


# TDD apploche book recommend
My general approach to writing a Vue component
1.  Decide the components I need.
2.  Write unit tests and source code for each component.
3.  Style the components.
4.  Add snapshot tests for the finished components.
5.  Test the code manually in the browser.
6.  Write an end-to-end test.



# vue overview

## vue instance
. Every application contains at least one Vue instance, and when you write unit tests for a component, you will create a Vue instance with the component under test.

## component
 you can think of components as the building blocks of an application.

SFC = single-file-components


## Unit testing components
Deciding what unit tests to write is important. If you wrote tests for every property of a component, you would slow development and create an inefficient test suite.

One method for deciding what parts of a component should be tested is to use the concept of a component contract. A component contract is the agreement between a component and the rest of the application.


The idea of input and output is important in component contracts. A good component unit test should always trigger an input and assert that the component generates the correct output

# sanity test
そもそもテストセットアップちゃんとできてるよねテスト

# jest
jsdomっていうDOMエミュレータ上で動くため、
実際Vueは内部でdocument.createElementとかbrowser環境のAPIを使うけれども、tset上で動かすことができる。(全APIがあるわけではないので注意)

# mountとかボイラープレートナコードがたくさん
## INTRODUCTION TO VUE TEST UTILS
The Vue Test Utils library makes unit testing Vue components easier. It contains helper methods to mount components, interact with components, and assert the component output. You’re going to use this library a lot in your unit tests, so it’s important that you understand the API.
https://learning.oreilly.com/library/view/testing-vuejs-applications/9781617295249/OEBPS/Text/kindle_split_012.html#

# テストはかきすぎない、リファクタがきついから
* Test only output that is dynamically generated.
* Test only output that is part of the component contract.


# chapter 4 covers
* Testing components methods
* Testing code the uses timer functions
* Using mocks to test code
* Mocking module dependencies

## Testing ocde the uses timer functions
`setInterval` timer function to increment its width over time, so you need to use fake timers to test it
You can use lots of libraries to mock fake timers, but in this book I’ll show you how to use Jest fake timers. Jest fake timers work by replacing the global timer functions when you call the `jest.useFakeTimers` method. After you’ve replaced the timers, you can move the fake time forward using a `runTimersToTime`

```
// Add the code in the following listing to the top of the describe block
beforeEach(() => {            1
  jest.useFakeTimers()        2
})
```

## spies
Ofen when you test code that uses an API that you don not control, you need to check that a function in the API has been called.
For example, suppose you were running code in a browser and wanted to test that `window.clearInterval` was called. How would you do that ?

in the Jest `Jest.spyOn` function is this.
The spyOn function gives you the ability to check that a function was called useing the `toHaveBeenCalled` matcher.


```
jest.spyOn(window, 'someMethod')               1
window.someMethod ()
expect(window.someMethod).toHaveBeenCalled()   2
```

## mocking

Jest includes a mock function implementation. You can create a mock function by calling jest.fn, shown in the next code sample.


```
const mockFunction = jest.fn()            1
mockFunction(1)
mock(2,3)
mockFunction.mock.calls // [[1], [1,2]]   2
```


# chapter 4
## Summary
* you can trigger native DOM events with the wrapper trigger method.
* You can test that a compoment responds to emitted events by calling $emit on a child component intance
```
// from document
// wrapper.find(Modal).vm.$emit('close-modal')

// the real ModalApp.vue
 const wrapper = shallowMount(ModalApp)
 wrapper.find(Modal).vm.$emit('close-modal')
 await wrapper.vm.$nextTick()

 expect(wrapper.find(Modal).exists()).toBeFalsy(
```

* you can test that component emitted a Vue custom event with the wrapper emitted method


# chamter6 vuex
The main difference between Vuex and Redux is that Vuex mutates the store state, whereas Redux creates a new store state on every update.

By using a Vuex store, you avoid the problem of data getting out of sync between components.

## one way ata flow
To understand the store, you need to understand a core concept that Vuex follows.
One-Way data flow is that it is eaier to track where the data in an app is comming fro,. Is simplifies the application lifecycle and avoids complicated relationships between components and the state.

* direct mutation is not able to
* to update the store state, you should commit mutations
* commit is a Vuex function that you call with a mutation name and optional value.
```
$store.commit('increment')
* Mutations must be synchronous—they can’t contain actions like API calls or database connections.
*  If you want to edit the state asynchronously, you can use actions.

## actions
* You can think of Vuex actions as asynchronous mutations. for example, you nedd to make an AJAX call to fetch data to commit to the Vuex store.
* Then you could dispatch the action inside a component with the store `dispath` method
```
// in the componentn
methods: {
  fetchItems() {
    this.$store.dispatch('fetchItems')
  }
}
```

## getters
Vuex getters are like computed properties for stores. They reevaluate their value only when the data they depend on has changed.(calulated valu is cached as long as relyed on value has not changed )


# ch7 Testing a vuex store instance
The alternative to testing mutations, getters, and actions separately is to combine them into a store instance and test the running instance. That way, you avoid mocking Vuex functions

back to the principle..
* input for the Vuex
  * Mutations
  * actions

* output for the vuex
  * store state
  * the result of getters


単純に以下のようにすればテストできるが、Vuex was installed on the Vue base constructor. Installing plugins on the base constructor can cause leaky tests because future tets use the polluted Vue constrcutor. to avoid them, you need to learn how to use a `localValue` constructor

```
test('increment update state.count by 1', () => {
  Vue.use(Vuex)
  const cloned = cloneDeep(storeConfig)
  const store = new Vuex.Store(cloned)
  expect(store.state.count).toBe(0)
  store.commit('increment')
  expect(store.state.count).toBe(1)
})
```
PluginのインストールはVueのBase Constructorに影響を与えちゃうので、（その後のテストに全部影響するので）、localVueにプラグインをインストールすると幸せになれる

 localVue constructor extends from the Vue base constructor, so any previous changes to the Vue base constructor will be included in the localVue

## ch8. Orgnaizing tests with factory functions

## ch 10 test router
insall VueRouter, $route, $routers properties is added to the Vue instance

VueRouterをpluginとしてinstallすることもできるが、$route, $routesはreadOnlyになるので、値をいじりたい場合は`mock`を使う必要があります

# storeの値を、routerのパス変更にあわせて変更したいような場合

The first step is to install the package as a dependency. Run the following install command:

```
npm install --save vuex-router-sync
# Add the following import statement to src/main.js:

import { sync } from 'vuex-router-sync'

# In src/main.js, after you create the store and router instances, call sync to sync them together as follows:

sync(store, router)
```

# ch12 writing snapshot test

## understanding snapshot tests
The first time a snapshot test runs, Jest creates a snap file with the value passed to expect. Imagine that you wrote a snapshot test for a ListItem component that rendered an <li> tag. You would mount the component and then create a snapshot using the wrapper DOM node shown next.

Jest manages snap files for you. The snap files are generated with a .snap extension in the __snapshots__ directory, which is created in the same directory as the test file.

this files should be commited to git

You can rewrite a snap file by calling Jest with the –-update flag. To do that in your test suite, call your test:unit script with an extra updateSnapshot parameter, as follows:

```
# document recommmended
expect(wrapper.element).toMatchSnapshot()

```

```
$ npm run test:unit -- --updateSnapshot
$ npm run test:unit -- -u
```

one rule of snapshot tests is that they must be deterministic. This can be a problem when you use nondeterministic functions, like `Date.now.`

```
    const dateNow = jest.spyOn(Date, 'now')
    const dateNowTime = new Date('2018')

    dateNow.mockImplementation(() => dateNowTime) .
    .
    ,
    dateNow.mockRestore()
```

My workflow is to write unit tests to cover the core component functionality. After I have unit tests, I style the component without any extra tests and manually test the style in the browser. When I’m happy with the component style, I add a snapshot test (see figure 12.3). I’ve found this system works well. I get good coverage from unit tests, but I’m free to quickly change the style.

![workflow test](https://learning.oreilly.com/library/view/testing-vuejs-applications/9781617295249/OEBPS/Images/12fig03.jpg)


## e2e test
Nigthwatch

start: 16.9k
watch 324
contri 129
ahttps://github.com/cypress-io/cypress


angular は切り替えられる

papetters

Puppeteer
star: 56.8k
watch 1,.2k
contrl 245
https://github.com/puppeteer/puppeteer