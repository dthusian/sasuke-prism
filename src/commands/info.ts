import { MessageEmbed } from "discord.js";
import { makeRarity } from "../game/emote";
import { ItemRegistry } from "../game/item";
import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

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
  onCommand(args: string[], ctx: CommandExecContext): CommandReturnType {
    const items = ctx.hostApp.game.items;
    const id = args.join("_");
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
      embed.setTitle(mat.name);
      embed.addField("Description", mat.description);
      const rarities = [];
      for(let i = 0; i < mat.allowedRarity.length; i++) {
        rarities.push(makeRarity(mat.allowedRarity[i]));
      }
      embed.addField("Rarities", rarities.join("\n"));
      return embed;
    } else {
      return "Item not found - try searching the internal ID";
    }
  }
}