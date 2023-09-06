const assert = require('node:assert');
const core = require('@actions/core');
const github = require('@actions/github');

const sinon = require('sinon');
const test = require('test');
const { deleteOldWorkflowsRuns } = require('./delete-old-workflows');

const OLD_BRANCH = 'OLD_BRANCH'
const OPEN_PR_BRANCH = 'OPEN_PR_BRANCH'
const MAIN_BRANCH = 'main'

const ACTIVE_PATH = 'active/workflow/path'
const OLD_PATH = 'old/workflow/path'

const runsToDelete = [
  {
    id: 92,
    head_branch: OLD_BRANCH,
    path: ACTIVE_PATH,
    event: 'push'
  },
  {
    id: 93,
    head_branch: OLD_BRANCH,
    path: OLD_PATH,
    event: 'push'
  },  
  {
    id: 94,
    head_branch: MAIN_BRANCH,
    path: OLD_PATH,
    event: 'push'
  }
]

  const runsToKeep = [{
    id: 1,
    head_branch: MAIN_BRANCH,
    path: ACTIVE_PATH,
    event: 'pull'
  },
  {
    id: 2,
    head_branch: OPEN_PR_BRANCH,
    path: ACTIVE_PATH,
    event: 'push'
  },
  {
    id: 3,
    head_branch: OLD_BRANCH,
    path: ACTIVE_PATH,
    event: 'release'
  },  
]

const setup = () => {

  const spies = {
    console: { log: sinon.spy(console, 'log') },
    core: { setOutput: sinon.spy(core, 'setOutput') },
  };

  const stubs = {
    core: { getInput: sinon.stub(core, 'getInput') },
    github: { context: sinon.stub(github, 'context'), 
              getOctokit: sinon.stub(github, 'getOctokit')}
  };

  stubs.core.getInput.withArgs('token').returns('GOOD_TOKEN')
  stubs.github.getOctokit.returns({
    paginate: val => [val],
    rest:{
      actions: {
        listWorkflowRunsForRepo: [...runsToDelete, ...runsToKeep]
      },
      pulls: {
        list: [{head: {ref: OPEN_PR_BRANCH}}]
      },
      repos: {
        getContent: sinon.stub().returns({data: [{path: ACTIVE_PATH }]})
      }
    }
  })

  stubs.github.context.value({
    repo: { owner: 'foo-owner', repo: 'bar-repo' },
  });

  return { spies };
};

test('Get deletes run ids', async () => {
 const {spies} = setup();

  await deleteOldWorkflowsRuns();
  assert(
    spies.core.setOutput.calledWith('deleted-runs', JSON.stringify(runsToDelete.map( v => v.id))),
  );
  assert(
    spies.console.log.calledWith(
      'Output:',
      JSON.stringify(runsToDelete.map( v => v.id), null, 2),
    ),
  );
  
  cleanup(spies);
});

const cleanup = spies => {
  spies.console.log.restore();
  spies.core.setOutput.restore();
  sinon.restore();
};
