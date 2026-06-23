import { html as beautifyHtml } from "js-beautify";
import type { HTMLBeautifyOptions } from "js-beautify";

export type WrapAttributes = "auto" | "force" | "force-aligned" | "force-expand-multiline" | "aligned-multiple" | "preserve" | "preserve-aligned";

export interface FormatterSettings {
  preprocessNunjucks: boolean;
  wrapLineLength: number;
  wrapAttributes: WrapAttributes;
  endWithNewline: boolean;
  preserveNewlines: boolean;
  maxPreserveNewlines: number;
}

export interface FormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}

export const DEFAULT_SETTINGS: FormatterSettings = {
  preprocessNunjucks: true,
  wrapLineLength: 0,
  wrapAttributes: "force-expand-multiline",
  endWithNewline: true,
  preserveNewlines: true,
  maxPreserveNewlines: 1,
};

const RE = {
  FRONT_MATTER: /^---\r?\n[\s\S]*?\r?\n---\r?\n?/,
  TAG_AFTER_GT: />[ \t]*(\{%(?:[^%]|%(?!}))*%\})/g,
  TAG_BEFORE_LT: /(\{%(?:[^%]|%(?!}))*%\})[ \t]*</g,
  ADJACENT_TAGS: /(\{%(?:[^%]|%(?!}))*%\})[ \t]*(\{%(?:[^%]|%(?!}))*%\})/g,
  INLINE_IF_ENDIF: /(\{%[-]?\s*if\b(?:[^%]|%(?!}))*%\}[^\n]+)\n\s*(\{%[-]?\s*endif\b(?:[^%]|%(?!}))*%\})/g,
  INLINE_CHAIN: /(\{%[-]?\s*(?:if|elif|else)\b(?:[^%]|%(?!}))*%\}[^\n]+)\n\s*(\{%[-]?\s*(?:elif|else|endif)\b(?:[^%]|%(?!}))*%\}[^\n]*)/g,
  TRAILING_WS: /[ \t]+$/gm,
  EXCESSIVE_NL: /\n{3,}/g,
} as const;

