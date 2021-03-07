import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";
import { getReqdExp } from "../game/level";
import { getPlayerFieldId } from "../lib/types";

const xpPassiveInterval = 1000 * 60 * 5; // 5 Minutes
const xpPassiveIncreaseAmount = 5;

export class PassivesBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    const bot = ctx.hostApp.bot;
    const db = ctx.hostApp.playerDb;
    bot.on("message", async msg => {
      if(msg.author.bot) return;
      if(!msg.guild) return;
      const pl = await db.getEntry(getPlayerFieldId(msg.guild.id, msg.author.id));
      if(!pl.timers["passive"]) {
        pl.timers["passive"] = 0;
      }
      if(pl.timers["passive"] < (+new Date) - xpPassiveInterval) {
        pl.timers["passive"] = +new Date;
        pl.stats.xp += xpPassiveIncreaseAmount;
        // Add XP and check
        while(pl.stats.xp > getReqdExp(pl.stats.level)) {
          pl.stats.xp -= getReqdExp(pl.stats.level);
          pl.stats.level++;
        }
      }
    });
  }
}