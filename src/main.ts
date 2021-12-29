import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token', {required: true})
    const github = getOctokit(token, {})

    if (context.eventName !== 'pull_request') {
      core.info('Action is available only for pull request.')
      return
    }

    const state = await github.rest.pulls.get({
      pull_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo
    })

    const baseBranch = state.data.base.ref
    const headBranch = state.data.head.ref
    const basehead = `${baseBranch}...${headBranch}`

    const comparison = await github.rest.repos.compareCommitsWithBasehead({
      owner: context.repo.owner,
      repo: context.repo.repo,
      basehead
    })

    if (
      comparison.data.status === 'ahead' ||
      comparison.data.status === 'identical'
    ) {
      core.info('Branch is up to date')
    } else {
      throw new Error('Branch is not up to date')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
