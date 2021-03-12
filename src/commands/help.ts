import { MessageEmbed } from "discord.js";
import { makeGeneralHelpEmbed } from "../behavior/version";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

export function makeHelpEmbed(helpMsg: HelpMessage, baseCmd: string, color: [number, number, number]): MessageEmbed {
  const embed = new MessageEmbed();
  const spl = baseCmd.split(" ");
  embed.setTitle("Command - " + spl[spl.length - 1]);
  if(helpMsg.syntax instanceof Array) {
    embed.addField("Syntax", `\`${baseCmd} ${helpMsg.syntax.join("\n")}\``);
  } else {
    embed.addField("Syntax", `\`${baseCmd} ${helpMsg.syntax}\``);
  }
  embed.addField("Description", helpMsg.message);
  if(helpMsg.example instanceof Array) {
    embed.addField("Example", `\`${baseCmd} ${helpMsg.example.join("\n")}\``);
  } else {
    embed.addField("Example", `\`${baseCmd} ${helpMsg.example}\``);
  }
  embed.setColor(color);
  return embed;
}

export class HelpCmd extends Command {
  getCommandString(): string[] {
    return ["help" , "h"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "[command]",
      example: "help",
      message: "Displays a general help message, or help for a specific command"
    }
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed | null> {
    if(!args[0]) {
      return makeGeneralHelpEmbed(ctx.app, (await ctx.getGuildData())._id);
    } else {
      const cmd = ctx.app.commands[args[0]];
      if(!cmd) return null;
      const helpMsg = cmd.getHelpMessage();
      return makeHelpEmbed(helpMsg, (await ctx.getGuildData()).prefix + args[0], await ctx.getConfigColor("embedTypeInfo"));
    }
  }
}