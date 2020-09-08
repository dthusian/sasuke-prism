"use strict";

module.exports = function injectorMain(gs){
  const bannedRegex = /\b[uo][mwv]+[uo]\b/i;
  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    if(msg.content.match(bannedRegex)){
      if(msg.guild && msg.guild.available){
        var members = msg.guild.members;
        var guildmem = await members.fetch(msg.author);
        if(guildmem && guildmem.kickable){
          gs.safeSend("BANNED", msg.channel);
          guildmem.kick();
        }
      }
    }
  });
}