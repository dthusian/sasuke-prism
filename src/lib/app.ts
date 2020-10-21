import { Client, Guild, Message } from "discord.js";

import { Command } from "./command";
import { ConfigManager } from "./config";
import { CachedDatabase, DBConfig } from "./db";

export class Application {
  bot: Client;
  config: ConfigManager;
  db: CachedDatabase;
  commands: { [ id: string]: Command };

  constructor(){
    this.bot = new Client();
    this.config = new ConfigManager();
    this.commands = {};
  }

  async load(): Promise<void> {
    this.db = new CachedDatabase(await this.config.load("mongodb") as DBConfig, await this.config.token("mongodb"));
    this.db.connect();
    this.bot.on("message", async msg => {
      // Validate message
      if(!(msg.guild && !msg.author.bot && msg.content)) return;

      // Check if it's a valid command
      var gconf = await this.db.getGuild(msg.guild.id);
      if(!msg.content.startsWith(gconf.prefix)) return;
      var strippedMsg = msg.content.substring(gconf.prefix.length);
      var args = strippedMsg.split(" ");
      if(!this.commands[args[0]]) return;

      // Run the command
      var cmd = this.commands[args[0]];
      cmd.onCommand(args.slice(1), this);
    });
  }

  async registerCommand(cmd: Command): Promise<void> {
    cmd.getCommandString().forEach(v => this.commands[v] = cmd);
  }

  async execute(): Promise<void> {
    await this.bot.login(await this.config.token("discordapi"));
  }
}