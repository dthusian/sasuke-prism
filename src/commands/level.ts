import { MessageEmbed } from "discord.js";
import { Command } from "../lib/command";
import { ExecContext } from "../lib/context";

export class LevelCmd extends Command {
  getCommandString(): string[] {
    return ["level"];
  }

  onCommand(args: string[], ctx: ExecContext): MessageEmbed | Promise<MessageEmbed> {
    throw new Error("Not implemented");
  }
}