const NJK_OPENING = /\{%[-]?\s*(if|for|block|macro|filter|raw|verbatim|call|asyncEach|asyncAll)\b/;
const NJK_CLOSING = /\{%[-]?\s*end(if|for|block|macro|filter|raw|verbatim|call|each|all)\b/;
const NJK_SAMELEVEL = /\{%[-]?\s*(else|elif)\b/;
const NJK_ONLY_LINE = /^\s*\{%[-]?\s*(?:if|elif|else|for|block|macro|filter|raw|verbatim|call|asyncEach|asyncAll|end\w+|set|include|import|from|extends)\b/;

const TEMPLATING = ["django"];
const UNFORMATTED: string[] = [];
const CONTENT_UNFORMATTED = ["pre", "textarea", "code"];

const EXTRA_LINERS = [
  "html", "/html", "head", "/head", "body", "/body",
  "header", "/header", "footer", "/footer",
  "nav", "/nav", "main", "/main",
  "section", "/section", "article", "/article",
  "aside", "/aside",
];

let optionCache: {
  tabSize: number;
  insertSpaces: boolean;
  settings: FormatterSettings;
  result: HTMLBeautifyOptions;
} | null = null;

function buildOptions(opts: FormattingOptions, s: FormatterSettings): HTMLBeautifyOptions {
  const { tabSize = 2, insertSpaces = true } = opts;

  if (optionCache
    && optionCache.tabSize === tabSize
    && optionCache.insertSpaces === insertSpaces
    && optionCache.settings === s
  ) {
    return optionCache.result;
  }

  const useTabs = !insertSpaces;

  const result: HTMLBeautifyOptions = {
    indent_size: tabSize,
    indent_char: useTabs ? "\t" : " ",
    indent_with_tabs: useTabs,
    wrap_line_length: s.wrapLineLength,
    wrap_attributes: s.wrapAttributes,
    wrap_attributes_indent_size: useTabs ? 1 : tabSize,
    templating: TEMPLATING,
    indent_inner_html: true,
    indent_body_inner_html: true,
    indent_head_inner_html: true,
    indent_scripts: "normal",
    unformatted: UNFORMATTED,
    content_unformatted: CONTENT_UNFORMATTED,
    inline_custom_elements: false,
    end_with_newline: s.endWithNewline,
    preserve_newlines: s.preserveNewlines,
    max_preserve_newlines: s.maxPreserveNewlines,
    extra_liners: EXTRA_LINERS,
  };

  optionCache = { tabSize, insertSpaces, settings: s, result };
  return result;
}

function preprocess(source: string): string {
  let result = source
    .replace(RE.TAG_AFTER_GT, ">\n$1")
    .replace(RE.TAG_BEFORE_LT, "$1\n<");

  let prev = "";
  while (result !== prev) {
    prev = result;
    result = result.replace(RE.ADJACENT_TAGS, "$1\n$2");
  }

  return result
    .replace(RE.TRAILING_WS, "")
    .replace(RE.EXCESSIVE_NL, "\n\n");
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

function fixNunjucksIndent(source: string, indentSize: number): string {
  const lines = source.split("\n");
  const result: string[] = [];
  let njkDepth = 0;
  let insideHtmlTag = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      result.push("");
      continue;
    }

    const isClosing = NJK_CLOSING.test(trimmed);
    const isOpening = NJK_OPENING.test(trimmed);
    const isSameLevel = NJK_SAMELEVEL.test(trimmed);
    const isNjkOnly = NJK_ONLY_LINE.test(trimmed) && !insideHtmlTag;

    if (isClosing && !insideHtmlTag) {
      njkDepth = Math.max(0, njkDepth - 1);
    }

    const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;

    if (isNjkOnly) {
      const depthOffset = isSameLevel ? Math.max(0, njkDepth - 1) : njkDepth;
      result.push(" ".repeat(currentIndent + depthOffset * indentSize) + trimmed);
    } else {
      result.push(" ".repeat(currentIndent + njkDepth * indentSize) + trimmed);
    }

    if (isOpening && !isClosing && !insideHtmlTag) {
      njkDepth++;
    }

    const openCount = (trimmed.match(/<[a-zA-Z]/g) ?? []).length;
    const closeCount = (trimmed.match(/>/g) ?? []).length;
    if (openCount > closeCount) {
      insideHtmlTag = true;
    } else if (closeCount > openCount || (closeCount === openCount && trimmed.includes(">"))) {
      insideHtmlTag = false;
    }
  }

  return result.join("\n");
}

function fixMultilineAttributes(source: string, indentSize: number): string {
  const lines = source.split("\n");
  const result: string[] = [];
  let inMultilineAttr = false;
  let attrBaseIndent = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;

    if (inMultilineAttr) {
      if (trimmed.startsWith("}") || trimmed.includes('}"') || trimmed.includes('">')) {
        inMultilineAttr = false;
        result.push(" ".repeat(attrBaseIndent) + trimmed);
      } else {
        result.push(" ".repeat(attrBaseIndent + indentSize) + trimmed);
      }
    } else if (trimmed.endsWith('="{')) {
      inMultilineAttr = true;
      attrBaseIndent = currentIndent;
      result.push(line);
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
}

export function formatText(
  source: string,
  opts: FormattingOptions,
  settings: FormatterSettings = DEFAULT_SETTINGS,
): string {
  try {
    const { frontMatter, body } = extractFrontMatter(source);

    const input = settings.preprocessNunjucks && body.includes("{%")
      ? preprocess(body)
      : body;

    const beautified = beautifyHtml(input, buildOptions(opts, settings));
    const indent = opts.insertSpaces ? (opts.tabSize || 2) : 1;

    let result = beautified;

    if (settings.preprocessNunjucks && body.includes("{%")) {
      result = fixNunjucksIndent(result, indent);
      let prev = "";
      while (result !== prev) {
        prev = result;
        result = result.replace(RE.INLINE_CHAIN, "$1$2");
      }
    }

    result = fixMultilineAttributes(result, indent);

    return frontMatter + result;
  } catch {
    return source;
  }
}

export function invalidateOptionCache(): void {
  optionCache = null;
}
