const github = require("@actions/github");
const core = require('@actions/core');

async function run() {
  try {
    const token = core.getInput("github-token");
    const octokit = new github.getOctokit(token);
    const payload = github.context.payload;
    const repo = payload.repository.name;
    const owner = payload.repository.owner.login;
    const pullRequestNumber = payload.number;

    if (pullRequestNumber === undefined) {
      core.warning("No pull request number in payload.");
      return;
    }

    const commits = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });

    const bugzillaRegExp = new RegExp(core.getInput("commit-regexp"), "g");
    const bugs = [];

    // Parse the associated bug numbers from the list of commits in the pull request.
    for (const { commit } of commits.data) {
      if (commit.message.startsWith("Revert")) {
        continue;
      }

      const result = bugzillaRegExp.exec(commit.message);

      if (result != null) {
        bugs.push(result[1]);
      }
    }

    if (!bugs.length) {
      core.warning("No bugzilla bug numbers found in commits.");
      return;
    }

    const pull = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });

    const section = core.getInput("section");
    const bugzillaLinks = bugs.map(x => `https://bugzilla.mozilla.org/show_bug.cgi?id=${x}`).join("\r\n");
    let body = pull.data.body;

    // Update the body content of the pull request with the list of Bugzilla links that is
    // fixed in the pull request.
    if (body == null) {
      body = bugzillaLinks;
    } else if (section.length > 0 && body.includes(section)) {
      // Replace the pull request template section with the list of Bugzilla links.
      body = body.substring(0, body.indexOf(section));
      body = body.concat("\r\n", section, "\r\n", bugzillaLinks);
    } else {
      body = body.concat("\r\n", bugzillaLinks);
    }

    await octokit.rest.pulls.update({
      owner,
      repo,
      pull_number: pullRequestNumber,
      body
    });

    core.notice(`Added Bugzilla links in #${pullRequestNumber}.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
