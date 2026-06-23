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

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

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
  let htmlDepth = 0;
  let insideHtmlTag = false;
  let insideHtmlTagBaseIndent = 0;
  let insideHtmlTagIsVoid = false;
  let insideNjkTag = false;
  let njkTagBaseIndent = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      result.push("");
      continue;
    }

    const hasNjkOpen = trimmed.includes("{%");
    const hasNjkClose = trimmed.includes("%}");

    if (insideNjkTag) {
      if (hasNjkClose) {
        insideNjkTag = false;
        result.push(" ".repeat(njkTagBaseIndent) + trimmed);
      } else {
        result.push(" ".repeat(njkTagBaseIndent + indentSize) + trimmed);
      }
      continue;
    }

    if (insideHtmlTag) {
      if (trimmed.startsWith(">")) {
        const rest = trimmed.slice(1).trim();
        const closeIndent = insideHtmlTagIsVoid
          ? insideHtmlTagBaseIndent
          : insideHtmlTagBaseIndent + indentSize;

        if (rest) {
          result.push(" ".repeat(closeIndent) + ">");
          insideHtmlTag = false;
          const closeMatch = rest.match(/^(.*?)\s*(<\/[a-zA-Z][a-zA-Z0-9-]*\s*>)\s*$/);
          if (closeMatch) {
            const content = closeMatch[1].trim();
            const closingTag = closeMatch[2];
            if (content) {
              result.push(" ".repeat((njkDepth + htmlDepth) * indentSize) + content);
            }
            htmlDepth = Math.max(0, htmlDepth - 1);
            result.push(" ".repeat((njkDepth + htmlDepth) * indentSize) + closingTag);
          } else {
            result.push(" ".repeat((njkDepth + htmlDepth) * indentSize) + rest);
            const closingTags = (rest.match(/<\/[a-zA-Z][a-zA-Z0-9-]*/g) ?? []).length;
            htmlDepth = Math.max(0, htmlDepth - closingTags);
          }
        } else {
          result.push(" ".repeat(closeIndent) + ">");
          insideHtmlTag = false;
        }
      } else {
        result.push(" ".repeat(insideHtmlTagBaseIndent + indentSize) + trimmed);
        if (trimmed.includes(">")) {
          insideHtmlTag = false;
        }
      }
      continue;
    }

    const isClosing = NJK_CLOSING.test(trimmed);
    const isOpening = NJK_OPENING.test(trimmed);
    const isSameLevel = NJK_SAMELEVEL.test(trimmed);
    const isNjkOnly = NJK_ONLY_LINE.test(trimmed);
    const isInlineConditional = isOpening && isClosing;

    if (isClosing && !isInlineConditional) {
      njkDepth = Math.max(0, njkDepth - 1);
    }

    if (/^<\/[a-zA-Z]/.test(trimmed)) {
      htmlDepth = Math.max(0, htmlDepth - 1);
    }

    let outputIndent: number;

    if (isNjkOnly) {
      const depthOffset = isSameLevel ? Math.max(0, njkDepth - 1) : njkDepth;
      outputIndent = (depthOffset + htmlDepth) * indentSize;
    } else {
      outputIndent = (njkDepth + htmlDepth) * indentSize;
    }

    result.push(" ".repeat(outputIndent) + trimmed);

    if (!/^<\/[a-zA-Z]/.test(trimmed) && !isNjkOnly) {
      const endClose = trimmed.match(/<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>$/);
      if (endClose) {
        const closeTagName = endClose[1].toLowerCase();
        if (!new RegExp(`<${closeTagName}\\b`, "i").test(trimmed)) {
          htmlDepth = Math.max(0, htmlDepth - 1);
        }
      }
    }

    if (isNjkOnly && hasNjkOpen && !hasNjkClose) {
      insideNjkTag = true;
      njkTagBaseIndent = outputIndent;
    }

    if (isOpening && !isClosing && !isInlineConditional) {
      njkDepth++;
    }

    if (!isNjkOnly) {
      const tagMatch = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        if (!VOID_ELEMENTS.has(tagName)) {
          const hasSelfClose = trimmed.endsWith("/>");
          const hasMatchingClose = trimmed.includes(`</${tagName}`);
          if (!hasSelfClose && !hasMatchingClose) {
            htmlDepth++;
          }
        }
        if (!trimmed.includes(">")) {
          insideHtmlTag = true;
          insideHtmlTagBaseIndent = outputIndent;
          insideHtmlTagIsVoid = VOID_ELEMENTS.has(tagName);
        }
      }
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

    let result = beautified.replace(/>(<)(?=[a-zA-Z/])/g, ">\n<");

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
