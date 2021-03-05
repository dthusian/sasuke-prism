import { Message } from "discord.js";
import { Application } from "./app";
import { PlayerData, GuildData } from "./types";

export class LoadExecContext {
  hostApp: Application;
  constructor(app: Application) {
    this.hostApp = app;
  }
}

export class CommandExecContext {
  hostApp: Application;
  message: Message;
  guildInfo: GuildData;
  constructor(app: Application, msg: Message, guild: GuildData) {
    this.hostApp = app;
    this.message = msg;
    this.guildInfo = guild;
  }
  async getPlayerData(): Promise<PlayerData> {
    return await this.hostApp.playerDb.getEntry(this.message.author.id);
  }
}