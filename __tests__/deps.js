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
    expect(out).toContain("There are only two commands: \n`deps install [GROUP_NAME]` \ndeps v");
  });

  it('requires a group name', function () {
    deps('install', 'npm');
    expect(out).toContain("Please specify a group: `deps install [GROUP_NAME]`")
  });


  it('get version', function () {
    deps('v');
    expect(out).toContain("group-dependencies: ")
  });

  it('requires supported only package manager', function () {
    deps('install', 'pnpm', 'test');
    expect(out).toContain("There are only next available package managers: ");
  });

  it('only installs groups that exist', function () {
    deps('install', 'npm', 'build');
    expect(out).toContain("No buildDependencies found.");
  });

  it('installs group `npm` dependencies', function () {
    deps('install', 'npm', 'test');
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    expect(out).toEqual('deps info resolve jest@^26.4.2\n' +
                        'deps warn resolve @babel/cli not found: installing latest\n' +
                        'deps cmd npm install jest@^26.4.2 @babel/cli\n' +
                        `${npmCmd} install jest@^26.4.2 @babel/cli\n`);
  });
});
