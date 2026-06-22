"use strict";

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
  TAG_AFTER_GT: />[ \t]*(\{%(?:[^%]|%(?!}))*%\})/g,
  TAG_BEFORE_LT: /(\{%(?:[^%]|%(?!}))*%\})[ \t]*</g,
  ADJACENT_TAGS: /(\{%(?:[^%]|%(?!}))*%\})[ \t]*(\{%(?:[^%]|%(?!}))*%\})/g,
  TRAILING_WS: /[ \t]+$/gm,
  EXCESSIVE_NL: /\n{3,}/g,
} as const;

const EXTRA_LINERS = [
  "html", "/html", "head", "/head", "body", "/body",
  "header", "/header", "footer", "/footer",
  "nav", "/nav", "main", "/main",
  "section", "/section", "article", "/article",
  "aside", "/aside",
];

function buildOptions(opts: FormattingOptions, s: FormatterSettings): HTMLBeautifyOptions {
  const { tabSize = 2, insertSpaces = true } = opts;

  return {
    indent_size: tabSize,
    indent_char: insertSpaces ? " " : "\t",
    indent_with_tabs: !insertSpaces,
    wrap_line_length: s.wrapLineLength,
    wrap_attributes: s.wrapAttributes,
    wrap_attributes_indent_size: tabSize,
    templating: ["django"],
    indent_inner_html: true,
    indent_body_inner_html: true,
    indent_head_inner_html: true,
    indent_scripts: "normal",
    unformatted: [],
    content_unformatted: ["pre", "textarea", "code"],
    inline_custom_elements: false,
    end_with_newline: s.endWithNewline,
    preserve_newlines: s.preserveNewlines,
    max_preserve_newlines: s.maxPreserveNewlines,
    extra_liners: EXTRA_LINERS,
  };
}

function preprocess(source: string): string {
  return source
    .replace(RE.TAG_AFTER_GT, ">\n$1")
    .replace(RE.TAG_BEFORE_LT, "$1\n<")
    .replace(RE.ADJACENT_TAGS, "$1\n$2")
    .replace(RE.TRAILING_WS, "")
    .replace(RE.EXCESSIVE_NL, "\n\n");
}

export function formatText(
  source: string,
  opts: FormattingOptions,
  settings: FormatterSettings = DEFAULT_SETTINGS,
): string {
  try {
    const input = settings.preprocessNunjucks && source.includes("{%")
      ? preprocess(source)
      : source;
    return beautifyHtml(input, buildOptions(opts, settings));
  } catch {
    return source;
  }
}
