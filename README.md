# Bugzilla Linker

Links a pull request to its associated Bugzilla bug.

## Usage

```yaml
name: Bugzilla Linker

on:
  pull_request:
    branches:
      - main

jobs:
  bugzilla_linker:
    runs-on: ubuntu-latest
    steps:
      - name: Bugzilla Linker
        uses: gabrielluong/bugzilla-linker@1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          commit-regexp: "Bug (\\d+)+"
          section: "### GitHub Automation"
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```
