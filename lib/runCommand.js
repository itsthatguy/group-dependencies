const runCommand = function (cmd, NODE_ENV) {
  const execSync = require('child_process').execSync;
  execSync(cmd, { env: { NODE_ENV: NODE_ENV }, stdio:[0, 1, 2] });
};

module.exports = runCommand;
