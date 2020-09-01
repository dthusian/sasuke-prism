"use strict";

/* eslint-disable -- WIP file, not presentable yet */

const mongo = require("mongodb");
const CONNECTION_URI = "mongodb://sasuke_prism@localhost:27017/";

// Normalizes a player's JSON
// Upgrades from lower data versions
function defaultPlayerJSON(obj, id){
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
  return obj;
}

function defaultGuildJSON(obj, id){
  if(!obj) obj = {};
  if(!obj._id) obj._id = id;
  if(!obj.config) obj.config = {};
  if(!obj.config.prefix) obj.prefix = "prism ";
  if(!obj.channels) obj.channels = {};
  return obj;
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
  var dbo = client.db("sasuke_prism");
  // DB: guilds, players,

  var collecs = {
    guilds: await dbo.collection("guilds"),
    players: await dbo.collection("players")
  };
  var caches = {
    guilds: {},
    players: {}
  };
  var mutexs = {
    guilds: new gs.Mutex(),
    players: new gs.Mutex()
  };
  var sanitizers = {
    players: defaultPlayerJSON,
    guilds: defaultGuildJSON
  };

  gs.getFromDB = async function getFromDB(db, uuid) {
    if(!caches[db]){
      throw new Error(`Database ${db} does not exist`);
    }
    if(!caches[db][uuid]){
      var obj = await collecs[db].findOne({ "_id": uuid });
      // Object is not in DB, doesnt exist
      if(!obj){
        obj = {};
      }
      if(sanitizers[db]){
        obj = sanitizers[db](obj, uuid);
      }
      caches[db][uuid] = obj;
      return obj;
    }
    return caches[db][uuid];
  };
  // Path is in format ["foo", "bar"] == obj.foo.bar
  gs.setToDB = async function setTodb(db, uuid, path, val) {
    if(!caches[db]){
      throw new Error(`Database ${db} does not exist`);
    }
    await mutexs[db].acquire();
    gs.setJSONPath(caches[db][uuid], path, val);
    var updDoc = { "$set": { } };
    gs.setJSONPath(updDoc["$set"], path, val);
    await collecs[db].updateOne({ "_id": uuid }, updDoc);
    mutexs[db].release();
  };
  gs.clearCache = async function clearCache(db = "") {
    var dbs;
    if(db === ""){
      dbs = Object.keys(caches);
    }else{
      dbs = [db];
    }
    for(var i = 0; i < dbs.length; i++){
      caches[dbs[i]] = {};
    }
  };
  gs.prefix = async function hasPrefix(msg) {
    if(!msg.content) return false;
    if(msg.guild.available) {
      var prefix = gs.getFromDB("guilds", msg.guild.id);
      if(msg.content.startsWith(prefix)){
        return msg.content.substring(prefix.length);
      } else {
        return "";
      }
    }
    return "";
  };
};