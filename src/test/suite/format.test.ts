"use strict";

import * as assert from "assert";
import * as vscode from "vscode";

const EXTENSION_ID = "douglaszaltron.nunjucks-vscode-extensionpack";

interface FormatterApi {
  formatText: (source: string, options: vscode.FormattingOptions) => string;
  preprocessNunjucks: (source: string) => string;
}

async function getApi(): Promise<FormatterApi> {
  const ext = vscode.extensions.getExtension<FormatterApi>(EXTENSION_ID);
  assert.ok(ext, `Extension "${EXTENSION_ID}" not found in host.`);
  if (!ext!.isActive) {
    await ext!.activate();
  }
  return ext!.exports;
}

function opts(tabSize = 2, insertSpaces = true): vscode.FormattingOptions {
  return { tabSize, insertSpaces };
}

suite("Nunjucks formatter", () => {
  test("exposes formatText and preprocessNunjucks", async () => {
    const api = await getApi();
    assert.strictEqual(typeof api.formatText, "function");
    assert.strictEqual(typeof api.preprocessNunjucks, "function");
  });

  test("preprocessNunjucks pulls block tags onto their own lines", async () => {
    const api = await getApi();
    const src = `<div>{% if active %}<p>hi</p>{% endif %}</div>`;
    const out = api.preprocessNunjucks(src);

    assert.ok(
      /(^|\n)\s*\{%\s*if active\s*%\}/.test(out),
      "opening {% if %} should start its own line"
    );
    assert.ok(
      /\{%\s*endif\s*%\}(\s*\n|$)/.test(out),
      "closing {% endif %} should end its own line"
    );
  });

  test("preprocessNunjucks leaves inline attribute Nunjucks untouched", async () => {
    const api = await getApi();
    const src = `<span class="{% if active %}on{% endif %}">x</span>`;
    const out = api.preprocessNunjucks(src);

    assert.ok(
      out.includes('class="{% if active %}on{% endif %}"'),
      "inline Nunjucks inside an attribute must remain intact"
    );
  });

  test("formatText preserves AlpineJS directives and shorthands", async () => {
    const api = await getApi();
    const src =
      '<div x-data="{ open: false }" @click="open = !open" :class="{ hidden: !open }">Hi</div>';
    const out = api.formatText(src, opts());

    assert.ok(out.includes("x-data"), "x-data directive should survive formatting");
    assert.ok(out.includes("@click"), "@click shorthand should survive formatting");
    assert.ok(out.includes(":class"), ":class shorthand should survive formatting");
  });

  test("formatText indents nested HTML", async () => {
    const api = await getApi();
    const src = "<div><p>hello</p></div>";
    const out = api.formatText(src, opts(2, true));

    assert.ok(
      out.includes("\n  <p>hello</p>\n"),
      "nested <p> should be indented two spaces under <div>"
    );
  });

  test("formatText preserves Tailwind utility classes verbatim", async () => {
    const api = await getApi();
    const src =
      '<button class="px-4 py-2 bg-blue-500 text-white rounded">Save</button>';
    const out = api.formatText(src, opts());

    assert.ok(
      out.includes("px-4 py-2 bg-blue-500 text-white rounded"),
      "Tailwind class list should be preserved unchanged"
    );
  });

  test("formatText is idempotent on HTML + Alpine markup", async () => {
    const api = await getApi();
    const src =
      '<div x-data="{ open: false }" @click="open = !open">\n<p>Hi</p>\n</div>';
    const once = api.formatText(src, opts());
    const twice = api.formatText(once, opts());

    assert.strictEqual(once, twice, "formatting twice must be stable");
  });
});
