# 3code-tech-blog src

[3code Tech Blog](https://tech-blog.3code.dev) is my blog.

This repository contains source markdown, and sample codes.

## Directory Structure
* `/docs/en/blogs/tech/**` contains English Post source
* `/docs/blogs/tech/**` contains Japanese Post source
* `/docs/sample-code/**` contains sample-code written by English for the both language.

```
docs/
├── blogs
│   └── tech
│       └── ${TEMA}
│           └── ${EACH_POST}.md
├── en
│   └── blogs
│       └── tech
│           └── ${TEMA}
│               └── ${EACH_POST}.md
└── sample-code
    └── ${EACH_POST}
        └── sample_codes ...

```

For exmaple. docker test automation article's sample codes
```
docs/
├── blogs
│   └── tech
│       └── docker
│           └── dockerize-test-automation.md
├── en
│   └── blogs
│       └── tech
│           └── docker
│               └── dockerize-test-automation.md
└── sample-code
    └── tech
        └── docker
            └── dockerize-test-automation
                ├── app.js
                ├── docker-build-and-run.sh
                ├── docker-compose-unit-test-sample.yml
                ├── Dockerfile.app
                ├── Dockerfile.app.dockerignore
                ├── Dockerfile.test
                ├── Dockerfile.test.dockerignore
                ├── integration-test
                │   └── __tests__
                │       └── sum-endpoint.spec.js
                ├── lib
                │   ├── sum.js
                │   └── __tests__
                │       └── sum.spec.js
                ├── package.json
                ├── package-lock.json
                └── README.md

```

## See Also
* The detail of my blog posts format
  * [English](https://tech-blog.3code.dev/about/me.html#blog%20post%20format)
  * [Japanese](https://tech-blog.3code.dev/about/me.html#%E8%A8%98%E4%BA%8B%E3%81%AE%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88)
