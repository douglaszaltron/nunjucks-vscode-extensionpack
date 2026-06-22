---
"nunjucks-vscode-extensionpack": patch
---

Performance optimizations for the formatter to reduce allocations and unnecessary work on repeated saves.

- Hoisted static arrays to module-level constants
- Cached HTMLBeautifyOptions object with invalidation
- Skip TextEdit when formatted output equals input
- Early exit front matter check with startsWith before regex
