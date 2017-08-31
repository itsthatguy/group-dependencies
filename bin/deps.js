#!/usr/bin/env node

require('colors');
var execSync = require('child_process').execSync;
var fs = require('fs');
var path = require('path');

var script = process.argv[2];
var group = process.argv[3];

if (script !== 'install') {
  console.log("There's only one command: `deps install [GROUP_NAME]`");
  process.exit(1);
}

if (!group || !group.length) {
  console.log("Please specify a group: `deps install [GROUP_NAME]`");
  process.exit(1);
}

const APP_ROOT = fs.realpathSync(process.cwd());

function resolveApp (relativePath) {
  return path.resolve(APP_ROOT, relativePath);
}

const appPkgPath = resolveApp('package.json');
var pkgJson = require(appPkgPath);

const groupDependencies = pkgJson[group + 'Dependencies'];
const devDependencies = pkgJson.devDependencies;

if (!groupDependencies) {
  console.log(`No ${group}Dependencies found.`);
  process.exit(0);
}

const toInstall = groupDependencies.map(function (gDep) {
  let pkgString = Object.keys(devDependencies)
  .reduce(function (result, name) {
    if (name !== gDep) return result;
    const versio1n = devDependencies[name];
    result.push(`${name}@"${version}"`);
    return result;
  }, []).join(' ');

  const warn = ['warn'.yellow, 'resolve'.magenta].join(' ');
  const info = ['info'.green, 'resolve'.magenta].join(' ');

  let msg;
  if (!pkgString) {
    msg = `${warn} ${gDep} not found: installing latest`;
    pkgString = gDep;
  } else {
    msg = `${info} ${pkgString}`;
  }
  console.log(`deps ${msg}`);
  return pkgString;

});

const packagesString = toInstall.join(' ');
const command = `npm install ${packagesString}`;
console.log(`deps ${'cmd'.green} npm install ${packagesString}`);

execSync(command, { stdio:[0, 1, 2] });
