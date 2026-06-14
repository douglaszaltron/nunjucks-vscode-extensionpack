"use strict";

import * as vscode from "vscode";

import { html as beautifyHtml } from "js-beautify";
import * as jsbeautify from "js-beautify";

const LANGUAGE_ID = "njk";

const NUNJUCKS_BLOCK_TAGS = [
  "if", "elif", "else", "endif",
  "for", "endfor",
  "block", "endblock",
  "macro", "endmacro",
  "filter", "endfilter",
  "raw", "endraw",
  "call", "endcall",
  "asyncEach", "endeach", "asyncAll",
  "set", "include", "import", "from", "extends",
];

export function preprocessNunjucks(source: string): string {
  const blockTagsPattern = NUNJUCKS_BLOCK_TAGS.join("|");
  const tagOpen = "{%[-]?\\s*(?:" + blockTagsPattern + ")\\b[\\s\\S]*?%}";

  source = source.replace(
    new RegExp("(?<=>)(?=\\s*" + tagOpen + ")", "g"),
    "\n"
  );
  source = source.replace(
    new RegExp("(" + tagOpen + ")(?=\\s*<)", "g"),
    "$1\n"
  );
  source = source.replace(
    new RegExp("(" + tagOpen + ")(?=\\s*" + tagOpen + ")", "g"),
    "$1\n"
  );
  return source;
}

function getBeautifyOptions(
  formattingOptions: vscode.FormattingOptions
): jsbeautify.HTMLBeautifyOptions {
  const config = vscode.workspace.getConfiguration("nunjucksFormatter");

  const indentSize = formattingOptions.tabSize || 2;
  const indentWithTabs = !formattingOptions.insertSpaces;

  return {
    indent_size: indentSize,
    indent_char: indentWithTabs ? "\t" : " ",
    indent_with_tabs: indentWithTabs,
    wrap_line_length: config.get<number>("wrapLineLength", 120),
    wrap_attributes: config.get<jsbeautify.HTMLBeautifyOptions["wrap_attributes"]>(
      "wrapAttributes",
      "auto"
    ),
    wrap_attributes_indent_size: indentSize,
    templating: ["django"],
    indent_inner_html: config.get<boolean>("indentInnerHtml", true),
    indent_body_inner_html: config.get<boolean>("indentBodyInnerHtml", true),
    indent_head_inner_html: config.get<boolean>("indentHeadInnerHtml", true),
    preserve_newlines: config.get<boolean>("preserveNewlines", true),
    max_preserve_newlines: config.get<number>("maxPreserveNewlines", 2),
    end_with_newline: config.get<boolean>("endWithNewline", true),
    indent_handlebars: config.get<boolean>("indentHandlebars", false),
    extra_liners: config.get<string[]>("extraLiners", [
      "html",
      "/html",
      "head",
      "/head",
      "body",
      "/body",
      "section",
      "/section",
    ]),
    unformatted: config.get<string[]>("unformatted", [
      "a", "abbr", "area", "audio", "b", "bdi", "bdo", "br", "canvas",
      "cite", "code", "data", "datalist", "del", "dfn", "em", "embed",
      "i", "iframe", "img", "input", "ins", "kbd", "label", "map",
      "mark", "math", "meter", "noscript", "object", "output", "progress",
      "q", "ruby", "s", "samp", "select", "slot", "small", "span",
      "strong", "sub", "sup", "svg", "template", "textarea", "time",
      "u", "var", "video", "wbr",
    ]),
    content_unformatted: config.get<string[]>("contentUnformatted", [
      "pre", "textarea",
    ]),
    inline_custom_elements: config.get<boolean>("inlineCustomElements", true),
  };
}

export function formatText(
  source: string,
  formattingOptions: vscode.FormattingOptions
): string {
  const config = vscode.workspace.getConfiguration("nunjucksFormatter");
  const preprocess = config.get<boolean>("preprocessNunjucks", true);
  const input = preprocess ? preprocessNunjucks(source) : source;
  const options = getBeautifyOptions(formattingOptions);
  return beautifyHtml(input, options);
}

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
  const lastLineId = document.lineCount - 1;
  return new vscode.Range(
    0,
    0,
    lastLineId,
    document.lineAt(lastLineId).text.length
  );
}

export function activate(context: vscode.ExtensionContext) {
  const formattingEditProvider: vscode.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(document, options) {
      const text = document.getText();
      const formatted = formatText(text, options);
      return [vscode.TextEdit.replace(fullDocumentRange(document), formatted)];
    },
  };

  const rangeFormattingEditProvider: vscode.DocumentRangeFormattingEditProvider = {
    provideDocumentRangeFormattingEdits(document, range, options) {
      const text = document.getText(range);
      const formatted = formatText(text, options);
      return [vscode.TextEdit.replace(range, formatted)];
    },
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      LANGUAGE_ID,
      formattingEditProvider
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      LANGUAGE_ID,
      rangeFormattingEditProvider
    )
  );

  return {
    formatText,
    preprocessNunjucks,
  };
}

export function deactivate() {}
