# Nunjucks Formatter

HTML formatter for Nunjucks templates with AlpineJS support.

Formats `.njk` and `.nunjucks` files using [js-beautify](https://github.com/beautify-web/js-beautify) with Nunjucks-aware preprocessing, block depth tracking, and inline conditional joining. Syntax highlighting, snippets, and AlpineJS directive support are included.

## Features

- **Formatting** — Full document and range formatting via VS Code's built-in formatter API
- **Nunjucks block indentation** — `{% macro %}`, `{% if %}`, `{% for %}` content properly indented based on nesting depth
- **Inline conditionals** — `{% if x %}val{% endif %}` and `{% if %}v1{% elif %}v2{% else %}v3{% endif %}` kept on a single line
- **Multi-line `{% set %}`** — Object literals inside `{% set x = { ... } %}` stay stable across repeated saves
- **AlpineJS support** — Multi-line `:class="{ ... }"` object attributes properly indented
- **Syntax highlighting** — Nunjucks tags (`{% %}`, `{{ }}`, `{# #}`) with expression support
- **AlpineJS highlighting** — Directives (`x-*`, `:*`, `@*`) are highlighted as attributes
- **Snippets** — Nunjucks tags and AlpineJS directives
- **YAML front matter** — Preserved unchanged for static site generators (Eleventy, Jekyll, Hugo)
- **Performance** — esbuild bundled (108KB), cached options, static constants for fast repeated saves

## Supported Extensions

```
.njk
.nunjucks
```

## Formatting

Run **Format Document** (`Shift+Alt+F` on Windows/Linux, `Shift+Option+F` on macOS) or **Format Selection** (`Ctrl+K Ctrl+F`).

Block-level Nunjucks tags (`{% if %}`, `{% for %}`, `{% block %}`, etc.) are automatically placed on their own lines and indented based on nesting depth. Content inside `{% macro %}`, `{% if %}`, `{% for %}` is properly indented relative to the block.

Inline conditionals like `{% if x %}attribute="value"{% endif %}` and `{% if x %}v1{% elif y %}v2{% else %}v3{% endif %}` are kept on a single line. Inline Nunjucks inside attributes (e.g. `class="{% if active %}on{% endif %}"`) is left untouched.

Multi-line AlpineJS object attributes like `:class="{ ... }"` have their content indented relative to the attribute name.

YAML front matter (delimited by `---`) at the start of a file is preserved unchanged, making the formatter compatible with static site generators like Eleventy, Jekyll, and Hugo.

## Configuration

All settings live under the `nunjucksFormatter.*` namespace.

| Setting | Default | Description |
| --- | --- | --- |
| `preprocessNunjucks` | `true` | Move Nunjucks block tags onto their own lines before formatting. |
| `wrapAttributes` | `"force-expand-multiline"` | HTML attribute wrapping strategy. |
| `wrapLineLength` | `0` | Maximum line length. `0` = unlimited. |
| `preserveNewlines` | `true` | Preserve existing blank lines. |
| `maxPreserveNewlines` | `1` | Maximum consecutive blank lines to preserve. |
| `endWithNewline` | `true` | Ensure file ends with a newline. |

### Recommended Settings

```jsonc
{
  "[njk]": {
    "editor.defaultFormatter": "douglaszaltron.nunjucks-vscode-extensionpack",
    "editor.formatOnSave": true
  },
  "emmet.includeLanguages": {
    "njk": "html"
  },
  "nunjucksFormatter.maxPreserveNewlines": 0
}
```

## Snippets

### Nunjucks

| Prefix | Output |
| --- | --- |
| `{%` | `{% %}` |
| `{{` | `{{ variable }}` |
| `if` | `{% if %} / {% endif %}` |
| `ife` | `{% if %} / {% else %} / {% endif %}` |
| `ifel` | `{% if %} / {% elif %} / {% else %} / {% endif %}` |
| `elif` | `{% elif %}` |
| `else` | `{% else %}` |
| `for` | `{% for %} / {% endfor %}` |
| `fore` | `{% for %} / {% else %} / {% endfor %}` |
| `block` | `{% block %} / {% endblock %}` |
| `set` | `{% set var = value %}` |
| `set-block` | `{% set %} / {% endset %}` |
| `macro` | `{% macro %} / {% endmacro %}` |
| `filter` | `{% filter %} / {% endfilter %}` |
| `raw` | `{% raw %} / {% endraw %}` |
| `verbatim` | `{% verbatim %} / {% endverbatim %}` |
| `call` | `{% call %} / {% endcall %}` |
| `extends` | `{% extends "template" %}` |
| `include` | `{% include "template" %}` |
| `import` | `{% import "template" as var %}` |
| `from` | `{% from "template" import macro %}` |
| `comment` | `{# comment #}` |
| `super` | `{{ super() }}` |
| `asyncEach` | `{% asyncEach %} / {% endeach %}` |
| `asyncAll` | `{% asyncAll %} / {% endall %}` |

### AlpineJS

| Prefix | Output |
| --- | --- |
| `x-data` | `x-data="{ key: value }"` |
| `x-data-block` | `<div x-data="{ open: false }">` wrapper |
| `x-show` | `x-show="open"` |
| `x-model` | `x-model="value"` |
| `x-text` | `x-text="expression"` |
| `x-html` | `x-html="expression"` |
| `x-for` | `<template x-for="item in items">` |
| `x-if` | `<template x-if="condition">` |
| `x-ref` | `x-ref="name"` |
| `x-transition` | `x-transition` |
| `x-cloak` | `x-cloak` |
| `x-init` | `x-init="expression"` |
| `x-effect` | `x-effect="expression"` |
| `:bind` | `:attribute="expression"` |
| `:class` | `:class="{ 'class': condition }"` |
| `@click` | `@click="action"` |
| `@keydown` | `@keydown.enter="action"` |
| `$store` | `$store.name.property` |
| `$refs` | `$refs.name` |
| `$el` | `$el` |
| `$dispatch` | `$dispatch('event', detail)` |
| `$nextTick` | `$nextTick(() => { })` |
| `$watch` | `$watch('property', callback)` |

## Installation

### From VS Code Marketplace

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `Extensions: Install Extensions`
3. Search for `Nunjucks Formatter`
4. Click **Install**

### Manual

1. Download the `.vsix` from [releases](https://github.com/douglaszaltron/nunjucks-vscode-extensionpack/releases)
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run `Extensions: Install from VSIX`
4. Select the downloaded file

## License

[MIT](LICENSE)
