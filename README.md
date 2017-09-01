# group-dependencies [![CircleCI](https://circleci.com/gh/itsthatguy/group-dependencies/tree/master.svg?style=svg)](https://circleci.com/gh/itsthatguy/group-dependencies/tree/master) [![npm version](https://badge.fury.io/js/group-dependencies.svg)](https://badge.fury.io/js/group-dependencies)

## Install

```
npm install group-dependencies
```

## Usage

```js
// package.json
{
  ...
  buildDependencies: [
    "webpack",
    "babel-cli"
  ]
  ...
}
```

```
$(npm bin)/deps install build
```
