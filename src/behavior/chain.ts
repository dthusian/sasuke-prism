import { Message } from "discord.js";
import { Behavior } from "../lib/behavior";
import { LoadExecContext } from "../lib/context";
import { TemporaryStorage } from "../lib/temporary";

export class ChainBehavior extends Behavior {
  channelCache: TemporaryStorage<Message>;
  responseCache: TemporaryStorage<boolean>;
  constructor() {
    super();
    this.channelCache = new TemporaryStorage<Message>();
    this.responseCache = new TemporaryStorage<boolean>();
  }
  load(ctx: LoadExecContext): void {
    ctx.hostApp.bot.on("messageCreate", async msg => {
      const cached = this.channelCache.getEntry(msg.channelId);
      if(!cached) {
        if(!this.responseCache.getEntry(msg.channelId))
          this.channelCache.addEntry(msg.channelId, msg, 1000 * 60 * 15);
      } else if(msg.content === cached.content && !msg.author.bot && msg.author.id !== cached.author.id) {
        this.channelCache.deleteEntry(msg.channelId);
        this.responseCache.addEntry(msg.channelId, true, 1000 * 60 * 60 * 3);
        await msg.channel.send(msg.content);
      } else {
        this.channelCache.setEntry(msg.channelId, msg);
        this.channelCache.refreshEntry(msg.channelId, 1000 * 60 * 15);
      }
    });
  }
}