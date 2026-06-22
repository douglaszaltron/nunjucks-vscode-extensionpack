# Changelog

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2026-06-23

### Added
- Separated formatting logic into `formatter.ts` with zero VS Code dependency.
- Idempotent Nunjucks preprocessing — formatting twice produces identical output.
- All official Nunjucks tags per Mozilla docs: `verbatim`, `call`, `asyncEach`, `asyncAll`, `set` block assignment.
- AlpineJS snippets: `x-init`, `x-effect`, `$el`, `$watch`.
- Snippets: `verbatim`, `set-block`, `include-missing`, `from-context`, `for-else`, `comment`.
- Plain mocha test suite (32 tests, no VS Code instance required).
- Config caching with `onDidChangeConfiguration` listener for instant reload.
- `indent_scripts: "normal"` in js-beautify options.

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
