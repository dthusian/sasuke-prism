"use strict";

const djs = require("discord.js");
const fetch = require("node-fetch");
const FormData = require("form-data");
const crypto = require("crypto");
const fs = require("fs");
const VTCACHE_SUBDIR = "vtcache/";
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

async function findAnalysis(token, sha, buf, cacheDir){
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
  if(res["data"]){
    // The analysis was found and we just have to retrieve it now
    var aid = res["data"]["id"];
    res = await vtRestCall(token, `analyses/${aid}`, "GET");
    return res;
  }
  // 3: Upload and scan the file
  res = await vtRestCall(token, ``);
}

module.exports = function injectorMain(bot, gs) {
  const scanEmbedCol = gs.colors.CYAN;
  vttoken = gs.getToken("virustotal");
  // Handler for file uploads
  bot.on("message", async (msg) => {
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
      var sha = crypto.createHash("sha256");
      sha.update(buffer);
      var calculatedSha = sha.digest("hex");
      // Check cache for the analysis
      // Check if VT already has the analysis
      var inter = await vtRestCall(vttoken, `files/${calculatedSha}/analyse`, "POST");
      if(!inter["data"]){
        // That means the file does not exist and
        // we need to upload it.
        inter = await vtRestCall(vttoken, "files", "POST", multiPartFormFile(buffer, attachment.name));
        msg.channel.send("Scanning file...");
        await sleep(75 * 1000);
      }
      // Now the file is uploaded if it wasn't already
      // We can get and analyse the analysis
      var analysis = await vtRestCall(vttoken, `analyses/${inter["data"]["id"]}`, "GET");
      if(analysis["data"]["attributes"]["status"] !== "completed"){
        // Bruh the analysis is not finished
        // Wait another 30 secs
        await sleep(30 * 1000);
        analysis = await vtRestCall(vttoken, `analyses/${inter["data"]["id"]}`, "GET");
      }
      // Collect and send the embed
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
  });
};