jest.mock('../lib/runCommand');
let out = '';
global.console = {
  log: function (stuff) {
    out += strip(stuff + '\n');
  },
  error: console.error,
};

const deps = require('../lib');
const strip = require('strip-color');

describe('deps', function () {
  afterEach(function () {
    out = '';
  });

  it('requires arguments', function () {
    deps();
    expect(out).toContain('There are only next available commands: \n`deps install [GROUP_NAME]` \n`deps devInstall [GROUP_NAME]` \ndeps v');
  });

  it('requires a group name', function () {
    deps('install', 'npm');
    expect(out).toContain('Please specify a group: `deps install [GROUP_NAME]`');
  });

  it('get version', function () {
    deps('v');
    expect(out).toContain('group-dependencies: v');
  });

  it('requires supported only package manager', function () {
    deps('install', 'pnpm', 'test');
    expect(out).toContain('There are only next available package managers: ');
  });

  it('only installs groups that exist', function () {
    deps('install', 'npm', 'build');
    expect(out).toContain('No buildDependencies found.');
  });

  it('installs by `npm` group dependencies', function () {
    deps('install', 'npm', 'test');
    const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    expect(out).toEqual('deps info resolve jest@^26.4.2\n' +
      'deps warn resolve @babel/cli not found: installing latest\n' +
      'deps cmd npm install jest@^26.4.2 @babel/cli\n' +
      `${cmd} install jest@^26.4.2 @babel/cli\n`);
  });

  it('installs by `yarn` group dependencies', function () {
    deps('install', 'yarn', 'test');
    const cmd = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
    expect(out).toEqual('deps info resolve jest@^26.4.2\n' +
      'deps warn resolve @babel/cli not found: installing latest\n' +
      'deps cmd yarn install jest@^26.4.2 @babel/cli\n' +
      `${cmd} add jest@^26.4.2 @babel/cli\n`);
  });

  // it('install one dependency by `yarn`', function () {
  //   deps('install', 'yarn', 'monotest');
  //   const cmd = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
  //   expect(out).toEqual('deps warn resolve apollo-enchanted-cache-inmemory not found: installing latest\n' +
  //     'deps cmd yarn install apollo-enchanted-cache-inmemory\n' +
  //     `${cmd} add apollo-enchanted-cache-inmemory\n`);
  // });

  // it('install one dependency by `yarn`', function () {
  //   deps('install', 'yarn', 'monotest');
  //   const cmd = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
  //   expect(out).toEqual('deps info resolve apollo-enchanted-cache-inmemory@1.2.0\n' +
  //     'deps cmd yarn install apollo-enchanted-cache-inmemory@1.2.0\n' +
  //     `${cmd} install apollo-enchanted-cache-inmemory@1.2.0\n`);
  // });
});
