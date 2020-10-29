import { MessageEmbed } from "discord.js";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

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
      const generalHelpEmbed = new MessageEmbed();
      generalHelpEmbed.setTitle("sasuke prism v" + ctx.hostApp.getVersion());
      generalHelpEmbed.setDescription("the worst discord bot");
      generalHelpEmbed.setColor(await ctx.hostApp.config.loadColor("help"));
      generalHelpEmbed.addField("General Commands", "!! TODO !!");
      generalHelpEmbed.setFooter("Made by dthusian#8480");
      return generalHelpEmbed;
    } else {
      const helpMsg = ctx.hostApp.commands[args[0]].getHelpMessage();
      if(!helpMsg) return null;
      const embed = new MessageEmbed();
      embed.setTitle("Command - " + args[0]);
      embed.addField("Syntax", helpMsg.syntax);
      embed.addField("Description", helpMsg.message);
      embed.addField("Example", helpMsg.example);
      embed.setColor(await ctx.hostApp.config.loadColor("help"));
      return embed;
    }
  }
}