import { Command } from "../lib/command";
import { MessageEmbed } from "discord.js";
import { ExecContext } from "../lib/context";

export class DiceCmd extends Command {
  getCommandString(): string[] {
    return ["dice", "d"];
  }
  async onCommand(args: string[], ctx: ExecContext): Promise<MessageEmbed> {
    const embed = new MessageEmbed();
    let totalRolls = 0;
    args.forEach(v => {
      if(v.match(/(^|\b)[0-9]*d[0-9]+\b($|\b)/i)) {
        const spl = v.split("d");
        let numRolls: number;
        if(spl[0].length === 0) {
          numRolls = 1;
        } else {
          numRolls = parseInt(spl[0]);
        }
        const diceSides = parseInt(spl[1]);
        if(isNaN(numRolls) || isNaN(diceSides)) {
          return;
        }
        const rolls = [];
        for(let i = 0; i < numRolls; i++) 
          rolls.push(Math.floor(Math.random() * diceSides) + 1);
        embed.addField(`Result of ${v}`, rolls.join(", "));
        totalRolls += numRolls;
      }
    });
    embed.setTitle(`Result of ${totalRolls} dice`);
    embed.setColor(await ctx.hostApp.config.loadColor("dice"));
    return embed;
  }
}