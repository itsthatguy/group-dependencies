# group-dependencies
[![CircleCI](https://circleci.com/gh/itsthatguy/group-dependencies/tree/master.svg?style=svg)](https://circleci.com/gh/itsthatguy/group-dependencies/tree/master) [![npm version](https://badge.fury.io/js/group-dependencies.svg)](https://badge.fury.io/js/group-dependencies)

## Install

```
npm install group-dependencies
```

### Usage

```js
// package.json
{
  ...
  "dependencies": {
    "babel-cli": "^6.26.0",
    "colors": "^1.1.2"
  },
  "devDependencies": {
    "intercept-stdout": "^0.1.2",
    "jest": "^20.0.4",
    "strip-color": "^0.1.0"
  },
  "testDependencies": [
    "jest",
    "babel-cli"
  ]
  ...
}
```

### How it works

```js
// Here's the part that matters.
"testDependencies": [
  "jest",
  "babel-cli"
]
```

When you add an item to the `[GROUP_NAME]Dependencies` property
group-dependencies will scan your `devDependencies` for matching packages.
It will use the version specified there to do the install of the package.

The decision to use this strategy, with an array, was made so that we can
leverage a few things.
1. In your development enviroment, let `npm` manage installing your dev dependencies.
2. You only need to manage package versions in one location, reducing the overhead.

### Install command
```
$(npm bin)/deps install [GROUP_NAME]
```
