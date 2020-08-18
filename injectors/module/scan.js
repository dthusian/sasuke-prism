"use strict";

const djs = require("discord.js");
const fetch = require("node-fetch");
const FormData = require("form-data");
const crypto = require("crypto");
const fs = require("fs");
const VTCACHE_SUBDIR = "vtcache/";
const POLL_MS = 75 * 1000;
var vttoken;
var fileScanQueue = [];

function resolveUpload(file){
  return fetch(file).then(v => v.buffer());
}

function sleep(ms){
  return new Promise(r => void setTimeout(r, ms));
}

function multiPartFormFile(buf, name){
  var data = new FormData();
  data.append("file", buf, {
    filename: name
  });
  return data;
}

async function vtRestCall(apikey, path, method, body){
  return await (await fetch(`https://www.virustotal.com/api/v3/` + path, {
    method: method,
    body: body,
    headers: {
      "x-apikey": apikey
    }
  })).json();
}

const ignoreFtypes = [
  ".png",
  ".jpeg",
  ".jpg",
  ".mp4",
  ".mov",
  ".ogg",
  ".webm",
  ".txt",
  ".gif"
];
function hasIngoredFiletype(filepath){
  var lower = filepath.toLowerCase();
  return !ignoreFtypes.every(v => !lower.endsWith(v));
}

function VTRestError(msg, code){
  Function.call(Error, this, msg);
  this.code = code;
}

function checkErrorOrThrow(response){
  if(respose["error"]){
    throw new VTRestError(response["error"]["message"], response["error"]["code"]);
  }
}

async function pollAnalysis(token, analysis, ms){
  var res;
  while(true){
    res = await vtRestCall(token, `analyses/${analysis}`);
    checkErrorOrThrow(res);
    if(res["data"] && res["data"]["attributes"]){
      break;
    }
    await sleep(ms);
  }
  return res;
}

async function findAnalysis(token, buf, name, cacheDir){
  // 0: Calculate SHA-256
  var shaHasher = crypto.createHash("sha256");
  shaHasher.update(buffer);
  var sha = sha.digest("hex");
  // 1: Check local cache for analysis
  var localCachePath = cacheDir + sha + ".json";
  if(fs.existsSync(localCachePath)){
    // Analysis in local cache, return it
    return await new Promise((resolve, reject) => {
      fs.readFile(localCachePath, (err, data) => {
        if(err) {
          reject(err);
        } else {
          resolve(JSON.parse(data.toString("utf-8")));
        }
      });
    });
  }
  // 2: Check if VirusTotal already has an analysis
  var res = await vtRestCall(token, `files/${sha}/analyse`, "POST");
  try {
    checkErrorOrThrow(res);
  } catch(err) {
    if (err.code === "NotFoundError"){
      // 3: Upload and scan the file
      res = await vtRestCall(token, "files", "POST", multiPartFormFile(buf, name));
      checkErrorOrThrow(res);
      return pollAnalysis(token, res["data"]["id"], POLL_MS);
    } else {
      throw err;
    }
  }
  
  // The analysis was found and we just have to retrieve it now
  var aid = res["data"]["id"];
  return pollAnalysis(token, aid, POLL_MS);
}

function analysis2embed(analysis){
  var embed = new djs.MessageEmbed();
  embed.setTitle(`Scan Results for ${analysis["meta"]["file_info"]["name"]}`);
  var hasMalice = 0;
  var attrs = analysis["data"]["attributes"]["results"];
  var engines = Object.values(attrs);
  engines.forEach(element => {
    if (element["category"] === "suspicious" || element["category"] === "malicious") {
      embed.addField(element["engine_name"], element["result"]);
      hasMalice++;
    }
  });
  if (hasMalice === 0) {
    embed.setDescription("File is OK");
  } else {
    embed.setDescription(`${hasMalice} engines found in file.`);
  }
  embed.setFooter("Results from VirusTotal");
  embed.setColor(scanEmbedCol);
  msg.channel.send(embed);
}

module.exports = function injectorMain(gs) {
  const scanEmbedCol = gs.colors.CYAN;
  vttoken = gs.getToken("virustotal");
  // Handler for file uploads
  gs.bot.on("message", async (msg) => {
    if(msg.attachments.array().length){
      // Get attachments
      // Only get first
      // It's a bruh if they send more
      var attachment = msg.attachments.first();
      var url = attachment.url;
      if(hasIngoredFiletype(url)){
        return;
      }
      // Buffer contains the file
      var buffer = await resolveUpload(url);
      var analysis = await findAnalysis(vttoken, buffer, attachment.name, gs.VAR_DIR + VTCACHE_SUBDIR);
      gs.safeSend(msg.channel, analysis2embed(analysis));
    }
  });
};