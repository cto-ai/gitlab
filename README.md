![](https://cto.ai/static/oss-banner.png)

# GitLab 🚀

An Op to simplify an opinionated GitLab workflow.

![GitLab Op](https://github.com/cto-ai/GitLab/blob/master/screens/gitlab.png?raw=true)

## Notice

Please note that this Op was built with SDK 1 and therefore is currently limited to CLI compatibility.

If you would like to interact with GitLab in Slack, please contact us in [our community](https://CTO.ai/community) and we can work with you to adopt this functionality.

## Requirements

To run this or any other Op, install the [Ops Platform](https://cto.ai/platform).

Find information about how to run and build Ops via the [Ops Platform Documentation](https://cto.ai/docs/overview)

This Op also requires an access token to interact with GitLab. Find the steps to create the access token at [https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html). Be sure to grant all scopes so the Op has it's full capability.

* Copy the access token and provide it when prompted the first time the Op runs.
  
* Your remote `origin` must be set to a valid GitLab project (BitBucket or GitHub origin's don't work with this op).

## Optional Setup

### API URL

The Op's default API URL is configured to `gitlab.com`. If you have a self-hosted instance of GitLab and wish to change the API URL, you can do so by setting the environment variable `GITLAB_URL=example.com`.

### GPG Key Signing

GPG signing for your commits can also be enabled. Provided that you already have a valid key added and configured be used with GitLab. Setup GPG signing with the following steps:

  1. Run this command in a bash terminal. Input your passphrase when prompted to copy your GPG key to your clipboard. `gpg -a --export-secret-keys <fingerprint> | cat -e | sed 's/\$/\\n/g' | pbcopy`
  2. Add the GPG key as an environment variable `GPG_KEY=key-from-clipboard`
  3. Add the GPG key's corresponding passphrase as an environment variable `GPG_PASSPHRASE=yourpassphrase`

## Usage

Running `ops run gitlab`, gives you a list of available commands to get you started.

## Local Development

To develop and run ops locally:

  1. Clone the repo `git clone <git URL>`
  2. `cd` into the directory and install dependancies with `npm install`
  3. Build the Op `ops build path/to/op`
  4. Run the Op from your local source code with `ops run path/to/op`

## Available Commands

All the commands start with `ops run gitlab`. From there, you would use the following commands to manage your GitLab flow.

* `project:create`

Initializes a new git repository in the current working directory and pushes to the user's selected Group or personal GitLab namespace.

* `project:clone`

Clones a remote project that you are a member of on to your current working directory.

* `issue:create`

Creates a new issue in GitLab. Current working directory must be a project either cloned or created using the project:create or project:clone commands.

* `issue:list`

Lists all the issues the user has access to. If the current working directory is a project in GitLab then the issues are scope by the project otherwise it displays all issues that you are assigned to or created by you etc.

* `issue:search`

Searches all issues in GitLab for your current working directory by selected filters.

* `issue:start`

Lists all issues in GitLab for your current working directory. Selecting a issue will checkout a branch for that issue and set the upstream in GitLab.

* `issue:save`

Adds all unstaged changes, commits and pushes to GitLab for the current working branch.

* `issue:done`

Converts the current working issue into a merge-request and allows you to assign reviewers.

* `pulls:list`

Lists all the open merge requests for a given project. The current working directory has to be a project.

* `label:add`

Allows you to create a new project or group label.

* `label:edit`

Allows you to edit an existing project or group label.

* `label:remove`

Allows you to remove a project or group label.

* `label:sync`

Allows you to sync up labels from one base project to any other project(s) that you have access to. The Op will check for any missing labels in the targeted project(s) and add in as necessary.

* `token:update`

Allows you to update your GitLab access token.
