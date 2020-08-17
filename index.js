"use strict";

// Imports and constants
const INJECTOR_DIR = "./injectors/";
const STATIC_DIR = "./static/";
const VAR_DIR = "./var/";
const LIB_SUBDIR = "lib/";
const MODULE_SUBDIR = "module/";
const CONFIG_SUBDIR = "config/";
const MAX_LISTENERS = 69;
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

const discordjs = require("discord.js");
const fs = require("fs");

// Global state object
var globalState = {
  bot: new discordjs.Client(),
  STATIC_DIR: STATIC_DIR,
  INJECTOR_DIR: INJECTOR_DIR,
  VAR_DIR: VAR_DIR,
  LIB_SUBDIR: LIB_SUBDIR,
  MODULE_SUBDIR: MODULE_SUBDIR,
  CONFIG_SUBDIR: CONFIG_SUBDIR
};

const discordToken = globalState.getToken("discordapi");

// Baseplate code
globalState.bot.on("ready", () => {
  console.log("Bot Ready");
});
globalState.bot.setMaxListeners(MAX_LISTENERS);

function executeInjectors(subdir){
  return new Promise((resolve, reject) => {
    // Execute injectors
    fs.readdir(INJECTOR_DIR + subdir, (err, files) => {
      if (err) {
        console.error(`fatal: Error while scanning injector dir ${INJECTOR_DIR}`);
        reject(err);
      }
      for (var i = 0; i < files.length; i++) {
        var injName = files[i];
        var injector;
        try {
          injector = require(INJECTOR_DIR + injName);
        } catch(error) {
          console.error(`fatal: Error with injector source ${injName}`);
          reject(err);
        }
        if(injector instanceof AsyncFunction){
          injector(globalState).catch(() => {
            console.error(`fatal: Error while executing async injector ${injName}`);
            reject(err);
          });
        }
        else{
          try {
            injector(globalState);
          } catch (error) {
            console.error(`fatal: Error while executing injector ${injName}`);
            reject(err);
          }
        }
      }
      resolve();
    });
  });
}

async function main(){
  await executeInjectors(LIB_SUBDIR);
  await executeInjectors(MODULE_SUBDIR);
  bot.login(discordToken);
}

main().catch(err => {
  console.error("fatal: Unhandled Error in main()");
  console.error("fatal: exit status 1");
});