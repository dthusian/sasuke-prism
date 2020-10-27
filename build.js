/* eslint-disable */

const { spawn } = require("child_process");
const { readdir, stat, mkdir, copyFile } = require("fs").promises;

async function copyFiles(srcdir, destdir) {
  if(!(await stat(destdir)).isDirectory()) {
    await mkdir(destdir);
  }
  var dir = await readdir(srcdir);
  var promises = dir.map(v => {
    return copyFile(srcdir + "/" + v, destdir + "/" + v);
  });
  await Promise.all(promises)
}

function tscBuild() {
  return new Promise((resolve, reject) => {
    var proc = spawn("node", ["./node_modules/typescript/bin/tsc", "--build"], {
      stdio: "ignore"
    });
    proc.on("error", err => reject(err));
    proc.on("exit", code => resolve(code));
  });
}


async function main() {
  await tscBuild();
  await copyFiles("./src/static/assets/", "./bin/static/assets/");
  await copyFiles("./bin/static/config/", "./bin/static/config/");
}
main();