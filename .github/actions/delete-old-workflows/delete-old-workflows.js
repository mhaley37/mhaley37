const core = require('@actions/core');
const github = require('@actions/github');

const deleteOldWorkflowsRuns = async () => {
  try {
    const octokit = github.getOctokit(core.getInput('token', {required: true}))
    const { owner, repo } = github.context.repo;
    const options = {owner, repo}
    const pull_branches = (await octokit.paginate(octokit.rest.pulls.list, options)).flat().map(v => v.head.ref)
    const workflowPaths = (await octokit.rest.repos.getContent({
      ...options,
      path: '.github/workflows'
    })).data.map( d => d.path );
    const runs = (await octokit.paginate(octokit.rest.actions.listWorkflowRunsForRepo, options )).flat().filter( run => run.status !='in_progress')
    
    const deletedRuns = [];
    runs.forEach( run => {
      const {event, head_branch, id, path} = run;

      const notImportant = head_branch != 'main' && event != 'release';
      const noOpenPR = !pull_branches.includes(head_branch);
      const oldWorkflow = !workflowPaths.includes(path);
      if ( oldWorkflow || (notImportant && noOpenPR)) {
        deletedRuns.push(id) 
      }
    })

    // Promise.all(deletedRuns.map( run_id => octokit.rest.actions.deleteWorkflowRun({...options, run_id })))
    core.setOutput('deleted-runs', JSON.stringify(deletedRuns));
    console.log('Output:', JSON.stringify(deletedRuns, null, 2));
  } catch (error) {
    core.setFailed(error.message);
    console.error(error);
  }
}

module.exports = { deleteOldWorkflowsRuns };
