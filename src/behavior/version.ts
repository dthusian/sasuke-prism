import { MessageEmbed } from "discord.js";
import { Application } from "../lib/app";
import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";
import { DEV_ID } from "../commands/sudo";

export async function makeGeneralHelpEmbed(hostApp: Application, gid: string): Promise<MessageEmbed> {
  const prefix = (await hostApp.db.getEntry("guilds", gid)).prefix;
  const generalHelpEmbed = new MessageEmbed();
  generalHelpEmbed.setTitle("sasuke prism v" + hostApp.getVersion());
  generalHelpEmbed.setDescription("the worst discord bot | prefix is `" + prefix + "`");
  generalHelpEmbed.setColor(await hostApp.config.loadColor("help"));
  generalHelpEmbed.addField("General Commands", `
\`${prefix}dice\` - Roll dice
\`${prefix}help\` - Get help on a command
\`${prefix}ip\` - Identify an IP address
\`${prefix}level\` - Checks your XP and Level
\`${prefix}sudo\` - (Admin) Various administration commands
\`${prefix}prefix\` - (Admin) Changes the prefix for the server
\`${prefix}dronestrike\` - Don't touch that
  `);
  generalHelpEmbed.setFooter(`Made by <@${DEV_ID}>`);
  return generalHelpEmbed;
}

export class VersionBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    const bot = ctx.hostApp.bot;
    bot.on("message", async msg => {
      if (!bot.user) throw new Error("What? Contact dev");
      if (msg.mentions.has(bot.user, {
        ignoreRoles: true,
        ignoreEveryone: true
      }) && msg.guild) {
        await msg.channel.send(await makeGeneralHelpEmbed(ctx.hostApp, msg.guild.id));
      }
    });
  }
}