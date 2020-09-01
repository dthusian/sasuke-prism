"use strict";

var games = [
  ["PLAYING", "Thaumcraft 4"],
  ["PLAYING", "Sonic Forces: Plus Ultra"],
  ["PLAYING", "Visual Studio Code"],
  ["PLAYING", "Cytus 2"],
  ["PLAYING", "Among Us"],
  ["WATCHING", "xkcd"],
  ["WATCHING", "Earrape Microphone Tutorial"],
  ["LISTENING", "Datacenter ASMR"]
];

module.exports = function injectorMain(gs){
  const bot = gs.bot;
  bot.on("ready", () => {
    setInterval(() => {
      var game = games[Math.floor(Math.random() * games.length)];
      bot.user.setActivity(game[1], { type: game[0] });
    }, 30 * 60 * 1000);
  });
};