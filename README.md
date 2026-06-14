# Nunjucks Visual Studio Code Extension Pack

This is the nunjucks supporting extension for vscode with complete features.

Formatter uses [js-beautify](https://github.com/beautify-web/js-beautify) and is
optimized for **AlpineJS** (`x-data`, `:class`, `@click`, ...) and **Tailwind CSS**.

## vscode-nunjucks support these file extensions

```
.nunjucks, .nunjs, .nj, .njk, .html, .htm, .template, .tmpl, .tpl
```

## Formatting

Format a file with `Shift+Alt+F` (or right-click > **Format Document**).
A range can be formatted with **Format Selection** (`Ctrl+K Ctrl+F`).

Block-level Nunjucks tags (`{% if %}`, `{% for %}`, `{% block %}`, ...) are
automatically placed on their own line so indentation stays clean, while inline
Nunjucks inside attributes (e.g. `class="{% if active %}on{% endif %}"`) is left
untouched. AlpineJS directives and Tailwind utility classes are preserved.

### Formatter settings

All settings live under the `nunjucksFormatter.*` namespace.

| Setting | Default | Description |
| --- | --- | --- |
| `nunjucksFormatter.wrapLineLength` | `120` | Maximum line length before HTML attributes (like Tailwind `class`) wrap to the next line. |
| `nunjucksFormatter.wrapAttributes` | `"auto"` | Attribute wrap strategy. `"auto"` only wraps when exceeding `wrapLineLength` (recommended for Tailwind). Other options: `force`, `force-aligned`, `force-expand-multiline`, `aligned-multiple`, `preserve`, `preserve-aligned`. |
| `nunjucksFormatter.preprocessNunjucks` | `true` | Pull Nunjucks block tags onto their own lines before formatting so indentation stays clean. |
| `nunjucksFormatter.indentInnerHtml` | `true` | Indent content inside `<html>` / `<body>`. |
| `nunjucksFormatter.preserveNewlines` | `true` | Keep existing blank lines. |
| `nunjucksFormatter.maxPreserveNewlines` | `2` | Maximum consecutive blank lines to keep. |
| `nunjucksFormatter.endWithNewline` | `true` | Ensure the file ends with a newline. |
| `nunjucksFormatter.extraLiners` | `["html","/html","head","/head","body","/body","section","/section"]` | Tags that get a blank line before them. |
| `nunjucksFormatter.unformatted` | *(inline tag list)* | Inline tags whose content is not reformatted. |
| `nunjucksFormatter.contentUnformatted` | `["pre","textarea"]` | Tags whose content is left as-is. |
| `nunjucksFormatter.inlineCustomElements` | `true` | Treat custom elements as inline. |

### Example configuration

```jsonc
{
  // Emmet + auto-close for .njk files
  "emmet.includeLanguages": { "njk": "html" },
  "files.associations": {
    "*.njk": "njk",
    "*.nunjucks": "njk",
    "*.nunjs": "njk",
    "*.nj": "njk",
    "*.template": "njk",
    "*.tmpl": "njk",
    "*.tpl": "njk"
  },

  // Nunjucks formatter (AlpineJS + Tailwind friendly)
  "nunjucksFormatter.wrapLineLength": 120,
  "nunjucksFormatter.wrapAttributes": "auto",
  "nunjucksFormatter.preprocessNunjucks": true,

  // Use the nunjucks formatter as the default for the language
  "[njk]": {
    "editor.defaultFormatter": "douglaszaltron.nunjucks-vscode-extensionpack",
    "editor.formatOnSave": true
  }
}
```

## snippets

| Prefix      | HTML Snippet Content                             |
| ----------- | ------------------------------------------------ |
| `block`     | `{% block name %} {% endblock %}`                |
| `{%`        | `{% %}`                                          |
| `{{`        | `{{ variable }}`                                 |
| `extends`   | `{% extends "template" %}`                       |
| `include`   | `{% include "template" %}`                       |
| `filter`    | `{% filter filter %} {% endfilter %}`            |
| `for`       | `{% for item in sequence %} {% endfor %}`        |
| `asyncEach` | `{% asyncEach item in sequence %} {% endeach %}` |
| `asyncAll`  | `{% asyncAll item in sequence %} {% endall %}`   |
| `if`        | `{% if condition %} {% endif %}`                 |
| `ife`       | `if else`                                        |
| `ifel`      | `if elif`                                        |
| `elif`      | `elif`                                           |
| `else`      | `else`                                           |
| `set`       | `set`                                            |
| `macro`     | `macro`                                          |
| `import`    | `import`                                         |
| `from`      | `from import`                                    |
| `raw`       | `raw`                                            |
| `call`      | `call`                                           |
| `var`       | `alt variable`                                   |
| `super`     | `super`                                          |
| `or`        | `or`                                             |
| `pipe`      | `pipe`                                           |

### AlpineJS snippets

The pack also ships AlpineJS snippets (pairing naturally with Tailwind classes):

| Prefix | Expands to |
| --- | --- |
| `x-data`, `x-data-block` | component scope / wrapper `<div x-data>` |
| `x-show`, `x-model`, `x-model.number`, `x-text`, `x-html` | core directives |
| `x-init`, `x-effect`, `x-ref`, `x-cloak`, `x-transition` | lifecycle & visibility |
| `x-for`, `x-if` | `<template>` based loops/conditionals |
| `:bind`, `:class` | `x-bind` shorthand (incl. conditional class) |
| `@click`, `@keydown` | `x-on` shorthand events |
| `$store`, `$dispatch`, `$refs`, `$nextTick` | magic properties |
| `alpine-dropdown`, `alpine-modal`, `alpine-tabs`, `alpine-toggle` | full component patterns |

## Install extension in marketplace *(recomended method)*
To install extension directly from VSCode you need to proceed with theese four simple steps:

1. Go to *View > Command Palette* (Mac OSX: `cmd+shift+P`, Windows: `ctrl+shift+P`)
2. Run the following command in the Command Palette field: `>ext install extension` and hit enter.
3. Then type `nunjucks-vscode-extensionpack` and hit enter.
4. After instalation is complete restart the Code app and you are all set up for start writing nunjucks templates in VSCode.

## install extension manually
To install extension manually you need to proceed with theese five steps:

1. Download this [nunjucks-vscode-extensionpack](https://github.com/douglaszaltron/nunjucks-vscode-extensionpack) repo from GitHub
2. Navigate to the `<user home>/.vscode/extensions` directory on your computer.
3. Create a new folder and name it `nunjucks-vscode-extensionpack`
4. Copy all content of this repository into the `<user home>/.vscode/extensions/nunjucks-vscode-extensionpack` directory.
5. Restart the Code app and you are all set up for start writing nunjucks templates in Code.

## Settings

See the **Formatter settings** section above for the full list of
`nunjucksFormatter.*` options.

```
{
    "html.suggest.html5": true,
    "emmet.includeLanguages": {
        "njk": "html"
    },
    "files.associations": {
        "*.njk": "njk"
    },
    "[njk]": {
        "editor.defaultFormatter": "douglaszaltron.nunjucks-vscode-extensionpack",
        "editor.formatOnSave": true
    }
}
```
