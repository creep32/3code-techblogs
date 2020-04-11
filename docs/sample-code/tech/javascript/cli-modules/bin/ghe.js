#!/usr/bin/env node

const leven = require('leven')
const program = require('commander')
const pkg = require('../package.json')
const { log, info, warn, error } = require('../lib/util')

program.exitOverride(function (err) {
  if (err && ! ['commander.version', 'commander.helpDisplayed'].includes(err.code)) {
    this.outputHelp()
    log('')
    warn(err.message)
  }
});

program
  .version(`${pkg.name} ${pkg.version}`, '-v, --version', 'output the version number')
  .usage('<command> [options]')

// set Global Option
program
  .requiredOption('-u, --username <username>', 'username of GitHub Enterprise call Web API')
  .requiredOption('-p, --password <password>', 'password of GitHub Enterprise user')
  .requiredOption('-o, --org <org>', 'organization of Github')
  .requiredOption('-a, --api-base <apibase>', 'api baseurl (eg. https://api.github.com)')

program
  .command('main-branch <repository-name>')
  .description('set a main branch')
  .action(function (repositoryName, cmd) {
    const option = mergeOpts(cmd)

    const command = require('../lib/commands/mainBranch')
    return wrapCommand(command)(repositoryName, option)
  })

program
  .command('issues <repository-name>')
  .description('search issues filterd lables')
  .option('-l, --labels <labels>', 'comma separeted labels', parseLabels, [])
  .action(function (repositoryName, cmd) {
    const option = mergeOpts(cmd)

    const allowedLabels = ['bug', 'documentation', 'duplicate', 'enhancement', 'good first issue', 'help wanted', 'invalid', 'question', 'wontfix']
    option.labels.forEach(each => {
      if (!allowedLabels.includes(each)) {
        const msg = `"${each}" is not allowed value for -l, --labels option`
        this._exit(1, 'self.optionNotAllowedValue', msg)
      }
    })

    const command = require('../lib/commands/issues')
    return wrapCommand(command)(repositoryName, option)
  })

// show a warning if the command does not exist
program.arguments('<command>').action(async function(command) {
  const availableCommands = program.commands.map(cmd => cmd._name)
  const suggestion = availableCommands.find(cmd => {
    const steps = leven(cmd, command)
    return steps < 3
  })
  console.log(suggestion)
  if (suggestion) {
    this._exit(1, 'self.thereIsSuggestion', `Did you mean ${suggestion}?`)
  } else {
    this.unknownCommand()
  }
})


if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)

/**
 * custom option parsing
 */
function parseLabels(value, dummyPrevious) {
 return value.split(',')
}

// merge global and subcommand's option
function mergeOpts(cmd) {
  return { ...cmd.parent.opts(), ...cmd.opts()}
}

function wrapCommand (fn) {
  return (...args) => {
    return fn(...args).catch(err => {
      error(err.stack)
      process.exitCode = 1
    })
  }
}
