const { log, info, warn, error } = require('../util')
const Requestable = require('../Requestable')

module.exports = async function command(repositoryName, options) {
  const request = new Request(options)

  // check if branch is exists, if not, 404 Error is rised
  await request.getBranche(repositoryName)

  try {
    await request.getBranchRefs(repositoryName, 'develop')
  } catch(e) {
    if (e.response.status === 404) {
      await request.createBranchFromMaster(repositoryName, 'develop')
      info(`${repositoryName} create 'develop' branch from master`)
    } else {
      throw e
    }
  }
  await request.setBranch(repositoryName, 'develop')
  info(`${repositoryName} set default branch is 'develop'`)
}

class Request extends Requestable {
  constructor({username, password, apiBase, org}) {
    super(username, password, apiBase);
    this._org = org
  }

  getBranchRefs(gitRepository, branch = 'develop') {
    return this._request('GET', `/repos/${this._org}/${gitRepository}/git/refs/heads/${branch}`)
  }

  async createBranchFromMaster(gitRepository, branch = 'develop') {
    const masterRef = await this.getBranchRefs(gitRepository, 'master')
    return this._request('POST', `/repos/${this._org}/${gitRepository}/git/refs`, {
      ref: `refs/heads/${branch}`,
      sha: masterRef.data.object.sha
    })
  }

  getBranche(gitRepository) {
    return this._request('GET', `/repos/${this._org}/${gitRepository}`, null);
  }

  setBranch(gitRepository, defaultBranch = 'develop') {
    return this._request('PATCH', `/repos/${this._org}/${gitRepository}`, {
      name: gitRepository,
      private: true,
      visibility: 'private',
      default_branch: defaultBranch
    });
  }
}
