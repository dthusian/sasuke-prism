"use strict";

const MAX_LISTENERS = 69;
const INJECTOR_DIR = "./injectors/";
const STATIC_DIR = "./static/";
const VAR_DIR = "./var/";
const LIB_SUBDIR = "lib/";
const MODULE_SUBDIR = "module/";
const CONFIG_SUBDIR = "config/";

module.exports = function pseudoInjectorMain(gs){
  gs.bot.setMaxListeners(MAX_LISTENERS);
  gs.INJECTOR_DIR = INJECTOR_DIR;
  gs.STATIC_DIR = STATIC_DIR;
  gs.VAR_DIR = VAR_DIR;
  gs.LIB_SUBDIR = LIB_SUBDIR;
  gs.MODULE_SUBDIR = MODULE_SUBDIR;
  gs.CONFIG_SUBDIR = CONFIG_SUBDIR;
}