import { Command, HelpMessage } from "../lib/command";
import { MessageEmbed } from "discord.js";
import { CommandExecContext } from "../lib/context";

export class DiceCmd extends Command {
  getCommandString(): string[] {
    return ["dice", "d"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "<number of dice>d<sides on dice> [<number of dice>d<sides on dice> ...]",
      example: "2d6 d4",
      message: "Rolls dice. Any number of dice can be rolled, with any number of faces."
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<MessageEmbed | null> {
    const embed = new MessageEmbed();
    let totalRolls = 0;
    if(!args.length) return null;
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
        embed.addField(`${v}: Sum: ${rolls.reduce((a, b) => a + b)}`, rolls.join(", "));
        totalRolls += numRolls;
      }
    });
    embed.setTitle(`Result of ${totalRolls} dice`);
    embed.setColor(await ctx.getConfigColor("embedTypeInfo"));
    return embed;
  }
}