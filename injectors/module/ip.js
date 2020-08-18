"use strict";

var fetch = require("node-fetch");
var djs = require("discord.js");

var ipdataReqsDaily = 0;
var ipdataReqsMin = 0;
const DAILY_THRESHOLD = 1000;
const MINUTE_THRESHOLD = 10;

setInterval(() => {
  ipdataReqsDaily = 0;
}, 1000 * 60 * 60 * 24);

setInterval(() => {
  ipdataReqsMin = 0;
}, 1000 * 60);

function canSendReq(){
  return ipdataReqsDaily < DAILY_THRESHOLD && ipdataReqsMin < MINUTE_THRESHOLD;
}

function mapAsnType(typ){
  return ({
    "hosting": "Datacenter",
    "isp": "ISP",
    "edu": "Educational Institution",
    "gov": "Government Agency",
    "mil": "Military Organization",
    "business": "Generic Organization"
  })[typ];
}

function mapYesNo(bool){
  return bool ? "yes" : "no";
}

module.exports = function injectorMain(gs) {
  const ipEmbedColor = gs.colors.BLUE;
  const ipdatApiKey = gs.getToken("ipdata");
  const ipRegex = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/;
  gs.bot.on("message", async msg => {
    if(!gs.normalMsg(msg)) return;
    if (msg.content.match(ipRegex)){
      if(canSendReq()){
        var match = ipRegex.exec(msg.content)[0];
        var ipdata = await
          (await fetch(`https://api.ipdata.co/${encodeURIComponent(match)}?api-key=${ipdatApiKey}`)
        ).json();
        ipdataReqsDaily++;
        ipdataReqsMin++;
        if(ipdata["message"]) return;
        // Prepare embed
        var embed = new djs.MessageEmbed();
        embed.setTitle(ipdata["ip"]);
        if(ipdata["city"]){
          embed.setDescription(`${ipdata["city"]}, ${ipdata["region"]}`);
        }
        if(ipdata["asn"]){
          embed.addField("ASN", ipdata["asn"]["name"]);
          embed.addField("ASN Route", ipdata["asn"]["route"]);
          embed.addField("ASN Type", mapAsnType(ipdata["asn"]["type"]));
        }
        if(ipdata["threat"]){
          embed.addField("Using Tor", mapYesNo(ipdata["threat"]["is_tor"]));
          embed.addField("Using Proxy", mapYesNo(ipdata["threat"]["is_proxy"]));
          embed.addField("Known Malicious", mapYesNo(ipdata["threat"]["is_known_attacker"]));
        }
        embed.setFooter("Results from ipdata.co");
        embed.setColor(ipEmbedColor);
        gs.safeSend(embed, msg.channel);
      }
    }
  });
};