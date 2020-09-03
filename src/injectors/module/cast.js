"use strict";

const djs = require("discord.js");

function CharmHandler(){
  this.charms = {};
  this.add = function add(name, castFn, manaCost){
    if(this.charms[name]){
      throw new Error(`Charm ${name} already exists`);
    }
    this.charms[name] = {
      name: name,
      onCast: [castFn],
      cost: manaCost
    }
  }.bind(this);
  this.gets = function gets(name) {
    return this.charms[name];
  }
  this.execute = function execute(name, msg){
    if(!this.gets(name)) return "";
    return this.gets(name).onCast.forEach(v => v(msg));
  }
}

module.exports = async function injectorMain(gs) {
  var failCol = gs.getEmbedColor("meta-fail");
  gs.charmHandler = new CharmHandler();

  function makeNotEnoughManaEmbed(name) {
    var neManaEmbed = new djs.MessageEmbed();
    neManaEmbed.setTitle("Not Enough Mana");
    neManaEmbed.setDescription(`Not enough mana to cast \`[[${name}]]\``);
    neManaEmbed.setColor(failCol);
    return neManaEmbed;
  }

  function makecharmFailEmbed(res) {
    var sfEmbed = new djs.MessageEmbed();
    sfEmbed.setTitle("charm Failed");
    sfEmbed.setDescription(res);
    sfEmbed.setColor(failCol);
    return sfEmbed;
  }

  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    var cmd = await gs.prefix(msg);
    if(!cmd) return;
    var splits = cmd.split(" ").filter(v => v);
    if(splits[0] === "cast"){
      // Get player data and charmcard object
      var player = await gs.getFromDB("players", msg.author.id);
      var charmName = splits[1];
      var charm = gs.charmHandler.gets(charmName);
      if(!charm) return;

      // Calculate mana and check if player has enough
      var newMana = {};
      var kvs = Object.entries(charm.cost);
      for(var i = 0; i < kvs.length; i++){
        if(!kvs[i][1]) continue;
        newMana[kvs[i][0]] = player.mana[kvs[i][0]] - kvs[i][1];
      }
      kvs = Object.entries(newMana);
      var notEnough = false;
      for(i = 0; i < kvs.length; i++){
        if(typeof newMana[kvs[i][0]] === "number" && newMana[kvs[i][0]] < 0) notEnough = true;
      }
      if(notEnough) {
        gs.safeSend(makeNotEnoughManaEmbed(charmName), msg.channel);
        return;
      }

      // And cast the charm
      var res = gs.charmHandler.execute(charmName, msg);
      // Results will produce their own output
      // Just put out errors
      if(res){
        gs.safeSend(makecharmFailEmbed(res), msg.channel);
        return;
      }

      // If charm fails, don't charge mana for it

      // Now update mana values
      for (i = 0; i < kvs.length; i++) {
        if (newMana[kvs[i][0]] === player.mana[kvs[i][0]]) continue;
        await gs.setToDB("players", player._id, ["mana", kvs[i][0]], kvs[i][1]);
      }
    }
  });
};