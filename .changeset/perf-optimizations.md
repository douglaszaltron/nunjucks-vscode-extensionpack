---
"nunjucks-vscode-extensionpack": minor
---

## Minor release — Nunjucks depth tracking, inline conditionals, esbuild bundling

### Added
- Nunjucks block depth tracking — content inside {% macro %}, {% if %}, {% for %} properly indented
- Inline conditional joining — {% if x %}val{% endif %} and elif/else chains kept on single line
- Multi-line AlpineJS object attribute indentation — :class="{ ... }" content indented
- insideHtmlTag tracking — conditional attributes follow attribute indentation
- AGENTS.md following agents.md standard
- ESLint flat config with @typescript-eslint

### Performance
- esbuild bundling — 627 files → 13 files, 1.47MB → 107KB (93% reduction)
- Cached HTMLBeautifyOptions object
- Skip TextEdit when output equals input
- Static arrays hoisted to module-level constants

### Changed
- Two-job release workflow with changesets auto version
- npm run watch runs tsc + esbuild in parallel via concurrently
- Preprocess loop for 3+ adjacent Nunjucks tags
- Removed redundant "use strict"

### Removed
- publish.yml — replaced by changesets
- update-versions.js — synced to wrong target (bug)
- @vscode/test-electron — replaced with plain mocha
