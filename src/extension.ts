"use strict";

import * as vscode from "vscode";

import * as prettydiff from "prettydiff2/prettydiff";

export function createHover(snippet: any, type: any) {
  const example = typeof snippet.example == "undefined" ? "" : snippet.example;
  const description = typeof snippet.description == "undefined" ? "" : snippet.description;

  return new vscode.Hover({ language: type, value: description + "\n\n" + example });
}

const prettyDiff = (document: any, range: any, options: any) => {
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

export function activate(context: vscode.ExtensionContext) {
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
  });

  console.log(
    'Congratulations, your extension "nunjucks-vscode-extensionpack" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("extension.sayHello", () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World!");
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
