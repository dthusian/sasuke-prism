"use strict";

const fs = require("fs");
var tokens = JSON.parse(fs.readFileSync("./static/tokens.json"));

module.exports = function injectorMain(gs){
  gs.getToken = function getToken(token) {
    return tokens[token];
  };
  gs.getConfig = function getConfig(path) {
    return JSON.parse(fs.readFileSync(gs.STATIC_DIR + gs.CONFIG_SUBDIR + path).toString());
  };
  gs.normalMsg = function normalMsg(msg) {
    return msg && msg.content && msg.author && !msg.author.bot;
  };
  gs.isSuperUser = function isSuperUser(user) {
    return user.name === "dthusian" && user.discriminator === 8480
  };
  gs.safeSend = function safeSend(msg, channel) {
    channel.send(msg).catch(() => {});
  }
};