"use strict"

const djs = require("discord.js");

module.exports = function injectorMain(gs) {
  var embed = new djs.MessageEmbed();
  embed.setColor(gs.getEmbedColor("help.js"));
  embed.setTitle("Sasuke Prism");
  var commands = gs.getConfig("help.json");
  for(var i = 0; i < commands.length; i++){
    embed.addField(commands[i][0], commands[i][1], true);
  }
  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    var cmd = await gs.prefix(msg);
    if(!cmd) return;
    var splits = cmd.split(" ");
    if(splits[0] === "help"){
      gs.safeSend("If you can't see the help message, then turn on message embeds in your Discord settings.", msg.channel);
      gs.safeSend(embed, msg.channel);
    }
  });
}