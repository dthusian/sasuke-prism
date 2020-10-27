import { MessageEmbed } from "discord.js";
import { Command } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import { getReqdExp, getTitleFromLevel } from "../lib/game/level";

export class LevelCmd extends Command {
  getCommandString(): string[] {
    return ["level"];
  }

  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed> {
    const pdata = await ctx.getPlayerData();
    debugger;
    const embed = new MessageEmbed();
    const player = ctx.message.author;
    embed.setTitle(`${getTitleFromLevel(pdata.stats.level)} ${player.username}`);
    if(player.avatar !== null)
      embed.setAuthor(player.username, player.avatar);
    embed.addField("Level", pdata.stats.level, true);
    const xp = pdata.stats.xp;
    const xpReq = getReqdExp(pdata.stats.level);
    let xpStr = "";
    const numOnTiles = Math.floor(10 * xp / xpReq);
    xpStr += "".repeat(numOnTiles);
    xpStr += "".repeat(10 - numOnTiles);
    xpStr += ` (${xp}/${xpReq})`;
    embed.addField("XP", xpStr, true);
    return embed;
  }
}

