#!/usr/bin/env node

require('colors');
var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');

var script = process.argv[2];

if (script !== 'install') {
  console.log("There's only one command: `bdep install`");
  process.exit(1);
}

const APP_ROOT = fs.realpathSync(process.cwd());

function resolveApp (relativePath) {
  return path.resolve(APP_ROOT, relativePath);
}

const appPkgPath = resolveApp('package.json');
var pkgJson = require(appPkgPath);

const buildDependencies = pkgJson.buildDependencies;
const devDependencies = pkgJson.devDependencies;

if (!buildDependencies) {
  console.log('No build dependencies specified.');
  process.exit(0);
}

const toInstall = buildDependencies.map(function (bDep) {
  let pkgString = Object.keys(devDependencies)
  .reduce(function (result, name) {
    if (name !== bDep) return result;
    const version = devDependencies[name];
    result.push(`${name}@"${version}"`);
    return result;
  }, []).join(' ');

  const warn = ['warn'.yellow, 'resolve'.magenta].join(' ');
  const info = ['info'.green, 'resolve'.magenta].join(' ');

  let msg;
  if (!pkgString) {
    msg = `${warn} ${bDep} not found: installing latest`;
    pkgString = bDep;
  } else {
    msg = `${info} ${pkgString}`;
  }
  console.log(`bdep ${msg}`);
  return pkgString;

});

const packagesString = toInstall.join(' ');
const command = `npm install ${packagesString}`;
console.log(`bdep ${'cmd'.green} npm install ${packagesString}`);

execSync(command, { stdio:[0, 1, 2] });
