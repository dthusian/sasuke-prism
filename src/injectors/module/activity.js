"use strict";

var games = [
  "Thaumcraft 4",
  "osu!",
  "Debian Installer",
  "Sonic Forces: Plus Ultra",
  "Visual Studio Code",
  "Cytus 2",
  "xkcd"
];

module.exports = function injectorMain(gs){
  const bot = gs.bot;
  bot.on("ready", () => {
    bot.user.setActivity("Applied Energistics 2", { type: "PLAYING" });
    setInterval(() => {
      bot.user.setActivity(games[Math.floor(Math.random() * games.length)], { type: "PLAYING" });
    }, 30 * 60 * 1000);
  });
};