# Changelog

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Nunjucks block depth tracking — `{% macro %}`, `{% if %}`, `{% for %}`, `{% block %}` content now properly indented based on nesting depth.
- Inline conditional joining — `{% if x %}val{% endif %}` and `{% if x %}v1{% elif y %}v2{% else %}v3{% endif %}` kept on a single line.
- Multi-line AlpineJS object attribute indentation — `:class="{ ... }"` content indented relative to the attribute.
- Multi-line Nunjucks tag preservation — `{% set x = { ... } %}` content stays idempotent across repeated saves.
- `insideHtmlTag` tracking — `{% if %}` used as conditional HTML attributes follows attribute indentation, not block depth.
- AGENTS.md following [agents.md](https://agents.md/) standard.

### Performance
- Hoisted static arrays (`templating`, `unformatted`, `content_unformatted`) to module-level constants to eliminate per-call allocations.
- Cached `HTMLBeautifyOptions` object — rebuilt only when `tabSize`, `insertSpaces`, or settings change.
- Skip `TextEdit` creation when formatted output equals input — avoids unnecessary VS Code DOM updates.
- Early exit front matter check with `startsWith` before regex.
- esbuild bundling — 627 files, 1.47MB reduced to 13 files, 107KB (93% reduction).

### Changed
- ESLint flat config (`eslint.config.js`) with `@typescript-eslint`.
- `npm run watch` runs `tsc --noEmit --watch` + `esbuild --watch` in parallel via `concurrently`.
- Two-job release workflow — changesets auto version + commit-message triggered publish.
- Preprocess loop for 3+ adjacent Nunjucks tags.
- Removed redundant `"use strict"` (strict mode is default in ES2022).

### Removed
- `publish.yml` — old manual version workflow, replaced by changesets.
- `update-versions.js` — synced extension version to debug protocol version (bug).
- `@vscode/test-electron` — replaced with plain mocha.

## [0.3.0] - 2026-06-23

### Added
- Separated formatting logic into `formatter.ts` with zero VS Code dependency.
- Idempotent Nunjucks preprocessing — formatting twice produces identical output.
- All official Nunjucks tags per Mozilla docs: `verbatim`, `call`, `asyncEach`, `asyncAll`, `set` block assignment.
- AlpineJS snippets: `x-init`, `x-effect`, `$el`, `$watch`.
- Snippets: `verbatim`, `set-block`, `include-missing`, `from-context`, `for-else`, `comment`.
- Plain mocha test suite (39 tests, no VS Code instance required).
- Config caching with `onDidChangeConfiguration` listener for instant reload.
- `indent_scripts: "normal"` in js-beautify options.
- YAML front matter preservation for static site generators (Eleventy, Jekyll, Hugo) (#3).

### Changed
- Rewrote extension with clean architecture: `formatter.ts` (pure logic) + `extension.ts` (VS Code wrapper).
- Merged `njk.json` and `njk-html.json` into a single grammar file.
- Reduced settings from 14 to 6 — hardcoded sensible defaults for the rest.
- Default `wrapAttributes` changed to `"force-expand-multiline"`.
- Default `wrapLineLength` changed to `0` (unlimited).
- Default `maxPreserveNewlines` changed to `1`.
- Default `inlineCustomElements` changed to `false`.
- File extensions limited to `.njk` and `.nunjucks` (official Nunjucks standard).
- Standardized all snippet descriptions to 3rd person singular.
- Professional English throughout README, settings, and snippets.

### Fixed
- Excessive indentation when using tabs — `wrap_attributes_indent_size` now uses 1 tab per level (#4).
- YAML front matter no longer collapsed into a single line (#3).

### Removed
- `@vscode/test-electron` test runner — replaced with plain mocha.
- `njk-html.json` grammar file — merged into `njk.json`.
- Opinionated AlpineJS component pattern snippets (dropdown, modal, tabs, toggle).
- 8 unnecessary configuration settings (`indentInnerHtml`, `indentHandlebars`, `unformatted`, `contentUnformatted`, `inlineCustomElements`, `indentBodyInnerHtml`, `indentHeadInnerHtml`, `extraLiners`).
- `module.exports` hack — restored proper TypeScript exports.

## [0.1.0] - 2026-06-15

### Added
- Initial js-beautify based formatter for Nunjucks templates.
- AlpineJS directive highlighting in TextMate grammar.
- Nunjucks preprocessor for block tag separation.
- 25+ snippets for Nunjucks tags and AlpineJS directives.

## [0.0.1]

- Initial release.
