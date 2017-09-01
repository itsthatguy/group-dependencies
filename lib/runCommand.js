const runCommand = function (cmd) {
  const execSync = require('child_process').execSync;
  execSync(cmd, { stdio:[0, 1, 2] });
};

module.exports = runCommand;
