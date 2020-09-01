const djs = require("discord.js");

function SpellCardHandler(){
  this.spellCards = {};
  this.add = function add(name, castFn, manaCost){
    if(this.spellCards[name]){
      throw new Error(`spellCard ${name} already exists`);
    }
    this.spellCards[name] = {
      name: name,
      onCast: [castFn],
      cost: manaCost
    }
  }.bind(this);
  this.gets = function gets(name) {
    return this.spellCards[name];
  }
  this.execute = function execute(name, msg){
    if(!this.gets(name)) return "";
    return this.gets(name).onCast.forEach(v => v(msg));
  }
}

module.exports = async function injectorMain(gs) {
  var failCol = gs.getEmbedColor("meta-fail");
  gs.spellCardHandler = new SpellCardHandler();
  gs.spellCardHandler.add("test", msg => {
    console.log("SpellCard!");
  }, {
    primal: 5
  });

  function makeNotEnoughManaEmbed(name) {
    var neManaEmbed = new djs.MessageEmbed();
    neManaEmbed.setTitle("Not Enough Mana");
    neManaEmbed.setDescription(`Not enough mana to cast \`[[${name}]]\``);
    neManaEmbed.setColor(failCol);
    return neManaEmbed;
  }

  function makeSpellFailEmbed(res) {
    var sfEmbed = new djs.MessageEmbed();
    sfEmbed.setTitle("Spell Failed");
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
      // Get player data and spellcard object
      var player = await gs.getFromDB("players", msg.author.id);
      var spellCardName = splits[1];
      var spellCard = gs.spellCardHandler.gets(spellCardName);
      if(!spellCard) return;

      // Calculate mana and check if player has enough
      var newMana = {};
      var kvs = Object.entries(spellCard.cost);
      for(var i = 0; i < kvs.length; i++){
        if(!kvs[i][1]) continue;
        newMana[kvs[i][0]] = player.mana[kvs[i][0]] - kvs[i][1];
      }
      kvs = Object.entries(newMana);
      var notEnough = false;
      for(var i = 0; i < kvs.length; i++){
        if(typeof newMana[kvs[i][0]] === "number" && newMana[kvs[i][0]] < 0) notEnough = true;
      }
      if(notEnough) {
        gs.safeSend(makeNotEnoughManaEmbed(spellCardName), msg.channel);
        return;
      }

      // And cast the spell
      var res = gs.spellCardHandler.execute(spellCardName, msg);
      // Results will produce their own output
      // Just put out errors
      if(res){
        gs.safeSend(makeSpellFailEmbed(res), msg.channel);
        return;
      }

      // If spell fails, don't charge mana for it

      // Now update mana values
      for (var i = 0; i < kvs.length; i++) {
        if (newMana[kvs[i][0]] === player.mana[kvs[i][0]]) continue;
        await gs.setToDB("players", player._id, ["mana", kvs[i][0]], kvs[i][1]);
      }
    }
  });

  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    var player = await gs.getFromDB("players", msg.author.id);
    player.mana.primal += 1;
    await gs.setToDB("players", player._id, ["mana", "primal"], player.mana.primal);
  });
};