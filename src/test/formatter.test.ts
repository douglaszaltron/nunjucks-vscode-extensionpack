"use strict";

import * as assert from "assert";
import { formatText, DEFAULT_SETTINGS } from "../formatter";

const OPTS = { tabSize: 2, insertSpaces: true };

function fmt(src: string): string {
  return formatText(src, OPTS, DEFAULT_SETTINGS);
}

describe("formatText", () => {
  describe("HTML formatting", () => {
    it("indents nested HTML elements", () => {
      const out = fmt("<div><p>hello</p></div>");
      assert.ok(out.includes("\n  <p>hello</p>\n"));
    });

    it("formats void elements without closing tags", () => {
      const out = fmt("<div><br><img src=\"x.jpg\"></div>");
      assert.ok(out.includes("<br>"));
      assert.ok(out.includes("<img"));
      assert.ok(!out.includes("</br>"));
    });

    it("preserves content inside <pre> tags", () => {
      const out = fmt("<pre>  line1\n  line2</pre>");
      assert.ok(out.includes("  line1"));
      assert.ok(out.includes("  line2"));
    });

    it("ends with a newline", () => {
      const out = fmt("<div>test</div>");
      assert.ok(out.endsWith("\n"));
    });
  });

  describe("idempotency", () => {
    it("is stable on plain HTML", () => {
      const src = "<div><p>hello</p></div>";
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });

    it("is stable on Nunjucks", () => {
      const src = "<div>{% if active %}<p>hi</p>{% endif %}</div>";
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });

    it("is stable on AlpineJS", () => {
      const src = '<div x-data="{ open: false }" @click="open = !open">Hi</div>';
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });

    it("is stable on complex nested template", () => {
      const src = `<nav><ul>{% for item in items %}<li><a href="{{ item.url }}">{{ item.label }}</a>{% if item.children %}<ul>{% for child in item.children %}<li><a href="{{ child.url }}">{{ child.label }}</a></li>{% endfor %}</ul>{% endif %}</li>{% endfor %}</ul></nav>`;
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });
  });

  describe("Nunjucks preprocessing", () => {
    it("separates inline block tags onto their own lines", () => {
      const out = fmt("<div>{% if active %}<p>hi</p>{% endif %}</div>");
      const lines = out.split("\n");
      assert.ok(lines.some((l) => l.trim().startsWith("{% if")));
      assert.ok(lines.some((l) => l.trim().startsWith("{% endif")));
    });

    it("separates consecutive Nunjucks tags", () => {
      const out = fmt("<div>{% if a %}{% if b %}content{% endif %}{% endif %}</div>");
      assert.ok(out.includes("{% if a %}"));
      assert.ok(out.includes("{% if b %}"));
    });

    it("handles for loops with variables", () => {
      const out = fmt("<ul>{% for item in items %}<li>{{ item.name }}</li>{% endfor %}</ul>");
      assert.ok(out.includes("{% for item in items %}"));
      assert.ok(out.includes("{% endfor %}"));
      assert.ok(out.includes("{{ item.name }}"));
    });

    it("preserves Nunjucks comments", () => {
      const out = fmt("<div>{# a comment #}<p>hi</p></div>");
      assert.ok(out.includes("{# a comment #}"));
    });

    it("preserves whitespace control syntax", () => {
      const out = fmt("<div>{%- if active -%}<p>hi</p>{%- endif -%}</div>");
      assert.ok(out.includes("{%- if active -%}"));
      assert.ok(out.includes("{%- endif -%}"));
    });

    it("preserves Nunjucks variables", () => {
      const out = fmt("<div>{{ user.name }}</div>");
      assert.ok(out.includes("{{ user.name }}"));
    });

    it("preserves filter chains", () => {
      const out = fmt("<div>{{ name | upper | trim }}</div>");
      assert.ok(out.includes("{{ name | upper | trim }}"));
    });

    it("handles nested Nunjucks blocks", () => {
      const out = fmt("<ul>{% for item in items %}{% if item.active %}<li>{{ item.name }}</li>{% endif %}{% endfor %}</ul>");
      assert.ok(out.includes("{% for item in items %}"));
      assert.ok(out.includes("{% if item.active %}"));
      assert.ok(out.includes("{% endif %}"));
      assert.ok(out.includes("{% endfor %}"));
    });
  });

  describe("inline Nunjucks preservation", () => {
    it("leaves Nunjucks inside attributes untouched", () => {
      const out = fmt('<span class="{% if active %}on{% endif %}">x</span>');
      assert.ok(out.includes('class="{% if active %}on{% endif %}"'));
    });

    it("leaves Nunjucks variables inside attributes untouched", () => {
      const out = fmt('<a href="{{ url }}">link</a>');
      assert.ok(out.includes('href="{{ url }}"'));
    });
  });

  describe("AlpineJS directives", () => {
    it("preserves x-data directive", () => {
      const out = fmt('<div x-data="{ open: false }">Hi</div>');
      assert.ok(out.includes("x-data"));
    });

    it("preserves @click shorthand", () => {
      const out = fmt('<button @click="open = !open">Toggle</button>');
      assert.ok(out.includes("@click"));
    });

    it("preserves :class shorthand", () => {
      const out = fmt('<div :class="{ hidden: !open }">Hi</div>');
      assert.ok(out.includes(":class"));
    });

    it("preserves x-transition directive", () => {
      const out = fmt('<div x-show="open" x-transition>Hi</div>');
      assert.ok(out.includes("x-transition"));
    });

    it("preserves x-for with template", () => {
      const src = '<template x-for="item in items" :key="item.id"><div>{{ item.name }}</div></template>';
      const out = fmt(src);
      assert.ok(out.includes("x-for"));
      assert.ok(out.includes(":key"));
    });
  });

  describe("edge cases", () => {
    it("handles empty input", () => {
      const out = fmt("");
      assert.strictEqual(typeof out, "string");
    });

    it("handles whitespace-only input", () => {
      const out = fmt("   \n  \n  ");
      assert.strictEqual(typeof out, "string");
    });

    it("handles plain text without HTML", () => {
      const out = fmt("Hello World");
      assert.ok(out.includes("Hello World"));
    });

    it("handles HTML without Nunjucks tags", () => {
      const out = fmt("<div><p>just HTML</p></div>");
      assert.ok(out.includes("<p>just HTML</p>"));
    });

    it("handles deeply nested structures", () => {
      const src = "<div><div><div><div><p>deep</p></div></div></div></div>";
      const out = fmt(src);
      assert.ok(out.includes("<p>deep</p>"));
      assert.strictEqual(out, fmt(out));
    });
  });

  describe("settings", () => {
    it("respects tabSize setting", () => {
      const out = formatText("<div><p>hi</p></div>", { tabSize: 4, insertSpaces: true }, DEFAULT_SETTINGS);
      assert.ok(out.includes("\n    <p>hi</p>\n"));
    });

    it("respects insertSpaces setting", () => {
      const out = formatText("<div><p>hi</p></div>", { tabSize: 2, insertSpaces: false }, DEFAULT_SETTINGS);
      assert.ok(out.includes("\n\t<p>hi</p>\n"));
    });

    it("respects endWithNewline = false", () => {
      const s = { ...DEFAULT_SETTINGS, endWithNewline: false };
      const out = formatText("<div>test</div>", OPTS, s);
      assert.ok(!out.endsWith("\n"));
    });

    it("respects preprocessNunjucks = false", () => {
      const s = { ...DEFAULT_SETTINGS, preprocessNunjucks: false };
      const out = formatText("<div>{% if x %}<p>hi</p>{% endif %}</div>", OPTS, s);
      assert.ok(out.includes("{% if x %}"));
    });
  });
});
