require('colors');
var fs = require('fs');
var path = require('path');
var runCommand = require('./runCommand');

const pmEnum = {
  npm: 'npm',
  yarn: 'yarn',
};

const scriptEnum = {
  install: 'install',
  v: 'v',
};

const pms = Object.values(pmEnum);

module.exports = function (script, packageManager, groupName) {
  let group = groupName;

  const APP_ROOT = fs.realpathSync(process.cwd());

  function resolveFile(relativePath) {
    return path.resolve(APP_ROOT, relativePath);
  }

  function checkFile(fileName) {
    return fs.existsSync(resolveFile(fileName));
  }

  const appPkgPath = resolveFile('package.json');
  var pkgJson = require(appPkgPath);

  if (script !== scriptEnum.install || script !== scriptEnum.v) {
    console.log('There are only two commands: \n`deps install [GROUP_NAME]` \ndeps v');
    return 1;
  }

  if (script === scriptEnum.v) {
    console.log(`${pkgJson.name}: ${pkgJson.version}`);
    return 0;
  }

  let pm; // 'yarn' | 'npm'
  if (!group) {
    let npmLock = false;
    let yarnLock = false;
    try {
      if (checkFile('package-lock.json')) {
        npmLock = true;
      }
    } catch (err) {
      console.error(err);
    }
    try {
      if (checkFile('yarn.lock')) {
        yarnLock = true;
      }
    } catch (err) {
      console.error(err);
    }
    if (npmLock && yarnLock) {
      console.warn('You have both lock files of "yarn" and "npm" package managers! "yarn" will be used in this case. ');
      pm = pmEnum.yarn; // if both 'yarn' has higher priority
    } else if (npmLock) {
      pm = pmEnum.npm;
    } else if (yarnLock) {
      pm = pmEnum.yarn;
    } else {
      pm = pmEnum.npm; // by default
    }
  } else {
    pm = packageManager;
  }

  // if no PM and group is a 2nd arg
  if (!group && packageManager) {
    group = packageManager;
  }

  if (packageManager !== pmEnum.npm && packageManager !== pmEnum.yarn) {
    console.log(`There are only next available package managers: ${pms.join(', ')}.`);
    return 1;
  }

  if (!group || !group.length) {
    console.log('Please specify a group: `deps install [GROUP_NAME]`');
    return 1;
  }

  const groupDependencies = pkgJson[group + 'Dependencies'];
  const devDependencies = pkgJson.devDependencies;
  const dependencies = pkgJson.dependencies;

  if (!groupDependencies && !dependencies) {
    console.log(`No ${group}Dependencies found.`);
    return 0;
  }

  const toInstall = groupDependencies.map(function (gDep) {
    let pkgString;

    function getDep(deps) {
      pkgString = Object.keys(deps)
        .reduce(function (result, name) {
          if (name !== gDep) return result;
          const version = deps[name];
          result.push(`${name}@${version}`);
          return result;
        }, []).join(' ');
    }

    getDep(devDependencies);

    if (!pkgString) {
      getDep(dependencies);
    }

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

  console.log(`deps ${'cmd'.green} ${pm} install ${toInstall.join(' ')}`);

  const npmCmd = process.platform === 'win32' ? `${pm}.cmd` : pm;
  runCommand(npmCmd, ['install', ...toInstall], group);
  return 0;
};
