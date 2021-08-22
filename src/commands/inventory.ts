import { MessageEmbed, MessageFlags } from "discord.js";
import { makeRarity } from "../game/emote";
import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

export class InventoryCmd extends Command {
  getCommandString(): string[] {
    return ["inventory", "inv"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "",
      message: "Lists the items in your possession.",
      example: ""
    }
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed> {
    const embed = new MessageEmbed();
    embed.setTitle(`${ctx.getSender().displayName}'s Inventory`);
    const tools = Array.from((await ctx.getPlayerData()).tools);
    if(tools.length) {
      embed.addField("Weapons",
        tools.map(tdat => `${makeRarity(tdat.rarity)} ${ctx.getItemManager().tools[tdat.id].name}\n`));
    } else {
      embed.addField("Weapons", "(there's nothing here)");
    }
    const mats = Array.from((await ctx.getPlayerData()).materials);
    if(mats.length) {
      embed.addField("Materials",
        mats.map(mdat => `${mdat.amount}x ${mdat.id}\n`));
    } else {
      embed.addField("Materials", "(there's nothing here)");
    }
    embed.setColor(await ctx.getConfigColor("embedTypeInfo"));
    return embed;
  }
}