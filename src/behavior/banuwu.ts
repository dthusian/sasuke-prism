import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";

export class UwUBanBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    const bot = ctx.hostApp.bot;
    bot.on("message", async msg => {
      if(msg.author.bot || !msg.guild) return;
      const guilder = await msg.guild.members.fetch(msg.author);
      if(msg.content.match(/[uo][mw][uo]/i) && guilder && guilder.bannable) {
        guilder.ban();
        try {
          msg.channel.send("BANNED");
        } catch(e) {
          return;
        }
      }
    });
  }
}