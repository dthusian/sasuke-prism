"use strict";

const djs = require("discord.js");
const http = require("http");
const crypto = require("crypto");

const NONCE_TIMEOUT = 1000 * 60 * 5;
const NONCE_SERVER_PORT = 6123;

var issuedNonces = [];

var srv = http.createServer((req, res) => {
  if(req.url !== "/"){
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("404: Not found");
    res.end();
    return;
  }
  var sha = crypto.createHash("sha256");
  sha.update(Math.random + "E" + (new Date()).toISOString(), "ascii");
  var nonce = sha.digest("hex");
  issuedNonces.push({
    hash: nonce,
    timeout: setTimeout(n => {
      var i = issuedNonces.findIndex(v => v && v.hash === n);
      issuedNonces[i] = null;
    }, NONCE_TIMEOUT, nonce)
  });
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write(nonce);
  res.end();
}).listen(NONCE_SERVER_PORT);

process.on("exit", () => {
  srv.close();
});

var commands = {
  "restart": function() {
    setTimeout(process.exit, 5000, 69);
    return "Restarting in 5 sec";
  },
  "debug": function (gs) {
    gs.debug = true;
    return "Debug mode enabled";
  },
  "leave": function (gs, msg) {
    msg.guild.leave();
    return "";
  }
};

function makeErrorEmbed(ex, col){
  var embed = new djs.MessageEmbed();
  embed.setTitle("Unhandled Exception");
  embed.setDescription(ex.toString());
  embed.setColor(col);
  return embed;
}

function makeResultEmbed(msg, col){
  var embed = new djs.MessageEmbed();
  embed.setTitle("Success");
  embed.setDescription(msg);
  embed.setColor(col);
  return embed;
}

module.exports = function injectorMain(gs){
  const successCol = gs.getEmbedColor("meta-success");
  const failCol = gs.getEmbedColor("meta-fail");
  gs.bot.on("message", msg => {
    if(!gs.normalMsg(msg)) return;
    if(!gs.isSuperUser(msg.author)) return;
    if(msg.content.startsWith("sudo")){
      // Parse args
      var splits = msg.content.split(" ");
      if(splits.length < 3) return;

      // Process nonce
      var nonce = splits[2];
      var i = issuedNonces.findIndex(v => v && v.hash === nonce);
      if(i === -1) return;
      clearTimeout(issuedNonces[i].timeout);
      issuedNonces[i] = null;
      
      // Get command
      var commandfunc = commands[splits[1]];
      if(!commandfunc) return;
      var success = null;

      // Execute command
      try {
        success = commandfunc(gs, msg, splits.slice(3));
      } catch(e) {
        gs.safeSend(makeErrorEmbed(e, failCol), msg.channel);
      }

      // Report results
      if(success) {
        gs.safeSend(makeResultEmbed(success, successCol), msg.channel);
      }
    }
  });
}