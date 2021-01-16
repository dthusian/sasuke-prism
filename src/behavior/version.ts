import { MessageEmbed, MessageFlags } from "discord.js";
import { Application } from "../lib/app";
import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";

export async function makeGeneralHelpEmbed(hostApp: Application, gid: string): Promise<MessageEmbed> {
  const generalHelpEmbed = new MessageEmbed();
  generalHelpEmbed.setTitle("sasuke prism v" + hostApp.getVersion());
  generalHelpEmbed.setDescription("the worst discord bot | prefix is `" + (await hostApp.db.getEntry("guilds", gid)).prefix + "`");
  generalHelpEmbed.setColor(await hostApp.config.loadColor("help"));
  generalHelpEmbed.addField("General Commands", "!! TODO !!");
  generalHelpEmbed.setFooter("Made by dthusian#8480");
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