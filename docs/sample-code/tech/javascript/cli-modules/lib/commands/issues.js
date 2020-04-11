const { log, info, warn, error } = require('../util')
const Table = require('cli-table')
const Requestable = require('../Requestable')

module.exports = async function command(repositoryName, options) {
  const request = new Request(options)
  const table = new Table({
    head: ['title', 'assignee', 'labels'],
    colWidths: [40, 30, 40],
    style : {compact : true, head: ['gray']}
  })

  // check if branch is exists, if not, 404 Error is rised
  const ret = await request.getIssues(repositoryName)

  info(`${repositoryName} issues filterd [${options.labels.join(', ')}]\n`)

  ret.data.forEach(each => {
    table.push([each.title, each.assignee ? each.assignee.login : 'unassigned', each.labels.map(each => each.name).join(', ')])
  })
  log(table.toString())
}

class Request extends Requestable {
  constructor({username, password, apiBase, org, labels}) {
    super(username, password, apiBase);
    this._org = org
    this._labels = labels
  }

  getIssues(gitRepository) {
    let query = {
      state: 'open'
    }
    if (this._labels.length > 0) query.labels = this._labels.join(',')

    return this._request('GET', `/repos/${this._org}/${gitRepository}/issues`, query)
  }
}
