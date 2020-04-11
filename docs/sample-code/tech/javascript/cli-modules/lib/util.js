const chalk = require('chalk')
const stripAnsi = require('strip-ansi')

const format = (label, msg) => {
  return msg.split('\n').map((line, i) => {
    return i === 0
      ? `${label} ${line}`
      : line.padStart(stripAnsi(label).length)
  }).join('\n')
}

exports.log = (msg) => {
  console.log(msg)
}

exports.info = (msg) => {
  console.log(format(chalk.bgBlue.black(' INFO '), msg))
}

exports.warn = (msg) => {
  console.warn(format(chalk.bgYellow.black(' WARN '), chalk.yellow(msg)))
}

exports.error = (msg) => {
  console.error(format(chalk.bgRed(' ERROR '), chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}
