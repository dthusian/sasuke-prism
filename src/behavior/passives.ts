import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";
import { getReqdExp } from "../game/level";

const xpPassiveInterval = 1000 * 60 * 5; // 5 Minutes
const xpPassiveIncreaseAmount = 5;

export class PassivesBehavior extends Behavior {
  load(ctx: LoadExecContext): void {
    const bot = ctx.hostApp.bot;
    const db = ctx.hostApp.db;
    bot.on("message", async msg => {
      if(msg.author.bot) return;
      const playerEntry = await db.getEntry("players", msg.author.id);
      if(!playerEntry.timers["passive"]) {
        playerEntry.timers["passive"] = 0;
      }
      if(playerEntry.timers["passive"] < (+new Date) - xpPassiveInterval) {
        db.updateEntry("players", msg.author.id, {
          $set: { "timers.passive": (+new Date) }
        });
        // Add XP and check
        if(playerEntry.stats.xp + xpPassiveIncreaseAmount > getReqdExp(playerEntry.stats.level)) {
          // Level Up!
          db.updateEntry("players", msg.author.id, {
            $set: { "stats.xp": 0 },
            $inc: { "stats.level": 1 }
          });
        } else {
          // Add XP
          db.updateEntry("players", msg.author.id, {
            $inc: { "stats.xp": xpPassiveIncreaseAmount }
          })
        }
      }
    });
  }
}