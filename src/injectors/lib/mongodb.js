"use strict";

/* eslint-disable -- WIP file, not presentable yet */

const mongo = require("mongodb");
const connectionURI = "mongodb://sasuke_prism@localhost:27017/";

var guildCache = {};
var userCache = {};

module.exports = async function injectorMain(gs){
  await gs.require("util.js");
  var mongoToken = gs.getToken("mongodb");
  const client = new mongo.MongoClient(connectionURI, {
    auth: {
      user: "sasuke_prism",
      password: mongoToken
    }
  });

  client.connect();

  gs.getGuildConfig = function getGuildConfig(gid) {
    if(!guildCache[gid]){
      
    }
  };
  gs.getPlayerData = function getPlayerData(uid) { };
};