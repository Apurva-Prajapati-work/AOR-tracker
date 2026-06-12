# Contributing to AORTrack

Thank you for helping improve AORTrack. This project is **built by applicants, for applicants** — and we welcome contributions across the full stack: marketing pages, dashboard UI, API routes, MongoDB, cohort data, and documentation.

Please read this guide before opening a pull request.

---

## Before you code

1. **You create the GitHub Issue yourself** — we do not open issues on your behalf and we do not accept drive-by PRs without a linked issue.
2. **Open a new issue** on the org repo (free GitHub account required):

   **[github.com/Get-North-Path/AOR-tracker/issues/new/choose](https://github.com/Get-North-Path/AOR-tracker/issues/new/choose)**

3. **Pick the right template:**
   - Bug report
   - Feature request
   - Data / cohort correction
   - Documentation
4. **New to the repo?** Look for issues labelled [`good first issue`](https://github.com/Get-North-Path/AOR-tracker/issues?q=label%3A%22good+first+issue%22).
5. **Security vulnerabilities** — never open a public issue. See [SECURITY.md](SECURITY.md).
6. **Discord** ([discord.gg/aortrack](https://discord.gg/CA8FcsTH44)) is optional for chat; **GitHub Issues are the official entry point** for work we will merge.

---

## Writing a good issue

| Type | Include |
|------|---------|
| **Bug** | Clear description, steps to reproduce, expected vs actual behavior. Screenshots help. |
| **Feature** | Problem you're solving, acceptance criteria (checklist of done-when items). Mockups welcome. |
| **Data** | What data is wrong, which stream/cohort/date range, and how you verified it. |
| **Docs** | What to change and who it helps. |

You own the issue you opened — update it with comments or screenshots as you learn more. For large features, wait for maintainer feedback before opening a PR; small bugfixes can move forward once the issue is clear.

---

## Development setup

See [README.md](README.md) for:

- `npm run dev` / `npm run dev:next`
- Environment variables (`MONGODB_URI`, `GITHUB_TOKEN`, etc.)
- Local URL: [http://localhost:3000](http://localhost:3000)

---

## Branch naming

Use your GitHub username and a short slug:

```text
your-username/short-description
```

Examples:

- `apurv/roadmap-mobile-scroll`
- `apurv/fix-changelog-parser`

---

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `data:` | Dataset or calculation change |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure |
| `test:` | Adding or fixing tests |
| `chore:` | Build, CI, tooling |

Optional scope in parentheses:

```text
feat(roadmap): improve mobile kanban scroll
fix(changelog): parse issue links in release notes
docs: add CONTRIBUTING guide
```

---

## Pull request process

### 1. Fork and branch

```bash
git clone https://github.com/YOUR_USERNAME/AOR-tracker.git
cd AOR-tracker
git checkout -b your-username/short-description
```

### 2. Make changes

Run these before opening a PR:

```bash
npm run lint
npm run build
```

### 3. Open a PR to the org repo

Target **`Get-North-Path/AOR-tracker`** branch **`main`** (not your fork's default if you contribute upstream).

In the PR description, link the issue:

```text
Fixes #123
```

Cross-repo example with GitHub CLI:

```bash
git push -u origin your-username/short-description
gh pr create --repo Get-North-Path/AOR-tracker --base main --head YOUR_USERNAME:your-username/short-description
```

### 4. Review and merge

- At least **one maintainer review** is required.
- Only **org members / maintainers** merge PRs.
- **Contributors must not** push version tags or publish GitHub Releases.

### 5. After your PR merges

Maintainers cut releases (`v*` tags). Published releases appear on [track.getnorthpath.com/changelog](https://track.getnorthpath.com/changelog) after the next cache refresh. No action needed from you.

---

## Questions?

- Comment on your GitHub issue or PR
- Ask in [Discord](https://discord.gg/aortrack)

---

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) as the project.
