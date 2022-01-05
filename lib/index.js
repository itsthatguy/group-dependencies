require('colors');
const fs = require('fs');
const path = require('path');
const runCommand = require('./runCommand');

const pmEnum = {
  npm: 'npm',
  yarn: 'yarn',
};

const scriptEnum = {
  install: 'install',
  devInstall: 'devInstall',
  v: 'v',
};

const pms = Object.values(pmEnum);

module.exports = function (script, packageManager, groupName, environment) {
  // setup
  const APP_ROOT = fs.realpathSync(process.cwd());

  const resolveFile = (pathSegments) => {
    return path.resolve(...pathSegments);
  }

  const checkFile = (fileName) => {
    return fs.existsSync(resolveFile([APP_ROOT, fileName]));
  }

  const warn = ['warn'.yellow, 'resolve'.magenta].join(' ');
  const error = ['error'.red, 'resolve'.magenta].join(' ');
  const info = ['info'.green, 'resolve'.magenta].join(' ');

  const appPkgPath = resolveFile([APP_ROOT, 'package.json']);
  const appPkgJson = require(appPkgPath);
  const modulePkgPath = resolveFile([__dirname, '../', 'package.json']);
  const modulePkgJson = require(modulePkgPath);

  // logic

  if (script !== scriptEnum.install && script !== scriptEnum.devInstall && script !== scriptEnum.v) {
    console.log('There are only next available commands: \n`deps install [GROUP_NAME]` \n`deps devInstall [GROUP_NAME]` \ndeps v');
    return 1;
  }

  if (script === scriptEnum.v) {
    console.log(`${modulePkgJson.name}: ${modulePkgJson.version}`);
    return 0;
  }

  let group = groupName;
  let env = environment;
  let pm = packageManager; // 'yarn' | 'npm'

  if (!group) {
    let npmLock = false;
    let yarnLock = false;
    try {
      if (checkFile('package-lock.json')) {
        npmLock = true;
      }
    } catch (err) {
      console.log(`${error} err`);
    }
    try {
      if (checkFile('yarn.lock')) {
        yarnLock = true;
      }
    } catch (err) {
      console.log(`${error} err`);
    }
    if (npmLock && yarnLock) {
      process.nextTick(() => {
        console.log(`${warn} You have both lock files of "yarn" and "npm" package managers! "yarn" will be used in this case.`);
      });
      pm = pmEnum.yarn; // if both 'yarn' has higher priority
    } else if (npmLock) {
      pm = pmEnum.npm;
    } else if (yarnLock) {
      pm = pmEnum.yarn;
    } else {
      pm = pmEnum.npm; // by default
    }
  }

  if (group && pm !== pmEnum.npm && pm !== pmEnum.yarn) {
    console.log(`There are only next available package managers: ${pms.join(', ')}.`);
    return 1;
  } else if (pm && !group || pm && !group.length) {
    console.log('Please specify a group: `deps install [GROUP_NAME]`');
    return 1;
  }

  const groupDependencies = appPkgJson[group + 'Dependencies'];
  const devDependencies = appPkgJson.devDependencies;
  const dependencies = appPkgJson.dependencies;

  if (!groupDependencies) {
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

    if (script !== scriptEnum.devInstall) {
      getDep(devDependencies);
    } else if (script !== scriptEnum.install) {
      getDep(dependencies);
    }

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
  runCommand(npmCmd, [pm === pmEnum.npm ? 'install' : 'add', ...toInstall], env);
  return 0;
};
