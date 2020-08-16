"use strict";

module.exports = function injectorMain(bot, gs){
  const bannedRegex = /\b[uo][mwv]+[uo]\b/i;
  bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    if(msg.content.match(bannedRegex)){
      if(msg.guild && msg.guild.available){
        var members = msg.guild.members;
        var guildmem = await members.fetch(msg.author);
        if(guildmem && guildmem.kickable){
          gs.safeSend("FURRIES ARE BANNED", msg.channel);
          guildmem.kick();
        }
      }
    }
  });
}