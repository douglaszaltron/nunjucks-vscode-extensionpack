"use strict";

import * as fs from "fs";
import * as path from "path";

// @types/mocha exposes `Mocha` only as a global, so load the constructor via require.
const MochaRunner: typeof Mocha = require("mocha");

export async function run(): Promise<void> {
  const mocha = new MochaRunner({ ui: "tdd", color: true });
  const testsRoot = path.resolve(__dirname, "..");

  const files: string[] = [];
  const collect = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collect(full);
      } else if (/\.test\.js$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  collect(testsRoot);

  for (const file of files) {
    mocha.addFile(file);
  }

  return new Promise<void>((resolve, reject) => {
    mocha.run((failures: number) => {
      if (failures > 0) {
        reject(new Error(`${failures} test(s) failed.`));
      } else {
        resolve();
      }
    });
  });
}
