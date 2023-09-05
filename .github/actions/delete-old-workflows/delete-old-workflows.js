const core = require('@actions/core');
const github = require('@actions/github');

const deleteOldWorkflowsRuns = async () => {
  try {
    const octokit = github.getOctokit(core.getInput('token', {required: true}))
    const { owner, repo } = github.context.repo;
    const common = {owner, repo}
    
    const pulls = await octokit.rest.pulls.list(common)

    const pull_branches = pulls.data.map( v => v.head.ref)
    const workflows = await octokit.rest.repos.getContent({
      ...common,
      path: '.github/workflows'
    })
    const workflowPaths = workflows.data.map( d => d.path );

    const runs = (await octokit.paginate(octokit.rest.actions.listWorkflowRunsForRepo, common)).flat()

    // TODO: Remove this
    const deletedWorkflows = [];
    runs.forEach( run => {
      const {event, head_branch, id, path} = run;
      const alwaysKeep = head_branch == 'main' || event == 'release';
      const hasPR = !pull_branches.includes(head_branch);
      const activeWorkflow = workflowPaths.includes(path);

      if ( !(alwaysKeep || (hasPR && activeWorkflow)) ) {
        deletedWorkflows.push({id, event, head_branch, path})   }

    })
    core.setOutput('deleted-runs', JSON.stringify(deletedWorkflows));
    console.log('Output:', JSON.stringify(deletedWorkflows, null, 2));
  } catch (error) {
    core.setFailed(error.message);
    console.error(error);
  }
}

module.exports = { deleteOldWorkflowsRuns };
