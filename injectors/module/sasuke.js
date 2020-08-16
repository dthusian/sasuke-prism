"use strict";

var channelsSinging = {};

var nonosong = [
  "No no, don't touch me there!",
  "That's what I told my uncle but he didn't seem to care",
  "It's my special little spot and I don't wanna share",
  "No no, don't touch me there",
  "So tell that creepy guy that always hangs around your school",
  "That all they need to know is this one simple rule:",
  "No no, don't touch me there",
  "So take your stinky old hands off my no-no square!"
];

function sleep(ms){
  return new Promise(r => void setTimeout(r, ms));
}

module.exports = function injectorMain(bot, gs){
  bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    if(/\bsa(su|us)ke\b/.test(msg.content)){
      if(channelsSinging[msg.channel.id]) return;
      channelsSinging[msg.channel.id] = true;
      for(var i = 0; i < nonosong.length; i++){
        gs.safeSend(nonosong[i]);
        await sleep(1500);
      }
      channelsSinging[msg.channel.id] = false;
    }
  });
};