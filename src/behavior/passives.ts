import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";
import { getPlayerFieldId } from "../lib/types";
import { getReqdExp, addXpToPlayer } from "../commands/level";

const xpPassiveInterval = 1000 * 60 * 5; // 5 Minutes
const xpPassiveIncreaseAmount = 5;

export class PassivesBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    const bot = ctx.hostApp.bot;
    const db = ctx.hostApp.playerDb;
    bot.on("messageCreate", async msg => {
      if(msg.author.bot) return;
      if(!msg.guild) return;
      const pl = await db.getEntry(getPlayerFieldId(msg.guild.id, msg.author.id));
      if(!pl.timers["passive"]) {
        pl.timers["passive"] = 0;
      }
      if(pl.timers["passive"] < (+new Date) - xpPassiveInterval) {
        pl.timers["passive"] = +new Date;
        addXpToPlayer(pl, xpPassiveIncreaseAmount)
      }
    });
  }
}