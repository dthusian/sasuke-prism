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
    return user.name === "dthusian" && user.discriminator === 8480
  };
  gs.safeSend = function safeSend(msg, channel) {
    channel.send(msg).catch(() => {});
  };
  gs.getEmbedColor = function getEmbedColor(modName) {
    gs.requires("color.js");
    var cfgVal = gs.getConfig("embedColors.json");
    return gs.colors[cfgVal[modName]];
  };
};