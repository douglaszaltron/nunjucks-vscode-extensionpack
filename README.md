# Nunjucks Visual Studio Code Extension Pack

This is the nunjucks supporting extension for vscode with complete features.

## vscode-nunjucks support these file extensions

```
.nunjucks, .nunjs, .nj, .njk, .html, .htm, .template, .tmpl, .tpl
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
| `asyncAll`  | `{% asyncAll item in sequence %} {% endeach %}`  |
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

```
{
    "html.suggest.html5": true,
    "emmet.includeLanguages": {
        "njk": "html"
    },
    "files.associations": {
        "*.njk": "njk"
    }
}
```
