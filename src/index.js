"use strict";

// Imports and constants
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

const discordjs = require("discord.js");
const fs = require("fs");
const reqLib = new (require("./requires.js"))();
const consts = require("./const.js");

// Global state object
var globalState = {
  bot: new discordjs.Client(),
  require: reqLib.require,
  debug: false
};

consts(globalState);

// Baseplate code
globalState.bot.on("ready", () => {
  console.log("Bot Ready");
});

function executeInjectors(subdir){
  return new Promise((resolve, reject) => {
    // Execute injectors
    fs.readdir(globalState.INJECTOR_DIR + subdir, (err, files) => {
      if (err) {
        console.error(`fatal: Error while scanning injector dir ${globalState.INJECTOR_DIR}`);
        reject(err);
        return;
      }
      // Used by async injectors to ensure each one finishes
      var injectorsRunning = [];
      for (var i = 0; i < files.length; i++) {
        var injName = files[i];
        var injector;
        // Load the injector
        try {
          injector = require(globalState.INJECTOR_DIR + subdir + injName);
        } catch(error) {
          console.error(`fatal: Error with injector source ${injName}`);
          reject(error);
          return;
        }
        // Execute the injector

        // Async injectors are ok
        if(injector instanceof AsyncFunction) {
          injectorsRunning.push(injector(globalState).catch((error) => {
            console.error(`fatal: Error while executing async injector ${injName}`);
            reject(error);
            reqLib.satisfy(injName);
            return;
          }));
        // Sync injectors
        } else {
          try {
            injector(globalState);
            reqLib.satisfy(injName);
          } catch (error) {
            console.error(`fatal: Error while executing injector ${injName}`);
            reject(error);
            return;
          }
        }
      }
      Promise.all(injectorsRunning).then(() => {
        resolve();
      });
    });
  });
}

async function main(){
  await executeInjectors(globalState.LIB_SUBDIR);
  await executeInjectors(globalState.MODULE_SUBDIR);
  // Drop all promises, they are waiting on non-existent modules
  reqLib.drop();
  globalState.bot.login(globalState.getToken("discordapi"));
}

main().catch(err => {
  console.error("fatal: Unhandled Error in main()");
  console.error("fatal: exit status 1");
  console.error(err);
  return Promise.reject(err);
});