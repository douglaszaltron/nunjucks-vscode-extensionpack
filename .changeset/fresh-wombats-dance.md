---
"nunjucks-vscode-extensionpack": major
---

Breaking: Replace js-beautify with dprint + markup_fmt for native Nunjucks support. This changes the formatting behavior - markup_fmt preserves inline content structure rather than always expanding to multi-line. Settings API changed: wrapAttributes replaced with maxAttrsPerLine and preferAttrsSingleLine, wrapLineLength renamed to printWidth. Added markup_fmt.wasm as vendored dependency.
