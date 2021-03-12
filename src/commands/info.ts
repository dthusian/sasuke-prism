import { MessageEmbed } from "discord.js";
import { makeRarity } from "../game/emote";
import { ItemRegistry } from "../game/item";
import { findPlayerTool } from "../game/util";
import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import { getPlayerFieldId } from "../lib/types";

export class InfoCmd extends Command {
  getCommandString(): string[] {
    return ["info", "i"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "info <item>",
      message: "Checks the info of an item.",
      example: "info <item>",
    }
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<string | MessageEmbed | null> {
    const items = ctx.getItemManager();
    const id = args.join("_").toLowerCase();
    if(!id) return null;
    if(items.materials[id]) {
      const embed = new MessageEmbed();
      const mat = items.materials[id];
      embed.setTitle(mat.name);
      embed.addField("Description", mat.description);
      embed.setFooter(id);
      return embed;
    } else if(items.tools[id]) {
      const embed = new MessageEmbed();
      const mat = items.tools[id];
      const plToolDat = await findPlayerTool(await ctx.getPlayerData(), id);
      if(plToolDat) {
        if(plToolDat.merge > 1) {
          embed.setTitle(`${makeRarity(plToolDat.rarity)} ${mat.name} (x${plToolDat.merge})`);
        } else {
          embed.setTitle(`${makeRarity(plToolDat.rarity)} ${mat.name}`);
        }
      } else {
        embed.setTitle(mat.name);
      }
      embed.addField("Description", mat.description);
      const rarities = [];
      for(let i = 0; i < mat.allowedRarity.length; i++) {
        rarities.push(makeRarity(mat.allowedRarity[i]));
      }
      embed.addField("Rarities", rarities.join("\n"));
      if(Object.keys(mat.recipe).length) {
        embed.addField("Recipe", Object.entries(mat.recipe).map(v => `${v[1]}x ${items.materials[v[0]].name}`).join("\n"));
      }
      embed.setFooter(id);
      if(plToolDat) {
        const t0 = await ctx.getConfig<{ stars: string[] }>("rarities");
        const t1 = t0.stars;
        const t2 = plToolDat.rarity;
        const t3 = t1[t2 - 1];
        embed.setColor(await ctx.getConfigColor(t3));
      } else {
        embed.setColor(await ctx.getConfigColor("embedTypeInfo"));
      }
      return embed;
    } else {
      return "Item not found - try searching the internal ID";
    }
  }
}