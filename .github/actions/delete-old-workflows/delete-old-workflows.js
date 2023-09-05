const core = require('@actions/core');
const github = require('@actions/github');

const deleteOldWorkflowsRuns = async () => {
  try {
    const octokit = github.getOctokit(core.getInput('token', {required: true}))
    const { owner, repo } = github.context.repo;
    const common = {owner, repo}
    // Look at better aliases, like await octokit.pulls()

    const pulls = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      ...common
    });
    const pull_branches = pulls.data.map( v => v.head.ref)
    //
    const workflows = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      ...common,
      path: '.github/workflows'
    })
    const workflowPaths = workflows.data.map( d => d.path );

    const runs = (await octokit.paginate('GET /repos/{owner}/{repo}/actions/runs', {
      ...common, 
    })).flat()

    // TODO: Remove this
    const deletedWorkflows = [];
    runs.foreach( run => {
      const alwaysKeep = branch == 'main' || eventType == 'release';
      const hasPR = !pull_branches.includes(branch);
      const activeWorkflow = workflowPaths.includes(path);

      if ( !(alwaysKeep || (hasPR && activeWorkflow)) ) {
        deletedWorkflows.push(run.id)   }

    })
    core.setOutput('deleted-runs', JSON.stringify(deletedWorkflows));
    console.log('Output:', JSON.stringify(deletedWorkflows, null, 2));
  } catch (error) {
    core.setFailed(error.message);
    console.error(error);
  }
}

module.exports = { deleteOldWorkflowsRuns };
