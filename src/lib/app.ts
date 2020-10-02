import { Client } from "discord.js";

import { Command } from "./command";
import { ConfigManager } from "./config";
import { CachedDatabase, DBConfig } from "./db";

export class Application {
  bot: Client;
  config: ConfigManager;
  db: CachedDatabase;
  commands: Command[];

  constructor(){
    this.bot = new Client();
    this.config = new ConfigManager();
    this.commands = [];
  }

  async load(): Promise<void> {
    this.db = new CachedDatabase(await this.config.load("mongodb") as DBConfig, await this.config.token("mongodb"));
  }

  async registerCommand(cmd: Command): Promise<void> {
    this.commands.push(cmd);
  }

  async execute(): Promise<void> {
    this.bot.login();
  }
}