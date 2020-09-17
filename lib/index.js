require('colors');
var fs = require('fs');
var path = require('path');
var runCommand = require('./runCommand');

const warnMsg = ['deps', 'warn'.yellow, 'resolve'.magenta].join(' ');
const infoMsg = ['deps', 'info'.green, 'resolve'.magenta].join(' ');

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
  const dependencies = pkgJson.dependencies;
  const devDependencies = pkgJson.devDependencies;

  if (!groupDependencies) {
    console.log(`No ${group}Dependencies found.`);
    return 0;
  }
  let devDependenciesKeys = Object.keys(devDependencies)
  let dependenciesKeys = Object.keys(dependencies)

  let toInstall = [];

  for (const gDep of groupDependencies) {
    // the entry in gDep is a dependency
    if (dependenciesKeys.includes(gDep)) {
      toInstall.push(installFromObject(dependencies, gDep))
    }
    // the entry in gDep is a devDependency
    else if (devDependenciesKeys.includes(gDep)) {
      toInstall.push(installFromObject(devDependencies, gDep))
    }
    // the entry is not found
    else {
      // install the latest
      toInstall.push(installLatest(gDep))
    }
  }

  console.log(`deps ${'cmd'.green} npm install ${toInstall.join(' ')}`);

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  runCommand(npmCmd, ['install', ...toInstall], group);
  return 0;
};

// installs gDep based the given obj
function installFromObject(obj, gDep) {
  const version = obj[gDep];
  const installCommand = `${gDep}@${version}`
  console.log(`${infoMsg} ${installCommand}`);
  return installCommand
}

// installs the latest gDep
function installLatest(gDep) {
  const installCommand = `${gDep}`
  console.log(`${warnMsg} ${installCommand} not found: installing latest`);
  return installCommand
}
