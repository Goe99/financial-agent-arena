# Issue Tracker: GitHub

Issues and specs for this repo live as GitHub Issues. Use the `gh` CLI for all issue-tracker operations.

## Conventions

- Create an issue with `gh issue create --title "..." --body "..."`.
- Read an issue with `gh issue view <number> --comments` and include its labels.
- List issues with `gh issue list --state open` and filter by label when needed.
- Comment with `gh issue comment <number> --body "..."`.
- Apply or remove labels with `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close with `gh issue close <number> --comment "..."`.

Infer the repository from `git remote -v`; the GitHub CLI uses the current checkout's `origin` remote.

## Triage surface

Pull requests are not a request surface for triage in this repository. Triage uses GitHub Issues and the labels defined in `docs/agents/triage-labels.md`.

