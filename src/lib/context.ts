import { Message } from "discord.js";
import { Application } from "./app";
import { GuildDBEntry, PlayerDBEntry } from "./db";

export class ExecContext {
  hostApp: Application;
  message: Message;
  guildInfo: GuildDBEntry;
  constructor(app: Application, msg: Message, guild: GuildDBEntry) {
    this.hostApp = app;
    this.message = msg;
    this.guildInfo = guild;
  }
  async getPlayerData(): Promise<PlayerDBEntry> {
    return await this.hostApp.db.getEntry("players", this.message.author.id);
  }
}