import { TextChannel, Client, MessageEmbed, DMChannel, NewsChannel, Intents, MessageInteraction, CommandInteraction, Message } from "discord.js";
import { Logger } from "./logger";
import { Behavior } from "./behavior";

import { Command, CommandGroup } from "./command";
import { ConfigManager } from "./config";
import { CommandExecContext, LoadExecContext, UserError } from "./context";
import { Database, DBConfig, PagedDatabase } from "./db";
import { GuildData, GuildDataCvtr, PlayerData, PlayerDataCvtr } from "./types";
import { copyFile, stat } from "fs/promises";
import { join } from "path";

export class Application {
  bot: Client;
  config: ConfigManager;
  db: Database;
  guildDb: PagedDatabase<GuildData>;
  playerDb: PagedDatabase<PlayerData>;
  logs: Logger;
  commands: { [ id: string]: Command | CommandGroup };

  constructor(){
    const intents = new Intents();
    intents.add(Intents.FLAGS.GUILDS);
    intents.add(Intents.FLAGS.GUILD_MESSAGES);
    this.bot = new Client({
      intents: intents
    });
    this.config = new ConfigManager();
    this.logs = Logger.toStdout();
    this.commands = {};
    this.logs.logInfo("Bot initialize");
  }

  async load(): Promise<void> {
    const dbconf = await this.config.load<DBConfig>("sqlite");
    try {
      await stat(join("./", dbconf.filepath));
    } catch(err) {
      if(err.code === "ENOENT") {
        this.logs.logInfo("No database found. Creating a default...");
        await copyFile("./static/assets/data.sqlite", join("./", dbconf.filepath));
      } else {
        throw err;
      }
    }
    this.db = new Database(this.logs, dbconf);
    await this.db.load();
    this.guildDb = await this.db.loadDataset("guilds", new GuildDataCvtr());
    this.playerDb = await this.db.loadDataset("players", new PlayerDataCvtr());
    this.bot.on("messageCreate", async msg => {
      // Validate message
      if(!(msg.guild && !msg.author.bot && msg.content)) return;

      // Check if it's a valid command
      const gconf = await this.guildDb.getEntry(msg.guild.id);
      if(!msg.content.startsWith(gconf.prefix)) return;
      const strippedMsg = msg.content.substring(gconf.prefix.length);
      const args = strippedMsg.split(" ");
      const commandName = args[0].toLowerCase();
      if(!this.commands[commandName]) return;

      // Run the command
      let sliceIdx = 1;
      let cmd = this.commands[commandName];
      if(cmd instanceof CommandGroup) {
        const find = cmd.commands.find(v => v.getCommandString().includes(args[sliceIdx]));
        if(find === undefined) {
          await msg.channel.send(":x: Unknown subcommand");
          return;
        }
        cmd = find;
        sliceIdx++;
      }
      await this._runCommand(cmd, msg, args.slice(sliceIdx).join(" "))
    });
    this.bot.on("interactionCreate", interaction => {
      //TODO stub
    });
    this.bot.on("ready", () => {
      this.logs.logInfo("Connected to Discord");
    });
  }

  private async _runCommand(cmd: Command, msg: Message | CommandInteraction, args: string | undefined) {
    try {
      if(msg instanceof Message && typeof args === "string") {
        cmd.onCommand(new CommandExecContext(this, cmd, msg, args));
      } else if(msg instanceof CommandInteraction) {
        cmd.onCommand(new CommandExecContext(this, cmd, msg));
      } else {
        throw new Error("Unreachable");
      }
    } catch(err: unknown) {
      this.logs.logError("Unhandled exception in command handler");
      if(err instanceof UserError) {
        if(msg instanceof Message) {
          await msg.channel.send(":x: " + err.message);
        } else {
          await msg.reply(":x: " + err.message);
        }
      } else if(err instanceof Error) {
        this.logs.logError(err.name + ": " + err.message);
        if(err.stack)
          this.logs.logError(err.stack);
      } else {
        this.logs.logError("An error object was not found");
      }
    }
  }

  async registerCommand(cmd: Command): Promise<void> {
    cmd.getCommandString().forEach(v => this.commands[v] = cmd);
    await cmd.load(new LoadExecContext(this));
  }

  async addBehavior(behavior: Behavior): Promise<void> {
    await behavior.load(new LoadExecContext(this));
  }

  async execute(): Promise<void> {
    const token = await this.config.loadToken("discordapi");
    await this.bot.login(token);
  }

  getVersion(): string {
    return "3.0";
  }
}