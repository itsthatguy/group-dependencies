const { execFileSync } = require('child_process');

function runCommand(file, args, NODE_ENV) {
  if (NODE_ENV) process.env.NODE_ENV = NODE_ENV;
  execFileSync(file, args, {
    env: process.env,
    stdio: 'inherit',
  });
}

module.exports = runCommand;
