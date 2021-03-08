import { MessageEmbed, MessageFlags } from "discord.js";
import { makeRarity } from "../game/emote";
import { listPlayerMaterials, listPlayerTools } from "../game/itemutil";
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
    embed.setTitle(`${ctx.message.author.username}'s Inventory`);
    let tools = Array.from(await listPlayerTools(ctx.hostApp.playerDb, ctx.guildInfo._id, ctx.message.author.id));
    if(tools.length) {
      embed.addField("Weapons",
        tools.map(tdat => `${makeRarity(tdat.rarity)} ${ctx.hostApp.game.items.tools[tdat.id]}\n`));
    } else {
      embed.addField("Weapons", "(there's nothing here)");
    }
    let mats = Array.from(await listPlayerMaterials(ctx.hostApp.playerDb, ctx.guildInfo._id, ctx.message.author.id));
    if(mats.length) {
      embed.addField("Materials",
        mats.map(mdat => `${mdat.amount}x ${mdat.id}\n`));
    } else {
      embed.addField("Materials", "(there's nothing here)");
    }
    return embed;
  }
}