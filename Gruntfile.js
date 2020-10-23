/* eslint-disable */

var resolve = require("path").resolve;
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json")
  });
  grunt.registerTask("ts-compile", "Builds Typescript source into Javascript", function() {
    var oldargv = Array.from(process.argv);
    // Hackiest hack in the west
    process.argv[2] = "--build";
    process.argv = process.argv.slice(0, 3);
    require("./node_modules/typescript/bin/tsc");
    process.argv = oldargv;
  });
  grunt.registerTask("copy-config", "Copies config files from source directory into bin directory", function() {
    grunt.file.mkdir(resolve("./bin/static/"));
    grunt.file.recurse(resolve("./src/static/"), (abspath, rootdir, subdir, filename) => {
      var outdir = resolve(rootdir + "/" + subdir);
      if(!grunt.file.isDir(outdir)) {
        grunt.file.mkdir(outdir);
      }
      grunt.file.copy(resolve("./src/static/", subdir, filename), resolve("./bin/static/", subdir, filename))
    });
  });
  grunt.registerTask("pre-debug", "The task to run before a debug session.", ["ts-compile", "copy-config"]);
};