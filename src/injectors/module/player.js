"use strict";

var djs = require("discord.js");  

module.exports = function injectorMain(gs){
  var embedCol = gs.getEmbedColor("player.js");
  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    var cmd = await gs.prefix(msg);
    if(!cmd) return;
    var splits = cmd.trim().split(" ");
    var player = await gs.getFromDB("players", msg.author.id);
    var descr = "";
    switch(splits[0]){
      case "mana": {
        // Show player mana
        var manaEmbed = new djs.MessageEmbed();
        manaEmbed.setTitle(`${msg.author.username}'s Mana`);
        descr = `Primal: ${player.mana.primal}\r\nCrystal: ${player.mana.crystal}\r\nPower: ${player.mana.power}\r\n`;
        if (player.mana.void) {
          descr += `Void: ${player.mana.void}`;
        }
        manaEmbed.setDescription(descr);
        manaEmbed.setColor(embedCol);
        gs.safeSend(manaEmbed, msg.channel);
        break;
      }
      case "level": {
        var levelEmbed = new djs.MessageEmbed();
        var title = gs.getTitle(player.stats.level);
        levelEmbed.setTitle(`[${title}] ${msg.author.username}`);
        descr = "";
        var xpAmount = gs.getXPAmount(player.stats.level);
        var rawProgress = player.stats.xp / xpAmount;
        var progress = Math.floor(10 * rawProgress);
        descr += ":blue_square: ".repeat(progress);
        descr += ":black_large_square: ".repeat(10 - progress);
        descr += ` (${player.stats.xp}/${xpAmount}) ${Math.floor(rawProgress * 100)}%`;
        levelEmbed.setDescription(descr);
        levelEmbed.setColor(embedCol);
        gs.safeSend(levelEmbed, msg.channel);
        break;
      }
    }
  });
};