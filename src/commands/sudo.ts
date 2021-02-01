import { GuildMember } from "discord.js";
import { ItemType } from "../game/item";
import { addItemToPlayer } from "../game/itemdb";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";

export const DEV_ID = "376857210485080064";

function isSudoer(guilder: GuildMember): boolean {
  return guilder.permissions.has("ADMINISTRATOR") || guilder.id === DEV_ID;
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
      message: "Executes a command as super-user. This, of course, requires administrator. There are only 2 commands that work in super-user mode."
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<string | string[] | null> {
    if(!ctx.message.guild) return null;
    const guild = ctx.message.guild;
    const gauthor = guild.member(ctx.message.author);
    if(!gauthor) return null;
    if(!isSudoer(gauthor)) {
      return `${gauthor.displayName} is not in the sudoers file.\nThis incident will be reported.`;
    }
    // Now after validating that it is a sudoer, we can execute command
    switch(args[0]) {
      case "ban": {
        const mentions = ctx.message.mentions;
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
        return process.memoryUsage().heapUsed.toString();
      }
      case "debugitem": {
        addItemToPlayer(ctx.hostApp.db, DEV_ID, ctx.hostApp.game.items.reg["test"], 1);
        return null;
      }
      default: {
        return "Unknown command.";
      }
    }
  }
}