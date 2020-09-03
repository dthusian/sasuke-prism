"use strict"

const djs = require("discord.js");

module.exports = function injectorMain(gs) {
  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    var cmd = await gs.prefix(msg);
    if(!cmd) return;
    var splits = cmd.split(" ");
    if(splits[0] === "settings"){
      if(!msg.guild.available) return;
      var guildMember = await msg.guild.members.fetch(msg.author);
      var hasPerms = guildMember.permissions.has(djs.Permissions.FLAGS.MANAGE_GUILD, true);
      if(!hasPerms) return;
      if(splits[1] === "prefix"){
        await gs.setToDB("guilds", msg.guild.id, ["config", "prefix"], splits[2]);
        var embed = new djs.MessageEmbed();
        embed.setTitle("Prefix Set");
        embed.setDescription("Prefix for this guild set to: " + splits[2]);
      }
    }
  });
}