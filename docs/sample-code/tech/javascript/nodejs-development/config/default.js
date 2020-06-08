const defer = require('config/defer').deferConfig;
const proc = require('child_process');
const pkg = require('../package.json');

module.exports = {
  app: {
    env: 'local',
    semver: pkg.version,
    'git-head': proc.execSync('git rev-parse HEAD').toString().trim(),
    version: defer(function combine() {
      return `${pkg.name}:${this.app.semver} - ${this.app.env}`;
    }),
  },
  // pass is injected via environment variables
  db: {
    user: 'app-user',
  },
};
