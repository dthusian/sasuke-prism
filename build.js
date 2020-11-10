/* eslint-disable */

const { spawn } = require("child_process");
const { readdir, stat, mkdir, copyFile, copy } = require("fs-extra");

async function copyFiles(srcdir, destdir) {
  await copy(srcdir, destdir);
}

function tscBuild() {
  return new Promise((resolve, reject) => {
    var proc = spawn("node", ["./node_modules/typescript/bin/tsc", "--build", "--extendedDiagnostics"], {
      stdio: "inherit"
    });
    proc.on("error", err => reject(err));
    proc.on("exit", code => resolve(code));
  });
}


async function main() {
  await tscBuild();
  await copyFiles("./src/static/assets/", "./bin/static/assets/");
  await copyFiles("./src/static/config/", "./bin/static/config/");
}
main();