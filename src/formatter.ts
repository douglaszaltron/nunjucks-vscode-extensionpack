import { createContext } from "@dprint/formatter";
import * as path from "path";
import * as fs from "fs";

export interface FormatterSettings {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  maxAttrsPerLine: number;
  closingBracketSameLine: boolean;
  singleAttrSameLine: boolean;
  selfClosingVoid: boolean;
  endWithNewline: boolean;
}

export interface FormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}

export const DEFAULT_SETTINGS: FormatterSettings = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  maxAttrsPerLine: 1,
  closingBracketSameLine: true,
  singleAttrSameLine: false,
  selfClosingVoid: true,
  endWithNewline: true,
};

const RE = {
  FRONT_MATTER: /^---\r?\n[\s\S]*?\r?\n---\r?\n?/,
} as const;

interface DprintContext {
  context: ReturnType<typeof createContext>;
  settings: FormatterSettings;
  tabSize: number;
  insertSpaces: boolean;
}

let dprintContext: DprintContext | null = null;

function getWasmPath(): string {
  const devPath = path.resolve(process.cwd(), "assets/wasm/markup_fmt.wasm");
  if (fs.existsSync(devPath)) {
    return devPath;
  }
  const prodPath = path.resolve(__dirname, "../assets/wasm/markup_fmt.wasm");
  if (fs.existsSync(prodPath)) {
    return prodPath;
  }
  return devPath;
}

function buildDprintContext(opts: FormattingOptions, s: FormatterSettings): DprintContext {
  if (dprintContext
    && dprintContext.tabSize === opts.tabSize
    && dprintContext.insertSpaces === opts.insertSpaces
    && dprintContext.settings === s
  ) {
    return dprintContext;
  }

  const wasmPath = getWasmPath();
  const wasmBuffer = fs.readFileSync(wasmPath);

  const { tabSize = 2, insertSpaces = true } = opts;
  const indentWidth = s.useTabs ? 0 : s.tabWidth;
  const useTabs = s.useTabs;

  const context = createContext({
    indentWidth,
    lineWidth: s.printWidth,
    useTabs,
  });

  context.addPlugin(wasmBuffer, {
    maxAttrsPerLine: s.maxAttrsPerLine,
    closingBracketSameLine: s.closingBracketSameLine,
    singleAttrSameLine: s.singleAttrSameLine,
    "html.void.selfClosing": s.selfClosingVoid,
  });

  dprintContext = { context, settings: s, tabSize, insertSpaces };
  return dprintContext;
}

function extractFrontMatter(source: string): { frontMatter: string; body: string } {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) {
    return { frontMatter: "", body: source };
  }
  const match = source.match(RE.FRONT_MATTER);
  if (!match) {
    return { frontMatter: "", body: source };
  }
  return { frontMatter: match[0], body: source.slice(match[0].length) };
}

export function formatText(
  source: string,
  opts: FormattingOptions,
  settings: FormatterSettings = DEFAULT_SETTINGS,
  filePath: string = "file.njk",
): string {
  try {
    const { frontMatter, body } = extractFrontMatter(source);
    const { context } = buildDprintContext(opts, settings);
    let formatted = context.formatText({
      filePath,
      fileText: body,
    });

    if (settings.endWithNewline) {
      if (!formatted.endsWith("\n")) {
        formatted = formatted + "\n";
      }
    } else {
      formatted = formatted.replace(/\n$/, "");
    }

    return frontMatter + formatted;
  } catch {
    return source;
  }
}

export function invalidateOptionCache(): void {
  dprintContext = null;
}
