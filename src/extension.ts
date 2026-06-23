import * as vscode from "vscode";
import { formatText, DEFAULT_SETTINGS, invalidateOptionCache } from "./formatter";
import type { FormatterSettings } from "./formatter";

const LANGUAGE_IDS = ["njk", "astro", "vue", "svelte", "twig", "jinja"];

let settings: FormatterSettings | null = null;

function loadSettings(): FormatterSettings {
  const config = vscode.workspace.getConfiguration("nunjucksFormatter");
  return {
    printWidth: config.get("printWidth", DEFAULT_SETTINGS.printWidth),
    tabWidth: config.get("tabWidth", DEFAULT_SETTINGS.tabWidth),
    useTabs: config.get("useTabs", DEFAULT_SETTINGS.useTabs),
    maxAttrsPerLine: config.get("maxAttrsPerLine", DEFAULT_SETTINGS.maxAttrsPerLine),
    closingBracketSameLine: config.get("closingBracketSameLine", DEFAULT_SETTINGS.closingBracketSameLine),
    singleAttrSameLine: config.get("singleAttrSameLine", DEFAULT_SETTINGS.singleAttrSameLine),
    selfClosingVoid: config.get("selfClosingVoid", DEFAULT_SETTINGS.selfClosingVoid),
    endWithNewline: config.get("endWithNewline", DEFAULT_SETTINGS.endWithNewline),
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
      const formatted = formatText(text, opts, getSettings(), doc.fileName);
      if (formatted === text) return [];
      return [new vscode.TextEdit(fullRange(doc), formatted)];
    },
  };

  const rangeProvider: vscode.DocumentRangeFormattingEditProvider = {
    provideDocumentRangeFormattingEdits(doc, range, opts) {
      const text = doc.getText(range);
      const formatted = formatText(text, opts, getSettings(), doc.fileName);
      if (formatted === text) return [];
      return [new vscode.TextEdit(range, formatted)];
    },
  };

  for (const lang of LANGUAGE_IDS) {
    ctx.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(lang, formatProvider),
      vscode.languages.registerDocumentRangeFormattingEditProvider(lang, rangeProvider)
    );
  }

  ctx.subscriptions.push(reload);
}

export function deactivate(): void {
  settings = null;
  invalidateOptionCache();
}
