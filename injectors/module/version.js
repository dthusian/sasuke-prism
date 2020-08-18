"use strict";

const djs = require("discord.js");

var embed = new djs.MessageEmbed();

embed.setTitle("sasuke prism");
embed.setDescription("v2.0.0");

module.exports = function injectorMain(gs){
  embed.setColor(gs.colors.ORANGE);
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