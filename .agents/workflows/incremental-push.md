---
description: incremental commit and push to GitHub after every code change
---

// turbo-all

After every individual change (feature, fix, or new file) that has been verified:

1. Stage all modified files
```
git add .
```

2. Commit with a descriptive, conventional commit message reflecting exactly what changed
```
git commit -m "<type>: <short description of what changed>"
```
Use these commit types:
- `feat:` for new features or endpoints
- `fix:` for bug/type error fixes
- `chore:` for config changes, dependency installs, etc.
- `refactor:` for code restructuring
- `docs:` for README or documentation updates

3. Push immediately to main
```
git push
```

**Rules:**
- NEVER batch multiple unrelated changes into one commit
- Each commit should represent one verified, working change
- Always run `npx tsc --noEmit` (or equivalent) before committing TypeScript changes
- Commit right after verification passes — do not wait until the end of a session
