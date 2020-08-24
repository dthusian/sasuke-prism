"use strict";

const djs = require("discord.js");

module.exports = function injectorMain(gs){
  var embed = new djs.MessageEmbed();
  embed.setTitle("sasuke prism");
  embed.setDescription(`${gs.getToken("version")} | GitHub: http://github.com/EatTofuEveryDay/sasuke-prism`);
  embed.setFooter("Made by dthusian#8480 | zlib licensed");
  embed.setColor(gs.getEmbedColor("version.js"));
  gs.bot.on("message", msg => {
    if(!gs.normalMsg(msg)) return;
    if(msg.mentions.has(gs.bot.user, {
      ignoreRoles: true,
      ignoreEveryone: true
    })){
      gs.safeSend(embed, msg.channel);
    }
  });
};