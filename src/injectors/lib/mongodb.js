"use strict";

/* eslint-disable -- WIP file, not presentable yet */

const mongo = require("mongodb");
const CONNECTION_URI = "mongodb://sasuke_prism@localhost:27017/";

var guildCache = {};
var userCache = {};

// Normalizes a player's JSON
// Upgrades from lower data versions
function upgradePlayerJSON(obj, id){
  if(!obj) obj = {};
  if(!obj._id) obj._id = id;
  if(!obj.mana) obj.mana = {};
  if(!obj.mana.primal) obj.mana.primal = 0;
  if(!obj.mana.crystal) obj.mana.crystal = 0;
  if(!obj.mana.power) obj.mana.power = 0;
  if(!obj.mana.void) obj.mana.void = 0;
  if(!obj.stats) obj.stats = {};
  if(!obj.stats.level) obj.stats.level = 1;
  if(!obj.stats.xp) obj.stats.xp = 0;
}

module.exports = async function injectorMain(gs){
  await gs.require("util.js");

  // Connect to MongoDB
  var mongoToken = gs.getToken("mongodb");
  const client = new mongo.MongoClient(CONNECTION_URI, {
    auth: {
      user: "sasuke_prism",
      password: mongoToken
    }
  });
  client.connect();
  var db = client.db("sasuke_prism");
  var guilds = await db.collection("guilds");
  var players = await db.collection("players");

  gs.getGuildConfig = async function getGuildConfig(gid) {
    if(!guildCache[gid]){
      var guild = await guilds.findOne({ "_id": gid });
      guildCache[gid] = guild;
      return guild;
    }
    return guildCache[gid];
  };
  gs.getPlayerData = async function getPlayerData(uid) {
    if (!userCache[uid]) {
      var player = await guilds.findOne({ "_id": uid });
      userCache[uid] = player;
      return upgradePlayerJSON(player);
    }
    return upgradePlayerJSON(userCache[uid]);
  };
  gs.setPlayerData = async function setPlayerData(uid, field, val) {
    
  };
};