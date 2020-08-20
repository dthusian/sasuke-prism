"use strict";

var djs = require("discord.js");

function randInt(max){
  return Math.floor(Math.random() * max);
}

module.exports = function injectorMain(gs){
  const diceEmbedColor = gs.getEmbedColor("dice.js");
  const diceRegex = /\b[0-9]*d[0-9]+\b/ig;
  gs.bot.on("message", msg => {
    if(!gs.normalMsg(msg)) return;
    if(msg.content.match(diceRegex)){
      var textdies = msg.content.match(diceRegex);
      var bad = false;
      var sum = 0;
      var diceCount = 0;
      var embed = new djs.MessageEmbed();
      Array.from(textdies).forEach(v => {
        var splits = v.split(/d/ig).map(v => (!v) ? 1 : parseInt(v));
        if(bad) {
          return;
        }
        if(embed.fields.length > 20){
          bad = true;
          return;
        }
        var rolls = [];
        var localSum = 0;
        for(var i = 0; i < splits[0]; i++){
          diceCount++;
          rolls.push(randInt(splits[1]) + 1);
          localSum += rolls[i];
        }
        sum += localSum;
        embed.addField(`${splits[0]}d${splits[1]} (Sum ${localSum})`, rolls.join(", "));
      });
      embed.setDescription("Sum: " + sum);
      embed.setTitle(`Results of ${diceCount} dice`);
      embed.setColor(diceEmbedColor);
      gs.safeSend(embed, msg.channel);
    }
  });
}
