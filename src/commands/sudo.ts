import { GuildMember, MessageEmbed } from "discord.js";
import { Command, HelpMessage } from "../lib/command";
import { CommandExecContext } from "../lib/context";
import { x86Cmd } from "./x86";

const DEV_ID = "376857210485080064";

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
        "gcstat",
        "axv512"],
      example: [
        "ban <@!155149108183695360>",
        "gcstat"],
      message: "Executes a command as super-user. This, of course, requires administrator. There are only 2 commands that work in super-user mode."
    };
  }
  async onCommand(args: string[], ctx: CommandExecContext): Promise<string | string[] | MessageEmbed[] | null> {
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
      case "avx512": {
        // Executing subcommand
        const x86cmd: x86Cmd = ctx.hostApp.commands["x86"] as x86Cmd;
        const avx512instr = [
          "VBLENDMPD", "VPBLENDMD", "VPBLENDMB",

          "VPCMPD", "VPCMPQ", "VPCMPB", "VPCMPW",

          "VPTESTMD", "VPTESTNMD", "VPTESTMB", "VPTESTNMB",

          "VCOMPRESSPD", "VPCOMPRESSD", "VEXPANDPD", "VPEXPANDD",

          "VPERMB", "VPERMW", "VPERMT2B", "VPERMT2W", "VPERMI2PD", "VPERMI2D",
          "VPERMI2B", "VPERMI2W", "VPERMT2PS", "VPERMT2D", "VSHUFF32x4", "VSHUFI32x4",
          "VPMULTISHIFTQB",

          "VPTERNLOGD",

          "VPMOVQD", "VPMOVQW", "VPMOVQB", "VPMOVDW", "VPMOVDB",
          "VPMOVWB", "VCVTPS2UDQ", "VCVTTPS2UDQ", "VCVTSS2USI", "VCVTTSS2USI",
          "VCVTPS2QQ", "VCVTPS2UQQ", "VCVTTPS2QQ", "VCVTTPS2UQQ",
          "VCVTUDQ2PS", "VCVTUSI2PS", "VCVTUSI2SD", "VCVTUQQ2PS", "VCVTQQ2PD",

          "VGETEXPPD", "VGETEXPSD", "VGETMANTPD", "VGETMANTSD", "VFIXUPIMMPD", "VFIXUPIMMSD"

          //TODO add the rest of the AVX-512 instructions
        ];
        return (await Promise.all(avx512instr.map(async instr => {
          const out = await x86cmd.onCommand([instr], ctx);
          if(!out) {
            return null;
          } else if(typeof out === "string") {
            return null;
          } else {
            return out;
          }
        }))).filter(v => v) as MessageEmbed[];
      }
      default: {
        return "Unknown command.";
      }
    }
  }
}