import { Client } from "discord.js";

import { Command } from "./command";
import { ConfigManager } from "./config";

export class Application {
  bot: Client;
  config: ConfigManager;

  constructor(){
    this.bot = new Client();
    this.config = new ConfigManager();
  }

  async registerCommand(cmd: Command): Promise<void> {
    await cmd.register(this);
  }

  async execute(): Promise<void> {
    this.bot.login();
  }
}