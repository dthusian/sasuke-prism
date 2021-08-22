import { MessageEmbed, MessageFlags } from "discord.js";
import { attackPlayer } from "../game/attack";
import { fixupPlayerData } from "../game/util";
import { Command, CommandReturnType, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

export class AttackCmd extends Command {
  getCommandString(): string[] {
    return ["attack"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: "<person>",
      message: "Attack someone using your equipped weapon.",
      example: "<@733732240680419479>"
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<string | MessageEmbed> {
    const targetUser = ctx.msg.mentions.members?.first();
    if(!targetUser) {
      return "Specify a user";
    }
    const senderData = await ctx.getPlayerData();
    const targetData = await ctx.app.playerDb.getEntry(targetUser.id);
    if(senderData.loadout.mainhand === null) {
      return "Equip a weapon first (use $equip)";
    }
    if(targetData.stats.hp === 0) {
      return `${targetUser.displayName} is already dead, no need to attack him`;
    }
    // All conditions satisfied, attack now
    const prevHp = targetData.stats.hp;
    const attackToolData = senderData.tools.find(v => v.id === senderData.loadout.mainhand);
    if(attackToolData === undefined) {
      fixupPlayerData(senderData);
      return "Error: player data is inconsistent. I've tried to fix it.";
    }
    const attackResult = attackPlayer(targetData, senderData,
      ctx.getItemManager().tools[senderData.loadout.mainhand],
      attackToolData
    );
    const nextHp = targetData.stats.hp;
    const embed = new MessageEmbed();
    embed.setColor(await ctx.getConfigColor("embedTypeResult"));
    embed.setTitle(`Attack on ${targetUser.displayName}`);
    let buf = `${attackResult.damage} damage dealt (${prevHp} -> ${nextHp}\n`;
    buf += `${attackResult.xp} XP gained\n`;
    if(attackResult.dead) {
      buf += `:crab: ${targetUser.displayName} is now dead :crab:`;
    }
    embed.addField("Results", buf);
    return embed;
  }
}