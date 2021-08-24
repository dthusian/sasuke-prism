import { GuildMember, Message } from "discord.js";
import { Application } from "./app";
import { Command } from "./command";
import { PlayerData, GuildData, getPlayerFieldId } from "./types";

export class LoadExecContext {
  hostApp: Application;
  constructor(app: Application) {
    this.hostApp = app;
  }
}

export class CommandExecContext {
  app: Application;
  msg: Message;
  cmd: Command;
  constructor(app: Application, cmd: Command, msg: Message) {
    this.app = app;
    this.msg = msg;
    this.cmd = cmd;
  }
  async getGuildData(): Promise<GuildData> {
    if(this.msg.guild)
      return await this.app.guildDb.getEntry(this.msg.guild.id);
    throw new Error("Unreachable");
  }
  async getPlayerData(): Promise<PlayerData> {
    if(this.msg.guild)
      return await this.app.playerDb.getEntry(getPlayerFieldId(this.msg.guild.id, this.msg.author.id));
    throw new Error("Unreachable");
  }
  getSender(): GuildMember {
    if(this.msg.guild) {
      const maybeMember = this.msg.guild.member(this.msg.author);
      if(maybeMember) {
        return maybeMember;
      } else {
        throw new Error("Unreachable");
      }
    } else {
      throw new Error("Unreachable");
    }
  }
  async getConfig<T>(name: string): Promise<T> {
    return await this.app.config.load<T>(name);
  }
  async getConfigColor(name: string): Promise<[number, number, number]> {
    return await this.app.config.loadColor(name);
  }
  async getConfigToken(name: string): Promise<string> {
    return await this.app.config.loadToken(name);
  }
  async getAsset(path: string): Promise<Buffer | null> {
    return await this.app.config.loadFile(path);
  }
  getCommand(): Command {
    return this.cmd;
  }
}