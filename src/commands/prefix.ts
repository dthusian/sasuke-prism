import { MessageEmbed } from "discord.js";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

export class PrefixCmd extends Command {
  getCommandString(): string[] {
    return ["prefix"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: " <new prefix>",
      example: "$",
      message: "Sets the prefix for this server. It can be as long as you want, but must not have spaces.",
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed | null> {
    if(!args[0]) return null;
    if(!ctx.message.guild) return null;
    let pre = args[0];
    if(args.length > 1) pre += " ";
    (await ctx.hostApp.guildDb.getEntry(ctx.message.guild.id)).prefix = pre;
    const embed = new MessageEmbed();
    embed.setTitle("Success");
    embed.setDescription("Prefix set to: `" + pre + "`");
    return embed;
  }
}