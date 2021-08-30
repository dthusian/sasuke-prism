import { Message, MessageEmbed } from "discord.js";
import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";

function scanString(str: string | null | undefined): boolean {
  if(!str) return false;
  const noSyms = str.replace(/[^a-zA-Z0-9]+/g, "");
  return /727/g.test(noSyms);
}

function scanEmbed(embed: MessageEmbed): boolean {
  if(scanString(embed.title)) return true;
  if(scanString(embed.description)) return true;
  if(embed.footer && scanString(embed.footer.text)) return true;
  if(embed.fields.some(v => scanString(v.name) || scanString(v.value))) return true;
  return false;
}

function scanMessage(msg: Message): boolean {
  if(scanString(msg.content)) return true;
  if(msg.embeds.some(scanEmbed)) return true;
  return false;
}

export class WysiBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    ctx.hostApp.bot.on("message", msg => {
      if(scanMessage(msg)) {
        msg.channel.send({ content: "wysi", reply: { messageReference: msg, failIfNotExists: false }});
      }
    });
  }
};