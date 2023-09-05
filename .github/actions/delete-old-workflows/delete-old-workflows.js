const core = require('@actions/core');
const github = require('@actions/github');

const deleteOldWorkflowsRuns = async () => {
  try {
    const octokit = github.getOctokit(core.getInput('token', {required: true}))
    const { owner, repo } = github.context.repo;
    const options = {owner, repo}
    const pull_branches = (await octokit.paginate(octokit.rest.pulls.list, options)).flat().map(v => v.head.ref)
    const workflows = await octokit.rest.repos.getContent({
      ...options,
      path: '.github/workflows'
    });
    const workflowPaths = workflows.data.map( d => d.path );
    const runs = (await octokit.paginate(octokit.rest.actions.listWorkflowRunsForRepo, {...options, status: 'completed' })).flat().filter( run => run.status !='in_progress')
    console.log(runs.map(r => {
      {r.id, r.head_branch, r.status, r.path}
    }))
    const deletedRuns = [];
    runs.forEach( run => {
      const {event, head_branch, id, path} = run;

      const isImportant = head_branch == 'main' || event == 'release';
      const hasPR = pull_branches.includes(head_branch);
      const activeWorkflow = workflowPaths.includes(path);

      if ( !activeWorkflow || (!isImportant && !hasPR)) {
        deletedRuns.push(id) 
      }

    })
    deletedRuns.forEach(async id => {
      //await octokit.rest.actions.deleteWorkflowRun({...options, run_id: id })
      console.log(`Deleted run #${id}.`)
    });
    //await Promise.all(deletedRuns.forEach( run_id => octokit.rest.actions.deleteWorkflowRun({...options, run_id })))
    core.setOutput('deleted-runs', JSON.stringify(deletedRuns));
    console.log('Output:', JSON.stringify(deletedRuns, null, 2));
  } catch (error) {
    core.setFailed(error.message);
    console.error(error);
  }
}

module.exports = { deleteOldWorkflowsRuns };
