import { Message } from "discord.js";
import { Application } from "./app";
import { GuildDBEntry, PlayerDBEntry } from "./db";

export class LoadExecContext {
  hostApp: Application;
  constructor(app: Application) {
    this.hostApp = app;
  }
}

export class CommandExecContext {
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