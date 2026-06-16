# Change Log

All notable changes to the "nunjucks-vscode-extensionpack" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-06-15

### Added
- **js-beautify based formatter** replacing the unmaintained `prettydiff2` engine, exposed through both `DocumentFormattingEditProvider` and `DocumentRangeFormattingEditProvider` for the `njk` language (full document **and** `Format Selection`).
- **AlpineJS** directive highlighting via dedicated TextMate grammar patterns: `x-*` directives, `:` shorthand bindings and `@` shorthand events.
- **Tailwind CSS**-friendly defaults — `wrapAttributes: "auto"` wraps long attribute lines (e.g. utility class lists) only when exceeding `wrapLineLength`.
- Nunjucks preprocessor that lifts block-level tags (`{% if %}`, `{% for %}`, `{% block %}`, ...) onto their own lines while leaving inline attribute Nunjucks (`class="{% if active %}on{% endif %}"`) untouched.
- 25+ AlpineJS snippets: directives (`x-data`, `x-show`, `x-model`, `x-text`, `x-for`, `x-if`, `x-transition`, ...), shorthand bindings/events (`:class`, `@click`, `@keydown`), magic properties (`$store`, `$dispatch`, `$refs`, `$nextTick`) and full component patterns (dropdown, modal, tabs, toggle).
- `nunjucksFormatter.*` configuration namespace with 11 settings.
- Automatic indentation inside Nunjucks block constructs through `indentationRules`.
- Auto-closing pairs for `[`/`]` (Tailwind arbitrary values) and `` ` `` (template literals).
- VS Code Extension Development debug configuration (`.vscode/launch.json`) with `Run Extension` and `Extension Tests` targets.
- Automated test suite powered by `@vscode/test-electron` + Mocha covering the formatter, the Nunjucks preprocessor, AlpineJS/Tailwind preservation and formatting idempotence.

### Changed
- Modernized the TypeScript toolchain: TypeScript 5, `@types/node` 18, `@types/vscode` 1.82.
- Expanded `fileTypes`/`extensions` to `.nunjucks, .nunjs, .nj, .njk, .html, .htm, .template, .tmpl, .tpl`.
- Hardened the language configuration (brackets, auto-closing and surrounding pairs, comment markers).

### Fixed
- `Else` snippet generated invalid `{% else condition %}` — `else` takes no condition.
- `asyncAll` snippet closed with `{% endeach %}` instead of `{% endall %}`.
- Comparison operator in the Nunjucks grammar corrected from `=>` to `>=`.

### Removed
- `prettydiff2` dependency and the legacy `postinstall` / `sayHello` activation plumbing.

## [0.0.1]
- Initial release.
