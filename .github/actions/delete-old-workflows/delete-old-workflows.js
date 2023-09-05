const core = require('@actions/core');
const github = require('@actions/github');

const deleteOldWorkflowsRuns = async () => {
  try {
    const octokit = github.getOctokit(core.getInput('token', {required: true}))
    const { owner, repo } = github.context.repo;
    const common = {owner, repo}
    
    const pull_branches = (await octokit.paginate(octokit.rest.pulls.list, common)).flat().map(v => v.head.ref)
    //const pull_branches = pulls.data.map( v => v.head.ref)
    const workflows = await octokit.rest.repos.getContent({
      ...common,
      path: '.github/workflows'
    });
    const workflowPaths = workflows.data.map( d => d.path );

    const runs = (await octokit.paginate(octokit.rest.actions.listWorkflowRunsForRepo, common)).flat()

    // TODO: Remove this
    const deletedWorkflows = [];
    console.log('paths', JSON.stringify(workflowPaths))
    runs.forEach( run => {
      const {event, head_branch, id, path} = run;
      console.log('Run:', JSON.stringify({event, head_branch, id, path}, null, 2))
      // DELETE IF 
      // OLD WORKFLOW OR (non-main branch &* )
      const isImportant = head_branch == 'main' || event == 'release';
      const hasPR = !pull_branches.includes(head_branch);
      const activeWorkflow = workflowPaths.includes(path);

      if ( !activeWorkflow || (!isImportant && !hasPR)) {
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
