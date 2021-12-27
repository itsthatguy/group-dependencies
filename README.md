# group-dependencies
![Node.js CI](https://github.com/itsthatguy/group-dependencies/workflows/Node.js%20CI/badge.svg) [![npm version](https://badge.fury.io/js/group-dependencies.svg)](https://badge.fury.io/js/group-dependencies)

## What

**npm** gives you two groups to specify dependencies (i.e. dev and prod).
In the real world, we have multiple dependency environments (e.g. test, build,
production, development).

Let’s say you run webpack on heroku to build your app. There are 2 options:
1. Set `heroku config:set NPM_CONFIG_PRODUCTION=false` to install all dependencies (including testing dependencies)
2. Put your build dependencies in `dependencies` (i.e. production environment)

With group-dependencies, you can declare your build dependencies in a separate
property, `buildDependencies`, and install only those packages as needed, by
adding to `"scripts": { "heroku-postbuild": deps install build" }`
to your `package.json`.

## Installation

```
npm install group-dependencies
```

OR in CI/CD only 

npm:
```npm install group-dependencies@git+https://github.com/defiyield-info/group-dependencies#0.1.0-beta.3```

yarn:
```yarn add group-dependencies@git+https://github.com/defiyield-info/group-dependencies#0.1.0-beta.3```

## Usage

First, add a new dependencies group to `package.json`:
```js
{
  ...
  "devDependencies": {
    "intercept-stdout": "^0.1.2",
    "jest": "^20.0.4",
    "strip-color": "^0.1.0"
  },
  // our new group representing testing dependencies
  "testDependencies": [
    "jest"
  ]
  ...
}
```

Now you can install _only_ the dependencies for this new group:

```shell
# This will install jest@^20.0.4:
deps install npm test
```

### Command
```shell
# Install dependencies in the named group
deps install npm [GROUP_NAME]
```

### How it works

Any item added to the `[GROUP_NAME]Dependencies` property will be installed with
`deps install [GROUP_NAME]`. If a matching package is found in `devDependencies`,
that version will be installed.

```js
// Here's the part that matters.
"buildDependencies": [
  "webpack",
  "@babel/preset-env"
]
```

The decision to use this strategy, with an array, was made so that we can
leverage a few things.
1. In your development enviroment, let `npm` manage installing your dev dependencies.
2. You only need to manage package versions in one location, reducing the overhead.
