## overivew

### editorconfig
vscodeの場合、以下が必要
- `npm i -g editorconfig`
- install extension



##
#### babel
```js
npm install --save-dev babel-cli babel-preset-env

echo '{
  "presets": ["env"]
}' >> .babelrc




# "build": "npm run lint && babel ./src -d ./lib",
```
### eslint
```js
npm i -D eslint eslint-plugin-import eslint-config-airbnb-base

echo '{
  "extends": "airbnb-base"
}' >> .eslintrc.json

#  "lint": "eslint ./src"
```

and install vscode eslint extensionnpm i -D mocha


### lint-staged
Starting with v3.1 you can now use different ways of configuring it:

* lint-staged object in your package.json
* .lintstagedrc file in JSON or YML format
* lint-staged.config.js file in JS format
Pass a configuration file using the --config or -c flag

```
$ npm i -D lint-staged
$ cat .lintstagedrc
{
  "*.{js,vue}": ["eslint --fix", "git add"]
}
```

### versionの管理方法

### markdown lint
```
$ cat .lintstagedrc
{
  "docs/**/*.md": ["yarn lint-md", "git add"]
}

$ cat .remarkrc
{
  "plugins": [
    "preset-lint-recommended",
    "preset-lint-consistent",

    ["lint-list-item-indent", "space"],
    ["lint-heading-style", false]
  ]
}

$ grep "lint" package.json
"lint-md:wording": "textlint ./docs/**/*.md",
"lint-md:style": "remark --quiet --frail .",
"lint-md": "yarn lint-md:style && yarn lint-md:wording"

npm i -D remark-cli
npm i -D remark-lint
npm i -D remark-preset-lint-consistent
npm i -D remark-preset-lint-recommended
npm i -D textlint
npm i -D textlint-filter-rule-comments
npm i -D textlint-rule-apostrophe
npm i -D textlint-rule-common-misspellings
npm i -D textlint-rule-diacritics
npm i -D textlint-rule-en-capitalization
npm i -D textlint-rule-stop-words
npm i -D textlint-rule-terminology
npm i -D textlint-rule-write-good

```

### git commit
#### git commit lint
https://wp-kyoto.net/add-commitlint-with-husky-to-lint-git-commit-message
```
  $ npm i -D huskey
  # from vuepress
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
  ```

#### change log automation
https://wp-kyoto.net/generate-changelog-by-conventional-changelog-cli



### test
#### moca
```
npm i -D mocha

$ cat package.json
"test": "mocha --require babel-core/register"

$ cat .eslint.json
"env": {
  "moca": true
}

# for coverage
npm i -D nyc
# cat package.json (add nvc start test script)
"test": "nyc mocha --require babel-core/register"

```

### jest
```
$ npm i -D eslint-plugin-jest

```


### environment variables

### cycle ci vs travice ci

### jsdoc

### Node.ENV varibales detailes

### vscode
## how to use jsDoc for intelisence, and basic knowledge
https://github.com/Microsoft/TypeScript/wiki/JavaScript-Language-Service-in-Visual-Studio

## easymotion
https://github.com/VSCodeVim/Vim#vim-easymotion

## surroud vim
https://github.com/VSCodeVim/Vim#vim-surround


## use npm version command
 npm version patch -m "Update to %s for reaons"

 これやったあと、publishするのが一般的らしい
