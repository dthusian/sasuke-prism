import { GuildMember } from "discord.js";
import { addMaterialToPlayer, addToolToPlayer, newToolClean } from "../game/util";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

export const DEV_ID = "376857210485080064";

function isSudoer(guilder: GuildMember): boolean {
  return guilder.id === DEV_ID;
}

export class SudoCmd extends Command {
  getCommandString(): string[] {
    return ["sudo"];
  }
  getHelpMessage(): HelpMessage {
    return {
      syntax: [
        "ban <user>",
        "gcstat"],
      example: [
        "ban <@!155149108183695360>",
        "gcstat"],
      message: "This is a debug tool that should only be used by the dev"
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<string | string[] | null> {
    if(!ctx.msg.guild) return null;
    const guild = ctx.msg.guild;
    const gauthor = guild.member(ctx.msg.author);
    if(!gauthor) return null;
    if(!isSudoer(gauthor)) {
      return `${gauthor.displayName} is not in the sudoers file.\nThis incident will be reported.`;
    }
    // Now after validating that it is a sudoer, we can execute command
    switch(args[0]) {
      case "ban": {
        const mentions = ctx.msg.mentions;
        if(!mentions.members) {
          return "Specify a user.";
        }
        const members = mentions.members.array();
        if(!members.length) {
          return "Specify a user.";
        }
        const bans = members.map(async v => {
          if(v.bannable) {
            try {
              await v.ban();
              return `Banned ${v.displayName}`;
            } catch(e) {
              return `Couldn't ban ${v.displayName}: An error occurred`;
            }
          } else {
            return `Couldn't ban ${v.displayName}: Not enough perms`;
          }
        });
        return await Promise.all(bans);
      }
      case "gcstat": {
        const bytes = process.memoryUsage().heapUsed.toString();
        return bytes + " bytes";
      }
      case "debugitem": {
        addMaterialToPlayer(await ctx.getPlayerData(), "test", 1);
        return null;
      }
      case "debugtool": {
        addToolToPlayer(await ctx.getPlayerData(), newToolClean(ctx.getItemManager(), "test_tool"));
        return null;
      }
      case "flush": {
        return null;
      }
      default: {
        return "Unknown command.";
      }
    }
  }
}