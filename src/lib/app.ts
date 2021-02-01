import { TextChannel, Client, MessageEmbed, DMChannel, NewsChannel } from "discord.js";
import { Logger } from "./logger";
import { Behavior } from "./behavior";

import { Command, CommandReturnType } from "./command";
import { ConfigManager } from "./config";
import { CommandExecContext, LoadExecContext } from "./context";
import { CachedDatabase, DBConfig } from "./db";
import { GameManager } from "../game/manager";

// CommandReturnType is such a dumpster fire of type unions
async function resolveAndSendEmbeds(channel: TextChannel | DMChannel | NewsChannel, ret: CommandReturnType) {
  let resolvedProm: (MessageEmbed | string | null)[] | (MessageEmbed | string | null);
  if(ret instanceof Promise) {
    resolvedProm = await ret;
  } else {
    resolvedProm = ret;
  }
  let resolvedArray: (MessageEmbed | string | null)[];
  if(resolvedProm instanceof Array) {
    resolvedArray = resolvedProm;
  } else {
    resolvedArray = [resolvedProm];
  }
  const cleanArray = resolvedArray.filter(v => v) as (MessageEmbed | string)[];
  await Promise.all(cleanArray.map(async v => {
    try {
      await channel.send(v);
    } catch(e) { return; }
  }));
}

export class Application {
  bot: Client;
  config: ConfigManager;
  db: CachedDatabase;
  game: GameManager;
  logs: Logger;
  commands: { [ id: string]: Command };

  constructor(){
    this.bot = new Client();
    this.config = new ConfigManager();
    this.logs = Logger.toStdout();
    this.commands = {};
    this.game = new GameManager(this);
    this.logs.logInfo("Bot initialize");
  }

  async load(): Promise<void> {
    await this.game.load();
    this.db = new CachedDatabase(await this.config.load("mongodb") as DBConfig, await this.config.loadToken("mongodb"));
    await this.db.connect();
    this.logs.logInfo("Connected to MongoDB [" + this.db.config.host + "]");
    this.bot.on("message", async msg => {
      // Validate message
      if(!(msg.guild && !msg.author.bot && msg.content)) return;

      // Check if it's a valid command
      const gconf = await this.db.getEntry("guilds", msg.guild.id);
      if(!msg.content.startsWith(gconf.prefix)) return;
      const strippedMsg = msg.content.substring(gconf.prefix.length);
      const args = strippedMsg.split(" ");
      const commandName = args[0].toLowerCase();
      if(!this.commands[commandName]) return;

      // Run the command
      const cmd = this.commands[commandName];
      try {
        const embed = cmd.onCommand(args.slice(1), new CommandExecContext(this, msg, gconf));
        await resolveAndSendEmbeds(msg.channel, embed);
      } catch(err: unknown) {
        this.logs.logError("Unhandled exception in command handler");
        if(err instanceof Error) {
          this.logs.logError(err.name + ": " + err.message);
          if(err.stack)
            this.logs.logError(err.stack);
        } else {
          this.logs.logError("An error object was not found");
        }
      } 
    });
    this.bot.on("ready", () => {
      this.logs.logInfo("Connected to Discord");
    });
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
    return "2.3";
  }
}