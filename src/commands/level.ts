import { MessageEmbed } from "discord.js";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import { PlayerData } from "../lib/types";

export const levelData: [string | number, string, number][] = [
  [5,    "Point",        100],
  [10,   "Segment",      250],
  [15,   "Ray",          250],
  [20,   "Line",         250],
  [30,   "Triangle",     500],
  [40,   "Square",       500],
  [50,   "Hexagon",      500],
  [65,   "Tetrahedron",  750],
  [80,   "Prism",        750],
  [95,   "Octahedron",   750],
  [110,  "Dodecahedron", 750],
  [125,  "Icosahedron",  750],
  ["+",  "Hyperprism",   1000]
];

function levelSearch(level: number, index: number): string | number {
  for(let i = 0; i < levelData.length; i++) {
    if(level <= levelData[i][0]) return levelData[i][index];
  }
  return levelData[levelData.length - 1][index];
}

export function getTitleFromLevel(level: number): string {
  return levelSearch(level, 1) as string;
}

export function getReqdExp(level: number): number {
  return levelSearch(level, 2) as number;
}

export function addXpToPlayer(pl: PlayerData, amount: number): void {
  pl.stats.xp += amount;
  while(pl.stats.xp > getReqdExp(pl.stats.level)) {
    pl.stats.xp -= getReqdExp(pl.stats.level);
    pl.stats.level++;
  }
}

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
    embed.setColor(await ctx.getConfigColor("embedTypeInfo"));
    return embed;
  }
}

