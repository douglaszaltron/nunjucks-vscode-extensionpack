"use strict";

const { build } = require("esbuild");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

async function main() {
  execSync("tsc -p ./", { stdio: "inherit" });

  await build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    outfile: "out/extension.js",
    external: ["vscode"],
    format: "cjs",
    platform: "node",
    target: "node18",
    sourcemap: false,
    minify: true,
    logLevel: "info",
  });

  const distDir = path.resolve("dist");
  fs.mkdirSync(distDir, { recursive: true });

  execSync("npx vsce package", { stdio: "inherit" });

  const vsixName = `${pkg.name}-${pkg.version}.vsix`;
  if (fs.existsSync(vsixName)) {
    const dest = path.join(distDir, vsixName);
    fs.copyFileSync(vsixName, dest);
    fs.unlinkSync(vsixName);
    console.log(`\nPackaged: dist/${vsixName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
