require('colors');
var fs = require('fs');
var path = require('path');
var runCommand = require('./runCommand');

module.exports = function (script, group) {
  if (script !== 'install') {
    console.log("There's only one command: `deps install [GROUP_NAME]`");
    return 1;
  }

  if (!group || !group.length) {
    console.log("Please specify a group: `deps install [GROUP_NAME]`");
    return 1;
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
    return 0;
  }

  const toInstall = groupDependencies.map(function (gDep) {
    let pkgString = Object.keys(devDependencies)
    .reduce(function (result, name) {
      if (name !== gDep) return result;
      const version = devDependencies[name];
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
  runCommand(`NODE_ENV=${group} ${command}`);
  return 0;
};
