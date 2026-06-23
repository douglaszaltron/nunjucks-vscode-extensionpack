import * as assert from "assert";
import { formatText, DEFAULT_SETTINGS } from "../formatter";

const OPTS = { tabSize: 2, insertSpaces: true };

function fmt(src: string): string {
  return formatText(src, OPTS, DEFAULT_SETTINGS);
}

describe("formatText", () => {
  describe("HTML formatting", () => {
    it("indents nested HTML elements when input has newlines", () => {
      const out = fmt("<div>\n<p>hello</p>\n</div>");
      assert.ok(out.includes("\n  <p>hello</p>\n"));
    });

    it("formats void elements without closing tags", () => {
      const out = fmt("<div><br><img src=\"x.jpg\"></div>");
      assert.ok(out.includes("<br />"));
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

    it("is stable on template syntax", () => {
      const src = "<div>{% if active %}<p>hi</p>{% endif %}</div>";
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });

    it("is stable on AlpineJS", () => {
      const src = '<div x-data="{ open: false }" @click="open = !open">Hi</div>';
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });

    it("is stable on complex nested template", () => {
      const src = `<nav><ul>{% for item in items %}<li><div><a href="{{ item.url }}">{{ item.label }}</a></div>{% if item.children %}<ul>{% for child in item.children %}<li><div><a href="{{ child.url }}">{{ child.label }}</a></div></li>{% endfor %}</ul>{% endif %}</li>{% endfor %}</ul></nav>`;
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });
  });

  describe("template tags preservation", () => {
    it("leaves template tags inside attributes untouched", () => {
      const out = fmt('<span class="{% if active %}on{% endif %}">x</span>');
      assert.ok(out.includes('class="{% if active %}on{% endif %}"'));
    });

    it("leaves template variables inside attributes untouched", () => {
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

    it("handles HTML without template tags", () => {
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
    it("respects tabWidth setting", () => {
      const out = formatText("<div>\n<p>hi</p>\n</div>", { tabSize: 2, insertSpaces: true }, { ...DEFAULT_SETTINGS, tabWidth: 4 });
      assert.ok(out.includes("\n    <p>hi</p>\n"));
    });

    it("respects useTabs setting", () => {
      const out = formatText("<div>\n\t<p>hi</p>\n</div>", { tabSize: 2, insertSpaces: true }, { ...DEFAULT_SETTINGS, useTabs: true });
      assert.ok(out.includes("\n\t<p>hi</p>\n"));
    });

    it("uses one tab per indent level (fixes #4)", () => {
      const out = formatText("<div><div><p>deep</p></div></div>", { tabSize: 4, insertSpaces: false }, DEFAULT_SETTINGS);
      const lines = out.split("\n");
      for (const line of lines) {
        const tabs = (line.match(/^\t*/) ?? [""])[0];
        assert.ok(tabs.length <= 3, `Expected max 3 tabs, got ${tabs.length} in: "${line}"`);
      }
    });

    it("does not produce excessive indentation with spaces", () => {
      const src = "<div>{% for item in items %}{% if item.active %}<p>{{ item.name }}</p>{% endif %}{% endfor %}</div>";
      const out = formatText(src, { tabSize: 2, insertSpaces: true }, DEFAULT_SETTINGS);
      const lines = out.split("\n");
      for (const line of lines) {
        const spaces = (line.match(/^ */) ?? [""])[0];
        assert.ok(spaces.length <= 12, `Expected max 12 spaces (6 levels), got ${spaces.length} in: "${line}"`);
      }
    });

    it("respects endWithNewline = false", () => {
      const s = { ...DEFAULT_SETTINGS, endWithNewline: false };
      const out = formatText("<div>test</div>", OPTS, s);
      assert.ok(!out.endsWith("\n"));
    });

    it("respects closingBracketSameLine = true", () => {
      const s = { ...DEFAULT_SETTINGS, closingBracketSameLine: true };
      const src = `<span
  class="test"
></span>`;
      const out = formatText(src, OPTS, s);
      assert.ok(out.includes('class="test"></span>'));
    });
  });

  describe("file types", () => {
    it("formats .astro files", () => {
      const src = "<div>test</div>";
      const out = formatText(src, OPTS, DEFAULT_SETTINGS, "file.astro");
      assert.ok(typeof out === "string");
    });

    it("formats .vue files", () => {
      const src = "<div>test</div>";
      const out = formatText(src, OPTS, DEFAULT_SETTINGS, "file.vue");
      assert.ok(typeof out === "string");
    });

    it("formats .svelte files", () => {
      const src = "<div>test</div>";
      const out = formatText(src, OPTS, DEFAULT_SETTINGS, "file.svelte");
      assert.ok(typeof out === "string");
    });

    it("formats .twig files", () => {
      const src = "<div>test</div>";
      const out = formatText(src, OPTS, DEFAULT_SETTINGS, "file.twig");
      assert.ok(typeof out === "string");
    });

    it("formats .jinja files", () => {
      const src = "<div>test</div>";
      const out = formatText(src, OPTS, DEFAULT_SETTINGS, "file.jinja");
      assert.ok(typeof out === "string");
    });
  });

  describe("YAML front matter", () => {
    it("preserves front matter untouched", () => {
      const src = "---\nlayout: main\ntitle: Home\n---\n<div><p>hello</p></div>";
      const out = fmt(src);
      assert.ok(out.startsWith("---\nlayout: main\ntitle: Home\n---"));
      assert.ok(out.includes("\nlayout: main\n"));
      assert.ok(out.includes("\ntitle: Home\n"));
    });

    it("does not collapse front matter into one line", () => {
      const src = "---\nlayout: main\ntitle: Home\n---\n<p>content</p>";
      const out = fmt(src);
      assert.ok(!out.includes("--- layout:"));
      assert.ok(out.includes("---\nlayout: main\ntitle: Home\n---"));
    });

    it("preserves front matter with template content", () => {
      const src = "---\nlayout: main\n---\n<div>{% if active %}<p>hi</p>{% endif %}</div>";
      const out = fmt(src);
      assert.ok(out.startsWith("---\nlayout: main\n---"));
      assert.ok(out.includes("{% if active %}"));
      assert.ok(out.includes("{% endif %}"));
    });

    it("is idempotent with front matter", () => {
      const src = "---\nlayout: main\n---\n<div><p>hello</p></div>";
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });

    it("handles file without front matter", () => {
      const src = "<div><p>hello</p></div>";
      const out = fmt(src);
      assert.ok(out.includes("<p>hello</p>"));
    });
  });

  describe("template block indentation", () => {
    it("indents {% else %} at same level as {% if %}", () => {
      const src = "<div>{% if a %}<p>a</p>{% else %}<p>b</p>{% endif %}</div>";
      const out = fmt(src);
      const lines = out.split("\n");
      const ifIndent = lines.find((l) => l.includes("{% if a"))?.match(/^ */)?.[0].length ?? 0;
      const elseIndent = lines.find((l) => l.includes("{% else"))?.match(/^ */)?.[0].length ?? 0;
      assert.strictEqual(ifIndent, elseIndent, "{% else %} should be at same level as {% if %}");
    });

    it("indents {% endif %} at same level as {% if %}", () => {
      const src = "<div>{% if a %}<p>a</p>{% endif %}</div>";
      const out = fmt(src);
      const lines = out.split("\n");
      const ifIndent = lines.find((l) => l.includes("{% if a"))?.match(/^ */)?.[0].length ?? 0;
      const endifIndent = lines.find((l) => l.includes("{% endif"))?.match(/^ */)?.[0].length ?? 0;
      assert.strictEqual(ifIndent, endifIndent, "{% endif %} should be at same level as {% if %}");
    });

    it("is idempotent with nested template blocks", () => {
      const src = "{% macro render(img) %}{% if img %}{% if img.large %}<img src=\"{{ img.large }}\">{% endif %}{% else %}<span>none</span>{% endif %}{% endmacro %}";
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });
  });

  describe("self-closing and empty elements", () => {
    it("is idempotent with complex CTA section", () => {
      const src = `{% import "@shared/ui/primitives/icons.njk" as icon %}

<section
  aria-labelledby="cta-heading"
  class="pbs-40 pbe-40 px-6 relative overflow-hidden cv-auto-600"
>
  <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
    <div class="absolute olet-600/15 via-transparent to-transparent"></div>
    <div class="absolute -transparent"></div>
  </div>
  <div class="max-inline-6xl mx-auto relative radius-card-l">
    <div class="absa-600/20 -z-10"></div>
    <div class="abpattern"></div>
    <div class="absol"></div>
    <div class="abso[50px]"></div>
    <h2
      id="cta-heading"
      class="text-5xl md:text-6xl lg:text-7xl font-black mbe-8 text-white tracking-tighter"
>
      {{ i18n.t('cta:heading') }}
    </h2>
    <p class="text-slate-300 mbe-14 max-inline-2xl mx-auto text-xl md:text-2xl leading-relaxed font-medium">{{ i18n.t('cta:description') }}</p>
    <a
      href="{{ url('/contact') }}"
      class="mag ease-emphasized hover:scale-105 hover:shadow-[0_25px_60px_rgba(255,255,255,0.3)] overflow-hidden"
>
      <span class="absolute inset-0 bg-linear-to-700 ease-in-out"></span>
      <span class="relative flex items-center gap-3">
        {{ i18n.t('cta:button_text') }}
        {{ icon.icon('arrow-right', 'inline-6 block-6 icon-transition group-hover:translate-x-1', size='xl') }}
      </span>
    </a>
  </div>
</section>`;
      assert.strictEqual(fmt(src), fmt(fmt(src)));
    });
  });
});
