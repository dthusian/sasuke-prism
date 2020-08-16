"use strict";

var djs = require("discord.js");

function randInt(max){
  return Math.floor(Math.random() * max);
}

module.exports = function injectorMain(bot, gs){
  const diceEmbedColor = gs.colors.AQUA;
  const diceRegex = /\b[0-9]*d[0-9]+\b/ig;
  bot.on("message", msg => {
    if(!gs.normalMsg(msg)) return;
    if(msg.content.match(diceRegex)){
      var textdies = msg.content.match(diceRegex);
      var realdies = [];
      var gay = false;
      Array.from(textdies).forEach(v => {
        var splits = v.split(/d/ig).map(v => (!v) ? 1 : parseInt(v));
        if(gay) {
          return;
        }
        if(realdies.length + splits[0] > 50){
          gay = true;
          return;
        }
        realdies = realdies.concat((new Array(splits[0])).fill(splits[1]));
      });
      if(gay) return;
      var embed = new djs.MessageEmbed();
      var sum = 0;
      realdies.forEach(v => {
        var res = randInt(v) + 1;
        sum += res;
        embed.addField("d" + v, res);
      });
      embed.setDescription("Sum: " + sum);
      embed.setTitle(`Results of ${realdies.length} dice`);
      embed.setColor(diceEmbedColor);
      gs.safeSend(embed, msg.channel);
    }
  });
}
