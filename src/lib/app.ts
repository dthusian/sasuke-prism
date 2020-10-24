import { Client, MessageEmbed } from "discord.js";

import { Command } from "./command";
import { ConfigManager } from "./config";
import { CommandExecContext } from "./context";
import { CachedDatabase, DBConfig, GuildDBEntry } from "./db";

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
    await this.db.connect();
    this.bot.on("message", async msg => {
      // Validate message
      if(!(msg.guild && !msg.author.bot && msg.content)) return;

      // Check if it's a valid command
      const gconf = await this.db.getEntry<GuildDBEntry>("guilds", msg.guild.id);
      if(!msg.content.startsWith(gconf.prefix)) return;
      const strippedMsg = msg.content.substring(gconf.prefix.length);
      const args = strippedMsg.split(" ");
      if(!this.commands[args[0]]) return;

      // Run the command
      const cmd = this.commands[args[0]];
      const embed = cmd.onCommand(args.slice(1), new CommandExecContext(this, msg, gconf));
      let toSend: MessageEmbed;
      if(embed instanceof Promise) {
        toSend = await embed;
      } else {
        toSend = embed;
      }
      msg.channel.send(toSend);
    });
    this.bot.on("ready", () => {
      console.log("Bot ready!");
    });
  }

  async registerCommand(cmd: Command): Promise<void> {
    cmd.getCommandString().forEach(v => this.commands[v] = cmd);
  }

  async execute(): Promise<void> {
    const token = await this.config.token("discordapi");
    await this.bot.login(token);
  }
}