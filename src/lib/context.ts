import { CommandInteraction, GuildMember, Message, MessageEmbed } from "discord.js";
import { Application } from "./app";
import { Command } from "./command";
import { PlayerData, GuildData, getPlayerFieldId } from "./types";

export class LoadExecContext {
  hostApp: Application;
  constructor(app: Application) {
    this.hostApp = app;
  }
}

export class UserError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class CommandExecContext {
  app: Application;
  msg: Message | CommandInteraction;
  args: { [x: string]: unknown };
  cmd: Command;
  constructor(app: Application, cmd: Command, msg: Message, content: string);
  constructor(app: Application, cmd: Command, msg: CommandInteraction);
  constructor(app: Application, cmd: Command, msg: Message | CommandInteraction, content?: string) {
    this.app = app;
    this.msg = msg;
    this.cmd = cmd;
    this.args = {};
    const argdef = cmd.getArguments();
    const taken = new Array(argdef.length).map(() => false);
    let argSource: string[][];
    if(msg instanceof Message) {
      if(content === undefined) throw new Error("Unreachable");
      argSource = content?.split(" ").map(v => v.split("=")).map(v => v.length === 1 ? v : [v[0], v.slice(1).join("=")]);
    } else {
      argSource = msg.options.data.filter(v => v.value).map(v => [v.name, "" + v.value]);
    }
    argSource.forEach(v => {
      if(v.length > 1) {
        // Consume named argument
        // Search for the named arg
        const argToConsume = argdef.findIndex(v2 => v2.name === v[0]);
        // Check that the arg exists
        if(argToConsume === -1) {
          throw new UserError(`Unknown argument \`${v[0]}\``);
        }
        // Check that the arg hasn't already been specified
        if(taken[argToConsume]) throw new UserError(`Argument \`${v[0]}\` specified twice`);
        taken[argToConsume] = true;
        // Add arg to arg dict
        switch(argdef[argToConsume].type) {
          case "string": {
            this.args[v[0]] = v[1];
            break;
          }
          case "number": {
            const n = parseInt(v[1]);
            this.args[v[0]] = n;
            if(isNaN(n)) {
              throw new UserError("Invalid number");
            }
            break;
          }
          case "boolean": {
            this.args[v[0]] = v[1] === "true" || v[1] === "yes";
            break;
          }
          case "user": {
            //TODO validate user
            this.args[v[0]] = v[1];
            break;
          }
          default: {
            throw new Error("Unreachable");
          }
        }
      } else {
        // Consume anonymous arg
        const argToConsume = taken.findIndex(v => !v);
        if(argToConsume === -1) {
          // Append onto the last arg if it's a string
          const lastarg = argdef[argdef.length - 1];
          if(lastarg.type === "string") {
            this.args[lastarg.name] += " " + v[0];
          }
        }
        // No checks are needed
      }
    });
    for(let i = 0; i < taken.length; i++) {
      if(argdef[i].required && !taken[i]) {
        throw new UserError(`Missing required argument \`${argdef[i].name}\``);
      }
    }
  }
  async getSenderID(): Promise<string> {
    if(this.msg instanceof Message) {
      return this.msg.author.id;
    } else {
      return this.msg.user.id;
    }
  }
  async getGuildData(): Promise<GuildData> {
    if(this.msg.guild)
      return await this.app.guildDb.getEntry(this.msg.guild.id);
    throw new Error("Unreachable");
  }
  async getPlayerData(): Promise<PlayerData> {
    if(this.msg.guild)
      return await this.app.playerDb.getEntry(getPlayerFieldId(this.msg.guild.id, await this.getSenderID()));
    throw new Error("Unreachable");
  }
  async getSender(): Promise<GuildMember> {
    if(this.msg.guild) {
      const maybeMember = await this.msg.guild.members.fetch(await this.getSenderID());
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
  async deferReply(): Promise<void> {
    if(this.msg instanceof CommandInteraction) {
      await this.msg.deferReply();
    }
  }
  async sendReply(content: MessageEmbed | string): Promise<void> {
    if(this.msg instanceof CommandInteraction) {
      if(content instanceof MessageEmbed) {
        this.msg.reply({
          embeds: [content]
        });
      } else {
        this.msg.reply({
          content: content
        });
      }
    } else {
      if(content instanceof MessageEmbed) {
        this.msg.channel.send({
          embeds: [content]
        });
      } else {
        this.msg.channel.send({
          content: content
        });
      }
    }
  }
  getArguments(): unknown {
    return this.args;
  }
  getCommand(): Command {
    return this.cmd;
  }
}