import * as vscode from "vscode";
import { formatText, DEFAULT_SETTINGS, invalidateOptionCache } from "./formatter";
import type { FormatterSettings } from "./formatter";

const LANGUAGE_ID = "njk";

let settings: FormatterSettings | null = null;

function loadSettings(): FormatterSettings {
  const config = vscode.workspace.getConfiguration("nunjucksFormatter");
  return {
    preprocessNunjucks: config.get("preprocessNunjucks", DEFAULT_SETTINGS.preprocessNunjucks),
    wrapLineLength: config.get("wrapLineLength", DEFAULT_SETTINGS.wrapLineLength),
    wrapAttributes: config.get("wrapAttributes", DEFAULT_SETTINGS.wrapAttributes),
    endWithNewline: config.get("endWithNewline", DEFAULT_SETTINGS.endWithNewline),
    preserveNewlines: config.get("preserveNewlines", DEFAULT_SETTINGS.preserveNewlines),
    maxPreserveNewlines: config.get("maxPreserveNewlines", DEFAULT_SETTINGS.maxPreserveNewlines),
  };
}

function getSettings(): FormatterSettings {
  return settings ?? (settings = loadSettings());
}

function fullRange(doc: vscode.TextDocument): vscode.Range {
  const last = doc.lineCount - 1;
  return new vscode.Range(0, 0, last, doc.lineAt(last).text.length);
}

export function activate(ctx: vscode.ExtensionContext): void {
  settings = loadSettings();

  const reload = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("nunjucksFormatter")) {
      settings = loadSettings();
      invalidateOptionCache();
    }
  });

  const formatProvider: vscode.DocumentFormattingEditProvider = {
    provideDocumentFormattingEdits(doc, opts) {
      const text = doc.getText();
      const formatted = formatText(text, opts, getSettings());
      if (formatted === text) return [];
      return [new vscode.TextEdit(fullRange(doc), formatted)];
    },
  };

  const rangeProvider: vscode.DocumentRangeFormattingEditProvider = {
    provideDocumentRangeFormattingEdits(doc, range, opts) {
      const text = doc.getText(range);
      const formatted = formatText(text, opts, getSettings());
      if (formatted === text) return [];
      return [new vscode.TextEdit(range, formatted)];
    },
  };

  ctx.subscriptions.push(
    reload,
    vscode.languages.registerDocumentFormattingEditProvider(LANGUAGE_ID, formatProvider),
    vscode.languages.registerDocumentRangeFormattingEditProvider(LANGUAGE_ID, rangeProvider)
  );
}

export function deactivate(): void {
  settings = null;
  invalidateOptionCache();
}
