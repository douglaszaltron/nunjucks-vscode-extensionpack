# AGENTS.md

## Project Overview

VS Code extension for formatting Nunjucks templates (.njk, .nunjucks)
with AlpineJS directive support. Built on js-beautify with idempotent
Nunjucks preprocessing. Published to VS Code Marketplace.

## File Structure

```
src/
  formatter.ts           Pure formatting logic (zero VS Code dependency)
  extension.ts           VS Code wrapper (config cache, format providers)
  test/formatter.test.ts 39 tests (plain mocha, no VS Code needed)
scripts/
  package.js             Build pipeline (tsc + esbuild + vsce)
assets/
  syntaxes/njk.json      TextMate grammar (Nunjucks + HTML5 + AlpineJS)
  snippets/snippets.json Nunjucks + AlpineJS snippets
  languages/configuration.json
```

## Commands

Always run before finishing a task:
```
npm run lint     # ESLint (must pass)
npm test         # tsc type check + 39 mocha tests
```

Other commands:
```
npm run build    # Full build → dist/*.vsix (12 files, ~104KB)
npm run watch    # Dev mode (tsc + esbuild in parallel)
npm run clean    # Remove out/ and dist/
npm run version  # Changeset version bump (CI only)
```

## Code Style

- TypeScript strict mode, ES2022 target
- 2-space indentation, UTF-8, LF line endings
- No comments unless explicitly requested
- ESLint flat config (eslint.config.js)
- No "use strict" (strict mode is default in ES2022)
- Always run `npm run lint && npm test` before committing

## Testing

- Tests run WITHOUT VS Code instance (plain mocha, ~25ms)
- Tests import directly from `formatter.ts` — no mocking needed
- Verify idempotency for new formatting features: `format(format(x)) === format(x)`
- Add tests for any new formatting behavior
- All 39 tests must pass before PR

## Commit Convention

Conventional commits only:
```
feat:     new feature
fix:      bug fix
perf:     performance improvement
refactor: code restructuring
chore:    maintenance
docs:     documentation
ci:       CI/CD changes
```

## CI/CD

Automated via changesets — do NOT manually bump version in package.json.

Flow:
1. Add changeset to PR (`npx changeset`)
2. `changeset-check.yml` validates changeset exists
3. Merge PR → `release.yml` creates "Version Packages" PR
4. Merge version PR → auto publish to VS Code Marketplace
5. Publish job: lint → test → bundle → vsce publish → tag → GitHub Release

## Dependencies

Runtime: `js-beautify` (HTML formatter with django templating)
Dev: `esbuild` (bundler), `mocha` (tests), `typescript` (compiler), `eslint` (linter)

## Constraints

- Minimum VS Code: ^1.82.0
- Target: Node.js 18 (VS Code extension host)
- Output: esbuild bundle (~104KB, 12 files)
- File extensions: .njk, .nunjucks only (official Nunjucks standard)
- Nunjucks spec: https://mozilla.github.io/nunjucks/templating.html
