# Nunjucks Formatter

Fast HTML formatter for Nunjucks templates with AlpineJS directives.

## Features

**Formatting**
- Native Nunjucks/Jinja/Twig block parsing (`{% macro %}`, `{% if %}`, `{% for %}`)
- Inline conditionals kept on a single line (`{% if x %}val{% endif %}`)
- Multi-line AlpineJS `:class="{ ... }"` attributes properly indented
- YAML front matter preserved for Eleventy, Jekyll, Hugo
- Full document and range formatting
- Built on dprint + markup_fmt (Rust-based WASM) - fast and idempotent

**Supported File Types**
- `.njk`, `.nunjucks` - Nunjucks
- `.astro` - Astro
- `.vue` - Vue/Nuxt
- `.svelte` - Svelte/SvelteKit
- `.twig` - Twig
- `.jinja`, `.jinja2` - Jinja

**Developer Experience**
- Syntax highlighting for Nunjucks tags and expressions
- AlpineJS directive highlighting (`x-*`, `:*`, `@*`)
- Snippets for Nunjucks tags and AlpineJS directives
- Lightweight and responsive on repeated saves

## Before / After

Before:
```njk
{% macro render(img) %}{% if img %}<img src="{{ img.src }}">{{ img.alt }}{% endif %}{% endmacro %}
```

After:
```njk
{% macro render(img) %}
  {% if img %}
    <img src="{{ img.src }}">
    {{ img.alt }}
  {% endif %}
{% endmacro %}
```

Inline conditionals stay on one line:
```njk
<img
  {% if fetchpriority %}fetchpriority="{{ fetchpriority }}"{% endif %}
  {% if class %}class="{{ class }}"{% endif %}
>
```

## Getting Started

Set as your default formatter for `.njk` files:

```jsonc
{
  "[njk]": {
    "editor.defaultFormatter": "douglaszaltron.nunjucks-vscode-extensionpack",
    "editor.formatOnSave": true
  },
  "emmet.includeLanguages": {
    "njk": "html"
  }
}
```

## Configuration

All settings live under the `nunjucksFormatter.*` namespace.

| Setting | Default | Description |
| --- | --- | --- |
| `printWidth` | `80` | Maximum line length. |
| `tabWidth` | `2` | Number of spaces per indentation level. Use `0` for tabs. |
| `useTabs` | `false` | Use tabs for indentation. |
| `maxAttrsPerLine` | `1` | Maximum number of attributes per line. |
| `closingBracketSameLine` | `true` | Place closing bracket on same line as last attribute. |
| `singleAttrSameLine` | `false` | Allow single attribute on same line as opening tag. |
| `selfClosingVoid` | `true` | Use self-closing syntax for void elements (`<br />`). |
| `endWithNewline` | `true` | Ensure file ends with a newline. |

## Snippets

<details>
<summary>Nunjucks snippets (25)</summary>

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

</details>

<details>
<summary>AlpineJS snippets (17)</summary>

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

</details>

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
