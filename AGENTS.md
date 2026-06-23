# AGENTS.md

## Project Overview

VS Code extension for formatting Nunjucks templates with AlpineJS directive
support. Built on dprint + markup_fmt (Rust-based WASM). Native Nunjucks/Jinja/Twig/Astro/Vue/Svelte parsing.
Published to VS Code Marketplace.

## File Structure

```
src/
  formatter.ts           Pure formatting logic (zero VS Code dependency)
  extension.ts           VS Code wrapper (config cache, format providers)
  test/formatter.test.ts Mocha tests (no VS Code instance needed)
scripts/
  package.js             Build pipeline (tsc + esbuild + vsce)
assets/
  syntaxes/njk.json      TextMate grammar (Nunjucks + HTML5 + AlpineJS)
  snippets/snippets.json Nunjucks + AlpineJS snippets
  wasm/markup_fmt.wasm   dprint markup_fmt plugin (vendored)
  languages/configuration.json
```

## Commands

Always run before finishing a task:
```
npm run lint     # ESLint
npm test         # tsc type check + mocha tests
```

Other commands:
```
npm run build    # Full build → dist/*.vsix
npm run watch    # Dev mode (tsc + esbuild in parallel)
npm run clean    # Remove out/ and dist/
```

## Code Style

- TypeScript strict mode, ES2022 target
- 2-space indentation, UTF-8, LF line endings
- No comments unless explicitly requested

## Testing

- Verify idempotency for new features: `format(format(x)) === format(x)`
- Add tests for any new formatting behavior

## Commit Convention

```
feat: fix: perf: refactor: chore: docs: ci:
```

## CI/CD

Automated via changesets — do NOT manually bump version in package.json.

Flow:
1. Add changeset to PR (`npx changeset`)
2. `changeset-check.yml` validates changeset exists
3. Merge PR → `release.yml` creates "Version Packages" PR
4. Merge version PR → auto publish to VS Code Marketplace

## Constraints

- Minimum VS Code: ^1.82.0
- Target: Node.js 18 (VS Code extension host)
- File extensions: .njk, .nunjucks, .astro, .vue, .svelte, .twig, .jinja, .jinja2
- Nunjucks spec: https://mozilla.github.io/nunjucks/templating.html
