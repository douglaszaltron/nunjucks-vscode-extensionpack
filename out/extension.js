"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const prettydiff = require("prettydiff2");

function createHover(snippet, type) {
  const example = typeof snippet.example == "undefined" ? "" : snippet.example;
  const description =
    typeof snippet.description == "undefined" ? "" : snippet.description;
  return new vscode.Hover({
    language: type,
    value: description + "\n\n" + example
  });
}

const prettyDiff = (document, range, options) => {
  const result = [];
  const content = document.getText(range);
  const workspaceConfig = vscode.workspace.getConfiguration("editor");
  const activeEditorOptions = vscode.window.activeTextEditor.options;
  const insize = activeEditorOptions.tabSize || workspaceConfig.tabSize;
  const inchar = activeEditorOptions.insertSpaces ? " " : "\t";
  const newText = prettydiff({
    source: content,
    lang: "twig",
    mode: "beautify",
    insize,
    inchar
  });
  result.push(vscode.TextEdit.replace(range, newText));
  return result;
};

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider("njk", {
      provideDocumentFormattingEdits(document, options, token) {
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(
          document.lineCount - 1,
          document.lineAt(document.lineCount - 1).text.length
        );
        const rng = new vscode.Range(start, end);
        return prettyDiff(document, rng, options);
      }
    })
  );
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
