import { MessageEmbed } from "discord.js";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import fetch from "node-fetch";

const DAILY_THRESHOLD = 1000;
const MINUTE_THRESHOLD = 10;

function mapAsnType(typ: string){
  return ({
    "hosting": "Datacenter",
    "isp": "ISP",
    "edu": "Educational Institution",
    "gov": "Government Agency",
    "mil": "Military Organization",
    "business": "Generic Organization"
  } as { [x: string]: string })[typ];
}

function mapYesNo(bool: boolean){
  return bool ? "yes" : "no";
}

function canSendReq(inst: IPCmd){
  return inst.reqsDaily < DAILY_THRESHOLD && inst.reqsMin < MINUTE_THRESHOLD;
}

export class IPCmd extends Command {
  reqsDaily: number;
  reqsMin: number;
  constructor() {
    super();
    setInterval(() => {
      this.reqsDaily = 0;
    }, 1000 * 60 * 60 * 24);
    setInterval(() => {
      this.reqsMin = 0;
    }, 1000 * 60);
    this.reqsMin = 0;
    this.reqsDaily = 0;
  }
  getCommandString(): string[] {
    return ["ip"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "<ip address> [<ip address> ...]",
      example: "172.217.0.238 172.217.1.163",
      message: "Retrieves some information about an IP address. Any number of IP addresses can be specified, each of them are retrieved separately."
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<(MessageEmbed | null)[] | null> {
    const key = await ctx.hostApp.config.loadToken("ipdata");
    const color = await ctx.hostApp.config.loadColor("ip");
    if(!canSendReq(this)) return null;
    const vals = await Promise.all(args.map(async v => {
      if(v.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
        const res = await fetch(`https://api.ipdata.co/${encodeURIComponent(v)}?api-key=${key}`);
        const ipdata = await res.json();
        this.reqsDaily++;
        this.reqsMin++;
        if(ipdata["message"]) return null;
        // Prepare embed
        const embed = new MessageEmbed();
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
        embed.setColor(color);
        return embed;
      }
      return null;
    }));
    return vals;
  }
}