"use strict";

const fs = require("fs");
var tokens = JSON.parse(fs.readFileSync("./static/tokens.json"));

var configCache = {};

module.exports = function injectorMain(gs){
  gs.getToken = function getToken(token) {
    return tokens[token];
  };
  gs.getConfig = function getConfig(path) {
    if(configCache[path]) return configCache[path];
    var json = JSON.parse(fs.readFileSync(gs.STATIC_DIR + gs.CONFIG_SUBDIR + path).toString());
    configCache[path] = json;
    return json;
  };
  gs.normalMsg = function normalMsg(msg) {
    return msg && msg.content && msg.author && !msg.author.bot;
  };
  gs.isSuperUser = function isSuperUser(user) {
    return user.username === "dthusian" && user.discriminator === "8480";
  };
  gs.safeSend = function safeSend(msg, channel) {
    channel.send(msg).catch(() => {});
  };
  gs.getEmbedColor = function getEmbedColor(modName) {
    var cfgVal = gs.getConfig("embedColors.json");
    return gs.colors[cfgVal[modName]];
  };
  gs.cbToPromise = function cbToPromise(func, that, ...args) {
    return new Promise((resolve, reject) => {
      try {
        func.apply(that, args.concat((err, res) => {
          if(err) throw err;
          else resolve(res);
        }));
      } catch(err) {
        reject(err);
      }
    });
  };
  gs.getJSONPath = function getJSONPath(obj, path) {
    var currentScope = obj;
    for(var i = 0; i < path.length; i++){
      currentScope = currentScope[path[i]];
    }
    return currentScope;
  };
  gs.setJSONPath = function setJSONPath(obj, path, val) {
    var currentScope = obj;
    for(var i = 0; i < path.length - 1; i++){
      if (!currentScope[path[i]]) currentScope[path[i]] = {};
      currentScope = currentScope[path[i]];
    }
    currentScope[path[i]] = val;
  };
};