import { MessageEmbed } from "discord.js";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import { getReqdExp, getTitleFromLevel } from "../game/level";

export class LevelCmd extends Command {
  getCommandString(): string[] {
    return ["level"];
  }
  getHelpMessage(): HelpMessage {
    return {
      "syntax": "",
      "example": "",
      "message": "Displays your level."
    }
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed> {
    const pdata = await ctx.getPlayerData();
    const embed = new MessageEmbed();
    const player = ctx.msg.author;
    embed.setTitle(`${getTitleFromLevel(pdata.stats.level)} ${player.username}`);
    embed.setColor(await ctx.getConfigColor("level"));
    embed.addField("Level", pdata.stats.level, true);
    const xp = pdata.stats.xp;
    const xpReq = getReqdExp(pdata.stats.level);
    let xpStr = "";
    const numOnTiles = Math.floor(10 * xp / xpReq);
    xpStr += ":blue_square:".repeat(numOnTiles);
    xpStr += ":black_large_square:".repeat(10 - numOnTiles);
    xpStr += ` (${xp}/${xpReq})`;
    embed.addField("XP", xpStr, true);
    return embed;
  }
}

